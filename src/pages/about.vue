<template>
  <div>
    <div>count: {{ count }}</div>
    <button @click="count++">修改 count</button>
    <button @click="effectCb">手动触发effect</button>
    <button @click="effectCb.effect.stop">停止监听effect</button>
  </div>
</template>

<script lang="ts" setup>
let num = 0;
const count = ref(0);
const effectCb = effect(() => {
  console.log("effect 回调执行", ++num);
  return count.value * 2;
});
</script>
