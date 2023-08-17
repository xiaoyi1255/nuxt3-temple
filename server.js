const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const app = express();

const roomMap = new Map();
// 创建 HTTP 服务器
const server = http.createServer(app);
// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ noServer: true });

wsHandles(); // websocket 监听器

// 设置跨域响应头的中间件
app.use((req, res, next) => {
	// 允许所有源访问
	res.header('Access-Control-Allow-Origin', '*');

	// 设置其他CORS相关的响应头
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.header('Access-Control-Allow-Credentials', true);

	// 继续处理下一个中间件或路由
	next();
});

// 在 Express 中处理除了 /ws 路由以外的请求
app.get('/getAllRoomInfo', (req, res) => {
	// 设置允许访问的源（可以是具体的域名、端口、协议，或者使用 * 允许所有源）
	if (!roomMap.size) {
		return res.send(JSON.stringify([]));
	}
	const roomInfo = [];
	roomMap.forEach((value, key) => {
		value && roomInfo.push(value);
	});
	res.send(roomInfo);
});

app.post('/updateInfo', (req, res) => {
	// 设置允许访问的源（可以是具体的域名、端口、协议，或者使用 * 允许所有源）
	const { name = '', roomId = 0 } = req.query;
	if (roomId && name) {
		const roomInfo = roomMap.get(+roomId);
		roomInfo?.userList?.some((item) => {
			if (item.name == name) {
				console.log(roomInfo?.userList)
				item.active = false;
				return true;
			}
		});
		const msg = {text: name + '刷新啦，，在线人数要变', code: 200, name, roomId, type: 'update'}
		wss.clients.forEach((client) => {
			
			if (client.readyState === WebSocket.OPEN) {
				msg.users = roomInfo?.userList?.length || 0;
				msg.totalUserList = roomInfo?.userList || []
				msg.activityUsers = roomInfo?.userList?.filter(item => item.active)?.length
				client.send(JSON.stringify(msg))
			}
		});
	}
	res.send({ msg: 'ok' });
});

app.get('/getRoomInfoByRoomId', (req, res) => {
	const { roomId } = req.query;
	if (!roomMap.size || !roomMap.get(roomId || !roomId)) {
		return res.send(JSON.stringify({}));
	}
	const roomInfo = roomMap.get(roomId);
	res.send(roomInfo);
});
server.on('upgrade', (request, socket, head) => {
	switch (request.url) {
		case '/ws':
			// 只允许 这个主机下的请求访问
			if (
				request.headers.origin.includes('118.89.125.27')
			) {
				console.log(
					'request.headers.origin111',
					request.headers.origin
				);
				wss.handleUpgrade(request, socket, head, (ws) => {
					Socket = socket
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
		socket.on('message', (message) => {
			message = message.toString();
			const msg = JSON.parse(message);
			msg.code = 200;
			const { type, roomId, name, id } = msg || {};
			const room = roomMap.get(roomId);
			if (type == 'create') {
				if (!room) {
					const roomInfo = {
						roomId,
						createUser: name,
						createTime: id,
						serverTime: new Date().now,
						userList: [
							{ name, jionTime: +new Date(), active: true }
						]
					};
					roomMap.set(roomId, roomInfo);
					msg.text = '您已加入房间！！！';
				} else {
					// 房间号已存在
					msg.text = '房间号已存在';
					msg.code = 5001;
				}
			} else if (type == 'join') {
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
								userIsSctivity = item.active
								if (!item.active) {
									item.active = true;
								}
								return true;
							}
						});
					}

					if (hasUser && userIsSctivity) { // 用一个用户两个地方登录
						msg.text = '用户名已存在';
						msg.code = 5002;
					} else if(hasUser && !userIsSctivity)  { // 房间中的用户上线
						msg.text = '欢迎' + name + '返回房间！';
					}else{
						room.userList.push({ name, jionTime: +new Date(), active: true })
						msg.text = name + '已进入房间';
					}
				}
			} else if (type == 'leave') {
				if (Array.isArray(room.userList) && room.userList.length) {
					const index = room.userList.findIndex(
						(item) => item.name === name
					);
					console.log(index);
					index != -1 && room.userList.splice(index, 1);
					msg.text = name + '离开了房间';
					if (roomMap.get(roomId)?.userList?.length == 0) {
						roomMap.delete(roomId);
					}
				}
			}
			msg.users = roomMap.get(roomId)?.userList?.length || 0;
			msg.totalUserList = roomMap.get(roomId)?.userList || []
			msg.activityUsers = roomMap.get(roomId)?.userList?.filter(item => item.active)?.length
			// 广播消息给所有连接的客户端
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify(msg));
				}
			});
		});
	});
	wss.on('error', (socket) => {
		console.log('报错了');
	});
}

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`服务器正在运行，端口：${PORT}`);
});
