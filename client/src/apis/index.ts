import http from '@/utils/request/index'
import { tokenService } from '@/utils/auth'

enum urls  {
  login = '/user/login',
  register='/user/register',
  addFriend = '/user/addFriend',
  getVerifyFriends = '/user/getVerifyFriends',
  passVerytifyFriend = '/user/passVerytifyFriend',
  getUserList = '/user/getUserList',
  getAllRoomInfo= '/getAllRoomInfo',
  refreshToken = '/user/refreshToken',
  getUserListByName='/user/getUserListByName',
  verifyCode="/verifyCode",
  getallFriends="/user/getallFriends",
  getUserInfoById="/user/getUserInfoById",
  createRoom="/createRoom"
}

interface LoginRes {
  code: number
  msg?: string
  userInfo: any
}

// 刷新token
const refreshToken = async(): Promise<boolean> => {
  const token = tokenService.refreshToken
  const { code } = await http.post({url: urls.refreshToken, headers: {'refresh-token': token}})
  return code === 0
}
// 登录
const onLogin = (data:any): Promise<T> => http.post({url: urls.login, data})
const onRegister = (data:any): Promise<T> => http.post({url: urls.register, data})
// 获取所有房间信息
const getAllRoomInfo = (data:any) => http.get({url: urls.getAllRoomInfo, data})
// 添加好友
const addFriend = (data:any) => http.post({url: urls.addFriend, data})
const getUserList = (data:any) => http.post({url: urls.getUserList, data})
const getUserListByName = (data:any) => http.post({url: urls.getUserListByName, data})

const verifyCode = (data:any) => http.get({url: urls.verifyCode, data})
const getVerifyFriends = (data:any) => http.post({url: urls.getVerifyFriends, data})
const passVerytifyFriend = (data:any) => http.post({url: urls.passVerytifyFriend, data})

const getallFriends = (data:any) => http.post({url: urls.getallFriends, data})
const createRoom = (data:any) => http.post({url: urls.createRoom, data})
const getUserInfoById = (data:any) => http.post({url: urls.getUserInfoById, data})

export  {
  onLogin,
  getAllRoomInfo,
  refreshToken,
  addFriend,
  getUserList,
  getUserListByName,
  onRegister,
  verifyCode,
  getVerifyFriends,
  passVerytifyFriend,
  getallFriends,
  createRoom,
  getUserInfoById,
}