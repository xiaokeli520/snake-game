const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 提交游戏记录
router.post('/submit', (req, res) => {
  const { openid, nickname = '匿名玩家', score, game_time, difficulty } = req.body;
  
  console.log('收到游戏记录提交:', { openid, nickname, score, game_time, difficulty });
  
  // 参数验证
  if (!openid || score === undefined || game_time === undefined || !difficulty) {
    return res.json({ 
      code: 400, 
      message: '参数不完整',
      required: ['openid', 'score', 'game_time', 'difficulty'] 
    });
  }

  const connection = db.promise();
  
  async function submitRecord() {
    try {
      await connection.beginTransaction();
      
      // 1. 插入游戏记录
      const [insertResult] = await connection.execute(
        'INSERT INTO game_records (openid, nickname, score, game_time, difficulty) VALUES (?, ?, ?, ?, ?)',
        [openid, nickname, score, game_time, difficulty]
      );
      
      console.log('游戏记录插入成功，ID:', insertResult.insertId);
      
      // 2. 检查用户是否存在
      const [userStats] = await connection.execute(
        'SELECT * FROM user_stats WHERE openid = ?',
        [openid]
      );
      
      if (userStats.length === 0) {
        // 新用户，创建统计记录
        console.log('创建新用户统计:', openid);
        await connection.execute(
          'INSERT INTO user_stats (openid, nickname, total_games, highest_score, total_game_time) VALUES (?, ?, 1, ?, ?)',
          [openid, nickname, score, game_time]
        );
      } else {
        // 更新现有用户统计
        const currentStats = userStats[0];
        const newHighestScore = Math.max(currentStats.highest_score, score);
        
        console.log('更新用户统计:', openid, '新最高分:', newHighestScore);
        
        await connection.execute(
          `UPDATE user_stats 
           SET total_games = total_games + 1, 
               highest_score = ?, 
               total_game_time = total_game_time + ?,
               nickname = ?, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE openid = ?`,
          [newHighestScore, game_time, nickname, openid]
        );
      }
      
      await connection.commit();
      console.log('✅ 游戏记录提交成功');
      
      res.json({ 
        code: 200, 
        message: '记录提交成功',
        data: { recordId: insertResult.insertId }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ 提交游戏记录失败:', error);
      res.json({ 
        code: 500, 
        message: '服务器错误: ' + error.message 
      });
    }
  }
  
  submitRecord();
});

// 获取用户统计信息
router.get('/stats/:openid', async (req, res) => {
  try {
    const { openid } = req.params;
    console.log('获取用户统计:', openid);
    
    const [rows] = await db.promise().execute(
      'SELECT total_games, highest_score FROM user_stats WHERE openid = ?',
      [openid]
    );
    
    if (rows.length === 0) {
      console.log('用户不存在，返回默认统计');
      res.json({ 
        code: 200, 
        data: { 
          total_games: 0, 
          highest_score: 0 
        } 
      });
    } else {
      console.log('找到用户统计:', rows[0]);
      res.json({ 
        code: 200, 
        data: rows[0] 
      });
    }
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
    res.json({ 
      code: 500, 
      message: '服务器错误: ' + error.message 
    });
  }
});

// 获取用户游戏历史
router.get('/history/:openid', async (req, res) => {
  try {
    const { openid } = req.params;
    const { limit = 10 } = req.query;
    
    const [rows] = await db.promise().execute(
      'SELECT score, game_time, difficulty, created_at FROM game_records WHERE openid = ? ORDER BY created_at DESC LIMIT ?',
      [openid, parseInt(limit)]
    );
    
    res.json({ 
      code: 200, 
      data: rows 
    });
  } catch (error) {
    console.error('获取游戏历史失败:', error);
    res.json({ 
      code: 500, 
      message: '服务器错误' 
    });
  }
});

module.exports = router;