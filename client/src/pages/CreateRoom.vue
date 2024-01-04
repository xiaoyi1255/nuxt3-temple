<template>
    <div style="margin-top: 20vh;">
      <Button type="primary" @click="newRoom('create')">{{ title.create }}</Button>
      <Button @click="newRoom('join')">{{ title.join }}</Button>
      <Button @click="getRoomListInfo" :loading="state.loading">房间列表</Button>

      <div style="margin-top: 2vh;">
        <Button type="primary" @click="createFiveLineRoom('create')">创建五子棋房间</Button>
        <Button @click="createFiveLineRoom('join')">加入五子棋房间</Button>
        <!-- <Button @click="getRoomListInfo" :loading="state.loading">五子棋房间列表</Button> -->
      </div>


      <div style="margin-top: 5vh;">
        <Button @click="toLogin">登录</Button>
      </div>
      <div style="margin-top: 5vh;">
        <Button @click="addFriend">添加好友</Button>
        <Button @click="openFriendModal">好友列表</Button>
      </div>
      <div style="margin-top: 5vh;">
        <Button @click="tokenService.removeToken()">清除短期token</Button>
        <Button @click="tokenService.removeRefreshToken()">清除长期token</Button>
      </div>

    </div>
  
    <Modal v-if="state.roomShow" v-model:open="state.roomShow" :title="title[state.type]" @ok="handleOk">
      <InputNumber style="margin-top: 2vh; display: block;width: 100%;" v-model:value="state.room" :maxlength="4"  @keyup.enter="handleOk" placeholder="请输入4位数字房间号" />
      <Input style="margin-top: 2vh; display: block;width: 100%;" :maxlength="8" v-model:value="state.name" @keyup.enter="handleOk"
        placeholder="请输入姓名" />
      <InputNumber style="margin-top: 2vh; display: block;width: 100%;" :maxlength="6" v-model:value="state.password" @keyup.enter="handleOk"
        placeholder="(选填)请输入密码6位数字" />
    </Modal>
  
    <Modal v-if="state.roomListShow" v-model:open="state.roomListShow" title="房间列表" @ok="close">
      <div class="roomlist" v-if="state.roomList?.length">
        <div v-for="(item, index) in state.roomList" :key="index" class="roomItem">
          <div v-if="item?.roomId">
            房间号: <span>{{ item.roomId }}</span>---
            人数: <span>{{ item.userList?.length }}</span>---
            房主：<span>{{ item.createUser }}</span>
          </div>
          <p></p>
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

    <ModalAddFriend v-if="state.addFriendModalShow" v-model:showModal="state.addFriendModalShow" />
    <ModalFriend v-if="state.friendModalShow" v-model:showModal="state.friendModalShow" />
    <ModalFiveline v-if="state.fiveLineModalShow" :type="state.createRoomType" v-model:showModal="state.fiveLineModalShow" />
  </template>
  <script lang="ts" setup>
  useHead({
    titleTemplate: '创建 | 加入房间', // 可以写模板
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    charset: 'utf-8',
    meta: [
      { name: 'description', content: 'chat' }
    ],
    // body添加类名
    bodyAttrs: {
      class: 'test'
    }
  })
  type DataType = {
    newMessage: string;
    room: number | '';
    roomList: any[];
    roomShow: boolean;
    roomListShow: boolean;
    addFriendModalShow: boolean;
    friendModalShow: boolean;
    fiveLineModalShow: boolean;
    addType:  'friend' | 'group'
    messages: {
      id: Date;
      text: string;
      name: string;
    }[];
    socket: any;
    name: string;
    password: number | ''
    type: string
    loading: boolean
    createRoomType: 'create' | 'join'
  };
  
  import { Button, Input, message, Modal, InputNumber } from "ant-design-vue";
  import { config } from '@/baseConfig'
  import { debounce } from '@/utils/function'
  import { getAllRoomInfo } from '@/apis/index'
  import { tokenService } from '@/utils/auth'

  // const emit = defineEmits(['changeRoom'])

  const router = useRouter()
  
  const state: DataType = reactive({
    newMessage: "",
    roomShow: false,
    roomListShow: false,
    friendModalShow: false,
    addFriendModalShow: false,
    fiveLineModalShow: false,
    addType: 'friend',
    roomList: [],
    room: '',
    name: '',
    password: '',
    messages: [],
    socket: null,
    type: '',
    loading: false,
    createRoomType: 'create'
  });
  const title = {
    create: '创建房间',
    join: '加入房间',
    back: '返回房间',
  }

  const toLogin = () => {
    router.push('/login')
  }
  
  const newRoom = (type) => {
    state.roomShow = true;
    state.type = type
  };

  const createFiveLineRoom = (type: 'create' | 'join' = 'create') => {
    state.createRoomType = type
    state.fiveLineModalShow = true
  }

  const addFriend = () => {
    state.addFriendModalShow = true
  }

  const openFriendModal = () => {
    state.friendModalShow = true
  }
  
  const handleOk = debounce(async () => {
    const reg = /^\d{4}$/
    const reg1 = /^\d{6}$/
    if (!state.room || !state.name) {
      message.error('请输入正确的房间号和名字')
      return
    }
    if (!reg.test(String(state.room))) {
      message.error('请输入正确4位数字的房间号')
      return
    }
    if (state.password && !reg1.test(String(state.password))) {
      message.error('请输入正确6位数字的密码')
      return
    }
    const query = { name: state.name, roomId: state.room, type: state.type, password: state.password }
    const res = await getRoomInfoByRoomId(query.roomId)
    if (state.type === 'create') {
      if(!res?.roomId) {
        state.roomShow = false;
        createRoom(query)
      } else {
        message.error(`房间号已存在：${state.room}`)
      }
    } else {
      if(res?.roomId) {
        if (res.password) { // 密码房
          if (res.password == state.password) {
            hasUser()
          } else {
            message.error(`密码错误请重新输入`)
          }
        } else {
          hasUser()
        }
      } else {
        message.error(`房间号不存在：${state.room}`)
      }
    }
    function hasUser() {
      let userInfo = {}
      const hasUser = res.userList?.some(item => {
        if (item.name === query.name ) {
          userInfo = item
          return true
        }
      })
      if (hasUser) {
        if(userInfo.active) { // 在线
            message.error(`用户名已存在：${state.room}`)
          } else {
            state.roomShow = false;
            createRoom(query)
          }
      } else {
          state.roomShow = false;
          createRoom(query)
      }
    }
  },500)
  const getRoomListInfo = () => {
    state.loading = true
    getAllRoomInfo({t: +new Date()}).then(res => {
      state.roomList = res
      if (res.length) {
        state.roomListShow = true
      }
      console.log(res)
    }).finally(() => {
      state.loading = false
    })
  }
  const getRoomInfoByRoomId = async (roomId=0) =>{
      return $fetch(`${config.baseUrl}/getRoomInfoByRoomId`,{
        method: "GET",
        query: {
          t: +new Date(),
          roomId: roomId
        }
      }).catch(err => {
        message.error(err)
      })
  }
  const close = () => {
    state.roomListShow = false
  }

  const createRoom = async(query) => {
    if (query.type === 'join') {
      openRoom(query)
      return
    } 
    const { code, msg } = await $fetch(`${config.baseUrl}/createRoom`,{
        method: "POST",
        body: {
          id: +new Date(),
          ...query
        }
      })
      if (code === 0) {
        message.success(msg)
        openRoom(query)
      } else {
        message.error(msg)
      }
  }
  const openRoom = (query) => {
    router.push({
      path:'/chat',
      query: {
        ...query,
        type: 'join',
      }
    })
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
  
  .roomItem {
    background-color: #eee;
    padding: 2vh 1vh;
    border-radius: 1vh;
    margin-top: 1vh;
    span {
      color: #007bff;
      font-weight: 500;
    }
    .user {
      margin: 1vh;
    }
  }
  </style>
    