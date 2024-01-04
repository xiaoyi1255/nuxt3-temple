import { defineStore } from 'pinia';
import { store } from '@/store/helper'
import { getallFriends } from '@/apis/index'


// 定义状态类型
interface State {
  isLogin: boolean;
  userInfo: UserInfo;
  friends: {
    allFriends: FriendItem[]
    passFriends: FriendItem[]
    pendingFriens: FriendItem[]
    rejectFriends: FriendItem[]
  }
}

interface UserInfo {
  username: string
  gender?: string
  uid: string | number

}
interface FriendItem {
  username: string
  gender?: string
  uid: string | number
  status: 'reject' | 'success' | 'pending'

}

export const useUserStore = defineStore('user', {
  state:():State =>({
    isLogin: false,
    userInfo: {
      username: '',
      uid: ''
    },
    friends: {
      allFriends: [],
      passFriends: [],
      pendingFriens: [],
      rejectFriends: [],
    }
  }),
  getters: {

  },
  actions: {
    setUserInfo(info: any){
        this.userInfo = info
    },
    setFriends(info: FriendItem[]){
      this.friends.allFriends = info
      const passFriends = info.filter(item => item.status==='success')
      const reject = info.filter(item => item.status==='reject')
      this.friends.passFriends = passFriends
      this.friends.rejectFriends = reject
    },
    async getallFriends(){
      const res = await getallFriends({})
      this.setFriends(res?.friends)
    }
  }
});

export function useUserInoWithout() {
    return useUserStore(store)
}
