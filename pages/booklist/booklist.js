// pages/booklist/booklist.js
const app = getApp();

Page({
  data: {
    article: '',
    audioPath: null,
    progress: 0,
    statusText: '请选择MP3文件'    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 示例HTML内容
    // const contentMd = `# 这是一级标题\n\n这是一段普通文本，它可以包含一些 **加粗** 和 *斜体* 文本。`;
    const contentMd = `# 标题 1\n\n这是一段示例文本。\n\n## 标题 2\n\n- 列表项 1\n\n- 列表项 2\n\n### 标题 3\n\n\`\`\`javascript\n\nfunction hello() {\n\n  console.log'Hello, World!');\n\n}\n\n\`\`\``;

    let result = app.towxml(contentMd, 'markdown', {
      theme: 'light'
    });
    this.setData({
      article: result
    });

  },

  goToDetail: function () {
      wx.navigateTo({
          url: '/subpages/pages/usercenter/usercenter'
      });
  },

  toAudioBox:function(){
    wx.redirectTo({
      url: '/pages/audiobox/audiobox',
    });
    console.log('redirect')
  },

  getMsg: function(){
    wx.request({
      url: 'https://silc.vip.cpolar.cn/api/data', // 替换为你的后端地址
      method: 'POST',
      data: {
        key1: 'value1',
        key2: 'value2'
      },
      header: {
        'content-type': 'application/json' // 根据后端要求调整
      },
      success(res) {
        console.log('请求成功:', res.data);
      },
      fail(err) {
        console.error('请求失败:', err);
      }
    });
  },
  // 选择音频文件
  chooseAudio() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['mp3'],
      success: (res) => {
        const file = res.tempFiles[0]
        if (file.size > 10 * 1024 * 1024) { // 限制10MB
          wx.showToast({ title: '文件大小不能超过10MB', icon: 'none' })
          return
        }
        this.setData({
          audioPath: file.path,
          statusText: `已选择: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        })
      },
      fail: (err) => {
        console.error('选择文件失败:', err)
        wx.showToast({ title: '选择文件失败', icon: 'none' })
      }
    })
  },

  // 上传音频文件
  uploadAudio() {
    if (!this.data.audioPath) return
    this.setData({ progress: 0, statusText: '上传中...' })
    wx.uploadFile({
      // url: 'https://your-server-domain.com/upload', // 替换为你的服务器地址
      url:`${getApp().globalData.apiBaseUrl}/api/upload/voice`,
      filePath: this.data.audioPath,
      name: 'audio',
      formData: {
        userId: '123', // 可以添加其他表单数据
        description: '测试上传'
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.success) {
          this.setData({ statusText: '上传成功!' })
          wx.showToast({ title: '上传成功' })
        } else {
          this.setData({ statusText: '上传失败: ' + data.message })
          wx.showToast({ title: '上传失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        this.setData({ statusText: '上传失败' })
        wx.showToast({ title: '上传失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ audioPath: null })
      }
    })
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