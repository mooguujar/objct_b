<template>
  <view class="island-detail-page">
    <!-- 顶部背景区 -->
    <view class="top-banner" :style="{ backgroundImage: `url(${islandInfo.cover || ''})` }">
      <view class="banner-overlay">
        <view class="banner-actions">
          <u-icon name="arrow-left" size="40" color="#fff" @click="handleBack" />
          <u-icon name="more-dot-fill" size="40" color="#fff" @click="handleMore" />
        </view>
        <view class="island-overlay-info">
          <image
            :src="islandInfo.avatar || '/static/default-avatar.png'"
            class="island-avatar-large"
            mode="aspectFill"
          />
          <text class="island-name-large">{{ islandInfo.name }}</text>
        </view>
      </view>
    </view>

    <!-- 岛屿信息 -->
    <view class="island-info-section">
      <text class="island-desc" v-if="islandInfo.description">{{ islandInfo.description }}</text>
      <view class="island-meta">
        <view class="meta-item">
          <text class="meta-label">岛主</text>
          <text class="meta-value">{{ islandInfo.owner?.nickname }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">成员</text>
          <text class="meta-value">{{ islandInfo.memberCount }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">帖子</text>
          <text class="meta-value">{{ islandInfo.postCount }}</text>
        </view>
      </view>
    </view>

    <!-- 加入按钮 -->
    <view class="join-section" v-if="!islandInfo.isMember">
      <u-button
        type="primary"
        :custom-style="{ width: '100%' }"
        @click="handleJoin"
      >
        {{ islandInfo.price > 0 ? `加入岛屿 (${islandInfo.price} 金币)` : '免费加入' }}
      </u-button>
    </view>

    <!-- 内容瀑布流 -->
    <view class="posts-section">
      <view class="waterfall-container">
        <PostCard
          v-for="post in postList"
          :key="post.id"
          :post="post"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PostCard from '@/components/PostCard.vue'

const islandInfo = ref<any>({})
const postList = ref<any[]>([])
const loading = ref(false)

const loadIslandDetail = async () => {
  // TODO: 调用接口
}

const handleBack = () => {
  uni.navigateBack()
}

const handleMore = () => {
  // TODO: 更多操作
}

const handleJoin = () => {
  // TODO: 加入岛屿
  uni.showToast({
    title: '加入功能开发中',
    icon: 'none',
  })
}

onMounted(() => {
  loadIslandDetail()
})
</script>

<style lang="scss" scoped>
.island-detail-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.top-banner {
  width: 100%;
  height: 400rpx;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40rpx 30rpx;
}

.banner-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.island-overlay-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.island-avatar-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
}

.island-name-large {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.island-info-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.island-desc {
  font-size: 28rpx;
  color: $u-content-color;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.island-meta {
  display: flex;
  justify-content: space-around;
  padding-top: 30rpx;
  border-top: 1rpx solid $u-border-color;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .meta-label {
    font-size: 24rpx;
    color: $u-tips-color;
  }

  .meta-value {
    font-size: 32rpx;
    font-weight: bold;
    color: $u-main-color;
  }
}

.join-section {
  padding: 20rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.posts-section {
  padding: 20rpx;
}

.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: space-between;
}
</style>

