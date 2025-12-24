
<template>
	<view class="container">
		<view class="login-form">
			<view class="login-header">
				<view class="logo">
					<u-image 
						src="/static/logo.png" 
						width="120" 
						height="120"
						mode="aspectFit"
					></u-image>
				</view>
				<view class="app-name">星云社区</view>
				<view class="app-desc">发现、分享、创造精彩内容</view>
			</view>

			<view class="form-content">
				<u-tabs 
					:list="loginTabs" 
					:current="currentTab" 
					@change="tabChange"
					:is-scroll="false"
					bar-width="40"
					bar-height="4"
					active-color="#007AFF"
					inactive-color="#7A7E83"
				></u-tabs>

				<!-- 账号密码登录 -->
				<view v-if="currentTab === 0" class="tab-content">
					<view class="form-item">
						<u-input 
							v-model="loginForm.account" 
							placeholder="请输入账号/手机号/邮箱" 
							:clearable="true"
							:border="true"
						></u-input>
					</view>

					<view class="form-item">
						<u-input 
							v-model="loginForm.password" 
							type="password" 
							placeholder="请输入密码" 
							:clearable="true"
							:border="true"
						></u-input>
					</view>

					<view class="form-options">
						<view class="remember-me">
							<u-checkbox v-model="rememberMe" size="24">记住我</u-checkbox>
						</view>
						<view class="forgot-password" @click="forgotPassword">忘记密码？</view>
					</view>

					<view class="submit-btn">
						<u-button 
							type="primary" 
							size="default" 
							@click="accountLogin"
							:loading="logging"
							:disabled="!canAccountLogin"
						>
							{{ logging ? '登录中...' : '登录' }}
						</u-button>
					</view>
				</view>

				<!-- 短信验证码登录 -->
				<view v-if="currentTab === 1" class="tab-content">
					<view class="form-item">
						<u-input 
							v-model="smsForm.phone" 
							placeholder="请输入手机号" 
							:clearable="true"
							:border="true"
						></u-input>
					</view>

					<view class="form-item">
						<u-input 
							v-model="smsForm.code" 
							placeholder="请输入验证码" 
							:clearable="true"
							:border="true"
						>
							<template slot="suffix">
								<u-verification-code 
									:seconds="60" 
									ref="uCode"
									@change="codeChange"
									@start="getCodeStart"
									@end="getCodeEnd"
									change-text="x秒重新获取"
								></u-verification-code>
								<u-button 
									@tap="getSmsCode" 
									:type="codeBtnType" 
									size="mini"
									:disabled="codeBtnDisabled"
								>
									{{ codeTips }}
								</u-button>
							</template>
						</u-input>
					</view>

					<view class="submit-btn">
						<u-button 
							type="primary" 
							size="default" 
							@click="smsLogin"
							:loading="logging"
							:disabled="!canSmsLogin"
						>
							{{ logging ? '登录中...' : '登录' }}
						</u-button>
					</view>
				</view>
			</view>

			<!-- 第三方登录 -->
			<view class="third-party-login">
				<view class="divider">
					<text>其他登录方式</text>
				</view>

				<view class="third-party-icons">
					<view class="icon-item" @click="thirdPartyLogin('wechat')">
						<u-icon name="weixin-fill" color="#07C160" size="48"></u-icon>
						<text>微信</text>
					</view>
					<view class="icon-item" @click="thirdPartyLogin('qq')">
						<u-icon name="qq-fill" color="#12B7F5" size="48"></u-icon>
						<text>QQ</text>
					</view>
				</view>
			</view>

			<!-- 注册入口 -->
			<view class="register-entry">
				还没有账号？
				<text class="link" @click="goToRegister">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			loginTabs: [
				{ name: '账号密码' },
				{ name: '短信验证' }
			],
			currentTab: 0,
			rememberMe: false,
			logging: false,
			loginForm: {
				account: '',
				password: ''
			},
			smsForm: {
				phone: '',
				code: ''
			},
			codeTips: '获取验证码',
			codeBtnDisabled: false,
			codeBtnType: 'info'
		}
	},
	computed: {
		canAccountLogin() {
			return this.loginForm.account && this.loginForm.password;
		},
		canSmsLogin() {
			return this.smsForm.phone && this.smsForm.code;
		}
	},
	methods: {
		tabChange(index) {
			this.currentTab = index;
		},
		forgotPassword() {
			uni.showToast({
				title: '忘记密码功能开发中',
				icon: 'none'
			});
		},
		async accountLogin() {
			if (!this.canAccountLogin) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				});
				return;
			}

			this.logging = true;

			try {
				// 实际项目中这里应该调用云函数或API进行登录
				// 模拟登录延迟
				await new Promise(resolve => setTimeout(resolve, 1500));

				// 模拟登录成功
				uni.setStorageSync('token', 'mock_token');
				uni.setStorageSync('userInfo', {
					id: 1,
					name: '社区用户',
					avatar: 'https://picsum.photos/200/200?random=1'
				});

				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});

				// 延迟跳转
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}, 1500);
			} catch (error) {
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				this.logging = false;
			}
		},
		codeChange(text) {
			this.codeTips = text;
		},
		getCodeStart() {
			this.codeBtnDisabled = true;
			this.codeBtnType = 'info';
		},
		getCodeEnd() {
			this.codeBtnDisabled = false;
			this.codeBtnType = 'primary';
		},
		getSmsCode() {
			if (this.$refs.uCode.canGetCode) {
				// 模拟发送验证码
				uni.showLoading({
					title: '正在获取验证码'
				});

				setTimeout(() => {
					uni.hideLoading();
					// 这里此提示会被this.start()方法中的提示覆盖
					uni.showToast({
						title: '验证码已发送',
						icon: 'none'
					});
					// 通知验证码组件内部开始倒计时
					this.$refs.uCode.start();
				}, 1000);
			} else {
				uni.showToast({
					title: '请稍后再试',
					icon: 'none'
				});
			}
		},
		async smsLogin() {
			if (!this.canSmsLogin) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none'
				});
				return;
			}

			this.logging = true;

			try {
				// 实际项目中这里应该调用云函数或API进行登录
				// 模拟登录延迟
				await new Promise(resolve => setTimeout(resolve, 1500));

				// 模拟登录成功
				uni.setStorageSync('token', 'mock_token');
				uni.setStorageSync('userInfo', {
					id: 1,
					name: '社区用户',
					avatar: 'https://picsum.photos/200/200?random=1'
				});

				uni.showToast({
					title: '登录成功',
					icon: 'success'
				});

				// 延迟跳转
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/index/index'
					});
				}, 1500);
			} catch (error) {
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				this.logging = false;
			}
		},
		thirdPartyLogin(type) {
			uni.showToast({
				title: type + '登录功能开发中',
				icon: 'none'
			});
		},
		goToRegister() {
				uni.navigateTo({
					url: '/pages/register/index'
				});
			}
	}
}
</script>

<style lang="scss" scoped>
.container {
	height: 100vh;
	background-color: #ffffff;
}

.login-form {
	padding: 60rpx 40rpx;
}

.login-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 60rpx;

	.logo {
		margin-bottom: 20rpx;
	}

	.app-name {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.app-desc {
		font-size: 26rpx;
		color: #909399;
	}
}

.form-content {
	margin-bottom: 60rpx;
}

.tab-content {
	padding-top: 30rpx;
}

.form-item {
	margin-bottom: 30rpx;
}

.form-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 40rpx;

	.forgot-password {
		font-size: 24rpx;
		color: #007AFF;
	}
}

.submit-btn {
	margin-bottom: 40rpx;
}

.third-party-login {
	margin-bottom: 40rpx;
}

.divider {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;

	&::before,
	&::after {
		content: '';
		flex: 1;
		height: 1rpx;
		background-color: #f5f5f5;
	}

	text {
		padding: 0 20rpx;
		font-size: 24rpx;
		color: #909399;
	}
}

.third-party-icons {
	display: flex;
	justify-content: center;

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 40rpx;

		text {
			margin-top: 10rpx;
			font-size: 24rpx;
			color: #606266;
		}
	}
}

.register-entry {
	text-align: center;
	font-size: 26rpx;
	color: #606266;

	.link {
		color: #007AFF;
		margin-left: 6rpx;
	}
}
</style>
