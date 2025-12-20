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

export const useStatistics = () => {
  const pageViewCache = ref<PageViewData[]>([]);
  const clickEventCache = ref<ClickEventData[]>([]);
  const batchSize = 10;

  const trackPageView = (data: PageViewData) => {
    pageViewCache.value.push(data);
    if (pageViewCache.value.length >= batchSize) {
      uploadBatch();
    }
  };

  const trackClickEvent = (data: ClickEventData) => {
    clickEventCache.value.push(data);
    if (clickEventCache.value.length >= batchSize) {
      uploadBatch();
    }
  };

  const uploadBatch = async () => {
    if (pageViewCache.value.length === 0 && clickEventCache.value.length === 0) {
      return;
    }

    const data = {
      pageViews: [...pageViewCache.value],
      clickEvents: [...clickEventCache.value],
    };

    pageViewCache.value = [];
    clickEventCache.value = [];

    try {
      const api = useApi();
      await api('/statistics/batch', {
        method: 'POST',
        body: data,
      });
    } catch (error) {
      // 失败后重新加入缓存
      pageViewCache.value.unshift(...data.pageViews);
      clickEventCache.value.unshift(...data.clickEvents);
    }
  };

  // 页面卸载时上报
  if (process.client) {
    window.addEventListener('beforeunload', uploadBatch);
  }

  return {
    trackPageView,
    trackClickEvent,
    uploadBatch,
  };
};

