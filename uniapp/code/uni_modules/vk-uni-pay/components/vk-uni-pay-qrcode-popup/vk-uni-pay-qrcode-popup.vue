<!--
	VksPay支付专用弹窗组件
	如果觉得这个showActionSheet弹窗不好看，可以自己把组件复制一份，改个名字，如改成my-pay-qrcode-popup，然后重写这个弹窗组件页面样式
-->
<template>
	<view class="vk-uni-pay-qrcode-popup">
		<view class="pay-qrcode-popup" v-if="payPopup.show" :style="'z-index: ' + zIndex">
			<view class="pay-qrcode-popup-mask" @click="closePopup"></view>
			<view class="pay-qrcode-popup-content">
				<image v-if="qrcodeImage" :src="qrcodeImage" class="pay-qrcode-popup-image"></image>
				<vk-uni-qrcode v-else ref="qrcode" :text="codeUrl" :size="225" unit="px" :padding="10"></vk-uni-qrcode>
				<view class="pay-qrcode-popup-info">
					<view>
						<text class="pay-qrcode-popup-info-fee">{{ (totalFee / 100).toFixed(2) }}</text>
						<text>元</text>
					</view>
					<template v-if="!typeCom">
						<view class="pay-qrcode-popup-tips-box" v-if="providerPayMethod === 'wxpay'">
							<text>请用</text>
							<text class="pay-qrcode-popup-type-text wxpay">微信</text>
							<text>扫码支付</text>
						</view>
						<view class="pay-qrcode-popup-tips-box" v-else-if="providerPayMethod === 'alipay'">
							<text>请用</text>
							<text class="pay-qrcode-popup-type-text alipay">支付宝</text>
							<text>扫码支付</text>
						</view>
						<view class="pay-qrcode-popup-tips-box" v-else>
							<text>请用</text>
							<text class="pay-qrcode-popup-type-text wxpay">微信</text>
							<text>或</text>
							<text class="pay-qrcode-popup-type-text alipay">支付宝</text>
							<text>扫码支付</text>
						</view>
					</template>
					<template v-else-if="payPopup.type === 'wxpay'">
						<view class="pay-qrcode-popup-tips-box">
							<text>请用</text>
							<text class="pay-qrcode-popup-type-text wxpay">微信</text>
							<text>扫码支付</text>
							<!-- #ifndef APP -->
							<text v-if="payPopup.mode === 'scheme'" class="pay-qrcode-popup-primary-tips">（先截屏）</text>
							<!-- #endif -->
							<view class="pay-qrcode-popup-type-tips">支付完成后，返回页面点【我已完成支付】</view>
						</view>
					</template>
					<template v-else-if="payPopup.type === 'alipay'">
						<view class="pay-qrcode-popup-tips-box">
							<text>请用</text>
							<text class="pay-qrcode-popup-type-text alipay">支付宝</text>
							<text>支付</text>
							<view class="pay-qrcode-popup-type-tips">支付完成后，返回页面点【我已完成支付】</view>
						</view>
					</template>
				</view>
				<button
					type="primary"
					v-if="payPopup.mode === 'scheme' && !lastUrl"
					style="margin-bottom: 10px"
					:class="payPopup.type === 'wxpay' ? 'pay-qrcode-popup-btn-primary' : ''"
					@click="toPayByScheme(payPopup.type)"
				>
					<text>前往{{ typeCom }}</text>
				</button>
				<button type="primary" :class="payPopup.type === 'wxpay' ? 'pay-qrcode-popup-btn-success' : ''" @click="queryPayment">我已完成支付</button>
				<button
					type="default"
					v-if="payPopup.mode === 'scheme' && lastUrl"
					style="margin-top: 10px"
					@click="toPayByScheme(payPopup.type)"
				>
					<text>重新支付</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
import vkUtil from "@/uni_modules/vk-uni-pay/js_sdk/vk-util.js";

/**
 * VksPay支付弹窗
 * @description 此组件为VksPay支付使用
 * @property {String} codeUrl 付款二维码地址
 * @property {String} qrcodeImage 付款二维码图片base64值
 * @property {Number} status 支付状态 0:等待发起支付 1:支付中 2:已支付
 * @property {String} outTradeNo 商户订单号
 * @property {Number} totalFee 支付金额，分为单位
 * @property {String} provider 支付供应商，此组件目前只支持vkspay
 * @property {String} providerPayMethod 支付供应商的支付渠道
 * @value wxpay				微信支付
 * @value alipay 			支付宝支付
 * @property {String|Number} zIndex 弹窗的层级
 * @example <vk-uni-pay-qrcode-popup :z-index="998"></vk-uni-pay-qrcode-popup>
 */


export default {
	name: "vk-uni-pay-qrcode-popup",
	emits: ["close", "query", "afresh"],
	props: {
		/**
		 * 付款二维码地址
		 */
		codeUrl: {
			type: String
		},
		/**
		 * 付款二维码图片base64值
		 */
		qrcodeImage: {
			type: [String,null]
		},
		/**
		 * 0:等待发起支付 1:支付中 2:已支付
		 */
		status: {
			type: Number,
			default: 0
		},
		/**
		 * 商户订单号
		 */
		outTradeNo: {
			type: String
		},
		/**
		 * 支付金额，分为单位
		 */
		totalFee: {
			type: [Number,String]
		},
		/**
		 * 此参数暂时未用到，将来可能有用
		 */
		provider: {
			type: String,
			default: "vkspay"
		},
		// wxpay 微信支付 alipay 支付宝支付 可不传，视为聚合支付
		providerPayMethod: {
			type: String
		},
		zIndex: {
			type: [Number,String],
			default: 998
		},
	},
	data: function() {
		// 组件创建时,进行数据初始化
		return {
			// 支付弹窗
			payPopup: {
				show: false, // 是否打开弹窗
				mode: "qrcode", // qrcode 二维码 scheme 跳协议头支付 link 跳链接支付
				type: "", // wxpay 微信支付 alipay 支付宝支付
				qrcode: "", // 二维码支付链接地址
				alipay: "", // 支付宝支付链接
				wxpay: "", // 微信支付链接
			},
			orders: {},// 订单数据缓存
			lastUrl:"", // 最后一次发起支付时的url
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		// 初始化
		init() {
			if (this.showCom) {
				this.callPayment();
			}
		},
		// 调起支付
		callPayment(){
			let {
				outTradeNo: out_trade_no,
				codeUrl: url,
				providerPayMethod
			} = this;

			// 获取支付信息
			let payInfo = this.getPayInfo(url);
			this.payPopup.wxpay = payInfo.wxpay;
			this.payPopup.alipay = payInfo.alipay;
			if (payInfo.mode === "link") {
				// 跳转url链接支付
				const callAlipay = () => {
					// 支付宝
					this.openPopup({
						qrcode: payInfo.qrcode,
						mode: "scheme",
						type: "alipay"
					});
					this.toPayByScheme("alipay");
				}
				const callPay = () => {
					// 记录当前页面数据，因为支付完会强制关闭页面，因此下次进入任意页面后，应该在App.vue的onLaunch里再跳回来
					let nowUrl = window.location.href;
					// 在当前url上带上参数，代表是同步跳转过来的
					let returnUrl = this.addOrUpdateURLParameter(nowUrl, {
						return: 1,
						out_trade_no: out_trade_no
					});
					uni.setStorageSync("vk-uni-pay.returnUrl", returnUrl);
					if (this.h5Env === "h5-weixin") {
						window.location.href = payInfo.qrcode;
					} else {
						uni.showModal({
							title: "提示",
							content: `支付结果查询链接已复制到您的剪切板，待支付完成后，您可以通过向文件助手粘贴链接或点击本站任意链接均可即可查看支付结果`,
							showCancel: false,
							confirmText: "去支付",
							success: () => {
								// 同时也将结果链接存进剪切板，方便复制粘贴再次进去
								// h5中setClipboardData必须在用户点击事件中触发，故写在uni.showModal的点击回调中执行
								uni.setClipboardData({
									data: returnUrl,
									showToast: false
								});
								window.location.href = payInfo.qrcode;
							}
						});
					}
				}
				if (this.h5Env === "h5-weixin" && providerPayMethod === "alipay" && this.h5PlatformCom === "ios") {
					// IOS手机支持在微信APP中用支付宝支付
					callAlipay();
				} else {
					// 自动识别
					callPay();
				}
			} else if (payInfo.mode === "scheme") {
				const callAlipay = () => {
					// 支付宝
					this.openPopup({
						qrcode: payInfo.qrcode,
						mode: "scheme",
						type: "alipay"
					});
					this.toPayByScheme("alipay");
				}
				const callWxpay = () => {
					// 微信支付
					// 如果是微信支付，需要弹窗二维码，让用户保存图片，再自动打开微信调用扫一扫，选择刚保存的图片
					// #ifdef APP
					// APP可以先帮用户截屏
					this.openPopup({
						qrcode: payInfo.qrcode,
						mode: "scheme",
						type: "wxpay"
					});
					setTimeout(() => {
						let base64 = this.$refs.qrcode.getBase64();
						uni.saveImageToPhotosAlbum({
							filePath: base64,
							success: () => {
								uni.showModal({
									title: "提示",
									content: "支付二维码已自动保存到您的相册，请打开微信扫一扫，从相册选择最新保存的支付二维码进行支付",
									showCancel: false,
									confirmText: "我知道了",
									success: () => {
										this.toPayByScheme("wxpay");
									}
								});
							}
						});
					}, 1000);
					// #endif

					// #ifndef APP
					this.openPopup({
						qrcode: payInfo.qrcode,
						mode: "scheme",
						type: "wxpay"
					});
					// #endif
				}
				if (providerPayMethod === "wxpay") {
					callWxpay();
				} else if (providerPayMethod === "alipay") {
					callAlipay();
				} else {
					let itemList = ["支付宝", "微信支付"];
					// 如果觉得这个showActionSheet弹窗不好看，可以自己把组件复制一份，改个名字，然后重写这个弹窗组件
					uni.showActionSheet({
						itemList: itemList,
						success: e => {
							let item = itemList[e.tapIndex];
							if (item === "微信支付") {
								callWxpay();
							} else {
								callAlipay();
							}
						}
					});
				}
			} else {
				// 默认均为弹窗扫码支付
				this.openPopup({
					qrcode: payInfo.qrcode,
					mode: "qrcode"
				});
				// #ifdef MP
				setTimeout(() => {
					let base64 = this.$refs.qrcode.getBase64();
					uni.saveImageToPhotosAlbum({
						filePath: base64,
						success: () => {
							uni.showModal({
								title: "提示",
								content: "支付二维码已保存到您的相册，请打开wx或zfb扫一扫，从相册选择最新保存的支付二维码进行支付",
								showCancel: false,
								confirmText: "我知道了"
							});
						}
					});
				}, 1000);
				// #endif
			}
			// 临时存储订单号和支付链接地址的关系
			this.orders[out_trade_no] = {
				out_trade_no: out_trade_no,
				url: url
			};
		},
		// 打开支付弹窗
		openPopup(obj = {}) {
			let { qrcode, mode, type } = obj;
			this.payPopup.show = true;
			this.payPopup.mode = mode;
			this.payPopup.type = type;

			// #ifdef MP-WEIXIN
			this.payPopup.type = "wxpay";
			// #endif

			// #ifdef MP-ALIPAY
			this.payPopup.type = "alipay";
			// #endif

			this.payPopup.qrcode = qrcode;
		},
		// 关闭支付弹窗
		closePopup() {
			this.payPopup.show = false;
			// 重置数据
			this.payPopup.mode = "qrcode";
			this.payPopup.type = "";
			this.payPopup.qrcode = "";
			this.$emit("close");
		},
		queryPayment(){
			this.$emit("query");
		},
		// 获取支付信息，识别支付模式
		getPayInfo(url) {
			/**
			 * data中mode值的可选项
			 * qrcode 弹窗扫码支付
			 * link 跳支付链接支付
			 * scheme 通过 scheme 拉起支付
			 */
			let data = {
				mode: "qrcode",
				qrcode: url
			};
			// #ifdef H5
			if (["h5-weixin", "h5-alipay"].indexOf(this.h5Env) > -1) {
				// 在手机微信或手机支付宝中，跳转支付链接支付
				let alipayUrl = `alipays://platformapi/startapp?saId=10000007&qrcode=${url}`;
				data = {
					mode: "link",
					qrcode: url,
					alipay: this.h5Env === "h5-weixin" ? `https://ulink.alipay.com?scheme=${encodeURIComponent(alipayUrl)}`: url,
					wxpay: url
 				};
			} else if (["h5-qq"].indexOf(this.h5Env) > -1) {
				// 在手机QQ中，通过 scheme 拉起支付
				let alipayUrl = `alipays://platformapi/startapp?saId=10000007&qrcode=${url}`;
				data = {
					mode: "scheme",
					qrcode: url,
					alipay: `https://ulink.alipay.com?scheme=${encodeURIComponent(alipayUrl)}`,
					wxpay: `weixin://scanqrcode`
				};
			} else {
				if (this.h5PlatformCom !== "pc") {
					// 在手机其他环境中，通过 scheme 拉起支付
					let alipayUrl = `alipays://platformapi/startapp?saId=10000007&qrcode=${url}`;
					data = {
						mode: "scheme",
						qrcode: url,
						alipay: alipayUrl,
						wxpay: `weixin://scanqrcode`
					};
				} else {
					// 在PC中，弹窗扫码支付
					data = {
						mode: "qrcode",
						qrcode: url,
						alipay: url,
						wxpay: url
					};
				}
			}
			// #endif

			// #ifdef MP
			// 如果是微信小程序，则弹窗扫码支付
			data = {
				mode: "qrcode",
				qrcode: url,
				alipay: url,
				wxpay: url
			};
			// #endif

			// #ifdef APP
			// 如果是APP，通过 scheme 拉起支付
			let alipayUrl = `alipays://platformapi/startapp?saId=10000007&qrcode=${url}`;
			data = {
				mode: "scheme",
				qrcode: url,
				alipay: `https://ulink.alipay.com?scheme=${encodeURIComponent(alipayUrl)}`,
				wxpay: `weixin://scanqrcode`
			};
			// #endif


			return data;
		},
		// 根据scheme调起支付
		toPayByScheme(type) {
			let { payPopup, lastUrl } = this;
			let url;
			if (type === "wxpay") {
				url = payPopup.wxpay;
			} else {
				url = payPopup.alipay;
			}
			let qrcode = payPopup.qrcode;
			// 注意，由于一个qrcode只能被调起一次支付，如果取消支付再点击，则执行重新创建支付逻辑
			if (lastUrl === qrcode) {
				// 关闭弹窗
				this.closePopup();
				// 重新创建支付
				this.$emit("afresh");
				return;
			}
			this.lastUrl = qrcode;
			// #ifdef APP
			if (url === "weixin://scanqrcode") {
				// 执行打开微信扫一扫
				this.openWeixinScaner();
			} else {
				plus.runtime.openURL(url);
			}
			// #endif

			// #ifndef APP
			window.location.href = url;
			// #endif
		},
		// #ifdef APP
		// 打开微信扫一扫
		openWeixinScaner(){
			const osName = plus.os.name.toLowerCase();
			if (osName === "ios") {
				plus.runtime.openURL("weixin://scanqrcode");
			} else if (osName === "android") {
				const Intent = plus.android.importClass("android.content.Intent");
				const ComponentName = plus.android.importClass('android.content.ComponentName')
				const intent = new Intent();
				const componentName = new ComponentName("com.tencent.mm", "com.tencent.mm.ui.LauncherUI");
				intent.setComponent(componentName);
				intent.putExtra("LauncherUI.From.Scaner.Shortcut", true);
				intent.setFlags(335544320);
				intent.setAction("android.intent.action.VIEW");
				const main = plus.android.runtimeMainActivity();
				main.startActivity(intent);
			}
		},
		// #endif
		// #ifdef H5
		addOrUpdateURLParameter(url, paramsObj) {
			const urlObject = new URL(url);
			const searchParams = urlObject.searchParams;
			for (const key in paramsObj) {
				if (paramsObj.hasOwnProperty(key)) {
					const value = paramsObj[key];
					searchParams.set(key, value);
				}
			}
			urlObject.search = searchParams.toString();
			return urlObject.toString();
		},
		// #endif
	},
  // 监听属性
  watch: {
		showCom(val){
			if (val) {
				// 调起支付
				this.callPayment();
			} else {
				// 关闭弹窗
				this.closePopup();
			}
		}
	},
	// 计算属性
	computed: {
		showCom(){
			return this.status < 2 && this.codeUrl;
		},
		// h5运行环境
		h5Env() {
			// #ifdef H5
			const ua = window.navigator.userAgent.toLowerCase();
			const isWeChat = /micromessenger/i.test(ua);
			const isAlipay = /alipay/i.test(ua);
			const isMiniProgram = /miniprogram/i.test(ua);
			const isQQ = /qq/i.test(ua);
			const isPCWeChat = /windowswechat/i.test(ua);
			const isDevWeChat = /wechatdevtools/i.test(ua);

			if (isWeChat) {
				if (isMiniProgram) {
					// 微信小程序
					return "mp-weixin";
				} else if (isPCWeChat) {
					// 微信PC浏览器
					return "pc-weixin";
				} else if (isDevWeChat) {
					// 微信开发者工具浏览器
					return "dev-weixin";
				} else {
					// 手机微信公众号
					return "h5-weixin";
				}
			} else if (isAlipay) {
				if (isMiniProgram) {
					// 支付宝小程序
					return "mp-alipay";
				} else {
					// 手机支付宝浏览器
					return "h5-alipay";
				}
			} else if (isQQ) {
				if (isMiniProgram) {
					// qq小程序
					return "mp-qq";
				} else {
					// 手机qq浏览器
					return "h5-qq";
				}
			}
			return "h5";
			// #endif
		},
		// h5运行平台
		h5PlatformCom() {
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
		},
		// 当前支付方式中文表示
		typeCom() {
			let { payPopup = {} } = this;
			let type = payPopup.type;
			let typeObj = {
				wxpay: "微信支付",
				alipay: "支付宝"
			};
			return typeObj[type];
		}
	}
};
</script>

<style lang="scss" scoped>

	/* 二维码支付弹窗开始 */
	.pay-qrcode-popup {
		position: fixed;
		z-index: 998;
		width: 100vw;
		top: 0;
		bottom: 0;
		top: 0;
		right: 0;
		.pay-qrcode-popup-mask {
			position: absolute;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: rgba(0, 0, 0, 0.6);
		}
		.pay-qrcode-popup-content {
			position: relative;
			width: 250px;
			margin: 17vh auto 0 auto;
			background-color: #ffffff;
			border-radius: 5px;
			padding: 20px;
			box-sizing: content-box;
			text-align: center;
			.pay-qrcode-popup-info {
				text-align: center;
				padding: 10px;
				.pay-qrcode-popup-info-fee {
					color: red;
					font-size: 30px;
					font-weight: bold;
				}
				.pay-qrcode-popup-tips-box {
					font-size: 14px;
					.pay-qrcode-popup-type-text {
						font-weight: bold;
						margin: 0 2px;
						font-size: 18px;
						&.wxpay {
							color: #22ac38;
						}
						&.alipay {
							color: #027aff;
						}
					}
					.pay-qrcode-popup-primary-tips{
						color:  #027aff;
						font-weight: bold;
						font-size: 18px;
					}
					.pay-qrcode-popup-type-tips {
						font-size: 12px;
					}
				}
			}
			.pay-qrcode-popup-image {
				width: 225px;
				height: 225px;
			}
		}
		.pay-qrcode-popup-btn-success {
			background-color: #22ac38;
			color: #fff;
		}
		.pay-qrcode-popup-btn-primary{
			background-color: #027aff;
			color: #fff;
		}
	}
	/* 二维码支付弹窗结束 */
</style>
