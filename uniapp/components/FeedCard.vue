<template>
  <view class="feed-card" @click="handleClick">
    <!-- 用户信息 -->
    <view class="feed-header">
      <image
        :src="post.user.avatar || '/static/default-avatar.png'"
        class="user-avatar"
        mode="aspectFill"
      />
      <view class="user-info">
        <text class="user-name">{{ post.user.nickname }}</text>
        <text class="post-time">{{ formatTime(post.createdAt) }}</text>
      </view>
    </view>

    <!-- 内容 -->
    <view class="feed-content">
      <text v-if="post.content" class="content-text">{{ post.content }}</text>
      
      <!-- 媒体 -->
      <view v-if="post.mediaUrls && post.mediaUrls.length > 0" class="media-grid">
        <image
          v-for="(url, index) in post.mediaUrls"
          :key="index"
          :src="url"
          mode="aspectFill"
          class="media-item"
        />
      </view>
    </view>

    <!-- 互动栏 -->
    <view class="feed-actions">
      <view class="action-btn" @click.stop="handleLike">
        <u-icon :name="post.isLiked ? 'heart-fill' : 'heart'" :color="post.isLiked ? '#fa3534' : '#909399'" size="40" />
        <text>{{ post.likeCount || 0 }}</text>
      </view>
      <view class="action-btn" @click.stop="handleComment">
        <u-icon name="chat" color="#909399" size="40" />
        <text>{{ post.commentCount || 0 }}</text>
      </view>
      <view class="action-btn" @click.stop="handleCollect">
        <u-icon :name="post.isCollected ? 'star-fill' : 'star'" :color="post.isCollected ? '#ff9900' : '#909399'" size="40" />
        <text>{{ post.collectCount || 0 }}</text>
      </view>
      <view class="action-btn" @click.stop="handleShare">
        <u-icon name="share" color="#909399" size="40" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  post: any
}

const props = defineProps<Props>()

const formatTime = (time: string) => {
  // TODO: 格式化时间
  return time
}

const handleClick = () => {
  // TODO: 跳转到详情页
}

const handleLike = () => {
  // TODO: 点赞功能
  uni.showToast({
    title: '点赞功能开发中',
    icon: 'none',
  })
}

const handleComment = () => {
  // TODO: 评论功能
  uni.showToast({
    title: '评论功能开发中',
    icon: 'none',
  })
}

const handleCollect = () => {
  // TODO: 收藏功能
  uni.showToast({
    title: '收藏功能开发中',
    icon: 'none',
  })
}

const handleShare = () => {
  // TODO: 分享功能
  uni.showToast({
    title: '分享功能开发中',
    icon: 'none',
  })
}
</script>

<style lang="scss" scoped>
.feed-card {
  background: #fff;
  border-radius: $u-border-radius-base;
  padding: $u-spacing-base;
  margin-bottom: $u-spacing-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: $u-spacing-base;

  .user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: $u-spacing-sm;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .user-name {
      font-size: $u-font-size-base;
      font-weight: bold;
      color: $u-main-color;
      margin-bottom: 4rpx;
    }

    .post-time {
      font-size: 24rpx;
      color: $u-tips-color;
    }
  }
}

.feed-content {
  margin-bottom: $u-spacing-base;

  .content-text {
    font-size: $u-font-size-base;
    color: $u-main-color;
    line-height: 1.6;
    margin-bottom: $u-spacing-sm;
  }

  .media-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8rpx;
    margin-top: $u-spacing-sm;

    .media-item {
      width: 100%;
      height: 200rpx;
      border-radius: $u-border-radius-sm;
    }
  }
}

.feed-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: $u-spacing-sm;
  border-top: 1rpx solid $u-border-color;

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: $u-tips-color;
  }
}
</style>

