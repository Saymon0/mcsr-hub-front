<template>
  <div class="relative">
    <!-- Квадратная аватарка с закругленными углами -->
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

    <!-- Онлайн статус для живых матчей -->
    <div
      v-if="showStatus && player.isLive"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"
    ></div>

    <!-- Анимированная корона для #1 ранга -->
    <div v-if="playerRank === 1" class="absolute -top-2 -left-2 text-yellow-400 text-lg">👑</div>
  </div>
</template>

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
    1: 'border-yellow-400', // Золото для #1
    2: 'border-gray-300', // Серебро для #2
    3: 'border-amber-700', // Бронза для #3
  }

  return colors[rank as keyof typeof colors] || 'border-[#a78bfa]'
}

// Анимации обводки на основе ранга - все используют bronze-pulse
const getRankAnimation = (rank: number) => {
  const animations = {
    1: 'animate-gold-pulse', // Золото с pulse анимацией
    2: 'animate-silver-pulse', // Серебро с pulse анимацией
    3: 'animate-bronze-pulse', // Бронза с pulse анимацией
  }

  return animations[rank as keyof typeof animations] || ''
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
      const rankedPlayer = data.data.users.find(
        (p: any) => p.nickname?.toLowerCase() === props.player.name.toLowerCase(),
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

<style scoped>
/* Бронзовая пульсация для всех трех мест */
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

.animate-bronze-pulse {
  animation: bronzePulse 2.5s ease-in-out infinite;
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

/* Плавный переход для всех аватаров */
.relative {
  transition: all 0.3s ease;
}

/* Эффект при наведении на все аватары */
.relative:hover {
  transform: scale(1.05);
}

/* Особый эффект при наведении на ранговые аватары */
.relative:hover .animate-bronze-pulse {
  animation-duration: 1.5s;
}
</style>
