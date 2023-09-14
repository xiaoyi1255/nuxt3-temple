const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../utils/mysql'); // 导入MySQL类
const { SERET_KEY, REFRESH_KEY } = require('./../config')
const {auth} = require('../middleware/auth.js')

// const db = new MySQL(config)

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/login', async (req, res) => {
  console.log(req.path)
  const { username, password } = req.body
  try {
    if (username && password) {
      // db.connect()
      const sql = `SELECT * FROM user_table WHERE username = ? AND password =?;`
      const sql2 = `SELECT * FROM user_table WHERE username = ? `
      const queryhasUser = await db.query(sql, [username, password])
      const queryUser = await db.query(sql2, [username])
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
        const token = jwt.sign(user, SERET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(user, REFRESH_KEY, { expiresIn: '7d' });
        res.setHeader('token', token)
        res.setHeader('refresh-token', refreshToken)
        resObj.userInfo = {...queryhasUser[0]}
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
  } catch (error) {
    console.log(JSON.stringify(error))
    res.send({
      code: -1,
      msg: '报错了' + JSON.stringify(error)
    })
  } finally {
    // db.disconnect()
  }
})

/**
 * 用户登录接口
 * 1. 通过用户
 */
router.post('/register', async (req, res) => {
  console.log(req.path)
  try {
    const { username, password, gender } = req.body
    const currentDatetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (username && password) {
      // db.connect()
      const sql2 = `SELECT * FROM user_table WHERE username=?;`
      const queryUser = await db.query(sql2,[username])
      const resObj = {
        code: -1,
        userInfo: null,
        msg: '用户已存在'
      }
      if (!queryUser?.length) { // 没匹配上了
        const inset_sql = `INSERT INTO chat.user_table (did, username, password, registration_time, gender) VALUES (?, ?,?, ?, ?)`
        console.log(inset_sql)
        const results = await db.query(inset_sql, [uuidv4(), username, password,currentDatetime, gender])
        console.log(results)
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


router.post('/refreshToken', async(req, res) => {
  console.log(req.path)
  const refreshToken = req.headers['refresh-token']
  console.log(req.headers)
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_KEY);
    const user = {
      id: decoded?.id,
      username: decoded?.username
    }
    // 签发新token
    const token = jwt.sign(user, SERET_KEY, { expiresIn: '1h' });
    res.setHeader('token', token)
    res.send({
      code: 0,
      token: token
    })
    
  } catch (error) {
    res.send({
      code: 1,
      error: error,
      msg: 'token 过期或无效'
    })
  }
})


router.post('/getUserList', async(req, res) => {
  const {username, uid} = req.body
  if (!username) {
    res.send({
      code: -1,
      data: [],
      msg: '请输入用户名称'
    })
  } else {
    const sql = `SELECT id,uid,username,gender FROM user_table WHERE username like ?;`
    // const sql = `SELECT
    //                 u.username,
    //                 u.gender,
    //                 CASE
    //                 WHEN f.user_id=? OR f.friend_id=? THEN '已建立关系'
    //                   ELSE '未建立关系'
    //                 END AS relationship_status
    //             FROM
    //                 user_table u
    //             LEFT JOIN
    //                 friendship f ON (f.friend_id = ? OR f.)
    //             WHERE
    //                 u.username LIKE ?;`
    const [userList] = await db.query(sql, [uid,uid, uid,`%${username}%`])
    res.send({
      code: 0,
      data: userList
    })
  }

})

router.post('/addFriend',auth, async(req,res) => {
  const { uid, friendId, info=''} = req.body
  if (!uid || ! friendId) {
    res.end({
      code: -1,
      msg: '参数错误',
    })
    return
  } else {
    const sql = `SELECT * FROM user_table WHERE uid=?;`
    const [rows1, fields1] = await db.query(sql, uid)
    const [rows2, fields2] = await db.query(sql, friendId)
    console.log(rows1,rows2, fields1)
    if (rows1.length && rows2.length) {
      const sql = 'INSERT INTO friendship (user_id, friend_id, status, info) VALUES (?, ?, ?, ?)';
      const [row3, fields3] = await db.query(sql, [uid,friendId, 'pending', info])
      if(row3.affectedRows) { // 插入成功
        res.send({
          code: 0,
          data: {},
          msg: '好友验证，发送成功！'
        })
      }
    }
  }
})

module.exports = router