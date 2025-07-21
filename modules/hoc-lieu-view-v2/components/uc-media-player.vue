<template>
	<div class="media-player-container">
		<!-- Hiển thị tiêu đề nếu có -->
		<h3 v-if="title" class="media-title">{{ title }}</h3>

		<!-- Trạng thái Loading -->
		<div v-if="isLoading" class="loading-overlay">
			<v-progress-circular indeterminate color="primary"></v-progress-circular>
		</div>

		<!-- Trạng thái Lỗi -->
		<div v-else-if="error" class="error-overlay">
			<v-icon color="error" size="x-large">mdi-alert-circle-outline</v-icon>
			<p class="mt-2">{{ error }}</p>
		</div>

		<!-- Trình phát Video (Iframe cho Youtube) -->
		<div v-else-if="mediaType === 'youtube'" class="lh-video-slide">
			<div class="lh-video-container">
				<iframe :src="mediaUrl" frameborder="0" allow="autoplay; fullscreen" allowfullscreen
					class="lh-video-iframe"></iframe>
			</div>
		</div>

		<div v-else-if="mediaType === 'video'" class="lh-video-slide">
			<div class="lh-video-container">
				<iframe :src="mediaUrl" frameborder="0" allow="autoplay; fullscreen" allowfullscreen
					class="lh-video-iframe"></iframe>
			</div>
		</div>

		<!-- <div v-else-if="slideData.type === 'VIDEO'" class="lh-video-slide">
			<div class="lh-video-container">
				<iframe :src="embedVideoUrl" frameborder="0" allow="autoplay; fullscreen" allowfullscreen
					class="lh-video-iframe"></iframe>
			</div>
		</div> -->

		<!-- Trình phát Audio (thẻ <audio> của HTML5) -->
		<div v-else-if="mediaType === 'audio'" class="audio-wrapper">
			<audio controls :src="mediaUrl" class="w-100">
				Trình duyệt của bạn không hỗ trợ thẻ audio.
			</audio>
			<!-- <f-audio :file="mediaUrl" :repeat="2" :wait="3" :allowstop = "true"></f-audio>  -->

		</div>

		<!-- Trường hợp URL không được hỗ trợ -->
		<div v-else class="unsupported-wrapper">
			<p>Loại media không được hỗ trợ hoặc đường dẫn không hợp lệ.</p>
			<a :href="url" target="_blank" v-if="url">Mở link trực tiếp</a>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-media-player',
		props: {
			url: {
				type: String,
				required: true
			},
			title: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				mediaType: null, // 'youtube', 'audio', 'unknown'
				mediaUrl: '',
				isLoading: true,
				error: null
			}
		},
		watch: {
			url: {
				handler(newUrl) {
					this.processUrl(newUrl);
				},
				immediate: true
			}
		},
		methods: {
			processUrl(urlStr) {
				this.isLoading = true;
				this.error = null;
	
				if (!urlStr) {
					this.error = "Không có đường dẫn media.";
					this.isLoading = false;
					return;
				}
	
				// Kiểm tra link Youtube
				try {
					console.log('urlStr', urlStr)
					const url = new URL(urlStr);
					if (url.hostname.includes('youtube.com') || url.hostname === 'youtu.be') {
						let videoId = '';
						if (url.hostname.includes('youtube.com')) {
							videoId = url.searchParams.get('v');
							// videoId = url.pathname.slice(1);
							console.log('includes', url)
						}
	
						if (url.pathname.includes('shorts')) {
							const urlSplit = url.pathname.split('/')
							videoId = urlSplit[2]
							console.log('short')
						}
						console.log('videoId---------------------', videoId)
						if (videoId) {
							this.mediaType = 'youtube';
							this.mediaUrl = `https://www.youtube.com/embed/${videoId}`;
							this.isLoading = false;
							return;
						}
					} 
					// else if (url.hostname.includes("drive.google.com")) {
						
					// }
					else {
						this.mediaType = 'video';
						this.mediaUrl = vueData.v_Set.urlReadFile + urlStr;
						console.log(this.mediaUrl);
						this.isLoading = false;
					}
				} catch (e) {
					// Không phải URL hợp lệ, tiếp tục kiểm tra đuôi file
				}
	
				// Kiểm tra đuôi file audio
				const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a'];
				if (audioExtensions.some(ext => urlStr.toLowerCase().endsWith(ext))) {
					this.mediaType = 'audio';
					if (urlStr.startsWith('http')) {
						this.mediaUrl = urlStr
					} else {
						this.mediaUrl = vueData.v_Set.urlReadFile + urlStr;
					}
					console.log(this.mediaUrl);
					this.isLoading = false;
					return;
				}
	
				// Kiểm tra đuôi file audio
				const videoExtensions = ['.mp4', '.avi'];
				if (videoExtensions.some(ext => urlStr.toLowerCase().endsWith(ext))) {
					this.mediaType = 'video';
	
					this.mediaUrl = vueData.v_Set.urlReadFile + urlStr;
	
					console.log(this.mediaUrl);
					this.isLoading = false;
					return;
				}
	
				// Nếu không phải cả hai
				this.mediaType = 'unknown';
				this.error = "Định dạng media không được hỗ trợ.";
				this.isLoading = false;
			}
		}
	}
</script>
<style scoped>
	.media-player-container {
		width: 100%;
		position: relative;
	}

	.media-title {
		margin-bottom: 16px;
		font-size: 1.5rem;
		font-weight: 600;
	}

	/* ============================================== */
	/*         SỬA LỖI VIDEO IFRAME Ở ĐÂY             */
	/* ============================================== */

	/* 1. Container cha (video-wrapper) */
	.video-wrapper {
		position: relative;
		padding-bottom: 56.25%;
		/* Tỷ lệ 16:9 (9 / 16 = 0.5625) */
		height: 0;
		overflow: hidden;
		border-radius: 12px;
		/* Bo tròn góc */
		background-color: #000;
		/* Nền đen trong khi chờ tải */
	}

	/* 2. Iframe bên trong */
	.video-wrapper iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	/* ============================================== */


	.audio-wrapper {
		width: 100%;
	}

	.audio-wrapper audio {
		width: 100%;
		border-radius: 30px;
		/* Bo tròn trình phát audio */
	}

	/* Các style khác */
	.loading-overlay,
	.error-overlay,
	.unsupported-wrapper {
		min-height: 200px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		border-radius: 8px;
		border: 2px dashed #ccc;
		color: #757575;
	}
</style>