<template>
  <view class="post-card" @click="handleClick">
    <!-- 封面图片/视频 -->
    <view class="post-media" v-if="post.mediaUrls && post.mediaUrls.length > 0">
      <image
        v-if="post.mediaType === 'image'"
        :src="post.mediaUrls[0]"
        lazy-load
        mode="aspectFill"
        class="media-image"
        @error="handleImageError"
      />
      <video
        v-else-if="post.mediaType === 'video'"
        :src="post.mediaUrls[0]"
        class="media-video"
        :poster="post.mediaUrls[0]"
      />
      <!-- 图片数量标识 -->
      <view v-if="post.mediaUrls.length > 1" class="image-count">
        +{{ post.mediaUrls.length - 1 }}
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="post-content">
      <!-- 标题和描述 -->
      <view class="post-header" v-if="post.title || post.content">
        <text class="post-title" v-if="post.title">{{ post.title }}</text>
        <text class="post-text" v-if="post.content">{{ post.content }}</text>
      </view>

      <!-- 发布者信息 -->
      <view class="post-author">
        <image
          :src="post.user.avatar || '/static/default-avatar.png'"
          class="author-avatar"
          lazy-load
          mode="aspectFill"
        />
        <text class="author-name">{{ post.user.nickname }}</text>
      </view>

      <!-- 底部信息 -->
      <view class="post-footer">
        <view class="post-stats">
          <u-icon name="heart" size="16" color="#909399" />
          <text class="stat-text">{{ post.likeCount || 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  post: any
}

const props = defineProps<Props>()
const shouldLoad = ref(false)

onMounted(() => {
  // 使用IntersectionObserver实现懒加载
  const query = uni.createSelectorQuery().in(getCurrentInstance())
  query.select('.post-card').boundingClientRect((data: any) => {
    if (data) {
      // 检查元素是否在视口内
      const systemInfo = uni.getSystemInfoSync()
      if (data.top < systemInfo.windowHeight * 1.5) {
        shouldLoad.value = true
      } else {
        // 延迟加载
        setTimeout(() => {
          shouldLoad.value = true
        }, 100)
      }
    }
  }).exec()
})

const handleClick = () => {
  // TODO: 跳转到详情页
  uni.showToast({
    title: '详情页开发中',
    icon: 'none',
  })
}

const handleImageError = () => {
  console.error('图片加载失败')
}
</script>

<style lang="scss" scoped>
.post-card {
  background: #fff;
  border-radius: $u-border-radius-base;
  overflow: hidden;
  margin-bottom: $u-spacing-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.post-media {
  position: relative;
  width: 100%;
  height: 400rpx;
  overflow: hidden;

  .media-image,
  .media-video {
    width: 100%;
    height: 100%;
  }

  .image-count {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    padding: 4rpx 12rpx;
    border-radius: $u-border-radius-sm;
    font-size: 24rpx;
  }
}

.post-content {
  padding: $u-spacing-base;
}

.post-header {
  margin-bottom: $u-spacing-base;

  .post-title {
    display: block;
    font-size: $u-font-size-lg;
    font-weight: bold;
    color: $u-main-color;
    margin-bottom: 8rpx;
  }

  .post-text {
    display: block;
    font-size: $u-font-size-base;
    color: $u-content-color;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: $u-spacing-sm;

  .author-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 12rpx;
  }

  .author-name {
    font-size: $u-font-size-base;
    color: $u-main-color;
  }
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $u-spacing-sm;
  border-top: 1rpx solid $u-border-color;

  .post-stats {
    display: flex;
    align-items: center;

    .stat-text {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: $u-tips-color;
    }
  }
}
</style>

