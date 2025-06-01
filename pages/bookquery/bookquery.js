// pages/bookquery/bookquery.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookList: [],
    inputValue: '',
    array1: ['选项1', '选项2', '选项3'],
    index1: 0,
    array2: [],
    index2: 0,
    selectedValue: '',
    article: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 示例HTML内容
    const contentMd = `# 这是一级标题
    这是一段普通文本，它可以包含一些 **加粗** 和 *斜体* 文本。
    `;
    console.log(contentMd); // 打印 Markdown 内容，检查是否完整
    let result = app.towxml(contentMd, 'markdown', {
      theme: 'light'
    });
    this.setData({
      article: result
    });

    // const mdContent = `
    // # 标题 1
    // 这是一段示例文本。

    // ## 标题 2
    // - 列表项 1
    // - 列表项 2

    // ### 标题 3
    // \`\`\`javascript
    // function hello() {
    //   console.log('Hello, World!');
    // }
    // \`\`\`
    //     `;

    //   const result = app.towxml(mdContent, 'markdown');
    //   this.setData({
    //     article: result
    //   });

    this.updateArray2();
  },
  bindPickerChange1: function (e) {
    this.setData({
      index1: e.detail.value
    });
    console.log('picker1',e.detail.value)
    this.updateArray2();
  },
  bindPickerChange2: function (e) {
    this.setData({
      index2: e.detail.value,
      selectedValue: this.data.array2[e.detail.value]
    });
  },
  updateArray2: function () {
    const index = parseInt(this.data.index1);
    let options = [];
    if (index === 0) {
      options = ['子选项1-1', '子选项1-2', '子选项1-3'];
    } else if (index === 1) {
      options = ['子选项2-1', '子选项2-2', '子选项2-3'];
    } else {
      options = ['子选项3-1', '子选项3-2', '子选项3-3'];
    }
    this.setData({
      array2: options,
      index2: 0
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

  },
  
  onError: function (e) {
    console.error('内容加载失败', e);
  }
})