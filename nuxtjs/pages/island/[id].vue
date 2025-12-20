<template>
  <div class="island-detail-page">
    <!-- 顶部背景区 -->
    <div
      class="top-banner"
      :style="{ backgroundImage: `url(${islandInfo.cover || ''})` }"
    >
      <div class="banner-overlay">
        <div class="banner-actions">
          <el-button circle :icon="ArrowLeft" @click="handleBack" />
          <el-button circle :icon="MoreFilled" @click="handleMore" />
        </div>
        <div class="island-overlay-info">
          <img
            :src="islandInfo.avatar || '/default-avatar.png'"
            class="island-avatar-large"
            alt=""
          />
          <h1 class="island-name-large">{{ islandInfo.name }}</h1>
        </div>
      </div>
    </div>

    <!-- 岛屿信息 -->
    <div class="island-info-section">
      <p v-if="islandInfo.description" class="island-desc">
        {{ islandInfo.description }}
      </p>
      <div class="island-meta">
        <div class="meta-item">
          <span class="meta-label">岛主</span>
          <span class="meta-value">{{ islandInfo.owner?.nickname }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">成员</span>
          <span class="meta-value">{{ islandInfo.memberCount }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">帖子</span>
          <span class="meta-value">{{ islandInfo.postCount }}</span>
        </div>
      </div>
    </div>

    <!-- 加入按钮 -->
    <div v-if="!islandInfo.isMember" class="join-section">
      <el-button type="primary" style="width: 100%" @click="handleJoin">
        {{ islandInfo.price > 0 ? `加入岛屿 (${islandInfo.price} 金币)` : '免费加入' }}
      </el-button>
    </div>

    <!-- 内容瀑布流 -->
    <div class="posts-section">
      <div class="waterfall-container">
        <PostCard v-for="post in postList" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, MoreFilled } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const route = useRoute()
const api = useApi()

const islandInfo = ref<any>({})
const postList = ref<any[]>([])
const loading = ref(false)

const loadIslandDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    islandInfo.value = await api.get(`/islands/${id}`)
    const posts = await api.get(`/islands/${id}/posts`)
    postList.value = posts.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  navigateTo(-1)
}

const handleMore = () => {
  // TODO: 更多操作
}

const handleJoin = () => {
  ElMessage.info('加入功能开发中')
}

onMounted(() => {
  loadIslandDetail()
})
</script>

<style scoped>
.island-detail-page {
  min-height: 100vh;
  background: #f8f8f8;
}

.top-banner {
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 30px;
}

.banner-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.island-overlay-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.island-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #fff;
}

.island-name-large {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.island-info-section {
  background: #fff;
  padding: 30px;
  margin-bottom: 20px;
}

.island-desc {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 20px;
}

.island-meta {
  display: flex;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 14px;
  color: #909399;
}

.meta-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.join-section {
  padding: 20px 30px;
  background: #fff;
  margin-bottom: 20px;
}

.posts-section {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.waterfall-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>

