<script setup lang="ts">
import API_URL from '@/api';
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const title = ref('')
const description = ref('')
const status = ref('upcoming')
const isSubmitting = ref(false)

const createTournament = async () => {
  if (!title.value) return alert('Введите название!')

  isSubmitting.value = true
  try {
    await axios.post(`${API_URL}/api/tournaments`, {
      title: title.value,
      description: description.value,
      status: status.value,
    })
    router.push('/tournaments') // Возвращаемся к списку после успеха
  } catch (err) {
    console.error(err)
    alert('Ошибка при сохранении')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#050505] flex items-center justify-center p-6">
    <div class="w-full max-w-xl bg-[#0f0f0f] border border-zinc-800 rounded-3xl p-10 shadow-2xl">
      <h1 class="text-3xl font-black uppercase italic mb-8 text-white">Новый турнир</h1>

      <div class="space-y-6">
        <div>
          <label class="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block"
            >Название</label
          >
          <input
            v-model="title"
            type="text"
            class="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:border-[#7c3aed] transition-all"
            placeholder="MCSR Ranked Season 5"
          />
        </div>

        <div>
          <label class="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block"
            >Описание</label
          >
          <textarea
            v-model="description"
            class="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:border-[#7c3aed] h-32 transition-all"
            placeholder="Краткая информация о турнире..."
          ></textarea>
        </div>

        <div>
          <label class="text-[10px] uppercase font-black tracking-widest text-zinc-500 mb-2 block"
            >Статус</label
          >
          <select
            v-model="status"
            class="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-white outline-none focus:border-[#7c3aed] appearance-none transition-all"
          >
            <option value="upcoming">Предстоит</option>
            <option value="ongoing">Идет сейчас</option>
            <option value="finished">Завершен</option>
          </select>
        </div>

        <div class="pt-4 flex gap-4">
          <button
            @click="router.back()"
            class="flex-1 py-4 border border-zinc-800 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-900 transition-all"
          >
            Отмена
          </button>
          <button
            @click="createTournament"
            :disabled="isSubmitting"
            class="flex-[2] py-4 bg-[#7c3aed] rounded-2xl font-bold text-white hover:bg-[#6d28d9] transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
          >
            {{ isSubmitting ? 'Сохранение...' : 'Создать турнир' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
