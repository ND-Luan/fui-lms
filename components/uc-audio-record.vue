<template>
	<v-card elevation="4">
		<v-card-text class="pa-2">
			<!-- Cảnh báo không có mic -->
			<v-alert v-if="!hasMicrophone" type="error" variant="tonal" class="mb-3">
				<v-icon start>mdi-microphone-off</v-icon>
				{{ IsEngLish ? 'No microphone detected on this device' : 'Không phát hiện microphone trên thiết bị này'
				}}
			</v-alert>

			<!-- Cảnh báo chưa có quyền -->
			<v-alert v-else-if="permissionDenied" type="warning" variant="tonal" class="mb-3">
				<div class="d-flex flex-column ga-2">
					<div class="d-flex align-center justify-space-between">
						<div>
							{{ IsEngLish
							? 'Microphone permission denied.'
							: 'Quyền microphone bị từ chối.'
							}}
						</div>
						<v-btn v-if="!isHardDenied" color="warning" variant="elevated" size="small"
							@click="requestPermission" :loading="requestingPermission">
							<v-icon start size="small">mdi-shield-check</v-icon>
							{{ IsEngLish ? 'Grant Permission' : 'Cấp quyền' }}
						</v-btn>
					</div>
					<v-divider class="my-1"></v-divider>
					<div class="text-caption">
						{{ IsEngLish
						? 'If the popup does not appear, microphone is blocked. Please:'
						: 'Nếu popup không xuất hiện, microphone đã bị chặn. Vui lòng vào cài đặt ứng dụng để mở quyền'
						}}
					</div>
					<!-- <ol class="text-caption ml-4">
						<li>{{ IsEngLish ? 'Click the lock icon 🔒 in the address bar' : 'Nhấp vào biểu tượng ổ khóa 🔒
							trên thanh địa chỉ' }}</li>
						<li>{{ IsEngLish ? 'Find "Microphone" and select "Allow"' : 'Tìm "Microphone" và chọn "Cho
							phép"' }}</li>
						<li>{{ IsEngLish ? 'Reload the page' : 'Tải lại trang' }}</li>
					</ol> -->
				</div>
			</v-alert>

			<!-- Nút điều khiển ghi âm -->
			<div class="d-flex align-center ga-2" v-if="isShowBtn">
				<v-btn v-if="!readonly" color="primary" variant="tonal"
					:disabled="isRecording || !hasMicrophone || permissionDenied || checkingPermission"
					@click="startRecording" :loading="checkingPermission" size="small">
					<v-icon start>mdi-microphone</v-icon>
					{{ IsEngLish ? 'Record' : 'Ghi âm' }}
				</v-btn>

				<v-btn v-if="!readonly" color="red" variant="tonal" :disabled="!isRecording" @click="handleStop"
					size="small">
					<v-icon start>mdi-stop</v-icon>
					{{ IsEngLish ? 'Stop' : 'Dừng' }}
				</v-btn>

				<v-btn v-if="showSaveButton" color="success" variant="tonal" :disabled="isSaveFile"
					@click="$emit('handleSave')" size="small">
					<v-icon start>mdi-content-save</v-icon>
					{{ IsEngLish ? 'Save file' : 'Lưu file' }}
				</v-btn>

				<!-- Hiển thị trạng thái -->
				<div v-if="checkingPermission || isRecording || requestingPermission" class="d-flex align-center ga-2">
					<v-progress-circular :indeterminate="checkingPermission || requestingPermission"
						:color="isRecording ? 'red' : 'primary'" size="24"></v-progress-circular>
					<span class="text-caption">
						<span v-if="requestingPermission">
							{{ IsEngLish ? 'Requesting permission...' : 'Đang xin quyền...' }}
						</span>
						<span v-else-if="checkingPermission">
							{{ IsEngLish ? 'Checking microphone...' : 'Đang kiểm tra microphone...' }}
						</span>
						<span v-else-if="isRecording" class="text-red font-weight-bold">
							● {{ IsEngLish ? 'Recording...' : 'Đang ghi âm...' }}
						</span>
					</span>
				</div>
			</div>

			<!-- Audio preview -->
			<div v-if="audioUrl" class="mt-2">
				<p class="text-subtitle-2">🔊 {{ IsEngLish ? 'Review a record' : 'Nghe lại bản ghi' }}:</p>
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
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			const _src = this.src
			return {
				recorder: null,
				isRecording: false,
				audioUrl: _src,
				audioBlob: null,
				recordedFile: null,
				fileAudio: null,
				hasMicrophone: true,
				permissionDenied: false,
				checkingPermission: false,
				requestingPermission: false,
				browserType: this.detectBrowser(),
				isHardDenied: false, // 👈 bị block cứng từ browser
			};
		},
		async mounted() {
			await this.checkMicrophoneAvailability();
		},
		created() {
			this.recorder = new MicRecorder({ bitRate: 128 });
		},
		computed: {
			IsEngLish: function () {
				return this.$i18n.locale == 'en'
			},
			showSaveButton() {
				return (
					!this.readonly &&
					!this.isRecording &&
					!this.requestingPermission &&
					!this.checkingPermission &&
					!!this.file
				)
			}
		},
		watch: {
			src: function (v) { this.audioUrl = v }
		},
		methods: {
			detectBrowser() {
				const ua = navigator.userAgent.toLowerCase();
				if (ua.includes('edg/')) return 'edge';
				if (ua.includes('opr/') || ua.includes('opera')) return 'opera';
				if (ua.includes('chrome')) return 'chrome';
				if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
				if (ua.includes('firefox')) return 'firefox';
				return 'unknown';
			},
	
			async checkMicrophoneAvailability() {
				try {
					// Kiểm tra xem trình duyệt có hỗ trợ getUserMedia không
					if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
						this.hasMicrophone = false;
						return;
					}
	
					// Kiểm tra danh sách thiết bị
					const devices = await navigator.mediaDevices.enumerateDevices();
					const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
	
					if (audioInputDevices.length === 0) {
						this.hasMicrophone = false;
						return;
					}
	
					// Kiểm tra quyền truy cập
					await this.checkMicrophonePermission();
	
				} catch (error) {
					console.error("Lỗi khi kiểm tra microphone:", error);
					this.hasMicrophone = false;
				}
			},
	
			async checkMicrophonePermission() {
				try {
					if (navigator.permissions && navigator.permissions.query) {
						const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
	
						if (permissionStatus.state === 'denied') {
							this.permissionDenied = true;
							this.isHardDenied = true; // 👈 block cứng
							return false;
						}
	
						if (permissionStatus.state === 'granted') {
							this.permissionDenied = false;
							this.isHardDenied = false;
							return true;
						}
					}
	
					return true;
				} catch (error) {
					console.error(error);
					return true;
				}
			},
	
			async requestPermission(isRetry = false) {
				this.requestingPermission = true;
	
				console.log('🎤 Đang request permission...', { isRetry });
	
				try {
					// Yêu cầu quyền truy cập microphone - popup trình duyệt sẽ hiện luôn
					console.log('📞 Gọi getUserMedia...');
					const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
	
					console.log('✅ Đã có quyền microphone!');
	
					// Nếu thành công, cập nhật trạng thái
					this.permissionDenied = false;
	
					// Dừng stream ngay
					stream.getTracks().forEach(track => track.stop());
	
					// Tự động bắt đầu ghi âm sau khi có quyền
					this.requestingPermission = false;
					await this.startRecording();
	
				} catch (error) {
					console.error("❌ Lỗi khi xin quyền:", error.name, error.message);
					this.requestingPermission = false;
	
					// Xử lý lỗi - request lại permission
					if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
						console.log('🚫 Permission bị từ chối');
						// Set flag để hiện alert warning
						this.permissionDenied = true;
						this.isHardDenied = true; // 👈 xác nhận block cứng
						// KHÔNG tự động xin lại - để user tự nhấn nút "Cấp quyền"
						// Vì nếu browser đã block thì gọi lại cũng không hiện popup
					} else if (error.name === 'NotFoundError') {
						console.log('🎙️ Không tìm thấy microphone');
						this.hasMicrophone = false;
					}
				}
			},
	
			async startRecording() {
				this.checkingPermission = true;
	
				try {
					// Kiểm tra quyền một lần nữa trước khi bắt đầu
					const hasPermission = await this.testMicrophoneAccess();
	
					if (!hasPermission) {
						this.permissionDenied = true;
						this.checkingPermission = false;
						return;
					}
	
					await this.recorder.start();
					this.isRecording = true;
					this.audioUrl = null;
					this.recordedFile = null;
					this.permissionDenied = false;
	
				} catch (e) {
					console.error("Lỗi khi bắt đầu ghi âm:", e);
	
					// Xử lý các loại lỗi cụ thể
					if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
						this.permissionDenied = true;
						// Tự động gọi xin quyền lại thay vì alert
						this.checkingPermission = false;
						await this.requestPermission();
					} else if (e.name === 'NotFoundError') {
						this.hasMicrophone = false;
						alert(this.IsEngLish
							? "No microphone found. Please connect a microphone and try again."
							: "Không tìm thấy microphone. Vui lòng kết nối microphone và thử lại.");
					} else {
						alert(this.IsEngLish
							? "Cannot start recording. Please check your microphone."
							: "Không thể ghi âm. Vui lòng kiểm tra microphone.");
					}
				} finally {
					this.checkingPermission = false;
				}
			},
	
			async testMicrophoneAccess() {
				try {
					// Thử truy cập microphone để kiểm tra quyền
					const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
					// Dừng stream ngay sau khi kiểm tra
					stream.getTracks().forEach(track => track.stop());
					return true;
				} catch (error) {
					console.error("Không thể truy cập microphone:", error);
					return false;
				}
			},
	
			async stopRecording() {
				try {
					const [buffer, blob] = await this.recorder.stop().getMp3();
					this.audioBlob = blob;
					this.audioUrl = URL.createObjectURL(blob);
	
					const file = new File([blob], `recorded-audio_${Date.now()}.mp3`, { type: "audio/mp3" });
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
					this.isRecording = false;
					this.$emit('update:file', file);
				}
			},
		},
	}
</script>