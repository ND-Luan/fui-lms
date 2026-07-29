<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi biến động sĩ số học sinh theo tháng.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-theo-doi-si-so-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-theo-doi-si-so',
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
					{ title: 'STT', width: 60, readOnly: true },
					{ title: 'MỐC / THÁNG THEO DÕI', width: 180, readOnly: true },
					{ title: 'SĨ SỐ ĐẦU THÁNG', width: 140, type: 'numeric' },
					{ title: 'NAM', width: 100, type: 'numeric' },
					{ title: 'NỮ', width: 100, type: 'numeric' },
					{ title: 'SĨ SỐ TĂNG (CHUYỂN ĐẾN)', width: 180, type: 'numeric' },
					{ title: 'SĨ SỐ GIẢM (CHUYỂN ĐI)', width: 180, type: 'numeric' },
					{ title: 'SĨ SỐ CUỐI THÁNG', width: 140, type: 'numeric' },
					{ title: 'DANH SÁCH HS BIẾN ĐỘNG / GHI CHÚ', width: 320 }
				],
				defaultMonths: [
					'Đầu năm học (Tháng 8)',
					'Tháng 9',
					'Tháng 10',
					'Tháng 11',
					'Tháng 12',
					'Cuối Học kỳ I',
					'Tháng 1 & 2',
					'Tháng 3',
					'Tháng 4',
					'Tháng 5',
					'Cuối Học kỳ II (Cuối năm)'
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
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
						{ title: '', colspan: 2 },
						{ title: 'SĨ SỐ ĐẦU KỲ / THÁNG', colspan: 3 },
						{ title: 'BIẾN ĐỘNG SĨ SỐ TRONG THÁNG', colspan: 2 },
						{ title: '', colspan: 2 }
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
				const findSaved = (mocIndex, mocText) => {
					return (this.savedRows || []).find(r => r.MocIndex === mocIndex || r.MocText === mocText) || {}
				}

				return this.defaultMonths.map((mocText, idx) => {
					const saved = findSaved(idx, mocText)
					return [
						idx + 1,
						mocText,
						saved.SiSoDauThang ?? '',
						saved.Nam ?? '',
						saved.Nu ?? '',
						saved.ChuyenDen ?? '',
						saved.ChuyenDi ?? '',
						saved.SiSoCuoiThang ?? '',
						saved.GhiChuBienDong ?? ''
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
						this.instance = jspreadsheet(container, {
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