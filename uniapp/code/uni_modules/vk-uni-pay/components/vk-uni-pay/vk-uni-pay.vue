<template>
	<view class="vk-uni-pay"></view>
</template>

<script>
var intervalID;
var myOpenid;
import vkUtil from "../../js_sdk/vk-util.js";
// #ifdef APP
import appleiapSdk from "../../js_sdk/appleiap.js";
// #endif

/**
 * vk-uni-pay支付组件
 * @description 此组件为vk-uni-pay支付使用
 * @example <vk-uni-pay ref="vkPay"></vk-uni-pay>
 */
export default {
	name: "vk-uni-pay",
	emits: ["update:status", "update:codeUrl", "update:qrcodeImage", "init", "create", "success", "fail", "cancel", "userPaying"],
	props: {
		/**
		 * 查询支付订单的云函数
		 * :query-payment-action="vkPay.queryPaymentAction"
		 */
		queryPaymentAction: {
			type: [Object, String],
			default() {
				return {
					name: "vk-pay",
					action: "pay/queryPayment",
					actionKey: "action",
					dataKey: "data"
				};
			}
		},
		/**
		 * PC支付的付款二维码地址
		 * :code-url.sync="vkPay.codeUrl"
		 */
		codeUrl: {
			type: String
		},
		/**
		 * PC支付的付款二维码图片base64值
		 * :qrcode-image.sync="vkPay.qrcodeImage"
		 */
		qrcodeImage: {
			type: String
		},
		/**
		 * 0:等待发起支付 1:支付中 2:已支付
		 * :status.sync="vkPay.status"
		 */
		status: {
			type: Number,
			default: 0
		},
		/**
		 * 当前页面是否是显示状态，主要用于配合polling使用
		 * :page-show="vkPay.pageShow"
		 */
		pageShow: {
			type: Boolean,
			default: true
		},
		/**
		 * 启用轮询检测订单支付状态（仅h5支付有效）
		 * :polling="vkPay.polling"
		 */
		polling: {
			type: Boolean,
			default: false
		},
		/**
		 * 轮询间隔
		 * :polling-time="vkPay.pollingTime"
		 */
		pollingTime: {
			type: [Number, String],
			default: 1500
		},
		/**
		 * 仅微信手机外部浏览器H5支付时有效
		 * :return-url="vkPay.returnUrl"
		 */
		returnUrl: {
			type: String
		},
		/**
		 * 支付成功后，是否需要等待异步回调全部执行完成后才通知前端 设置为 false
		 * 因为支付成功到你的异步回调全部执行完成需要时间，这期间无法保证前后顺序
		 * 因此在前端接收到支付成功回调时，再去云端检查下异步回调是否全部执行完成
		 * :await-notify="vkPay.awaitNotify"
		 */
		awaitNotify: {
			type: Boolean,
			default: false
		},
		/**
		 * 支付成功后，是否需要返回支付订单数据 默认true
		 * :pay-order-info="vkPay.payOrderInfo"
		 */
		payOrderInfo: {
			type: Boolean,
			default: true
		},
		/**
		 * 是否需要打印调试日志（当前仅用于ios内购时生效）
		 * :debug="debug"
		 */
		debug: {
			type: Boolean,
			default: false
		},
		/**
		 * 是否自动获取小程序的openid（若传false，则在createPayment时需要自己传对应的openid）
		 * :auto-get-openid="true"
		 */
		autoGetOpenid: {
			type: Boolean,
			default: true
		}
	},
	data: function () {
		// 组件创建时,进行数据初始化
		return {
			// 当前平台
			platform: "other",
			// 表单提交的数据
			form1: {
				openid: "",
				out_trade_no: "",
				isPC: false // 当前是否是电脑访问
			},
			queryLoading: false // 支付结果查询中
		};
	},
	mounted() {
		this.init();
	},
	// #ifdef VUE2
	destroyed() {
		if (intervalID) clearInterval(intervalID);
	},
	// #endif
	// #ifdef VUE3
	unmounted() {
		if (intervalID) clearInterval(intervalID);
	},
	// #endif
	methods: {
		// 初始化
		init() {
			let that = this;
			// #ifdef APP
			that.platform = "app";
			// #endif
			// #ifdef H5
			that.platform = "h5";
			that.form1.isPC = vkUtil.checkPlatform() == "pc" ? true : false;
			// #endif
			// #ifdef MP-WEIXIN
			that.platform = "mp-weixin";
			// #endif
			// #ifdef MP-ALIPAY
			that.platform = "mp-alipay";
			// #endif
			// #ifdef MP-TOUTIAO
			that.platform = "mp-toutiao";
			// #endif
			// #ifdef MP-HARMONY
			that.platform = "mp-harmony";
			// #endif
			that.getOpenid();
			that.$emit("init");
		},
		// 获取openid(小程序支付需要openid)
		getOpenid() {
			let that = this;
			if (myOpenid && !that.form1.openid) {
				that.form1.openid = myOpenid;
			}
			return new Promise((resolve, reject) => {
				if (!that.autoGetOpenid) {
					resolve();
				} else if (that.form1.openid) {
					resolve(that.form1.openid);
				} else {
					vkUtil.getOpenid()
						.then(res => {
							myOpenid = res.openid;
							that.form1.openid = res.openid;
							resolve(res.openid);
						})
						.catch(res => {
							reject(res);
						});
				}
			});
		},
		/**
		 * 发起支付
		 * provider		支付供应商
		 * total_fee		支付金额 单位分 100 = 1元
		 * out_trade_no	支付订单号
		 * subject		订单标题
		 * body				订单内容
		 */
		createPayment(obj = {}) {
			let that = this;
			let { form1 } = that;
			let { needAlert = false } = obj;
			form1 = Object.assign(form1, obj.data);
			if (form1.provider === "appleiap") {
				// ios内购走特殊逻辑
				// #ifndef APP
				uni.showToast({
					mask: true,
					title: "请在app环境内发起支付",
					icon: "none"
				});
				return;
				// #endif
				// #ifdef APP
				return this._appleiapCreatePayment(obj);
				// #endif
			}
			that.$emit("update:status", 0);
			uni.showLoading({ title: "请求中...", mask: true });
			that.getOpenid()
				.then(() => {
					vkUtil.callFunction({
						action: obj.action,
						data: form1,
						needAlert,
						success: res => {
							// 如果用户的create函数存在，且返回值是false，则不再执行后续逻辑
							let paymentCreateRes = that._paymentCreate(res, obj.create);
							if (typeof paymentCreateRes === "boolean" && paymentCreateRes === false) {
								return;
							}
							let { pay_type = "", provider = "", out_trade_no } = res;
							if (out_trade_no) that.form1.out_trade_no = out_trade_no;
							if (provider === "vkspay") {
								that._vkspay(res, obj);
							} else {
								if (pay_type.indexOf("_codepay") > -1) {
									that._codepay(res, obj);
								} else if (
									res.needQRcode ||
									that.platform == "h5" ||
									pay_type.indexOf("_h5") > -1 ||
									(form1.alipayAppPayToH5Pay && that.platform == "app" && form1.provider == "alipay")
								) {
									that._h5Pay(res, obj);
								} else if (that.platform == "app") {
									that._appPay(res, obj);
								} else if (that.platform == "mp-weixin") {
									that._mpWxPay(res, obj);
								} else if (that.platform == "mp-alipay") {
									that._mpAliPay(res, obj);
								} else if (that.platform == "mp-toutiao") {
									that._mpToutiao(res, obj);
								} else if (that.platform == "mp-harmony") {
									that._mpHarmony(res, obj);
								} else {
									vkUtil.alert(`暂不支持支付方式-${that.platform}`);
									return false;
								}
							}
							that.$emit("update:status", 1);
						},
						fail: err => {
							let errObj = {
								...err,
								failType: "create",
								failTypeMsg: "创建支付失败"
							};
							that._paymentFail(errObj, obj.fail);
						},
						complete: () => {
							uni.hideLoading();
						}
					});
				})
				.catch(() => {
					uni.hideLoading();
				});
		},
		// 支付状态查询
		queryPayment(obj = {}) {
			let that = this;
			let { form1 } = that;
			let { data = {} } = obj;
			if (!data.out_trade_no && form1.out_trade_no) {
				data.out_trade_no = form1.out_trade_no;
			}
			vkUtil.callFunction({
				action: that.queryPaymentAction,
				data: obj.data,
				title: obj.title,
				needAlert: obj.needAlert,
				success: res => {
					if (obj.success) obj.success(res);
				},
				fail: res => {
					if (obj.fail) obj.fail(res);
				},
				complete: res => {
					if (obj.complete) obj.complete(res);
				}
			});
		},
		/////////////////////////////以下为内部方法//////////////////////////////
		// h5支付
		_h5Pay(res, obj) {
			let that = this;
			let { form1, returnUrl } = that;
			let codeUrl = res.orderInfo.codeUrl;
			let qrcodeImage = res.qrcodeImage;
			// 微信支付v3为h5Url v2为mwebUrl
			let mwebUrl = res.orderInfo.h5Url || res.orderInfo.mwebUrl || res.orderInfo.mweb_url;
			if (codeUrl || qrcodeImage) {
				// 二维码支付
				// 判断是否在手机环境，如果是，则直接访问二维码地址
				if (that.polling) {
					that._checkPay(res.out_trade_no, obj);
				}
				if (res.needQRcode || that.form1.isPC || (form1.provider == "wxpay" && codeUrl)) {
					// 需要二维码支付 或 pc环境 或 微信H5支付 建议用扫一扫而不要用手机长按识别功能,容易被微信判定为异常订单
					that.$emit("update:codeUrl", codeUrl);
					that.$emit("update:qrcodeImage", qrcodeImage);
				} else {
					setTimeout(() => {
						// 手机环境且是支付宝 支付宝在非微信浏览器中会自动跳转到支付宝APP中付款
						if (that.platform == "app") {
							plus.runtime.openURL(codeUrl);
						} else {
							let toUrl = codeUrl || mwebUrl;
							if (vkUtil.getH5Env() === "h5-weixin" || vkUtil.getH5Env() === "h5-alipay") {
								window.location.href = toUrl;
							} else {
								window.location.href = `alipays://platformapi/startapp?saId=10000007&qrcode=${toUrl}?_s=web-other`;
							}
						}
					}, 300);
				}
			} else if (mwebUrl) {
				// 微信手机外部浏览器支付
				if (!returnUrl) returnUrl = window.location.href;
				let urlParamObj = vkUtil.urlToObject(returnUrl);
				urlParamObj.confirmShow = true;
				urlParamObj.out_trade_no = form1.out_trade_no;
				let url = returnUrl.split("?")[0] + vkUtil.objectToUrl(urlParamObj);
				mwebUrl += "&redirect_url=" + encodeURIComponent(url);
				setTimeout(() => {
					if (that.platform == "app") {
						plus.runtime.openURL(mwebUrl);
					} else {
						window.location.href = mwebUrl;
					}
				}, 300);
			} else {
				// 微信公众号支付
				// #ifdef H5
				WeixinJSBridge.invoke("getBrandWCPayRequest", res.orderInfo, res => {
					if (res.err_msg == "get_brand_wcpay_request:ok") {
						// 用户支付成功回调
						that._checkPay(form1.out_trade_no, obj, "请稍等...", true);
						//if (typeof obj.success === "function") obj.success(res);
					} else if (res.err_msg == "get_brand_wcpay_request:cancel") {
						// 用户取消支付回调
						if (typeof obj.cancel === "function") obj.cancel(res);
					} else if (res.err_msg == "get_brand_wcpay_request:fail") {
						// 用户支付失败回调
						if (typeof obj.fail === "function") obj.fail(res);
					}
					// 无论成功或失败或取消均会触发的回调
					if (typeof obj.complete === "function") obj.complete(res);
				});
				// #endif
			}
		},
		// app支付
		_appPay(res, obj) {
			let that = this;
			let { form1 } = that;
			let { out_trade_no } = res;
			uni.requestPayment({
				provider: form1.provider,
				orderInfo: res.orderInfo,
				...res.orderInfo,
				success() {
					that._checkPay(out_trade_no, obj, "请稍等...", true);
				},
				fail(err) {
					if (err.errMsg.indexOf("fail cancel") == -1) {
						console.error(err);
						let errObj = {
							...err,
							failType: "request",
							failTypeMsg: "请求支付失败"
						};
						that._paymentFail(errObj, obj.fail);
					} else {
						that._paymentCancel(err, obj.cancel);
					}
				}
			});
		},
		// 微信小程序支付
		_mpWxPay(res, obj) {
			let that = this;
			let { out_trade_no, provider = "" } = res;
			if (provider === "wxpay-virtual") {
				uni.requestVirtualPayment({
					...res.orderInfo,
					success: res => {
						that._checkPay(out_trade_no, obj, "请稍等...", true);
					},
					fail: err => {
						if (err.errMsg.indexOf("fail cancel") == -1) {
							console.error(err);
							let errObj = {
								...err,
								failType: "request",
								failTypeMsg: "请求支付失败"
							};
							that._paymentFail(errObj, obj.fail);
						} else {
							that._paymentCancel(err, obj.cancel);
						}
					}
				});
			} else {
				uni.requestPayment({
					...res.orderInfo,
					success() {
						that._checkPay(out_trade_no, obj, "请稍等...", true);
					},
					fail(err) {
						if (err.errMsg.indexOf("fail cancel") == -1) {
							console.error(err);
							let errObj = {
								...err,
								failType: "request",
								failTypeMsg: "请求支付失败"
							};
							that._paymentFail(errObj, obj.fail);
						} else {
							that._paymentCancel(err, obj.cancel);
						}
					}
				});
			}
		},
		// 支付宝小程序支付
		_mpAliPay(res, obj) {
			let that = this;
			let { out_trade_no } = res;
			uni.requestPayment({
				orderInfo: res.orderInfo,
				success(res) {
					let resultCode = Number(res.resultCode);
					if ([9000, 8000, 6004].indexOf(resultCode) > -1) {
						that._checkPay(out_trade_no, obj, "请稍等...", true);
					}
				},
				fail(err) {
					if (err.errMsg.indexOf("fail cancel") == -1) {
						console.error(err);
						let errObj = {
							...err,
							failType: "request",
							failTypeMsg: "请求支付失败"
						};
						that._paymentFail(errObj, obj.fail);
					} else {
						that._paymentCancel(err, obj.cancel);
					}
				}
			});
		},
		// 付款码支付
		_codepay(res, obj) {
			let that = this;
			let { form1 } = that;
			let { out_trade_no, orderInfo } = res;
			if (orderInfo.tradeState === "SUCCESS") {
				that._checkPay(out_trade_no, obj, "请稍等...", true);
			} else if (orderInfo.tradeState === "USERPAYING") {
				that._paymentUserPaying(res, obj.userPaying);
				that._checkPay(out_trade_no, obj, false, true);
			} else {
				console.error(orderInfo);
				let errObj = {
					...orderInfo,
					code: orderInfo.tradeState,
					msg: orderInfo.tradeStateDesc,
					failType: "request",
					failTypeMsg: "请求支付失败"
				};
				that._paymentFail(errObj, obj.fail);
			}
		},
		// VksPay支付
		_vkspay(res, obj) {
			let that = this;
			let { form1, returnUrl } = that;
			let codeUrl = res.orderInfo.codeUrl;
			let qrcodeImage = res.qrcodeImage;
			let mwebUrl = res.orderInfo.mwebUrl || res.orderInfo.mweb_url;
			if (codeUrl || qrcodeImage) {
				// 二维码支付
				// 判断是否在手机环境，如果是，则直接访问二维码地址
				if (that.polling) {
					that._checkPay(res.out_trade_no, obj);
				}
				if (codeUrl) {
					// 需要二维码支付 或 pc环境 或 微信H5支付 建议用扫一扫而不要用手机长按识别功能,容易被微信判定为异常订单
					that.$emit("update:codeUrl", codeUrl);
					that.$emit("update:qrcodeImage", qrcodeImage);
				} else {
					setTimeout(() => {
						// 手机环境且是支付宝 支付宝在非微信浏览器中会自动跳转到支付宝APP中付款
						if (that.platform == "app") {
							plus.runtime.openURL(codeUrl);
						} else {
							let toUrl = codeUrl || mwebUrl;
							if (vkUtil.getH5Env() === "h5-weixin" || vkUtil.getH5Env() === "h5-alipay") {
								window.location.href = toUrl;
							} else {
								window.location.href = `alipays://platformapi/startapp?saId=10000007&qrcode=${toUrl}?_s=web-other`;
							}
						}
					}, 300);
				}
			}
		},
		// 抖音支付 - 抖音小程序支付
		_mpToutiao(res, obj) {
			let that = this;
			let { out_trade_no } = res;
			// 支付失败回调函数
			const payFail = err => {
				console.error(err);
				let errObj = {
					...err,
					failType: "request",
					failTypeMsg: "请求支付失败"
				};
				that._paymentFail(errObj, obj.fail);
			};
			// 支付取消回调函数
			const payCancel = res => {
				that._paymentCancel(res, obj.cancel);
			};
			// 支付成功回调函数
			const paySuccess = res => {
				that._checkPay(out_trade_no, obj, "请稍等...", true);
			};
			// 请求支付
			uni.requestPayment({
				service: 5, // 固定5
				orderInfo: res.orderInfo,
				success: res => {
					if (res.code === 0) {
						// 支付成功
						paySuccess(res);
					} else if (res.code === 4) {
						// 支付取消
						payCancel(res);
					} else {
						// 支付失败
						payFail(res);
					}
				},
				fail: err => {
					// 支付失败
					payFail(err);
				}
			});
		},
		// 华为支付 - 华为鸿蒙元服务支付
		_mpHarmony(res, obj) {
			let that = this;
			let { out_trade_no } = res;
			// 支付失败回调函数
			const payFail = err => {
				console.error(JSON.stringify(err));
				let errObj = {
					...err,
					failType: "request",
					failTypeMsg: "请求支付失败"
				};
				that._paymentFail(errObj, obj.fail);
			};
			// 支付取消回调函数
			const payCancel = res => {
				that._paymentCancel(res, obj.cancel);
			};
			// 支付成功回调函数
			const paySuccess = res => {
				that._checkPay(out_trade_no, obj, "请稍等...", true);
			};
			// 请求支付
			uni.requestPayment({
				orderStr: res.orderInfo,
				success: res => {
					// 支付成功
					paySuccess(res);
				},
				fail: err => {
					let code = err.errCode;
					if (code === 50000101) {
						// 支付取消
						payCancel(err);
					} else {
						// 支付失败
						payFail(err);
					}
				}
			});
		},
		/**
		 * 轮询检测支付状态
		 * @param {String} out_trade_no 订单号
		 * @param {Object} obj 支付传的参数
		 * @param {String} title loading提示语
		 * @param {Boolean} paid 是否已支付
		 */
		_checkPay(out_trade_no, obj, title, paid) {
			let that = this;
			if (paid && !that.awaitNotify && !that.payOrderInfo) {
				// 如果用户设置了不需要等待异步回调结果，且不需要返回支付订单数据，则直接触发success回调
				that._paymentSuccess(
					{
						orderPaid: true,
						out_trade_no
					},
					obj.success
				);
				// 终止
				return;
			}
			// 立刻检测一次，如果通过，则无需执行后面的轮询。
			setTimeout(() => {
				const fn = res => {
					// 轮询检测支付状态
					if (title) uni.showLoading({ title, mask: true });
					let num = 0;
					if (intervalID) clearInterval(intervalID);
					intervalID = setInterval(() => {
						if (that.queryLoading) {
							//console.log("上一个查询请求未完成，不执行本次轮询");
							return;
						}
						if (!that.pageShow) {
							//console.log("当前页面未显示，不执行本次轮询");
							return;
						}
						num++;
						if (num > 120 || that.status != 1) {
							if (title) uni.hideLoading();
							clearInterval(intervalID);
						} else {
							that._queryPayment(out_trade_no, obj, null);
						}
					}, Number(that.pollingTime));
				};
				that._queryPayment(out_trade_no, obj, fn);
			}, 200);
		},
		/**
		 * 支付状态查询
		 */
		_queryPayment(out_trade_no, obj = {}, fn) {
			let that = this;
			that.queryLoading = true;
			vkUtil.callFunction({
				action: that.queryPaymentAction,
				data: {
					out_trade_no,
					await_notify: false,
					pay_order_info: that.payOrderInfo
				},
				needAlert: false,
				errLog: false,
				success: res => {
					uni.hideLoading();
					if (intervalID) clearInterval(intervalID);
					// 如果需要同步等待异步回调，则再执行一次queryPayment，参数await_notify为true，显示loading遮罩
					if (that.awaitNotify && !res.user_order_success) {
						that.queryPayment({
							title: "请求中...",
							data: {
								out_trade_no,
								await_notify: true,
								pay_order_info: that.payOrderInfo
							},
							needAlert: false,
							success: (res = {}) => {
								that._paymentSuccess(res, obj.success);
							},
							fail: () => {
								// 即使这次查询失败了，也是支付成功（因为上一次查询已经是支付成功了）
								that._paymentSuccess(res, obj.success);
							}
						});
					} else {
						that._paymentSuccess(res, obj.success);
					}
				},
				fail: err => {
					// 如果检测到是已关闭、已撤销、支付失败则停止轮询
					if (err.trade_state && ["CLOSED", "REVOKED", "PAYERROR"].indexOf(err.trade_state) > -1) {
						if (intervalID) clearInterval(intervalID);
						uni.hideLoading();
						let errObj = {
							...err,
							failType: "request",
							failTypeMsg: "请求支付失败"
						};
						that._paymentFail(errObj, obj.fail);
						return;
					}
					if (typeof fn === "function") fn();
				},
				complete: () => {
					that.queryLoading = false;
				}
			});
		},
		// 监听 - 支付订单创建成功
		_paymentCreate(res, create) {
			this.$emit("create", res);
			if (typeof create === "function") return create(res);
		},
		// 支付成功后执行的逻辑
		_paymentSuccess(res, success) {
			this.$emit("update:status", 2);
			this.$emit("success", res);
			if (typeof success === "function") success(res);
		},
		// 失败后执行的逻辑
		_paymentFail(err, fail) {
			this.$emit("update:status", 0);
			this.$emit("fail", err);
			if (typeof fail === "function") fail(err);
		},
		// 取消支付后执行的逻辑
		_paymentCancel(err, cancel) {
			this.$emit("update:status", 0);
			this.$emit("cancel", err);
			if (typeof cancel === "function") cancel(err);
		},
		// 用户正在支付中（一般为正在输入密码中）
		_paymentUserPaying(res, userPaying) {
			this.$emit("userPaying", res);
			if (typeof userPaying === "function") userPaying(res);
		},

		// #ifdef APP
		// ios内购开始-----------------------------------------------------------
		// 创建ios内购支付订单
		async _appleiapCreatePayment(obj = {}) {
			let that = this;
			let { form1, debug } = that;
			let { needAlert = false } = obj;
			form1 = Object.assign(form1, obj.data);
			// 初始化ios内购商品
			let appleiap = new appleiapSdk.Iap({
				// products为苹果开发者后台的商品id数组
				products: [form1.productid]
			});
			uni.showLoading({ title: "请求中...", mask: true });
			try {
				// 初始化，获取iap支付通道
				await appleiap.init();
				// 从苹果服务器获取产品列表
				let productList = await appleiap.getProduct();
				let productInfo = productList[0];
				form1.total_fee = parseInt(productInfo.price * 100);
				form1.subject = productInfo.description;
				let res = await vkUtil.callFunction({
					action: obj.action,
					data: form1,
					needAlert
				});
				if (res.code === 0) {
					that.$emit("update:status", 0);
					try {
						let out_trade_no = res.out_trade_no;
						// 请求苹果支付
						if (debug) console.log("正在请求苹果服务器", form1.productid, out_trade_no);
						that.$emit("update:status", 1);
						let requestPaymentRes = await appleiap.requestPayment({
							productid: form1.productid,
							username: out_trade_no
						});
						if (debug) console.log("用户支付成功", requestPaymentRes);
						uni.showLoading({ title: "支付处理中...", mask: true });
						// 将凭据和username缓存起来
						that.addAppleiapOrder(requestPaymentRes);
						// 云端请求苹果服务器验证票据
						let verifyRes = await that.verifyReceiptFromAppleiap({
							out_trade_no: out_trade_no,
							transaction_receipt: requestPaymentRes.transactionReceipt,
							transaction_identifier: requestPaymentRes.transactionIdentifier
						});
						if (verifyRes.code === 0) {
							// 完结订单
							await appleiap.finishTransaction(requestPaymentRes);
							that.removeAppleiapOrder(requestPaymentRes);
							that._checkPay(out_trade_no, obj, "请稍等...", true);
						}
					} catch (err) {
						let code = err.errCode || err.code;
						if (code === 2) {
							// 用户取消支付
							if (debug) console.log("用户取消支付");
							that._paymentCancel(err, obj.cancel);
						} else {
							console.error("appleiapCreateOrder:fail", err);
							// 发起支付失败
							let errObj = {
								...err,
								failType: "request",
								failTypeMsg: "支付请求失败"
							};
							that._paymentFail(errObj, obj.fail);
						}
						uni.hideLoading();
					}
				}
			} catch (err) {
				console.error("err: ", err);
				uni.hideLoading();
			}
		},
		// ios内购支付漏单重试
		async appleiapRestore() {
			let { debug } = this;
			uni.showLoading({ title: "正在检测环境...", mask: true });
			// 初始化
			let appleiap = new appleiapSdk.Iap();
			// 初始化，获取iap支付通道
			await appleiap.init();
			try {
				if (debug) console.log("正在查询是否有漏单信息");
				const transactions = await appleiap.restoreCompletedTransactions({
					username: ""
				});
				if (debug) console.log("漏单查询结果：" + (transactions.length === 0 ? "未漏单" : "有漏单"), transactions);
				if (!transactions.length) {
					return;
				}
				// 开发者业务逻辑，从服务器获取当前用户未完成的订单列表，和本地的比较
				for (let i = 0; i < transactions.length; i++) {
					let requestPaymentRes = transactions[i];
					switch (requestPaymentRes.transactionState) {
						case appleiapSdk.IapTransactionState.purchased:
							// 云端请求苹果服务器验证票据
							let out_trade_no = requestPaymentRes.payment.username;
							if (!out_trade_no) {
								out_trade_no = this.getAppleiapOutTradeNo(requestPaymentRes);
							}
							if (!out_trade_no) {
								// 如果运行到了这里，代表这单丢失了username，只能做丢单处理，否则用户会一直卡在丢单检测
								// 完结订单
								await appleiap.finishTransaction(requestPaymentRes);
								if (debug) console.log(`您可能已支付成功，但很抱歉丢单了，请联系客服处理。`, requestPaymentRes);
								continue;
							}
							if (debug) console.log("requestPaymentRes: ", requestPaymentRes);
							let verifyRes = await this.verifyReceiptFromAppleiap({
								out_trade_no: out_trade_no,
								transaction_receipt: requestPaymentRes.transactionReceipt,
								transaction_identifier: requestPaymentRes.transactionIdentifier
							});
							if (debug) console.log("verifyRes: ", verifyRes);
							if (verifyRes.code === 0) {
								// 完结订单
								if (debug) console.log(`完结订单：${out_trade_no}`);
								await appleiap.finishTransaction(requestPaymentRes);
								this.removeAppleiapOrder(requestPaymentRes);
							}
							break;
						case appleiapSdk.IapTransactionState.failed:
							// 关闭未支付的订单
							await appleiap.finishTransaction(requestPaymentRes);
							break;
						default:
							break;
					}
				}
			} catch (e) {
				console.error(e);
			} finally {
				uni.hideLoading();
			}
		},
		// 验证iosIap苹果内购支付凭据
		async verifyReceiptFromAppleiap(data = {}) {
			let res = await vkUtil.callFunction({
				action: {
					name: "vk-pay", // 云函数名称
					action: "pay/appleiap/verifyReceipt", // 路由模式下云函数地址
					actionKey: "action", // 路由模式下云函数地址的识别key(注意VK路由框架下,此值为$url)
					dataKey: "data" // 路由模式下云函数请求参数的识别key
				},
				data
			});
			return res;
		},
		// 保存ios内购订单至本地缓存（丢单时可找回username）
		addAppleiapOrder(requestPaymentRes) {
			let key = "vk-uni-pay-appleiap-order";
			let list = uni.getStorageSync(key) || [];
			list.push(requestPaymentRes);
			uni.setStorageSync(key, list);
		},
		// 从本地缓存中根据订单信息获取username
		getAppleiapOutTradeNo(requestPaymentRes) {
			let key = "vk-uni-pay-appleiap-order";
			let list = uni.getStorageSync(key) || [];
			let info = list.find(item => {
				return item.transactionIdentifier === requestPaymentRes.transactionIdentifier && item.transactionDate === requestPaymentRes.transactionDate;
			});
			let out_trade_no = info && info.payment && info.payment.username;
			return out_trade_no;
		},
		// 从本地缓存中删除ios内购订单
		removeAppleiapOrder(requestPaymentRes) {
			let key = "vk-uni-pay-appleiap-order";
			let list = uni.getStorageSync(key) || [];
			let index = list.findIndex(item => {
				return item.transactionIdentifier === requestPaymentRes.transactionIdentifier && item.transactionDate === requestPaymentRes.transactionDate;
			});
			if (index > -1) {
				list.splice(index, 1);
			}
			uni.setStorageSync(key, list);
		}
		// #endif
		// ios内购结束-----------------------------------------------------------
		/////////////////////////////以上为内部方法//////////////////////////////
	},
	// 监听属性
	watch: {},
	// 计算属性
	computed: {}
};
</script>

<style lang="scss" scoped></style>
