import http from '@/utils/request/index'


const updateInfo = (data: any) => http.post({url:'/sse/update', data})


export {
  updateInfo
}