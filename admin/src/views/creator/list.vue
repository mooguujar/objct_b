<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>创作者申请</span>
        <el-select v-model="statusFilter" style="width: 150px" @change="handleSearch">
          <el-option label="全部" value="" />
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>
    </template>

    <el-table :data="applicationList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="申请人" width="120">
        <template #default="{ row }">
          <span>{{ row.user?.nickname || row.user?.username }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="申请时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row.id)">查看</el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            link
            @click="handleApprove(row)"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="warning"
            link
            @click="handleReject(row)"
          >
            拒绝
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
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
import { creatorApi } from '@/api/creator'

const applicationList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const statusFilter = ref('')

const formatTime = (time: string) => new Date(time).toLocaleString('zh-CN')
const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}
const getStatusType = (status: string) => {
  const map: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || ''
}

const loadApplications = async () => {
  loading.value = true
  try {
    const result = await creatorApi.getApplications({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value || undefined,
    })
    applicationList.value = result.list || []
    total.value = result.pagination?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载申请列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadApplications()
}

const handleSizeChange = () => loadApplications()
const handlePageChange = () => loadApplications()
const handleView = (id: string | number) => {
  ElMessage.info('查看详情功能待实现')
}

const handleApprove = async (app: any) => {
  try {
    await ElMessageBox.confirm('确定要通过该申请吗？', '提示', { type: 'warning' })
    await creatorApi.auditApplication(app.id, 'approve')
    ElMessage.success('审核通过')
    loadApplications()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

const handleReject = async (app: any) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
    })
    await creatorApi.auditApplication(app.id, 'reject', reason)
    ElMessage.success('已拒绝')
    loadApplications()
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => loadApplications())
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

