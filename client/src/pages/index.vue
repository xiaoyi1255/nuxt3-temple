<template>
    <div class="chat">
      <Chat />
    </div>
  </template>

<script setup>
useHead({
  titleTemplate: 'chat', // 可以写模板
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  charset: 'utf-8',
  meta: [
    { name: 'description', content: 'chat' }
  ],
  // body添加类名
  bodyAttrs: {
    class: 'test'
  }
})

</script>
<style>
.chat {
  display: flex;
  align-items: center;
  justify-content: center;
  /* flex-direction: column; */
  margin: 10vh 0;
}

</style>