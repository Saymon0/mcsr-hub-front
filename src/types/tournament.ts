export interface Tournament {
  id: number // Теперь это число
  created_at?: string
  title: string
  status: 'upcoming' | 'ongoing' | 'finished'
  image_url?: string
  description?: string
}

export interface Match {
  id: number // И здесь число
  tournament_id: number
  player1_name: string
  player2_name: string
  score1: number
  score2: number
  match_date: string
  status: 'scheduled' | 'live' | 'finished'
  video_url?: string
}
