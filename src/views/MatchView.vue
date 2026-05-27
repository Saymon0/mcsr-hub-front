<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'

// Интерфейс для типизации статистики игроков
interface PlayerStats {
  eloRate: number | null
  eloRank: number | null
  wins: number
  totalMatches: number
  bestTime: number | null
  connections?: {
    twitch?: { name: string; id: string }
    discord?: { name: string; id: string }
    youtube?: { name: string; id: string }
  }
}

const route = useRoute()
const matchId = route.params.id

// Реактивные состояния
const match = ref<any>(null)
const tournament = ref<any>(null)
const isLoading = ref(true)
const player1Stats = ref<PlayerStats | null>(null)
const player2Stats = ref<PlayerStats | null>(null)

/**
 * Вычисляемый массив сидов.
 * Проходит циклом по количеству игр в формате (например, 3 для BO3)
 * и извлекает поля seed1, seed2... из объекта матча.
 */
const seedsArray = computed(() => {
  if (!match.value) return []
  const formatCount = parseInt(match.value.format) || 1
  const result = []

  for (let i = 1; i <= formatCount; i++) {
    const seedValue = match.value[`seed${i}`]
    if (seedValue) {
      result.push({
        id: i,
        name: seedValue,
      })
    }
  }
  return result
})

// Форматирование времени (мс -> ММ:СС)
const formatMs = (ms: string | number | null | undefined) => {
  const time = Number(ms)
  if (!ms || isNaN(time) || time === 0) return 'N/A'
  const minutes = Math.floor(time / 60000)
  const seconds = Math.floor((time % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Расчет винрейта
const calculateWinRate = (stats: PlayerStats | null) => {
  if (!stats || stats.totalMatches === 0) return '0%'
  return Math.round((stats.wins / stats.totalMatches) * 100) + '%'
}

// Загрузка статистики из MCSR API
const fetchMCSRData = async (nickname: string): Promise<PlayerStats | null> => {
  try {
    const res = await fetch(`https://api.mcsrranked.com/users/${nickname}`)
    if (!res.ok) return null
    const json = await res.json()
    const data = json.data

    const winStat = data.statistics?.season?.wins?.ranked || 0
    const loseStat = data.statistics?.season?.loses?.ranked || 0

    return {
      eloRate: data.eloRate,
      eloRank: data.eloRank,
      wins: winStat,
      totalMatches: winStat + loseStat,
      bestTime: data.statistics?.season?.bestTime?.ranked || null,
      connections: data.connections,
    }
  } catch (err) {
    return null
  }
}

// Основная функция загрузки данных
const fetchData = async () => {
  try {
    isLoading.value = true

    // Загружаем матч
    const res = await fetch(`http://localhost:3001/api/matches/${matchId}`)
    if (!res.ok) throw new Error('Матч не найден')
    match.value = await res.json()

    // Загружаем турнир и статистику игроков параллельно
    const requests: Promise<any>[] = [
      fetchMCSRData(match.value.player1_name),
      fetchMCSRData(match.value.player2_name),
    ]

    if (match.value?.tournament_id) {
      requests.push(
        fetch(`http://localhost:3001/api/tournaments/${match.value.tournament_id}`).then((r) =>
          r.json(),
        ),
      )
    }

    const [p1, p2, tData] = await Promise.all(requests)

    player1Stats.value = p1
    player2Stats.value = p2
    if (tData) tournament.value = tData
  } catch (err) {
    console.error('Ошибка загрузки:', err)
  } finally {
    isLoading.value = false
  }
}

// Порог побед (например, 2 для BO3)
const winThreshold = computed(() => {
  const format = String(match.value?.format || '').toLowerCase()
  const num = parseInt(format)
  return !isNaN(num) ? Math.ceil(num / 2) : 1
})

// Красивое отображение формата
const formatText = computed(() => {
  const val = match.value?.format
  if (!val) return 'Best of 1'
  return isNaN(Number(val)) ? val : `Best of ${val}`
})

onMounted(fetchData)
</script>
<template>
  <div class="min-h-screen bg-[#1a1147] text-white">
    <Header />

    <main v-if="match" class="max-w-7xl mx-auto px-6 py-10">
      <!-- Хлебные крошки -->
      <nav
        class="flex items-center gap-2 text-zinc-400 text-sm mb-8 font-bold uppercase tracking-wider"
      >
        <RouterLink to="/tournaments" class="hover:text-white transition-colors"
          >Турниры</RouterLink
        >
        <span class="text-zinc-600">/</span>
        <RouterLink
          v-if="tournament"
          :to="`/tournaments/${tournament.id}`"
          class="hover:text-white transition-colors"
        >
          {{ tournament.title }}
        </RouterLink>
        <span class="text-zinc-600">/</span>
        <span class="text-white">{{ match.player1_name }} vs {{ match.player2_name }}</span>
      </nav>

      <!-- Заголовок матча -->
      <div
        class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6"
      >
        <div>
          <h1 class="text-4xl md:text-6xl font-black uppercase mb-4">
            {{ tournament?.title || 'Матч турнира' }}
          </h1>
          <div class="flex flex-wrap gap-3">
            <span
              class="px-4 py-1.5 bg-[#3C2A7A] border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest text-zinc-300"
            >
              {{ match.category || 'Any% RSG' }}
            </span>
            <span
              class="px-4 py-1.5 bg-[#3C2A7A] border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest text-zinc-300"
            >
              {{ match.version || '1.16.1' }}
            </span>
            <span
              class="px-4 py-1.5 bg-[#7c3aed] border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest text-white"
            >
              {{ formatText }}
            </span>
          </div>
        </div>

        <div
          class="bg-[#3C2A7A] border border-white/10 p-6 rounded-[2rem] min-w-[240px] text-center shadow-xl"
        >
          <div
            v-if="match.status === 'live'"
            class="text-red-500 font-black uppercase text-xs tracking-[0.2em] mb-2 animate-pulse"
          >
            ● В ЭФИРЕ
          </div>
          <div
            v-else-if="match.status === 'completed'"
            class="text-green-400 font-black uppercase text-xs tracking-[0.2em] mb-2"
          >
            ЗАВЕРШЕН
          </div>
          <div class="text-xl font-black uppercase">
            {{
              new Date(match.match_date).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </div>
        </div>
      </div>

      <!-- Карточки игроков -->
      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <!-- Player 1 -->
        <div
          class="bg-[#2D1B69] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl flex flex-col"
        >
          <div class="flex items-start gap-6 mb-6">
            <PlayerAvatar
              :player="{
                id: match.player1_id,
                name: match.player1_name,
                rank: player1Stats?.eloRank || match.player1_rank,
              }"
              size="lg"
            />
            <div class="flex-1">
              <h2
                class="text-3xl font-black uppercase group-hover:text-[#7c3aed] transition-colors leading-none mb-1"
              >
                {{ match.player1_name }}
              </h2>
              <div class="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                РАНГ #{{ player1Stats?.eloRank || match.player1_rank || '0' }}
              </div>
              <div class="text-green-400/60 font-bold uppercase text-[10px] tracking-widest mt-1">
                ЛУЧШЕЕ ВРЕМЯ: {{ formatMs(player1Stats?.bestTime) }}
              </div>
            </div>
          </div>

          <a
            v-if="player1Stats?.connections?.twitch"
            :href="`https://twitch.tv/${player1Stats.connections.twitch.name}`"
            target="_blank"
            class="mb-6 w-full bg-[#9146ff] hover:bg-[#a970ff] text-white text-center py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            СМОТРЕТЬ ТРАНСЛЯЦИЮ
          </a>

          <div class="grid grid-cols-2 gap-4 mb-8 mt-auto">
            <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div class="text-zinc-500 text-[10px] font-black uppercase mb-1">Процент побед</div>
              <div class="text-xl font-black text-yellow-500">
                {{ calculateWinRate(player1Stats) }}
              </div>
            </div>
            <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div class="text-zinc-500 text-[10px] font-black uppercase mb-1">Всего матчей</div>
              <div class="text-xl font-black">{{ player1Stats?.totalMatches || 0 }}</div>
            </div>
          </div>

          <div
            class="flex items-center justify-between bg-black/30 p-5 rounded-2xl border border-white/5"
          >
            <span class="text-zinc-400 font-black uppercase text-xs tracking-widest">Счет</span>
            <div class="flex items-center gap-3">
              <div class="flex gap-1.5">
                <div
                  v-for="i in winThreshold"
                  :key="i"
                  :class="[
                    'w-4 h-4 rotate-45 border-2 transition-all duration-500',
                    match.score1 >= i
                      ? 'bg-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                      : 'border-white/10',
                  ]"
                ></div>
              </div>
              <span class="text-4xl font-black ml-2">{{ match.score1 }}</span>
            </div>
          </div>
        </div>

        <!-- Player 2 -->
        <div
          class="bg-[#2D1B69] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl flex flex-col"
        >
          <div class="flex items-start gap-6 mb-6">
            <PlayerAvatar
              :player="{
                id: match.player2_id,
                name: match.player2_name,
                rank: player2Stats?.eloRank || match.player2_rank,
              }"
              size="lg"
            />
            <div class="flex-1">
              <h2
                class="text-3xl font-black uppercase group-hover:text-[#7c3aed] transition-colors leading-none mb-1"
              >
                {{ match.player2_name }}
              </h2>
              <div class="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                РАНГ #{{ player2Stats?.eloRank || match.player2_rank || '0' }}
              </div>
              <div class="text-green-400/60 font-bold uppercase text-[10px] tracking-widest mt-1">
                ЛУЧШЕЕ ВРЕМЯ: {{ formatMs(player2Stats?.bestTime) }}
              </div>
            </div>
          </div>

          <a
            v-if="player2Stats?.connections?.twitch"
            :href="`https://twitch.tv/${player2Stats.connections.twitch.name}`"
            target="_blank"
            class="mb-6 w-full bg-[#9146ff] hover:bg-[#a970ff] text-white text-center py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            СМОТРЕТЬ ТРАНСЛЯЦИЮ
          </a>

          <div class="grid grid-cols-2 gap-4 mb-8 mt-auto">
            <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div class="text-zinc-500 text-[10px] font-black uppercase mb-1">Процент побед</div>
              <div class="text-xl font-black text-yellow-500">
                {{ calculateWinRate(player2Stats) }}
              </div>
            </div>
            <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
              <div class="text-zinc-500 text-[10px] font-black uppercase mb-1">Всего матчей</div>
              <div class="text-xl font-black">{{ player2Stats?.totalMatches || 0 }}</div>
            </div>
          </div>

          <div
            class="flex items-center justify-between bg-black/30 p-5 rounded-2xl border border-white/5"
          >
            <span class="text-zinc-400 font-black uppercase text-xs tracking-widest">Счет</span>
            <div class="flex items-center gap-3">
              <div class="flex gap-1.5">
                <div
                  v-for="i in winThreshold"
                  :key="i"
                  :class="[
                    'w-4 h-4 rotate-45 border-2 transition-all duration-500',
                    match.score2 >= i
                      ? 'bg-green-400 border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                      : 'border-white/10',
                  ]"
                ></div>
              </div>
              <span class="text-4xl font-black ml-2">{{ match.score2 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Список Сидов (Maps) -->
      <div
        v-if="seedsArray.length > 0"
        class="bg-[#3C2A7A]/30 border border-white/10 rounded-[2rem] p-8 mb-8"
      >
        <h3 class="text-xl font-black uppercase mb-8 flex items-center gap-3">
          <span class="w-1 h-6 bg-[#7c3aed]"></span> Сгенерированные миры
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="seed in seedsArray"
            :key="seed.id"
            class="bg-black/40 border border-white/10 p-5 rounded-2xl flex flex-col gap-2 hover:border-[#7c3aed]/50 transition-all group"
          >
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-black text-[#7c3aed] uppercase tracking-widest"
                >Сид {{ seed.id }}</span
              >
            </div>
            <div class="text-sm text-zinc-300 break-all select-all leading-relaxed">
              {{ seed.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Детали и Статистика -->
      <div class="grid md:grid-cols-2 gap-8">
        <div class="bg-[#3C2A7A]/30 border border-white/10 rounded-[2rem] p-8">
          <h3 class="text-xl font-black uppercase mb-6 flex items-center gap-3">
            <span class="w-1 h-6 bg-[#7c3aed]"></span> Информация
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-zinc-500 font-bold uppercase text-xs">Формат</span>
              <span class="font-black uppercase tracking-widest">{{ formatText }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-zinc-500 font-bold uppercase text-xs">Версия</span>
              <span class="font-black uppercase">{{ match.version || '1.16.1' }}</span>
            </div>
          </div>
        </div>

        <div class="bg-[#3C2A7A]/30 border border-white/10 rounded-[2rem] p-8">
          <h3 class="text-xl font-black uppercase mb-6 flex items-center gap-3">
            <span class="w-1 h-6 bg-green-400"></span> Турнир
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-zinc-500 font-bold uppercase text-xs">Призовой фонд</span>
              <span class="font-black uppercase text-yellow-500">{{
                tournament?.prize_pool || '$0'
              }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="text-zinc-500 font-bold uppercase text-xs">Дата проведения</span>
              <span class="font-black uppercase">{{
                new Date(match.match_date).toLocaleDateString('ru-RU')
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Лоадер -->
    <div v-else class="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <div
        class="w-16 h-16 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"
      ></div>
      <p class="font-black uppercase tracking-[0.3em] text-zinc-500 text-xs">Загрузка матча...</p>
    </div>
  </div>
</template>
<style scoped>
/* Основной фоновый цвет страницы (void-purple) */
.bg-void-purple {
  background-color: #0f051d;
}

/* Анимация вращения для границ кнопки Twitch */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

/* Эффект кастомного скроллбара для темной темы */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #0f051d;
}

::-webkit-scrollbar-thumb {
  background: #7c3aed;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a78bfa;
}

/* Стили для карточек игроков при наведении */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Плавное свечение для активных ромбов счета */
.shadow-\[0_0_10px_\#7c3aed\] {
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.6);
}

/* Улучшение читаемости текста на градиентном фоне */
h1,
h2,
h3 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Адаптивность для длинных названий сидов */
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Стиль для меток "СКОРО" и "В ЭФИРЕ" */
.font-black {
  font-weight: 900;
}
</style>
