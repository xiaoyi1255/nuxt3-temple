<template>
    <Upload
      v-model:file-list="fileList"
      name="file"
      :action= "`${config?.baseUrl}/upload/imgs`"
      :headers="headers"
      enctype="multipart/form-data"
      :beforeUpload="handleBeforeUpload"
      :showUploadList="false"
      @change="handleChange"
    >
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
  import { ref } from 'vue';
  import { message, Button, Upload, Spin } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import type { UploadChangeParam } from 'ant-design-vue';
  import { config } from '@/baseConfig'
  import heic2any from 'heic2any';
  import SparkMD5 from 'spark-md5'

  const emit = defineEmits(['uploadSucess'])
  const handleChange = (info: UploadChangeParam) => {
    console.log(info.file)
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      // message.success(`${info.file.name} 发送成功`);
      loading.value = false
      message.destroy()
      emit('uploadSucess', {imgSrc: info.file?.response?.url, fileType: info.file?.response?.fileType, fileName: info.file.name})
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 发送失败`);
      loading.value = false
      message.destroy()
    }
  };
  const loading = ref(false)
  const fileList = ref([]);
  const headers = {
    authorization: 'authorization-text',
  };

  const handleBeforeUpload = async (file:any) => {
    // loading.value = true
    message.loading()
    console.log(file.name, 'file===>>>>>')
    // 文件大小判断
    if (file.size > 1024 * 1024 * 50) {
      message.error('请选择小于50M的文件')
      loading.value = false
      return false
    }

    if (file.name.includes('.heic')) {
      try {
          const pngBlob = await heic2any({
            blob: file,
            toType: 'image/png',
          });
          const pngFile = new File([pngBlob], file.name.replace(/\.heic$/, '.png'), {
            type: 'image/png',
          });
          return pngFile;
        } catch (error) {
          console.error('Error converting HEIC to PNG:', error);
          message.error('Failed to convert HEIC to PNG');
          loading.value = false

          return false; // Prevent upload
        }
    }
    const chunks = createChunks(file, 1024* 1024)
    const md5 = await createMd5(chunks) as string
    const allRequest = chunks.map((item,index) => {
      const formData = new FormData()
      formData.append('chunk', item)
      formData.append('filename', md5)
      formData.append('name', index + '@'+md5)
      return useFetch(`${config?.baseUrl}/upload/largeFile`, {
        method: 'POST',
        headers: {
          // 'content-type': 'multipart/form-data'
        },
        body: formData
      })
    })

    console.log(chunks, md5)
    Promise.all(allRequest).then(res => {
      console.log('所有分片上传成功')
      $fetch(`${config?.baseUrl}/upload/mergeFile`, {
        method:'POST',
        query: {
          fileName: md5,
          extName: file.name.split('.').slice(-1)[0]
        }
      })
    })
    // return false
    return file
  }

  const createChunks = (file: File, chunksize: number) => {
    const chunks = []
    for (let i = 0; i < file.size; i+=chunksize) {
      chunks.push(file.slice(i, i+chunksize))
    }
    return chunks
  }

  const createMd5 = (chunks: Blob[]) => {
    const spark = new SparkMD5()
    return new Promise((reslove=> {
      function _read(i:number){
        if (i>=chunks.length) {
          const md5 = spark.end()
          reslove(md5)
          return
        }
        const blob = chunks[i]
        const reader = new FileReader()
  
        reader.onload = (e) => {
          const bytes = e?.target?.result
          spark.append(bytes)
          _read(i+1)
        }
        reader.readAsArrayBuffer(blob);
      }
      _read(0)
    }))
  }
  
  </script>
  
  