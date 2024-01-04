const express = require('express');
const router = express.Router();
const EventEmitter = require('../utils/EventEmitter');

const events = new Map()
let flag = false

// 站内信 SSE
router.get('/push', (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const uid = req.query.uid;
  if (!events.has(uid)) {
    events.set(uid, res);
    EventEmitter.on('sseMsg2User' + uid, handleMsg2User);
  }
  if (!flag) {
    EventEmitter.on('sseMsg2UAll', handleMsg2All);
    flag = true
  }

  function handleMsg2User(data = {}, event = 'message') {
    const uid = data.uid
    const timeStamp = new Date().getTime();
    const resEvent = events.get(uid);
    if (resEvent) { // 精准推送
      resEvent.write(`id: ${timeStamp}\n`);
      resEvent.write(`event: ${event}\n`);
      resEvent.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }

  function handleMsg2All(data = {}, event = 'message') {
    const timeStamp = new Date().getTime();
    events.forEach((resEvent) => {
      resEvent.write(`id: ${timeStamp}\n`);
      resEvent.write(`event: ${event}\n`);
      resEvent.write(`data: ${JSON.stringify(data)}\n\n`);
    })
  }

  // 推送消息
  res.write(`data: ${JSON.stringify({ msg: '站内信链接成功！' })}\n\n`);

  req.on('close', () => {
    events.delete(uid);
    EventEmitter.removeListener('sseMsg2User' + uid, handleMsg2User)
  });
});

// 模拟更新信息
router.post('/update', (req, res) => {
  const { uid, msg, isAll = false } = req.body;
  if (isAll) {
    EventEmitter.emit('sseMsg2UAll', { msg: '系统消息：' + msg, uid },)
  } else {
    EventEmitter.emit('sseMsg2User' + uid, { msg: '给' + uid + '的消息>>' + msg, uid },)
  }
  res.send({ code: 0 })
})

module.exports = router;