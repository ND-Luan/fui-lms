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
	name: 'so-gvcn-c1-tab-thong-tin-to-chuc',
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
				{ title: 'STT', width: 50, readOnly: true },
				{ title: 'HỌ VÀ TÊN HỌC SINH', width: 220, readOnly: true, align: 'left' },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'NGÀY, THÁNG, NĂM SINH', width: 150, readOnly: true },
				{ title: 'NỮ', width: 50, readOnly: true },
				{ title: 'DÂN TỘC', width: 90, readOnly: true },
				{ title: 'XẾP LOẠI KQGD NĂM HỌC 2025-2026', width: 220, readOnly: true },
				{ title: 'KHEN THƯỞNG NĂM HỌC 2025-2026', width: 240, readOnly: true },
				{ title: 'NHẬN XÉT CỦA GVCN', width: 380, align: 'left', readOnly: true },
				{ title: 'SỞ THÍCH, NĂNG KHIẾU, HOÀN CẢNH GIA ĐÌNH', width: 300, align: 'left', readOnly: true },
				{ title: 'HỌ VÀ TÊN CHA', width: 160, readOnly: true },
				{ title: 'NGHỀ NGHIỆP CHA', width: 140, readOnly: true },
				{ title: 'SĐT CHA', width: 110, readOnly: true },
				{ title: 'HỌ VÀ TÊN MẸ', width: 160, readOnly: true },
				{ title: 'NGHỀ NGHIỆP MẸ', width: 140, readOnly: true },
				{ title: 'SĐT MẸ', width: 110, readOnly: true },
				{ title: 'NGƯỜI ĐỠ ĐẦU', width: 150, readOnly: true },
				{ title: 'SĐT NGƯỜI ĐỠ ĐẦU', width: 130, readOnly: true },
				{ title: 'ĐỊA CHỈ', width: 280, align: 'left', readOnly: true },
				{ title: 'GHI CHÚ', width: 220, align: 'left', readOnly: true }
			]
		}
	},
	computed: {
		computedColumns() {
			if (!this.rows || !this.rows.length) return this.baseColumns

			return this.baseColumns.map((col, colIdx) => {
				let maxLen = (col.title || '').length
				for (let i = 0; i < Math.min(this.rows.length, 50); i++) {
					const val = this.rows[i] ? this.rows[i][colIdx] : null
					if (val != null) {
						const strLen = String(val).trim().length
						if (strLen > maxLen) maxLen = strLen
					}
				}
				const autoWidth = Math.max(50, Math.min(maxLen * 8 + 20, 400))
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
					this.sheetInstance = jspreadsheet(container, {
						worksheets: [{
							data: this.rows,
							columns: this.computedColumns,
							nestedHeaders: this.nestedHeaders && this.nestedHeaders.length ? this.nestedHeaders : undefined,
							rowResize: true,
							columnDrag: false,
							tableWidth: '100%',
							tableOverflow: true,
							tableHeight: this.sheetHeight,
							lazyLoading: false,
							freezeColumns: 3,
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
