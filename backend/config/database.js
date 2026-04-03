const mysql = require('mysql2');

// 创建数据库连接
const db = mysql.createConnection({
  host: 'localhost',           // 数据库地址
  user: 'root',                // 数据库用户名
  password: '520xkl1314',                // 数据库密码（XAMPP默认空密码）
  database: 'snake_game',      // 数据库名
  charset: 'utf8mb4',          // 字符集
  timezone: 'local'            // 时区
});

// 连接数据库
db.connect((err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    console.log('💡 请确保：');
    console.log('   1. MySQL服务已启动');
    console.log('   2. 数据库名正确');
    console.log('   3. 用户名密码正确');
    return;
  }
  console.log('✅ MySQL数据库连接成功');
});

module.exports = db;