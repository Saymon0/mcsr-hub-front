<template>
  <div class="relative">
    <!-- Квадратная аватарка с закругленными углами -->
    <div
      class="w-10 h-10 rounded-lg overflow-hidden border-2"
      :class="getBorderColor(playerRank)"
    >
      <img
        :src="playerAvatar"
        :alt="player.name"
        class="w-full h-full object-cover"
        @error="handleAvatarError"
      >
    </div>

    <!-- Онлайн статус для живых матчей -->
    <div
      v-if="showStatus && player.isLive"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

interface Player {
  id: number
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
  size: 'md'
})

// Состояние для актуального ранга из API
const currentRank = ref<number | null>(null)

// Генерация Minecraft аватара с помощью MineSkin API
const generateMinecraftAvatar = (username: string) => {
  return `https://mineskin.eu/helm/${encodeURIComponent(username)}/64.png`
}

// Состояние для отслеживания ошибок загрузки
const avatarLoadError = ref(false)

// Вычисляемое свойство для аватара
const playerAvatar = computed(() => {
  // Если уже есть аватар, используем его
  if (props.player.avatar) {
    return props.player.avatar
  }
  // Иначе генерируем Minecraft аватар
  return generateMinecraftAvatar(props.player.name)
})

// Приоритет: актуальный ранг из API > ранг из пропсов
const playerRank = computed(() => {
  return currentRank.value || props.player.rank || 0
})

// Цвета обводки на основе ранга
const getBorderColor = (rank: number) => {
  const colors = {
    1: 'border-yellow-400',      // Золото для #1
    2: 'border-gray-400',        // Серебро для #2
    3: 'border-yellow-700',      // Бронза для #3
  }

  return colors[rank as keyof typeof colors] || 'border-[#77bb55]'
}

// Обработка ошибки загрузки аватара
const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const username = props.player.name

  if (!avatarLoadError.value) {
    // Первая попытка: пробуем загрузить без размера
    avatarLoadError.value = true
    target.src = `https://mineskin.eu/helm/${encodeURIComponent(username)}`
  } else {
    console.warn(`Не удалось загрузить аватар для игрока: ${username}`)
  }
}

// Функция для получения актуального ранга из API
const fetchPlayerRank = async () => {
  try {
    const response = await fetch('https://mcsrranked.com/api/leaderboard')
    if (!response.ok) return

    const data = await response.json()

    if (data.status === 'success' && data.data?.users) {
      // Ищем игрока в рейтинге по имени
      const rankedPlayer = data.data.users.find((p: any) =>
        p.nickname?.toLowerCase() === props.player.name.toLowerCase()
      )

      if (rankedPlayer) {
        currentRank.value = rankedPlayer.eloRank
      }
    }
  } catch (error) {
    console.warn('Не удалось загрузить актуальный рейтинг для', props.player.name)
    // Используем ранг из пропсов при ошибке
  }
}

// Загружаем актуальный ранг при монтировании
onMounted(() => {
  fetchPlayerRank()
})
</script>
