<template>
  <div>
    <div style="display: flex; align-items: center; flex-direction: column">
      <div class="title">关注微信公众号：发送 <span>登录</span> 获取验证码</div>
      <img width="300" src="../../assets/imgs/qrcode.jpg" preview-disabled />
      <div style="display: flex; align-items: center">
        <Input
          autofocus
          clearable
          show-count
          v-model:value="codeValue"
          style="width: 70%"
          placeholder="请输入验证码"
          :maxlength="6"
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
  <Modal v-model:open="showModal" title="登录成功，请牢记你账号密码" @cancel="onClose" footer="" :mask-closable="false">
    <Descriptions title="*密码只在注册时展示" layout="vertical" bordered>
      <DescriptionsItem label="账号">{{ state.username }}</DescriptionsItem>
      <DescriptionsItem label="密码">{{ state.password }}</DescriptionsItem>
      <DescriptionsItem label="uid">{{ state.uid }}</DescriptionsItem>
    </Descriptions>
  </Modal>
</template>

<script setup lang="ts">
/* eslint-disable */
// import { ref } from "vue";
import { Button, Input, message as ms, Modal, Descriptions, DescriptionsItem } from "ant-design-vue";
import { debounce } from "@/utils/function";
import { verifyCode } from '@/apis/index'
// import { useRouter } from 'vue-router'
import { userInfoService } from '@/utils/auth'
import { useUserStore } from '@/store/userStore'


const router = useRouter()

const codeValue = ref();
const showModal = ref(false)
const state = ref({
  username: '',
  password: '',
  uid: '',
})
const handleSendCode = debounce(async function () {
  const reg = /^[0-9]{6}$/;
  if (!reg.test(codeValue.value)) {
    ms.error("请输入6位纯数字验证码");
    return;
  }
  try {
    const { userInfo = {}, msg } = await verifyCode({code: codeValue.value}) as any;
    if (userInfo?.uid) {
      state.value = userInfo
      const userStore = useUserStore()
      userStore.setUserInfo(userInfo)
      userInfoService.setUserInfo(userInfo)
      ms.success(msg);
      showModal.value = true
  }
  } catch (error: any) {
    // ms.error(error?.msg);
  }
}, 600);
/* eslint-enable */

const onClose = () => {
  ms.loading('即将跳转到首页...')
  showModal.value = false
  setTimeout(() => {
    router.push({
      path: '/createroom',
    })
  }, 2000)
}
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
