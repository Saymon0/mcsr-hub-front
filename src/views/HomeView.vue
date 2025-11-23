<template>
  <div class="min-h-screen bg-primary-bg">
    <Header />

    <!-- Блок с матчами -->
    <section class="bg-primary-card border-b border-primary-hover py-6">
      <div class="container mx-auto px-4">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-white text-center mb-6">Текущие матчи</h2>

        <!-- Состояние загрузки матчей -->
        <div v-if="loadingMatches" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mb-4"></div>
          <div class="text-white text-lg">Загрузка матчей...</div>
        </div>

        <!-- Сетка матчей по центру -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 justify-items-center max-w-7xl mx-auto"
        >
          <MatchCard
            v-for="match in sortedMatches"
            :key="match.id"
            :match="match"
          />
        </div>
      </div>
    </section>

    <!-- Секция описания и кнопок -->
    <section class="bg-primary-card border-b border-primary-hover py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            Minecraft Speedrunning Hub
          </h2>
          <p class="text-white text-lg md:text-xl mb-8 leading-relaxed">
            Ваш главный ресурс по Minecraft спидранну: гайды, мировые рекорды, турниры и прямые трансляции.
            Соревнуйтесь и улучшайте свои навыки вместе с лучшими раннерами мира!
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://discord.gg/mcsr-ranked-1056779246728658984"
              target="_blank"
              class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>🌟 Присоединиться к сообществу</span>
            </a>

            <RouterLink
              to="/world-records"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>🏆 Мировые рекорды</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Основной контент с сайдбарами -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Основной контент -->
        <div class="lg:col-span-3">
          <div class="bg-primary-card rounded-lg p-6 border border-primary-hover">
            <h2 class="text-2xl font-bold text-white mb-4">Добро пожаловать в Minecraft Speedrunning Hub</h2>
            <p class="text-white mb-4">
              Самый полный ресурс для спидраннеров Minecraft. Здесь вы найдете:
            </p>
            <ul class="text-white list-disc list-inside space-y-2">
              <li>Текущие турниры и матчи</li>
              <li>Рейтинг лучших игроков</li>
              <li>Прямые трансляции</li>
              <li>Мировые рекорды</li>
              <li>Обучение и гайды</li>
            </ul>
          </div>

          <!-- Прямые трансляции в центре -->
          <div class="bg-primary-card rounded-lg border border-primary-hover mt-6">
            <div class="bg-gray-800 px-6 py-4 border-b border-primary-hover">
              <h3 class="text-white font-bold text-xl">Прямые трансляции</h3>
            </div>

            <!-- Состояние загрузки -->
            <div v-if="loadingStreams" class="p-8 text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mb-4"></div>
              <div class="text-white text-lg">Проверка трансляций...</div>
            </div>

            <!-- Нет онлайн стримов -->
            <div v-else-if="onlineStreamers.length === 0" class="p-8 text-center">
              <div class="text-gray-400 text-lg">Сейчас никто не стримит</div>
              <div class="text-gray-500 text-sm mt-2">Попробуйте зайти позже</div>
            </div>

            <!-- Онлайн стримы -->
            <div v-else class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="streamer in onlineStreamers"
                  :key="streamer.login"
                  class="twitch-stream-container bg-gray-800 rounded-lg p-4"
                >
                  <!-- Twitch Embed -->
                  <div :id="`twitch-${streamer.login}`" class="twitch-embed-wrapper mb-3"></div>

                  <!-- Информация о стримере -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <img
                        :src="streamer.avatar"
                        :alt="streamer.name"
                        class="w-8 h-8 rounded"
                        @error="handleAvatarError"
                      />
                      <div>
                        <span class="text-white text-sm font-medium block">{{ streamer.name }}</span>
                        <span class="text-gray-400 text-xs">{{ streamer.viewer_count }} зрителей</span>
                      </div>
                    </div>
                    <a
                      :href="`https://www.twitch.tv/${streamer.login}`"
                      target="_blank"
                      class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Смотреть</span>
                    </a>
                  </div>
                  <!-- Название стрима -->
                  <div class="mt-3">
                    <p class="text-gray-300 text-sm line-clamp-2" :title="streamer.title">
                      {{ streamer.title }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Сайдбар -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Рейтинг Лидеров -->
          <div class="bg-primary-card rounded-lg border border-primary-hover">
            <div class="bg-gray-800 px-4 py-3 border-b border-primary-hover">
              <h3 class="text-white font-bold text-lg">Рейтинг Лидеров</h3>
            </div>

            <!-- Состояние загрузки -->
            <div v-if="loadingLeaderboard" class="p-4 text-center">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent-green mb-2"></div>
              <div class="text-white text-sm">Загрузка рейтинга...</div>
            </div>

            <!-- Ошибка загрузки -->
            <div v-else-if="leaderboardError" class="p-4 text-center">
              <div class="text-red-400 text-sm mb-2">Ошибка загрузки</div>
              <button
                @click="fetchLeaderboard"
                class="text-accent-green hover:text-green-400 text-sm"
              >
                Попробовать снова
              </button>
            </div>

            <!-- Данные рейтинга -->
            <div v-else class="divide-y divide-primary-hover">
              <div
                v-for="player in realLeaderboard"
                :key="player.uuid"
                class="flex items-center justify-between px-4 py-3 hover:bg-primary-hover transition-colors group"
              >
                <div class="flex items-center space-x-3 flex-1">
                  <!-- Позиция в рейтинге -->
                  <span
                    class="font-bold w-6 text-sm text-center"
                    :class="getRankColor(player.rank)"
                  >
                    #{{ player.rank }}
                  </span>

                  <!-- Аватар игрока -->
                  <img
                    :src="player.avatar"
                    :alt="player.username"
                    class="w-6 h-6 rounded"
                    loading="lazy"
                    @error="handleAvatarError"
                  />

                  <!-- Имя игрока и флаг -->
                  <div class="flex items-center space-x-2 flex-1 min-w-0">
                    <span class="text-white font-medium text-sm truncate">
                      {{ player.username }}
                    </span>
                    <img
                      v-if="player.country"
                      :src="getFlagUrl(player.country)"
                      :alt="player.country"
                      class="w-4 h-3 rounded shadow"
                      loading="lazy"
                    />
                  </div>
                </div>

                <!-- ELO рейтинг -->
                <div class="text-right">
                  <span class="text-white font-semibold text-sm block">
                    {{ Math.round(player.elo) }}
                  </span>
                  <span class="text-gray-400 text-xs">
                    ELO
                  </span>
                </div>
              </div>
            </div>

            <!-- Ссылка на полный рейтинг -->
            <RouterLink
              to="/leaderboard"
              class="block text-center text-white hover:text-accent-green py-3 border-t border-primary-hover transition-colors text-sm font-medium"
            >
              Весь рейтинг →
            </RouterLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import Header from '@/components/layout/Header.vue'
import MatchCard from '@/components/matches/MatchCard.vue'
import { getMatchesWithCurrentRanks } from '@/types/matches'
import type { Match } from '@/types/matches'

// Состояния для матчей
const matches = ref<Match[]>([])
const loadingMatches = ref(true)

// Состояния для рейтинга
const realLeaderboard = ref<any[]>([])
const loadingLeaderboard = ref(true)
const leaderboardError = ref(false)

// Состояния для стримов
const loadingStreams = ref(true)
const onlineStreamers = ref<any[]>([])

// Twitch API credentials
const TWITCH_CLIENT_ID = 'dundyn05ztgh2h0pkojf0z2zhyvsoa'
const TWITCH_CLIENT_SECRET = 'mxw55kxt62hqryzpext6dw9zn3mf4w'
let twitchAccessToken = ref<string>('')

// Сортируем матчи: сначала live, потом upcoming, потом completed
const sortedMatches = computed(() => {
  return [...matches.value].sort((a, b) => {
    const statusOrder = { live: 0, upcoming: 1, completed: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })
})

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

// Функция для цвета ранга
const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-silver'
  if (rank === 3) return 'text-bronze'
  return 'text-white'
}

// Функция для получения рейтинга из API
const fetchLeaderboard = async () => {
  try {
    loadingLeaderboard.value = true
    leaderboardError.value = false

    const response = await fetch('https://mcsrranked.com/api/leaderboard')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.status === 'success' && data.data?.users) {
      // Берем топ-10 игроков из data.data.users
      realLeaderboard.value = data.data.users.slice(0, 10).map((player: any, index: number) => ({
        uuid: player.uuid || `player-${index}`,
        username: player.nickname || 'Unknown',
        elo: player.eloRate || 0,
        rank: player.eloRank || index + 1,
        avatar: generateMinecraftAvatar(player.nickname),
        country: player.country
      }))
    } else {
      throw new Error('Unexpected API response structure')
    }

  } catch (error) {
    console.error('Ошибка при загрузке рейтинга:', error)
    leaderboardError.value = true
  } finally {
    loadingLeaderboard.value = false
  }
}

// Загрузка матчей с актуальными рангами
const loadMatches = async () => {
  try {
    loadingMatches.value = true
    matches.value = await getMatchesWithCurrentRanks()
  } catch (error) {
    console.error('Ошибка при загрузке матчей:', error)
    // Fallback на статические данные
    const { allMatches } = await import('@/types/matches')
    matches.value = allMatches
  } finally {
    loadingMatches.value = false
  }
}

// Список всех раннеров для мониторинга
const allSpeedrunners = [
  {
    name: 'Feinberg',
    login: 'feinberg',
    avatar: generateMinecraftAvatar('Feinberg')
  },
  {
    name: 'doogile',
    login: 'doogile',
    avatar: generateMinecraftAvatar('doogile')
  },
  {
    name: 'edcr',
    login: 'edcrspeedruns',
    avatar: generateMinecraftAvatar('edcr')
  },
  {
    name: 'lowk3y_',
    login: 'lowkey',
    avatar: generateMinecraftAvatar('lowk3y_')
  },
  {
    name: 'hackingnoises',
    login: 'hackingnoisess',
    avatar: generateMinecraftAvatar('hackingnoises')
  },
  {
    name: 'Infume',
    login: 'infume',
    avatar: generateMinecraftAvatar('Infume')
  },
  {
    name: 'BeefSalad',
    login: 'beefsalad',
    avatar: generateMinecraftAvatar('BeefSalad')
  },
  {
    name: 'silverrruns',
    login: 'silverrruns',
    avatar: generateMinecraftAvatar('silverrruns')
  },
  {
    name: 'k4yfour',
    login: 'k4yfour',
    avatar: generateMinecraftAvatar('k4yfour')
  },
  {
    name: 'couriway',
    login: 'couriway',
    avatar: generateMinecraftAvatar('couriway')
  },
  {
    name: 'fabulous',
    login: 'fabulous',
    avatar: generateMinecraftAvatar('fabulous')
  },
  {
    name: 'ollieowned',
    login: 'ollieowned',
    avatar: generateMinecraftAvatar('ollieowned')
  }
]

// Получение access token от Twitch API
const getTwitchAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    })

    if (!response.ok) {
      throw new Error(`Twitch API error: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Ошибка получения Twitch access token:', error)
    throw error
  }
}

// Функция для проверки онлайн статуса через Twitch API
const checkOnlineStreamers = async () => {
  try {
    loadingStreams.value = true

    // Получаем access token если его нет
    if (!twitchAccessToken.value) {
      twitchAccessToken.value = await getTwitchAccessToken()
    }

    // Получаем логины всех стримеров
    const userLogins = allSpeedrunners.map(s => s.login)

    // Проверяем онлайн статус через Twitch API
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${userLogins.join('&user_login=')}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken.value}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, get new one
        twitchAccessToken.value = await getTwitchAccessToken()
        return await checkOnlineStreamers() // Retry
      }
      throw new Error(`Twitch API error: ${response.status}`)
    }

    const data = await response.json()

    // Фильтруем только онлайн стримы
    const liveStreams = data.data || []

    // Объединяем информацию о стримерах с данными о стримах
    onlineStreamers.value = liveStreams.map((stream: any) => {
      const streamerInfo = allSpeedrunners.find(s => s.login === stream.user_login)
      return {
        ...streamerInfo,
        title: stream.title,
        viewer_count: stream.viewer_count,
        game_name: stream.game_name,
        started_at: stream.started_at,
        thumbnail_url: stream.thumbnail_url
      }
    })

    // Сортируем по количеству зрителей (по убыванию)
    onlineStreamers.value.sort((a, b) => b.viewer_count - a.viewer_count)

  } catch (error) {
    console.error('Ошибка при проверке онлайн стримов:', error)
    onlineStreamers.value = []
  } finally {
    loadingStreams.value = false
  }
}

// Twitch Embed
let twitchEmbedsInitialized = false

const initializeTwitchEmbeds = () => {
  if (twitchEmbedsInitialized) return

  if (!(window as any).Twitch) {
    const script = document.createElement('script')
    script.src = 'https://embed.twitch.tv/embed/v1.js'
    script.async = true
    script.onload = createTwitchEmbeds
    document.head.appendChild(script)
  } else {
    createTwitchEmbeds()
  }
}

const createTwitchEmbeds = () => {
  // Очищаем предыдущие эмбеды
  document.querySelectorAll('.twitch-embed-wrapper').forEach(wrapper => {
    wrapper.innerHTML = ''
  })

  onlineStreamers.value.forEach(streamer => {
    const containerId = `twitch-${streamer.login}`
    const container = document.getElementById(containerId)

    if (container && !container.querySelector('.twitch-embed')) {
      try {
        new (window as any).Twitch.Embed(containerId, {
          width: '100%',
          height: 200,
          channel: streamer.login,
          layout: 'video',
          autoplay: false,
          muted: true,
          parent: ['localhost', '127.0.0.1']
        })
        container.classList.add('twitch-embed')
      } catch (error) {
        console.error(`Ошибка при создании Twitch Embed для ${streamer.name}:`, error)
        container.innerHTML = `
          <div class="bg-gray-700 rounded h-40 flex items-center justify-center">
            <div class="text-center">
              <div class="text-gray-400 text-sm mb-2">${streamer.name}</div>
              <a href="https://www.twitch.tv/${streamer.login}" target="_blank" class="text-red-500 hover:text-red-400 text-sm font-semibold">
                Перейти на Twitch
              </a>
            </div>
          </div>
        `
      }
    }
  })

  twitchEmbedsInitialized = true
}

// Инициализация
onMounted(async () => {
  // Параллельная загрузка данных
  await Promise.all([
    loadMatches(),
    fetchLeaderboard(),
    checkOnlineStreamers()
  ])

  // Инициализируем Twitch Embed после загрузки стримов
  setTimeout(() => {
    initializeTwitchEmbeds()
  }, 100)

  // Обновляем статус стримов каждые 2 минуты
  setInterval(() => {
    checkOnlineStreamers().then(() => {
      twitchEmbedsInitialized = false
      setTimeout(initializeTwitchEmbeds, 100)
    })
  }, 120000)

  // Обновляем рейтинг каждые 10 минут
  setInterval(() => {
    fetchLeaderboard()
  }, 600000)
})
</script>

<style scoped>
.twitch-stream-container {
  border-radius: 8px;
}

.twitch-embed-wrapper {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.twitch-embed iframe) {
  border-radius: 8px !important;
  border: 1px solid #374151 !important;
}

:deep(.twitch-embed) {
  margin-bottom: 8px;
}

/* Цвета для рангов */
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
