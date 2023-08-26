const redisClient = require('./redis')

redisClient.set('nweKey', '{}')
redisClient.getAllKeys().then(res => {
    console.log(res, 111)
})
redisClient.ttl('roomList').then(res => {
    console.log(res, 111)
})
