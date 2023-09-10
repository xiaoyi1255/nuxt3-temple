<template>
  <div class="chat-container">
    <div class="dfsb aic top">
      <Button @click="exit(state)">退出房间</Button>
      <p class="tc title">
        {{ connected ? `房间号${state.roomId}` : "加入房间失败" }}
        <Button v-if="!connected" @click="reConnectWebSocket(true)"
          >重新连接</Button
        >
      </p>
      <div>
        <p>在线人数: {{ usersInfo.activityUsers }}</p>
        <p>房间人数：{{ usersInfo.users }}</p>
      </div>
    </div>

    <div class="message" ref="chat">
      <div v-for="item in receivedMessages" :key="item.id">
        <ChatBox
          v-if="item.type !== 'ping'"
          :item="item"
          :isOwn="item.name == state.name"
        />
      </div>
    </div>
    <div v-if="connected" class="bottom">
      <Popover title="" trigger="hover">
        <template #content> 上传文件或图片 </template>
        <Upload @uploadSucess="uploadSucess" />
      </Popover>
      <Popover title="" trigger="hover">
        <template #content> 选择表情 </template>
        <smile-outlined
          style="font-size: 22px; margin: 0 2vh"
          @click="selectEmoji"
        />
      </Popover>
      <Recorder :sendMessage="sendMessage" />
      <Popover title="">
        <template #content> 查看历史消息 </template>
        <HistoryOutlined
          @click="getRoomInfo"
          style="font-size: 22px; margin: 0 2vh"
        />
      </Popover>
      <Popover v-model:open="visible" title="" placement="top">
        <template #content>
          <div>
            <Emoji @emojiHandle="emojiHandle" :all="false" />
          </div>
        </template>
      </Popover>
      <div class="textarea-box">
        <Textarea
          :maxlength="100"
          @pressEnter="sendMessage"
          class="message-input"
          v-model:value.trim="message"
          placeholder="回车发送消息..."
        >
        </Textarea>
        <SendOutlined class="send_icon" @click="sendMessage" />
      </div>
    </div>
  </div>
  <RoomInfoModel
    :roomInfo="roomInfo"
    :show="roomInfoShow"
    @changeShow="changeRoomInfoShow"
    :name="state.name"
  />
</template>

<script setup>
import {
  SmileOutlined,
  HistoryOutlined,
  SendOutlined,
} from "@ant-design/icons-vue";
import { message as Message, Button, Textarea, Popover } from "ant-design-vue";
import Emoji from "@/components/emoji/index.vue";
import Recorder from "@/components/recorder/index.vue";
import Upload from "@/components/upload/index.vue";
import { config } from "@/baseConfig";
import RoomInfoModel from "./model/InfoModel.vue";
import ChatBox from "./ChatBox.vue";
const props = defineProps(["state"]);
const emit = defineEmits(["changeRoom"]);
const router = useRouter();

const visible = ref(false);
const connected = ref(false);
const message = ref("");
const usersInfo = reactive({
  totalUserList: [], //
  activityUsers: 0,
  users: 0,
});
const cursor = ref(0);
const roomInfo = ref({});
const roomInfoShow = ref(false);
const roomInfoLoading = ref(false);
const receivedMessages = ref([]);
const chat = ref(null);
let socket = null;

let timer = null;
const connectWebSocket = () => {
  const { name, roomId } = props.state;
  if (!name || !roomId) return;
  const socketUrl = config?.baseWsUrl + "/ws";
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket连接成功！");
    connected.value = true;
    retry = 0;
    flag = false;
    // clearInterval(timer);
    // timer = setInterval(() => {
    //   sendMessage("ping");
    // }, 1000 * 4);
    sendMessage(true);
  };

  socket.onmessage = async (event) => {
    const msg = JSON.parse(event.data);
    msg.type !== "ping" && console.log(msg);
    const { name, roomId } = props.state;
    if (roomId == msg.roomId) {
      usersInfo.totalUserList = msg.totalUserList || [];
      usersInfo.activityUsers = msg.activityUsers || 0;
      usersInfo.users = msg.users || 0;
    }
    if (msg?.code == 200 && msg.roomId == roomId) {
      if (msg?.type != "update") {
        console.log(msg.type);
        receivedMessages.value.push(msg);
      }
      if (msg.type === "ping") {
        // 断线重连
        if (msg.status !== "pong") {
          Message.loading("断线重连中...");
          reConnectWebSocket();
        }
        msg.name == name && console.log("心跳检测中状态：", msg.status);
      }
    } else {
      if (msg.name == name && roomId == msg.roomId) {
        Message.error(msg.text);
        onLoadHandle();
      }
    }
    if (msg.type !== "ping") {
      await nextTick();
      chat.value && (chat.value.scrollTop = chat.value?.scrollHeight);
    }
  };
  socket.onerror = (msg) => {
    console.log("errr");
  };
  socket.onclose = (msg) => {
    console.log("close");
    reConnectWebSocket();
  };
};
let retry = 0;
/**
 *
 * @param {*} isAutomatic 是否手动重连
 * @param {*} retryCunt  自动重连次数
 */
const reConnectWebSocket = (isAutomatic = false, retryCunt = 10) => {
  flag = false;
  if (!isAutomatic) {
    console.log(retry, "自动重连次数");
    retry++;
    if (retry >= retryCunt) {
      clearInterval(timer);
      connected.value = false;
      socket = null;
      return;
    }
  } else {
    console.log("手动重连");
  }
  connectWebSocket();
};
let flag = false;
const sendMessage = (type = "", file = {}) => {
  console.log(type, file);
  if (!socket) return;
  const state = { ...props.state };
  const messageObj = {
    ...state,
    ...file,
    text: message.value,
    id: Date.now(),
  };
  if (!flag) {
    // 首次进入
    flag = true;
  } else {
    messageObj.type = "";
    type && (messageObj.type = type);
  }

  socket.send(JSON.stringify(messageObj));
  type !== "ping" && (message.value = "");
};
const uploadSucess = (file = {}) => {
  sendMessage("upload", file);
};

const exit = (state = {}) => {
  if (socket) {
    const type = "leave";
    state.name && sendMessage(type);
    socket.close();
  }
  router.push({
    path: "/createroom",
  });
};
const onLoadHandle = async () => {
  clearInterval(timer);
  $fetch(`${config?.baseUrl}/updateInfo`, {
    method: "POST",
    params: {
      name: props.state?.name,
      roomId: props.state?.roomId,
    },
  });
};

const getRoomInfo = async () => {
  if (!props.state?.roomId) {
    Message.warn("房间号丢失....");
  }
  try {
    roomInfoLoading.value = true;
    const data = await $fetch(`${config.baseUrl}/getRoomInfoByRoomId`, {
      method: "GET",
      query: {
        t: +new Date(),
        roomId: props.state.roomId,
      },
    });
    if (data) {
      roomInfo.value = data;
      changeRoomInfoShow(true);
    }
    roomInfoLoading.value = false;
  } catch (error) {
    roomInfoLoading.value = false;
  }
  console.log("roomInfo", roomInfo);
};
const changeRoomInfoShow = (flag = false) => {
  roomInfoShow.value = flag;
};
/**
 * 点击展示表情
 */
const selectEmoji = () => {
  const Textarea = document.querySelector(".message-input");
  cursor.value = Textarea?.selectionEnd;
  visible.value = !visible.value;
};
/**
 * 选择表情，并把表情插入输入框
 * @param {*} item 选择的表情
 */
const emojiHandle = (item) => {
  const msg = message.value;
  if (!cursor.value) {
    message.value += item;
  } else {
    message.value = msg.slice(0, cursor.value) + item + msg.slice(cursor.value);
  }
};

const onVoice = (obj) => {
  obj &&
    sendMessage("blob", {
      msgType: "blob",
      ...obj,
      type: "blob",
    });
};
let timeOut = null;
onMounted(() => {
  const { name, roomId } = props.state;
  if (!name || !roomId) {
    Message.loading("房间信息、用户名不存在，3秒后自动退出");
    timeOut && clearTimeout(timeOut);
    timeOut = setTimeout(() => {
      router.push({
        path: "/createroom",
      });
    }, 3000);
  }

  connectWebSocket();
  window.addEventListener("beforeunload", onLoadHandle);
  chat.value && (chat.value.scrollTop = chat.value?.scrollHeight);
});
onBeforeUnmount(() => {
  sendMessage("leave");
  onLoadHandle();
  clearInterval(timer);
  timeOut && clearTimeout(timeOut);
});
onUnmounted(() => {
  timeOut && clearTimeout(timeOut);
  clearInterval(timer);
  window.removeEventListener("beforeunload", onLoadHandle);
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

.textarea-box {
  position: relative;
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
    font-size: 14px;
    position: relative;
  }
  &::before {
    content: "";
    display: block;
    position: absolute;
    bottom: -2vh;
    right: -2vh;
    width: 8vh;
    height: 8vh;
    z-index: 2;
    background-color: #ffffff;
  }
  .send_icon {
    padding: 2vh;
    font-size: 20px;
    position: absolute;
    right: 0;
    top: 0;
    z-index: 999;
    cursor: pointer;
    &:hover {
      color: aqua;
    }
  }
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
.message::-webkit-scrollbar {
  display: none;
}
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
@media screen and (min-width: 800px) {
  .chat-container {
    padding: 2vh 15vh;
  }
  .bottom {
    width: 100%;
    position: static;
  }
}
</style>

  