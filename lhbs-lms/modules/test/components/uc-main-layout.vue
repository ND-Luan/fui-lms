<template>
	<Global :isTest="true">
		<template #header>
			<v-card>
				<v-card-title>Kiểm thử: Background Upload • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn color="primary" prepend-icon="mdi-plus" @click="openUploadDialog">
								Thêm tài liệu (Mở Dialog Upload)
							</v-btn>
							<v-btn color="secondary" variant="outlined" prepend-icon="mdi-cloud-upload"
								@click="addQuickSimulatedUpload">
								Tải lên nhanh (Không mở Dialog)
							</v-btn>
							<v-btn color="error" variant="text" @click="clearAllTasks" :disabled="tasks.length === 0">
								Xóa tất cả Task
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<v-container class="py-6">
			<v-row>
				<!-- Stats & Overview -->
				<v-col cols="12" md="4">
					<v-card variant="outlined" class="mb-4">
						<v-card-item>
							<v-card-title class="text-subtitle-1">Trạng thái Hàng đợi</v-card-title>
						</v-card-item>
						<v-card-text>
							<div class="d-flex flex-column ga-2">
								<div class="d-flex justify-space-between">
									<span>Tổng số task:</span>
									<span class="font-weight-bold">{{ tasks.length }}</span>
								</div>
								<div class="d-flex justify-space-between text-primary">
									<span>Đang upload:</span>
									<span class="font-weight-bold">{{ activeCount }}</span>
								</div>
								<div class="d-flex justify-space-between text-success">
									<span>Thành công:</span>
									<span class="font-weight-bold">{{ successCount }}</span>
								</div>
								<div class="d-flex justify-space-between text-error">
									<span>Lỗi / Hủy:</span>
									<span class="font-weight-bold">{{ errorOrCancelledCount }}</span>
								</div>
							</div>
						</v-card-text>
					</v-card>

					<v-card variant="outlined">
						<v-card-item>
							<v-card-title class="text-subtitle-1">Cấu hình mô phỏng</v-card-title>
						</v-card-item>
						<v-card-text>
							<v-text-field v-model="simFileName" label="Tên file mô phỏng" density="compact" hide-details
								class="mb-3" />

							<v-select v-model="simSpeed" :items="speedOptions" label="Tốc độ mô phỏng" density="compact"
								hide-details class="mb-3" />

							<v-select v-model="simOutcome" :items="outcomeOptions" label="Kết quả dự kiến"
								density="compact" hide-details class="mb-4" />

							<v-btn block color="primary" variant="tonal" @click="startCustomSimulation">
								Kích hoạt mô phỏng
							</v-btn>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- Task logs -->
				<v-col cols="12" md="8">
					<v-card variant="outlined" style="min-height: 300px;">
						<v-card-item>
							<v-card-title class="text-subtitle-1 d-flex align-center justify-space-between">
								<span>Danh sách tiến trình hiện tại</span>
								<v-chip v-if="tasks.length > 0" size="small" color="primary">{{ headerText }}</v-chip>
							</v-card-title>
						</v-card-item>
						<v-card-text>
							<div v-if="tasks.length === 0"
								class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
								<v-icon size="48" class="mb-3 opacity-40">mdi-cloud-off-outline</v-icon>
								<p class="text-body-2">Chưa có tác vụ upload nào được tạo</p>
							</div>

							<v-list v-else class="pa-0">
								<v-list-item v-for="task in tasks" :key="task.id" class="border-b py-3 px-0">
									<template #prepend>
										<v-icon :color="getProgressColor(task.status)" class="mr-3">
											{{ getStatusIcon(task.status) }}
										</v-icon>
									</template>

									<v-list-item-title class="font-weight-medium">
										{{ task.fileName }}
									</v-list-item-title>

									<v-list-item-subtitle class="mt-1">
										<v-progress-linear :model-value="task.progress" height="8" rounded
											:color="getProgressColor(task.status)"
											:indeterminate="task.status === 'pending'" class="mb-1" />
										<div class="d-flex justify-space-between text-caption text-medium-emphasis">
											<span>Trạng thái: <strong
													:class="`text-${getProgressColor(task.status)}`">{{
													task.status.toUpperCase() }}</strong></span>
											<span>{{ task.progress }}%</span>
										</div>
									</v-list-item-subtitle>

									<template #append>
										<div class="d-flex ga-1">
											<v-btn v-if="task.status === 'uploading'" size="small" variant="outlined"
												color="error" @click="cancelTask(task.id)">
												Hủy
											</v-btn>
											<v-btn size="small" variant="text" color="grey"
												@click="removeTask(task.id)">
												Xóa
											</v-btn>
										</div>
									</template>
								</v-list-item>
							</v-list>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>

		<!-- Dialog Upload Demo -->
		<uc-dialog v-model="isOpen" title="Tải lên tài liệu giảng dạy" doneText="Bắt đầu Tải lên"
			@onSubmit="handleDialogSubmit">
			<v-card flat class="pa-2">
				<v-card-text class="pa-0">
					<p class="text-body-2 mb-4 text-medium-emphasis">
						Hãy chọn một file để tải lên. Sau khi nhấn nút <strong>Bắt đầu Tải lên</strong>, Dialog này sẽ
						đóng lại ngay lập tức và tiến trình upload sẽ tiếp tục chạy dưới nền.
					</p>

					<v-file-input v-model="selectedFile" label="Chọn file bài giảng (PDF, PPTX, MP4, PNG...)"
						prepend-icon="mdi-file-document-outline" show-size class="mb-4" />

					<v-checkbox v-model="useRealUpload"
						label="Sử dụng API thực tế (https://file.lhbs.vn/lms/upload/FileData)" class="mb-0"
						hide-details />

					<p class="text-caption text-warning mt-1 mb-4" v-if="useRealUpload">
						* Lưu ý: Tải lên thực tế yêu cầu quyền kết nối mạng và API máy chủ hoạt động bình thường.
					</p>
				</v-card-text>
			</v-card>
		</uc-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['iframeRef', 'confirmRef', 'snackbarRef'],
		data() {
			return {
				isOpen: false,
				selectedFile: null,
				useRealUpload: false,
				
				// Mock Config
				simFileName: 'Tài_liệu_ôn_tập_HK2.pdf',
				simSpeed: 10, // step % per tick
				simOutcome: 'success', // success, error
				
				speedOptions: [
					{ title: 'Nhanh (20% / giây)', value: 20 },
					{ title: 'Bình thường (10% / giây)', value: 10 },
					{ title: 'Chậm (2% / giây)', value: 2 },
				],
				outcomeOptions: [
					{ title: 'Thành công (Success)', value: 'success' },
					{ title: 'Lỗi upload (Error)', value: 'error' },
				],
			}
		},
		computed: {
			TitleCap() { return renderText(parseInt(vueData.CapID || 1)) },
			tasks() {
				return window.UploadManager ? window.UploadManager.tasks : []
			},
			activeCount() {
				return this.tasks.filter(t => t.status === 'uploading' || t.status === 'pending').length
			},
			successCount() {
				return this.tasks.filter(t => t.status === 'success').length
			},
			errorOrCancelledCount() {
				return this.tasks.filter(t => t.status === 'error' || t.status === 'cancelled').length
			},
			headerText() {
				if (this.activeCount > 0) {
					return `Đang xử lý ${this.activeCount} tác vụ...`
				}
				return 'Tất cả đã hoàn tất'
			}
		},
		methods: {
			openUploadDialog() {
				this.selectedFile = null
				this.isOpen = true
			},
			getProgressColor(status) {
				if (status === 'success') return 'success'
				if (status === 'error') return 'error'
				if (status === 'cancelled') return 'grey'
				return 'primary'
			},
			getStatusIcon(status) {
				if (status === 'success') return 'mdi-check-circle-outline'
				if (status === 'error') return 'mdi-alert-circle-outline'
				if (status === 'cancelled') return 'mdi-close-circle-outline'
				return 'mdi-loading mdi-spin'
			},
			cancelTask(taskId) {
				if (window.UploadManager) {
					window.UploadManager.cancelTask(taskId)
				}
			},
			removeTask(taskId) {
				if (window.UploadManager) {
					window.UploadManager.removeTask(taskId)
				}
			},
			clearAllTasks() {
				if (window.UploadManager) {
					const ids = [...this.tasks.map(t => t.id)]
					ids.forEach(id => window.UploadManager.removeTask(id))
					this.snackbarRef.value?.showSnackbar({ message: 'Đã dọn dẹp hàng đợi upload', color: 'success' })
				}
			},
			addQuickSimulatedUpload() {
				this.createMockTask('File_Nhanh_' + Math.floor(Math.random() * 1000) + '.mp4', 15, 'success')
			},
			startCustomSimulation() {
				this.createMockTask(this.simFileName || 'unnamed.file', this.simSpeed, this.simOutcome)
			},
			createMockTask(fileName, speed, outcome) {
				if (!window.UploadManager) {
					this.snackbarRef.value?.showSnackbar({ message: 'UploadManager chưa được khởi tạo toàn cục!', color: 'error' })
					return
				}

				const taskId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
				
				let currentProgress = 0
				let intervalId = null

				const mockTask = {
					id: taskId,
					fileName: fileName,
					fileSize: 1024 * 1024 * (Math.random() * 100 + 5), // 5MB - 105MB
					progress: 0,
					status: 'uploading',
					xhr: {
						abort: () => {
							if (intervalId) {
								clearInterval(intervalId)
								intervalId = null
							}
							mockTask.status = 'cancelled'
							this.snackbarRef.value?.showSnackbar({
								message: `Đã hủy tác vụ: ${fileName}`,
								color: 'warning'
							})
						}
					}
				}

				// Push to UploadManager's reactive task array directly
				window.UploadManager.tasks.push(mockTask)

				this.snackbarRef.value?.showSnackbar({
					message: `Bắt đầu tải lên: ${fileName} (Mô phỏng)`,
					color: 'info'
				})

				intervalId = setInterval(() => {
					if (mockTask.status === 'cancelled') {
						clearInterval(intervalId)
						return
					}

					currentProgress += speed
					if (currentProgress >= 100) {
						currentProgress = 100
						clearInterval(intervalId)
						
						if (outcome === 'success') {
							mockTask.status = 'success'
							mockTask.progress = 100
							this.snackbarRef.value?.showSnackbar({
								message: `Tải lên thành công: ${fileName}`,
								color: 'success'
							})
						} else {
							mockTask.status = 'error'
							this.snackbarRef.value?.showSnackbar({
								message: `Lỗi tải lên file: ${fileName}`,
								color: 'error'
							})
						}
					} else {
						mockTask.progress = currentProgress
					}
				}, 1000)
			},
			async handleDialogSubmit() {
				if (!this.selectedFile) {
					this.snackbarRef.value?.showSnackbar({ message: 'Vui lòng chọn một file!', color: 'warning' })
					return
				}

				const file = this.selectedFile
				
				if (this.useRealUpload) {
					// Real upload using actual UploadManager
					if (!window.UploadManager) {
						this.snackbarRef.value?.showSnackbar({ message: 'UploadManager không hoạt động!', color: 'error' })
						return
					}

					window.UploadManager.addUploadTask({
						file: file,
						uploadUrl: 'https://file.lhbs.vn/lms/upload/FileData',
						headers: {
							Authorization: $awt
						},
						bodyBuilder: (f) => {
							const formData = new FormData()
							formData.append('File', f)
							return formData
						},
						onComplete: (res) => {
							this.snackbarRef.value?.showSnackbar({
								message: `Tải lên thực tế thành công: ${file.name}`,
								color: 'success'
							})
						},
						onError: () => {
							this.snackbarRef.value?.showSnackbar({
								message: `Tải lên thực tế thất bại: ${file.name}`,
								color: 'error'
							})
						}
					})
				} else {
					// Simulated upload
					this.createMockTask(file.name, 10, 'success')
				}

				// Close the dialog immediately as required by the non-blocking pattern
				this.isOpen = false
				this.snackbarRef.value?.showSnackbar({
					message: 'Đang bắt đầu tải lên dưới nền. Bạn có thể tiếp tục làm việc!',
					color: 'success'
				})
			}
		}
	}
</script>