
<template>
	<view class="container">
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<view class="avatar-wrapper">
					<u-image 
						:src="userInfo.avatar" 
						shape="circle" 
						width="120" 
						height="120"
						:lazy-load="true"
					></u-image>
					<view class="edit-avatar">
						<u-icon name="camera-fill" color="#ffffff" size="24"></u-icon>
					</view>
				</view>
				<view class="user-details">
					<view class="user-name">{{ userInfo.name }}</view>
					<view class="user-desc">{{ userInfo.description }}</view>
					<view class="user-stats">
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.followers }}</text>
							<text class="stat-label">粉丝</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.following }}</text>
							<text class="stat-label">关注</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ userInfo.articles }}</text>
							<text class="stat-label">文章</text>
						</view>
					</view>
				</view>
			</view>
			<view class="edit-profile">
				<u-button type="primary" size="mini" @click="editProfile">编辑资料</u-button>
			</view>
		</view>

		<!-- 数据统计 -->
		<view class="stats-card">
			<u-grid :col="4" :border="false">
				<u-grid-item v-for="(item, index) in statsData" :key="index">
					<view class="stats-value">{{ item.value }}</view>
					<view class="stats-label">{{ item.label }}</view>
				</u-grid-item>
			</u-grid>
		</view>

		<!-- 功能列表 -->
		<view class="function-list">
			<u-cell-group>
				<u-cell-item 
					v-for="(item, index) in functionList" 
					:key="index"
					:title="item.title" 
					:icon="item.icon" 
					:icon-size="32"
					:icon-color="item.color"
					arrow-direction="right"
					@click="navigateTo(item.path)"
				></u-cell-item>
			</u-cell-group>
		</view>

		<!-- 我的文章 -->
		<view class="my-articles">
			<view class="section-header">
				<text class="section-title">我的文章</text>
				<view class="section-more" @click="viewAllArticles">
					<text>查看全部</text>
					<u-icon name="arrow-right" size="24" color="#909399"></u-icon>
				</view>
			</view>

			<view class="article-list">
				<view 
					class="article-item" 
					v-for="(item, index) in myArticles" 
					:key="index"
					@click="viewArticle(item.id)"
				>
					<view class="article-content">
						<view class="article-title">{{ item.title }}</view>
						<view class="article-stats">
							<view class="stat-item">
								<u-icon name="eye" size="24" color="#909399"></u-icon>
								<text>{{ item.viewCount }}</text>
							</view>
							<view class="stat-item">
								<u-icon name="chat" size="24" color="#909399"></u-icon>
								<text>{{ item.commentCount }}</text>
							</view>
							<view class="stat-item">
								<u-icon name="thumb-up" size="24" color="#909399"></u-icon>
								<text>{{ item.likeCount }}</text>
							</view>
						</view>
					</view>
					<view class="article-image" v-if="item.cover">
						<u-image 
							:src="item.cover" 
							width="120" 
							height="80"
							:lazy-load="true"
							border-radius="8"
						></u-image>
					</view>
				</view>

				<u-empty v-if="myArticles.length === 0" mode="list" text="暂无文章"></u-empty>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				id: 1,
				name: '社区开发者',
				description: '热爱编程，分享技术，共同进步',
				avatar: 'https://picsum.photos/200/200?random=1',
				followers: 128,
				following: 56,
				articles: 12
			},
			statsData: [
				{ label: '阅读量', value: '12.5K' },
				{ label: '获赞', value: '3.2K' },
				{ label: '收藏', value: '856' },
				{ label: '积分', value: '2580' }
			],
			functionList: [
				{ title: '我的收藏', icon: 'star', color: '#FF9900', path: '/pages/profile/favorites' },
				{ title: '浏览历史', icon: 'clock', color: '#007AFF', path: '/pages/profile/history' },
				{title:'设置', icon: 'setting', color: '#607D8B', path: '/pages/profile/settings' }
			],
			myArticles: [
				{
					id: 1,
					title: 'Vue 3.0 新特性详解',
					cover: 'https://picsum.photos/400/200?random=1',
					viewCount: 1234,
					commentCount: 56,
					likeCount: 234
				},
				{
					id: 2,
					title: '深入理解 JavaScript 异步编程',
					cover: 'https://picsum.photos/400/200?random=2',
					viewCount: 2345,
					commentCount: 78,
					likeCount: 456
				}
			]
		}
	},
	methods: {
		editProfile() {
			uni.navigateTo({
				url: '/pages/profile/edit'
			});
		},
		navigateTo(path) {
			uni.navigateTo({
				url: path
			});
		},
		viewAllArticles() {
			uni.navigateTo({
				url: '/pages/profile/articles'
			});
		},
		viewArticle(id) {
			uni.navigateTo({
				url: '/pages/article/detail?id=' + id
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 20rpx;
}

.user-card {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.user-info {
	display: flex;
	margin-bottom: 20rpx;
}

.avatar-wrapper {
	position: relative;
	margin-right: 30rpx;

	.edit-avatar {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: #007AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}

.user-details {
	flex: 1;

	.user-name {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.user-desc {
		font-size: 26rpx;
		color: #606266;
		margin-bottom: 20rpx;
	}

	.user-stats {
		display: flex;

		.stat-item {
			margin-right: 40rpx;

			.stat-value {
				font-size: 28rpx;
				font-weight: 500;
				margin-right: 6rpx;
			}

			.stat-label {
				font-size: 24rpx;
				color: #909399;
			}
		}
	}
}

.edit-profile {
	display: flex;
	justify-content: flex-end;
}

.stats-card {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;

	.stats-value {
		font-size: 32rpx;
		font-weight: bold;
		margin-bottom: 6rpx;
	}

	.stats-label {
		font-size: 24rpx;
		color: #909399;
	}
}

.function-list {
	background-color: #ffffff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
}

.my-articles {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 20rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.section-more {
		display: flex;
		align-items: center;

		text {
			font-size: 24rpx;
			color: #909399;
			margin-right: 6rpx;
		}
	}
}

.article-list {
	.article-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}
	}
}

.article-content {
	flex: 1;
	margin-right: 20rpx;

	.article-title {
		font-size: 28rpx;
		font-weight: 500;
		margin-bottom: 16rpx;
	}

	.article-stats {
		display: flex;

		.stat-item {
			display: flex;
			align-items: center;
			margin-right: 20rpx;
			font-size: 24rpx;
			color: #909399;

			text {
				margin-left: 6rpx;
			}
		}
	}
}

.article-image {
	width: 120rpx;
	height: 80rpx;
	border-radius: 8rpx;
	overflow: hidden;
}
</style>
