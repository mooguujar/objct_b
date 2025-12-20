<template>
  <view class="creator-apply-container">
    <!-- 顶部导航栏 -->
    <view class="header-bar">
      <view class="header-content">
        <u-icon name="arrow-left" size="48" color="#333" @click="handleBack" />
        <text class="header-title">申请入驻</text>
        <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
          <text class="submit-text">提交</text>
        </view>
      </view>
    </view>

    <!-- 用户信息区 -->
    <view class="user-info-section">
      <image
        :src="userInfo.avatar || '/static/default-avatar.png'"
        class="user-avatar"
        mode="aspectFill"
      />
      <view class="user-details">
        <text class="user-name">{{ userInfo.nickname || userInfo.username }}</text>
        <text class="user-desc">认证后, 成为创作者</text>
      </view>
    </view>

    <!-- 创作者权益展示 -->
    <view class="benefits-section">
      <text class="section-title">创作者权益</text>
      <view class="benefits-grid">
        <view class="benefit-card benefit-yellow">
          <view class="benefit-icon">
            <u-icon name="vip" size="44" color="#f59e0b" />
          </view>
          <view class="benefit-content">
            <text class="benefit-title">平台认证</text>
            <text class="benefit-desc">专属V+认证标识</text>
          </view>
        </view>
        <view class="benefit-card benefit-green">
          <view class="benefit-icon">
            <u-icon name="home" size="44" color="#10b981" />
          </view>
          <view class="benefit-content">
            <text class="benefit-title">开启岛屿</text>
            <text class="benefit-desc">成为岛主</text>
          </view>
        </view>
        <view class="benefit-card benefit-blue">
          <view class="benefit-icon">
            <u-icon name="file-text" size="44" color="#3b82f6" />
          </view>
          <view class="benefit-content">
            <text class="benefit-title">动态发布</text>
            <text class="benefit-desc">流量扶持</text>
          </view>
        </view>
        <view class="benefit-card benefit-pink">
          <view class="benefit-icon">
            <u-icon name="chat" size="44" color="#ec4899" />
          </view>
          <view class="benefit-content">
            <text class="benefit-title">专属客服</text>
            <text class="benefit-desc">1对1专属客服</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="divider"></view>

    <!-- 上传截图区域 -->
    <view class="upload-section">
      <view class="section-header">
        <text class="section-title">上传截图</text>
        <text class="upload-count">({{ uploadedImages.length }}/9)</text>
        <text class="privacy-note">以下资料仅供内部审核, 绝不外泄</text>
      </view>
      
      <view class="upload-area">
        <view class="upload-grid">
          <view
            v-for="(image, index) in uploadedImages"
            :key="index"
            class="upload-item"
          >
            <image :src="image" mode="aspectFill" class="upload-image" />
            <view class="delete-btn" @click="removeImage(index)">
              <u-icon name="close" size="32" color="#fff" />
            </view>
          </view>
          <view
            v-if="uploadedImages.length < 9"
            class="upload-item upload-placeholder"
            @click="handleUploadImage"
          >
            <u-icon name="plus" size="48" color="#c0c4cc" />
          </view>
        </view>
      </view>
      
      <text class="upload-tip">
        上传自媒体平台个人主页链接或作品链接 (微博、快手、抖音、B站、小红书、头条等) 最多可上传9张照片, 至少上传1张
      </text>
    </view>

    <!-- 分隔线 -->
    <view class="divider"></view>

    <!-- 社交平台选择 -->
    <view class="platform-section">
      <text class="section-title">请选择您主要活跃的社交平台</text>
      <view class="platform-tags">
        <view
          v-for="platform in platforms"
          :key="platform"
          class="platform-tag"
          :class="{ active: selectedPlatforms.includes(platform) }"
          @click="togglePlatform(platform)"
        >
          <text class="tag-text">{{ platform }}</text>
        </view>
      </view>
    </view>

    <!-- 分隔线 -->
    <view class="divider"></view>

    <!-- 社媒账号填写 -->
    <view class="account-section">
      <text class="section-title">
        请填写您的社媒平台账号
        <text class="title-hint">(如抖音号、快手号、B站号等)</text>
      </text>
      <input
        v-model="socialAccount"
        class="account-input"
        placeholder="请填写您的社媒平台账号"
        placeholder-style="color: #909399"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { creatorApi } from '@/api/creator'
import { userApi } from '@/api/user'

const userStore = useUserStore()

const userInfo = ref<any>({
  nickname: '',
  username: '',
  avatar: '',
})

const uploadedImages = ref<string[]>([])
const selectedPlatforms = ref<string[]>([])
const socialAccount = ref('')

const platforms = ['抖音', '快手', 'b站', '小红书', '其他']

// 是否可以提交
const canSubmit = computed(() => {
  return uploadedImages.value.length >= 1 && socialAccount.value.trim().length > 0
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await userApi.getCurrentUser()
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  }
}

// 返回
const handleBack = () => {
  uni.navigateBack()
}

// 上传图片
const handleUploadImage = () => {
  const remaining = 9 - uploadedImages.value.length
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      // TODO: 上传图片到服务器
      // 这里先使用本地路径，实际应该上传到OSS后使用返回的URL
      const tempPaths = res.tempFilePaths
      
      // 模拟上传过程
      for (const tempPath of tempPaths) {
        // 实际应该调用上传接口
        // const uploadRes = await uploadApi.uploadImage(tempPath)
        // uploadedImages.value.push(uploadRes.data.url)
        
        // 临时使用本地路径
        uploadedImages.value.push(tempPath)
      }
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none',
      })
    },
  })
}

// 删除图片
const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1)
}

// 切换平台
const togglePlatform = (platform: string) => {
  const index = selectedPlatforms.value.indexOf(platform)
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1)
  } else {
    selectedPlatforms.value.push(platform)
  }
}

// 提交申请
const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请完成必填项',
      icon: 'none',
    })
    return
  }

  try {
    uni.showLoading({ title: '提交中...' })
    
    // TODO: 实际上传图片到OSS
    // 这里需要先上传图片，获取URL列表
    const qualificationUrls = uploadedImages.value // 应该是上传后的URL数组

    const res = await creatorApi.apply({
      qualificationUrls,
      bio: socialAccount.value,
    })

    if (res.code === 200) {
      uni.hideLoading()
      uni.showToast({
        title: '申请已提交',
        icon: 'success',
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none',
    })
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.creator-apply-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40rpx;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #eafcf8 0%, #fff 100%);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  position: relative;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
}

.submit-btn {
  background-color: #1f2937;
  color: #fff;
  padding: 12rpx 40rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  font-weight: 600;

  &.disabled {
    background-color: #d1d5db;
  }
}

.user-info-section {
  display: flex;
  align-items: center;
  padding: 48rpx 32rpx 32rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.user-details {
  margin-left: 32rpx;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.user-desc {
  font-size: 28rpx;
  color: #909399;
  margin-top: 8rpx;
}

.benefits-section {
  padding: 0 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 32rpx;
}

.benefit-card {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 24rpx;
}

.benefit-yellow {
  background-color: #fff6e5;
}

.benefit-green {
  background-color: #e8f8f1;
}

.benefit-blue {
  background-color: #eaf6ff;
}

.benefit-pink {
  background-color: #fcf1f3;
}

.benefit-icon {
  margin-right: 16rpx;
}

.benefit-content {
  display: flex;
  flex-direction: column;
}

.benefit-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.benefit-desc {
  font-size: 24rpx;
  color: #909399;
  margin-top: 4rpx;
}

.divider {
  height: 16rpx;
  background-color: #f7f8fa;
  margin: 48rpx 0;
}

.upload-section {
  padding: 0 32rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.upload-count {
  font-size: 32rpx;
  font-weight: normal;
  color: #909399;
}

.privacy-note {
  margin-left: auto;
  font-size: 24rpx;
  color: #c0c4cc;
}

.upload-area {
  margin-top: 32rpx;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.upload-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16rpx;
  overflow: hidden;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  border: 2rpx dashed #d1d5db;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-tip {
  font-size: 24rpx;
  color: #909399;
  margin-top: 24rpx;
  line-height: 1.6;
}

.platform-section {
  padding: 0 32rpx;
}

.platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-top: 32rpx;
}

.platform-tag {
  padding: 16rpx 48rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 50rpx;
  background-color: #f9fafb;

  &.active {
    background-color: #10b981;
    border-color: #10b981;
  }
}

.tag-text {
  font-size: 28rpx;
  color: #333;
}

.platform-tag.active .tag-text {
  color: #fff;
}

.account-section {
  padding: 0 32rpx;
}

.title-hint {
  font-size: 28rpx;
  font-weight: normal;
  color: #c0c4cc;
}

.account-input {
  width: 100%;
  background-color: #f3f4f6;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 32rpx;
  font-size: 28rpx;
  color: #333;
}
</style>

