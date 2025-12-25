<template>
  <div
    class="bg-white rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    @click="handleClick"
  >
    <div class="p-4">
      <!-- 头部信息 -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <el-avatar :src="island.avatar" :size="48">
            {{ island.name[0] }}
          </el-avatar>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-semibold text-gray-900 truncate">{{ island.name }}</h3>
              <el-tag v-if="island.isVerified" type="success" size="small">已认证</el-tag>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <el-tag size="small" type="success" effect="plain">{{ island.category }}</el-tag>
              <span class="text-gray-500">·{{ island.postCount }}条帖子</span>
            </div>
          </div>
        </div>
        <el-icon class="text-green-500 flex-shrink-0" :size="20">
          <ArrowRight />
        </el-icon>
      </div>

      <!-- 描述信息 -->
      <p v-if="island.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ island.description }}
      </p>

      <!-- 预览图片 -->
      <div v-if="island.previewPosts && island.previewPosts.length > 0" class="flex gap-2 overflow-x-auto pb-2">
        <div
          v-for="(post, index) in island.previewPosts"
          :key="index"
          class="flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-gray-100"
        >
          <img
            v-if="post.mediaUrls && post.mediaUrls.length > 0 && (post.mediaType === 'image' || post.mediaType === 'mixed')"
            :src="post.mediaUrls[0]"
            :alt="`预览图${index + 1}`"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
            <el-icon class="text-gray-400" :size="20">
              <Picture />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IslandWithPreview } from '../composables/useIslands'
import { useStatistics } from '../composables/useStatistics'
import { ArrowRight, Picture } from '@element-plus/icons-vue'

interface Props {
  island: IslandWithPreview
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [islandId: number]
}>()

const { trackClick } = useStatistics()
const router = useRouter()

const handleClick = () => {
  trackClick({
    elementId: `island-list-item-${props.island.id}`,
    elementType: 'card',
    pagePath: '/islands',
    content: { action: 'view-island', islandId: props.island.id }
  })
  router.push(`/islands/${props.island.id}`)
}
</script>

