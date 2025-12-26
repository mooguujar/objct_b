
<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-title">{{ categoryName }}</view>
		</view>

		<!-- 筛选条件 -->
		<view class="filter-bar">
			<u-dropdown>
				<u-dropdown-item v-model="filter.sort" title="排序" :options="sortOptions"></u-dropdown-item>
				<u-dropdown-item v-model="filter.time" title="时间" :options="timeOptions"></u-dropdown-item>
			</u-dropdown>
		</view>

		<!-- 文章列表 -->
		<view class="article-list">
			<view class="article-item" v-for="(item, index) in articleList" :key="index" @click="goToDetail(item.id)">
				<view class="article-header">
					<view class="author-info">
						<u-image 
							:src="item.author.avatar" 
							shape="circle" 
							width="40" 
							height="40"
							:lazy-load="true"
						></u-image>
						<view class="author-name">{{ item.author.name }}</view>
					</view>
					<view class="article-time">{{ item.time }}</view>
				</view>

				<view class="article-content">
					<view class="article-title">{{ item.title }}</view>
					<view class="article-desc">{{ item.description }}</view>
				</view>

				<view class="article-image" v-if="item.cover">
					<u-image 
						:src="item.cover" 
						width="100%" 
						height="180px"
						:lazy-load="true"
						border-radius="8"
					></u-image>
				</view>

				<view class="article-footer">
					<view class="article-tags">
						<u-tag 
							v-for="(tag, tagIndex) in item.tags" 
							:key="tagIndex" 
							:text="tag" 
							type="info" 
							size="mini"
							mode="plain"
							shape="circle"
						></u-tag>
					</view>
					<view class="article-stats">
						<view class="stat-item">
							<u-icon name="eye" size="28" color="#7A7E83"></u-icon>
							<text>{{ item.viewCount }}</text>
						</view>
						<view class="stat-item">
							<u-icon name="chat" size="28" color="#7A7E83"></u-icon>
							<text>{{ item.commentCount }}</text>
						</view>
						<view class="stat-item">
							<u-icon name="thumb-up" size="28" color="#7A7E83"></u-icon>
							<text>{{ item.likeCount }}</text>
						</view>
					</view>
				</view>
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
			categoryName: '',
			filter: {
				sort: 0,
				time: 0
			},
			sortOptions: [
				{ label: '最热', value: 0 },
				{ label: '最新', value: 1 },
				{ label: '评论最多', value: 2 }
			],
			timeOptions: [
				{ label: '全部', value: 0 },
				{ label: '今天', value: 1 },
				{ label: '本周', value: 2 },
				{ label: '本月', value: 3 }
			],
			articleList: [],
			page: 1,
			pageSize: 10,
			loadMoreStatus: 'loadmore'
		}
	},
	onLoad(options) {
		if (options.category) {
			this.categoryName = decodeURIComponent(options.category);
			uni.setNavigationBarTitle({
				title: this.categoryName
			});
		}
		this.loadArticles();
	},
	onPullDownRefresh() {
		this.refresh();
	},
	methods: {
		async loadArticles() {
			// 模拟从服务器获取数据
			// 实际项目中应该调用云函数或API
			const mockData = [
				{
					id: 1,
					title: this.categoryName + '开发技巧分享',
					description: '本文将分享一些' + this.categoryName + '开发的实用技巧，帮助你提高开发效率...',
					cover: 'https://picsum.photos/400/200?random=1',
					time: '2小时前',
					author: {
						name: '技术达人',
						avatar: 'https://picsum.photos/100/100?random=1'
					},
					tags: [this.categoryName, '开发', '技巧'],
					viewCount: 1234,
					commentCount: 56,
					likeCount: 234
				},
				{
					id: 2,
					title: this.categoryName + '最佳实践指南',
					description: '在' + this.categoryName + '开发过程中，遵循最佳实践可以帮助我们写出更高质量的代码...',
					cover: 'https://picsum.photos/400/200?random=2',
					time: '5小时前',
					author: {
						name: '架构师',
						avatar: 'https://picsum.photos/100/100?random=2'
					},
					tags: [this.categoryName, '最佳实践', '架构'],
					viewCount: 2345,
					commentCount: 78,
					likeCount: 456
				},
				{
					id: 3,
					title: this.categoryName + '性能优化实战',
					description: '性能优化是' + this.categoryName + '开发中的重要环节，本文将通过实际案例介绍优化方法...',
					cover: 'https://picsum.photos/400/200?random=3',
					time: '1天前',
					author: {
						name: '性能专家',
						avatar: 'https://picsum.photos/100/100?random=3'
					},
					tags: [this.categoryName, '性能优化', '实战'],
					viewCount: 3456,
					commentCount: 89,
					likeCount: 567
				},
				{
					id: 4,
					title: this.categoryName + '面试题整理',
					description: '整理了一些常见的' + this.categoryName + '面试题，并附上详细解答，帮助你准备面试...',
					cover: 'https://picsum.photos/400/200?random=4',
					time: '2天前',
					author: {
						name: '面试官',
						avatar: 'https://picsum.photos/100/100?random=4'
					},
					tags: [this.categoryName, '面试', '题库'],
					viewCount: 4567,
					commentCount: 123,
					likeCount: 789
				}
			];

			this.articleList = this.articleList.concat(mockData);

			// 模拟加载状态
			if (this.page >= 3) {
				this.loadMoreStatus = 'nomore';
			} else {
				this.loadMoreStatus = 'loadmore';
			}
		},
		refresh() {
			this.page = 1;
			this.articleList = [];
			this.loadMoreStatus = 'loading';
			this.loadArticles().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		loadMore() {
			if (this.loadMoreStatus === 'nomore') return;

			this.loadMoreStatus = 'loading';
			this.page++;
			this.loadArticles();
		},
		goToDetail(id) {
			uni.navigateTo({
				url: '/pages/article/detail?id=' + id
			});
		}
	},
	watch: {
		'filter.sort'() {
			this.refresh();
		},
		'filter.time'() {
			this.refresh();
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 20rpx;
}

.nav-bar {
	background-color: #ffffff;
	position: sticky;
	top: 0;
	z-index: 100;
	padding: 20rpx;

	.nav-title {
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
	}
}

.filter-bar {
	background-color: #ffffff;
	position: sticky;
	top: 80rpx;
	z-index: 99;
}

.article-list {
	padding: 20rpx;
}

.article-item {
	background-color: #ffffff;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.article-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.author-info {
	display: flex;
	align-items: center;
}

.author-name {
	margin-left: 16rpx;
	font-size: 28rpx;
	font-weight: 500;
}

.article-time {
	font-size: 24rpx;
	color: #909399;
}

.article-content {
	margin-bottom: 20rpx;
}

.article-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 12rpx;
}

.article-desc {
	font-size: 28rpx;
	color: #606266;
	line-height: 1.5;
}

.article-image {
	margin-bottom: 20rpx;
	border-radius: 8rpx;
	overflow: hidden;
}

.article-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.article-tags {
	display: flex;
	flex-wrap: wrap;
}

.article-stats {
	display: flex;
}

.stat-item {
	display: flex;
	align-items: center;
	margin-left: 20rpx;
	font-size: 24rpx;
	color: #909399;

	text {
		margin-left: 6rpx;
	}
}
</style>
