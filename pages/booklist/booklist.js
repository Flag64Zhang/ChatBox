// pages/booklist/booklist.js
const app = getApp();

// 问题配置
const QUESTION_CONFIG = {
  // 基础问题列表
  BASE_QUESTIONS: [
    {
      type: 'choice',
      text: '请选择你的性别：',
      options: ['男', '女', '其他']
    },
    {
      type: 'choice',
      text: '你目前就读的年级是：',
      options: ['大一', '大二', '大三', '大四', '研究生']
    },
    {
      type: 'choice',
      text: '你的专业类别是：',
      options: ['理工类', '文史类', '经管类', '艺术类', '医学类', '其他']
    },
    {
      type: 'choice',
      text: '你平均每周花在学习上的时间是：',
      options: ['10小时以下', '10-20小时', '20-30小时', '30-40小时', '40小时以上']
    },
    {
      type: 'choice',
      text: '你更倾向于哪种学习方式：',
      options: ['自主学习', '课堂学习', '小组讨论', '实践操作', '混合式学习']
    }
  ],
  // AI问题列表（测试阶段使用）
  AI_QUESTIONS: [
    {
      type: 'choice',
      text: '你觉得这节课的内容难度适中吗？',
      options: ['是', '否', '不确定']
    },
    {
      type: 'choice',
      text: '你认为课程内容的组织结构清晰吗？',
      options: ['非常清晰', '比较清晰', '一般', '不太清晰', '很不清晰']
    },
    {
      type: 'choice',
      text: '你对课程中的实践环节满意吗？',
      options: ['非常满意', '比较满意', '一般', '不太满意', '很不满意']
    },
    {
      type: 'choice',
      text: '你觉得老师的讲解方式容易理解吗？',
      options: ['非常容易', '比较容易', '一般', '有点难', '很难理解']
    },
    {
      type: 'choice',
      text: '你在课程中的参与度如何？',
      options: ['非常积极', '比较积极', '一般', '不太积极', '消极']
    },
    {
      type: 'choice',
      text: '你会推荐其他同学选择这门课程吗？',
      options: ['强烈推荐', '可以推荐', '看情况', '不太推荐', '不推荐']
    }
  ],
  // 评分描述
  RATING_DESCRIPTIONS: {
    0: '非常不满意',
    1: '很不满意',
    2: '不满意',
    3: '较不满意',
    4: '一般',
    5: '还可以',
    6: '比较满意',
    7: '满意',
    8: '很满意',
    9: '非常满意',
    10: '极其满意'
  }
};

Page({
  data: {
    currentQuestionIndex: 0,
    totalQuestions: QUESTION_CONFIG.BASE_QUESTIONS.length + QUESTION_CONFIG.AI_QUESTIONS.length,
    currentQuestion: null,
    selectedOption: null,
    inputAnswer: '',
    isLoading: false,
    surveyCompleted: false,
    showRating: false,
    ratingValue: 5,
    answers: [],
    ratingDescriptions: QUESTION_CONFIG.RATING_DESCRIPTIONS,
    completed: false,
    dialogList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 初始化全局对话列表
    if (!app.globalData.surveyDialog) {
      app.globalData.surveyDialog = [];
    }
    
    this.setData({
      currentQuestion: QUESTION_CONFIG.BASE_QUESTIONS[0]
    });

    // 只有在对话列表为空时才添加第一个问题
    if (app.globalData.surveyDialog.length === 0) {
      this.addQuestionToDialog(QUESTION_CONFIG.BASE_QUESTIONS[0].text);
    }
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
      url: 'http://172.20.10.4:3000', // 后端地址
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

  // 添加问题到对话列表
  addQuestionToDialog(questionText) {
    const dialogItem = {
      role: 'ai',
      content: questionText,
      timestamp: new Date().getTime()
    };
    app.globalData.surveyDialog.push(dialogItem);
    this.setData({
      dialogList: app.globalData.surveyDialog
    });
  },

  // 添加答案到对话列表
  addAnswerToDialog(answerText) {
    const dialogItem = {
      role: 'user',
      content: answerText,
      timestamp: new Date().getTime()
    };
    app.globalData.surveyDialog.push(dialogItem);
    this.setData({
      dialogList: app.globalData.surveyDialog
    });
  },

  // 选择选项时自动进入下一题
  selectOption(e) {
    const index = e.currentTarget.dataset.index;
    const answer = this.data.currentQuestion.options[index];
    
    this.setData({ selectedOption: index }, () => {
      // 保存答案到对话列表
      this.addAnswerToDialog(answer);
      
      // 短暂延迟以显示选中效果
      setTimeout(() => {
        this.nextQuestion();
      }, 300);
    });
  },

  // 处理输入
  handleInput(e) {
    this.setData({ inputAnswer: e.detail.value });
  },

  // 处理输入框确认
  handleInputConfirm(e) {
    const value = e.detail.value.trim();
    if (value) {
      // 保存当前答案
      this.addAnswerToDialog(value);
      this.nextQuestion();
    }
  },

  // 获取当前阶段的问题
  async getCurrentQuestion() {
    const { currentQuestionIndex } = this.data;
    const baseQuestionsLength = QUESTION_CONFIG.BASE_QUESTIONS.length;

    // 如果是基础问题阶段
    if (currentQuestionIndex < baseQuestionsLength) {
      return QUESTION_CONFIG.BASE_QUESTIONS[currentQuestionIndex];
    }

    // 如果是AI问题阶段
    const aiQuestionIndex = currentQuestionIndex - baseQuestionsLength;
    return QUESTION_CONFIG.AI_QUESTIONS[aiQuestionIndex];
  },

  // 处理下一个问题
  async nextQuestion() {
    const { currentQuestionIndex, currentQuestion, selectedOption, inputAnswer, answers } = this.data;
    
    // 保存当前答案
    const answer = currentQuestion.type === 'choice' 
      ? currentQuestion.options[selectedOption]
      : inputAnswer;
    
    const newAnswers = [...answers, answer];
    const nextIndex = currentQuestionIndex + 1;

    console.log(`当前问题索引: ${currentQuestionIndex}, 下一个索引: ${nextIndex}, 总问题数: ${this.data.totalQuestions}`);

    // 如果还有下一个问题
    if (nextIndex < this.data.totalQuestions) {
      // 临时设置nextIndex来获取下一个问题
      const originalIndex = this.data.currentQuestionIndex;
      this.setData({ currentQuestionIndex: nextIndex });
      
      const nextQuestion = await this.getCurrentQuestion();
      
      // 恢复原始索引
      this.setData({ currentQuestionIndex: originalIndex });
      
      console.log(`下一个问题: ${nextQuestion.text}`);
      
      // 先添加下一个问题到对话列表
      this.addQuestionToDialog(nextQuestion.text);
      
      this.setData({
        currentQuestionIndex: nextIndex,
        currentQuestion: nextQuestion,
        selectedOption: null,
        inputAnswer: '',
        answers: newAnswers
      });
    } else {
      console.log('问卷完成，显示评分');
      // 问卷完成，显示评分
      this.setData({
        answers: newAnswers,
        showRating: true,
        surveyCompleted: true
      });
      
      // 添加评分提示到对话
      this.addQuestionToDialog('请对本节课程进行评分（0-10分）');
    }
  },

  // 处理评分变化
  handleRatingChange(e) {
    this.setData({ ratingValue: e.detail.value });
  },

  // 处理评分完成
  handleRatingComplete() {
    this.setData({ isLoading: true });
    
    // 添加评分结果到对话
    const ratingText = `我的评分是：${this.data.ratingValue}分 (${this.data.ratingDescriptions[this.data.ratingValue]})`;
    this.addAnswerToDialog(ratingText);

    wx.showToast({
      title: '评分完成',
      icon: 'success',
      duration: 1000
    });

    // 延迟显示完成页面
    setTimeout(() => {
      this.setData({ 
        isLoading: false,
        completed: true
      });
    }, 1000);
  },

  // 返回按钮处理函数
  goBack() {
    wx.switchTab({
      url: '/pages/audiobox/audiobox',
      success: () => {
        console.log('跳转到首页');
      },
      fail: (error) => {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'error',
          duration: 2000
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
});