<template>
  <div class="post-card" @click="handleClick">
    <!-- 封面图片/视频 -->
    <div v-if="post.mediaUrls && post.mediaUrls.length > 0" class="post-media">
      <img
        v-if="post.mediaType === 'image'"
        :src="post.mediaUrls[0]"
        class="media-image"
        alt=""
      />
      <video
        v-else-if="post.mediaType === 'video'"
        :src="post.mediaUrls[0]"
        class="media-video"
        :poster="post.mediaUrls[0]"
      />
      <!-- 图片数量标识 -->
      <div v-if="post.mediaUrls.length > 1" class="image-count">
        +{{ post.mediaUrls.length - 1 }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="post-content">
      <!-- 标题和描述 -->
      <div v-if="post.title || post.content" class="post-header">
        <h3 v-if="post.title" class="post-title">{{ post.title }}</h3>
        <p v-if="post.content" class="post-text">{{ post.content }}</p>
      </div>

      <!-- 发布者信息 -->
      <div class="post-author">
        <img
          :src="post.user.avatar || '/default-avatar.png'"
          class="author-avatar"
          alt=""
        />
        <span class="author-name">{{ post.user.nickname }}</span>
      </div>

      <!-- 底部信息 -->
      <div class="post-footer">
        <div class="post-stats">
          <el-icon><Star /></el-icon>
          <span class="stat-text">{{ post.likeCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  post: any
}

const props = defineProps<Props>()

const handleClick = () => {
  // TODO: 跳转到详情页
  ElMessage.info('详情页开发中')
}
</script>

<style scoped>
.post-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-media {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-count {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.post-content {
  padding: 16px;
}

.post-header {
  margin-bottom: 12px;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.post-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-author {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.author-name {
  font-size: 14px;
  color: #303133;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}
</style>

