<template>
  <u-button
    :type="type"
    :size="size"
    :plain="plain"
    :disabled="disabled"
    :loading="loading"
    @click="$emit('click')"
  >
    <slot></slot>
  </u-button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'mini' | 'small' | 'normal' | 'large'
  plain?: boolean
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'normal',
  plain: false,
  disabled: false,
  loading: false,
})
</script>

