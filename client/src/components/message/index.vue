
<template>
  <div class="msg" style="margin-top: 20vh">
    <Button @click="connect">连接</Button>
    <Button @click="close">断开</Button>
    <Button @click="getState">查看连接状态</Button>
    <div style="margin-top: 5vh">
      <Input v-model:value="msg" placeholder="输入消息" />
      <Button @click="send(false)">给2发送</Button>
      <Button @click="send(true)">给所有人</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from '@/baseConfig.js'
import { Button, Input } from 'ant-design-vue'
import { updateInfo } from '@/apis/message'
const route = useRoute();
const msg = ref('');
let ES: EventSource;
const connect = () => {
  if (ES) {
    return;
  }
  ES = new EventSource(config.baseUrl + '/sse/push?uid=' + route.query.uid);
  ES.withCredentials
  ES.onopen = openHandle;
  ES.onmessage = messageHandled;
  ES.onclose = close;
  ES.onerror = error;
  ES.addEventListener('notify', notifyHandle, false);
}
const messageHandled = (e: MessageEvent) => {
  console.log('message事件：', e.data);
}
const notifyHandle = (e: MessageEvent) => {
  console.log('自定义事件notify：', e.data);
}
const openHandle = () => {
  console.log('连接成功');
}
const close = () => {
  console.log('连接关闭');
  ES?.close();
  ES = null;
}
const error = (e: Event) => {
  console.log('连接错误：', e);
}
const getState = () => {
  console.log('连接状态：', ES?.readyState);
  console.log('跨资源携带凭证：', ES.withCredentials);
}
const init = () => {
  connect()
}

const send = (isAll = false) => {
  updateInfo({
    uid: '2',
    msg: msg.value,
    isAll
  })
}

onMounted(() => {
  // init()
})

onBeforeUnmount(() => {
  close()
})
</script>