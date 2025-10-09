<template>
	<v-card class="pa-2" elevation="2">
		<div v-if="loading" class="d-flex justify-center align-center" style="height: 100px;">
			<v-progress-circular indeterminate color="green" />
		</div>
		<div v-else>
			<div v-if="audioUrl">
				<div ref="waveform" style="width: 100%; height: 100px;">
				</div>

				<div class="d-flex align-center justify-space-between border-t">
					<v-btn icon @click="togglePlay" :disabled="loadingAudio">
						<v-icon>{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
					</v-btn>

					<v-slider v-model="volume" min="0" max="1" step="0.01" @update:modelValue="setVolume"
						label="Âm lượng" hide-details style="width: 200px" :disabled="loadingAudio"></v-slider>
				</div>
			</div>
			<div v-else class="text-center text-caption">Bạn chưa có ghi âm</div>
		</div>
	</v-card>
</template>

<script>
export default {
	props: {
		audioUrl: {
			type: String,
			default: '',
		},
		fileAudio: null
	},
	data() {
		return {
			waveSurfer: null,
			isPlaying: false,
			volume: 1,
			loading: false, // thêm biến loading
			loadingAudio: false,
		}
	},
	mounted() {
		if (this.audioUrl) {
			this.loadAudio(this.audioUrl)
		}
	},
	watch: {
		audioUrl(newUrl) {
			if (!newUrl) return
			this.loadAudio(newUrl)
		},
	},
	methods: {
		async loadAudio(url) {
			this.loading = true // Bắt đầu loading
			this.loadingAudio = true
			let newUrl = url

			// Kiểm tra URL có phải là dạng Google Drive URL
			if (url.includes('https://drive.google.com')) {
				let fileId = null;
				const match = url.match(/\/file\/d\/([^/]+)/);
				if (match && match[1]) {
					fileId = match[1];
				} else {
					const urlParams = new URLSearchParams(new URL(url).search);
					fileId = urlParams.get('id');
				}
				if (fileId) {
					console.log(fileId); // 👉 "1ID95oD7iJIec1tPp9JbDkFYIGsZ6MSPs"

					const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
					const resBlob = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
						headers: {
							Authorization: `Bearer ${access_token}`,
						}
					}).then(res => res.blob()).finally(() => { this.loading = false; })

					newUrl = URL.createObjectURL(resBlob);
				} else {
					console.error('Không tìm thấy fileId trong URL');
					this.loading = false;
					return;
				}
			}

			// Nếu đã có waveSurfer, hủy và tạo lại
			if (this.waveSurfer) {
				this.waveSurfer.destroy()
				this.waveSurfer = null
			}

			// Khởi tạo waveSurfer
			this.waveSurfer = await WaveSurfer.create({
				container: this.$refs.waveform,
				waveColor: '#A5D6A7',
				progressColor: '#388E3C',
				height: 80,
				responsive: true,
				barWidth: 2,
			})

			// Tải audio vào waveSurfer
			await this.waveSurfer.load(newUrl)
			// Khi kết thúc phát, cập nhật trạng thái
			this.waveSurfer.on('finish', () => {
				this.isPlaying = false
			})

			// Đặt volume và trạng thái ban đầu
			this.waveSurfer.setVolume(this.volume)

			this.isPlaying = false
			await this.$nextTick()
			setTimeout(() => {
				this.loadingAudio = false
			}, 2000);


		},
		togglePlay() {
			if (!this.waveSurfer) return
			this.waveSurfer.playPause()
			this.isPlaying = !this.isPlaying
		},
		setVolume() {
			if (this.waveSurfer) {
				this.waveSurfer.setVolume(this.volume)
			}
		},
		ajaxCALLPromise(url, params = null) {
			return new Promise(resolve => {
				ajaxCALL(url, params, res => {
					if (res?.data) { resolve(res.data) }
					else { resolve(res) }
				})
			})
		},
	},
	beforeUnmount() {
		if (this.waveSurfer) {
			this.waveSurfer.destroy()
		}
	},

}
</script>