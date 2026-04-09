<template>
	<div>
		<!-- Alert banner: có ticket đang xử lý -->
		<v-alert v-for="ticket in DSActive" :key="ticket.TicketID" :color="alertColor(ticket.Status)" variant="tonal"
			density="compact" border="start" class="mb-2 cursor-pointer" @click="openDetail(ticket)">
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
						<p class="text-caption font-weight-bold text-medium-emphasis mb-2">Phản hồi từ hỗ trợ</p>
						<div v-for="c in detailDialog.comments" :key="c.CommentID"
							class="mb-2 pa-2 rounded bg-grey-lighten-4">
							<div class="d-flex align-center ga-1 mb-1">
								<v-icon size="16" color="primary">mdi-account-tie</v-icon>
								<span class="text-caption font-weight-medium">{{ c.CreatedByName ?? 'Hỗ trợ' }}</span>
								<v-spacer />
								<span class="text-caption text-medium-emphasis">{{ formatDate(c.CreatedAt) }}</span>
							</div>
							<p class="text-body-2 ma-0">{{ c.Content }}</p>
						</div>
					</template>
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
			detailDialog: {
				show: false,
				ticket: null,
				comments: [],
			},
		}
	},
	computed: {
		DSActive() {
			return this.DS.filter(t => t.Status !== 'OPEN' && t.Status !== 'CANCELLED')
		},
	},
	mounted() {
		this.loadTickets()
	},
	methods: {
		async loadTickets() {
			const res = await fetchPromise('lms/Ticket_GetList', {
				CreateUser: vueData.user.UserID,
			}, { cache: false })
			this.DS = res ?? []
		},
		async openDetail(item) {
			const res = await fetchPromise('lms/Ticket_GetDetail', {
				TicketID: item.TicketID,
				IsIT: 0,
			}, { cache: false })
			this.detailDialog.ticket = res?.[0]?.[0] ?? item
			this.detailDialog.comments = res?.[2] ?? []
			this.detailDialog.show = true
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
