<template>
  <el-card>
    <template #header>
      <span>岛屿审核</span>
    </template>

    <el-table :data="auditList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="岛屿名称" width="200" />
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="50" shape="square" />
        </template>
      </el-table-column>
      <el-table-column label="岛主" width="120">
        <template #default="{ row }">
          <span>{{ row.owner?.nickname || row.owner?.username }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="简介" width="300" show-overflow-tooltip />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          {{ row.price > 0 ? `¥${row.price}` : '免费' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row.id)">查看详情</el-button>
          <el-button type="success" link @click="handleApprove(row)">通过</el-button>
          <el-button type="warning" link @click="handleReject(row)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { islandApi } from '@/api/island'

const auditList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const loadAuditList = async () => {
  loading.value = true
  try {
    const result = await islandApi.getIslands({
      page: page.value,
      pageSize: pageSize.value,
      status: 'pending',
    })
    auditList.value = result.list || []
    total.value = result.pagination?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载审核列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  loadAuditList()
}

const handlePageChange = () => {
  loadAuditList()
}

const handleView = (id: string | number) => {
  // TODO: 查看详情
  ElMessage.info('查看详情功能待实现')
}

const handleApprove = async (island: any) => {
  try {
    await ElMessageBox.confirm('确定要通过该岛屿吗？', '提示', {
      type: 'warning',
    })
    await islandApi.auditIsland(island.id, 'approve')
    ElMessage.success('审核通过')
    loadAuditList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const handleReject = async (island: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝岛屿', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
    })
    await islandApi.auditIsland(island.id, 'reject', reason)
    ElMessage.success('已拒绝')
    loadAuditList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  loadAuditList()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

