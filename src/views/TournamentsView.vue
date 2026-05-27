<script setup lang="ts">
import API_URL from '@/api'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Header from '@/components/layout/Header.vue'

interface Tournament {
  id: number
  title: string
  status: 'upcoming' | 'ongoing' | 'finished'
  start_date?: string
  end_date?: string
  prize_pool?: string
  player_count?: number
}

const tournaments = ref<Tournament[]>([])
const isLoading = ref(true)
const currentFilter = ref<'ongoing' | 'upcoming' | 'finished'>('ongoing')

const fetchTournaments = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/tournaments`)
    tournaments.value = response.data
  } catch (err) {
    console.error('Ошибка:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredTournaments = computed(() => {
  return tournaments.value.filter((t) => t.status === currentFilter.value)
})

// Форматируем дату и принудительно вырезаем " в "
const formatTournamentDate = (start?: string, end?: string) => {
  if (!start) return 'Дата уточняется'

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short', // "мая" -> "мая" (короткий формат обычно аккуратнее)
    hour: '2-digit',
    minute: '2-digit',
  }

  const formatter = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleString('ru-RU', options)
      .replace(' в ', ' ') // Убираем предлог
      .replace(',', '') // Убираем лишнюю запятую, если она появится
  }

  const startFormatted = formatter(start)

  if (end) {
    const endFormatted = formatter(end)
    return `${startFormatted} — ${endFormatted}`
  }

  return startFormatted
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: 'Сейчас',
    upcoming: 'Предстоящий',
    finished: 'Завершён',
  }
  return labels[status] || status
}

const getStatusClasses = (status: string) => {
  switch (status) {
    case 'ongoing':
      return 'bg-red-500/10 border-red-500 text-red-500'
    case 'upcoming':
      return 'bg-blue-500/10 border-blue-500 text-blue-400'
    case 'finished':
      return 'bg-zinc-500/10 border-zinc-500 text-zinc-400'
    default:
      return 'bg-purple-500/10 border-purple-500 text-purple-400'
  }
}

onMounted(fetchTournaments)
</script>

<template>
  <div class="min-h-screen bg-[#1a1147] text-white selection:bg-red-500/30">
    <Header />

    <main class="max-w-7xl mx-auto px-6 py-10">
      <!-- Заголовок страницы -->
      <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <h1 class="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
          Турниры <span class="text-[#A78BFA]">MCSR</span>
        </h1>
      </div>

      <!-- Фильтрация -->
      <div class="flex gap-2 mb-10 bg-[#2D1B69]/50 p-1.5 rounded-2xl w-fit border border-white/5">
        <button
          v-for="f in ['ongoing', 'upcoming', 'finished']"
          :key="f"
          @click="currentFilter = f as any"
          :class="[
            'px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300',
            currentFilter === f
              ? 'bg-[#7c3aed] text-white shadow-lg'
              : 'text-zinc-400 hover:text-white',
          ]"
        >
          {{ getStatusLabel(f) }}
        </button>
      </div>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 opacity-50">
        <div
          class="w-10 h-10 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mb-4"
        ></div>
      </div>

      <!-- Сетка кликабельных карточек -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RouterLink
          v-for="t in filteredTournaments"
          :key="t.id"
          :to="`/tournaments/${t.id}`"
          class="group bg-[#3C2A7A] border border-white/10 rounded-[2rem] p-6 flex flex-col hover:border-[#7c3aed]/50 transition-all duration-500 hover:-translate-y-1"
        >
          <div class="flex justify-between items-start mb-8">
            <!-- Статусы -->
            <div
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-colors',
                getStatusClasses(t.status),
              ]"
            >
              <!-- Моргающая точка только для "Сейчас" -->
              <span v-if="t.status === 'ongoing'" class="relative flex h-2 w-2">
                <span
                  class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"
                ></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {{ getStatusLabel(t.status) }}
            </div>

            <img
              src="@/assets/trophy.png"
              class="w-10 h-10 object-contain drop-shadow-2xl"
              alt="Trophy"
            />
          </div>

          <!-- Название турнира  -->
          <h3
            class="text-2xl font-black uppercase leading-[1.1] mb-6 group-hover:text-[#e9d5ff] transition-colors"
          >
            {{ t.title }}
          </h3>

          <!-- Инфо-блок в карточке -->
          <div class="bg-[#2D1B69] rounded-2xl p-5 space-y-3 border border-white/5 mt-auto">
            <div
              class="text-[11px] font-bold uppercase tracking-[0.1em] text-white text-center leading-relaxed"
            >
              {{ formatTournamentDate(t.start_date, t.end_date) }}
            </div>
            <div class="text-[#F0E6D2] font-black text-sm text-center">
              {{ t.prize_pool || 'Призовой фонд TBA' }}
            </div>
            <!-- Количество игроков -->
            <div class="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
              <span class="text-[10px] font-bold uppercase tracking-widest text-[#A78BFA]"
                >Игроков:</span
              >
              <span class="text-xs font-black text-white">{{ t.player_count || 0 }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
