/**
 * 全局错误码
 * 注意：
 * 1. 部分错误用 -1 -2 -3 表示，未写明在全局错误码中，暂不更改
 * 2. 调用第三方接口时返回的错误码原样透传返回，也不在全局错误码中
 */
const ERROR = {
	// 配置错误
	101: "请先配置正确的异步回调URL，参考配置文档：https://vkdoc.fsq.pub/vk-uni-pay/config.html",
	// 参数错误
	1001: "out_trade_no必须是string类型，且不能为空",
	1002: "type必须是string类型，且不能为空，如设置为goods代表商品订单",
	1003: "total_fee必须为正整数（>0的整数）（注意：100=1元）",
	1004: "subject必须是string类型，且不能为空",
	1005: "provider必须是string类型，且不能为空",
	1006: "用户openid不能为空",
	1007: "amount必须是数字类型",
	1008: "amount必须大于0，注意：100=1元（单位分）",
	1009: "account不能为空",
	1010: "real_name不能为空",
	1011: "platform不能为空",
	1012: "openid不能为空",
	1013: "code不能为空",
	1014: "transaction_receipt必须是string类型，且不能为空",
	1015: "transaction_identifier必须是string类型，且不能为空",
	1016: "ios内购凭据校验不通过",
	1017: 'wxpay_virtual不能为空',
	1018: 'buy_quantity必须为正整数（>0的整数）',
	1019: '参数mode错误',
	1020: '付款码已被使用，请刷新重试',
	1021: 'out_bill_no不能为空',
	1022: 'transfer_amount必须大于0，注意：100=1元（单位分）',
	1023: 'transfer_scene_id不能为空',
	1024: 'transfer_scene_report_infos不能为空',
	1025: 'payee_info不能为空',
	// 数据错误
	2001: "订单不存在",
	2002: "订单未支付",
	2003: "订单未退款",
	2004: "该订单暂无法退款，请等1分钟后再试",
	// 运行错误
	3001: "获取支付信息失败，请稍后再试",
	// 权限错误
	4001: "商家关闭了支付功能，请联系商家处理"
}

const subject = "vk-uni-pay";

class VkPayError {
	constructor(options = {}) {
		let { code = -1, msg, subMsg } = options;
		this.code = code;
		this.msg = msg || ERROR[code] || '';
		this.subMsg = subMsg;
		if (subMsg) {
			this.msg += `：${subMsg}`
		}
		this.subject = options.subject || subject;
	}
}

module.exports = VkPayError;
