<template>
  <div class="profile-container">
    <!-- 顶部个人信息区 -->
    <div class="profile-header">
      <div class="header-content">
        <div class="user-info">
          <el-avatar
            :src="userInfo.avatar || '/default-avatar.png'"
            :size="64"
            class="user-avatar"
            @click="handleEditProfile"
          />
          <span class="user-name">{{ userInfo.nickname || userInfo.username }}</span>
        </div>
        <div class="my-home-btn" @click="handleMyHome">
          <span class="btn-text">我的主页</span>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <!-- 数据统计 -->
      <div class="stats-row">
        <div class="stat-item" @click="handleFollowList">
          <span class="stat-value">{{ userInfo.followCount || 0 }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item" @click="handleFollowerList">
          <span class="stat-value">{{ userInfo.followerCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userInfo.likeCount || 0 }}</span>
          <span class="stat-label">获赞</span>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="profile-content">
      <!-- 金币余额卡片 -->
      <el-card class="coin-card" shadow="hover" @click="handleRecharge">
        <div class="coin-content">
          <span class="coin-label">金币余额</span>
          <div class="coin-value-row">
            <el-icon class="coin-icon"><Wallet /></el-icon>
            <span class="coin-value">{{ userInfo.coinBalance || 0 }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </el-card>

      <!-- 快捷功能区 -->
      <el-card class="quick-actions" shadow="hover">
        <div class="actions-grid">
          <div class="action-item" @click="handleMyPosts">
            <div class="action-icon action-icon-cyan">
              <el-icon><Document /></el-icon>
            </div>
            <span class="action-label">我的动态</span>
          </div>
          <div class="action-item" @click="handleMyVIP">
            <div class="action-icon action-icon-orange">
              <el-icon><Star /></el-icon>
            </div>
            <span class="action-label">我的VIP</span>
          </div>
          <div class="action-item" @click="handleMyCollect">
            <div class="action-icon action-icon-pink">
              <el-icon><StarFilled /></el-icon>
            </div>
            <span class="action-label">我的收藏</span>
          </div>
        </div>
      </el-card>

      <!-- 功能列表 -->
      <el-card class="function-list" shadow="hover">
        <el-menu>
          <el-menu-item @click="handleAddToHome">
            <el-icon><Plus /></el-icon>
            <span>添加到主屏幕</span>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </el-menu-item>
          <el-menu-item @click="handleCreatorApply">
            <el-icon><User /></el-icon>
            <span>达人申请入驻</span>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </el-menu-item>
          <el-menu-item @click="handleAgentApply">
            <el-icon><UserFilled /></el-icon>
            <span>代理申请入驻</span>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </el-menu-item>
          <el-menu-item @click="handleCustomerService">
            <el-icon><ChatDotRound /></el-icon>
            <span>在线客服</span>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </el-menu-item>
          <el-menu-item @click="handleSettings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
            <el-icon class="menu-arrow"><ArrowRight /></el-icon>
          </el-menu-item>
        </el-menu>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ArrowRight,
  Wallet,
  Document,
  Star,
  StarFilled,
  Plus,
  User,
  UserFilled,
  ChatDotRound,
  Setting,
} from '@element-plus/icons-vue'
import { useUserApi } from '~/composables/useUserApi'
import { useUserStore } from '~/store/user'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const userApi = useUserApi()
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
    const data = await userApi.getCurrentUser()
    userInfo.value = data
    userStore.updateUser(data)
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    ElMessage.error(error.message || '加载失败')
  }
}

// 编辑资料
const handleEditProfile = () => {
  ElMessage.info('功能开发中')
}

// 我的主页
const handleMyHome = () => {
  if (userStore.user?.id) {
    navigateTo(`/user/${userStore.user.id}`)
  }
}

// 关注列表
const handleFollowList = () => {
  ElMessage.info('功能开发中')
}

// 粉丝列表
const handleFollowerList = () => {
  ElMessage.info('功能开发中')
}

// 充值
const handleRecharge = () => {
  ElMessage.info('功能开发中')
}

// 我的动态
const handleMyPosts = () => {
  if (userStore.user?.id) {
    navigateTo(`/user/${userStore.user.id}`)
  }
}

// 我的VIP
const handleMyVIP = () => {
  ElMessage.info('功能开发中')
}

// 我的收藏
const handleMyCollect = () => {
  ElMessage.info('功能开发中')
}

// 添加到主屏幕
const handleAddToHome = () => {
  ElMessage.info('功能开发中')
}

// 达人申请入驻
const handleCreatorApply = () => {
  navigateTo('/profile/creator-apply')
}

// 代理申请入驻
const handleAgentApply = () => {
  ElMessage.info('功能开发中')
}

// 在线客服
const handleCustomerService = () => {
  ElMessage.info('功能开发中')
}

// 设置
const handleSettings = () => {
  ElMessage.info('功能开发中')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 40px;
}

.profile-header {
  height: 400px;
  background: linear-gradient(180deg, #d4f9e4 0%, #b6f3ff 100%);
  padding: 80px 40px 0;
  position: relative;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.my-home-btn {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
}

.btn-text {
  font-size: 14px;
  color: #333;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.profile-content {
  margin-top: -80px;
  padding: 0 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.coin-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.coin-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coin-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.coin-value-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 6px 16px;
}

.coin-icon {
  font-size: 24px;
  color: #f59e0b;
}

.coin-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.quick-actions {
  margin-bottom: 20px;
}

.actions-grid {
  display: flex;
  justify-content: space-around;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.action-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;

  :deep(.el-icon) {
    font-size: 32px;
  }
}

.action-icon-cyan {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  color: #1faf98;
}

.action-icon-orange {
  background: linear-gradient(135deg, #fde68a 0%, #fbbf24 100%);
  color: #f59e0b;
}

.action-icon-pink {
  background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%);
  color: #f43f5e;
}

.action-label {
  font-size: 14px;
  color: #666;
}

.function-list {
  :deep(.el-menu) {
    border: none;
  }

  :deep(.el-menu-item) {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .menu-arrow {
    margin-left: auto;
    color: #c0c4cc;
  }
}
</style>

