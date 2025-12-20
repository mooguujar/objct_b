<template>
  <view class="publish-page">
    <u-navbar
      title="发布"
      :autoBack="true"
      :fixed="true"
      :safeAreaInsetTop="true"
      leftIconColor="#333"
      titleStyle="color: #333; font-weight: 500;"
    >
      <template #right>
        <u-button
          size="mini"
          shape="circle"
          text="发布"
          color="#1f2937"
          :disabled="!canPublish"
          :loading="publishing"
          @click="handlePublish"
        ></u-button>
      </template>
    </u-navbar>

    <view class="content-wrapper">
      <!-- 文本输入区 -->
      <view class="text-input-section">
        <u-textarea
          v-model="form.content"
          placeholder="分享你的想法..."
          :maxlength="2000"
          :showWordLimit="true"
          :autoHeight="true"
          :border="false"
          :customStyle="textareaStyle"
        ></u-textarea>
      </view>

      <!-- 媒体预览区 -->
      <view v-if="mediaList.length > 0" class="media-preview-section">
        <view class="media-grid">
          <view
            v-for="(item, index) in mediaList"
            :key="index"
            class="media-item"
          >
            <image
              v-if="item.type === 'image'"
              :src="item.url"
              mode="aspectFill"
              class="media-image"
              @click="previewMedia(index)"
            />
            <video
              v-else-if="item.type === 'video'"
              :src="item.url"
              controls
              class="media-video"
            />
            <view class="delete-btn" @click.stop="removeMedia(index)">
              <u-icon name="close-circle-fill" color="#fff" size="40"></u-icon>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮区 -->
      <view class="action-section">
        <view class="action-buttons">
          <view class="action-btn" @click="chooseImage">
            <u-icon name="image" size="48" color="#666"></u-icon>
            <text class="action-label">图片</text>
          </view>
          <view class="action-btn" @click="chooseVideo">
            <u-icon name="play-circle" size="48" color="#666"></u-icon>
            <text class="action-label">视频</text>
          </view>
          <view v-if="!isPersonalPost" class="action-btn" @click="chooseIsland">
            <u-icon name="home" size="48" color="#666"></u-icon>
            <text class="action-label">岛屿</text>
          </view>
        </view>
      </view>

      <!-- 岛屿选择 -->
      <view v-if="selectedIsland" class="island-section">
        <view class="island-card">
          <image
            :src="selectedIsland.avatar || '/static/default-island.png'"
            class="island-avatar"
          />
          <text class="island-name">{{ selectedIsland.name }}</text>
          <u-icon
            name="close-circle"
            size="32"
            color="#999"
            @click="clearIsland"
          ></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from 'vue'
import { contentApi } from '@/api/content'
import { uploadApi } from '@/api/upload'

const form = ref({
  content: '',
  islandId: null as bigint | null,
})

const mediaList = ref<Array<{ type: string; url: string; file?: any }>>([])
const selectedIsland = ref<any>(null)
const publishing = ref(false)
const isPersonalPost = ref(true) // 是否个人动态（默认true）

const textareaStyle = {
  padding: '20rpx',
  fontSize: '28rpx',
  minHeight: '200rpx',
}

const canPublish = computed(() => {
  return (
    (form.value.content.trim().length > 0 || mediaList.value.length > 0) &&
    !publishing.value
  )
})

onLoad((options: any) => {
  // 从发布弹窗传递的类型：personal 或 island
  if (options.type === 'island') {
    isPersonalPost.value = false
  }
  if (options.islandId) {
    form.value.islandId = BigInt(options.islandId)
    // TODO: 加载岛屿信息
  }
})

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - mediaList.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '处理中...' })
      try {
        for (const filePath of res.tempFilePaths) {
          // 压缩图片
          const compressed = await compressImage(filePath)
          // 上传图片
          const uploadRes = await uploadApi.uploadImage(compressed)
          mediaList.value.push({
            type: 'image',
            url: uploadRes.data.url,
          })
        }
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '图片处理失败',
          icon: 'error',
        })
        console.error('图片处理失败', error)
      }
    },
  })
}

// 选择视频
const chooseVideo = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    compressed: true,
    success: async (res) => {
      uni.showLoading({ title: '上传中...' })
      try {
        // 上传视频
        const uploadRes = await uploadApi.uploadVideo(res.tempFilePath)
        mediaList.value.push({
          type: 'video',
          url: uploadRes.data.url,
        })
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '视频上传失败',
          icon: 'error',
        })
        console.error('视频上传失败', error)
      }
    },
  })
}

// 压缩图片
const compressImage = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality: 80,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

// 选择岛屿
const chooseIsland = () => {
  // TODO: 跳转到岛屿选择页面
  uni.showToast({
    title: '岛屿选择功能待实现',
    icon: 'none',
  })
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
  uni.previewImage({
    urls: images,
    current: index,
  })
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
  uni.showLoading({ title: '发布中...' })

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
      islandId: form.value.islandId ? form.value.islandId.toString() : null,
    }

    // 调用发布接口
    await contentApi.createPost(publishData)

    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    })

    // 延迟返回，确保提示显示
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '发布失败',
      icon: 'error',
    })
    console.error('发布失败', error)
  } finally {
    publishing.value = false
  }
}
</script>

<style lang="scss" scoped>
.publish-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 20rpx;
  margin-top: 88rpx;
}

.text-input-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.media-preview-section {
  margin-bottom: 20rpx;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.media-item {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #f0f0f0;
}

.media-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}

.action-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.action-buttons {
  display: flex;
  gap: 60rpx;
  justify-content: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.action-label {
  font-size: 24rpx;
  color: #666;
}

.island-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
}

.island-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.island-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
}

.island-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
</style>

