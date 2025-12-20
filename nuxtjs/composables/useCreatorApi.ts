export const useCreatorApi = () => {
  const api = useApi()

  return {
    // 申请入驻
    apply: (data: any) => api.post('/creator/apply', data),
    
    // 查询申请状态
    getStatus: () => api.get('/creator/status'),
  }
}

