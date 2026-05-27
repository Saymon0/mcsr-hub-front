<script setup lang="ts">
import { computed } from 'vue'
import PlayerAvatar from '@/components/players/PlayerAvatar.vue'

const props = defineProps<{
  match: {
    id: number
    tournament_name: string
    player1_id: any
    player1_name: string
    player1_rank: number | null
    player2_id: any
    player2_name: string
    player2_rank: number | null
    score1: number
    score2: number
    match_date: string
    status: string
    format: string
    category: string
    // Добавляем | null ко всем сидам
    seed1?: string | null
    seed2?: string | null
    seed3?: string | null
    seed4?: string | null
    seed5?: string | null
    seed6?: string | null
    seed7?: string | null
  }
}>()

// Адаптивные сиды
const seedsArray = computed(() => {
  const formatCount = parseInt(props.match.format) || 1
  const result = []
  for (let i = 1; i <= formatCount; i++) {
    const seedValue = (props.match as any)[`seed${i}`]
    if (seedValue) {
      result.push({ id: i, name: seedValue })
    }
  }
  return result
})

// Порог побед (ромбы)
const winThreshold = computed(() => {
  const num = parseInt(props.match.format)
  return !isNaN(num) ? Math.ceil(num / 2) : 1
})

const matchTime = computed(() => {
  if (!props.match.match_date) return '--:--'
  return new Date(props.match.match_date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <!-- Заменил h-full на h-auto -->
  <div
    class="w-full h-auto bg-[#1a133d]/80 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-xl backdrop-blur-md hover:border-purple-500/50 transition-all group relative overflow-hidden"
  >
    <!-- Header -->
    <div class="flex justify-between items-start leading-tight relative z-10">
      <div class="flex flex-col">
        <span
          class="text-[13px] font-black uppercase text-white tracking-tight truncate max-w-[180px]"
        >
          {{ match.tournament_name }}
        </span>
        <span class="text-[11px] font-bold text-zinc-400 uppercase"> — {{ match.category }} </span>
      </div>
      <span
        class="text-[11px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20"
      >
        {{ matchTime }}
      </span>
    </div>

    <!-- Players Section -->
    <div class="flex flex-col gap-4 my-1 relative z-10">
      <!-- Player 1 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <PlayerAvatar
            :player="{
              id: match.player1_id,
              name: match.player1_name,
              rank: match.player1_rank || undefined,
            }"
            size="sm"
          />
          <span
            class="text-[14px] font-black text-white uppercase tracking-wider group-hover:text-purple-400 transition-colors"
          >
            {{ match.player1_name }}
          </span>
        </div>
        <div class="flex gap-1.5">
          <div
            v-for="i in winThreshold"
            :key="i"
            class="w-3 h-3 rotate-45 border-2"
            :class="
              match.score1 >= i
                ? 'bg-purple-500 border-purple-500 shadow-[0_0_8px_#a855f7]'
                : 'border-white/10 bg-transparent'
            "
          ></div>
        </div>
      </div>

      <!-- Player 2 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <PlayerAvatar
            :player="{
              id: match.player2_id,
              name: match.player2_name,
              rank: match.player2_rank || undefined,
            }"
            size="sm"
          />
          <span
            class="text-[14px] font-black text-white uppercase tracking-wider group-hover:text-purple-400 transition-colors"
          >
            {{ match.player2_name }}
          </span>
        </div>
        <div class="flex gap-1.5">
          <div
            v-for="i in winThreshold"
            :key="i"
            class="w-3 h-3 rotate-45 border-2"
            :class="
              match.score2 >= i
                ? 'bg-purple-500 border-purple-500 shadow-[0_0_8px_#a855f7]'
                : 'border-white/10 bg-transparent'
            "
          ></div>
        </div>
      </div>
    </div>

    <div class="h-px bg-white/5 w-full"></div>

    <!-- Footer: Сиды -->
    <!-- Убрал min-h-[80px], чтобы высота была только по тексту -->
    <div class="flex flex-col gap-3 relative z-10">
      <div v-if="seedsArray.length > 0" class="flex flex-col gap-2">
        <span class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Сиды:</span>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="seed in seedsArray"
            :key="seed.id"
            class="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300"
          >
            {{ seed.name }}
          </span>
        </div>
      </div>

      <div class="pt-2 flex justify-between items-center">
        <span class="text-[11px] font-black text-zinc-400 uppercase tracking-tighter">
          Best of {{ match.format }}
        </span>
      </div>
    </div>
  </div>
</template>
