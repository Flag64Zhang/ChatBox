// pages/bookme/bookme.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canSubscribe: false, // 是否可以订阅
    templateId: 'GTI9QsjIhxZyCbKXPb9w6WOQqvXO9id0qaLX-cHwpHY', // 从后台获取或直接写在这里    
    showSurvey: false, // 是否显示问卷弹窗
    surveyResult: null, // 问卷结果
    subscribed: false, // 补充：订阅状态
    userInfo: null // 新增：用户信息
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

    // 移除页面加载时主动拉取订阅授权
    // this.requestSubscribe();

    // 拉取用户信息
    this.getUserProfile();

    // 检查是否已填写问卷
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.checkSurvey(openid);
    } else {
      // openid获取后再检查问卷
      this.surveyCheckPending = true;
    }
  },  

  // 2. 将 code 发送到后端服务器
  sendCodeToServer(code) {
    wx.request({
      url: 'http://localhost:3000/api/get-openid', // 替换为你的后端接口
      method: 'POST',
      data: { code },
      success: (res) => {
        const openid = res.data.openid;
        console.log('获取openid成功:', openid);
        // 存储到全局或本地缓存
        getApp().globalData.openid = openid;
        wx.setStorageSync('openid', openid);

        // openid获取后检查问卷
        if (this.surveyCheckPending) {
          this.checkSurvey(openid);
        }
      },
      fail: (err) => {
        console.error('请求后端失败:', err);
      }
    });
  },

  // 检查是否已填写问卷
  checkSurvey(openid) {
    wx.request({
      url: 'http://127.0.0.1:3000/api/get-survey', // 后端接口：根据openid获取问卷
      method: 'POST',
      data: { openid },
      success: (res) => {
        if (!res.data || !res.data.survey) {
          // 未填写问卷，弹出问卷
          this.setData({ showSurvey: true });
        }
      },
      fail: (err) => {
        console.error('获取问卷失败:', err);
      }
    });
  },

  // 问卷提交事件
  handleSurveySubmit(e) {
    const surveyResult = e.detail.value; // 假设表单提交
    const openid = wx.getStorageSync('openid');
    wx.request({
      url: 'http://127.0.0.1:3000/api/save-survey', // 后端接口：保存问卷
      method: 'POST',
      data: { openid, survey: surveyResult },
      success: (res) => {
        wx.showToast({ title: '问卷提交成功', icon: 'success' });
        this.setData({ showSurvey: false, surveyResult });
      },
      fail: (err) => {
        wx.showToast({ title: '提交失败', icon: 'none' });
      }
    });
  },

  // 订阅按钮点击事件
  handleSubscribe() {
    // 只在用户点击时请求授权
    if (!this.data.subscribed) {
      this.requestSubscribe();
      return;
    }

    // 已授权，发送订阅请求
    wx.request({
      url: 'http://127.0.0.1:3000/api/send-subscribe',
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
        console.log('requestSubscribeMessage返回:', res);
        if (res[this.data.templateId] === 'accept') {
          this.setData({ subscribed: true });
          wx.showToast({
            title: '授权成功',
            icon: 'success'
          });
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
        // 增加详细错误提示
        wx.showModal({
          title: '授权失败',
          content: '请检查小程序appid、模板id是否正确，或是否在真机环境下测试。错误信息：' + JSON.stringify(err),
          showCancel: false
        });
      }
    });
  },  

  // 获取用户昵称和头像
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({ userInfo: res.userInfo });
      },
      fail: () => {
        wx.showToast({ title: '未授权获取用户信息', icon: 'none' });
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