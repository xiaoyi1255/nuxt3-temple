const roomMap = new Map()
function createFiveLiveWS(wss, WebSocket){
  // 监听 WebSocket 接
  wss.on('connection', (socket) => {
    console.log('WebSocket 连接已建立~ 五子棋');
    // 监听客户端发送的消息
    socket.on('message', async (message) => {
      message = message.toString();
      const data = JSON.parse(message);
      const { gameType='', msg='', roomId=0, winner='' } = data
      const roomInfo = roomMap.get(roomId) ||  {gameData: []}
      const now = +new Date()
      if (gameType === 'play') {
        roomInfo.gameData.push({...data, id: now})
        roomMap.set(roomId, {...roomInfo})
      } else if (gameType === 'create') { // 刷新、重进
        const lastData = roomInfo.gameData[roomInfo.gameData?.length -1] || {}
        if (lastData && lastData.pieces && (now - lastData.id <= 20 * 1000)) {
          data.pieces = lastData.pieces
          data.curPlayer = lastData.curPlayer
          roomMap.set(roomId, {...roomInfo,gameData: data.pieces, create: now})
        } else {
          roomMap.set(roomId, {gameData: [], create: now})
        }
      }
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
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


module.exports = {
  createFiveLiveWS
}