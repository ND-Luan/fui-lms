<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi học sinh cần quan tâm.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-hs-can-quan-tam-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-hs-can-quan-tam',
		props: {
			selectedLopID: { type: [String, Number], default: '__ALL__' },
			students: { type: Array, default: () => [] },
			savedRows: { type: Array, default: () => [] },
			sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
			sheetKey: { type: [Number, String], default: 0 }
		},
		data() {
			return {
				instance: null,
				timer: null,
				columns: [
					{ title: 'MÃ HỌC SINH', width: 120, readOnly: true },
					{ title: 'SỐ DANH BỘ', width: 120, readOnly: true },
					{ title: 'HỌ TÊN HỌC SINH', width: 200, readOnly: true },
					{ title: 'HS cần hỗ trợ đặc biệt (ghi rõ vấn đề-nếu có)', width: 280 },
					{ title: 'THÁNG 8', width: 160 },
					{ title: 'THÁNG 9', width: 160 },
					{ title: 'THÁNG 10', width: 160 },
					{ title: 'THÁNG 11', width: 160 },
					{ title: 'THÁNG 12', width: 160 },
					{ title: 'NHẬN XÉT HKI', width: 250 },
					{ title: 'KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN HKI', width: 260 },
					{ title: 'THÁNG 01 VÀ 02', width: 170 },
					{ title: 'THÁNG 3', width: 160 },
					{ title: 'THÁNG 4', width: 160 },
					{ title: 'THÁNG 5', width: 160 },
					{ title: 'NHẬN XÉT CUỐI NĂM HỌC', width: 250 },
					{
						title: 'KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN CUỐI NĂM HỌC',
						width: Math.max(
							280,
							Array.from('KẾT QUẢ HỌC TẬP VÀ RÈN LUYỆN CUỐI NĂM HỌC').length * 8 + 32
						)
					}
				]
			}
		},
		watch: {
			selectedLopID() {
				this.scheduleInit()
			},
			students: {
				deep: false,
				handler() {
					this.scheduleInit()
				}
			},
			savedRows: {
				deep: false,
				handler() {
					this.scheduleInit()
				}
			},
			sheetKey() {
				this.scheduleInit()
			}
		},
		mounted() {
			this.scheduleInit()
		},
		beforeUnmount() {
			if (this.timer) clearTimeout(this.timer)
			this.destroySheet()
		},
		computed: {
			nestedHeaders() {
				return [
					[
						{ title: '', colspan: 3 },
						{ title: 'GHI NHẬN/ THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH CẦN QUAN TÂM', colspan: 14 }
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
			scheduleInit() {
				if (this.timer) clearTimeout(this.timer)
				this.$nextTick(() => {
					this.timer = window.setTimeout(() => {
						this.timer = null
						this.initSheet()
					}, 50)
				})
			},
			buildRows() {
				const findSaved = (hslopID) => (this.savedRows || []).find(r => r.HSLopID === hslopID) || {}
				return (this.students || []).map((student) => {
					const saved = findSaved(student.HSLopID)
					return [
						student.MaHocSinh || student.HocSinhID || '',
						student.SoDanhBo || '',
						student.HoTen || student.HoTenHocSinh || '',
						saved.CanHoTroDacBiet || '',
						saved.Thang8 || '',
						saved.Thang9 || '',
						saved.Thang10 || '',
						saved.Thang11 || '',
						saved.Thang12 || '',
						saved.NhanXetHKI || '',
						saved.KetQuaHKI || '',
						saved.Thang1_2 || '',
						saved.Thang3 || '',
						saved.Thang4 || '',
						saved.Thang5 || '',
						saved.NhanXetCuoiNam || '',
						saved.KetQuaCuoiNam || ''
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
				const container = this.$refs.sheetRef
				if (!container) return

				this.destroySheet()
				container.innerHTML = ''
				if (typeof jspreadsheet !== 'function') return

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
		}
	}
</script>
