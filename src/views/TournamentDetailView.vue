<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router' // Добавили useRouter
import axios from 'axios'
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue' // Добавили компонент аватара

interface Match {
  id: number
  player1_name: string
  player2_name: string
  player1_rank?: number // Опционально для аватара
  player2_rank?: number
  score1: number
  score2: number
  match_date: string | null
  status: 'scheduled' | 'live' | 'completed' // Синхронизировал с твоей БД
  video_url: string | null
}

interface Tournament {
  id: number
  title: string
  status: string
  description: string
  start_date?: string
  end_date?: string
  prize_pool?: string
  player_count?: number
}

const route = useRoute()
const router = useRouter() // Инициализируем роутер
const tournament = ref<Tournament | null>(null)
const matches = ref<Match[]>([])
const isLoading = ref(true)

const fetchData = async () => {
  try {
    const id = route.params.id
    const [tRes, mRes] = await Promise.all([
      axios.get(`import.meta.env.VITE_API_URL/api/tournaments/${id}`),
      axios.get(`import.meta.env.VITE_API_URL/api/tournaments/${id}/matches`),
    ])
    tournament.value = tRes.data
    matches.value = mRes.data
  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
  } finally {
    isLoading.value = false
  }
}

// Функция для перехода на страницу матча
const goToMatch = (matchId: number) => {
  router.push(`/matches/${matchId}`)
}

const formatMatchTime = (dateStr: string | null) => {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen bg-[#1a1147] text-white">
    <Header />

    <main v-if="tournament" class="max-w-7xl mx-auto px-6 py-10">
      <RouterLink
        to="/tournaments"
        class="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span class="font-bold uppercase tracking-widest text-xs">Назад к списку</span>
      </RouterLink>

      <div
        class="bg-[#3C2A7A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl"
      >
        <h1 class="text-4xl md:text-6xl font-black uppercase mb-6">{{ tournament.title }}</h1>
        <p
          class="text-zinc-300 text-lg leading-relaxed max-w-4xl whitespace-pre-line border-t border-white/5 pt-6"
        >
          {{ tournament.description }}
        </p>
      </div>

      <div>
        <div class="flex items-center gap-4 mb-10">
          <h2 class="text-3xl font-black uppercase italic">Расписание матчей</h2>
          <div class="h-[2px] flex-1 bg-white/5"></div>
        </div>

        <div v-if="matches.length > 0" class="grid gap-4">
          <!-- Добавлен @click и стиль cursor-pointer -->
          <div
            v-for="match in matches"
            :key="match.id"
            @click="goToMatch(match.id)"
            class="bg-[#2D1B69] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-[#7c3aed]/60 hover:bg-[#34207a] transition-all group cursor-pointer"
          >
            <!-- Время -->
            <div class="flex flex-col items-center md:items-start min-w-[100px] mb-4 md:mb-0">
              <div
                v-if="match.status === 'live'"
                class="flex items-center gap-2 text-red-500 font-black uppercase text-[10px] tracking-widest animate-pulse"
              >
                <span class="h-2 w-2 bg-red-500 rounded-full"></span> LIVE
              </div>
              <div v-else class="text-zinc-400 font-bold text-sm uppercase">
                {{ formatMatchTime(match.match_date) }}
              </div>
            </div>

            <!-- Игроки, Аватары и Счет -->
            <div class="flex items-center gap-4 md:gap-8 flex-1 justify-center">
              <!-- Игрок 1 -->
              <div class="flex items-center gap-3 flex-1 justify-end">
                <span
                  class="text-lg md:text-xl font-black uppercase text-right truncate max-w-[120px] md:max-w-[200px]"
                >
                  {{ match.player1_name }}
                </span>
                <PlayerAvatar
                  :player="{ id: 0, name: match.player1_name, rank: match.player1_rank }"
                  :size="'sm'"
                />
              </div>

              <!-- Счет -->
              <div
                class="flex items-center gap-3 bg-black/30 px-5 py-2 rounded-2xl border border-white/5 shadow-inner"
              >
                <span
                  :class="[
                    'text-2xl font-black',
                    match.score1 > match.score2 ? 'text-green-400' : 'text-white',
                  ]"
                >
                  {{ match.score1 }}
                </span>
                <span class="text-zinc-600 font-bold">:</span>
                <span
                  :class="[
                    'text-2xl font-black',
                    match.score2 > match.score1 ? 'text-green-400' : 'text-white',
                  ]"
                >
                  {{ match.score2 }}
                </span>
              </div>

              <!-- Игрок 2 -->
              <div class="flex items-center gap-3 flex-1 justify-start">
                <PlayerAvatar
                  :player="{ id: 0, name: match.player2_name, rank: match.player2_rank }"
                  :size="'sm'"
                />
                <span
                  class="text-lg md:text-xl font-black uppercase text-left truncate max-w-[120px] md:max-w-[200px]"
                >
                  {{ match.player2_name }}
                </span>
              </div>
            </div>

            <!-- Кнопка (с .stop, чтобы не срабатывал переход на матч) -->
            <div class="min-w-[150px] flex justify-end mt-4 md:mt-0">
              <a
                v-if="match.video_url"
                :href="match.video_url"
                target="_blank"
                @click.stop
                class="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                Смотреть <span class="text-lg leading-none">▶</span>
              </a>
              <span v-else class="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Ожидание
              </span>
            </div>
          </div>
        </div>

        <div
          v-else
          class="bg-black/10 border border-dashed border-white/10 rounded-[2rem] py-20 text-center"
        >
          <p class="text-zinc-500 font-bold uppercase tracking-widest text-sm">
            Матчи еще не запланированы
          </p>
        </div>
      </div>
    </main>

    <div v-else class="flex items-center justify-center min-h-[80vh]">
      <div
        class="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"
      ></div>
    </div>
  </div>
</template>
