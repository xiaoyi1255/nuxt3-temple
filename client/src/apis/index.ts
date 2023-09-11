import http from '@/utils/request/index'
import { tokenService } from '@/utils/auth'

enum urls  {
  login = '/user/login',
  getAllRoomInfo= '/getAllRoomInfo',
  refreshToken = '/user/refreshToken',
}

interface LoginRes {
  code: number
  msg?: string
  userInfo: any
}

const refreshToken = async(): Promise<boolean> => {
  const token = tokenService.refreshToken
  const { code } = await http.post({url: urls.refreshToken, headers: {'refresh-token': token}})
  return code === 0
}

const onLogin = (data:any): Promise<T> => http.post({url: urls.login, data})

const getAllRoomInfo = (data:any) => http.get({url: urls.getAllRoomInfo, data})

export  {
  onLogin,
  getAllRoomInfo,
  refreshToken,
}