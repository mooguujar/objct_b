<template>
  <div class="search-page">
    <el-card class="search-card">
      <!-- 搜索框 -->
      <div class="search-header">
        <el-input
          v-model="keyword"
          placeholder="搜索内容、用户、岛屿"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <!-- 搜索类型切换 -->
      <el-tabs v-model="currentTab" @tab-change="handleTabChange">
        <el-tab-pane label="内容" name="posts"></el-tab-pane>
        <el-tab-pane label="用户" name="users"></el-tab-pane>
        <el-tab-pane label="岛屿" name="islands"></el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 搜索结果 -->
    <div v-if="keyword && searched" class="results-section">
      <el-skeleton v-if="loading" :rows="5" animated />
      <el-empty v-else-if="results.length === 0" description="暂无结果" />
      <div v-else>
        <!-- 内容列表 -->
        <div v-if="currentTab === 'posts'" class="posts-list">
          <PostCard
            v-for="post in results"
            :key="post.id"
            :post="post"
            @click="handlePostClick(post)"
          />
        </div>
        <!-- 用户列表 -->
        <div v-else-if="currentTab === 'users'" class="users-list">
          <el-card
            v-for="user in results"
            :key="user.id"
            class="user-item"
            shadow="hover"
            @click="handleUserClick(user)"
          >
            <div class="user-content">
              <el-avatar :src="user.avatar || '/default-avatar.png'" :size="40" />
              <div class="user-info">
                <span class="user-name">{{ user.nickname }}</span>
                <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
                <span class="user-stats">{{ user.followerCount || 0 }} 粉丝</span>
              </div>
              <el-button
                v-if="!user.isFollowing"
                type="primary"
                size="small"
                @click.stop="handleFollow(user)"
              >
                关注
              </el-button>
              <el-button
                v-else
                size="small"
                @click.stop="handleUnfollow(user)"
              >
                已关注
              </el-button>
            </div>
          </el-card>
        </div>
        <!-- 岛屿列表 -->
        <div v-else-if="currentTab === 'islands'" class="islands-list">
          <el-card
            v-for="island in results"
            :key="island.id"
            class="island-item"
            shadow="hover"
            @click="handleIslandClick(island)"
          >
            <div class="island-content">
              <el-avatar :src="island.avatar || '/default-island.png'" :size="60" shape="square" />
              <div class="island-info">
                <span class="island-name">{{ island.name }}</span>
                <p v-if="island.description" class="island-desc">{{ island.description }}</p>
                <span class="island-stats">{{ island.memberCount || 0 }} 成员</span>
              </div>
              <el-button
                v-if="!island.isJoined"
                type="primary"
                size="small"
                @click.stop="handleJoinIsland(island)"
              >
                {{ island.price > 0 ? `¥${island.price}` : '加入' }}
              </el-button>
              <el-button
                v-else
                size="small"
                @click.stop
              >
                已加入
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore && !loading" class="load-more">
          <el-button @click="loadMore">加载更多</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索历史/热门搜索 -->
    <div v-else class="suggestions-section">
      <el-card class="history-card">
        <template #header>
          <div class="card-header">
            <span>搜索历史</span>
            <el-button text type="danger" @click="clearHistory">清除</el-button>
          </div>
        </template>
        <div v-if="searchHistory.length > 0" class="history-tags">
          <el-tag
            v-for="(item, index) in searchHistory"
            :key="index"
            @click="handleHistoryClick(item)"
            style="cursor: pointer; margin: 4px;"
          >
            {{ item }}
          </el-tag>
        </div>
        <el-empty v-else description="暂无搜索历史" :image-size="100" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useCookie } from '#imports'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useSearchApi } from '~/composables/useSearchApi'
import { useUserApi } from '~/composables/useUserApi'

definePageMeta({
  layout: 'default',
})

const searchApi = useSearchApi()
const userApi = useUserApi()

const keyword = ref('')
const currentTab = ref('posts')
const searched = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const page = ref(1)
const hasMore = ref(true)
const searchHistory = ref<string[]>([])

const searchHistoryCookie = useCookie<string[]>('searchHistory', {
  default: () => [],
})

onMounted(() => {
  loadSearchHistory()
})

const loadSearchHistory = () => {
  searchHistory.value = searchHistoryCookie.value || []
}

const saveSearchHistory = (keyword: string) => {
  if (!keyword.trim()) return
  let history = searchHistoryCookie.value || []
  history = history.filter((item: string) => item !== keyword)
  history.unshift(keyword)
  history = history.slice(0, 10)
  searchHistoryCookie.value = history
  searchHistory.value = history
}

const clearHistory = () => {
  searchHistoryCookie.value = []
  searchHistory.value = []
  ElMessage.success('已清除搜索历史')
}

const handleHistoryClick = (item: string) => {
  keyword.value = item
  handleSearch()
}

const handleTabChange = () => {
  if (keyword.value && searched.value) {
    page.value = 1
    fetchResults(1)
  }
}

const handleSearch = () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
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
    let result
    if (currentTab.value === 'posts') {
      result = await searchApi.searchPosts(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    } else if (currentTab.value === 'users') {
      result = await searchApi.searchUsers(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    } else {
      result = await searchApi.searchIslands(keyword.value, {
        page: pageNum,
        pageSize: 20,
      })
    }

    if (pageNum === 1) {
      results.value = result.list
    } else {
      results.value.push(...result.list)
    }
    hasMore.value = result.pagination.page < result.pagination.totalPages
  } catch (error: any) {
    ElMessage.error(error.message || '搜索失败')
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
  navigateTo(`/post/${post.id}`)
}

const handleUserClick = (user: any) => {
  navigateTo(`/user/${user.id}`)
}

const handleIslandClick = (island: any) => {
  navigateTo(`/island/${island.id}`)
}

const handleFollow = async (user: any) => {
  try {
    await userApi.followUser(user.id)
    user.isFollowing = true
    ElMessage.success('关注成功')
  } catch (error: any) {
    ElMessage.error(error.message || '关注失败')
  }
}

const handleUnfollow = async (user: any) => {
  try {
    await userApi.unfollowUser(user.id)
    user.isFollowing = false
    ElMessage.success('取消关注成功')
  } catch (error: any) {
    ElMessage.error(error.message || '取消关注失败')
  }
}

const handleJoinIsland = (island: any) => {
  ElMessage.info('功能开发中')
}
</script>

<style scoped lang="scss">
.search-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-card {
  margin-bottom: 20px;
}

.search-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.results-section {
  margin-top: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.users-list,
.islands-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-item,
.island-item {
  cursor: pointer;
}

.user-content,
.island-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info,
.island-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name,
.island-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.user-bio,
.island-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.user-stats,
.island-stats {
  font-size: 12px;
  color: #999;
}

.load-more {
  text-align: center;
  padding: 20px;
}

.suggestions-section {
  margin-top: 20px;
}

.history-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

