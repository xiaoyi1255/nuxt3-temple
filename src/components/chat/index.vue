<template>
    <client-only placeholder="loading...">
        <CreateChat v-if="!state.roomId" @changeRoom="changeRoom"></CreateChat>
        <ChatRoom v-else :state="state" @changeRoom="changeRoom"></ChatRoom>
    </client-only>
</template>

<script lang="ts" setup>
import ChatRoom from './ChatRoom.vue'
import CreateChat  from './CreateChat.vue'

const state = reactive({
    name: '',
    roomId: 0,
    type: ''
})
const changeRoom = (newInfo = {}) => {
    console.log(newInfo, 'asdsadsadasd')
    state.name = newInfo.name
    state.roomId = newInfo.roomId
    state.type = newInfo.type
    const type = newInfo.type || ''
    if (type=='join' || type == 'create') {
        sessionStorage.setItem('userInfo', JSON.stringify(newInfo))
    }
}
const onLoadHandle = () => {
    console.log('OnLoad')
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') ?? '{}')
    if (userInfo?.name) {
        $fetch('http://localhost:3000/updateInfo',{
            method: 'POST',
            params: {
                name: userInfo?.name,
                roomId: userInfo?.roomId
            }
        })
    }
}
const getRoomListInfo = () => {
  state.loading = true
  $fetch('http://localhost:3000/getAllRoomInfo', {
    method: 'GET',
  }).then(res => {
    state.roomList = res
    if (res.length) {
      state.roomListShow = true
    }
    console.log(res)
  }).finally(()=>{
    state.loading = false
  })
}
onMounted(() => {
    window.addEventListener('load', onLoadHandle)
})
onUnmounted(()=>{
    window.removeEventListener('load', onLoadHandle)
})
</script>

<style>
textarea,
input {
    outline: none;
}
</style>