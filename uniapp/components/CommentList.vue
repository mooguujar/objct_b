<template>
  <view class="comment-list">
    <!-- 评论输入区 -->
    <view class="comment-input-section">
      <u-avatar
        :src="currentUser?.avatar || '/static/default-avatar.png'"
        size="64"
      ></u-avatar>
      <view class="input-wrapper">
        <u-input
          v-model="inputContent"
          placeholder="说点什么..."
          :border="false"
          :clearable="true"
          :customStyle="{ backgroundColor: '#f5f5f5', borderRadius: '32rpx', padding: '0 24rpx' }"
          @confirm="handleSubmit"
        ></u-input>
      </view>
      <u-button
        size="mini"
        shape="circle"
        text="发送"
        color="#1f2937"
        :disabled="!inputContent.trim()"
        @click="handleSubmit"
      ></u-button>
    </view>

    <!-- 评论列表 -->
    <view class="comments-container">
      <view v-if="loading" class="loading">
        <u-loading-icon />
      </view>
      <view v-else-if="commentList.length === 0" class="empty">
        <u-empty mode="data" text="暂无评论" />
      </view>
      <view v-else>
        <CommentItem
          v-for="comment in commentList"
          :key="comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @like="handleLike"
          @delete="handleDelete"
          @reply="handleReply"
        />
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
        <text class="load-more-text">加载更多</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { commentApi } from '@/api/comment'
import { useUserStore } from '@/store/user'
import CommentItem from './CommentItem.vue'

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
})

const userStore = useUserStore()
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
    const res = await commentApi.getCommentList(props.postId, {
      page: pageNum,
      pageSize: 20,
      sort: 'latest',
    })
    if (res.code === 200 && res.data) {
      if (pageNum === 1) {
        commentList.value = res.data.list
      } else {
        commentList.value.push(...res.data.list)
      }
      hasMore.value = res.data.pagination.page < res.data.pagination.totalPages
    }
  } catch (error) {
    console.error('加载评论失败', error)
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
    // 重新加载评论列表
    page.value = 1
    await fetchComments(1)
    uni.showToast({
      title: '评论成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '评论失败',
      icon: 'error',
    })
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

<style lang="scss" scoped>
.comment-list {
  background-color: #fff;
}

.comment-input-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.input-wrapper {
  flex: 1;
}

.comments-container {
  padding: 20rpx;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40rpx;
}

.empty {
  padding: 80rpx 0;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #909399;
}

.load-more-text {
  font-size: 28rpx;
}
</style>

