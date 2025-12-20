<template>
  <view class="tabbar-container">
    <view class="tabbar-content">
      <view
        v-for="item in tabList"
        :key="item.path"
        class="tabbar-item"
        :class="{ active: currentPath === item.path }"
        @click="switchTab(item.path)"
      >
        <u-icon :name="item.icon" :size="44" :color="currentPath === item.path ? item.activeColor : item.color" />
        <text class="tabbar-text">{{ item.text }}</text>
      </view>
    </view>
    <!-- 中央悬浮加号按钮 -->
    <view class="publish-btn" @click="handlePublish">
      <u-icon name="plus" size="32" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentPath = ref('')

const tabList = [
  {
    path: '/pages/index/index',
    text: '首页',
    icon: 'home',
    color: '#7A7E83',
    activeColor: '#3cc51f',
  },
  {
    path: '/pages/island/my',
    text: '岛屿',
    icon: 'grid',
    color: '#7A7E83',
    activeColor: '#3cc51f',
  },
  {
    path: '/pages/notification/index',
    text: '通知',
    icon: 'bell',
    color: '#7A7E83',
    activeColor: '#3cc51f',
  },
  {
    path: '/pages/profile/index',
    text: '我的',
    icon: 'account',
    color: '#7A7E83',
    activeColor: '#3cc51f',
  },
]

onLoad(() => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    currentPath.value = '/' + currentPage.route
  }
})

const switchTab = (path: string) => {
  uni.switchTab({
    url: path,
  })
}

const handlePublish = () => {
  // TODO: 打开发布弹窗
  uni.showToast({
    title: '发布功能开发中',
    icon: 'none',
  })
}
</script>

<style lang="scss" scoped>
.tabbar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid $u-border-color;
  z-index: 1000;
}

.tabbar-content {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;

  .tabbar-text {
    font-size: 20rpx;
    margin-top: 4rpx;
    color: #7A7E83;
  }

  &.active .tabbar-text {
    color: #3cc51f;
  }
}

.publish-btn {
  position: absolute;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 128rpx;
  height: 128rpx;
  background: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  z-index: 1001;
}
</style>

