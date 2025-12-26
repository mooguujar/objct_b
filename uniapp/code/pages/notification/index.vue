
<template>
	<view class="container">
		<!-- 消息类型标签页 -->
		<u-tabs 
			:list="tabList" 
			:current="currentTab" 
			@change="tabChange"
			:is-scroll="true"
			bar-width="40"
			bar-height="4"
			active-color="#007AFF"
			inactive-color="#7A7E83"
		></u-tabs>

		<!-- 消息列表 -->
		<view class="notification-list">
			<!-- 评论消息 -->
			<view v-if="currentTab === 0">
				<view 
					class="notification-item" 
					v-for="(item, index) in commentNotifications" 
					:key="index"
					@click="viewNotification(item)"
				>
					<view class="notification-avatar">
						<u-image 
							:src="item.user.avatar" 
							shape="circle" 
							width="60" 
							height="60"
							:lazy-load="true"
						></u-image>
					</view>
					<view class="notification-content">
						<view class="notification-title">
							<text class="user-name">{{ item.user.name }}</text>
							<text>评论了你的文章</text>
						</view>
						<view class="notification-desc">{{ item.content }}</view>
						<view class="notification-article">{{ item.articleTitle }}</view>
						<view class="notification-time">{{ item.time }}</view>
					</view>
					<view class="notification-status" v-if="!item.read">
						<u-badge count="1" :offset="[0, 0]"></u-badge>
					</view>
				</view>

				<u-empty v-if="commentNotifications.length === 0" mode="message" text="暂无评论消息"></u-empty>
			</view>

			<!-- 点赞消息 -->
			<view v-if="currentTab === 1">
				<view 
					class="notification-item" 
					v-for="(item, index) in likeNotifications" 
					:key="index"
					@click="viewNotification(item)"
				>
					<view class="notification-avatar">
						<u-image 
							:src="item.user.avatar" 
							shape="circle" 
							width="60" 
							height="60"
							:lazy-load="true"
						></u-image>
					</view>
					<view class="notification-content">
						<view class="notification-title">
							<text class="user-name">{{ item.user.name }}</text>
							<text>赞了你的文章</text>
						</view>
						<view class="notification-article">{{ item.articleTitle }}</view>
						<view class="notification-time">{{ item.time }}</view>
					</view>
					<view class="notification-status" v-if="!item.read">
						<u-badge count="1" :offset="[0, 0]"></u-badge>
					</view>
				</view>

				<u-empty v-if="likeNotifications.length === 0" mode="message" text="暂无点赞消息"></u-empty>
			</view>

			<!-- 关注消息 -->
			<view v-if="currentTab === 2">
				<view 
					class="notification-item" 
					v-for="(item, index) in followNotifications" 
					:key="index"
					@click="viewNotification(item)"
				>
					<view class="notification-avatar">
						<u-image 
							:src="item.user.avatar" 
							shape="circle" 
							width="60" 
							height="60"
							:lazy-load="true"
						></u-image>
					</view>
					<view class="notification-content">
						<view class="notification-title">
							<text class="user-name">{{ item.user.name }}</text>
							<text>关注了你</text>
						</view>
						<view class="notification-desc">{{ item.user.description }}</view>
						<view class="notification-time">{{ item.time }}</view>
					</view>
					<view class="notification-action">
						<u-button 
							size="mini" 
							:type="item.isFollowing ? 'info' : 'primary'"
							:plain="item.isFollowing"
							@click.stop="toggleFollow(item)"
						>
							{{ item.isFollowing ? '已关注' : '回关' }}
						</u-button>
					</view>
					<view class="notification-status" v-if="!item.read">
						<u-badge count="1" :offset="[0, 0]"></u-badge>
					</view>
				</view>

				<u-empty v-if="followNotifications.length === 0" mode="message" text="暂无关注消息"></u-empty>
			</view>

			<!-- 系统消息 -->
			<view v-if="currentTab === 3">
				<view 
					class="notification-item system-item" 
					v-for="(item, index) in systemNotifications" 
					:key="index"
					@click="viewNotification(item)"
				>
					<view class="notification-icon">
						<u-icon :name="item.icon" size="40" :color="item.color"></u-icon>
					</view>
					<view class="notification-content">
						<view class="notification-title">{{ item.title }}</view>
						<view class="notification-desc">{{ item.content }}</view>
						<view class="notification-time">{{ item.time }}</view>
					</view>
					<view class="notification-status" v-if="!item.read">
						<u-badge count="1" :offset="[0, 0]"></u-badge>
					</view>
				</view>

				<u-empty v-if="systemNotifications.length === 0" mode="message" text="暂无系统消息"></u-empty>
			</view>
		</view>

		<!-- 加载更多 -->
		<u-loadmore :status="loadMoreStatus" @loadmore="loadMore"></u-loadmore>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tabList: [
				{ name: '评论' },
				{ name: '点赞' },
				{ name: '关注' },
				{ name: '系统' }
			],
			currentTab: 0,
			commentNotifications: [
				{
					id: 1,
					user: {
						name: '前端爱好者',
						avatar: 'https://picsum.photos/100/100?random=1'
					},
					content: '这篇文章写得非常好，对我帮助很大！',
					articleTitle: 'Vue 3.0 新特性详解',
					time: '10分钟前',
					read: false
				},
				{
					id: 2,
					user: {
						name: 'JS学习者',
						avatar: 'https://picsum.photos/100/100?random=2'
					},
					content: '请问有没有相关的实践案例可以参考？',
					articleTitle: '深入理解 JavaScript 异步编程',
					time: '2小时前',
					read: true
				}
			],
			likeNotifications: [
				{
					id: 3,
					user: {
						name: '全栈开发者',
						avatar: 'https://picsum.photos/100/100?random=3'
					},
					articleTitle: '微前端架构实践指南',
					time: '1小时前',
					read: false
				},
				{
					id: 4,
					user: {
						name: '架构师',
						avatar: 'https://picsum.photos/100/100?random=4'
					},
					articleTitle: '微前端架构实践指南',
					time: '3小时前',
					read: true
				}
			],
			followNotifications: [
				{
					id: 5,
					user: {
						name: 'UI设计师',
						avatar: 'https://picsum.photos/100/100?random=5',
						description: '资深UI/UX设计师，设计系统专家'
					},
					time: '5小时前',
					read: false,
					isFollowing: false
				}
			],
			systemNotifications: [
				{
					id: 6,
					icon: 'gift',
					color: '#FA3534',
					title: '社区新人福利',
					content: '恭喜你成为星云社区新成员，送你10个积分！',
					time: '1天前',
					read: true
				},
				{
					id: 7,
					icon: 'info-circle',
					color: '#007AFF',
					title: '社区公告',
					content: '星云社区将于本周六进行系统维护，预计维护时间为2小时，请提前做好准备。',
					time: '2天前',
					read: false
				}
			],
			page: 1,
			pageSize: 10,
			loadMoreStatus: 'loadmore'
		}
	},
	onLoad() {
		this.loadNotifications();
	},
	onPullDownRefresh() {
		this.refresh();
	},
	methods: {
		tabChange(index) {
			this.currentTab = index;
			this.refresh();
		},
		loadNotifications() {
			// 模拟加载状态
			if (this.page >= 3) {
				this.loadMoreStatus = 'nomore';
			} else {
				this.loadMoreStatus = 'loadmore';
			}
		},
		refresh() {
			this.page = 1;
			this.loadMoreStatus = 'loading';
			this.loadNotifications().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		loadMore() {
			if (this.loadMoreStatus === 'nomore') return;

			this.loadMoreStatus = 'loading';
			this.page++;
			this.loadNotifications();
		},
		viewNotification(item) {
			// 标记为已读
			item.read = true;

			// 根据不同类型跳转到不同页面
			if (this.currentTab === 0 || this.currentTab === 1) {
				// 跳转到文章详情页
				uni.navigateTo({
					url: '/pages/article/detail?id=' + item.articleId
				});
			} else if (this.currentTab === 2) {
				// 跳转到用户主页
				uni.navigateTo({
					url: '/pages/user/index?id=' + item.user.id
				});
			} else if (this.currentTab === 3) {
				// 系统消息，显示详情弹窗
				uni.showModal({
					title: item.title,
					content: item.content,
					showCancel: false
				});
			}
		},
		toggleFollow(item) {
			item.isFollowing = !item.isFollowing;
			uni.showToast({
				title: item.isFollowing ? '关注成功' : '已取消关注',
				icon: 'none'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 20rpx;
}

.notification-list {
	margin-top: 20rpx;
}

.notification-item {
	display: flex;
	padding: 24rpx;
	background-color: #ffffff;
	border-bottom: 1rpx solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}

	&.system-item {
		.notification-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60rpx;
			height: 60rpx;
			background-color: #f5f5f5;
			border-radius: 50%;
			margin-right: 20rpx;
		}
	}
}

.notification-avatar {
	margin-right: 20rpx;
}

.notification-content {
	flex: 1;

	.notification-title {
		font-size: 28rpx;
		margin-bottom: 8rpx;

		.user-name {
			font-weight: 500;
			color: #007AFF;
		}
	}

	.notification-desc {
		font-size: 26rpx;
		color: #606266;
		margin-bottom: 8rpx;
	}

	.notification-article {
		font-size: 24rpx;
		color: #909399;
		margin-bottom: 8rpx;
	}

	.notification-time {
		font-size: 24rpx;
		color: #C0C4CC;
	}
}

.notification-action {
	margin-left: 20rpx;
}

.notification-status {
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding-top: 10rpx;
}
</style>
