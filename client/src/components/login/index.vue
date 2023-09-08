<template>
    <Tabs v-model:activeKey="activeKey" :size="size">
      <TabPane key="login" tab="登录">
        <div class="login">
          <FormCom :checkType="'login'" />
        </div>
      </TabPane>
      <TabPane key="register" tab="注册">
        <div class="register">
          <FormCom :checkType="'register'" />
        </div>
      </TabPane>
    </Tabs>
</template>
<script lang="ts" setup>
import { TabPane,Tabs } from 'ant-design-vue';
import FormCom from '@/components/login/Form.vue'

</script>
