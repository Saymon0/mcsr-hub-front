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
      path: '/matches/:id',
      name: 'match-detail',
      component: () => import('@/views/MatchView.vue'),
      props: true,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      component: () => import('@/views/TournamentsView.vue'),
    },
    {
      path: '/tournaments/:id',
      name: 'tournament-detail',
      component: () => import('@/views/TournamentDetailView.vue'),
      props: true,
    },
    {
      path: '/pickem',
      name: 'pickem',
      component: () => import('@/views/PickEmView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
    },
    {
      path: '/admin/add-tournament',
      name: 'add-tournament',
      component: () => import('@/views/AddTournament.vue'),
    },
  ],
})

export default router
