<template>
  <view class="index-container">
    <!-- 顶部导航栏 -->
    <view class="top-navbar">
      <view class="nav-tabs">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="nav-tab"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
          <view v-if="currentTab === tab.key" class="tab-indicator"></view>
        </view>
      </view>
      <view class="search-btn" @click="handleSearch">
        <u-icon name="search" size="40" color="#333" />
      </view>
    </view>

    <!-- 发现页内容 -->
    <view v-if="currentTab === 'discover'" class="content-area">
      <!-- 瀑布流容器 -->
      <view class="waterfall-container" v-if="postList.length > 0">
        <view
          v-for="(post, index) in postList"
          :key="post.id"
          class="waterfall-item"
          :style="{ width: columnWidth + 'px' }"
        >
          <PostCard :post="post" />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <u-empty mode="data" text="暂无内容" />
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-more">
        <u-loading-icon />
        <text>加载中...</text>
      </view>
    </view>

    <!-- 关注页内容 -->
    <view v-else-if="currentTab === 'following'" class="content-area">
      <view class="following-list">
        <FeedCard
          v-for="post in followingList"
          :key="post.id"
          :post="post"
        />
      </view>
      <view v-if="followingList.length === 0" class="empty-state">
        <u-empty mode="data" text="还没有关注任何人" />
      </view>
    </view>

    <!-- 热门岛屿页内容 -->
    <view v-else-if="currentTab === 'hot-islands'" class="content-area">
      <HotIslands />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { contentApi } from '@/api/content'
import PostCard from '@/components/PostCard.vue'
import FeedCard from '@/components/FeedCard.vue'
import HotIslands from '@/pages/index/hot-islands.vue'

const currentTab = ref('discover')
const postList = ref<any[]>([])
const followingList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

const tabs = [
  { key: 'following', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'hot-islands', label: '热门岛屿' },
]

// 计算瀑布流列宽
const columnWidth = computed(() => {
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.windowWidth
  const gap = 16 // 间距
  return (screenWidth - gap * 3) / 2 // 两列布局
})

// 切换标签
const switchTab = (key: string) => {
  currentTab.value = key
  page.value = 1
  hasMore.value = true
  
  if (key === 'discover') {
    postList.value = []
    loadPostList()
  } else if (key === 'following') {
    followingList.value = []
    loadFollowingPosts()
  }
}

// 加载内容列表
const loadPostList = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const result = await contentApi.getPostList({
      page: page.value,
      pageSize: 20,
      sort: 'latest',
    })

    if (result.list && result.list.length > 0) {
      postList.value = [...postList.value, ...result.list]
      page.value++
      hasMore.value = result.pagination.totalPages > result.pagination.page
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 加载关注动态
const loadFollowingPosts = async () => {
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    const result = await contentApi.getFollowingPosts({
      page: page.value,
      pageSize: 20,
    })

    if (result.list && result.list.length > 0) {
      followingList.value = [...followingList.value, ...result.list]
      page.value++
      hasMore.value = result.pagination.totalPages > result.pagination.page
    } else {
      hasMore.value = false
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onPullDownRefresh = () => {
  page.value = 1
  hasMore.value = true
  postList.value = []
  followingList.value = []
  
  if (currentTab.value === 'discover') {
    loadPostList().finally(() => {
      uni.stopPullDownRefresh()
    })
  } else if (currentTab.value === 'following') {
    loadFollowingPosts().finally(() => {
      uni.stopPullDownRefresh()
    })
  }
}

// 上拉加载
const onReachBottom = () => {
  if (currentTab.value === 'discover') {
    loadPostList()
  } else if (currentTab.value === 'following') {
    loadFollowingPosts()
  }
}

const handleSearch = () => {
  uni.navigateTo({
    url: '/pages/search/index',
  })
}

onMounted(() => {
  loadPostList()
})
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #d2f9e4, #e2f7ff, #f4f7ff);
  padding-bottom: 200rpx; // 为底部导航栏留空间
}

.top-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(to right, #d2f9e4, #e2f7ff, #f4f7ff);
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .nav-tabs {
    display: flex;
    gap: 60rpx;

    .nav-tab {
      position: relative;
      padding: 10rpx 0;

      .tab-text {
        font-size: 32rpx;
        color: #666;
        font-weight: normal;
      }

      &.active .tab-text {
        color: #000;
        font-weight: bold;
      }

      .tab-indicator {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4rpx;
        background: #3cc51f;
        border-radius: 2rpx;
      }
    }
  }

  .search-btn {
    padding: 10rpx;
  }
}

.content-area {
  padding: 20rpx;
}

.waterfall-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: space-between;
}

.waterfall-item {
  flex: 0 0 calc(50% - 8rpx);
  max-width: calc(50% - 8rpx);
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.empty-state {
  padding: 100rpx 0;
  text-align: center;
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
