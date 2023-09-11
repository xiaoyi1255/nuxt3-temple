const mysql = require("mysql2");

class MySQL {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  // 建立数据库连接
  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
      }
      console.log('Connected to MySQL database');
    });
  }

  // 执行查询
  query(sql, values = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, values, (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }
  

  // 断开数据库连接
  disconnect() {
    this.connection.end((err) => {
      if (err) {
        console.error('Error disconnecting from MySQL:', err);
        throw err;
      }
      console.log('Disconnected from MySQL database');
    });
  }
}

module.exports = MySQL;
