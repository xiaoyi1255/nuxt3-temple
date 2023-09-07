<template>
  <Upload
    v-model:file-list="fileList"
    name="file"
    :action="`${config?.baseUrl}/upload/imgs`"
    :headers="headers"
    enctype="multipart/form-data"
    :beforeUpload="handleBeforeUpload"
    :showUploadList="false"
    @change="handleChange"
  >
    <div style="font-size: 22px">
      <LoadingOutlined v-if="progress" ></LoadingOutlined>
      <FileImageOutlined v-else ></FileImageOutlined>
    </div>
    <Progress v-if="progress" type="line" :percent="progress" />
  </Upload>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { message, Upload, Progress } from "ant-design-vue";
import { FileImageOutlined, LoadingOutlined } from "@ant-design/icons-vue";
import type { UploadChangeParam } from "ant-design-vue";
import { config } from "@/baseConfig";
// import heic2any from "heic2any";
import SparkMD5 from "spark-md5";
const separator = "@"; // 分隔符

const emit = defineEmits(["uploadSucess"]);

const progress = ref(0);

const showUploadList = ref(false);

const fileList = ref([]);
const headers = {
  authorization: "authorization-text",
};

const handleChange = (info: UploadChangeParam) => {
  if (info.file.status !== "uploading") {
  }
  if (info.file.status === "done") {
    message.destroy();
    emit("uploadSucess", {
      imgSrc: info.file?.response?.url,
      fileType: info.file?.response?.fileType,
      fileName: info.file.name,
    });
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} 发送失败`);
    message.destroy();
  }
};
/**
 * 上传前的拦截
 * @param file 文件对象
 * @return 返回 file 则自动上传
 */
const handleBeforeUpload = async (file: any) => {
  if (file.size > 1024 * 1024 * 500) {
    message.error("请选择小于500M的文件");
    return false;
  }
  const fileName = file.name;
  // if (file.name.includes(".heic")) {
  //   try {
  //     const pngBlob = await heic2any({
  //       blob: file,
  //       toType: "image/png",
  //     });
  //     const pngFile = new File(
  //       [pngBlob],
  //       file.name.replace(/\.heic$/, ".png"),
  //       {
  //         type: "image/png",
  //       }
  //     );
  //     return pngFile;
  //   } catch (error) {
  //     console.error("Error converting HEIC to PNG:", error);
  //     message.error("Failed to convert HEIC to PNG");

  //     return false; // Prevent upload
  //   }
  // }
  if (file.size > 1024 * 1024 * 10) {
    showUploadList.value = true;
    try {
      const chunks = createChunks(file, 1024 * 1024 * 5);
      // const md5 = await createMd5(chunks)

      import("./md5Worker?worker").then((worker) => {
        const md5Worker = new worker.default();
        md5Worker.postMessage(chunks);
        md5Worker.onerror = (err) => {
          console.log(err);
          md5Worker.terminate();
        };
        md5Worker.onmessage = async function (e) {
          if (e.data) {
            md5Worker.terminate();
            const md5 = e.data as string;
            let chunsNames = [] as string[];
            chunks.forEach((item, index) =>
              chunsNames.push(md5 + separator + index)
            );
            const {
              url = "",
              fileType,
              notUploadedChunks = [],
              uploadedChunks = [],
            } = await verifyFile(md5, chunks, file);
            if (url) {
              // 服务器已存在该文件
              emit("uploadSucess", {
                imgSrc: url,
                fileType: fileType,
                fileName: file.name,
              });
              showUploadList.value = false;
              return false;
            }
            const allRequest = uploadChunks(
              chunks,
              md5,
              fileName,
              notUploadedChunks,
              uploadedChunks
            );
            console.log(allRequest, "allRequest");
            let success = 0;
            const successArr: any[] = []; // 纪录成功上传的chunks
            Promise.allSettled(allRequest)
              .then((res) => {
                res?.forEach((item) => {
                  if (
                    item.status == "fulfilled" &&
                    item.value?.data?.value?.code == 0
                  ) {
                    const failIndex = item.value.data.value?.index;
                    successArr.push(failIndex);
                  }
                });
              })
              .finally(async () => {
                const isAllSuccess = successArr.length === allRequest.length;
                if (!isAllSuccess) {
                  const tryAllRequest = chunks.map((item, index) => {
                    if (!successArr.includes("" + index)) {
                      return uploadLargeFile(item, md5, fileName, index);
                    }
                  });
                  // 失败重试一次
                  await Promise.all(tryAllRequest);
                }
                mergeFile(md5, file);
                setTimeout(() => {
                  progress.value = 0;
                }, 1000);
                showUploadList.value = false;
              });
          }
        };
      });
      return false;
    } catch (error) {
      return false;
    }
  } else {
    showUploadList.value = false;
  }
  return file;
};

/**
 * 校验文件是否已上传
 * @param md5
 * @param chunks
 */
const verifyFile = (md5: string, chunks: Blob[], file: File) => {
  let chunsNames = [] as string[];
  chunks.forEach((item, index) => chunsNames.push(md5 + separator + index));
  return $fetch(`${config?.baseUrl}/upload/verifyFile`, {
    method: "POST",
    query: {
      chunksObj: { name: md5, chunsNames },
      extName: file.name.split(".").slice(-1)[0],
      fileName: md5 + "." + file.name.split(".").slice(-1)[0],
    },
  });
};

/**
 * 文件分片
 * @param file 文件对象
 * @param chunksize 分片大小
 */
const createChunks = (file: File, chunksize: number) => {
  const chunks = [];
  for (let i = 0; i < file.size; i += chunksize) {
    chunks.push(file.slice(i, i + chunksize));
  }
  return chunks;
};

/**
 * 循环上传chunks
 *
 * 1.不存在 部分未上传 =》 全部上传
 * 2. 存在 部分未上传 =》 只上传未上传部分
 * @param chunks
 * @param md5 加密串
 * @param fileName 文件名
 */
const uploadChunks = (
  chunks = [],
  md5 = "",
  fileName = "",
  notUploadedName = [],
  uploadedChunks = []
) => {
  const len = notUploadedName?.length || 0;
  const alReadyLoadLen = uploadedChunks?.length || 0;
  let success = 0;
  let allRequest = [] as any[];
  if (len && alReadyLoadLen) {
    // 存在部分未上传
    const allReq = chunks.filter((_item, _index) =>
      notUploadedName.includes(md5 + separator + _index)
    );
    chunks.forEach((item, index) => {
      const md5FileName = md5 + separator + index;
      if (notUploadedName.includes(md5FileName)) {
        allRequest.push(
          uploadLargeFile(item, md5, fileName, index).then((res) => {
            success++;
            progress.value = Math.floor((100 / allReq.length) * success);
          })
        );
      }
    });
  } else if (!len && alReadyLoadLen) {
    return [];
  } else {
    chunks.forEach((item, index) => {
      allRequest.push(
        uploadLargeFile(item, md5, fileName, index).then((res) => {
          success++;
          progress.value = Math.floor((100 / chunks.length) * success);
        })
      );
    });
  }
  return allRequest;
};

/**
 * 上传chunk
 * @param item chunks
 * @param md5 加密串
 * @param fileName 文件名
 * @param index 下标：失败辅助标识
 */
const uploadLargeFile = (item, md5 = "", fileName = "", index = -1) => {
  const formData = new FormData();
  formData.append("file", item);
  return useFetch(`${config?.baseUrl}/upload/largeFile`, {
    method: "POST",
    headers: {
      authorization: "authorization-text",
    },
    body: formData,
    query: {
      filename: md5 + separator + index,
      name: md5,
      fileName,
      index,
    },
  });
};

/**
 * 合并chunks
 * @param md5
 * @param file
 */
const mergeFile = async (md5 = "", file: File) => {
  const {
    url = "",
    fileType = "",
    fileName: _fileName,
  } = await $fetch(`${config?.baseUrl}/upload/mergeFile`, {
    method: "POST",
    query: {
      fileName: md5,
      filename: file.name,
      extName: file.name.split(".").slice(-1)[0],
    },
  });
  emit("uploadSucess", {
    imgSrc: url,
    fileType,
    fileName: _fileName,
  });
};

/**
 * 创建MD5 加密串
 * @param chunks
 */
const createMd5 = (chunks: Blob[]) => {
  const spark = new SparkMD5();
  return new Promise((reslove) => {
    function _read(i: number) {
      if (i >= chunks.length) {
        const md5 = spark.end();
        reslove(md5);
        return;
      }
      const blob = chunks[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const bytes = e?.target?.result;
        spark.append(bytes);
        _read(i + 1);
      };
      reader.readAsArrayBuffer(blob);
    }
    _read(0);
  });
};
</script>