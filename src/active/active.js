var app = getApp();
Page({
  data: {
  },
  onLoad:function(){
    // 取得会员注册项
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/getRegistrationInformation",
      successFunc: function (res) {
        // 判断会员是否已注册
        app.util.httpRequest({
          url: "/client/wechatMiniApp/carGlassVipMember/getUserRegistration",
          successFunc: function (userRegistration) {
            if (userRegistration.length != 0 && res.required.length != 0) {
              // 表单没有必填信息或者用户已经录入信息 代表用户已经登记
              // 跳转到带tab栏的页面
              wx.switchTab({
                url: '../index/index',
                fail: function () {
                  global.this.onShow();
                }
              })
            } else {
              // 会员需要登记 动态修改 title
              wx.setNavigationBarTitle({
                title: "会员登记"
              });
              // 表单信息setData
              global.this.setData({ inputKey: res });
            }
          }
        });
      }
    });
  },
  onShow: function () {
    app.util.init();
    global.this = this;
    // 每个页面的onshow方法都要插入 app.util.init() 方法 保证时序
  },
  formSubmit: function (e) {
    // 获取表单参数
    var registrationInformation = global.this.data.inputKey;
    // 已填校验
    if (registrationInformation.required.length != 0){
      for (var i = 0; i < registrationInformation.required.length ; i++){
        var item = registrationInformation.required[i];
        if (e.detail.value[item.uuid] == undefined || e.detail.value[item.uuid].replace(/\s+/g, '') == ""){
          wx.showModal({
            content: item.keyName+'为必填',
            showCancel: false,
          })
          return;
        }
      }
    }
    // 构造提交对象
    var sendFromData = {};
    // 遍历校验空值参数
    Object.keys(e.detail.value).forEach(function (key) {
      var value = e.detail.value[key];
      value = value.replace(/\s+/g, '');
      if (value != ''){
        sendFromData[key] = value;
      }
    });
    // 表单提交后台
    app.util.httpRequest({
      url: "/client/wechatMiniApp/carGlassVipMember/setUserRegistration",
      data: sendFromData,
      successFunc: function (res) {
        wx.showToast({
          title:"激活成功",
          icon:"success",
          mask:true,
          duration:1500,
          success:function(){
            setTimeout(function(){
              global.this.onLoad();
            },1500);
          }
        });
      }
    });
  }
})