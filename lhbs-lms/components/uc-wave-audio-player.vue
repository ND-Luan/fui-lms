<template>
	<v-card class="audio-player" elevation="2">
		<div class="player-content">
			<!-- Waveform (LUÔN TỒN TẠI) -->
			<div class="waveform-container">
				<div :ref="waveformRef" class="waveform"></div>

				<!-- Loading overlay -->
				<div v-if="loading" class="loading-overlay d-flex align-center justify-center">
					<v-progress-circular indeterminate size="28" />
					<div class="mt-1 text-caption">{{ loadingText }}</div>
				</div>
			</div>

			<!-- Controls -->
			<div class="player-controls">
				<!-- Play / Pause -->
				<v-btn icon size="small" variant="text" color="primary" :disabled="loadingAudio || !waveSurfer"
					@click="togglePlay">
					<v-icon size="24">
						{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
					</v-icon>
				</v-btn>

				<!-- Time -->
				<span class="time-text">{{ currentTime }}</span>

				<!-- Volume -->
				<div class="volume-control">
					<v-icon size="18" class="volume-icon" @click="toggleMute">
						{{ volumeIcon }}
					</v-icon>

					<v-slider v-model="volume" min="0" max="1" step="0.01" hide-details density="compact"
						class="volume-slider" :disabled="loadingAudio" @update:modelValue="setVolume" />
				</div>

				<!-- Speed -->
				<v-menu>
					<template #activator="{ props }">
						<v-chip size="x-small" variant="text" v-bind="props" :disabled="loadingAudio">
							{{ playbackSpeed }}x
						</v-chip>
					</template>

					<v-list density="compact">
						<v-list-item v-for="speed in speedOptions" :key="speed"
							:class="{ 'v-list-item--active': playbackSpeed === speed }" @click="setSpeed(speed)">
							{{ speed }}x
						</v-list-item>
					</v-list>
				</v-menu>

				<!-- Duration -->
				<span class="time-text text-grey">{{ duration }}</span>
			</div>
		</div>
	</v-card>
</template>

<script>
	export default {
		name: 'AudioPlayer',
	
		props: {
			audioUrl: {
				type: String,
				default: '',
			},
		},
	
		data() {
			return {
				// ref duy nhất cho waveform
				waveformRef: `waveform-${generateID()}`,
	
				waveSurfer: null,
				isPlaying: false,
	
				volume: 0.8,
				previousVolume: 0.8, 
	
				loading: false,
				loadingAudio: false,
				loadingText: 'Đang tải...',
	
				currentTime: '0:00',
				duration: '0:00',
	
				playbackSpeed: 1,
				speedOptions: [0.5, 0.75, 1, 1.25, 1.5, 2],
			}
		},
	
		computed: {
			volumeIcon() {
				if (this.volume === 0) return 'mdi-volume-mute'
				if (this.volume < 0.5) return 'mdi-volume-low'
				return 'mdi-volume-high'
			},
		},
	
		mounted() {
			if (this.audioUrl) {
				this.loadAudio(this.audioUrl)
			}
		},
	
		watch: {
			audioUrl(newUrl) {
				if (newUrl) this.loadAudio(newUrl)
			},
		},
	
		methods: {
			async loadAudio(url) {
				if (!url) return
	
				this.loading = true
				this.loadingAudio = true
				this.loadingText = 'Đang tải âm thanh...'
	
				let finalUrl = url
	
				// ===== Google Drive =====
				if (url.includes('drive.google.com')) {
					const fileId =
						url.match(/\/file\/d\/([^/]+)/)?.[1] ||
						new URL(url).searchParams.get('id')
	
					if (!fileId) {
						console.error('Không tìm thấy fileId')
						this.loading = false
						return
					}
	
					const { access_token } = await this.ajaxCALLPromise(
						'lms/FP_Youtube_Token_Get'
					)
	
					const blob = await fetch(
						`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
						{
							headers: { Authorization: `Bearer ${access_token}` },
						}
					).then(res => res.blob())
	
					finalUrl = URL.createObjectURL(blob)
				}
	
				// destroy cũ
				this.waveSurfer?.destroy()
				this.waveSurfer = null
	
				// đợi DOM chắc chắn tồn tại
				await this.$nextTick()
	
				const container = this.$refs[this.waveformRef]
				if (!container) {
					console.error('Waveform container not found')
					return
				}
	
				// create wavesurfer
				this.waveSurfer = WaveSurfer.create({
					container,
					waveColor: '#B3E5FC',
					progressColor: '#1976D2',
					cursorColor: '#1976D2',
					height: 50,
					barWidth: 2,
					barRadius: 2,
					barGap: 1,
				})
	
				await this.waveSurfer.load(finalUrl)
	
				// events
				this.waveSurfer.on('ready', () => {
					this.duration = this.formatTime(this.waveSurfer.getDuration())
					this.waveSurfer.setVolume(this.volume)
					this.loading = false
					this.loadingAudio = false
				})
	
				this.waveSurfer.on('audioprocess', () => {
					this.currentTime = this.formatTime(
						this.waveSurfer.getCurrentTime()
					)
				})
	
				this.waveSurfer.on('seek', () => {
					this.currentTime = this.formatTime(
						this.waveSurfer.getCurrentTime()
					)
				})
	
				this.waveSurfer.on('finish', () => {
					this.isPlaying = false
				})
			},
	
			togglePlay() {
				if (!this.waveSurfer) return
				this.waveSurfer.playPause()
				this.isPlaying = !this.isPlaying
			},
	
			setVolume() {
				this.waveSurfer?.setVolume(this.volume)
			},
	
			toggleMute() {
				if (this.volume === 0) {
					this.volume = this.previousVolume
				} else {
					this.previousVolume = this.volume
					this.volume = 0
				}
				this.setVolume()
			},
	
			setSpeed(speed) {
				this.playbackSpeed = speed
				this.waveSurfer?.setPlaybackRate(speed)
			},
	
			formatTime(sec) {
				const m = Math.floor(sec / 60)
				const s = Math.floor(sec % 60)
				return `${m}:${String(s).padStart(2, '0')}`
			},
	
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => {
						resolve(res?.data ?? res)
					})
				})
			},
		},
	
		beforeUnmount() {
			this.waveSurfer?.destroy()
		},
	}
</script>