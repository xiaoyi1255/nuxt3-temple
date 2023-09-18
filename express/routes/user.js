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
      const sql = `SELECT username,uid,gender,did FROM user_table WHERE username = ? AND password =?;`
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
          did: queryhasUser[0]?.did,
          uid: queryhasUser[0]?.uid,
          gender: queryhasUser[0]?.gender,

        }
        const token = jwt.sign(user, SERET_KEY, { expiresIn: '1h' });
        const refreshToken = jwt.sign(user, REFRESH_KEY, { expiresIn: '7d' });
        res.setHeader('token', token)
        res.setHeader('refresh-token', refreshToken)
        resObj.userInfo = user
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

// 获取所有用户列表
router.post('/getUserList', async(req, res) => {
  if (!username) {
    res.send({
      code: -1,
      data: [],
      msg: '请输入用户名称'
    })
  } else {
    const sql = `SELECT uid,username,gender FROM user_table`
    // 拿到所有用户 => 判断用户的关系
    const userList = await db.query(sql)
    res.send({
      code: 0,
      data: userList
    })
  }
})

// 获取所有用户列表
router.post('/getUserListByName', async(req, res) => {
  const {username, uid} = req.body
  if (!username) {
    res.send({
      code: -1,
      data: [],
      msg: '请输入用户名称'
    })
  } else {
    const sql = `SELECT uid,username,gender FROM user_table WHERE username like ? AND uid != ?;`
    // 拿到所有用户 => 判断用户的关系
    const userList = await db.query(sql, [`%${username}%`, uid])
    res.send({
      code: 0,
      data: userList
    })
  }
})

router.post('/addFriend',auth, async(req,res) => {
  const { uid, friendId, info='null'} = req.body
  if (!uid || ! friendId) {
    res.end({
      code: -1,
      msg: '参数错误',
    })
    return
  } else {
    const sql = `SELECT * FROM user_table WHERE uid=?;`
    const rows1 = await db.query(sql, uid)
    const rows2 = await db.query(sql, friendId)
    if (rows1.length && rows2.length) {
      // 先判断是不是好友关系
      const statusSql = `SELECT
                        CASE
                            WHEN EXISTS (
                                SELECT 1
                                FROM friendship
                                WHERE (user_id = '?' AND friend_id = '?')
                                    OR (user_id = '?' AND friend_id = '?')
                            ) THEN status
                            ELSE '0'
                        END AS friendship_status
                    FROM friendship
                    WHERE (user_id = '?' AND friend_id = '?')
                        OR (user_id = '?' AND friend_id = '?');
      `
      const friend_status = await db.query(statusSql, [uid, friendId,friendId, uid, uid, friendId,friendId, uid])
      if (friend_status?.length) {
        // 已在验证中 | 已是好友关系
        console.log(friend_status, 'friend_status')
        const status = friend_status[0]?.friendship_status
        res.send({
          code: 0,
          data: {
            status: status
          },
          msg: ''
        })
      } else {
        // 发送好友验证
        const sql = 'INSERT INTO friendship (user_id, friend_id, status, verification_message, initiator_id) VALUES (?, ?, ?, ?, ?)';
        const row3 = await db.query(sql, [uid,friendId, 'pending', info, uid])
        if(row3.affectedRows) { // 插入成功
          res.send({
            code: 0,
            data: {
              msg: '好友验证，发送成功！'
            },
          })
        }
      }
    } else {
      res.send({
        code: 0,
        data: {},
        msg: `用户id: ${friendId}、${uid}错误！`
      })
    }
  }
})

module.exports = router