<template>
    <!-- <client-only placeholder="loading...">
    </client-only> -->
    <!-- <Upload /> -->
    <CreateChat v-if="!state.roomId" @changeRoom="changeRoom"></CreateChat>
    <ChatRoom v-else :state="state" @changeRoom="changeRoom"></ChatRoom>
    <!-- <ChatTest /> -->
</template>

<script lang="ts" setup>
import ChatRoom from './ChatRoom.vue'
import CreateChat  from './CreateChat.vue'
// import Upload  from '../upload/index.vue'

const state = reactive({
    name: '',
    roomId: 0,
    type: '',
    password: ''
})
const changeRoom = (newInfo = {}) => {
    console.log(newInfo, 'asdsadsadasd')
    state.name = newInfo.name
    state.roomId = newInfo.roomId
    state.type = newInfo.type
    state.password = newInfo.password
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
:where(.css-dev-only-do-not-override-eq3tly).ant-image-preview-root .ant-image-preview-wrap {
    background-color: rgba(0, 0, 0, 0.9);
}
</style>