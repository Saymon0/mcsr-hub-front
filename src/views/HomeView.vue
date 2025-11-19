<template>
  <div class="min-h-screen bg-primary-bg">
    <Header />

    <!-- Блок с матчами -->
    <section class="bg-primary-card border-b border-primary-hover py-6">
      <div class="container mx-auto px-4">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-text-primary text-center mb-6">Текущие матчи</h2>

        <!-- Сетка матчей по центру -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 justify-items-center max-w-7xl mx-auto"
        >
          <MatchCard v-for="match in sortedMatches" :key="match.id" :match="match" />
        </div>
      </div>
    </section>

    <!-- Секция описания и кнопок -->
    <section class="bg-primary-card border-b border-primary-hover py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Minecraft Speedrunning Hub
          </h2>
          <p class="text-text-secondary text-lg md:text-xl mb-8 leading-relaxed">
            Ваш главный ресурс по Minecraft спидранну: гайды, мировые рекорды, турниры и прямые трансляции.
            Соревнуйтесь и улучшайте свои навыки вместе с лучшими раннерами мира!
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://discord.gg/mcsr-ranked-1056779246728658984"
              target="_blank"
              class="bg-accent-green hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-lg"
            >
              <span>🌟 Присоединиться к сообществу</span>
            </a>

            <RouterLink
              to="/world-records"
              class="bg-accent-blue hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-lg"
            >
              <span>🏆 Мировые рекорды</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Остальной контент главной страницы -->
    <main class="container mx-auto px-4 py-8">
      <!-- Hero секция -->
      <section class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Minecraft Speedrun Hub
        </h1>
        <p class="text-text-secondary text-lg max-w-2xl mx-auto">
          Главный хаб для спидраннеров Minecraft. Рейтинги, турниры, тренировки и прямые трансляции.
        </p>
      </section>

      <!-- Топ 3 рана -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-text-primary mb-6">🔥 Топ 3 рана</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6" v-auto-animate>
          <RunCard
            v-for="run in topRuns"
            :key="run.id"
            :run="run"
          />
        </div>
      </section>

      <!-- Рейтинг и стримы -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Снимок рейтинга -->
        <div class="bg-primary-card rounded-lg p-6 border border-primary-hover">
          <h2 class="text-2xl font-bold text-text-primary mb-4">🏆 MCSR Ranked</h2>
          <div class="space-y-3">
            <div
              v-for="player in leaderboard.slice(0, 5)"
              :key="player.id"
              class="flex items-center justify-between p-3 bg-primary-hover rounded"
            >
              <div class="flex items-center space-x-3">
                <span class="text-accent-gold font-bold w-6">#{{ player.rank }}</span>
                <span class="text-text-primary font-medium">{{ player.username }}</span>
              </div>
              <span class="text-accent-green font-semibold">{{ player.elo }} ELO</span>
            </div>
          </div>
          <RouterLink
            to="/leaderboard"
            class="block text-center text-accent-blue hover:text-accent-green mt-4 transition-colors"
          >
            Весь рейтинг →
          </RouterLink>
        </div>

        <!-- Активные стримы -->
        <div class="bg-primary-card rounded-lg p-6 border border-primary-hover">
          <h2 class="text-2xl font-bold text-text-primary mb-4">🎥 Прямые эфиры</h2>
          <div class="space-y-3">
            <div
              v-for="stream in liveStreams"
              :key="stream.id"
              class="flex items-center justify-between p-3 bg-primary-hover rounded"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-accent-red rounded-full animate-pulse"></div>
                <span class="text-text-primary">{{ stream.runner }}</span>
              </div>
              <span class="text-text-secondary">{{ stream.viewers }} зрит.</span>
            </div>
          </div>
          <RouterLink
            to="/streams"
            class="block text-center text-accent-blue hover:text-accent-green mt-4 transition-colors"
          >
            Все стримы →
          </RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import MatchCard from '@/components/matches/MatchCard.vue'
import RunCard from '@/components/runs/RunCard.vue'
import { allMatches } from '@/types/matches'

// Автоматически определяем статус матча на основе счета
const processedMatches = computed(() => {
  return allMatches.map((match) => {
    const isCompleted = match.players.some((player) => player.score >= 2)
    return {
      ...match,
      status: isCompleted ? 'completed' : match.status,
    }
  })
})

// Сортируем матчи: сначала live, потом upcoming, потом completed
const sortedMatches = computed(() => {
  return [...processedMatches.value].sort((a, b) => {
    const statusOrder = { live: 0, upcoming: 1, completed: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })
})

// Мок данные для демонстрации
const topRuns = [
  {
    id: 1,
    runner: { username: 'Feinberg', rank: 1 },
    category: 'Any% RSG',
    version: '1.16.1',
    time: '14:32',
    date: '2024-01-15'
  },
  {
    id: 2,
    runner: { username: 'Taptap_', rank: 2 },
    category: 'Set Seed',
    version: '1.20.1',
    time: '08:45',
    date: '2024-01-14'
  },
  {
    id: 3,
    runner: { username: 'Couriway', rank: 3 },
    category: 'Any% RSG',
    version: '1.16.1',
    time: '15:18',
    date: '2024-01-13'
  }
]

const leaderboard = [
  { id: 1, username: 'Feinberg', elo: 2450, rank: 1 },
  { id: 2, username: 'Taptap_', elo: 2380, rank: 2 },
  { id: 3, username: 'Couriway', elo: 2340, rank: 3 },
  { id: 4, username: 'CobbleGamer', elo: 2290, rank: 4 },
  { id: 5, username: 'CubicPolar', elo: 2250, rank: 5 }
]

const liveStreams = [
  { id: 1, runner: 'Feinberg', viewers: 1250 },
  { id: 2, runner: 'Taptap_', viewers: 890 },
  { id: 3, runner: 'CobbleGamer', viewers: 450 }
]
</script>
