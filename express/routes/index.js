const uploadRoutes = require('./upload.js');
const wechatRoutes = require('./wechat.js');
const userRouters = require('./user.js');
const fiveLineRouer = require('./fiveLine.js')
const SSERouer = require('./sse.js')

const registerRouer = (app) => {
  app.use('/api/upload', uploadRoutes);
  app.use('/api', wechatRoutes);
  app.use('/api/user', userRouters);
  app.use('/api/game', fiveLineRouer);
  app.use('/api/sse', SSERouer);
}

module.exports = {
  registerRouer
}