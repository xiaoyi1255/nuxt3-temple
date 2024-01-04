<template>
  <Modal v-if="showModal" v-model:open="showModal" :title="props.type==='create' ? '创建五子棋房间':'加入五子棋房间'" :keyboard="true" @ok="submit">
    <div>
      <Input v-model:value="state.roomId"></Input>
    </div>
  </Modal>

</template>

<script setup lang="ts">
import {  message, Modal, Input } from "ant-design-vue";
import { debounce } from "@/utils/function";
import { createFiveLiveRoom, joinFiveLiveRoom } from '@/apis/fiveLive'

interface Props {
  showModal: boolean
  type: 'create' | 'join'
}
const emit = defineEmits(['update:showModal'])
const props = defineProps<Props>()
const router = useRouter()

const state = reactive({
  roomId: ''
})
const showModal = computed({
  get() {
    return props.showModal
  },
  set() {
    emit('update:showModal', false)
  }
})

const submit = debounce(async() => {
  console.log(state.roomId)
  if (!state.roomId) {
    message.error('请输入房间号！！')
  }
  const query = {
    roomId: state.roomId,
    t: +new Date(),
    isCreate: false,
    curPlayer: 'B'
  }
  if (props.type === 'create') {
    const {code=-1, msg=''} = await createFiveLiveRoom({roomId: state.roomId})
    query.isCreate = true
    if (code===0) {
      message.success(msg)
      openRoom(query)
    }
  } else {
    const {code=-1, msg=''} = await joinFiveLiveRoom({roomId: state.roomId})
    query.isCreate = false
    if (code===0) {
      message.success(msg)
      query.curPlayer = 'W'
      openRoom(query)
    }
  }
  

}, 200)

const openRoom = (query={}) => {
  router.push({
    path:'/gobang',
    query: {
      type: 'join',
      ...query
    }
  })
}
onMounted(() => {
})
</script>

<style scoped lang="less">

</style>