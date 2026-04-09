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
					<span class="text-caption text-medium-emphasis">{{ c.CreateUser }} · {{ formatDate(c.CreateTime) }}</span>
				</div>
				<p class="text-body-2">{{ c.Content }}</p>
			</div>

			<!-- Add comment -->
			<v-divider class="my-3" />
			<p class="text-body-2 font-weight-medium mb-2">Thêm phản hồi</p>
			<v-textarea
				v-model="newComment"
				label="Nội dung"
				rows="2"
				hide-details
				class="mb-2"
			/>
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
			const res = await fetchPromise('lms/Ticket_GetDetail', { TicketID: ticketId, IsIT: 1 }, { cache: false })
			this.ticket = res?.[0]?.[0] ?? null
			this.attachments = res?.[1] ?? []
			this.comments = res?.[2] ?? []
			if (this.ticket) {
				this.editStatus = this.ticket.Status
				this.editAssignedTo = this.ticket.AssignedTo ?? ''
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
			if (!this.newComment?.trim()) return
			this.isSendingComment = true
			const res = await fetchPromise('lms/Ticket_AddComment', {
				TicketID: this.ticket.TicketID,
				Content: this.newComment.trim(),
				IsInternal: this.isInternal ? 1 : 0,
			}, { cache: false })
			this.isSendingComment = false
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã gửi phản hồi', color: 'success' })
				this.comments.push({
					Content: this.newComment.trim(),
					IsInternal: this.isInternal ? 1 : 0,
					CreateUser: vueData.user.UserID,
					CreateTime: new Date().toISOString(),
				})
				this.newComment = ''
				this.isInternal = false
			}
		},
		formatDate(dt) {
			if (!dt) return ''
			return new Date(dt).toLocaleString('vi-VN')
		},
	},
}
</script>
