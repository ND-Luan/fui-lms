<template>
	<v-card>
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem và nhập hồ sơ theo dõi quá trình rèn luyện của học sinh lớp đó.
		</v-alert>
		<template v-else>
			<div class="pa-2 pb-0">
				<v-alert v-if="showAttendanceAlert && attendanceWarnings.length" type="warning" variant="tonal" density="compact" closable class="mb-2"
					@click:close="$emit('close-attendance-alert')">
					<div class="font-weight-bold">Cảnh báo chuyên cần</div>
					<div v-for="warning in attendanceWarnings" :key="warning.key" class="text-body-2 mt-1">
						{{ warning.text }}
					</div>
				</v-alert>
				<v-expansion-panels class="mb-2">
					<v-expansion-panel>
						<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary"
							style="min-height: 48px;">
							<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
							THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP {{ selectedClass?.TenLop || '.......' }} NĂM HỌC
							{{ schoolYearText }}
						</v-expansion-panel-title>
						<v-expansion-panel-text class="text-caption text-medium-emphasis">
							<div class="font-weight-bold mb-1">Cột từng tháng:</div>
							<ul class="pl-4 mb-0">
								<li>Ghi tóm tắt vi phạm, tái phạm, số ngày nghỉ, thời gian/xử lí/có mời PH/có cam kết lần...
								</li>
								<li>Ghi nhận tiến bộ về mặt nào đó, thành tích, đóng góp.</li>
							</ul>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</div>

			<div class="w-100" style="overflow: auto;">
				<template v-if="rows && rows.length">
					<div ref="sheetRef"></div>
				</template>
				<uc-card-empty v-else />
			</div>
		</template>
	</v-card>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-ren-luyen',
		props: {
			selectedLopID: { type: String, default: '__ALL__' },
			selectedClass: { type: Object, default: null },
			schoolYearText: { type: String, default: '' },
			rows: { type: Array, default: () => [] },
			columns: { type: Array, default: () => [] },
			nestedHeaders: { type: Array, default: () => [] },
			attendanceSummaries: { type: Object, default: () => ({}) },
			attendanceLoading: { type: Boolean, default: false },
			showAttendanceAlert: { type: Boolean, default: false },
			sheetHeight: { type: String, default: 'calc(100vh - 175px)' },
			sheetKey: { type: [Number, String], default: 0 }
		},
		emits: ['update:rows', 'close-attendance-alert'],
		data() {
			return {
				instance: null
			}
		},
		computed: {
			attendanceWarnings() {
				return Object.values(this.attendanceSummaries || {})
					.filter(item => item.warningLevel)
					.map(item => ({
						key: item.key,
						text: `${item.hoTen}: ${item.warningText}`
					}))
			}
		},
		watch: {
			selectedLopID() {
				this.scheduleInit()
			},
			sheetKey() {
				this.scheduleInit()
			},
			rows: {
				handler() {
					this.scheduleInit()
				}
			}
		},
		mounted() {
			this.scheduleInit()
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
			scheduleInit() {
				if (this.selectedLopID === '__ALL__') {
					this.destroySheet()
					return
				}
				this.$nextTick(() => {
					window.setTimeout(() => this.initSheet(), 50)
				})
			},
			initSheet() {
				const container = this.$refs.sheetRef
				if (!container || !this.rows || !this.rows.length) {
					this.destroySheet()
					return
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
						data: Array.isArray(this.rows) ? this.rows : [],
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
						tableHeight: "calc(100vh - 172px)",
						lazyLoading: false,
						freezeColumns: 4,
						wordWrap: true,
						allowInsertColumn: false,
						allowInsertRow: false,
						showHeader: true
					}],
					contextMenu: () => false,
					onchange: (worksheet, cell, x, y, value) => {
						if (Array.isArray(this.rows) && this.rows[y]) {
							this.rows[y][x] = value
							if (this.isInitialized) this.$emit('update:rows', this.rows)
						}
					},
					onload: () => {
						setTimeout(() => { this.isInitialized = true }, 100)
					}
				})
			}
		}
	}
</script>