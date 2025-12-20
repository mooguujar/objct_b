<template>
  <el-card>
    <template #header>
      <span>创作者审核</span>
    </template>
    <el-table :data="auditList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="申请人" width="120">
        <template #default="{ row }">
          <span>{{ row.user?.nickname || row.user?.username }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="申请时间" width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row.id)">查看</el-button>
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
        layout="total, sizes, prev, pager, next"
        @size-change="loadAuditList"
        @current-change="loadAuditList"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { creatorApi } from '@/api/creator'

const auditList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const formatTime = (time: string) => new Date(time).toLocaleString('zh-CN')

const loadAuditList = async () => {
  loading.value = true
  try {
    const result = await creatorApi.getApplications({
      page: page.value,
      pageSize: pageSize.value,
      status: 'pending',
    })
    auditList.value = result.list || []
    total.value = result.pagination?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleView = () => ElMessage.info('查看详情功能待实现')
const handleApprove = async (app: any) => {
  try {
    await ElMessageBox.confirm('确定要通过该申请吗？', '提示', { type: 'warning' })
    await creatorApi.auditApplication(app.id, 'approve')
    ElMessage.success('审核通过')
    loadAuditList()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

const handleReject = async (app: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝申请', {
      inputType: 'textarea',
    })
    await creatorApi.auditApplication(app.id, 'reject', reason)
    ElMessage.success('已拒绝')
    loadAuditList()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => loadAuditList())
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

