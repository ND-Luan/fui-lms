<template>
	<Global>

		<!-- Header card -->
		<v-card rounded="lg" elevation="0" border class="mb-3">
			<v-card-text class="py-3">
				<div class="d-flex align-center ga-4 flex-wrap">

					<div>
						<div class="text-overline text-medium-emphasis" style="letter-spacing:2px">Báo cáo</div>
						<div class="text-h6 font-weight-bold" style="letter-spacing:-0.5px">
							Học liệu số &amp; LMS
						</div>
					</div>

					<v-divider vertical class="mx-1" style="height:40px;align-self:center" />

					<v-select v-model="CapID" label="Chọn cấp học" :items="DSCap" item-title="title" item-value="value"
						density="compact" variant="outlined" hide-details style="max-width:180px" />
					<v-select v-model="TuanHoc" label="Chọn tuần" :items="DSTuan" item-title="title" item-value="value"
						density="compact" variant="outlined" return-object hide-details style="max-width:180px" />

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
					<uc-hoc-lieu-so ref="refHocLieuSo" :CapID :TuanHoc />
				</v-tabs-window-item>
				<v-tabs-window-item :value="1" :key="1" :eager="true">
					<uc-lms ref="refLms" :CapID :TuanHoc />
				</v-tabs-window-item>
			</v-tabs-window>
		</v-card>

	</Global>
</template>
<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				tab: 0,
				CapID: null,
				DSCap: [
					{ title: 'Cấp 1', value: 1 },
					{ title: 'Cấp 2', value: 2 },
					{ title: 'Cấp 3', value: 3 },
				],
				DSTuan: [],
				TuanHoc: null
			}
		},
		mounted() {
			this.onLoadTuanHoc()
		},
		methods: {
			// SAU ✅ — tự chọn tháng hiện tại sau khi load
			async onLoadTuanHoc() {
				const data = await fetchPromise("lms/TuanHocTap_Get_Thang_Nam", { NienKhoa: vueData.NienKhoa })
				this.DSTuan = data.map(x => ({ ...x, title: x.Thang_Nam_HienThi, value: x.Thang }))
	
				// Auto chọn tháng hiện tại, fallback về phần tử đầu tiên nếu không có
				const thangHienTai = new Date().getMonth() + 1
				this.TuanHoc = this.DSTuan.find(x => x.Thang === thangHienTai) ?? this.DSTuan[0] ?? null
			},
			onExport() {
				const hocLieuRef = this.$refs.refHocLieuSo
				const lmsRef = this.$refs.refLms
	
				const items = hocLieuRef?.items ?? []
				const dataTong = lmsRef?.dataTong ?? []
				const dataBaiHoc = lmsRef?.dataBaiHoc ?? []
				const dataBaiTap = lmsRef?.dataBaiTap ?? []
	
				const capLabel = this.DSCap.find(c => c.value === this.CapID)?.title ?? ''
				const nienKhoa = vueData.NienKhoa ?? ''
	
				const wb = XLSX.utils.book_new()
	
				const makeSheet = (aoaData, colWidths) => {
					const ws = XLSX.utils.aoa_to_sheet(aoaData)
					ws['!cols'] = colWidths.map(w => ({ wch: w }))
					return ws
				}
	
				// ── SHEET 1: Học liệu số ─────────────────────────────────────
				const total = items.length
				const hasNd = items.filter(i => i.HocLieuCoNoiDung).length
				const aoa1 = [
					[`BÁO CÁO HỌC LIỆU SỐ – ${capLabel} – Năm học ${nienKhoa}`],
					[],
					['Tổng học liệu', 'Có nội dung', 'Chưa có nội dung'],
					[total, hasNd, total - hasNd],
					[],
					['Khối', 'Môn học', 'Số nội dung', 'Trạng thái'],
					...items.map(i => [
						`Khối ${i.KhoiID}`,
						i.TenMonHoc_HienThi,
						i.TongNoiDung,
						i.HocLieuCoNoiDung ? 'Có nội dung' : 'Chưa có',
					]),
					['Tổng cộng', `${total} học liệu`, { f: `SUM(C7:C${6 + items.length})` }, `${hasNd} có / ${total - hasNd} chưa`],
				]
				XLSX.utils.book_append_sheet(wb, makeSheet(aoa1, [12, 30, 16, 16]), 'Học liệu số')
	
				// ── SHEET 2: LMS Tổng quan ───────────────────────────────────
				// dataTong giờ chứa combined summary từ result[0]
				const aoa2 = [
					[`LMS – TỔNG QUAN THEO MÔN – ${capLabel} – Năm học ${nienKhoa}`],
					[],
					['STT', 'Môn học', 'Tổng bài học', 'Tổng bài tập'],
					...dataTong.map((r, i) => [i + 1, r.TenMonHoc_HienThi, r.TotalLessons ?? 0, r.TotalAssignments ?? 0]),
					['', 'Tổng cộng',
						{ f: `SUM(C4:C${3 + dataTong.length})` },
						{ f: `SUM(D4:D${3 + dataTong.length})` },
					],
				]
				XLSX.utils.book_append_sheet(wb, makeSheet(aoa2, [6, 30, 16, 16]), 'LMS - Tổng quan')
	
				// ── SHEET 3: LMS Bài học ─────────────────────────────────────
				const aoa3 = [
					[`LMS – CHI TIẾT BÀI HỌC – ${capLabel} – Năm học ${nienKhoa}`],
					[],
					['STT', 'Môn học', 'Tổng bài học', 'Lượt học', 'HS hoàn thành', 'Tỉ lệ (%)', 'Đánh giá'],
					...dataBaiHoc.map((r, i) => {
						const rate = r.CompletionRate_Lessons ?? 0
						return [
							i + 1,
							r.TenMonHoc_HienThi,
							r.TotalLessons ?? 0,
							r.TotalProgress ?? 0,
							r.TotalCompleted ?? 0,
							rate / 100,
							rate >= 80 ? 'Tốt' : rate >= 50 ? 'Trung bình' : 'Thấp',
						]
					}),
					['', 'Tổng cộng',
						{ f: `SUM(C4:C${3 + dataBaiHoc.length})` },
						{ f: `SUM(D4:D${3 + dataBaiHoc.length})` },
						{ f: `SUM(E4:E${3 + dataBaiHoc.length})` },
						{ f: `IFERROR(E${3 + dataBaiHoc.length + 1}/D${3 + dataBaiHoc.length + 1},0)` },
						'Tỉ lệ TB',
					],
				]
				const ws3 = makeSheet(aoa3, [6, 30, 14, 14, 16, 14, 14])
				dataBaiHoc.forEach((_, i) => {
					const addr = XLSX.utils.encode_cell({ r: 3 + i, c: 5 })
					if (!ws3[addr]) return
					ws3[addr].z = '0.0%'
				})
				XLSX.utils.book_append_sheet(wb, ws3, 'LMS - Bài học')
	
				// ── SHEET 4: LMS Bài tập ─────────────────────────────────────
				const aoa4 = [
					[`LMS – CHI TIẾT BÀI TẬP – ${capLabel} – Năm học ${nienKhoa}`],
					[],
					['STT', 'Môn học', 'Tổng bài tập', 'HS được giao',
						'Chưa làm', 'Đang làm', 'Đã nộp', 'Đã chấm', 'Tỉ lệ nộp (%)', 'Tỉ lệ chấm (%)', 'Đánh giá'],
					...dataBaiTap.map((r, i) => {
						const rateNop = r.CompletionRate_Assignments ?? 0
						const rateCham = r.CompletionRate_Graded ?? 0
						return [
							i + 1,
							r.TenMonHoc_HienThi,
							r.TotalAssignments ?? 0,
							r.TotalAssigned ?? 0,
							r.Total_ChuaLam ?? 0,
							r.Total_DangLam ?? 0,
							r.Total_DaNop ?? 0,
							r.Total_DaCham ?? 0,
							rateNop / 100,
							rateCham / 100,         // ← thêm cột tỉ lệ chấm
							rateNop >= 80 ? 'Tốt' : rateNop >= 50 ? 'Trung bình' : 'Thấp',
						]
					}),
					['', 'Tổng cộng',
						{ f: `SUM(C4:C${3 + dataBaiTap.length})` },
						{ f: `SUM(D4:D${3 + dataBaiTap.length})` },
						{ f: `SUM(E4:E${3 + dataBaiTap.length})` },
						{ f: `SUM(F4:F${3 + dataBaiTap.length})` },
						{ f: `SUM(G4:G${3 + dataBaiTap.length})` },
						{ f: `SUM(H4:H${3 + dataBaiTap.length})` },
						{ f: `IFERROR((G${3 + dataBaiTap.length + 1}+H${3 + dataBaiTap.length + 1})/D${3 + dataBaiTap.length + 1},0)` },
						{ f: `IFERROR(H${3 + dataBaiTap.length + 1}/D${3 + dataBaiTap.length + 1},0)` },
						'Tỉ lệ TB',
					],
				]
				const ws4 = makeSheet(aoa4, [6, 30, 14, 16, 12, 12, 12, 12, 14, 14, 14])
				dataBaiTap.forEach((_, i) => {
					// Format % cả 2 cột tỉ lệ
					;[8, 9].forEach(col => {
						const addr = XLSX.utils.encode_cell({ r: 3 + i, c: col })
						if (!ws4[addr]) return
						ws4[addr].z = '0.0%'
					})
				})
				XLSX.utils.book_append_sheet(wb, ws4, 'LMS - Bài tập')
	
				// ── Xuất file ────────────────────────────────────────────────
				const capStr = capLabel.replace(/\s/g, '_')
				XLSX.writeFile(wb, `BaoCao_HocLieuSo_LMS_${capStr}_${nienKhoa}.xlsx`)
			},
		},
	}
</script>