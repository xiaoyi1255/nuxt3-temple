<template>
  <div class="form">
    <Form :model="formState" name="basic" :rules="rules" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" autocomplete="off"
      @finish="onFinish" @finishFailed="onFinishFailed">
      <Form.Item label="用户名" name="username" prop="username">
        <Input v-model:value="formState.username" />
      </Form.Item>

      <Form.Item label="密码" name="password" prop="password">
        <InputPassword v-model:value="formState.password" />
      </Form.Item>

      <Form.Item label="性别" name="gender" v-if="checkType === 'register'">
        <Space direction="vertical">
          <RadioGroup v-model:value="formState.gender" :options="options" />
        </Space>
      </Form.Item>

      <Form.Item :wrapper-col="{ offset: 8, span: 16 }">
        <Button type="primary" html-type="submit" :loading="loading">{{
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
// import { reactive, ref, computed, watch } from "vue";
// import { useRouter } from 'vue-router'
import { debounce } from '@/utils/function'
import { onLogin, onRegister } from '@/apis/index'
import { useUserStore } from '@/store/userStore'
import { userInfoService } from '@/utils/auth'
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
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 1, max: 20, message: "用户名长度在 1 到 20 个字符之间", },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "用户名只能包含字母、数字和下划线",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 1, max: 20, message: "密码长度在 1 到 20 个字符之间" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "用户名只能包含字母、数字和下划线",
    },
  ],
};
const options = reactive([
  { label: "男", value: "男" },
  { label: "女", value: "女" },
]);
const loading = ref(false)
watch(
  () => props.checkType,
  (val) => {
    checkType.value = val;
  }
);
const checkType = ref(props.checkType);
const formState = reactive<FormState>({
  username: "",
  password: "",
  gender: "男",
});
const onFinish = debounce(async (values: any) => {
  try {
    console.log(values, checkType.value)
    loading.value = true
    const userStore = useUserStore()
    const promise = checkType.value == 'login' ? onLogin(values) : onRegister(values)
    const {
      code = -1,
      msg = "",
      userInfo = "",
    } = await promise;
    if (code !== 0) {
      msg && message.error(msg || '连接报错，请刷新页面！');
      return;
    } else {
      userStore.setUserInfo(userInfo)
      userInfoService.setUserInfo(userInfo)
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
    // message.error(JSON.stringify(error));
  } finally {
    loading.value = false
  }
}, 500);

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

onMounted(() => {
  localStorage.clear()
})
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