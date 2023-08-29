<template>
	<div>
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>
<script setup>
import { message } from 'ant-design-vue'

message.config({
	duration: 2,
	maxCount: 2,
	rtl: true,
	prefixCls: '_message_'

})
</script>

<style>
@import url(./assets/style/mixin.less);
._message_{
	left: 0;
}
body {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>