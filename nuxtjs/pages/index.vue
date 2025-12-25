<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <div class="nav-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </div>
      </div>
      <el-icon class="search-icon" :size="20" @click="handleSearch">
        <Search />
      </el-icon>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 发现页 -->
      <div v-if="activeTab === 'discover'" class="posts-grid">
        <PostCard
          v-for="post in discoverPosts"
          :key="post.id"
          :post="post"
          @like-change="handleLikeChange"
          @click="handlePostClick"
        />
      </div>

      <!-- 关注页 -->
      <div v-else-if="activeTab === 'following'" class="posts-grid">
        <div v-if="followingPosts.length === 0" class="empty-state">
          <el-empty description="还没有关注任何人，去发现页看看吧" />
        </div>
        <PostCard
          v-for="post in followingPosts"
          :key="post.id"
          :post="post"
          @like-change="handleLikeChange"
          @click="handlePostClick"
        />
      </div>

      <!-- 热门岛屿 -->
      <div v-else-if="activeTab === 'islands'" class="islands-list">
        <IslandCard
          v-for="island in popularIslands"
          :key="island.id"
          :island="island"
          @click="handleIslandClick"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <el-button @click="loadMore">加载更多</el-button>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePosts, type Post } from '../composables/usePosts'
import { useIslands, type Island } from '../composables/useIslands'
import { useStatistics } from '../composables/useStatistics'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PostCard from '../components/PostCard.vue'
import IslandCard from '../components/IslandCard.vue'
import BottomNav from '../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()
const { getDiscoverPosts, getFollowingPosts, toggleLike } = usePosts()
const { getPopularIslands } = useIslands()
const { trackPageView, trackClick } = useStatistics()

const activeTab = ref<'discover' | 'following' | 'islands'>('discover')
const tabs: Array<{ key: 'discover' | 'following' | 'islands'; label: string }> = [
  { key: 'following', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'islands', label: '热门岛屿' }
]

const discoverPosts = ref<Post[]>([])
const followingPosts = ref<Post[]>([])
const popularIslands = ref<Island[]>([])
const loading = ref(false)
const hasMore = ref(true)

const currentPage = ref({
  discover: 1,
  following: 1,
  islands: 1
})

const pageSize = 20

// 切换标签
const switchTab = (tab: 'discover' | 'following' | 'islands') => {
  trackClick({
    elementId: `tab-${tab}`,
    elementType: 'tab',
    pagePath: '/',
    content: { action: 'switch-tab', tab }
  })
  activeTab.value = tab
  loadData()
}

// 加载数据
const loadData = async () => {
  if (loading.value) return

  loading.value = true
  try {
    if (activeTab.value === 'discover') {
      const response = await getDiscoverPosts(currentPage.value.discover, pageSize)
      if (currentPage.value.discover === 1) {
        discoverPosts.value = response.list
      } else {
        discoverPosts.value.push(...response.list)
      }
      hasMore.value = currentPage.value.discover < response.pagination.totalPages
    } else if (activeTab.value === 'following') {
      const response = await getFollowingPosts(currentPage.value.following, pageSize)
      if (currentPage.value.following === 1) {
        followingPosts.value = response.list
      } else {
        followingPosts.value.push(...response.list)
      }
      hasMore.value = currentPage.value.following < response.pagination.totalPages
    } else if (activeTab.value === 'islands') {
      const response = await getPopularIslands(currentPage.value.islands, pageSize)
      if (currentPage.value.islands === 1) {
        popularIslands.value = response.list
      } else {
        popularIslands.value.push(...response.list)
      }
      hasMore.value = currentPage.value.islands < response.pagination.totalPages
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value[activeTab.value]++
  loadData()
}

// 点赞变化
const handleLikeChange = (postId: number, isLiked: boolean, likeCount: number) => {
  const updatePost = (posts: Post[]) => {
    const post = posts.find((p) => p.id === postId)
    if (post) {
      post.isLiked = isLiked
      post.likeCount = likeCount
    }
  }
  updatePost(discoverPosts.value)
  updatePost(followingPosts.value)
}

// 点击帖子
const handlePostClick = (postId: number) => {
  router.push(`/posts/${postId}`)
}

// 点击岛屿
const handleIslandClick = (islandId: number) => {
  router.push(`/islands/${islandId}`)
}

// 搜索
const handleSearch = () => {
  trackClick({
    elementId: 'search-icon',
    elementType: 'button',
    pagePath: '/',
    content: { action: 'search' }
  })
  router.push('/search')
}

onMounted(async () => {
  // 记录页面访问
  trackPageView({
    pagePath: '/',
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    device: 'web'
  })

  // 加载初始数据
  await loadData()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #e8f5e9 0%, #e3f2fd 100%);
  padding-bottom: 80px;
}

.top-nav {
  position: sticky;
  top: 0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  z-index: 100;
}

.nav-tabs {
  display: flex;
  gap: 24px;
}

.tab-item {
  font-size: 16px;
  color: #606266;
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: color 0.2s;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

.search-icon {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.search-icon:hover {
  color: #409eff;
}

.content-area {
  padding: 16px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.islands-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  padding: 40px 0;
}

.loading {
  padding: 20px 0;
}

.load-more {
  text-align: center;
  padding: 20px 0;
}
</style>
