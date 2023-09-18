const mysql = require('mysql2/promise');
const config = {
  host: '118.89.125.27',
  user: 'root',
  password: 'root',
  database: 'chat',
  connectionLimit: 10, // 连接池最大链接数
}
// 创建数据库连接池
const pool = mysql.createPool(config);

// 查询函数
async function query(sql, values) {
  try {
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.query(sql, values);
    connection.release();
    console.log(JSON.stringify(sql), '的结果:',rows)
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  query,
};
