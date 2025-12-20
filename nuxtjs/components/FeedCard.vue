<template>
  <div class="feed-card" @click="handleClick">
    <!-- 用户信息 -->
    <div class="feed-header">
      <img
        :src="post.user.avatar || '/default-avatar.png'"
        class="user-avatar"
        alt=""
      />
      <div class="user-info">
        <span class="user-name">{{ post.user.nickname }}</span>
        <span class="post-time">{{ formatTime(post.createdAt) }}</span>
      </div>
    </div>

    <!-- 内容 -->
    <div class="feed-content">
      <p v-if="post.content" class="content-text">{{ post.content }}</p>
      
      <!-- 媒体 -->
      <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="media-grid">
        <img
          v-for="(url, index) in post.mediaUrls"
          :key="index"
          :src="url"
          class="media-item"
          alt=""
        />
      </div>
    </div>

    <!-- 互动栏 -->
    <div class="feed-actions">
      <div class="action-btn" @click.stop="handleLike">
        <el-icon :color="post.isLiked ? '#fa3534' : '#909399'">
          <Star v-if="post.isLiked" />
          <StarFilled v-else />
        </el-icon>
        <span>{{ post.likeCount || 0 }}</span>
      </div>
      <div class="action-btn" @click.stop="handleComment">
        <el-icon color="#909399"><ChatDotRound /></el-icon>
        <span>{{ post.commentCount || 0 }}</span>
      </div>
      <div class="action-btn" @click.stop="handleCollect">
        <el-icon :color="post.isCollected ? '#ff9900' : '#909399'">
          <Star v-if="post.isCollected" />
          <StarFilled v-else />
        </el-icon>
        <span>{{ post.collectCount || 0 }}</span>
      </div>
      <div class="action-btn" @click.stop="handleShare">
        <el-icon color="#909399"><Share /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star, StarFilled, ChatDotRound, Share } from '@element-plus/icons-vue'

interface Props {
  post: any
}

const props = defineProps<Props>()

const formatTime = (time: string) => {
  // TODO: 格式化时间
  return time
}

const handleClick = () => {
  // TODO: 跳转到详情页
}

const handleLike = () => {
  // TODO: 点赞功能
  ElMessage.info('点赞功能开发中')
}

const handleComment = () => {
  // TODO: 评论功能
  ElMessage.info('评论功能开发中')
}

const handleCollect = () => {
  // TODO: 收藏功能
  ElMessage.info('收藏功能开发中')
}

const handleShare = () => {
  // TODO: 分享功能
  ElMessage.info('分享功能开发中')
}
</script>

<style scoped>
.feed-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feed-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.post-time {
  font-size: 12px;
  color: #909399;
}

.feed-content {
  margin-bottom: 12px;
}

.content-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 12px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.media-item {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  object-fit: cover;
}

.feed-actions {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  cursor: pointer;
}
</style>

