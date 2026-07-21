<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
			Chọn một lớp ở thanh trên để xem và nhập kế hoạch giáo dục của lớp đó.
		</v-alert>
		<template v-else>
			<v-expansion-panels class="mb-2">
				<v-expansion-panel>
					<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary"
						style="min-height: 48px;">
						<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
						KHUNG KẾ HOẠCH GIÁO DỤC HỌC SINH THEO THÁNG LỚP {{ selectedClass?.TenLop || '.....' }} - NĂM HỌC
						{{ schoolYearText }}
					</v-expansion-panel-title>
					<v-expansion-panel-text class="text-caption text-medium-emphasis">
						<div class="font-weight-bold mb-1">Gợi ý thực hiện:</div>
						<ul class="pl-4">
							<li>Căn cứ Khung chủ đề giáo dục của nhà trường để cập nhật tên Chủ đề hàng tháng và Mục
								tiêu giáo dục chính thông qua chủ đề của tháng đó.</li>
							<li>Căn cứ chủ đề - mục tiêu giáo dục đã xác định để lên kế hoạch cho các nội dung giáo dục
								sẽ triển khai cho từng tuần trong tháng.</li>
							<li class="font-weight-bold mt-1 text-primary">Các gợi ý nhiệm vụ thực hiện theo tuần:</li>
							<ul class="pl-4 text-grey-darken-2">
								<li>15 phút đầu giờ</li>
								<li>Sinh hoạt lớp cuối tuần</li>
								<li>Phim ngắn / Video tư liệu liên quan đến chủ đề giáo dục tháng, ngày lễ kỉ niệm, hoặc
									hành vi (nếu cần)</li>
								<li>Dặn dò khác</li>
							</ul>
							<li class="mt-1">Cuối tháng, GVCN cập nhật đánh giá ngắn gọn tình hình cả lớp trong tháng
								đó.</li>
						</ul>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>

			<div class="so-gvcn-sheet-wrap">
				<div class="wrapper-jexcel">
					<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-ke-hoach-sheet"
						:style="{ height: keHoachSheetHeight }"></div>
				</div>
			</div>
		</template>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-ke-hoach',
	props: {
		selectedLopID: { type: String, default: '__ALL__' },
		selectedClass: { type: Object, default: null },
		schoolYearText: { type: String, default: '' },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		keHoachSheetHeight: { type: String, default: 'calc(100vh - 430px)' },
		columns: { type: Array, default: () => [] },
		dataAoA: { type: Array, default: () => [] },
		sheetStyle: { type: Object, default: () => ({}) },
		nestedHeaders: { type: Array, default: () => [] },
		getKeHoachExportMonths: { type: Function, required: true },
		getKeHoachMonthRowCount: { type: Function, required: true }
	},
	data() {
		return {
			instance: null
		}
	},
	watch: {
		selectedLopID() {
			this.$nextTick(() => this.initSheet())
		},
		dataAoA: {
			deep: true,
			handler() {
				this.initSheet()
			}
		}
	},
	mounted() {
		this.initSheet()
	},
	methods: {
		getInstance() {
			return this.instance
		},
		initSheet() {
			if (this.selectedLopID === '__ALL__') return
			this.$nextTick(() => {
				const container = this.$refs.sheetRef
				if (!container) return

				if (this.instance) {
					try {
						const s = Array.isArray(this.instance) ? this.instance[0] : this.instance
						if (s && typeof s.destroy === 'function') s.destroy()
					} catch (e) {}
					this.instance = null
				}
				container.innerHTML = ''

				if (typeof jspreadsheet === 'function') {
					this.instance = jspreadsheet(container, {
						worksheets: [{
							data: this.dataAoA,
							columns: this.columns,
							nestedHeaders: this.nestedHeaders,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.keHoachSheetHeight,
							lazyLoading: false,
							freezeColumns: 1,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							style: this.sheetStyle,
							showHeader: true
						}],
						contextMenu: () => false,
						onload: () => {
							this.$nextTick(() => {
								setTimeout(this.applyLayout, 100)
							})
						}
					})
				}
			})
		},
		applyLayout() {
			const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
			if (!sheet) return
			const rowCount = this.getKeHoachMonthRowCount ? this.getKeHoachMonthRowCount() : 7
			const months = this.getKeHoachExportMonths ? this.getKeHoachExportMonths() : []
			months.forEach((month, index) => {
				const start = 1 + (index * rowCount)
				this.applyMerge(sheet, 'A' + start, 1, rowCount)
				this.applyMerge(sheet, 'H' + start, 1, rowCount)
			})
		},
		applyMerge(sheet, cell, colspan, rowspan) {
			const originalAlert = window.alert
			try {
				window.alert = function (msg) {
					if (msg && String(msg).toLowerCase().indexOf('merged') !== -1) return
					if (typeof originalAlert === 'function') originalAlert(msg)
				}
				if (sheet.setMerge) sheet.setMerge(cell, colspan, rowspan)
				else if (sheet.setMergeCells) sheet.setMergeCells(cell, colspan, rowspan)
			} catch (e) {
			} finally {
				window.alert = originalAlert
			}
		}
	}
	}
</script>