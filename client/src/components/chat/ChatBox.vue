<template>
  <div
    class="item"
    v-if="item && (item.imgSrc || item.text || item.audioUrl)"
    :class="!_isOwn ? 'item1' : ''"
  >
    <div v-if="item.imgSrc" class="msg msg-img tc">
      <div v-if="item.fileType == 'img'" class="img">
        <Image :src="getImgSrc(item.imgSrc)" alt="" />
      </div>
      <div v-else-if="item.fileType == 'video'" class="video">
        <video
          :ref="videoRef"
          id="video"
          @click="playVideo"
          :src="getImgSrc(item.imgSrc)"
          alt=""
        />
      </div>
      <a v-else class="tc" :href="getImgSrc(item?.imgSrc)" target="_blank">{{
        item.fileName
      }}</a>
    </div>
    <div v-else-if="item.audioUrl" class="audio" @click="trigger">
      <audio
        ref="audio"
        :src="getImgSrc(item.audioUrl)"
        @loadedmetadata="getDuration"
      />
      <div class="audio-content">
        {{ duration?.toFixed(1) || 0 }}s
        <span><SoundOutlined style="margin-left: 1vw" /></span>
      </div>
    </div>
    <p class="msg" v-else-if="item.text">
      {{ item.text }}
    </p>
    <div class="user">
      <div class="time">
        {{ new Date(item.id).toLocaleTimeString().slice(0, 5) }}
      </div>
      <div class="name dfcc">{{ item.name.slice(0, 3) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from "@/baseConfig";
import { Image } from "ant-design-vue";
import { ref, onMounted } from "vue";
import { SoundOutlined } from "@ant-design/icons-vue";

const getImgSrc = (url = "") => config.sourceUrl + url;
const audio = ref(null);
const duration = ref(0);
const porps = defineProps({
  item: {
    type: Object,
    defalut: {},
  },
  isOwn: {
    type: Boolean,
    defalut: false,
  },
});
const _isOwn = computed(() => porps.isOwn);
let isPlay = false;
const playVideo = () => {
  const video = document.getElementById("video") as HTMLVideoElement;
  if (!isPlay) {
    video.play();
    // videoRef.value.play();
  } else {
    video.pause();
  }
  isPlay = !isPlay;
};

const getDuration = () => {
  duration.value = audio.value?.duration;
};

const trigger = () => {
  if (!audio.value?.paused) {
    // 如果音频正在播放
    audio.value?.pause(); // 暂停音频
  } else {
    audio.value?.play();
  }
};

onMounted(() => {
  console.log(audio.value);
});
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
    padding: 2vh;
    margin-right: 1vh;
    max-width: 60vw;
    height: 100%;
    overflow: hidden;
    background-color: #5d46da;
    border: 1px solid #eee;
    border-radius: 2vh;
    box-sizing: border-box;
    order: 1;
    word-break: break-all;
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
    margin-left: 1vh;
    width: 6vh;
    overflow: hidden;
    order: 2;
    .name {
      width: 4vh;
      height: 4vh;
      border-radius: 50%;
      background: #5d46da;
      color: #fff;
    }
  }
  .audio {
    display: flex;
    align-items: center;
    font-size: 16px;
    padding: 0.5vh 1.5vh;
    border-radius: 1vh;
    order: 0;
    margin-top: 2vh;
    background-color: #eeeeee;
    span {
      transform: rotateZ(180deg);
    }
  }
}

.item1 {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  & > .user {
    order: 2;
    width: 6vh;
    overflow: hidden;
    margin-left: 1vh;
    .name {
      background-color: #7dad6a;
    }
  }

  .msg {
    order: 3;
    margin-left: 0;
    margin-right: 0;
    box-sizing: border-box;
    background-color: #7dad6a;
  }
  .audio {
    display: flex;
    align-items: center;
    font-size: 16px;
    padding: 0.5vh 1.5vh;
    border-radius: 1vh;
    order: 3;
    &-content {
      display: flex;
      span {
        order: -1;
        transform: rotateZ(0);
      }
    }
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
    object-fit: cover;
  }
}
.color {
    color: #5d46da;
}
</style>