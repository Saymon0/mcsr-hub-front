<template>
  <div class="min-h-screen bg-void-purple relative">
    <!-- Фоновое изображение -->
    <div class="fixed inset-0 -z-10">
      <img src="/background.png" alt="Background" class="w-full h-full" />
      <div class="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-violet-950/20"></div>
    </div>

    <Header />

    <main class="container mx-auto px-4 py-8 relative z-10">
      <div class="max-w-7xl mx-auto">
        <!-- Заголовок -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-end-light mb-4">Рейтинг игроков</h1>
          <p class="text-end-muted text-lg">Топ 100 игроков MCSR Ranked</p>
        </div>

        <!-- Состояние загрузки -->
        <div v-if="loading" class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-end-purple mb-4"
          ></div>
          <div class="text-end-light text-lg">Загрузка рейтинга...</div>
        </div>

        <!-- Ошибка -->
        <div v-else-if="error" class="text-center py-12">
          <div class="text-end-warning text-lg mb-4">Ошибка загрузки рейтинга</div>
          <button
            @click="fetchLeaderboard"
            class="bg-end-purple hover:bg-end-accent text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>

        <!-- Таблица рейтинга -->
        <div
          v-else
          class="bg-end-dark/80 rounded-lg border border-end-accent overflow-hidden backdrop-blur-3xl"
        >
          <!-- Заголовок таблицы -->
          <div class="bg-end-secondary/70 px-6 py-4 border-b border-end-accent">
            <div class="grid grid-cols-10 gap-2 text-end-light font-semibold text-xs">
              <div class="col-span-1 text-center">Ранг</div>
              <div class="col-span-4">Игрок</div>
              <div class="col-span-2 text-center">ELO</div>
              <div class="col-span-2 text-center">Страна</div>
              <div class="col-span-1 text-center">Лучшее Время</div>
            </div>
          </div>

          <!-- Список игроков -->
          <div class="divide-y divide-end-accent/30">
            <div
              v-for="player in leaderboard"
              :key="player.uuid"
              class="px-6 py-4 hover:bg-end-secondary/50 transition-colors group border-end-accent"
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
                  <!-- Аватар с анимированной рамкой -->
                  <div class="relative">
                    <div
                      class="w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-in-out"
                      :class="[getAvatarBorderColor(player.rank), getAvatarAnimation(player.rank)]"
                    >
                      <img
                        :src="player.avatar"
                        :alt="player.username"
                        class="w-full h-full object-cover"
                        loading="lazy"
                        @error="handleAvatarError"
                      />
                    </div>

                    <!-- Корона для #1 ранга -->
                    <div
                      v-if="player.rank === 1"
                      class="absolute -top-1 -left-1 text-yellow-400 text-xs"
                    >
                      👑
                    </div>
                  </div>

                  <!-- Имя и ник -->
                  <div class="flex-1 min-w-0">
                    <div
                      class="text-end-light font-semibold truncate group-hover:text-white transition-colors"
                    >
                      {{ player.username }}
                    </div>
                  </div>
                </div>

                <!-- ELO рейтинг -->
                <div class="col-span-2 text-center">
                  <div class="text-end-light font-bold text-lg">{{ Math.round(player.elo) }}</div>
                  <div class="text-end-muted text-xs">ELO</div>
                </div>

                <!-- Флаг страны -->
                <div class="col-span-2 text-center">
                  <div v-if="player.country" class="flex items-center justify-center space-x-2">
                    <img
                      :src="getFlagUrl(player.country)"
                      :alt="player.country"
                      class="w-5 h-3 rounded shadow border border-end-accent"
                      loading="lazy"
                    />
                    <span class="text-end-light font-medium text-xs">{{
                      getCountryName(player.country)
                    }}</span>
                  </div>
                  <div v-else class="text-end-muted text-xs">-</div>
                </div>

                <!-- Лучшее время -->
                <div class="col-span-1 text-center">
                  <div v-if="player.bestTime" class="text-end-light font-bold text-sm">
                    {{ formatTime(player.bestTime) }}
                  </div>
                  <div v-else class="text-end-muted text-xs">-</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Футер таблицы -->
          <div class="bg-end-secondary/50 px-6 py-3 border-t border-end-accent">
            <div class="text-center text-end-light text-sm">Обновляется каждые 10 минут</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Константы
const PLAYERS_COUNT = 100

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

// Обработка ошибки загрузки аватара
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const username = target.alt
  target.src = `https://mineskin.eu/helm/${encodeURIComponent(username)}`
}

// Получение названия страны по коду на русском
const getCountryName = (countryCode: string) => {
  const countryNames: { [key: string]: string } = {
    us: 'США',
    gb: 'Великобритания',
    ru: 'Россия',
    de: 'Германия',
    fr: 'Франция',
    br: 'Бразилия',
    se: 'Швеция',
    cf: 'ЦАР',
    ca: 'Канада',
    au: 'Австралия',
    jp: 'Япония',
    kr: 'Корея',
    cn: 'Китай',
    pl: 'Польша',
    ua: 'Украина',
    nl: 'Нидерланды',
    it: 'Италия',
    es: 'Испания',
    fi: 'Финляндия',
    no: 'Норвегия',
    dk: 'Дания',
    cz: 'Чехия',
    sk: 'Словакия',
    hu: 'Венгрия',
    at: 'Австрия',
    ch: 'Швейцария',
    be: 'Бельгия',
    pt: 'Португалия',
    gr: 'Греция',
    tr: 'Турция',
  }
  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase()
}

// Цвета рангов
const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-silver'
  if (rank === 3) return 'text-bronze'
  return 'text-end-light'
}

// Цвета обводки аватаров на основе ранга
const getAvatarBorderColor = (rank: number) => {
  const colors = {
    1: 'border-yellow-400', // Золото для #1
    2: 'border-gray-300', // Серебро для #2
    3: 'border-amber-700', // Бронза для #3
  }
  return colors[rank as keyof typeof colors] || 'border-end-accent'
}

// Анимации обводки аватаров на основе ранга
const getAvatarAnimation = (rank: number) => {
  const animations = {
    1: 'animate-gold-pulse', // Золото с pulse анимацией
    2: 'animate-silver-pulse', // Серебро с pulse анимацией
    3: 'animate-bronze-pulse', // Бронза с pulse анимацией
  }
  return animations[rank as keyof typeof animations] || ''
}

// Форматирование времени из миллисекунд в читаемый формат (без миллисекунд)
const formatTime = (timeInMs: number) => {
  if (!timeInMs) return '-'

  const totalSeconds = Math.floor(timeInMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Загрузка рейтинга
const fetchLeaderboard = async () => {
  try {
    loading.value = true
    error.value = false

    let leaderboardData: any = null
    let bestTimesData: any = null

    try {
      // Создаем AbortController для ограничения времени ожидания (таймаута)
      const controller = new AbortController()
      // Если официальный API не ответит за 3000 мс (3 секунды), мы принудительно обрываем запрос
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      // 1. Пробуем запросить оригинальный API (передаем signal контроллера)
      const [leaderboardResponse, bestTimesResponse] = await Promise.all([
        fetch('https://mcsrranked.com/api/leaderboard', { signal: controller.signal }),
        fetch('https://mcsrranked.com/api/record-leaderboard?distinct=true', {
          signal: controller.signal,
        }),
      ])

      // Если успели получить ответ раньше 3 секунд, отменяем таймаут
      clearTimeout(timeoutId)

      if (!leaderboardResponse.ok || !bestTimesResponse.ok) {
        throw new Error('Официальный API ответил ошибкой')
      }

      leaderboardData = await leaderboardResponse.json()
      bestTimesData = await bestTimesResponse.json()
    } catch (apiErr) {
      // Сюда приложение попадет И при ошибке сети (блокировке), И если сработал наш таймаут в 3 секунды
      console.log(
        'Официальный API недоступен или отвечает слишком долго. Загружаем локальный кэш...',
      )

      // Запрашиваем локальный файл из папки public
      const cacheResponse = await fetch('/mcsr_cache.json')

      if (!cacheResponse.ok) {
        throw new Error(`Не удалось загрузить локальный кэш: ${cacheResponse.status}`)
      }

      const cacheJson = await cacheResponse.json()

      // Распаковываем структуру кэша
      if (cacheJson.leaderboard) {
        leaderboardData = cacheJson.leaderboard
        bestTimesData = cacheJson.bestTimes
      } else {
        leaderboardData = cacheJson
        bestTimesData = null
      }
    }

    // --- Дальнейшая обработка данных (остается без изменений) ---
    let processedPlayers: any[] = []

    if (Array.isArray(leaderboardData)) {
      processedPlayers = leaderboardData
        .slice(0, PLAYERS_COUNT)
        .map((player: any, index: number) => ({
          uuid: player.uuid,
          username: player.nickname || player.username || 'Unknown',
          elo: player.elo || player.eloRate || 0,
          rank: player.rank || player.eloRank || index + 1,
          avatar: generateMinecraftAvatar(player.nickname || player.username),
          country: player.country,
          bestTime: player.bestTime || null,
        }))
    } else if (
      leaderboardData &&
      leaderboardData.status === 'success' &&
      leaderboardData.data?.users
    ) {
      const bestTimesMap = new Map()
      if (
        bestTimesData &&
        bestTimesData.status === 'success' &&
        Array.isArray(bestTimesData.data)
      ) {
        bestTimesData.data.forEach((record: any) => {
          if (record.user?.uuid && record.time) {
            bestTimesMap.set(record.user.uuid, record.time)
          }
        })
      }

      processedPlayers = leaderboardData.data.users
        .slice(0, PLAYERS_COUNT)
        .map((player: any, index: number) => ({
          uuid: player.uuid,
          username: player.nickname || 'Unknown',
          elo: player.eloRate || 0,
          rank: player.eloRank || index + 1,
          avatar: generateMinecraftAvatar(player.nickname),
          country: player.country,
          bestTime: bestTimesMap.get(player.uuid) || null,
        }))
    } else {
      throw new Error('Не удалось прочитать структуру данных')
    }

    leaderboard.value = processedPlayers
  } catch (err) {
    console.error('Критическая ошибка загрузки рейтинга:', err)
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

/* Анимации для аватаров рейтинга */
@keyframes goldPulse {
  0%,
  100% {
    box-shadow: 0 0 3px rgba(234, 179, 8, 0.5);
    border-color: rgb(234, 179, 8);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 8px rgba(234, 179, 8, 0.8),
      inset 0 0 8px rgba(234, 179, 8, 0.3);
    border-color: rgb(250, 204, 21);
    transform: scale(1.05);
  }
}

@keyframes silverPulse {
  0%,
  100% {
    box-shadow: 0 0 3px rgba(209, 213, 219, 0.4);
    border-color: rgb(209, 213, 219);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 6px rgba(209, 213, 219, 0.7),
      inset 0 0 6px rgba(255, 255, 255, 0.3);
    border-color: rgb(243, 244, 246);
    transform: scale(1.05);
  }
}

@keyframes bronzePulse {
  0%,
  100% {
    box-shadow: 0 0 3px rgba(180, 83, 9, 0.4);
    border-color: rgb(180, 83, 9);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 6px rgba(180, 83, 9, 0.7),
      inset 0 0 6px rgba(217, 119, 6, 0.3);
    border-color: rgb(217, 119, 6);
    transform: scale(1.05);
  }
}

.animate-gold-pulse {
  animation: goldPulse 2.5s ease-in-out infinite;
}

.animate-silver-pulse {
  animation: silverPulse 2.5s ease-in-out infinite;
}

.animate-bronze-pulse {
  animation: bronzePulse 2.5s ease-in-out infinite;
}
</style>

<style>
/* Глобальные стили для фиолетовой темы */

.bg-end-dark {
  background-color: #2d1b69;
}

.bg-end-secondary {
  background-color: #3c2a7a;
}

.bg-end-purple {
  background-color: #7c3aed;
}

.bg-end-accent {
  background-color: #8b5cf6;
}

.bg-end-warning {
  background-color: #f59e0b;
}

.text-end-light {
  color: #e9d5ff;
}

.text-end-muted {
  color: #a78bfa;
}

.border-end-accent {
  border-color: #8b5cf6;
}

.hover\:bg-end-accent:hover {
  background-color: #8b5cf6;
}

.hover\:text-end-accent:hover {
  color: #8b5cf6;
}

.text-end-purple {
  color: #7c3aed;
}
</style>
