<template>
  <Modal v-if="showModal" v-model:open="showModal" :title="state.status == 'pass' ? '好友列表' : '黑名单'" :footer="[]"
    :keyboard="true">
    <Segmented v-model:value="state.status" :options="state.options" />
    <div class="modal" >
    </div>

    <div v-if="state.status == 'pass'" class="friends">
      <div v-if="passFriends.length" v-for="item in passFriends" :key="item.uid">
          <div class="friends-item">
              <div class="left">
                <div>
                  <Avatar size="large" :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }">
                    {{ item.uid }}
                  </Avatar>
                </div>
                <div class="left-content">
                  <span class="r20">用户id: {{ item.uid }}</span>
                  <!-- <span class="r20">昵称：{{ item.username }}</span> -->
                  <!-- <span class="">性别：{{ item.gender || '未知' }}</span> -->
                </div>
              </div>
              <div class="right" @click="onChatHandle(item)">
                <CommentOutlined />
              </div>
                
            </div>
        </div>
        <div v-else>
          <Empty :loading="true" />
        </div>
    </div>
    <div v-else class="friends">
      <div v-if="rejectFriends.length" v-for="item in rejectFriends" :key="item.uid">
          <div class="friends-item">
              <div class="left">
                <div>
                  <Avatar size="large" :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }">
                    {{ item.uid }}
                  </Avatar>
                </div>
                <div class="left-content">
                  <span class="r20">用户id: {{ item.uid }}</span>
                  <!-- <span class="r20">昵称：{{ item.username }}</span>
                  <span class="">性别：{{ item.gender || '未知' }}</span> -->
                </div>
              </div>
              <div class="right"> </div>
            </div>
        </div>
        <div v-else>
          <Empty :loading="true" />
        </div>
    </div>

  </Modal>

</template>

<script setup lang="ts">
import {  message, Modal, Segmented, Empty, Avatar } from "ant-design-vue";
import { CommentOutlined } from "@ant-design/icons-vue";
import { useUserStore } from "@/store/userStore";
import { createRoom } from '@/apis/index'
import { userInfoService } from '@/utils/auth'

interface Props {
  showModal: boolean
}
const emit = defineEmits(['update:showModal'])
const props = defineProps<Props>()
const router = useRouter()

const userStore = useUserStore()

const state = reactive({
  status: 'pass',
  options: ['pass', 'reject'],
})
const passFriends = computed(()=>userStore.friends.passFriends)
const rejectFriends = computed(()=>userStore.friends.rejectFriends)

const showModal = computed({
  get() {
    return props.showModal
  },
  set() {
    emit('update:showModal', false)
  }
})
watch(()=> state.status, () => {
  userStore.getallFriends()
})

const onChatHandle = async(item) => {
  const userInfo = JSON.parse(userInfoService.userInfo || '{}')
  const query = {
    roomId: item.roomId,
    name: userInfo?.username || '未知用户',
    id: +new Date(),
    password: '',
    uid: item.uid,
    roomType: 'friendRoom',
  }
  const { code=-1, msg='' } = await createRoom({...query})
  if (code === 0) {
    // message.success(msg)
    openRoom(query)
  } else {
    message.error(msg)
  }
}

const openRoom = (query={}) => {
  router.push({
    path:'/chat',
    query: {
      ...query,
      type: 'join',
    }
  })
}
onMounted(() => {
  userStore.getallFriends()
})
</script>

<style scoped lang="less">
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
    .right {
      font-size: 22px;
      cursor: pointer;
      &:hover {
        color: aquamarine;
      }
    }
  }
}
</style>