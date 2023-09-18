let dev = process.dev == true
const config = {
    baseUrl: 'http://118.89.125.27:3001',
    baseWsUrl: 'ws://118.89.125.27:3001',
    wechatBaseUrl: 'http://118.89.125.27:3002'
}

if (dev) {
    config.baseUrl = 'http://localhost:3001'
    config.baseWsUrl = 'ws://localhost:3001'
}
export {
    config,
}
