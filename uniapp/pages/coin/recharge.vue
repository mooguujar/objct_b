<template>
  <view class="recharge-page">
    <u-navbar
      title="金币充值"
      :autoBack="true"
      :fixed="true"
      :safeAreaInsetTop="true"
      leftIconColor="#333"
      titleStyle="color: #333; font-weight: 500;"
    />

    <view class="content-wrapper">
      <!-- 当前余额 -->
      <view class="balance-section">
        <view class="balance-card">
          <text class="balance-label">当前余额</text>
          <view class="balance-amount">
            <u-icon name="rmb-circle-fill" color="#F59E0B" size="40"></u-icon>
            <text class="balance-num">{{ balance || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 充值金额选择 -->
      <view class="amount-section">
        <text class="section-title">选择充值金额</text>
        <view class="amount-grid">
          <view
            v-for="amount in amountOptions"
            :key="amount"
            class="amount-item"
            :class="{ active: selectedAmount === amount }"
            @click="selectAmount(amount)"
          >
            <text class="amount-text">¥{{ amount }}</text>
          </view>
          <view
            class="amount-item custom-amount"
            :class="{ active: isCustomAmount }"
            @click="showCustomInput"
          >
            <text class="amount-text">自定义</text>
          </view>
        </view>
        <!-- 自定义金额输入 -->
        <view v-if="isCustomAmount" class="custom-input-section">
          <u-input
            v-model="customAmount"
            type="number"
            placeholder="请输入金额"
            :border="false"
            :customStyle="{ backgroundColor: '#f5f5f5', borderRadius: '16rpx', padding: '0 24rpx' }"
          >
            <template #prefix>
              <text class="input-prefix">¥</text>
            </template>
          </u-input>
        </view>
      </view>

      <!-- 支付方式选择 -->
      <view class="payment-section">
        <text class="section-title">选择支付方式</text>
        <view class="payment-options">
          <view
            class="payment-item"
            :class="{ active: paymentMethod === 'wechat' }"
            @click="selectPayment('wechat')"
          >
            <u-icon name="weixin-fill" color="#07c160" size="48"></u-icon>
            <text class="payment-label">微信支付</text>
            <u-icon
              v-if="paymentMethod === 'wechat'"
              name="checkmark-circle-fill"
              color="#07c160"
              size="32"
            ></u-icon>
          </view>
          <view
            class="payment-item"
            :class="{ active: paymentMethod === 'alipay' }"
            @click="selectPayment('alipay')"
          >
            <u-icon name="alipay-circle-fill" color="#1677ff" size="48"></u-icon>
            <text class="payment-label">支付宝</text>
            <u-icon
              v-if="paymentMethod === 'alipay'"
              name="checkmark-circle-fill"
              color="#1677ff"
              size="32"
            ></u-icon>
          </view>
        </view>
      </view>

      <!-- 充值按钮 -->
      <view class="submit-section">
        <u-button
          type="primary"
          text="确认充值"
          :loading="recharging"
          :disabled="!canRecharge"
          @click="handleRecharge"
          shape="circle"
          :customStyle="{ height: '96rpx', fontSize: '32rpx' }"
        ></u-button>
      </view>

      <!-- 交易记录 -->
      <view class="transactions-section">
        <view class="section-header">
          <text class="section-title">交易记录</text>
          <text class="view-all" @click="viewAllTransactions">查看全部</text>
        </view>
        <view v-if="transactions.length === 0" class="empty-transactions">
          <u-empty mode="data" text="暂无交易记录" />
        </view>
        <view v-else class="transactions-list">
          <view
            v-for="transaction in transactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <view class="transaction-info">
              <text class="transaction-desc">{{ transaction.description }}</text>
              <text class="transaction-time">{{ formatTime(transaction.createdAt) }}</text>
            </view>
            <text
              class="transaction-amount"
              :class="{
                positive: transaction.amount > 0,
                negative: transaction.amount < 0,
              }"
            >
              {{ transaction.amount > 0 ? '+' : '' }}{{ transaction.amount }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { coinApi } from '@/api/coin'

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

const selectPayment = (method: 'wechat' | 'alipay') => {
  paymentMethod.value = method
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
    const res = await coinApi.getBalance()
    if (res.code === 200 && res.data) {
      balance.value = res.data.balance || 0
    }
  } catch (error) {
    console.error('加载余额失败', error)
  }
}

const loadTransactions = async () => {
  try {
    const res = await coinApi.getTransactions({
      page: 1,
      pageSize: 5,
    })
    if (res.code === 200 && res.data) {
      transactions.value = res.data.list || []
    }
  } catch (error) {
    console.error('加载交易记录失败', error)
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
    uni.showToast({
      title: '请选择充值金额',
      icon: 'none',
    })
    return
  }

  recharging.value = true
  uni.showLoading({ title: '处理中...' })

  try {
    const res = await coinApi.recharge({
      amount,
      paymentMethod: paymentMethod.value,
    })

    if (res.code === 200 && res.data) {
      uni.hideLoading()
      // 更新余额
      balance.value = res.data.balance || balance.value
      // 跳转到支付页面（实际应该调用支付SDK）
      uni.showToast({
        title: '充值成功',
        icon: 'success',
      })
      // 重新加载交易记录
      loadTransactions()
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '充值失败',
      icon: 'error',
    })
  } finally {
    recharging.value = false
  }
}

const viewAllTransactions = () => {
  uni.navigateTo({
    url: '/pages/coin/transactions',
  })
}

onMounted(() => {
  loadBalance()
  loadTransactions()
})
</script>

<style lang="scss" scoped>
.recharge-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.content-wrapper {
  padding: 20rpx;
  margin-top: 88rpx;
}

.balance-section {
  margin-bottom: 40rpx;
}

.balance-card {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-radius: 24rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(#f59e0b, 0.2);
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24rpx;
}

.balance-amount {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.balance-num {
  font-size: 72rpx;
  font-weight: bold;
  color: #fff;
}

.amount-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.amount-item {
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  border: 2rpx solid transparent;

  &.active {
    background-color: #fef3c7;
    border-color: #f59e0b;
  }
}

.amount-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.custom-input-section {
  margin-top: 24rpx;
}

.input-prefix {
  font-size: 28rpx;
  color: #666;
  margin-right: 8rpx;
}

.payment-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  border: 2rpx solid transparent;

  &.active {
    background-color: #f0f9ff;
    border-color: #1677ff;
  }
}

.payment-label {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.submit-section {
  margin-bottom: 40rpx;
}

.transactions-section {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.view-all {
  font-size: 24rpx;
  color: #1677ff;
}

.empty-transactions {
  padding: 60rpx 0;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
}

.transaction-desc {
  font-size: 28rpx;
  color: #333;
}

.transaction-time {
  font-size: 24rpx;
  color: #999;
}

.transaction-amount {
  font-size: 32rpx;
  font-weight: 500;

  &.positive {
    color: #10b981;
  }

  &.negative {
    color: #ef4444;
  }
}
</style>

