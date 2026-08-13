<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, overflow: 'hidden' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi thành tích & khen thưởng học sinh.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-theo-doi-thanh-tich-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-theo-doi-thanh-tich',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' }
		},
		data() {
			return {
				instance: null,
				columns: [
					{ title: 'STT', width: 50, readOnly: true, align: 'center' },
					{ title: 'Mã học sinh', width: 110, readOnly: true },
					{ title: 'Số danh bộ', width: 110, readOnly: true },
					{ title: 'Họ và tên học sinh', width: 220, readOnly: true },
					{ title: 'HKI', width: 350 },
					{ title: 'Cuối năm học', width: 350, align: 'justify' }
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
			},
			students: {
				deep: false,
				handler() {
					this.initSheet()
				}
			},
			savedRows: {
				deep: false,
				handler() {
					this.initSheet()
				}
			}
		},
		mounted() {
			this.initSheet()
		},
		beforeUnmount() {
			this.destroySheet()
		},
		computed: {
			nestedHeaders() {
				return [
					[
						{ title: '', colspan: 4 },
						{ title: 'Nội dung khen thưởng/ Thành tích đạt được', colspan: 2 }
					]
				]
			}
		},
		methods: {
			getInstance() {
				return this.instance
			},
			getRows() {
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
				if (sheet && typeof sheet.closeEditor === 'function') {
					try { sheet.closeEditor(true) } catch (error) {}
				}
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			buildRows() {
				const findSaved = (hslopID) => (this.savedRows || []).find(r => Number(r.HSLopID) === Number(hslopID)) || {}
				return (this.students || []).map((student, idx) => {
					const saved = findSaved(student.HSLopID)
					return [
						idx + 1,
						student.MaHocSinh || student.HocSinhID || '',
						student.SoDanhBo || '',
						student.HoTen || student.HoTenHocSinh || '',
						saved.HKI || saved.ThanhTich || '',
						saved.CuoiNam || ''
					]
				})
			},
			destroySheet() {
				if (!this.instance) return
				try {
					const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
					else if (this.$refs.sheetRef && typeof jspreadsheet !== 'undefined'
						&& typeof jspreadsheet.destroy === 'function') {
						jspreadsheet.destroy(this.$refs.sheetRef)
					}
				} catch (error) {}
				this.instance = null
			},
			initSheet() {
				if (this.selectedLopID === '__ALL__') {
					this.destroySheet()
					return
				}
				this.$nextTick(() => {
					const container = this.$refs.sheetRef
					if (!container) return
					this.destroySheet()
					container.innerHTML = ''
					if (typeof jspreadsheet === 'function') {
						this.instance = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								data: this.buildRows(),
								columns: this.columns,
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
						const worksheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
						if (worksheet && typeof worksheet.hideColumn === 'function') {
							worksheet.hideColumn(2)
							// Ẩn HKI trên giao diện nhưng không ẩn nested header chứa HKI và Cuối năm học.
							const hkiCells = container.querySelectorAll('[data-x="4"]')
							hkiCells.forEach(cell => {
								cell.style.display = 'none'
							})
							const hkiColumn = container.querySelectorAll('colgroup col')[5]
							if (hkiColumn) hkiColumn.style.display = 'none'
							window.requestAnimationFrame(() => soGvcnJspreadsheet.syncNestedHeaders(container, [4]))
						}
					}
				})
			}
		}
	}
</script>
