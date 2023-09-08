const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const MySQL = require('../utils/mysql'); // 导入MySQL类
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
  database: 'chat'
}
const db = new MySQL(config)

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.query
  console.log(req.query)
  if (username && password) {
    db.connect()
    const sql = `SELECT * FROM user_table WHERE username = ${username} AND password = ${password};`
    const sql2 = `SELECT * FROM user_table WHERE username = ${username} `
    const queryhasUser = await db.query(sql)
    const queryUser = await db.query(sql2)
    console.log(queryhasUser, queryUser)
    const resObj = {
      code: -1,
      userInfo: null,
      msg: '用户不存在'
    }
    if (queryhasUser?.length && queryUser?.length) { // 账号、密码匹配上了
      resObj.userInfo = queryhasUser[0]
      resObj.msg = '登录成功'
      resObj.code=0
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
})

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.query
  console.log(req.query)
  const now = +new Date()
  if (username && password) {
    db.connect()
    const sql2 = `SELECT * FROM user_table WHERE username = ${username} `
    const queryUser = await db.query(sql2)
    console.log(queryUser)
    const resObj = {
      code: -1,
      userInfo: null,
      msg: '用户已存在'
    }
    if (!queryUser?.length) { // 没匹配上了
      const inset_sql = `INSERT INTO 'chat.user_table' ('did', 'username', 'password', 'registration_time') VALUES (${uuidv4()}, ${username}, ${password}, ${now})`
      const inset_res = await db.query(inset_sql)
      console.log(inset_res)
    } else if (queryUser?.length) { // 密码不正确
    }
    res.send(resObj)
  } else {
    res.send({
      code: -1,
      msg: '请输入用户名、密码'
    })
  }
})


module.exports = router