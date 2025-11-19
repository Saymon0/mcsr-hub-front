<template>
  <header class="bg-black border-b border-gray-800 sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Логотип и название -->
        <RouterLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <!-- Ваш SVG логотип -->
          <div class="w-10 rounded overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 21.6667 21.6667"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="21.666687"
              height="21.666666"
              fill="none"
              customFrame="#000000"
            >
              <rect
                id="2395"
                width="10.000000"
                height="10.000000"
                x="0.000000"
                y="0.000000"
                fill="rgb(119,187,85)"
              />
              <rect
                id="2396"
                width="10.000000"
                height="10.000000"
                x="11.666687"
                y="0.000000"
                fill="rgb(119,187,85)"
              />
              <rect
                id="2398"
                width="10.000000"
                height="10.000000"
                x="11.666687"
                y="11.666666"
                fill="rgb(119,187,85)"
              />
              <rect
                id="2397"
                width="10.000000"
                height="10.000000"
                x="0.000000"
                y="11.666666"
                fill="rgb(119,187,85)"
              />
              <rect
                id="2399"
                width="5.000000"
                height="4.999999"
                x="16.666687"
                y="6.666666"
                fill="rgb(224,90,45)"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-[#77bb55]">MCSR Hub</h1>
        </RouterLink>

        <!-- Навигационная панель -->
        <nav class="flex items-center space-x-8">
          <!-- Рейтинги -->
          <RouterLink
            to="/leaderboard"
            class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            :class="{ 'text-white': $route.path === '/leaderboard' }"
          >
            <span class="text-lg">🏆</span>
            <span class="font-medium">Рейтинг</span>
          </RouterLink>

          <!-- Гайды -->
          <RouterLink
            to="/guides"
            class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            :class="{ 'text-white': $route.path === '/guides' }"
          >
            <span class="text-lg">📚</span>
            <span class="font-medium">Гайды</span>
          </RouterLink>

          <!-- Турниры -->
          <RouterLink
            to="/tournaments"
            class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            :class="{ 'text-white': $route.path === '/tournaments' }"
          >
            <span class="text-lg">🏅</span>
            <span class="font-medium">Турниры</span>
          </RouterLink>

          <!-- Новости -->
          <RouterLink
            to="/news"
            class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            :class="{ 'text-white': $route.path === '/news' }"
          >
            <span class="text-lg">📰</span>
            <span class="font-medium">Новости</span>
          </RouterLink>
        </nav>

        <!-- Поиск и Вход -->
        <div class="flex items-center space-x-4">
          <!-- Поисковая строка -->
          <div class="relative">
            <input
              type="text"
              placeholder="Поиск гайдов, игроков..."
              class="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#77bb55] transition-colors w-64"
            />
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
              <span class="text-gray-400">🔍</span>
            </div>
          </div>

          <!-- Кнопка Вход -->
          <button class="bg-[#77bb55] hover:bg-[#68a34a] text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Вход
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
