// pages/chatbox/chatbox.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 初始的组件列表为空
    items: [
      {id:1,name:'組件1',btnshow:true},
      {id:2,name:'組件2',btnshow:true}
    ],
    scanResult: ''
  },
  addItem() {
    // 获取当前的 items 数组
    const newItems = this.data.items;
    // 向数组中添加新元素
    newItems.push({id:this.data.items.length+1,name:`组件 ${newItems.length + 1}`,btnshow:true});
    // 更新数据，触发页面重新渲染
    this.setData({
      items: newItems
    });
  },

  scanQRCode: function () {
    wx.scanCode({
      success: (res) => {
        this.setData({
          scanResult: res.result
        });
        console.log('扫描结果:', res.result);
      },
      fail: (err) => {
        console.error('扫描失败:', err);
      }
    });
  },

  genderChange:function (e) {
    // this.setData({
    //   region: e.detail.value //獲取組件的item-value數據
    // })
    const id = e.currentTarget.dataset.id;
    console.log('genderChange', id)
    let newList = this.data.items;
        newList[id-1].btnshow = false;
    // 更新页面数据
    this.setData({
      items: newList
    });
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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