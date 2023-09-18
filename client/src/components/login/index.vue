<template>
  <div class="main">
    <div>
      <Tabs v-model:activeKey="activeKey" size="large">
        <TabPane key="login" tab="登录">
          <div class="login">
            <FormCom :checkType="'login'" />
          </div>
        </TabPane>
        <TabPane key="register" tab="注册">
          <div class="register">
            <FormCom :checkType="'register'" @changeActiveKay="changeActiveKay" />
          </div>
        </TabPane>
        <TabPane key="scanCode" tab="扫码登录">
          <div class="scancode">
            <QcanCode />
          </div>
        </TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { TabPane, Tabs } from "ant-design-vue";
import FormCom from "@/components/login/Form.vue";
import QcanCode from "@/components/login/qcanCode.vue";
const activeKey = ref('login')
const changeActiveKay = () => {
  activeKey.value = 'login'
}
onMounted(() => {
  localStorage.removeItem('token')
})
</script>
<style scoped lang="less">
.main {
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(to bottom, rgba(125, 214, 86, .2), rgba(115, 132, 159, 0.2));

  & > div {
    position: absolute;
    padding: 3vh 1vh;
    border-radius: 1vh;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
  }
}
@media screen and (min-width: 800px) {
  .main {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100vw;
    height: 100vh;
    background-image: url("./../../assets/imgs/login_bg.jpg");
    background-position: center center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    filter: blur(20px); /* 初始模糊效果 */
    // transition: filter 2s ease-in-out; /* 过渡效果，2秒内从模糊到清晰 */
    animation: blur 1.5s ease-in-out forwards;
    & > div {
      padding: 5vh;
    }
  }
}
@keyframes blur {
  to {
    filter: blur(0);
  }
}
</style>