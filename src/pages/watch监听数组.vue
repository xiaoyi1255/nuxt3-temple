<template>
    <h1 v-for="item in state.frond" :key="item">{{ item }}</h1>
</template>

<script setup lang="ts">
const state = reactive({
    frond: ['HTML', 'CSS', 'JavaScript'],
    str: 0
})
watch(()=> state.frond, (val, oldVal) => {
    console.log('watch 监听：', {val, oldVal})
}, {
    deep: false
})
let index = 0
setInterval(() => {
    state.frond.push('Nuxt3' + index++)
    state.str = index
}, 1000)

watchEffect(() => {
    console.log('watchEffect', state.str)

})
</script>