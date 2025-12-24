export const useStatistics = () => {
  const { request } = useApi()

  // 页面访问统计
  const trackPageView = async (data: {
    pagePath: string
    referrer?: string
    userAgent?: string
    device?: string
    duration?: number
  }) => {
    try {
      await request('/statistics/pageview', {
        method: 'POST',
        body: data
      })
    } catch (error) {
      console.error('页面访问统计失败:', error)
    }
  }

  // 点击事件统计
  const trackClick = async (data: {
    elementId: string
    elementType: string
    pagePath: string
    content?: any
  }) => {
    try {
      await request('/statistics/click', {
        method: 'POST',
        body: data
      })
    } catch (error) {
      console.error('点击事件统计失败:', error)
    }
  }

  return {
    trackPageView,
    trackClick
  }
}

