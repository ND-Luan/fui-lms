<template>
	<div>
		<!-- Alert banner: có ticket đang xử lý -->
		<v-alert v-for="ticket in DSActive" :key="ticket.TicketID" :color="alertColor(ticket.Status)" variant="tonal"
			density="compact" border="start" class="mb-2 cursor-pointer" closable
			@click:close.stop="dismissTicket(ticket.TicketID)" @click="openDetail(ticket)">
			<template #prepend>
				<v-icon>{{ alertIcon(ticket.Status) }}</v-icon>
			</template>
			<template #title>
				<span class="text-body-2 font-weight-medium">{{ statusLabel(ticket.Status) }}: {{ ticket.Title }}</span>
			</template>
			<template #text>
				<span class="text-caption">{{ formatDate(ticket.CreateTime) }} — Nhấn để xem chi tiết</span>
			</template>
		</v-alert>

		<!-- Detail dialog -->
		<v-dialog v-model="detailDialog.show" max-width="640" scrollable>
			<v-card v-if="detailDialog.ticket">
				<v-card-title class="d-flex align-center ga-2">
					<v-icon :color="alertColor(detailDialog.ticket.Status)">{{ alertIcon(detailDialog.ticket.Status)
					}}</v-icon>
					<span class="text-body-1 font-weight-bold flex-grow-1" style="white-space: normal;">{{
						detailDialog.ticket.Title }}</span>
					<v-chip size="x-small" :color="alertColor(detailDialog.ticket.Status)" variant="tonal">
						{{ statusLabel(detailDialog.ticket.Status) }}
					</v-chip>
					<v-btn icon size="small" variant="text" @click="detailDialog.show = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</v-card-title>
				<v-divider />

				<v-card-text class="pa-4">
					<!-- Mô tả -->
					<p v-if="detailDialog.ticket.Description" class="text-body-2 mb-3">{{
						detailDialog.ticket.Description }}</p>

					<!-- Timeline trạng thái -->
					<v-timeline density="compact" side="end" class="mb-2">
						<v-timeline-item dot-color="primary" size="x-small">
							<span class="text-caption">Gửi lúc {{ formatDate(detailDialog.ticket.CreateTime) }}</span>
						</v-timeline-item>
						<v-timeline-item v-if="detailDialog.ticket.Status !== 'OPEN'"
							:dot-color="alertColor(detailDialog.ticket.Status)" size="x-small">
							<span class="text-caption font-weight-medium">{{ statusLabel(detailDialog.ticket.Status)
							}}</span>
						</v-timeline-item>
					</v-timeline>

					<!-- Comments -->
					<template v-if="detailDialog.comments.length">
						<v-divider class="mb-3" />
						<p class="text-caption font-weight-bold text-medium-emphasis mb-2">Lịch sử trao đổi</p>
						<div v-for="c in detailDialog.comments" :key="c.CommentID"
							:class="['mb-2 pa-2 rounded', c.IsIT ? 'bg-grey-lighten-4' : 'bg-blue-lighten-5']">
							<div class="d-flex align-center ga-1 mb-1">
								<v-icon size="16" :color="c.IsIT ? 'primary' : 'blue-darken-2'">{{ c.IsIT ?
									'mdi-account-tie' : 'mdi-account' }}</v-icon>
								<span class="text-caption font-weight-medium">{{ c.IsIT ? (c.CreatedByName ?? 'Hỗ trợ')
									: (c.CreatedByName || 'Bạn') }}</span>
								<v-spacer />
								<span class="text-caption text-medium-emphasis">{{ formatDate(c.CreatedAt) }}</span>
							</div>
							<p class="text-body-2 ma-0">{{ c.Content }}</p>
							<div v-if="c._attachments?.length" class="d-flex flex-wrap ga-1 mt-1">
								<v-chip v-for="(att, ai) in c._attachments" :key="ai" size="x-small" color="primary"
									variant="tonal" style="cursor:pointer;" @click="openImagePreview(att.FileID)">
									<v-icon start size="12">mdi-image-outline</v-icon>Ảnh {{ ai + 1 }}
								</v-chip>
							</div>
						</div>
					</template>

					<!-- Reply box -->
					<v-divider class="my-3" />
					<p class="text-caption font-weight-bold text-medium-emphasis mb-2">Phản hồi của bạn</p>
					<v-textarea v-model="detailDialog.newComment" rows="2" auto-grow hide-details
						placeholder="Nhập nội dung phản hồi..." variant="outlined" density="compact" class="mb-2" />

					<!-- Attachment buttons -->
					<div class="d-flex align-center ga-2 flex-wrap mb-2">
						<v-btn variant="outlined" size="small" @click="$refs.replyFileInput.click()">
							<v-icon start>mdi-image-plus</v-icon>Chọn ảnh
						</v-btn>
						<v-btn variant="outlined" size="small" :loading="isCapturing" @click="captureScreenshot">
							<v-icon start>mdi-camera</v-icon>Chụp màn hình
						</v-btn>
					</div>
					<input ref="replyFileInput" type="file" accept="image/*" multiple style="display:none;"
						@change="handleReplyFileChange" />

					<!-- Attachment thumbnails -->
					<div v-if="replyAttachments.length" class="d-flex flex-wrap ga-2 mb-2">
						<div v-for="(att, i) in replyAttachments" :key="i"
							style="position:relative;width:64px;height:64px;">
							<v-img :src="att.previewUrl" width="64" height="64" cover
								style="border-radius:6px;cursor:pointer;" @click="openImagePreview(att.previewUrl)" />
							<v-btn icon size="x-small" variant="elevated" color="error"
								style="position:absolute;top:-6px;right:-6px;" @click.stop="removeReplyAttachment(i)">
								<v-icon size="12">mdi-close</v-icon>
							</v-btn>
						</div>
					</div>

					<div class="d-flex justify-end">
						<v-btn color="primary" size="small" variant="tonal" :loading="detailDialog.isSending"
							:disabled="!detailDialog.newComment?.trim() && !replyAttachments.length"
							@click="sendComment">
							<v-icon start>mdi-send</v-icon>Gửi
						</v-btn>
					</div>
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Image preview -->
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
	</div>
</template>

<script>
export default {
	data() {
		return {
			DS: [],
			seenStatuses: {},
			detailDialog: {
				show: false,
				ticket: null,
				comments: [],
				newComment: '',
				isSending: false,
			},
			imagePreview: { show: false, url: '' },
			replyAttachments: [],
			isCapturing: false,
		}
	},
	computed: {
		DSActive() {
			return this.DS.filter(t => {
				if (t.Status === 'OPEN' || t.Status === 'CANCELLED') return false
				return t.UnreadUser > 0 || this.seenStatuses[t.TicketID] !== t.Status
			})
		},
	},
	mounted() {
		const key = `ticket_seenStatus_${vueData.user.UserID}`
		this.seenStatuses = JSON.parse(localStorage.getItem(key) || '{}')
		this.loadTickets()
		if (!window.htmlToImage) {
			const s = document.createElement('script')
			s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
			document.head.appendChild(s)
		}
	},
	methods: {
		async loadTickets() {
			const res = await fetchPromise('lms/Ticket_GetList', {
				CreateUser: vueData.user.UserID,
				IsIT: false,
			}, { cache: false })
			this.DS = res ?? []
		},
		async openDetail(item) {
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
			this.detailDialog.comments = comments
			this.detailDialog.newComment = ''
			this.replyAttachments = []
			this.detailDialog.show = true
			this._persistSeen(item.TicketID)
			ajaxCALL('lms/Ticket_MarkAsSeen', { TicketID: item.TicketID, IsIT: false }, () => {
				const t = this.DS.find(x => x.TicketID === item.TicketID)
				if (t) t.UnreadUser = 0
			})
		},
		dismissTicket(ticketID) {
			const t = this.DS.find(x => x.TicketID === ticketID)
			if (t) t.UnreadUser = 0
			this._persistSeen(ticketID)
			ajaxCALL('lms/Ticket_MarkAsSeen', { TicketID: ticketID, IsIT: false }, () => { })
		},
		_persistSeen(ticketID) {
			const t = this.DS.find(x => x.TicketID === ticketID)
			if (!t) return
			this.seenStatuses = { ...this.seenStatuses, [ticketID]: t.Status }
			localStorage.setItem(`ticket_seenStatus_${vueData.user.UserID}`, JSON.stringify(this.seenStatuses))
		},
		async sendComment() {
			if (!this.detailDialog.newComment?.trim() && !this.replyAttachments.length) return
			this.detailDialog.isSending = true
			await this.uploadReplyAttachments()
			const uploadedAtts = this.replyAttachments.filter(a => a.fileId)
			const attachmentJSON = uploadedAtts.length
				? JSON.stringify(uploadedAtts.map(a => ({ FileID: a.fileId, Annotation: null })))
				: null
			const res = await fetchPromise('lms/Ticket_AddComment', {
				TicketID: this.detailDialog.ticket.TicketID,
				Content: this.detailDialog.newComment.trim() || '',
				IsInternal: 0,
				AttachmentJSON: attachmentJSON,
			}, { cache: false })
			this.detailDialog.isSending = false
			if (res) {
				const newAtts = this.replyAttachments.filter(a => a.fileId).map(a => ({ FileID: a.fileId }))
				const fullName = [vueData.user.LastName, vueData.user.FirstName].filter(Boolean).join(' ') || vueData.user.UserID
				this.detailDialog.comments.push({
					Content: this.detailDialog.newComment.trim(),
					CreatedByName: fullName,
					IsIT: 0,
					CreatedAt: new Date().toISOString(),
					_attachments: newAtts,
				})
				this.detailDialog.newComment = ''
				this.replyAttachments = []
			}
		},
		async captureScreenshot() {
			this.isCapturing = true
			try {
				if (!window.htmlToImage) {
					await new Promise((resolve, reject) => {
						const s = document.createElement('script')
						s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js'
						s.onload = resolve; s.onerror = reject
						document.head.appendChild(s)
					})
				}
				const blob = await window.htmlToImage.toBlob(document.body, { cacheBust: false, skipFonts: true })
				if (blob) {
					const previewUrl = URL.createObjectURL(blob)
					this.replyAttachments.push({ name: 'screenshot.png', blob, previewUrl })
				}
			} catch (err) {
				console.warn('Screenshot capture failed', err)
			} finally {
				this.isCapturing = false
			}
		},
		async handleReplyFileChange(e) {
			const files = Array.from(e.target.files)
			for (const file of files) {
				this.replyAttachments.push({ name: file.name, file, previewUrl: URL.createObjectURL(file) })
			}
			this.$refs.replyFileInput.value = ''
		},
		removeReplyAttachment(i) {
			const att = this.replyAttachments[i]
			if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
			this.replyAttachments.splice(i, 1)
		},
		async uploadReplyAttachments() {
			for (const att of this.replyAttachments) {
				if (att.fileId) continue
				const fileObj = att.blob
					? new File([att.blob], att.name, { type: 'image/png' })
					: att.file
				if (!fileObj) continue
				try {
					const formData = new FormData()
					formData.append('file', fileObj)
					const res = await fetch('https://file.lhbs.vn/lms/upload/FileData', {
						method: 'POST', body: formData,
						headers: { Authorization: $awt },
					})
					const json = await res.json()
					att.fileId = json?.Files?.[0]?.FILE_ID ?? null
				} catch (err) {
					console.error('Upload error', err)
				}
			}
		},
		openImagePreview(arg) {
			if (!arg) return
			this.imagePreview.url = (arg.startsWith('blob:') || arg.startsWith('data:') || arg.startsWith('http'))
				? arg
				: vueData.v_Set?.urlReadFile + 'FileData/' + arg
			this.imagePreview.show = true
		},
		statusLabel(status) {
			const map = { OPEN: 'Mới', IN_PROGRESS: 'Đang xử lý', CLOSED: 'Đã giải quyết', CANCELLED: 'Đã hủy' }
			return map[status] ?? status
		},
		alertColor(status) {
			const map = { OPEN: 'info', IN_PROGRESS: 'warning', CLOSED: 'success', CANCELLED: 'default' }
			return map[status] ?? 'info'
		},
		alertIcon(status) {
			const map = { OPEN: 'mdi-ticket-outline', IN_PROGRESS: 'mdi-progress-wrench', CLOSED: 'mdi-check-circle-outline', CANCELLED: 'mdi-cancel' }
			return map[status] ?? 'mdi-ticket-outline'
		},
		formatDate(dt) {
			if (!dt) return ''
			return new Date(dt).toLocaleString('vi-VN')
		},
	},
}
</script>
