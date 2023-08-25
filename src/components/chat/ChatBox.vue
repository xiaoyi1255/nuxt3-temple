<template>
    <div class="item" :class=" !_isOwn ? 'item1':''">
        <div v-if="item.imgSrc" class="msg msg-img tc">
            <div v-if="item.fileType=='img'" class="img">
                <Image  :src="getImgSrc(item.imgSrc)" alt="" />
            </div>
            <div v-else-if="item.fileType=='video'" class="video">
                <video :ref="videoRef" id="video" @click="playVideo" :src="getImgSrc(item.imgSrc)" alt="" />
            </div>
            <a v-else class="tc" :href="getImgSrc(item?.imgSrc)" target="_blank">{{ item.fileName }}</a>
        </div>
        <p class="msg" v-else>
            {{ item.text }}
        </p>
        <div class="user">
            <div class="time">{{ new Date(item.id).toLocaleTimeString() }}</div>
            <div class="user">{{ item.name }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { config } from '@/baseConfig'
import { Image } from 'ant-design-vue'

const getImgSrc = (url = '') => config.baseUrl + url

const porps = defineProps({
    item: {
        type: Object,
        defalut: {}
    },
    isOwn: {
        type: Boolean,
        defalut: false
    }
})
const _isOwn = computed(() => porps.isOwn)
let isPlay = false
const playVideo = () => {
    const video = document.getElementById('video') as HTMLVideoElement
    if (!isPlay) {
        video.play()
        // videoRef.value.play();
    } else {
        video.pause();
    }
    isPlay = !isPlay
}
</script>

<style scoped lang="less">
.item {
    margin-bottom: 10px;
    padding: 5px 10px;

    display: flex;
    justify-content: flex-end;
    align-items: center;

    .msg {
        color: #fff;
        padding: 1vw;
        margin-right: 1vh;
        max-width: 60vw;
        height: 100%;
        overflow: hidden;
        background-color: #5d46da;
        border: 1px solid #eee;
        border-radius: 2vh;
        box-sizing: border-box;
        order: 1;
    }

    .msg-img {
        width: 30vh;
        padding: 0;
        background-color: transparent;
    }

    .user {
        display: flex;
        justify-content: flex-end;
        align-items: flex-endd;
        flex-direction: column;
        width: 6vh;
        overflow: hidden;
        order: 2;

    }
}

.item1 {
    justify-content: flex-start;
    & > .user {
        order: 2;
        align-items: flex-start ;
        justify-content: flex-start;
        width: 6vh;
        overflow: hidden;
    }

    .msg {
        order: 3;
        margin-left: 1vh;
        margin-right: 0;
        box-sizing: border-box;
        background-color: #7dad6a;

    }
}

.tc {
    text-align: center;
}

.time {
    font-size: 12px;
}
.img {
    max-height: 25vh;
}

.video {
    width: 30vh;
    video {
        width: 100%;
        height: 100%;
        object-fit:cover;
    }
}</style>