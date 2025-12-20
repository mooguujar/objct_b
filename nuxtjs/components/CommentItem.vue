<template>
  <div class="comment-item">
    <el-avatar :src="comment.user.avatar || '/default-avatar.png'" :size="32" />
    <div class="comment-content">
      <div class="comment-header">
        <span class="comment-author">{{ comment.user.nickname }}</span>
        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
      </div>
      <p class="comment-text">{{ comment.content }}</p>
      <div class="comment-actions">
        <el-button text @click="handleLike">
          <el-icon :color="comment.isLiked ? '#f43f5e' : '#666'">
            <component :is="comment.isLiked ? 'HeartFilled' : 'Heart'" />
          </el-icon>
          <span :style="{ color: comment.isLiked ? '#f43f5e' : '#666', marginLeft: '4px' }">
            {{ comment.likeCount || 0 }}
          </span>
        </el-button>
        <el-button text @click="handleReply">
          <el-icon><ChatDotRound /></el-icon>
          <span v-if="comment.replyCount > 0" style="margin-left: 4px">{{ comment.replyCount }}</span>
        </el-button>
        <el-button v-if="canDelete" text @click="handleDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <!-- 回复列表 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :current-user-id="currentUserId"
          @like="$emit('like', $event)"
          @delete="$emit('delete', $event)"
          @reply="$emit('reply', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Heart, HeartFilled, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { useCommentApi } from '~/composables/useCommentApi'
import { useUserStore } from '~/store/user'

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
const commentApi = useCommentApi()

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
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleReply = () => {
  emit('reply', props.comment)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await commentApi.deleteComment(props.comment.id)
    emit('delete', props.comment.id)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped lang="scss">
.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

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
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.replies {
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid #f0f0f0;
}
</style>

