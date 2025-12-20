<template>
  <div class="statistics-dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.userCount || 0 }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.postCount || 0 }}</div>
            <div class="stat-label">总内容数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.islandCount || 0 }}</div>
            <div class="stat-label">总岛屿数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.revenue || 0 }}</div>
            <div class="stat-label">总收入</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statisticsApi } from '@/api/statistics'

const stats = ref<any>({})

const loadStats = async () => {
  try {
    const result = await statisticsApi.getDashboardStats()
    stats.value = result || {}
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

onMounted(() => loadStats())
</script>

<style scoped>
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 14px;
  color: #999;
}
</style>

