var app = getApp();
Page({
  data: {
    photoUploadUrl:{}
  },
  onLoad:function(){
    // 获取基本信息
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getConfig",
      successFunc: function (res) {
        global.this.setData({ authorizerConfig: res });
      }
    });
    // 获取上传图片清单
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getPhotoUploadList",
      successFunc: function (res) {
        global.this.setData({ photoUploadList: res });
      }
    });
    // 获取车型车价
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getVehicleTypePrice",
      successFunc: function (res) {
        global.this.setData({ vehicleTypePrice: res });
      }
    });
  },
  onShow: function () {
    app.util.init();
    global.this = this;
    this.setData({ wechatAuthorizer: app.util.getWechatAuthorizer() });
  },
  fileUpload:function(e){
    var uuid = e.currentTarget.dataset.uuid;
    wx.chooseImage({
      count: 1, 
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        app.util.uploadFile({
          file: res.tempFilePaths[0],
          success:function(res){
            var webUrl = res.filePath;
            var data = global.this.data.photoUploadUrl;
            data[uuid] = webUrl;
            global.this.setData({ photoUploadUrl: data});
          }
        });
      }
    })
  }
})