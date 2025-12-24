<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="navigateBack">
				<u-icon name="arrow-left" size="32"></u-icon>
			</view>
			<view class="nav-title">设置</view>
			<view class="nav-right"></view>
		</view>

		<!-- 设置列表 -->
		<view class="settings-list">
			<!-- 账户设置 -->
			<view class="settings-section">
				<u-cell-group>
					<u-cell-item 
						title="账号与安全"
						icon="safety-certificate-fill"
						icon-size="32"
						icon-color="#07C160"
						arrow-direction="right"
						@click="navigateToAccountSecurity"
					></u-cell-item>
					<u-cell-item 
						title="绑定设置"
						icon="link"
						icon-size="32"
						icon-color="#007AFF"
						arrow-direction="right"
						@click="navigateToBindSettings"
					></u-cell-item>
				</u-cell-group>
			</view>

			<!-- 隐私设置 -->
			<view class="settings-section">
				<u-cell-group>
					<u-cell-item 
						title="隐私设置"
						icon="lock-fill"
						icon-size="32"
						icon-color="#FF9500"
						arrow-direction="right"
						@click="navigateToPrivacySettings"
					></u-cell-item>
					<u-cell-item 
						title="黑名单管理"
						icon="forbidden"
						icon-size="32"
						icon-color="#FF3B30"
						arrow-direction="right"
						@click="navigateToBlacklist"
					></u-cell-item>
				</u-cell-group>
			</view>

			<!-- 通知设置 -->
			<view class="settings-section">
				<u-cell-group>
					<u-cell-item 
						title="新消息通知"
						icon="bell-fill"
						icon-size="32"
						icon-color="#FFCC00"
						:value-class="'switch-content'"
					>
						<u-switch 
							v-model="newMessageNotice"
							@change="toggleNewMessageNotice"
						></u-switch>
					</u-cell-item>
					<u-cell-item 
						title="评论与@通知"
						icon="chat-box-fill"
						icon-size="32"
						icon-color="#5AC8FA"
						:value-class="'switch-content'"
					>
						<u-switch 
							v-model="commentNotice"
							@change="toggleCommentNotice"
						></u-switch>
					</u-cell-item>
					<u-cell-item 
						title="点赞通知"
						icon="heart-fill"
						icon-size="32"
						icon-color="#FF2D55"
						:value-class="'switch-content'"
					>
						<u-switch 
							v-model="likeNotice"
							@change="toggleLikeNotice"
						></u-switch>
					</u-cell-item>
				</u-cell-group>
			</view>

			<!-- 通用设置 -->
			<view class="settings-section">
				<u-cell-group>
					<u-cell-item 
						title="清除缓存"
						icon="trash"
						icon-size="32"
						icon-color="#8E8E93"
						:value="cacheSize"
						value-class="cache-size"
						@click="clearCache"
					></u-cell-item>
					<u-cell-item 
						title="关于我们"
						icon="info-circle-fill"
						icon-size="32"
						icon-color="#5856D6"
						arrow-direction="right"
						@click="navigateToAbout"
					></u-cell-item>
					<u-cell-item 
						title="用户协议"
						icon="file-text-fill"
						icon-size="32"
						icon-color="#34C759"
						arrow-direction="right"
						@click="navigateToAgreement"
					></u-cell-item>
					<u-cell-item 
						title="隐私政策"
						icon="shield-fill"
						icon-size="32"
						icon-color="#AF52DE"
						arrow-direction="right"
						@click="navigateToPrivacyPolicy"
					></u-cell-item>
				</u-cell-group>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section">
				<u-button type="error" @click="showLogoutConfirm">退出登录</u-button>
			</view>
		</view>

		<!-- 确认退出登录弹窗 -->
		<u-popup v-model="showLogoutDialog" mode="center" :closeable="false">
			<view class="dialog">
				<view class="dialog-title">确认退出登录</view>
				<view class="dialog-content">确定要退出当前账号吗？</view>
				<view class="dialog-footer">
					<u-button type="default" @click="showLogoutDialog = false">取消</u-button>
					<u-button type="error" @click="logout">确定</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 清除缓存提示 -->
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				newMessageNotice: true,
				commentNotice: true,
				likeNotice: true,
				cacheSize: '12.5MB',
				showLogoutDialog: false
			};
		},
		methods: {
			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},

			// 账号与安全
			navigateToAccountSecurity() {
				// 实际项目中应跳转到账号与安全页面
				this.$refs.uToast.show({
					title: '账号与安全功能开发中',
					icon: 'none'
				});
			},

			// 绑定设置
			navigateToBindSettings() {
				// 实际项目中应跳转到绑定设置页面
				this.$refs.uToast.show({
					title: '绑定设置功能开发中',
					icon: 'none'
				});
			},

			// 隐私设置
			navigateToPrivacySettings() {
				// 实际项目中应跳转到隐私设置页面
				this.$refs.uToast.show({
					title: '隐私设置功能开发中',
					icon: 'none'
				});
			},

			// 黑名单管理
			navigateToBlacklist() {
				// 实际项目中应跳转到黑名单管理页面
				this.$refs.uToast.show({
					title: '黑名单管理功能开发中',
					icon: 'none'
				});
			},

			// 切换新消息通知
			toggleNewMessageNotice(value) {
				this.newMessageNotice = value;
				// 实际项目中应调用API保存设置
				this.$refs.uToast.show({
					title: value ? '新消息通知已开启' : '新消息通知已关闭',
					icon: 'none'
				});
			},

			// 切换评论与@通知
			toggleCommentNotice(value) {
				this.commentNotice = value;
				// 实际项目中应调用API保存设置
				this.$refs.uToast.show({
					title: value ? '评论与@通知已开启' : '评论与@通知已关闭',
					icon: 'none'
				});
			},

			// 切换点赞通知
			toggleLikeNotice(value) {
				this.likeNotice = value;
				// 实际项目中应调用API保存设置
				this.$refs.uToast.show({
					title: value ? '点赞通知已开启' : '点赞通知已关闭',
					icon: 'none'
				});
			},

			// 清除缓存
			clearCache() {
				// 模拟清除缓存
				// 实际项目中应实现真实的清除缓存逻辑
				uni.showLoading({
					title: '清除中...'
				});

				setTimeout(() => {
					uni.hideLoading();
					this.cacheSize = '0KB';
					this.$refs.uToast.show({
						title: '缓存清除成功',
						icon: 'success'
					});
				}, 1500);
			},

			// 关于我们
			navigateToAbout() {
				// 实际项目中应跳转到关于我们页面
				this.$refs.uToast.show({
					title: '关于我们功能开发中',
					icon: 'none'
				});
			},

			// 用户协议
			navigateToAgreement() {
				// 实际项目中应跳转到用户协议页面
				this.$refs.uToast.show({
					title: '用户协议功能开发中',
					icon: 'none'
				});
			},

			// 隐私政策
			navigateToPrivacyPolicy() {
				// 实际项目中应跳转到隐私政策页面
				this.$refs.uToast.show({
					title: '隐私政策功能开发中',
					icon: 'none'
				});
			},

			// 显示退出登录确认框
			showLogoutConfirm() {
				this.showLogoutDialog = true;
			},

			// 退出登录
			logout() {
				// 模拟退出登录
				// 实际项目中应调用API退出登录并清除本地存储
				uni.showLoading({
					title: '退出中...'
				});

				setTimeout(() => {
					uni.hideLoading();
					this.showLogoutDialog = false;

					// 跳转到登录页
					uni.reLaunch({
						url: '/pages/login/index'
					});
				}, 1500);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f8f8f8;

		.nav-bar {
		display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 30rpx;
			background-color: #ffffff;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

			.nav-left,
			.nav-right {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.nav-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}
		}

		.settings-list {
			padding: 20rpx;

			.settings-section {
				margin-bottom: 20rpx;

				/deep/ .u-cell-group {
					border-radius: 12rpx;
					overflow: hidden;
				}

				/deep/ .u-cell-item {
					padding: 24rpx 30rpx;

					.switch-content {
						width: 80rpx;
					}

					.cache-size {
						color: #909399;
						font-size: 28rpx;
					}
				}
			}

			.logout-section {
				padding: 40rpx 20rpx;

				/deep/ .u-button {
					border-radius: 50rpx;
					font-size: 32rpx;
					background-color: #FF3B30;
				}
			}
		}

		.dialog {
			background-color: #ffffff;
			border-radius: 12rpx;
			padding: 40rpx;
			width: 600rpx;

			.dialog-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
				text-align: center;
				margin-bottom: 20rpx;
			}

			.dialog-content {
				font-size: 28rpx;
				color: #606266;
				text-align: center;
				margin-bottom: 40rpx;
			}

			.dialog-footer {
				display: flex;

				/deep/ .u-button {
					flex: 1;
					border-radius: 0;
				}

				/deep/ .u-button:first-child {
					border-top-left-radius: 8rpx;
					border-bottom-left-radius: 8rpx;
				}

				/deep/ .u-button:last-child {
					border-top-right-radius: 8rpx;
					border-bottom-right-radius: 8rpx;
				}
			}
		}
	}
</style>