<template>
	<div>
		<template v-if="view === 'thong-tin'">
			<v-card-text class="pa-0 so-gvcn-sheet-wrap" :style="{ height: sheetHeight, 'overflow-y': 'auto' }">
				<template v-if="rows && rows.length">
					<div ref="sheetRef" class="w-100 so-gvcn-sheet so-gvcn-student-sheet"></div>
				</template>
				<uc-card-empty v-else />
			</v-card-text>
		</template>

		<template v-else>
			<div class="pa-3 overflow-y-auto bg-grey-lighten-4" :style="{ height: sheetHeight }">
					<v-card class="mb-4" variant="outlined">
						<v-card-title class="text-subtitle-1 font-weight-bold">I. BAN CÁN SỰ LỚP</v-card-title>
						<v-table density="compact" class="organization-table">
							<thead>
								<tr>
									<th class="text-center stt-column">STT</th>
									<th>HỌ VÀ TÊN HỌC SINH</th>
									<th>NHIỆM VỤ</th>
									<th>GHI CHÚ</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(row, index) in localCanBoRows" :key="'can-bo-' + index">
									<td class="text-center">{{ index + 1 }}</td>
									<td>
										<v-autocomplete v-model="row.HocSinh" :items="studentNames"
											density="compact" variant="plain" hide-details clearable
											@update:model-value="onCanBoStudentChange(row)" />
									</td>
									<td>
										<v-select v-model="row.ChucVu" :items="studentDutyOptions"
											density="compact" variant="plain" hide-details clearable />
									</td>
									<td><v-text-field v-model="row.GhiChu" density="compact" variant="plain" hide-details /></td>
								</tr>
							</tbody>
						</v-table>
					</v-card>

					<v-card class="mb-4" variant="outlined">
						<v-card-title class="text-subtitle-1 font-weight-bold">
							II. BAN ĐẠI DIỆN CHA MẸ HỌC SINH LỚP
						</v-card-title>
						<v-table density="compact" class="organization-table">
							<thead>
								<tr>
									<th class="text-center stt-column">STT</th>
									<th>HỌ VÀ TÊN PHỤ HUYNH</th>
									<th>NHIỆM VỤ</th>
									<th>GHI CHÚ</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(row, index) in localParentRows" :key="'ph-' + index">
									<td class="text-center">{{ index + 1 }}</td>
									<td><v-text-field v-model="row.ChaMe" density="compact" variant="plain" hide-details /></td>
									<td>
										<v-select v-model="row.NhiemVu" :items="parentDutyOptions"
											density="compact" variant="plain" hide-details clearable />
									</td>
									<td><v-text-field v-model="row.GhiChu" density="compact" variant="plain" hide-details /></td>
								</tr>
							</tbody>
						</v-table>
					</v-card>

					<v-card variant="outlined">
						<v-card-title class="text-subtitle-1 font-weight-bold">
							III. DANH SÁCH HỌC SINH CHIA THEO TỔ/NHÓM
						</v-card-title>
						<v-table density="compact" class="organization-table">
							<thead>
								<tr>
									<th class="group-column">TỔ/NHÓM</th>
									<th>HỌ VÀ TÊN</th>
									<th>NHIỆM VỤ</th>
									<th>BAN</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(row, index) in localGroupRows" :key="'to-' + row.HocSinhID + '-' + index">
									<td><v-text-field v-model="row.ToNhom" density="compact" variant="plain" hide-details /></td>
									<td>{{ row.HocSinh }}</td>
									<td><v-text-field v-model="row.NhiemVu" density="compact" variant="plain" hide-details /></td>
									<td><v-text-field v-model="row.Ban" density="compact" variant="plain" hide-details /></td>
								</tr>
							</tbody>
						</v-table>
					</v-card>
			</div>
		</template>
	</div>
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
		sheetHeight: { type: String, default: 'calc(100vh - 230px)' },
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
			} catch (e) {}
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
					this.sheetInstance = jspreadsheet(container, {
						worksheets: [{
							data: this.rows,
							columns: this.computedColumns,
							nestedHeaders: this.computedNestedHeaders,
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
	},
	watch: {
		view(value) {
			if (value === 'thong-tin') this.initSheet()
		},
		students: {
			deep: true,
			handler() {
				this.syncOrganizationRows()
			}
		},
		canBoRows: {
			deep: true,
			handler() {
				this.syncOrganizationRows()
			}
		},
		parentRows: {
			deep: true,
			handler() {
				this.syncOrganizationRows()
			}
		},
		groupRows: {
			deep: true,
			handler() {
				this.syncOrganizationRows()
			}
		},
		rows: {
			deep: true,
			handler() {
				this.initSheet()
			}
		},
		nestedHeaders: {
			deep: true,
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

<style scoped>
	.organization-table {
		table-layout: fixed;
	}

	.organization-table th {
		background: #f5f5f5;
		font-weight: 700 !important;
	}

	.organization-table th,
	.organization-table td {
		border: 1px solid rgba(0, 0, 0, 0.18);
	}

	.stt-column {
		width: 64px;
	}

	.group-column {
		width: 130px;
	}
</style>
