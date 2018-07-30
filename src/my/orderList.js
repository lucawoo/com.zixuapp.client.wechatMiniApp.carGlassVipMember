var app = getApp();
Page({
  data:{},
  onLoad: function (options) {
    global.this = this;
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getUserOrder",
      successFunc: function (res) {
        console.log(res)
        global.this.setData({ userOrder: res });
      }
    });
  }
})