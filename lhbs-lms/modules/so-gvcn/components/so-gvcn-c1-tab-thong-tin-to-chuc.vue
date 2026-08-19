<template>
	<v-card>
		<div class="w-100" style="overflow: auto;">
			<template v-if="rows && rows.length">
				<div ref="sheetRef"></div>
			</template>
			<uc-card-empty v-else />
		</div>
	</v-card>
</template>

<script>
	export default {
		name: 'so-gvcn-c1-tab-thong-tin-to-chuc',
		props: {
			rows: { type: Array, default: () => [] },
			view: { type: String, default: 'thong-tin' },
			students: { type: Array, default: () => [] },
			canBoRows: { type: Array, default: () => [] },
			parentRows: { type: Array, default: () => [] },
			groupRows: { type: Array, default: () => [] },
			sheetHeight: { type: String },
			sheetKey: { type: [Number, String], default: 0 },
			nestedHeaders: { type: Array, default: () => [] }
		},
		data() {
			return {
				sheetInstance: null,
				localCanBoRows: [],
				localParentRows: [],
				localGroupRows: [],
				studentDutyOptions: [
					'Lớp trưởng', 'Lớp phó học tập', 'Lớp phó văn thể mỹ',
					'Tổ trưởng', 'Tổ phó', 'Thủ quỹ'
				],
				parentDutyOptions: ['Trưởng ban', 'Phó ban', 'Thành viên'],
				baseColumns: [
					{ title: 'STT', width: 50, readOnly: true },
					{ title: 'HỌ VÀ TÊN HỌC SINH', width: 220, readOnly: true, align: 'left' },
					{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
					{ title: 'NGÀY, THÁNG, NĂM SINH', width: 150, readOnly: true },
					{ title: 'NỮ', width: 50, readOnly: true },
					{ title: 'DÂN TỘC', width: 90, readOnly: true },
					{ title: 'XẾP LOẠI KQGD NĂM HỌC 2025-2026', width: 220, readOnly: true },
					{ title: 'KHEN THƯỞNG NĂM HỌC 2025-2026', width: 240, readOnly: true },
					{ title: 'NHẬN XÉT CỦA GVCN', width: 380, align: 'left', readOnly: true },
					{ title: 'SỞ THÍCH, NĂNG KHIẾU, HOÀN CẢNH GIA ĐÌNH', width: 300, align: 'left', readOnly: true },
					{ title: 'HỌ VÀ TÊN CHA', width: 160, readOnly: true },
					{ title: 'NGHỀ NGHIỆP CHA', width: 140, readOnly: true },
					{ title: 'SĐT CHA', width: 110, readOnly: true },
					{ title: 'HỌ VÀ TÊN MẸ', width: 160, readOnly: true },
					{ title: 'NGHỀ NGHIỆP MẸ', width: 140, readOnly: true },
					{ title: 'SĐT MẸ', width: 110, readOnly: true },
					{ title: 'NGƯỜI ĐỠ ĐẦU', width: 150, readOnly: true },
					{ title: 'SĐT NGƯỜI ĐỠ ĐẦU', width: 130, readOnly: true },
					{ title: 'ĐỊA CHỈ', width: 280, align: 'left', readOnly: true },
					{ title: 'GHI CHÚ', width: 220, align: 'left', readOnly: true }
				]
			}
		},
		computed: {
			studentNames() {
				return (this.students || []).map(row => row.HoTen || row.HoTenHocSinh || '').filter(Boolean)
			},
			computedNestedHeaders() {
				if (this.nestedHeaders && this.nestedHeaders.length) return this.nestedHeaders
				return [[
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 },
					{ title: 'KẾT QUẢ NĂM HỌC 2025-2026', colspan: 2 },
					{ title: 'ĐẶC ĐIỂM, TÌNH HÌNH HỌC SINH', colspan: 2 },
					{ title: 'THÔNG TIN GIA ĐÌNH', colspan: 8 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 }
				]]
			},
			computedColumns() {
				if (!this.rows || !this.rows.length) return this.baseColumns
	
				return this.baseColumns.map((col, colIdx) => {
					let maxLen = (col.title || '').length
					for (let i = 0; i < Math.min(this.rows.length, 50); i++) {
						const val = this.rows[i] ? this.rows[i][colIdx] : null
						if (val != null) {
							const strLen = String(val).trim().length
							if (strLen > maxLen) maxLen = strLen
						}
					}
					const autoWidth = Math.max(50, Math.min(maxLen * 8 + 20, 400))
					return {
						...col,
						width: col.width ? Math.max(col.width, autoWidth) : Math.ceil(autoWidth)
					}
				})
			}
		},
		methods: {
			copyRows(rows, minimumLength) {
				const copied = (rows || []).map(row => Array.isArray(row)
					? row.slice()
					: { ...row })
				while (copied.length > minimumLength) {
					const lastRow = copied[copied.length - 1]
					const values = Array.isArray(lastRow) ? lastRow.slice(1) : Object.values(lastRow)
					if (values.some(value => value !== null && value !== undefined && String(value).trim() !== '')) break
					copied.pop()
				}
				while (copied.length < minimumLength) copied.push({})
				return copied
			},
			syncOrganizationRows() {
				this.localCanBoRows = this.copyRows(this.canBoRows, 6).map((row, index) => ({
					STT: row.STT || row[0] || index + 1,
					HocSinhID: row.HocSinhID || row.MaHocSinh || row[1] || '',
					HocSinh: row.HocSinh || row[2] || '',
					ChucVu: row.ChucVu || row[3] || '',
					GhiChu: row.GhiChu || row[4] || ''
				}))
				this.localParentRows = this.copyRows(this.parentRows, 6).map((row, index) => ({
					STT: row.STT || row[0] || index + 1,
					HocSinhID: row.HocSinhID || row.MaHocSinh || row[1] || '',
					HocSinh: row.HocSinh || row[2] || '',
					ChaMe: row.ChaMe || row[3] || '',
					NgheNghiep: row.NgheNghiep || row[4] || '',
					DienThoai: row.DienThoai || row[5] || '',
					NhiemVu: row.NhiemVu || row[6] || '',
					GhiChu: row.GhiChu || row[7] || ''
				}))
				const savedGroupRows = this.groupRows || []
				this.localGroupRows = (this.students || []).map(student => {
					const saved = savedGroupRows.find(row =>
						(row.HSLopID && String(row.HSLopID) === String(student.HSLopID))
						|| (row.HocSinhID && String(row.HocSinhID) === String(student.HocSinhID))) || {}
					return {
						HSLopID: student.HSLopID || '',
						HocSinhID: student.HocSinhID || '',
						MaHocSinh: student.MaHocSinh || '',
						HocSinh: student.HoTen || student.HoTenHocSinh || '',
						ToNhom: saved.ToNhom || student.ToNhom || '',
						NhiemVu: saved.NhiemVu || student.NhiemVuTo || '',
						Ban: saved.Ban || student.Ban || ''
					}
				})
			},
			onCanBoStudentChange(row) {
				const student = (this.students || []).find(item =>
					(item.HoTen || item.HoTenHocSinh || '') === row.HocSinh)
				if (!student) return
				row.HSLopID = student.HSLopID || ''
				row.HocSinhID = student.HocSinhID || ''
				row.MaHocSinh = student.MaHocSinh || student.HocSinhID || ''
			},
			getOrganizationRows() {
				return {
					canBoRows: this.localCanBoRows,
					parentRows: this.localParentRows,
					groupRows: this.localGroupRows.map((row, index) => ({
						...row,
						RowIndex: index + 1
					}))
				}
			},
			destroySheet() {
				if (!this.sheetInstance) return
				try {
					const sheet = Array.isArray(this.sheetInstance) ? this.sheetInstance[0] : this.sheetInstance
					if (sheet && typeof sheet.destroy === 'function') sheet.destroy()
				} catch (e) { }
				this.sheetInstance = null
			},
			initSheet() {
				this.$nextTick(() => {
					const container = this.$refs.sheetRef
					if (!container || !this.rows || !this.rows.length) {
						this.destroySheet()
						return
					}
	
					this.destroySheet()
					container.innerHTML = ''
	
					if (typeof jspreadsheet === 'function') {
						this.sheetInstance = soGvcnJspreadsheet.create(container, {
							worksheets: [{
								data: this.rows,
								columns: this.computedColumns,
								nestedHeaders: this.computedNestedHeaders,
								rowResize: true,
								columnDrag: false,
						rowDrag: false,
						columnSorting: false,
								tableWidth: '100%',
								tableOverflow: true,
								tableHeight: "calc(100vh - 114px)", 
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
		},
		watch: {
			view(value) {
				if (value === 'thong-tin') this.initSheet()
			},
			students: {
				handler() {
					this.syncOrganizationRows()
				}
			},
			canBoRows: {
				handler() {
					this.syncOrganizationRows()
				}
			},
			parentRows: {
				handler() {
					this.syncOrganizationRows()
				}
			},
			groupRows: {
				handler() {
					this.syncOrganizationRows()
				}
			},
			rows: {
				handler() {
					this.initSheet()
				}
			},
			nestedHeaders: {
				handler() {
					this.initSheet()
				}
			},
			sheetKey() {
				this.initSheet()
			}
		},
		mounted() {
			this.syncOrganizationRows()
			this.initSheet()
		},
		beforeUnmount() {
			this.destroySheet()
		}
	}
</script>