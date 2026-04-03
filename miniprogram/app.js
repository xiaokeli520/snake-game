// app.js
App({
  globalData: {
    apiBaseUrl: 'http://localhost:3000/api', // 后端API地址
    userInfo: null
  },

  onLaunch: function () {
    console.log('小程序初始化完成');
    this.getUserOpenId();
  },

  // 获取用户唯一标识
  getUserOpenId: function() {
    const that = this;
    wx.login({
      success: (res) => {
        if (res.code) {
          // 使用code作为临时openid，实际项目中应该发送到后端换取真实openid
          const openid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          that.globalData.openid = openid;
          console.log('用户openid:', openid);
        }
      }
    });
  }
});