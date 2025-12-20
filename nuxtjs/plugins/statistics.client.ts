export default defineNuxtPlugin(() => {
  const statistics = useStatistics()
  
  // 初始化统计
  statistics.init()
  
  // 使用路由守卫跟踪页面访问
  const router = useRouter()
  router.afterEach((to, from) => {
    statistics.trackPageView(to.path, to.meta?.title as string || to.name as string)
  })
  
  // 页面卸载时记录停留时长
  if (process.client) {
    window.addEventListener('beforeunload', () => {
      statistics.trackPageHide()
    })
  }
})

