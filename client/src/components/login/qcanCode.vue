<template>
  <div>
    <div style="display: flex; align-items: center; flex-direction: column">
      <div class="title">关注公众号后：发送 <span>登录</span> 获取验证码</div>
      <img width="300" src="../../assets/imgs/qrcode.jpg" preview-disabled />
      <div style="display: flex; align-items: center">
        <Input
          autofocus
          clearable
          show-count
          v-model:value="codeValue"
          style="width: 70%"
          placeholder="请输入验证码"
          maxlength="6"
        />
        <Button type="primary" @click="handleSendCode">
          <template #icon>
            <span class="dark:text-black">
              <SvgIcon icon="ri:send-plane-fill" />
            </span>
          </template>
          提交
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
import { ref } from "vue";
import { Button, Input, message as ms } from "ant-design-vue";
import { debounce } from "@/utils/function";
import { verifyCode } from '@/apis/index'
import { useRouter } from 'vue-router'
import { userInfoService } from '@/utils/auth'
import { useUserStore } from '@/store/userStore'


const router = useRouter()

const codeValue = ref();
const handleSendCode = debounce(async function () {
  const reg = /^[0-9]{6}$/;
  if (!reg.test(codeValue.value)) {
    ms.error("请输入6位纯数字验证码");
    return;
  }
  try {
    const { userInfo = {}, msg } = await verifyCode({code: codeValue.value}) as any;
    if (userInfo?.uid) {
      const userStore = useUserStore()
      userStore.setUserInfo(userInfo)
      userInfoService.setUserInfo(userInfo)
      ms.success(msg);
      router.push({
        path: '/createroom',
      })
  }
  } catch (error: any) {
    // ms.error(error?.msg);
  }
}, 600);
/* eslint-enable */
</script>


<style lang='less' scoped>
.title {
  font-size: 14px;
  span {
    color: blue;
    font-weight: 700;
  }
}
</style>
