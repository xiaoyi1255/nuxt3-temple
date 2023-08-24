<template>
    <Modal v-if="vShow" v-model:open="vShow" :title="state.title" @ok="handleOk">
        <div>房主：<span>{{ roomInfo.createUser }}</span></div>
        <div>创建时间：<span>{{ new Date(roomInfo.createTime).toLocaleString() }}</span></div>
        <div v-for="(item, index) in roomInfo.messageList" :key="index">
            <ChatBox :item="item" :isOwn="item.name ==name" />
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Modal } from "ant-design-vue";
import ChatBox from '../ChatBox.vue';
import { config } from '@/baseConfig'

const emit = defineEmits(['changeShow'])
const props = defineProps({
    roomInfo: {
        type: Object,
        default: {}
    },
    show: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        default: ''
    }
})

const state = reactive({
    title: '房间信息: ' + props.roomInfo?.roomId,

})
const vShow = computed({
    get(){
        return props.show
    },
    set(val){
        emit('changeShow', false)
    }
})
const getImgSrc = (url='') =>  config.baseUrl + url

</script>

<style scoped lang="less">
.item {
    display: flex;
    align-items: center;
    margin-bottom: 2vh;
    .name {
        margin-right: 1vh;
        color: rgb(59, 42, 136);
        font-weight: 700;
    }
}
span {
    color: rgb(59, 42, 136);
    font-weight: 700;
}

</style>