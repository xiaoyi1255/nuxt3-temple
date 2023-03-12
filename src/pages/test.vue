<template>
  <h1 @click="submit(false)">發送郵件</h1>
  <h1 @click="submit(true)">發送定時郵件</h1>
</template>
<script setup lang="ts">
async function submit(isSetTimeout: boolean) {
  const path = isSetTimeout ? "/api/sendEmailv2" : "/api/sendEmail";
  const res = await useFetch(path, {
    method: "POST",
    params: {
      name: "小易",
      job: "前端",
    },
  });
  console.log(res);
}
</script>