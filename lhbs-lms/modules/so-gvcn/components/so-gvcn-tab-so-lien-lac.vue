<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2 mb-0">
			Chọn một lớp ở thanh trên để xem và nhập sổ liên lạc điện tử của học sinh lớp đó.
		</v-alert>
		<template v-else>
			<div class="pa-2 pb-0">
				<v-alert v-if="reasonReject" class="mb-2" type="error" variant="tonal" density="compact">
					Lý do BGH từ chối: {{ reasonReject }}
				</v-alert>
				<v-btn size="small" variant="outlined" color="primary" class="mb-2"
					@click="showGuide = !showGuide">
					<v-icon start>{{ showGuide ? 'mdi-chevron-up' : 'mdi-information-outline' }}</v-icon>
					{{ showGuide ? 'Ẩn hướng dẫn' : 'Hướng dẫn' }}
				</v-btn>
				<v-alert v-if="showGuide" variant="tonal" type="info" density="compact" class="mb-2 text-caption">
							<div class="font-weight-bold mb-1">Hướng dẫn:</div>
							<div class="mb-1">
								Căn cứ sheet HỒ SƠ THEO DÕI QTRL, GVCN soạn nhận xét để cập nhật MLS cho PHHS. Nhận xét
								học sinh cần phù hợp với các minh chứng trong sheet HỒ SƠ THEO DÕI QTRL.
							</div>
							<div class="font-weight-bold mb-1">Cấu trúc nhận xét từng tháng:</div>
							<ul class="pl-4 mb-0">
								<li>Tinh thần, thái độ học tập và mức độ tiến bộ của học sinh (Chú trọng ghi nhận sự
									tiến bộ)</li>
								<li>Việc tuân thủ nội quy, nền nếp, chuyên cần trong tháng</li>
								<li>Đề xuất PHHS phối hợp giáo dục</li>
							</ul>
				</v-alert>
			</div>
			<div class="so-gvcn-sheet-wrap pa-2 pt-0">
				<div ref="sheetRef" class="so-gvcn-sheet w-100"></div>
			</div>
		</template>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-so-lien-lac',
		props: {
			selectedLopID: { type: String, default: '__ALL__' },
			rows: { type: Array, default: () => [] },
			columns: { type: Array, default: () => [] },
			nestedHeaders: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			soLienLacSheetHeight: { type: String, default: 'calc(100vh - 385px)' },
			sheetKey: { type: [Number, String], default: 0 },
			readOnly: { type: Boolean, default: false },
			reasonReject: { type: String, default: '' }
		},
		emits: ['update:rows'],
		data() {
			return {
				sheetInstance: null,
				timer: null,
				showGuide: false
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
					this.sheetInstance = soGvcnJspreadsheet.create(container, {
						worksheets: [{
							data: this.rows || [],
							columns: (this.columns || []).map(column => {
								const normalized = !column.readOnly && column.type !== 'numeric' && column.align !== 'center'
									? { ...column, align: 'justify' }
									: { ...column }
								return this.readOnly ? { ...normalized, readOnly: true } : normalized
							}),
							nestedHeaders: this.nestedHeaders || [],
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.soLienLacSheetHeight,
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
		},
		watch: {
			selectedLopID() {
				this.scheduleInit()
			},
			sheetKey() {
				this.scheduleInit()
			},
			readOnly() {
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