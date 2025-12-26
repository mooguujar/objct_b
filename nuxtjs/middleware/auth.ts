export default defineNuxtRouteMiddleware((to, from) => {
  // 只在客户端检查认证状态
  if (!process.client) {
    return
  }
  
  // 直接检查 localStorage
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  // 如果没有认证信息，跳转到登录页
  if (!token || !userStr) {
    console.log('Auth middleware: No token or user found, redirecting to login')
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
  
  // 同步 store 状态
  const authStore = useAuthStore()
  authStore.initAuth()
  
  console.log('Auth middleware: Token found, allowing access')
})
