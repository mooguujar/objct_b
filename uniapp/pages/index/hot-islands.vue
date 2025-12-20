<template>
  <view class="hot-islands-page">
    <!-- 为你推荐 -->
    <view class="recommend-section">
      <text class="section-title">为你推荐</text>
      <scroll-view scroll-x class="recommend-scroll">
        <view
          v-for="island in recommendIslands"
          :key="island.id"
          class="recommend-item"
          @click="handleIslandClick(island.id)"
        >
          <image :src="island.cover || '/static/default-cover.png'" class="recommend-cover" mode="aspectFill" />
          <text class="recommend-name">{{ island.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 分类筛选 -->
    <view class="category-section">
      <scroll-view scroll-x class="category-scroll">
        <view
          v-for="category in categories"
          :key="category"
          class="category-tag"
          :class="{ active: selectedCategory === category }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </view>
      </scroll-view>
    </view>

    <!-- 岛屿列表 -->
    <view class="island-list">
      <IslandCard
        v-for="island in islandList"
        :key="island.id"
        :island="island"
      />
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-more">
      <u-loading-icon />
      <text>加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IslandCard from '@/components/IslandCard.vue'

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
  // TODO: 调用接口加载热门岛屿
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const handleIslandClick = (id: string) => {
  uni.navigateTo({
    url: `/pages/island/detail?id=${id}`,
  })
}

onMounted(() => {
  loadIslands()
})
</script>

<style lang="scss" scoped>
.hot-islands-page {
  padding: 20rpx;
}

.recommend-section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $u-main-color;
    margin-bottom: 20rpx;
    display: block;
  }
}

.recommend-scroll {
  white-space: nowrap;
}

.recommend-item {
  display: inline-block;
  width: 200rpx;
  margin-right: 20rpx;
  vertical-align: top;
}

.recommend-cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: $u-border-radius-base;
  margin-bottom: 12rpx;
}

.recommend-name {
  font-size: 24rpx;
  color: $u-main-color;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.category-section {
  margin-bottom: 40rpx;
}

.category-scroll {
  white-space: nowrap;
}

.category-tag {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 40rpx;
  background: #f5f5f5;
  color: $u-content-color;
  font-size: 26rpx;

  &.active {
    background: $u-primary;
    color: #fff;
  }
}

.island-list {
  display: flex;
  flex-direction: column;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  color: $u-tips-color;
  font-size: $u-font-size-base;
}
</style>

