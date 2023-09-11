<template>
  <audio controls autoplay style="scale: 0; position: absolute"></audio>
  <Popover title="" trigger="hover">
    <template #content>{{ isStart ? '语音录制中...' : '长按发送语音' }}  </template>
    <AudioOutlined
      style="font-size: 22px;"
      :class="isStart ? 'aqua' : ''"
      @mousedown="startRecording"
      @mouseup="uploadAudio"
      @touchstart="startRecording"
      @touchend="uploadAudio"
    />
  </Popover>
</template>

<script lang="ts" setup>
import { Button, Popover } from "ant-design-vue";
import { AudioOutlined } from "@ant-design/icons-vue";
import { config } from "@/baseConfig";
import { onMounted } from "vue";
// import "./HZRecorder";


const porps = defineProps(['sendMessage'])
let recorder;

let audio = null;
const isStart = ref(false)
onMounted(() => {
  audio = document.querySelector("audio");
});

function startRecording() {
  isStart.value = true
  HZRecorder.get(function (rec) {
    recorder = rec;
    recorder.start();
  });
}

function stopRecording() {
  recorder.stop();
}

function playRecording() {
  recorder.play(audio);
}

async function uploadAudio() {
  stopRecording();
  isStart.value = false
  const blob = recorder.getBlob()
  const fileReader = new FileReader();
  const formData = new FormData()
  formData.append('file', blob)
  // formData.append('path', '')
  const{ url, fileType} = await $fetch(`${config?.baseUrl}/upload/imgs`, {
    method:"POST",
    body: formData,
    query: {
      blobfilename:  +new Date() + '.wav'
    }
  })
  porps.sendMessage('upload', {audioUrl:url,fileType})
}

onMounted(() => {
  import("./HZRecorder.js")
})
</script>
<style scoped>
.aqua {
  color: aqua;
}
</style>