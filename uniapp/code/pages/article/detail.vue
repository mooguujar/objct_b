
<template>
	<view class="container">
		<!-- 文章内容 -->
		<view class="article-content">
			<view class="article-header">
				<view class="article-title">{{ article.title }}</view>
				<view class="article-meta">
					<view class="author-info" @click="viewAuthor">
						<u-image 
							:src="article.author.avatar" 
							shape="circle" 
							width="40" 
							height="40"
							:lazy-load="true"
						></u-image>
						<view class="author-details">
							<view class="author-name">{{ article.author.name }}</view>
							<view class="article-time">{{ article.time }}</view>
						</view>
					</view>
					<view class="follow-btn">
						<u-button 
							size="mini" 
							:type="article.author.isFollowing ? 'info' : 'primary'"
							:plain="article.author.isFollowing"
							@click="toggleFollow"
						>
							{{ article.author.isFollowing ? '已关注' : '关注' }}
						</u-button>
					</view>
				</view>
			</view>

			<!-- 文章封面 -->
			<view class="article-cover" v-if="article.cover">
				<u-image 
					:src="article.cover" 
					width="100%" 
					height="400rpx"
					:lazy-load="true"
					border-radius="8"
				></u-image>
			</view>

			<!-- 文章正文 -->
			<view class="article-body">
				<rich-text :nodes="article.content"></rich-text>
			</view>

			<!-- 文章标签 -->
			<view class="article-tags">
				<u-tag 
					v-for="(tag, index) in article.tags" 
					:key="index" 
					:text="tag" 
					type="info" 
					size="mini"
					mode="plain"
					shape="circle"
				></u-tag>
			</view>
		</view>

		<!-- 互动栏 -->
		<view class="interaction-bar">
			<view class="interaction-item" @click="toggleLike">
				<u-icon 
					:name="article.isLiked ? 'thumb-up-fill' : 'thumb-up'" 
					:color="article.isLiked ? '#007AFF' : '#909399'"
					size="32"
				></u-icon>
				<text :class="{ 'active': article.isLiked }">{{ article.likeCount }}</text>
			</view>
			<view class="interaction-item" @click="toggleCollect">
				<u-icon 
					:name="article.isCollected ? 'star-fill' : 'star'" 
					:color="article.isCollected ? '#FF9900' : '#909399'"
					size="32"
				></u-icon>
				<text :class="{ 'active': article.isCollected }">{{ article.isCollected ? '已收藏' : '收藏' }}</text>
			</view>
			<view class="interaction-item" @click="showCommentInput = true">
				<u-icon name="chat" color="#909399" size="32"></u-icon>
				<text>{{ article.commentCount }}</text>
			</view>
			<view class="interaction-item" @click="shareArticle">
				<u-icon name="share" color="#909399" size="32"></u-icon>
				<text>分享</text>
			</view>
		</view>

		<!-- 评论区 -->
		<view class="comment-section">
			<view class="section-header">
				<text class="section-title">评论 ({{ article.commentCount }})</text>
				<view class="sort-options">
					<text 
						v-for="(option, index) in sortOptions" 
						:key="index"
						:class="{ 'active': currentSort === index }"
						@click="changeSort(index)"
					>
						{{ option }}
					</text>
				</view>
			</view>

			<view class="comment-list">
				<view 
					class="comment-item" 
					v-for="(comment, index) in comments" 
					:key="index"
				>
					<view class="comment-avatar">
						<u-image 
							:src="comment.user.avatar" 
							shape="circle" 
							width="60" 
							height="60"
							:lazy-load="true"
						></u-image>
					</view>
					<view class="comment-content">
						<view class="comment-header">
							<view class="comment-user">{{ comment.user.name }}</view>
							<view class="comment-time">{{ comment.time }}</view>
						</view>
						<view class="comment-text">{{ comment.content }}</view>
						<view class="comment-footer">
							<view class="comment-like" @click="toggleCommentLike(comment)">
								<u-icon 
									:name="comment.isLiked ? 'thumb-up-fill' : 'thumb-up'" 
									:color="comment.isLiked ? '#007AFF' : '#909399'"
									size="24"
								></u-icon>
								<text :class="{ 'active': comment.isLiked }">{{ comment.likeCount }}</text>
							</view>
							<view class="comment-reply" @click="replyToComment(comment)">
								<u-icon name="chat" color="#909399" size="24"></u-icon>
								<text>回复</text>
							</view>
						</view>

						<!-- 子评论 -->
						<view class="sub-comment-list" v-if="comment.replies && comment.replies.length > 0">
							<view 
								class="sub-comment-item" 
								v-for="(reply, replyIndex) in comment.replies" 
								:key="replyIndex"
							>
								<view class="sub-comment-avatar">
									<u-image 
										:src="reply.user.avatar" 
										shape="circle" 
										width="40" 
										height="40"
										:lazy-load="true"
									></u-image>
								</view>
								<view class="sub-comment-content">
									<view class="sub-comment-header">
										<view class="sub-comment-user">
											{{ reply.user.name }}
											<text class="reply-to">回复</text>
											{{ reply.toUser.name }}
										</view>
										<view class="sub-comment-time">{{ reply.time }}</view>
									</view>
									<view class="sub-comment-text">{{ reply.content }}</view>
									<view class="sub-comment-footer">
										<view class="sub-comment-like" @click="toggleCommentLike(reply)">
											<u-icon 
												:name="reply.isLiked ? 'thumb-up-fill' : 'thumb-up'" 
												:color="reply.isLiked ? '#007AFF' : '#909399'"
												size="20"
											></u-icon>
											<text :class="{ 'active': reply.isLiked }">{{ reply.likeCount }}</text>
										</view>
										<view class="sub-comment-reply" @click="replyToComment(comment, reply.user)">
											<u-icon name="chat" color="#909399" size="20"></u-icon>
											<text>回复</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<u-empty v-if="comments.length === 0" mode="message" text="暂无评论"></u-empty>
			</view>
		</view>

		<!-- 评论输入框 -->
		<view class="comment-input" v-if="showCommentInput">
			<u-input 
				v-model="commentText" 
				:placeholder="replyTo ? '回复 ' + replyTo.name : '写下你的评论...'" 
				:clearable="true"
				:border="true"
				:focus="true"
				@blur="hideCommentInput"
				@confirm="submitComment"
			></u-input>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			articleId: 0,
			article: {
				id: 1,
				title: 'Vue 3.0 新特性详解',
				cover: 'https://picsum.photos/400/200?random=1',
				content: '<p>Vue 3.0 带来了许多令人兴奋的新特性，包括 Composition API、更好的 TypeScript 支持等。本文将详细介绍这些新特性。</p><p>首先，Composition API 是 Vue 3.0 最重要的新特性之一。它提供了一种更灵活的方式来组织和复用逻辑代码。通过使用 setup 函数，我们可以将相关的逻辑组织在一起，而不是按照选项（data、computed、methods 等）分散在不同的地方。</p><p>其次，Vue 3.0 对 TypeScript 的支持也得到了显著改善。现在，我们可以更好地利用 TypeScript 的类型检查功能，提高代码的健壮性和可维护性。</p>',
				time: '2023-06-15 10:30',
				author: {
					id: 1,
					name: '前端开发者',
					avatar: 'https://picsum.photos/100/100?random=1',
					isFollowing: false
				},
				tags: ['Vue', '前端', 'JavaScript'],
				viewCount: 1234,
				commentCount: 56,
				likeCount: 234,
				isLiked: false,
				isCollected: false
			},
			comments: [
				{
					id: 1,
					user: {
						id: 2,
						name: '前端爱好者',
						avatar: 'https://picsum.photos/100/100?random=2'
					},
					content: '这篇文章写得非常好，对我帮助很大！',
					time: '10分钟前',
					likeCount: 12,
					isLiked: false,
					replies: [
						{
							id: 11,
							user: {
								id: 1,
								name: '前端开发者',
								avatar: 'https://picsum.photos/100/100?random=1'
							},
							toUser: {
								id: 2,
								name: '前端爱好者'
							},
							content: '谢谢支持，很高兴能帮到你！',
							time: '5分钟前',
							likeCount: 3,
							isLiked: true
						}
					]
				},
				{
					id: 2,
					user: {
						id: 3,
						name: 'JS学习者',
						avatar: 'https://picsum.photos/100/100?random=3'
					},
					content: '请问有没有相关的实践案例可以参考？',
					time: '2小时前',
					likeCount: 5,
					isLiked: true,
					replies: []
				}
			],
			sortOptions: ['最新', '最热'],
			currentSort: 0,
			showCommentInput: false,
			commentText: '',
			replyTo: null
		}
	},
	onLoad(options) {
		if (options.id) {
			this.articleId = parseInt(options.id);
			// 实际项目中这里应该根据ID从服务器获取文章数据
			this.loadArticle();
		}
	},
	methods: {
		loadArticle() {
			// 模拟加载文章数据
			// 实际项目中应该调用云函数或API
			console.log('加载文章数据，ID:', this.articleId);
		},
		viewAuthor() {
			uni.navigateTo({
				url: '/pages/user/index?id=' + this.article.author.id
			});
		},
		toggleFollow() {
			this.article.author.isFollowing = !this.article.author.isFollowing;
			uni.showToast({
				title: this.article.author.isFollowing ? '关注成功' : '已取消关注',
				icon: 'none'
			});
		},
		toggleLike() {
			this.article.isLiked = !this.article.isLiked;
			this.article.likeCount += this.article.isLiked ? 1 : -1;
		},
		toggleCollect() {
			this.article.isCollected = !this.article.isCollected;
			uni.showToast({
				title: this.article.isCollected ? '收藏成功' : '已取消收藏',
				icon: 'none'
			});
		},
		shareArticle() {
			uni.showActionSheet({
				itemList: ['分享给好友', '分享到朋友圈', '复制链接'],
				success: function (res) {
					uni.showToast({
						title: '分享功能开发中',
						icon: 'none'
					});
				}
			});
		},
		changeSort(index) {
			this.currentSort = index;
			// 实际项目中这里应该重新加载评论数据
		},
		toggleCommentLike(comment) {
			comment.isLiked = !comment.isLiked;
			comment.likeCount += comment.isLiked ? 1 : -1;
		},
		replyToComment(comment, toUser) {
			this.replyTo = toUser || comment.user;
			this.showCommentInput = true;
		},
		hideCommentInput() {
			setTimeout(() => {
				this.showCommentInput = false;
				this.commentText = '';
				this.replyTo = null;
			}, 200);
		},
		submitComment() {
			if (!this.commentText.trim()) {
				uni.showToast({
					title: '请输入评论内容',
					icon: 'none'
				});
				return;
			}

			// 实际项目中这里应该调用云函数或API提交评论
			const newComment = {
				id: this.comments.length + 1,
				user: {
					id: 1, // 当前用户ID
					name: '当前用户',
					avatar: 'https://picsum.photos/100/100?random=1'
				},
				content: this.commentText,
				time: '刚刚',
				likeCount: 0,
				isLiked: false,
				replies: []
			};

			if (this.replyTo) {
				// 如果是回复，则添加到对应评论的回复列表中
				const parentComment = this.comments.find(c => c.user.id === this.replyTo.id);
				if (parentComment) {
					parentComment.replies.push({
						...newComment,
						id: parentComment.replies.length + 1,
						toUser: this.replyTo
					});
				}
			} else {
				// 否则作为新评论添加
				this.comments.unshift(newComment);
			}

			this.article.commentCount++;
			this.hideCommentInput();

			uni.showToast({
				title: '评论成功',
				icon: 'success'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 100rpx;
}

.article-content {
	background-color: #ffffff;
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.article-header {
	margin-bottom: 30rpx;
}

.article-title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}

.article-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.author-info {
	display: flex;
	align-items: center;
}

.author-details {
	margin-left: 16rpx;

	.author-name {
		font-size: 28rpx;
		font-weight: 500;
		margin-bottom: 6rpx;
	}

	.article-time {
		font-size: 24rpx;
		color: #909399;
	}
}

.article-cover {
	margin-bottom: 30rpx;
	border-radius: 8rpx;
	overflow: hidden;
}

.article-body {
	font-size: 28rpx;
	line-height: 1.6;
	color: #303133;
	margin-bottom: 30rpx;
}

.article-tags {
	display: flex;
	flex-wrap: wrap;

	.u-tag {
		margin-right: 16rpx;
		margin-bottom: 16rpx;
	}
}

.interaction-bar {
	display: flex;
	justify-content: space-around;
	align-items: center;
	background-color: #ffffff;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f5f5f5;
}

.interaction-item {
	display: flex;
	align-items: center;

	text {
		margin-left: 8rpx;
		font-size: 26rpx;
		color: #909399;

		&.active {
			color: #007AFF;
		}
	}
}

.comment-section {
	background-color: #ffffff;
	padding: 30rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
	}

	.sort-options {
		display: flex;

		text {
			font-size: 24rpx;
			color: #909399;
			margin-left: 20rpx;

			&.active {
				color: #007AFF;
			}
		}
	}
}

.comment-list {
	.comment-item {
		display: flex;
		padding-bottom: 30rpx;
		margin-bottom: 30rpx;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}
	}
}

.comment-avatar {
	margin-right: 20rpx;
}

.comment-content {
	flex: 1;
}

.comment-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;

	.comment-user {
		font-size: 28rpx;
		font-weight: 500;
	}

	.comment-time {
		font-size: 24rpx;
		color: #909399;
	}
}

.comment-text {
	font-size: 28rpx;
	line-height: 1.5;
	color: #303133;
	margin-bottom: 16rpx;
}

.comment-footer {
	display: flex;

	.comment-like, .comment-reply {
		display: flex;
		align-items: center;
		margin-right: 30rpx;
		font-size: 24rpx;
		color: #909399;

		text {
			margin-left: 6rpx;

			&.active {
				color: #007AFF;
			}
		}
	}
}

.sub-comment-list {
	margin-top: 20rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	padding: 20rpx;
}

.sub-comment-item {
	display: flex;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.sub-comment-avatar {
	margin-right: 16rpx;
}

.sub-comment-content {
	flex: 1;
}

.sub-comment-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;

	.sub-comment-user {
		font-size: 26rpx;

		.reply-to {
			color: #909399;
			margin: 0 6rpx;
		}
	}

	.sub-comment-time {
		font-size: 22rpx;
		color: #909399;
	}
}

.sub-comment-text {
	font-size: 26rpx;
	line-height: 1.5;
	color: #303133;
	margin-bottom: 12rpx;
}

.sub-comment-footer {
	display: flex;

	.sub-comment-like, .sub-comment-reply {
		display: flex;
		align-items: center;
		margin-right: 20rpx;
		font-size: 22rpx;
		color: #909399;

		text {
			margin-left: 4rpx;

			&.active {
				color: #007AFF;
			}
		}
	}
}

.comment-input {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #ffffff;
	padding: 20rpx;
	border-top: 1rpx solid #f5f5f5;
	z-index: 100;
}
</style>
