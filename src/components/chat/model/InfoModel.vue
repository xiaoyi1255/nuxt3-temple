<template>
    <Modal v-if="vShow" v-model:open="vShow" :title="state.title" @ok="handleOk">
        <div>房主：{{ roomInfo.createUser }}</div>
        <div>创建时间：{{ new Date(roomInfo.createTime).toLocaleString() }}</div>
        <div class="item" v-for="(item, index) in roomInfo.messageList">
            <div class="name">{{ item.name }}:</div>
            <div class="content">
                <div v-if="item.type==='upload'">
                    <Image :src="getImgSrc(item.imgSrc)" />
                </div>
                <div v-else>
                    {{ item.text }}
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Modal, Image } from "ant-design-vue";
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

</style>