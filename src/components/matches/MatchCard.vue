<template>
  <RouterLink
    :to="`/match/${match.id}`"
    class="block bg-gray-800 border-2 rounded-lg p-3 w-72 hover:border-[#77bb55] hover:bg-gray-750 transition-all duration-300 group"
    :class="{
      'border-red-500': match.status === 'live',
      'border-gray-600': match.status === 'upcoming',
      'border-gray-700': match.status === 'completed',
    }"
  >
    <!-- Заголовок матча -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="text-white font-bold text-sm group-hover:text-[#77bb55] transition-colors">
        {{ match.tournament }}
      </h3>
      <div
        v-if="match.status === 'live'"
        class="flex items-center space-x-1 bg-red-600 px-2 py-1 rounded text-xs text-white"
      >
        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>LIVE</span>
      </div>
      <div v-else-if="match.status === 'completed'" class="text-gray-400 text-xs">Завершен</div>
      <div v-else class="text-gray-400 text-xs">
        {{ match.time }}
      </div>
    </div>

    <!-- Участники и счет -->
    <div class="space-y-2">
      <div
        v-for="player in match.players"
        :key="player.id"
        class="flex items-center justify-between"
      >
        <div class="flex items-center space-x-2 flex-1">
          <PlayerAvatar :player="player" :show-status="match.status === 'live'" />
          <span class="text-white font-medium text-sm flex-1">{{ player.name }}</span>
        </div>

        <!-- Счет для Best of 3 (2 круга) -->
        <div class="flex space-x-1">
          <div
            v-for="n in 2"
            :key="n"
            class="w-3 h-3 rounded-full border"
            :class="getGameScoreClass(player, n)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
      <span class="text-gray-400 text-xs">{{ match.seedType }}</span>
      <span class="text-gray-400 text-xs">{{ match.format }}</span>
    </div>

    <!-- Зрители для live матчей -->
    <div
      v-if="match.status === 'live' && match.viewers"
      class="flex items-center justify-center mt-2 pt-2 border-t border-gray-700"
    >
      <span class="text-gray-400 text-xs flex items-center space-x-1">
        <span>👁️</span>
        <span>{{ match.viewers }} зрителей</span>
      </span>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'

interface MatchPlayer {
  id: number
  name: string
  avatar?: string
  rank?: number
  isLive?: boolean
  score: number
  twitch?: string
}

interface Match {
  id: number
  tournament: string
  players: MatchPlayer[]
  category: string
  version: string
  seedType: string
  format: string
  status: 'upcoming' | 'live' | 'completed'
  time: string
  date: string
  viewers?: number
}

defineProps<{
  match: Match
}>()

const getGameScoreClass = (player: MatchPlayer, gameNumber: number) => {
  if (gameNumber <= player.score) {
    return 'bg-[#77bb55] border-[#77bb55]' // Выигранные игры
  }
  return 'bg-transparent border-gray-600' // Несыгранные/проигранные игры
}
</script>
