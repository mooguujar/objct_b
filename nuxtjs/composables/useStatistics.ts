import { useUserStore } from '~/store/user'

export const useStatistics = () => {
  const config = useRuntimeConfig()
  const userStore = useUserStore()

  let pageViewQueue: any[] = []
  let clickEventQueue: any[] = []
  let timer: NodeJS.Timeout | null = null
  let pageStartTime = 0
  let currentPagePath = ''
  
  // 客户端初始化时间
  if (process.client) {
    pageStartTime = Date.now()
  }

  // 初始化统计
  const init = () => {
    if (process.client && !timer) {
      pageStartTime = Date.now()
      timer = setInterval(() => {
        batchReport()
      }, 5000)
      
      // 页面隐藏时记录停留时长
      window.addEventListener('beforeunload', () => {
        trackPageHide()
      })
    }
  }

  // 跟踪页面访问（带停留时长）
  const trackPageView = (pagePath: string, pageTitle = '') => {
    if (!process.client) return

    // 记录离开上一个页面的时长
    if (currentPagePath && currentPagePath !== pagePath) {
      const stayDuration = Math.floor((Date.now() - pageStartTime) / 1000)
      reportPageView(currentPagePath, '', stayDuration)
    }

    // 记录新页面
    currentPagePath = pagePath
    pageStartTime = Date.now()
    reportPageView(pagePath, pageTitle)
  }

  // 页面隐藏时记录停留时长
  const trackPageHide = () => {
    if (currentPagePath) {
      const stayDuration = Math.floor((Date.now() - pageStartTime) / 1000)
      reportPageView(currentPagePath, '', stayDuration)
    }
  }

  // 上报页面访问
  const reportPageView = (pagePath: string, pageTitle = '', stayDuration = 0) => {
    if (!process.client) return

    const pageView = {
      userId: userStore.user?.id?.toString() || null,
      pagePath,
      pageTitle,
      deviceType: 'web',
      platform: 'web',
      referrer: document.referrer || '',
      stayDuration,
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
    relatedType = '',
    clickX: number | null = null,
    clickY: number | null = null
  ) => {
    if (!process.client) return

    const clickEvent = {
      userId: userStore.user?.id?.toString() || null,
      eventType,
      elementId,
      elementType,
      pagePath: window.location.pathname,
      clickPositionX: clickX,
      clickPositionY: clickY,
      relatedId,
      relatedType,
      timestamp: Date.now(),
    }

    clickEventQueue.push(clickEvent)

    if (clickEventQueue.length >= 10) {
      batchReportClickEvent()
    }
  }

  // 上报点击事件（带位置信息）
  const reportClickEventWithPosition = (
    eventType: string,
    elementId = '',
    elementType = '',
    relatedId: number | null = null,
    relatedType = '',
    event: MouseEvent | TouchEvent | null = null
  ) => {
    let clickX: number | null = null
    let clickY: number | null = null

    if (event) {
      if ('clientX' in event) {
        clickX = event.clientX
        clickY = event.clientY
      } else if (event.touches && event.touches.length > 0) {
        clickX = event.touches[0].clientX
        clickY = event.touches[0].clientY
      } else if (event.changedTouches && event.changedTouches.length > 0) {
        clickX = event.changedTouches[0].clientX
        clickY = event.changedTouches[0].clientY
      }
    }

    reportClickEvent(eventType, elementId, elementType, relatedId, relatedType, clickX, clickY)
  }

  // 批量上报页面访问
  const batchReportPageView = async () => {
    if (pageViewQueue.length === 0) return

    const data = [...pageViewQueue]
    pageViewQueue = []

    try {
      await $fetch(`${config.public.apiBase}/statistics/page-view/batch`, {
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
      await $fetch(`${config.public.apiBase}/statistics/click-event/batch`, {
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
    trackPageView,
    trackPageHide,
    reportPageView,
    reportClickEvent,
    reportClickEventWithPosition,
  }
}

