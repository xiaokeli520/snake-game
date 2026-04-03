# 🐍 贪吃蛇游戏

基于微信小程序 + Node.js + MySQL 的经典贪吃蛇游戏，支持多难度选择和排行榜系统。

---

## ✨ 功能特性

- 🎮 **贪吃蛇玩法**：滑动屏幕/方向按钮双控制
- 🎯 **多难度选择**：简单/普通/困难三档
- 🏆 **排行榜系统**：按分数/时间排序，难度筛选
- 📊 **用户统计**：游戏次数、最高分记录

---

## 🛠️ 技术栈

### 前端

| 技术 | 说明 |
| ---- | ---- |
| 微信小程序 | 前端框架 |
| Canvas 2D | 游戏渲染 |
| WXSS | 样式设计 |

### 后端

| 技术 | 说明 |
| ---- | ---- |
| Node.js | 运行环境 |
| Express | Web 框架 |
| MySQL | 数据库 |

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- MySQL 8.0+
- 微信开发者工具

### 安装依赖

```bash
# 后端
cd backend
npm install
配置数据库
sql
CREATE DATABASE snake_game;

USE snake_game;

-- 游戏记录表
CREATE TABLE game_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) DEFAULT '匿名玩家',
    score INT DEFAULT 0,
    game_time INT DEFAULT 0,
    difficulty ENUM('easy', 'normal', 'hard') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户统计表
CREATE TABLE user_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50) DEFAULT '匿名玩家',
    total_games INT DEFAULT 0,
    highest_score INT DEFAULT 0,
    total_game_time INT DEFAULT 0
);
修改 backend/config/database.js 中的数据库密码。

启动项目
bash
# 启动后端（端口 3000）
cd backend
node app.js

# 微信开发者工具打开 miniprogram 目录
# 修改 app.js 中的 apiBaseUrl 为 http://localhost:3000/api
📁 项目结构
text
snake-game/
├── miniprogram/
│   ├── pages/
│   │   └── index/        # 游戏主页面
│   ├── app.js
│   └── app.json
├── backend/
│   ├── routes/
│   │   ├── game.js       # 游戏记录接口
│   │   └── rank.js       # 排行榜接口
│   ├── config/
│   │   └── database.js   # 数据库配置
│   └── app.js
└── README.md
📝 API 接口
游戏相关
方法	路径	说明
POST	/api/game/submit	提交游戏记录
GET	/api/game/stats/:openid	获取用户统计
排行榜相关
方法	路径	说明
GET	/api/rank/list	获取排行榜
GET	/api/rank/user-rank/:openid	获取用户排名
🎮 演示账号
无需登录，小程序自动生成用户标识。

难度	速度	说明
简单	300ms/格	适合新手
普通	200ms/格	经典体验
困难	120ms/格	挑战极限
