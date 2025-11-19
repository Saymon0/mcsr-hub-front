<template>
  <div class="relative">
    <!-- Квадратная аватарка с закругленными углами -->
    <div
      class="w-10 h-10 rounded-lg overflow-hidden border-2"
      :class="{
        'border-gray-600': !player.rank,
        'border-yellow-400': player.rank === 1,
        'border-gray-400': player.rank === 2,
        'border-yellow-700': player.rank === 3,
        'border-[#77bb55]': player.rank && player.rank > 3
      }"
    >
      <img
        v-if="player.avatar"
        :src="player.avatar"
        :alt="player.name"
        class="w-full h-full object-cover"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-white font-bold text-sm"
        :class="{
          'bg-gray-600': !player.rank,
          'bg-yellow-500': player.rank === 1,
          'bg-gray-500': player.rank === 2,
          'bg-yellow-600': player.rank === 3,
          'bg-[#77bb55]': player.rank && player.rank > 3
        }"
      >
        {{ player.name.charAt(0) }}
      </div>
    </div>

    <!-- Онлайн статус для живых матчей -->
    <div
      v-if="showStatus && player.isLive"
      class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"
    ></div>
  </div>
</template>

<script setup lang="ts">
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

withDefaults(defineProps<Props>(), {
  showStatus: false,
  size: 'md'
})
</script>
