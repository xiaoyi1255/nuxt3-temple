<template>
  <div class="chat-container">
    <Button @click="exit(state)">退出房间</Button>
    <p class="tc title">{{connected ? `房间号：${state.roomId}`: '加入房间失败'}} <Button v-if="!connected" @click="reConnectWebSocket">重新连接</Button></p>
    
    <p>在线人数{{ usersInfo.activityUsers }}</p>
    <p>当前房间人数：{{ usersInfo.users }}</p>
    <div class="message">
      <div class="item" :class="item.name==state.name? '':'item1'" v-for="item in receivedMessages" :key="item.id">
        <div v-if="item.imgSrc" class="msg msg-img">
          <Image :src="item.imgSrc" alt="" />
        </div>
        <p class="msg" v-else>
          {{ item.text }}
        </p>
        <div class="user">
          <div class="time">{{ new Date(item.id).toLocaleTimeString() }}</div>
          <div class="user">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="connected" style="padding: 2vh 0;width: 80vw;overflow: hidden;">
      <Upload v-if="connected" @uploadSucess="uploadSucess" />
      <textarea maxlength="100"  class="message-input" v-model="message" placeholder="输入消息..." />
      <div class="submit" @click="sendMessage">发送</div>
    </div>
  </div>
</template>

<script setup>
import { message as Message, Button, Image } from 'ant-design-vue'
import Upload  from '../upload/index.vue'
import { config } from '@/baseConfig'

const props = defineProps(['state'])
const emit = defineEmits(['changeRoom'])
const connected = ref(false);
const message = ref('');
const usersInfo = reactive({
  totalUserList: [], // 
  activityUsers: 0,
  users: 0
})
const receivedMessages = ref([]);
let socket = null;

const connectWebSocket = () => {
  const socketUrl = config?.baseWsUrl + '/ws';
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    connected.value = true;
    sendMessage(true)
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const { name, roomId } = props.state
    if (roomId == msg.roomId) {
      usersInfo.totalUserList = msg.totalUserList || []
      usersInfo.activityUsers = msg.activityUsers || 0
      usersInfo.users = msg.users || 0
    }
    if (msg?.code == 200 && msg.roomId == roomId) {
      msg?.type != 'update' && receivedMessages.value.push(msg);
    } else {
      if (msg.name == name && roomId == msg.roomId ) {
        Message.error(msg.text)
        exit()
      }
    }
  };
  socket.onerror = (msg) => {
    console.log('errr')
    connected.value = false;
    socket = null;
    Message.error(msg)
  };
  socket.onclose = (msg) => {
    console.log('close')
    connected.value = false;
    socket = null;
    exit()
    Message.error(msg)
  };
};

const reConnectWebSocket = () => {
  flag = false
  connectWebSocket()
}
let flag = false
const sendMessage = (type = '', imgSrc='') => {
  if (!socket) return;
  const state = {...props.state}
  const messageObj = {
    ...state,
    imgSrc,
    text: message.value,
    id: Date.now(),
    
  };
  if (!flag) {
    // 首次进入
    flag =true
  } else {
    messageObj.type = ''
    type && (messageObj.type = type)
    
  }

  socket.send(JSON.stringify(messageObj));
  message.value = '';
};

const uploadSucess = (fileUrl='') => {
  sendMessage('upload', fileUrl)
}

const exit = (state = {} ) => {
  if (socket) {
    const type = 'leave'
    state.name && sendMessage(type)
    socket.close();
    emit('changeRoom', {})
  }
}
const onLoadHandle = () => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}')
    if (userInfo?.name) {
        $fetch(`${config?.baseUrl}/updateInfo`,{
            method: 'POST',
            params: {
                name: userInfo?.name,
                roomId: userInfo?.roomId
            }
        })
    }
    exit()
}

onMounted(() => {
  connectWebSocket();
  window.addEventListener('beforeunload', onLoadHandle)

});
</script>


<style scoped lang="less">
/* 样式可以根据您的需要进行自定义 */
Button {
  padding: 5px;
  margin: 0 5px;
}
.chat-container {
  width: 80vw;
  margin: 0 auto;
  padding: 1vw;
  height: 100%;
  .title {
    font-size: 20px;
    font-weight: 900;
  }
}

.message-input {
  width: 80vw;
  display: block;
  min-height: 15vh;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  margin-top: 1vw;
}

.message {
  overflow-y: auto;
  margin-top: 2vh;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 1vh;
}

.item {
  margin-bottom: 10px;
  padding: 5px 10px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  .msg {
    color: #fff;
    padding: 1vw;
    margin-right: 1vh;
    max-width: 60vw;
    height: 100%;
    overflow: hidden;
    background-color: #5d46da;
    border: 1px solid #eee;
    border-radius: 2vh;
    order: 1;
  }
  .msg-img {
    width: 30vh;
    padding: 0;
    background-color: transparent;
  }
  .user {
    display: flex;
    justify-content: flex-end;
    align-items: flex-endd;
    flex-direction: column;
    order: 2;
    
  }
}
.item1 {
  justify-content: flex-start;
  .user {
    order: 2;
    align-items: flex-start;
  }
  .msg {
    order: 3;
    margin-left: 1vh;
    margin-right: 0;
    background-color: #7dad6a;

  }
}

.submit {
  padding: 10px;
  background-color: #3e3cd4;
  width: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  margin-top: 2vh;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  border-radius: 1vh;
  &:hover {
    background-color: #1410eb;
  }
}
.tc {
  text-align: center;
}
.time {
  font-size: 12px;
}
</style>

  