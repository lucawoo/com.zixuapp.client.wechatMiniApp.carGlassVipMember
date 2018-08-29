var app = getApp();
Page({
  data: {
    photoUploadUrl:{}
  },
  onLoad:function(){
    // 客户新增需求，已经购买过的用户再次登录小程序，显示页面应该是我的订单页面
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getUserOrder",
      successFunc: function (res) {
        if(res.length != 0){
          wx.navigateTo({
            url: "/src/my/orderList"
          })
        }
      }
    });
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
  },
  cleanVehicleTypePrice: function () {
    global.this.setData({ vehicleTypePriceIndex: null });
  },
  setVehicleTypePrice: function (e) {
    var index = e.currentTarget.dataset.index;
    // 设置前先校验必填图片完整性
    var photoList = global.this.data.photoUploadList;
    var photoUploadUrl = global.this.data.photoUploadUrl;
    for(var i = 0 ; i < photoList.length ; i ++){
      var item = photoList[i];
      if (item.required){
        if (!photoUploadUrl[item.uuid]){
          wx.showModal({
            content: item.keyName+"必须上传",
            showCancel: false,
            confirmText: "我知道了",
          });
          return;
        }
      }
    }
    global.this.setData({ vehicleTypePriceIndex: index });
  },
  viewAgreement:function(){
    wx.navigateTo({
      url: "/src/agreement/info"
    })
  },
  toPay:function(e){
    // 将套餐下标返回后台
    var orderTypeIndex = e.detail.value;
    var vehicleTypePriceIndex = global.this.data.vehicleTypePriceIndex;
    var photoUploadUrl = global.this.data.photoUploadUrl;
    var vehicleTypePrice = global.this.data.vehicleTypePrice[vehicleTypePriceIndex];
    vehicleTypePrice.orderTypeIndex = orderTypeIndex;
    var postData = {
      vehicleTypePriceID: vehicleTypePrice.id,
      photoUrl: photoUploadUrl,
      subscript:orderTypeIndex
    };
    // 保存到全局一下 在另一个页面拿
    wx.setStorageSync("buyVipPlanVehicleTypePriceTemp", vehicleTypePrice);
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/buyVipPlan",
      data:postData,
      successFunc: function (res) {
        var jsapiParameter = res.jsapiParameter;
        var outTradeNo = res.outTradeNo;
        jsapiParameter.success = function(res){
          wx.navigateTo({
            url: "./orderSuccess?outTradeNo=" + outTradeNo
          })
        };
        wx.requestPayment(jsapiParameter)
      }
    });
  }
})