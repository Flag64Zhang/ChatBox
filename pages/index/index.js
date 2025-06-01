// index.js
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'
Page({
  onClick(){
    console.log('aaa');
    Toast('这是一个普通提示');
  },

  data: {
    value1: 50,
    value2: 100,
    value3: 40,
    value4: 60
  },

  // 基础滑块变化事件
  onChange1(event) {
    this.setData({
      value1: event.detail
    });
  },

  // 自定义范围滑块变化事件
  onChange2(event) {
    this.setData({
      value2: event.detail
    });
  },

  // 自定义样式滑块变化事件
  onChange3(event) {
    this.setData({
      value3: event.detail
    });
  },

  // 带输入框滑块变化事件
  onChange4(event) {
    this.setData({
      value4: event.detail
    });
  },

  // 输入框变化事件
  onInputChange(event) {
    const value = parseInt(event.detail);
    if (!isNaN(value)) {
      this.setData({
        value4: Math.max(0, Math.min(100, value))
      });
    }
  },

    // 显示加载中 Toast
    showLoadingToast() {
      Toast.loading({
        message: '加载中...',
        forbidClick: true,
        loadingType: 'spinner',
        duration: 2000
      });
    },
    
    // 显示成功 Toast
    showSuccessToast() {
      Toast.success('操作成功');
    },
    
    // 显示失败 Toast
    showFailToast() {
      Toast.fail('操作失败');
    },
    
    // 如果需要手动清除 Toast
    clearToast() {
      Toast.clear();
    }
})
