// components/index/card-c/card-c.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onDetail() {
      wx.navigateTo({
        url: `/pages/movie-detail/movie-detail`
      })
    }
  }
})
