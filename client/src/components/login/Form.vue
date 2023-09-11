<template>
  <div class="form">
    <Form :model="formState" name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off"
      @finish="onFinish" @finishFailed="onFinishFailed">
      <Form.Item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名!' }]">
        <Input v-model:value="formState.username" />
      </Form.Item>

      <Form.Item label="密码" name="password" :rules="[{ required: true, message: '请输入密码!' }]">
        <InputPassword v-model:value="formState.password" />
      </Form.Item>

      <Form.Item label="性别" name="gender" v-if="checkType === 'register'">
        <Space direction="vertical">
          <RadioGroup v-model:value="formState.gender" :options="options" />
        </Space>
      </Form.Item>

      <Form.Item :wrapper-col="{ offset: 8, span: 16 }">
        <Button type="primary" html-type="submit">{{
          checkType === "login" ? "登 录" : "注 册"
        }}</Button>
      </Form.Item>
    </Form>
  </div>
</template>
<script lang="ts" setup>
import {
  Form,
  Input,
  InputPassword,
  Button,
  message,
  Space,
  RadioGroup,
} from "ant-design-vue";
import { reactive } from "vue";
import { useRouter } from 'vue-router'
import { debounce } from '@/utils/function'
import { onLogin } from '@/apis/index'

interface FormState {
  username: string;
  password: string;
  gender: string;
}
const props = defineProps({
  checkType: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(['changeActiveKay'])
const router = useRouter()
const options = reactive([
  { label: "男", value: "男" },
  { label: "女", value: "女" },
]);
watch(
  () => props.checkType,
  (val) => {
    checkType.value = val;
  }
);
const checkType = computed(() => props.checkType);
const formState = reactive<FormState>({
  username: "",
  password: "",
  gender: "男",
});
const onFinish = debounce(async (values: any) => {
  try {
    const {
      code = -1,
      msg = "",
      userInfo = "",
    } = await onLogin(values);
    if (code !== 0) {
      msg && message.error(msg || '连接报错，请刷新页面！');
      return;
    } else {
      if (checkType.value === 'login') {
        router.push({
          path: '/createroom',
        })
      } else {
        emit('changeActiveKay', {})
      }

    }
    message.success(msg);

  } catch (error) {
    console.log(error)
  }
}, 500);

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};
</script>
<style scoped lang="less">
.form {
  padding-top: 5vh;
  width: 90vw;

  Button {
    width: 50%;
  }
}

@media screen and (min-width: 800px) {
  .form {
    margin: auto;
    width: 30vw;
    min-height: 30vh;
    min-width: 400px;
    padding-top: 5vh;

    Button {
      width: 100%;
    }
  }
}
</style>~~/src/apis/index