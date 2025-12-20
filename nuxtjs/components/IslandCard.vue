<template>
  <div class="island-card" @click="handleClick">
    <img
      v-if="island.cover"
      :src="island.cover"
      class="island-cover"
      alt=""
    />
    <div class="island-info">
      <img
        :src="island.avatar || '/default-avatar.png'"
        class="island-avatar"
        alt=""
      />
      <div class="island-content">
        <h3 class="island-name">{{ island.name }}</h3>
        <p class="island-desc" v-if="island.description">{{ island.description }}</p>
        <div class="island-stats">
          <span class="stat-item">{{ island.memberCount || 0 }} 成员</span>
          <span class="stat-item">{{ island.postCount || 0 }} 帖子</span>
        </div>
      </div>
    </div>
    <div class="island-price" v-if="island.price > 0">
      {{ island.price }} 金币
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  island: any
}

const props = defineProps<Props>()

const handleClick = () => {
  navigateTo(`/island/${props.island.id}`)
}
</script>

<style scoped>
.island-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.island-card:hover {
  transform: translateY(-2px);
}

.island-cover {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.island-info {
  padding: 16px;
  display: flex;
  align-items: flex-start;
}

.island-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 12px;
  border: 3px solid #fff;
  margin-top: -30px;
  background: #fff;
}

.island-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.island-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.island-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.island-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.island-price {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #3cc51f;
  font-weight: bold;
}
</style>

