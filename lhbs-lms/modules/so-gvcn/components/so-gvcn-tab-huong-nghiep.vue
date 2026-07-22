<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2 mb-0">
			Chọn một lớp ở thanh trên để xem và nhập thông tin định hướng nghề nghiệp của học sinh lớp đó.
		</v-alert>
		<template v-else>
			<div class="pa-2 pb-0">
				<v-expansion-panels class="mb-2">
					<v-expansion-panel>
						<v-expansion-panel-title class="text-subtitle-1 font-weight-bold py-2 px-3 text-primary"
							style="min-height: 48px;">
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
			<div class="so-gvcn-sheet-wrap pa-2 pt-0">
				<div ref="sheetRef" class="so-gvcn-sheet so-gvcn-huong-nghiep-sheet w-100"></div>
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
				sheetInstance: null,
				timer: null
			}
		},
		methods: {
			getInstance() {
				const inst = this.sheetInstance
				return Array.isArray(inst) ? inst[0] : inst
			},
			scheduleInit() {
				if (this.timer) clearTimeout(this.timer)
				this.timer = setTimeout(() => this.initSheet(), 50)
			},
			destroySheet() {
				if (this.sheetInstance) {
					try {
						const sheet = this.getInstance()
						if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					} catch (e) {}
					this.sheetInstance = null
				}
			},
			initSheet() {
				const container = this.$refs.sheetRef
				if (!container || this.selectedLopID === '__ALL__') {
					this.destroySheet()
					return
				}
				this.destroySheet()
				container.innerHTML = ''

				if (typeof jspreadsheet === 'function') {
					this.sheetInstance = jspreadsheet(container, {
						worksheets: [{
							data: this.rows || [],
							columns: this.columns || [],
							nestedHeaders: this.nestedHeaders || [],
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.huongNghiepSheetHeight,
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
								this.$emit('update-rows', this.rows)
							}
						}
					})
				}
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
		beforeUnmount() {
			if (this.timer) clearTimeout(this.timer)
			this.destroySheet()
		}
	}
</script>