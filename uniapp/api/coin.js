import request from '@/utils/request'

export const coinApi = {
  // 获取金币余额
  getBalance() {
    return request.get('/coins/balance')
  },

  // 获取交易记录
  getTransactions(params) {
    return request.get('/coins/transactions', { params })
  },

  // 金币充值
  recharge(data) {
    return request.post('/coins/recharge', data)
  },
}

