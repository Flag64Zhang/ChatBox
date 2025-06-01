// pages/audiobox/audiobox.js
Page({
  data: {
    messages: [],
    inputValue: '',
    isVoiceMode: true,
    recording: false,
    recorderManager: null,
    innerAudioContext: null
  },

  onLoad() {
    // 初始化录音管理器
    this.initRecorder();
    // 初始化音频播放器
    this.initAudioPlayer();
  },


  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },  

  // 初始化录音管理器
  initRecorder() {
    this.recorderManager = wx.getRecorderManager();
    
    // 录音开始事件
    this.recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({ recording: true });
    });
    
    // 录音结束事件
    this.recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.setData({ recording: false });
      
      // 添加语音消息到聊天界面
      const voiceMessage = {
        type: 'voice',
        path: res.tempFilePath,
        duration: Math.floor(res.duration / 1000) || 1
      };
      
      this.setData({
        messages: [...this.data.messages, voiceMessage]
      });
      
      // 这里可以将语音文件上传到服务器
      this.uploadVoiceFile(res.tempFilePath);
    });
    
    // 录音错误事件
    this.recorderManager.onError((err) => {
      console.error('录音错误', err);
      this.setData({ recording: false });
      wx.showToast({
        title: '录音失败，请重试',
        icon: 'none'
      });
    });
  },

  // 初始化音频播放器
  initAudioPlayer() {
    this.innerAudioContext = wx.createInnerAudioContext();
    
    // 播放错误事件
    this.innerAudioContext.onError((err) => {
      console.error('播放错误', err);
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });
  },


  // 切换输入模式（语音/文字）
  toggleInputMode() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode
    });
  },

  // 开始录音
  startRecord() {
    // 检查权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.startRecording();
            },
            fail: () => {
              wx.showToast({
                title: '需要录音权限',
                icon: 'none'
              });
            }
          });
        } else {
          this.startRecording();
        }
      }
    });
  },

  // 实际开始录音
  startRecording() {
    const options = {
      format: 'mp3', // 可选择 'mp3' 或 'aac'
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000
    };
    
    this.recorderManager.start(options);
  },

  // 结束录音
  endRecord() {
    this.recorderManager.stop();
  },

  // 取消录音
  cancelRecord() {
    this.recorderManager.stop();
    this.setData({ recording: false });
  },

  // 播放语音
  playVoice(e) {
    const filePath = e.currentTarget.dataset.path;
    if (!filePath) return;
    
    this.innerAudioContext.src = filePath;
    this.innerAudioContext.play();
  },

  // 上传语音文件到服务器
  uploadVoiceFile(tempFilePath) {
    wx.uploadFile({
      url: `${getApp().globalData.apiBaseUrl}/api/upload/voice`,
      filePath: tempFilePath,
      name: 'audio',
      formData: {
        userId: '123', // 可以添加其他表单数据
        description: '测试上传'
      },      
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.success) {
          console.log('上传成功', res);
        } else {
          console.error('上传失败');
          wx.showToast({
            title: '语音上传失败',
            icon: 'none'
          });
        } 
        console.log('上传成功', res);
        // 处理服务器返回的语音URL
      },
      fail: (err) => {
        console.error('上传失败', err);
        wx.showToast({
          title: '语音上传失败',
          icon: 'none'
        });
      }
    });
  },

  // 发送文字消息
  sendMessage() {
    const { inputValue, messages } = this.data;
    if (!inputValue.trim()) return;
    
    // 添加用户消息到列表
    const newMessages = [...messages, {
      type: 'user',
      content: inputValue
    }];
    
    this.setData({
      messages: newMessages,
      inputValue: ''
    });
    
    // 调用API发送消息
    this.callChatAPI(inputValue);
  },

  // 调用聊天API
  callChatAPI(prompt) {
    // 这里是之前的聊天API调用逻辑
    // ...
  }
});