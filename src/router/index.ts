import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: () => import('@/views/LeaderboardView.vue'),
    },
    {
      path: '/matches',
      name: 'matches',
      component: () => import('@/views/MatchesView.vue'),
    },
    {
      path: '/training',
      name: 'training',
      component: () => import('@/views/TrainingView.vue'),
    },
    {
      path: '/streams',
      name: 'streams',
      component: () => import('@/views/StreamsView.vue'),
    },
    {
      path: '/world-records',
      name: 'world-records',
      component: () => import('@/views/WorldRecordsView.vue'),
    },
    {
      path: '/match/:id',
      name: 'match',
      component: () => import('@/views/MatchView.vue'),
    },
    // Добавляем недостающие маршруты
    {
      path: '/guides',
      name: 'guides',
      component: () => import('@/views/GuidesView.vue'),
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/NewsView.vue'),
    },
  ],
})

export default router
