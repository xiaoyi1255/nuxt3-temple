<template>
  <div class="register">
    <Form
      :model="formState"
      name="basic"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <Form.Item
        label="用户名"
        name="username"
        :rules="[{ required: true, message: '请输入用户名!' }]"
      >
        <Input v-model:value="formState.username" />
      </Form.Item>
  
      <Form.Item
        label="密码"
        name="password"
        :rules="[{ required: true, message: '请输入密码!' }]"
      >
        <InputPassword v-model:value="formState.password" />
      </Form.Item>
  
      <Form.Item :wrapper-col="{ offset: 8, span: 16 }">
        <Button type="primary" html-type="submit">{{ checkType }}</Button>
      </Form.Item>
    </Form>
  </div>
</template>
<script lang="ts" setup>
import { Form, Input, InputPassword, Button, message } from 'ant-design-vue';
import { reactive } from 'vue';
import { config } from "@/baseConfig";

interface FormState {
username: string;
password: string;
}
const props = defineProps({
  checkType: {
    type: String,
    default: ''
  }
})
watch(()=>props.checkType, val => {
  checkType.value = val
})
const checkType = computed(()=> props.checkType)
const formState = reactive<FormState>({
  username: '',
  password: '',
});
const onFinish = async(values: any) => {
console.log('Success:', values);
const path = checkType.value === 'login' ? config?.baseUrl + '/user/login' : config?.baseUrl + '/user/register';
const { code=-1, msg='', userInfo='' } = await $fetch(path, {
  method: "POST",
  params: values,
});
if (code !== 0) {
  msg && message.error(msg)
  return
}
message.success(msg)
};

const onFinishFailed = (errorInfo: any) => {
console.log('Failed:', errorInfo);
};

</script>
