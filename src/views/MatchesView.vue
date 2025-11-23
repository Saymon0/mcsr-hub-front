<template>
  <div class="min-h-screen bg-gray-900">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Матчи</h1>
        <p class="text-gray-400 text-lg">Актуальные матчи и турниры MCSR Ranked</p>
      </div>

      <!-- Фильтры -->
      <div class="flex flex-wrap gap-4 mb-8">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          @click="setStatusFilter(status.value)"
          class="px-4 py-2 rounded-lg border transition-all duration-200 font-medium"
          :class="activeStatusFilter === status.value
            ? 'bg-[#77bb55] border-[#77bb55] text-white'
            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-[#77bb55] hover:text-white'"
        >
          {{ status.label }}
        </button>
      </div>

      <!-- Турнирные карточки -->
      <div class="space-y-6">
        <!-- Ranked Playoffs -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <!-- Заголовок турнира -->
          <div class="bg-gradient-to-r from-gray-750 to-gray-800 px-6 py-4 border-b border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">🏆</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">Ranked Playoffs</h2>
                  <p class="text-gray-400">Серия четвертьфинальных матчей</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-white font-bold text-xl">$11,500</div>
                <div class="text-gray-400">Призовой фонд</div>
              </div>
            </div>
          </div>

          <!-- Матчи турнира -->
          <div class="divide-y divide-gray-700">
            <div
              v-for="match in rankedPlayoffsMatches"
              :key="match.id"
              class="p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <!-- Статус матча -->
                  <div
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusClass(match.status)"
                  >
                    {{ getStatusText(match.status) }}
                  </div>

                  <!-- Время матча -->
                  <div class="text-gray-400 text-sm">
                    {{ formatMatchTime(match.date) }}
                  </div>
                </div>

                <!-- Зрители -->
                <div v-if="match.viewers" class="flex items-center space-x-2 text-gray-400">
                  <span>👁️</span>
                  <span>{{ match.viewers.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Игроки -->
              <div class="grid grid-cols-2 gap-6">
                <div
                  v-for="player in match.players"
                  :key="player.id"
                  class="flex items-center justify-between p-4 bg-gray-750 rounded-lg border-2 transition-all"
                  :class="getPlayerBorderClass(player, match.players.indexOf(player))"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      :src="player.avatar"
                      :alt="player.name"
                      class="w-12 h-12 rounded-lg"
                    />
                    <div>
                      <div class="text-white font-bold">{{ player.name }}</div>
                      <div class="text-gray-400 text-sm">Ранг #{{ player.rank }}</div>
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-white font-bold text-xl">{{ player.score }}</div>
                    <div class="text-gray-400 text-sm">очки</div>
                  </div>
                </div>
              </div>

              <!-- Детали матча -->
              <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                <span>{{ match.category }}</span>
                <span>•</span>
                <span>{{ match.version }}</span>
                <span>•</span>
                <span>{{ match.seedType }}</span>
                <span>•</span>
                <span>{{ match.format }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Другие турниры -->
        <div
          v-for="tournament in otherTournaments"
          :key="tournament"
          class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <!-- Заголовок турнира -->
          <div class="bg-gradient-to-r from-gray-750 to-gray-800 px-6 py-4 border-b border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span class="text-white font-bold text-lg">⚡</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white">{{ tournament }}</h2>
                  <p class="text-gray-400">Турнирные матчи</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Матчи турнира -->
          <div class="divide-y divide-gray-700">
            <div
              v-for="match in getMatchesByTournament(tournament)"
              :key="match.id"
              class="p-6 hover:bg-gray-750 transition-colors cursor-pointer"
              @click="$router.push(`/match/${match.id}`)"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <!-- Статус матча -->
                  <div
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="getStatusClass(match.status)"
                  >
                    {{ getStatusText(match.status) }}
                  </div>

                  <!-- Время матча -->
                  <div class="text-gray-400 text-sm">
                    {{ formatMatchTime(match.date) }}
                  </div>
                </div>

                <!-- Зрители -->
                <div v-if="match.viewers" class="flex items-center space-x-2 text-gray-400">
                  <span>👁️</span>
                  <span>{{ match.viewers.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Игроки -->
              <div class="grid grid-cols-2 gap-6">
                <div
                  v-for="player in match.players"
                  :key="player.id"
                  class="flex items-center justify-between p-4 bg-gray-750 rounded-lg border-2 transition-all"
                  :class="getPlayerBorderClass(player, match.players.indexOf(player))"
                >
                  <div class="flex items-center space-x-3">
                    <img
                      :src="player.avatar"
                      :alt="player.name"
                      class="w-12 h-12 rounded-lg"
                    />
                    <div>
                      <div class="text-white font-bold">{{ player.name }}</div>
                      <div class="text-gray-400 text-sm">Ранг #{{ player.rank }}</div>
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-white font-bold text-xl">{{ player.score }}</div>
                    <div class="text-gray-400 text-sm">очки</div>
                  </div>
                </div>
              </div>

              <!-- Детали матча -->
              <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                <span>{{ match.category }}</span>
                <span>•</span>
                <span>{{ match.version }}</span>
                <span>•</span>
                <span>{{ match.seedType }}</span>
                <span>•</span>
                <span>{{ match.format }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { allMatches, type Match, type MatchPlayer, getMatchesWithAllData } from '@/types/matches'

const router = useRouter()

// Фильтры статусов
const statusFilters = [
  { value: 'all', label: 'Все матчи' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'live', label: 'В эфире' },
  { value: 'completed', label: 'Завершенные' }
]

const activeStatusFilter = ref('all')

// Загружаем матчи с актуальными данными из API
const matches = ref<Match[]>([])

// Инициализация данных
getMatchesWithAllData().then(data => {
  matches.value = data
})

// Фильтрация матчей по статусу
const filteredMatches = computed(() => {
  if (activeStatusFilter.value === 'all') {
    return matches.value
  }
  return matches.value.filter(match => match.status === activeStatusFilter.value)
})

// Матчи только для Ranked Playoffs
const rankedPlayoffsMatches = computed(() => {
  return filteredMatches.value.filter(match => match.tournament === 'Ranked Playoffs')
})

// Другие турниры
const otherTournaments = computed(() => {
  const tournaments = new Set(matches.value.map(match => match.tournament))
  tournaments.delete('Ranked Playoffs')
  return Array.from(tournaments)
})

// Функция для получения матчей по турниру
const getMatchesByTournament = (tournament: string) => {
  return filteredMatches.value.filter(match => match.tournament === tournament)
}

// Функции для работы со статусами
const setStatusFilter = (status: string) => {
  activeStatusFilter.value = status
}

const getStatusClass = (status: string) => {
  const classes = {
    'upcoming': 'bg-[#77bb55] text-white',
    'live': 'bg-red-600 text-white',
    'completed': 'bg-gray-600 text-white'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-500 text-white'
}

const getStatusText = (status: string) => {
  const texts = {
    'upcoming': 'СКОРО',
    'live': 'В ЭФИРЕ',
    'completed': 'ЗАВЕРШЕНО'
  }
  return texts[status as keyof typeof texts] || status
}

// Форматирование времени
const formatMatchTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Классы для границ игроков
const getPlayerBorderClass = (player: MatchPlayer, index: number) => {
  // Для завершенных матчей показываем победителя
  const match = matches.value.find(m => m.players.includes(player))
  if (match?.status === 'completed') {
    return player.score >= 2 ? 'border-[#77bb55]' : 'border-red-500'
  }
  // Для live матчей выделяем первого игрока
  if (match?.status === 'live') {
    return index === 0 ? 'border-red-500' : 'border-gray-600'
  }
  // Для upcoming матчей стандартная граница
  return 'border-gray-600'
}
</script>

<style scoped>
.bg-primary-bg {
  background-color: #111827;
}
</style>
