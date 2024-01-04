const express = require('express');
const router = express.Router();
const { ROOMID_PRE } = require('./../config')
const redisCkient = require('../utils/redis');

router.post('/createFiveLineRoom', async (req, res) => {
  const { roomId, uid } = req.body
  if (!roomId) {
    res.send({
      code: -1,
      msg: '房间号信息错误'
    })
  } else {
    const key = ROOMID_PRE + roomId
    const now = +new Date()
    const roomInfo = await redisCkient.get(key)
    if (!roomInfo) {
      await redisCkient.setEX(key, JSON.stringify({ create: uid,roomId, createTiem:now,  }), 60*60*12)
      res.send({
        code: 0,
        msg: '创建成功'
      })
    } else {
      res.send({
        code: -1,
        msg: '房间号已存在'
      })
    }
  }
})

router.post('/joinFiveLiveRoom', async (req, res) => {
  const { roomId, uid } = req.body
  if (!roomId) {
    res.send({
      code: -1,
      msg: '房间号信息错误'
    })
  } else {
    const key = ROOMID_PRE + roomId
    const roomInfo = await redisCkient.get(key)
    if (!roomInfo) {
      res.send({
        code: -1,
        msg: '房间号不存在'
      })
    } else {
      res.send({
        code: 0,
        msg: '成功加入房间！！！'
      })
    }
  }
})

module.exports = router