<template>
  <u-input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    @input="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'password'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

