<template>
  <div class="publish-page">
    <el-card class="publish-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">发布</span>
          <el-button
            type="primary"
            :disabled="!canPublish"
            :loading="publishing"
            @click="handlePublish"
          >
            发布
          </el-button>
        </div>
      </template>

      <!-- 文本输入区 -->
      <el-input
        v-model="form.content"
        type="textarea"
        :rows="6"
        placeholder="分享你的想法..."
        :maxlength="2000"
        show-word-limit
        class="content-input"
      />

      <!-- 媒体预览区 -->
      <div v-if="mediaList.length > 0" class="media-preview">
        <div class="media-grid">
          <div
            v-for="(item, index) in mediaList"
            :key="index"
            class="media-item"
          >
            <img
              v-if="item.type === 'image'"
              :src="item.url"
              class="media-image"
              @click="previewMedia(index)"
            />
            <video
              v-else-if="item.type === 'video'"
              :src="item.url"
              controls
              class="media-video"
            />
            <el-button
              circle
              class="delete-btn"
              @click="removeMedia(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="action-section">
        <el-button @click="chooseImage">
          <el-icon><Picture /></el-icon>
          图片
        </el-button>
        <el-button @click="chooseVideo">
          <el-icon><VideoCamera /></el-icon>
          视频
        </el-button>
        <el-button v-if="!isPersonalPost" @click="chooseIsland">
          <el-icon><HomeFilled /></el-icon>
          岛屿
        </el-button>
      </div>

      <!-- 岛屿选择 -->
      <div v-if="selectedIsland" class="island-section">
        <el-card class="island-card">
          <div class="island-info">
            <el-avatar :src="selectedIsland.avatar || '/default-island.png'" />
            <span class="island-name">{{ selectedIsland.name }}</span>
            <el-button text @click="clearIsland">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, VideoCamera, HomeFilled, Close } from '@element-plus/icons-vue'
import { useContentApi } from '~/composables/useContentApi'
import { useUploadApi } from '~/composables/useUploadApi'

definePageMeta({
  middleware: ['auth'],
})

const contentApi = useContentApi()
const uploadApi = useUploadApi()

const form = ref({
  content: '',
  islandId: null as string | null,
})

const mediaList = ref<Array<{ type: string; url: string }>>([])
const selectedIsland = ref<any>(null)
const publishing = ref(false)
const isPersonalPost = ref(true)

const canPublish = computed(() => {
  return (
    (form.value.content.trim().length > 0 || mediaList.value.length > 0) &&
    !publishing.value
  )
})

const route = useRoute()
onMounted(() => {
  if (route.query.type === 'island') {
    isPersonalPost.value = false
  }
  if (route.query.islandId) {
    form.value.islandId = route.query.islandId as string
    // TODO: 加载岛屿信息
  }
})

// 选择图片
const chooseImage = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = async (e: any) => {
    const files = Array.from(e.target.files) as File[]
    for (const file of files.slice(0, 9 - mediaList.value.length)) {
      try {
        const url = await uploadApi.uploadImage(file)
        mediaList.value.push({
          type: 'image',
          url,
        })
      } catch (error: any) {
        ElMessage.error(error.message || '图片上传失败')
      }
    }
  }
  input.click()
}

// 选择视频
const chooseVideo = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'video/*'
  input.onchange = async (e: any) => {
    const file = (e.target.files as FileList)[0]
    if (file) {
      try {
        const url = await uploadApi.uploadVideo(file)
        mediaList.value.push({
          type: 'video',
          url,
        })
      } catch (error: any) {
        ElMessage.error(error.message || '视频上传失败')
      }
    }
  }
  input.click()
}

// 选择岛屿
const chooseIsland = () => {
  ElMessage.info('岛屿选择功能待实现')
}

// 清除岛屿
const clearIsland = () => {
  selectedIsland.value = null
  form.value.islandId = null
}

// 预览媒体
const previewMedia = (index: number) => {
  const images = mediaList.value
    .filter((item) => item.type === 'image')
    .map((item) => item.url)
  // TODO: 实现图片预览
  ElMessage.info('图片预览功能待实现')
}

// 移除媒体
const removeMedia = (index: number) => {
  mediaList.value.splice(index, 1)
}

// 发布
const handlePublish = async () => {
  if (!canPublish.value) {
    return
  }

  publishing.value = true

  try {
    // 确定媒体类型
    let mediaType = 'text'
    if (mediaList.value.length > 0) {
      const hasImage = mediaList.value.some((item) => item.type === 'image')
      const hasVideo = mediaList.value.some((item) => item.type === 'video')
      if (hasImage && hasVideo) {
        mediaType = 'mixed'
      } else if (hasVideo) {
        mediaType = 'video'
      } else {
        mediaType = 'image'
      }
    }

    // 构建发布数据
    const publishData = {
      content: form.value.content.trim(),
      mediaType,
      mediaUrls: mediaList.value.map((item) => item.url),
      islandId: form.value.islandId,
    }

    // 调用发布接口
    await contentApi.createPost(publishData)

    ElMessage.success('发布成功')
    navigateTo('/')
  } catch (error: any) {
    ElMessage.error(error.message || '发布失败')
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped lang="scss">
.publish-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.publish-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 18px;
    font-weight: 500;
  }
}

.content-input {
  margin-bottom: 20px;
}

.media-preview {
  margin-bottom: 20px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.media-item {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.media-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.media-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.action-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.island-section {
  margin-top: 20px;
}

.island-card {
  .island-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .island-name {
    flex: 1;
    font-size: 16px;
  }
}
</style>

