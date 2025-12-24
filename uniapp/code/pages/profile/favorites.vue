<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @click="navigateBack">
				<u-icon name="arrow-left" size="32"></u-icon>
			</view>
			<view class="nav-title">我的收藏</view>
			<view class="nav-right"></view>
		</view>

		<!-- 收藏类型切换 -->
		<view class="tab-bar">
			<u-tabs 
				:list="tabList" 
				:current="currentTab" 
				@change="tabChange"
				:is-scroll="false"
				bar-width="40"
				bar-height="4"
				active-color="#007AFF"
				inactive-color="#7A7E83"
			></u-tabs>
		</view>

		<!-- 收藏列表 -->
		<view class="favorites-list">
			<view 
				class="favorite-item" 
				v-for="(item, index) in favoritesList" 
				:key="item.id"
				@click="viewDetail(item.id)"
			>
				<view class="item-content">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-info">
						<text class="item-author">{{ item.author }}</text>
						<text class="item-date">{{ item.date }}</text>
					</view>
					<view class="item-stats">
						<view class="stat-item">
							<u-icon name="eye" size="20" color="#909399"></u-icon>
							<text>{{ item.viewCount }}</text>
						</view>
						<view class="stat-item">
							<u-icon name="chat" size="20" color="#909399"></u-icon>
							<text>{{ item.commentCount }}</text>
						</view>
						<view class="stat-item">
							<u-icon name="thumb-up" size="20" color="#909399"></u-icon>
							<text>{{ item.likeCount }}</text>
						</view>
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
					<u-icon name="star" size="28" color="#FF9900" @click.stop="uncollect(item.id, index)"></u-icon>
				</view>
			</view>

			<!-- 空状态 -->
			<u-empty v-if="favoritesList.length === 0" mode="list" text="暂无收藏内容"></u-empty>

			<!-- 加载更多 -->
			<u-loadmore 
				v-if="hasMore"
				:status="loadStatus"
				:load-text="{ loadmore: '上拉加载更多', loading: '加载中...', nomore: '没有更多了' }"
				@loadmore="loadMore"
			></u-loadmore>
		</view>

		<!-- 确认取消收藏弹窗 -->
		<u-popup v-model="showConfirmDialog" mode="center" :closeable="false">
			<view class="dialog">
				<view class="dialog-title">确认取消收藏</view>
				<view class="dialog-content">确定要取消收藏这篇内容吗？</view>
				<view class="dialog-footer">
					<u-button type="default" @click="showConfirmDialog = false">取消</u-button>
					<u-button type="primary" @click="confirmUncollect">确定</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabList: [
					{ name: '文章', id: 'article' },
					{ name: '话题', id: 'topic' },
					{ name: '资源', id: 'resource' }
				],
				currentTab: 0,
				favoritesList: [],
				page: 1,
				pageSize: 10,
				hasMore: true,
				loadStatus: 'loadmore',
				showConfirmDialog: false,
				selectedItemId: null,
				selectedItemIndex: null
			};
		},
		onLoad() {
			this.loadFavorites();
		},
		methods: {
			// 返回上一页
			navigateBack() {
				uni.navigateBack();
			},

			// 切换标签
			tabChange(index) {
				this.currentTab = index;
				this.page = 1;
				this.hasMore = true;
				this.loadFavorites();
			},

			// 加载收藏列表
			loadFavorites() {
				// 模拟加载数据
				// 实际项目中应调用API获取数据
				this.loadStatus = 'loading';

				setTimeout(() => {
					const type = this.tabList[this.currentTab].id;
					let mockData = [];

					if (type === 'article') {
						mockData = this.getArticleMockData();
					} else if (type === 'topic') {
						mockData = this.getTopicMockData();
					} else if (type === 'resource') {
						mockData = this.getResourceMockData();
					}

					if (this.page === 1) {
						this.favoritesList = mockData;
					} else {
						this.favoritesList = this.favoritesList.concat(mockData);
					}

					// 模拟分页，只加载3页
					this.hasMore = this.page < 3 && mockData.length > 0;
					this.loadStatus = 'loadmore';
				}, 1000);
			},

			// 获取文章模拟数据
			getArticleMockData() {
				return [
					{
						id: 1001, 
						title: 'Vue 3.0 新特性详解',
						author: '技术先锋',
						date: '2023-06-15',
						viewCount: 1234,
						commentCount: 56,
						likeCount: 234,
						cover: 'https://picsum.photos/400/200?random=1'
					},
					{
						id: 1002, 
						title: '深入理解 JavaScript 异步编程',
						author: '前端大神',
						date: '2023-06-10',
						viewCount: 2345,
						commentCount: 78,
						likeCount: 456,
						cover: 'https://picsum.photos/400/200?random=2'
					},
					{
						id: 1003, 
						title: 'React Hooks 实战指南',
						author: 'React专家',
						date: '2023-06-05',
						viewCount: 3456,
						commentCount: 90,
						likeCount: 567,
						cover: 'https://picsum.photos/400/200?random=3'
					}
				];
			},

			// 获取话题模拟数据
			getTopicMockData() {
				return [
					{
						id: 2001, 
						title: '#前端开发最佳实践#',
						author: '社区官方',
						date: '2023-06-12',
						viewCount: 5678,
						commentCount: 345,
						likeCount: 1234,
						cover: 'https://picsum.photos/400/200?random=4'
					},
					{
						id: 2002, 
						title: '#程序员的日常#',
						author: '社区官方',
						date: '2023-06-08',
						viewCount: 4321,
						commentCount: 234,
						likeCount: 987,
						cover: 'https://picsum.photos/400/200?random=5'
					}
				];
			},

			// 获取资源模拟数据
			getResourceMockData() {
				return [
					{
						id: 3001, 
						title: '2023年前端开发工具包',
						author: '资源分享者',
						date: '2023-06-01',
						viewCount: 8901,
						commentCount: 123,
						likeCount: 765,
						cover: 'https://picsum.photos/400/200?random=6'
					},
					{
						id: 3002, 
						title: 'UI设计素材大合集',
						author: '设计师小王',
						date: '2023-05-28',
						viewCount: 7654,
						commentCount: 98,
						likeCount: 654,
						cover: 'https://picsum.photos/400/200?random=7'
					}
				];
			},

			// 加载更多
			loadMore() {
				if (!this.hasMore || this.loadStatus === 'loading') return;
				this.page++;
				this.loadFavorites();
			},

			// 查看详情
			viewDetail(id) {
				// 根据类型跳转到不同的详情页
				const type = this.tabList[this.currentTab].id;
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

			// 取消收藏
			uncollect(id, index) {
				this.selectedItemId = id;
				this.selectedItemIndex = index;
				this.showConfirmDialog = true;
			},

			// 确认取消收藏
			confirmUncollect() {
				// 模拟取消收藏操作
				// 实际项目中应调用API
				this.favoritesList.splice(this.selectedItemIndex, 1);
				this.showConfirmDialog = false;

				uni.showToast({
					title: '已取消收藏',
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

			.nav-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
			}
		}

		.tab-bar {
			background-color: #ffffff;
			margin-bottom: 20rpx;
		}

		.favorites-list {
			padding: 0 20rpx 20rpx 20rpx;

			.favorite-item {
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
						margin-bottom: 10rpx;

						.item-author {
							font-size: 24rpx;
							color: #606266;
						}

						.item-date {
							font-size: 24rpx;
							color: #909399;
						}
					}

					.item-stats {
						display: flex;

						.stat-item {
							display: flex;
							align-items: center;
							margin-right: 20rpx;

							text {
								font-size: 24rpx;
								color: #909399;
								margin-left: 5rpx;
							}
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