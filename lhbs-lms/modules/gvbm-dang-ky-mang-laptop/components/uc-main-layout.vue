<template>
	<Global class="uc-gvbm-dang-ky-mang-laptop">
		<template #header>
			<v-card>
				<v-card-title class="d-flex align-center flex-wrap ga-2">
					<v-icon color="primary">mdi-laptop</v-icon>
					<span>{{ TitlePage }}</span>
					<v-spacer />
					<div class="d-flex flex-wrap align-center justify-end ga-3">
						<div v-for="item in scheduleLegends" :key="item.label" class="d-flex align-center ga-1">
							<span class="legend-box" :class="item.class" />
							<span class="text-caption text-medium-emphasis">{{ item.label }}</span>
						</div>
					</div>
				</v-card-title>
				<v-card-subtitle class="pb-3">
					Bấm vào ô tiết học để xem thông tin và đăng ký mang thiết bị.
				</v-card-subtitle>
			</v-card>
		</template>

		<div class="pa-4">
			<v-card class="mb-4">
				<v-card-text class="pt-5">
					<div class="d-flex align-center justify-space-between ga-2 w-100">
						<v-btn icon variant="text" :disabled="!canGoPreviousWeek || vueData.isLoadingTKB"
							@click="changeWeek(-1)"><v-icon>mdi-chevron-left</v-icon></v-btn>
						<div class="flex-grow-1 px-2" style="max-width: 460px">
							<v-select v-model="vueData.TuanXemTKB" :items="DSTuanTKB" item-title="Tuan_HienThi"
								:return-object="true" label="Thời khóa biểu" variant="outlined" hide-details="auto"
								prepend-inner-icon="mdi-calendar-week" :loading="vueData.isLoadingTKB" />
						</div>
						<v-btn icon variant="text" :disabled="!canGoNextWeek || vueData.isLoadingTKB"
							@click="changeWeek(1)"><v-icon>mdi-chevron-right</v-icon></v-btn>
					</div>
					<div v-if="vueData.isLoadingTKB" class="d-flex align-center ga-2 text-primary text-caption mt-2">
						<v-progress-circular indeterminate size="16" width="2" />
						<span>Đang tải thời khóa biểu...</span>
					</div>
					<div class="schedule-scroll mt-4">
						<table class="schedule-table text-caption">
							<thead><tr><th>Buổi</th><th>Tiết</th><th v-for="thu in thuHeaders" :key="thu">{{ thu }}</th></tr></thead>
							<tbody>
								<tr v-for="row in scheduleRows" :key="row.Buoi + '_' + row.Tiet">
									<td v-if="row.BuoiRowspan" :rowspan="row.BuoiRowspan"
										:class="['font-weight-medium', 'text-no-wrap', 'text-center', periodClass(row)]">{{ row.TenBuoi }}</td>
									<td :class="['font-weight-medium', 'text-center', periodClass(row)]">{{ row.Tiet }}</td>
									<td v-for="cell in row.Cells" :key="cell.ThuKey" :class="scheduleCellClass(row, cell)"
										@click="cell.CoTiet && openRegistrationFromSchedule(row, cell)">
										{{ cell.TenLop }}{{ cell.TenMon ? ' - ' + cell.TenMon : '' }}
										<v-icon v-if="cell.IsBiTrungLich" size="x-small" color="error" title="Đã có đăng ký trùng lịch">mdi-alert-circle</v-icon>
										<v-icon v-if="cell.IsDaDangKy" size="x-small" color="teal-darken-3">mdi-check-circle</v-icon>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</v-card-text>
			</v-card>

			<v-dialog v-model="registrationDialog" max-width="1200" scrollable>
			<v-card>
				<v-card-title class="text-primary d-flex align-center ga-2">
					<v-icon>mdi-laptop</v-icon>
					<div>
						<div>Thông tin đăng ký</div>
						<div class="text-caption font-weight-regular text-medium-emphasis">{{ registrationSubtitle }}</div>
						<div v-if="registrationBlocked" class="text-caption text-error">{{ registrationBlockedText }}</div>
					</div>
					<v-spacer />
					<v-btn icon variant="text" @click="registrationDialog = false"><v-icon>mdi-close</v-icon></v-btn>
				</v-card-title>
				<v-divider />
				<v-card-text class="pt-4">
							<v-textarea v-model="vueData.GhiChu" label="Ghi chú" rows="2" auto-grow hide-details="auto" :readonly="registrationBlocked" />
							<v-chip v-if="vueData.canhBaoTreHan()" color="warning" size="small" prepend-icon="mdi-alert" class="mt-2">
								Trễ hạn quy định — vẫn lưu được nhưng cần báo GVCN/quản sinh.
							</v-chip>

					<div v-if="vueData.LopItem" class="mt-4">
						<div class="d-flex align-center flex-wrap mb-2 ga-2">
							<span class="text-subtitle-2 text-medium-emphasis">Học sinh mang thiết bị — mặc định cả lớp</span>
							<v-spacer />
							<v-text-field v-model="vueData.TimKiemHocSinh" label="Tìm học sinh" prepend-inner-icon="mdi-magnify"
								clearable density="compact" hide-details="auto" style="max-width: 220px" />
							<v-btn size="small" variant="text" color="primary"
								:prepend-icon="allStudentsSelected ? 'mdi-checkbox-multiple-blank-outline' : 'mdi-checkbox-multiple-marked'"
								:disabled="registrationBlocked" @click="toggleAllStudents(!allStudentsSelected)">
								{{ allStudentsSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
							</v-btn>
						</div>
						<v-data-table :headers="studentHeaders" :items="filteredStudents" item-value="HocSinhID"
							items-per-page="-1" hide-default-footer density="compact"
							class="border rounded">
							<template #header.IsChon>
								<v-checkbox :model-value="allStudentsSelected" density="compact" hide-details :disabled="registrationBlocked"
									@update:model-value="toggleAllStudents" />
							</template>
							<template #item.IsChon="{ item }">
								<v-checkbox :model-value="item.IsChon" density="compact" hide-details :disabled="registrationBlocked"
									@update:model-value="vueData.toggleChonHocSinh(item)" />
							</template>
							<template #item.GhiChu="{ item }">
							<v-text-field v-model="item.GhiChu" variant="filled" density="compact" hide-details :readonly="registrationBlocked" />
							</template>
							<template v-for="device in tableDeviceTypes" :key="device.key" #[device.headerSlot]>
								<div class="d-flex align-center justify-center ga-1 text-no-wrap">
										<span>{{ device.title }}</span>
									<v-checkbox :model-value="vueData.isCotThietBiChonHet(device.title)" density="compact" hide-details :disabled="registrationBlocked"
										@update:model-value="vueData.toggleCotThietBi(device.title)" />
								</div>
							</template>
							<template v-for="device in tableDeviceTypes" :key="'item-' + device.key" #[device.itemSlot]="{ item }">
								<v-checkbox :model-value="item.ThietBiChon.includes(device.title)" :disabled="registrationBlocked || !item.IsChon"
									density="compact" hide-details @update:model-value="vueData.toggleThietBi(item, device.title)" />
							</template>
							<template #no-data><div class="pa-4 text-medium-emphasis">Lớp chưa có học sinh</div></template>
						</v-data-table>
					</div>
				</v-card-text>
				<v-divider />
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" @click="registrationDialog = false">Đóng</v-btn>
					<v-btn color="primary" prepend-icon="mdi-content-save" :loading="vueData.isLoadingSave"
						:disabled="!canSubmit || registrationBlocked" @click="vueData.submitDangKy()">
						{{ registrationBlocked ? 'Không thể đăng ký' : 'Đăng ký' }}
					</v-btn>
				</v-card-actions>
			</v-card>
			</v-dialog>

			<v-card>
				<v-card-title class="text-primary d-flex align-center flex-wrap ga-2">
					<v-icon>mdi-format-list-bulleted</v-icon>
					<span>Danh sách đã đăng ký</span>
					<v-spacer />
					<v-text-field v-model="registeredSearch" label="Tìm kiếm" prepend-inner-icon="mdi-magnify"
						clearable density="compact" hide-details="auto" style="max-width: 300px" />
				</v-card-title>
				<v-divider />
				<v-card-text>
					<v-data-table :headers="registeredHeaders" :items="vueData.DSDangKy" :search="registeredSearch"
						items-per-page="-1" hide-default-footer fixed-header height="500" density="compact" hover>
						<template #item.SoHocSinh="{ item }"><span class="font-weight-medium">{{ item.SoHocSinh }}</span></template>
						<template #item.LoaiThietBi="{ item }">
							<v-chip v-for="device in String(item.LoaiThietBi || '').split(',').map(function(x) { return x.trim() }).filter(Boolean)"
								:key="device" size="x-small" variant="tonal" color="primary" class="me-1 mb-1">{{ device }}</v-chip>
						</template>
						<template #item.TreHanHienThi="{ item }">
							<v-chip v-if="item.TreHanHienThi" size="x-small" color="warning" variant="tonal">{{ item.TreHanHienThi }}</v-chip>
						</template>
						<template #item.actions="{ item }">
							<v-btn icon size="small" variant="text" color="warning" title="Xóa đăng ký" @click="removeRegistration(item)">
								<v-icon>mdi-delete</v-icon>
							</v-btn>
						</template>
						<template #no-data><div class="pa-6 text-center text-medium-emphasis">Chưa có đăng ký nào</div></template>
					</v-data-table>
				</v-card-text>
			</v-card>
		</div>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'confirmRef'],
	data() {
		return {
			vueData,
			registrationDialog: false,
			registrationBlocked: false,
			registeredSearch: '',
			thuHeaders: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
			scheduleLegends: [
				{ label: 'Đã đăng ký', class: 'schedule-cell-primary' },
				{ label: 'Đang chọn để đăng ký', class: 'schedule-cell-info' },
				{ label: 'Có tiết dạy, chưa đăng ký', class: 'schedule-cell-success' },
			],
			studentHeaders: [
				{ title: '', key: 'IsChon', width: 56, sortable: false, align: 'center' },
				{ title: 'Mã HS', key: 'HocSinhID', width: 90 },
				{ title: 'SDB', key: 'SoDanhBo', width: 90 },
				{ title: 'Học sinh', key: 'HoTen', minWidth: 180 },
				{ title: 'Laptop', key: 'Laptop', width: 120, sortable: false, align: 'center' },
				{ title: 'Tablet', key: 'Tablet', width: 120, sortable: false, align: 'center' },
				{ title: 'Thiết bị khác', key: 'ThietBiKhac', width: 150, sortable: false, align: 'center' },
				{ title: 'Ghi chú', key: 'GhiChu', minWidth: 200, sortable: false },
			],
			registeredHeaders: [
				{ title: 'Lớp', key: 'TenLop', minWidth: 90 },
				{ title: 'Loại thiết bị', key: 'LoaiThietBi', minWidth: 130 },
				{ title: 'Ngày áp dụng', key: 'NgayApDungHienThi', minWidth: 120 },
				{ title: 'Thứ', key: 'ThuHienThi', width: 80 },
				{ title: 'Buổi', key: 'BuoiHienThi', width: 80 },
				{ title: 'Tiết', key: 'TietHienThi', width: 80 },
				{ title: 'Số HS', key: 'SoHocSinh', width: 80, align: 'center' },
				{ title: 'Ghi chú', key: 'GhiChu', minWidth: 180 },
				{ title: 'Trễ hạn', key: 'TreHanHienThi', width: 100, sortable: false },
				{ title: 'Thao tác', key: 'actions', width: 80, sortable: false, align: 'center' },
			],
			tableDeviceTypes: [
				{ title: 'Laptop', key: 'Laptop', headerSlot: 'header.Laptop', itemSlot: 'item.Laptop' },
				{ title: 'Tablet', key: 'Tablet', headerSlot: 'header.Tablet', itemSlot: 'item.Tablet' },
				{ title: 'Thiết bị khác', key: 'ThietBiKhac', headerSlot: 'header.ThietBiKhac', itemSlot: 'item.ThietBiKhac' },
			],
		}
	},
	mounted() {
		vueData.snackbarRef = this.snackbarRef
	},
	computed: {
		DSTuanTKB() {
			var weeks = (this.vueData.DSTuan || []).slice().sort(function(a, b) {
				return new Date(a.NgayBatDau) - new Date(b.NgayBatDau)
			})
			var mondayWeeks = weeks.filter(function(item) {
				var date = new Date(item.NgayBatDau)
				return date.getDay() === 1
			})
			return mondayWeeks.length ? mondayWeeks : weeks
		},
		TitlePage() {
			return getTitlePageByURL(window.location.pathname + window.location.search)
		},
		currentWeekIndex() {
			var current = this.vueData.TuanXemTKB
			return this.DSTuanTKB.findIndex(function(item) {
				return item === current || (current && item.TuanHocID === current.TuanHocID)
			})
		},
		canGoPreviousWeek() {
			return this.currentWeekIndex > 0
		},
		canGoNextWeek() {
			return this.currentWeekIndex >= 0 && this.currentWeekIndex < this.DSTuanTKB.length - 1
		},
		registrationSubtitle() {
			var lop = this.vueData.LopItem && (this.vueData.LopItem.TenHienThi || this.vueData.LopItem.TenLop)
			var ngay = this.formatRegistrationDate(this.vueData.NgayApDung)
			var buoi = { 1: 'Sáng', 2: 'Chiều', 3: 'Tối' }[this.vueData.Buoi] || ''
			var tiet = this.vueData.TietBatDau === this.vueData.TietKetThuc
				? 'Tiết ' + this.vueData.TietBatDau
				: 'Tiết ' + this.vueData.TietBatDau + ' - ' + this.vueData.TietKetThuc
			return [lop, ngay, buoi, tiet].filter(Boolean).join(' • ')
		},
		allStudentsSelected() {
			var students = this.vueData.HocSinhThietBi || []
			return students.length > 0 && students.every(function(item) { return item.IsChon })
		},
		scheduleRows() {
			var rows = this.vueData.DSTKB || []
			if (!rows.length) {
				rows = []
				for (var buoi = 1; buoi <= 2; buoi += 1) {
					for (var tiet = 1; tiet <= 5; tiet += 1) {
						rows.push({
							Buoi: buoi,
							Tiet: tiet,
							TenBuoi: buoi === 1 ? 'Sáng' : 'Chiều',
							Cells: ['2', '3', '4', '5', '6', '7', '1'].map(function(thuKey) {
								return { ThuKey: thuKey, CoTiet: false, TenLop: '', TenMon: '', IsDaDangKy: false }
							}),
						})
					}
				}
			}
			return rows.map(function(row, index) {
				var isFirst = index === 0 || rows[index - 1].Buoi !== row.Buoi
				var rowspan = 0
				if (isFirst) {
					for (var i = index; i < rows.length && rows[i].Buoi === row.Buoi; i += 1) rowspan += 1
				}
				return Object.assign({}, row, { BuoiRowspan: rowspan })
			})
		},
		filteredStudents() {
			const keyword = String(this.vueData.TimKiemHocSinh || '').trim().toLowerCase()
			return (this.vueData.HocSinhThietBi || []).filter(x => !keyword || String(x.HoTen || '').toLowerCase().includes(keyword))
		},
		canSubmit() {
			return Boolean(this.vueData.LopItem && this.vueData.NgayApDung && this.vueData.HocSinhThietBi.some(x => x.IsChon))
		},
		registrationBlockedText() {
			return 'Tiết này đã được đăng ký hoặc đã có đăng ký trùng lịch.'
		},
	},
	methods: {
		toggleAllStudents(value) {
			if (value) this.vueData.chonTatCaHocSinh()
			else this.vueData.boChonTatCaHocSinh()
		},
		formatRegistrationDate(value) {
			if (!value) return ''
			var dateText = String(value).slice(0, 10)
			var parts = dateText.split('-')
			return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : dateText
		},
		openRegistrationFromSchedule(row, cell) {
			if (cell.IsDaDangKy || cell.IsBiTrungLich) {
				this.vueData.dienFormTuTiet({
					key: row.Buoi + '_' + row.Tiet + '_' + cell.ThuKey,
					Buoi: row.Buoi, Tiet: row.Tiet, TenLop: cell.TenLop, TenMon: cell.TenMon,
									NgayApDung: tinhNgayTuThuKey(cell.ThuKey),
								})
								this.registrationBlocked = true
								this.registrationDialog = true
				return
			}
			this.registrationBlocked = false
			if (this.vueData.onChonTietTKB(row, cell) !== false) this.registrationDialog = true
		},
		openRegistrationFromQueue(item) {
			this.vueData.dienFormTuTiet(item)
			this.registrationBlocked = false
			this.registrationDialog = true
		},
		removeRegistration(item) {
			var self = this
			this.confirmRef.value.show({
				title: 'Xác nhận xóa đăng ký lớp ' + (item.TenLop || '') + '?',
				message: 'Đăng ký và danh sách học sinh mang thiết bị sẽ bị xóa.',
			}).then(function(confirmed) {
				if (!confirmed) return
					fetchPromise('lms/DangKyMangLaptop_Del', { DangKyID: item.DangKyID }, { cache: false })
						.then(function() {
							return fetchPromise('lms/DangKyMangLaptop_Get', {
								NienKhoa: vueData.NienKhoa, TuanHocID: 0, LopID: 0, KhoiID: 0, ViewMode: 'GVBM'
							}, { cache: false })
						})
						.then(function(res) {
							vueData.DSDangKy = res || []
							vueData.renderDSDangKy()
							self.snackbarRef.value.showSnackbar({ message: 'Đã xóa đăng ký', color: 'success' })
						})
				})
		},
		changeWeek(offset) {
			var nextIndex = this.currentWeekIndex + offset
			var weeks = this.DSTuanTKB
			if (nextIndex < 0 || nextIndex >= weeks.length) return
			this.vueData.TuanXemTKB = weeks[nextIndex]
		},
		scheduleCellClass(row, cell) {
			if (!cell.CoTiet) return ''
			var statusClass = cell.IsBiTrungLich
				? 'schedule-cell-error'
				: this.vueData.isTietDaChon(row, cell)
					? 'schedule-cell-info'
					: cell.IsDaDangKy ? 'schedule-cell-primary' : 'schedule-cell-success'
			return 'schedule-cell ' + statusClass
		},
		periodClass(row) {
			return row.Buoi === 1 ? 'schedule-period-primary' : row.Buoi === 2 ? 'schedule-period-warning' : 'schedule-period-tertiary'
		},
	},
	}
</script>

<style scoped>
.uc-gvbm-dang-ky-mang-laptop .legend-box { display: inline-block; width: 14px; height: 14px; border: 1px solid rgba(0, 0, 0, 0.2); }
.uc-gvbm-dang-ky-mang-laptop .schedule-cell { cursor: pointer; font-weight: 600; }
.uc-gvbm-dang-ky-mang-laptop .schedule-cell-primary { background-color: rgba(var(--v-theme-primary), 0.28) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-cell-info { background-color: rgba(var(--v-theme-info), 0.25) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-cell-success { background-color: rgba(var(--v-theme-success), 0.16) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-cell-error { background-color: rgba(var(--v-theme-error), 0.25) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-period-primary { background-color: rgba(var(--v-theme-primary), 0.16) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-period-warning { background-color: rgba(var(--v-theme-warning), 0.20) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-period-tertiary { background-color: rgba(var(--v-theme-tertiary), 0.16) !important; }
.uc-gvbm-dang-ky-mang-laptop .schedule-scroll { overflow-x: auto; }
.uc-gvbm-dang-ky-mang-laptop .schedule-table { width: 100%; min-width: 1000px; table-layout: fixed; border-collapse: collapse; }
.uc-gvbm-dang-ky-mang-laptop .schedule-table th:nth-child(1),
.uc-gvbm-dang-ky-mang-laptop .schedule-table td:nth-child(1) { width: 64px; }
.uc-gvbm-dang-ky-mang-laptop .schedule-table th:nth-child(2),
.uc-gvbm-dang-ky-mang-laptop .schedule-table td:nth-child(2) { width: 60px; }
.uc-gvbm-dang-ky-mang-laptop .schedule-table th:nth-child(n + 3),
.uc-gvbm-dang-ky-mang-laptop .schedule-table td:nth-child(n + 3) { width: calc((100% - 124px) / 7); }
.uc-gvbm-dang-ky-mang-laptop .schedule-table th,
.uc-gvbm-dang-ky-mang-laptop .schedule-table td { padding: 8px; border: 1px solid rgba(0, 0, 0, 0.12); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 900px) {
	.uc-gvbm-dang-ky-mang-laptop .schedule-table { min-width: 1000px; }
	.uc-gvbm-dang-ky-mang-laptop .schedule-scroll { overflow-x: auto; }
}
</style>