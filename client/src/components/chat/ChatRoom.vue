<template>
  <div class="chat-container">
    <div class="dfsb aic top">
      <Button @click="exit(state)">退出房间</Button>
      <p class="tc title">{{connected ? `房间号${state.roomId}`: '加入房间失败'}} <Button v-if="!connected" @click="reConnectWebSocket">重新连接</Button></p>
      <div>
        <p>在线人数: {{ usersInfo.activityUsers }}</p>
        <p>房间人数：{{ usersInfo.users }}</p>
      </div>
    </div>
    
    <div class="message" ref="chat">
      <div v-for="item in receivedMessages" :key="item.id">
        <ChatBox :item="item" :isOwn="item.name==state.name" />
      </div>
    </div>
    <div v-if="connected" class="bottom">
      <Upload @uploadSucess="uploadSucess" />
      <Button @click="getRoomInfo" :loading="roomInfoLoading">历史消息</Button>
      <Textarea :maxlength="100" @pressEnter="sendMessage" class="message-input" v-model:value.trim="message" placeholder="回车发送消息..." />
      <!-- <div class="submit" @click="sendMessage">发送</div> -->
    </div>
  </div>
  <RoomInfoModel :roomInfo="roomInfo" :show="roomInfoShow" @changeShow="changeRoomInfoShow" :name="state.name" />
</template>

<script setup>
import { message as Message, Button, Textarea } from 'ant-design-vue'
import Upload  from '../upload/index.vue'
import { config } from '@/baseConfig'
import RoomInfoModel from './model/InfoModel.vue'
import ChatBox from './ChatBox.vue';

const props = defineProps(['state'])
const emit = defineEmits(['changeRoom'])

const connected = ref(false);
const message = ref('');
const usersInfo = reactive({
  totalUserList: [], // 
  activityUsers: 0,
  users: 0
})
const roomInfo = ref({})
const roomInfoShow = ref(false)
const roomInfoLoading = ref(false)
const receivedMessages = ref([]);
const chat = ref(null)
let socket = null;

const connectWebSocket = () => {
  const socketUrl = config?.baseWsUrl + '/ws';
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    connected.value = true;
    sendMessage(true)
  };

  socket.onmessage = async(event) => {
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
    await nextTick()
    chat.value.scrollTop = chat.value.scrollHeight;
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
const sendMessage = (type = '', file={}) => {
  if (!socket) return;
  const state = {...props.state}
  const messageObj = {
    ...state,
    ...file,
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

const uploadSucess = (file={}) => {
  sendMessage('upload', file)
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


const getRoomInfo = async () => {
  if (!props.state?.roomId) {
    Message.warn('房间号丢失....')
  }
  try {
    roomInfoLoading.value = true
    const data = await $fetch(`${config.baseUrl}/getRoomInfoByRoomId`,{
      method: "GET",
      query: {
        t: +new Date(),
        roomId: props.state.roomId
      }
    })
    if (data) {
      roomInfo.value = data
      changeRoomInfoShow(true)
    }
    roomInfoLoading.value = false
  } catch (error) {
    roomInfoLoading.value = false
    
  }
  console.log('roomInfo', roomInfo)
}
const changeRoomInfoShow = ( flag = false) => {
  roomInfoShow.value = flag
}

onMounted(() => {
  connectWebSocket();
  window.addEventListener('beforeunload', onLoadHandle)
  chat.value.scrollTop = chat.value.scrollHeight;

});
</script>


<style scoped lang="less">
/* 样式可以根据您的需要进行自定义 */
Button {
  padding: 5px;
}
.chat-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0 auto;
  padding: 1vw;
  height: 100%;
  font-size: 12px;
  box-sizing: border-box;
  .title {
    font-size: 16px;
    font-weight: 900;
  }
  .top {
    padding: 0 1vh;
  }
}

.message-input {
  width: 100%;
  display: block;
  height: 15vh;
  padding: 10px;
  border: none;
  border-radius: 0;
  border-top: 1px solid #dbdbdb;
  box-sizing: border-box;
  outline: none;
}

.message {
  overflow-y: auto;
  height: 60vh;
  margin-top: 2vh;
  padding: 2vh 0 0 0;
  border: none;
  border-radius: 0;
  border-top: 1px solid #dbdbdb;
  padding-bottom: 5vh;

}
.message::-webkit-scrollbar{
  display: none
};
.bottom {
  width: 80vw;
  overflow: hidden;
  position: fixed;
  bottom: 0;
  left: 10vw;
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
.video {
  width: 31vh;
  video {
    width: 100%;
    height: 100%;
  }
}
</style>

<style scoped lang="less">
@media screen and (min-width:800px) {
  .chat-container {
    padding: 2vh 15vh;
  }
  .bottom {
    width: 100%;
    position: static;
  }
}


</style>

  