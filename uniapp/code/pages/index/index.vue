
<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
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
			tabList: [
				{ name: '推荐' },
				{ name: '热门' },
				{ name: '最新' },
				{ name: '关注' }
			],
			currentTab: 0,
			articleList: [],
			page: 1,
			pageSize: 10,
			loadMoreStatus: 'loadmore',
		}
	},
	onLoad() {
		this.loadArticles();
	},
	onPullDownRefresh() {
		this.refresh();
	},
	methods: {
		tabChange(index) {
			this.currentTab = index;
			this.refresh();
		},
		async loadArticles() {
			// 模拟从服务器获取数据
			// 实际项目中应该调用云函数或API
			const mockData = [
				{
					id: 1,
					title: 'Vue 3.0 新特性详解',
					description: 'Vue 3.0 带来了许多令人兴奋的新特性，包括 Composition API、更好的 TypeScript 支持等。本文将详细介绍这些新特性...',
					cover: 'https://picsum.photos/400/200?random=1',
					time: '2小时前',
					author: {
						name: '前端开发者',
						avatar: 'https://picsum.photos/100/100?random=1'
					},
					tags: ['Vue', '前端', 'JavaScript'],
					viewCount: 1234,
					commentCount: 56,
					likeCount: 234
				},
				{
					id: 2,
					title: '深入理解 JavaScript 异步编程',
					description: '异步编程是 JavaScript 中的重要概念，本文将从回调函数到 Promise，再到 async/await，全面解析 JavaScript 异步编程的演进...',
					cover: 'https://picsum.photos/400/200?random=2',
					time: '5小时前',
					author: {
						name: 'JS大师',
						avatar: 'https://picsum.photos/100/100?random=2'
					},
					tags: ['JavaScript', '异步编程', 'Promise'],
					viewCount: 2345,
					commentCount: 78,
					likeCount: 456
				},
				{
					id: 3,
					title: '微前端架构实践指南',
					description: '随着前端应用的复杂度增加，微前端架构成为了解决大型应用维护问题的有效方案。本文将介绍微前端的概念、优势以及实践方法...',
					cover: 'https://picsum.photos/400/200?random=3',
					time: '1天前',
					author: {
						name: '架构师',
						avatar: 'https://picsum.photos/100/100?random=3'
					},
					tags: ['微前端', '架构', '前端工程化'],
					viewCount: 3456,
					commentCount: 89,
					likeCount: 567
				},
				{
					id: 4,
					title: 'React Hooks 最佳实践',
					description: 'React Hooks 改变了我们编写 React 组件的方式，本文将分享一些使用 React Hooks 的最佳实践，帮助你写出更优雅、更高效的代码...',
					cover: 'https://picsum.photos/400/200?random=4',
					time: '2天前',
					author: {
						name: 'React专家',
						avatar: 'https://picsum.photos/100/100?random=4'
					},
					tags: ['React', 'Hooks', '最佳实践'],
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
