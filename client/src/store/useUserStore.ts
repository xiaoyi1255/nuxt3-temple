// import { defineStore } from 'pinia';
// import { reactive } from 'vue';
// // 定义状态类型
// interface State {
//   isLogin: boolean;
//   token: string;
//   userInfo: any;
// }

// export const useUserStore = defineStore('userInfo', () => {
//   const state: State = reactive({
//     isLogin: false,
//     token: '',
//     userInfo: {}
//   });

//   const setState = <K extends keyof State>(key: K, val: State[K]) => {
//     state[key] = val;
//   };

//   return {
//     state,
//     setState
//   };
// });
