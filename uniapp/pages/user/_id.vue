<template>
  <view class="user-profile-container">
    <!-- 顶部背景区 -->
    <view class="profile-header" :style="{ backgroundImage: `url(${userInfo.backgroundImage || '/static/default-bg.jpg'})` }">
      <view class="header-overlay">
        <!-- 导航栏 -->
        <view class="header-nav">
          <u-icon name="arrow-left" size="48" color="#fff" @click="handleBack" />
          <view class="nav-actions">
            <u-icon name="refresh" size="40" color="#fff" @click="handleRefresh" />
            <u-icon name="more-dot-fill" size="40" color="#fff" @click="handleMore" />
          </view>
        </view>
        
        <!-- 用户信息覆盖层 -->
        <view class="user-overlay">
          <image
            :src="userInfo.avatar || '/static/default-avatar.png'"
            class="overlay-avatar"
            mode="aspectFill"
          />
          <text class="overlay-name">{{ userInfo.nickname || userInfo.username }}</text>
        </view>
      </view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-info-card">
      <view class="info-header">
        <view class="user-basic">
          <text class="user-name-large">{{ userInfo.nickname || userInfo.username }}</text>
          <view v-if="userInfo.isVerified" class="verified-badge">
            <u-icon name="checkmark-circle-fill" size="32" color="#10b981" />
          </view>
        </view>
        <view class="action-buttons">
          <view
            v-if="!isOwnProfile"
            class="follow-btn"
            :class="{ following: userInfo.isFollowing }"
            @click="handleFollow"
          >
            <text class="follow-text">{{ userInfo.isFollowing ? '已关注' : '关注' }}</text>
          </view>
          <view class="share-btn" @click="handleShare">
            <u-icon name="share" size="32" color="#333" />
          </view>
        </view>
      </view>
      
      <text v-if="userInfo.bio" class="user-bio">{{ userInfo.bio }}</text>
      
      <view class="user-stats">
        <view class="stat-item" @click="handleFollowList">
          <text class="stat-value">{{ userInfo.followCount || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @click="handleFollowerList">
          <text class="stat-value">{{ userInfo.followerCount || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.postCount || 0 }}</text>
          <text class="stat-label">动态</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.likeCount || 0 }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 用户动态瀑布流 -->
    <view class="posts-section">
      <text class="section-title">我的动态</text>
      <view v-if="postList.length > 0" class="waterfall-container">
        <view
          v-for="post in postList"
          :key="post.id"
          class="waterfall-item"
          :style="{ width: columnWidth + 'px' }"
          @click="handlePostClick(post)"
        >
          <PostCard :post="post" />
        </view>
      </view>
      <view v-else class="empty-state">
        <u-empty mode="data" text="暂无动态" />
      </view>
      
      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
      <view v-if="loading" class="loading-more">
        <u-loading-icon />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PostCard from '@/components/PostCard.vue'
import { userApi } from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const userId = ref<string>('')
const userInfo = ref<any>({})
const postList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 计算瀑布流列宽
const columnWidth = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.windowWidth
  const gap = 16
  return (screenWidth - gap * 3) / 2
})

// 是否是自己的主页
const isOwnProfile = computed(() => {
  return userStore.user?.id?.toString() === userId.value
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await userApi.getUserProfile(userId.value)
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
}

// 加载用户动态
const loadUserPosts = async (pageNum: number = 1) => {
  try {
    loading.value = true
    const res = await userApi.getUserPosts(userId.value, {
      page: pageNum,
      pageSize: 20,
    })
    if (res.code === 200 && res.data) {
      if (pageNum === 1) {
        postList.value = res.data.list
      } else {
        postList.value.push(...res.data.list)
      }
      hasMore.value = res.data.pagination.page < res.data.pagination.totalPages
    }
  } catch (error) {
    console.error('加载动态失败:', error)
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 刷新
const handleRefresh = () => {
  page.value = 1
  loadUserInfo()
  loadUserPosts(1)
}

// 更多操作
const handleMore = () => {
  // TODO: 显示更多操作菜单
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 关注/取消关注
const handleFollow = async () => {
  // TODO: 实现关注接口
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 分享
const handleShare = () => {
  // TODO: 实现分享功能
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 关注列表
const handleFollowList = () => {
  // TODO: 跳转到关注列表
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 粉丝列表
const handleFollowerList = () => {
  // TODO: 跳转到粉丝列表
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 点击帖子
const handlePostClick = (post: any) => {
  // TODO: 跳转到帖子详情
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    page.value++
    loadUserPosts(page.value)
  }
}

// uniapp 使用 onLoad 获取路由参数
onLoad((options: any) => {
  userId.value = options.id || ''
  if (userId.value) {
    loadUserInfo()
    loadUserPosts(1)
  }
})
</script>

<style lang="scss" scoped>
.user-profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-header {
  position: relative;
  height: 400rpx;
  background-size: cover;
  background-position: center;
  background-color: #172a3a;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24rpx 32rpx 32rpx;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-actions {
  display: flex;
  gap: 32rpx;
}

.user-overlay {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.overlay-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.overlay-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.user-info-card {
  background-color: #fff;
  border-radius: 32rpx 32rpx 0 0;
  margin-top: -32rpx;
  padding: 32rpx;
  position: relative;
  z-index: 10;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.user-basic {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.user-name-large {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

.verified-badge {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.follow-btn {
  background-color: #10b981;
  color: #fff;
  padding: 16rpx 48rpx;
  border-radius: 50rpx;
  font-size: 28rpx;

  &.following {
    background-color: #e5e7eb;
    color: #6b7280;
  }
}

.follow-text {
  color: inherit;
}

.share-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 50%;
}

.user-bio {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 32rpx;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  gap: 48rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
}

.posts-section {
  padding: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 32rpx;
  display: block;
}

.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: space-between;
}

.waterfall-item {
  flex: 0 0 auto;
}

.empty-state {
  padding: 80rpx 0;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #909399;
}

.load-more-text {
  font-size: 28rpx;
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: 32rpx;
}
</style>

