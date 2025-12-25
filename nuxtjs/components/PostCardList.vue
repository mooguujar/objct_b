<template>
  <div class="bg-white rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow">
    <!-- 用户信息头部 -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <el-avatar :src="post.user.avatar" :size="40">
          {{ post.user.nickname?.[0] || post.user.username?.[0] }}
        </el-avatar>
        <div>
          <div class="font-medium text-gray-900">{{ post.user.nickname || post.user.username }}</div>
          <div class="text-xs text-gray-500">{{ formatDate(post.createdAt) }}</div>
        </div>
      </div>
      <el-icon class="cursor-pointer text-gray-400 hover:text-gray-600" :size="20">
        <MoreFilled />
      </el-icon>
    </div>

    <!-- 帖子内容 -->
    <div class="p-4">
      <!-- 标题 -->
      <h3 v-if="post.title" class="text-base font-semibold text-gray-900 mb-2">{{ post.title }}</h3>
      
      <!-- 文本内容 -->
      <p v-if="post.content" class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {{ post.content }}
      </p>

      <!-- 媒体内容 -->
      <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="mt-3">
        <div v-if="post.mediaType === 'image' || post.mediaType === 'mixed'" class="grid gap-2" :class="getImageGridClass(post.mediaUrls.length)">
          <img
            v-for="(url, index) in post.mediaUrls.slice(0, 9)"
            :key="index"
            :src="url"
            :alt="post.title || '图片'"
            class="w-full h-auto object-cover rounded-lg"
            :class="getImageClass(post.mediaUrls.length, index)"
          />
        </div>
      </div>
    </div>

    <!-- 互动按钮 -->
    <div class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <div class="flex items-center gap-6">
        <!-- 点赞 -->
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
          @click.stop="handleLike"
        >
          <el-icon :size="20" :class="post.isLiked ? 'text-red-500' : ''">
            <component :is="post.isLiked ? 'HeartFilled' : 'Heart'" />
          </el-icon>
          <span class="text-sm">{{ post.likeCount || 0 }}</span>
        </button>

        <!-- 评论 -->
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
          @click.stop="handleComment"
        >
          <el-icon :size="20">
            <ChatLineRound />
          </el-icon>
          <span class="text-sm">{{ post.commentCount || 0 }}</span>
        </button>

        <!-- 收藏 -->
        <button
          class="flex items-center gap-2 transition-colors"
          :class="post.isCollected ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'"
          @click.stop="handleCollect"
        >
          <el-icon :size="20">
            <component :is="post.isCollected ? 'StarFilled' : 'Star'" />
          </el-icon>
          <span class="text-sm">{{ post.collectCount || 0 }}</span>
        </button>
      </div>

      <!-- 分享 -->
      <button
        class="flex items-center gap-2 text-gray-600 hover:text-green-500 transition-colors"
        @click.stop="handleShare"
      >
        <el-icon :size="20">
          <Share />
        </el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '../composables/usePosts'
import { usePosts } from '../composables/usePosts'
import { useStatistics } from '../composables/useStatistics'
import { ElMessage } from 'element-plus'
import { Heart, HeartFilled, ChatLineRound, Star, StarFilled, Share, MoreFilled } from '@element-plus/icons-vue'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const emit = defineEmits<{
  likeChange: [postId: number, isLiked: boolean, likeCount: number]
  comment: [postId: number]
  collect: [postId: number]
  share: [postId: number]
}>()

const { toggleLike } = usePosts()
const { trackClick } = useStatistics()

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
  
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const getImageGridClass = (count: number) => {
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-2'
  if (count === 3) return 'grid-cols-3'
  if (count === 4) return 'grid-cols-2'
  return 'grid-cols-3'
}

const getImageClass = (count: number, index: number) => {
  if (count === 1) return 'max-h-96'
  if (count === 2) return 'aspect-square'
  if (count === 3) return 'aspect-square'
  if (count === 4) return 'aspect-square'
  return 'aspect-square'
}

const handleLike = async () => {
  try {
    trackClick({
      elementId: `like-button-${props.post.id}`,
      elementType: 'button',
      pagePath: '/following',
      content: { action: 'like', postId: props.post.id }
    })

    const result = await toggleLike(props.post.id)
    emit('likeChange', props.post.id, result.isLiked, result.likeCount)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleComment = () => {
  trackClick({
    elementId: `comment-button-${props.post.id}`,
    elementType: 'button',
    pagePath: '/following',
    content: { action: 'comment', postId: props.post.id }
  })
  emit('comment', props.post.id)
}

const handleCollect = () => {
  trackClick({
    elementId: `collect-button-${props.post.id}`,
    elementType: 'button',
    pagePath: '/following',
    content: { action: 'collect', postId: props.post.id }
  })
  emit('collect', props.post.id)
}

const handleShare = () => {
  trackClick({
    elementId: `share-button-${props.post.id}`,
    elementType: 'button',
    pagePath: '/following',
    content: { action: 'share', postId: props.post.id }
  })
  emit('share', props.post.id)
}
</script>

