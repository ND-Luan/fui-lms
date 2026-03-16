<template>
	<Global>

		<!-- Header card -->
		<v-card rounded="lg" elevation="0" border class="mb-3">
			<v-card-text class="py-3">
				<div class="d-flex align-center ga-3 flex-wrap">

					<div>
						<div class="text-overline text-medium-emphasis" style="letter-spacing:2px">Báo cáo</div>
						<div class="text-h6 font-weight-bold" style="letter-spacing:-0.5px">
							Học liệu số &amp; LMS
						</div>
					</div>

					<v-divider vertical class="mx-1" style="height:40px;align-self:center" />

					<v-select v-model="CapID" label="Chọn cấp học" :items="DSCap" item-title="title" item-value="value"
						density="compact" variant="outlined" hide-details style="max-width:180px" />

					<uc-date-range-picker v-model="dateRange" />

					<v-chip size="small" color="primary" variant="tonal" prepend-icon="mdi-calendar">
						Năm học {{ vueData.NienKhoa }}
					</v-chip>

					<v-spacer />

					<v-btn color="success" variant="tonal" prepend-icon="mdi-microsoft-excel" size="small"
						@click="onExport">
						Xuất Excel
					</v-btn>

				</div>
			</v-card-text>
		</v-card>

		<!-- Tabs -->
		<v-card rounded="lg" elevation="0" border>
			<v-tabs v-model="tab" color="primary" density="comfortable">
				<v-tab :value="0">
					<v-icon start size="16">mdi-bookshelf</v-icon>
					Học liệu số
				</v-tab>
				<v-tab :value="1">
					<v-icon start size="16">mdi-school-outline</v-icon>
					LMS
				</v-tab>
			</v-tabs>

			<v-divider />

			<v-tabs-window v-model="tab">
				<v-tabs-window-item :value="0" :key="0" :eager="true">
					<uc-hoc-lieu-so ref="refHocLieuSo" :CapID :NgayBatDau="dateRange.from"
						:NgayKetThuc="dateRange.to" />
				</v-tabs-window-item>
				<v-tabs-window-item :value="1" :key="1" :eager="true">
					<uc-lms ref="refLms" :CapID :NgayBatDau="dateRange.from" :NgayKetThuc="dateRange.to" />
				</v-tabs-window-item>
			</v-tabs-window>
		</v-card>

	</Global>
</template>

<script>
export default {
	props: [],
	data() {
		const n = new Date()
		const y = n.getFullYear()
		const m = String(n.getMonth() + 1).padStart(2, '0')
		const d = String(n.getDate()).padStart(2, '0')
		return {
			vueData,
			tab: 0,
			CapID: null,
			DSCap: [
				{ title: 'Cấp 1', value: 1 },
				{ title: 'Cấp 2', value: 2 },
				{ title: 'Cấp 3', value: 3 },
			],
			dateRange: {
				from: `${y}-${m}-01`,
				to:   `${y}-${m}-${d}`,
			},
		}
	},
	methods: {
		// 'YYYY-MM-DD' → 'dd/MM/yyyy'
		formatDate(iso) {
			if (!iso) return ''
			const [y, m, d] = iso.split('-')
			return `${d}/${m}/${y}`
		},
		// 'YYYY-MM-DD' → 'ddMMyyyy'  (dùng trong tên file)
		formatDateFile(iso) {
			if (!iso) return ''
			const [y, m, d] = iso.split('-')
			return `${d}${m}${y}`
		},

		onExport() {
			const hocLieuRef = this.$refs.refHocLieuSo
			const lmsRef     = this.$refs.refLms

			const items      = hocLieuRef?.items      ?? []
			const dataTong   = lmsRef?.dataTong       ?? []
			const dataBaiHoc = lmsRef?.dataBaiHoc     ?? []
			const dataBaiTap = lmsRef?.dataBaiTap     ?? []

			const capLabel  = this.DSCap.find(c => c.value === this.CapID)?.title ?? ''
			const nienKhoa  = vueData.NienKhoa ?? ''
			const hasRange  = this.dateRange.from && this.dateRange.to

			// Tiêu đề dùng trong sheet
			const rangeLabel = hasRange
				? `${this.formatDate(this.dateRange.from)} - ${this.formatDate(this.dateRange.to)}`
				: `Năm học ${nienKhoa}`

			// Tên file
			const dateStr = hasRange
				? `${this.formatDateFile(this.dateRange.from)}_${this.formatDateFile(this.dateRange.to)}`
				: nienKhoa

			// 3 dòng thông tin chèn đầu mỗi sheet (sau tiêu đề):
			// Row 2: Cấp học / Khoảng thời gian
			// Row 3: Từ ngày / Đến ngày
			// Row 4: (trắng)
			// → Header cột luôn ở Row 5, data luôn bắt đầu từ Row 6
			const infoRows = [
				['Cấp học:', capLabel, '', 'Khoảng thời gian:', rangeLabel],
				['Từ ngày:', hasRange ? this.formatDate(this.dateRange.from) : '(tất cả)',
				 '', 'Đến ngày:', hasRange ? this.formatDate(this.dateRange.to) : '(tất cả)'],
				[],
			]
			// Excel row của dòng data đầu tiên (1-based):
			// Row1=tiêu đề, Row2+3+4=infoRows(3), Row5=header → Row 6 = data bắt đầu
			const DATA_START = 6

			const wb = XLSX.utils.book_new()
			const makeSheet = (aoaData, colWidths) => {
				const ws = XLSX.utils.aoa_to_sheet(aoaData)
				ws['!cols'] = colWidths.map(w => ({ wch: w }))
				return ws
			}

			// ── SHEET 1: Học liệu số ─────────────────────────────────────
			// Cấu trúc riêng: sau header 'Tổng học liệu' còn có 2 dòng KPI + 1 trắng
			// Row 5: ['Tổng học liệu','Có nội dung','Chưa có']
			// Row 6: [total, hasNd, ...]
			// Row 7: []
			// Row 8: ['Khối','Môn học','Số nội dung','Trạng thái']  ← header chi tiết
			// Row 9+ : data items
			// Row 9+n: Tổng cộng
			const total    = items.length
			const hasNd    = items.filter(i => i.HocLieuCoNoiDung).length
			const HL_DATA_START = 9   // data chi tiết bắt đầu từ Excel row 9
			const HL_DATA_END   = HL_DATA_START + items.length - 1
			const HL_SUM_ROW    = HL_DATA_START + items.length
			const aoa1 = [
				[`BÁO CÁO HỌC LIỆU SỐ – ${capLabel} – ${rangeLabel}`],  // row 1
				...infoRows,                                                // row 2,3,4
				['Tổng học liệu', 'Có nội dung', 'Chưa có nội dung'],      // row 5
				[total, hasNd, total - hasNd],                              // row 6
				[],                                                         // row 7
				['Khối', 'Môn học', 'Số nội dung', 'Trạng thái'],          // row 8
				...items.map(i => [                                         // row 9+
					`Khối ${i.KhoiID}`,
					i.TenMonHoc_HienThi,
					i.TongNoiDung,
					i.HocLieuCoNoiDung ? 'Có nội dung' : 'Chưa có',
				]),
				[                                                           // row 9+n
					'Tổng cộng',
					`${total} học liệu`,
					{ f: `SUM(C${HL_DATA_START}:C${HL_DATA_END})` },
					`${hasNd} có / ${total - hasNd} chưa`,
				],
			]
			XLSX.utils.book_append_sheet(wb, makeSheet(aoa1, [12, 30, 16, 16]), 'Học liệu số')

			// ── SHEET 2: LMS Tổng quan ───────────────────────────────────
			// Row 1: tiêu đề | Row 2,3,4: info | Row 5: header | Row 6+: data
			const T_DATA_END = DATA_START + dataTong.length - 1
			const T_SUM_ROW  = DATA_START + dataTong.length
			const aoa2 = [
				[`LMS – TỔNG QUAN THEO MÔN – ${capLabel} – ${rangeLabel}`],  // row 1
				...infoRows,                                                   // row 2,3,4
				['STT', 'Môn học', 'Tổng bài học', 'Tổng bài tập'],           // row 5
				...dataTong.map((r, i) => [                                    // row 6+
					i + 1, r.TenMonHoc_HienThi, r.TotalLessons ?? 0, r.TotalAssignments ?? 0,
				]),
				[                                                              // row 6+n
					'', 'Tổng cộng',
					{ f: `SUM(C${DATA_START}:C${T_DATA_END})` },
					{ f: `SUM(D${DATA_START}:D${T_DATA_END})` },
				],
			]
			XLSX.utils.book_append_sheet(wb, makeSheet(aoa2, [6, 30, 16, 16]), 'LMS - Tổng quan')

			// ── SHEET 3: LMS Bài học ─────────────────────────────────────
			// Row 1: tiêu đề | Row 2,3,4: info | Row 5: header | Row 6+: data
			const BH_DATA_END = DATA_START + dataBaiHoc.length - 1
			const BH_SUM_ROW  = DATA_START + dataBaiHoc.length
			const aoa3 = [
				[`LMS – CHI TIẾT BÀI HỌC – ${capLabel} – ${rangeLabel}`],    // row 1
				...infoRows,                                                   // row 2,3,4
				['STT', 'Môn học', 'Tổng bài học', 'Lượt học',                // row 5
				 'HS hoàn thành', 'Tỉ lệ (%)', 'Đánh giá'],
				...dataBaiHoc.map((r, i) => {                                  // row 6+
					const rate = r.CompletionRate_Lessons ?? 0
					return [
						i + 1, r.TenMonHoc_HienThi,
						r.TotalLessons ?? 0, r.TotalProgress ?? 0, r.TotalCompleted ?? 0,
						rate / 100,
						rate >= 80 ? 'Tốt' : rate >= 50 ? 'Trung bình' : 'Thấp',
					]
				}),
				[                                                              // row 6+n
					'', 'Tổng cộng',
					{ f: `SUM(C${DATA_START}:C${BH_DATA_END})` },
					{ f: `SUM(D${DATA_START}:D${BH_DATA_END})` },
					{ f: `SUM(E${DATA_START}:E${BH_DATA_END})` },
					{ f: `IFERROR(E${BH_SUM_ROW}/D${BH_SUM_ROW},0)` },
					'Tỉ lệ TB',
				],
			]
			const ws3 = makeSheet(aoa3, [6, 30, 14, 14, 16, 14, 14])
			// Format % cột F (index 5) cho các dòng data
			dataBaiHoc.forEach((_, i) => {
				const addr = XLSX.utils.encode_cell({ r: DATA_START - 1 + i, c: 5 })
				if (ws3[addr]) ws3[addr].z = '0.0%'
			})
			XLSX.utils.book_append_sheet(wb, ws3, 'LMS - Bài học')

			// ── SHEET 4: LMS Bài tập ─────────────────────────────────────
			// Row 1: tiêu đề | Row 2,3,4: info | Row 5: header | Row 6+: data
			const BT_DATA_END = DATA_START + dataBaiTap.length - 1
			const BT_SUM_ROW  = DATA_START + dataBaiTap.length
			const aoa4 = [
				[`LMS – CHI TIẾT BÀI TẬP – ${capLabel} – ${rangeLabel}`],    // row 1
				...infoRows,                                                   // row 2,3,4
				['STT', 'Môn học', 'Tổng bài tập', 'HS được giao',            // row 5
				 'Chưa làm', 'Đang làm', 'Đã nộp', 'Đã chấm',
				 'Tỉ lệ nộp (%)', 'Tỉ lệ chấm (%)', 'Đánh giá'],
				...dataBaiTap.map((r, i) => {                                  // row 6+
					const rateNop  = r.CompletionRate_Assignments ?? 0
					const rateCham = r.CompletionRate_Graded      ?? 0
					return [
						i + 1, r.TenMonHoc_HienThi,
						r.TotalAssignments ?? 0, r.TotalAssigned ?? 0,
						r.Total_ChuaLam ?? 0, r.Total_DangLam ?? 0,
						r.Total_DaNop   ?? 0, r.Total_DaCham  ?? 0,
						rateNop  / 100, rateCham / 100,
						rateNop >= 80 ? 'Tốt' : rateNop >= 50 ? 'Trung bình' : 'Thấp',
					]
				}),
				[                                                              // row 6+n
					'', 'Tổng cộng',
					{ f: `SUM(C${DATA_START}:C${BT_DATA_END})` },
					{ f: `SUM(D${DATA_START}:D${BT_DATA_END})` },
					{ f: `SUM(E${DATA_START}:E${BT_DATA_END})` },
					{ f: `SUM(F${DATA_START}:F${BT_DATA_END})` },
					{ f: `SUM(G${DATA_START}:G${BT_DATA_END})` },
					{ f: `SUM(H${DATA_START}:H${BT_DATA_END})` },
					{ f: `IFERROR((G${BT_SUM_ROW}+H${BT_SUM_ROW})/D${BT_SUM_ROW},0)` },
					{ f: `IFERROR(H${BT_SUM_ROW}/D${BT_SUM_ROW},0)` },
					'Tỉ lệ TB',
				],
			]
			const ws4 = makeSheet(aoa4, [6, 30, 14, 16, 12, 12, 12, 12, 14, 14, 14])
			// Format % cột I,J (index 8,9) cho các dòng data
			dataBaiTap.forEach((_, i) => {
				;[8, 9].forEach(col => {
					const addr = XLSX.utils.encode_cell({ r: DATA_START - 1 + i, c: col })
					if (ws4[addr]) ws4[addr].z = '0.0%'
				})
			})
			XLSX.utils.book_append_sheet(wb, ws4, 'LMS - Bài tập')

			// ── Xuất file ────────────────────────────────────────────────
			const capStr = capLabel.replace(/\s/g, '_')
			XLSX.writeFile(wb, `BaoCao_HocLieuSo_LMS_${capStr}_${dateStr}.xlsx`)
		},
	},
}
</script>
