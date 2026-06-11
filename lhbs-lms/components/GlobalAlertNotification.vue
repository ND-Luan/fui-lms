<template>
	<div>
		<!-- Floating Action Button với Badge đếm số thông báo -->
		<div class="global-alerts-fab" v-if="activeAlerts.length > 0 || isForceVisible">
			<v-badge
				:content="activeAlerts.length"
				:model-value="activeAlerts.length > 0"
				color="error"
				overlap
				bordered
			>
				<v-btn
					icon="mdi-bell-outline"
					color="#1e1e1e"
					theme="dark"
					elevation="4"
					size="large"
					@click="dialogOpen = true"
					class="pulse-animation"
				>
					<v-icon>mdi-bell-ring-outline</v-icon>
				</v-btn>
			</v-badge>
		</div>

		<!-- Dialog danh sách thông báo phong cách Vercel -->
		<v-dialog v-model="dialogOpen" max-width="480" scrollable>
			<v-card rounded="xl" class="pa-4 alert-dialog-card">
				<v-card-title class="d-flex align-center justify-space-between pb-2 border-bottom">
					<div class="d-flex align-center ga-2">
						<v-icon color="primary">mdi-bell-ring-outline</v-icon>
						<span class="font-weight-bold text-subtitle-1">Thông báo hệ thống</span>
					</div>
					<v-btn icon="mdi-close" variant="text" size="small" @click="dialogOpen = false" />
				</v-card-title>
				
				<v-card-text class="pa-0 mt-3" style="max-height: 400px; overflow-y: auto;">
					<div v-if="activeAlerts.length === 0" class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
						<v-icon size="48" class="mb-3 opacity-40" color="grey">mdi-bell-off-outline</v-icon>
						<p class="text-body-2 font-weight-medium">Không có thông báo mới nào</p>
					</div>
					<div v-else class="alerts-list">
						<v-card
							v-for="alert in activeAlerts"
							:key="alert.AlertID"
							variant="outlined"
							:color="getBorderColor(alert.TypeAlert)"
							class="mb-3 alert-item-card"
						>
							<v-card-text class="pa-3">
								<div class="d-flex align-center justify-space-between mb-2">
									<v-chip size="x-small" :color="getAlertColor(alert.TypeAlert)" variant="tonal" class="font-weight-medium">
										{{ getAlertTitle(alert.TypeAlert) }}
									</v-chip>
									<span class="text-caption text-medium-emphasis font-weight-regular">{{ formatTimeAgo(alert.DateAlert) }}</span>
								</div>
								<div class="text-body-2 font-weight-medium text-high-emphasis pr-8 position-relative alert-content-text">
									{{ alert.ContentAlert }}
									<v-btn
										icon="mdi-check"
										variant="text"
										size="x-small"
										color="success"
										class="dismiss-btn-inline"
										@click="dismissAlert(alert.AlertID)"
									>
										<v-icon size="16">mdi-check</v-icon>
										<v-tooltip activator="parent" location="top">Đã xem</v-tooltip>
									</v-btn>
								</div>
							</v-card-text>
						</v-card>
					</div>
				</v-card-text>
				
				<v-divider v-if="activeAlerts.length > 0" class="my-2" />
				
				<v-card-actions v-if="activeAlerts.length > 0" class="justify-end pt-1 pa-0">
					<v-btn variant="text" color="primary" class="text-none text-body-2 font-weight-bold" @click="dismissAll">
						Đã xem tất cả
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	export default {
		name: 'GlobalAlertNotification',
	data() {
		return {
			Alerts: [],
			dismissedIDs: [],
			dialogOpen: false,
			isForceVisible: false // Đặt là true nếu muốn icon luôn hiển thị ngay cả khi không có thông báo
		}
	},
	computed: {
		activeAlerts() {
			const now = new Date()
			return this.Alerts.filter(alert => {
				const isDismissed = this.dismissedIDs.includes(alert.AlertID)
				const isPublished = new Date(alert.DateAlert) <= now
				return !isDismissed && isPublished
			})
		}
	},
	mounted() {
		this.loadDismissed()
		this.onLoad()
	},
	methods: {
		async onLoad() {
			try {
				const res = await fetchPromise("lms/Alert_Get", {
					NienKhoa: vueData.NienKhoa || 0,
					CapID: parseInt(vueData.CapID) || 0,
					TypeAlert: ''
				})
				this.Alerts = res ?? []
			} catch (error) {
				console.error("Lỗi khi tải thông báo toàn cục:", error)
			}
		},
		getAlertIconType(type) {
			if (!type) return 'info'
			const t = type.toUpperCase()
			if (t === 'WARNING') return 'error'
			if (t === 'REMIND') return 'warning'
			if (t === 'SYSTEM') return 'info'
			return 'info'
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
		loadDismissed() {
			try {
				const stored = sessionStorage.getItem('dismissed_alerts')
				this.dismissedIDs = stored ? JSON.parse(stored) : []
			} catch (e) {
				this.dismissedIDs = []
			}
		},
		dismissAlert(id) {
			this.dismissedIDs.push(id)
			try {
				sessionStorage.setItem('dismissed_alerts', JSON.stringify(this.dismissedIDs))
			} catch (e) {
				console.error(e)
			}
		},
		dismissAll() {
			const activeIds = this.activeAlerts.map(a => a.AlertID)
			this.dismissedIDs = [...this.dismissedIDs, ...activeIds]
			try {
				sessionStorage.setItem('dismissed_alerts', JSON.stringify(this.dismissedIDs))
			} catch (e) {
				console.error(e)
			}
		}
	}
	}
</script>