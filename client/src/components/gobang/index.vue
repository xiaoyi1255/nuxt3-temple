<template>
  <div class="warpper">
    <canvas id="canvas" @click="bindEvent"></canvas>
    <div v-if="state.winner" class="play">
      <Button  @click="restart">重新开始</Button>
      <div>胜者：<span>{{state.winner && state.winner === "B" ? "小黑" : "小白" || '---'}}</span></div>
    </div>
    <div v-if="state.gameStatus==='pending'&& !state.winner" class="play">
      <Button @click="startGame">开始游戏</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FiveLine } from "./FiveLine";
import { config } from "@/baseConfig";
import { message, Button } from 'ant-design-vue'

enum Type {
  'play'='play',
  'restart'='restart',
  'gameOver'='gameOver',
  'isWin'='isWin',
  'create'='create',
  'join'='join'
}

const route = useRoute()
const fiveLine = ref()
const connected = ref()
let socket: WebSocket | null = null;

const state = reactive({
  sendUser: route.query?.name, // 当前用户
  curPlayer: route.query?.curPlayer,
  receiveUser: '', // 对战的用户
  isCanClick: route.query?.isCreate || false, // 当前是否能下子
  winner: '', // 胜利者
  countSetps: 0, // 当前走的步数
  gameStatus: 'pending',
  msg: '',
  point: []
})
const connectWebSocket = () => {
  const socketUrl = config?.baseWsUrl + "/fiveLine";
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket连接成功！");
    connected.value = true;
  };

  socket.onmessage = async (event) => {
    const roomId = route.query.roomId
    const msgObj = JSON.parse(event.data);
    const that = fiveLine.value
    const { 
      receiveUser = '', // 对战的用户
      curPlayer='',
      winner = '', // 胜利者
      countSetps = 0, // 当前走的步数
      gameType = -1,
      msg = '',
      point=[],
      pieces=[],
      gameStatus='pending'
    } = msgObj
    // 过滤不是自己的消息
    roomId === msgObj.roomId && (state.gameStatus = gameStatus)
    if (roomId ===msgObj.roomId && gameType === Type.create && pieces.length) {
      console.log('重连---', pieces)
      // message.success('重连成功~ 继续战斗')
      pieces.some(item => {
        console.log(item)
        that.drawPiece(
          item.point[0],
          item.point[1],
          item.player === "W" ? "white" : "black"
        );
      })
      state.isCanClick = curPlayer !== route.query.curPlayer
      return
    }
    if (curPlayer !== state.curPlayer && roomId ===msgObj.roomId) {
      if (gameType === Type.restart) {
        restart()
        return
      }
      // 保存棋子
      that.pieces = pieces
      // 绘制棋子
      await that.drawPiece(
        point[0],
        point[1],
        curPlayer === "W" ? "white" : "black"
      );
      state.isCanClick = true
      state.point = point
       // 监听是否已有五子相连
      if (winner) {
        that.winner = that.curPlayer;
        state.winner=winner
        setTimeout(() => {
          message.warning((winner === "B" ? "小黑" : "小白") + "赢了")
        }, 500)
      }
    }
  };
  socket.onerror = (msg) => {
    console.log("errr");
  };
  socket.onclose = (msg) => {
    console.log("close");
    message.error('服务器异常，请刷新后重试~')
  };
};
const sendMessage = (msg = {}) => {
  const messageObj = {
    id: Date.now(),
    ...msg,
    ...route.query
  };
  socket?.send(JSON.stringify(messageObj));
};
const restart = () => {
  sendMessage({gameType: Type.restart, pieces:[]})
  fiveLine.value?.restart()
  state.winner = ''
  state.countSetps = 0
  state.isCanClick = true
}
// 监听落子
const bindEvent = async (e: Event) => {
  if (!state.isCanClick) {
    message.warning('当前不可下子')
    return
  }
  const that = fiveLine.value
  that.curPlayer = route.query?.curPlayer
  const { ctx, canvas } = that;
  if (that.winner) {
    message.warning((that.winner === "B" ? "小黑" : "小白") + "赢了")
    return;
  }
  const { x, y } = that.getMousePos(canvas, e);
  console.log("点击的坐标 [ x, y ] >", x, y);
  const point = that.nearestPoint([x, y], that.crossPoints);
  state.point = point
  console.log("对应到格子上最近的交叉点 [ x, y ] >", point);
  if (
    that.pieces.find((c) => c.point[0] === point[0] && c.point[1] === point[1])
  ) {
    // alert("此处已有棋子");
    message.warning('此处已有棋子')

    return;
  }
  // 保存棋子
  that.pieces.push({
    player: route.query?.curPlayer,
    point
  });
  // 绘制棋子
  await that.drawPiece(
    point[0],
    point[1],
    route.query?.curPlayer === "W" ? "white" : "black"
  );
  // 监听是否已有五子相连
  const isWin = that.watchWin();
  if (isWin !== false) {
    setTimeout(() => {
      message.warning((that.curPlayer === "B" ? "小黑" : "小白") + "赢了")

      // alert((that.curPlayer === "B" ? "小黑" : "小白") + "赢了")
    }, 0)
    that.winner = that.curPlayer;
    state.winner = that.curPlayer
  }
  // 变更下一次的玩家
  state.isCanClick = false
  sendMessage({ ...state,isWin, pieces: that.pieces, gameType: Type.play })
}
// 开始游戏先
const startGame = () => {
  sendMessage({gameStatus: 'palying', gameType: Type.create})
  state.gameStatus = 'palying'

}
onMounted(() => {
  fiveLine.value = new FiveLine(document.querySelector("#canvas"), {
    curPlayer: route.query?.curPlayer
  });
  connectWebSocket()
})

</script>

<style scoped lang="less">
.warpper {
  position: relative;
  min-width: 600px;
  overflow-x: hidden;
  .play {
    width: 20vw;
    height: 20vh;
    color: #fff;
    padding: 5vh;
    border-radius: 1vh;
    background-color: rgba(0, 0, 0, .4);
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-direction: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    span {
      color: aquamarine;
      font-weight: bolder;
    }
  }
}
</style>