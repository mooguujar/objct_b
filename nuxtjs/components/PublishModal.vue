<template>
  <el-dialog
    v-model="dialogVisible"
    :show-close="false"
    :close-on-click-modal="true"
    width="400px"
    align-center
    class="publish-modal"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-title">发布</span>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
    </template>
    
    <div class="publish-options">
      <div class="option-item" @click="handlePersonalPost">
        <div class="option-icon option-icon-windmill">
          <el-icon><Setting /></el-icon>
        </div>
        <span class="option-text">发布个人动态</span>
      </div>
      
      <div class="option-item" @click="handleIslandPost">
        <div class="option-icon option-icon-note">
          <el-icon><Document /></el-icon>
        </div>
        <span class="option-text">发布岛屿帖子</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Close, Setting, Document } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'personal', 'island'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handlePersonalPost = () => {
  emit('personal')
  emit('update:modelValue', false)
}

const handleIslandPost = () => {
  emit('island')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.publish-modal {
  :deep(.el-dialog__header) {
    padding: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  padding: 20px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.close-icon {
  position: absolute;
  left: 0;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
}

.publish-options {
  display: flex;
  justify-content: center;
  gap: 56px;
  padding-bottom: 20px;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

.option-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;

  :deep(.el-icon) {
    font-size: 36px;
  }
}

.option-icon-windmill {
  background: linear-gradient(135deg, #fce7f3 0%, #e0e7ff 50%, #fef3c7 100%);
  color: #ec4899;
}

.option-icon-note {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  color: #f59e0b;
}

.option-text {
  font-size: 14px;
  color: #666;
}
</style>

