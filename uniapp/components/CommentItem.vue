<template>
  <view class="comment-item">
    <u-avatar :src="comment.user.avatar || '/static/default-avatar.png'" size="64"></u-avatar>
    <view class="comment-content">
      <view class="comment-header">
        <text class="comment-author">{{ comment.user.nickname }}</text>
        <text class="comment-time">{{ formatTime(comment.createdAt) }}</text>
      </view>
      <text class="comment-text">{{ comment.content }}</text>
      <view class="comment-actions">
        <view class="action-item" @click="handleLike">
          <u-icon
            :name="comment.isLiked ? 'heart-fill' : 'heart'"
            :color="comment.isLiked ? '#f43f5e' : '#666'"
            size="32"
          ></u-icon>
          <text class="action-count" :style="{ color: comment.isLiked ? '#f43f5e' : '#666' }">
            {{ comment.likeCount || 0 }}
          </text>
        </view>
        <view class="action-item" @click="handleReply">
          <u-icon name="chat" color="#666" size="32"></u-icon>
          <text class="action-count" v-if="comment.replyCount > 0">{{ comment.replyCount }}</text>
        </view>
        <view v-if="canDelete" class="action-item" @click="handleDelete">
          <u-icon name="trash" color="#999" size="28"></u-icon>
        </view>
      </view>
      <!-- 回复列表 -->
      <view v-if="comment.replies && comment.replies.length > 0" class="replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :current-user-id="currentUserId"
          @like="handleReplyLike"
          @delete="handleReplyDelete"
          @reply="$emit('reply', reply)"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { commentApi } from '@/api/comment'
import { useUserStore } from '@/store/user'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  currentUserId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['like', 'delete', 'reply'])

const userStore = useUserStore()

const canDelete = computed(() => {
  return props.comment.user.id.toString() === props.currentUserId || props.currentUserId === userStore.user?.id?.toString()
})

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const handleLike = async () => {
  try {
    if (props.comment.isLiked) {
      await commentApi.unlikeComment(props.comment.id)
      emit('like', { id: props.comment.id, isLiked: false })
    } else {
      await commentApi.likeComment(props.comment.id)
      emit('like', { id: props.comment.id, isLiked: true })
    }
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'error',
    })
  }
}

const handleReply = () => {
  emit('reply', props.comment)
}

const handleDelete = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这条评论吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await commentApi.deleteComment(props.comment.id)
          emit('delete', props.comment.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'error',
          })
        }
      }
    },
  })
}

const handleReplyLike = (data: any) => {
  emit('like', data)
}

const handleReplyDelete = (id: string) => {
  emit('delete', id)
}
</script>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.comment-author {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.comment-actions {
  display: flex;
  gap: 32rpx;
  align-items: center;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-count {
  font-size: 24rpx;
  color: #666;
}

.replies {
  margin-top: 24rpx;
  padding-left: 20rpx;
  border-left: 2rpx solid #f0f0f0;
}
</style>

