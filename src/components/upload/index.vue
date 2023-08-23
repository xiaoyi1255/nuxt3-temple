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
          发送图片
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

  const emit = defineEmits(['uploadSucess'])
  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      // message.success(`${info.file.name} 发送成功`);
      loading.value = false
      emit('uploadSucess', info.file?.response?.url)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 发送失败`);
      loading.value = false
    }
  };
  const loading = ref(false)
  const fileList = ref([]);
  const headers = {
    authorization: 'authorization-text',
  };

  const handleBeforeUpload = async (file:any) => {
    loading.value = true
    console.log(file.name, 'file===>>>>>')
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
          return false; // Prevent upload
        }
    }
    return file
  }
  
  </script>
  
  