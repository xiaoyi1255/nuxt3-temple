<template>
    <!-- <client-only placeholder="loading...">
    </client-only> -->
    <CreateChat v-if="!state.roomId" @changeRoom="changeRoom"></CreateChat>
    <ChatRoom v-else :state="state" @changeRoom="changeRoom"></ChatRoom>
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
        $fetch('http://118.89.125.27:3000/updateInfo',{
        // $fetch('http://localhost:3000/updateInfo',{
            method: 'POST',
            params: {
                name: userInfo?.name,
                roomId: userInfo?.roomId
            }
        })
    }
}
onMounted(() => {
    // window.addEventListener('load', onLoadHandle)
    onLoadHandle()
})
onUnmounted(()=>{
    // window.removeEventListener('load', onLoadHandle)
})
</script>

<style>
textarea,
input {
    outline: none;
}
</style>