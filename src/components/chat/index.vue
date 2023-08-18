<template>
    <!-- <client-only placeholder="loading...">
    </client-only> -->
    <CreateChat v-if="!state.roomId" @changeRoom="changeRoom"></CreateChat>
    <ChatRoom v-else :state="state" @changeRoom="changeRoom"></ChatRoom>
    <div style="margin-top: 3vh;">
        <Upload />
    </div>
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

</script>

<style>
textarea,
input {
    outline: none;
}
</style>