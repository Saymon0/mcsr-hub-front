<template>
  <div class="bg-primary-card rounded-lg p-4 border border-primary-hover hover:border-accent-blue transition-all duration-300">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h3 class="text-text-primary font-semibold text-lg">{{ run.runner.username }}</h3>
        <p class="text-text-secondary text-sm">{{ run.category }} • {{ run.version }}</p>
      </div>
      <div class="text-right">
        <span class="text-accent-gold font-bold text-xl">{{ run.time }}</span>
        <p class="text-text-muted text-xs">IGT</p>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <span class="text-text-muted text-sm">{{ formatDate(run.date) }}</span>
      <div class="flex space-x-2">
        <button class="text-accent-blue hover:text-accent-green transition-colors text-lg">
          📺
        </button>
        <button class="text-text-secondary hover:text-text-primary transition-colors text-lg">
          ⭐
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Run {
  id: number
  runner: {
    username: string
    rank: number
  }
  category: string
  version: string
  time: string
  date: string
}

defineProps<{
  run: Run
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU')
}
</script>
