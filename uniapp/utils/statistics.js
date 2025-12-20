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
export function reportPageView(pagePath, pageTitle = '') {
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
    ipAddress: null, // 客户端无法获取IP
    userAgent: getUA(),
    timestamp: Date.now(),
  }
  
  pageViewQueue.push(pageView)
  
  // 达到批量大小立即上报
  if (pageViewQueue.length >= BATCH_SIZE) {
    batchReportPageView()
  }
}

// 上报点击事件
export function reportClickEvent(eventType, elementId = '', elementType = '', relatedId = null, relatedType = '') {
  const userId = uni.getStorageSync('userId')
  const deviceId = uni.getStorageSync('deviceId')
  
  const clickEvent = {
    userId: userId || null,
    eventType,
    elementId,
    elementType,
    pagePath: getCurrentPagePath(),
    clickPositionX: null, // 需要从事件对象中获取
    clickPositionY: null,
    relatedId,
    relatedType,
    ipAddress: null,
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
      url: `${API_BASE}/statistics/page-views/batch`,
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
      url: `${API_BASE}/statistics/click-events/batch`,
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

