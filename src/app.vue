<template>
	<div>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>
<script setup>
import { onMounted } from 'vue';
import { flexible } from './utils/index'

onMounted(() => {
	flexible(window, document)
})
</script>
<style>
body {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 300px;
}
</style>