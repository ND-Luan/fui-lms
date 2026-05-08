<template>
	<div>
		<v-card>
			<v-card-title class="d-flex flex-column">
				THỐNG KÊ HỌC TẬP & RÈN LUYỆN
				<div v-if="BaoCaoItem?.IsChotBaoCao" class="text-caption">
					<span class="text-red">Thời điểm chốt:</span>
					<span class="text-black">
						[{{ BaoCaoItem?.NguoiChot }}]
						{{ BaoCaoItem.HoTenNguoiChot }} •
						{{ BaoCaoItem.NgayChot }}
					</span>
				</div>
			</v-card-title>
			<v-card-text class="pa-2">
				<v-row dense>
					<v-col cols="3">
						<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
							item-value="value" />
					</v-col>
					<v-col class="d-flex ga-2">
						<v-btn @click="onSearch" color="primary" variant="outlined" prepend-icon="mdi-magnify"
							:disabled="HocKi === null">
							Tìm kiếm
						</v-btn>
						<v-btn @click="onExportExcel" color="green" variant="outlined" prepend-icon="mdi-file-excel"
							:disabled="HocKi === null || vueData.DSHocSinh.length === 0">
							Xuất Excel
						</v-btn>
						<v-btn @click="onChotBaoCao" color="amber" variant="outlined" prepend-icon="mdi-check-circle"
							:disabled="HocKi === null || !BaoCaoItem || BaoCaoItem?.IsChotBaoCao">
							Chốt báo cáo
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-tabs v-model="tab">
			<v-tab text="Tất cả khối" :value="0"></v-tab>
			<v-tab text="2 mặt GD" :value="1"></v-tab>
			<v-tab text="Dân tộc" :value="2"></v-tab>
		</v-tabs>
		<v-card>
			<v-card-text class="pa-0">
				<uc-table />
			</v-card-text>
		</v-card>
		<uc-card-empty v-if="vueData.DSHocSinh.length === 0" />
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			const DSHocKi = [
				{
					"title": "Cuối kì 1",
					"value": 1,
					"textValue": "HK1",
				},
				{
					"title": "Cuối kì 2",
					"value": 2,
					"textValue": "HK2",
				},
				{
					"title": "Cả năm",
					"value": 0,
					"textValue": "CaNam",
				}
			]
			const HocKi = DSHocKi.find(x => x.textValue === vueData.hk)?.value || null
	
			return {
				vueData,
				tab: parseInt(vueData.tab ?? 0),
				BaoCaoItem: null,
				DataChotBaoCao: [],
				ChiTieuMap: {},
				ChiTieuNienKhoa: null,
				DSHocKi,
				HocKi
			}
		},
		mounted() {
			if (!this.HocKi) return
			this.onSearch()
		},
		watch: {
			HocKi: function (HocKi) {
				if (HocKi === null) return
	
				this.onSearch()
			},
			tab: function (tab) {
				if (tab === null) return
				this.onSearch()
			}
		},
		methods: {
			getTextLength(value) {
				if (value === null || value === undefined) return 0
				return String(value).trim().length
			},
			buildColumnWidths(data = [], headers = []) {
				const uiWidthByHeader = {}
				const excelWidthByHeader = {}

				for (const header of headers) {
					let maxLen = this.getTextLength(header)

					for (const row of data) {
						const cellLen = this.getTextLength(row?.[header])
						if (cellLen > maxLen) maxLen = cellLen
					}

					// jExcel width is pixel-like number; keep in safe range for readability.
					uiWidthByHeader[header] = Math.max(80, Math.min(360, maxLen * 8 + 24))
					// XLSX width is character count (wch).
					excelWidthByHeader[header] = Math.max(12, Math.min(60, maxLen + 2))
				}

				return { uiWidthByHeader, excelWidthByHeader }
			},
			async onSearch() {
				vueData.DSHocSinh = []
				if (this.HocKi === null) return
				let data
	
				if (this.tab === 0) data = await this.onLoadTatCaKhoi()
				else if (this.tab === 1) data = await this.onLoad_2_Mat_GD()
				else if (this.tab === 2) data = await this.onLoadDanToc()

				data = await this.enrichDataWithChiTieu(data)
				this.DataChotBaoCao = data
	
				let headerDefault = Object.keys(data[0])
				const { uiWidthByHeader } = this.buildColumnWidths(data, headerDefault)
				let columnThongTinHocSinh = []
				for (var key of headerDefault) {
					let column = {
						type: 'text',
						title: key,
						name: key,
						width: uiWidthByHeader[key] ?? 80,
						backGroundColor: null,
						wrap: true,
						align: "center",
						readOnly: true,
						style: 'font-size:8px'
					}
					columnThongTinHocSinh.push(column)
				}
				vueData.columnHeader = [...columnThongTinHocSinh]
				vueData.keyComp++
	
				for (var item of data) {
					vueData.DSHocSinh.push(item)
				}
			},
			toNumber(value) {
				if (value === null || value === undefined || value === '') return null
				const num = parseFloat(String(value).replace(',', '.'))
				if (Number.isNaN(num)) return null
				return num
			},
			formatPercent(value) {
				if (value === null || value === undefined || Number.isNaN(value)) return ''
				const rounded = Math.round(value * 100) / 100
				return Number.isInteger(rounded)
					? String(rounded)
					: String(rounded).replace(/\.?0+$/, '')
			},
			getKhoiIDFromLabel(label) {
				if (!label) return null
				const text = String(label).trim()
				const matchKhoi = text.match(/Khối\s*(\d+)/i)
				if (matchKhoi?.[1]) return parseInt(matchKhoi[1])
				const matchLop = text.match(/^(\d{1,2})/)
				if (matchLop?.[1]) return parseInt(matchLop[1])
				return null
			},
			getWeightedTargetByKhoi(data, fieldName) {
				let totalSoLuong = 0
				let totalTrongSo = 0
				for (const item of data ?? []) {
					const lop = item['Lớp']
					if (!String(lop ?? '').includes('Khối')) continue
					const khoiID = this.getKhoiIDFromLabel(lop)
					if (!khoiID || !this.ChiTieuMap[khoiID]) continue
					const chiTieu = this.toNumber(this.ChiTieuMap[khoiID][fieldName])
					const siSo = this.toNumber(item['Sỉ số']) ?? this.toNumber(item['Tổng số'])
					if (chiTieu === null || siSo === null || siSo <= 0) continue
					totalSoLuong += siSo
					totalTrongSo += (siSo * chiTieu)
				}
				if (totalSoLuong === 0) return null
				return totalTrongSo / totalSoLuong
			},
			async getChiTieuMap() {
				if (this.ChiTieuNienKhoa === vueData.NienKhoa && Object.keys(this.ChiTieuMap ?? {}).length > 0) {
					return this.ChiTieuMap
				}

				try {
					const [dsKQHT, dsDanhHieu] = await Promise.all([
						ajaxCALLPromise('lms/ChiTieu_KQHT_CuoiNam_Get', {
							NienKhoa: vueData.NienKhoa,
						}),
						ajaxCALLPromise('lms/ChiTieu_DanhHieu_CuoiNam_Get', {
							NienKhoa: vueData.NienKhoa,
						}),
					])

					const map = {}
					for (const item of dsKQHT ?? []) {
						const khoiID = parseInt(item?.KhoiID)
						if (!khoiID) continue
						map[khoiID] = {
							...(map[khoiID] ?? {}),
							'Chỉ tiêu % KQHT Tốt': this.toNumber(item?.Tot),
							'Chỉ tiêu % KQHT Khá': this.toNumber(item?.Kha),
							'Chỉ tiêu % KQHT Đạt': this.toNumber(item?.Dat),
							'Chỉ tiêu % KQHT Chưa đạt': this.toNumber(item?.ChuaDat),
						}
					}

					for (const item of dsDanhHieu ?? []) {
						const khoiID = parseInt(item?.KhoiID)
						if (!khoiID) continue
						map[khoiID] = {
							...(map[khoiID] ?? {}),
							'Chỉ tiêu % DH Xuất sắc': this.toNumber(item?.DanhHieu_HS_XuatSac),
							'Chỉ tiêu % DH Giỏi': this.toNumber(item?.DanhHieu_HS_Gioi),
						}
					}

					this.ChiTieuMap = map
					this.ChiTieuNienKhoa = vueData.NienKhoa
					return this.ChiTieuMap
				} catch (e) {
					this.ChiTieuMap = {}
					this.ChiTieuNienKhoa = vueData.NienKhoa
					return this.ChiTieuMap
				}
			},
			async enrichDataWithChiTieu(data) {
				if (!Array.isArray(data) || data.length === 0) return data
				await this.getChiTieuMap()
				if (Object.keys(this.ChiTieuMap ?? {}).length === 0) return data

				const weightedKQHTTot = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % KQHT Tốt')
				const weightedKQHTKha = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % KQHT Khá')
				const weightedKQHTDat = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % KQHT Đạt')
				const weightedKQHTChuaDat = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % KQHT Chưa đạt')
				const weightedDHXuatSac = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % DH Xuất sắc')
				const weightedDHGioi = this.getWeightedTargetByKhoi(data, 'Chỉ tiêu % DH Giỏi')

				return data.map(item => {
					const lop = item['Lớp']
					const khoiID = this.getKhoiIDFromLabel(lop)
					const targetByKhoi = khoiID ? (this.ChiTieuMap[khoiID] ?? {}) : null
					const isTongHopCap = !khoiID && ['THCS', 'THPT'].includes(String(lop ?? '').trim().toUpperCase())

					const targetKQHTTot = targetByKhoi?.['Chỉ tiêu % KQHT Tốt'] ?? (isTongHopCap ? weightedKQHTTot : null)
					const targetKQHTKha = targetByKhoi?.['Chỉ tiêu % KQHT Khá'] ?? (isTongHopCap ? weightedKQHTKha : null)
					const targetKQHTDat = targetByKhoi?.['Chỉ tiêu % KQHT Đạt'] ?? (isTongHopCap ? weightedKQHTDat : null)
					const targetKQHTChuaDat = targetByKhoi?.['Chỉ tiêu % KQHT Chưa đạt'] ?? (isTongHopCap ? weightedKQHTChuaDat : null)
					const targetDHXuatSac = targetByKhoi?.['Chỉ tiêu % DH Xuất sắc'] ?? (isTongHopCap ? weightedDHXuatSac : null)
					const targetDHGioi = targetByKhoi?.['Chỉ tiêu % DH Giỏi'] ?? (isTongHopCap ? weightedDHGioi : null)

					const actualKQHTTot = this.toNumber(item['% KQHT Tốt'])
					const actualKQHTKha = this.toNumber(item['% KQHT Khá'])
					const actualKQHTDat = this.toNumber(item['% KQHT Đạt'])
					const actualKQHTChuaDat = this.toNumber(item['% KQHT Chưa đạt'])
					const actualDHXuatSac = this.toNumber(item['% DH Xuất sắc'])
					const actualDHGioi = this.toNumber(item['% DH Giỏi'])

					const deltaKQHTTot = actualKQHTTot !== null && targetKQHTTot !== null ? actualKQHTTot - targetKQHTTot : null
					const deltaKQHTKha = actualKQHTKha !== null && targetKQHTKha !== null ? actualKQHTKha - targetKQHTKha : null
					const deltaKQHTDat = actualKQHTDat !== null && targetKQHTDat !== null ? actualKQHTDat - targetKQHTDat : null
					const deltaKQHTChuaDat = actualKQHTChuaDat !== null && targetKQHTChuaDat !== null ? actualKQHTChuaDat - targetKQHTChuaDat : null
					const deltaDHXuatSac = actualDHXuatSac !== null && targetDHXuatSac !== null ? actualDHXuatSac - targetDHXuatSac : null
					const deltaDHGioi = actualDHGioi !== null && targetDHGioi !== null ? actualDHGioi - targetDHGioi : null

					return {
						...item,
						'% Chỉ tiêu KQHT Tốt': this.formatPercent(targetKQHTTot),
						'% Chỉ tiêu KQHT Khá': this.formatPercent(targetKQHTKha),
						'% Chỉ tiêu KQHT Đạt': this.formatPercent(targetKQHTDat),
						'% Chỉ tiêu KQHT Chưa đạt': this.formatPercent(targetKQHTChuaDat),
						'KQHT Tốt Tăng/Giảm (%)': this.formatPercent(deltaKQHTTot),
						'KQHT Khá Tăng/Giảm (%)': this.formatPercent(deltaKQHTKha),
						'KQHT Đạt Tăng/Giảm (%)': this.formatPercent(deltaKQHTDat),
						'KQHT Chưa đạt Tăng/Giảm (%)': this.formatPercent(deltaKQHTChuaDat),
						'% Chỉ tiêu DH Xuất sắc': this.formatPercent(targetDHXuatSac),
						'% Chỉ tiêu DH Giỏi': this.formatPercent(targetDHGioi),
						'DH Xuất sắc Tăng/Giảm (%)': this.formatPercent(deltaDHXuatSac),
						'DH Giỏi Tăng/Giảm (%)': this.formatPercent(deltaDHGioi),
					}
				})
			},
			async onLoadTatCaKhoi() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 20
				else if (vueData.CapID === 3) BaoCaoID = 23
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 2
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onLoad_2_Mat_GD() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 21
				else if (vueData.CapID === 3) BaoCaoID = 24
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung_TheoKhoi`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 1
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onLoadDanToc() {
				let data
				let BaoCaoID
				if (vueData.CapID === 2) BaoCaoID = 22
				else if (vueData.CapID === 3) BaoCaoID = 25
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID,
					HocKi: valueHK.textValue,
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					data = await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_ThongKeChung_TheoKhoi`, {
						HocKy: this.HocKi,
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 2
					})
					this.DataChotBaoCao = data
				}
				return data
			},
			async onExportExcel() {
				if (vueData.DSHocSinh.length === 0) {
					Vue.$toast.warning("Không có dữ liệu để xuất", { position: "top" });
					return;
				}
	
				try {
					// Lấy tên học kỳ
					const hocKyInfo = this.DSHocKi.find(x => x.value === this.HocKi);
					const tenHocKy = hocKyInfo ? hocKyInfo.title : "";
	
					// Lấy tên tab
					let tenTab = "";
					if (this.tab === 0) tenTab = "Tat_Ca_Khoi";
					else if (this.tab === 1) tenTab = "2_Mat_GD";
					else if (this.tab === 2) tenTab = "Dan_Toc";
	
					// Tạo tên file
					const fileName = `Thong_Ke_Hoc_Tap_${tenTab}_${hocKyInfo.textValue}_${vueData.NienKhoa}.xlsx`;
	
					// Chuẩn bị dữ liệu
					const dataExport = vueData.DSHocSinh.map(item => {
						let row = {};
						vueData.columnHeader.forEach(col => {
							row[col.title] = item[col.name] || "";
						});
						return row;
					});
	
					// Tạo worksheet
					const ws = XLSX.utils.json_to_sheet(dataExport);
	
					// Tự động căn chỉnh độ rộng cột theo độ dài tiêu đề + dữ liệu
					const headerDefault = vueData.columnHeader.map(col => col.title)
					const { excelWidthByHeader } = this.buildColumnWidths(dataExport, headerDefault)
					const colWidths = vueData.columnHeader.map(col => ({
						wch: excelWidthByHeader[col.title] ?? 15
					}));
					ws['!cols'] = colWidths;
	
					// Tạo workbook
					const wb = XLSX.utils.book_new();
					XLSX.utils.book_append_sheet(wb, ws, "Thống kê");
	
					// Xuất file
					XLSX.writeFile(wb, fileName);
	
					Vue.$toast.success("Xuất Excel thành công", { position: "top" });
	
				} catch (error) {
					console.error("Lỗi xuất Excel:", error);
					Vue.$toast.error("Xuất Excel thất bại", { position: "top" });
				}
			},
			onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataChotBaoCao
						}).then(() => {
							$this.onSearch()
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
						})
					}
				})
			}
		},
	}
</script>