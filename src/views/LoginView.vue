<template>
  <div class="min-h-screen bg-void-purple relative flex items-center justify-center">
    <!-- Фоновое изображение -->
    <div class="fixed inset-0 -z-10">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-b from-purple-900/40 to-violet-950/60"></div>
    </div>

    <div
      class="w-full max-w-md p-8 bg-[#2d1b69]/90 rounded-xl border border-[#8b5cf6] backdrop-blur-xl shadow-2xl relative z-10 mx-4"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white">Вход</h1>
        <p class="text-gray-300 mt-2">С возвращением в MCSR Hub</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Поле Username -->
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

        <!-- Поле Пароль -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Пароль</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-4 py-2 bg-[#3c2a7a]/50 border border-[#8b5cf6]/50 rounded-lg text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
          />
        </div>

        <!-- Сообщения об ошибках или успехе -->
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
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-gray-300">Нет аккаунта? </span>
        <router-link
          to="/register"
          class="text-white hover:text-[#8b5cf6] font-bold decoration-[#8b5cf6] transition-colors"
          >Зарегистрироваться</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const status = ref('')

const form = ref({
  username: '',
  password: '',
})

const messageClass = computed(() => {
  return status.value === 'success'
    ? 'bg-green-500/20 text-green-400'
    : 'bg-red-500/20 text-red-400'
})

const handleLogin = async () => {
  try {
    loading.value = true
    message.value = ''

    // 1. Меняем URL на правильный роут Node.js сервера
    const res = await axios.post('http://localhost:3001/api/auth/login', form.value)

    // 2. Успешный вход (если сервер вернул 200 OK, значит res.data содержит токен)
    if (res.data.token) {
      status.value = 'success'
      message.value = 'Вход выполнен! Перенаправление...'

      // Сохраняем ТОКЕН
      localStorage.setItem('token', res.data.token)

      // Сохраняем данные пользователя
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...res.data.user,
          isLoggedIn: true,
        }),
      )

      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  } catch (err) {
    status.value = 'error'

    // Проверяем, является ли ошибка ошибкой Axios
    if (axios.isAxiosError(err)) {
      message.value = err.response?.data?.error || 'Неверный логин или пароль'
    } else {
      message.value = 'Произошла непредвиденная ошибка'
    }

    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
