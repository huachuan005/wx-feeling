// pages/random-feel/index.js
const app = getApp().globalData
var animate = null
var nowAnimate = 0

import envData from "../../envList.js";
wx.cloud.init({
  env: envData.envList.envId,
})
const db = wx.cloud.database()



import {
  _showToast
} from '../../utils/wxShowToast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: '开始',
    randomVisible: false, // 随机可见
    bigtitlehide: false, // 大标题隐藏
    loadingVisible: false, // 大标题隐藏
    userInfo: {},
    pyqDataList: [],
    feelCardVisible: false,
    keyVal: '',
    headingText: 'FEEL',
  },

  onLoad() {
    let userInfoT = wx.getStorageSync('userInfo') || {}
    this.setData({
      userInfo: userInfoT
    })

  },

  // 开始随机心情关键词
  async refreshRandom() {
    // wx.showLoading({
    //   title: '正在搜寻中...',
    // })

    // 获取所有key类型
    let _self = this
    let keyTypeList = []
    let tagTypeList = []
    _self.setData({
      loadingVisible: true
    })
    const db = wx.cloud.database()

    await db.collection('key-type').get().then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      let resT = res.data.filter(item => item.isVisible)
      keyTypeList = resT
    }).catch(err => {
      console.error('ACHUAN : db.collection : err', err)
    })

    await wx.cloud.callFunction({
      name: 'getTagType'
    }).then(res => {
      if (res) {
        tagTypeList = res.result.data
      }
    }).catch((err) => {
      console.error('ACHUAN : db.collection : err', err)
    })

    wx.hideLoading({})

    var keyTypeListT = _self.shuffle(JSON.parse(JSON.stringify(keyTypeList.concat(tagTypeList)))); // 打乱数组，结果不唯一
    // 循环出随机的坐标位置和字体大小
    for (var i = 0; i < keyTypeListT.length; i++) {
      var fontsize = 30 + Math.floor(Math.random() * 40)
      var x = Math.floor(Math.random() * 80)
      var y = Math.floor(Math.random() * 70)
      keyTypeListT[i].fontsize = fontsize
      keyTypeListT[i].x = x
      keyTypeListT[i].y = y
      keyTypeListT[i].show = false
    }

    _self.setData({
      randoms: keyTypeListT,
      loadingVisible: false
    })

    animate = setInterval(function () {
      // 计时器让randoms显示出来
      _self.setData({
        ['randoms[' + nowAnimate + '].show']: true
      })
      nowAnimate++
      // 长度相等的时候
      if (nowAnimate == _self.data.randoms.length) {
        if (animate) {
          clearInterval(animate)
          _self.setData({
            state: '停止',
            bigtitlehide: true,
            randomVisible: false,
            randoms: []
          })
          nowAnimate = 0
          _self.refreshRandom()
        }
      }
    }, 800)

  },

  // 开始随机按钮
  onButton() {
    var that = this
    if (this.data.state == '开始') {
      this.setData({
        state: '停止',
        bigtitlehide: true,
        randomVisible: true,
        feelCardVisible: false,
        randoms: []
      })
      this.refreshRandom()
    } else if (this.data.state == '停止') {
      this.setData({
        state: '开始',
        randomVisible: false, // 随机可见
        randoms: [],
        bigtitlehide: false,
        headingText: 'FEEL',
      })
      if (animate) {
        clearInterval(animate)
      }
      nowAnimate = 0
    }
  },

  // 点击心情
  onFeel(event) {
    const _self = this
    // 重置相关信息
    this.setData({
      state: '开始',
      randomVisible: false,
    })
    // 清除计时器
    setTimeout(() => {
      clearInterval(animate)
    }, 500)
    // 现在动画的样式
    nowAnimate = 0

    let val = event.currentTarget.dataset.item.name // 点击的name
    let category = event.currentTarget.dataset.item.category // 类别
    if (val == '') {
      _showToast('关键词为空...')
      return
    }
    wx.showLoading({
      title: `【${val}】搜索中...`,
    })

    let _ = db.command
    db.collection('pyq-data')
      .where(_.or([{
        // 标题
        title: db.RegExp({ // 使用正则查询，实现对搜索的模糊查询
          regexp: val,
          options: 'i', //大小写不区分
        }),
      },
      { // 内容
        content: db.RegExp({
          regexp: val,
          options: 'i',
        }),
      },
      { // keyTypeArr
        keyTypeArr: db.RegExp({
          regexp: val,
          options: 'i',
        }),
      },
      { // selectTagTypeArr
        selectTagTypeArr: db.RegExp({
          regexp: val,
          options: 'i',
        }),
      }
      ])).get()
      .then(res => {
        let resT = _self.shuffle(JSON.parse(JSON.stringify(res.data)))
        wx.hideLoading({})
        this.setData({
          feelCardVisible: resT.length > 0,
          pyqDataList: resT.slice(0, 10),
          keyVal: val,
          headingText: 'FEEL',
          bigtitlehide: false
        })
        if (resT.length === 0) {
          this.setData({
            headingText: `${val}-关键词没有信息，换一个关键字搜索试试`,
            bigtitlehide: false
          })
        }
      })
      .catch(res => {
        wx.hideLoading({
          success: (res) => {
            _showToast('搜索失败，联系客服')
          },
        })
        this.setData({
          feelCardVisible: false,
        })
      })

  },

  // 随机打乱数组
  shuffle(arr) {
    var len = arr.length;
    for (var i = 0; i < len - 1; i++) {
      var index = parseInt(Math.random() * (len - i));
      var temp = arr[index];
      arr[index] = arr[len - i - 1];
      arr[len - i - 1] = temp;
    }
    return arr;
  },

  onHide() {
    this.setData({
      state: '开始',
      bigtitlehide: false,
      randomVisible: false,
      randoms: []
    })
    clearInterval(animate)

  },

  // 复制成功
  onCopy(event) {
    // 点击复制
    const _self = this
    const item = event.currentTarget.dataset.item
    console.log('ACHUAN : onCopy : item', item)
    let content = item.content
    let copyCountT = parseInt(item.copyCount) + 1
    let lookCountT = parseInt(item.lookCount) + 2
    let _id = item._id
    if (content === '') {
      _showToast('无可复制内容~')
      return
    }
    wx.setClipboardData({
      data: content,
      success: function (res) {
        // todo 复制成功之后走一次接口，记录被复制的次数
        _showToast(`已复制：${content}`)
        _self._copyAdd(_id, copyCountT, lookCountT)
      }
    })
  },

  // copy自增成功
  _copyAdd(_id, copyCountT, lookCountT) {
    let copyCount = copyCountT
    let lookCount = lookCountT
    wx.cloud.callFunction({
      name: 'handleData',
      data: {
        handleType: 'changeCopy',
        _id,
        copyCount,
        lookCount
      }
    }).then((res) => {
      console.info('copy数量增加完成！')
    })
  },


  // 跳转编辑
  jumpEdit(event) {
    let item = JSON.parse(JSON.stringify(event.currentTarget.dataset.item))
    // 跳转页面，传递数据
    wx.navigateTo({
      url: `/pages/manage-data/index?pageType=change&_id=${item._id}`
    })
  },

})