<template>
<Button @click="openMessage">打开全局提示</Button>

</template>

<script setup lang="ts">
import { message, Button } from "ant-design-vue";
// message.config({
//     duration: 2,
//     maxCount: 2,
//     rtl: true,
//     prefixCls: '_message_'

// })

const openMessage = () => {
    message.success('什么？老板说杀个程序员去祭天？', 15)
}
</script>

<style>
/* ._message_{
	left: 0;
} */

</style>