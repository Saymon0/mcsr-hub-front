export interface MatchPlayer {
  id: number
  name: string
  avatar?: string
  rank?: number
  isLive?: boolean
  score: number
  twitch?: string
  bestTime?: string
  totalRuns?: number
  winRate?: number
  country?: string
}

export interface Match {
  id: number
  tournament: string
  players: MatchPlayer[]
  category: string
  version: string
  seedType: string
  format: string
  status: 'upcoming' | 'live' | 'completed'
  time: string
  date: string
  viewers?: number
  description?: string
  prizePool?: number
  rules?: string[]
}

// Генерация Minecraft аватара с помощью MineSkin API
const generateMinecraftAvatar = (username: string) => {
  return `https://mineskin.eu/helm/${encodeURIComponent(username)}/64.png`
}

// Кэш для данных из API
let rankCache: Map<string, { rank: number; country: string }> | null = null
let bestTimesCache: Map<string, string> | null = null
let lastFetchTime: number = 0
let lastBestTimesFetchTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

// Функция для получения топ-50 игроков из API
const fetchTop50PlayersFromAPI = async (): Promise<
  Map<string, { rank: number; country: string }>
> => {
  try {
    const response = await fetch('https://mcsrranked.com/api/leaderboard')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const playerMap = new Map<string, { rank: number; country: string }>()

    if (data.status === 'success' && data.data?.users) {
      // Берем только топ-50 игроков
      const top50Players = data.data.users.slice(0, 50)

      top50Players.forEach((user: any) => {
        if (user.nickname && user.eloRank) {
          playerMap.set(user.nickname.toLowerCase(), {
            rank: user.eloRank,
            country: user.country || '',
          })
        }
      })
    }

    console.log(`✅ Загружено ${playerMap.size} игроков из топ-50`)
    return playerMap
  } catch (error) {
    console.error('Не удалось загрузить данные игроков из API:', error)
    return new Map()
  }
}

// Функция для получения лучших времен из API
const fetchBestTimesFromAPI = async (): Promise<Map<string, string>> => {
  try {
    console.log('🔄 Загрузка лучших времен из API...')

    const response = await fetch('https://mcsrranked.com/api/record-leaderboard?distinct=true')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const timesMap = new Map<string, string>()

    if (data.status === 'success' && Array.isArray(data.data)) {
      data.data.forEach((record: any) => {
        if (record.user?.nickname && record.time) {
          const formattedTime = formatTimeFromAPI(record.time)
          timesMap.set(record.user.nickname.toLowerCase(), formattedTime)
        }
      })
    }

    console.log(`✅ Загружено ${timesMap.size} лучших времен из API`)
    return timesMap
  } catch (error) {
    console.error('❌ Ошибка загрузки лучших времен:', error)
    return new Map()
  }
}

// Функция для форматирования времени из API
const formatTimeFromAPI = (timeInMs: number): string => {
  try {
    const totalSeconds = Math.floor(timeInMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  } catch (error) {
    console.warn('Ошибка форматирования времени:', error)
    return '-'
  }
}

// Функция для получения данных игрока (с кэшированием)
const getPlayerData = async (
  playerName: string,
): Promise<{ rank: number; country: string } | undefined> => {
  const now = Date.now()

  if (!rankCache || now - lastFetchTime > CACHE_DURATION) {
    rankCache = await fetchTop50PlayersFromAPI()
    lastFetchTime = now
  }

  return rankCache.get(playerName.toLowerCase())
}

// Функция для получения лучшего времени игрока (с кэшированием)
const getPlayerBestTime = async (playerName: string): Promise<string | undefined> => {
  const now = Date.now()

  if (!bestTimesCache || now - lastBestTimesFetchTime > CACHE_DURATION) {
    bestTimesCache = await fetchBestTimesFromAPI()
    lastBestTimesFetchTime = now
  }

  return bestTimesCache.get(playerName.toLowerCase())
}

// Функция для обновления данных игроков (включая тех, кто не в топ-50)
const updatePlayersData = async (players: MatchPlayer[]): Promise<MatchPlayer[]> => {
  const updatedPlayers: MatchPlayer[] = []

  for (const player of players) {
    const playerData = await getPlayerData(player.name)
    const bestTime = await getPlayerBestTime(player.name)

    const updatedPlayer = {
      ...player,
      rank: playerData?.rank || 999, // Если игрок не в топ-50, ставим низкий ранг
      country: playerData?.country || player.country,
      bestTime: bestTime || '-',
    }
    updatedPlayers.push(updatedPlayer)
  }

  return updatedPlayers
}

// Функция для обновления матчей с данными из API
export const updateMatchesWithAPIData = async (matches: Match[]): Promise<Match[]> => {
  try {
    const updatedMatches: Match[] = []

    for (const match of matches) {
      // Обновляем данные всех игроков
      const updatedPlayers = await updatePlayersData(match.players)

      updatedMatches.push({
        ...match,
        players: updatedPlayers,
      })
    }

    console.log(`✅ Обновлено ${updatedMatches.length} матчей с данными из API`)
    return updatedMatches
  } catch (error) {
    console.error('Ошибка при обновлении данных матчей:', error)
    return matches
  }
}

// База данных всех матчей (статическая) с датами 2025 года и разницей в 1.5 часа
const staticMatches: Match[] = [
  {
    id: 1,
    tournament: 'Ranked Playoffs',
    players: [
      {
        id: 1,
        name: 'Feinberg',
        score: 0,
        avatar: generateMinecraftAvatar('Feinberg'),
        isLive: false,
        twitch: 'https://www.twitch.tv/feinberg',
        totalRuns: 287,
        winRate: 68,
      },
      {
        id: 2,
        name: 'doogile',
        score: 0,
        avatar: generateMinecraftAvatar('doogile'),
        twitch: 'https://www.twitch.tv/doogile',
        totalRuns: 156,
        winRate: 59,
      },
    ],
    category: 'Any% RSG',
    version: '1.16.1',
    seedType: 'Захороненное сокровище',
    format: 'Best of 3',
    status: 'upcoming',
    time: '19:00',
    date: '2025-01-20T19:00:00',
    description: 'Четвертьфинал турнира Ranked Playoffs',
    prizePool: 5000,
  },
  {
    id: 2,
    tournament: 'Ranked Playoffs',
    players: [
      {
        id: 3,
        name: 'Infume',
        score: 0,
        avatar: generateMinecraftAvatar('Infume'),
        isLive: false,
        twitch: 'https://www.twitch.tv/infume',
        totalRuns: 234,
        winRate: 65,
      },
      {
        id: 4,
        name: 'hackingnoises',
        score: 0,
        avatar: generateMinecraftAvatar('hackingnoises'),
        twitch: 'https://www.twitch.tv/hackingnoisess',
        totalRuns: 178,
        winRate: 57,
      },
    ],
    category: 'All Advancements RSG',
    version: '1.16.1',
    seedType: 'Деревня',
    format: 'Best of 3',
    status: 'upcoming',
    time: '20:30',
    date: '2025-01-20T20:30:00',
    description: 'Четвертьфинал турнира Ranked Playoffs',
    prizePool: 3000,
  },
  {
    id: 3,
    tournament: 'Ranked Playoffs',
    players: [
      {
        id: 5,
        name: 'lowk3y_',
        score: 0,
        avatar: generateMinecraftAvatar('lowk3y_'),
        twitch: 'https://www.twitch.tv/lowkey',
        totalRuns: 89,
        winRate: 52,
      },
      {
        id: 6,
        name: 'edcr',
        score: 0,
        avatar: generateMinecraftAvatar('edcr'),
        twitch: 'https://www.twitch.tv/edcrspeedruns',
        totalRuns: 134,
        winRate: 48,
      },
    ],
    category: 'Any% RSG',
    version: '1.21',
    seedType: 'Разрушенный портал',
    format: 'Best of 3',
    status: 'upcoming',
    time: '22:00',
    date: '2025-01-20T22:00:00',
    description: 'Четвертьфинал турнира Ranked Playoffs',
    prizePool: 2000,
  },
  {
    id: 4,
    tournament: 'Ranked Playoffs',
    players: [
      {
        id: 7,
        name: 'silverrruns',
        score: 0,
        avatar: generateMinecraftAvatar('silverrruns'),
        twitch: 'https://www.twitch.tv/silverrruns',
        totalRuns: 67,
        winRate: 41,
      },
      {
        id: 8,
        name: 'BeefSalad',
        score: 0,
        avatar: generateMinecraftAvatar('BeefSalad'),
        twitch: 'https://www.twitch.tv/beefsalad',
        totalRuns: 92,
        winRate: 45,
      },
    ],
    category: 'Any% RSG',
    version: '1.16.1',
    seedType: 'Пустынный храм',
    format: 'Best of 3',
    status: 'upcoming',
    time: '23:30',
    date: '2025-01-20T23:30:00',
    description: 'Четвертьфинал турнира Ranked Playoffs',
    prizePool: 1500,
  },
  // Добавим несколько live и completed матчей для демонстрации
  {
    id: 5,
    tournament: 'Most% Championship',
    players: [
      {
        id: 9,
        name: 'k4yfour',
        score: 1,
        avatar: generateMinecraftAvatar('k4yfour'),
        isLive: true,
        twitch: 'https://www.twitch.tv/k4yfour',
        totalRuns: 198,
        winRate: 62,
      },
      {
        id: 10,
        name: 'fabulous',
        score: 0,
        avatar: generateMinecraftAvatar('fabulous'),
        twitch: 'https://www.twitch.tv/fabulous',
        totalRuns: 167,
        winRate: 58,
      },
    ],
    category: 'All Advancements RSG',
    version: '1.16.1',
    seedType: 'Деревня',
    format: 'Best of 3',
    status: 'live',
    time: '18:00',
    date: '2025-01-20T18:00:00',
    viewers: 3200,
    description: 'Финал чемпионата Most%',
    prizePool: 8000,
  },
  {
    id: 6,
    tournament: 'Speedrun Masters',
    players: [
      {
        id: 11,
        name: 'couriway',
        score: 2,
        avatar: generateMinecraftAvatar('couriway'),
        isLive: false,
        twitch: 'https://www.twitch.tv/couriway',
        totalRuns: 245,
        winRate: 71,
      },
      {
        id: 12,
        name: 'ollieowned',
        score: 1,
        avatar: generateMinecraftAvatar('ollieowned'),
        twitch: 'https://www.twitch.tv/ollieowned',
        totalRuns: 189,
        winRate: 63,
      },
    ],
    category: 'Any% RSG',
    version: '1.21',
    seedType: 'Разрушенный портал',
    format: 'Best of 3',
    status: 'completed',
    time: '16:00',
    date: '2025-01-20T16:00:00',
    viewers: 4100,
    description: 'Полуфинал Speedrun Masters',
    prizePool: 6000,
  },
]

// Экспортируемая функция для получения матчей с актуальными данными из API
export const getMatchesWithAPIData = async (): Promise<Match[]> => {
  return await updateMatchesWithAPIData(staticMatches)
}

// Экспорт статических матчей для обратной совместимости
export const allMatches: Match[] = staticMatches

// Функции для совместимости с компонентами
export const getMatchesWithAllData = async (): Promise<Match[]> => {
  return await getMatchesWithAPIData()
}

export const getMatchesWithCurrentRanks = async (): Promise<Match[]> => {
  return await getMatchesWithAPIData()
}

// Функция для получения матчей по статусу (для фильтрации)
export const getMatchesByStatus = (matches: Match[], status: string): Match[] => {
  if (status === 'all') {
    return matches
  }
  return matches.filter((match) => match.status === status)
}

// Функция для получения матчей по турниру
export const getMatchesByTournament = (matches: Match[], tournament: string): Match[] => {
  return matches.filter((match) => match.tournament === tournament)
}

// Функция для поиска матча по ID
export const getMatchById = (matches: Match[], id: number): Match | undefined => {
  return matches.find((match) => match.id === id)
}
