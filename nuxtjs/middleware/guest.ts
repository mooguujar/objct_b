export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  // 如果已登录，重定向到首页
  if (userStore.isLoggedIn()) {
    return navigateTo('/')
  }
})

