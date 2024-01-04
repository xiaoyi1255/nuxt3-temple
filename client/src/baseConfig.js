let dev = process.dev == true
const config = {
    baseUrl: 'http://118.89.125.27:3001/api',
    sourceUrl: 'http://118.89.125.27:3001',
    baseWsUrl: 'ws://118.89.125.27:3001/api',
    wechatBaseUrl: 'http://118.89.125.27:3002'
}

if (dev) {
    config.baseUrl = 'http://localhost:3001/api'
    config.sourceUrl = 'http://localhost:3001'
    config.baseWsUrl = 'ws://localhost:3001/api'
}
export {
    config,
}
