<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>Quản lý báo lỗi hệ thống</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select
								v-model="filterStatus"
								label="Trạng thái"
								:items="DSStatus"
								item-title="label"
								item-value="value"
								clearable
							/>
						</v-col>
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" @click="getDS">
								<v-icon start>mdi-reload</v-icon>Làm mới
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<GlobalDataTable
			:headers="headers"
			:items="DSFiltered"
			v-data-table-height="'calc(100dvh - 140px)'"
		>
			<template #item.Status="{ item }">
				<v-chip size="x-small" :color="statusColor(item.Status)" variant="tonal">
					{{ statusLabel(item.Status) }}
				</v-chip>
			</template>
			<template #item.CreateTime="{ item }">
				{{ formatDate(item.CreateTime) }}
			</template>
			<template #item.actions="{ item }">
				<v-btn icon size="small" variant="text" color="primary" @click="openDetail(item)">
					<v-icon>mdi-eye-outline</v-icon>
					<v-tooltip activator="parent" location="top">Xem chi tiết</v-tooltip>
				</v-btn>
				<v-btn icon size="small" variant="text" color="error" @click="deleteTicket(item)">
					<v-icon>mdi-delete-outline</v-icon>
					<v-tooltip activator="parent" location="top">Xóa</v-tooltip>
				</v-btn>
			</template>
			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-ticket-outline</v-icon>
					<p class="text-body-2">Không có dữ liệu</p>
				</div>
			</template>
		</GlobalDataTable>

		<uc-ticket-detail
			v-model="detailDialog.show"
			:ticket-id="detailDialog.ticketId"
			@updated="getDS"
		/>
	</Global>
</template>

<script>
export default {
	inject: ['snackbarRef', 'iframeRef'],
	data() {
		return {
			vueData,
			DS: [],
			filterStatus: null,
			DSStatus: [
				{ label: 'Mới', value: 'OPEN' },
				{ label: 'Đang xử lý', value: 'IN_PROGRESS' },
				{ label: 'Đã đóng', value: 'CLOSED' },
				{ label: 'Đã hủy', value: 'CANCELLED' },
			],
			headers: [
				{ title: 'STT', key: 'STT', width: 60 },
				{ title: 'Tiêu đề', key: 'Title' },
				{ title: 'Trạng thái', key: 'Status', width: 140 },
				{ title: 'Người xử lý', key: 'AssignedTo', width: 140 },
				{ title: 'Người báo', key: 'CreateUser', width: 130 },
				{ title: 'Thời gian', key: 'CreateTime', width: 160 },
				{ title: '', key: 'actions', width: 100, sortable: false },
			],
			detailDialog: {
				show: false,
				ticketId: null,
			},
		}
	},
	computed: {
		DSFiltered() {
			const list = this.filterStatus
				? this.DS.filter(t => t.Status === this.filterStatus)
				: this.DS
			return list.map((t, i) => ({ ...t, STT: i + 1 }))
		},
	},
	mounted() {
		this.getDS()
	},
	methods: {
		async getDS() {
			const res = await fetchPromise('lms/Ticket_GetList', {}, { cache: false })
			this.DS = res ?? []
		},
		openDetail(item) {
			this.detailDialog.ticketId = item.TicketID
			this.detailDialog.show = true
		},
		async deleteTicket(item) {
			const ok = await confirm({ title: 'Xác nhận xóa ticket này?' })
			if (!ok) return
			const res = await fetchPromise('lms/Ticket_Delete', { TicketID: item.TicketID }, { cache: false })
			if (res) {
				this.snackbarRef.show({ message: 'Đã xóa ticket', color: 'success' })
				this.getDS()
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
	},
}
</script>
