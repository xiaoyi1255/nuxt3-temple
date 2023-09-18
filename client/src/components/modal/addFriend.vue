<template>
  <Modal v-if="showModal" v-model:open="showModal" :title="state.type == '好友' ? '添加好友' : '添加群聊'" :footer="[]"
    :keyboard="true">
    <Segmented v-model:value="state.type" :options="state.options" />
    <div class="input">
      <InputSearch v-model:value.trim="state.name" :placeholder="`请输入${state.type}名`" enter-button @search="onSearch"
        size="large" :loading="state.loading" />
    </div>

    <div class="friends" v-if="state.type == '好友'">
      <div v-if="state.list.length" v-for="(item, index) in state.list" :key="item.uid">
        <div class="friends-item">
          <div class="left">
            <div>
              <Avatar size="large" :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }">
                {{ item.username }}
              </Avatar>
            </div>
            <div class="left-content">
              <span class="r20">昵称：<span v-html="changeTxt('' + item.username)"></span></span>
              <span class="">性别：{{ item.gender || '未知' }}</span>
            </div>
          </div>
          <div class="right">
            <Button @click="onAddFriend(item)">添加</Button>
          </div>
        </div>
      </div>
      <Empty v-else />

    </div>
    <div v-else>

    </div>

  </Modal>

</template>

<script setup lang="ts">
import { Button, InputSearch, message, Modal, Segmented, Avatar, Empty } from "ant-design-vue";
import { ref, reactive } from 'vue'
import { getUserListByName, addFriend } from '@/apis/index'
import { useUserStore } from "@/store/userStore";
import { useRouter } from "nuxt/app";
import { userInfoService } from '@/utils/auth'
interface Props {
  showModal: boolean
}
interface State {
  name: string
  type: string
  loading: boolean
  options: string[]
  list: UserInfo[]
}
interface UserInfo {
  username: string
  gender: string
  uid: string | number

}

const props = defineProps<Props>()

const emit = defineEmits(['update:showModal'])

const router = useRouter();
const userStore = useUserStore()

const state = reactive<State>({
  name: '',
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
    const res = await getUserListByName({ username: value }) as unknown as Item[]
    state.loading = false
    console.log(res)
    state.list = res

  } catch (error) {
    state.loading = false
  }
}

const onAddFriend = async(item: UserInfo) => {
  // console.log(userStore.userInfo)
  const userInfo = JSON.parse(userInfoService.userInfo || '{}')
  if (!userInfo.uid) {
    message.error('请进行登录')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
  const query = {
    friendId: item.uid
  }
  const { status='', msg=''} = await addFriend(query)
  if (status) {
    switch (status) {
      case 'success':
        message.success('你们已经是好友关系')
        break;
        default:
        message.info('你与'+ item.username + '关系状态为：' + status)
        break;
    }
    return
  }
  message.warning(msg)
}

const changeTxt = (str: string): string => {
  if (!state.name) return str;
  const reg = new RegExp(`(${state.name})`, 'gi');
  return str.replace(reg, '<em>$1</em>');
};


</script>

<style scoped lang="less">
.input {
  margin-top: 2vh;
}

.friends {
  font-size: 12px;
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
    .left {
      display: flex;
      align-items: center;
      &-content {
        display: flex;
        flex-direction: column;
        margin-left: 1vh;

      }
    }
  }
}
.r20 {
  margin-right: 20px;
}
</style>