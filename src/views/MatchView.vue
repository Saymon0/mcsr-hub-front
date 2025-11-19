<template>
  <div>
    <Header />

    <main class="container mx-auto px-4 py-6">
      <!-- Хлебные крошки -->
      <nav class="flex items-center space-x-2 text-gray-400 mb-4 text-sm">
        <RouterLink to="/" class="hover:text-[#77bb55] transition-colors">Главная</RouterLink>
        <span>›</span>
        <RouterLink to="/tournaments" class="hover:text-[#77bb55] transition-colors">Турниры</RouterLink>
        <span>›</span>
        <span class="text-white">{{ match.tournament }}</span>
      </nav>

      <!-- Информация о матче -->
      <div class="bg-gray-800 rounded-lg p-4 mb-4">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-bold text-white mb-1">{{ match.tournament }}</h1>
            <div class="flex items-center space-x-3 text-gray-400 text-sm">
              <span>{{ match.category }}</span>
              <span>•</span>
              <span>{{ match.version }}</span>
              <span>•</span>
              <span>{{ match.seedType }}</span>
            </div>
          </div>
          <div class="text-right">
            <div
              v-if="match.status === 'live'"
              class="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full text-white text-sm"
            >
              <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>LIVE • {{ match.viewers }} viewers</span>
            </div>
            <div
              v-else-if="match.status === 'completed'"
              class="text-gray-400 text-sm"
            >
              Match over
            </div>
            <div
              v-else
              class="text-gray-400 text-sm"
            >
              {{ formatDetailedDate(match.date) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Формат матча -->
      <div class="bg-gray-800 rounded-lg p-4 mb-4">
        <h2 class="text-white font-semibold mb-2">Match Info</h2>
        <div class="text-gray-400 text-sm">
          <div class="flex justify-between">
            <span>Format:</span>
            <span>{{ match.format }}</span>
          </div>
          <div class="flex justify-between">
            <span>Seed Type:</span>
            <span>{{ match.seedType }}</span>
          </div>
          <div class="flex justify-between">
            <span>Version:</span>
            <span>{{ match.version }}</span>
          </div>
        </div>
      </div>

      <!-- Участники и результаты -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div
          v-for="player in match.players"
          :key="player.id"
          class="bg-gray-800 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <PlayerAvatar :player="player" :size="'lg'" />
              <div>
                <div class="text-white font-semibold">{{ player.name }}</div>
                <div class="text-gray-400 text-sm">Rank: #{{ player.rank }}</div>
              </div>
            </div>
            <div
              v-if="match.status === 'completed'"
              class="text-lg font-bold"
              :class="player.score >= 2 ? 'text-[#77bb55]' : 'text-red-500'"
            >
              {{ player.score >= 2 ? 'WIN' : 'LOSE' }}
            </div>
          </div>

          <!-- Счет игр -->
          <div class="flex justify-between items-center">
            <span class="text-gray-400 text-sm">Games:</span>
            <div class="flex space-x-2">
              <div
                v-for="n in 2"
                :key="n"
                class="w-4 h-4 rounded-full border-2"
                :class="n <= player.score ? 'bg-[#77bb55] border-[#77bb55]' : 'bg-transparent border-gray-500'"
              ></div>
            </div>
            <span class="text-white font-bold">{{ player.score }}/2</span>
          </div>

          <!-- Ссылка на трансляцию -->
          <a
            v-if="player.twitch && (match.status === 'live' || match.status === 'completed')"
            :href="player.twitch"
            target="_blank"
            class="block mt-3 bg-[#6441a5] hover:bg-[#7d5bbe] text-white text-center py-2 rounded text-sm transition-colors"
          >
            📺 Watch on Twitch
          </a>
        </div>
      </div>

      <!-- Демо записи (аналог HLTV) -->
      <div
        v-if="match.status === 'completed'"
        class="bg-gray-800 rounded-lg p-4"
      >
        <h2 class="text-white font-semibold mb-3">Demo Records</h2>
        <div class="space-y-2">
          <div
            v-for="player in match.players"
            :key="player.id"
            class="flex items-center justify-between p-2 bg-gray-700 rounded"
          >
            <span class="text-white text-sm">{{ player.name }}</span>
            <button class="text-[#77bb55] hover:text-[#68a34a] text-sm transition-colors">
              Download Run
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const matchId = route.params.id
const match = ref<any>(null)

// Загрузка данных матча
onMounted(() => {
  // В реальном приложении здесь будет API запрос по matchId
  const mockMatches = {
    '1': {
      id: 1,
      tournament: 'Ranked Playoffs',
      players: [
        { id: 1, name: 'Feinberg', rank: 1, score: 2, avatar: '/avatars/feinberg.png', twitch: 'https://www.twitch.tv/feinberg' },
        { id: 2, name: 'doogile', rank: 3, score: 1, avatar: '/avatars/doogile.png', twitch: 'https://www.twitch.tv/olivermcsr' }
      ],
      category: 'Any% RSG',
      version: '1.16.1',
      seedType: 'Buried Treasure',
      format: 'Best of 3',
      status: 'completed',
      time: '19:00',
      date: '2024-01-20T19:00:00',
      viewers: 2840
    },
    '2': {
      id: 2,
      tournament: 'Most%',
      players: [
        { id: 5, name: 'lowk3y_', rank: 5, score: 1, avatar: '/avatars/lowk3y_.png', isLive: true, twitch: 'https://www.twitch.tv/nerdi' },
        { id: 6, name: 'edcr', rank: 6, score: 1, avatar: '/avatars/edcr.png', twitch: 'https://www.twitch.tv/couriway' }
      ],
      category: 'All Advancements RSG',
      version: '1.16.1',
      seedType: 'Village',
      format: 'Best of 3',
      status: 'live',
      time: '19:30',
      date: '2024-01-20T19:30:00',
      viewers: 1560
    },
    '3': {
      id: 3,
      tournament: 'Speedrun Showdown',
      players: [
        { id: 3, name: 'Infume', rank: 2, score: 0, avatar: '/avatars/infume.png', twitch: 'https://www.twitch.tv/feinberg' },
        { id: 4, name: 'hackingnoises', rank: 4, score: 0, avatar: '/avatars/hackingnoises.png', twitch: 'https://www.twitch.tv/couriway' }
      ],
      category: 'Any% RSG',
      version: '1.21',
      seedType: 'Ruined Portal',
      format: 'Best of 3',
      status: 'upcoming',
      time: '20:00',
      date: '2024-01-20T20:00:00'
    },
    '4': {
      id: 4,
      tournament: 'No Reset Invitational',
      players: [
        { id: 7, name: 'silverrruns', rank: 7, score: 0, avatar: '/avatars/silverrruns.png', twitch: 'https://www.twitch.tv/olivermcsr' },
        { id: 8, name: 'BeefSalad', rank: 8, score: 0, avatar: '/avatars/beefsalad.png', twitch: 'https://www.twitch.tv/nerdi' }
      ],
      category: 'Any% RSG',
      version: '1.16.1',
      seedType: 'Desert Temple',
      format: 'Best of 3',
      status: 'upcoming',
      time: '21:00',
      date: '2024-01-20T21:00:00'
    }
  }

  match.value = mockMatches[matchId as keyof typeof mockMatches]
})

const formatDetailedDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
