import axios, { type AxiosResponse, type AxiosError } from 'axios'
import { message } from 'ant-design-vue'

import { tokenService } from '@/utils/auth'
import { refreshToken } from '@/apis/index'
import { config } from '@/baseConfig'

const service = axios.create({
  baseURL: config.baseUrl,
  withCredentials: false,
})

// 请求拦截
service.interceptors.request.use(
  (config) => {
    const token = tokenService.token
    if (token) config.headers.token = token
    return config
  },
  (error) => {
    return Promise.reject(error.response)
  },
)
// 响应拦截
service.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (response.headers['token']) {
      tokenService.setToken(response.headers['token'])
    }
    if (response.headers['refresh-token']) {
      tokenService.setRefreshToken(response.headers['refresh-token'])
    }
    if (response.status === 200) {
      return response
    } else {

      throw new Error(response.status.toString())
    }
  },
  async (responseErr: AxiosError) => {
    const status = responseErr.response?.status
    const msg = responseErr.response?.data?.msg || ''
    switch (status) {
      case 401: // "Unauthorized"
        // 做换取token操作
        const originRequestConf = responseErr.config
        if (tokenService.refreshToken) { // 存在refreshToken 
          const isSuceess = await refreshToken()
          console.log('刷新Token成功: ', isSuceess)
          if (isSuceess && originRequestConf) {
            originRequestConf.headers['refreshtoken'] = tokenService.refreshToken
            // 重新发一次原来的请求
            return service(originRequestConf)
          }
        }
        message.error(msg)
        location.href = location.origin + '/login'
        return Promise.reject(responseErr)
    
      default:
        return Promise.reject(responseErr)
    }
  },
)

export default service
