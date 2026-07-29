<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi Tổng kết cuối năm học.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-tong-ket-nam-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-tong-ket-nam-hoc',
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
					// Năng lực cốt lõi
					{ title: 'Tự phục vụ, tự quản', width: 150 },
					{ title: 'Hợp tác', width: 130 },
					{ title: 'Tự học và giải quyết vấn đề', width: 180 },
					// Phẩm chất chủ yếu
					{ title: 'Yêu nước', width: 120 },
					{ title: 'Nhân ái', width: 120 },
					{ title: 'Chăm chỉ', width: 120 },
					{ title: 'Trung thực', width: 120 },
					{ title: 'Trách nhiệm', width: 120 },
					// Tổng kết Cuối năm
					{ title: 'Đánh giá KQ Rèn luyện & Học tập', width: 240 },
					{ title: 'Danh hiệu Khen thưởng cuối năm', width: 240 },
					{ title: 'Hoàn thành chương trình lớp học/tiểu học', width: 260 },
					{ title: 'Ghi chú / Nhận xét tổng kết', width: 250 }
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
						{ title: 'NĂNG LỰC CỐT LÕI (TT27)', colspan: 3 },
						{ title: 'PHẨM CHẤT CHỦ YẾU (TT27)', colspan: 5 },
						{ title: 'ĐÁNH GIÁ TỔNG KẾT CUỐI NĂM HỌC', colspan: 4 }
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
						saved.NLTuPhucVu || '',
						saved.NLHopTac || '',
						saved.NLTuHoc || '',
						saved.PCYeuNuoc || '',
						saved.PCNhanAi || '',
						saved.PCChamChi || '',
						saved.PCTrungThuc || '',
						saved.PCTrachNhiem || '',
						saved.KetQuaRenLuyenHocTap || '',
						saved.KhenThuongCuoiNam || '',
						saved.HoanThanhChuongTrinh || '',
						saved.GhiChuCuoiNam || ''
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
