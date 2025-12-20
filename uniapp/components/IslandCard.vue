<template>
  <view class="island-card" @click="handleClick">
    <image
      v-if="island.cover"
      :src="island.cover"
      class="island-cover"
      mode="aspectFill"
    />
    <view class="island-info">
      <image
        :src="island.avatar || '/static/default-avatar.png'"
        class="island-avatar"
        mode="aspectFill"
      />
      <view class="island-content">
        <text class="island-name">{{ island.name }}</text>
        <text class="island-desc" v-if="island.description">{{ island.description }}</text>
        <view class="island-stats">
          <text class="stat-item">{{ island.memberCount || 0 }} 成员</text>
          <text class="stat-item">{{ island.postCount || 0 }} 帖子</text>
        </view>
      </view>
    </view>
    <view class="island-price" v-if="island.price > 0">
      <text>{{ island.price }} 金币</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  island: any
}

const props = defineProps<Props>()

const handleClick = () => {
  uni.navigateTo({
    url: `/pages/island/detail?id=${props.island.id}`,
  })
}
</script>

<style lang="scss" scoped>
.island-card {
  position: relative;
  background: #fff;
  border-radius: $u-border-radius-base;
  overflow: hidden;
  margin-bottom: $u-spacing-base;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.island-cover {
  width: 100%;
  height: 200rpx;
}

.island-info {
  padding: $u-spacing-base;
  display: flex;
  align-items: flex-start;
}

.island-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: $u-spacing-base;
  border: 4rpx solid #fff;
  margin-top: -50rpx;
  background: #fff;
}

.island-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.island-name {
  font-size: $u-font-size-lg;
  font-weight: bold;
  color: $u-main-color;
  margin-bottom: 8rpx;
}

.island-desc {
  font-size: $u-font-size-base;
  color: $u-content-color;
  margin-bottom: $u-spacing-sm;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.island-stats {
  display: flex;
  gap: $u-spacing-base;
  font-size: 24rpx;
  color: $u-tips-color;
}

.island-price {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  padding: 8rpx 16rpx;
  border-radius: $u-border-radius-sm;
  font-size: 24rpx;
  color: $u-primary;
  font-weight: bold;
}
</style>

