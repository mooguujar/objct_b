<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>岛屿管理</span>
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索岛屿名称"
            style="width: 300px; margin-right: 10px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="statusFilter" style="width: 150px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="active" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </div>
      </div>
    </template>

    <el-table :data="islandList" v-loading="loading" stripe>
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
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          {{ row.price > 0 ? `¥${row.price}` : '免费' }}
        </template>
      </el-table-column>
      <el-table-column prop="memberCount" label="成员数" width="100" />
      <el-table-column prop="postCount" label="帖子数" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
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
        :page-sizes="[10, 20, 50, 100]"
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
import { Search } from '@element-plus/icons-vue'
import { islandApi } from '@/api/island'

const islandList = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const searchKeyword = ref('')
const statusFilter = ref('')

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    active: '已通过',
    rejected: '已拒绝',
    closed: '已关闭',
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    active: 'success',
    rejected: 'danger',
    closed: 'info',
  }
  return map[status] || ''
}

const loadIslands = async () => {
  loading.value = true
  try {
    const result = await islandApi.getIslands({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      status: statusFilter.value || undefined,
    })
    islandList.value = result.list || []
    total.value = result.pagination?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载岛屿列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  loadIslands()
}

const handleSizeChange = () => {
  loadIslands()
}

const handlePageChange = () => {
  loadIslands()
}

const handleView = (id: string | number) => {
  // TODO: 跳转到详情页
  ElMessage.info('查看详情功能待实现')
}

const handleApprove = async (island: any) => {
  try {
    await ElMessageBox.confirm('确定要通过该岛屿吗？', '提示', {
      type: 'warning',
    })
    await islandApi.auditIsland(island.id, 'approve')
    ElMessage.success('审核通过')
    loadIslands()
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
    loadIslands()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

onMounted(() => {
  loadIslands()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

