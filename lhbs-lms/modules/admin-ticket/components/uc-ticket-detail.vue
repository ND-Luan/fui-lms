<template>
	<uc-dialog
		v-model="isShow"
		:title="ticket ? ticket.Title : 'Chi tiết ticket'"
		:is-show-done-btn="false"
		:width="720"
	>
		<div v-if="isLoading" class="d-flex justify-center py-8">
			<v-progress-circular indeterminate color="primary" />
		</div>

		<template v-else-if="ticket">
			<!-- Info section -->
			<v-row dense class="mb-2">
				<v-col cols="12" sm="6">
					<p class="text-caption text-medium-emphasis">Trạng thái</p>
					<v-select
						v-model="editStatus"
						:items="DSStatus"
						item-title="label"
						item-value="value"
						hide-details
						density="compact"
						@update:model-value="updateStatus"
					/>
				</v-col>
				<v-col cols="12" sm="6">
					<p class="text-caption text-medium-emphasis">Gán cho (UserID)</p>
					<v-text-field
						v-model="editAssignedTo"
						hide-details
						density="compact"
						placeholder="Nhập UserID"
						append-inner-icon="mdi-account-check-outline"
						@click:append-inner="assignTicket"
					/>
				</v-col>
			</v-row>

			<v-divider class="my-3" />

			<!-- Description -->
			<p class="text-body-2 font-weight-medium mb-1">Mô tả</p>
			<p class="text-body-2 mb-3">{{ ticket.Description }}</p>

			<!-- Meta info -->
			<v-expansion-panels variant="accordion" class="mb-3">
				<v-expansion-panel title="Thông tin kỹ thuật">
					<v-expansion-panel-text>
						<div class="text-caption">
							<p><b>URL:</b> {{ ticket.Url }}</p>
							<p><b>Trình duyệt:</b> {{ ticket.Browser }}</p>
							<p><b>Hệ điều hành:</b> {{ ticket.Os }}</p>
							<p><b>Người báo:</b> {{ ticket.CreateUser }}</p>
							<p><b>Thời gian:</b> {{ formatDate(ticket.CreateTime) }}</p>
						</div>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>

			<!-- Attachments -->
			<div v-if="attachments.length" class="mb-3">
				<p class="text-body-2 font-weight-medium mb-1">Ảnh đính kèm</p>
				<div class="d-flex flex-wrap ga-1">
					<v-chip
						v-for="(att, i) in attachments"
						:key="i"
						size="small"
						color="primary"
						variant="tonal"
						style="cursor: pointer;"
						@click="previewImage(att.FileID)"
					>
						<v-icon start size="14">mdi-image-outline</v-icon>
						{{ att.FileName || ('Ảnh ' + (i + 1)) }}
					</v-chip>
				</div>
			</div>

			<v-divider class="my-3" />

			<!-- Comments timeline -->
			<p class="text-body-2 font-weight-medium mb-2">Phản hồi / Ghi chú</p>
			<div v-if="comments.length === 0" class="text-caption text-medium-emphasis mb-3">
				Chưa có phản hồi
			</div>
			<div
				v-for="(c, i) in comments"
				:key="i"
				class="mb-2 pa-2 rounded"
				:class="c.IsInternal ? 'bg-yellow-lighten-4' : 'bg-grey-lighten-4'"
			>
				<div class="d-flex align-center ga-1 mb-1">
					<v-chip v-if="c.IsInternal" size="x-small" color="warning" variant="tonal">Nội bộ</v-chip>
					<span class="text-caption text-medium-emphasis">{{ c.CreatedByName ?? c.CreateUser }} · {{ formatDate(c.CreatedAt ?? c.CreateTime) }}</span>
				</div>
				<p class="text-body-2">{{ c.Content }}</p>
				<div v-if="c._attachments?.length" class="d-flex flex-wrap ga-1 mt-1">
					<div v-for="(att, ai) in c._attachments" :key="ai"
						style="width:56px;height:56px;cursor:pointer;border-radius:6px;overflow:hidden;"
						@click="previewImage(att.FileID)">
						<v-img :src="imgUrl(att.FileID)" width="56" height="56" cover />
					</div>
				</div>
			</div>

			<!-- Add comment -->
			<v-divider class="my-3" />
			<p class="text-body-2 font-weight-medium mb-2">Thêm phản hồi</p>
			<v-textarea v-model="newComment" label="Nội dung" rows="2" hide-details class="mb-2" />
			<!-- Attachment -->
			<div class="d-flex align-center ga-2 flex-wrap mb-2">
				<v-btn variant="outlined" size="small" @click="$refs.commentFileInput.click()">
					<v-icon start>mdi-image-plus</v-icon>Chọn ảnh
				</v-btn>
			</div>
			<input ref="commentFileInput" type="file" accept="image/*" multiple style="display:none;"
				@change="handleCommentFileChange" />
			<div v-if="commentAttachments.length" class="d-flex flex-wrap ga-2 mb-2">
				<div v-for="(att, i) in commentAttachments" :key="i"
					style="position:relative;width:64px;height:64px;">
					<v-img :src="att.previewUrl" width="64" height="64" cover
						style="border-radius:6px;cursor:pointer;"
						@click="previewLocalImage(att.previewUrl)" />
					<v-btn icon size="x-small" variant="elevated" color="error"
						style="position:absolute;top:-6px;right:-6px;"
						@click.stop="removeCommentAttachment(i)">
						<v-icon size="12">mdi-close</v-icon>
					</v-btn>
				</div>
			</div>
			<div class="d-flex align-center ga-3">
				<v-checkbox v-model="isInternal" label="Ghi chú nội bộ (chỉ IT thấy)" hide-details density="compact" />
				<v-spacer />
				<v-btn color="primary" variant="elevated" size="small" :loading="isSendingComment" @click="sendComment">
					<v-icon start>mdi-send</v-icon>Gửi
				</v-btn>
			</div>
		</template>
	</uc-dialog>

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
</template>

<script>
export default {
	name: 'uc-ticket-detail',
	inject: ['snackbarRef'],
	props: {
		modelValue: { type: Boolean, required: true },
		ticketId: { type: Number, default: null },
		devUser: { type: Object, default: null },
	},
	emits: ['update:modelValue', 'updated'],
	data() {
		return {
			vueData,
			isShow: false,
			isLoading: false,
			ticket: null,
			attachments: [],
			comments: [],
			editStatus: null,
			editAssignedTo: '',
			newComment: '',
			isInternal: false,
			isSendingComment: false,
			commentAttachments: [],
			imagePreview: {
				show: false,
				url: '',
			},
			DSStatus: [
				{ label: 'Mới', value: 'OPEN' },
				{ label: 'Đang xử lý', value: 'IN_PROGRESS' },
				{ label: 'Đã đóng', value: 'CLOSED' },
				{ label: 'Đã hủy', value: 'CANCELLED' },
			],
		}
	},
	watch: {
		modelValue(v) { this.isShow = v },
		isShow(v) { this.$emit('update:modelValue', v) },
		ticketId(v) {
			if (v) this.loadDetail(v)
		},
	},
	methods: {
		async loadDetail(ticketId) {
			this.isLoading = true
			this.ticket = null
			this.attachments = []
			this.comments = []
			this.newComment = ''
			this.isInternal = false
			const res = await fetchPromise('lms/Ticket_GetDetail', { TicketID: ticketId, IsIT: true }, { cache: false })
			this.ticket = res?.[0]?.[0] ?? null
			this.attachments = res?.[1] ?? []
			const comments = res?.[2] ?? []
			const commentAtts = res?.[4] ?? []
			for (const c of comments) {
				c._attachments = commentAtts.filter(a => a.CommentID === c.CommentID)
			}
			this.comments = comments
			this.commentAttachments = []
			if (this.ticket) {
				this.editStatus = this.ticket.Status
				this.editAssignedTo = this.ticket.AssignedTo ?? this.devUser?.UserID ?? ''
			}
			this.isLoading = false
		},
		previewImage(fileId) {
			this.imagePreview.url = vueData.v_Set.urlReadFile + 'FileData/' + fileId
			this.imagePreview.show = true
		},
		async updateStatus(newStatus) {
			const res = await fetchPromise('lms/Ticket_UpdateStatus', {
				TicketID: this.ticket.TicketID,
				Status: newStatus,
			}, { cache: false })
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã cập nhật trạng thái', color: 'success' })
				this.ticket.Status = newStatus
				this.$emit('updated')
			}
		},
		async assignTicket() {
			if (!this.editAssignedTo?.trim() && this.devUser?.UserID) {
				this.editAssignedTo = this.devUser.UserID
			}
			if (!this.editAssignedTo?.trim()) return
			const res = await fetchPromise('lms/Ticket_Assign', {
				TicketID: this.ticket.TicketID,
				AssignedTo: this.editAssignedTo.trim(),
			}, { cache: false })
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã gán người xử lý', color: 'success' })
				this.ticket.AssignedTo = this.editAssignedTo.trim()
				this.editStatus = 'IN_PROGRESS'
				this.$emit('updated')
			}
		},
		async sendComment() {
			if (!this.newComment?.trim() && !this.commentAttachments.length) return
			this.isSendingComment = true
			await this.uploadCommentAttachments()
			const uploadedAtts = this.commentAttachments.filter(a => a.fileId)
			const attachmentJSON = uploadedAtts.length
				? JSON.stringify(uploadedAtts.map(a => ({ FileID: a.fileId, Annotation: null })))
				: null
			const res = await fetchPromise('lms/Ticket_AddComment', {
				TicketID: this.ticket.TicketID,
				Content: this.newComment.trim() || '',
				IsInternal: this.isInternal ? 1 : 0,
				AttachmentJSON: attachmentJSON,
			}, { cache: false })
			this.isSendingComment = false
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã gửi phản hồi', color: 'success' })
				const newAtts = this.commentAttachments.filter(a => a.fileId).map(a => ({ FileID: a.fileId }))
				this.comments.push({
					Content: this.newComment.trim(),
					IsInternal: this.isInternal ? 1 : 0,
					CreatedByName: this.devUser?.UserID ?? vueData.user.UserID,
					CreatedAt: new Date().toISOString(),
					_attachments: newAtts,
				})
				this.newComment = ''
				this.isInternal = false
				this.commentAttachments = []
			}
		},
		async handleCommentFileChange(e) {
			const files = Array.from(e.target.files)
			for (const file of files) {
				this.commentAttachments.push({ name: file.name, file, previewUrl: URL.createObjectURL(file) })
			}
			this.$refs.commentFileInput.value = ''
		},
		removeCommentAttachment(i) {
			const att = this.commentAttachments[i]
			if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl)
			this.commentAttachments.splice(i, 1)
		},
		async uploadCommentAttachments() {
			for (const att of this.commentAttachments) {
				if (att.fileId) continue
				const fileObj = att.file
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
		imgUrl(fileId) {
			return vueData.v_Set.urlReadFile + 'FileData/' + fileId
		},
		previewLocalImage(url) {
			this.imagePreview.url = url
			this.imagePreview.show = true
		},
		formatDate(dt) {
			if (!dt) return ''
			return new Date(dt).toLocaleString('vi-VN')
		},
	},
}
</script>
