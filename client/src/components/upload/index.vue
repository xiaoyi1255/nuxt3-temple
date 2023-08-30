<template>
  <Upload v-model:file-list="fileList" name="file" :action="`${config?.baseUrl}/upload/imgs`" :headers="headers"
    enctype="multipart/form-data" :beforeUpload="handleBeforeUpload" :showUploadList="showUploadList" @change="handleChange">
    <Button>
      <div v-if="loading">
        <Spin />
      </div>
      <div v-else>
        <upload-outlined></upload-outlined>
          发送文件
      </div>
    </Button>
  </Upload>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { message, Button, Upload, Spin } from "ant-design-vue";
import { UploadOutlined } from "@ant-design/icons-vue";
import type { UploadChangeParam } from "ant-design-vue";
import { config } from "@/baseConfig";
import heic2any from "heic2any";
import SparkMD5 from "spark-md5";

// const props = defineProps({
//   isLarge: {
//     type: Boolean,
//     default: false,
//   },
// });
const emit = defineEmits(["uploadSucess"]);

const showUploadList = ref(false)

const handleChange = (info: UploadChangeParam) => {
  console.log(info.file);
  if (info.file.status !== "uploading") {
    console.log(info.file, info.fileList);
  }
  if (info.file.status === "done") {
    loading.value = false;
    message.destroy();
    emit("uploadSucess", {
      imgSrc: info.file?.response?.url,
      fileType: info.file?.response?.fileType,
      fileName: info.file.name,
    });
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} 发送失败`);
    loading.value = false;
    message.destroy();
  }
};
const loading = ref(false);
const fileList = ref([]);
const headers = {
  authorization: "authorization-text",
};

/**
 * 上传前的拦截
 * @param file 文件对象
 * @return 返回 file 则自动上传
 */
const handleBeforeUpload = async (file: any) => {
  // loading.value = true;
  message.loading();
  const fileName = file.name;
  if (file.name.includes(".heic")) {
    try {
      const pngBlob = await heic2any({
        blob: file,
        toType: "image/png",
      });
      const pngFile = new File(
        [pngBlob],
        file.name.replace(/\.heic$/, ".png"),
        {
          type: "image/png",
        }
      );
      return pngFile;
    } catch (error) {
      console.error("Error converting HEIC to PNG:", error);
      message.error("Failed to convert HEIC to PNG");
      loading.value = false;

      return false; // Prevent upload
    }
  }
  let flag = true
  if (file.size > 1024 * 1024 * 10) {
    showUploadList.value = true
    try {
      const chunks = createChunks(file, 1024 * 1024 * 1);
      // const md5 = await createMd5(chunks)
      import("./md5Worker?worker").then((worker) => {
        const md5Worker = new worker.default();
        md5Worker.postMessage(chunks)
        md5Worker.onerror = err => {
          console.log(err)
          loading.value = false;
          md5Worker.terminate()
        }
        md5Worker.onmessage = async function(e) {
          console.log(e.data, '接收到的MD5')
          if (e.data) {
            md5Worker.terminate()
            const md5 = e.data;
            const { url = '', fileType } = await $fetch(`${config?.baseUrl}/upload/verifyFile`,
              {
                method: 'POST',
                query: {
                  extName: file.name.split(".").slice(-1)[0],
                  fileName: md5 + '.' + file.name.split(".").slice(-1)[0]
                }
              })
            if (url) { // 服务器已存在该文件
              emit("uploadSucess", {
                imgSrc: url,
                fileType: fileType,
                fileName: file.name,
              });
              loading.value = false
              showUploadList.value = false
              flag = false
              return false
            }
  
            const allRequest = uploadChunks(chunks, md5, fileName)
  
            const successArr: any[] = [] // 纪录成功上传的chunks
            Promise.allSettled(allRequest).then(res => {
              res?.forEach(item => {
                if (item.status == 'fulfilled' && item.value?.data?.value?.code == 0) {
                  const failIndex = item.value.data.value?.index
                  successArr.push(failIndex)
                }
              })
            }).finally(async () => {
              const isAllSuccess = successArr.length === chunks.length
              if (!isAllSuccess) {
                const tryAllRequest = chunks.map((item, index) => {
                  if (!successArr.includes('' + index)) {
                    return uploadLargeFile(item, md5, fileName, index)
                  }
                })
                // 失败重试一次
                await Promise.all(tryAllRequest)
              }
              mergeFile(md5, file)
              loading.value = false;
              showUploadList.value = false
            })
          }
        };
      });
      return false;
    } catch (error) {
      loading.value = false;
      return false;
    }
  } else {
    showUploadList.value = false
  }
  return file;
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
 * @param chunks 
 * @param md5 加密串
 * @param fileName 文件名
 */
const uploadChunks = (chunks = [], md5 = '', fileName = '') => {
  const allRequest = chunks.map((item, index) => {
    return uploadLargeFile(item, md5, fileName, index)
  });
  return allRequest
}

/**
 * 上传chunk
 * @param item chunks
 * @param md5 加密串
 * @param fileName 文件名
 * @param index 下标：失败辅助标识
 */
const uploadLargeFile = (item, md5='', fileName='',index=-1) => {
  const formData = new FormData();
  formData.append("file", item);
  return useFetch(`${config?.baseUrl}/upload/largeFile`, {
      method: "POST",
      headers: {
        authorization: "authorization-text",
      },
      body: formData,
      query: {
        filename: md5 + "@" + index,
        name: md5,
        fileName,
        index,
      },
    });
}

/**
 * 合并chunks
 * @param md5 
 * @param file 
 */
const mergeFile = async(md5='', file:File) => {
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
}

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