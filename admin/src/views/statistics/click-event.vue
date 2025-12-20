<template>
  <el-card>
    <template #header>
      <span>点击事件统计</span>
    </template>
    <div ref="chartRef" style="width: 100%; height: 400px"></div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi } from '@/api/statistics'

const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

const loadClickEventStats = async () => {
  try {
    const result = await statisticsApi.getClickEventStats()
    if (chartRef.value && chartInstance) {
      const option = {
        title: { text: '点击事件统计' },
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', data: result.data || [] }],
      }
      chartInstance.setOption(option)
    }
  } catch (error) {
    console.error('加载点击事件统计失败', error)
  }
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    loadClickEventStats()
  }
  window.addEventListener('resize', () => chartInstance?.resize())
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', () => chartInstance?.resize())
})
</script>

