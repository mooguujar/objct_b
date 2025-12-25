<template>
  <div class="relative w-full h-64 overflow-hidden">
    <!-- 背景图片 -->
    <div class="absolute inset-0">
      <img
        v-if="island.cover"
        :src="island.cover"
        :alt="island.name"
        class="w-full h-full object-cover blur-sm scale-110"
      />
      <div v-else class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500"></div>
      <div class="absolute inset-0 bg-black bg-opacity-30"></div>
    </div>

    <!-- 顶部操作栏 -->
    <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
      <el-icon
        class="text-white cursor-pointer hover:text-gray-200 transition-colors"
        :size="24"
        @click="handleBack"
      >
        <ArrowLeft />
      </el-icon>
      <el-icon
        class="text-white cursor-pointer hover:text-gray-200 transition-colors"
        :size="24"
        @click="handleMore"
      >
        <MoreFilled />
      </el-icon>
    </div>

    <!-- 资料卡片 -->
    <div class="absolute bottom-0 left-0 right-0 p-4">
      <div class="bg-gray-800 bg-opacity-90 rounded-lg p-4 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <!-- 头像 -->
          <el-avatar :src="island.avatar" :size="48" class="flex-shrink-0">
            {{ island.name[0] }}
          </el-avatar>

          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <div class="text-white font-semibold text-base mb-1 truncate">{{ island.name }}</div>
            <div class="text-green-400 text-sm mb-1">ID {{ island.id }}</div>
            <div class="text-gray-300 text-sm">{{ island.postCount }}条帖子</div>
          </div>

          <!-- 分享按钮 -->
          <el-button
            type="primary"
            size="small"
            class="flex-shrink-0"
            @click="handleShare"
          >
            <el-icon class="mr-1"><Share /></el-icon>
            分享
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStatistics } from '../composables/useStatistics'
import { ArrowLeft, MoreFilled, Share } from '@element-plus/icons-vue'
import type { IslandDetail } from '../composables/useIslands'

interface Props {
  island: IslandDetail
}

const props = defineProps<Props>()

const router = useRouter()
const { trackClick } = useStatistics()

const handleBack = () => {
  trackClick({
    elementId: 'island-detail-back',
    elementType: 'button',
    pagePath: `/islands/${props.island.id}`,
    content: { action: 'back' }
  })
  router.back()
}

const handleMore = () => {
  trackClick({
    elementId: 'island-detail-more',
    elementType: 'button',
    pagePath: `/islands/${props.island.id}`,
    content: { action: 'more' }
  })
  // TODO: 显示更多选项菜单
}

const handleShare = () => {
  trackClick({
    elementId: 'island-detail-share',
    elementType: 'button',
    pagePath: `/islands/${props.island.id}`,
    content: { action: 'share', islandId: props.island.id }
  })
  // TODO: 实现分享功能
}
</script>

