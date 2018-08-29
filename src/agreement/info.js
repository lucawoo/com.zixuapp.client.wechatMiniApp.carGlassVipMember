var app = getApp();
var WxParse = require('../../utils/wxParse/wxParse.js');
Page({
  data: {
    
  },
  onLoad: function (options) {
    global.this = this;
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getConfig",
      successFunc: function (res) {
        wx.setNavigationBarTitle({
          title: res.agreementTitle,
        })
        WxParse.wxParse('agreement', 'html', res.agreement, global.this);
      }
    });
  }
})