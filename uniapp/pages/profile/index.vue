<template>
  <view class="profile-container">
    <!-- 顶部个人信息区 -->
    <view class="profile-header">
      <view class="header-content">
        <view class="user-info">
          <image
            :src="userInfo.avatar || '/static/default-avatar.png'"
            class="user-avatar"
            mode="aspectFill"
            @click="handleEditProfile"
          />
          <text class="user-name">{{ userInfo.nickname || userInfo.username }}</text>
        </view>
        <view class="my-home-btn" @click="handleMyHome">
          <text class="btn-text">我的主页</text>
          <u-icon name="arrow-right" size="28" color="#333" />
        </view>
      </view>
      
      <!-- 数据统计 -->
      <view class="stats-row">
        <view class="stat-item" @click="handleFollowList">
          <text class="stat-value">{{ userInfo.followCount || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @click="handleFollowerList">
          <text class="stat-value">{{ userInfo.followerCount || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.likeCount || 0 }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="profile-content">
      <!-- 金币余额卡片 -->
      <view class="coin-card" @click="handleRecharge">
        <text class="coin-label">金币余额</text>
        <view class="coin-value-row">
          <u-icon name="wallet" size="32" color="#f59e0b" />
          <text class="coin-value">{{ userInfo.coinBalance || 0 }}</text>
          <u-icon name="arrow-right" size="28" color="#666" />
        </view>
      </view>

      <!-- 快捷功能区 -->
      <view class="quick-actions">
        <view class="action-item" @click="handleMyPosts">
          <view class="action-icon action-icon-cyan">
            <u-icon name="file-text" size="40" color="#1faf98" />
          </view>
          <text class="action-label">我的动态</text>
        </view>
        <view class="action-item" @click="handleMyVIP">
          <view class="action-icon action-icon-orange">
            <u-icon name="vip" size="40" color="#f59e0b" />
          </view>
          <text class="action-label">我的VIP</text>
        </view>
        <view class="action-item" @click="handleMyCollect">
          <view class="action-icon action-icon-pink">
            <u-icon name="star" size="40" color="#f43f5e" />
          </view>
          <text class="action-label">我的收藏</text>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="function-list">
        <view class="function-item" @click="handleAddToHome">
          <view class="function-left">
            <u-icon name="plus-circle" size="40" color="#909399" />
            <text class="function-text">添加到主屏幕</text>
          </view>
          <u-icon name="arrow-right" size="28" color="#c0c4cc" />
        </view>
        <view class="function-item" @click="handleCreatorApply">
          <view class="function-left">
            <u-icon name="account" size="40" color="#909399" />
            <text class="function-text">达人申请入驻</text>
          </view>
          <u-icon name="arrow-right" size="28" color="#c0c4cc" />
        </view>
        <view class="function-item" @click="handleAgentApply">
          <view class="function-left">
            <u-icon name="account" size="40" color="#909399" />
            <text class="function-text">代理申请入驻</text>
          </view>
          <u-icon name="arrow-right" size="28" color="#c0c4cc" />
        </view>
        <view class="function-item" @click="handleCustomerService">
          <view class="function-left">
            <u-icon name="chat" size="40" color="#909399" />
            <text class="function-text">在线客服</text>
          </view>
          <u-icon name="arrow-right" size="28" color="#c0c4cc" />
        </view>
        <view class="function-item" @click="handleSettings">
          <view class="function-left">
            <u-icon name="setting" size="40" color="#909399" />
            <text class="function-text">设置</text>
          </view>
          <u-icon name="arrow-right" size="28" color="#c0c4cc" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const userInfo = ref<any>({
  nickname: '',
  username: '',
  avatar: '',
  followCount: 0,
  followerCount: 0,
  likeCount: 0,
  coinBalance: 0,
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
      // 更新store中的用户信息
      userStore.updateUser(res.data)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
}

// 编辑资料
const handleEditProfile = () => {
  // TODO: 跳转到编辑资料页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 我的主页
const handleMyHome = () => {
  if (userStore.user?.id) {
    uni.navigateTo({
      url: `/pages/user/${userStore.user.id}`,
    })
  }
}

// 关注列表
const handleFollowList = () => {
  // TODO: 跳转到关注列表页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 粉丝列表
const handleFollowerList = () => {
  // TODO: 跳转到粉丝列表页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 充值
const handleRecharge = () => {
  // TODO: 跳转到充值页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 我的动态
const handleMyPosts = () => {
  if (userStore.user?.id) {
    uni.navigateTo({
      url: `/pages/user/${userStore.user.id}`,
    })
  }
}

// 我的VIP
const handleMyVIP = () => {
  // TODO: 跳转到VIP页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 我的收藏
const handleMyCollect = () => {
  // TODO: 跳转到收藏页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 添加到主屏幕
const handleAddToHome = () => {
  // TODO: 添加到主屏幕功能
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 达人申请入驻
const handleCreatorApply = () => {
  uni.navigateTo({
    url: '/pages/profile/creator-apply',
  })
}

// 代理申请入驻
const handleAgentApply = () => {
  // TODO: 跳转到代理申请页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 在线客服
const handleCustomerService = () => {
  // TODO: 打开客服聊天
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

// 设置
const handleSettings = () => {
  // TODO: 跳转到设置页面
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 200rpx;
}

.profile-header {
  height: 500rpx;
  background: linear-gradient(180deg, #d4f9e4 0%, #b6f3ff 100%);
  padding: 96rpx 40rpx 0;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.my-home-btn {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10rpx);
  border-radius: 50rpx;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.btn-text {
  font-size: 24rpx;
  color: #333;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin-top: 48rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.profile-content {
  margin-top: -120rpx;
  padding: 0 32rpx;
}

.coin-card {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.3);
}

.coin-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.coin-value-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50rpx;
  padding: 8rpx 16rpx 8rpx 16rpx;
}

.coin-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.quick-actions {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-cyan {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
}

.action-icon-orange {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
}

.action-icon-pink {
  background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%);
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

.function-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.function-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.function-text {
  font-size: 28rpx;
  color: #333;
}
</style>
