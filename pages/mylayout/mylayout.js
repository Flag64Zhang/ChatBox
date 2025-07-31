// pages/mylayout/mylayout.js
Page({
  data: {
    list: [
      {
        id: 1,
        title: "教师态度",
        up: 0,
        down: 0,
        children: [
          {
            id: 11,
            title: "耐心讲解",
            up: 0,
            down: 0,
            children: [
              { id: 111, title: "举例生动", up: 0, down: 0 }
            ]
          }
        ]
      },
      {
        id: 2,
        title: "知识点",
        up: 0,
        down: 0,
        children: []
      }
    ],
    showDialog: false,
    inputValue: '',
    addLevel: 0, // 0:一级栏目, 1:二级, 2:三级
    addParentId: null, // 父级id
    activeNames: [], // van-collapse 当前展开的一级栏目id数组
    showQuiz: false,
    quizQuestion: '',
    quizOptions: []
  },
  onLoad(options) {},
  // van-collapse 折叠状态变化
  onCollapseChange(e) {
    this.setData({
      activeNames: e.detail
    });
  },
  // 显示输入弹窗
  showAddInput(e) {
    // 一级不允许添加
    if (e.currentTarget.dataset.level == 0) return;
    this.setData({
      showDialog: true,
      addLevel: e.currentTarget.dataset.level,
      addParentId: e.currentTarget.dataset.id || null,
      inputValue: ''
    });
  },
  // 输入框变化
  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },
  // 确认添加
  onDialogConfirm() {
    const { addLevel, addParentId, inputValue, list } = this.data;
    if (!inputValue.trim()) return;
    if (addLevel == 0) {
      // 添加一级栏目
      list.push({ id: Date.now(), title: inputValue, up: 0, down: 0, children: [] });
    } else if (addLevel == 1) {
      // 添加二级内容
      const idx = list.findIndex(i => i.id == addParentId);
      if (idx > -1) list[idx].children.push({ id: Date.now(), title: inputValue, up: 0, down: 0, children: [] });
    } else if (addLevel == 2) {
      // 添加三级内容
      for (let i of list) {
        const idx = i.children.findIndex(j => j.id == addParentId);
        if (idx > -1) {
          i.children[idx].children.push({ id: Date.now(), title: inputValue, up: 0, down: 0 });
          break;
        }
      }
    }
    this.setData({ list, showDialog: false, inputValue: '' });
  },
  // 点赞/踩事件
  handleVote(e) {
    const { level, id, type } = e.currentTarget.dataset;
    let list = this.data.list;
    if (level == 1) {
      const idx = list.findIndex(i => i.id == id);
      if (idx > -1) {
        if (type === 'up') list[idx].up++;
        if (type === 'down') list[idx].down++;
      }
    } else if (level == 2) {
      for (let i of list) {
        const idx = i.children.findIndex(j => j.id == id);
        if (idx > -1) {
          if (type === 'up') i.children[idx].up++;
          if (type === 'down') i.children[idx].down++;
          break;
        }
      }
    } else if (level == 3) {
      for (let i of list) {
        for (let j of i.children) {
          const idx = j.children.findIndex(k => k.id == id);
          if (idx > -1) {
            if (type === 'up') j.children[idx].up++;
            if (type === 'down') j.children[idx].down++;
            break;
          }
        }
      }
    }
    this.setData({ list });
  },
  // re操作（可扩展为弹窗或其他交互）
  handleRe(e) {
    wx.showToast({ title: 're操作', icon: 'none' });
  },
  // 三级内容点击，针对“知识点”相关弹出追问
  handleLevel3Tap(e) {
    const parentTitle = e.currentTarget.dataset.parent;
    // 仅“知识点”相关弹出追问
    if (parentTitle === '知识点') {
      this.setData({
        showQuiz: true,
        quizQuestion: '哪些知识点有点难？',
        quizOptions: ['函数定义', '递归', '指针', '算法复杂度']
      });
    }
  },
  onQuizSelect(e) {
    const idx = e.currentTarget.dataset.index;
    wx.showToast({ title: `选择了：${this.data.quizOptions[idx]}`, icon: 'none' });
    this.setData({ showQuiz: false });
  },
  onQuizClose() {
    this.setData({ showQuiz: false });
  },
  // 关闭弹窗
  onDialogClose() {
    this.setData({ showDialog: false });
  }
});