<template>
  <el-input
    :model-value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'textarea' | 'password'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

