<template>
    <Upload
      v-model:file-list="fileList"
      name="file"
      :action= "`${config?.baseUrl}/upload/imgs`"
      :headers="headers"
      enctype="multipart/form-data"
      :showUploadList="false"
      @change="handleChange"
    >
      <Button>
        <upload-outlined></upload-outlined>
        发送图片
      </Button>
    </Upload>
  </template>
  <script lang="ts" setup>
  import { ref } from 'vue';
  import { message, Button, Upload } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import type { UploadChangeParam } from 'ant-design-vue';
  import { config } from '@/baseConfig'

  const emit = defineEmits(['uploadSucess'])
  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      // message.success(`${info.file.name} 发送成功`);
      console.log(info.file)
      emit('uploadSucess', info.file?.response?.url)
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 发送失败`);
    }
  };
  
  const fileList = ref([]);
  const headers = {
    authorization: 'authorization-text',
  };

  
  </script>
  
  