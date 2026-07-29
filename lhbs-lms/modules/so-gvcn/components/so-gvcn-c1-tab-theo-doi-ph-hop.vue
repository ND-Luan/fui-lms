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
					{ title: 'STT', width: 60, readOnly: true },
					{ title: 'SỐ DANH BỘ', width: 120, readOnly: true },
					{ title: 'HỌ VÀ TÊN HỌC SINH', width: 200, readOnly: true },
					{ title: 'HỌ VÀ TÊN PHỤ HUYNH', width: 200 },
					// Họp PH Đầu năm
					{ title: 'Có mặt (X)', width: 90, align: 'center' },
					{ title: 'Vắng mặt', width: 100, align: 'center' },
					{ title: 'Ý kiến / Ghi chú Đầu năm', width: 220 },
					// Họp PH Cuối HKI
					{ title: 'Có mặt (X)', width: 90, align: 'center' },
					{ title: 'Vắng mặt', width: 100, align: 'center' },
					{ title: 'Ý kiến / Ghi chú Cuối HKI', width: 220 },
					// Họp PH Cuối năm (HKII)
					{ title: 'Có mặt (X)', width: 90, align: 'center' },
					{ title: 'Vắng mặt', width: 100, align: 'center' },
					{ title: 'Ý kiến / Ghi chú Cuối năm', width: 220 }
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
						{ title: 'HỌP PHHS ĐẦU NĂM HỌC', colspan: 3 },
						{ title: 'HỌP PHHS CUỐI HỌC KỲ I', colspan: 3 },
						{ title: 'HỌP PHHS CUỐI NĂM HỌC', colspan: 3 }
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
				const findSaved = (hslopID) => (this.savedRows || []).find(r => r.HSLopID === hslopID) || {}
				return (this.students || []).map((student, idx) => {
					const saved = findSaved(student.HSLopID)
					const parentName = student.HoTenCha || student.HoTenMe || student.HoTenNguoiDoDau || ''
					return [
						idx + 1,
						student.SoDanhBo || '',
						student.HoTen || student.HoTenHocSinh || '',
						saved.TenPhuHuynh || parentName,
						saved.DauNamCoMat || '',
						saved.DauNamVangMat || '',
						saved.DauNamYKien || '',
						saved.HK1CoMat || '',
						saved.HK1VangMat || '',
						saved.HK1YKien || '',
						saved.CuoiNamCoMat || '',
						saved.CuoiNamVangMat || '',
						saved.CuoiNamYKien || ''
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
		}
	}
</script>
