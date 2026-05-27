<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const isAuthenticated = ref(false)
const secretKeyInput = ref('')
const tournaments = ref<any[]>([])
const matches = ref<any[]>([])

// Состояния редактирования
const editingTournamentId = ref<number | null>(null)
const editingMatchId = ref<number | null>(null)

// Форма турнира
const defaultTourForm = {
  title: '',
  status: 'upcoming',
  description: '',
  prize_pool: '',
  start_date: '',
  end_date: '',
  image_url: '',
  player_count: 32,
}
const tourForm = ref({ ...defaultTourForm })

// Форма матча с поддержкой до 7 сидов
const defaultMatchForm = {
  tournament_id: '',
  match_title: '1/16 финала',
  format: '3', // По умолчанию Best of 3
  version: '1.16.1',
  category: 'Any% RSG',
  player1_name: '',
  player2_name: '',
  match_date: '',
  status: 'scheduled',
  video_url: '',
  seed1: '',
  seed2: '',
  seed3: '',
  seed4: '',
  seed5: '',
  seed6: '',
  seed7: '',
}
const matchForm = ref({ ...defaultMatchForm })

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

const handleAutoExpand = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

const validatePrize = () => {
  tourForm.value.prize_pool = tourForm.value.prize_pool.replace(/[^0-9$]/g, '')
}

// Конвертация даты из БД для <input type="datetime-local">
const formatForInput = (dateString: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

// --- АВТОРИЗАЦИЯ ---

const login = () => {
  if (secretKeyInput.value === 'admin123') {
    localStorage.setItem('adminKey', secretKeyInput.value)
    axios.defaults.headers.common['x-admin-key'] = secretKeyInput.value
    isAuthenticated.value = true
    loadInitialData()
  } else {
    alert('Неверный ключ!')
  }
}

const logout = () => {
  localStorage.removeItem('adminKey')
  isAuthenticated.value = false
  delete axios.defaults.headers.common['x-admin-key']
}

// --- ЗАГРУЗКА ДАННЫХ ---

const loadInitialData = () => {
  loadTournaments()
  loadMatches()
}

const loadTournaments = async () => {
  try {
    const res = await axios.get('import.meta.env.VITE_API_URL/api/tournaments')
    tournaments.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки турниров:', err)
  }
}

const loadMatches = async () => {
  try {
    const res = await axios.get('import.meta.env.VITE_API_URL/api/matches')
    matches.value = res.data
  } catch (err) {
    console.error('Ошибка загрузки матчей:', err)
  }
}

// --- УПРАВЛЕНИЕ ТУРНИРАМИ ---

const startEditTournament = (t: any) => {
  editingTournamentId.value = t.id
  tourForm.value = { ...t }
  tourForm.value.start_date = formatForInput(t.start_date)
  tourForm.value.end_date = formatForInput(t.end_date)
}

const cancelEditTournament = () => {
  editingTournamentId.value = null
  tourForm.value = { ...defaultTourForm }
}

const submitTournament = async () => {
  if (new Date(tourForm.value.start_date) > new Date(tourForm.value.end_date)) {
    return alert('Ошибка: Дата начала позже даты окончания')
  }
  try {
    if (editingTournamentId.value) {
      await axios.put(
        `import.meta.env.VITE_API_URL/api/tournaments/${editingTournamentId.value}`,
        tourForm.value,
      )
      alert('Турнир успешно обновлен!')
    } else {
      await axios.post('import.meta.env.VITE_API_URL/api/tournaments', tourForm.value)
      alert('Турнир успешно создан!')
    }
    loadTournaments()
    cancelEditTournament()
  } catch (err) {
    alert('Ошибка бэкенда при сохранении турнира')
  }
}

const deleteTournament = async (id: number) => {
  if (!confirm('ВНИМАНИЕ: Это удалит турнир и ВСЕ матчи, которые к нему привязаны. Продолжить?'))
    return

  try {
    await axios.delete(`import.meta.env.VITE_API_URL/api/tournaments/${id}`)
    alert('Турнир и его матчи удалены')
    loadTournaments()
    loadMatches()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.message || 'Ошибка при полном удалении турнира')
  }
}

// --- УПРАВЛЕНИЕ МАТЧАМИ ---

const startEditMatch = (m: any) => {
  editingMatchId.value = m.id
  matchForm.value = { ...m }
  matchForm.value.match_date = formatForInput(m.match_date)
}

const cancelEditMatch = () => {
  editingMatchId.value = null
  matchForm.value = { ...defaultMatchForm }
}

const submitMatch = async () => {
  try {
    const payload = { ...matchForm.value }

    // Форматируем дату для MySQL
    if (payload.match_date) {
      payload.match_date = payload.match_date.replace('T', ' ') + ':00'
    }

    if (editingMatchId.value) {
      await axios.put(`import.meta.env.VITE_API_URL/api/matches/${editingMatchId.value}`, payload)
      alert('Матч успешно обновлен!')
    } else {
      await axios.post('import.meta.env.VITE_API_URL/api/matches', payload)
      alert('Матч успешно добавлен! Статистика игроков подгружена.')
    }

    loadMatches()
    cancelEditMatch()
  } catch (err) {
    console.error(err)
    alert('Ошибка при сохранении матча. Проверьте никнеймы игроков.')
  }
}

const deleteMatch = async (id: number) => {
  if (!confirm('Вы уверены, что хотите удалить этот матч?')) return
  try {
    await axios.delete(`import.meta.env.VITE_API_URL/api/matches/${id}`)
    loadMatches()
  } catch (err) {
    alert('Ошибка при удалении матча')
  }
}

// Быстрое обновление счета в Live-режиме
const updateScore = async (matchId: number, playerIndex: number, newScore: number) => {
  const match = matches.value.find((m) => m.id === matchId)
  if (!match) return

  // Ограничения: счет не может быть отрицательным и не может превышать формат (макс побед)
  const maxWins = Math.ceil(Number(match.format) / 2)
  if (newScore < 0 || newScore > maxWins) return

  let s1 = playerIndex === 1 ? newScore : match.score1
  let s2 = playerIndex === 2 ? newScore : match.score2

  // Логика авто-коррекции: если один достиг лимита побед, счет другого не должен расти дальше
  if (s1 === maxWins && s2 === maxWins) {
    // В исключительной ситуации ничьи (если формат позволяет) или просто блокировка
    return alert('Счет уже достиг лимита побед')
  }

  try {
    await axios.patch(`import.meta.env.VITE_API_URL/api/matches/${matchId}/score`, {
      score1: s1,
      score2: s2,
    })

    // Обновляем локально
    match.score1 = s1
    match.score2 = s2
  } catch (err) {
    console.error('Ошибка обновления счета:', err)
    alert('Не удалось обновить счет')
  }
}

onMounted(() => {
  const key = localStorage.getItem('adminKey')
  if (key) {
    isAuthenticated.value = true
    axios.defaults.headers.common['x-admin-key'] = key
    loadInitialData()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#1a1147] text-white py-10 px-6 font-sans">
    <div class="max-w-6xl mx-auto">
      <div
        v-if="!isAuthenticated"
        class="max-w-md mx-auto mt-20 bg-[#2D1B69] p-8 rounded-3xl border border-white/10 shadow-2xl"
      >
        <h1
          class="text-3xl font-black uppercase tracking-tighter text-center mb-8 italic text-white"
        >
          Admin Access
        </h1>
        <input
          v-model="secretKeyInput"
          type="password"
          placeholder="Секретный ключ"
          class="form-input mb-4"
          @keyup.enter="login"
        />
        <button
          @click="login"
          class="w-full py-4 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl font-black uppercase transition-all shadow-lg shadow-purple-500/20"
        >
          Войти
        </button>
      </div>

      <div v-else>
        <div
          class="flex justify-between items-center mb-8 bg-[#2D1B69] p-6 rounded-3xl border border-white/10"
        >
          <h1 class="text-3xl font-black uppercase italic text-red-500 flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            Live Control Room
          </h1>
          <button
            @click="logout"
            class="text-xs font-bold uppercase opacity-50 hover:opacity-100 transition-opacity px-4 py-2 border border-white/10 rounded-lg"
          >
            Выйти
          </button>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <div class="bg-[#2D1B69]/50 p-8 rounded-3xl border border-white/5 h-fit relative">
            <h2 class="text-xl font-black uppercase mb-6 border-b border-white/10 pb-4 italic">
              {{ editingTournamentId ? 'Редактировать турнир' : 'Создать турнир' }}
            </h2>
            <form @submit.prevent="submitTournament" class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold ml-2 opacity-50"
                  >Название турнира</label
                >
                <input v-model="tourForm.title" required class="form-input" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Статус</label>
                  <select v-model="tourForm.status" class="form-input">
                    <option value="ongoing">Сейчас</option>
                    <option value="upcoming">Предстоящие</option>
                    <option value="finished">Завершенные</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50"
                    >Призовой фонд</label
                  >
                  <input
                    v-model="tourForm.prize_pool"
                    placeholder="$5,000"
                    class="form-input"
                    @input="validatePrize"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Начало</label>
                  <input
                    v-model="tourForm.start_date"
                    type="datetime-local"
                    required
                    class="form-input"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Конец</label>
                  <input
                    v-model="tourForm.end_date"
                    type="datetime-local"
                    required
                    class="form-input"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Описание</label>
                <textarea
                  v-model="tourForm.description"
                  class="form-input auto-expand"
                  @input="handleAutoExpand"
                  rows="3"
                ></textarea>
              </div>

              <div class="flex gap-4 pt-2">
                <button
                  type="submit"
                  class="flex-1 py-4 bg-green-600 hover:bg-green-500 rounded-2xl font-black uppercase transition-all"
                >
                  {{ editingTournamentId ? 'Сохранить изменения' : 'Опубликовать' }}
                </button>
                <button
                  v-if="editingTournamentId"
                  type="button"
                  @click="cancelEditTournament"
                  class="py-4 px-6 bg-red-600/80 hover:bg-red-500 rounded-2xl font-black uppercase transition-all"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>

          <div class="bg-[#2D1B69]/50 p-8 rounded-3xl border border-white/5 relative">
            <h2 class="text-xl font-black uppercase mb-6 border-b border-white/10 pb-4 italic">
              {{ editingMatchId ? 'Редактировать матч' : 'Добавить матч' }}
            </h2>
            <form @submit.prevent="submitMatch" class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Турнир</label>
                <select v-model="matchForm.tournament_id" required class="form-input">
                  <option value="" disabled>Выберите турнир</option>
                  <option v-for="t in tournaments as any[]" :key="t.id" :value="t.id">
                    {{ t.title }}
                  </option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="matchForm.match_title"
                  placeholder="Этап (напр. Финал)"
                  class="form-input"
                />
                <select v-model="matchForm.format" class="form-input">
                  <option value="1">Best of 1</option>
                  <option value="3">Best of 3</option>
                  <option value="5">Best of 5</option>
                  <option value="7">Best of 7</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <input
                  v-model="matchForm.version"
                  placeholder="Версия (1.16.1)"
                  class="form-input"
                />
                <input
                  v-model="matchForm.category"
                  placeholder="Категория (Any% RSG)"
                  class="form-input"
                />
              </div>

              <div class="p-4 bg-black/20 rounded-2xl space-y-3 border border-white/5">
                <p class="text-[10px] font-bold uppercase opacity-40 italic">Сиды матча (карты)</p>

                <select v-model="matchForm.seed1" class="form-input bg-white/5">
                  <option value="" disabled>Игра 1: Выберите сид</option>
                  <option value="Деревня">Деревня</option>
                  <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                  <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                  <option value="Разрушенный Портал">Разрушенный Портал</option>
                  <option value="Затонувший корабль">Затонувший корабль</option>
                </select>

                <template v-if="Number(matchForm.format) >= 3">
                  <select v-model="matchForm.seed2" class="form-input bg-white/5">
                    <option value="" disabled>Игра 2: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                  <select v-model="matchForm.seed3" class="form-input bg-white/5">
                    <option value="" disabled>Игра 3: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                </template>

                <template v-if="Number(matchForm.format) >= 5">
                  <select v-model="matchForm.seed4" class="form-input bg-white/5">
                    <option value="" disabled>Игра 4: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                  <select v-model="matchForm.seed5" class="form-input bg-white/5">
                    <option value="" disabled>Игра 5: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                </template>

                <template v-if="Number(matchForm.format) >= 7">
                  <select v-model="matchForm.seed6" class="form-input bg-white/5">
                    <option value="" disabled>Игра 6: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                  <select v-model="matchForm.seed7" class="form-input bg-white/5">
                    <option value="" disabled>Игра 7: Выберите сид</option>
                    <option value="Деревня">Деревня</option>
                    <option value="Пустынная Пирамида">Пустынная Пирамида</option>
                    <option value="Захоронённое Сокровище">Захоронённое Сокровище</option>
                    <option value="Разрушенный Портал">Разрушенный Портал</option>
                    <option value="Затонувший корабль">Затонувший корабль</option>
                  </select>
                </template>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <p class="text-[10px] font-bold text-purple-400 uppercase italic">Игрок 1</p>
                  <input
                    v-model="matchForm.player1_name"
                    placeholder="Minecraft Nickname"
                    required
                    class="form-input border-purple-500/30"
                  />
                </div>
                <div class="space-y-2">
                  <p class="text-[10px] font-bold text-blue-400 uppercase italic">Игрок 2</p>
                  <input
                    v-model="matchForm.player2_name"
                    placeholder="Minecraft Nickname"
                    required
                    class="form-input border-blue-500/30"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Дата начала</label>
                  <input
                    v-model="matchForm.match_date"
                    type="datetime-local"
                    required
                    class="form-input"
                  />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] uppercase font-bold ml-2 opacity-50">Трансляция</label>
                  <input
                    v-model="matchForm.video_url"
                    placeholder="URL (Twitch/YouTube)"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="flex gap-4 pt-2">
                <button
                  type="submit"
                  class="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black uppercase transition-all shadow-xl shadow-blue-900/20"
                >
                  {{ editingMatchId ? 'Сохранить изменения' : 'Опубликовать' }}
                </button>
                <button
                  v-if="editingMatchId"
                  type="button"
                  @click="cancelEditMatch"
                  class="py-4 px-6 bg-red-600/80 hover:bg-red-500 rounded-2xl font-black uppercase transition-all"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="mt-12 bg-[#2D1B69]/50 rounded-3xl border border-white/5 overflow-hidden">
          <div class="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 class="text-xl font-black uppercase italic text-green-400">Список турниров</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest opacity-50 bg-black/20">
                  <th class="p-4">Название</th>
                  <th class="p-4">Статус</th>
                  <th class="p-4">Призовые</th>
                  <th class="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="t in tournaments" :key="t.id" class="hover:bg-white/5 transition-colors">
                  <td class="p-4 font-bold">{{ t.title }}</td>
                  <td class="p-4">
                    <span
                      :class="{
                        'text-green-400': t.status === 'ongoing',
                        'text-blue-400': t.status === 'upcoming',
                        'text-gray-400': t.status === 'finished',
                      }"
                      class="text-xs uppercase font-black"
                    >
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="p-4 text-xs font-mono">{{ t.prize_pool }}</td>
                  <td class="p-4 text-right flex justify-end gap-2">
                    <button
                      @click="startEditTournament(t)"
                      class="text-blue-400 hover:scale-110 transition-transform"
                    >
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
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="deleteTournament(t.id)"
                      class="text-red-500 hover:scale-110 transition-transform"
                    >
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
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-12 bg-[#2D1B69]/50 rounded-3xl border border-white/5 overflow-hidden">
          <div class="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 class="text-xl font-black uppercase italic">Управление матчами</h2>
            <button
              @click="loadMatches"
              class="text-[10px] bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all font-bold uppercase tracking-widest"
            >
              Обновить список
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] uppercase tracking-widest opacity-50 bg-black/20">
                  <th class="p-4">Турнир / Этап</th>
                  <th class="p-4">Игроки / Счёт</th>
                  <th class="p-4">Дата</th>
                  <th class="p-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr
                  v-for="match in matches as any[]"
                  :key="match.id"
                  class="hover:bg-white/5 transition-colors"
                >
                  <td class="p-4">
                    <div class="text-sm font-bold text-white">{{ match.tournament_name }}</div>
                    <div class="text-[10px] text-purple-400 font-bold uppercase">
                      BO{{ match.format }} - {{ match.match_title }}
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-4">
                      <div class="flex flex-col items-center gap-1">
                        <span class="text-xs font-bold text-purple-400">{{
                          match.player1_name
                        }}</span>
                        <div class="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg">
                          <button
                            @click="updateScore(match.id, 1, match.score1 - 1)"
                            class="text-red-400 font-black px-2"
                          >
                            -
                          </button>
                          <span class="text-lg font-black w-6 text-center">{{ match.score1 }}</span>
                          <button
                            @click="updateScore(match.id, 1, match.score1 + 1)"
                            class="text-green-400 font-black px-2"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <span class="opacity-30 font-black text-xl">vs</span>

                      <div class="flex flex-col items-center gap-1">
                        <span class="text-xs font-bold text-blue-400">{{
                          match.player2_name
                        }}</span>
                        <div class="flex items-center gap-2 bg-black/30 px-2 py-1 rounded-lg">
                          <button
                            @click="updateScore(match.id, 2, match.score2 - 1)"
                            class="text-red-400 font-black px-2"
                          >
                            -
                          </button>
                          <span class="text-lg font-black w-6 text-center">{{ match.score2 }}</span>
                          <button
                            @click="updateScore(match.id, 2, match.score2 + 1)"
                            class="text-green-400 font-black px-2"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-xs">{{ new Date(match.match_date).toLocaleString() }}</td>
                  <td class="p-4 text-right flex justify-end gap-2 items-center h-full">
                    <button
                      @click="startEditMatch(match)"
                      class="text-blue-400 hover:bg-blue-500/10 p-2 rounded-xl transition-all"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="deleteMatch(match.id)"
                      class="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-input {
  display: block;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  color: white;
  outline: none;
  transition: all 0.3s;
  font-family: inherit;
  font-size: 0.875rem;
}

.form-input:focus {
  border-color: #7c3aed;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.auto-expand {
  resize: none;
  overflow: hidden;
  min-height: 80px;
}

::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

select option {
  background: #2d1b69;
  color: white;
}

button {
  cursor: pointer;
}
/* Обновление для кнопок счета */
button {
  user-select: none;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.9);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
