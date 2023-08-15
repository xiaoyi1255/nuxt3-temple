<template>
  <Button type="primary" @click="newRoom('create')">{{ title.create }}</Button>
  <Button @click="newRoom('join')">{{ title.join }}</Button>

  <Modal v-model:open="state.roomShow" :title="title[state.type]" @ok="handleOk">
    <input
      type="number"
      v-model.trim="state.room"
      @keyup.enter="handleOk"
      placeholder="请输入4位数字房间号"
    />
    <input
      style="margin-top: 2vh; display: block;"
      v-model.trim="state.name"
      @keyup.enter="handleOk"
      placeholder="请输入姓名"
    />
  </Modal>
</template>
<script lang="ts" setup>
type DataType = {
  newMessage: string;
  room: number | '';
  roomShow: boolean;
  messages: {
    id: Date;
    text: string;
    name: string;
  }[];
  socket: any;
  name: string;
  type: string
};

import "ant-design-vue/dist/reset.css";
import { Button, Input, message, Modal } from "ant-design-vue";
import { reactive } from "vue";

const emit = defineEmits(['changeRoom'])
const state: DataType = reactive({
  newMessage: "",
  roomShow: false,
  room: '',
  name: '',
  messages: [],
  socket: null,
  type: ''
});
const title = {
  create: '创建房间',
  join: '加入房间'
}

const newRoom = (type) => {
  state.roomShow = true;
  state.type = type
};

const handleOk = () => {
  const reg = /^\d{4}$/
  if (!state.room || !state.name) {
    message.error('请输入正确的房间号和名字')
    return
  }
  if (!reg.test(String(state.room))) {
    message.error('请输入正确4位数字的房间号')
    return
  }
  state.roomShow = false;
  emit('changeRoom', {name: state.name, roomId: state.room, type: state.type})
}
  
</script>
  
<style scoped lang="less">
@import "ant-design-vue/dist/reset.css";
Button {
  padding: 5px;
  margin: 0 5px;
}
.chat-room {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
}

.message-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}

.message {
  margin-bottom: 10px;
  padding: 5px 10px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f8f8f8;
}

.username {
  font-weight: bold;
  color: #007bff;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
  