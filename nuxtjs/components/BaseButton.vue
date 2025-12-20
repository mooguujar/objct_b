<template>
  <el-button
    :type="type"
    :size="size"
    :plain="plain"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click')"
  >
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  plain?: boolean
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'default',
  plain: false,
  disabled: false,
  loading: false,
})
</script>

