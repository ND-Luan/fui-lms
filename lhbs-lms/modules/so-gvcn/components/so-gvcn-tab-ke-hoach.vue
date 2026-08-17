<template>
	<div class="h-100 d-flex flex-column">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và nhập kế hoạch giáo dục của lớp đó.
		</v-alert>
		<template v-else>
			<v-expansion-panels class="pa-2 pb-0">
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

			<div class="w-100 flex-grow-1" style="overflow: auto;">
				<template v-if="dataAoA && dataAoA.length">
					<div ref="sheetRef"></div>
				</template>
				<uc-card-empty v-else />
			</div>
		</template>
	</div>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-ke-hoach',
	props: {
		selectedLopID: { type: String, default: '__ALL__' },
		selectedClass: { type: Object, default: null },
		schoolYearText: { type: String, default: '' },
		sheetHeight: { type: String },
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
			this.initSheet()
		},
		dataAoA: {
			handler() {
				this.initSheet()
			}
		},
		nestedHeaders: {
			handler() {
				this.initSheet()
			}
		}
	},
	computed: {
		sheetStyleComputed() {
			return this.sheetStyle || {}
		}
	},
	mounted() {
		this.initSheet()
	},
	beforeUnmount() {
		this.destroySheet()
	},
	methods: {
		getInstance() {
			return this.instance
		},
		destroySheet() {
			if (!this.instance) return
			try {
				const s = Array.isArray(this.instance) ? this.instance[0] : this.instance
				if (s && typeof s.destroy === 'function') s.destroy()
			} catch (e) {}
			this.instance = null
		},
		initSheet() {
			if (this.selectedLopID === '__ALL__') {
				this.destroySheet()
				return
			}
			this.$nextTick(() => {
				const container = this.$refs.sheetRef
				if (!container || !this.dataAoA || !this.dataAoA.length) {
					this.destroySheet()
					return
				}

				let scrollTop = 0;
				let scrollLeft = 0;
				const content = container.querySelector('.jexcel_content') || container.querySelector('.jspreadsheet_content');
				if (content) {
					scrollTop = content.scrollTop;
					scrollLeft = content.scrollLeft;
				}

				this.destroySheet()
				container.innerHTML = ''

				if (typeof jspreadsheet === 'undefined') {
					setTimeout(() => this.initSheet(), 100)
					return
				}

				const factory = (typeof soGvcnJspreadsheet !== 'undefined' && soGvcnJspreadsheet.create)
					? soGvcnJspreadsheet.create.bind(soGvcnJspreadsheet)
					: jspreadsheet

				this.isInitialized = false
				this.instance = factory(container, {
					worksheets: [{
						data: this.dataAoA,
						columns: (this.columns || []).map(column => (
							!column.readOnly && column.type !== 'numeric' && column.align !== 'center'
								? { ...column, align: 'justify' }
								: column
						)),
						nestedHeaders: this.nestedHeaders,
						rowResize: true,
						columnDrag: false,
						rowDrag: false,
						columnSorting: false,
						tableWidth: '100%',
						tableOverflow: true,
						tableHeight: "calc(100vh - 175px)",
						lazyLoading: false,
						freezeColumns: 1,
						wordWrap: true,
						allowInsertColumn: false,
						allowInsertRow: false,
						style: this.sheetStyle,
						showHeader: true
					}],
					onchange: () => { if (this.isInitialized) this.$emit('changed') },
					onbeforepaste: (worksheet, data, x, y) => {
						const col = worksheet.options.columns ? worksheet.options.columns[x] : null;
						if (this.isInitialized) this.$emit('changed');
						if (Array.isArray(data)) {
							const normalizedData = data.map(row => row.map(cell => {
								if (cell === null || cell === undefined) return '';
								if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
								if (typeof cell === 'object') {
									return cell.innerHTML || cell.textContent || cell.innerText || cell.value || cell.v || '';
								}
								return String(cell);
							}));
							
							if (col && (col.type === 'note' || col.type === 'html')) {
								let text = normalizedData.map(row => row.join('\t')).join('\n');
								if (text.startsWith('"') && text.endsWith('"')) {
									text = text.substring(1, text.length - 1).replace(/""/g, '"');
								}
								return [[text]];
							}
							
							return normalizedData;
						}
						return data;
					},
					onafterchanges: () => { if (this.isInitialized) this.$emit('changed') },
					contextMenu: () => false,
					onload: () => {
						this.$nextTick(() => {
							setTimeout(() => {
								this.applyLayout()
								this.isInitialized = true
							}, 100)
						})
					}
				})
			})
		},
		getRows() {
			const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
			return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
		},
		applyLayout() {
			const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
			if (!sheet) return
			const rowCount = this.getKeHoachMonthRowCount ? this.getKeHoachMonthRowCount() : 6
			const months = this.getKeHoachExportMonths ? this.getKeHoachExportMonths() : []
			months.forEach((month, index) => {
				const start = 1 + (index * rowCount)
				this.applyMerge(sheet, 'A' + start, 1, rowCount)
				this.applyMerge(sheet, 'I' + start, 1, rowCount)
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