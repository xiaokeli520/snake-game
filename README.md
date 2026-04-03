# 🐍 经典贪吃蛇游戏 - 微信小程序版

<div align="center">

![微信小程序](https://img.shields.io/badge/微信小程序-07C160?logo=wechat&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)

一个功能完整的贪吃蛇游戏，支持多难度选择、排行榜系统和用户统计。

[功能特点](#-功能特点) • [技术栈](#-技术栈) • [快速开始](#-快速开始) • [项目结构](#-项目结构) • [API文档](#-api文档)

</div>

---

## ✨ 功能特点

### 🎮 游戏功能
- **经典贪吃蛇玩法** - 流畅的蛇移动和食物生成机制
- **三种难度模式** 
  - 🟢 简单模式：蛇移动速度较慢，适合新手
  - 🟡 普通模式：标准速度，经典体验
  - 🔴 困难模式：高速移动，挑战极限
- **双操作方式**
  - 👆 屏幕滑动控制方向
  - 🎮 虚拟方向按钮控制
- **实时统计** - 实时显示当前得分和游戏时间
- **自动保存** - 游戏结束后自动保存记录到数据库

### 🏆 排行榜系统
- **多维度排序** - 支持按分数高低或游戏时长排序
- **难度筛选** - 可查看全部/简单/普通/困难各难度排行榜
- **个人排名** - 显示用户最高分及全球排名位置
- **视觉反馈** - 前三名采用金银铜牌特殊样式标识

### 📊 用户统计
- **游戏次数统计** - 累计记录用户游戏总场次
- **最高分记录** - 保存用户历史最佳成绩
- **游戏时长统计** - 累计游戏总时长
- **历史记录** - 可查看个人游戏历史记录

### 🔧 技术特性
- **RESTful API** - 规范的接口设计
- **数据库事务** - 保证数据一致性
- **响应式设计** - 适配不同尺寸屏幕
- **性能优化** - Canvas 渲染优化，流畅游戏体验

## 🛠️ 技术栈

### 前端技术
| 技术 | 说明 | 版本 |
|------|------|------|
| 微信小程序 | 原生小程序框架 | 最新版 |
| Canvas 2D | 游戏渲染引擎 | - |
| WXSS | 样式设计语言 | - |
| JavaScript | 游戏逻辑实现 | ES6+ |

### 后端技术
| 技术 | 说明 | 版本 |
|------|------|------|
| Node.js | JavaScript 运行时 | 20.x |
| Express | Web 应用框架 | 4.x |
| MySQL | 关系型数据库 | 8.0 |
| CORS | 跨域资源共享 | - |

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- MySQL >= 8.0
- 微信开发者工具（最新版）
- Git（可选）

### 1. 克隆项目

```bash
git clone git@github.com:xiaokeli520/snake-game.git
cd snake-game
2. 数据库配置
2.1 创建数据库
登录 MySQL：

bash
mysql -u root -p
执行以下 SQL：

sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS snake_game DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE snake_game;

-- 游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    openid VARCHAR(100) NOT NULL COMMENT '用户唯一标识',
    nickname VARCHAR(50) DEFAULT '匿名玩家' COMMENT '用户昵称',
    score INT DEFAULT 0 COMMENT '得分',
    game_time INT DEFAULT 0 COMMENT '游戏时长(秒)',
    difficulty ENUM('easy', 'normal', 'hard') DEFAULT 'normal' COMMENT '难度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_openid (openid),
    INDEX idx_score (score),
    INDEX idx_difficulty (difficulty),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游戏记录表';

-- 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '用户唯一标识',
    nickname VARCHAR(50) DEFAULT '匿名玩家' COMMENT '用户昵称',
    total_games INT DEFAULT 0 COMMENT '总游戏次数',
    highest_score INT DEFAULT 0 COMMENT '最高分',
    total_game_time INT DEFAULT 0 COMMENT '总游戏时长',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid),
    INDEX idx_highest_score (highest_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户统计表';

-- 插入测试数据（可选）
INSERT INTO game_records (openid, nickname, score, game_time, difficulty) VALUES
('test_user_001', '测试玩家1', 150, 45, 'normal'),
('test_user_002', '测试玩家2', 200, 60, 'hard'),
('test_user_003', '测试玩家3', 120, 35, 'easy');

INSERT INTO user_stats (openid, nickname, total_games, highest_score, total_game_time) VALUES
('test_user_001', '测试玩家1', 5, 150, 200),
('test_user_002', '测试玩家2', 3, 200, 150),
('test_user_003', '测试玩家3', 8, 120, 280);

-- 查看数据
SELECT * FROM game_records;
SELECT * FROM user_stats;
2.2 配置数据库连接
修改 backend/config/database.js：

javascript
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',      // 数据库地址
  user: 'root',           // 数据库用户名
  password: '你的密码',    // 数据库密码
  database: 'snake_game', // 数据库名
  charset: 'utf8mb4',
  timezone: 'local'
});

db.connect((err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    return;
  }
  console.log('✅ MySQL数据库连接成功');
});

module.exports = db;
3. 启动后端服务
bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务
node app.js

# 或使用 nodemon 热重载（推荐）
npm install -g nodemon
nodemon app.js
后端服务启动成功提示：

text
🚀 贪吃蛇游戏后端服务已启动
📍 服务地址: http://localhost:3000
📊 健康检查: http://localhost:3000/health
4. 配置微信小程序
4.1 修改 API 地址
打开 miniprogram/app.js：

javascript
App({
  globalData: {
    apiBaseUrl: 'http://localhost:3000/api', // 修改为你的后端地址
    userInfo: null
  },
  // ... 其他代码
});
4.2 导入项目到微信开发者工具
打开微信开发者工具

选择「导入项目」

目录选择：snake-game/miniprogram

AppID：使用测试号或你的小程序 AppID

点击「确定」

4.3 配置合法域名（开发环境）
在微信开发者工具中：

点击「详情」→「本地设置」

勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

5. 运行游戏
确保后端服务正在运行

在微信开发者工具中点击「编译」

开始游戏！

📁 项目结构
text
snake-game/
│
├── miniprogram/                 # 微信小程序前端
│   ├── pages/
│   │   ├── index/              # 主页面
│   │   │   ├── index.js        # 页面逻辑（游戏核心）
│   │   │   ├── index.wxml      # 页面结构
│   │   │   └── index.wxss      # 页面样式
│   │   └── logs/               # 日志页面
│   ├── app.js                  # 小程序入口
│   ├── app.json                # 小程序配置
│   └── app.wxss                # 全局样式
│
├── backend/                     # Node.js 后端
│   ├── config/
│   │   └── database.js         # 数据库配置
│   ├── routes/
│   │   ├── game.js             # 游戏相关路由
│   │   └── rank.js             # 排行榜路由
│   ├── app.js                  # Express 应用主文件
│   ├── package.json            # 依赖配置
│   └── package-lock.json       # 依赖锁定
│
├── README.md                    # 项目文档
└── .gitignore                   # Git 忽略文件
📡 API 文档
基础信息
Base URL: http://localhost:3000/api

请求格式: JSON

响应格式: JSON

游戏相关接口
1. 提交游戏记录
http
POST /api/game/submit
请求体：

json
{
  "openid": "user_123456",
  "nickname": "微信玩家",
  "score": 150,
  "game_time": 45,
  "difficulty": "normal"
}
响应示例：

json
{
  "code": 200,
  "message": "记录提交成功",
  "data": {
    "recordId": 1
  }
}
2. 获取用户统计
http
GET /api/game/stats/:openid
响应示例：

json
{
  "code": 200,
  "data": {
    "total_games": 10,
    "highest_score": 250
  }
}
3. 获取游戏历史
http
GET /api/game/history/:openid?limit=10
响应示例：

json
{
  "code": 200,
  "data": [
    {
      "score": 150,
      "game_time": 45,
      "difficulty": "normal",
      "created_at": "2026-04-03T10:30:00.000Z"
    }
  ]
}
排行榜接口
4. 获取排行榜
http
GET /api/rank/list?type=score&difficulty=all&limit=20&page=1
参数说明：

type: 排序类型（score-分数排序，time-时间排序）

difficulty: 难度筛选（all/easy/normal/hard）

limit: 每页数量（默认20）

page: 页码（默认1）

响应示例：

json
{
  "code": 200,
  "data": [
    {
      "nickname": "微信玩家",
      "score": 250,
      "game_time": 60,
      "difficulty": "hard",
      "created_at": "2026-04-03T10:30:00.000Z"
    }
  ]
}
5. 获取用户排名
http
GET /api/rank/user-rank/:openid
响应示例：

json
{
  "code": 200,
  "data": {
    "rank": 5,
    "total": 100,
    "score": 250
  }
}
健康检查
http
GET /health
响应示例：

json
{
  "code": 200,
  "message": "贪吃蛇游戏后端服务正常运行",
  "timestamp": "2026-04-03T10:30:00.000Z"
}
🎮 游戏玩法说明
基本规则
控制蛇头移动，吃到食物可以增加分数和蛇的长度

撞到墙壁或自己的身体会导致游戏结束

每吃到一个食物得10分

游戏时间越长，得分机会越多

难度差异
难度	移动速度(ms/格)	特点
简单	300	速度较慢，容错率高，适合新手
普通	200	标准速度，经典体验
困难	120	速度很快，考验反应能力
操作方式
滑动屏幕：在游戏区域上下左右滑动控制方向

方向按钮：点击屏幕下方的虚拟方向键控制

返回按钮：可随时返回首页

❓ 常见问题
1. 数据库连接失败
错误信息： ❌ 数据库连接失败: Access denied for user

解决方案：

确认 MySQL 服务已启动

检查数据库用户名和密码是否正确

确认数据库 snake_game 已创建

检查防火墙是否允许 3306 端口

2. 小程序无法连接后端
错误信息： request:fail

解决方案：

确认后端服务已启动：node backend/app.js

检查 app.js 中的 apiBaseUrl 是否正确

在微信开发者工具中勾选「不校验合法域名」

检查后端是否允许跨域（已配置 CORS）

3. Canvas 不显示
解决方案：

确保基础库版本 ≥ 2.9.0

检查页面是否包含 Canvas 组件

确认 Canvas 的 type="2d" 属性已设置

4. Git 推送失败
解决方案：

bash
# 重新设置远程仓库
git remote remove origin
git remote add origin git@github.com:xiaokeli520/snake-game.git

# 强制推送
git push -u origin main --force
5. 端口被占用
错误信息： Error: listen EADDRINUSE: address already in use :::3000

解决方案：

bash
# Windows 查看占用端口的进程
netstat -ano | findstr :3000

# 杀死进程（替换 PID）
taskkill /PID 12345 /F

# 或修改端口
# 在 backend/app.js 中修改 PORT 变量
🗓️ 开发计划
v1.1.0（计划中）
添加音效和背景音乐

实现道具系统（加速、减速、双倍分数）

添加更多皮肤主题

支持分享成绩到朋友圈

v1.2.0（计划中）
好友对战功能

每日挑战任务

成就系统

数据可视化统计图表

v2.0.0（远期规划）
多人实时对战

赛季排名系统

AI 智能对手

跨平台支持（Uni-app 重构）

📊 数据库设计
ER 图
text
┌─────────────────┐         ┌─────────────────┐
│   game_records  │         │    user_stats   │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ openid (FK)     │◄────────│ openid (UK)     │
│ nickname        │         │ nickname        │
│ score           │         │ total_games     │
│ game_time       │         │ highest_score   │
│ difficulty      │         │ total_game_time │
│ created_at      │         │ created_at      │
└─────────────────┘         │ updated_at      │
                            └─────────────────┘
索引优化
game_records 表：openid、score、difficulty、created_at

user_stats 表：openid、highest_score
