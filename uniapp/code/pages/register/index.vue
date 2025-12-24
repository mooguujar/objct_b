<template>
	<view class="container">
		<view class="register-form">
			<view class="form-header">
				<view class="logo">
					<u-image 
						src="/static/logo.png" 
						width="120" 
						height="120"
						mode="aspectFit"
						shape="circle"
					></u-image>
				</view>
				<view class="app-name">星云社区</view>
				<view class="app-desc">创建账号，开始精彩之旅</view>
			</view>

			<view class="form-content">
				<!-- 手机号输入 -->
				<view class="form-item">
					<u-input 
						v-model="registerForm.phone" 
						placeholder="请输入手机号" 
						:clearable="true"
						:border="true"
						type="number"
						@input="onPhoneInput"
					></u-input>
				</view>

				<!-- 短信验证码 -->
				<view class="form-item">
					<u-input 
						v-model="registerForm.code" 
						placeholder="请输入验证码" 
						:clearable="true"
						:border="true"
						type="number"
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
								:disabled="codeBtnDisabled || !canGetCode"
							>
								{{ codeTips }}
							</u-button>
						</template>
					</u-input>
				</view>

				<!-- 设置密码 -->
				<view class="form-item">
					<u-input 
						v-model="registerForm.password" 
						type="password" 
						placeholder="请设置6-20位密码" 
						:clearable="true"
						:border="true"
						@input="onPasswordInput"
					></u-input>
				</view>

				<!-- 确认密码 -->
				<view class="form-item">
					<u-input 
						v-model="registerForm.confirmPassword" 
						type="password" 
						placeholder="请再次输入密码" 
						:clearable="true"
						:border="true"
						@input="onConfirmPasswordInput"
					></u-input>
				</view>

				<!-- 用户协议 -->
				<view class="agreement">
					<u-checkbox v-model="agreeTerms" size="24">
						同意
						<text class="link" @click="viewUserAgreement">《用户协议》</text>
						和
						<text class="link" @click="viewPrivacyPolicy">《隐私政策》</text>
					</u-checkbox>
				</view>

				<!-- 注册按钮 -->
				<view class="submit-btn">
					<u-button 
						type="primary" 
						size="default" 
						@click="register"
						:loading="registering"
						:disabled="!canRegister"
					>
						{{ registering ? '注册中...' : '注册' }}
					</u-button>
				</view>
			</view>

			<!-- 登录入口 -->
			<view class="login-entry">
				已有账号？
				<text class="link" @click="goToLogin">立即登录</text>
			</view>
		</view>

		<!-- 提示弹窗 -->
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				registerForm: {
					phone: '',
					code: '',
					password: '',
					confirmPassword: ''
				},
				agreeTerms: false,
				registering: false,
				codeTips: '获取验证码',
				codeBtnDisabled: false,
				codeBtnType: 'info'
			};
		},

		computed: {
			// 校验手机号格式
			isPhoneValid() {
				return /^1[3-9]\d{9}$/.test(this.registerForm.phone);
			},

			// 是否可以获取验证码
			canGetCode() {
				return this.isPhoneValid;
			},

			// 校验密码格式（6-20位，包含字母和数字）
			isPasswordValid() {
				return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(this.registerForm.password);
			},

			// 两次密码是否一致
			isPasswordMatch() {
				return this.registerForm.password === this.registerForm.confirmPassword;
			},

			// 是否可以注册
			canRegister() {
				return this.isPhoneValid && 
					this.registerForm.code.length === 6 && 
					this.isPasswordValid && 
					this.isPasswordMatch && 
					this.agreeTerms;
			}
		},

		methods: {
			// 手机号输入处理
			onPhoneInput(value) {
				// 限制只能输入数字，且长度不超过11位
				this.registerForm.phone = value.replace(/\D/g, '').slice(0, 11);
			},

			// 密码输入处理
			onPasswordInput(value) {
				// 密码可以包含字母、数字和特殊字符
				this.registerForm.password = value.slice(0, 20);
			},

			// 确认密码输入处理
			onConfirmPasswordInput(value) {
				this.registerForm.confirmPassword = value.slice(0, 20);
			},

			// 验证码倒计时文本变化
			codeChange(text) {
				this.codeTips = text;
			},

			// 验证码倒计时开始
			getCodeStart() {
				this.codeBtnDisabled = true;
				this.codeBtnType = 'info';
			},

			// 验证码倒计时结束
			getCodeEnd() {
				this.codeBtnDisabled = false;
				this.codeBtnType = 'primary';
			},

			// 获取短信验证码
			getSmsCode() {
				if (!this.canGetCode) {
					this.$refs.uToast.show({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}

				if (this.$refs.uCode.canGetCode) {
					// 模拟发送验证码
					uni.showLoading({
						title: '正在获取验证码'
					});

					setTimeout(() => {
						uni.hideLoading();
						this.$refs.uToast.show({
							title: '验证码已发送',
							icon: 'none'
						});
						// 通知验证码组件内部开始倒计时
						this.$refs.uCode.start();
					}, 1000);
				} else {
					this.$refs.uToast.show({
						title: '请稍后再试',
						icon: 'none'
					});
				}
			},

			// 查看用户协议
			viewUserAgreement() {
				uni.showToast({
					title: '用户协议功能开发中',
					icon: 'none'
				});
			},

			// 查看隐私政策
			viewPrivacyPolicy() {
				uni.showToast({
					title: '隐私政策功能开发中',
					icon: 'none'
				});
			},

			// 注册
			async register() {
				if (!this.isPhoneValid) {
					this.$refs.uToast.show({
						title: '请输入正确的手机号',
						icon: 'none'
					});
					return;
				}

				if (this.registerForm.code.length !== 6) {
					this.$refs.uToast.show({
						title: '请输入6位验证码',
						icon: 'none'
					});
					return;
				}

				if (!this.isPasswordValid) {
					this.$refs.uToast.show({
						title: '密码需6-20位，包含字母和数字',
						icon: 'none'
					});
					return;
				}

				if (!this.isPasswordMatch) {
					this.$refs.uToast.show({
						title: '两次输入的密码不一致',
						icon: 'none'
					});
					return;
				}

				if (!this.agreeTerms) {
					this.$refs.uToast.show({
						title: '请阅读并同意用户协议和隐私政策',
						icon: 'none'
					});
					return;
				}

				this.registering = true;

				try {
					// 实际项目中这里应该调用云函数或API进行注册
					// 模拟注册延迟
					await new Promise(resolve => setTimeout(resolve, 2000));

					// 模拟注册成功
					uni.setStorageSync('token', 'mock_token_' + Date.now());
					uni.setStorageSync('userInfo', {
						id: Date.now(),
						name: '星云用户' + Math.floor(Math.random() * 10000),
						avatar: 'https://picsum.photos/200/200?random=' + Date.now()
					});

					this.$refs.uToast.show({
						title: '注册成功',
						icon: 'success'
					});

					// 延迟跳转
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/index/index'
						});
					}, 1500);
				} catch (error) {
					this.$refs.uToast.show({
						title: '注册失败，请重试',
						icon: 'none'
					});
				} finally {
					this.registering = false;
				}
			},

			// 跳转到登录页面
			goToLogin() {
				uni.navigateTo({
					url: '/pages/login/index'
				});
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		height: 100vh;
		background-color: #ffffff;
	}

	.register-form {
		padding: 60rpx 40rpx;
	}

	.form-header {
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
		margin-bottom: 40rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.agreement {
		margin-bottom: 40rpx;
		padding: 0 10rpx;

		 .u-checkbox {
			font-size: 24rpx;
			color: #606266;

			.link {
				color: #007AFF;
			}
		}
	}

	.submit-btn {
		margin-bottom: 40rpx;
	}

	.login-entry {
		text-align: center;
		font-size: 26rpx;
		color: #606266;

		.link {
			color: #007AFF;
			margin-left: 6rpx;
		}
	}
</style>