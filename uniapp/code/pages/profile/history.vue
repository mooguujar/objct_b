<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="navigateBack">
				<u-icon name="arrow-left" size="32"></u-icon>
			</view>
			<view class="nav-title">浏览历史</view>
			<view class="nav-right" @click="clearAllHistory">
				<text class="clear-btn">清空</text>
			</view>
		</view>

		<!-- 日期分组 -->
		<view class="history-list">
			<!-- 今天 -->
			<view class="date-group" v-if="todayHistory.length > 0">
				<view class="date-title">今天</view>
				<view 
					class="history-item" 
					v-for="(item, index) in todayHistory" 
					:key="item.id"
					@click="viewDetail(item.id, item.type)"
				>
					<view class="item-content">
						<view class="item-title">{{ item.title }}</view>
						<view class="item-info">
							<text class="item-author">{{ item.author }}</text>
							<text class="item-time">{{ item.time }}</text>
						</view>
					</view>
					<view class="item-image" v-if="item.cover">
						<u-image 
							:src="item.cover" 
							width="120" 
							height="80"
							:lazy-load="true"
							border-radius="8"
						></u-image>
					</view>
					<view class="item-action">
						<u-icon name="trash" size="28" color="#909399" @click.stop="deleteItem('today', index)"></u-icon>
					</view>
				</view>
			</view>

			<!-- 昨天 -->
			<view class="date-group" v-if="yesterdayHistory.length > 0">
				<view class="date-title">昨天</view>
				<view 
					class="history-item" 
					v-for="(item, index) in yesterdayHistory" 
					:key="item.id"
					@click="viewDetail(item.id, item.type)"
				>
					<view class="item-content">
						<view class="item-title">{{ item.title }}</view>
						<view class="item-info">
							<text class="item-author">{{ item.author }}</text>
							<text class="item-time">{{ item.time }}</text>
						</view>
					</view>
					<view class="item-image" v-if="item.cover">
						<u-image 
							:src="item.cover" 
							width="120" 
							height="80"
							:lazy-load="true"
							border-radius="8"
						></u-image>
					</view>
					<view class="item-action">
						<u-icon name="trash" size="28" color="#909399" @click.stop="deleteItem('yesterday', index)"></u-icon>
					</view>
				</view>
			</view>

			<!-- 更早 -->
			<view class="date-group" v-if="earlierHistory.length > 0">
				<view class="date-title">更早</view>
				<view 
					class="history-item" 
					v-for="(item, index) in earlierHistory" 
					:key="item.id"
					@click="viewDetail(item.id, item.type)"
				>
					<view class="item-content">
						<view class="item-title">{{ item.title }}</view>
						<view class="item-info">
							<text class="item-author">{{ item.author }}</text>
							<text class="item-time">{{ item.time }}</text>
						</view>
					</view>
					<view class="item-image" v-if="item.cover">
						<u-image 
							:src="item.cover" 
							width="120" 
							height="80"
							:lazy-load="true"
							border-radius="8"
						></u-image>
					</view>
					<view class="item-action">
						<u-icon name="trash" size="28" color="#909399" @click.stop="deleteItem('earlier', index)"></u-icon>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<u-empty v-if="todayHistory.length === 0 && yesterdayHistory.length === 0 && earlierHistory.length === 0" mode="list" text="暂无浏览历史"></u-empty>

			<!-- 加载更多 -->
			<u-loadmore 
				v-if="hasMore"
				:status="loadStatus"
				:load-text="{ loadmore: '上拉加载更多', loading: '加载中...', nomore: '没有更多了' }"
				@loadmore="loadMore"
			></u-loadmore>
		</view>

		<!-- 确认清空弹窗 -->
		<u-popup v-model="showClearDialog" mode="center" :closeable="false">
			<view class="dialog">
				<view class="dialog-title">确认清空历史</view>
				<view class="dialog-content">确定要清空所有浏览历史吗？此操作无法撤销。</view>
				<view class="dialog-footer">
					<u-button type="default" @click="showClearDialog = false">取消</u-button>
					<u-button type="primary" @click="confirmClearAll">确定</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				todayHistory: [],
				yesterdayHistory: [],
			earlierHistory: [],
				page: 1,
				pageSize: 10,
				hasMore: true,
				loadStatus: 'loadmore',
				showClearDialog: false
			};
		},
		onLoad() {
			this.loadHistory();
		},
		methods: {
			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},

			// 加载历史记录
			loadHistory() {
				// 模拟加载数据
				// 实际项目中应调用API获取数据
				this.loadStatus = 'loading';

				setTimeout(() => {
					if (this.page === 1) {
						this.todayHistory = this.getTodayMockData();
						this.yesterdayHistory = this.getYesterdayMockData();
						this.earlierHistory = this.getEarlierMockData();
					} else {
						// 模拟加载更多早期数据
						const moreData = this.getMoreEarlierMockData();
						this.earlierHistory = this.earlierHistory.concat(moreData);
					}

					// 模拟分页，只加载3页
					this.hasMore = this.page < 3;
					this.loadStatus = 'loadmore';
				}, 1000);
			},

			// 获取今天的模拟数据
			getTodayMockData() {
				return [
					{
						id: 1001, 
						title: 'Vue 3.0 新特性详解',
						author: '技术先锋',
						time: '15:30',
						cover: 'https://picsum.photos/400/200?random=1',
						type: 'article'
					},
					{
						id: 2001, 
						title: '#前端开发最佳实践#',
						author: '社区官方',
						time: '11:20',
						cover: 'https://picsum.photos/400/200?random=2',
						type: 'topic'
					}
				];
			},

			// 获取昨天的模拟数据
			getYesterdayMockData() {
				return [
					{
						id: 1002, 
						title: '深入理解 JavaScript 异步编程',
						author: '前端大神',
						time: '昨天 18:45',
						cover: 'https://picsum.photos/400/200?random=3',
						type: 'article'
					},
					{
						id: 3001, 
						title: '2023年前端开发工具包',
						author: '资源分享者',
						time: '昨天 14:20',
						cover: 'https://picsum.photos/400/200?random=4',
						type: 'resource'
					}
				];
			},

			// 获取更早的模拟数据
			getEarlierMockData() {
				return [
					{
						id: 1003, 
						title: 'React Hooks 实战指南',
						author: 'React专家',
						time: '06-10',
						cover: 'https://picsum.photos/400/200?random=5',
						type: 'article'
					},
					{
						id: 2002, 
						title: '#程序员的日常#',
						author: '社区官方',
						time: '06-08',
						cover: 'https://picsum.photos/400/200?random=6',
						type: 'topic'
					}
				];
			},

			// 获取更多早期的模拟数据
			getMoreEarlierMockData() {
				return [
					{
						id: 1004, 
						title: 'TypeScript 高级类型详解',
						author: 'TS爱好者',
						time: '06-05',
						cover: 'https://picsum.photos/400/200?random=7',
						type: 'article'
					},
					{
						id: 3002, 
						title: 'UI设计素材大合集',
						author: '设计师小王',
						time: '06-01',
						cover: 'https://picsum.photos/400/200?random=8',
						type: 'resource'
					}
				];
			},

			// 加载更多
			loadMore() {
				if (!this.hasMore || this.loadStatus === 'loading') return;
				this.page++;
				this.loadHistory();
			},

			// 查看详情
			viewDetail(id, type) {
				// 根据类型跳转到不同的详情页
				let url = '';

				if (type === 'article') {
					url = `/pages/article/detail?id=${id}`;
				} else if (type === 'topic') {
					url = `/pages/topic/detail?id=${id}`;
				} else if (type === 'resource') {
					url = `/pages/resource/detail?id=${id}`;
				}

				uni.navigateTo({
					url: url
				});
			},

			// 删除单个历史记录
			deleteItem(group, index) {
				if (group === 'today') {
					this.todayHistory.splice(index, 1);
				} else if (group === 'yesterday') {
					this.yesterdayHistory.splice(index, 1);
				} else if (group === 'earlier') {
					this.earlierHistory.splice(index, 1);
				}

				uni.showToast({
					title: '删除成功',
					icon: 'success'
				});
			},

			// 清空所有历史记录
			clearAllHistory() {
				this.showClearDialog = true;
			},

			// 确认清空所有历史记录
			confirmClearAll() {
				this.todayHistory = [];
				this.yesterdayHistory = [];
				this.earlierHistory = [];
				this.showClearDialog = false;

				uni.showToast({
					title: '历史记录已清空',
					icon: 'success'
				});
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
			}

			.nav-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}

			.clear-btn {
				font-size: 28rpx;
				color: #007AFF;
			}
		}

		.history-list {
			padding: 0 20rpx 20rpx 20rpx;

			.date-group {
				margin-bottom: 30rpx;

				.date-title {
					font-size: 28rpx;
					color: #909399;
					padding: 20rpx 0;
					border-bottom: 1px solid #f0f0f0;
					margin-bottom: 20rpx;
				}
			}

			.history-item {
		display: flex;
				background-color: #ffffff;
				border-radius: 12rpx;
				padding: 20rpx;
				margin-bottom: 20rpx;
				align-items: center;

				.item-content {
					flex: 1;
					min-width: 0;
					margin-right: 20rpx;

					.item-title {
						font-size: 28rpx;
						color: #333333;
						line-height: 1.5;
						margin-bottom: 10rpx;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}

					.item-info {
						display: flex;
						justify-content: space-between;
						align-items: center;

						.item-author {
							font-size: 24rpx;
							color: #606266;
						}

						.item-time {
							font-size: 24rpx;
							color: #909399;
						}
					}
				}

				.item-image {
					width: 120rpx;
					height: 80rpx;
					margin-right: 20rpx;
				}

				.item-action {
					width: 60rpx;
					height: 60rpx;
					display: flex;
					align-items: center;
					justify-content: center;
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