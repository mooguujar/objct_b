<template>
  <view class="island-my-page">
    <view class="page-header">
      <text class="page-title">我的岛屿</text>
      <view class="create-btn" @click="handleCreate">
        <u-icon name="plus" size="40" color="#3cc51f" />
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-section">
      <view
        v-for="filter in filters"
        :key="filter.key"
        class="filter-tag"
        :class="{ active: currentFilter === filter.key }"
        @click="selectFilter(filter.key)"
      >
        {{ filter.label }}
      </view>
    </view>

    <!-- 岛屿列表 -->
    <view class="island-list">
      <IslandCard
        v-for="island in islandList"
        :key="island.id"
        :island="island"
      />
    </view>

    <!-- 空状态 -->
    <view v-if="islandList.length === 0 && !loading" class="empty-state">
      <u-empty mode="data" text="还没有加入任何岛屿" />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-more">
      <u-loading-icon />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IslandCard from '@/components/IslandCard.vue'

const currentFilter = ref('joined')
const islandList = ref<any[]>([])
const loading = ref(false)

const filters = [
  { key: 'joined', label: '已加入' },
  { key: 'created', label: '我创建的' },
]

const selectFilter = (key: string) => {
  currentFilter.value = key
  loadIslands()
}

const loadIslands = async () => {
  loading.value = true
  try {
    // TODO: 调用接口
    // const result = await islandApi.getMyIslands({ filter: currentFilter.value })
    // islandList.value = result.list
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  uni.showToast({
    title: '创建岛屿功能开发中',
    icon: 'none',
  })
}

onMounted(() => {
  loadIslands()
})
</script>

<style lang="scss" scoped>
.island-my-page {
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20rpx;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;

  .page-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $u-main-color;
  }

  .create-btn {
    padding: 10rpx;
  }
}

.filter-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;

  .filter-tag {
    padding: 12rpx 24rpx;
    border-radius: 40rpx;
    background: #f5f5f5;
    color: $u-content-color;
    font-size: 28rpx;

    &.active {
      background: $u-primary;
      color: #fff;
    }
  }
}

.island-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 100rpx 0;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}
</style>

