<template>
  <view class="search-page">
    <u-navbar
      :autoBack="true"
      :fixed="true"
      :safeAreaInsetTop="true"
      bgColor="#fff"
      leftIconColor="#333"
    >
      <template #center>
        <view class="search-input-wrapper">
          <u-input
            v-model="keyword"
            placeholder="搜索内容、用户、岛屿"
            :clearable="true"
            :border="false"
            :customStyle="{ backgroundColor: '#f5f5f5', borderRadius: '32rpx', padding: '0 24rpx' }"
            @confirm="handleSearch"
          >
            <template #prefix>
              <u-icon name="search" color="#999" size="32"></u-icon>
            </template>
          </u-input>
        </view>
      </template>
      <template #right>
        <text class="search-btn" @click="handleSearch">搜索</text>
      </template>
    </u-navbar>

    <view class="content-wrapper">
      <!-- 搜索类型切换 -->
      <view class="tabs-section">
        <u-tabs
          :list="tabs"
          :current="currentTab"
          @change="handleTabChange"
          lineColor="#1f2937"
          activeColor="#1f2937"
          inactiveColor="#666"
        ></u-tabs>
      </view>

      <!-- 搜索结果 -->
      <view v-if="keyword && searched" class="results-section">
        <view v-if="loading" class="loading">
          <u-loading-icon />
        </view>
        <view v-else-if="results.length === 0" class="empty">
          <u-empty mode="data" text="暂无结果" />
        </view>
        <view v-else>
          <!-- 内容列表 -->
          <view v-if="currentTab === 0" class="posts-list">
            <PostCard
              v-for="post in results"
              :key="post.id"
              :post="post"
              @click="handlePostClick(post)"
            />
          </view>
          <!-- 用户列表 -->
          <view v-else-if="currentTab === 1" class="users-list">
            <view
              v-for="user in results"
              :key="user.id"
              class="user-item"
              @click="handleUserClick(user)"
            >
              <u-avatar :src="user.avatar || '/static/default-avatar.png'" size="80"></u-avatar>
              <view class="user-info">
                <text class="user-name">{{ user.nickname }}</text>
                <text v-if="user.bio" class="user-bio">{{ user.bio }}</text>
                <text class="user-stats">{{ user.followerCount || 0 }} 粉丝</text>
              </view>
              <u-button
                v-if="!user.isFollowing"
                size="mini"
                shape="circle"
                text="关注"
                color="#1f2937"
                @click.stop="handleFollow(user)"
              ></u-button>
              <u-button
                v-else
                size="mini"
                shape="circle"
                text="已关注"
                type="info"
                @click.stop="handleUnfollow(user)"
              ></u-button>
            </view>
          </view>
          <!-- 岛屿列表 -->
          <view v-else-if="currentTab === 2" class="islands-list">
            <view
              v-for="island in results"
              :key="island.id"
              class="island-item"
              @click="handleIslandClick(island)"
            >
              <image
                :src="island.avatar || '/static/default-island.png'"
                class="island-avatar"
                mode="aspectFill"
              />
              <view class="island-info">
                <text class="island-name">{{ island.name }}</text>
                <text v-if="island.description" class="island-desc">{{ island.description }}</text>
                <text class="island-stats">{{ island.memberCount || 0 }} 成员</text>
              </view>
              <u-button
                v-if="!island.isJoined"
                size="mini"
                shape="circle"
                :text="island.price > 0 ? `¥${island.price}` : '加入'"
                color="#1f2937"
                @click.stop="handleJoinIsland(island)"
              ></u-button>
              <u-button
                v-else
                size="mini"
                shape="circle"
                text="已加入"
                type="info"
              ></u-button>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
            <text class="load-more-text">加载更多</text>
          </view>
        </view>
      </view>

      <!-- 搜索历史/热门搜索 -->
      <view v-else class="suggestions-section">
        <view class="history-section">
          <view class="section-header">
            <text class="section-title">搜索历史</text>
            <text class="clear-btn" @click="clearHistory">清除</text>
          </view>
          <view v-if="searchHistory.length > 0" class="history-tags">
            <u-tag
              v-for="(item, index) in searchHistory"
              :key="index"
              :text="item"
              shape="circle"
              @click="handleHistoryClick(item)"
            ></u-tag>
          </view>
          <view v-else class="empty-history">
            <text class="empty-text">暂无搜索历史</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { searchApi } from '@/api/search'
import { userApi } from '@/api/user'
import PostCard from '@/components/PostCard.vue'

const keyword = ref('')
const currentTab = ref(0)
const searched = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)
const searchHistory = ref<string[]>([])

const tabs = [
  { name: '内容' },
  { name: '用户' },
  { name: '岛屿' },
]

onMounted(() => {
  loadSearchHistory()
})

const loadSearchHistory = () => {
  const history = uni.getStorageSync('searchHistory') || []
  searchHistory.value = history
}

const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  let history = uni.getStorageSync('searchHistory') || []
  history = history.filter((item: string) => item !== keyword)
  history.unshift(keyword)
  history = history.slice(0, 10) // 只保留最近10条
  uni.setStorageSync('searchHistory', history)
  searchHistory.value = history
}

const clearHistory = () => {
  uni.removeStorageSync('searchHistory')
  searchHistory.value = []
}

const handleHistoryClick = (item: string) => {
  keyword.value = item
  handleSearch()
}

const handleTabChange = (index: number) => {
  currentTab.value = index
  if (keyword.value && searched.value) {
    page.value = 1
    fetchResults(1)
  }
}

const handleSearch = () => {
  if (!keyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
    return
  }
  saveSearchHistory(keyword.value)
  searched.value = true
  page.value = 1
  fetchResults(1)
}

const fetchResults = async (pageNum: number = 1) => {
  try {
    loading.value = true
    let res
    if (currentTab.value === 0) {
      res = await searchApi.searchPosts(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    } else if (currentTab.value === 1) {
      res = await searchApi.searchUsers(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    } else {
      res = await searchApi.searchIslands(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    }

    if (res.code === 200 && res.data) {
      if (pageNum === 1) {
        results.value = res.data.list
      } else {
        results.value.push(...res.data.list)
      }
      hasMore.value = res.data.pagination.page < res.data.pagination.totalPages
    }
  } catch (error) {
    console.error('搜索失败', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    page.value++
    fetchResults(page.value)
  }
}

const handlePostClick = (post: any) => {
  uni.navigateTo({
    url: `/pages/post/detail?id=${post.id}`,
  })
}

const handleUserClick = (user: any) => {
  uni.navigateTo({
    url: `/pages/user/${user.id}`,
  })
}

const handleIslandClick = (island: any) => {
  uni.navigateTo({
    url: `/pages/island/${island.id}`,
  })
}

const handleFollow = async (user: any) => {
  try {
    await userApi.followUser(user.id)
    user.isFollowing = true
    uni.showToast({
      title: '关注成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '关注失败',
      icon: 'error',
    })
  }
}

const handleUnfollow = async (user: any) => {
  try {
    await userApi.unfollowUser(user.id)
    user.isFollowing = false
    uni.showToast({
      title: '取消关注成功',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: '取消关注失败',
      icon: 'error',
    })
  }
}

const handleJoinIsland = (island: any) => {
  // TODO: 实现加入岛屿功能
  uni.showToast({
    title: '功能开发中',
    icon: 'none',
  })
}
</script>

<style lang="scss" scoped>
.search-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.search-input-wrapper {
  flex: 1;
  margin: 0 20rpx;
}

.search-btn {
  font-size: 28rpx;
  color: #1f2937;
  padding-right: 20rpx;
}

.content-wrapper {
  margin-top: 88rpx;
}

.tabs-section {
  background-color: #fff;
  position: sticky;
  top: 88rpx;
  z-index: 10;
}

.results-section {
  padding: 20rpx;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 80rpx 0;
}

.empty {
  padding: 80rpx 0;
}

.posts-list {
  // PostCard样式由组件自己控制
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.user-bio {
  font-size: 24rpx;
  color: #666;
}

.user-stats {
  font-size: 24rpx;
  color: #999;
}

.islands-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.island-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.island-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
}

.island-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.island-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.island-desc {
  font-size: 24rpx;
  color: #666;
}

.island-stats {
  font-size: 24rpx;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 32rpx;
  color: #909399;
}

.load-more-text {
  font-size: 28rpx;
}

.suggestions-section {
  padding: 20rpx;
}

.history-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.clear-btn {
  font-size: 24rpx;
  color: #999;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.empty-history {
  padding: 40rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #999;
}
</style>

