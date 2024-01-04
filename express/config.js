// 静态资源强制缓存
const MAX_AGE = 1000 * 60 * 60 * 24 * 7;
// 白名单
const WHITE_LIST = ['118.89.125.27', 'localhost', '192.168.1.6', 'xiaoyi.pub'];
// 心跳检测时间
const HEART_TIME = 1000 * 5;
// secretKey
const SERET_KEY = 'xiaoyi-token'
// refreshkey
const REFRESH_KEY = 'xiaoyi-refresh'

// 五子棋key前缀
const ROOMID_PRE = 'fiveLine:'
module.exports = {
	MAX_AGE,
	WHITE_LIST,
	HEART_TIME,
	SERET_KEY,
	REFRESH_KEY,
	ROOMID_PRE,
};
