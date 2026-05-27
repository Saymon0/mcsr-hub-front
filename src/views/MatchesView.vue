<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'

interface Match {
  id: number
  tournament_id: number
  tournament_name: string
  player1_id: string | number
  player1_name: string
  player1_rank: number | null
  player2_id: string | number
  player2_name: string
  player2_rank: number | null
  score1: number
  score2: number
  match_date: string
  status: 'scheduled' | 'live' | 'completed'
  format: string
  category: string
}

const matches = ref<Match[]>([])
const isLoading = ref(true)

// По умолчанию ставим "upcoming", так как в твоих данных сейчас только "scheduled" матчи
const currentFilter = ref<'ongoing' | 'upcoming' | 'finished'>('upcoming')

const fetchMatches = async () => {
  try {
    isLoading.value = true
    // Теперь адрес берется из переменной окружения
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/matches`)

    if (!res.ok) throw new Error('Ошибка при загрузке матчей')

    matches.value = await res.json()
  } catch (err) {
    console.error('Ошибка:', err)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const formatted = date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  return formatted.replace('.', '').replace(',', '')
}

const filteredGroupedMatches = computed(() => {
  console.log('Исходные матчи из БД:', matches.value)

  const filtered = matches.value.filter((m) => {
    const s = String(m.status || '')
      .trim()
      .toLowerCase()
    const isMatch = s === 'scheduled' // Проверяем только 'upcoming' для теста

    if (!isMatch) {
      console.log(`Матч ${m.id} отсеян. Статус в БД: "${m.status}", Ожидали: "scheduled"`)
    }
    return isMatch
  })

  console.log('Матчи после фильтрации:', filtered)

  const groups: Record<string, any> = {}
  filtered.forEach((m) => {
    const name = m.tournament_name || 'БЕЗ ТУРНИРА'
    if (!groups[name]) groups[name] = { name, matches: [] }
    groups[name].matches.push(m)
  })

  return Object.values(groups)
})

onMounted(fetchMatches)
</script>

<template>
  <div class="min-h-screen bg-[#0f0a24] text-white selection:bg-purple-500/30">
    <Header />

    <main class="max-w-7xl mx-auto px-6 py-10">

      <!-- Шапка и Фильтры -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 class="text-4xl font-black uppercase tracking-tighter leading-none">
          РАСПИСАНИЕ <span class="text-[#7c3aed]">МАТЧЕЙ</span>
        </h1>

        <div class="flex gap-2 bg-[#1a133d] p-1.5 rounded-2xl border border-white/5">
          <button
            v-for="f in [
              { key: 'ongoing', label: 'Сейчас' },
              { key: 'upcoming', label: 'Предстоящие' },
              { key: 'finished', label: 'Завершённые' },
            ]"
            :key="f.key"
            @click="currentFilter = f.key as any"
            :class="[
              'px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300',
              currentFilter === f.key
                ? 'bg-[#7c3aed] text-white shadow-lg'
                : 'text-zinc-400 hover:text-white',
            ]"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="flex justify-center py-20">
        <div
          class="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"
        ></div>
      </div>

      <!-- Список -->
      <div v-else-if="filteredGroupedMatches.length > 0" class="space-y-16">
        <section v-for="group in filteredGroupedMatches" :key="group.name">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-px flex-1 bg-gradient-to-r from-[#7c3aed]/50 to-transparent"></div>
            <h2 class="text-xl font-black uppercase tracking-widest text-[#7c3aed]">
              {{ group.name }}
            </h2>
            <div class="h-px flex-1 bg-gradient-to-l from-[#7c3aed]/50 to-transparent"></div>
          </div>

          <div class="grid gap-4">
            <RouterLink
              v-for="match in group.matches"
              :key="match.id"
              :to="`/matches/${match.id}`"
              class="bg-[#1a133d] border transition-all rounded-2xl p-6 grid grid-cols-[140px_1fr_180px] items-center group shadow-lg border-white/5 hover:border-[#7c3aed]/50"
              :class="{
                'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]': match.status === 'live',
              }"
            >
              <!-- Дата -->
              <div
                class="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors"
              >
                {{ formatDate(match.match_date) }}
              </div>

              <!-- Команды и Счёт -->
              <div class="flex items-center justify-center gap-8">
                <!-- Player 1 -->
                <div class="flex items-center gap-4 flex-1 justify-end">
                  <span
                    class="text-lg font-black uppercase group-hover:text-[#7c3aed] transition-colors truncate"
                  >
                    {{ match.player1_name }}
                  </span>
                  <PlayerAvatar
                    :player="{
                      id: Number(match.player1_id || 0),
                      name: match.player1_name,
                      rank: match.player1_rank ?? 0,
                    }"
                    size="sm"
                  />
                </div>

                <!-- Score -->
                <div class="flex flex-col items-center min-w-[120px]">
                  <div
                    class="bg-black/40 px-5 py-2 rounded-lg border border-white/10 text-2xl font-black tabular-nums"
                  >
                    {{ match.score1 }} : {{ match.score2 }}
                  </div>
                  <div class="text-[10px] font-black text-zinc-600 uppercase mt-1 tracking-tighter">
                    Best of {{ match.format }}
                  </div>
                </div>

                <!-- Player 2 -->
                <div class="flex items-center gap-4 flex-1 justify-start">
                  <PlayerAvatar
                    :player="{
                      id: Number(match.player2_id || 0),
                      name: match.player2_name,
                      rank: match.player2_rank ?? 0,
                    }"
                    size="sm"
                  />
                  <span
                    class="text-lg font-black uppercase group-hover:text-[#7c3aed] transition-colors truncate"
                  >
                    {{ match.player2_name }}
                  </span>
                </div>
              </div>

              <!-- Статус -->
              <div class="flex items-center justify-end gap-6">
                <div class="text-right">
                  <div class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {{ match.category }}
                  </div>
                  <div
                    class="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded mt-1 inline-block"
                    :class="[
                      match.status === 'live'
                        ? 'bg-red-500 text-white animate-pulse'
                        : match.status === 'completed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 text-zinc-400',
                    ]"
                  >
                    {{
                      match.status === 'live'
                        ? 'СЕЙЧАС'
                        : match.status === 'completed'
                          ? 'ЗАВЕРШЕН'
                          : 'ОЖИДАНИЕ'
                    }}
                  </div>
                </div>
                <div class="text-zinc-700 group-hover:text-[#7c3aed] transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>

      <!-- Пустое состояние -->
      <div
        v-else
        class="text-center py-20 bg-[#1a133d] rounded-[3rem] border border-white/5 shadow-inner"
      >
        <p class="text-zinc-500 font-black uppercase tracking-widest italic opacity-50">
          Матчей в данной категории пока нет
        </p>
      </div>
    </main>
  </div>
</template>
