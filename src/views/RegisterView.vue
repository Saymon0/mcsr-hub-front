<template>
  <div class="min-h-screen bg-void-purple relative flex items-center justify-center">
    <div class="fixed inset-0 -z-10">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-violet-950/60"></div>
    </div>

    <div
      class="w-full max-w-md p-8 bg-[#2d1b69]/90 rounded-xl border border-[#8b5cf6] backdrop-blur-xl shadow-2xl relative z-10 mx-4"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white">Регистрация</h1>
        <p class="text-gray-300 mt-2">Присоединяйтесь к MCSR Hub</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Никнейм</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
            placeholder="Ваш ник"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
            placeholder="example@mail.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Повтор пароля</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
        </div>

        <div class="relative" ref="dropdownRef">
          <label class="block text-sm font-medium text-gray-300 mb-1">Страна</label>
          <div
            @click="dropdownOpen = !dropdownOpen"
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white cursor-pointer flex items-center justify-between focus:outline-none transition-colors hover:border-[#8b5cf6]"
            :class="{ 'border-[#8b5cf6]': dropdownOpen }"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="form.flag"
                :src="`https://flagcdn.com/w20/${form.flag}.png`"
                class="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                alt="flag"
              />
              <span :class="{ 'text-gray-400': !form.flag }">
                {{ selectedCountryName || 'Выберите страну' }}
              </span>
            </div>
            <span
              class="text-xs text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': dropdownOpen }"
              >▼</span
            >
          </div>

          <div
            v-show="dropdownOpen"
            class="absolute z-50 w-full mt-2 bg-[#2d1b69] border border-[#8b5cf6]/50 rounded-lg shadow-xl overflow-hidden"
          >
            <div class="p-2 border-b border-[#8b5cf6]/30 bg-[#2d1b69]">
              <input
                v-model="countrySearch"
                type="text"
                placeholder="Поиск страны..."
                class="w-full px-3 py-1.5 bg-[#3c2a7a]/50 border border-[#8b5cf6]/30 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#8b5cf6]"
                @click.stop
              />
            </div>

            <div class="max-h-52 overflow-y-auto custom-scrollbar">
              <div
                v-if="filteredCountries.length === 0"
                class="px-4 py-3 text-sm text-gray-400 text-center"
              >
                Ничего не найдено
              </div>
              <div
                v-for="country in filteredCountries"
                :key="country.code"
                @click="selectCountry(country)"
                class="px-4 py-2.5 hover:bg-[#8b5cf6]/20 cursor-pointer flex items-center gap-3 transition-colors"
                :class="{ 'bg-[#8b5cf6]/30': form.flag === country.code }"
              >
                <img
                  :src="`https://flagcdn.com/w20/${country.code}.png`"
                  class="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                  alt="flag"
                />
                <span class="text-sm text-white">{{ country.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="message"
          :class="messageClass"
          class="text-sm text-center py-2 rounded-lg font-medium"
        >
          {{ message }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#7c3aed] hover:bg-[#8b5cf6] text-white font-bold py-3 mt-2 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-gray-300">Уже есть аккаунт? </span>
        <router-link
          to="/login"
          class="text-white hover:text-[#8b5cf6] font-bold decoration-[#8b5cf6] transition-colors"
          >Войти</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import API_URL from '@/api'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import staticCountries from '@/assets/countries.json'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const status = ref('')

// Данные формы
const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  flag: '',
})

// Логика кастомного селекта стран
const countries = ref<Array<{ code: string; name: string }>>([])
const dropdownOpen = ref(false)
const countrySearch = ref('')
const dropdownRef = ref<HTMLElement | null>(null)

// Инициализация списка стран из статических данных
const fetchCountries = () => {
  countries.value = [...staticCountries].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

// Поиск по странам
const filteredCountries = computed(() => {
  if (!countrySearch.value) return countries.value
  const query = countrySearch.value.toLowerCase()
  return countries.value.filter((c) => c.name.toLowerCase().includes(query))
})

// Получить имя выбранной страны
const selectedCountryName = computed(() => {
  const selected = countries.value.find((c) => c.code === form.value.flag)
  return selected ? selected.name : ''
})

// Выбор страны
const selectCountry = (country: { code: string }) => {
  form.value.flag = country.code
  dropdownOpen.value = false
  countrySearch.value = '' // Очищаем поиск после выбора
}

// Закрытие списка при клике в другое место
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  fetchCountries()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Классы для уведомлений
const messageClass = computed(() => {
  return status.value === 'success'
    ? 'bg-green-500/20 text-green-400'
    : 'bg-red-500/20 text-red-400'
})

// Отправка формы
const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    status.value = 'error'
    message.value = 'Пароли не совпадают!'
    return
  }

  if (!form.value.flag) {
    status.value = 'error'
    message.value = 'Пожалуйста, выберите страну!'
    return
  }

  try {
    loading.value = true
    message.value = ''

    const res = await axios.post(`${API_URL}/api/auth/register`, {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      flag: form.value.flag,
    })

    status.value = 'success'
    message.value = 'Регистрация успешна! Перенаправляем...'

    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...res.data.user,
          isLoggedIn: true,
        }),
      )
    } else {
      localStorage.setItem(
        'user',
        JSON.stringify({
          username: form.value.username,
          flag: form.value.flag,
          isLoggedIn: true,
        }),
      )
    }

    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch (err) {
    status.value = 'error'
    if (axios.isAxiosError(err)) {
      message.value = err.response?.data?.error || 'Ошибка при регистрации'
    } else {
      message.value = 'Ошибка при подключении к серверу'
    }
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Стилизация скроллбара для выпадающего списка */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(45, 27, 105, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.8);
}
</style>
