<template>
  <div class="index-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="nav-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="nav-tab"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <span class="tab-text">{{ tab.label }}</span>
          <div v-if="currentTab === tab.key" class="tab-indicator"></div>
        </div>
      </div>
      <el-button
        circle
        :icon="Search"
        @click="handleSearch"
      />
    </div>

    <!-- 发现页内容 -->
    <div v-if="currentTab === 'discover'" class="content-area">
      <!-- 瀑布流容器 -->
      <div v-if="postList.length > 0" class="waterfall-container">
        <div
          v-for="post in postList"
          :key="post.id"
          class="waterfall-item"
        >
          <PostCard :post="post" />
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无内容" />

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="hasMore && !loading" class="load-more-btn">
        <el-button @click="loadMore">加载更多</el-button>
      </div>
    </div>

    <!-- 关注页内容 -->
    <div v-else-if="currentTab === 'following'" class="content-area">
      <div class="following-list">
        <FeedCard
          v-for="post in followingList"
          :key="post.id"
          :post="post"
        />
      </div>
      <el-empty v-if="followingList.length === 0" description="还没有关注任何人" />
    </div>

    <!-- 热门岛屿页内容 -->
    <div v-else-if="currentTab === 'hot-islands'" class="content-area">
      <HotIslands />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Loading } from '@element-plus/icons-vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'default',
})

const api = useApi()
const statistics = useStatistics()

// 页面访问统计
onMounted(() => {
  statistics.trackPageView('/index', '首页')
})

const currentTab = ref('discover')
const postList = ref<any[]>([])
const followingList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

const tabs = [
  { key: 'following', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'hot-islands', label: '热门岛屿' },
]

// 切换标签
const switchTab = (key: string) => {
  currentTab.value = key
  page.value = 1
  hasMore.value = true
  
  // 记录标签切换
  if (process.client) {
    const statistics = useStatistics()
    statistics.reportClickEventWithPosition(
      'tab_switch',
      `tab_${key}`,
      'tab',
      null,
      'index',
      null
    )
  }
  
  if (key === 'discover') {
    postList.value = []
    loadPostList()
  } else if (key === 'following') {
    followingList.value = []
    loadFollowingPosts()
  }
}

// 加载内容列表
const loadPostList = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const result = await api.get('/posts/list', {
      params: {
        page: page.value,
        pageSize: 20,
        sort: 'latest',
      },
    })

    if (result.list && result.list.length > 0) {
      postList.value = [...postList.value, ...result.list]
      page.value++
      hasMore.value = result.pagination.totalPages > result.pagination.page
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载关注动态
const loadFollowingPosts = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const result = await api.get('/posts/following', {
      params: {
        page: page.value,
        pageSize: 20,
      },
    })

    if (result.list && result.list.length > 0) {
      followingList.value = [...followingList.value, ...result.list]
      page.value++
      hasMore.value = result.pagination.totalPages > result.pagination.page
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (currentTab.value === 'discover') {
    loadPostList()
  } else if (currentTab.value === 'following') {
    loadFollowingPosts()
  }
}

const handleSearch = () => {
  navigateTo('/search')
}

onMounted(() => {
  loadPostList()
})
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #d2f9e4, #e2f7ff, #f4f7ff);
}

.top-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to right, #d2f9e4, #e2f7ff, #f4f7ff);
  padding: 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-tabs {
  display: flex;
  gap: 40px;
}

.nav-tab {
  position: relative;
  padding: 10px 0;
  cursor: pointer;
}

.tab-text {
  font-size: 16px;
  color: #666;
  font-weight: normal;
}

.nav-tab.active .tab-text {
  color: #000;
  font-weight: bold;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #3cc51f;
  border-radius: 2px;
}

.content-area {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
  gap: 10px;
}

.load-more-btn {
  text-align: center;
  padding: 20px 0;
}
</style>
