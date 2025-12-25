<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 pb-20">
    <!-- 顶部导航栏 -->
    <div class="sticky top-0 bg-white z-50 border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-6">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="relative cursor-pointer pb-2 transition-colors"
            :class="activeTab === tab.key ? 'text-green-500 font-semibold' : 'text-gray-600'"
            @click="handleTabClick(tab.key)"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"
            ></div>
          </div>
        </div>
        <el-icon class="cursor-pointer text-gray-600 hover:text-green-500" :size="20" @click="handleSearch">
          <Search />
        </el-icon>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="px-4 py-4">
      <!-- 为你推荐 -->
      <div v-if="recommendedIslands.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">为你推荐</h2>
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <RecommendedCard
            v-for="island in recommendedIslands"
            :key="island.id"
            :island="island"
            @click="handleIslandClick"
          />
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="mb-4">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="cat in categories"
            :key="cat.key"
            class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="activeCategory === cat.key
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'"
            @click="switchCategory(cat.key)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 岛屿列表 -->
      <div v-if="!loading && islands.length === 0" class="flex flex-col items-center justify-center py-20">
        <el-empty description="暂无岛屿数据" />
      </div>

      <div v-else>
        <IslandListItem
          v-for="island in islands"
          :key="island.id"
          :island="island"
          @click="handleIslandClick"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-8">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading && islands.length > 0" class="text-center py-4">
        <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
      </div>
    </div>

    <!-- 底部导航栏 -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIslands, type IslandWithPreview } from '../../composables/useIslands'
import { useStatistics } from '../../composables/useStatistics'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import RecommendedCard from '../../components/RecommendedCard.vue'
import IslandListItem from '../../components/IslandListItem.vue'
import BottomNav from '../../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth',
  name: 'islands' // 明确指定路由名称
})

const router = useRouter()
const { getRecommendedIslands, getIslandsByCategory } = useIslands()
const { trackPageView, trackClick } = useStatistics()

const activeTab = ref<'following' | 'discover' | 'islands'>('islands')
const tabs = [
  { key: 'following', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'islands', label: '热门岛屿' }
]

const categories = [
  { key: 'all', label: '全部' },
  { key: '财经', label: '财经' },
  { key: '体育', label: '体育' },
  { key: '颜值', label: '颜值' },
  { key: '游戏', label: '游戏' },
  { key: '美食', label: '美食' }
]

const recommendedIslands = ref<any[]>([])
const islands = ref<IslandWithPreview[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = 20

// 切换标签
const handleTabClick = (tab: 'following' | 'discover' | 'islands') => {
  trackClick({
    elementId: `tab-${tab}`,
    elementType: 'tab',
    pagePath: '/islands',
    content: { action: 'switch-tab', tab }
  })
  
  if (tab === 'following') {
    router.push('/following')
  } else if (tab === 'discover') {
    router.push('/')
  } else {
    activeTab.value = tab
  }
}

// 切换分类
const switchCategory = (category: string) => {
  trackClick({
    elementId: `category-${category}`,
    elementType: 'button',
    pagePath: '/islands',
    content: { action: 'switch-category', category }
  })
  activeCategory.value = category
  currentPage.value = 1
  loadData()
}

// 加载推荐数据
const loadRecommended = async () => {
  try {
    const response = await getRecommendedIslands(10)
    recommendedIslands.value = response.list
  } catch (error: any) {
    console.error('加载推荐失败:', error)
  }
}

// 加载数据
const loadData = async (isLoadMore = false) => {
  if (loading.value || (isLoadMore && loadingMore.value)) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await getIslandsByCategory(activeCategory.value, currentPage.value, pageSize)
    
    if (currentPage.value === 1) {
      islands.value = response.list
    } else {
      islands.value.push(...response.list)
    }
    
    hasMore.value = currentPage.value < response.pagination.totalPages
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  loadData(true)
}

// 点击岛屿
const handleIslandClick = (islandId: number) => {
  console.log('handleIslandClick called, islandId:', islandId)
  router.push(`/islands/${islandId}`)
}

// 搜索
const handleSearch = () => {
  trackClick({
    elementId: 'search-icon',
    elementType: 'button',
    pagePath: '/islands',
    content: { action: 'search' }
  })
  router.push('/search')
}

onMounted(async () => {
  // 记录页面访问
  trackPageView({
    pagePath: '/islands',
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    device: 'web'
  })

  // 加载推荐数据
  await loadRecommended()

  // 加载初始数据
  await loadData()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

