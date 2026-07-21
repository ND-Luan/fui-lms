<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2 mb-0">
			Chọn một lớp ở thanh trên để xem và nhập thông tin định hướng nghề nghiệp của học sinh lớp đó.
		</v-alert>
		<template v-else>
			<div class="pa-2 pb-0">
				<v-expansion-panels class="mb-2">
					<v-expansion-panel>
						<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary" style="min-height: 48px;">
							<v-icon start color="primary" class="mr-2">mdi-information-outline</v-icon>
							ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)
						</v-expansion-panel-title>
						<v-expansion-panel-text class="text-caption text-medium-emphasis">
							<div class="font-weight-bold mb-1">Hướng dẫn:</div>
							<ul class="pl-4 mb-0">
								<li>Cập nhật môn HS dự kiến sẽ chọn thi TN cùng 2 môn bắt buộc.</li>
								<li>Cập nhật dữ liệu từ phòng tham vấn (nếu có) hoặc qua tìm hiểu của GVCN.</li>
							</ul>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</div>
			<div class="so-gvcn-sheet-wrap">
				<div ref="sheetRef" class="so-gvcn-sheet w-100"></div>
			</div>
		</template>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-huong-nghiep',
		props: {
			selectedLopID: { type: String, default: '__ALL__' },
			rows: { type: Array, default: () => [] },
			columns: { type: Array, default: () => [] },
			nestedHeaders: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			huongNghiepSheetHeight: { type: String, default: 'calc(100vh - 360px)' },
			sheetKey: { type: [Number, String], default: 0 }
		},
		emits: ['update-rows'],
		data() {
			return {
				instance: null
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
			},
			sheetKey() {
				this.initSheet()
			},
			rows: {
				deep: true,
				handler() {
					if (!this.instance) {
						this.initSheet()
					}
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
				setTimeout(() => {
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
								data: this.rows,
								columns: this.columns,
								nestedHeaders: this.nestedHeaders,
								rowResize: true,
								columnDrag: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: this.huongNghiepSheetHeight,
								lazyLoading: false,
								freezeColumns: 2,
								wordWrap: true,
								allowInsertColumn: false,
								allowInsertRow: false,
								showHeader: true
							}],
							contextMenu: () => false,
							onchange: (worksheet, cell, x, y, value) => {
								if (Array.isArray(this.rows) && this.rows[y]) {
									this.rows[y][x] = value
									this.$emit('update-rows', this.rows)
								}
							}
						})
					}
				}, 50)
			}
		}
	}
</script>