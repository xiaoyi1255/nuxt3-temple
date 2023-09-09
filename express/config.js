// 静态资源强制缓存
const MAX_AGE = 1000 * 60 * 60 * 24 * 7;
// 白名单
const WHITE_LIST = ['118.89.125.27', 'localhost'];
// 心跳检测时间
const HEART_TIME = 1000 * 5;
// secretKey
const SERET_KEY = 'xiaoyi-1255'
module.exports = {
	MAX_AGE,
	WHITE_LIST,
	HEART_TIME,
	SERET_KEY,
};
