<template>
  <div class="min-h-screen bg-primary-bg">
    <Header />

    <main class="container mx-auto px-4 py-8">
      <!-- Заголовок -->
      <section class="mb-8">
        <h1 class="text-4xl font-bold text-text-primary mb-4">🏆 Мировые рекорды</h1>
        <p class="text-text-secondary text-lg">
          Актуальные мировые рекорды из speedrun.com для Minecraft: Java Edition
        </p>
      </section>

      <!-- Фильтры -->
      <section class="mb-8">
        <div class="bg-primary-card rounded-lg p-6 border border-primary-hover">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Фильтр по категориям -->
            <div>
              <label class="block text-text-primary font-semibold mb-2">Категория</label>
              <select
                v-model="selectedCategory"
                class="w-full bg-primary-hover border border-primary-hover rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-blue"
              >
                <option value="all">Все категории</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Фильтр по версиям -->
            <div>
              <label class="block text-text-primary font-semibold mb-2">Версия игры</label>
              <select
                v-model="selectedVersion"
                class="w-full bg-primary-hover border border-primary-hover rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-accent-blue"
              >
                <option value="all">Все версии</option>
                <option
                  v-for="version in versions"
                  :key="version"
                  :value="version"
                >
                  {{ version }}
                </option>
              </select>
            </div>

            <!-- Кнопка обновления -->
            <div class="flex items-end">
              <button
                @click="fetchWorldRecords"
                :disabled="loading"
                class="w-full bg-accent-blue hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span v-if="loading" class="animate-spin">⟳</span>
                <span>{{ loading ? 'Загрузка...' : 'Обновить' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Список рекордов -->
      <section>
        <div class="grid grid-cols-1 gap-6">
          <!-- Загрузка -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
            <p class="text-text-secondary mt-4 text-lg">Загрузка мировых рекордов с speedrun.com...</p>
          </div>

          <!-- Ошибка -->
          <div v-else-if="error" class="text-center py-8 bg-primary-card rounded-lg p-6">
            <p class="text-accent-red text-lg mb-4">{{ error }}</p>
            <button
              @click="fetchWorldRecords"
              class="bg-accent-blue hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </div>

          <!-- Рекорды -->
          <div v-else class="space-y-4">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              class="bg-primary-card rounded-lg p-6 border border-primary-hover hover:border-accent-blue transition-colors"
            >
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-4 mb-3">
                    <span class="text-accent-gold font-bold text-2xl">#{{ record.place }}</span>
                    <div>
                      <h3 class="text-text-primary font-semibold text-xl">{{ record.runner }}</h3>
                      <p class="text-text-secondary">{{ record.category }} • {{ record.version }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-text-muted">Время:</span>
                      <p class="text-text-primary font-semibold text-lg">{{ record.time }}</p>
                    </div>
                    <div>
                      <span class="text-text-muted">Дата:</span>
                      <p class="text-text-primary">{{ formatDate(record.date) }}</p>
                    </div>
                    <div>
                      <span class="text-text-muted">Платформа:</span>
                      <p class="text-text-primary">{{ record.platform }}</p>
                    </div>
                    <div>
                      <span class="text-text-muted">Статус:</span>
                      <p
                        class="font-semibold"
                        :class="record.verified ? 'text-accent-green' : 'text-accent-gold'"
                      >
                        {{ record.verified ? 'Подтвержден' : 'На проверке' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex space-x-3 flex-shrink-0">
                  <a
                    v-if="record.videoUrl"
                    :href="record.videoUrl"
                    target="_blank"
                    class="bg-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>📺 Смотреть</span>
                  </a>
                  <a
                    :href="record.speedrunUrl"
                    target="_blank"
                    class="bg-primary-hover hover:bg-accent-blue text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>🔗 Speedrun.com</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Пустой список -->
            <div v-if="filteredRecords.length === 0 && !loading" class="text-center py-12">
              <p class="text-text-secondary text-lg">Рекорды не найдены. Попробуйте изменить фильтры.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/layout/Header.vue'

interface WorldRecord {
  id: string
  place: number
  runner: string
  category: string
  version: string
  time: string
  date: string
  platform: string
  verified: boolean
  videoUrl?: string
  speedrunUrl: string
}

// Состояния
const loading = ref(true)
const error = ref<string | null>(null)
const worldRecords = ref<WorldRecord[]>([])
const selectedCategory = ref('all')
const selectedVersion = ref('all')

// Категории и версии для фильтров
const categories = ref([
  { id: 'any_rsg', name: 'Any% Random Seed Glitchless' },
  { id: 'any_rsg_glitched', name: 'Any% Random Seed Glitched' },
  { id: 'set_seed', name: 'Set Seed' },
  { id: 'all_advancements', name: 'All Advancements' },
  { id: 'all_achievements', name: 'All Achievements' },
  { id: '100', name: '100%' }
])

const versions = ref([
  '1.16.1',
  '1.17.1',
  '1.18.2',
  '1.19.2',
  '1.20.1',
  'Latest'
])

// Фильтрация рекордов
const filteredRecords = computed(() => {
  let filtered = worldRecords.value

  if (selectedCategory.value !== 'all') {
    const category = categories.value.find(c => c.id === selectedCategory.value)
    if (category) {
      filtered = filtered.filter(record => record.category === category.name)
    }
  }

  if (selectedVersion.value !== 'all') {
    filtered = filtered.filter(record => record.version === selectedVersion.value)
  }

  return filtered
})

// Форматирование даты
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}

// Загрузка мировых рекордов с speedrun.com
const fetchWorldRecords = async () => {
  loading.value = true
  error.value = null

  try {
    // Получаем данные из speedrun.com API
    const response = await fetch('https://www.speedrun.com/api/v1/games/mc/records')

    if (!response.ok) {
      throw new Error('Не удалось загрузить данные с speedrun.com')
    }

    const data = await response.json()

    // Трансформируем данные из API в нашу структуру
    worldRecords.value = transformSpeedrunData(data)

  } catch (err) {
    error.value = 'Не удалось загрузить мировые рекорды. Проверьте подключение к интернету.'
    console.error('Error fetching world records:', err)

    // Fallback данные если API недоступно
    worldRecords.value = getFallbackData()
  } finally {
    loading.value = false
  }
}

// Трансформация данных из speedrun.com API
const transformSpeedrunData = (data: any): WorldRecord[] => {
  const records: WorldRecord[] = []

  // Обрабатываем каждую категорию
  data.data.forEach((categoryData: any, index: number) => {
    const category = categoryData.category?.data?.name || 'Unknown Category'
    const runs = categoryData.runs || []

    // Берем только первый результат (мировой рекорд)
    if (runs.length > 0) {
      const run = runs[0].run
      const players = run.players || []
      const player = players[0] || {}

      records.push({
        id: run.id || `fallback-${index}`,
        place: index + 1,
        runner: player.name || 'Unknown Runner',
        category: category,
        version: run.values?.lqxj2268 || 'Unknown Version', // Версия игры
        time: formatTime(run.times?.realtime_t || 0),
        date: run.date || '2024-01-01',
        platform: run.system?.data?.name || 'Java Edition',
        verified: run.status?.status === 'verified',
        videoUrl: run.videos?.links?.[0]?.uri,
        speedrunUrl: run.weblink || 'https://speedrun.com/mc'
      })
    }
  })

  return records
}

// Форматирование времени из секунд
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// Fallback данные если API недоступно
const getFallbackData = (): WorldRecord[] => {
  return [
    {
      id: '1',
      place: 1,
      runner: 'Feinberg',
      category: 'Any% Random Seed Glitchless',
      version: '1.16.1',
      time: '14:32',
      date: '2024-01-15',
      platform: 'Java Edition',
      verified: true,
      videoUrl: 'https://youtube.com/watch?v=example1',
      speedrunUrl: 'https://speedrun.com/mc'
    },
    {
      id: '2',
      place: 2,
      runner: 'Taptap_',
      category: 'Set Seed',
      version: '1.20.1',
      time: '08:45',
      date: '2024-01-14',
      platform: 'Java Edition',
      verified: true,
      videoUrl: 'https://youtube.com/watch?v=example2',
      speedrunUrl: 'https://speedrun.com/mc'
    },
    {
      id: '3',
      place: 3,
      runner: 'Couriway',
      category: 'Any% Random Seed Glitchless',
      version: '1.16.1',
      time: '15:18',
      date: '2024-01-13',
      platform: 'Java Edition',
      verified: false,
      speedrunUrl: 'https://speedrun.com/mc'
    }
  ]
}

// Загрузка при монтировании
onMounted(() => {
  fetchWorldRecords()
})
</script>
