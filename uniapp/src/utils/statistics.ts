import request from './request';

interface PageViewData {
  pagePath: string;
  pageTitle?: string;
  deviceType?: string;
  platform?: string;
  referrer?: string;
  stayDuration?: number;
}

interface ClickEventData {
  eventType: string;
  elementId?: string;
  elementType?: string;
  pagePath: string;
  clickPositionX?: number;
  clickPositionY?: number;
  relatedId?: number;
  relatedType?: string;
}

class Statistics {
  private pageViewCache: PageViewData[] = [];
  private clickEventCache: ClickEventData[] = [];
  private batchSize = 10;
  private batchInterval = 5000; // 5秒
  private timer: any = null;

  constructor() {
    // 延迟启动批量上传，避免在编译时执行
    // 使用 nextTick 确保在运行时才执行
    if (typeof window !== 'undefined' && typeof uni !== 'undefined') {
      setTimeout(() => {
        this.startBatchUpload();
      }, 0);
    }
  }

  // 上报页面访问
  trackPageView(data: PageViewData) {
    this.pageViewCache.push(data);
    if (this.pageViewCache.length >= this.batchSize) {
      this.uploadBatch();
    }
  }

  // 上报点击事件
  trackClickEvent(data: ClickEventData) {
    this.clickEventCache.push(data);
    if (this.clickEventCache.length >= this.batchSize) {
      this.uploadBatch();
    }
  }

  // 批量上报
  private async uploadBatch() {
    if (this.pageViewCache.length === 0 && this.clickEventCache.length === 0) {
      return;
    }

    const data = {
      pageViews: [...this.pageViewCache],
      clickEvents: [...this.clickEventCache],
    };

    this.pageViewCache = [];
    this.clickEventCache = [];

    try {
      await request.post('/statistics/batch', data);
    } catch (error) {
      // 失败后重新加入缓存
      this.pageViewCache.unshift(...data.pageViews);
      this.clickEventCache.unshift(...data.clickEvents);
    }
  }

  // 定时批量上报
  private startBatchUpload() {
    this.timer = setInterval(() => {
      this.uploadBatch();
    }, this.batchInterval);
  }

  // 停止批量上报
  stopBatchUpload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 最后上报一次
    this.uploadBatch();
  }
}

export default new Statistics();

