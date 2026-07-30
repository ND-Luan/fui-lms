<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi tình hình Phụ huynh tham dự họp.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-theo-doi-ph-hop-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-theo-doi-ph-hop',
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
					{ title: 'STT', width: 60, readOnly: true, align: 'center' },
					{ title: 'Mã học sinh', width: 110, readOnly: true, align: 'center' },
					{ title: 'Số danh bộ', width: 110, readOnly: true, align: 'center' },
					{ title: 'Họ và tên học sinh', width: 250, readOnly: true },
					{ title: 'I', width: 100, type: 'checkbox' },
					{ title: 'II', width: 100, type: 'checkbox' },
					{ title: 'III', width: 100, type: 'checkbox' },
					{ title: 'Ghi chú', width: 350 }
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
						{ title: 'Kiểm diện PH đi họp', colspan: 3 },
						{ title: '', colspan: 1 }
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
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			buildRows() {
				const findSaved = (hslopID) => (this.savedRows || [])
					.find(r => String(r.HSLopID) === String(hslopID)) || {}
				return (this.students || []).map((student, idx) => {
					const saved = findSaved(student.HSLopID)
					return [
						idx + 1,
						student.MaHocSinh || student.HocSinhID || '',
						student.SoDanhBo || '',
						student.HoTen || student.HoTenHocSinh || '',
						!!(saved.Lan1 || saved.DauNamCoMat),
						!!(saved.Lan2 || saved.HK1CoMat),
						!!(saved.Lan3 || saved.CuoiNamCoMat),
						saved.GhiChu || ''
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
					}
				})
			}
		}
	}
</script>
