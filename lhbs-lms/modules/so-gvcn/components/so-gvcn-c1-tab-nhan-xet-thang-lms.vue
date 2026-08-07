<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2"
			style="flex: 0 0 auto; min-height: auto;">
			Chọn một lớp ở thanh trên để nhập nhận xét tháng LMS.
		</v-alert>
		<div v-else-if="loading" class="d-flex align-center justify-center ga-3 pa-4 text-primary"
			style="flex: 0 0 auto; min-height: auto;">
			<v-progress-circular indeterminate size="24" width="2" />
			<span class="text-body-2">Đang tải nhận xét tháng...</span>
		</div>
		<v-alert v-else-if="reasonReject" type="error" variant="tonal" density="compact" class="ma-2"
			style="flex: 0 0 auto; min-height: auto;">
			Lý do từ chối: {{ reasonReject }}
		</v-alert>
		<div v-if="selectedLopID !== '__ALL__' && !loading" class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-nhan-xet-thang-lms',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			rows: { type: Array, default: () => [] },
			columns: { type: Array, default: () => [] },
			nestedHeaders: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			sheetKey: { type: [Number, String], default: 0 },
			readOnly: { type: Boolean, default: false },
			reasonReject: { type: String, default: '' },
			loading: { type: Boolean, default: false }
		},
		data() {
			return { instance: null, timer: null }
		},
		watch: {
			selectedLopID() { this.scheduleInit() },
			rows: { deep: false, handler() { this.scheduleInit() } },
			columns: { deep: false, handler() { this.scheduleInit() } },
			loading() { this.scheduleInit() },
			sheetKey() { this.scheduleInit() }
		},
		mounted() { this.scheduleInit() },
		beforeUnmount() {
			if (this.timer) clearTimeout(this.timer)
			this.destroySheet()
		},
		methods: {
			getInstance() { return Array.isArray(this.instance) ? this.instance[0] : this.instance },
			getRows() {
				const sheet = this.getInstance()
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			scheduleInit() {
				if (this.timer) clearTimeout(this.timer)
				this.$nextTick(() => {
					this.timer = window.setTimeout(() => {
						this.timer = null
						this.initSheet()
					}, 50)
				})
			},
			destroySheet() {
				if (!this.instance) return
				try {
					const sheet = this.getInstance()
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (error) {}
				this.instance = null
			},
			initSheet() {
				if (this.selectedLopID === '__ALL__' || this.loading) {
					this.destroySheet()
					return
				}
				const container = this.$refs.sheetRef
				if (!container) return
				this.destroySheet()
				container.innerHTML = ''
				if (typeof jspreadsheet !== 'function') return
				this.instance = soGvcnJspreadsheet.create(container, {
					worksheets: [{
						data: this.rows || [],
						columns: (this.columns || []).map(column => {
							const normalizedColumn = this.readOnly ? { ...column, readOnly: true } : column
							return !normalizedColumn.readOnly && normalizedColumn.type !== 'numeric' && normalizedColumn.align !== 'center'
								? { ...normalizedColumn, align: 'justify' }
								: normalizedColumn
						}),
						nestedHeaders: this.nestedHeaders || [],
						rowResize: true,
						columnDrag: false,
						tableWidth: '100%',
						tableOverflow: true,
						tableHeight: this.sheetHeight,
						lazyLoading: false,
						freezeColumns: 2,
						wordWrap: true,
						allowInsertColumn: false,
						allowInsertRow: false,
						showHeader: true
					}],
					contextMenu: () => false,
					onload: () => {
						this.$nextTick(() => {
							setTimeout(() => {
								const sheet = this.getInstance()
								if (!sheet || typeof sheet.setHeight !== 'function') return
								;(this.rows || []).forEach((_, rowIndex) => sheet.setHeight(rowIndex, 96))
							}, 100)
						})
					}
				})
			}
		}
	}
</script>