<template>
  <Button type="primary" @click="newRoom('create')">{{ title.create }}</Button>
  <Button @click="newRoom('join')">{{ title.join }}</Button>
  <Button @click="getRoomListInfo" :loading="state.loading">房间列表</Button>

  <Modal v-if="state.roomShow" v-model:open="state.roomShow" :title="title[state.type]" @ok="handleOk">
    <input type="number" v-model.trim="state.room" :maxlength="4"  @keyup.enter="handleOk" placeholder="请输入4位数字房间号" />
    <input style="margin-top: 2vh; display: block" :maxlength="8" v-model.trim="state.name" @keyup.enter="handleOk"
      placeholder="请输入姓名" />
  </Modal>

  <Modal v-if="state.roomListShow" v-model:open="state.roomListShow" title="房间列表" @ok="close">
    <div class="roomlist" v-if="state.roomList?.length">
      <div v-for="(item, index) in state.roomList" :key="index" class="roomItem">
        <div v-if="item?.roomId">房间号: <span>{{ item.roomId }}</span>---人数: <span>{{ item.userList?.length }}</span></div>
        <div v-if="item.userList?.length" class="user">
          房间成员：
          <div v-for="(user,index1) in item.userList" :key="index1">
            <div>· {{ user.active ? '在线 ' : '离线 ' }} {{ user.name }}  </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>空空如也~~</div>
  </Modal>
</template>
<script lang="ts" setup>
type DataType = {
  newMessage: string;
  room: number | '';
  roomList: any[];
  roomShow: boolean;
  roomListShow: boolean;
  messages: {
    id: Date;
    text: string;
    name: string;
  }[];
  socket: any;
  name: string;
  type: string
  loading: boolean
};

import { Button, Input, message, Modal } from "ant-design-vue";
import { config } from '@/baseConfig'

const emit = defineEmits(['changeRoom'])
const state: DataType = reactive({
  newMessage: "",
  roomShow: false,
  roomListShow: false,
  roomList: [],
  room: '',
  name: '',
  messages: [],
  socket: null,
  type: '',
  loading: false
});
const title = {
  create: '创建房间',
  join: '加入房间',
  back: '返回房间',
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
  emit('changeRoom', { name: state.name, roomId: state.room, type: state.type })
}
const getRoomListInfo = () => {
  state.loading = true
  $fetch(`${config.baseUrl}/getAllRoomInfo`, {
    method: 'GET',
  }).then(res => {
    state.roomList = res
    if (res.length) {
      state.roomListShow = true
    }
    console.log(res)
  }).finally(() => {
    state.loading = false
  })
}
const close = () => {
  state.roomListShow = false
}
</script>
  
<style scoped lang="less">
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
.roomItem {
  background-color: #eee;
  padding: 2vh 1vh;
  border-radius: 1vh;
  span {
    color: #007bff;
    font-weight: 500;
  }
  .user {
    margin: 1vh;
  }
}
</style>
  