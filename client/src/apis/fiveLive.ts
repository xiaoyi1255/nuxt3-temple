import http from '@/utils/request/index'

// 创建五子棋房间
const createFiveLiveRoom = (data:any) => http.post({url: '/game/createFiveLineRoom', data})

// 加入房间
const joinFiveLiveRoom = (data:any) => http.post({url: '/game/joinFiveLiveRoom', data})


export {
  createFiveLiveRoom,
  joinFiveLiveRoom,
}