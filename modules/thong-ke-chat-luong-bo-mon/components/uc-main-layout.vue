<template>
	<div>
		<v-card>
			<v-card-text>
				<v-row dense>
					<v-col cols="3">
						<v-select v-model="CapID" label="Chọn cấp" :items="DSCap" item-title="title"
							item-value="value" />
					</v-col>
					<v-col cols="3">
						<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
							item-value="textValue" />
					</v-col>
					<v-col class="d-flex ga-2">
						<v-btn color="primary" text="Tìm kiếm" @click="onLoadThongKe" />
						<v-btn color="primary" variant="tonal" text="Xuất Excel" @click="onExportExcel" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<div class="d-flex flex-row">
			<v-tabs v-model="tab" color="primary" direction="vertical">
				<v-divider />
				<v-tab v-for="mh in DSMonHoc" :text="mh.TenMonHoc_HienThi" :value="mh.MonHocID"></v-tab>
			</v-tabs>
			<v-divider vertical />
			<v-data-table class="table-bordered" :headers="HeaderThongKe" :items="DataThongKe" hide-default-footer
				:items-per-page="-1" style="max-height: calc(100dvh - 76px)" />
		</div>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				DSHocKi: [
					{ title: "Học kì 1", value: 1, textValue: "HK1" },
					{ title: "Học kì 2", value: 2, textValue: "HK2" }
				],
				DSCap: [
					{ title: "Cấp 1", value: 1 },
					{ title: "Cấp 2", value: 2 },
					{ title: "Cấp 3", value: 3 },
				],
				tab: null,
				HocKi: "HK1",
				CapID: 2,
				DSMonHoc: [],
				HeaderThongKe: [],
				DataThongKe: [],
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {
			"vueData.NienKhoa": function (nk) {
				this.onLoadMonHoc()
			},
			CapID: function () {
				this.onLoadMonHoc()
			},
			tab: function (tab) {
				this.onLoadThongKe()
			}
		},
		methods: {
			async onLoadThongKe() {
				const DSMonHoc_CD_D = [53, 55, 65, 71, 83, 86, 101]
				const IsMonHoc_CD_D = DSMonHoc_CD_D.includes(this.tab)
				this.DataThongKe = await ajaxCALLPromise("lms/ThongKe_ChatLuong_BoMon", {
					MonHocID: this.tab,
					NienKhoa: vueData.NienKhoa,
					Semester: this.HocKi,
					IsMonHoc_CD_D
				})
	
				if (DSMonHoc_CD_D.includes(this.tab)) {
					this.HeaderThongKe = [
						{
							title: "THỐNG KÊ CHẤT LƯỢNG BỘ MÔN THEO GIÁO VIÊN GIẢNG DẠY", align: "center", children: [{ title: "STT", value: "STT" },
							{ title: "Giáo viên", value: "GiaoVien" },
							{ title: "Tên lớp", value: "TenLop" },
							{ title: "Sỉ số", value: "SiSo", align: "end" },
							{
								title: "Chưa đạt", align: "center",
								children: [{ title: "SL", value: "ChuaDat_SL", align: "end" }, { title: "TL", value: "ChuaDat_TL", align: "end" },]
	
							}, {
								title: "Đạt", align: "center",
								children: [{ title: "SL", value: "Dat_SL", align: "end" }, { title: "TL", value: "Dat_TL", align: "end" },]
							}]
						}
					]
				} else {
					this.HeaderThongKe = [
						{
							title: "THỐNG KÊ CHẤT LƯỢNG BỘ MÔN THEO GIÁO VIÊN GIẢNG DẠY", align: "center", children: [{ title: "STT", value: "STT" },
							{ title: "Giáo viên", value: "GiaoVien" },
							{ title: "Tên lớp", value: "TenLop" },
							{ title: "Sỉ số", value: "SiSo", align: "end" },
							{
								title: "Chưa đạt", align: "center", children: [
									{
										title: "0 <= Điểm < 5", align: "center",
										children: [{ title: "SL", value: "ChuaDat_SL", align: "end" }, { title: "TL", value: "ChuaDat_TL", align: "end" },]
									}]
							}, {
								title: "Đạt", align: "center", children: [{
									title: "5 <= Điểm < 6.5", align: "center",
									children: [{ title: "SL", value: "Dat_SL", align: "end" }, { title: "TL", value: "Dat_TL", align: "end" },]
								}]
							}, {
								title: "Khá", align: "center", children: [{
									title: "6.5 <= Điểm < 8", align: "center",
									children: [{ title: "SL", value: "Kha_SL", align: "end" }, { title: "TL", value: "Kha_TL", align: "end" },]
								}]
							}, {
								title: "Tốt", align: "center", children: [{
									title: "8 <= Điểm <= 10", align: "center",
									children: [{ title: "SL", value: "Tot_SL", align: "end" }, { title: "TL", value: "Tot_TL", align: "end" },]
								}]
							}, {
								title: "Đạt trở lên", align: "center", children: [{
									title: "5 <= Điểm <= 10", align: "center",
									children: [{ title: "SL", value: "DatTroLen_SL", align: "end" }, { title: "TL", value: "DatTroLen_TL", align: "end" },]
								}]
							},
							]
						},
					]
				}
			},
			async onLoadMonHoc() {
				this.DSMonHoc = await ajaxCALLPromise("lms/MonHoc_Get_From_KQHT", {
					NienKhoa: vueData.NienKhoa,
					CapID: this.CapID,
				})
			},
			getHeaderDepth(headers) {
				if (!headers || !headers.length) return 1;
				return 1 + Math.max(...headers.map(h => this.getHeaderDepth(h.children || [])));
			},
	
			countLeaf(headers) {
				return headers.reduce((sum, h) => {
					return sum + (h.children ? this.countLeaf(h.children) : 1);
				}, 0);
			},
	
			buildHeader(headers, row, col, matrix, merges, maxDepth) {
				headers.forEach(h => {
					const colSpan = h.children ? this.countLeaf(h.children) : 1;
					const rowSpan = h.children ? 1 : maxDepth - row;
	
					matrix[row][col] = h.title;
	
					if (colSpan > 1 || rowSpan > 1) {
						merges.push({
							s: { r: row, c: col },
							e: { r: row + rowSpan - 1, c: col + colSpan - 1 }
						});
					}
	
					if (h.children) {
						this.buildHeader(h.children, row + 1, col, matrix, merges, maxDepth);
					}
	
					col += colSpan;
				});
			},
			onExportExcel() {
				if (!this.HeaderThongKe.length || !this.DataThongKe.length) return;
	
				const headers = this.HeaderThongKe;
				const maxDepth = this.getHeaderDepth(headers);
	
				// ===== HEADER MATRIX =====
				let headerMatrix = Array.from({ length: maxDepth }, () => []);
				let merges = [];
	
				this.buildHeader(headers, 0, 0, headerMatrix, merges, maxDepth);
	
				// ===== LẤY CỘT DATA (leaf headers) =====
				const leafCols = [];
				const collectLeaf = (hs) => {
					hs.forEach(h => {
						if (h.children) collectLeaf(h.children);
						else leafCols.push(h.value);
					});
				};
				collectLeaf(headers);
	
				// ===== DATA =====
				const dataRows = this.DataThongKe.map(row =>
					leafCols.map(k => row[k] ?? "")
				);
	
				const sheetData = [...headerMatrix, ...dataRows];
	
				// ===== EXPORT =====
				const ws = XLSX.utils.aoa_to_sheet(sheetData);
				ws["!merges"] = merges;
	
				const wb = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, "ThongKe");
	
				XLSX.writeFile(
					wb,
					`ThongKe_ChatLuong_${this.HocKi}_${new Date().toISOString().slice(0, 10)}.xlsx`
				);
			}
		},
	}
</script>