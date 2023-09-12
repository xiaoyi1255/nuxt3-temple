<template>
  <Modal v-if="showModal" v-model:open="showModal" :title="state.type == '好友' ? '添加好友' : '添加群聊'" :footer="null"
    :keyboard="true">
    <Segmented v-model:value="state.type" :options="state.options" />
    <div class="input">
      <InputSearch v-model:value.trim="state.name" :placeholder="`请输入${state.type}名`" enter-button @search="onSearch"
        size="large" :loading="state.loading" />
    </div>

    <div class="friends" v-if="state.type == '好友'">
      <div v-for="(item, index) in state.list" :key="item.uid">
        <div class="friends-item">
          <div class="left">
            <div>用户：{{ index }}</div>
            <span class="r20">昵称：<span v-html="changeTxt('' + item.username)"></span></span>
            <span class="">性别：{{ item.gender || '未知' }}</span>
          </div>
          <div class="right">
            <Button>添加</Button>
          </div>
        </div>
      </div>

    </div>
    <div v-else>

    </div>
  </Modal>
</template>

<script setup lang="ts">
import { Button, InputSearch, message, Modal, InputNumber, Segmented } from "ant-design-vue";
import { statisticToken } from "ant-design-vue/es/theme/internal";
import { ref, reactive } from 'vue'
import { getUserList, addFriend } from '@/apis/index'
interface Props {
  showModal: boolean
}

const props = defineProps<Props>()

const emit = defineEmits(['update:showModal'])

const state = reactive({
  name: '',
  showModal: false,
  type: '好友',
  loading: false,
  options: ['好友', '群组'],
  list: []
})
const showModal = computed({
  get() {
    return props.showModal
  },
  set() {
    emit('update:showModal', false)
  }
})
const onSearch = async (value: string) => {
  state.loading = true
  try {
    const res = await getUserList({ name: value })
    state.loading = false
    state.list = res

  } catch (error) {
    state.loading = false

  }
}

const changeTxt = (str: string): string => {
  if (!state.name) return str;
  const reg = new RegExp(`(${state.name})`, 'gi');
  const transTxt = str.replace(reg, '<em>$1</em>');
  console.log(transTxt);
  return transTxt;
};


</script>

<style scoped lang="less">
.input {
  margin-top: 2vh;
}

.friends {
  height: 40vh;
  overflow-y: scroll;
  margin-top: 2vh;
  border-radius: 2vh;
  border: 1px solid #d8d7d7;
  &::-webkit-scrollbar{
    display: none;
    width: 0;
  }
  ::v-deep em {
    color: aquamarine;
    font-weight: 700;
    font-size: 16px;
    font-style: normal;
  }

  &-item {
    padding: 1vh 1vh;
    margin-bottom: 1.5vh;
    border-radius: 1vh;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
      
    }
  }
}
.r20 {
  margin-right: 20px;
}
</style>