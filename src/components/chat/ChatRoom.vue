<template>
  <div class="chat-container">
    <Button @click="exit(state)">退出房间</Button>
    <p class="tc title">{{connected ? `房间号：${state.roomId}`: '加入房间失败'}}</p>
    <p>当前房间人数：{{ users }}</p>
    <div class="message">
      <div class="item" :class="item.name==state.name? '':'item1'" v-for="item in receivedMessages" :key="item.id">
        <p class="msg">
          {{ item.text }}
        </p>
        <div class="user">
          <div class="time">{{ new Date(item.id).toLocaleTimeString() }}</div>
          <div class="user">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="connected">
      <textarea maxlength="100"  class="message-input" v-model="message" placeholder="输入消息..." />
      <div class="submit" @click="sendMessage">发送</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { message as Message, Button } from 'ant-design-vue'
const props = defineProps(['state'])
const emit = defineEmits(['changeRoom'])
const connected = ref(false);
const message = ref('');
const users = ref(0)
const receivedMessages = ref([]);
let socket = null;

const connectWebSocket = () => {
  // const socketUrl = 'ws://localhost:3000/ws'; // Replace with your WebSocket server URL
  const socketUrl = 'ws://118.89.125.27:3000'; // Replace with your WebSocket server URL
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    connected.value = true;
    sendMessage(true)
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const { name, roomId } = props.state
    users.value = msg.users || 0
    if (msg?.code == 200 && msg.roomId == roomId) {
      receivedMessages.value.push(msg);
    } else {
      if (msg.name == name && roomId == msg.roomId ) {
        Message.error(msg.text)
        exit()
      }
    }
  };

  socket.onclose = () => {
    connected.value = false;
    socket = null;
  };
};
let flag = false
const sendMessage = (type = '') => {
  if (!socket) return;
  const state = {...props.state}
  const messageObj = {
    ...state,
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

const exit = (state = {} ) => {
  if (socket) {
    const type = 'leave'
    state.name && sendMessage(type)
    socket.close();
    emit('changeRoom', {})
  }
}

onMounted(() => {
  connectWebSocket();

});

onBeforeUnmount(() => {
  exit()
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
  width: 100%;
  display: block;
  min-height: 15vh;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
  .user {
    display: flex;
    justify-content: flex-end;
    align-items: end;
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

  