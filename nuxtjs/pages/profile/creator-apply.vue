<template>
  <div class="creator-apply-container">
    <!-- 顶部导航栏 -->
    <div class="header-bar">
      <div class="header-content">
        <el-icon class="back-icon" @click="handleBack"><ArrowLeft /></el-icon>
        <span class="header-title">申请入驻</span>
        <el-button
          type="primary"
          :disabled="!canSubmit"
          class="submit-btn"
          @click="handleSubmit"
        >
          提交
        </el-button>
      </div>
    </div>

    <!-- 用户信息区 -->
    <div class="user-info-section">
      <el-avatar
        :src="userInfo.avatar || '/default-avatar.png'"
        :size="60"
      />
      <div class="user-details">
        <span class="user-name">{{ userInfo.nickname || userInfo.username }}</span>
        <span class="user-desc">认证后, 成为创作者</span>
      </div>
    </div>

    <!-- 创作者权益展示 -->
    <div class="benefits-section">
      <h2 class="section-title">创作者权益</h2>
      <div class="benefits-grid">
        <div class="benefit-card benefit-yellow">
          <el-icon class="benefit-icon"><Star /></el-icon>
          <div class="benefit-content">
            <span class="benefit-title">平台认证</span>
            <span class="benefit-desc">专属V+认证标识</span>
          </div>
        </div>
        <div class="benefit-card benefit-green">
          <el-icon class="benefit-icon"><House /></el-icon>
          <div class="benefit-content">
            <span class="benefit-title">开启岛屿</span>
            <span class="benefit-desc">成为岛主</span>
          </div>
        </div>
        <div class="benefit-card benefit-blue">
          <el-icon class="benefit-icon"><Document /></el-icon>
          <div class="benefit-content">
            <span class="benefit-title">动态发布</span>
            <span class="benefit-desc">流量扶持</span>
          </div>
        </div>
        <div class="benefit-card benefit-pink">
          <el-icon class="benefit-icon"><ChatDotRound /></el-icon>
          <div class="benefit-content">
            <span class="benefit-title">专属客服</span>
            <span class="benefit-desc">1对1专属客服</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 上传截图区域 -->
    <div class="upload-section">
      <div class="section-header">
        <h2 class="section-title">
          上传截图
          <span class="upload-count">({{ uploadedImages.length }}/9)</span>
        </h2>
        <span class="privacy-note">以下资料仅供内部审核, 绝不外泄</span>
      </div>
      
      <div class="upload-area">
        <el-upload
          v-model:file-list="fileList"
          :auto-upload="false"
          :limit="9"
          list-type="picture-card"
          :on-exceed="handleExceed"
          :on-change="handleImageChange"
          :on-remove="handleImageRemove"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </div>
      
      <p class="upload-tip">
        上传自媒体平台个人主页链接或作品链接 (微博、快手、抖音、B站、小红书、头条等) 最多可上传9张照片, 至少上传1张
      </p>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 社交平台选择 -->
    <div class="platform-section">
      <h2 class="section-title">请选择您主要活跃的社交平台</h2>
      <div class="platform-tags">
        <el-tag
          v-for="platform in platforms"
          :key="platform"
          :type="selectedPlatforms.includes(platform) ? 'success' : 'info'"
          class="platform-tag"
          @click="togglePlatform(platform)"
        >
          {{ platform }}
        </el-tag>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 社媒账号填写 -->
    <div class="account-section">
      <h2 class="section-title">
        请填写您的社媒平台账号
        <span class="title-hint">(如抖音号、快手号、B站号等)</span>
      </h2>
      <el-input
        v-model="socialAccount"
        class="account-input"
        placeholder="请填写您的社媒平台账号"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowLeft,
  Star,
  House,
  Document,
  ChatDotRound,
  Plus,
} from '@element-plus/icons-vue'
import { useUserApi } from '~/composables/useUserApi'
import { useCreatorApi } from '~/composables/useCreatorApi'
import { useUserStore } from '~/store/user'
import { ElMessage, UploadFile } from 'element-plus'
import type { UploadProps } from 'element-plus'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const userApi = useUserApi()
const creatorApi = useCreatorApi()
const userStore = useUserStore()

const userInfo = ref<any>({
  nickname: '',
  username: '',
  avatar: '',
})

const uploadedImages = ref<string[]>([])
const fileList = ref<UploadFile[]>([])
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
    const data = await userApi.getCurrentUser()
    userInfo.value = data
  } catch (error: any) {
    console.error('加载用户信息失败:', error)
  }
}

// 返回
const handleBack = () => {
  navigateTo('/profile')
}

// 图片变化
const handleImageChange = (file: UploadFile) => {
  // TODO: 实际上传图片到服务器
  // 这里应该调用上传接口
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        uploadedImages.value.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file.raw)
  }
}

// 移除图片
const handleImageRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    uploadedImages.value.splice(index, 1)
  }
}

// 超出限制
const handleExceed = () => {
  ElMessage.warning('最多只能上传9张图片')
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
    ElMessage.warning('请完成必填项')
    return
  }

  try {
    // TODO: 实际上传图片到OSS
    // 这里需要先上传图片，获取URL列表
    const qualificationUrls = uploadedImages.value // 应该是上传后的URL数组

    await creatorApi.apply({
      qualificationUrls,
      bio: socialAccount.value,
    })

    ElMessage.success('申请已提交')
    setTimeout(() => {
      navigateTo('/profile')
    }, 1500)
  } catch (error: any) {
    ElMessage.error(error.message || '提交失败')
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
  padding-bottom: 40px;
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
  padding: 16px 20px;
  position: relative;
  max-width: 800px;
  margin: 0 auto;
}

.back-icon {
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.submit-btn {
  background-color: #1f2937;
  border: none;
}

.user-info-section {
  display: flex;
  align-items: center;
  padding: 30px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.user-details {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.user-desc {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.benefits-section {
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.benefit-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
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
  font-size: 44px;
  margin-right: 8px;
}

.benefit-content {
  display: flex;
  flex-direction: column;
}

.benefit-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.benefit-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.divider {
  height: 8px;
  background-color: #f7f8fa;
  margin: 24px 0;
}

.upload-section {
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.upload-count {
  font-size: 16px;
  font-weight: normal;
  color: #909399;
}

.privacy-note {
  font-size: 12px;
  color: #c0c4cc;
}

.upload-area {
  margin-bottom: 12px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.platform-section {
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.platform-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.platform-tag {
  cursor: pointer;
}

.account-section {
  padding: 0 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title-hint {
  font-size: 14px;
  font-weight: normal;
  color: #c0c4cc;
}

.account-input {
  margin-top: 16px;
}
</style>

