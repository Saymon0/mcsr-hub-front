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
      path: '/tournaments',
      name: 'tournaments',
      component: () => import('@/views/TournamentsView.vue'),
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
  ],
})

export default router
