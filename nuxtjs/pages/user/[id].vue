<template>
  <div class="user-profile-container">
    <!-- 顶部背景区 -->
    <div
      class="profile-header"
      :style="{
        backgroundImage: `url(${userInfo.backgroundImage || '/default-bg.jpg'})`,
      }"
    >
      <div class="header-overlay">
        <!-- 导航栏 -->
        <div class="header-nav">
          <el-icon class="nav-icon" @click="handleBack"><ArrowLeft /></el-icon>
          <div class="nav-actions">
            <el-icon class="nav-icon" @click="handleRefresh"><Refresh /></el-icon>
            <el-icon class="nav-icon" @click="handleMore"><MoreFilled /></el-icon>
          </div>
        </div>
        
        <!-- 用户信息覆盖层 -->
        <div class="user-overlay">
          <el-avatar
            :src="userInfo.avatar || '/default-avatar.png'"
            :size="80"
            class="overlay-avatar"
          />
          <span class="overlay-name">{{ userInfo.nickname || userInfo.username }}</span>
        </div>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <el-card class="user-info-card" shadow="hover">
      <div class="info-header">
        <div class="user-basic">
          <span class="user-name-large">{{ userInfo.nickname || userInfo.username }}</span>
          <el-icon v-if="userInfo.isVerified" class="verified-icon" color="#10b981">
            <Select />
          </el-icon>
        </div>
        <div class="action-buttons">
          <el-button
            v-if="!isOwnProfile"
            :type="userInfo.isFollowing ? 'info' : 'success'"
            @click="handleFollow"
          >
            {{ userInfo.isFollowing ? '已关注' : '关注' }}
          </el-button>
          <el-button circle @click="handleShare">
            <el-icon><Share /></el-icon>
          </el-button>
        </div>
      </div>
      
      <p v-if="userInfo.bio" class="user-bio">{{ userInfo.bio }}</p>
      
      <div class="user-stats">
        <div class="stat-item" @click="handleFollowList">
          <span class="stat-value">{{ userInfo.followCount || 0 }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item" @click="handleFollowerList">
          <span class="stat-value">{{ userInfo.followerCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userInfo.postCount || 0 }}</span>
          <span class="stat-label">动态</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userInfo.likeCount || 0 }}</span>
          <span class="stat-label">获赞</span>
        </div>
      </div>
    </el-card>

    <!-- 用户动态瀑布流 -->
    <div class="posts-section">
      <h2 class="section-title">我的动态</h2>
      <div v-if="postList.length > 0" class="waterfall-container">
        <PostCard
          v-for="post in postList"
          :key="post.id"
          :post="post"
          class="waterfall-item"
          @click="handlePostClick(post)"
        />
      </div>
      <el-empty v-else description="暂无动态" />
      
      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <el-button @click="loadMore">加载更多</el-button>
      </div>
      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  Refresh,
  MoreFilled,
  Select,
  Share,
  Loading,
} from '@element-plus/icons-vue'
import { useUserApi } from '~/composables/useUserApi'
import { useUserStore } from '~/store/user'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const userApi = useUserApi()
const userStore = useUserStore()

const userId = computed(() => route.params.id as string)

const userInfo = ref<any>({})
const postList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

// 是否是自己的主页
const isOwnProfile = computed(() => {
  return userStore.user?.id?.toString() === userId.value
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const data = await userApi.getUserProfile(userId.value)
    userInfo.value = data
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
    ElMessage.error(error.message || '加载失败')
  }
}

// 加载用户动态
const loadUserPosts = async (pageNum: number = 1) => {
  try {
    loading.value = true
    const result = await userApi.getUserPosts(userId.value, {
      page: pageNum,
      pageSize: 20,
    })
    
    if (pageNum === 1) {
      postList.value = result.list
    } else {
      postList.value.push(...result.list)
    }
    hasMore.value = result.pagination.page < result.pagination.totalPages
  } catch (error: any) {
    console.error('加载动态失败:', error)
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  navigateTo('/')
}

// 刷新
const handleRefresh = () => {
  page.value = 1
  loadUserInfo()
  loadUserPosts(1)
}

// 更多操作
const handleMore = () => {
  ElMessage.info('功能开发中')
}

// 关注/取消关注
const handleFollow = async () => {
  // TODO: 实现关注接口
  ElMessage.info('功能开发中')
}

// 分享
const handleShare = () => {
  // TODO: 实现分享功能
  ElMessage.info('功能开发中')
}

// 关注列表
const handleFollowList = () => {
  ElMessage.info('功能开发中')
}

// 粉丝列表
const handleFollowerList = () => {
  ElMessage.info('功能开发中')
}

// 点击帖子
const handlePostClick = (post: any) => {
  // TODO: 跳转到帖子详情
  ElMessage.info('功能开发中')
}

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    page.value++
    loadUserPosts(page.value)
  }
}

onMounted(() => {
  loadUserInfo()
  loadUserPosts(1)
})
</script>

<style lang="scss" scoped>
.user-profile-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.profile-header {
  position: relative;
  height: 300px;
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
  padding: 16px 20px 20px;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-icon {
  font-size: 24px;
  color: #fff;
  cursor: pointer;
}

.nav-actions {
  display: flex;
  gap: 16px;
}

.user-overlay {
  display: flex;
  align-items: center;
  gap: 16px;
}

.overlay-avatar {
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.overlay-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.user-info-card {
  margin: -20px 20px 0;
  position: relative;
  z-index: 10;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.user-basic {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name-large {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.verified-icon {
  font-size: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-bio {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.posts-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.waterfall-item {
  cursor: pointer;
}

.load-more {
  text-align: center;
  padding: 20px;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #909399;
}
</style>

