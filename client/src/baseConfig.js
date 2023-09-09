let dev = process.dev == true
const config = {
    baseUrl: 'http://118.89.125.27:3000',
    baseWsUrl: 'ws://118.89.125.27:3000',
    wechatBaseUrl: 'http://118.89.125.27:3002'
}

if (dev) {
    config.baseUrl = 'http://localhost:3000'
    config.baseWsUrl = 'ws://localhost:3000'
}
export {
    config,
}
