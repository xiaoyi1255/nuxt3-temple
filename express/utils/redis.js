const Redis = require('ioredis');
const redisConfig = {
    host: '118.89.125.27', // Redis服务器主机地址
    port: 6379, // Redis 服务器端口
    password: 'xiaoyi', // 密码
}
if (process?.argv?.[3] === 'dev') {
    redisConfig.host='localhost'
    console.log('dev 环境')
}
class RedisClient {
	constructor() {
		this.redis = new Redis(redisConfig);
	}

	async set(key, value) {
		await this.redis.set(key, value);
	}
	async setEX(key, value, time=60*60*24*7) {
		await this.redis.set(key, value, 'EX', time);
	}

	async get(key) {
		return await this.redis.get(key);
	}

	async clear(){
        return await this.redis.flushall()
    }

	async getAllKeys (){
		return await this.redis.keys('*')
	}

	async del(key){
		return await this.redis.del(key)
	}

	async ttl(key) {
		return this.redis.ttl(key)
	}

	async close() {
		await this.redis.quit();
	}
}

class RoomListCkient extends RedisClient {
    _key=''
    map=new Map()
    constructor(key) {
        super()
        this._key = key
         this.get2Map('roomList').then(res => {
            this.map=res
         })
	}
    get size() {
        return this.map.size
    }
	async get2Map() {
		const value = await this.redis.get(this._key);
		if (value) {
			const mapData = JSON.parse(value);
			const mapFromRedis = new Map(mapData);
			console.log('Map from Redis:', mapFromRedis);
			return mapFromRedis;
		} else {
			console.log('Map not found in Redis. key:', this._key);
			return new Map();
		}
	}
    async get2MapByKey(key){
        return (await this.get2Map()).get(+key)
    }


	async set2Map(value= new Map(), day = 30) {
        this.map = value
        console.log('set ', JSON.stringify(value))
		await this.redis.set(
			this._key,
			JSON.stringify([...value]),
			'Ex',
			day * 60 * 60 * 24
		);
	}

}

module.exports = new RoomListCkient('roomList');
