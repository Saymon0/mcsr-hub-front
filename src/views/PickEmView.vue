<script setup lang="ts">
import API_URL from '@/api'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Header from '@/components/layout/Header.vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'

// Указываем точный адрес бэкенда, чтобы избежать проблем с прокси и путями
const API_BASE_URL = API_URL

interface Player {
  id: number | string
  name: string
  seed: number
  uuid: string
  avatar?: string
}

interface Match {
  id: number
  p1: Player | null
  p2: Player | null
  winnerId: number | null
}

const user = ref<{ name: string; id: number } | null>(null)
const TOURNAMENT_ID = 1

const createEmptyMatches = (count: number, startId: number): Match[] =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    p1: null,
    p2: null,
    winnerId: null,
  }))

const roundOf16 = ref<Match[]>([
  {
    id: 1,
    p1: {
      id: '92110901e97d43238690f6ca4951670b',
      name: 'Infume',
      seed: 1,
      uuid: '92110901e97d43238690f6ca4951670b',
    },
    p2: {
      id: '5c00e1215b2e49c7921a9761e389b251',
      name: 'HDMICables',
      seed: 16,
      uuid: '5c00e1215b2e49c7921a9761e389b251',
    },
    winnerId: null,
  },
  {
    id: 2,
    p1: {
      id: '4978809497e54c6a964724a7375a0349',
      name: 'silverrruns',
      seed: 8,
      uuid: '4978809497e54c6a964724a7375a0349',
    },
    p2: {
      id: '887d90d80c054238997a371285223c6c',
      name: 'hackingnoises',
      seed: 9,
      uuid: '887d90d80c054238997a371285223c6c',
    },
    winnerId: null,
  },
  {
    id: 3,
    p1: {
      id: '095663738e404097a82775f0a6f87498',
      name: 'doogile',
      seed: 4,
      uuid: '095663738e404097a82775f0a6f87498',
    },
    p2: {
      id: '28639207865c49f899e32a67e43685e1',
      name: 'Aquacorde',
      seed: 13,
      uuid: '28639207865c49f899e32a67e43685e1',
    },
    winnerId: null,
  },
  {
    id: 4,
    p1: {
      id: '012586718d04445bb0b86940026e6d30',
      name: 'BlazeMind',
      seed: 5,
      uuid: '012586718d04445bb0b86940026e6d30',
    },
    p2: {
      id: '530f9a2636f140df985764f6990d0999',
      name: 'bing_pigs',
      seed: 10,
      uuid: '530f9a2636f140df985764f6990d0999',
    },
    winnerId: null,
  },
  {
    id: 5,
    p1: {
      id: '5507421118124808a38545582f3c09b0',
      name: 'edcr',
      seed: 2,
      uuid: '5507421118124808a38545582f3c09b0',
    },
    p2: {
      id: 'a95392233f2b489c9c8e9b67f13063f1',
      name: 'ulsah1n',
      seed: 12,
      uuid: 'a95392233f2b489c9c8e9b67f13063f1',
    },
    winnerId: null,
  },
  {
    id: 6,
    p1: {
      id: '98275682023d46779a957864703a891f',
      name: 'BeefSalad',
      seed: 7,
      uuid: '98275682023d46779a957864703a891f',
    },
    p2: {
      id: 'd95710d8923d46779a957864703a111f',
      name: 'BadGamer',
      seed: 14,
      uuid: 'd95710d8923d46779a957864703a111f',
    },
    winnerId: null,
  },
  {
    id: 7,
    p1: {
      id: '8f6d89283944400589a696237039a81f',
      name: 'Feinberg',
      seed: 3,
      uuid: '8f6d89283944400589a696237039a81f',
    },
    p2: {
      id: 'c95710d8923d46779a957864703a8111',
      name: 'lowk3y_',
      seed: 11,
      uuid: 'c95710d8923d46779a957864703a8111',
    },
    winnerId: null,
  },
  {
    id: 8,
    p1: {
      id: 'b95710d8923d46779a957864703a222f',
      name: '7rowl',
      seed: 6,
      uuid: 'b95710d8923d46779a957864703a222f',
    },
    p2: {
      id: '685d10d19642436d936940866503c563',
      name: 'nhb_',
      seed: 15,
      uuid: '685d10d19642436d936940866503c563',
    },
    winnerId: null,
  },
])

const quarterFinals = ref<Match[]>(createEmptyMatches(4, 9))
const semiFinals = ref<Match[]>(createEmptyMatches(2, 13))
const finals = ref<Match[]>(createEmptyMatches(1, 15))
const thirdPlaceMatch = ref<Match[]>(createEmptyMatches(1, 16))
const allRounds = [roundOf16, quarterFinals, semiFinals, finals]

const processWinnerSelection = (
  roundIndex: number,
  matchIndex: number,
  winnerId: number | null,
) => {
  const currentRound = allRounds[roundIndex].value
  const match = currentRound[matchIndex]

  match.winnerId = winnerId
  const winner = winnerId === 1 ? match.p1 : winnerId === 2 ? match.p2 : null

  // Продвигаем победителя в следующий раунд (для Гранд-финала это конечная точка)
  if (roundIndex < allRounds.length - 1) {
    const nextRound = allRounds[roundIndex + 1].value
    const nextMatchIndex = Math.floor(matchIndex / 2)
    const nextPlayerSlot = matchIndex % 2 === 0 ? 'p1' : 'p2'

    nextRound[nextMatchIndex][nextPlayerSlot] = winner
    if (!winner) nextRound[nextMatchIndex].winnerId = null
    clearSubsequentRounds(roundIndex + 1, nextMatchIndex)
  }

  // ИСПРАВЛЕНИЕ БАГА №2: Если это Полуфинал (roundIndex === 2), отправляем ПРОИГРАВШЕГО в матч за 3-е место
  if (roundIndex === 2) {
    const loser = winnerId === 1 ? match.p2 : winnerId === 2 ? match.p1 : null
    const slot = matchIndex === 0 ? 'p1' : 'p2'

    thirdPlaceMatch.value[0][slot] = loser
    // Если выбор в полуфинале был отменен, сбрасываем и победителя матча за 3 место
    if (!winnerId) thirdPlaceMatch.value[0].winnerId = null
  }
}

onMounted(async () => {
  const userData = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  if (userData) user.value = JSON.parse(userData)

  if (token && user.value) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/picks/${TOURNAMENT_ID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Сортируем прогнозы по ID матча, чтобы сетка заполнялась последовательно (от 1/8 к финалам)
      const sortedPicks = response.data.sort((a: any, b: any) => a.matchId - b.matchId)

      sortedPicks.forEach((pick: any) => {
        allRounds.forEach((roundRef, rIdx) => {
          const matchIndex = roundRef.value.findIndex((m) => m.id === pick.matchId)
          if (matchIndex !== -1) processWinnerSelection(rIdx, matchIndex, pick.predictedWinnerId)
        })
        if (thirdPlaceMatch.value[0].id === pick.matchId)
          thirdPlaceMatch.value[0].winnerId = pick.predictedWinnerId
      })
    } catch (err) {
      console.error('Ошибка загрузки прогнозов:', err)
    }
  }
})

const selectWinner = async (roundIndex: number, matchIndex: number, playerNum: number) => {
  const token = localStorage.getItem('token')
  if (!user.value || !token) return alert('Войдите в систему для отправки прогноза')

  const match = allRounds[roundIndex].value[matchIndex]

  // ИСПРАВЛЕНИЕ БАГА №1: Запрещаем выбор, если один из оппонентов ещё не определен (TBD)
  if (!match.p1 || !match.p2) {
    alert('Нельзя выбрать победителя, пока не определятся оба участника матча!')
    return
  }

  const newWinnerId = match.winnerId === playerNum ? null : playerNum

  try {
    await axios.post(
      `${API_BASE_URL}/api/picks`,
      {
        tournamentId: TOURNAMENT_ID,
        matchId: match.id,
        predictedWinnerId: newWinnerId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    processWinnerSelection(roundIndex, matchIndex, newWinnerId)
  } catch (err) {
    console.error('Ошибка сохранения победителя:', err)
    alert('Ошибка сохранения. Убедитесь, что вы авторизованы.')
  }
}

const selectThirdPlace = async (playerNum: number) => {
  const token = localStorage.getItem('token')
  if (!user.value || !token) return alert('Войдите в систему для отправки прогноза')

  const match = thirdPlaceMatch.value[0]

  // ИСПРАВЛЕНИЕ БАГА №1 (для матча за 3 место): Запрещаем выбор, если участники еще не спустились из полуфиналов
  if (!match.p1 || !match.p2) {
    alert('Нельзя выбрать победителя, пока не определятся оба участника матча за 3-е место!')
    return
  }

  try {
    const newWinnerId = match.winnerId === playerNum ? null : playerNum
    await axios.post(
      `${API_BASE_URL}/api/picks`,
      {
        tournamentId: TOURNAMENT_ID,
        matchId: match.id,
        predictedWinnerId: newWinnerId,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )

    match.winnerId = newWinnerId
  } catch (err) {
    console.error('Ошибка чтения 3 места:', err)
    alert('Ошибка сохранения. Убедитесь, что вы авторизованы.')
  }
}

const clearSubsequentRounds = (roundIndex: number, matchIndex: number) => {
  // ИСПРАВЛЕНИЕ БАГА №3: Если мы сбрасываем ветку, дошедшую до полуфиналов (индекс 2),
  // нужно также очистить соответствующий слот в матче за 3-е место
  if (roundIndex === 2) {
    const slot = matchIndex === 0 ? 'p1' : 'p2'
    thirdPlaceMatch.value[0][slot] = null
    thirdPlaceMatch.value[0].winnerId = null
  }

  if (roundIndex >= allRounds.length - 1) return

  const nextRound = allRounds[roundIndex + 1].value
  const nextMatchIndex = Math.floor(matchIndex / 2)
  const nextPlayerSlot = matchIndex % 2 === 0 ? 'p1' : 'p2'

  nextRound[nextMatchIndex][nextPlayerSlot] = null
  nextRound[nextMatchIndex].winnerId = null

  clearSubsequentRounds(roundIndex + 1, nextMatchIndex)
}
</script>
<template>
  <div class="min-h-screen bg-[#0a0a0a] text-zinc-300 selection:bg-indigo-500/30">
    <Header />
    <main class="p-6">
      <div class="flex justify-center items-center gap-6 mb-8">
        <button
          class="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition text-zinc-500 hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-2xl font-black uppercase tracking-widest text-white">Плей-офф 10 Сезона</h1>
        <button
          class="p-2 hover:bg-white/5 rounded-lg border border-white/10 transition text-zinc-700 cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div
        class="max-w-[1400px] mx-auto mb-8 flex justify-between items-center bg-[#061a0f] border border-[#0f3d23] rounded-lg px-4 py-2.5"
      >
        <div class="flex items-center gap-2">
          <span class="text-[#00ff6a] font-bold text-xs uppercase tracking-tight"
            >Прогнозы закроются:</span
          >
          <span class="text-white text-sm font-bold"> 30 Июня в 22:00</span>
        </div>
        <span class="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
          Редактирование доступно только до начала раунда
        </span>
      </div>

      <div class="max-w-[1400px] mx-auto grid grid-cols-[1fr_340px] gap-8">
        <div class="grid grid-cols-4 gap-4 relative">
          <div
            v-for="title in ['1/8 Финала', 'Четвертьфиналы', 'Полуфиналы']"
            :key="title"
            class="text-center"
          >
            <h3 class="text-zinc-500 text-[10px] font-black uppercase mb-4 tracking-wider">
              {{ title }}
            </h3>
          </div>
          <div></div>

          <div
            v-for="(round, roundIdx) in allRounds"
            :key="roundIdx"
            class="flex flex-col justify-around"
          >
            <template v-if="roundIdx < 3">
              <div
                v-for="(match, matchIdx) in round.value"
                :key="match.id"
                class="w-full rounded-md border border-white/5 overflow-hidden shadow-xl shadow-black/20 my-2"
              >
                <div
                  v-for="pNum in [1, 2]"
                  :key="pNum"
                  @click="
                    (pNum === 1 ? match.p1 : match.p2) && selectWinner(roundIdx, matchIdx, pNum)
                  "
                  :class="[
                    'flex items-center justify-between p-2 transition',
                    match.winnerId === pNum ? 'bg-indigo-600/20' : 'bg-[#141414]',
                    pNum === 1 ? 'border-b border-white/5' : '',
                    (pNum === 1 ? match.p1 : match.p2) && user
                      ? 'cursor-pointer hover:bg-[#1a1a1a]'
                      : '',
                  ]"
                >
                  <div class="flex items-center gap-3 overflow-hidden">
                    <template v-if="pNum === 1 ? match.p1 : match.p2">
                      <span
                        :class="[
                          'text-[10px] font-bold w-3 text-right',
                          match.winnerId === pNum ? 'text-indigo-400' : 'text-zinc-600',
                        ]"
                      >
                        {{ (pNum === 1 ? match.p1 : match.p2)?.seed }}
                      </span>
                      <PlayerAvatar
                        :player="pNum === 1 ? match.p1! : match.p2!"
                        size="sm"
                        class="flex-shrink-0"
                      />
                      <span
                        :class="[
                          'text-xs font-bold truncate',
                          match.winnerId === pNum ? 'text-white' : 'text-zinc-200',
                        ]"
                      >
                        {{ (pNum === 1 ? match.p1 : match.p2)?.name }}
                      </span>
                    </template>
                    <span v-else class="text-[10px] font-bold text-zinc-600 uppercase">TBD</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="flex flex-col gap-16 py-8">
                <div class="flex flex-col items-center">
                  <h3 class="text-zinc-500 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">
                    Гранд-финал
                  </h3>
                  <div
                    class="w-full rounded-md border border-yellow-500/30 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.05)] bg-[#0f0f0f]"
                  >
                    <div
                      v-for="pNum in [1, 2]"
                      :key="pNum"
                      @click="
                        round.value[0][pNum === 1 ? 'p1' : 'p2'] && selectWinner(roundIdx, 0, pNum)
                      "
                      :class="[
                        'flex items-center justify-between p-3 transition',
                        round.value[0].winnerId === pNum ? 'bg-yellow-500/10' : '',
                        pNum === 1 ? 'border-b border-white/5' : '',
                        round.value[0][pNum === 1 ? 'p1' : 'p2'] && user
                          ? 'cursor-pointer hover:bg-white/5'
                          : '',
                      ]"
                    >
                      <div class="flex items-center gap-3 overflow-hidden">
                        <template v-if="pNum === 1 ? round.value[0].p1 : round.value[0].p2">
                          <PlayerAvatar
                            :player="pNum === 1 ? round.value[0].p1! : round.value[0].p2!"
                            size="sm"
                          />
                          <span
                            :class="[
                              'text-sm font-bold truncate',
                              round.value[0].winnerId === pNum
                                ? 'text-yellow-500'
                                : 'text-zinc-200',
                            ]"
                          >
                            {{ (pNum === 1 ? round.value[0].p1 : round.value[0].p2)?.name }}
                          </span>
                        </template>
                        <span v-else class="text-[10px] font-bold text-zinc-600 uppercase"
                          >TBD</span
                        >
                      </div>
                      <div
                        v-if="round.value[0].winnerId === pNum"
                        class="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-center">
                  <h3 class="text-zinc-500 text-[11px] font-black uppercase mb-4 tracking-[0.2em]">
                    Матч за 3-е место
                  </h3>
                  <div
                    class="w-full rounded-md border border-orange-500/30 overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.05)] bg-[#0f0f0f]"
                  >
                    <div
                      v-for="pNum in [1, 2]"
                      :key="pNum"
                      @click="selectThirdPlace(pNum)"
                      :class="[
                        'flex items-center justify-between p-3 transition',
                        thirdPlaceMatch[0].winnerId === pNum ? 'bg-orange-500/10' : '',
                        pNum === 1 ? 'border-b border-white/5' : '',
                        (pNum === 1 ? thirdPlaceMatch[0].p1 : thirdPlaceMatch[0].p2) && user
                          ? 'cursor-pointer hover:bg-white/5'
                          : '',
                      ]"
                    >
                      <div class="flex items-center gap-3 overflow-hidden">
                        <template v-if="pNum === 1 ? thirdPlaceMatch[0].p1 : thirdPlaceMatch[0].p2">
                          <PlayerAvatar
                            :player="pNum === 1 ? thirdPlaceMatch[0].p1! : thirdPlaceMatch[0].p2!"
                            size="sm"
                          />
                          <span
                            :class="[
                              'text-sm font-bold truncate',
                              thirdPlaceMatch[0].winnerId === pNum
                                ? 'text-orange-500'
                                : 'text-zinc-200',
                            ]"
                          >
                            {{ (pNum === 1 ? thirdPlaceMatch[0].p1 : thirdPlaceMatch[0].p2)?.name }}
                          </span>
                        </template>
                        <span v-else class="text-[10px] font-bold text-zinc-600 uppercase"
                          >TBD</span
                        >
                      </div>
                      <div
                        v-if="thirdPlaceMatch[0].winnerId === pNum"
                        class="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-2xl">
            <h3 class="text-[11px] font-black uppercase text-zinc-500 mb-8 tracking-widest">
              Итоги турнира
            </h3>

            <div class="flex items-end justify-center gap-3 h-56 mb-6">
              <div class="flex flex-col items-center flex-1">
                <img
                  src="@/assets/silver.png"
                  alt="Silver"
                  class="w-12 mb-2 drop-shadow-[0_0_8px_rgba(192,192,192,0.5)]"
                />
                <div
                  class="w-full bg-gradient-to-b from-zinc-400 to-zinc-600 h-24 rounded-t-sm flex flex-col items-center justify-center border-t border-white/20 shadow-lg"
                >
                  <span class="text-white font-black text-lg leading-none">2nd</span>
                  <span class="text-zinc-200 text-[10px] font-bold mt-1">$1,500</span>
                </div>
              </div>

              <div class="flex flex-col items-center flex-1">
                <img
                  src="@/assets/trophy.png"
                  alt="Gold"
                  class="w-16 mb-2 drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]"
                />
                <div
                  class="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 h-36 rounded-t-sm flex flex-col items-center justify-center border-t border-white/30 shadow-xl"
                >
                  <span class="text-yellow-900 font-black text-2xl leading-none">1st</span>
                  <span class="text-yellow-950/80 text-[11px] font-bold mt-1">$3,000</span>
                </div>
              </div>

              <div class="flex flex-col items-center flex-1">
                <img
                  src="@/assets/bronze.png"
                  alt="Bronze"
                  class="w-12 mb-2 drop-shadow-[0_0_8px_rgba(205,127,50,0.5)]"
                />
                <div
                  class="w-full bg-gradient-to-b from-orange-700 to-orange-900 h-16 rounded-t-sm flex flex-col items-center justify-center border-t border-white/10 shadow-md"
                >
                  <span class="text-white font-black text-base leading-none">3rd</span>
                  <span class="text-orange-200/70 text-[9px] font-bold mt-1">$500</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
