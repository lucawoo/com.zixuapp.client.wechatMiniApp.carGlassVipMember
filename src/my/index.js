var app = getApp();
Page({
  data: {
  },
  onShow: function () {
    this.setData({ userInfo: app.util.getUserInfo()});
  }
})