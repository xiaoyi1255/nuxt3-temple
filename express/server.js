const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors'); // 导入 cors 中间件
const uploadRoutes = require('./routes/upload.js');
const wechatRoutes = require('./routes/wechat.js');
const userRouters = require('./routes/user.js');
const path = require('path');
const {auth} = require('./middleware/auth.js')
const redisCkient = require('./utils/redis');
const { MAX_AGE, WHITE_LIST, HEART_TIME } = require('./config.js');


let roomMap = new Map();
redisCkient.get2Map().then((res) => {
	roomMap = res || new Map();
});
app.use(express.json());
// 托管静态文件
app.use(
	'/static',
	express.static(path.join(__dirname, './public'), {
		maxAge: MAX_AGE
	})
); // 图片文件夹路径
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Expose-Headers', "token, refresh-token");
  next(); // 让请求继续到下一个中间件或路由处理程序
});
// 创建 HTTP 服务器
const server = http.createServer(app);
// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ noServer: true });

wsHandles(); // websocket 监听器

app.use('/upload', uploadRoutes);
app.use('', wechatRoutes);
app.use('/user', userRouters);

// 在 Express 中处理除了 /ws 路由以外的请求
app.get('/getAllRoomInfo', auth, async (req, res) => {
	if (!redisCkient.size) {
		return res.send(JSON.stringify([]));
	}
	const roomInfo = [];
	roomMap.forEach((value, key) => {
		value && roomInfo.push(value);
	});
	res.send({
		code: 0,
		data: roomInfo
	});
});

app.post('/updateInfo', async (req, res) => {
	// 设置允许访问的源（可以是具体的域名、端口、协议，或者使用 * 允许所有源）
	const { name = '', roomId = 0 } = req.query;
	if (roomId && name) {
		const roomInfo = roomMap.get(+roomId);
		roomInfo?.userList?.some((item) => {
			if (item.name == name) {
				item.active = false;
				item.activeTime = 0;
				return true;
			}
		});
		const msg = {
			text: name + '刷新啦，，在线人数要变',
			code: 200,
			name,
			roomId,
			type: 'update'
		};
		await redisCkient.set2Map(roomMap);
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				msg.users = roomMap.get(+roomId)?.userList?.length || 0;
				msg.totalUserList = roomMap.get(+roomId)?.userList || [];
				msg.activityUsers = roomMap.get(+roomId)?.userList?.filter((item) => {
					if (
						item.active &&
						item.activeTime &&
						time - item.activeTime < HEART_TIME
					) {
						item.active = true;
						return true;
					} else {
						item.active = false;
						item.activeTime = 0;
					}
				})?.length;
				client.send(JSON.stringify(msg));
			}
		});
	}
	res.send({ msg: 'ok', code: 0 });
});

app.get('/getRoomInfoByRoomId',(req, res) => {
	const { roomId } = req.query;
	if (!roomId || !roomMap.size || !roomMap.get(roomId)) {
		return res.send({});
	}
	const roomInfo = roomMap.get(roomId);
	res.send(roomInfo);
});

app.post('/createRoom', async (req, res) => {
	const { roomId, name, id, password = '' } = req.query;
	const room = roomMap.get(roomId);
	const time = new Date().now;
	if (!room) {
		const roomInfo = {
			roomId,
			createUser: name,
			createTime: id,
			serverTime: time,
			password: password,
			userList: [{ name, jionTime: time, active: false }],
			messageList: []
		};
		roomMap.set(roomId, roomInfo);
		await redisCkient.set2Map(roomMap);
		res.send({
			code: 0,
			msg: '房间创建成功'
		});
	} else {
		res.send({
			code: 5001,
			msg: '房间号已存在'
		});
	}
});

server.on('upgrade', (request, socket, head) => {
	switch (request.url) {
		case '/ws':
			// 只允许 这个主机下的请求访问
			if (
				request.headers.origin.includes(WHITE_LIST[0]) ||
				request.headers.origin.includes(WHITE_LIST[1]) ||
				request.headers.origin.includes('localhost')
			) {
				wss.handleUpgrade(request, socket, head, (ws) => {
					Socket = socket;
					wss.emit('connection', ws, request);
				});
			} else {
				console.log(
					'Unauthorized request from:',
					request.headers.origin
				);
				// 对其他主机的请求返回 403 状态码
				// socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
				// socket.destroy();
			}
			break;
		default:
			break;
	}
});

function wsHandles() {
	// 监听 WebSocket 连接
	wss.on('connection', (socket) => {
		console.log('WebSocket 连接已建立');
		// 监听客户端发送的消息
		socket.on('message', async (message) => {
			message = message.toString();
			const msg = JSON.parse(message);
			msg.code = 200;
			const { type, roomId, name, id, password = '' } = msg || {};
			const room = roomMap.get(roomId);
			const time = new Date().getTime();
			if (type == 'create') {
				if (!room) {
					const roomInfo = {
						roomId,
						createUser: name,
						createTime: id,
						serverTime: time,
						password: password,
						userList: [{ name, jionTime: time, active: false }],
						messageList: []
					};
					roomMap.set(roomId, roomInfo);
					msg.text = '您已加入房间！！！';
				} else {
					// 房间号已存在
					msg.text = '房间号已存在';
					msg.code = 5001;
				}
			} else if (type === 'join') {
				// 加入房间
				if (!room) {
					msg.code = 5004;
					msg.text = '房间不存在';
				} else {
					let hasUser = false;
					let userIsSctivity = true; // 用户是否已经在线
					if (Array.isArray(room.userList) && room.userList.length) {
						room.userList.some((item) => {
							if (item.name == name) {
								hasUser = true;
								userIsSctivity = item.active;
								if (!item.active) {
									item.active = true;
									item.activeTime = time;
								}
								return true;
							}
						});
					}

					if (hasUser && userIsSctivity) {
						// 用一个用户两个地方登录
						// msg.text = `用户 ${name} 已在房间${roomId}`;
						// msg.code = 5002;
					} else if (hasUser && !userIsSctivity) {
						// 房间中的用户上线
						msg.text = '欢迎' + name + '进入房间！';
					} else {
						room.userList.push({
							name,
							jionTime: +new Date(),
							active: true
						});
						msg.text = name + '已进入房间';
					}
				}
			} else if (type === 'leave') {
				if (Array.isArray(room.userList) && room.userList.length) {
					const index = room.userList.findIndex(
						(item) => item.name === name
					);
					index != -1 && room.userList.splice(index, 1);
					msg.text = name + '离开了房间';
					if (roomMap.get(roomId)?.userList?.length == 0) {
						roomMap.delete(roomId);
					}
				}
			} else if (type === 'ping') {
				msg.status = 'pong';
				room.userList.some((item) => {
					if (item.name === name) {
						// 用户活跃
						item.active = true;
						item.activeTime = time;
					}
				});
			} else {
				//保存消息
				const currentRoom = roomMap.get(roomId);
				if (currentRoom) {
					const msgInfo = {
						...msg,
						name,
						id,
						roomId,
						type,
						text: msg.text,
						code: msg.code
					};
					if (currentRoom?.messageList) {
						roomMap.get(roomId)?.messageList.push(msgInfo);
					} else {
						roomMap.get(roomId).messageList = [msgInfo];
					}
				}
			}
			msg.users = roomMap.get(roomId)?.userList?.length || 0;
			msg.totalUserList = roomMap.get(roomId)?.userList || [];
			msg.activityUsers = roomMap
				.get(roomId)
				?.userList?.filter((item) => {
					if (
						item.active &&
						item.activeTime &&
						time - item.activeTime < HEART_TIME
					) {
						item.active = true;
						return true;
					} else {
						item.active = false;
						item.activeTime = 0;
					}
				})?.length;
			// 广播消息给所有连接的客户端
			await redisCkient.set2Map(roomMap);
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(msg));
				}
			});
		});

		wss.on('error', (message) => {
			console.log('报错了');
		});
		wss.on('close', (message) => {
			console.log('连接关闭：');
		});
		wss.on('open', (message) => {
			console.log('open', message);
		});
	});
}

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`服务器正在运行，端口：${PORT}`);
});
