'use strict';
/**
 * 此处建议只改下订单状态，保证能及时返回给第三方支付服务器成功状态
 * 且where条件可以增加判断服务器推送过来的金额和订单表中订单需支付金额是否一致
 * 将消息发送、返佣、业绩结算等业务逻辑异步处理(写入异步任务队列表)
 * 如开启定时器每隔5秒触发一次，处理订单
 */
module.exports = async (obj, originalParam) => {
	let { data = {} } = obj;
	// 注意：代码能执行到这里，代表用户确实已经支付了，且已校验了支付的合法性。
	let { type } = data;
	try {
		const service = require(`../service/pay-notify/${type}.js`);
		if (typeof service === "function") {
			return await service(obj, originalParam);
		} else {
			console.error("可以发邮箱或其他形式的消息 推送给管理员，告知该订单类型不存在");
		}
	} catch (err) {
		console.error(err);
		return err.stack;
	}
};
