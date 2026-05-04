<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>Quản lý báo lỗi hệ thống</v-card-title>
				<template v-if="devUser">
					<v-card-text>
						<v-row align="center">
							<v-col cols="12" sm="3">
								<v-select v-model="filterStatus" label="Trạng thái" :items="DSStatus" item-title="label"
								item-value="value" />
							</v-col>
							<v-col class="d-flex align-center ga-2 flex-wrap">
								<v-btn variant="outlined" color="primary" @click="getDS">
									<v-icon start>mdi-reload</v-icon>Làm mới
								</v-btn>
								<v-btn variant="tonal" color="success" @click="tokenDialog.show = true">
									<v-icon start>mdi-account-check</v-icon>
									{{ devUser.LastName }} {{ devUser.FirstName }} — Đang trực
								</v-btn>
							</v-col>
						</v-row>
					</v-card-text>
				</template>
			</v-card>
		</template>

		<v-divider />

		<!-- Gate: chưa đăng ký trực thì chỉ hiện màn hình nhập token -->
		<template v-if="!devUser">
			<div class="d-flex flex-column align-center justify-center" style="min-height: 60vh;">
				<v-card width="460" elevation="2">
					<v-card-title class="d-flex align-center">
						<v-icon start color="warning">mdi-account-key-outline</v-icon>
						Đăng ký trực xử lý báo lỗi
					</v-card-title>
					<v-card-text>
						<p class="text-body-2 mb-3 text-medium-emphasis">Dán token cá nhân vào đây để xác nhận bạn đang trực tiếp nhận báo lỗi.</p>
						<v-text-field v-model="tokenDialog.token" label="Token" hide-details autofocus
							:append-inner-icon="tokenDialog.showToken ? 'mdi-eye-off' : 'mdi-eye'"
							:type="tokenDialog.showToken ? 'text' : 'password'"
							@click:append-inner="tokenDialog.showToken = !tokenDialog.showToken"
							@keyup.enter="loginDev" />
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn color="primary" variant="elevated" :loading="tokenDialog.isLoading" @click="loginDev">
							<v-icon start>mdi-login</v-icon>Xác nhận
						</v-btn>
					</v-card-actions>
				</v-card>
			</div>
		</template>

		<!-- Nội dung chính — chỉ render sau khi đã đăng ký trực -->
		<template v-else>
			<GlobalDataTable :headers="headers" :items="DSFiltered" :vDataTableHeight="'calc(100dvh - 140px)'">
				<template #item.Status="{ item }">
					<v-chip size="x-small" :color="statusColor(item.Status)" variant="tonal">
						{{ statusLabel(item.Status) }}
					</v-chip>
				</template>
				<template #item.CreateTime="{ item }">
					{{ formatDate(item.CreateTime) }}
				</template>
				<template #item.actions="{ item }">
					<div class="d-flex align-center ga-1">
						<v-btn icon size="small" variant="text" color="primary" @click="openDetail(item)">
							<v-icon>mdi-pencil</v-icon>
							<v-tooltip activator="parent" location="top">Chỉnh sửa</v-tooltip>
						</v-btn>
						<v-btn icon size="small" variant="text" color="error" @click="deleteTicket(item)">
							<v-icon>mdi-delete-outline</v-icon>
							<v-tooltip activator="parent" location="top">Xóa</v-tooltip>
						</v-btn>
					</div>
				</template>
				<template #no-data>
					<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
						<v-icon size="48" class="mb-3 opacity-40">mdi-ticket-outline</v-icon>
						<p class="text-body-2">Không có dữ liệu</p>
					</div>
				</template>
			</GlobalDataTable>

			<uc-ticket-detail v-model="detailDialog.show" :ticket-id="detailDialog.ticketId" :dev-user="devUser" @updated="getDS" />

			<!-- Dialog đổi người trực -->
			<v-dialog v-model="tokenDialog.show" width="460" :close-on-back="false">
				<v-card>
					<v-card-title class="d-flex align-center">
						<v-icon start color="warning">mdi-account-key-outline</v-icon>
						Đổi người trực
						<v-spacer />
						<v-icon color="grey" @click="tokenDialog.show = false">mdi-close</v-icon>
					</v-card-title>
					<v-card-text>
						<div class="mb-3 pa-2 rounded bg-grey-lighten-4 d-flex align-center ga-2">
							<v-icon color="success">mdi-account-check</v-icon>
							<span class="text-body-2">Đang trực: <b>{{ devUser.LastName }} {{ devUser.FirstName }}</b> ({{ devUser.UserID }})</span>
							<v-spacer />
							<v-btn size="x-small" variant="text" color="error" @click="logoutDev">Hủy trực</v-btn>
						</div>
						<p class="text-body-2 mb-2 text-medium-emphasis">Nhập token mới để đổi người trực:</p>
						<v-text-field v-model="tokenDialog.token" label="Token" hide-details
							:append-inner-icon="tokenDialog.showToken ? 'mdi-eye-off' : 'mdi-eye'"
							:type="tokenDialog.showToken ? 'text' : 'password'"
							@click:append-inner="tokenDialog.showToken = !tokenDialog.showToken"
							@keyup.enter="loginDev" />
					</v-card-text>
					<v-card-actions>
						<v-spacer />
						<v-btn variant="text" @click="tokenDialog.show = false">Đóng</v-btn>
						<v-btn color="primary" variant="elevated" :loading="tokenDialog.isLoading" @click="loginDev">
							<v-icon start>mdi-login</v-icon>Đổi người trực
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</template>
	</Global>
</template>
<script>
export default {
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	data() {
		return {
			vueData,
			DS: [],
			filterStatus: null,
			DSStatus: [
				{ label: 'Tất cả', value: null },
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
			devUser: null,
			tokenDialog: {
				show: false,
				token: '',
				showToken: false,
				isLoading: false,
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
		const saved = localStorage.getItem('ticket_dev_user')
		if (saved) {
			this.devUser = JSON.parse(saved)
			this.getDS()
		}
	},
	methods: {
		async loginDev() {
			if (!this.tokenDialog.token.trim()) return
			this.tokenDialog.isLoading = true
			try {
				const res = await fetch('https://api.fui.vn/fp/UserInfo/fp', {
					headers: { Authorization: this.tokenDialog.token.trim() },
				})
				if (!res.ok) throw new Error('Token không hợp lệ')
				const user = await res.json()
				this.devUser = user
				localStorage.setItem('ticket_dev_user', JSON.stringify(user))
				this.tokenDialog.show = false
				this.tokenDialog.token = ''
				this.snackbarRef.value.showSnackbar({ message: `Đã đăng ký trực: ${user.LastName} ${user.FirstName}`, color: 'success' })
				this.getDS()
			} catch (err) {
				this.snackbarRef.value.showSnackbar({ message: err.message || 'Lỗi xác thực token', color: 'error' })
			}
			this.tokenDialog.isLoading = false
		},
		logoutDev() {
			this.devUser = null
			localStorage.removeItem('ticket_dev_user')
			this.tokenDialog.show = false
		},
		async getDS() {
			const res = await fetchPromise('lms/Ticket_GetList', { IsIT: true }, { cache: false })
			this.DS = res ?? []
		},
		openDetail(item) {
			this.detailDialog.ticketId = item.TicketID
			this.detailDialog.show = true
		},
		async deleteTicket(item) {
			const ok = await this.confirmRef.value.show({ title: 'Xác nhận xóa ticket này?' })
			if (!ok) return
			const res = await fetchPromise('lms/Ticket_Delete', { TicketID: item.TicketID }, { cache: false })
			if (res) {
				this.snackbarRef.value.showSnackbar({ message: 'Đã xóa ticket', color: 'success' })
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
