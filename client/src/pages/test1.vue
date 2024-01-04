<template>
  <div class="typewriter">
    <p class="typewriter-text" :style="animationStyle">{{ typedText }}</p>
  </div>
</template>

<script setup>
import {useTypewriter } from '@/hooks/useText'

const { typedText, animationStyle } = useTypewriter({text:'cancelAnimationFrame(state.animationFrameId);cancelAnimationFrame(state.animationFrameId);cancelAnimationFrame(state.animationFrameId);cancelAnimationFrame(state.animationFrameId);cancelAnimationFrame(state.animationFrameId);'})
console.log(typedText, animationStyle)
</script>

<style scoped>
.typewriter {
  /* text-align: center; */
}

.typewriter-text {
  overflow-wrap: break-word; /* 自动换行 */
  word-wrap: break-word; /* 兼容旧浏览器 */
  white-space: pre-wrap; /* 保留空格和换行符 */
  margin: 0 auto;
  border-right: .15em solid orange;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blink-caret {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: orange;
  }
}
</style>
