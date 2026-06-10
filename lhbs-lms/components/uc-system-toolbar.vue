<template>
	<div v-if="vueData.user && vueData.user.UserID">
		<!-- Floating Action Button (FAB) kiểu Vercel -->
		<div
			class="vercel-fab-container"
			:style="fabStyle"
			@mousedown="fabDragStart"
			@touchstart.prevent="fabDragStart"
		>
			<v-badge
				:content="unreadAlertsCount"
				:model-value="unreadAlertsCount > 0"
				color="error"
				overlap
				bordered
			>
				<v-btn
					icon
					class="vercel-fab-btn"
					:class="{ 'pulse-animation': unreadAlertsCount > 0 }"
					@click="fabClick"
					elevation="4"
				>
					<v-icon color="white">
						{{ unreadAlertsCount > 0 ? 'mdi-bell-ring-outline' : 'mdi-cube-outline' }}
					</v-icon>
					<v-tooltip activator="parent" location="left">LHBS Hub</v-tooltip>
				</v-btn>
			</v-badge>
		</div>

		<!-- Dialog Dashboard kiểu Vercel -->
		<v-dialog v-model="dialogOpen" max-width="480" scrollable class="vercel-dialog">
			<v-card class="vercel-card">
				<!-- Header -->
				<div class="vercel-header">
					<div class="d-flex align-center justify-space-between mb-2">
						<span class="vercel-badge">LHBS System Hub</span>
						<span class="vercel-esc-hint">Esc</span>
					</div>
					<h2 class="vercel-title">Bạn cần hỗ trợ gì?</h2>
				</div>

				<v-divider />

				<!-- Hàng Shortcuts Navigation -->
				<div class="vercel-shortcuts-row">
					<div
						v-for="tab in tabs"
						:key="tab.value"
						:class="['shortcut-item', { active: activeTab === tab.value }]"
						@click="switchTab(tab.value)"
					>
						<div class="shortcut-icon-circle">
							<v-badge
								v-if="tab.value === 'alerts' && unreadAlertsCount > 0"
								:content="unreadAlertsCount"
								color="error"
								dot
							>
								<v-icon size="20">{{ tab.icon }}</v-icon>
							</v-badge>
							<v-icon v-else size="20">{{ tab.icon }}</v-icon>
						</div>
						<span class="shortcut-label">{{ tab.label }}</span>
					</div>
				</div>

				<v-divider />

				<!-- Body / Nội dung từng Tab -->
				<v-card-text class="vercel-card-body pa-4">
					<!-- Tab 1: CẢNH BÁO (ALERTS) -->
					<div v-if="activeTab === 'alerts'">
						<div v-if="activeAlerts.length === 0" class="empty-state">
							<v-icon size="48" class="mb-3 text-medium-emphasis">mdi-bell-off-outline</v-icon>
							<p class="text-body-2 font-weight-medium">Không có thông báo mới nào</p>
						</div>
						<div v-else class="alerts-list">
							<v-card
								v-for="alert in activeAlerts"
								:key="alert.AlertID"
								variant="outlined"
								:color="alert.isRead ? 'grey-lighten-2' : getBorderColor(alert.TypeAlert)"
								class="mb-3 alert-item-card"
								:class="{ 'alert-read': alert.isRead }"
							>
								<v-card-text class="pa-3">
									<div class="d-flex align-center justify-space-between mb-2">
										<v-chip size="x-small" :color="alert.isRead ? 'grey' : getAlertColor(alert.TypeAlert)" variant="tonal" class="font-weight-medium">
											{{ getAlertTitle(alert.TypeAlert) }}
										</v-chip>
										<span class="text-caption text-medium-emphasis">{{ formatTimeAgo(alert.DateAlert) }}</span>
									</div>
									<div class="text-body-2 font-weight-medium text-high-emphasis pr-8 position-relative">
										{{ alert.ContentAlert }}
										<v-btn
											v-if="!alert.isRead"
											icon="mdi-check"
											variant="text"
											size="x-small"
											color="success"
											class="dismiss-btn"
											@click="dismissAlert(alert.AlertID)"
										>
											<v-icon size="16">mdi-check</v-icon>
											<v-tooltip activator="parent" location="top">Đã xem</v-tooltip>
										</v-btn>
									</div>
								</v-card-text>
							</v-card>
							<div class="d-flex justify-end mt-2" v-if="unreadAlertsCount > 0">
								<v-btn variant="text" size="small" color="primary" class="text-none" @click="dismissAllAlerts">
									Đã xem tất cả
								</v-btn>
							</div>
						</div>
					</div>

					<!-- Tab 2: BÁO LỖI (FEEDBACK) -->
					<div v-if="activeTab === 'feedback'">
						<v-text-field
							v-model="feedbackForm.Title"
							label="Tiêu đề lỗi *"
							:rules="[v => !!v || 'Bắt buộc']"
							density="comfortable"
							variant="outlined"
							class="mb-3"
							hide-details="auto"
						/>
						<v-textarea
							v-model="feedbackForm.Description"
							label="Mô tả chi tiết *"
							:rules="[v => !!v || 'Bắt buộc']"
							density="comfortable"
							variant="outlined"
							rows="3"
							class="mb-3"
							hide-details="auto"
						/>

						<!-- Ảnh đính kèm -->
						<div class="mb-4">
							<p class="text-caption font-weight-bold mb-1">Ảnh đính kèm *</p>
							<div class="d-flex align-center ga-2 flex-wrap">
								<v-btn variant="outlined" size="small" class="text-none" @click="$refs.fileInput.click()">
									<v-icon start size="16">mdi-image-plus</v-icon>
									Chọn ảnh
								</v-btn>
								<v-btn variant="outlined" size="small" class="text-none" :loading="isCapturing" @click="captureScreenshot">
									<v-icon start size="16">mdi-camera</v-icon>
									Chụp màn hình
								</v-btn>
							</div>
							<input ref="fileInput" type="file" accept="image/*" multiple style="display:none;" @change="handleFileChange" />

							<div v-if="attachments.length" class="d-flex flex-wrap ga-2 mt-3">
								<div v-for="(att, i) in attachments" :key="i" class="attachment-preview-box">
									<v-img :src="att.previewUrl" width="72" height="72" cover class="attachment-img" @click="previewImage(att.previewUrl)" />
									<v-btn icon size="x-small" variant="elevated" color="info" class="edit-att-btn" @click.stop="openAnnotate(i)">
										<v-icon size="12">mdi-pencil</v-icon>
									</v-btn>
									<v-btn icon size="x-small" variant="elevated" color="error" class="remove-att-btn" @click.stop="removeAttachment(i)">
										<v-icon size="12">mdi-close</v-icon>
									</v-btn>
								</div>
							</div>
						</div>

						<v-btn
							color="primary"
							variant="elevated"
							block
							class="text-none"
							:loading="isSubmitting"
							@click="submitTicket"
						>
							<v-icon start>mdi-send</v-icon>Gửi báo lỗi
						</v-btn>
					</div>

					<!-- Tab 3: LỊCH SỬ LỖI (INBOX) -->
					<div v-if="activeTab === 'inbox'">
						<div v-if="isLoadingHistory" class="d-flex justify-center py-8">
							<v-progress-circular indeterminate color="primary" />
						</div>
						<div v-else-if="history.length === 0" class="empty-state">
							<v-icon size="40" class="mb-2 text-medium-emphasis">mdi-ticket-outline</v-icon>
							<p class="text-body-2 font-weight-medium">Chưa có lỗi nào được báo</p>
						</div>
						<div v-else class="inbox-list">
							<v-card
								v-for="item in history"
								:key="item.TicketID"
								variant="outlined"
								class="mb-3 inbox-item-card"
								@click="openTicketDetail(item)"
							>
								<v-card-text class="pa-3 d-flex align-center justify-space-between">
									<div class="pr-2 flex-grow-1" style="min-width: 0;">
										<div class="text-body-2 font-weight-bold text-truncate">{{ item.Title }}</div>
										<span class="text-caption text-medium-emphasis">{{ formatDate(item.CreateTime) }}</span>
									</div>
									<v-chip size="x-small" :color="statusColor(item.Status)" variant="tonal">
										{{ statusLabel(item.Status) }}
									</v-chip>
								</v-card-text>
							</v-card>
						</div>
					</div>

					<!-- Tab 4: THÔNG TIN HỆ THỐNG (SYSTEM) -->
					<div v-if="activeTab === 'system'">
						<div class="system-info-list">
							<div class="sys-info-row">
								<span class="lbl">Tài khoản</span>
								<span class="val">{{ vueData.user?.HoTen || vueData.user?.UserID }}</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Mã người dùng</span>
								<span class="val">{{ vueData.user?.UserID }}</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Niên khóa</span>
								<span class="val">{{ vueData.NienKhoa }} (Học kì {{ vueData.NienKhoaItem?.HocKi || '?' }})</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Cấp học</span>
								<span class="val">{{ vueData.CapID === 1 ? 'Tiểu học (Cấp 1)' : vueData.CapID === 2 ? 'THCS (Cấp 2)' : vueData.CapID === 3 ? 'THPT (Cấp 3)' : 'Hệ thống' }}</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Hệ điều hành</span>
								<span class="val">{{ sysEnv.os }}</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Trình duyệt</span>
								<span class="val">{{ sysEnv.browser }}</span>
							</div>
							<div class="sys-info-row">
								<span class="lbl">Địa chỉ URL</span>
								<span class="val text-truncate" style="max-width: 220px;" :title="sysEnv.url">{{ sysEnv.url }}</span>
							</div>
						</div>
					</div>
				</v-card-text>

				<v-divider />
				<v-card-actions class="pa-3 justify-end">
					<v-btn variant="text" size="small" class="text-none" @click="dialogOpen = false">Đóng</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Chi tiết lỗi & Bình luận thảo luận -->
		<v-dialog v-model="detailDialog.show" width="560" scrollable class="vercel-detail-dialog">
			<v-card class="vercel-card" v-if="detailDialog.ticket">
				<v-card-title class="d-flex align-center justify-space-between pa-4">
					<div class="d-flex align-center ga-2" style="min-width: 0;">
						<v-icon color="error">mdi-bug-outline</v-icon>
						<span class="text-body-1 font-weight-bold text-truncate" :title="detailDialog.ticket.Title">{{ detailDialog.ticket.Title }}</span>
					</div>
					<div class="d-flex align-center ga-1">
						<v-chip size="x-small" :color="statusColor(detailDialog.ticket.Status)" variant="tonal">
							{{ statusLabel(detailDialog.ticket.Status) }}
						</v-chip>
						<v-btn icon="mdi-close" variant="text" size="small" @click="detailDialog.show = false" />
					</div>
				</v-card-title>
				
				<v-divider />

				<v-card-text class="pa-4" style="max-height: 400px; overflow-y: auto;">
					<p class="text-body-2 mb-2 font-weight-medium white-space-pre">{{ detailDialog.ticket.Description }}</p>
					<span class="text-caption text-medium-emphasis d-block mb-3">{{ formatDate(detailDialog.ticket.CreateTime) }}</span>

					<!-- Ảnh đính kèm của ticket -->
					<div v-if="detailDialog.attachments.length" class="mb-4">
						<p class="text-caption font-weight-bold mb-1">Ảnh đính kèm:</p>
						<div class="d-flex flex-wrap ga-2">
							<v-chip v-for="(att, i) in detailDialog.attachments" :key="i" size="small" color="primary" variant="tonal" class="cursor-pointer" @click="previewImage(att.FileID)">
								<v-icon start size="14">mdi-image-outline</v-icon>
								{{ att.FileName || ('Ảnh ' + (i + 1)) }}
							</v-chip>
						</div>
					</div>

					<v-divider class="mb-3" />
					
					<!-- Danh sách bình luận -->
					<p class="text-caption font-weight-bold text-medium-emphasis mb-2">Trao đổi phản hồi</p>
					<div v-if="detailDialog.comments.length === 0" class="text-caption text-medium-emphasis mb-3 text-center py-4">
						Chưa có phản hồi nào
					</div>
					<div v-else class="comments-list">
						<div v-for="(c, i) in detailDialog.comments" :key="i" :class="['comment-bubble mb-3 pa-2 rounded', c.IsIT ? 'comment-it' : 'comment-user']">
							<div class="d-flex align-center justify-space-between mb-1">
								<span class="text-caption font-weight-bold">{{ c.CreateUser }} ({{ c.IsIT ? 'Hỗ trợ' : 'Người gửi' }})</span>
								<span class="text-caption text-medium-emphasis">{{ formatDate(c.CreateTime || c.CreatedAt) }}</span>
							</div>
							<p class="text-body-2 ma-0 white-space-pre">{{ c.Content }}</p>
							
							<!-- Ảnh đính kèm của bình luận -->
							<div v-if="c._attachments && c._attachments.length" class="d-flex flex-wrap ga-1 mt-2">
								<v-chip v-for="(att, ai) in c._attachments" :key="ai" size="x-small" color="primary" variant="tonal" class="cursor-pointer" @click="previewImage(att.FileID)">
									<v-icon start size="12">mdi-image-outline</v-icon>Ảnh {{ ai + 1 }}
								</v-chip>
							</div>
						</div>
					</div>
				</v-card-text>

				<v-divider />

				<!-- Nhập phản hồi mới -->
				<div class="pa-3 bg-grey-lighten-5">
					<v-textarea
						v-model="detailDialog.newComment"
						label="Nhập phản hồi..."
						rows="2"
						density="compact"
						variant="outlined"
						hide-details
						class="mb-2 bg-white"
					/>
					<div class="d-flex justify-end">
						<v-btn color="primary" size="small" class="text-none" :loading="detailDialog.isSendingComment" :disabled="!detailDialog.newComment.trim()" @click="sendComment">
							<v-icon start size="14">mdi-send</v-icon>Gửi
						</v-btn>
					</div>
				</div>
			</v-card>
		</v-dialog>

		<!-- Dialog Xem ảnh Zoom -->
		<v-dialog v-model="imagePreview.show" max-width="900" class="vercel-image-preview-dialog">
			<v-card class="pa-1">
				<div class="d-flex justify-end pa-1">
					<v-btn icon="mdi-close" variant="text" size="small" @click="imagePreview.show = false" />
				</div>
				<v-card-text class="pa-2 d-flex justify-center align-center">
					<v-img :src="imagePreview.url" max-height="75vh" contain />
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Dialog Vẽ Chú thích Canvas (Annotation) -->
		<v-dialog v-model="annotateDialog.show" width="960" persistent class="vercel-annotate-dialog">
			<v-card>
				<v-card-title class="d-flex align-center pa-2 ga-2 flex-wrap">
					<v-btn-toggle v-model="annotateDialog.tool" mandatory density="compact" color="primary">
						<v-btn value="select" size="small">
							<v-icon size="16">mdi-cursor-move</v-icon>
							<v-tooltip activator="parent">Chọn / kéo</v-tooltip>
						</v-btn>
						<v-btn value="pen" size="small">
							<v-icon size="16">mdi-pencil</v-icon>
							<v-tooltip activator="parent">Bút tự do</v-tooltip>
						</v-btn>
						<v-btn value="rect" size="small">
							<v-icon size="16">mdi-rectangle-outline</v-icon>
							<v-tooltip activator="parent">Hình chữ nhật</v-tooltip>
						</v-btn>
						<v-btn value="circle" size="small">
							<v-icon size="16">mdi-circle-outline</v-icon>
							<v-tooltip activator="parent">Hình tròn</v-tooltip>
						</v-btn>
						<v-btn value="arrow" size="small">
							<v-icon size="16">mdi-arrow-top-right</v-icon>
							<v-tooltip activator="parent">Mũi tên</v-tooltip>
						</v-btn>
						<v-btn value="text" size="small">
							<v-icon size="16">mdi-format-text</v-icon>
							<v-tooltip activator="parent">Văn bản</v-tooltip>
						</v-btn>
					</v-btn-toggle>

					<input type="color" v-model="annotateDialog.color" title="Màu" class="color-picker-input" />

					<div v-if="annotateDialog.tool !== 'text' && annotateDialog.tool !== 'select'" class="d-flex align-center ga-1" style="min-width:120px;">
						<v-icon size="14">mdi-line-weight</v-icon>
						<v-slider v-model="annotateDialog.lineWidth" min="1" max="12" step="1" hide-details style="min-width:80px;" />
						<span class="text-caption">{{ annotateDialog.lineWidth }}</span>
					</div>

					<div v-if="annotateDialog.tool === 'text'" class="d-flex align-center ga-1" style="min-width:130px;">
						<v-icon size="14">mdi-format-size</v-icon>
						<v-slider v-model="annotateDialog.fontSize" min="10" max="72" step="2" hide-details style="min-width:80px;" />
						<span class="text-caption">{{ annotateDialog.fontSize }}px</span>
					</div>

					<v-btn icon size="small" variant="text" :disabled="!annotateDialog.shapes.length" @click="annotateUndo">
						<v-icon>mdi-undo</v-icon>
						<v-tooltip activator="parent">Hoàn tác</v-tooltip>
					</v-btn>

					<v-btn icon size="small" variant="text" color="error" :disabled="annotateDialog.selectedIndex < 0" @click="annotateDeleteSelected">
						<v-icon>mdi-trash-can-outline</v-icon>
						<v-tooltip activator="parent">Xóa đối tượng đã chọn</v-tooltip>
					</v-btn>

					<v-btn icon size="small" variant="text" :disabled="!annotateDialog.shapes.length" @click="annotateClear">
						<v-icon>mdi-delete-sweep-outline</v-icon>
						<v-tooltip activator="parent">Xóa tất cả</v-tooltip>
					</v-btn>

					<v-spacer />
					<v-icon @click="annotateDialog.show = false" color="grey" class="cursor-pointer">mdi-close</v-icon>
				</v-card-title>
				
				<v-divider />
				
				<v-card-text class="pa-0 canvas-container">
					<canvas
						ref="annotateCanvas"
						class="annotate-canvas"
						:style="{ cursor: annotateDialog.tool === 'select' ? 'default' : 'crosshair' }"
						@mousedown="annotateStart"
						@mousemove="annotateMove"
						@mouseup="annotateEnd"
						@mouseleave="annotateEnd"
						@touchstart.prevent="annotateTouchStart"
						@touchmove.prevent="annotateTouchMove"
						@touchend.prevent="annotateEnd"
					/>
				</v-card-text>
				
				<v-divider />
				
				<v-card-actions class="pa-3">
					<v-btn variant="text" class="text-none" @click="annotateDialog.show = false">Đóng</v-btn>
					<v-spacer />
					<v-btn color="primary" variant="elevated" class="text-none" @click="annotateConfirm">
						<v-icon start>mdi-check</v-icon>Xác nhận & lưu
					</v-btn>
				</v-card-actions>
			</v-card>

			<!-- Dialog nhập văn bản khi vẽ -->
			<v-dialog v-model="annotateDialog.textInput.show" width="320">
				<v-card class="pa-3">
					<v-card-title class="pa-0 mb-2 text-body-1 font-weight-bold">Nhập văn bản</v-card-title>
					<v-card-text class="pa-0">
						<v-text-field v-model="annotateDialog.textInput.value" label="Nội dung" autofocus hide-details @keyup.enter="annotateTextConfirm" variant="outlined" density="comfortable" />
					</v-card-text>
					<v-card-actions class="pa-0 mt-3 justify-end ga-2">
						<v-btn variant="text" size="small" class="text-none" @click="annotateDialog.textInput.show = false">Hủy</v-btn>
						<v-btn color="primary" size="small" class="text-none" @click="annotateTextConfirm">Xác nhận</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-dialog>

		<!-- Overlay thông báo đang chụp màn hình -->
		<v-overlay
			v-model="isCapturing"
			class="vercel-screenshot-overlay align-center justify-center"
			persistent
			z-index="10000"
		>
			<div class="d-flex flex-column align-center pa-6 rounded-lg bg-white" style="box-shadow: 0 4px 20px rgba(0,0,0,0.15); min-width: 220px;">
				<v-progress-circular indeterminate color="primary" size="40" class="mb-3" />
				<span class="text-body-2 font-weight-medium text-high-emphasis">Đang chụp màn hình...</span>
			</div>
		</v-overlay>
	</div>
</template>

<script>
export default {
	name: 'uc-system-toolbar',
	inject: ['snackbarRef'],
	data() {
		return {
			vueData,
			dialogOpen: false,
			activeTab: 'alerts',
			tabs: [
				{ value: 'alerts', label: 'Thông báo', icon: 'mdi-bell-outline' },
				{ value: 'feedback', label: 'Báo lỗi', icon: 'mdi-bug-outline' },
				{ value: 'inbox', label: 'Lịch sử', icon: 'mdi-inbox-outline' },
				{ value: 'system', label: 'Hệ thống', icon: 'mdi-cog-outline' }
			],

			// State Cảnh báo (Alerts)
			alerts: [],
			dismissedAlertIDs: [],

			// State Báo lỗi (Feedback)
			feedbackForm: {
				Title: '',
				Description: ''
			},
			isCapturing: false,
			isSubmitting: false,
			attachments: [], // [{ name, file|blob, previewUrl, fileId?, originalPreviewUrl? }]

			// State Lịch sử lỗi (Inbox/History)
			isLoadingHistory: false,
			history: [],
			detailDialog: {
				show: false,
				ticket: null,
				attachments: [],
				comments: [],
				newComment: '',
				isSendingComment: false
			},

			// State Môi trường hệ thống
			sysEnv: {
				os: '',
				browser: '',
				url: ''
			},

			// State Image Preview Zoom
			imagePreview: {
				show: false,
				url: ''
			},

			// State FAB drag & style
			fab: {
				x: null,
				y: null,
				hasMoved: false
			},

			// State Vẽ Chú thích Canvas (Annotation)
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
				textInput: { show: false, x: 0, y: 0, value: '' }
			}
		}
	},
	computed: {
		fabStyle() {
			if (this.fab.x !== null && this.fab.y !== null) {
				return `position: fixed; left: ${this.fab.x}px; top: ${this.fab.y}px; z-index: 9999; touch-action: none; user-select: none;`
			}
			return 'position: fixed; bottom: 80px; right: 24px; z-index: 9999; touch-action: none; user-select: none;'
		},
		activeAlerts() {
			const now = new Date()
			return this.alerts.map(alert => {
				const isDismissedLocal = this.dismissedAlertIDs.includes(alert.AlertID)
				const isRead = alert.IsRead === 1 || isDismissedLocal
				return {
					...alert,
					isRead
				}
			}).filter(alert => new Date(alert.DateAlert) <= now)
		},
		unreadAlertsCount() {
			return this.activeAlerts.filter(a => !a.isRead).length
		}
	},
	watch: {
		'vueData.NienKhoa'() {
			this.loadAlerts()
		},
		'vueData.CapID'() {
			this.loadAlerts()
		}
	},
	mounted() {
		// Load vị trí FAB đã lưu
		try {
			const saved = localStorage.getItem('uc-system-toolbar-pos')
			if (saved) {
				const pos = JSON.parse(saved)
				if (typeof pos.rx === 'number' && typeof pos.ry === 'number') {
					this.fab.x = Math.max(0, Math.min(window.innerWidth - 48, pos.rx * window.innerWidth))
					this.fab.y = Math.max(0, Math.min(window.innerHeight - 48, pos.ry * window.innerHeight))
				}
			}
		} catch (e) {}

		// Khởi tạo các dữ liệu môi trường và load alerts
		this.initSystemEnv()
		this.loadDismissedAlerts()
		this.loadAlerts()

		// Định nghĩa API gọi toàn cục để tương thích ngược
		window.openTicketDialog = (tab = 'create') => {
			this.activeTab = tab === 'create' ? 'feedback' : (tab === 'history' ? 'inbox' : 'alerts')
			if (this.activeTab === 'inbox') {
				this.loadHistory()
			}
			this.openHub()
		}

		// Nạp script html-to-image
		if (!window.htmlToImage) {
			const s = document.createElement('script')
			s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
			document.head.appendChild(s)
		}
	},
	methods: {
		// ── KHỞI TẠO MÔI TRƯỜNG & ALERTS ───────────────────────────
		async initSystemEnv() {
			this.sysEnv.url = window.location.href
			this.sysEnv.browser = await this.getBrowserName()
			this.sysEnv.os = await this.getOsName()
		},
		async getBrowserName() {
			if (navigator.userAgentData) {
				try {
					const d = await navigator.userAgentData.getHighEntropyValues(['fullVersionList'])
					const list = d.fullVersionList ?? []
					const main = list.find(b => /Chrome|Edge|Opera|Brave/.test(b.brand) && !b.brand.includes('Not'))
					if (main) return `${main.brand} ${main.version}`
				} catch (e) {}
			}
			const ua = navigator.userAgent
			if (/Edg\//.test(ua)) return 'Microsoft Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] ?? '')
			if (/OPR\//.test(ua)) return 'Opera ' + (ua.match(/OPR\/([\d.]+)/)?.[1] ?? '')
			if (/Firefox\//.test(ua)) return 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '')
			if (/Chrome\//.test(ua)) return 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '')
			if (/Version\/.*Safari/.test(ua)) return 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] ?? '')
			return ua
		},
		async getOsName() {
			if (navigator.userAgentData) {
				try {
					const d = await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion'])
					if (d.platform === 'Windows') {
						return parseFloat(d.platformVersion) >= 13 ? 'Windows 11' : 'Windows 10'
					}
					return d.platform
				} catch (e) {}
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
		loadDismissedAlerts() {
			// Không cần tải từ sessionStorage nữa vì trạng thái đã xem được quản lý dưới DB
			this.dismissedAlertIDs = []
		},
		async loadAlerts() {
			try {
				const res = await fetchPromise("lms/Alert_Get", {
					NienKhoa: vueData.NienKhoa || 0,
					CapID: parseInt(vueData.CapID) || 0,
					TypeAlert: '',
					UserID: vueData.user.UserID, // Gửi UserID để DB tự động lọc tin đã xem
					SYS_USERID: vueData.user.UserID,
					GroupID: vueData.user.GroupID || 0,
					SystemRight: Array.isArray(vueData.user.SystemRight)
						? vueData.user.SystemRight.join(',')
						: (vueData.user.SystemRight || '')
				}, { forceRefresh: true })
				this.alerts = res ?? []
			} catch (error) {
				console.error("Lỗi khi tải thông báo hệ thống:", error)
			}
		},
		async dismissAlert(id) {
			// Thêm vào local state để UI ẩn ngay lập tức
			this.dismissedAlertIDs.push(id)
			try {
				await fetchPromise("lms/Alert_MarkAsRead", {
					AlertID: id,
					UserID: vueData.user.UserID
				}, { cache: false, suppressError: true })
			} catch (e) {
				console.error("Lỗi khi gửi trạng thái đã xem lên DB:", e)
			}
		},
		async dismissAllAlerts() {
			const activeIds = this.activeAlerts.map(a => a.AlertID)
			// Thêm toàn bộ vào local state để UI ẩn ngay lập tức
			this.dismissedAlertIDs = [...this.dismissedAlertIDs, ...activeIds]
			try {
				await Promise.all(activeIds.map(id => 
					fetchPromise("lms/Alert_MarkAsRead", {
						AlertID: id,
						UserID: vueData.user.UserID
					}, { cache: false, suppressError: true })
				))
			} catch (e) {
				console.error("Lỗi khi gửi trạng thái đã xem toàn bộ lên DB:", e)
			}
		},
		getAlertColor(type) {
			if (!type) return 'blue'
			const t = type.toUpperCase()
			if (t === 'WARNING') return 'red-darken-1'
			if (t === 'REMIND') return 'orange-darken-1'
			if (t === 'SYSTEM') return 'purple-darken-1'
			return 'blue-darken-1'
		},
		getBorderColor(type) {
			if (!type) return 'grey-lighten-3'
			const t = type.toUpperCase()
			if (t === 'WARNING') return 'red-lighten-4'
			if (t === 'REMIND') return 'orange-lighten-4'
			if (t === 'SYSTEM') return 'purple-lighten-4'
			return 'blue-lighten-4'
		},
		getAlertTitle(type) {
			const map = {
				'ALERT': 'Thông báo',
				'WARNING': 'Cảnh báo',
				'REMIND': 'Nhắc nhở',
				'SYSTEM': 'Hệ thống'
			}
			return map[type.toUpperCase()] || type
		},
		formatTimeAgo(dateStr) {
			if (!dateStr) return ''
			const d = new Date(dateStr)
			if (isNaN(d.getTime())) return ''
			const diffMs = new Date() - d
			const diffMin = Math.floor(diffMs / 60000)
			if (diffMin < 1) return 'Vừa xong'
			if (diffMin < 60) return `${diffMin} phút trước`
			const diffHrs = Math.floor(diffMin / 60)
			if (diffHrs < 24) return `${diffHrs} giờ trước`
			const diffDays = Math.floor(diffHrs / 24)
			return `${diffDays} ngày trước`
		},

		// ── THAO TÁC KÉO THẢ FAB (DRAG) ───────────────────────────
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
						localStorage.setItem('uc-system-toolbar-pos', JSON.stringify({
							rx: this.fab.x / window.innerWidth,
							ry: this.fab.y / window.innerHeight,
						}))
					} catch (e) {}
				}
			}

			document.addEventListener('mousemove', onMove)
			document.addEventListener('mouseup', onEnd)
			document.addEventListener('touchmove', onMove, { passive: false })
			document.addEventListener('touchend', onEnd)
		},
		fabClick() {
			if (this.fab.hasMoved) return
			this.openHub()
		},
		openHub() {
			this.dialogOpen = true
			if (this.activeTab === 'inbox') {
				this.loadHistory()
			} else if (this.activeTab === 'feedback') {
				if (this.attachments.length === 0) {
					this.captureScreenshot()
				}
			}
		},
		switchTab(tabValue) {
			this.activeTab = tabValue
			if (tabValue === 'inbox') {
				this.loadHistory()
			} else if (tabValue === 'feedback') {
				if (this.attachments.length === 0) {
					this.captureScreenshot()
				}
			}
		},

		// ── BÁO LỖI (FEEDBACK FORM) ──────────────────────────────
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
				// Đóng tạm thời dialog chính để không vướng UI trong screenshot
				this.dialogOpen = false
				await new Promise(resolve => setTimeout(resolve, 300))

				const filter = (node) => {
					if (node.classList) {
						if (node.classList.contains('vercel-screenshot-overlay') || 
							node.classList.contains('vercel-fab-container') ||
							node.classList.contains('v-overlay-container')) {
							return false
						}
					}
					return true
				}

				const fullCanvas = await window.htmlToImage.toCanvas(document.body, { 
					cacheBust: false, 
					skipFonts: true,
					filter: filter
				})
				const dpr = window.devicePixelRatio || 1
				const sx = Math.round(window.scrollX * dpr)
				const sy = Math.round(window.scrollY * dpr)
				const sw = Math.round(window.innerWidth * dpr)
				const sh = Math.round(window.innerHeight * dpr)
				
				const clip = document.createElement('canvas')
				clip.width = sw
				clip.height = sh
				clip.getContext('2d').drawImage(fullCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
				
				const blob = await new Promise(res => clip.toBlob(res, 'image/png'))
				
				// Mở lại dialog sau khi chụp xong
				this.dialogOpen = true

				if (blob) {
					const previewUrl = URL.createObjectURL(blob)
					this.attachments.push({
						name: 'screenshot.png',
						blob,
						previewUrl,
						originalPreviewUrl: previewUrl
					})
				}
			} catch (err) {
				console.warn('Không thể chụp màn hình:', err)
				this.dialogOpen = true
			} finally {
				this.isCapturing = false
			}
		},
		handleFileChange(e) {
			const files = Array.from(e.target.files)
			if (!files.length) return
			for (const file of files) {
				const previewUrl = URL.createObjectURL(file)
				this.attachments.push({
					name: file.name,
					file,
					previewUrl,
					originalPreviewUrl: previewUrl
				})
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
					console.error('Lỗi upload ảnh:', err)
				}
			}
		},
		async submitTicket() {
			if (!this.feedbackForm.Title?.trim() || !this.feedbackForm.Description?.trim()) {
				this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập đầy đủ tiêu đề và mô tả', color: 'warning' })
				return
			}
			if (this.attachments.length === 0) {
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
				Title: this.feedbackForm.Title.trim(),
				Description: this.feedbackForm.Description.trim(),
				Url: this.sysEnv.url,
				Browser: this.sysEnv.browser,
				Os: this.sysEnv.os,
				AttachmentJSON: attachmentJSON,
			}, { cache: false })

			this.isSubmitting = false
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã gửi báo lỗi thành công!', color: 'success' })
				this.feedbackForm.Title = ''
				this.feedbackForm.Description = ''
				this.attachments = []
				this.activeTab = 'inbox'
				this.loadHistory()

				// Gửi push fcm báo cho admin
				window.fcm?.sendNotification({
					topic: window.fcm.ADMIN_TOPIC,
					title: 'Báo lỗi mới từ ' + (vueData.user?.HoTen ?? vueData.user?.UserID ?? 'người dùng'),
					body: this.feedbackForm.Title,
					data: { url: this.sysEnv.url },
				})
			}
		},

		// ── LỊCH SỬ BÁO LỖI & PHẢN HỒI (TICKETS & INBOX) ──────────────
		async loadHistory() {
			this.isLoadingHistory = true
			try {
				const res = await fetchPromise('lms/Ticket_GetList', {
					CreateUser: vueData.user.UserID,
					IsIT: 1
				}, { cache: false })
				this.history = res ?? []
			} catch (e) {
				console.error(e)
			} finally {
				this.isLoadingHistory = false
			}
		},
		async openTicketDetail(item) {
			try {
				const res = await fetchPromise('lms/Ticket_GetDetail', {
					TicketID: item.TicketID,
					IsIT: 0
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
			} catch (e) {
				console.error(e)
			}
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
				this.snackbarRef.value.showSnackbar({ message: 'Đã gửi phản hồi thành công', color: 'success' })
				this.detailDialog.comments.push({
					Content: this.detailDialog.newComment.trim(),
					CreateUser: vueData.user.UserID,
					CreateTime: new Date().toISOString()
				})
				this.detailDialog.newComment = ''
			}
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
		previewImage(arg) {
			if (!arg) return
			this.imagePreview.url = (arg.startsWith('blob:') || arg.startsWith('data:') || arg.startsWith('http'))
				? arg
				: vueData.v_Set.urlReadFile + 'FileData/' + arg
			this.imagePreview.show = true
		},

		// ── CANVAS ANNOTATION DRAWING (VẼ CHÚ THÍCH) ───────────────
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
				textInput: { show: false, x: 0, y: 0, value: '' }
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
				y: (e.clientY - rect.top) * scaleY
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
				startX: pos.x,
				startY: pos.y,
				endX: pos.x,
				endY: pos.y
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
				s.x += dx
				s.y += dy
			} else {
				s.startX += dx
				s.startY += dy
				s.endX += dx
				s.endY += dy
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
				if (isSelected && ad.dragOffset) {
					dx = ad.dragOffset.dx
					dy = ad.dragOffset.dy
				}
				if (s.type === 'text') {
					const fs = s.fontSize || 18
					ctx.font = `bold ${fs}px sans-serif`
					ctx.fillStyle = s.color
					ctx.fillText(s.text, s.x + dx, s.y + dy)
					if (isSelected) {
						const w = ctx.measureText(s.text).width
						ctx.strokeStyle = '#1976D2'
						ctx.lineWidth = 1.5
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
					for (let j = 1; j < s.points.length; j++) {
						ctx.lineTo(s.points[j].x + dx, s.points[j].y + dy)
					}
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
					ctx.strokeStyle = '#1976D2'
					ctx.lineWidth = 1.5
					ctx.setLineDash([4, 3])
					ctx.strokeRect(bx1, by1, bx2 - bx1, by2 - by1)
					ctx.setLineDash([])
				}
			})
		},
		annotateTextConfirm() {
			const ad = this.annotateDialog
			const ti = ad.textInput
			if (!ti.value.trim()) {
				ti.show = false
				return
			}
			ad.shapes.push({
				type: 'text',
				text: ti.value.trim(),
				x: ti.x,
				y: ti.y + ad.fontSize, // baseline anchor
				color: ad.color,
				fontSize: ad.fontSize
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
		annotateTouchStart(e) {
			this.annotateStart(e.touches[0])
		},
		annotateTouchMove(e) {
			this.annotateMove(e.touches[0])
		},
		annotateConfirm() {
			const idx = this.annotateDialog.attachmentIndex
			const canvas = this.$refs.annotateCanvas
			const att = this.attachments[idx]
			const originalUrl = att.originalPreviewUrl || att.previewUrl
			canvas.toBlob(blob => {
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
					fileId: null
				}
				this.attachments = [...this.attachments]
			}, 'image/png')
			this.annotateDialog.show = false
		}
	}
}
</script>


