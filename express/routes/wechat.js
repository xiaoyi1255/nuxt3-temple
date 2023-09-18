const { parseString } = require('xml2js');
const express = require('express');
const jsSHA = require('jssha');
const router = express.Router();
const redisCkient = require('../utils/redis');
const db = require('../utils/mysql'); // 导入MySQL类
const { SERET_KEY, REFRESH_KEY } = require('./../config')
const jwt = require('jsonwebtoken');

router.get('/wechat', (req, res, next) => {
	const token = 'xiaoyi1255';
	//1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
	const { signature, timestamp, nonce, echostr } = req.query;
	console.log(req.query);
	//2.将token、timestamp、nonce三个参数进行字典序排序
	const array = [token, timestamp, nonce].sort();

	//3.将三个参数字符串拼接成一个字符串进行sha1加密
	const tempStr = array.join('');
	const shaObj = new jsSHA('SHA-1', 'TEXT');
	shaObj.update(tempStr);
	const scyptoString = shaObj.getHash('HEX');

	//4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	console.log('signature', signature);
	console.log('scyptoString', scyptoString);
	if (signature === scyptoString) {
		console.log('验证成功');
		res.send(echostr);
	} else {
		console.log('验证失败');
		res.send('验证失败');
	}
});

router.post('/wechat', function (req, res) {
	var buffer = [];
	req.on('data', function (data) {
		buffer.push(data);
	});
	// 内容接收完毕
	req.on('end', function () {
		var msgXml = Buffer.concat(buffer).toString('utf-8');
		parseString(msgXml, { explicitArray: false }, async function (err, result) {
			if (err) throw err;
			result = result.xml;
			const { ToUserName, FromUserName, MsgType, Content } = result;
			if (MsgType === 'text' && Content === '登录') {
				const code = randomCode();
				// 5分钟有效期
				// 这里的FromUserName就是用户的OpenID
				await redisCkient.setEX(code, FromUserName, 60 * 5);
				const sendXml = sendTextMsg(
					ToUserName,
					FromUserName,
					`您的登录验证码是：${code}  ,  有效期为5分钟`
				);
				res.send(sendXml);
			}
		});
	});
});

// 验证成功就去注册+登录
router.get('/verifyCode', async function (req, res) {
	const { code } = req.query;
	const OpenID = await redisCkient.get(code);
	if (OpenID) {
		const sql = `SELECT username,uid,gender,did FROM user_table WHERE did = ? `
		const queryhasUser = await db.query(sql, [OpenID])
		if (!queryhasUser.length) {
			// 注册并登录
			const user = {
				username: `user${code}`,
				did: OpenID,
				uid: code,
				gender: ''
			}
			const inset_sql = `INSERT INTO chat.user_table (did, username, password) VALUES (?, ?,?)`
        console.log(inset_sql)
        const results = await db.query(inset_sql, [user.did, user.username, 123456])
				if (results.affectedRows === 1) {
          console.log('Insertion successful.');
					createJwt(user, res)
					res.json({
						code: 0,
						data: { 
							userInfo: user,
							msg: "登录成功！！！"
						}
					})
        }
		} else {
			// const token = '使用OpenID进行jwt鉴权颁发Token';
			const user = {
				username: queryhasUser[0]?.username,
				did: queryhasUser[0]?.did,
				uid: queryhasUser[0]?.uid,
				gender: queryhasUser[0]?.gender,
			}
			createJwt(user, res)
			res.json({
				code: 0,
				data: { 
					userInfo: queryhasUser[0],
					msg: '登录成功！'
				 }
			});
		}
	} else {
		res.json({
			code: 400,
			msg: '您输入的验证码有误或已过期，请重新输入！-_-'
		});
	}
});

/**
 * 随机6位验证码
 */
function randomCode() {
	return Math.random().toString().slice(-6);
}
/**
 * 回复文字消息封装
 */
function sendTextMsg(toUser, fromUser, content) {
	let resultXml =
		'<xml><ToUserName><![CDATA[' + fromUser + ']]></ToUserName>';
	resultXml += '<FromUserName><![CDATA[' + toUser + ']]></FromUserName>';
	resultXml += '<CreateTime>' + new Date().getTime() + '</CreateTime>';
	resultXml += '<MsgType><![CDATA[text]]></MsgType>';
	resultXml += '<Content><![CDATA[' + content + ']]></Content></xml>';
	return resultXml;
}

function createJwt(user, res) {
	const token = jwt.sign(user, SERET_KEY, { expiresIn: '1h' });
	const refreshToken = jwt.sign(user, REFRESH_KEY, { expiresIn: '7d' });
	res.setHeader('token', token)
	res.setHeader('refresh-token', refreshToken)
}

module.exports = router;
