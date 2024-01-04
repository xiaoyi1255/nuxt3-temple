const cors = require('cors'); // 导入 cors 中间件
const express = require('express');


const registerUse = (app) => {
  app.use(cors());

  app.use(express.json());
  app.use((req, res, next) => {
    console.log(req.path)
    console.log(req.query)
    console.log(req.body)
    res.setHeader('Access-Control-Expose-Headers', "token, refresh-token");
    next(); // 让请求继续到下一个中间件或路由处理程序
  });
}

module.exports = {
  registerUse
}