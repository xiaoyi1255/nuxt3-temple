// plugins/fetch-interceptors.client.ts
import type { FetchOptions } from 'ofetch'
import { config } from '@/baseConfig'
export default defineNuxtPlugin(() => {
  const originFetch = $fetch

  Object.defineProperty(window, '$fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return (request: string, opts: FetchOptions = {}) => {
        return new Promise(async (resolve, reject) => {
          // 如果不是请求接口的话就直接放过
          if (!request.includes('/api')) {
            const token = localStorage.getItem('token')
            const _headers = opts.headers
            opts.headers = {
              ..._headers,
              authorization: token || '',
            }
            const originReqPromise = originFetch(request, opts)
            // resolve(originReqPromise)
            originReqPromise.then(async res => {
              console.log(res, 'res')
              const { code } = res
              if (code == 401) { // token 过期
                // 重新请求
                const refreshToken = localStorage.getItem('refreshToken')
                if (refreshToken) {
                  // 使用 自带 fetch 进行刷新token
                  window.fetch(config.baseUrl + '/user/refreshToken', {
                    method: 'POST',
                    headers: {
                      authorization: refreshToken
                    }
                  }).then(response => { // 接收到的是 ReadableStream
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.text();
                  }).then(refreshRes => {
                    const { code, token, msg } = JSON.parse(refreshRes)
                    console.log(refreshRes, code)
                    if (code === 0 && token) {
                      localStorage.setItem('token', token)
                      const _headers = opts.headers
                      opts.headers = {
                        ..._headers,
                        authorization: token || '',
                      }
                      return resolve(originFetch(request, opts))
                    } else {
                      location.href = location.origin + '/login'
                    }
                  })
                } else { // 必须重新登录
                  location.href = location.origin + '/login'
                }
              } else {
                resolve(originReqPromise)
              }
            }).catch(err => {
              console.log(err)
            })

          } else {
            console.log(11)
          }
          // 处理请求逻辑
        })
      }
    }
  })
})
