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
					{ title: 'Họ và tên học sinh', width: 220, readOnly: true },
					{ title: 'Cuối năm học', width: 350 }
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
						{ title: '', colspan: 3 },
						{ title: 'Nội dung khen thưởng/ Thành tích đạt được', colspan: 1 }
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
					try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (error) {}
				}
				const visibleRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
				return visibleRows.map((row, index) => {
					const student = (this.students || [])[index] || {}
					const saved = (this.savedRows || []).find(item =>
						Number(item.HSLopID) === Number(student.HSLopID)) || {}
					return [
						row[0] ?? index + 1,
						row[1] ?? student.MaHocSinh ?? student.HocSinhID ?? '',
						student.SoDanhBo || '',
						row[2] ?? student.HoTen ?? student.HoTenHocSinh ?? '',
						saved.HKI || saved.ThanhTich || '',
						row[3] ?? ''
					]
				})
			},
			buildRows() {
				const findSaved = (hslopID) => (this.savedRows || []).find(r => Number(r.HSLopID) === Number(hslopID)) || {}
				return (this.students || []).map((student, idx) => {
					const saved = findSaved(student.HSLopID)
					return [
						idx + 1,
						student.MaHocSinh || student.HocSinhID || '',
						student.HoTen || student.HoTenHocSinh || '',
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
						rowDrag: false,
						columnSorting: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: this.sheetHeight,
								lazyLoading: false,
								freezeColumns: 3,
								wordWrap: true,
								allowInsertColumn: false,
								allowDeleteColumn: false,
								allowInsertRow: false,
								allowDeleteRow: false,
								showHeader: true
							}],
							contextMenu: () => false
						})
					}
				})
			}
		}
	}
</script>