const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取排行榜
router.get('/list', async (req, res) => {
  try {
    const { type = 'score', difficulty = 'all', page = 1, limit = 20 } = req.query;
    
    console.log('获取排行榜:', { type, difficulty, page, limit });
    
    let whereClause = '';
    let params = [];
    
    if (difficulty !== 'all') {
      whereClause = 'WHERE difficulty = ?';
      params.push(difficulty);
    }
    
    let orderBy = '';
    switch (type) {
      case 'score':
        orderBy = 'ORDER BY score DESC, game_time ASC';
        break;
      case 'time':
        orderBy = 'ORDER BY game_time DESC, score DESC';
        break;
      default:
        orderBy = 'ORDER BY score DESC, game_time ASC';
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    
    // 构建完整的SQL查询 - 不使用参数化查询的LIMIT和OFFSET
    let sql = `SELECT nickname, score, game_time, difficulty, created_at 
               FROM game_records 
               ${whereClause} 
               ${orderBy} 
               LIMIT ${limitNum} OFFSET ${offset}`;
    
    console.log('执行SQL:', sql);
    console.log('参数:', params);
    
    const [rows] = await db.promise().execute(sql, params);
    
    console.log(`返回 ${rows.length} 条排行榜数据`);
    
    res.json({ 
      code: 200, 
      data: rows 
    });
  } catch (error) {
    console.error('❌ 获取排行榜失败:', error);
    res.json({ 
      code: 500, 
      message: '服务器错误: ' + error.message 
    });
  }
});

// 获取用户最高分排名
router.get('/user-rank/:openid', async (req, res) => {
  try {
    const { openid } = req.params;
    console.log('获取用户排名:', openid);
    
    // 获取用户最高分
    const [userScore] = await db.promise().execute(
      'SELECT MAX(score) as max_score FROM game_records WHERE openid = ?',
      [openid]
    );
    
    const maxScore = userScore[0].max_score;
    
    if (!maxScore) {
      console.log('用户暂无游戏记录');
      return res.json({ 
        code: 200, 
        data: { 
          rank: null, 
          total: 0,
          score: 0 
        } 
      });
    }
    
    // 计算排名（分数比该用户高的人数 + 1）
    const [rankResult] = await db.promise().execute(
      'SELECT COUNT(*) as user_rank FROM game_records WHERE score > ?',
      [maxScore]
    );
    
    // 计算总人数
    const [totalResult] = await db.promise().execute(
      'SELECT COUNT(*) as total FROM game_records WHERE score > 0'
    );
    
    const rank = rankResult[0].user_rank + 1;
    const total = totalResult[0].total;
    
    console.log(`用户排名: ${rank}/${total}, 分数: ${maxScore}`);
    
    res.json({ 
      code: 200, 
      data: { 
        rank: rank, 
        total: total,
        score: maxScore
      } 
    });
    
  } catch (error) {
    console.error('❌ 获取用户排名失败:', error);
    res.json({ 
      code: 500, 
      message: '服务器错误: ' + error.message 
    });
  }
});

// 获取难度排行榜
router.get('/difficulty-rank', async (req, res) => {
  try {
    const { difficulty = 'normal' } = req.query;
    
    const [rows] = await db.promise().execute(
      `SELECT nickname, score, game_time, created_at 
       FROM game_records 
       WHERE difficulty = ? 
       ORDER BY score DESC 
       LIMIT 10`,
      [difficulty]
    );
    
    res.json({ 
      code: 200, 
      data: rows 
    });
  } catch (error) {
    console.error('获取难度排行榜失败:', error);
    res.json({ 
      code: 500, 
      message: '服务器错误' 
    });
  }
});

module.exports = router;