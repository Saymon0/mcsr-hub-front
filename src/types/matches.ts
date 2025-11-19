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

// База данных всех матчей
export const allMatches: Match[] = [
  {
    id: 1,
    tournament: 'Ranked Playoffs',
    players: [
      {
        id: 1,
        name: 'Feinberg',
        rank: 1,
        score: 2,
        avatar: '/avatars/feinberg.png',
        isLive: true,
        twitch: 'https://www.twitch.tv/feinberg',
        bestTime: '14:32',
        totalRuns: 287,
        winRate: 68,
      },
      {
        id: 2,
        name: 'doogile',
        rank: 3,
        score: 1,
        avatar: '/avatars/doogile.png',
        twitch: 'https://www.twitch.tv/olivermcsr',
        bestTime: '15:18',
        totalRuns: 156,
        winRate: 59,
      },
    ],
    category: 'Any% RSG',
    version: '1.16.1',
    seedType: 'Захороненное сокровище',
    format: 'Best of 3',
    status: 'completed',
    time: '19:00',
    date: '2024-01-20T19:00:00',
    viewers: 2840,
    description: 'Четвертьфинал турнира Ranked Playoffs',
    prizePool: 5000,
    rules: ['Сброс запрещен', 'Таймер начинается с создания мира', 'Все глитчи разрешены'],
  },
  {
    id: 2,
    tournament: 'Most%',
    players: [
      {
        id: 5,
        name: 'lowk3y_',
        rank: 5,
        score: 1,
        avatar: '/avatars/lowk3y_.png',
        isLive: true,
        twitch: 'https://www.twitch.tv/nerdi',
        bestTime: '16:45',
        totalRuns: 89,
        winRate: 52,
      },
      {
        id: 6,
        name: 'edcr',
        rank: 6,
        score: 1,
        avatar: '/avatars/edcr.png',
        twitch: 'https://www.twitch.tv/couriway',
        bestTime: '17:12',
        totalRuns: 134,
        winRate: 48,
      },
    ],
    category: 'All Advancements RSG',
    version: '1.16.1',
    seedType: 'Деревня',
    format: 'Best of 3',
    status: 'live',
    time: '19:30',
    date: '2024-01-20T19:30:00',
    viewers: 1560,
    description: 'Полуфинальный матч в чемпионате Most%',
    prizePool: 3000,
    rules: [
      'Все достижения обязательны',
      'Сброс запрещен',
      'Таймер заканчивается после убийства дракона',
    ],
  },
  {
    id: 3,
    tournament: 'Speedrun Showdown',
    players: [
      {
        id: 3,
        name: 'Infume',
        rank: 2,
        score: 0,
        avatar: '/avatars/infume.png',
        twitch: 'https://www.twitch.tv/feinberg',
        bestTime: '14:45',
        totalRuns: 234,
        winRate: 65,
      },
      {
        id: 4,
        name: 'hackingnoises',
        rank: 4,
        score: 0,
        avatar: '/avatars/hackingnoises.png',
        twitch: 'https://www.twitch.tv/couriway',
        bestTime: '15:22',
        totalRuns: 178,
        winRate: 57,
      },
    ],
    category: 'Any% RSG',
    version: '1.21',
    seedType: 'Разрушенный портал',
    format: 'Best of 3',
    status: 'upcoming',
    time: '20:00',
    date: '2024-01-20T20:00:00',
    description: 'Матч группового этапа в Speedrun Showdown',
    prizePool: 2000,
    rules: ['Механики последней версии', 'Сброс запрещен', 'Применяются стандартные правила any%'],
  },
  {
    id: 4,
    tournament: 'No Reset Invitational',
    players: [
      {
        id: 7,
        name: 'silverrruns',
        rank: 7,
        score: 0,
        avatar: '/avatars/silverrruns.png',
        twitch: 'https://www.twitch.tv/olivermcsr',
        bestTime: '17:45',
        totalRuns: 67,
        winRate: 41,
      },
      {
        id: 8,
        name: 'BeefSalad',
        rank: 8,
        score: 0,
        avatar: '/avatars/beefsalad.png',
        twitch: 'https://www.twitch.tv/nerdi',
        bestTime: '18:23',
        totalRuns: 92,
        winRate: 45,
      },
    ],
    category: 'Any% RSG',
    version: '1.16.1',
    seedType: 'Пустынный храм',
    format: 'Best of 3',
    status: 'upcoming',
    time: '21:00',
    date: '2024-01-20T21:00:00',
    description: 'Отборочный матч No Reset Invitational',
    prizePool: 1500,
    rules: ['Строгие правила без сброса', 'Одна попытка на сид', 'Резервные сохранения разрешены'],
  },
]
