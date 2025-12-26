<template>
  <div class="grid grid-cols-3 gap-2">
    <div
      v-for="(post, index) in posts"
      :key="post.id"
      class="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
      @click="handlePostClick(post.id)"
    >
      <img
        v-if="post.mediaUrls && post.mediaUrls.length > 0 && (post.mediaType === 'image' || post.mediaType === 'mixed')"
        :src="post.mediaUrls[0]"
        :alt="post.title || `帖子${index + 1}`"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
        <el-icon class="text-gray-400" :size="24">
          <Picture />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStatistics } from '../composables/useStatistics'
import { Picture } from '@element-plus/icons-vue'

interface Post {
  id: number
  title: string | null
  mediaUrls: string[] | null
  mediaType: string
}

interface Props {
  posts: Post[]
}

const props = defineProps<Props>()

const router = useRouter()
const { trackClick } = useStatistics()

const handlePostClick = (postId: number) => {
  trackClick({
    elementId: `island-post-grid-${postId}`,
    elementType: 'card',
    pagePath: router.currentRoute.value.path,
    content: { action: 'view-post', postId }
  })
  router.push(`/posts/${postId}`)
}
</script>

