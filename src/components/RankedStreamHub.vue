<template>
  <div class="stream-hub">
    <aside class="leaderboard-sidebar">
      <div class="sidebar-header">
        <h2>Top 100 Ranked</h2>
        <span v-if="loading" class="loader-mini"></span>
      </div>

      <div class="player-list">
        <div
          v-for="player in players"
          :key="player.nickname"
          @click="selectPlayer(player)"
          :class="[
            'player-card',
            {
              active: selectedPlayer?.nickname === player.nickname,
              live: player.isLive,
            },
          ]"
        >
          <div class="rank-badge" :class="getRankClass(player.rank)">#{{ player.rank }}</div>
          <div class="player-info">
            <span class="name">{{ player.nickname }}</span>
            <span class="elo">{{ player.eloRate }} ELO</span>
          </div>
          <div v-if="player.isLive" class="live-indicator"><span class="dot"></span> LIVE</div>
        </div>
      </div>
    </aside>

    <main class="player-container">
      <div v-if="selectedPlayer" class="video-section">
        <div class="video-wrapper">
          <iframe
            :src="`https://player.twitch.tv/?channel=${selectedPlayer.nickname}&parent=localhost&autoplay=true&muted=false`"
            frameborder="0"
            allowfullscreen="true"
            scrolling="no"
            height="100%"
            width="100%"
          >
          </iframe>
        </div>

        <div class="stream-details">
          <div class="player-header">
            <img
              :src="`https://mineskin.eu/helm/${selectedPlayer.nickname}/64.png`"
              class="avatar"
            />
            <div>
              <h3>{{ selectedPlayer.nickname }}</h3>
              <p class="status" :class="{ online: selectedPlayer.isLive }">
                {{ selectedPlayer.isLive ? 'В эфире' : 'Офлайн' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="placeholder">
        <div class="empty-state">
          <div class="icon">📺</div>
          <p>Выберите игрока из списка, чтобы начать просмотр</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Описываем интерфейс игрока, чтобы TypeScript не выдавал ошибки
interface Player {
  nickname: string
  rank: number
  eloRate: number
  isLive: boolean
  streamData?: {
    title: string
  }
}

const players = ref<Player[]>([])
const selectedPlayer = ref<Player | null>(null)
const loading = ref(true)

const fetchData = async () => {
  loading.value = true
  try {
    // Используем твой эндпоинт
    const res = await fetch('http://localhost:3001/api/ranked/top-streams')
    const data = await res.json()
    players.value = data

    if (players.value.length > 0) {
      // Автоматически выбираем первого стримера в онлайне
      selectedPlayer.value = players.value.find((p) => p.isLive) || players.value[0]
    }
  } catch (e) {
    console.error('Ошибка загрузки стримов:', e)
  } finally {
    loading.value = false
  }
}

const selectPlayer = (player: Player) => {
  selectedPlayer.value = player
}

const getRankClass = (rank: number) => {
  if (rank === 1) return 'gold'
  if (rank === 2) return 'silver'
  if (rank === 3) return 'bronze'
  return ''
}

onMounted(fetchData)
</script>

<style scoped>
.stream-hub {
  display: flex;
  height: 100vh;
  background: #0f0720;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
}

/* Сайдбар */
.leaderboard-sidebar {
  width: 320px;
  background: rgba(26, 15, 60, 0.8);
  border-right: 1px solid #3b2b85;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #3b2b85;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h2 {
  font-size: 1.2rem;
  margin: 0;
  font-weight: 800;
  color: #a78bfa;
}

.player-list {
  overflow-y: auto;
  flex-grow: 1;
}

.player-card {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(59, 43, 133, 0.3);
}

.player-card:hover {
  background: rgba(124, 58, 237, 0.1);
}

.player-card.active {
  background: rgba(124, 58, 237, 0.2);
  border-left: 4px solid #7c3aed;
}

.rank-badge {
  width: 35px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #94a3b8;
}

.rank-badge.gold {
  color: #fbbf24;
}
.rank-badge.silver {
  color: #cbd5e1;
}
.rank-badge.bronze {
  color: #d97706;
}

.player-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 0.95rem;
}

.elo {
  font-size: 0.75rem;
  color: #7c3aed;
  font-weight: bold;
}

.live-indicator {
  font-size: 0.65rem;
  font-weight: 900;
  background: #ef4444;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

/* Контент */
.player-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: #090416;
}

.video-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-wrapper {
  flex-grow: 1;
  background: #000;
}

.stream-details {
  padding: 20px;
  background: #1a0f3c;
  border-top: 1px solid #3b2b85;
}

.player-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 2px solid #7c3aed;
}

.player-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.status {
  font-size: 0.85rem;
  color: #64748b;
}

.status.online {
  color: #10b981;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-state {
  text-align: center;
  color: #4b5563;
}

.empty-state .icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

/* Скроллбар */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0f0720;
}
::-webkit-scrollbar-thumb {
  background: #3b2b85;
  border-radius: 10px;
}
</style>
