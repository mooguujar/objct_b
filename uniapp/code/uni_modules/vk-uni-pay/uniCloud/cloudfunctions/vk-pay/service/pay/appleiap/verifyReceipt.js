'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 验证iosIap苹果内购支付凭据
	 * @url pay/appleiap/verifyReceipt 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} out_trade_no 商户订单号
	 * @param {String} transaction_receipt 支付凭据
	 * @param {String} transaction_identifier 支付标识
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, originalParam } = event;
		// 退款开始-----------------------------------------------------------
		let {
			out_trade_no,
			transaction_receipt,
			transaction_identifier,
		} = data;

		let res = await vkPay.appleiap.verifyReceipt({
			out_trade_no,
			transaction_receipt,
			transaction_identifier,
		});

		// 退款结束-----------------------------------------------------------
		return res;
	}
}
