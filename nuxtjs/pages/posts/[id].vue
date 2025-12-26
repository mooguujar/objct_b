<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <!-- 加载状态 -->
    <div v-if="!postDetail && loading" class="flex items-center justify-center min-h-screen">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 内容区域 -->
    <template v-else-if="postDetail">
      <!-- 返回按钮 -->
      <div class="sticky top-0 bg-white z-50 border-b border-gray-200 px-4 py-3">
        <el-button
          text
          @click="handleBack"
          class="flex items-center gap-2"
        >
          <el-icon :size="20"><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>

      <!-- 帖子内容 -->
      <div class="bg-white mb-2">
        <!-- 用户信息头部 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <el-avatar :src="postDetail.user.avatar || undefined" :size="40">
              {{ postDetail.user.nickname?.[0] || postDetail.user.username?.[0] }}
            </el-avatar>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-gray-900">{{ postDetail.user.nickname || postDetail.user.username }}</span>
                <el-tag v-if="postDetail.user.isVerified" type="success" size="small">已认证</el-tag>
              </div>
              <div class="text-xs text-gray-500">{{ formatDate(postDetail.createdAt) }}</div>
            </div>
          </div>
          <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600" :size="20">
            <MoreFilled />
          </el-icon>
        </div>

        <!-- 帖子内容 -->
        <div class="p-4">
          <!-- 标题 -->
          <h1 v-if="postDetail.title" class="text-xl font-semibold text-gray-900 mb-3">{{ postDetail.title }}</h1>
          
          <!-- 文本内容 -->
          <p v-if="postDetail.content" class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
            {{ postDetail.content }}
          </p>

          <!-- 媒体内容 -->
          <div v-if="postDetail.mediaUrls && postDetail.mediaUrls.length > 0" class="mb-4">
            <div v-if="postDetail.mediaType === 'image' || postDetail.mediaType === 'mixed'" class="grid gap-2" :class="getImageGridClass(postDetail.mediaUrls.length)">
              <img
                v-for="(url, index) in postDetail.mediaUrls"
                :key="index"
                :src="url"
                :alt="postDetail.title || '图片'"
                class="w-full h-auto object-cover rounded-lg cursor-pointer"
                :class="getImageClass(postDetail.mediaUrls.length, index)"
                @click="handleImageClick(index)"
              />
            </div>
          </div>

          <!-- 岛屿信息 -->
          <div v-if="postDetail.island" class="mb-4">
            <el-tag type="success" effect="plain" class="cursor-pointer" @click="handleIslandClick">
              {{ postDetail.island.name }}
            </el-tag>
          </div>
        </div>

        <!-- 互动按钮 -->
        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div class="flex items-center gap-6">
            <!-- 点赞 -->
            <button
              class="flex items-center gap-2 transition-colors"
              :class="postDetail.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'"
              @click="handleLike"
            >
              <el-icon :size="20">
                <component :is="postDetail.isLiked ? 'HeartFilled' : 'Heart'" />
              </el-icon>
              <span class="text-sm">{{ postDetail.likeCount }}</span>
            </button>

            <!-- 评论 -->
            <button
              class="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
              @click="scrollToComments"
            >
              <el-icon :size="20"><ChatDotRound /></el-icon>
              <span class="text-sm">{{ postDetail.commentCount }}</span>
            </button>

            <!-- 收藏 -->
            <button
              class="flex items-center gap-2 transition-colors"
              :class="postDetail.isCollected ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'"
              @click="handleCollect"
            >
              <el-icon :size="20">
                <component :is="postDetail.isCollected ? 'StarFilled' : 'Star'" />
              </el-icon>
              <span class="text-sm">{{ postDetail.collectCount }}</span>
            </button>

            <!-- 分享 -->
            <button
              class="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
              @click="handleShare"
            >
              <el-icon :size="20"><Share /></el-icon>
              <span class="text-sm">{{ postDetail.shareCount }}</span>
            </button>
          </div>

          <!-- 浏览量 -->
          <div class="flex items-center gap-1 text-gray-500 text-sm">
            <el-icon :size="16"><View /></el-icon>
            <span>{{ postDetail.viewCount }}</span>
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div id="comments" class="bg-white px-4 py-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">评论 ({{ postDetail.commentCount }})</h2>

        <!-- 评论列表 -->
        <div v-if="comments.length > 0" class="space-y-4">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="border-b border-gray-100 pb-4 last:border-0"
          >
            <!-- 评论内容 -->
            <div class="flex gap-3">
              <el-avatar :src="comment.user.avatar || undefined" :size="32">
                {{ comment.user.nickname?.[0] || comment.user.username?.[0] }}
              </el-avatar>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-sm text-gray-900">{{ comment.user.nickname || comment.user.username }}</span>
                  <el-tag v-if="comment.user.isVerified" type="success" size="small">已认证</el-tag>
                  <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ comment.content }}</p>
                <div class="flex items-center gap-4">
                  <button
                    class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
                    :class="comment.isLiked ? 'text-red-500' : ''"
                    @click="handleCommentLike(comment.id)"
                  >
                    <el-icon :size="14">
                      <component :is="comment.isLiked ? 'HeartFilled' : 'Heart'" />
                    </el-icon>
                    <span>{{ comment.likeCount }}</span>
                  </button>
                  <button
                    class="text-gray-500 hover:text-blue-500 transition-colors text-xs"
                    @click="handleReply(comment.id)"
                  >
                    回复
                  </button>
                </div>

                <!-- 回复列表 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                  <div
                    v-for="reply in comment.replies"
                    :key="reply.id"
                    class="flex gap-2"
                  >
                    <el-avatar :src="reply.user.avatar || undefined" :size="24">
                      {{ reply.user.nickname?.[0] || reply.user.username?.[0] }}
                    </el-avatar>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-medium text-xs text-gray-900">{{ reply.user.nickname || reply.user.username }}</span>
                        <el-tag v-if="reply.user.isVerified" type="success" size="small">已认证</el-tag>
                        <span class="text-xs text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                      </div>
                      <p class="text-xs text-gray-700 mb-1">{{ reply.content }}</p>
                      <div class="flex items-center gap-4">
                        <button
                          class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-xs"
                          :class="reply.isLiked ? 'text-red-500' : ''"
                          @click="handleCommentLike(reply.id)"
                        >
                          <el-icon :size="12">
                            <component :is="reply.isLiked ? 'HeartFilled' : 'Heart'" />
                          </el-icon>
                          <span>{{ reply.likeCount }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="py-8 text-center">
          <el-empty description="暂无评论" :image-size="80" />
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMoreComments && !loadingComments && comments.length > 0" class="text-center py-4">
          <el-button @click="loadMoreComments" :loading="loadingMoreComments">加载更多评论</el-button>
        </div>
      </div>

      <!-- 底部导航栏 -->
      <BottomNav />
    </template>

    <!-- 错误状态 -->
    <div v-else class="flex flex-col items-center justify-center min-h-screen">
      <el-empty description="帖子不存在或已被删除">
        <el-button type="primary" @click="router.back()">返回</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePosts, type Post, type Comment } from '../../composables/usePosts'
import { useStatistics } from '../../composables/useStatistics'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  MoreFilled, 
  Heart, 
  HeartFilled, 
  ChatDotRound, 
  Star, 
  StarFilled, 
  Share, 
  View 
} from '@element-plus/icons-vue'
import BottomNav from '../../components/BottomNav.vue'

// 使用认证中间件
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { getPostDetail, getPostComments, toggleLike } = usePosts()
const { trackPageView, trackClick } = useStatistics()

const postDetail = ref<Post | null>(null)
const comments = ref<Comment[]>([])
const loading = ref(false)
const loadingComments = ref(false)
const loadingMoreComments = ref(false)
const hasMoreComments = ref(true)
const currentCommentPage = ref(1)
const commentPageSize = 20

const postId = computed(() => Number(route.params.id))

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 获取图片网格类
const getImageGridClass = (count: number) => {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count === 3) return 'grid-cols-3'
  if (count === 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

// 获取图片类
const getImageClass = (count: number, index: number) => {
  if (count === 1) return 'max-h-96'
  if (count === 2) return 'h-48'
  if (count === 3) return 'h-32'
  if (count === 4) return 'h-32'
  return 'h-24'
}

// 加载帖子详情
const loadPostDetail = async () => {
  loading.value = true
  try {
    const detail = await getPostDetail(postId.value)
    postDetail.value = detail
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 加载评论列表
const loadComments = async (isLoadMore = false) => {
  if (loadingComments.value || (isLoadMore && loadingMoreComments.value)) return

  if (isLoadMore) {
    loadingMoreComments.value = true
  } else {
    loadingComments.value = true
  }

  try {
    const response = await getPostComments(postId.value, currentCommentPage.value, commentPageSize)
    
    if (currentCommentPage.value === 1) {
      comments.value = response.list
    } else {
      comments.value.push(...response.list)
    }
    
    hasMoreComments.value = currentCommentPage.value < response.pagination.totalPages
  } catch (error: any) {
    ElMessage.error(error.message || '加载评论失败')
  } finally {
    loadingComments.value = false
    loadingMoreComments.value = false
  }
}

// 加载更多评论
const loadMoreComments = () => {
  currentCommentPage.value++
  loadComments(true)
}

// 返回
const handleBack = () => {
  trackClick({
    elementId: 'back-button',
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'back' }
  })
  router.back()
}

// 点赞
const handleLike = async () => {
  if (!authStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }

  trackClick({
    elementId: 'like-button',
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'like', postId: postId.value }
  })

  try {
    const result = await toggleLike(postId.value)
    if (postDetail.value) {
      postDetail.value.isLiked = result.isLiked
      postDetail.value.likeCount = result.likeCount
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 收藏
const handleCollect = () => {
  trackClick({
    elementId: 'collect-button',
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'collect', postId: postId.value }
  })
  ElMessage.info('收藏功能开发中')
}

// 分享
const handleShare = () => {
  trackClick({
    elementId: 'share-button',
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'share', postId: postId.value }
  })
  ElMessage.info('分享功能开发中')
}

// 评论点赞
const handleCommentLike = (commentId: number) => {
  trackClick({
    elementId: `comment-like-${commentId}`,
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'comment-like', commentId }
  })
  ElMessage.info('评论点赞功能开发中')
}

// 回复
const handleReply = (commentId: number) => {
  trackClick({
    elementId: `reply-button-${commentId}`,
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'reply', commentId }
  })
  ElMessage.info('回复功能开发中')
}

// 点击图片
const handleImageClick = (index: number) => {
  trackClick({
    elementId: `post-image-${index}`,
    elementType: 'image',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'view-image', index }
  })
  // TODO: 实现图片预览
}

// 点击岛屿
const handleIslandClick = () => {
  if (postDetail.value?.island) {
    trackClick({
      elementId: 'island-tag',
      elementType: 'tag',
      pagePath: `/posts/${postId.value}`,
      content: { action: 'view-island', islandId: postDetail.value.island.id }
    })
    router.push(`/islands/${postDetail.value.island.id}`)
  }
}

// 滚动到评论区域
const scrollToComments = () => {
  trackClick({
    elementId: 'comment-button',
    elementType: 'button',
    pagePath: `/posts/${postId.value}`,
    content: { action: 'scroll-to-comments' }
  })
  if (process.client && typeof document !== 'undefined') {
    const commentsEl = document.getElementById('comments')
    if (commentsEl) {
      commentsEl.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    postDetail.value = null
    comments.value = []
    currentCommentPage.value = 1
    loadPostDetail()
    loadComments()
  }
}, { immediate: false })

onMounted(async () => {
  if (!process.client) return

  // 记录页面访问
  trackPageView({
    pagePath: `/posts/${postId.value}`,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    device: 'web'
  })

  // 加载数据
  await loadPostDetail()
  await loadComments()

  // 如果URL中有 #comments，滚动到评论区域
  if (route.hash === '#comments') {
    setTimeout(() => {
      scrollToComments()
    }, 500)
  }
})
</script>

<style scoped>
/* 自定义样式 */
</style>

