let dev = false

const config = {
    baseUrl: 'http://118.89.125.27:3000',
    baseWsUrl: 'ws://118.89.125.27:3000'
}
if (dev) {
    config.baseUrl = 'http://localhost:3000'
    config.baseWsUrl = 'ws://localhost:3000'
    
}
export {
    config
}