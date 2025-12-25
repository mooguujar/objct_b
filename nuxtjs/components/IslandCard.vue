<template>
  <div class="island-card" @click="handleCardClick">
    <!-- 封面图 -->
    <div v-if="island.cover" class="island-cover" @click.stop="handleImageClick">
      <el-image
        :src="island.cover"
        :alt="island.name"
        :preview-src-list="[island.cover]"
        fit="cover"
        preview-teleported
        lazy
        class="island-cover-image"
      />
    </div>

    <!-- 内容 -->
    <div class="island-content">
      <div class="island-header">
        <el-avatar :src="island.avatar" :size="40">
          {{ island.name[0] }}
        </el-avatar>
        <div class="island-info">
          <h3 class="island-name">
            {{ island.name }}
            <el-tag v-if="island.isVerified" type="success" size="small">已认证</el-tag>
          </h3>
          <p v-if="island.description" class="island-desc">{{ truncateText(island.description, 50) }}</p>
        </div>
      </div>

      <div class="island-stats">
        <span class="stat-item">
          <el-icon><User /></el-icon>
          {{ island.memberCount }} 成员
        </span>
        <span class="stat-item">
          <el-icon><Document /></el-icon>
          {{ island.postCount }} 帖子
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Island } from '../composables/useIslands'
import { useStatistics } from '../composables/useStatistics'
import { User, Document } from '@element-plus/icons-vue'

interface Props {
  island: Island
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [islandId: number]
}>()

const { trackClick } = useStatistics()

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const handleCardClick = () => {
  trackClick({
    elementId: `island-card-${props.island.id}`,
    elementType: 'card',
    pagePath: '/',
    content: { action: 'view-island', islandId: props.island.id }
  })
  emit('click', props.island.id)
}

const handleImageClick = () => {
  trackClick({
    elementId: `island-cover-${props.island.id}`,
    elementType: 'image',
    pagePath: '/',
    content: { action: 'preview-island-cover', islandId: props.island.id }
  })
  // el-image 组件会自动处理预览，这里只记录统计
}
</script>

<style scoped>
.island-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.island-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.island-cover {
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: #f5f5f5;
}

.island-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.island-content {
  padding: 12px;
}

.island-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.island-info {
  flex: 1;
}

.island-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.island-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}

.island-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>

