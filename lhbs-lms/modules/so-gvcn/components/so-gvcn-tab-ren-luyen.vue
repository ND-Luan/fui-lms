<template>
	<v-card-text class="pa-2" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="mb-0">
			Chọn một lớp ở thanh trên để xem và nhập hồ sơ theo dõi quá trình rèn luyện của học sinh lớp đó.
		</v-alert>
		<template v-else>
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
			<div class="so-gvcn-sheet-wrap">
				<div ref="sheetRef" class="so-gvcn-sheet w-100"></div>
			</div>
		</template>
	</v-card-text>
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
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			renLuyenSheetHeight: { type: String, default: 'calc(100vh - 370px)' },
			sheetKey: { type: [Number, String], default: 0 }
		},
		emits: ['update:rows'],
		data() {
			return {
				instance: null
			}
		},
		watch: {
			selectedLopID() {
				this.scheduleInit()
			},
			sheetKey() {
				this.scheduleInit()
			}
		},
		mounted() {
			this.scheduleInit()
		},
		methods: {
			getInstance() {
				return this.instance
			},
			scheduleInit() {
				if (this.selectedLopID === '__ALL__') return
				this.$nextTick(() => {
					window.setTimeout(() => this.initSheet(), 50)
				})
			},
			initSheet() {
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
					this.instance = soGvcnJspreadsheet.create(container, {
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
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.renLuyenSheetHeight,
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
								this.$emit('update:rows', this.rows)
							}
						}
					})
				}
			}
		}
	}
</script>