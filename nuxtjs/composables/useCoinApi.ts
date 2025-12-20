import { useApi } from './useApi'

export const useCoinApi = () => {
  const api = useApi()

  return {
    // 获取金币余额
    getBalance: () => api.get('/coins/balance'),

    // 获取交易记录
    getTransactions: (params?: { page?: number; pageSize?: number; type?: string }) =>
      api.get('/coins/transactions', { params }),

    // 金币充值
    recharge: (data: { amount: number; paymentMethod: 'wechat' | 'alipay' }) =>
      api.post('/coins/recharge', data),
  }
}

