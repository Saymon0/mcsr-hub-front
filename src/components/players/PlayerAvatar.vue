<template>
  <div class="relative">
    <div
      class="w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-500 ease-in-out"
      :class="[getBorderColor(playerRank), getRankAnimation(playerRank)]"
    >
      <img
        :src="playerAvatar"
        :alt="player.name"
        class="w-full h-full object-cover"
        @error="handleAvatarError"
      />
    </div>

    <div
      v-if="showStatus && player.isLive"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"
    ></div>

    <div v-if="playerRank === 1" class="absolute -top-2 -left-2 text-yellow-400 text-lg">👑</div>
  </div>
</template>

<script lang="ts">
// ОЧЕНЬ ВАЖНО: Этот блок находится вне <script setup>.
// Переменная объявляется ОДИН раз на уровне модуля. Теперь кэш ОДИН НА ВСЕХ.
// Ошибка MaxListenersExceededWarning полностью исчезнет.
let sharedLeaderboardPromise: Promise<any[]> | null = null
</script>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

interface Player {
  id: number | string
  name: string
  avatar?: string
  isLive?: boolean
  rank?: number
}

interface Props {
  player: Player
  showStatus?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  showStatus: false,
  size: 'md',
})

// Вспомогательная функция для быстрого сброса зависшего запроса (Таймаут)
const fetchWithTimeout = async (url: string, options = {}, timeout = 2500) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

const getSharedLeaderboard = (): Promise<any[]> => {
  if (sharedLeaderboardPromise) return sharedLeaderboardPromise

  sharedLeaderboardPromise = (async () => {
    try {
      let leaderboardData: any = null

      try {
        // 1. Пробуем официальный API, но даём ему ВСЕГО 2.5 секунды вместо бесконечного ожидания
        const response = await fetchWithTimeout('https://mcsrranked.com/api/leaderboard', {}, 2500)
        if (!response.ok) throw new Error('Блокировка или ошибка API')
        leaderboardData = await response.json()
      } catch (apiErr) {
        // 2. ФОЛБЭК: Если без VPN за 2.5 секунды не подключились, моментально берём локальный кэш
        console.log(
          '[PlayerAvatar] Официальный API недоступен (таймаут). Загружаем локальный кэш...',
        )
        const cacheResponse = await fetch('/mcsr_cache.json')
        const cacheJson = await cacheResponse.json()
        leaderboardData = cacheJson.leaderboard || cacheJson
      }

      if (Array.isArray(leaderboardData)) {
        return leaderboardData
      } else if (
        leaderboardData &&
        leaderboardData.status === 'success' &&
        leaderboardData.data?.users
      ) {
        return leaderboardData.data.users
      }
      return []
    } catch (err) {
      console.error('[PlayerAvatar] Не удалось загрузить данные рейтинга:', err)
      return []
    }
  })()

  return sharedLeaderboardPromise
}

// Состояние для актуального ранга из API
const currentRank = ref<number | null>(null)
const avatarLoadError = ref(false)

// Генерация Minecraft аватара с помощью MineSkin API
const generateMinecraftAvatar = (username: string) => {
  return `https://mineskin.eu/helm/${encodeURIComponent(username)}/64.png`
}

// Вычисляемое свойство для аватара
const playerAvatar = computed(() => {
  if (props.player.avatar) return props.player.avatar
  return generateMinecraftAvatar(props.player.name)
})

// Приоритет: актуальный ранг из API > ранг из пропсов
const playerRank = computed(() => {
  return currentRank.value || props.player.rank || 0
})

// Цвета обводки на основе ранга
const getBorderColor = (rank: number) => {
  const colors = {
    1: 'border-yellow-400', // Золото для #1
    2: 'border-gray-300', // Серебро для #2
    3: 'border-amber-700', // Бронза для #3
  }
  return colors[rank as keyof typeof colors] || 'border-[#a78bfa]'
}

// Анимации обводки на основе ранга
const getRankAnimation = (rank: number) => {
  const animations = {
    1: 'animate-gold-pulse',
    2: 'animate-silver-pulse',
    3: 'animate-bronze-pulse',
  }
  return animations[rank as keyof typeof animations] || ''
}

// Обработка ошибки загрузки аватара
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const username = props.player.name

  if (!avatarLoadError.value) {
    avatarLoadError.value = true
    target.src = `https://mineskin.eu/helm/${encodeURIComponent(username)}`
  } else {
    console.warn(`Не удалось загрузить аватар для игрока: ${username}`)
  }
}

// Функция для получения актуального ранга из единого общего запроса
const fetchPlayerRank = async () => {
  try {
    const usersList = await getSharedLeaderboard()
    if (!usersList || usersList.length === 0) return

    const rankedPlayer = usersList.find((p: any) => {
      const pName = p.nickname || p.username || ''
      return pName.toLowerCase() === props.player.name.toLowerCase()
    })

    if (rankedPlayer) {
      currentRank.value = rankedPlayer.eloRank || rankedPlayer.rank || null
    }
  } catch (error) {
    console.warn(`[PlayerAvatar] Не удалось определить ранг для ${props.player.name}`)
  }
}

onMounted(() => {
  fetchPlayerRank()
})
</script>

<style scoped>
@keyframes bronzePulse {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(180, 83, 9, 0.4);
    border-color: rgb(180, 83, 9);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 10px rgba(180, 83, 9, 0.7),
      inset 0 0 6px rgba(217, 119, 6, 0.3);
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
    box-shadow:
      0 0 12px rgba(209, 213, 219, 0.7),
      inset 0 0 12px rgba(255, 255, 255, 0.4);
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
    box-shadow:
      0 0 15px rgba(234, 179, 8, 0.8),
      inset 0 0 15px rgba(234, 179, 8, 0.5);
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

.relative {
  transition: all 0.3s ease;
}

.relative:hover {
  transform: scale(1.05);
}

.relative:hover .animate-bronze-pulse {
  animation-duration: 1.5s;
}
</style>
