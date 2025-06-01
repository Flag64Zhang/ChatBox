// pages/bookme/bookme.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canSubscribe: false, // 是否可以订阅
    templateId: 'GTI9QsjIhxZyCbKXPb9w6WOQqvXO9id0qaLX-cHwpHY', // 从后台获取或直接写在这里    
    newsList: [
      {
        id: 1,
        title: "中国空间站将开展多项科学实验，涉及微重力物理领域",
        subtitle: "天舟六号货运飞船已完成物资补给",
        date: "2025-04-27 14:30"
      },
      {
        id: 2,
        title: "全球气候变化峰会今日开幕，多国承诺加强碳中和合作",
        subtitle: "中国代表团提出“绿色技术共享”倡议",
        date: "2025-04-26 09:15"
      }
    ],
    hasMore: true // 是否显示加载更多
  },

  // 点击新闻跳转详情页
  handleNewsTap(e) {
    const newsId = e.currentTarget.dataset.newsid;
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${newsId}`
    });
  },

  // 加载更多新闻（示例逻辑，需替换为实际接口请求）
  loadMoreNews() {
    // 模拟异步加载
    setTimeout(() => {
      const newNews = [
        {
          id: 3,
          title: "人工智能大模型技术突破，图像生成效率提升300%",
          subtitle: "某科技公司发布新一代多模态模型",
          date: "2025-04-25 16:45"
        }
      ];
      this.setData({
        newsList: this.data.newsList.concat(newNews),
        hasMore: newNews.length > 0 // 若无新数据则隐藏按钮
      });
    }, 1500);
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取code成功:', res.code);
          this.sendCodeToServer(res.code); // 发送到后端
        } else {
          console.error('获取code失败:', res.errMsg);
        }
      },
      fail: (err) => {
        console.error('wx.login调用失败:', err);
      }
    });
  },  

  // 2. 将 code 发送到你的服务器
  sendCodeToServer(code) {
    wx.request({
      url: 'https://silc.vip.cpolar.cn/api/get-openid', // 替换为你的后端接口
      method: 'POST',
      data: { code },
      success: (res) => {
        const openid = res.data.openid;
        console.log('获取openid成功:', openid);
        // 存储到全局或本地缓存
        getApp().globalData.openid = openid;
        wx.setStorageSync('openid', openid);
      },
      fail: (err) => {
        console.error('请求后端失败:', err);
      }
    });
  },

   // 订阅按钮点击事件
   handleSubscribe() {
    if (!this.data.subscribed) {
      this.requestSubscribe(); // 先请求授权
      return;
    }

    // 已授权，发送订阅请求
    wx.request({
      url: 'https://silc.vip.cpolar.cn/api/send-subscribe',
      method: 'POST',
      data: {
        templateId: this.data.templateId,
        openid: getApp().globalData.openid
      },
      success: (res) => {
        wx.showToast({
          title: '消息已发送',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.error('请求失败', err);
      }
    });
  },

  // 请求订阅授权
  requestSubscribe() {
    wx.requestSubscribeMessage({
      tmplIds: [this.data.templateId],
      success: (res) => {
        if (res[this.data.templateId] === 'accept') {
          this.setData({ subscribed: true });
          wx.showToast({
            title: '授权成功',
            icon: 'success'
          });
          // 这里可以立即发送订阅请求或让用户手动点击
        } else {
          wx.showToast({
            title: '您拒绝了授权',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('授权失败', err);
        wx.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        });
      }
    });
  },  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})