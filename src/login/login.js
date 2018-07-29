var app = getApp();
Page({
  data: {
  },
  onShow: function () {
    global.this = this;
    app.util.wechatAuthorizerKey(function(res){
      global.this.setData({ wechatAuthorizer:res});
    });
  },
  bindGetUserInfo:function(res){
    app.util.setUserInfo(res.detail,function(){
      wx.redirectTo({
        url: '../active/active',
        fail:function(){
          global.this.onShow();
        }
      })
    });
  }
})