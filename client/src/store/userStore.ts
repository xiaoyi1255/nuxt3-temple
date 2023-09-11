import { defineStore } from 'pinia';
import { store } from '@/store/helper'

// 定义状态类型
interface State {
  isLogin: boolean;
  userInfo: any;
}

export const useUserStore = defineStore('user', {
  state:():State =>({
    isLogin: false,
    userInfo: {}
  }),
  getters: {

  },
  actions: {
    setUserInfo(info: any){
        this.userInfo = info
    }
  }
});

export function useUserInoWithout() {
    return useUserStore(store)
}
