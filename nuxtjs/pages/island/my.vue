<template>
  <div class="island-my-page">
    <div class="page-header">
      <h1 class="page-title">我的岛屿</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        创建岛屿
      </el-button>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-section">
      <el-tag
        v-for="filter in filters"
        :key="filter.key"
        :type="currentFilter === filter.key ? 'primary' : 'info'"
        class="filter-tag"
        @click="selectFilter(filter.key)"
      >
        {{ filter.label }}
      </el-tag>
    </div>

    <!-- 岛屿列表 -->
    <div class="island-list">
      <IslandCard
        v-for="island in islandList"
        :key="island.id"
        :island="island"
      />
    </div>

    <el-empty v-if="islandList.length === 0 && !loading" description="还没有加入任何岛屿" />
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: 'auth',
})

const api = useApi()

const currentFilter = ref<'joined' | 'created'>('joined')
const islandList = ref<any[]>([])
const loading = ref(false)

const filters = [
  { key: 'joined', label: '已加入' },
  { key: 'created', label: '我创建的' },
]

const selectFilter = (key: 'joined' | 'created') => {
  currentFilter.value = key
  loadIslands()
}

const loadIslands = async () => {
  loading.value = true
  try {
    const result = await api.get('/islands/my', {
      params: {
        filter: currentFilter.value,
      },
    })
    islandList.value = result.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  ElMessage.info('创建岛屿功能开发中')
}

onMounted(() => {
  loadIslands()
})
</script>

<style scoped>
.island-my-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-tag {
  cursor: pointer;
}

.island-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>

