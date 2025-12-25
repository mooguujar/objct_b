<template>
  <div class="post-card" @click="handleCardClick">
    <!-- 媒体内容 -->
    <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="post-media">
      <img
        v-if="post.mediaType === 'image' || post.mediaType === 'mixed'"
        :src="post.mediaUrls[0]"
        :alt="post.title || '图片'"
        class="post-image"
      />
      <div v-if="post.mediaUrls.length > 1" class="media-count">+{{ post.mediaUrls.length - 1 }}</div>
    </div>

    <!-- 标题和内容 -->
    <div class="post-content">
      <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
      <p v-if="post.content" class="post-text">{{ truncateText(post.content, 100) }}</p>
    </div>

    <!-- 用户信息 -->
    <div class="post-footer">
      <div class="user-info">
        <el-avatar :src="post.user.avatar" :size="24">
          {{ post.user.nickname?.[0] || post.user.username?.[0] }}
        </el-avatar>
        <span class="username">{{ post.user.nickname || post.user.username }}</span>
      </div>
      <div class="post-actions">
        <el-button
          :icon="post.isLiked ? 'HeartFilled' : 'Heart'"
          :type="post.isLiked ? 'danger' : 'default'"
          text
          size="small"
          @click.stop="handleLike"
        >
          {{ post.likeCount }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '../composables/usePosts'
import { usePosts } from '../composables/usePosts'
import { useStatistics } from '../composables/useStatistics'
import { ElMessage } from 'element-plus'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const emit = defineEmits<{
  likeChange: [postId: number, isLiked: boolean, likeCount: number]
  click: [postId: number]
}>()

const { toggleLike } = usePosts()
const { trackClick } = useStatistics()

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const handleLike = async () => {
  try {
    trackClick({
      elementId: `like-button-${props.post.id}`,
      elementType: 'button',
      pagePath: '/',
      content: { action: 'like', postId: props.post.id }
    })

    const result = await toggleLike(props.post.id)
    emit('likeChange', props.post.id, result.isLiked, result.likeCount)
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleCardClick = () => {
  trackClick({
    elementId: `post-card-${props.post.id}`,
    elementType: 'card',
    pagePath: '/',
    content: { action: 'view-post', postId: props.post.id }
  })
  emit('click', props.post.id)
}
</script>

<style scoped>
.post-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-media {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.post-content {
  padding: 12px;
  flex: 1;
}

.post-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-text {
  font-size: 12px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 12px;
  color: #606266;
}

.post-actions {
  display: flex;
  gap: 8px;
}
</style>

