<template>
	<v-container fluid class="pa-4">
		<!-- Header -->
		<v-row align="center" class="mb-4">
			<v-col cols="12" md="6">
				<div class="d-flex align-center gap-2">
					<v-icon color="primary" size="28">mdi-monitor-eye</v-icon>
					<div>
						<div class="text-h6 font-weight-bold text-primary">Log Xem Thời khóa biểu</div>
						<div class="text-caption text-medium-emphasis">Thống kê lượt xem theo thiết bị</div>
					</div>
				</div>
			</v-col>
			<v-col cols="12" md="6" class="d-flex justify-end align-center gap-3 flex-wrap">
				<!-- ✅ Thêm @update:modelValue="resetAndLoad" -->
				<v-btn-toggle v-model="filterType" @update:modelValue="resetAndLoad" mandatory density="compact"
					color="primary" variant="outlined" rounded="lg">
					<v-btn value="all" size="small">
						<v-icon start size="16">mdi-all-inclusive</v-icon>Tất cả
					</v-btn>
					<v-btn value="0" size="small">
						<v-icon start size="16">mdi-cellphone</v-icon>Mobile
					</v-btn>
					<v-btn value="1" size="small">
						<v-icon start size="16">mdi-monitor</v-icon>Desktop
					</v-btn>
				</v-btn-toggle>

				<v-btn icon variant="tonal" color="primary" size="small" :loading="loading" @click="fetchData">
					<v-icon>mdi-refresh</v-icon>
					<v-tooltip activator="parent" location="bottom">Tải lại</v-tooltip>
				</v-btn>
			</v-col>
		</v-row>

		<!-- Summary Cards — giữ nguyên -->
		<v-row class="mb-4">
			<v-col cols="6" sm="3">
				<v-card rounded="lg" variant="tonal" color="primary" flat>
					<v-card-text class="pa-3">
						<div class="text-caption text-medium-emphasis mb-1">Tổng lượt xem</div>
						<div class="text-h5 font-weight-bold text-primary">{{ totalViews }}</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card rounded="lg" variant="tonal" color="secondary" flat>
					<v-card-text class="pa-3">
						<div class="text-caption text-medium-emphasis mb-1">
							<v-icon size="14">mdi-cellphone</v-icon> Mobile
						</div>
						<div class="text-h5 font-weight-bold">{{ mobileViews }}</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card rounded="lg" variant="tonal" color="info" flat>
					<v-card-text class="pa-3">
						<div class="text-caption text-medium-emphasis mb-1">
							<v-icon size="14">mdi-monitor</v-icon> Desktop
						</div>
						<div class="text-h5 font-weight-bold">{{ desktopViews }}</div>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card rounded="lg" variant="tonal" color="warning" flat>
					<v-card-text class="pa-3">
						<div class="text-caption text-medium-emphasis mb-1">Số bản ghi</div>
						<div class="text-h5 font-weight-bold">{{ totalItems }}</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Data Table -->
		<v-card rounded="lg" elevation="1">
			<v-card-title class="pa-4 pb-2">
				<v-row align="center">
					<v-col cols="12" sm="6">
						<!-- ✅ Đổi sang @update:modelValue="onSearchInput" -->
						<v-text-field v-model="search" @update:modelValue="onSearchInput"
							prepend-inner-icon="mdi-magnify" placeholder="Tìm kiếm theo người tạo, ngày..."
							variant="outlined" density="compact" hide-details clearable rounded="lg" color="primary" />
					</v-col>
					<v-col cols="12" sm="6" class="d-flex justify-end">
						<v-chip v-if="filterType !== 'all'" :color="filterType === '0' ? 'secondary' : 'info'"
							variant="tonal" size="small" closable @click:close="filterType = 'all'; resetAndLoad()">
							<v-icon start size="14">{{ filterType === '0' ? 'mdi-cellphone' : 'mdi-monitor' }}</v-icon>
							{{ filterType === '0' ? 'Mobile' : 'Desktop' }}
						</v-chip>
					</v-col>
				</v-row>
			</v-card-title>

			<!-- ✅ Bỏ :key="tableKey", thêm v-model:page="page" -->
			<v-data-table-server v-model:page="page" v-model:items-per-page="itemsPerPage" :headers="headers"
				:items="items" :items-length="totalItems" :loading="loading" :items-per-page-options="[5, 10, 20, 50]"
				hover class="lms-log-table" @update:options="loadItems">
				<!-- Giữ nguyên toàn bộ các slot bên dưới -->
				<template v-slot:[`item.ViewID`]="{ item }">
					<v-chip size="x-small" color="primary" variant="tonal" label>#{{ item.ViewID }}</v-chip>
				</template>
				<template v-slot:[`item.TypeScreen`]="{ item }">
					<v-chip :color="item.TypeScreen === 0 ? 'secondary' : 'info'" size="small" variant="tonal" label>
						<v-icon start size="14">{{ item.TypeScreen === 0 ? 'mdi-cellphone' : 'mdi-monitor' }}</v-icon>
						{{ item.TypeScreen === 0 ? 'Mobile' : 'Desktop' }}
					</v-chip>
				</template>
				<template v-slot:[`item.TenLop`]="{ item }">
					<v-chip v-if="item.TenLop" size="x-small" color="primary" variant="outlined" label>{{ item.TenLop }}
					</v-chip>
					<span v-else class="text-medium-emphasis">—</span>
				</template>
				<template v-slot:[`item.Date`]="{ item }">
					<span class="text-body-2 font-weight-medium">{{ formatDate(item.Date) }}</span>
				</template>
				<template v-slot:[`item.NgayBatDau`]="{ item }">
					<span class="text-body-2 text-medium-emphasis">{{ formatDate(item.NgayBatDau) }}</span>
				</template>
				<template v-slot:[`item.NgayKetThuc`]="{ item }">
					<span class="text-body-2 text-medium-emphasis">{{ formatDate(item.NgayKetThuc) }}</span>
				</template>
				<template v-slot:[`item.ViewCount`]="{ item }">
					<span class="text-body-2 font-weight-bold">{{ item.ViewCount }}</span>
				</template>
				<template v-slot:[`item.IsDeleted`]="{ item }">
					<v-icon :color="item.IsDeleted ? 'error' : 'success'" size="18">
						{{ item.IsDeleted ? 'mdi-close-circle' : 'mdi-check-circle' }}
					</v-icon>
				</template>
				<template v-slot:[`item.CreateTime`]="{ item }">
					<div>
						<div class="text-body-2">{{ formatDateTime(item.CreateTime) }}</div>
						<div class="text-caption text-medium-emphasis">{{ item.CreateUser }}</div>
					</div>
				</template>
				<template v-slot:[`item.UpdateTime`]="{ item }">
					<div>
						<div class="text-body-2">{{ formatDateTime(item.UpdateTime) }}</div>
						<div class="text-caption text-medium-emphasis">{{ item.UpdateUser }}</div>
					</div>
				</template>
				<template #loading>
					<v-skeleton-loader type="table-row@5" />
				</template>
				<template #no-data>
					<div class="py-8 text-center text-medium-emphasis">
						<v-icon size="48" class="mb-2" color="grey-lighten-1">mdi-database-off-outline</v-icon>
						<div>Không có dữ liệu</div>
					</div>
				</template>
			</v-data-table-server>
		</v-card>

		<v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="top right">
			<v-icon start>{{ snackbar.icon }}</v-icon>
			{{ snackbar.text }}
			<template #actions>
				<v-btn variant="text" @click="snackbar.show = false">Đóng</v-btn>
			</template>
		</v-snackbar>
	</v-container>
</template>

<script>
	export default {
		name: 'LmsScreenScheduleLog',
	
		data() {
			return {
				vueData,
				loading: false,
				// ✅ Bỏ tableKey
				page: 1,
				itemsPerPage: 10,
				totalItems: 0,
				search: '',
				filterType: 'all',
				items: [],
				searchTimer: null,
				currentRequestId: 0,  // ✅ Thêm để chống race condition
				summary: {
					totalViewCount: 0,
					mobileViewCount: 0,
					desktopViewCount: 0,
				},
				snackbar: {
					show: false,
					text: '',
					color: 'error',
					icon: 'mdi-alert-circle',
				},
				headers: [
					{ title: 'ID', key: 'ViewID', width: '80px', sortable: false },
					{ title: 'Thiết bị', key: 'TypeScreen', width: '120px', sortable: false },
					{ title: 'Lớp', key: 'TenLop', width: '100px', sortable: false },
					{ title: 'Ngày xem trong tuần', key: 'Date', width: '160px', sortable: false },
					{ title: 'Ngày bắt đầu', key: 'NgayBatDau', width: '130px', sortable: false },
					{ title: 'Ngày kết thúc', key: 'NgayKetThuc', width: '130px', sortable: false },
					{ title: 'Lượt xem', key: 'ViewCount', width: '110px', sortable: false },
					{ title: 'Còn hiệu lực', key: 'IsDeleted', width: '110px', sortable: false },
					{ title: 'Tạo lúc / Bởi', key: 'CreateTime', width: '160px', sortable: false },
					{ title: 'Cập nhật / Bởi', key: 'UpdateTime', width: '160px', sortable: false },
				],
			}
		},
	
		computed: {
			totalViews() { return this.summary.totalViewCount },
			mobileViews() { return this.summary.mobileViewCount },
			desktopViews() { return this.summary.desktopViewCount },
		},
	
		// ✅ Bỏ toàn bộ watch
	
		beforeUnmount() {
			if (this.searchTimer) clearTimeout(this.searchTimer)
		},
	
		methods: {
			loadItems({ page, itemsPerPage }) {
				console.log('🔵 loadItems called:', { page, itemsPerPage })
				console.log('🔵 before assign — this.page:', this.page, 'this.itemsPerPage:', this.itemsPerPage)
				this.page = page
				this.itemsPerPage = itemsPerPage
				console.log('🔵 after assign — this.page:', this.page, 'this.itemsPerPage:', this.itemsPerPage)
				this.fetchData()
			},
	
			resetAndLoad() {
				console.log('🟡 resetAndLoad called — filterType:', this.filterType, 'search:', this.search)
				this.page = 1
				this.items = []
				this.totalItems = 0
				this.fetchData()
			},
	
			async fetchData() {
				const requestId = ++this.currentRequestId
				console.log('🟢 fetchData START — requestId:', requestId, {
					page: this.page,
					itemsPerPage: this.itemsPerPage,
					filterType: this.filterType,
					search: this.search,
				})
				this.loading = true
				try {
					const response = await fetchPromise('lms/LMS_Screen_Schedule_Get', {
						NienKhoa: vueData.NienKhoa,
						PageNumber: this.page,
						PageSize: this.itemsPerPage,
						TypeScreen: this.filterType === 'all' ? 0 : Number(this.filterType),
						Search: this.search?.trim() || '',
					}, { cache: false, forceRefresh: true }) // ✅ thêm dòng này
	
					if (requestId !== this.currentRequestId) {
						console.warn('⚠️ STALE response ignored — requestId:', requestId, 'current:', this.currentRequestId)
						return
					}
	
					const rows = Array.isArray(response) ? response : []
					console.log('🟢 fetchData DONE — rows received:', rows.length, 'TotalRows:', rows[0]?.TotalRows)
	
					this.items = rows
					if (rows.length > 0) {
						const first = rows[0]
						this.totalItems = Number(first.TotalRows) || 0
						this.summary = {
							totalViewCount: Number(first.TotalViewCount) || 0,
							mobileViewCount: Number(first.MobileViewCount) || 0,
							desktopViewCount: Number(first.DesktopViewCount) || 0,
						}
					} else {
						this.totalItems = 0
						this.summary = { totalViewCount: 0, mobileViewCount: 0, desktopViewCount: 0 }
					}
				} catch (error) {
					if (requestId !== this.currentRequestId) return
					console.error('🔴 fetchData ERROR:', error)
					this.showSnackbar('Không thể tải dữ liệu. Vui lòng thử lại.', 'error', 'mdi-alert-circle')
				} finally {
					if (requestId === this.currentRequestId) {
						this.loading = false
					}
				}
			},
	
			// ✅ Debounce cho search
			onSearchInput() {
				if (this.searchTimer) clearTimeout(this.searchTimer)
				this.searchTimer = setTimeout(() => {
					this.resetAndLoad()
				}, 300)
			},
	
			formatDate(dateStr) {
				if (!dateStr) return '—'
				return new Date(dateStr).toLocaleDateString('vi-VN', {
					day: '2-digit', month: '2-digit', year: 'numeric',
				})
			},
	
			formatDateTime(dateStr) {
				if (!dateStr) return '—'
				return new Date(dateStr).toLocaleString('vi-VN', {
					day: '2-digit', month: '2-digit', year: 'numeric',
					hour: '2-digit', minute: '2-digit',
				})
			},
	
			showSnackbar(text, color = 'error', icon = 'mdi-alert-circle') {
				this.snackbar = { show: true, text, color, icon }
			},
		},
	}
</script>