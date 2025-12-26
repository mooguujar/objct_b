<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="navigateBack">
				<u-icon name="arrow-left" size="32"></u-icon>
			</view>
			<view class="nav-title">编辑资料</view>
			<view class="nav-right">
				<view class="save-btn" @click="saveProfile">保存</view>
			</view>
		</view>

		<!-- 编辑资料表单 -->
		<view class="edit-form">
			<!-- 头像设置 -->
			<view class="avatar-section">
				<view class="avatar-title">头像</view>
				<view class="avatar-container">
					<image class="avatar" :src="avatar" mode="aspectFill"></image>
					<view class="upload-mask" @click="chooseAvatar">
						<u-icon name="camera-fill" size="36" color="#ffffff"></u-icon>
					</view>
				</view>
			</view>

			<!-- 表单内容 -->
			<view class="form-content">
				<u-form :model="formModel" ref="uForm">
					<u-form-item label="昵称" label-width="120" prop="nickname">
						<u-input 
							v-model="formModel.nickname" 
							placeholder="请输入昵称"
							placeholder-style="color: #C0C4CC"
							:maxlength="12"
						/>
					</u-form-item>

					<u-form-item label="性别" label-width="120" prop="gender">
						<u-radio-group v-model="formModel.gender" @change="onGenderChange">
							<u-radio label="男" value="male" name="gender" :disabled="false"></u-radio>
							<u-radio label="女" value="female" name="gender" :disabled="false"></u-radio>
							<u-radio label="保密" value="secret" name="gender" :disabled="false"></u-radio>
						</u-radio-group>
					</u-form-item>

					<u-form-item label="个性签名" label-width="120" prop="bio">
						<u-input 
							v-model="formModel.bio" 
							placeholder="介绍一下自己吧"
							placeholder-style="color: #C0C4CC"
							type="textarea"
							:rows="4"
							:maxlength="50"
							show-word-limit
						/>
					</u-form-item>

					<u-form-item label="所在地" label-width="120" prop="location">
						<u-input 
							v-model="formModel.location" 
							placeholder="请选择所在地"
							placeholder-style="color: #C0C4CC"
							readonly
							@click="chooseLocation"
						/>
						<u-icon name="arrow-right" slot="right" size="24" color="#C0C4CC"></u-icon>
					</u-form-item>

					<u-form-item label="生日" label-width="120" prop="birthday">
						<u-input 
							v-model="formModel.birthday" 
							placeholder="请选择生日"
							placeholder-style="color: #C0C4CC"
							readonly
							@click="chooseBirthday"
						/>
						<u-icon name="arrow-right" slot="right" size="24" color="#C0C4CC"></u-icon>
					</u-form-item>

					<u-form-item label="职业" label-width="120" prop="occupation">
						<u-input 
							v-model="formModel.occupation" 
							placeholder="请输入职业"
							placeholder-style="color: #C0C4CC"
							:maxlength="20"
						/>
					</u-form-item>

					<u-form-item label="兴趣标签" label-width="120" prop="tags">
						<view class="tags-container">
							<view 
								v-for="(tag, index) in tagsList" 
								:key="index" 
								class="tag-item"
								:class="{ 'active': formModel.tags.includes(tag) }"
								@click="toggleTag(tag)"
							>
								{{ tag }}
							</view>
						</view>
					</u-form-item>

					<view class="form-tip">
						温馨提示：修改资料后，将在24小时内同步到所有相关页面
					</view>
				</u-form>
			</view>
		</view>

		<!-- 选择器弹窗 -->
		<u-picker 
			v-model="showLocationPicker" 
			:columns="locationColumns" 
			@confirm="onLocationConfirm" 
			@cancel="showLocationPicker = false"
		></u-picker>

		<u-datetime-picker 
			v-model="showBirthdayPicker" 
			mode="date" 
			@confirm="onBirthdayConfirm" 
			@cancel="showBirthdayPicker = false"
			:min-date="minDate"
			:max-date="maxDate"
		></u-datetime-picker>

		<!-- 提示框 -->
		<u-toast ref="uToast" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 用户资料表单
				formModel: {
					nickname: '星云用户123',
					gender: 'male',
					bio: '热爱分享生活中的美好瞬间',
					location: '北京市 北京市',
					birthday: '1990-01-01',
					occupation: '软件工程师',
					tags: ['摄影', '旅行', '科技']
				},

				// 头像
				avatar: 'https://cdn.uviewui.com/uview/common/user-img.jpg',

				// 兴趣标签列表
				tagsList: ['摄影', '旅行', '科技', '美食', '健身', '音乐', '阅读', '电影', '游戏', '编程'],

				// 选择器状态
				showLocationPicker: false,
				showBirthdayPicker: false,

				// 日期范围
				minDate: new Date(1900, 0, 1).getTime(),
				maxDate: new Date().getTime(),

				// 城市数据（简化版）
				locationColumns: [
					['北京市', '上海市', '广州市', '深圳市', '杭州市', '南京市'],
					['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区']
				]
			};
		},

		methods: {
			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},

			// 选择头像
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 模拟上传头像
						// 实际项目中应调用上传API
						this.avatar = res.tempFilePaths[0];
						this.$refs.uToast.show({
							title: '头像选择成功',
							icon: 'success'
						});
					}
				});
			},

			// 性别选择
			onGenderChange(value) {
				this.formModel.gender = value;
			},

			// 选择所在地
			chooseLocation() {
				this.showLocationPicker = true;
			},

			// 确认所在地
			onLocationConfirm(e) {
				const [province, city] = e.value;
				this.formModel.location = `${province} ${city}`;
				this.showLocationPicker = false;
			},

			// 选择生日
			chooseBirthday() {
				this.showBirthdayPicker = true;
			},

			// 确认生日
			onBirthdayConfirm(e) {
				const date = new Date(e.timestamp);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				this.formModel.birthday = `${year}-${month}-${day}`;
				this.showBirthdayPicker = false;
			},

			// 切换标签
			toggleTag(tag) {
				const index = this.formModel.tags.indexOf(tag);
				if (index > -1) {
					// 移除标签
					this.formModel.tags.splice(index, 1);
				} else if (this.formModel.tags.length < 5) {
					// 添加标签（最多5个）
					this.formModel.tags.push(tag);
				} else {
					this.$refs.uToast.show({
						title: '最多只能选择5个标签',
						icon: 'none'
					});
				}
			},

			// 保存资料
			saveProfile() {
				// 表单验证
				if (!this.formModel.nickname.trim()) {
					this.$refs.uToast.show({
						title: '昵称不能为空',
						icon: 'none'
					});
					return;
				}

				if (this.formModel.bio.length > 50) {
					this.$refs.uToast.show({
						title: '个性签名不能超过50个字符',
						icon: 'none'
					});
					return;
				}

				// 模拟保存操作
				// 实际项目中应调用API保存用户资料
				uni.showLoading({
					title: '保存中...'
				});

				setTimeout(() => {
					uni.hideLoading();
					this.$refs.uToast.show({
						title: '资料保存成功',
						icon: 'success'
					});

					setTimeout(() => {
						this.navigateBack();
					}, 1500);
				}, 2000);
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

			.nav-right {
				width: auto;
				padding: 0 20rpx;
			}

			.nav-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}

			.save-btn {
				font-size: 28rpx;
				color: #007AFF;
				font-weight: 500;
			}
		}

		.edit-form {
			padding: 30rpx;

			.avatar-section {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-bottom: 40rpx;

				.avatar-title {
					font-size: 28rpx;
					color: #606266;
					margin-bottom: 20rpx;
				}

				.avatar-container {
					position: relative;
					width: 180rpx;
					height: 180rpx;

					.avatar {
						width: 100%;
						height: 100%;
						border-radius: 50%;
					}

					.upload-mask {
						position: absolute;
						bottom: 0;
						right: 0;
						width: 60rpx;
						height: 60rpx;
						background-color: rgba(0, 0, 0, 0.5);
						border-radius: 50%;
						display: flex;
						align-items: center;
						justify-content: center;
						border: 4rpx solid #ffffff;
					}
				}
			}

			.form-content {
				background-color: #ffffff;
				border-radius: 12rpx;
				padding: 0 30rpx;

				/deep/ .u-form {
					padding: 20rpx 0;
				}

				/deep/ .u-form-item {
					padding: 24rpx 0;
					border-bottom: 2rpx solid #f0f0f0;

					&:last-child {
						border-bottom: none;
					}

					/deep/ .u-input {
						font-size: 28rpx;

						&--textarea {
							height: 200rpx;
						}
					}

					/deep/ .u-radio-group {
						display: flex;

						/deep/ .u-radio {
							margin-right: 40rpx;

							/deep/ .u-radio__label {
								font-size: 28rpx;
							}
						}
					}

					.tags-container {
						display: flex;
						flex-wrap: wrap;
						padding: 10rpx 0;

						.tag-item {
							padding: 12rpx 30rpx;
							margin: 10rpx 20rpx 10rpx 0;
							border: 2rpx solid #DCDFE6;
							border-radius: 50rpx;
							font-size: 26rpx;
							color: #606266;
							background-color: #ffffff;
							transition: all 0.3s;

							&.active {
								background-color: #007AFF;
								border-color: #007AFF;
								color: #ffffff;
							}
						}
					}
				}

				.form-tip {
					padding: 20rpx 0;
					font-size: 24rpx;
					color: #909399;
					text-align: center;
				}
			}
		}
	}
</style>