import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard.vue'),
      },
      {
        path: 'user',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
      },
      {
        path: 'user/:id',
        name: 'UserDetail',
        component: () => import('@/views/user/detail.vue'),
      },
      {
        path: 'content',
        name: 'ContentList',
        component: () => import('@/views/content/list.vue'),
      },
      {
        path: 'content/audit',
        name: 'ContentAudit',
        component: () => import('@/views/content/audit.vue'),
      },
      {
        path: 'island',
        name: 'IslandList',
        component: () => import('@/views/island/list.vue'),
      },
      {
        path: 'island/audit',
        name: 'IslandAudit',
        component: () => import('@/views/island/audit.vue'),
      },
      {
        path: 'creator',
        name: 'CreatorList',
        component: () => import('@/views/creator/list.vue'),
      },
      {
        path: 'creator/audit',
        name: 'CreatorAudit',
        component: () => import('@/views/creator/audit.vue'),
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/dashboard.vue'),
      },
      {
        path: 'statistics/page-view',
        name: 'PageViewStatistics',
        component: () => import('@/views/statistics/page-view.vue'),
      },
      {
        path: 'statistics/click-event',
        name: 'ClickEventStatistics',
        component: () => import('@/views/statistics/click-event.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

