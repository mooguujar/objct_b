<template>
  <el-card v-loading="loading">
    <template #header>
      <div class="card-header">
        <el-button type="primary" @click="router.back()">返回</el-button>
        <span>用户详情</span>
        <span></span>
      </div>
    </template>

    <div v-if="userDetail" class="user-detail">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="ID">{{ userDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ userDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userDetail.nickname }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar :src="userDetail.avatar" :size="60" />
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userDetail.status === 'active' ? 'success' : 'danger'">
            {{ userDetail.status === 'active' ? '正常' : '封禁' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="角色">{{ userDetail.role }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ userDetail.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userDetail.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ formatTime(userDetail.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录">
          {{ userDetail.lastLoginAt ? formatTime(userDetail.lastLoginAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="数据统计" :column="4" border style="margin-top: 20px">
        <el-descriptions-item label="动态数">{{ userDetail.postCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="关注数">{{ userDetail.followCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="粉丝数">{{ userDetail.followerCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="获赞数">{{ userDetail.likeCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="金币余额">{{ userDetail.coinBalance || 0 }}</el-descriptions-item>
      </el-descriptions>

      <div class="actions" style="margin-top: 20px">
        <el-button
          v-if="userDetail.status === 'active'"
          type="danger"
          @click="handleBan"
        >
          封禁用户
        </el-button>
        <el-button
          v-else
          type="success"
          @click="handleUnban"
        >
          解封用户
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user'

const route = useRoute()
const router = useRouter()

const userDetail = ref<any>(null)
const loading = ref(false)

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const loadUserDetail = async () => {
  loading.value = true
  try {
    const result = await userApi.getUserDetail(route.params.id)
    userDetail.value = result
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户详情失败')
  } finally {
    loading.value = false
  }
}

const handleBan = async () => {
  try {
    await ElMessageBox.confirm('确定要封禁该用户吗？', '提示', {
      type: 'warning',
    })
    await userApi.updateUserStatus(userDetail.value.id, 'banned')
    ElMessage.success('封禁成功')
    loadUserDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleUnban = async () => {
  try {
    await ElMessageBox.confirm('确定要解封该用户吗？', '提示', {
      type: 'warning',
    })
    await userApi.updateUserStatus(userDetail.value.id, 'active')
    ElMessage.success('解封成功')
    loadUserDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  loadUserDetail()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

