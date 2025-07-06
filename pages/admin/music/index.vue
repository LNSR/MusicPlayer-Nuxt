<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Music Management</h1>
    <button class="btn btn-primary mb-4" @click="showAddModal = true">Add Music</button>
    <button class="btn btn-secondary" @click="scanUploads">Scan Uploads</button>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <table class="table w-full">
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Preview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="music in musicList" :key="music.id">
            <td>{{ music.title }}</td>
            <td>{{ music.artist || '-' }}</td>
            <td>
              <button class="btn btn-xs btn-outline" @click="previewMusic(music)">Preview</button>
              <div v-if="previewId === music.id">
                <div :id="`waveform-${music.id}`" class="my-2"></div>
                <button class="btn btn-xs" @click="stopPreview">Stop</button>
              </div>
            </td>
            <td>
              <button class="btn btn-sm btn-info mr-2" @click="editMusic(music)">Edit</button>
              <button class="btn btn-sm btn-error" @click="deleteMusic(music.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="scanLoading">Scanning...</div>
    <div v-if="scanError" class="alert alert-error">{{ scanError }}</div>
    <div v-if="!scanLoading && scannedFiles.length === 0">No audio files found in uploads.</div>
    <div v-if="scannedFiles.length" class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Scanned Music Files</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="file in scannedFiles"
          :key="file.fileUrl"
          class="card bg-base-100 shadow-md hover:shadow-xl transition"
        >
          <div class="card-body">
            <img
              v-if="file.coverUrl"
              :src="file.coverUrl"
              alt="cover"
              class="w-full object-contain rounded mb-2 max-h-64"
            />
            <h3 class="card-title truncate">{{ file.title || file.fileName }}</h3>
            <p class="text-sm text-gray-500 mb-2">{{ file.artist || '-' }}</p>
            <p class="text-xs text-gray-400 mb-2">Duration: {{ file.duration }}s</p>
            <div class="flex justify-end">
              <a :href="file.fileUrl" download class="btn btn-xs btn-outline">Download</a>
            </div>
            <button
              class="btn btn-xs btn-primary my-2"
              @click="playTrack(file)"
            >
              Play
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Add/Edit Modal -->
    <dialog v-if="showAddModal || showEditModal" class="modal modal-open">
      <form class="modal-box" @submit.prevent="submitForm">
        <h3 class="font-bold text-lg">{{ showEditModal ? 'Edit' : 'Add' }} Music</h3>
        <input v-model="form.title" class="input input-bordered w-full my-2" placeholder="Title" required />
        <input v-model="form.artist" class="input input-bordered w-full my-2" placeholder="Artist" required />
        <input v-model="form.albumId" class="input input-bordered w-full my-2" placeholder="Album ID" required type="number" />
        <input type="file" class="file-input w-full my-2" @change="onFileChange" :required="!showEditModal" accept="audio/*" />
        <div v-if="metadataDetected" class="alert alert-info my-2">
          Metadata detected and fields auto-filled from file.
        </div>
        <div v-if="form.duration" class="text-xs text-gray-500">Duration: {{ form.duration }} seconds</div>
        <div class="modal-action">
          <button class="btn" type="button" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" type="submit">{{ showEditModal ? 'Update' : 'Add' }}</button>
        </div>
      </form>
    </dialog>
    <div v-if="currentTrack" class="fixed bottom-0 left-0 right-0 bg-base-200 shadow-lg z-50 p-4 flex items-center gap-4">
      <img v-if="currentTrack.coverUrl" :src="currentTrack.coverUrl" alt="cover" class="h-12 w-12 object-contain rounded" />
      <div class="flex-1">
        <div class="font-semibold">{{ currentTrack.title || currentTrack.fileName }}</div>
        <div class="text-xs text-gray-500">{{ currentTrack.artist || '-' }}</div>
        <div :id="'waveform-global-player'" class="my-2"></div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-xs btn-primary" @click="playWaveSurfer">Play</button>
          <button class="btn btn-xs btn-secondary" @click="pauseWaveSurfer">Pause</button>
          <button class="btn btn-xs btn-error" @click="closeWaveSurfer">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useMusicManagement } from '~/composables/admin/useMusicManagement'
import WaveSurfer from 'wavesurfer.js'
import { parseBlob } from 'music-metadata'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { musicList, loading, fetchMusic, addMusic, updateMusic, deleteMusic } = useMusicManagement()

const showAddModal = ref(false)
const showEditModal = ref(false)
const form = reactive({ id: '', title: '', artist: '', albumId: '', file: null as File | null, duration: 0 })
const previewId = ref<number | null>(null)
const metadataDetected = ref(false)
let waveSurfer: WaveSurfer | null = null
let lastMetadata: any = null

const scannedFiles = ref([])
const scanLoading = ref(false)
const scanError = ref<string | null>(null)

const currentTrack = ref<any>(null)
let globalWaveSurfer: WaveSurfer | null = null

watch(currentTrack, async (track) => {
  if (!track) {
    if (globalWaveSurfer) {
      globalWaveSurfer.destroy()
      globalWaveSurfer = null
    }
    return
  }
  await nextTick()
  if (globalWaveSurfer) {
    globalWaveSurfer.destroy()
    globalWaveSurfer = null
  }
  globalWaveSurfer = WaveSurfer.create({
    container: '#waveform-global-player',
    waveColor: '#60a5fa',
    progressColor: '#2563eb',
    height: 48,
    responsive: true,
  })
  globalWaveSurfer.load(track.fileUrl)
  globalWaveSurfer.on('finish', () => {
    currentTrack.value = null
  })
})

onMounted(fetchMusic)

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  Object.assign(form, { id: '', title: '', artist: '', albumId: '', file: null, duration: 0 })
}

async function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length) {
    form.file = files[0]
    form.title = ''
    form.artist = ''
    form.duration = 0
    metadataDetected.value = false
    try {
      const metadata = await parseBlob(form.file)
      lastMetadata = metadata
      console.log('Extracted metadata:', metadata)
      let detected = false
      if (metadata.common.title) {
        form.title = metadata.common.title
        detected = true
      }
      if (metadata.common.artist) {
        form.artist = metadata.common.artist
        detected = true
      }
      if (metadata.format.duration) {
        form.duration = Math.round(metadata.format.duration)
        detected = true
      }
      metadataDetected.value = detected
      // Log the form after auto-fill
      console.log('Form after auto-fill:', { title: form.title, artist: form.artist, duration: form.duration })
    } catch (err) {
      form.duration = 0
      metadataDetected.value = false
      console.error('Failed to extract metadata:', err)
    }
  }
}

function editMusic(music: any) {
  Object.assign(form, { id: music.id, title: music.title, artist: music.artist, albumId: music.albumId, file: null, duration: music.duration || 0 })
  showEditModal.value = true
}

async function submitForm() {
  const payload = new FormData()
  payload.append('title', form.title)
  payload.append('artist', form.artist)
  payload.append('albumId', String(form.albumId))
  if (form.file) payload.append('file', form.file)
  if (form.duration) payload.append('duration', String(form.duration))
  if (showEditModal.value) {
    await updateMusic(form.id, payload)
  } else {
    await addMusic(payload)
  }
  closeModal()
}

// Audio preview with wavesurfer.js
async function previewMusic(music: any) {
  previewId.value = music.id
  await nextTick()
  if (waveSurfer) {
    waveSurfer.destroy()
    waveSurfer = null
  }
  waveSurfer = WaveSurfer.create({
    container: `#waveform-${music.id}`,
    waveColor: '#60a5fa',
    progressColor: '#2563eb',
    height: 48,
    responsive: true,
  })
  waveSurfer.load(music.fileUrl)
  waveSurfer.on('ready', () => waveSurfer?.play())
}

function stopPreview() {
  if (waveSurfer) {
    waveSurfer.stop()
    waveSurfer.destroy()
    waveSurfer = null
  }
  previewId.value = null
}

function playTrack(file: any) {
  currentTrack.value = file
}

function playWaveSurfer() {
  globalWaveSurfer?.play()
}
function pauseWaveSurfer() {
  globalWaveSurfer?.pause()
}
function closeWaveSurfer() {
  globalWaveSurfer?.stop()
  globalWaveSurfer?.destroy()
  globalWaveSurfer = null
  currentTrack.value = null
}

async function scanUploads() {
  scanLoading.value = true
  scanError.value = null
  try {
    const data = await $fetch('/api/admin/music/scan-uploads')
    scannedFiles.value = Array.isArray(data) ? data : []
  } catch (e) {
    scanError.value = 'Failed to scan uploads'
  } finally {
    scanLoading.value = false
  }
}

</script>