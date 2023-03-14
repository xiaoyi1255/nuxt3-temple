<template>
  <h1>倒计时 {{ count }} s</h1>
  <button @click="() => run()">开启倒计时</button>
  <br>
  <br>
  <button @click="() => stopWatch()">终止监听</button>
  <br>
  <br>
  <button @click="() => stopWatchEffect()">终止watchEffect监听</button>
</template>

<script setup lang="ts">
const count = ref(60);
let timer: NodeJS.Timer;
const run = () => {
  timer = setInterval(() => {
    if (count.value <= 0) {
      window.clearInterval(timer);
      return;
    }
    count.value--;
  }, 1000);
};
const stopWatch = watch(
  () => count.value,
  (newVal, oldVal) => {
    console.log('watch监听', { newVal, oldVal });
  },
  {
    immediate: true,
    deep: true
  }
);
const stopWatchEffect = watchEffect(() => {
    console.log('watchEfect监听', count.value)
},{ flush: 'pre'})
</script>

