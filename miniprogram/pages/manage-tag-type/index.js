// pages/users-manage/index.js
let app = getApp()
wx.cloud.init({
  env: 'feel-6gdrrxeye8840e66'
})
const db = wx.cloud.database()

import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  _showToast
} from '../../utils/wxShowToast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagInfo: {},
    _id: '',
    allTagType: [],
    dialogVisible: false,
    isAddTagType: true,
    tagTypeName: '',
    category: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAllTagType()
  },

  // 新增
  addSourceType() {
    // typeName
    this.setData({
      dialogVisible: true,
      isAddTagType: true,
      tagTypeName: '',
      category: '',
      order: 1
    })
  },

  // 获取所以
  getAllTagType() {
    let _self = this
    wx.showLoading({
      title: '努力获取所有标签中...',
    })
    wx.cloud.callFunction({
      name: 'getTagType'
    }).then(res => {
      console.log('ACHUAN : getAllTagType : res', res)
      if (res) {
        _self.setData({
          allTagType: res.result.data
        })
        wx.hideLoading({})
      }
    }).catch(console.error)
  },

  // 编辑
  editKeyTypeNama(event) {
    console.log('ACHUAN : editKeyTypeNama : event', event)
    let tagInfo = event.currentTarget.dataset.keyInfo
    console.log('ACHUAN : editKeyTypeNama : tagInfo', tagInfo)
    this.setData({
      dialogVisible: true,
      isAddTagType: false,
      tagInfo: tagInfo,
      tagTypeName: tagInfo.name,
      category: tagInfo.category || '1',
      order: tagInfo.order || 1
    })

  },
  // 修改或新增确定资源类型按钮
  confirmSourceType() {
    // 调用云函数
    let _self = this
    if (_self.data.category == '') {
      _showToast('类别不能为空')
      return
    }
    // 新增
    if (_self.data.isAddTagType) {
      wx.showLoading({
        title: '正在努力添加...',
      })
      var args = {
        name: _self.data.tagTypeName,
        category: _self.data.category,
        order: parseInt(_self.data.order)
      };
      db.collection('tag-type').add({
        data: args
      }).then(res => {
        _showToast(`【${_self.data.tagTypeName}】，添加完成~`)
        _self.getAllTagType()
      })
    } else {
      // 修改
      wx.showLoading({
        title: '正在努力修改名称...',
      })
      let _id = _self.data.tagInfo._id
      let args = {
        _id,
        name: _self.data.tagTypeName,
        category: _self.data.category,
        order: parseInt(_self.data.order)
      };
      console.log('ACHUAN : confirmSourceType : args', args)

      wx.cloud.callFunction({
        name: 'changeTagType',
        data: args
      }).then(res => {
        if (res) {
          wx.hideLoading({
            success: (res) => {
              _showToast(`【${_self.data.tagTypeName}】，已更新`)
            },
          })
          _self.getAllTagType()
        }
      }).catch(console.error)
    }
  },

  onClose(e) {
    // _showToast('取消')
  },

})