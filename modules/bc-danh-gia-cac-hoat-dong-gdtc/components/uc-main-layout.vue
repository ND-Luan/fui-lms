<template>
	<div>
		<v-card>
			<v-card-title class="d-flex flex-column ">
				Đánh giá các hoạt động giáo dục tài chính (AI, JA, STEM)
				<br />
				<p v-if="BaoCaoItem && BaoCaoItem?.IsChotBaoCao" class="text-caption">
					<span class="text-red">
						Thời điểm chốt :
					</span>
					[{{BaoCaoItem?.NguoiChot}}] {{BaoCaoItem?.HoTenNguoiChot}} •
					{{BaoCaoItem?.NgayChot}}
				</p>
			</v-card-title>
			<v-card-text>
				<v-row dense>
					<v-col cols="3">
						<v-select v-model="CapID" label="Chọn cấp" :items="DSCap" item-title="title"
							item-value="value" />
					</v-col>
					<v-col cols="3">
						<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
							item-value="value" />
					</v-col>
					<v-col>
						<v-btn color="primary" variant="elevated" @click="onSearch" text="Tìm kiếm" />
						<v-btn color="primary" variant="elevated" @click="onExportExcel" text="Xuất Excel"
							:disabled="isLoadingData" />
						<v-btn color="primary" variant="tonal" @click="onChotBaoCao" text="Chốt báo cáo"
							:disabled="BaoCaoItem?.IsChotBaoCao || isLoadingData" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-tabs v-model="tab">
			<v-tab :value="0" text="Theo lớp"></v-tab>
			<v-tab :value="1" text="Theo khối"></v-tab>
		</v-tabs>
		<div class="d-flex ga-2 flex-column" v-if="tab === 0">
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_JA" :items="items_JA" hide-default-footer
					items-per-page="-1" />
			</div>
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_AI" :items="items_AI" hide-default-footer
					items-per-page="-1" />
			</div>
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_STEM" :items="items_STEM"
					hide-default-footer items-per-page="-1" />
			</div>
		</div>
		<div class="d-flex ga-2 flex-column" v-if="tab === 1">
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_JA_Khoi" :items="items_JA_Khoi"
					hide-default-footer items-per-page="-1" />
			</div>
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_AI_Khoi" :items="items_AI_Khoi"
					hide-default-footer items-per-page="-1" />
			</div>
			<div>
				<v-data-table class="w-100 table-bordered" :headers="headers_STEM_Khoi" :items="items_STEM_Khoi"
					hide-default-footer items-per-page="-1" />
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				tab: null,
				isLoadingData: true,
				DataBaoCao: [],
				BaoCaoItem: null,
				DSHocKi: [
					{ title: "Học kì 1", value: "HK1" },
					{ title: "Học kì 2", value: "HK2" },
				],
				DSCap: [
					{ title: "Cấp 1", value: 1 },
					{ title: "Cấp 2", value: 2 },
					{ title: "Cấp 3", value: 3 },
				],
				HocKi: null,
				CapID: null,
				headers_JA: [{
					title: "JA",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "Lớp", value: "TenLop" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_JA: [],
				headers_AI: [{
					title: "AI",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "Lớp", value: "TenLop" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_AI: [],
				headers_STEM: [{
					title: "STEM",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "Lớp", value: "TenLop" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_STEM: [],
				headers_JA_Khoi: [{
					title: "JA",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_JA_Khoi: [],
				headers_AI_Khoi: [{
					title: "AI",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_AI_Khoi: [],
				headers_STEM_Khoi: [{
					title: "STEM",
					align: "center",
					children: [
						{ title: "Khối", value: "KhoiID" },
						{ title: "TSHS", value: "TongSoHocSinh", align: "end" },
						{ title: "Tốt", value: "XepLoaiTot", align: "end" },
						{ title: "Khá", value: "XepLoaiKha", align: "end" },
						{ title: "Đạt", value: "XepLoaiDat", align: "end" },
						{ title: "Chưa đạt", value: "XepLoaiChuaDat", align: "end" },
					]
				}],
				items_STEM_Khoi: [],
			}
		},
		methods: {
			async onSearch() {
				this.isLoadingData = true
				let data
				let BaoCaoID = 0
				if (this.CapID === 1) BaoCaoID = 13
				if (this.CapID === 2) BaoCaoID = 14
				if (this.CapID === 3) BaoCaoID = 15
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: this.HocKi,
					CapID: 0,
					NienKhoa: vueData.NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise("lms/BaoCao_DanhGia_Cac_HoatDong_GDTC", {
						Semester: this.HocKi,
						CapID: this.CapID,
						NienKhoa: vueData.NienKhoa,
					})
					this.DataBaoCao = data
				}
	
				this.items_JA = data[0]
				this.items_AI = data[1]
				this.items_STEM = data[2]
	
				// Tính toán dữ liệu theo khối
				this.items_JA_Khoi = this.tinhTheoKhoi(this.items_JA)
				this.items_AI_Khoi = this.tinhTheoKhoi(this.items_AI)
				this.items_STEM_Khoi = this.tinhTheoKhoi(this.items_STEM)
	
				console.log("data", data)
				this.isLoadingData = false
			},
			tinhTheoKhoi(items) {
				// Nhóm dữ liệu theo KhoiID
				const grouped = {}
	
				items.forEach(item => {
					const khoiID = item.KhoiID
	
					if (!grouped[khoiID]) {
						grouped[khoiID] = {
							CapID: item.CapID,
							KhoiID: khoiID,
							TenMonHoc: item.TenMonHoc,
							TongSoHocSinh: 0,
							XepLoaiTot: 0,
							XepLoaiKha: 0,
							XepLoaiDat: 0,
							XepLoaiChuaDat: 0,
							ChuaXacDinh: 0
						}
					}
	
					// Cộng dồn các giá trị
					grouped[khoiID].TongSoHocSinh += item.TongSoHocSinh
					grouped[khoiID].XepLoaiTot += item.XepLoaiTot
					grouped[khoiID].XepLoaiKha += item.XepLoaiKha
					grouped[khoiID].XepLoaiDat += item.XepLoaiDat
					grouped[khoiID].XepLoaiChuaDat += item.XepLoaiChuaDat
					grouped[khoiID].ChuaXacDinh += item.ChuaXacDinh || 0
				})
	
				// Chuyển object thành array và sắp xếp theo KhoiID
				return Object.values(grouped).sort((a, b) => a.KhoiID - b.KhoiID)
			},
			onExportExcel() {
				// Import XLSX từ CDN nếu chưa có
				if (typeof XLSX === 'undefined') {
					alert('Đang tải thư viện XLSX...')
					const script = document.createElement('script')
					script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
					script.onload = () => this.xuatExcel()
					document.head.appendChild(script)
				} else {
					this.xuatExcel()
				}
			},
			xuatExcel() {
				const wb = XLSX.utils.book_new()
	
				// Sheet 1: Theo lớp
				const wsTheoLop = this.taoSheetTheoLop()
				XLSX.utils.book_append_sheet(wb, wsTheoLop, 'Theo lớp')
	
				// Sheet 2: Theo khối
				const wsTheoKhoi = this.taoSheetTheoKhoi()
				XLSX.utils.book_append_sheet(wb, wsTheoKhoi, 'Theo khối')
	
				// Xuất file
				const fileName = `BaoCao_GDTC_${this.HocKi}_Cap${this.CapID}_${new Date().getTime()}.xlsx`
				XLSX.writeFile(wb, fileName)
			},
			layHeaderTuTable(headers) {
				// Lấy header từ children của table header
				const headerRow = []
				if (headers[0] && headers[0].children) {
					headers[0].children.forEach(col => {
						headerRow.push(col.title)
					})
				}
				return headerRow
			},
			layDataTuItems(items, headers) {
				// Lấy các key từ header value
				const keys = []
				if (headers[0] && headers[0].children) {
					headers[0].children.forEach(col => {
						keys.push(col.value)
					})
				}
	
				// Map items theo keys
				return items.map(item => {
					return keys.map(key => item[key] !== undefined ? item[key] : '')
				})
			},
			taoSheetTheoLop() {
				const data = []
				const merges = []
				let currentRow = 0
	
				// Tiêu đề chính
				data.push(['ĐÁNH GIÁ CÁC HOẠT ĐỘNG GIÁO DỤC TÀI CHÍNH (AI, JA, STEM) - THEO LỚP'])
				const numCols = this.headers_JA[0].children ? this.headers_JA[0].children.length : 7
				merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
				currentRow++
	
				data.push([`Cấp: ${this.CapID} - Học kì: ${this.HocKi}`])
				merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
				currentRow++
	
				data.push([]) // Dòng trống
				currentRow++
	
				// JA
				if (this.items_JA && this.items_JA.length > 0) {
					data.push([this.headers_JA[0].title]) // Lấy tiêu đề từ header
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_JA))
					currentRow++
	
					const rowsJA = this.layDataTuItems(this.items_JA, this.headers_JA)
					data.push(...rowsJA)
					currentRow += rowsJA.length
	
					data.push([]) // Dòng trống
					currentRow++
				}
	
				// AI
				if (this.items_AI && this.items_AI.length > 0) {
					data.push([this.headers_AI[0].title]) // Lấy tiêu đề từ header
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_AI))
					currentRow++
	
					const rowsAI = this.layDataTuItems(this.items_AI, this.headers_AI)
					data.push(...rowsAI)
					currentRow += rowsAI.length
	
					data.push([]) // Dòng trống
					currentRow++
				}
	
				// STEM
				if (this.items_STEM && this.items_STEM.length > 0) {
					data.push([this.headers_STEM[0].title]) // Lấy tiêu đề từ header
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_STEM))
					currentRow++
	
					const rowsSTEM = this.layDataTuItems(this.items_STEM, this.headers_STEM)
					data.push(...rowsSTEM)
				}
	
				const ws = XLSX.utils.aoa_to_sheet(data)
	
				// Áp dụng merge cells
				ws['!merges'] = merges
	
				// Định dạng độ rộng cột động dựa trên số cột
				ws['!cols'] = Array(numCols).fill({ wch: 12 })
	
				return ws
			},
			taoSheetTheoKhoi() {
				const data = []
				const merges = []
				let currentRow = 0
	
				// Tiêu đề chính
				data.push(['ĐÁNH GIÁ CÁC HOẠT ĐỘNG GIÁO DỤC TÀI CHÍNH (AI, JA, STEM) - THEO KHỐI'])
				const numCols = this.headers_JA_Khoi[0].children ? this.headers_JA_Khoi[0].children.length : 6
				merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
				currentRow++
	
				data.push([`Cấp: ${this.CapID} - Học kì: ${this.HocKi}`])
				merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
				currentRow++
	
				data.push([]) // Dòng trống
				currentRow++
	
				// JA
				if (this.items_JA_Khoi && this.items_JA_Khoi.length > 0) {
					data.push([this.headers_JA_Khoi[0].title]) // Lấy tiêu đề từ header
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_JA_Khoi))
					currentRow++
	
					const rowsJA = this.layDataTuItems(this.items_JA_Khoi, this.headers_JA_Khoi)
					data.push(...rowsJA)
					currentRow += rowsJA.length
	
					data.push([]) // Dòng trống
					currentRow++
				}
	
				// AI
				if (this.items_AI_Khoi && this.items_AI_Khoi.length > 0) {
					data.push([this.headers_AI_Khoi[0].title]) // Lấy tiêu đề từ header
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_AI_Khoi))
					currentRow++
	
					const rowsAI = this.layDataTuItems(this.items_AI_Khoi, this.headers_AI_Khoi)
					data.push(...rowsAI)
					currentRow += rowsAI.length
	
					data.push([]) // Dòng trống
					currentRow++
				}
	
				// STEM
				if (this.items_STEM_Khoi && this.items_STEM_Khoi.length > 0) {
					data.push([this.headers_STEM_Khoi[0].title]) // Lấy tiêu đề từ header 
					merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: numCols - 1 } })
					currentRow++
	
					data.push(this.layHeaderTuTable(this.headers_STEM_Khoi))
					currentRow++
	
					const rowsSTEM = this.layDataTuItems(this.items_STEM_Khoi, this.headers_STEM_Khoi)
					data.push(...rowsSTEM)
				}
	
				const ws = XLSX.utils.aoa_to_sheet(data)
	
				// Áp dụng merge cells
				ws['!merges'] = merges
	
				// Định dạng độ rộng cột động dựa trên số cột
				ws['!cols'] = Array(numCols).fill({ wch: 12 })
	
				return ws
			},
			async onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataBaoCao
						}).then(() => {
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
							$this.onSearch()
						})
					}
				})
			}
		},
	}
</script>