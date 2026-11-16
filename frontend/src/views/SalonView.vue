<template>
  <div class="container py-4">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <div class="d-flex align-items-center gap-2">
          <h1 class="fw-bold text-white fs-4 mb-0">{{ room.name }}</h1>
          <span class="badge bg-dark text-light border border-secondary border-opacity-50 px-2 py-1 small">
            #{{ roomCode }}
          </span>
        </div>
        <p class="text-muted small mb-0 mt-1">{{ room.description }}</p>
      </div>
      <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1 flex-md-grow-0 justify-content-end">

        <button @click="copyInviteLink" type="button" class="btn btn-secondary-custom btn-sm d-flex align-items-center gap-2 px-3 py-2">
          <i :class="copied ? 'bi bi-check2 text-success' : 'bi bi-share'"></i>
          <span>{{ copied ? 'Copié' : 'Inviter' }}</span>
        </button>
      </div>
    </div>

    <div class="row g-4 align-items-stretch">
      
      <!-- col lecteur + membres -->
      <div class="col-12 col-lg-8">
        
        <!-- lecteur -->
        <div ref="playerStageRef" class="room-stage mb-3">
          
          <div class="yt-clean-viewport" @click="togglePlay">
            <div id="yt-custom-player"></div>

            <!-- Écran cliquable avec bouton central au survol ou en pause -->
            <div class="yt-click-shield" :class="{ 'is-paused': !isPlaying }">
              <button type="button" class="big-play-trigger" aria-label="Lecture ou Pause">
                <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill ms-1'"></i>
              </button>
            </div>
          </div>

          <div class="custom-player-bar">
            
            <div ref="timelineRef" class="timeline-track mb-3" @click="seekFromClick">
              <div class="timeline-fill" :style="{ width: `${progressPercent}%` }"></div>
              <div class="timeline-thumb" :style="{ left: `${progressPercent}%` }"></div>
            </div>

            <!-- Boutons -->
            <div class="d-flex align-items-center justify-content-between gap-2">
              
              <!-- Play/Pause, Volume, Temps -->
              <div class="d-flex align-items-center gap-2">
                <button @click="togglePlay" type="button" class="control-icon-btn" title="Lecture / Pause">
                  <i :class="isPlaying ? 'bi bi-pause-fill fs-5' : 'bi bi-play-fill fs-5'"></i>
                </button>

                <!-- Volume -->
                <div class="d-flex align-items-center gap-1 ms-1">
                  <button @click="toggleMute" type="button" class="control-icon-btn" title="Muet">
                    <i :class="volumeIcon"></i>
                  </button>
                  <input v-model.number="volume" @input="updateVolume" type="range" min="0" max="100" class="volume-slider d-none d-sm-block">
                </div>

                <!-- Temps vidéo -->
                <span class="text-muted small ms-2">
                  {{ formatTime(currentTime) }} <span class="opacity-50">/</span> {{ formatTime(duration) }}
                </span>
              </div>

              <!-- Plein écran -->
              <div class="d-flex align-items-center gap-1">
                <button @click="toggleFullscreen" type="button" class="control-icon-btn" title="Plein écran">
                  <i class="bi bi-fullscreen"></i>
                </button>
              </div>

            </div>
          </div>

        </div>

        <!-- DONNEES VIDÉO EN COURS -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pb-4 mb-4 border-bottom border-secondary border-opacity-25">
          <div>
            <h2 class="fw-bold text-white fs-5 mb-1">{{ currentVideo.title }}</h2>
            <div class="text-muted small">
              Lancée par <span class="text-white fw-medium">{{ currentVideo.addedBy }}</span>
            </div>
          </div>
          <span class="badge bg-dark text-muted border border-secondary border-opacity-25 px-3 py-2">
            <i class="bi bi-people me-1"></i> {{ members.length }} spectateurs
          </span>
        </div>

        <!-- MEMBRES DU SALON -->
        <div>
          <h3 class="fw-bold text-white fs-6 mb-3">Membres connectés</h3>
          <div class="row g-2">
            <div v-for="member in members" :key="member.id" class="col-6 col-sm-4 col-md-3">
              <div class="member-pill d-flex align-items-center gap-2">
                <div class="member-avatar flex-shrink-0">
                  {{ member.name.charAt(0).toUpperCase() }}
                </div>
                <div class="overflow-hidden">
                  <div class="text-white fw-semibold small text-truncate">{{ member.name }}</div>
                  <div class="text-muted" style="font-size: 0.72rem;">{{ member.role }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- CHAT -->
      <div class="col-12 col-lg-4">
        <div class="clean-card side-panel d-flex flex-column h-100">
          <div class="px-3 py-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
            <span class="fw-bold text-white small">Chat</span>
          </div>

          <!-- messages -->
          <div ref="messagesContainer" class="flex-grow-1 p-3 d-flex flex-column gap-3 overflow-y-auto">
            <div v-for="msg in messages" :key="msg.id" class="d-flex align-items-start gap-2">
              <div class="member-avatar flex-shrink-0" style="width: 30px; height: 30px; font-size: 0.75rem;">
                {{ msg.author.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-baseline justify-content-between mb-1">
                  <span class="text-white fw-semibold" style="font-size: 0.8rem;">{{ msg.author }}</span>
                  <span class="text-muted" style="font-size: 0.7rem;">{{ msg.time }}</span>
                </div>
                <div class="chat-bubble small">
                  {{ msg.text }}
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 border-top border-secondary border-opacity-25">
            <form @submit.prevent="sendMessage" class="d-flex gap-2">
              <input v-model="newMessage" type="text" class="form-control form-control-sm py-2 px-3" placeholder="Écrire un message...">
              <button type="submit" :disabled="!newMessage.trim()" class="btn btn-primary btn-sm px-3 fw-semibold">
                <i class="bi bi-send-fill"></i>
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomCode = computed(() => route.params.code || 'test')

// États UI
const theaterMode = ref(false)
const copied = ref(false)
const newMessage = ref('')
const playerStageRef = ref(null)
const timelineRef = ref(null)

// États Lecteur YouTube personnalisé
let ytPlayer = null
let progressTimer = null
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(80)
const currentTime = ref(0)
const duration = ref(0)

const room = ref({
  name: 'Salon Fun',
  description: 'Regardez et commentez en direct avec le groupe.'
})

const currentVideo = ref({
  videoId: '5D7T6uYB-1w',
  title: 'LES PIRES OBJETS SUR LES SITES CHINOIS ! (ça devient flippant) #9',
  addedBy: 'Lucas'
})

const members = ref([
  { id: 1, name: 'Lucas', role: 'Hôte' },
  { id: 2, name: 'Yassine', role: 'Participant(e)' },
  { id: 3, name: 'Eléis', role: 'Participant(e)' }
])

const messages = ref([
  { id: 1, author: 'Lucas', text: 'Bienvenue dans le salon !', time: '19:20' },
  { id: 2, author: 'Eléis', text: 'Salut!', time: '19:21' }
])

// Calculs du lecteur
const progressPercent = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100))
})

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'bi bi-volume-mute-fill fs-5'
  if (volume.value < 50) return 'bi bi-volume-down-fill fs-5'
  return 'bi bi-volume-up-fill fs-5'
})

const formatTime = (seconds) => {
  const s = Math.floor(seconds || 0)
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Initialisation de l'API YouTube IFrame sans contrôles ni titre
const initYouTubeAPI = () => {
  const createPlayer = () => {
    ytPlayer = new window.YT.Player('yt-custom-player', {
      videoId: currentVideo.value.videoId,
      playerVars: {controls: 0,disablekb: 1,fs: 0,iv_load_policy: 3, modestbranding: 1,rel: 0,playsinline: 1},
      events: {
        onReady: (event) => {
          event.target.setVolume(volume.value)
          duration.value = event.target.getDuration() || 0
          startProgressLoop()
        },
        onStateChange: (event) => {
          isPlaying.value = event.data === window.YT.PlayerState.PLAYING
          if (event.data === window.YT.PlayerState.PLAYING) {
            duration.value = ytPlayer.getDuration() || duration.value
          }
        }
      }
    })
  }

  if (window.YT && window.YT.Player) {
    createPlayer()
  } else {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
    window.onYouTubeIframeAPIReady = createPlayer
  }
}

const startProgressLoop = () => {
  clearInterval(progressTimer)
  progressTimer = setInterval(() => {
    if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      currentTime.value = ytPlayer.getCurrentTime() || 0
      const d = ytPlayer.getDuration()
      if (d) duration.value = d
    }
  }, 250)
}

// Contrôles du lecteur
const togglePlay = () => {
  if (!ytPlayer) return
  if (isPlaying.value) {
    ytPlayer.pauseVideo()
  } else {
    ytPlayer.playVideo()
  }
}

const seekFromClick = (event) => {
  if (!ytPlayer || !timelineRef.value || !duration.value) return
  const rect = timelineRef.value.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const targetTime = ratio * duration.value
  ytPlayer.seekTo(targetTime, true)
  currentTime.value = targetTime
}

const toggleMute = () => {
  if (!ytPlayer) return
  if (isMuted.value) {
    ytPlayer.unMute()
    isMuted.value = false
  } else {
    ytPlayer.mute()
    isMuted.value = true
  }
}

const updateVolume = () => {
  if (!ytPlayer) return
  ytPlayer.setVolume(volume.value)
  if (volume.value > 0 && isMuted.value) {
    ytPlayer.unMute()
    isMuted.value = false
  }
}

const toggleFullscreen = () => {
  if (!playerStageRef.value) return
  if (!document.fullscreenElement) {
    playerStageRef.value.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

const copyInviteLink = () => {
  navigator.clipboard?.writeText(window.location.href)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  initYouTubeAPI()
})
</script>