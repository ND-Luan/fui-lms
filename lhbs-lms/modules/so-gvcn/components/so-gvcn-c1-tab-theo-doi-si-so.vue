<template>
	<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
		<v-alert v-if="selectedLopID === '__ALL__'" type="info" variant="tonal" density="compact" class="ma-2">
			Chọn một lớp ở thanh trên để theo dõi sĩ số học sinh theo từng tháng.
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
				defaultMonths: [
					'Tháng 8',
					'Tháng 9',
					'Tháng 10',
					'Tháng 11',
					'Tháng 12',
					'Tháng 1',
					'Tháng 2',
					'Tháng 3',
					'Tháng 4',
					'Tháng 5'
				]
			}
		},
		watch: {
			selectedLopID() {
				this.initSheet()
			},
			students: {
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
		methods: {

		safeParseJson(val, fallback = null) {
			if (!val) return fallback;
			if (typeof val !== 'string') return val;
			let currentVal = val;
			while (typeof currentVal === 'string' && (currentVal.trim().startsWith('[') || currentVal.trim().startsWith('{'))) {
				try {
					const parsed = JSON.parse(currentVal);
					if (typeof parsed === 'string') {
						currentVal = parsed;
					} else {
						return parsed;
					}
				} catch (e) { break; }
			}
			return fallback !== null ? fallback : currentVal;
		},

			getInstance() {
				return this.instance
			},
			getRows() {
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance
				return sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			},
			// Tự động phân tích danh sách dân tộc xuất hiện trong lớp
			getEthnicList() {
				const ethnicSet = new Set()
				;(this.students || []).forEach(st => {
					const dt = (st.TenDanToc || st.DanToc || '').trim()
					if (dt) ethnicSet.add(dt)
				})
				const list = Array.from(ethnicSet)
				if (list.includes('Kinh')) {
					return ['Kinh', ...list.filter(e => e !== 'Kinh')]
				}
				return list.length ? list : ['Kinh']
			},

			// Dự phòng cho giai đoạn sau: tự động tính tổng số, nữ và dân tộc.
			// Hiện tại chưa gọi hàm này theo yêu cầu nghiệp vụ.
			getClassSummary(ethnicList) {
				let total = 0, nu = 0
				const ethnicMap = {}
				ethnicList.forEach(e => ethnicMap[e] = 0)

				;(this.students || []).forEach(st => {
					total++
					const isNu = (st.GioiTinh === 'Nữ' || st.Phai === 'x' || st.IsNu)
					if (isNu) nu++

					const dt = (st.TenDanToc || st.DanToc || '').trim()
					if (dt && ethnicMap[dt] !== undefined) {
						ethnicMap[dt]++
					}
				})

				return { total, nu, ethnicMap }
			},

			buildColumnsAndHeaders() {
				const ethnicList = this.getEthnicList()
				const columns = [
					{ title: 'Thời điểm', width: 140, readOnly: true },
					{ title: 'Tổng số', width: 90, align: 'center', type: 'text', readOnly: false },
					{ title: 'Nữ', width: 90, align: 'center', type: 'text', readOnly: false }
				]

				// Nhóm Dân tộc
				ethnicList.forEach(eth => {
					columns.push({ title: eth, width: 100, align: 'center', type: 'text', readOnly: false })
				})

				// Cột Đội viên, Nhi đồng, Con liệt sĩ, Con thương binh
				columns.push({ title: 'Đội viên', width: 100, align: 'center', type: 'text', readOnly: false })
				columns.push({ title: 'Nhi đồng', width: 100, align: 'center', type: 'text', readOnly: false })
				columns.push({ title: 'Con liệt sĩ', width: 100, align: 'center', type: 'text', readOnly: false })
				columns.push({ title: 'Con thương binh', width: 120, align: 'center', type: 'text', readOnly: false })

				// Khuyết tật (Có đánh giá, Không đánh giá)
				columns.push({ title: 'Có đánh giá', width: 110, align: 'center', type: 'text', readOnly: false })
				columns.push({ title: 'Không đánh giá', width: 120, align: 'center', type: 'text', readOnly: false })

				// Hộ nghèo, Lí do tăng giảm
				columns.push({ title: 'Hộ nghèo', width: 100, align: 'center', type: 'text', readOnly: false })
				columns.push({ title: 'Học sinh tăng giảm, lí do', width: 280, readOnly: false })

				const nestedHeaders = [
					[
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: 'Dân tộc', colspan: ethnicList.length },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 },
						{ title: 'Khuyết tật', colspan: 2 },
						{ title: '', colspan: 1 },
						{ title: '', colspan: 1 }
					]
				]

				return { columns, nestedHeaders, ethnicList }
			},

			buildRows(ethnicList) {
				const findSaved = (thoiDiem) => (this.savedRows || []).find(r => r.ThoiDiem === thoiDiem) || {}

				return this.defaultMonths.map(thoiDiem => {
					const saved = findSaved(thoiDiem)
					let savedEthnicCounts = saved.DanTocJson || saved.DanToc || {}
					if (typeof savedEthnicCounts === 'string') {
						try {
							savedEthnicCounts = this.safeParseJson(savedEthnicCounts, [])
						} catch (error) {
							savedEthnicCounts = {}
						}
					}
					const ethnicValues = ethnicList.map(eth => savedEthnicCounts?.[eth] ?? '')
					return [
						thoiDiem,
						saved.TongSo ?? '',
						saved.Nu ?? '',
						...ethnicValues,
						saved.DoiVien ?? '',
						saved.NhiDong ?? '',
						saved.ConLietSi ?? '',
						saved.ConThuongBinh ?? '',
						saved.KhuyetTatCoDanhGia ?? saved.KhuyetTat ?? '',
						saved.KhuyetTatKhongDanhGia ?? '',
						saved.HoNgheo ?? '',
						saved.TangGiamLiDo ?? ''
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

					const { columns, nestedHeaders, ethnicList } = this.buildColumnsAndHeaders()
					const data = this.buildRows(ethnicList)

					if (typeof jspreadsheet === 'function') {
						this.instance = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								data: data,
								columns: columns,
								nestedHeaders: nestedHeaders,
								rowResize: true,
								columnDrag: false,
						rowDrag: false,
						columnSorting: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: this.sheetHeight,
								lazyLoading: false,
								freezeColumns: 1,
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