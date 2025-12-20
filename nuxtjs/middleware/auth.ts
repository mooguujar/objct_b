export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  // 如果未登录，重定向到登录页
  if (!userStore.isLoggedIn()) {
    return navigateTo('/login')
  }
})

