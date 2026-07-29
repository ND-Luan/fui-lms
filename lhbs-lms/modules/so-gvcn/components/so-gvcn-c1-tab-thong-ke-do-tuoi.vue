<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để xem thống kê độ tuổi học sinh.
		</v-alert>
		<div v-else class="so-gvcn-sheet-wrap">
			<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-thong-ke-do-tuoi-sheet"></div>
		</div>
	</v-card-text>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-thong-ke-do-tuoi',
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
					{ title: 'NHÓM TUỔI / NĂM SINH', width: 220, readOnly: true },
					{ title: 'TỔNG SỐ HỌC SINH', width: 150, type: 'numeric' },
					{ title: 'NAM', width: 120, type: 'numeric' },
					{ title: 'NỮ', width: 120, type: 'numeric' },
					{ title: 'DÂN TỘC THIỂU SỐ', width: 160, type: 'numeric' },
					{ title: 'KHUYẾT TẬT / CẦN HỖ TRỢ', width: 200, type: 'numeric' },
					{ title: 'TỶ LỆ (%)', width: 120, type: 'numeric' },
					{ title: 'GHI CHÚ / ĐÁNH GIÁ', width: 280 }
				],
				defaultAgeGroups: [
					'Đúng độ tuổi',
					'Trước 1 tuổi (Sớm tuổi)',
					'Sau 1 tuổi (Trễ 1 tuổi)',
					'Sau 2 tuổi (Trễ 2 tuổi)',
					'Sau 3 tuổi trở lên (Khác)',
					'TỔNG CỘNG'
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
			},
			students: {
				deep: true,
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
						{ title: '', colspan: 2 },
						{ title: 'THỐNG KÊ ĐỘ TUỔI HỌC SINH LỚP', colspan: 5 },
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
				const findSaved = (groupIndex, groupText) => {
					return (this.savedRows || []).find(r => r.GroupIndex === groupIndex || r.GroupText === groupText) || {}
				}

				return this.defaultAgeGroups.map((groupText, idx) => {
					const saved = findSaved(idx, groupText)
					const isTotal = groupText === 'TỔNG CỘNG'
					return [
						isTotal ? '' : idx + 1,
						groupText,
						saved.TongSo ?? '',
						saved.Nam ?? '',
						saved.Nu ?? '',
						saved.DanTocThieuSo ?? '',
						saved.KhuyetTat ?? '',
						saved.TyLe ?? '',
						saved.GhiChu ?? ''
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