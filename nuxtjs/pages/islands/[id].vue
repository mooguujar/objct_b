<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    
    <!-- 加载状态 -->
    <div v-if="!islandDetail && loading" class="flex items-center justify-center min-h-screen">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 内容区域 -->
    <template v-else-if="islandDetail">
      <!-- 头部区域 -->
      <IslandDetailHeader :island="islandDetail" />

      <!-- 内容区域 -->
      <div class="px-4 py-4">
        <!-- 个人资料摘要 -->
        <div class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div class="flex items-start gap-3 mb-4">
            <el-avatar :src="islandDetail.avatar || undefined" :size="48">
              {{ islandDetail.name[0] }}
            </el-avatar>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-lg font-semibold text-gray-900 truncate">{{ islandDetail.name }}</h2>
                <el-tag type="success" size="small">岛主</el-tag>
              </div>
            </div>
          </div>

          <!-- 卖点列表 -->
          <div v-if="islandDetail.description" class="space-y-2 mb-4">
            <div
              v-for="(point, index) in descriptionPoints"
              :key="index"
              class="flex items-start gap-2 text-sm text-gray-700"
            >
              <el-icon class="text-green-500 flex-shrink-0 mt-0.5" :size="16">
                <Check />
              </el-icon>
              <span>{{ point }}</span>
            </div>
          </div>

          <!-- 展开/收起 -->
          <button
            v-if="islandDetail.description && islandDetail.description.length > 100"
            class="text-green-500 text-sm hover:text-green-600"
            @click="toggleExpand"
          >
            {{ isExpanded ? '收起' : '展开' }}
          </button>
        </div>

        <!-- 内容预览网格 -->
        <div v-if="previewPosts.length > 0" class="mb-4">
          <IslandPostGrid :posts="previewPosts" />
        </div>

        <!-- 加入岛屿提醒 -->
        <div v-if="!islandDetail.isMember" class="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900 mb-2">加入岛屿提醒</h3>
          <div class="text-sm text-gray-600 space-y-2 mb-4">
            <p>1. 加入岛屿后你可以查看岛屿内发布的相关内容;</p>
            <p>一次性付费,永久享有加入岛屿权</p>
          </div>
          <el-button
            type="success"
            size="large"
            class="w-full"
            :loading="joining"
            @click="handleJoin"
          >
            立即加入岛屿{{ islandDetail.price > 0 ? `${islandDetail.price}金币` : '免费' }}(永久)
          </el-button>
        </div>

        <!-- 已加入提示 -->
        <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div class="flex items-center gap-2 text-green-700">
            <el-icon :size="20"><Check /></el-icon>
            <span class="text-sm font-medium">您已加入该岛屿</span>
          </div>
        </div>

        <!-- 帖子列表（已加入用户可见） -->
        <div v-if="islandDetail.isMember && posts.length > 0" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">岛屿内容</h3>
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
        <div v-if="hasMore && !loading && islandDetail.isMember && posts.length > 0" class="text-center py-4">
          <el-button @click="loadMore" :loading="loadingMore">加载更多</el-button>
        </div>
      </div>

      <!-- 底部导航栏 -->
      <BottomNav />
    </template>

    <!-- 错误状态 -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen">
      <el-empty description="岛屿不存在或加载失败">
        <el-button type="primary" @click="router.back()">返回</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIslands, type IslandDetail } from '../../composables/useIslands'
import { useStatistics } from '../../composables/useStatistics'
import { useAuthStore } from '../../stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import IslandDetailHeader from '../../components/IslandDetailHeader.vue'
import IslandPostGrid from '../../components/IslandPostGrid.vue'
import PostCardList from '../../components/PostCardList.vue'
import BottomNav from '../../components/BottomNav.vue'


// 使用认证中间件
definePageMeta({
  middleware: 'auth',
  name: 'islands-id' // 明确指定路由名称
})


const route = useRoute()
const router = useRouter()


const authStore = useAuthStore()
const { getIslandDetail, getIslandPosts, joinIsland } = useIslands()
const { trackPageView, trackClick } = useStatistics()

// 开发模式标识
const isDev = process.dev

const islandDetail = ref<IslandDetail | null>(null)
const previewPosts = ref<any[]>([])
const posts = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const joining = ref(false)
const hasMore = ref(true)
const isExpanded = ref(false)
const currentPage = ref(1)
const pageSize = 20

const islandId = computed(() => Number(route.params.id))

// 描述要点
const descriptionPoints = computed(() => {
  if (!islandDetail.value?.description) return []
  const desc = islandDetail.value.description
  const points = desc.split(/[，,。.\n]/).filter((p: string) => p.trim().length > 0)
  return points.slice(0, 3) // 最多显示3个要点
})

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 加载岛屿详情
const loadIslandDetail = async () => {
  loading.value = true
  try {
    console.log('Calling getIslandDetail API...')
    const detail = await getIslandDetail(islandId.value)
    console.log('Island detail loaded:', detail)
    islandDetail.value = detail
  } catch (error: any) {
    console.error('Failed to load island detail:', error)
    ElMessage.error(error.message || '加载失败')
    // 不自动返回，让用户看到错误信息
  } finally {
    loading.value = false
  }
}

// 加载帖子列表
const loadPosts = async (isLoadMore = false) => {
  if (loading.value || (isLoadMore && loadingMore.value)) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const response = await getIslandPosts(islandId.value, currentPage.value, pageSize)
    
    // 如果是预览（未加入），只显示前6个
    if (!response.isMember) {
      previewPosts.value = response.list
    } else {
      if (currentPage.value === 1) {
        posts.value = response.list
      } else {
        posts.value.push(...response.list)
      }
      hasMore.value = currentPage.value < response.pagination.totalPages
    }
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
  loadPosts(true)
}

// 加入岛屿
const handleJoin = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要加入该岛屿吗？${islandDetail.value && islandDetail.value.price > 0 ? `将消耗 ${islandDetail.value.price} 金币` : '免费加入'}`,
      '确认加入',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    joining.value = true

    trackClick({
      elementId: 'join-island-button',
      elementType: 'button',
      pagePath: `/islands/${islandId.value}`,
      content: { action: 'join-island', islandId: islandId.value }
    })

    await joinIsland(islandId.value)
    
    ElMessage.success('加入成功！')
    
    // 重新加载数据
    await loadIslandDetail()
    await loadPosts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '加入失败')
    }
  } finally {
    joining.value = false
  }
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

// 加载数据的函数
const loadPageData = async () => {
  if (!islandId.value) {
    console.warn('Island ID is invalid:', islandId.value)
    return
  }

  console.log('Loading page data, islandId:', islandId.value)
  
  // 先加载数据，加快页面显示
  console.log('Loading island detail...')
  await loadIslandDetail()
  console.log('Loading posts...')
  await loadPosts()
  console.log('Data loaded')

  // 统计接口在后台异步执行，不阻塞页面
  trackPageView({
    pagePath: `/islands/${islandId.value}`,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    device: 'web'
  })
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    // 重置状态
    islandDetail.value = null
    previewPosts.value = []
    posts.value = []
    currentPage.value = 1
    // 重新加载数据
    loadPageData()
  }
}, { immediate: false })

onMounted(async () => {
  // 确保在客户端执行
  if (!process.client) {
    return
  }
  
  await loadPageData()
})
</script>
