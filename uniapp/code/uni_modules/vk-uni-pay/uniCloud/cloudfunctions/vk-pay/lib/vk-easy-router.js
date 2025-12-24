/*
##### 如果你热爱编程，想快速入门云开发，欢迎使用`vk-unicloud`系列开发框架
##### 无需转变开发习惯，0成本上手云开发。
##### 框架内置了众多API、工具包，为你的业务扫平障碍。使你的项目刚起步进度就是50%（微信登录、短信、验证码、缓存、生成小程序码等等）
##### 从此你又get一个新技能，只需用js，轻松搞定前后台整体业务。
##### `client端` 框架地址：https://ext.dcloud.net.cn/plugin?id=2204
##### `admin端`  框架地址：https://ext.dcloud.net.cn/plugin?id=5043
##### `client端` 框架文档：https://vkdoc.fsq.pub/client/
##### `admin端`  框架文档：https://vkdoc.fsq.pub/admin/
##### 框架学习Q群：`22466457` 欢迎萌新和大佬来使用和共同改进框架
*/

/**
 * 为了不引入其他npm包，这里使用最简单高效的方式进行路由
 * 此云函数的作用仅为配合前端生成支付参数、查询支付订单等API接口，请勿修改此文件代码。
 */
var util = {};
const vkPayNotify = require('../vk-pay-notify/index');
util.router = async function(obj) {
	let { event, context } = obj;
	let { action, data = {}, uniIdToken } = event;
	// 判断是否是第三方支付异步回调
	if (event.path) {
		if (event.path.indexOf("/vk-pay-notify/") === 0) {
			// 执行第三方支付异步回调的逻辑
			return await vkPayNotify.main(event, context);
		} else if (event.path.indexOf("/transfer-notify/") === 0) {
			// 执行转账异步回调的逻辑
			const callback = async (obj, originalParam) => {
				try {
					const service = require(`../service/pay-notify/transfer.js`);
					return await service(obj, originalParam);
				} catch (err) {
					console.error('callbackErr: ', err);
				}
			};
			const vkPay = require('vk-uni-pay');
			return await vkPay.transferNotify({ event, context, callback });
		}
	}
	if (event.httpMethod) {
		if (event.queryStringParameters) {
			let options = event.queryStringParameters;
			try {
				if (typeof options == "string") options = JSON.parse(options);
				data = Object.assign(data, options);
			} catch (err) {}
		}
		if (event.body) {
			let options = event.body;
			if (event.isBase64Encoded) {
				options = Buffer.from(options, 'base64').toString('utf-8');
			}
			try {
				if (typeof options == "string") options = JSON.parse(options);
				if (options.data) data = Object.assign(data, options.data);
			} catch (err) {}
			action = options.action || options.$url;
		}
		if (data.vk_appid) context.APPID = data.vk_appid;
		if (data.vk_platform) context.PLATFORM = data.vk_platform;
	}
	if (!action) return { code: -1, msg: "action不能为空" };
	let originalParam = { event, context };
	let service;
	let serviceParames = {
		data,
		action,
		uniIdToken,
		originalParam
	};
	if (action.indexOf("..") > -1) {
		return { code: -1, msg: "action不允许带.." };
	} else if (action.indexOf("pay-notify") > -1) {
		return { code: -1, msg: "禁止访问" };
	}
	try {
		service = require(`../service/${action}`);
	} catch (err) {
		return returnErrorCatch(err, action);
	}
	try {
		return await service.main(serviceParames);
	} catch (err) {
		return returnRunErrorCatch(err, action);
	}
}

module.exports = util;


function returnErrorCatch(err = {}, action) {
	let { code, message = "" } = err;
	console.error(err);
	if (code == "MODULE_NOT_FOUND" && message.indexOf("service/") > -1) {
		if (["pay/code2SessionAlipay", "pay/code2SessionWeixin", "pay/code2SessionWeixinH5", "pay/createPayment", "pay/queryPayment", "pay/queryRefund", "pay/refund", "pay/transfer", "pay/transfer/transferAlipay", "pay/transfer/transferWxpay", "pay/transfer/transferWxpayOld"].indexOf(action) > -1) {
			return { code: 404,
				msg: `云函数 ${action} 不存在!\n请将项目根目录下 /使用帮助/7、vk-pay云函数示例代码/service/目录下的全部文件复制后、粘贴到 uniCloud/cloudfunctions/vk-pay/service/目录下，并重新上传 vk-pay 云函数（之所以这么做是为了你下次更新插件时不会覆盖你写的云函数代码）`,
				errMsg: message, err };
		} else {
			return { code: 404, msg: `云函数 ${action} 不存在!`, errMsg: message, err };
		}
	} else if (code == "MODULE_NOT_FOUND" && message.indexOf("Cannot find module") > -1) {
		return { code: 500, msg: message, errMsg: message, err };
	} else {
		return { code: 500, msg: `云函数 ${action} 编译异常!`, errMsg: message, err };
	}
}

function returnRunErrorCatch(err = {}, action) {
	let { code, message = "" } = err;
	console.error(err);
	return { code: 500, msg: message || `云函数 ${action} 运行异常!`, errMsg: message, err };
}
