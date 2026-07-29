<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi BHYT và BHTN của học sinh.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-theo-doi-bhyt-bhtn-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-theo-doi-bhyt-bhtn',
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
					{ title: 'NGÀY SINH', width: 110, readOnly: true },
					// Bảo hiểm y tế (BHYT)
					{ title: 'Số thẻ BHYT', width: 160 },
					{ title: 'Đã tham gia (X)', width: 110, align: 'center' },
					{ title: 'Diện miễn/giảm', width: 140 },
					{ title: 'Hạn sử dụng BHYT', width: 140 },
					// Bảo hiểm thân thể / Tai nạn (BHTN)
					{ title: 'Đã tham gia (X)', width: 110, align: 'center' },
					{ title: 'Số tiền / Đợt đóng', width: 140 },
					{ title: 'Ghi chú / Trạng thái', width: 240 }
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
						{ title: 'BẢO HIỂM Y TẾ (BHYT)', colspan: 4 },
						{ title: 'BẢO HIỂM THÂN THỂ / TAI NẠN (BHTN)', colspan: 2 },
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
				const findSaved = (hslopID) => (this.savedRows || []).find(r => r.HSLopID === hslopID) || {}
				return (this.students || []).map((student, idx) => {
					const saved = findSaved(student.HSLopID)
					return [
						idx + 1,
						student.SoDanhBo || '',
						student.HoTen || student.HoTenHocSinh || '',
						student.NgaySinh || '',
						saved.SoTheBHYT || student.MaSoBHXH || '',
						saved.BHYTDaThamGia || '',
						saved.BHYTMienGiam || '',
						saved.BHYTHanSuDung || '',
						saved.BHTNDaThamGia || '',
						saved.BHTNSoTien || '',
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
