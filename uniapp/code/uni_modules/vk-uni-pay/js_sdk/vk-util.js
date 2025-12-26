var vkUtil = {};
var counterNum = 0;

const config = {
	debug: process.env.NODE_ENV !== 'production',
	logger: {
		colorArr: [
			"#0095f8",
			"#67C23A"
		]
	}
};

vkUtil.callFunction = function(obj = {}) {
	let { debug } = config;
	let {
		action,
		data,
		title,
		needAlert = true,
		errLog = true
	} = obj;
	let name;
	let url;
	let callFunctionData = {};
	if (typeof action === "object") {
		name = action.name;
		url = action.action;
		if (url) {
			let { actionKey = "action", dataKey = "data" } = action;
			callFunctionData[actionKey] = url;
			callFunctionData[dataKey] = data;
		} else {
			name = action;
			callFunctionData = data;
		}
	} else {
		name = action;
		callFunctionData = data;
	}
	let Logger = {};
	if (title) uni.showLoading({ title, mask: true });
	if (debug) {
		Logger.startTime = Date.now();
		Logger.params = typeof data == "object" ? JSON.parse(JSON.stringify(data)) : data;
	}
	let promiseAction = new Promise(function(resolve, reject) {
		uniCloud.callFunction({
			name: name,
			data: callFunctionData,
			success(result = {}) {
				let res = result.result;
				if (res.code === 0) {
					if (title) uni.hideLoading();
					if (debug) Logger.result = typeof res == "object" ? JSON.parse(JSON.stringify(res)) : res;
					if (typeof obj.success == "function") obj.success(res);
					if (typeof resolve == "function") resolve(res);
				} else {
					if (title) uni.hideLoading();
					if (errLog) {
						Logger.error = res;
					} else {
						if (debug) Logger.result = typeof res == "object" ? JSON.parse(JSON.stringify(res)) : res;
					}
					if (needAlert && res.msg) vkUtil.alert(res.msg);
					if (typeof obj.fail == "function") obj.fail(res);
					if (typeof reject == "function") reject(res);
				}
			},
			fail(res) {
				if (title) uni.hideLoading();
				Logger.error = res;
				if (!res.msg) res.msg = res.message;
				if (needAlert && res.msg) vkUtil.alert(res.msg);
				if (typeof obj.fail == "function") obj.fail(res);
				if (typeof reject == "function") reject(res);
			},
			complete(res) {
				if (debug) {
					Logger.endTime = new Date().getTime();
					Logger.runTime = (Logger.endTime - Logger.startTime);
					let colorArr = config.logger.colorArr;
					let colorStr = colorArr[counterNum % colorArr.length];
					counterNum++;
					let logUrl = url ? `【${url}】` : "";
					let logFunCtionName = `【云函数请求】【${name}】${logUrl}`;
					let logColorStr = `color:${colorStr};font-size: 12px;font-weight: bold;`;
					console.log("%c--------【开始】" + logFunCtionName + "--------", logColorStr);
					console.log("【请求参数】: ", Logger.params);
					console.log("【返回数据】: ", Logger.result);
					console.log("【总体耗时】: ", Logger.runTime, "毫秒【含页面渲染】");
					console.log("【请求时间】: ", vkUtil.timeFormat(Logger.startTime, "yyyy-MM-dd hh:mm:ss"));
					if (Logger.error) {
						let errorLog = console.warn || console.error;
						if (Logger.error.err && Logger.error.err.stack) {
							console.error("【Error】: ", Logger.error);
							console.error("【Stack】: ", Logger.error.err.stack);
						} else {
							errorLog("【Error】: ", Logger.error);
						}
					}
					console.log("%c--------【结束】" + logFunCtionName + "--------", logColorStr);
				}
				if (typeof obj.complete == "function") obj.complete(res);
			}
		});
	});
	promiseAction.catch(() => {});
	return promiseAction;
}
vkUtil.getOpenid = function() {
	return new Promise((resolve, reject) => {
		let functionName = "";
		let action = "";
		let appid;
		// #ifdef MP-WEIXIN
		// 微信小程序
		functionName = "getWeixinCode";
		action = "pay/code2SessionWeixin";
		appid = uni.getAccountInfoSync().miniProgram.appId;
		// #endif
		// #ifdef MP-ALIPAY
		// 支付宝小程序
		functionName = "getAlipayCode";
		action = "pay/code2SessionAlipay";
		appid = uni.getAccountInfoSync().miniProgram.appId;
		// #endif
		if (functionName) {
			vkUtil[functionName]().then((code) => {
				vkUtil.callFunction({
					action: {
						name: "vk-pay",
						action: action,
						actionKey: "action",
						dataKey: "data"
					},
					data: { code, appid },
					success: (res) => {
						resolve(res);
					},
					fail: (res) => {
						reject(res);
					}
				});
			}).catch(res => {
				reject(res);
			});;
		} else {
			resolve({});
		}
	});
};
/*
通过code获取openid（此方法仅支持微信公众号）微信公众号请看文档：https://vkdoc.fsq.pub/vk-uni-pay/question/question.html#_2、微信公众号支付注意事项
调用示例
vkUtil.getH5Openid(code).then((res) => {

});
*/
vkUtil.getH5Openid = function(code) {
	return new Promise((resolve, reject) => {
		vkUtil.callFunction({
			action: {
				name: "vk-pay",
				action: "pay/code2SessionWeixinH5",
				actionKey: "action",
				dataKey: "data"
			},
			data: { code },
			success: function(res) {
				resolve(res);
			},
			fail: function(res) {
				reject(res);
			}
		});
	});
};
/*
 * 此方法不支持微信公众号，微信公众号请看文档：https://vkdoc.fsq.pub/vk-uni-pay/question/question.html#_2、微信公众号支付注意事项
vkUtil.getWeixinCode().then((code) => {

});
*/
vkUtil.getWeixinCode = function() {
	return new Promise((resolve, reject) => {
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			success(res) {
				resolve(res.code)
			},
			fail(err) {
				reject(new Error('获取微信code失败'))
			}
		})
		// #endif
		// #ifdef APP-PLUS
		plus.oauth.getServices((services) => {
			let weixinAuthService = services.find((service) => {
				return service.id === 'weixin';
			});
			if (weixinAuthService) {
				weixinAuthService.authorize(function(res) {
					resolve(res.code);
				}, function(err) {
					console.log(err);
					reject(new Error('获取微信code失败'));
				});
			}
		});
		// #endif
	})
};

vkUtil.getAlipayCode = function() {
	// #ifdef APP || MP-ALIPAY
	return new Promise((resolve, reject) => {
		uni.login({
			provider: 'alipay',
			success(res) {
				resolve(res.code);
			},
			fail(err) {
				reject(new Error('获取支付宝code失败'));
			}
		});
	});
	// #endif
};

vkUtil.toast = function(title, icon = "none") {
	uni.showToast({
		title,
		icon,
		mask: true,
		duration: 1500
	});
};

vkUtil.alert = function(content, title = "提示") {
	uni.showModal({
		title,
		content,
		showCancel: false
	});
};

vkUtil.timeFormat = function(time, fmt = 'yyyy-MM-dd hh:mm:ss', targetTimezone = 8) {
	try {
		if (!time) {
			return "";
		}
		// 其他更多是格式化有如下:
		// yyyy-MM-dd hh:mm:ss|yyyy年MM月dd日 hh时MM分等,可自定义组合
		let date;
		if (typeof time === "number") {
			if (time.toString().length == 10) time *= 1000;
			date = new Date(time);
		} else {
			date = time;
		}

		const dif = date.getTimezoneOffset();
		const timeDif = dif * 60 * 1000 + (targetTimezone * 60 * 60 * 1000);
		const east8time = date.getTime() + timeDif;

		date = new Date(east8time);
		let opt = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (let k in opt) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (opt[k]) : (("00" + opt[k]).substr(("" + opt[
					k]).length)));
			}
		}
		return fmt;
	} catch (err) {
		// 若格式错误,则原值显示
		return time;
	}
};

vkUtil.checkPlatform = function() {
	// #ifdef H5
	let system = {
		win: false,
		mac: false,
		xll: false
	};
	let p = navigator.platform;
	system.win = p.indexOf("Win") == 0;
	system.mac = p.indexOf("Mac") == 0;
	system.x11 = p == "X11" || p.indexOf("Linux") == 0;
	if (system.win || system.mac || system.xll) {
		return "pc";
	} else {
		if (p.indexOf("iPhone") > -1 || p.indexOf("iPad") > -1) {
			return "ios";
		} else {
			return "android";
		}
	}
	// #endif
};

vkUtil.urlToObject = function(url) {
	let urlParam = url.split("?")[1];
	let obj = {};
	if (urlParam) {
		let arr = urlParam.split("&");
		for (let i of arr) {
			obj[i.split("=")[0]] = i.split("=")[1];
		}
	}
	return obj;
};

vkUtil.objectToUrl = function(obj) {
	let str = "";
	for (let i in obj) {
		str += `&${i}=${obj[i]}`;
	}
	if (str) str = "?" + str.substring(1);
	return str;
};



/**
 * 获取当前H5所在的环境
 */
vkUtil.getH5Env = function() {
	let ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/MicroMessenger/i) == 'micromessenger' && (ua.match(/miniprogram/i) == 'miniprogram')) {
		// 微信小程序
		return "mp-weixin";
	}
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		// 微信公众号
		return "h5-weixin";
	}
	if (ua.match(/alipay/i) == 'alipay' && ua.match(/miniprogram/i) == 'miniprogram') {
		return "mp-alipay";
	}
	if (ua.match(/alipay/i) == 'alipay') {
		return "h5-alipay";
	}
	// 外部 H5
	return "h5";
};


export default vkUtil;
