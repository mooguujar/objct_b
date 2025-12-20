<template>
  <div class="recharge-page">
    <el-card class="balance-card">
      <div class="balance-content">
        <span class="balance-label">当前余额</span>
        <div class="balance-amount">
          <el-icon :size="32" color="#F59E0B"><Money /></el-icon>
          <span class="balance-num">{{ balance || 0 }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="amount-card">
      <template #header>
        <span class="card-title">选择充值金额</span>
      </template>
      <div class="amount-grid">
        <el-button
          v-for="amount in amountOptions"
          :key="amount"
          :type="selectedAmount === amount ? 'primary' : 'info'"
          :plain="selectedAmount !== amount"
          @click="selectAmount(amount)"
        >
          ¥{{ amount }}
        </el-button>
        <el-button
          :type="isCustomAmount ? 'primary' : 'info'"
          :plain="!isCustomAmount"
          @click="showCustomInput"
        >
          自定义
        </el-button>
      </div>
      <el-input
        v-if="isCustomAmount"
        v-model="customAmount"
        type="number"
        placeholder="请输入金额"
        class="custom-input"
      >
        <template #prefix>
          <span class="input-prefix">¥</span>
        </template>
      </el-input>
    </el-card>

    <el-card class="payment-card">
      <template #header>
        <span class="card-title">选择支付方式</span>
      </template>
      <el-radio-group v-model="paymentMethod" class="payment-options">
        <el-radio-button label="wechat">
          <el-icon><WeChat /></el-icon>
          <span style="margin-left: 8px">微信支付</span>
        </el-radio-button>
        <el-radio-button label="alipay">
          <el-icon><CreditCard /></el-icon>
          <span style="margin-left: 8px">支付宝</span>
        </el-radio-button>
      </el-radio-group>
    </el-card>

    <div class="submit-section">
      <el-button
        type="primary"
        size="large"
        :loading="recharging"
        :disabled="!canRecharge"
        @click="handleRecharge"
        style="width: 100%"
      >
        确认充值
      </el-button>
    </div>

    <el-card class="transactions-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">交易记录</span>
          <el-button text type="primary" @click="viewAllTransactions">查看全部</el-button>
        </div>
      </template>
      <el-empty v-if="transactions.length === 0" description="暂无交易记录" :image-size="100" />
      <div v-else class="transactions-list">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <span class="transaction-desc">{{ transaction.description }}</span>
            <span class="transaction-time">{{ formatTime(transaction.createdAt) }}</span>
          </div>
          <span
            class="transaction-amount"
            :class="{
              positive: transaction.amount > 0,
              negative: transaction.amount < 0,
            }"
          >
            {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Money, WeChat, CreditCard } from '@element-plus/icons-vue'
import { useCoinApi } from '~/composables/useCoinApi'

definePageMeta({
  middleware: ['auth'],
})

const coinApi = useCoinApi()

const balance = ref(0)
const selectedAmount = ref<number | null>(null)
const customAmount = ref('')
const isCustomAmount = ref(false)
const paymentMethod = ref<'wechat' | 'alipay'>('wechat')
const recharging = ref(false)
const transactions = ref<any[]>([])

const amountOptions = [10, 50, 100, 200, 500, 1000]

const canRecharge = computed(() => {
  const amount = isCustomAmount.value
    ? parseFloat(customAmount.value)
    : selectedAmount.value
  return amount && amount > 0 && !recharging.value
})

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  isCustomAmount.value = false
  customAmount.value = ''
}

const showCustomInput = () => {
  isCustomAmount.value = true
  selectedAmount.value = null
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const loadBalance = async () => {
  try {
    const data = await coinApi.getBalance()
    balance.value = data.balance || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载余额失败')
  }
}

const loadTransactions = async () => {
  try {
    const result = await coinApi.getTransactions({
      page: 1,
      pageSize: 5,
    })
    transactions.value = result.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载交易记录失败')
  }
}

const handleRecharge = async () => {
  if (!canRecharge.value) {
    return
  }

  const amount = isCustomAmount.value
    ? parseFloat(customAmount.value)
    : selectedAmount.value

  if (!amount || amount <= 0) {
    ElMessage.warning('请选择充值金额')
    return
  }

  recharging.value = true

  try {
    const result = await coinApi.recharge({
      amount,
      paymentMethod: paymentMethod.value,
    })

    balance.value = result.balance || balance.value
    ElMessage.success('充值成功')
    // 重新加载交易记录
    loadTransactions()
    // TODO: 跳转到支付页面（实际应该调用支付SDK）
  } catch (error: any) {
    ElMessage.error(error.message || '充值失败')
  } finally {
    recharging.value = false
  }
}

const viewAllTransactions = () => {
  navigateTo('/coin/transactions')
}

onMounted(() => {
  loadBalance()
  loadTransactions()
})
</script>

<style scoped lang="scss">
.recharge-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.balance-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border: none;
}

.balance-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.balance-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-num {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
}

.amount-card,
.payment-card,
.transactions-card {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.custom-input {
  margin-top: 12px;
}

.input-prefix {
  font-size: 14px;
  color: #666;
  margin-right: 4px;
}

.payment-options {
  width: 100%;
  display: flex;
  gap: 12px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.transaction-desc {
  font-size: 14px;
  color: #333;
}

.transaction-time {
  font-size: 12px;
  color: #999;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 500;

  &.positive {
    color: #10b981;
  }

  &.negative {
    color: #ef4444;
  }
}

.submit-section {
  margin-bottom: 20px;
}
</style>

