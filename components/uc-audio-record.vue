<template>
	<v-card elevation="4">
		<v-card-text>
			<!-- Nút điều khiển ghi âm -->
			<div class="d-flex align-center ga-3" v-if="isShowBtn">
				<v-btn v-if="!readonly" color="primary" variant="tonal" :disabled="isRecording" @click="startRecording">
					<v-icon start>mdi-microphone</v-icon>
					Ghi âm
				</v-btn>

				<v-btn v-if="!readonly" color="red" variant="tonal" :disabled="!isRecording" @click="handleStop">
					<v-icon start>mdi-stop</v-icon>
					Dừng
				</v-btn>
				<v-btn v-if="!readonly && file && !isRecording " color="red" variant="tonal" :disabled="isSaveFile"
					@click="$emit('handleSave')">
					<v-icon start>mdi-stop</v-icon>
					Lưu file
				</v-btn>

				<!-- Hiệu ứng khi đang ghi âm -->
				<v-progress-circular v-if="isRecording" indeterminate color="red" size="24"></v-progress-circular>
			</div>

			<!-- Audio preview -->
			<div v-if="audioUrl" class="mt-2">
				<p class="text-subtitle-2">🔊 Nghe lại bản ghi:</p>
				<uc-wave-audio-player v-model:audioUrl="audioUrl" />
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		props: {
			file: null,
			src: null,
			readonly: null,
			isShowBtn: { type: Boolean, default: true },
			isSaveFile: { type: Boolean },
			handleSave: { type: Function }
		},
		data() {
			const _src = this.src
			return {
				recorder: null,
				isRecording: false,
				audioUrl: _src,
				audioBlob: null,
				recordedFile: null,
				fileAudio: null
			};
		},
		created() {
			this.recorder = new MicRecorder({ bitRate: 128 });
		},
		methods: {
			async startRecording() {
				try {
					await this.recorder.start();
					this.isRecording = true;
					this.audioUrl = null;
					this.recordedFile = null;
				} catch (e) {
					console.error("Lỗi khi bắt đầu ghi âm:", e);
					alert("Không thể ghi âm. Kiểm tra quyền micro.");
				}
			},
	
			async stopRecording() {
				try {
					const [buffer, blob] = await this.recorder.stop().getMp3();
					this.audioBlob = blob;
					this.audioUrl = URL.createObjectURL(blob);
					this.isRecording = false;
	
					const file = new File([blob], "recorded-audio.mp3", { type: "audio/mp3" });
					this.recordedFile = file;
					return file;
				} catch (e) {
					console.error("Lỗi khi dừng ghi âm:", e);
					return null;
				}
			},
	
			async handleStop() {
				const file = await this.stopRecording();
				if (file) {
					this.$emit('update:isSaveFile', false)
					console.log("📁 File MP3 đã sẵn sàng:", file);
					// ✅ Emit để update modelValue
					this.$emit('update:file', file);
				}
			},
		},
	}
</script>