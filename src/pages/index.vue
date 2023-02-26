<template>
  <div>
    <ListButton />
  </div>
</template>

<script lang="ts" setup>
const res = await $fetch("/api/user");
console.log(res) // {"code": 200, "data": { "name": "xiaoyi"} }
</script>