<template>
  <div
    class="flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    @click="handleClick"
  >
    <!-- 封面图 -->
    <div class="w-full h-24 bg-gray-100 overflow-hidden">
      <img
        v-if="island.cover"
        :src="island.cover"
        :alt="island.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
        <span class="text-2xl text-gray-400">{{ island.name[0] }}</span>
      </div>
    </div>

    <!-- 内容 -->
    <div class="p-2">
      <div class="flex items-center gap-2 mb-1">
        <el-avatar :src="island.avatar" :size="20">
          {{ island.name[0] }}
        </el-avatar>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium text-gray-900 truncate">{{ island.name }}</div>
        </div>
      </div>
      <div class="text-xs text-gray-500">帖子·{{ island.postCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Island } from '../composables/useIslands'
import { useStatistics } from '../composables/useStatistics'

interface Props {
  island: Island
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [islandId: number]
}>()

const router = useRouter()
const { trackClick } = useStatistics()

const handleClick = () => {
  trackClick({
    elementId: `recommended-card-${props.island.id}`,
    elementType: 'card',
    pagePath: '/islands',
    content: { action: 'view-island', islandId: props.island.id }
  })
  router.push(`/islands/${props.island.id}`)
}
</script>

