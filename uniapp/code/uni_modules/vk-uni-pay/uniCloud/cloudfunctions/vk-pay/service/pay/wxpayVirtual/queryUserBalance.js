'use strict';
const vkPay = require("vk-uni-pay");
module.exports = {
	/**
	 * 查询代币余额
	 * @url wxpayVirtual/queryUserBalance 前端调用的url参数地址
	 * data 请求参数 说明
	 * @param {String} openid 用户的openid
	 * @param {String} userIp 用户的ip地址
	 * res 返回参数说明
	 * @param {Number} code 错误码，0表示成功
	 * @param {String} msg 详细信息
	 */
	main: async (event) => {
		let { data = {}, originalParam } = event;
		let res = { code: 0, msg: '' };
		// 转账开始-----------------------------------------------------------
		let {
			openid, // 用户的openid
		} = data;
		let userIp = originalParam.context.CLIENTIP;
		// 获取微信虚拟支付实例
		const wxpayVirtualManager = await vkPay.getWxpayVirtualManager();
		// 查询代币余额
		res = await wxpayVirtualManager.queryUserBalance({
			openid, // 用户的openid
			userIp, // 用户的ip地址
		});
		// 转账结束-----------------------------------------------------------
		return res;
	}
}
