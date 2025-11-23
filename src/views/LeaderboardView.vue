<template>
  <div class="min-h-screen bg-primary-bg">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-4">Рейтинг игроков</h1>
          <p class="text-gray-300 text-lg">Топ 50 игроков MCSR Ranked</p>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mb-4"></div>
          <div class="text-white text-lg">Загрузка рейтинга...</div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-red-400 text-lg mb-4">Ошибка загрузки рейтинга</div>
          <button
            @click="fetchLeaderboard"
            class="bg-accent-green hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>

        <!-- Таблица рейтинга -->
        <div v-else class="bg-primary-card rounded-lg border border-primary-hover overflow-hidden">
          <!-- Заголовок таблицы -->
          <div class="bg-gray-800 px-6 py-4 border-b border-primary-hover">
            <div class="grid grid-cols-10 gap-2 text-gray-300 font-semibold text-xs">
              <div class="col-span-1 text-center">Ранг</div>
              <div class="col-span-4">Игрок</div>
              <div class="col-span-2 text-center">ELO</div>
              <div class="col-span-2 text-center">Страна</div>
              <div class="col-span-1 text-center">Время</div>
            </div>
          </div>

          <!-- Список игроков -->
          <div class="divide-y divide-primary-hover">
            <div
              v-for="player in leaderboard"
              :key="player.uuid"
              class="px-6 py-4 hover:bg-primary-hover transition-colors"
            >
              <div class="grid grid-cols-10 gap-2 items-center">
                <!-- Ранг -->
                <div class="col-span-1 text-center">
                  <span class="font-bold text-lg" :class="getRankColor(player.rank)">
                    #{{ player.rank }}
                  </span>
                </div>

                <!-- Информация об игроке -->
                <div class="col-span-4 flex items-center space-x-3">
                  <!-- Аватар с рамкой -->
                  <div class="relative">
                    <div
                      class="w-10 h-10 rounded-lg overflow-hidden border-2"
                      :class="getBorderColor(player.rank)"
                    >
                      <img
                        :src="player.avatar"
                        :alt="player.username"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <!-- Имя и ник -->
                  <div class="flex-1 min-w-0">
                    <div class="text-white font-semibold truncate">{{ player.username }}</div>
                  </div>
                </div>

                <!-- ELO рейтинг -->
                <div class="col-span-2 text-center">
                  <div class="text-white font-bold text-lg">{{ Math.round(player.elo) }}</div>
                  <div class="text-gray-400 text-xs">ELO</div>
                </div>

                <!-- Флаг страны -->
                <div class="col-span-2 text-center">
                  <div v-if="player.country" class="flex items-center justify-center space-x-1">
                    <img
                      :src="getFlagUrl(player.country)"
                      :alt="player.country"
                      class="w-5 h-3 rounded shadow"
                      loading="lazy"
                    />
                    <span class="text-white font-medium text-xs">{{ getCountryName(player.country) }}</span>
                  </div>
                  <div v-else class="text-gray-500 text-xs">-</div>
                </div>

                <!-- Лучшее время -->
                <div class="col-span-1 text-center">
                  <div v-if="player.bestTime" class="text-white font-bold text-sm">
                    {{ formatTime(player.bestTime) }}
                  </div>
                  <div v-else class="text-gray-500 text-xs">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from '@/components/layout/Header.vue'

// Константы
const PLAYERS_COUNT = 50

// Состояния
const leaderboard = ref<any[]>([])
const loading = ref(true)
const error = ref(false)

// Генерация Minecraft аватара
const generateMinecraftAvatar = (username: string) => {
  return `https://mineskin.eu/helm/${encodeURIComponent(username)}/64.png`
}

// Генерация URL флага
const getFlagUrl = (countryCode: string) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
}

// Получение названия страны по коду на русском
const getCountryName = (countryCode: string) => {
  const countryNames: { [key: string]: string } = {
    'us': 'США',
    'gb': 'Великобритания',
    'ru': 'Россия',
    'de': 'Германия',
    'fr': 'Франция',
    'br': 'Бразилия',
    'se': 'Швеция',
    'cf': 'ЦАР',
    'ca': 'Канада',
    'au': 'Австралия',
    'jp': 'Япония',
    'kr': 'Корея',
    'cn': 'Китай',
    'pl': 'Польша',
    'ua': 'Украина',
    'nl': 'Нидерланды',
    'it': 'Италия',
    'es': 'Испания',
    'fi': 'Финляндия',
    'no': 'Норвегия',
    'dk': 'Дания',
    'cz': 'Чехия',
    'sk': 'Словакия',
    'hu': 'Венгрия',
    'at': 'Австрия',
    'ch': 'Швейцария',
    'be': 'Бельгия',
    'pt': 'Португалия',
    'gr': 'Греция',
    'tr': 'Турция'
  }
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase()
}

// Цвета рангов
const getRankColor = (rank: number) => {
  const colors = {
    1: 'text-yellow-400',      // Золото
    2: 'text-silver',          // Серебро
    3: 'text-bronze'           // Бронза
  }
  return colors[rank as keyof typeof colors] || 'text-white'
}

// Цвета рамок для аватаров
const getBorderColor = (rank: number) => {
  const colors = {
    1: 'border-yellow-400',      // Золото для #1
    2: 'border-gray-400',        // Серебро для #2
    3: 'border-yellow-700',      // Бронза для #3
  }
  return colors[rank as keyof typeof colors] || 'border-[#77bb55]'
}

// Форматирование времени из миллисекунд в читаемый формат (без миллисекунд)
const formatTime = (timeInMs: number) => {
  if (!timeInMs) return '-'

  const totalSeconds = Math.floor(timeInMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Загрузка рейтинга (упрощенная версия)
const fetchLeaderboard = async () => {
  try {
    loading.value = true
    error.value = false

    // Загружаем основной рейтинг и лучшие времена параллельно
    const [leaderboardResponse, bestTimesResponse] = await Promise.all([
      fetch('https://mcsrranked.com/api/leaderboard'),
      fetch('https://mcsrranked.com/api/record-leaderboard?distinct=true')
    ])

    if (!leaderboardResponse.ok || !bestTimesResponse.ok) {
      throw new Error('Ошибка загрузки данных')
    }

    const [leaderboardData, bestTimesData] = await Promise.all([
      leaderboardResponse.json(),
      bestTimesResponse.json()
    ])

    // Создание мапы лучших времен
    const bestTimesMap = new Map()
    if (bestTimesData.status === 'success' && Array.isArray(bestTimesData.data)) {
      bestTimesData.data.forEach((record: any) => {
        if (record.user?.uuid && record.time) {
          bestTimesMap.set(record.user.uuid, record.time)
        }
      })
    }

    // Обработка данных рейтинга
    if (leaderboardData.status === 'success' && leaderboardData.data?.users) {
      leaderboard.value = leaderboardData.data.users
        .slice(0, PLAYERS_COUNT)
        .map((player: any, index: number) => ({
          uuid: player.uuid,
          username: player.nickname || 'Unknown',
          elo: player.eloRate || 0,
          rank: player.eloRank || index + 1,
          avatar: generateMinecraftAvatar(player.nickname),
          country: player.country,
          bestTime: bestTimesMap.get(player.uuid) || null
        }))
    } else {
      throw new Error('Неверная структура ответа API')
    }

  } catch (err) {
    console.error('Ошибка при загрузке рейтинга:', err)
    error.value = true
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLeaderboard()
})
</script>

<style scoped>
.text-silver {
  color: #c0c0c0;
}

.text-bronze {
  color: #cd7f32;
}

/* Анимация загрузки */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
