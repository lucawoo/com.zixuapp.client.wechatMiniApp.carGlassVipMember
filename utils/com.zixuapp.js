//该util仅适用于com.zixuapp[merchant ext版]下小程序项目项目
//在非com.zixuapp[merchant ext版]下小程序项目使用该util时 请注意授权时序和产品地址
var util = {};
var app = getApp();

// gets third party parameters
var extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {};

if (extConfig.merchantID === undefined) {
  wx.showModal({
    content: '小程序代码不完整，可能会影响使用，如遇异常，请联系管理员。',
    showCancel: false,
  })
}

// storage key
var loginKey = extConfig.pre + extConfig.authorizerID + "_client_login";
var loginUserInfoKey = extConfig.pre + extConfig.authorizerID + "_client_login_user_info";
var wechatAuthorizerKey = extConfig.pre + extConfig.authorizerID + "_wechat_authorizerKey";

// timestamp s
util.getCurrentTimestamp = function () {
  return parseInt(Date.now() / 1000);
}

// third party parameters
util.extConfig = extConfig;

// page init
util.init = function (httpObj) {
  if (httpObj == undefined) {
    httpObj = {};
  }
  // if not logged in
  if (!wx.getStorageSync(loginKey)) {
    util.login(httpObj);
    return;
  }
  // check login status
  var loginValue = wx.getStorageSync(loginKey);
  var timeOutStamp = util.getCurrentTimestamp() - 300;
  if (loginValue.expiresTime == undefined || loginValue.expiresTime < timeOutStamp) {
    // login time out
    util.login(httpObj);
    return;
  }
  util.userInfo();
  util.wechatAuthorizerKey();
}

// clean session token
util.cleanLoginData = function (func) {
  wx.removeStorageSync(loginKey);
  wx.removeStorageSync(loginUserInfoKey);
  wx.removeStorageSync(wechatAuthorizerKey);
}

// get session token
util.getLoginToken = function () {
  var loginValue = wx.getStorageSync(loginKey);
  if (loginValue && loginValue['token'] != undefined) {
    return loginValue['token'];
  } else {
    return null;
  }
}

util.httpRequest = function (obj, abnormalRetry) {
  // url, data, method, successFunc, failFunc
  wx.showLoading({
    title: "加载中",
    mask: true
  });
  wx.showNavigationBarLoading();
  if (abnormalRetry == undefined || !abnormalRetry) {
    if (obj.data == undefined) {
      obj.data = {};
    }
    if (obj.successFunc == undefined) {
      obj.successFunc = function () { };
    }
    if (obj.failFunc == undefined) {
      obj.failFunc = function () { };
    }
    if (obj.method == undefined) {
      obj.method = "POST";
    }
    
  }else{
    if (typeof obj.data == "string"){
      obj.data = JSON.parse(obj.data);
    }
  }
  if (obj.method == "POST") {
    if (util.getLoginToken() != null) {
      obj.data.token = util.getLoginToken();
    }
    obj.data = JSON.stringify(obj.data);
  }
  if(obj.url == undefined){
    wx.hideLoading();
    wx.hideNavigationBarLoading();
    return;
  }
  wx.request({
    url: extConfig.gatewayUrl + obj.url + "?t=" + util.getCurrentTimestamp(),
    data: obj.data,
    method: obj.method,
    dataType: "json",
    success: function (res) {
      var data = res.data;
      if (!data.resultCode) {
        if (data.errCode == 100007 || data.errCode == 100040) {
          util.cleanLoginData();
          util.init(obj);
          return;
        }
        wx.showModal({
          content: (data.errCodeDes == undefined) ? "请求失败" : data.errCodeDes,
          showCancel: true,
          cancelText: "取消",
          confirmText: "重试",
          success: function (res) {
            if (res.confirm) {
              util.httpRequest(obj, true);
            } else {
              obj.failFunc();
            }
          }
        });
        return;
      }
      obj.successFunc(data.data);
    },
    fail: function () {
      obj.failFunc();
    },
    complete: function () {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
    }
  })
}

util.uploadFile = function (obj, abnormalRetry) {
  if (obj == undefined) {
    obj = {};
  }
  if (abnormalRetry == undefined && !abnormalRetry) {
    if (obj.fail == undefined) {
      obj.fail = function () { };
    }
    if (obj.success == undefined) {
      obj.success = function () { };
    }
    if (obj.file == undefined) {
      obj.fail();
      return;
    }
  }
  wx.showLoading({
    title: "上传中",
    mask: true
  });
  wx.showNavigationBarLoading();

  wx.uploadFile({
    url: extConfig.gatewayUrl + "/client/wechatMiniApp/upfile" + "?t=" + util.getCurrentTimestamp(),
    filePath: obj.file,
    name: 'upfile',
    formData: {
      token: util.getLoginToken()
    },
    success: function (res) {
      if (typeof res.data == "string"){
        res.data = JSON.parse(res.data);
      }
      var data = res.data;
      if (data.errCode == 100007 || data.errCode == 100040) {
        wx.showModal({
          content: '登录状到期，请重新登录后操作。',
          showCancel: false,
          success:function(res){
            util.cleanLoginData();
            util.init();
            return;
          },
          fail:function(){
            return;
          }
        })
      }
      obj.successFunc(data.data);
    },
    fail: function () {
      obj.fail();
    },
    complete: function () {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
    }
  })
}

// wechat login pri function
util.login = function (httpObj) {
  wx.login({
    success: function (res) {
      util.httpRequest({
        url: "/client/wechatMiniApp/login",
        data: {
          code: res.code,
          merchantID: extConfig.merchantID,
          authorizerID: extConfig.authorizerID
        },
        successFunc: function (res) {
          wx.setStorageSync(loginKey, res);
          if (httpObj != undefined) {
            util.httpRequest(httpObj,true);
          }
          util.userInfo();
        }
      });
    }
  })
}

// userinfo main
util.userInfo = function () {
  var userInfoVal = wx.getStorageSync(loginUserInfoKey);
  var timeOutStamp = util.getCurrentTimestamp() - 300;
  if (!userInfoVal || userInfoVal.expiresTime == undefined || userInfoVal.expiresTime < timeOutStamp) {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              util.setUserInfo(res);
            }
          })
        } else {
          util.getToGetUserInfoFunc();
        }
      }
    });
  }
}

// set userinfo
util.setUserInfo = function (res, func) {
  if (func == undefined) {
    func = function () { };
  }
  if (res.encryptedData == undefined || res.iv == undefined) {
    return;
  }
  // request decode
  util.httpRequest({
    url: "/client/wechatMiniApp/userInfo",
    data: {
      encryptedData: res.encryptedData,
      iv: res.iv
    },
    successFunc: function (res) {
      res.expiresTime = wx.getStorageSync(loginKey).expiresTime;
      wx.setStorageSync(loginUserInfoKey, res);
      func();
    }
  });
}

// get user info
util.getUserInfo = function () {
  if (wx.getStorageSync(loginUserInfoKey)) {
    return wx.getStorageSync(loginUserInfoKey);
  } else {
    return null;
  }
}

util.wechatAuthorizerKey = function(success){
  if (success == undefined){
    success = function(){};
  }
  if (util.getWechatAuthorizer() == null){
    util.httpRequest({
      url: "/client/wechatMiniApp/wechatAuthorizer",
      data: {
        merchantID: extConfig.merchantID,
        authorizerID: extConfig.authorizerID
      },
      method: "GET",
      successFunc: function (res) {
        util.setWechatAuthorizer(res);
        success(res);
      },
    });
  }else{
    success(util.getWechatAuthorizer());
  }
}

// wechatAuthorizerKey
util.setWechatAuthorizer = function (obj) {
  wx.setStorageSync(wechatAuthorizerKey, obj);
}

util.getWechatAuthorizer = function () {
  if (wx.getStorageSync(wechatAuthorizerKey)) {
    return wx.getStorageSync(wechatAuthorizerKey);
  } else {
    return null;
  }
}

// global , user is not allowed to get userinfo function
util.getToGetUserInfoFunc = function () {
  wx.redirectTo({
    url: '../login/login',
  })
}

module.exports = util;