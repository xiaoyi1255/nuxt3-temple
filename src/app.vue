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