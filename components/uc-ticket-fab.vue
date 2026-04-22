<template>
	<div v-if="vueData.user && vueData.user.UserID">
		<!-- FAB Button -->
		<v-btn icon color="error" size="small" :style="fabStyle"
			elevation="4" @mousedown="fabDragStart" @touchstart.prevent="fabDragStart" @click="fabClick">
			<v-icon>mdi-bug-outline</v-icon>
			<v-tooltip activator="parent" location="left">Báo lỗi</v-tooltip>
		</v-btn>

		<!-- Main Dialog -->
		<v-dialog v-model="isShow" width="640" :close-on-back="false">
			<v-card>
				<v-card-title class="d-flex align-center">
					<v-icon start color="error">mdi-bug-outline</v-icon>
					Báo lỗi hệ thống
					<v-spacer />
					<v-icon @click="isShow = false" color="grey">mdi-close</v-icon>
				</v-card-title>

				<v-tabs v-model="activeTab" color="primary">
					<v-tab value="create">Báo lỗi mới</v-tab>
					<v-tab value="history" @click="loadHistory">Lịch sử báo lỗi</v-tab>
				</v-tabs>

				<v-divider />

				<v-card-text style="max-height: 520px; overflow-y: auto; padding: 16px 24px;">
					<!-- Tab 1: Create -->
					<div v-if="activeTab === 'create'">
						<v-text-field v-model="form.Title" label="Tiêu đề lỗi *" :rules="[v => !!v || 'Bắt buộc']"
							hide-details="auto" class="mb-3" />
						<v-textarea v-model="form.Description" label="Mô tả chi tiết *"
							:rules="[v => !!v || 'Bắt buộc']" hide-details="auto" rows="4" class="mb-3" />

						<!-- Attachment upload -->
						<div class="mb-3">
							<p class="text-body-2 mb-1">Ảnh đính kèm *</p>
						<div class="d-flex align-center ga-2 flex-wrap">
					<v-btn variant="outlined" size="small" @click="$refs.fileInput.click()">
							<v-icon start>mdi-image-plus</v-icon>
							Chọn ảnh
						</v-btn>
						<v-btn variant="outlined" size="small" :loading="isCapturing" @click="captureScreenshot">
							<v-icon start>mdi-camera</v-icon>
							Chụp lại màn hình
						</v-btn>
						</div>
							<input ref="fileInput" type="file" accept="image/*" multiple style="display:none;"
								@change="handleFileChange" />

						<div v-if="attachments.length" class="d-flex flex-wrap ga-2 mt-3">
								<div v-for="(att, i) in attachments" :key="i"
									style="position: relative; width: 72px; height: 72px;">
									<v-img :src="att.previewUrl" width="72" height="72" cover
										style="border-radius: 6px; cursor: pointer;"
										@click="previewImage(att.previewUrl)" />
									<v-btn icon size="x-small" variant="elevated" color="info"
										style="position: absolute; bottom: -6px; left: -6px;"
										@click.stop="openAnnotate(i)">
										<v-icon size="12">mdi-pencil</v-icon>
									</v-btn>
									<v-btn icon size="x-small" variant="elevated" color="error"
										style="position: absolute; top: -6px; right: -6px;"
										@click.stop="removeAttachment(i)">
										<v-icon size="12">mdi-close</v-icon>
									</v-btn>
								</div>
							</div>
						</div>

						<!-- Auto-captured info -->
						<v-expansion-panels variant="accordion" class="mb-2">
							<v-expansion-panel title="Thông tin tự động thu thập">
								<v-expansion-panel-text>
									<div class="text-caption">
										<p><b>URL:</b> {{ form.Url }}</p>
										<p><b>Trình duyệt:</b> {{ form.Browser }}</p>
										<p><b>Hệ điều hành:</b> {{ form.Os }}</p>
									</div>
								</v-expansion-panel-text>
							</v-expansion-panel>
						</v-expansion-panels>
					</div>

					<!-- Tab 2: History -->
					<div v-if="activeTab === 'history'">
						<div v-if="isLoadingHistory" class="d-flex justify-center py-8">
							<v-progress-circular indeterminate color="primary" />
						</div>
						<div v-else-if="history.length === 0"
							class="d-flex flex-column align-center py-8 text-medium-emphasis">
							<v-icon size="40" class="mb-2 opacity-40">mdi-ticket-outline</v-icon>
							<p class="text-body-2">Chưa có lỗi nào được báo</p>
						</div>
						<v-list v-else lines="two">
							<v-list-item v-for="item in history" :key="item.TicketID"
								:subtitle="formatDate(item.CreateTime)" @click="openTicketDetail(item)"
								style="cursor: pointer;">
								<template #title>
									<span class="font-weight-medium">{{ item.Title }}</span>
								</template>
								<template #append>
									<v-chip size="x-small" :color="statusColor(item.Status)" variant="tonal">
										{{ statusLabel(item.Status) }}
									</v-chip>
								</template>
							</v-list-item>
						</v-list>
					</div>
				</v-card-text>

				<v-divider />

				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" @click="isShow = false">Đóng</v-btn>
					<v-btn v-if="activeTab === 'create'" color="primary" variant="elevated" :loading="isSubmitting"
						@click="submitTicket">
						<v-icon start>mdi-send</v-icon>
						Gửi báo lỗi
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Image preview dialog -->
		<v-dialog v-model="imagePreview.show" max-width="900" :close-on-back="false">
			<v-card>
				<v-card-title class="d-flex">
					<v-spacer />
					<v-icon @click="imagePreview.show = false" color="grey">mdi-close</v-icon>
				</v-card-title>
				<v-card-text class="pa-2">
					<v-img :src="imagePreview.url" max-height="75vh" contain />
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Ticket detail dialog (from history) -->
		<v-dialog v-model="detailDialog.show" width="600" :close-on-back="false">
			<v-card v-if="detailDialog.ticket">
				<v-card-title class="d-flex align-center">
					<span>Chi tiết: {{ detailDialog.ticket.Title }}</span>
					<v-spacer />
					<v-chip size="small" :color="statusColor(detailDialog.ticket.Status)" variant="tonal" class="mr-2">
						{{ statusLabel(detailDialog.ticket.Status) }}
					</v-chip>
					<v-icon @click="detailDialog.show = false" color="grey">mdi-close</v-icon>
				</v-card-title>

				<v-card-text style="max-height: 420px; overflow-y: auto; padding: 16px 24px;">
					<p class="text-body-2 mb-2">{{ detailDialog.ticket.Description }}</p>
					<p class="text-caption text-medium-emphasis mb-4">{{ formatDate(detailDialog.ticket.CreateTime) }}
					</p>

					<!-- Attachments -->
					<div v-if="detailDialog.attachments.length" class="mb-3">
						<p class="text-body-2 font-weight-medium mb-1">Ảnh đính kèm</p>
						<div class="d-flex flex-wrap ga-1">
							<v-chip v-for="(att, i) in detailDialog.attachments" :key="i" size="small" color="primary"
								variant="tonal" style="cursor: pointer;" @click="previewImage(att.FileID)">
								<v-icon start size="14">mdi-image-outline</v-icon>
								{{ att.FileName || ('Ảnh ' + (i + 1)) }}
							</v-chip>
						</div>
					</div>

					<v-divider class="mb-3" />
					<p class="text-body-2 font-weight-medium mb-2">Phản hồi</p>

					<div v-if="detailDialog.comments.length === 0" class="text-caption text-medium-emphasis mb-3">
						Chưa có phản hồi
					</div>
					<div v-for="(c, i) in detailDialog.comments" :key="i" class="mb-3 pa-2 rounded bg-grey-lighten-4">
						<p class="text-caption font-weight-medium">{{ c.CreateUser }} · {{ formatDate(c.CreateTime) }}
						</p>
						<p class="text-body-2">{{ c.Content }}</p>
						<div v-if="c._attachments?.length" class="d-flex flex-wrap ga-1 mt-1">
							<v-chip v-for="(att, ai) in c._attachments" :key="ai" size="x-small" color="primary"
								variant="tonal" style="cursor: pointer;" @click="previewImage(att.FileID)">
								<v-icon start size="12">mdi-image-outline</v-icon>Ảnh {{ ai + 1 }}
							</v-chip>
						</div>
					</div>

					<!-- Add comment -->
					<v-textarea v-model="detailDialog.newComment" label="Gửi phản hồi" rows="2" hide-details
						class="mt-2" />
				</v-card-text>

				<v-card-actions>
					
					<v-spacer />
					<v-btn variant="text" @click="detailDialog.show = false">Đóng</v-btn>
					<v-btn color="primary" variant="outlined" :loading="detailDialog.isSendingComment"
						@click="sendComment">
						Gửi phản hồi
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Annotation / Paint dialog -->
		<v-dialog v-model="annotateDialog.show" width="960" :close-on-back="false" persistent>
			<v-card>
				<v-card-title class="d-flex align-center pa-2 ga-2 flex-wrap">
					<v-btn-toggle v-model="annotateDialog.tool" mandatory density="compact" color="primary">
						<v-btn value="select" size="small"><v-icon size="16">mdi-cursor-move</v-icon><v-tooltip
								activator="parent">Chọn / kéo</v-tooltip></v-btn>
						<v-btn value="pen" size="small"><v-icon size="16">mdi-pencil</v-icon><v-tooltip
								activator="parent">Bút
								tự do</v-tooltip></v-btn>
						<v-btn value="rect" size="small"><v-icon size="16">mdi-rectangle-outline</v-icon><v-tooltip
								activator="parent">Hình chữ nhật</v-tooltip></v-btn>
						<v-btn value="circle" size="small"><v-icon size="16">mdi-circle-outline</v-icon><v-tooltip
								activator="parent">Hình tròn</v-tooltip></v-btn>
						<v-btn value="arrow" size="small"><v-icon size="16">mdi-arrow-top-right</v-icon><v-tooltip
								activator="parent">Mũi tên</v-tooltip></v-btn>
						<v-btn value="text" size="small"><v-icon size="16">mdi-format-text</v-icon><v-tooltip
								activator="parent">Văn bản</v-tooltip></v-btn>
					</v-btn-toggle>
					<input type="color" v-model="annotateDialog.color" title="Màu"
						style="width:30px;height:30px;border:none;border-radius:4px;cursor:pointer;padding:2px;" />
					<div v-if="annotateDialog.tool !== 'text' && annotateDialog.tool !== 'select'"
						class="d-flex align-center ga-1" style="min-width:120px;">
						<v-icon size="14">mdi-line-weight</v-icon>
						<v-slider v-model="annotateDialog.lineWidth" min="1" max="12" step="1" hide-details
							style="min-width:80px;" />
						<span class="text-caption">{{ annotateDialog.lineWidth }}</span>
					</div>
					<div v-if="annotateDialog.tool === 'text'" class="d-flex align-center ga-1"
						style="min-width:130px;">
						<v-icon size="14">mdi-format-size</v-icon>
						<v-slider v-model="annotateDialog.fontSize" min="10" max="72" step="2" hide-details
							style="min-width:80px;" />
						<span class="text-caption">{{ annotateDialog.fontSize }}px</span>
					</div>
					<v-btn icon size="small" variant="text" :disabled="!annotateDialog.shapes.length"
						@click="annotateUndo">
						<v-icon>mdi-undo</v-icon><v-tooltip activator="parent">Hoàn tác</v-tooltip>
					</v-btn>
					<v-btn icon size="small" variant="text" color="error" :disabled="annotateDialog.selectedIndex < 0"
						@click="annotateDeleteSelected">
						<v-icon>mdi-trash-can-outline</v-icon><v-tooltip activator="parent">Xóa đối tượng đã
							chọn</v-tooltip>
					</v-btn>
					<v-btn icon size="small" variant="text" :disabled="!annotateDialog.shapes.length"
						@click="annotateClear">
						<v-icon>mdi-delete-sweep-outline</v-icon><v-tooltip activator="parent">Xóa tất cả</v-tooltip>
					</v-btn>
					<v-spacer />
					<v-icon @click="annotateDialog.show = false" color="grey">mdi-close</v-icon>
				</v-card-title>
				<v-divider />
				<v-card-text class="pa-0" style="background:#e0e0e0;overflow:auto;">
					<canvas ref="annotateCanvas"
						:style="{ display: 'block', maxWidth: '100%', margin: 'auto', cursor: annotateDialog.tool === 'select' ? 'default' : 'crosshair' }"
						@mousedown="annotateStart" @mousemove="annotateMove" @mouseup="annotateEnd"
						@mouseleave="annotateEnd" @touchstart.prevent="annotateTouchStart"
						@touchmove.prevent="annotateTouchMove" @touchend.prevent="annotateEnd" />
				</v-card-text>
				<v-divider />
				<v-card-actions>
					<v-btn variant="text" @click="annotateDialog.show = false">Đóng</v-btn>
				<v-btn color="primary" variant="elevated" @click="annotateConfirm">
						<v-icon start>mdi-check</v-icon>Xác nhận & lưu
					</v-btn>
				</v-card-actions>
			</v-card>

			<!-- Text input sub-dialog -->
			<v-dialog v-model="annotateDialog.textInput.show" width="320" :close-on-back="false">
				<v-card>
					<v-card-title>Nhập văn bản</v-card-title>
					<v-card-text>
						<v-text-field v-model="annotateDialog.textInput.value" label="Nội dung" autofocus hide-details
							@keyup.enter="annotateTextConfirm" />
					</v-card-text>
					<v-card-actions>
						<v-btn color="primary" variant="elevated" @click="annotateTextConfirm">OK</v-btn>
						<v-btn variant="text" @click="annotateDialog.textInput.show = false">Hủy</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-dialog>
	</div>
</template>

<script>
export default {
	name: 'uc-ticket-fab',
	inject: ['snackbarRef'],
	data() {
		return {
			vueData,
			fab: { x: null, y: null, hasMoved: false },
			isShow: false,
			activeTab: 'create',
			isSubmitting: false,
			isLoadingHistory: false,
			form: {
				Title: '',
				Description: '',
				Url: '',
				Browser: '',
				Os: '',
			},
			isCapturing: false,
			attachments: [],  // [{ name, file|blob, previewUrl, fileId? }]
			history: [],
			imagePreview: {
				show: false,
				url: '',
			},
			detailDialog: {
				show: false,
				ticket: null,
				attachments: [],
				comments: [],
				newComment: '',
				isSendingComment: false,
			},
			annotateDialog: {
				show: false,
				attachmentIndex: -1,
				tool: 'pen',
				color: '#FF0000',
				lineWidth: 3,
				fontSize: 20,
				shapes: [],
				selectedIndex: -1,
				dragOffset: null,
				isDrawing: false,
				currentShape: null,
				imageEl: null,
				textInput: { show: false, x: 0, y: 0, value: '' },
			},
		}
	},
	computed: {
		fabStyle() {
			if (this.fab.x !== null && this.fab.y !== null) {
				return `position: fixed; left: ${this.fab.x}px; top: ${this.fab.y}px; z-index: 9999; touch-action: none; user-select: none;`
			}
			return 'position: fixed; bottom: 80px; right: 24px; z-index: 9999; touch-action: none; user-select: none;'
		},
	},
	mounted() {
		try {
			const saved = localStorage.getItem('uc-ticket-fab-pos')
			if (saved) {
				const pos = JSON.parse(saved)
				if (typeof pos.rx === 'number' && typeof pos.ry === 'number') {
					this.fab.x = Math.max(0, Math.min(window.innerWidth - 40, pos.rx * window.innerWidth))
					this.fab.y = Math.max(0, Math.min(window.innerHeight - 40, pos.ry * window.innerHeight))
				}
			}
		} catch { }
		if (!window.htmlToImage) {
			const s = document.createElement('script')
			s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
			document.head.appendChild(s)
		}
	},
	methods: {
		fabDragStart(e) {
			const isTouch = e.type === 'touchstart'
			const clientX = isTouch ? e.touches[0].clientX : e.clientX
			const clientY = isTouch ? e.touches[0].clientY : e.clientY
			const el = (e.currentTarget.$el ?? e.currentTarget)
			const rect = el.getBoundingClientRect()
			const startFabX = this.fab.x !== null ? this.fab.x : rect.left
			const startFabY = this.fab.y !== null ? this.fab.y : rect.top
			const offsetX = clientX - rect.left
			const offsetY = clientY - rect.top
			this.fab.hasMoved = false
			const onMove = (ev) => {
				if (ev.cancelable) ev.preventDefault()
				const cx = ev.type === 'touchmove' ? ev.touches[0].clientX : ev.clientX
				const cy = ev.type === 'touchmove' ? ev.touches[0].clientY : ev.clientY
				if (!this.fab.hasMoved && (Math.abs(cx - clientX) > 4 || Math.abs(cy - clientY) > 4)) {
					this.fab.hasMoved = true
					this.fab.x = startFabX
					this.fab.y = startFabY
				}
				if (this.fab.hasMoved) {
					this.fab.x = Math.max(0, Math.min(window.innerWidth - rect.width, cx - offsetX))
					this.fab.y = Math.max(0, Math.min(window.innerHeight - rect.height, cy - offsetY))
				}
			}
			const onEnd = () => {
				document.removeEventListener('mousemove', onMove)
				document.removeEventListener('mouseup', onEnd)
				document.removeEventListener('touchmove', onMove)
				document.removeEventListener('touchend', onEnd)
				if (this.fab.hasMoved && this.fab.x !== null) {
					try {
						localStorage.setItem('uc-ticket-fab-pos', JSON.stringify({
							rx: this.fab.x / window.innerWidth,
							ry: this.fab.y / window.innerHeight,
						}))
					} catch { }
				}
			}
			document.addEventListener('mousemove', onMove)
			document.addEventListener('mouseup', onEnd)
			document.addEventListener('touchmove', onMove, { passive: false })
			document.addEventListener('touchend', onEnd)
		},
		fabClick() {
			if (this.fab.hasMoved) return
			this.openDialog()
		},
		async openDialog() {
			await this.resetForm()
			this.activeTab = 'create'
			this.isShow = true
			// Capture sau khi dialog đã hiện — dùng setTimeout để nhường JS event loop
			setTimeout(() => { this.captureScreenshot() }, 300)
		},
		async captureScreenshot() {
			this.isCapturing = true
			try {
				if (!window.htmlToImage) {
					await new Promise((resolve, reject) => {
						const s = document.createElement('script')
						s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
						s.onload = resolve
						s.onerror = reject
						document.head.appendChild(s)
					})
				}
				const fullCanvas = await window.htmlToImage.toCanvas(document.body, { cacheBust: false, skipFonts: true })
				const dpr = window.devicePixelRatio || 1
				const vw = window.innerWidth
				const vh = window.innerHeight
				const sx = Math.round(window.scrollX * dpr)
				const sy = Math.round(window.scrollY * dpr)
				const sw = Math.round(vw * dpr)
				const sh = Math.round(vh * dpr)
				const clip = document.createElement('canvas')
				clip.width = sw
				clip.height = sh
				clip.getContext('2d').drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
				const blob = await new Promise(res => clip.toBlob(res, 'image/png'))
				if (blob) {
					const previewUrl = URL.createObjectURL(blob)
					this.attachments.push({ name: 'screenshot.png', blob, previewUrl, originalPreviewUrl: previewUrl })
				}
			} catch (err) {
				console.warn('Screenshot capture failed', err)
			} finally {
				this.isCapturing = false
			}
		},
		async getOsName() {
			if (navigator.userAgentData) {
				try {
					const d = await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion'])
					if (d.platform === 'Windows') {
						return parseFloat(d.platformVersion) >= 13 ? 'Windows 11' : 'Windows 10'
					}
					return d.platform
				} catch { }
			}
			const ua = navigator.userAgent
			if (/Windows NT 10\.0/.test(ua)) return 'Windows 10/11'
			if (/Windows/.test(ua)) return 'Windows'
			if (/Mac OS X/.test(ua)) return 'macOS'
			if (/Android/.test(ua)) return 'Android'
			if (/iPhone|iPad/.test(ua)) return 'iOS'
			if (/Linux/.test(ua)) return 'Linux'
			return navigator.platform
		},
		async resetForm() {
			this.form = {
				Title: '',
				Description: '',
				Url: window.location.href,
				Browser: await this.getBrowserName(),
				Os: await this.getOsName(),
			}
			this.attachments = []
		},
		async getBrowserName() {
			if (navigator.userAgentData) {
				try {
					const d = await navigator.userAgentData.getHighEntropyValues(['fullVersionList'])
					const list = d.fullVersionList ?? []
					const main = list.find(b => /Chrome|Edge|Opera|Brave/.test(b.brand) && !b.brand.includes('Not'))
					if (main) return `${main.brand} ${main.version}`
				} catch { }
			}
			const ua = navigator.userAgent
			if (/Edg\//.test(ua)) return 'Microsoft Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] ?? '')
			if (/OPR\//.test(ua)) return 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] ?? '')
			if (/Firefox\//.test(ua)) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '')
			if (/Chrome\//.test(ua)) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '')
			if (/Version\/.*Safari/.test(ua)) return 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] ?? '')
			return ua
		},
		async handleFileChange(e) {
			const files = Array.from(e.target.files)
			if (!files.length) return
			for (const file of files) {
				const previewUrl = URL.createObjectURL(file)
				this.attachments.push({ name: file.name, file, previewUrl, originalPreviewUrl: previewUrl })
			}
			this.$refs.fileInput.value = ''
		},
		removeAttachment(index) {
			const att = this.attachments[index]
			if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
			this.attachments.splice(index, 1)
		},
		async uploadPendingAttachments() {
			for (const att of this.attachments) {
				if (att.fileId) continue
				const fileObj = att.blob
					? new File([att.blob], att.name, { type: 'image/png' })
					: att.file
				if (!fileObj) continue
				try {
					const formData = new FormData()
					formData.append('file', fileObj)
					const res = await fetch('https://file.lhbs.vn/lms/upload/FileData', {
						method: 'POST',
						body: formData,
						headers: { Authorization: $awt },
					})
					const json = await res.json()
					att.fileId = json?.Files?.[0]?.FILE_ID ?? null
				} catch (err) {
					console.error('Upload error', err)
				}
			}
		},
		async submitTicket() {
			if (!this.form.Title?.trim() || !this.form.Description?.trim()) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng điền tiêu đề và mô tả', color: 'warning' })
				return
			}
			if (!this.attachments.length) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng đính kèm ít nhất 1 ảnh', color: 'warning' })
				return
			}
			this.isSubmitting = true
			await this.uploadPendingAttachments()
			const attachmentJSON = this.attachments.length
				? JSON.stringify(this.attachments.map(a => ({
					FileID: a.fileId,
					Annotation: a.annotationShapes?.length ? JSON.stringify(a.annotationShapes) : null,
				})))
				: null
			const res = await fetchPromise('lms/Ticket_Create', {
				Title: this.form.Title.trim(),
				Description: this.form.Description.trim(),
				Url: this.form.Url,
				Browser: this.form.Browser,
				Os: this.form.Os,
				AttachmentJSON: attachmentJSON,
			}, { cache: false })
			this.isSubmitting = false
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Báo lỗi đã được gửi thành công!', color: 'success' })
				this.isShow = false
				// Gửi push notification tới admin (fire-and-forget)
				window.fcm?.sendNotification({
					topic: window.fcm.ADMIN_TOPIC,
					title: 'Báo lỗi mới từ ' + (vueData.user?.HoTen ?? vueData.user?.UserID ?? 'người dùng'),
					body: this.form.Title,
					data: { url: this.form.Url },
				})
			}
		},
		async loadHistory() {
			this.isLoadingHistory = true
			this.history = await fetchPromise('lms/Ticket_GetList', {
				CreateUser: vueData.user.UserID,
				IsIT: 1,
			}, { cache: false })
			this.isLoadingHistory = false
		},
		async openTicketDetail(item) {
			const res = await fetchPromise('lms/Ticket_GetDetail', {
				TicketID: item.TicketID,
				IsIT: 0,
			}, { cache: false })
			const comments = res?.[2] ?? []
			const commentAtts = res?.[4] ?? []
			for (const c of comments) {
				c._attachments = commentAtts.filter(a => a.CommentID === c.CommentID)
			}
			this.detailDialog.ticket = res?.[0]?.[0] ?? item
			this.detailDialog.attachments = res?.[1] ?? []
			this.detailDialog.comments = comments
			this.detailDialog.newComment = ''
			this.detailDialog.show = true
		},
		async sendComment() {
			if (!this.detailDialog.newComment?.trim()) return
			this.detailDialog.isSendingComment = true
			const res = await fetchPromise('lms/Ticket_AddComment', {
				TicketID: this.detailDialog.ticket.TicketID,
				Content: this.detailDialog.newComment.trim(),
				IsInternal: 0,
			}, { cache: false })
			this.detailDialog.isSendingComment = false
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã gửi phản hồi', color: 'success' })
				this.detailDialog.comments.push({
					Content: this.detailDialog.newComment.trim(),
					CreateUser: vueData.user.UserID,
					CreateTime: new Date().toISOString(),
				})
				this.detailDialog.newComment = ''
			}
		},
		previewImage(arg) {
			if (!arg) return
			this.imagePreview.url = (arg.startsWith('blob:') || arg.startsWith('data:') || arg.startsWith('http'))
				? arg
				: vueData.v_Set.urlReadFile + 'FileData/' + arg
			this.imagePreview.show = true
		},
		statusColor(status) {
			const map = { OPEN: 'warning', IN_PROGRESS: 'info', CLOSED: 'success', CANCELLED: 'default' }
			return map[status] ?? 'default'
		},
		statusLabel(status) {
			const map = { OPEN: 'Mới', IN_PROGRESS: 'Đang xử lý', CLOSED: 'Đã đóng', CANCELLED: 'Đã hủy' }
			return map[status] ?? status
		},
		formatDate(dt) {
			if (!dt) return ''
			return new Date(dt).toLocaleString('vi-VN')
		},

		// ── Annotation / Paint ──────────────────────────────────────
		openAnnotate(index) {
			const att = this.attachments[index]
			const bgUrl = att?.originalPreviewUrl || att?.previewUrl
			if (!bgUrl) return
			this.annotateDialog = {
				show: true,
				attachmentIndex: index,
				tool: 'pen',
				color: '#FF0000',
				lineWidth: 3,
				fontSize: 20,
				shapes: att.annotationShapes ? JSON.parse(JSON.stringify(att.annotationShapes)) : [],
				selectedIndex: -1,
				dragOffset: null,
				isDrawing: false,
				currentShape: null,
				imageEl: null,
				textInput: { show: false, x: 0, y: 0, value: '' },
			}
			this.$nextTick(() => {
				const canvas = this.$refs.annotateCanvas
				const img = new Image()
				img.onload = () => {
					canvas.width = img.naturalWidth
					canvas.height = img.naturalHeight
					this.annotateDialog.imageEl = img
					this.annotateRedraw()
				}
				img.src = bgUrl
			})
		},
		annotateGetPos(e) {
			const canvas = this.$refs.annotateCanvas
			const rect = canvas.getBoundingClientRect()
			const scaleX = canvas.width / rect.width
			const scaleY = canvas.height / rect.height
			return {
				x: (e.clientX - rect.left) * scaleX,
				y: (e.clientY - rect.top) * scaleY,
			}
		},
		annotateStart(e) {
			const pos = this.annotateGetPos(e)
			const ad = this.annotateDialog
			if (ad.tool === 'select') {
				const idx = this.annotateHitTest(pos)
				ad.selectedIndex = idx
				if (idx >= 0) {
					ad.isDrawing = true
					ad.dragOffset = { startX: pos.x, startY: pos.y, dx: 0, dy: 0 }
				}
				this.annotateRedraw()
				return
			}
			if (ad.tool === 'text') {
				ad.textInput = { show: true, x: pos.x, y: pos.y, value: '' }
				return
			}
			ad.selectedIndex = -1
			ad.isDrawing = true
			ad.currentShape = {
				type: ad.tool,
				color: ad.color,
				lineWidth: ad.lineWidth,
				points: [pos],
				startX: pos.x, startY: pos.y,
				endX: pos.x, endY: pos.y,
			}
		},
		annotateMove(e) {
			const pos = this.annotateGetPos(e)
			const ad = this.annotateDialog
			if (!ad.isDrawing) return
			if (ad.tool === 'select' && ad.selectedIndex >= 0 && ad.dragOffset) {
				ad.dragOffset.dx = pos.x - ad.dragOffset.startX
				ad.dragOffset.dy = pos.y - ad.dragOffset.startY
				this.annotateRedraw()
				return
			}
			const shape = ad.currentShape
			if (!shape) return
			if (shape.type === 'pen') {
				shape.points.push(pos)
			} else {
				shape.endX = pos.x
				shape.endY = pos.y
			}
			this.annotateRedraw()
		},
		annotateEnd() {
			const ad = this.annotateDialog
			if (!ad.isDrawing) return
			ad.isDrawing = false
			if (ad.tool === 'select' && ad.selectedIndex >= 0 && ad.dragOffset) {
				const { dx, dy } = ad.dragOffset
				this.annotateTranslateShape(ad.shapes[ad.selectedIndex], dx, dy)
				ad.dragOffset = null
				this.annotateRedraw()
				return
			}
			if (ad.currentShape) {
				ad.shapes.push(ad.currentShape)
				ad.currentShape = null
			}
		},
		annotateTranslateShape(s, dx, dy) {
			if (s.type === 'pen') {
				s.points = s.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
			} else if (s.type === 'text') {
				s.x += dx; s.y += dy
			} else {
				s.startX += dx; s.startY += dy
				s.endX += dx; s.endY += dy
			}
		},
		annotateHitTest(pos) {
			const shapes = this.annotateDialog.shapes
			for (let i = shapes.length - 1; i >= 0; i--) {
				if (this.annotateShapeContains(shapes[i], pos)) return i
			}
			return -1
		},
		annotateShapeContains(s, pos) {
			const pad = Math.max((s.lineWidth ?? 4), 8)
			if (s.type === 'text') {
				const fs = s.fontSize || 18
				const w = s.text.length * fs * 0.6
				return pos.x >= s.x - pad && pos.x <= s.x + w + pad && pos.y >= s.y - fs - pad && pos.y <= s.y + pad
			}
			if (s.type === 'pen') {
				return s.points.some(p => Math.abs(p.x - pos.x) < pad && Math.abs(p.y - pos.y) < pad)
			}
			const minX = Math.min(s.startX, s.endX) - pad
			const maxX = Math.max(s.startX, s.endX) + pad
			const minY = Math.min(s.startY, s.endY) - pad
			const maxY = Math.max(s.startY, s.endY) + pad
			return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY
		},
		annotateRedraw() {
			const canvas = this.$refs.annotateCanvas
			if (!canvas) return
			const ctx = canvas.getContext('2d')
			const ad = this.annotateDialog
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			if (ad.imageEl) ctx.drawImage(ad.imageEl, 0, 0)
			const all = [...ad.shapes]
			if (ad.currentShape) all.push(ad.currentShape)
			all.forEach((s, i) => {
				const isSelected = i === ad.selectedIndex && ad.tool === 'select'
				let dx = 0, dy = 0
				if (isSelected && ad.dragOffset) { dx = ad.dragOffset.dx; dy = ad.dragOffset.dy }
				if (s.type === 'text') {
					const fs = s.fontSize || 18
					ctx.font = `bold ${fs}px sans-serif`
					ctx.fillStyle = s.color
					ctx.fillText(s.text, s.x + dx, s.y + dy)
					if (isSelected) {
						const w = ctx.measureText(s.text).width
						ctx.strokeStyle = '#1976D2'; ctx.lineWidth = 1.5
						ctx.setLineDash([4, 3])
						ctx.strokeRect(s.x + dx - 4, s.y + dy - fs - 2, w + 8, fs + 8)
						ctx.setLineDash([])
					}
					return
				}
				ctx.strokeStyle = s.color
				ctx.lineWidth = s.lineWidth
				ctx.lineCap = 'round'
				ctx.lineJoin = 'round'
				ctx.beginPath()
				if (s.type === 'pen') {
					if (s.points.length < 2) return
					ctx.moveTo(s.points[0].x + dx, s.points[0].y + dy)
					for (let j = 1; j < s.points.length; j++) ctx.lineTo(s.points[j].x + dx, s.points[j].y + dy)
					ctx.stroke()
				} else if (s.type === 'rect') {
					ctx.strokeRect(s.startX + dx, s.startY + dy, s.endX - s.startX, s.endY - s.startY)
				} else if (s.type === 'circle') {
					const rx = Math.abs(s.endX - s.startX) / 2
					const ry = Math.abs(s.endY - s.startY) / 2
					ctx.ellipse((s.startX + s.endX) / 2 + dx, (s.startY + s.endY) / 2 + dy, rx || 1, ry || 1, 0, 0, Math.PI * 2)
					ctx.stroke()
				} else if (s.type === 'arrow') {
					const angle = Math.atan2(s.endY - s.startY, s.endX - s.startX)
					const headLen = Math.max(12, s.lineWidth * 4)
					ctx.moveTo(s.startX + dx, s.startY + dy)
					ctx.lineTo(s.endX + dx, s.endY + dy)
					ctx.lineTo(s.endX + dx - headLen * Math.cos(angle - Math.PI / 6), s.endY + dy - headLen * Math.sin(angle - Math.PI / 6))
					ctx.moveTo(s.endX + dx, s.endY + dy)
					ctx.lineTo(s.endX + dx - headLen * Math.cos(angle + Math.PI / 6), s.endY + dy - headLen * Math.sin(angle + Math.PI / 6))
					ctx.stroke()
				}
				if (isSelected) {
					const pad = 6
					const pts = s.type === 'pen' ? s.points : [{ x: s.startX, y: s.startY }, { x: s.endX, y: s.endY }]
					const bx1 = Math.min(...pts.map(p => p.x)) - pad + dx
					const by1 = Math.min(...pts.map(p => p.y)) - pad + dy
					const bx2 = Math.max(...pts.map(p => p.x)) + pad + dx
					const by2 = Math.max(...pts.map(p => p.y)) + pad + dy
					ctx.strokeStyle = '#1976D2'; ctx.lineWidth = 1.5
					ctx.setLineDash([4, 3])
					ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1)
					ctx.setLineDash([])
				}
			})
		},
		annotateTextConfirm() {
			const ad = this.annotateDialog
			const ti = ad.textInput
			if (!ti.value.trim()) { ti.show = false; return }
			ad.shapes.push({
				type: 'text',
				text: ti.value.trim(),
				x: ti.x,
				y: ti.y + ad.fontSize,  // anchor at baseline
				color: ad.color,
				fontSize: ad.fontSize,
			})
			ti.show = false
			ti.value = ''
			this.annotateRedraw()
		},
		annotateDeleteSelected() {
			const ad = this.annotateDialog
			if (ad.selectedIndex < 0) return
			ad.shapes.splice(ad.selectedIndex, 1)
			ad.selectedIndex = -1
			this.annotateRedraw()
		},
		annotateUndo() {
			this.annotateDialog.shapes.pop()
			this.annotateDialog.selectedIndex = -1
			this.annotateRedraw()
		},
		annotateClear() {
			this.annotateDialog.shapes = []
			this.annotateDialog.selectedIndex = -1
			this.annotateRedraw()
		},
		annotateTouchStart(e) { this.annotateStart(e.touches[0]) },
		annotateTouchMove(e) { this.annotateMove(e.touches[0]) },
		annotateConfirm() {
			const idx = this.annotateDialog.attachmentIndex
			const canvas = this.$refs.annotateCanvas
			const att = this.attachments[idx]
			const originalUrl = att.originalPreviewUrl || att.previewUrl
			// Export canvas (ảnh gốc + annotations) thành blob mới để preview
			canvas.toBlob(blob => {
				// Chỉ revoke previewUrl nếu nó KHÁC originalPreviewUrl (tức là đã từng bake trước đó)
				if (att.previewUrl && att.previewUrl !== originalUrl) {
					URL.revokeObjectURL(att.previewUrl)
				}
				const newPreviewUrl = URL.createObjectURL(blob)
				this.attachments[idx] = {
					...att,
					blob,
					previewUrl: newPreviewUrl,
					originalPreviewUrl: originalUrl,
					annotationShapes: [...this.annotateDialog.shapes],
					fileId: null,
				}
				this.attachments = [...this.attachments]
			}, 'image/png')
			this.annotateDialog.show = false
		},
	},
}
</script>
