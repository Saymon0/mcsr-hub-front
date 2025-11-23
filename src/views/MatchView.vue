<template>
  <div>
    <Header />

    <main class="container mx-auto px-4 py-6" v-if="currentMatch">
      <!-- Хлебные крошки -->
      <nav class="flex items-center space-x-2 text-gray-400 mb-6 text-sm">
        <RouterLink to="/" class="hover:text-[#77bb55] transition-colors">Главная</RouterLink>
        <span>›</span>
        <RouterLink to="/" class="hover:text-[#77bb55] transition-colors">Матчи</RouterLink>
        <span>›</span>
        <span class="text-white">{{ currentMatch.tournament }}</span>
      </nav>

      <!-- Основная информация о матче -->
      <div class="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-white mb-2">{{ currentMatch.tournament }}</h1>
            <p v-if="currentMatch.description" class="text-gray-300 mb-3">
              {{ currentMatch.description }}
            </p>
            <div class="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
              <span class="bg-gray-700 px-2 py-1 rounded">{{ currentMatch.category }}</span>
              <span class="bg-gray-700 px-2 py-1 rounded">{{ currentMatch.version }}</span>
              <span class="bg-gray-700 px-2 py-1 rounded">{{ currentMatch.seedType }}</span>
              <span class="bg-gray-700 px-2 py-1 rounded">{{ currentMatch.format }}</span>
              <span v-if="currentMatch.prizePool" class="bg-yellow-600 px-2 py-1 rounded">
                Призовой фонд: ${{ currentMatch.prizePool.toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Статус матча -->
          <div class="mt-4 lg:mt-0 lg:text-right">
            <div
              v-if="currentMatch.status === 'live'"
              class="flex items-center space-x-3 bg-red-600 px-4 py-2 rounded-lg text-white"
            >
              <span class="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <div>
                <div class="font-bold">В ЭФИРЕ</div>
                <div class="text-sm opacity-90">{{ currentMatch.viewers }} зрителей</div>
              </div>
            </div>
            <div
              v-else-if="currentMatch.status === 'completed'"
              class="bg-gray-600 px-4 py-2 rounded-lg text-white"
            >
              <div class="font-bold">ЗАВЕРШЕНО</div>
              <div class="text-sm opacity-90">{{ formatMatchDate(currentMatch.date) }}</div>
            </div>
            <div v-else class="bg-[#77bb55] px-4 py-2 rounded-lg text-white">
              <div class="font-bold">СКОРО</div>
              <div class="text-sm opacity-90">{{ formatDetailedDate(currentMatch.date) }}</div>
            </div>
          </div>
        </div>

        <!-- Участники матча -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div
            v-for="(player, index) in currentMatch.players"
            :key="player.id"
            class="bg-gray-750 rounded-lg p-4 border-2 transition-all duration-300"
            :class="getPlayerCardClass(player, index)"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <PlayerAvatar :player="player" :size="'lg'" />
                <div>
                  <div class="text-white font-bold text-lg">{{ player.name }}</div>
                  <div class="text-gray-400 text-sm">Ранг #{{ player.rank }}</div>
                  <div class="text-gray-400 text-sm">
                    Лучшее время:
                    <span v-if="player.bestTime" class="text-white font-medium">
                      {{ player.bestTime }}
                    </span>
                    <span v-else class="text-gray-500">—</span>
                  </div>
                </div>
              </div>

              <div
                v-if="currentMatch.status === 'completed'"
                class="text-xl font-bold"
                :class="player.score >= 2 ? 'text-[#77bb55]' : 'text-red-500'"
              >
                {{ player.score >= 2 ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ' }}
              </div>
            </div>

            <!-- Статистика игрока -->
            <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div class="text-gray-400">Процент побед:</div>
              <div class="text-white text-right">{{ player.winRate }}%</div>
              <div class="text-gray-400">Всего забегов:</div>
              <div class="text-white text-right">{{ player.totalRuns }}</div>
            </div>

            <!-- Счет игр -->
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-400 text-sm">Выигранные игры:</span>
              <div class="flex items-center space-x-3">
                <div class="flex space-x-1">
                  <div
                    v-for="n in 2"
                    :key="n"
                    class="w-5 h-5 rounded-full border-2 transition-colors"
                    :class="
                      n <= player.score
                        ? 'bg-[#77bb55] border-[#77bb55]'
                        : 'bg-transparent border-gray-500'
                    "
                  ></div>
                </div>
                <span class="text-white font-bold min-w-[40px] text-right"
                  >{{ player.score }}/2</span
                >
              </div>
            </div>

            <!-- Ссылка на трансляцию -->
            <a
              v-if="player.twitch"
              :href="player.twitch"
              target="_blank"
              class="block w-full bg-[#6441a5] hover:bg-[#7d5bbe] text-white text-center py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              📺 Смотреть на Twitch
            </a>
          </div>
        </div>
      </div>

      <!-- Детальная информация -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Информация о матче -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-white font-bold mb-4 text-lg">Детали матча</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Формат:</span>
              <span class="text-white font-medium">{{ currentMatch.format }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Тип сида:</span>
              <span class="text-white font-medium">{{ currentMatch.seedType }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Версия:</span>
              <span class="text-white font-medium">{{ currentMatch.version }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Категория:</span>
              <span class="text-white font-medium">{{ currentMatch.category }}</span>
            </div>
          </div>
        </div>

        <!-- Статистика матча -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 class="text-white font-bold mb-4 text-lg">Статистика матча</h2>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Статус:</span>
              <span class="text-white font-medium capitalize">{{ getStatusText(currentMatch.status) }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-700">
              <span class="text-gray-400">Дата:</span>
              <span class="text-white font-medium">{{
                formatDetailedDate(currentMatch.date)
              }}</span>
            </div>
            <div
              v-if="currentMatch.viewers"
              class="flex justify-between items-center py-2 border-b border-gray-700"
            >
              <span class="text-gray-400">Пик зрителей:</span>
              <span class="text-white font-medium">{{
                currentMatch.viewers.toLocaleString()
              }}</span>
            </div>
            <div
              v-if="currentMatch.prizePool"
              class="flex justify-between items-center py-2 border-b border-gray-700"
            >
              <span class="text-gray-400">Призовой фонд:</span>
              <span class="text-white font-medium"
                >${{ currentMatch.prizePool.toLocaleString() }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Загрузка матча -->
    <div v-else class="container mx-auto px-4 py-6">
      <div class="text-center text-white min-h-[60vh] flex flex-col justify-center">
        <!-- Анимация загрузки -->
        <div class="flex justify-center mb-8">
          <div class="relative">
            <!-- Внешнее кольцо -->
            <div class="w-20 h-20 border-4 border-gray-600 rounded-full animate-spin"></div>
            <!-- Внутреннее кольцо -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="w-12 h-12 border-4 border-[#77bb55] rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
            </div>
            <!-- Центральная точка -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="w-3 h-3 bg-[#77bb55] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Текст -->
        <div class="space-y-4">
          <p class="text-2xl font-bold text-gray-300 mb-2">Загрузка матча...</p>
          <p class="text-gray-400 text-lg">Пожалуйста, подождите</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
import { allMatches, type Match, type MatchPlayer, getMatchesWithAllData } from '@/types/matches'

const route = useRoute()
const matchId = parseInt(route.params.id as string)

// Получаем текущий матч по ID с обновленными данными из API
const currentMatch = ref<Match | null>(null)

// Загружаем данные при монтировании компонента
onMounted(async () => {
  const matchesWithAllData = await getMatchesWithAllData()
  const match = matchesWithAllData.find((match) => match.id === matchId)
  currentMatch.value = match || null
})

// Следим за изменением route
watch(() => route.params.id, async (newId) => {
  const newMatchId = parseInt(newId as string)
  const matchesWithAllData = await getMatchesWithAllData()
  const match = matchesWithAllData.find((match) => match.id === newMatchId)
  currentMatch.value = match || null
})

// Форматирование даты для upcoming матчей
const formatDetailedDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Форматирование даты для завершенных матчей
const formatMatchDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Перевод статусов на русский
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'upcoming': 'скоро',
    'live': 'в эфире',
    'completed': 'завершено'
  }
  return statusMap[status] || status
}

// Классы для карточек игроков
const getPlayerCardClass = (player: MatchPlayer, index: number) => {
  if (currentMatch.value?.status === 'completed') {
    return player.score >= 2 ? 'border-[#77bb55] bg-gray-750' : 'border-red-500 bg-gray-750'
  } else if (currentMatch.value?.status === 'live') {
    return index === 0 ? 'border-red-500' : 'border-gray-600'
  }
  return 'border-gray-600'
}
</script>
