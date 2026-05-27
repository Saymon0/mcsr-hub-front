<template>
  <header class="bg-black border-b border-[#3c2a7a]/80 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Логотип -->
        <RouterLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div class="w-8 flex items-center justify-center">
            <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="10" height="10" x="0" y="0" fill="#7b1fa2" />
              <rect width="10" height="10" x="11.66" y="0" fill="#7b1fa2" />
              <rect width="10" height="10" x="11.66" y="11.66" fill="#7b1fa2" />
              <rect width="10" height="10" x="0" y="11.66" fill="#7b1fa2" />
              <rect width="5" height="5" x="16.66" y="6.66" fill="#e05a2d" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-[#7c3aed] tracking-tight">MCSR Hub</h1>
        </RouterLink>

        <!-- Навигация -->
        <nav class="hidden md:flex items-center gap-7">
          <!-- Турниры -->
          <RouterLink
            to="/tournaments"
            class="flex items-center gap-2 transition-all duration-200 text-sm font-semibold group"
            :class="[
              $route.path === '/tournaments' ? 'text-white' : 'text-gray-400 hover:text-white',
            ]"
          >
            <img
              src="@/assets/trophy.png"
              alt="Tournaments"
              class="w-5 h-5 object-contain transition-transform group-hover:scale-110"
            />
            <span>Турниры</span>
          </RouterLink>

          <!-- Рейтинг -->
          <RouterLink
            to="/leaderboard"
            class="flex items-center gap-2 transition-all duration-200 text-sm font-semibold group"
            :class="[
              $route.path === '/leaderboard' ? 'text-white' : 'text-gray-400 hover:text-white',
            ]"
          >
            <svg
              class="w-5 h-5 transition-transform group-hover:scale-110"
              viewBox="-0.5 -0.5 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke="#CD7F32"
                stroke-miterlimit="10"
                d="M4.999 11.874H0.625V14.375h4.374v-2.501Z"
                stroke-width="1"
                fill="black"
              ></path>
              <path
                stroke="#C0C0C0"
                stroke-miterlimit="10"
                d="M14.375 10.623h-4.374v3.752H14.375v-3.752Z"
                stroke-width="1"
                fill="black"
              ></path>
              <path
                stroke="#FFD700"
                stroke-miterlimit="10"
                d="M10.001 8.122H4.999v6.253h5.002V8.122Z"
                stroke-width="1"
                fill="black"
              ></path>
              <g stroke="#FFD700" stroke-width="1" fill="none" stroke-miterlimit="10">
                <path
                  d="M5.627 0.625h3.752v1.873c.001.247-.047.492-.141.72-.094.228-.232.436-.407.611-.175.175-.382.313-.611.407-.228.094-.473.142-.72.141-.246 0-.49-.049-.718-.143a1.73 1.73 0 0 1-.608-.408 1.74 1.74 0 0 1-.406-.61 1.743 1.743 0 0 1-.141-.719V0.625Z"
                ></path>
                <path
                  d="M5.627 6.249h3.745M7.5 4.377v1.873M11.252 1.876H9.373M5.627 1.876H3.748"
                ></path>
              </g>
            </svg>
            <span>Рейтинг</span>
          </RouterLink>

          <!-- Матчи -->
          <RouterLink
            to="/matches"
            class="flex items-center gap-2 transition-all duration-200 text-sm font-semibold group"
            :class="[$route.path === '/matches' ? 'text-white' : 'text-gray-400 hover:text-white']"
          >
            <img
              src="@/assets/matches.webp"
              alt="Matches"
              class="w-5 h-5 object-contain transition-transform group-hover:scale-110"
            />
            <span>Матчи</span>
          </RouterLink>

          <!-- Pick'Em -->
          <RouterLink
            to="/pickem"
            class="flex items-center gap-2 transition-all duration-200 text-sm font-semibold group"
            :class="[
              $route.path === '/pickem' ? 'text-white font-bold' : 'text-gray-400 hover:text-white',
            ]"
          >
            <!-- Обновленная иконка сетки -->
            <svg
              class="w-5 h-5 transition-transform group-hover:scale-110 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5H7V9H3V5Z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 15H7V19H3V15Z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M17 10H21V14H17V10Z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 7H10V17H7"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M10 12H17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Pick'Em</span>
          </RouterLink>
        </nav>

        <!-- Блок пользователя -->
        <div class="flex items-center gap-3">
          <template v-if="user && user.username">
            <div
              class="flex items-center gap-4 bg-[#1e1b2e] border border-[#3c2a7a] rounded-xl px-4 py-2"
            >
              <span class="text-white font-bold text-sm tracking-wide">{{ user.username }}</span>
              <div class="h-6 w-[1px] bg-[#3c2a7a]"></div>
              <button
                @click="handleLogout"
                class="text-gray-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                ВЫХОД
              </button>
            </div>
          </template>

          <template v-else>
            <RouterLink
              to="/login"
              class="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Войти
            </RouterLink>
            <RouterLink
              to="/register"
              class="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-500/20"
            >
              Регистрация
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const $route = useRoute()
const router = useRouter()
const user = ref<any>(null)

const checkAuth = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      user.value = null
    }
  } else {
    user.value = null
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  router.push('/login')
}

watch(
  () => $route.path,
  () => checkAuth(),
)

onMounted(() => checkAuth())
</script>
