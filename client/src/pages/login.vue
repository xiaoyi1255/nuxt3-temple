<template>
  <Login />
</template>
<script setup>
useHead({
    titleTemplate: '登录 | 注册', // 可以写模板
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