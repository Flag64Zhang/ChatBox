// pages/audiobox/audiobox.js
Page({
  data: {
    messages: [],
    inputValue: '',
    isVoiceMode: false,
    recording: false,
    recorderManager: null,
    innerAudioContext: null
  },

  onLoad() {
    // 初始化录音管理器
    this.initRecorder();
    // 初始化音频播放器
    this.initAudioPlayer();
    // 加载问卷对话内容
    this.loadSurveyDialog();
  },


  // 加载问卷对话内容
  loadSurveyDialog() {
    const app = getApp();
    if (app.globalData.surveyDialog && app.globalData.surveyDialog.length > 0) {
      // 将问卷对话转换为消息格式
      const surveyMessages = app.globalData.surveyDialog.map(dialog => ({
        type: dialog.role, // 'ai' 或 'user'
        content: dialog.content,
        timestamp: dialog.timestamp
      }));

      // 更新消息列表
      this.setData({
        messages: surveyMessages
      });

      // 滚动到底部
      wx.nextTick(() => {
        wx.createSelectorQuery()
          .select('.chat-container')
          .boundingClientRect(rect => {
            wx.pageScrollTo({
              scrollTop: rect.height,
              duration: 300
            });
          })
          .exec();
      });
    }
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
      console.log('录音文件信息:', {
        tempFilePath: res.tempFilePath,
        duration: res.duration,
        fileSize: res.fileSize
      });
      
      this.setData({ recording: false });
      
      // 先添加语音消息到聊天界面（使用临时路径）
      const voiceMessage = {
        type: 'voice',
        path: res.tempFilePath,
        duration: Math.floor(res.duration / 1000) || 1,
        tempPath: res.tempFilePath // 保存临时路径
      };
      
      this.setData({
        messages: [...this.data.messages, voiceMessage]
      });
      
      // 上传语音文件到服务器
      this.uploadVoiceFile(res.tempFilePath, voiceMessage);
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
    
    // 播放开始事件
    this.innerAudioContext.onPlay(() => {
      console.log('开始播放');
    });
    
    // 播放结束事件
    this.innerAudioContext.onEnded(() => {
      console.log('播放结束');
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
      format: 'mp3'
    };
    
    console.log('开始录音，参数:', options);
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
    if (!filePath) {
      console.error('播放路径为空');
      wx.showToast({
        title: '播放路径无效',
        icon: 'none'
      });
      return;
    }
    
    console.log('开始播放语音:', filePath);
    
    // 停止当前播放
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    
    // 直接播放
    this.startPlayAudio(filePath);
  },

  // 开始播放音频
  startPlayAudio(filePath) {
    this.innerAudioContext.src = filePath;
    this.innerAudioContext.play();
  },

  // 上传语音文件到服务器
  uploadVoiceFile(tempFilePath, voiceMessage) {
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
          
          // 更新消息列表中的文件路径为服务器路径
          const messages = this.data.messages;
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.type === 'voice' && lastMessage.tempPath === tempFilePath) {
            lastMessage.path = `${getApp().globalData.apiBaseUrl}/api/audio/${data.file.fileName}`;
            this.setData({ messages: messages });
          }
          
          wx.showToast({
            title: '语音上传成功',
            icon: 'success'
          });
        } else {
          console.error('上传失败');
          wx.showToast({
            title: '语音上传失败',
            icon: 'none'
          });
        }
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
    console.log('开始调用API，prompt:', prompt);
    
    // 显示加载提示
    wx.showLoading({
      title: '正在思考...',
    });
    
    wx.request({
      url: `${getApp().globalData.apiBaseUrl}/api/chat`,
      method: 'POST',
      data: {
        prompt: prompt
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('API响应:', res.data);
        wx.hideLoading(); // 隐藏加载提示
        
        if (res.data && res.data.success) {
          // 处理返回的消息，移除HTML标签
          let aiMessage = res.data.message;
          aiMessage = aiMessage.replace(/<[^>]+>/g, ''); // 移除所有HTML标签
          
          // 更新消息列表
          const newMessages = [...this.data.messages];
          newMessages.push({
            type: 'ai',
            content: aiMessage
          });
          
          this.setData({
            messages: newMessages
          });
          
          console.log('消息列表更新:', this.data.messages);
        } else {
          wx.showToast({
            title: 'AI回复失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading(); // 隐藏加载提示
        console.error('API调用失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  }
});