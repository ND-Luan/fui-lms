<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<template v-if="rows && rows.length">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-student-sheet"></div>
		</template>
		<uc-card-empty v-else />
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-tab-du-lieu-hs',
	props: {
		rows: { type: Array, default: () => [] },
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
		sheetKey: { type: [Number, String], default: 0 },
		nestedHeaders: { type: Array, default: () => [] }
	},
	data() {
		return {
			sheetInstance: null,
			baseColumns: [
				{ title: 'STT', width: 45, readOnly: true },
				{ title: 'Mã học sinh', width: 110, readOnly: true },
				{ title: 'Số danh bộ', width: 110, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 220, readOnly: true, align: 'left' },
				{ title: 'Lớp mới', width: 70, readOnly: true },
				{ title: 'Lớp cũ', width: 70, readOnly: true },
				{ title: 'Toán', isScoreCol: true, readOnly: true },
				{ title: 'Tiếng Việt/Văn', isScoreCol: true, readOnly: true },
				{ title: 'Anh', isScoreCol: true, readOnly: true },
				{ title: 'KHTN', isScoreCol: true, readOnly: true },
				{ title: 'LS-ĐL', isScoreCol: true, readOnly: true },
				{ title: 'GDCD/GDKTPL', isScoreCol: true, readOnly: true },
				{ title: 'Tin', isScoreCol: true, readOnly: true },
				{ title: 'CN', isScoreCol: true, readOnly: true },
				{ title: 'Địa lí', isScoreCol: true, readOnly: true },
				{ title: 'Vật lí', isScoreCol: true, readOnly: true },
				{ title: 'Hóa', isScoreCol: true, readOnly: true },
				{ title: 'Sinh', isScoreCol: true, readOnly: true },
				{ title: 'KQRL', width: 65, readOnly: true },
				{ title: 'KQHT', width: 65, readOnly: true },
				{ title: 'Danh hiệu', width: 180, readOnly: true },
				{ title: 'Nhận xét GVCN', width: 380, align: 'left', readOnly: true },
				{ title: 'Cha', width: 140, readOnly: true },
				{ title: 'Nghề nghiệp cha', width: 130, readOnly: true },
				{ title: 'SDT cha', width: 105, readOnly: true },
				{ title: 'Mẹ', width: 140, readOnly: true },
				{ title: 'Nghề nghiệp mẹ', width: 130, readOnly: true },
				{ title: 'SDT mẹ', width: 105, readOnly: true },
				{ title: 'Người đỡ đầu', width: 130, readOnly: true },
				{ title: 'SDT người đỡ đầu', width: 125, readOnly: true },
				{ title: 'Ăn sáng', width: 80, readOnly: true },
				{ title: 'Xe', width: 80, readOnly: true },
				{ title: 'Địa chỉ', width: 240, align: 'left', readOnly: true },
				{ title: 'Ghi chú', width: 150, readOnly: true }
			]
		}
	},
	computed: {
		computedColumns() {
			if (!this.rows || !this.rows.length) return this.baseColumns

			return this.baseColumns.map((col, colIdx) => {
				let maxLen = (col.title || '').length
				for (let i = 0; i < Math.min(this.rows.length, 50); i++) {
					const val = this.rows[i][colIdx]
					if (val != null) {
						const strLen = String(val).trim().length
						if (strLen > maxLen) maxLen = strLen
					}
				}

				if (col.isScoreCol) {
					const calculatedWidth = Math.max(45, maxLen * 8.5 + 16)
					return {
						...col,
						width: Math.ceil(calculatedWidth)
					}
				}

				const autoWidth = Math.max(45, Math.min(maxLen * 8 + 20, 320))
				return {
					...col,
					width: col.width ? Math.max(col.width, autoWidth) : Math.ceil(autoWidth)
				}
			})
		}
	},
	methods: {
		destroySheet() {
			if (!this.sheetInstance) return
			try {
				const sheet = Array.isArray(this.sheetInstance) ? this.sheetInstance[0] : this.sheetInstance
				if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
			} catch (e) {}
			this.sheetInstance = null
		},
		initSheet() {
			this.$nextTick(() => {
				const container = this.$refs.sheetRef
				if (!container || !this.rows || !this.rows.length) {
					this.destroySheet()
					return
				}

				this.destroySheet()
				container.innerHTML = ''

				if (typeof jspreadsheet === 'function') {
					this.sheetInstance = soGvcnJspreadsheet.create(container, {
						worksheets: [{
							data: this.rows,
							columns: this.computedColumns,
							nestedHeaders: this.nestedHeaders,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.sheetHeight,
							lazyLoading: false,
							freezeColumns: 4,
							wordWrap: true,
							allowInsertColumn: false,
							allowInsertRow: false,
							showHeader: true
						}],
						contextMenu: () => false
					})
				}
			})
		}
	},
	watch: {
		rows: {
			deep: true,
			handler() {
				this.initSheet()
			}
		},
		nestedHeaders: {
			deep: true,
			handler() {
				this.initSheet()
			}
		},
		sheetKey() {
			this.initSheet()
		}
	},
	mounted() {
		this.initSheet()
	},
	beforeUnmount() {
		this.destroySheet()
	}
	}
</script>
