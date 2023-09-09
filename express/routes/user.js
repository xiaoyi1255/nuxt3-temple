const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MySQL = require('../utils/mysql'); // 导入MySQL类
const { SERET_KEY } = require('./../config')
const ErrorCodeMessage = {
  401: '',
  403: '',
  502: '',
  503: '',
  504: '',
  500: '',
}

const config = {
  host: '118.89.125.27',
  user: 'root',
  password: 'root',
  database: 'chat',
  connectionLimit: 10, // 连接池最大链接数
}
const db = new MySQL(config)

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.query
  try {
    if (username && password) {
      db.connect()
      const sql = `SELECT * FROM user_table WHERE username = ? AND password =?;`
      const sql2 = `SELECT * FROM user_table WHERE username = ? `
      const queryhasUser = await db.query(sql, [username, password])
      const queryUser = await db.query(sql2, [username])
      console.log(queryhasUser, queryUser)
      const resObj = {
        code: -1,
        userInfo: null,
        msg: '用户不存在'
      }
      if (queryhasUser?.length && queryUser?.length) { // 账号、密码匹配上了
        const user = {
          username: username,
          id: queryhasUser[0]?.did
        }
        console.log(user)
        const token = jwt.sign(user, SERET_KEY, { expiresIn: 60 });
        console.log(token)
        // const token = jwt.sign(user, 'SERET_KEY', { expiresIn: '0.01h' });
        resObj.userInfo = queryhasUser[0]
        resObj.msg = '登录成功'
        resObj.code=0
        resObj.token = token
      } else if (queryUser?.length) { // 密码不正确
        resObj.msg = '密码不正确'
      }
      res.send(resObj)
    } else {
      res.send({
        code: -1,
        msg: '请输入用户名、密码'
      })
    }
  } catch (error) {
    console.log(JSON.stringify(error))
    res.send({
      code: -1,
      msg: '报错了'
    })
  }
})

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, gender } = req.query
    const currentDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (username && password) {
      db.connect()
      const sql2 = `SELECT * FROM user_table WHERE username=?;`
      console.log(sql2)
      const queryUser = await db.query(sql2,[username])
      console.log(queryUser, 11)
      const resObj = {
        code: -1,
        userInfo: null,
        msg: '用户已存在'
      }
      if (!queryUser?.length) { // 没匹配上了
        const inset_sql = `INSERT INTO chat.user_table (did, username, password, registration_time, gender) VALUES (?, ?,?, ?, ?)`
        console.log(inset_sql)
        const results = await db.query(inset_sql, [uuidv4(), username, password,currentDatetime, gender])
        if (results.affectedRows === 1) {
          console.log('Insertion successful.');
          resObj.code = 0
          resObj.msg = '注册成功!'
        }
      }
      res.send(resObj)
    } else {
      res.send({
        code: -1,
        msg: '请输入用户名、密码'
      })
    }
    
  } catch (error) {
    res.send({
      code: -1,
      msg: error
    })
  }
})




module.exports = router