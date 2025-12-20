export const useStatistics = () => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  let pageViewQueue: any[] = []
  let clickEventQueue: any[] = []
  let timer: NodeJS.Timeout | null = null

  // 初始化统计
  const init = () => {
    if (process.client && !timer) {
      timer = setInterval(() => {
        batchReport()
      }, 5000)
    }
  }

  // 上报页面访问
  const reportPageView = (pagePath: string, pageTitle = '') => {
    if (!process.client) return

    const pageView = {
      userId: userStore.userId || null,
      pagePath,
      pageTitle,
      deviceType: 'web',
      platform: 'web',
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    pageViewQueue.push(pageView)

    if (pageViewQueue.length >= 10) {
      batchReportPageView()
    }
  }

  // 上报点击事件
  const reportClickEvent = (
    eventType: string,
    elementId = '',
    elementType = '',
    relatedId: number | null = null,
    relatedType = ''
  ) => {
    if (!process.client) return

    const clickEvent = {
      userId: userStore.userId || null,
      eventType,
      elementId,
      elementType,
      pagePath: window.location.pathname,
      relatedId,
      relatedType,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    clickEventQueue.push(clickEvent)

    if (clickEventQueue.length >= 10) {
      batchReportClickEvent()
    }
  }

  // 批量上报页面访问
  const batchReportPageView = async () => {
    if (pageViewQueue.length === 0) return

    const data = [...pageViewQueue]
    pageViewQueue = []

    try {
      await $fetch(`${config.public.apiBase}/statistics/page-views/batch`, {
        method: 'POST',
        body: { pageViews: data },
      })
    } catch (error) {
      pageViewQueue.unshift(...data)
    }
  }

  // 批量上报点击事件
  const batchReportClickEvent = async () => {
    if (clickEventQueue.length === 0) return

    const data = [...clickEventQueue]
    clickEventQueue = []

    try {
      await $fetch(`${config.public.apiBase}/statistics/click-events/batch`, {
        method: 'POST',
        body: { clickEvents: data },
      })
    } catch (error) {
      clickEventQueue.unshift(...data)
    }
  }

  // 批量上报
  const batchReport = () => {
    batchReportPageView()
    batchReportClickEvent()
  }

  return {
    init,
    reportPageView,
    reportClickEvent,
  }
}

