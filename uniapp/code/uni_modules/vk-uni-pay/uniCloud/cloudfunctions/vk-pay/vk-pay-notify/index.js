'use strict';
/**
 * 此为支付异步回调专用云函数，你的业务逻辑写在service目录下
 * 如service/goods.js 写商品订单付款成功后的逻辑
 */
const vkPay = require('vk-uni-pay');
const orderPaySuccess = require('./orderPaySuccess');
exports.main = async (event, context) => {
	return await vkPay.paymentNotify({ event, context, orderPaySuccess });
};
