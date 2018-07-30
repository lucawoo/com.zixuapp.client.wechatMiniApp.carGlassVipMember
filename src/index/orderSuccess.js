// src/index/ordersSuccess.js
Page({
  data:{},
  onLoad: function (options) {
    this.setData({
      outTradeNo: options.outTradeNo,
      buyVipPlanVehicleTypePriceTemp:wx.getStorageSync("buyVipPlanVehicleTypePriceTemp")
    });
    // console.log(options)
  }
})