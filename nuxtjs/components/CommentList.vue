<template>
  <div class="comment-list">
    <!-- 评论输入区 -->
    <div class="comment-input-section">
      <el-avatar :src="currentUser?.avatar || '/default-avatar.png'" :size="32" />
      <el-input
        v-model="inputContent"
        placeholder="说点什么..."
        :clearable="true"
        @keyup.enter="handleSubmit"
      >
        <template #append>
          <el-button @click="handleSubmit" :disabled="!inputContent.trim()">发送</el-button>
        </template>
      </el-input>
    </div>

    <!-- 评论列表 -->
    <div class="comments-container">
      <el-skeleton v-if="loading" :rows="3" animated />
      <el-empty v-else-if="commentList.length === 0" description="暂无评论" />
      <div v-else>
        <CommentItem
          v-for="comment in commentList"
          :key="comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @like="handleLike"
          @delete="handleDelete"
          @reply="handleReply"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <el-button @click="loadMore">加载更多</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommentApi } from '~/composables/useCommentApi'
import { useUserStore } from '~/store/user'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
})

const userStore = useUserStore()
const commentApi = useCommentApi()

const currentUser = computed(() => userStore.user)
const currentUserId = computed(() => currentUser.value?.id?.toString() || '')

const commentList = ref<any[]>([])
const inputContent = ref('')
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const replyingTo = ref<any>(null)

const fetchComments = async (pageNum: number = 1) => {
  try {
    loading.value = true
    const result = await commentApi.getCommentList(props.postId, {
      page: pageNum,
      pageSize: 20,
      sort: 'latest',
    })
    
    if (pageNum === 1) {
      commentList.value = result.list
    } else {
      commentList.value.push(...result.list)
    }
    hasMore.value = result.pagination.page < result.pagination.totalPages
  } catch (error: any) {
    ElMessage.error(error.message || '加载评论失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!inputContent.value.trim()) {
    return
  }

  try {
    await commentApi.createComment({
      postId: props.postId,
      content: inputContent.value.trim(),
      parentId: replyingTo.value?.id || null,
    })
    inputContent.value = ''
    replyingTo.value = null
    page.value = 1
    await fetchComments(1)
    ElMessage.success('评论成功')
  } catch (error: any) {
    ElMessage.error(error.message || '评论失败')
  }
}

const handleLike = (data: { id: string; isLiked: boolean }) => {
  const comment = findComment(commentList.value, data.id)
  if (comment) {
    comment.isLiked = data.isLiked
    comment.likeCount = data.isLiked ? (comment.likeCount || 0) + 1 : Math.max(0, (comment.likeCount || 1) - 1)
  }
}

const handleDelete = (id: string) => {
  removeComment(commentList.value, id)
}

const handleReply = (comment: any) => {
  replyingTo.value = comment
  inputContent.value = `@${comment.user.nickname} `
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    page.value++
    fetchComments(page.value)
  }
}

const findComment = (comments: any[], id: string): any => {
  for (const comment of comments) {
    if (comment.id === id) {
      return comment
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findComment(comment.replies, id)
      if (found) return found
    }
  }
  return null
}

const removeComment = (comments: any[], id: string): boolean => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === id) {
      comments.splice(i, 1)
      return true
    }
    if (comments[i].replies && comments[i].replies.length > 0) {
      if (removeComment(comments[i].replies, id)) {
        return true
      }
    }
  }
  return false
}

watch(
  () => props.postId,
  () => {
    page.value = 1
    fetchComments(1)
  },
  { immediate: true },
)

onMounted(() => {
  fetchComments(1)
})
</script>

<style scoped lang="scss">
.comment-list {
  background-color: #fff;
}

.comment-input-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.comments-container {
  padding: 16px;
}

.load-more {
  text-align: center;
  padding: 20px;
}
</style>

