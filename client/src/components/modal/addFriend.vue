<template>
  <Modal v-if="showModal" v-model:open="showModal" :title="state.type == 'addFriend' ? '添加好友' : '好友验证'" :footer="[]"
    :keyboard="true">
    <Segmented v-model:value="state.type" :options="state.options" />
    <div class="modal" >
      <template v-if="state.type == 'addFriend'">
        <div class="input">
          <InputSearch v-model:value.trim="state.name" :placeholder="`请输入好友名`" enter-button @search="onSearch"
            size="large" :loading="state.loading" />
        </div>
    
        <div class="friends">
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
      </template>
      <template v-else>
        <div v-if="state.verytifyList.length" v-for="item in state.verytifyList" :key="item.id">
          <div class="friends-item">
              <div class="left">
                <div>
                  <Avatar size="large" :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }">
                    {{ item.username }}
                  </Avatar>
                </div>
                <div class="left-content">
                  <span class="r20">用户id: {{ item.uid }}</span>
                  <span class="r20">昵称：{{ item.username }}</span>
                  <span class="">性别：{{ item.gender || '未知' }}</span>
                </div>
              </div>
              <div class="right">
                <div v-if="item.status==='pending'">
                  <Button @click="onPassVerytify(item.uid, 'success')" size="small" :disabled="item.status!=='pending'">通过</Button>
                  <Button danger  @click="onPassVerytify(item.uid, 'reject')" size="small" :disabled="item.status!=='pending'">拒绝</Button>
                </div>
                <div v-else>
                  <Button :disabled="true">{{ statusMap[item.status] }}</Button>
                </div>
              </div>
            </div>
        </div>
        <div v-else>
          <Empty :loading="true" />
        </div>
      </template>

    </div>


  </Modal>

</template>

<script setup lang="ts">
import { Button, InputSearch, message, Modal, Segmented, Avatar, Empty } from "ant-design-vue";
import { ref, reactive } from 'vue'
import { getUserListByName, addFriend, getVerifyFriends, passVerytifyFriend } from '@/apis/index'
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
  verytifyLoading: boolean
  options: string[]
  list: UserInfo[]
  verytifyList: any[]
}
interface UserInfo {
  username: string
  gender: string
  uid: string | number

}
const statusMap = {
  pending: '待通过',
  success: '已添加',
  reject: '已拒绝',
}

const props = defineProps<Props>()

const emit = defineEmits(['update:showModal'])

const router = useRouter();
const userStore = useUserStore()

const state = reactive<State>({
  name: '',
  type: 'addFriend',
  loading: false,
  verytifyLoading: false,
  options: ['addFriend', 'verytify'],
  list: [],
  verytifyList: []
})
const showModal = computed({
  get() {
    return props.showModal
  },
  set() {
    emit('update:showModal', false)
  }
})
let _promise = false 
watch(()=> state.type, async(value) => {
  console.log(value)
  if (value == 'addFriend') {
    
  } else {
    if (_promise) return
    _promise = true
     await onVerifyFriends()
    _promise = false
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

const onVerifyFriends = async() => {
  const res: any = await getVerifyFriends({}) 
  state.verytifyList = res
}

const onPassVerytify = async(fid: number, flag:string) => {
  state.verytifyLoading = true
  const { msg='', status=0 } = await passVerytifyFriend({fid, status: flag})
  if (status) {
    message.success(msg)
  } else {
    message.error(msg)
  }
  state.verytifyLoading = false
  onVerifyFriends()
}

const changeTxt = (str: string): string => {
  if (!state.name) return str;
  const reg = new RegExp(`(${state.name})`, 'gi');
  return str.replace(reg, '<em>$1</em>');
};

onMounted(() => {
  onVerifyFriends()
})


</script>

<style scoped lang="less">
.input {
  margin-top: 2vh;
}
.modal {
  min-height: 50vh;
  padding: 2vh 0;
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
    font-size: 12px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    &:hover {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
      
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