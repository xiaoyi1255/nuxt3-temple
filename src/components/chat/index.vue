<template>
    <!-- <client-only placeholder="loading...">
    </client-only> -->
    <!-- <Upload /> -->
    <CreateChat v-if="!state.roomId" @changeRoom="changeRoom"></CreateChat>
    <ChatRoom v-else :state="state" @changeRoom="changeRoom"></ChatRoom>
</template>

<script lang="ts" setup>
import ChatRoom from './ChatRoom.vue'
import CreateChat  from './CreateChat.vue'
// import Upload  from '../upload/index.vue'

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

</script>

<style>
textarea,
input {
    outline: none;
}
Button {
  padding: 5px;
  margin: 0 5px;
}
</style>