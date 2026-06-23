<template>
  <div class="min-h-screen relative">
    <div class="fixed inset-0 -z-10">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover" />
      <div class="absolute inset-0 from-purple-900/10 to-violet-950/20"></div>
    </div>

    <Header />

    <section class="bg-end-dark/80 border-b border-end-accent py-6 backdrop-blur-md relative z-10">
      <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold text-end-light text-center mb-6">Предстоящие матчи</h2>

        <div v-if="loadingMatches" class="text-center py-8">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-end-purple mb-4"
          ></div>
          <div class="text-end-muted text-lg">Загрузка матчей...</div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start max-w-7xl mx-auto"
        >
          <RouterLink
            v-for="match in filteredMatches"
            :key="match.id"
            :to="`/matches/${match.id}`"
            class="block w-full max-w-[320px] mx-auto rounded-2xl no-underline select-none transition-transform hover:scale-[1.02]"
          >
            <MatchCard :match="match" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="border-b border-end-accent py-12 backdrop-blur-sm relative z-10">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-end-light mb-6">
            Minecraft Speedrunning Hub
          </h2>
          <p class="text-end-light text-lg md:text-xl mb-8 leading-relaxed">
            Ваш главный ресурс по Minecraft Speedrunning Ranked: Рейтинг Лидеров, Турниры и Прямые
            Трансляции
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://discord.gg/mcsrranked"
              target="_blank"
              class="bg-end-purple hover:bg-end-accent text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>🌟 Присоединиться к сообществу</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <main class="container mx-auto px-4 py-8 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3">
          <div class="bg-end-dark/50 rounded-lg border border-end-accent backdrop-blur-xl">
            <div class="bg-end-secondary/30 px-6 py-4 border-b border-end-accent">
              <h3 class="text-end-light font-bold text-xl">Прямые трансляции</h3>
              <p class="text-end-muted text-sm mt-1">
                Топ 100 спидраннеров из рейтинга MCSR Ranked
              </p>
            </div>

            <div v-if="loadingStreams" class="p-8 text-center">
              <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-end-purple mb-4"
              ></div>
              <div class="text-end-light text-lg">Проверка трансляций...</div>
            </div>

            <div v-else-if="onlineStreamers.length === 0" class="p-8 text-center">
              <div class="text-end-muted text-lg">Сейчас никто не стримит</div>
              <div class="text-end-muted text-sm mt-2">Попробуйте зайти позже</div>
            </div>

            <div v-else class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="streamer in onlineStreamers"
                  :key="streamer.login"
                  class="twitch-stream-container bg-end-secondary/70 rounded-lg p-4 border border-end-accent"
                >
                  <div :id="`twitch-${streamer.login}`" class="twitch-embed-wrapper mb-3">
                    <div
                      v-if="!streamer.embedLoaded"
                      class="bg-end-secondary rounded h-40 flex items-center justify-center border border-end-accent/30"
                    >
                      <div class="text-center">
                        <div class="text-end-muted text-sm mb-2">Загрузка стрима...</div>
                        <div
                          class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-end-purple"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="relative">
                        <div
                          class="w-8 h-8 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-in-out"
                          :class="[
                            getAvatarBorderColor(streamer.rank),
                            getAvatarAnimation(streamer.rank),
                          ]"
                        >
                          <img
                            :src="streamer.avatar"
                            :alt="streamer.name"
                            class="w-full h-full object-cover"
                            @error="handleAvatarError"
                          />
                        </div>
                        <div
                          v-if="streamer.rank === 1"
                          class="absolute -top-1 -left-1 text-yellow-400 text-xs"
                        >
                          👑
                        </div>
                      </div>
                      <div>
                        <span class="text-end-light text-sm font-medium block">{{
                          streamer.name
                        }}</span>
                        <span class="text-end-muted text-xs"
                          >{{ streamer.viewer_count }} зрителей</span
                        >
                        <span v-if="streamer.rank" class="text-end-light text-xs ml-2">
                          #{{ streamer.rank }} в рейтинге
                        </span>
                      </div>
                    </div>
                    <a
                      :href="`https://www.twitch.tv/${streamer.login}`"
                      target="_blank"
                      class="bg-end-purple hover:bg-end-accent text-white px-3 py-1 rounded text-sm font-semibold flex items-center space-x-1 transition-colors border border-end-light"
                    >
                      <div class="w-2 h-2 bg-end-light rounded-full animate-pulse"></div>
                      <span>Смотреть</span>
                    </a>
                  </div>
                  <div class="mt-3">
                    <p class="text-end-muted text-sm line-clamp-2" :title="streamer.title">
                      {{ streamer.title }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-1 space-y-6">
          <div class="bg-end-dark/80 rounded-lg border border-end-accent backdrop-blur-2xl">
            <div class="bg-end-secondary/70 px-4 py-3 border-b border-end-accent">
              <h3 class="text-end-light font-bold text-lg">Рейтинг Лидеров</h3>
            </div>

            <div v-if="loadingLeaderboard" class="p-4 text-center">
              <div
                class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-end-purple mb-2"
              ></div>
              <div class="text-end-light text-sm">Загрузка рейтинга...</div>
            </div>

            <div v-else-if="leaderboardError" class="p-4 text-center">
              <div class="text-end-warning text-sm mb-2">Ошибка загрузки</div>
              <button
                @click="fetchLeaderboard"
                class="text-end-purple hover:text-end-accent text-sm"
              >
                Попробовать снова
              </button>
            </div>

            <div v-else class="divide-y divide-end-accent/30">
              <div
                v-for="player in realLeaderboard"
                :key="player.uuid"
                class="flex items-center justify-between px-4 py-3 hover:bg-end-secondary/50 transition-colors group border-end-accent"
              >
                <div class="flex items-center space-x-3 flex-1">
                  <span
                    class="font-bold w-6 text-sm text-center"
                    :class="getRankColor(player.rank)"
                  >
                    #{{ player.rank }}
                  </span>

                  <div class="relative">
                    <div
                      class="w-6 h-6 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-in-out"
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
                    <div
                      v-if="player.rank === 1"
                      class="absolute -top-1 -left-1 text-yellow-400 text-xs"
                    >
                      👑
                    </div>
                  </div>

                  <div class="flex items-center space-x-2 flex-1 min-w-0">
                    <span class="text-end-light font-medium text-sm truncate">
                      {{ player.username }}
                    </span>
                    <img
                      v-if="player.country"
                      :src="getFlagUrl(player.country)"
                      :alt="player.country"
                      class="w-4 h-3 rounded shadow border border-end-accent"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-end-light font-semibold text-sm block">
                    {{ Math.round(player.elo) }}
                  </span>
                  <span class="text-end-muted text-xs uppercase"> Elo </span>
                </div>
              </div>
            </div>

            <RouterLink
              to="/leaderboard"
              class="block text-center text-end-light hover:text-end-purple py-3 border-t border-end-accent transition-colors text-sm font-medium"
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
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import Header from '@/components/layout/Header.vue'
import MatchCard from '@/components/matches/MatchCard.vue'

// Состояния для матчей
const matches = ref<any[]>([])
const loadingMatches = ref(true)

const filteredMatches = computed(() => {
  return matches.value.filter((m) => String(m.status).toLowerCase() === 'scheduled').slice(0, 4)
})

// Состояния для рейтинга
const realLeaderboard = ref<any[]>([])
const loadingLeaderboard = ref(true)
const leaderboardError = ref(false)

// Состояния для стримов
const loadingStreams = ref(true)
const onlineStreamers = ref<any[]>([])
const activeStreamEmbeds = ref(new Set<string>())

let leaderboardInterval: number | null = null
let streamsInterval: number | null = null

// Вспомогательные функции
const generateMinecraftAvatar = (username: string) =>
  `https://mineskin.eu/helm/${encodeURIComponent(username)}/64.png`

const getFlagUrl = (countryCode: string) =>
  `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = `https://mineskin.eu/helm/${encodeURIComponent(target.alt)}`
}

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300' // silver
  if (rank === 3) return 'text-amber-700' // bronze
  return 'text-end-light'
}

const getAvatarBorderColor = (rank: number) => {
  const colors = { 1: 'border-yellow-400', 2: 'border-gray-300', 3: 'border-amber-700' }
  return colors[rank as keyof typeof colors] || 'border-[#a78bfa]'
}

const getAvatarAnimation = (rank: number) => {
  const animations = {
    1: 'animate-gold-pulse',
    2: 'animate-silver-pulse',
    3: 'animate-bronze-pulse',
  }
  return animations[rank as keyof typeof animations] || ''
}

// 1. Получение списка матчей из вашего API
const fetchMatches = async () => {
  try {
    loadingMatches.value = true
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/matches`)
    if (res.ok) {
      matches.value = await res.json()
    } else {
      console.error('Ошибка ответа сервера матчей:', res.status)
    }
  } catch (e) {
    console.error('Ошибка загрузки матчей:', e)
  } finally {
    loadingMatches.value = false
  }
}

// 2. Получение данных рейтинга через ваш бэкенд
const fetchLeaderboard = async () => {
  try {
    loadingLeaderboard.value = true
    leaderboardError.value = false
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ranked/leaderboard`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const users = await response.json()

    realLeaderboard.value = users.slice(0, 10).map((player: any, index: number) => ({
      uuid: player.uuid || `player-${index}`,
      username: player.nickname || player.username || 'Unknown',
      // ИСПРАВЛЕНО: убран player.eloRank, чтобы не подставлялось место в топе вместо ELO
      elo: player.eloRate || player.elo || 0,
      rank: player.rank || player.eloRank || index + 1,
      avatar: generateMinecraftAvatar(player.nickname || player.username),
      country: player.country || 'us',
    }))
  } catch (error) {
    console.error('Ошибка загрузки лидерборда:', error)
    leaderboardError.value = true
  } finally {
    loadingLeaderboard.value = false
  }
}

// 3. Мгновенное получение живых стримов из фонового кэша вашего сервера
const checkOnlineStreamers = async (isInitial = false) => {
  try {
    if (isInitial) {
      loadingStreams.value = true
    }
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ranked/top-streams`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()

    if (onlineStreamers.value.length === 0) {
      onlineStreamers.value = data.map((streamer: any) => ({
        ...streamer,
        avatar: generateMinecraftAvatar(streamer.name),
        embedLoaded: false,
      }))
    } else {
      // --- УМНОЕ ОБНОВЛЕНИЕ ДАННЫХ БЕЗ ПЕРЕЗАГРУЗКИ IFRAME ---
      const newStreamsMap = new Map<string, any>(data.map((s: any) => [s.login.toLowerCase(), s]))

      const updatedList = onlineStreamers.value.filter((currentStreamer: any) => {
        const loginKey = currentStreamer.login.toLowerCase()
        const freshData = newStreamsMap.get(loginKey)

        if (freshData) {
          currentStreamer.viewer_count = freshData.viewer_count
          currentStreamer.title = freshData.title
          currentStreamer.rank = freshData.rank

          newStreamsMap.delete(loginKey)
          return true
        } else {
          activeStreamEmbeds.value.delete(currentStreamer.login)
          return false
        }
      })

      newStreamsMap.forEach((freshStreamer: any) => {
        updatedList.push({
          ...freshStreamer,
          avatar: generateMinecraftAvatar(freshStreamer.name),
          embedLoaded: false,
        })
      })

      onlineStreamers.value = updatedList
    }

    if ((window as any).Twitch) {
      await nextTick()
      createTwitchEmbeds()
    }
  } catch (e) {
    console.error('Ошибка фонового получения стримов:', e)
  } finally {
    if (isInitial) {
      loadingStreams.value = false
    }
  }
}

const createTwitchEmbeds = () => {
  onlineStreamers.value.forEach((streamer) => {
    if (!streamer.embedLoaded && !activeStreamEmbeds.value.has(streamer.login)) {
      const containerId = `twitch-${streamer.login}`
      const container = document.getElementById(containerId)
      if (container && (window as any).Twitch) {
        new (window as any).Twitch.Embed(containerId, {
          width: '100%',
          height: 200,
          channel: streamer.login,
          layout: 'video',
          autoplay: false,
          muted: true,
          parent: [window.location.hostname],
        })
        streamer.embedLoaded = true
        activeStreamEmbeds.value.add(streamer.login)
      }
    }
  })
}

const initializeTwitchEmbeds = () => {
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

onUnmounted(() => {
  if (leaderboardInterval) clearInterval(leaderboardInterval)
  if (streamsInterval) clearInterval(streamsInterval)
  activeStreamEmbeds.value.clear()
})

onMounted(async () => {
  await Promise.all([fetchMatches(), fetchLeaderboard(), checkOnlineStreamers(true)])

  setTimeout(initializeTwitchEmbeds, 500)

  leaderboardInterval = window.setInterval(fetchLeaderboard, 600000) // Раз в 10 минут
  streamsInterval = window.setInterval(() => checkOnlineStreamers(false), 60000) // Раз в минуту
})
</script>

<style scoped>
.bg-void-purple {
  background-color: #1a0b2e;
}
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
.text-end-light {
  color: #e9d5ff;
}
.text-end-muted {
  color: #a78bfa;
}
.border-end-accent {
  border-color: #8b5cf6;
}
.border-end-light {
  border-color: #e9d5ff;
}
.text-silver {
  color: #c0c0c0;
}
.text-bronze {
  color: #cd7f32;
}

.twitch-embed-wrapper {
  min-height: 200px;
  border-radius: 8px;
  overflow: hidden;
}
:deep(.twitch-embed iframe) {
  border-radius: 8px !important;
  border: 1px solid #a78bfa !important;
}

@keyframes bronzePulse {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(180, 83, 9, 0.4);
    border-color: rgb(180, 83, 9);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 10px rgba(180, 83, 9, 0.7);
    border-color: rgb(217, 119, 6);
    transform: scale(1.02);
  }
}
@keyframes silverPulse {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(209, 213, 219, 0.4);
    border-color: rgb(209, 213, 219);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 12px rgba(209, 213, 219, 0.7);
    border-color: rgb(243, 244, 246);
    transform: scale(1.02);
  }
}
@keyframes goldPulse {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(234, 179, 8, 0.5);
    border-color: rgb(234, 179, 8);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.8);
    border-color: rgb(250, 204, 21);
    transform: scale(1.02);
  }
}
.animate-bronze-pulse {
  animation: bronzePulse 2.5s ease-in-out infinite;
}
.animate-silver-pulse {
  animation: silverPulse 2.5s ease-in-out infinite;
}
.animate-gold-pulse {
  animation: goldPulse 2.5s ease-in-out infinite;
}
</style>
