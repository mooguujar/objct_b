// 数据统计SDK

const API_BASE = 'http://localhost:3000/api/v1'
const BATCH_SIZE = 10 // 批量上报数量
const BATCH_INTERVAL = 5000 // 批量上报间隔（毫秒）

let pageViewQueue = []
let clickEventQueue = []
let timer = null

// 初始化统计SDK
export function initStatistics() {
  // 启动批量上报定时器
  if (!timer) {
    timer = setInterval(() => {
      batchReport()
    }, BATCH_INTERVAL)
  }
}

// 上报页面访问
export function reportPageView(pagePath, pageTitle = '', stayDuration = 0) {
  const userId = uni.getStorageSync('userId')
  const deviceId = uni.getStorageSync('deviceId')
  const platform = 'app'
  
  const pageView = {
    userId: userId || null,
    pagePath,
    pageTitle,
    deviceType: getDeviceType(),
    platform,
    referrer: getReferrer(),
    stayDuration,
    timestamp: Date.now(),
  }
  
  pageViewQueue.push(pageView)
  
  // 达到批量大小立即上报
  if (pageViewQueue.length >= BATCH_SIZE) {
    batchReportPageView()
  }
}

// 上报点击事件
export function reportClickEvent(eventType, elementId = '', elementType = '', relatedId = null, relatedType = '', clickX = null, clickY = null) {
  const userId = uni.getStorageSync('userId')
  const deviceId = uni.getStorageSync('deviceId')
  
  const clickEvent = {
    userId: userId || null,
    eventType,
    elementId,
    elementType,
    pagePath: getCurrentPagePath(),
    clickPositionX: clickX,
    clickPositionY: clickY,
    relatedId,
    relatedType,
    timestamp: Date.now(),
  }
  
  clickEventQueue.push(clickEvent)
  
  // 达到批量大小立即上报
  if (clickEventQueue.length >= BATCH_SIZE) {
    batchReportClickEvent()
  }
}

// 批量上报页面访问
async function batchReportPageView() {
  if (pageViewQueue.length === 0) return
  
  const data = [...pageViewQueue]
  pageViewQueue = []
  
  try {
    await uni.request({
      url: `${API_BASE}/statistics/page-view`,
      method: 'POST',
      data: { pageViews: data },
      header: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // 上报失败，重新加入队列
    pageViewQueue.unshift(...data)
  }
}

// 批量上报点击事件
async function batchReportClickEvent() {
  if (clickEventQueue.length === 0) return
  
  const data = [...clickEventQueue]
  clickEventQueue = []
  
  try {
    await uni.request({
      url: `${API_BASE}/statistics/click-event`,
      method: 'POST',
      data: { clickEvents: data },
      header: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    // 上报失败，重新加入队列
    clickEventQueue.unshift(...data)
  }
}

// 批量上报
function batchReport() {
  batchReportPageView()
  batchReportClickEvent()
}

// 获取设备类型
function getDeviceType() {
  const systemInfo = uni.getSystemInfoSync()
  return systemInfo.platform === 'android' ? 'android' : 'ios'
}

// 获取UserAgent
function getUA() {
  const systemInfo = uni.getSystemInfoSync()
  return `${systemInfo.platform}/${systemInfo.system}`
}

// 获取来源页面
function getReferrer() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2]
    return prevPage.route || ''
  }
  return ''
}

// 获取当前页面路径
function getCurrentPagePath() {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    return currentPage.route || ''
  }
  return ''
}

// 记录页面停留时长
let pageStartTime = Date.now()
let currentPagePath = ''

export function trackPageView(pagePath, pageTitle = '') {
  // 记录离开上一个页面的时长
  if (currentPagePath && currentPagePath !== pagePath) {
    const stayDuration = Math.floor((Date.now() - pageStartTime) / 1000)
    // 上报上一个页面的访问数据
    reportPageView(currentPagePath, '', stayDuration)
  }
  
  // 记录新页面
  currentPagePath = pagePath
  pageStartTime = Date.now()
  reportPageView(pagePath, pageTitle)
}

// 页面隐藏时记录停留时长
export function trackPageHide() {
  if (currentPagePath) {
    const stayDuration = Math.floor((Date.now() - pageStartTime) / 1000)
    reportPageView(currentPagePath, '', stayDuration)
  }
}


// 上报点击事件（带位置信息）
export function reportClickEventWithPosition(eventType, elementId = '', elementType = '', relatedId = null, relatedType = '', event = null) {
  let clickX = null
  let clickY = null
  
  if (event && event.touches && event.touches.length > 0) {
    clickX = event.touches[0].clientX
    clickY = event.touches[0].clientY
  } else if (event && event.changedTouches && event.changedTouches.length > 0) {
    clickX = event.changedTouches[0].clientX
    clickY = event.changedTouches[0].clientY
  }
  
  reportClickEvent(eventType, elementId, elementType, relatedId, relatedType, clickX, clickY)
}

