import { ref } from 'vue'
import type { Music } from '~/types/music'

export function useMusicManagement() {
  const musicList = ref<Music[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMusic = async () => {
    loading.value = true
    try {
      const { data } = await useFetch('/api/admin/music/music')
      musicList.value = Array.isArray(data.value) ? data.value as Music[] : []
    } catch (e) {
      error.value = 'Failed to fetch music'
    } finally {
      loading.value = false
    }
  }

  const addMusic = async (payload: FormData) => {
    try {
      await $fetch('/api/admin/music/music', { method: 'POST', body: payload })
      await fetchMusic()
    } catch (e) {
      error.value = 'Failed to add music'
    }
  }

  const updateMusic = async (id: string, payload: FormData) => {
    try {
      await $fetch(`/api/admin/music/${id}`, { method: 'PATCH', body: payload })
      await fetchMusic()
    } catch (e) {
      error.value = 'Failed to update music'
    }
  }

  const deleteMusic = async (id: string) => {
    try {
      await $fetch(`/api/admin/music/${id}`, { method: 'DELETE' })
      await fetchMusic()
    } catch (e) {
      error.value = 'Failed to delete music'
    }
  }

  return { musicList, loading, error, fetchMusic, addMusic, updateMusic, deleteMusic }
}