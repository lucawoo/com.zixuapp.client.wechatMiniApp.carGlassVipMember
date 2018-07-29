var app = getApp();
Page({
  data: {
  },
  onShow: function () {
    app.util.init();
    global.this = this;
    this.setData({ wechatAuthorizer: app.util.getWechatAuthorizer() });
    // 获取基本信息
    app.util.httpRequest({
      url:"/client/wechatMiniApp/carGlassVipMember/getConfig",
      successFunc:function(res){
        global.this.setData({ authorizerConfig: res});
      }
    });
  },
  fileUpload:function(){
    wx.chooseImage({
      count: 1, 
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res.tempFilePaths)
        app.util.uploadFile({
          file: res.tempFilePaths[0],
          success:function(res){
            console.log(res)
          }
        });
      }
    })
  }
})