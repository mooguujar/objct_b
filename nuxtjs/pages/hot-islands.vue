<template>
  <div class="hot-islands-page">
    <!-- 为你推荐 -->
    <div class="recommend-section">
      <h2 class="section-title">为你推荐</h2>
      <div class="recommend-scroll">
        <div
          v-for="island in recommendIslands"
          :key="island.id"
          class="recommend-item"
          @click="handleIslandClick(island.id)"
        >
          <img :src="island.cover || '/default-cover.png'" class="recommend-cover" alt="" />
          <span class="recommend-name">{{ island.name }}</span>
        </div>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-section">
      <div class="category-scroll">
        <el-tag
          v-for="category in categories"
          :key="category"
          :type="selectedCategory === category ? 'primary' : 'info'"
          class="category-tag"
          @click="selectCategory(category)"
        >
          {{ category }}
        </el-tag>
      </div>
    </div>

    <!-- 岛屿列表 -->
    <div class="island-list">
      <IslandCard
        v-for="island in islandList"
        :key="island.id"
        :island="island"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()

const recommendIslands = ref<any[]>([])
const islandList = ref<any[]>([])
const loading = ref(false)
const selectedCategory = ref<string>('')

const categories = ['全部', '财经', '体育', '颜值', '游戏', '美食', '旅行', '科技']

const selectCategory = (category: string) => {
  selectedCategory.value = category === '全部' ? '' : category
  loadIslands()
}

const loadIslands = async () => {
  loading.value = true
  try {
    const result = await api.get('/islands/hot', {
      params: {
        category: selectedCategory.value || undefined,
      },
    })
    islandList.value = result
    recommendIslands.value = result.slice(0, 5)
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleIslandClick = (id: string) => {
  navigateTo(`/island/${id}`)
}

onMounted(() => {
  loadIslands()
})
</script>

<style scoped>
.hot-islands-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.recommend-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.recommend-scroll {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.recommend-item {
  flex-shrink: 0;
  width: 150px;
  cursor: pointer;
}

.recommend-cover {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  margin-bottom: 8px;
  object-fit: cover;
}

.recommend-name {
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.category-section {
  margin-bottom: 30px;
}

.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.category-tag {
  cursor: pointer;
  flex-shrink: 0;
}

.island-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>

