<template>
  <div class="bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.path"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="handleNavClick(item)"
    >
      <el-icon v-if="item.icon" :size="20">
        <component :is="item.icon" />
      </el-icon>
      <span class="nav-label">{{ item.label }}</span>
    </div>
    <div class="nav-item nav-item-center" @click="handleCreateClick">
      <el-icon :size="24"><Plus /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useStatistics } from '../composables/useStatistics'
import { House, Grid, Bell, User, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const { trackClick } = useStatistics()

const navItems = [
  { path: '/', label: '首页', icon: House },
  { path: '/islands', label: '岛屿', icon: Grid },
  { path: '/notifications', label: '通知', icon: Bell },
  { path: '/profile', label: '我的', icon: User }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleNavClick = (item: { path: string; label: string }) => {
  trackClick({
    elementId: `nav-${item.path}`,
    elementType: 'navigation',
    pagePath: route.path,
    content: { action: 'navigate', path: item.path }
  })
  router.push(item.path)
}

const handleCreateClick = () => {
  trackClick({
    elementId: 'nav-create',
    elementType: 'button',
    pagePath: route.path,
    content: { action: 'create-post' }
  })
  // TODO: 打开发布弹窗
  console.log('打开发布弹窗')
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 8px 0;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 16px;
  color: #909399;
  transition: color 0.2s;
  flex: 1;
}

.nav-item:hover {
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
}

.nav-item-center {
  position: relative;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #303133;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 8px;
  padding: 0;
}

.nav-item-center:hover {
  background: #409eff;
  color: #fff;
}

.nav-label {
  font-size: 12px;
}
</style>

