<template>
  <el-card>
    <template #header>
      <span>页面访问统计</span>
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

const loadPageViewStats = async () => {
  try {
    const result = await statisticsApi.getPageViewStats()
    if (chartRef.value && chartInstance) {
      const option = {
        title: { text: '页面访问统计' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: result.dates || [] },
        yAxis: { type: 'value' },
        series: [{ data: result.values || [], type: 'line' }],
      }
      chartInstance.setOption(option)
    }
  } catch (error) {
    console.error('加载页面访问统计失败', error)
  }
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
    loadPageViewStats()
  }
  window.addEventListener('resize', () => chartInstance?.resize())
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  window.removeEventListener('resize', () => chartInstance?.resize())
})
</script>

