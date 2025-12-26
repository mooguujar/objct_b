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
      <!-- 空状态 -->
      <div v-if="!loading && posts.length === 0" class="flex flex-col items-center justify-center py-20">
        <el-empty description="还没有关注任何人，去发现页看看吧">
          <el-button type="primary" @click="goToDiscover">去发现</el-button>
        </el-empty>
      </div>

      <!-- 帖子列表 -->
      <div v-else>
        <PostCardList
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @like-change="handleLikeChange"
          @comment="handleComment"
          @collect="handleCollect"
          @share="handleShare"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="py-8">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading && posts.length > 0" class="text-center py-4">
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
import { usePosts, type Post } from '../composables/usePosts'
import { useStatistics } from '../composables/useStatistics'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import PostCardList from '../components/PostCardList.vue'
import BottomNav from '../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const authStore = useAuthStore()
const { getFollowingPosts, toggleLike } = usePosts()
const { trackPageView, trackClick } = useStatistics()

const activeTab = ref<'following' | 'discover' | 'islands'>('following')
const tabs: Array<{ key: 'following' | 'discover' | 'islands'; label: string }> = [
  { key: 'following', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'islands', label: '热门岛屿' }
]

const posts = ref<Post[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = 20

// 切换标签
const handleTabClick = (tab: 'following' | 'discover' | 'islands') => {
  trackClick({
    elementId: `tab-${tab}`,
    elementType: 'tab',
    pagePath: '/following',
    content: { action: 'switch-tab', tab }
  })
  
  if (tab === 'discover') {
    router.push('/')
  } else if (tab === 'islands') {
    router.push('/islands')
  } else {
    activeTab.value = tab
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
    const response = await getFollowingPosts(currentPage.value, pageSize)
    
    if (currentPage.value === 1) {
      posts.value = response.list
    } else {
      posts.value.push(...response.list)
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

// 点赞变化
const handleLikeChange = (postId: number, isLiked: boolean, likeCount: number) => {
  const post = posts.value.find((p) => p.id === postId)
  if (post) {
    post.isLiked = isLiked
    post.likeCount = likeCount
  }
}

// 评论
const handleComment = (postId: number) => {
  router.push(`/posts/${postId}#comments`)
}

// 收藏
const handleCollect = (postId: number) => {
  ElMessage.info('收藏功能开发中')
}

// 分享
const handleShare = (postId: number) => {
  ElMessage.info('分享功能开发中')
}

// 搜索
const handleSearch = () => {
  trackClick({
    elementId: 'search-icon',
    elementType: 'button',
    pagePath: '/following',
    content: { action: 'search' }
  })
  router.push('/search')
}

// 去发现页
const goToDiscover = () => {
  router.push('/')
}

onMounted(async () => {
  // 记录页面访问（仅在客户端）
  if (process.client) {
    trackPageView({
      pagePath: '/following',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      device: 'web'
    })
  }

  // 加载初始数据
  await loadData()
})
</script>

