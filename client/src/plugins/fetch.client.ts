// plugins/fetch-interceptors.client.ts
import type { FetchOptions } from 'ofetch'
import { config } from '@/baseConfig'
export default defineNuxtPlugin(() => {
    const originFetch = $fetch

    Object.defineProperty(window, '$fetch', {
        configurable: true,
        enumerable: true,
        get(){
            return (request: string, opts: FetchOptions = {}) => {
                return new Promise(async (resolve, reject) => {
                    // 如果不是请求接口的话就直接放过
                    if (!request.includes('/api')) {
                        const token = localStorage.getItem('token')
                        const _headers = opts.headers
                        opts.headers = {
                            authorization: token || '',
                            ..._headers
                        }
                        const originReqPromise = originFetch(request, opts)
                        originReqPromise.then(async res => {
                            const { code } = res
                            if (code == 401) { // token 过期
                                // 重新请求
                                const refreshToken = localStorage.getItem('refreshToken')
                                if (refreshToken) {
                                    const {code, token, msg} = await fetch(config.baseUrl + '/user/refreshToken',{
                                        method: 'POST',
                                        headers: {
                                            authorization: refreshToken
                                        }
                                    })
                                    if (code===0 && token) {
                                        localStorage.setItem('token', token)
                                        const _headers = opts.headers
                                        opts.headers = {
                                            authorization: token || '',
                                            ..._headers
                                        }
                                        return resolve(originFetch(request, opts))
                                    }
                                    reject(originReqPromise)
                                    location.href = location.origin + '/login'
                                } else { // 必须重新登录
                                    reject(originReqPromise)
                                    location.href = location.origin + '/login'
                                }
                            }
                        })
                        resolve(originReqPromise)
                        
                    } else {
                        console.log(11)
                    }
                    // 处理请求逻辑
                })
            }
        }
    })
})
