// pages/index/index.js
const app = getApp();

Page({
  data: {        
    currentPage: 'home',
    score: 0,
    gameStarted: false,
    useOldCanvas: false,
    gameTime: 0,
    timer: null,
    isPaused: false,
    stats: {
      cs: 0,
      fs: 0,
    },
    difficulty: 'normal',
    gameSpeed: 200,
    showDifficultySelect: false,
    difficultyText: '普通',
    timeText: '00:00',
    // 新增排行榜相关数据
    rankList: [],
    userRank: null,
    currentRankType: 'score',
    currentRankDifficulty: 'all',
    openid: '',
    // 下拉菜单数据
    rankTypes: ['按分数排序', '按时间排序'],
    difficultyOptions: ['全部难度', '简单', '普通', '困难'],
    currentRankTypeIndex: 0,
    currentDifficultyIndex: 0
  },

  onLoad: function() {
    this.systemInfo = wx.getSystemInfoSync();
    console.log('屏幕信息:', this.systemInfo);
    
    // 获取用户openid
    this.setData({
      openid: app.globalData.openid || 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    });
    
    // 加载用户统计信息
    this.loadUserStats();
  },

  onShow: function() {
    // 当从其他页面返回时重新加载数据
    if (this.data.currentPage === 'home') {
      this.loadUserStats();
    }
  },

  // 加载用户统计信息
  loadUserStats: function() {
    const that = this;
    wx.request({
      url: `${app.globalData.apiBaseUrl}/game/stats/${this.data.openid}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          that.setData({
            stats: {
              cs: res.data.data.total_games || 0,
              fs: res.data.data.highest_score || 0
            }
          });
          console.log('用户统计加载成功:', that.data.stats);
        }
      },
      fail: (error) => {
        console.error('加载统计信息失败:', error);
        that.setData({
          stats: { cs: 0, fs: 0 }
        });
      }
    });
  },

  // 提交游戏记录
  submitGameRecord: function() {
    const record = {
      openid: this.data.openid,
      nickname: '微信玩家',
      score: this.data.score,
      game_time: this.data.gameTime,
      difficulty: this.data.difficulty
    };

    console.log('提交游戏记录:', record);

    wx.request({
      url: `${app.globalData.apiBaseUrl}/game/submit`,
      method: 'POST',
      data: record,
      success: (res) => {
        if (res.data.code === 200) {
          console.log('游戏记录提交成功');
          this.loadUserStats();
        } else {
          console.error('提交失败:', res.data.message);
        }
      },
      fail: (error) => {
        console.error('提交游戏记录失败:', error);
      }
    });
  },

  // 显示难度选择
  showDifficultySelection: function() {
    this.setData({
      showDifficultySelect: true
    });
  },

  // 选择难度
  selectDifficulty: function(e) {
    const difficulty = e.currentTarget.dataset.difficulty;
    let gameSpeed;
    let difficultyText;
    
    switch(difficulty) {
      case 'easy':
        gameSpeed = 300;
        difficultyText = '简单';
        break;
      case 'normal':
        gameSpeed = 200;
        difficultyText = '普通';
        break;
      case 'hard':
        gameSpeed = 120;
        difficultyText = '困难';
        break;
      default:
        gameSpeed = 200;
        difficultyText = '普通';
    }
    
    this.setData({
      difficulty: difficulty,
      gameSpeed: gameSpeed,
      difficultyText: difficultyText,
      showDifficultySelect: false
    });
    
    this.goToGame();
  },

  // 取消难度选择
  cancelDifficulty: function() {
    this.setData({
      showDifficultySelect: false
    });
  },

  // 开始游戏
  goToGame: function() {
    this.setData({ 
      currentPage: 'game',
      score: 0,
      gameTime: 0,
      timeText: '00:00',
      gameStarted: true,
      isPaused: false,
      useOldCanvas: false
    });
    
    wx.nextTick(() => {
      this.initGame().catch(error => {
        console.error('Canvas 2D 初始化失败:', error);
      });
    });
  },

  // Canvas 2D 初始化
  initGame: function() {
    const that = this;
    
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery();
      query.select('#gameCanvas').fields({ node: true, size: true }).exec((res) => {
        if (!res[0]) {
          reject('无法获取画布');
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        let width = res[0].width;
        let height = res[0].height;
        
        console.log('画布CSS尺寸:', width, 'x', height);
        console.log('当前难度:', this.data.difficulty, '速度:', this.data.gameSpeed);
        
        const gridSize = this.calculateAdaptiveGridSize(width, height);
        const adjustedWidth = Math.floor(width / gridSize) * gridSize;
        const adjustedHeight = Math.floor(height / gridSize) * gridSize;
        
        const dpr = this.systemInfo.pixelRatio;
        canvas.width = adjustedWidth * dpr;
        canvas.height = adjustedHeight * dpr;
        ctx.scale(dpr, dpr);
        
        const gridCountX = adjustedWidth / gridSize;
        const gridCountY = adjustedHeight / gridSize;
        
        that.canvas = canvas;
        that.ctx = ctx;
        that.gameState = {
          snake: [{x: Math.floor(gridCountX / 4), y: Math.floor(gridCountY / 2)}],
          food: {x: 0, y: 0},
          direction: 'right',
          gridSize: gridSize,
          gridCountX: gridCountX,
          gridCountY: gridCountY,
          canvasWidth: adjustedWidth,
          canvasHeight: adjustedHeight,
          gameLoop: null
        };
        
        that.generateFood();
        that.startGameLoop();
        that.startTimer();
        that.drawGame();
        
        resolve();
      });
    });
  },

  // 启动计时器
  startTimer: function() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
    
    const timer = setInterval(() => {
      if (!this.data.isPaused) {
        const newTime = this.data.gameTime + 1;
        const timeText = this.formatTime(newTime);
        
        this.setData({
          gameTime: newTime,
          timeText: timeText
        });
      }
    }, 1000);
    
    this.setData({ timer: timer });
  },

  // 时间格式化函数
  formatTime: function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // 格式化排行榜时间显示
  formatRankTime: function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  },

  // 方向按钮控制
  changeDirection: function(e) {
    if (!this.gameState || this.data.isPaused) return;
    
    const direction = e.currentTarget.dataset.direction;
    const currentDirection = this.gameState.direction;
    
    if ((direction === 'up' && currentDirection !== 'down') ||
        (direction === 'down' && currentDirection !== 'up') ||
        (direction === 'left' && currentDirection !== 'right') ||
        (direction === 'right' && currentDirection !== 'left')) {
      this.gameState.direction = direction;
    }
  },

  // 根据屏幕尺寸动态计算格子大小
  calculateAdaptiveGridSize: function(width, height) {
    const minGridSize = 15;
    const maxGridSize = 35;
    const baseSize = Math.min(width, height);
    
    let gridSize;
    if (baseSize < 300) {
      gridSize = 15;
    } else if (baseSize < 400) {
      gridSize = 20;
    } else if (baseSize < 500) {
      gridSize = 25;
    } else {
      gridSize = 30;
    }
    
    gridSize = Math.max(minGridSize, Math.min(maxGridSize, gridSize));
    return gridSize;
  },

  // 游戏主循环
  startGameLoop: function() {
    if (this.gameState.gameLoop) {
      clearInterval(this.gameState.gameLoop);
    }
    
    this.gameState.gameLoop = setInterval(() => {
      if (!this.data.isPaused) {
        this.moveSnake();
        this.checkCollision();
        this.drawGame();
      }
    }, this.data.gameSpeed);
  },

  // 移动蛇
  moveSnake: function() {
    const head = {...this.gameState.snake[0]};
    
    switch(this.gameState.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    
    this.gameState.snake.unshift(head);
    
    if (head.x === this.gameState.food.x && head.y === this.gameState.food.y) {
      this.setData({ score: this.data.score + 10 });
      this.generateFood();
    } else {
      this.gameState.snake.pop();
    }
  },

  // 生成食物
  generateFood: function() {
    const { gridCountX, gridCountY, snake } = this.gameState;
    
    let newFood;
    let attempts = 0;
    
    do {
      newFood = {
        x: Math.floor(Math.random() * gridCountX),
        y: Math.floor(Math.random() * gridCountY)
      };
      attempts++;
    } while (this.isPositionOnSnake(newFood) && attempts < 100);
    
    this.gameState.food = newFood;
  },

  // 检查位置是否在蛇身上
  isPositionOnSnake: function(position) {
    return this.gameState.snake.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  },

  // 检查碰撞
  checkCollision: function() {
    const head = this.gameState.snake[0];
    const { gridCountX, gridCountY } = this.gameState;
    
    if (head.x < 0 || head.x >= gridCountX || head.y < 0 || head.y >= gridCountY) {
      this.gameOver();
      return;
    }
    
    for (let i = 1; i < this.gameState.snake.length; i++) {
      if (head.x === this.gameState.snake[i].x && head.y === this.gameState.snake[i].y) {
        this.gameOver();
        return;
      }
    }
  },

  // 游戏结束
  gameOver: function() {
    if (this.gameState && this.gameState.gameLoop) {
      clearInterval(this.gameState.gameLoop);
    }
    
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
    
    // 提交游戏记录到后端
    this.submitGameRecord();
    
    this.setData({ 
      currentPage: 'result',
      gameStarted: false,
      isPaused: false
    });
  },

  // 绘制游戏
  drawGame: function() {
    if (!this.ctx || !this.gameState) return;
    
    const ctx = this.ctx;
    const { snake, food, gridSize, canvasWidth, canvasHeight } = this.gameState;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    this.drawGrid(ctx, canvasWidth, canvasHeight, gridSize);
    
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#2E7D32' : '#4CAF50';
      const x = segment.x * gridSize;
      const y = segment.y * gridSize;
      ctx.fillRect(x, y, gridSize, gridSize);
    });
    
    ctx.fillStyle = '#FF6B6B';
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    ctx.fillRect(foodX, foodY, gridSize, gridSize);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`分数: ${this.data.score}`, 10, 20);
  },

  // 普通网格绘制函数
  drawGrid: function(ctx, width, height, gridSize) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    const gridCountX = width / gridSize;
    const gridCountY = height / gridSize;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  },

  // 触摸事件
  onTouchStart: function(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },

  onTouchMove: function(e) {
    if (!this.gameState || !this.data.gameStarted || this.data.isPaused) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const dx = currentX - this.startX;
    const dy = currentY - this.startY;
    
    const threshold = 20;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold && this.gameState.direction !== 'left') {
        this.gameState.direction = 'right';
      } else if (dx < -threshold && this.gameState.direction !== 'right') {
        this.gameState.direction = 'left';
      }
    } else {
      if (dy > threshold && this.gameState.direction !== 'up') {
        this.gameState.direction = 'down';
      } else if (dy < -threshold && this.gameState.direction !== 'down') {
        this.gameState.direction = 'up';
      }
    }
    
    this.startX = currentX;
    this.startY = currentY;
  },

  // 加载排行榜
  loadRankList: function(type = 'score', difficulty = 'all') {
    wx.showLoading({ title: '加载中...' });
    
    wx.request({
      url: `${app.globalData.apiBaseUrl}/rank/list`,
      method: 'GET',
      data: {
        type: type,
        difficulty: difficulty,
        limit: 50
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 200) {
          this.setData({
            rankList: res.data.data,
            currentRankType: type,
            currentRankDifficulty: difficulty
          });
          console.log('排行榜加载成功，数据量:', res.data.data.length);
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('加载排行榜失败:', error);
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },

  // 加载用户排名
  loadUserRank: function() {
    wx.request({
      url: `${app.globalData.apiBaseUrl}/rank/user-rank/${this.data.openid}`,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 200) {
          this.setData({
            userRank: res.data.data
          });
          console.log('用户排名加载成功:', res.data.data);
        }
      },
      fail: (error) => {
        console.error('加载用户排名失败:', error);
      }
    });
  },

  // 排序方式改变
  onRankTypeChange: function(e) {
    const index = parseInt(e.detail.value);
    const type = index === 0 ? 'score' : 'time';
    this.setData({
      currentRankTypeIndex: index
    });
    this.loadRankList(type, this.getCurrentDifficulty());
  },

  // 难度筛选改变
  onDifficultyChange: function(e) {
    const index = parseInt(e.detail.value);
    const difficulty = index === 0 ? 'all' : 
                      index === 1 ? 'easy' : 
                      index === 2 ? 'normal' : 'hard';
    this.setData({
      currentDifficultyIndex: index
    });
    this.loadRankList(this.getCurrentRankType(), difficulty);
  },

  // 获取当前排序类型
  getCurrentRankType: function() {
    return this.data.currentRankTypeIndex === 0 ? 'score' : 'time';
  },

  // 获取当前难度筛选
  getCurrentDifficulty: function() {
    const index = this.data.currentDifficultyIndex;
    return index === 0 ? 'all' : 
           index === 1 ? 'easy' : 
           index === 2 ? 'normal' : 'hard';
  },

  // 跳转到排行榜
  goToRank: function() {
    this.setData({ currentPage: 'rank' });
    this.loadRankList();
    this.loadUserRank();
  },

  // 返回首页
  backToHome: function() {
    if (this.gameState && this.gameState.gameLoop) {
      clearInterval(this.gameState.gameLoop);
    }
    
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
    
    this.setData({ 
      currentPage: 'home',
      gameStarted: false,
      isPaused: false,
      gameTime: 0,
      timeText: '00:00',
      showDifficultySelect: false
    });
    
    // 返回首页时重新加载统计信息
    this.loadUserStats();
  }
})