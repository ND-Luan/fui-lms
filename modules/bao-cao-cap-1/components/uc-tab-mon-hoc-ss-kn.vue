<template>
	<v-card>
		<v-card-text>
			<v-row>
				<v-col cols="3">
					<v-select v-model="HocKiSoSanh" label="Chọn học kì của năm học hiện tại" :items="DSHocKi"
						item-title="title" item-value="value" chips />
				</v-col>
				<v-col cols="3">
					<v-select v-model="CacNienKhoaSoSanh" label="Chọn niên khóa của năm học trước"
						:items="DSNienKhoaCoThe" item-title="title" item-value="value" multiple chips closable-chips />
				</v-col>
				<v-col class="d-flex align-center ga-2 flex-wrap">
					<span class="text-body-2 text-medium-emphasis">Lấy dữ liệu từ:</span>
					<v-btn-toggle v-model="NguonDuLieu" mandatory density="compact" variant="outlined" color="primary">
						<v-btn value="QLDiem">QLDiem</v-btn>
						<v-btn value="LMS">LMS</v-btn>
					</v-btn-toggle>
					<v-divider vertical class="mx-1" />
					<v-btn color="primary" variant="outlined" prepend-icon="mdi-magnify" @click="onLoad">
						Tìm kiếm
					</v-btn>
					<v-btn color="primary" variant="outlined" prepend-icon="mdi-file-excel" :disabled="DSMonHoc.length === 0"
						@click="onExportExcel">
						Xuất excel
					</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
	<v-card class="w-100" style="max-height: calc(100dvh - 116px); overflow: auto">
		<v-card-title>Tất cả học kì năm {{NienKhoa}} - {{NienKhoa + 1}}</v-card-title>
		<v-card-text v-for="(monHoc, index) in DSMonHoc" :key="index">
			<v-data-table class="table-bordered" :headers="monHoc.headers" :items="monHoc.items" hide-default-footer
				:items-per-page="-1" density="compact">
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_CHT_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_HoanThanh_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_HoanThanhTot_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
			</v-data-table>
			<v-divider v-if="index !== DSMonHoc.length - 1" />
		</v-card-text>
		<uc-empty v-if="DSMonHoc.length === 0" />
	</v-card>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number,
		},
		data() {
			return {
				vueData,
				DSHocKi: [
					{ title: "Giữa HK1", value: 1, textValue: "GK_HK1" },
					{ title: "Cuối HK1", value: 2, textValue: "CK_HK1" },
					{ title: "Giữa HK2", value: 3, textValue: "GK_HK2" },
					{ title: "Cuối HK2", value: 4, textValue: "CK_HK2" }
				],
				HocKiSoSanh: null, // Học kì được chọn để lấy chỉ tiêu
				CacNienKhoaSoSanh: [], // Các niên khóa để so sánh cùng kì
				DSNienKhoaCoThe: [], // Danh sách các niên khóa có thể chọn
				NguonDuLieu: 'QLDiem',
				DSMonHoc: [],
				header_HKs: [
					{
						title: "Khối",
						value: "KhoiID"
					}
				],
				DataQLDiem: [],
				BaoCaoItem: null
			}
		},
		mounted() {
			// Tạo danh sách các niên khóa có thể chọn
			this.DSNienKhoaCoThe = [
				{ title: '2025 - 2026', value: 2025 },
				{ title: '2024 - 2025', value: 2024 },
				{ title: '2023 - 2024', value: 2023 }

			]
		},
		methods: {
			async onLoad() {
				if (!this.HocKiSoSanh) {
					alert('Vui lòng chọn học kì để lấy chỉ tiêu so sánh')
					return
				}
	
				// Reset danh sách môn học về trạng thái ban đầu (chưa có headers và items)
				// let DSMonHoc = [
				// 	{ MonHocID: 4, TenMonHoc_HienThi: "Khoa học", MonHocCode: "KHTN" },
				// 	{ MonHocID: 1, TenMonHoc_HienThi: "Tiếng việt", MonHocCode: "TV" },
				// 	{ MonHocID: 2, TenMonHoc_HienThi: "Toán", MonHocCode: "Toan" },
				// 	{ MonHocID: 5, TenMonHoc_HienThi: "Ngoại ngữ", MonHocCode: "AV" },
				// 	{ MonHocID: 8, TenMonHoc_HienThi: "Đạo đức", MonHocCode: "DD" },
				// 	{ MonHocID: 19, TenMonHoc_HienThi: "Lịch sử và Địa lí", MonHocCode: "LD" },
				// 	{ MonHocID: 9, TenMonHoc_HienThi: "Âm nhạc", MonHocCode: "AN" },
				// 	{ MonHocID: 10, TenMonHoc_HienThi: "Mĩ thuật", MonHocCode: "MT" },
				// 	{ MonHocID: 11, TenMonHoc_HienThi: "Hoạt động trải nghiệm", MonHocCode: "TC" },
				// 	{ MonHocID: 35, TenMonHoc_HienThi: "Tin học và Công nghệ (Công nghệ)", MonHocCode: "CNghe" },
				// 	{ MonHocID: 12, TenMonHoc_HienThi: "Thể dục", MonHocCode: "TD" },
				// 	{ MonHocID: 6, TenMonHoc_HienThi: "Tin học và Công nghệ (Tin học)", MonHocCode: "Tin" },
				// ]
				let DSMonHoc = [
					{ MonHocID: 1, TenMonHoc_HienThi: "Tiếng việt", MonHocCode: "TV" },
					{ MonHocID: 2, TenMonHoc_HienThi: "Toán", MonHocCode: "Toan" },
					{ MonHocID: 4, TenMonHoc_HienThi: "Khoa học", MonHocCode: "KHTN" },
	
					{ MonHocID: 19, TenMonHoc_HienThi: "Lịch sử và Địa lí", MonHocCode: "LD" },
					{ MonHocID: 5, TenMonHoc_HienThi: "Ngoại ngữ", MonHocCode: "AV" },
					{ MonHocID: 8, TenMonHoc_HienThi: "Đạo đức", MonHocCode: "DD" },
	
	
					{ MonHocID: 9, TenMonHoc_HienThi: "Âm nhạc", MonHocCode: "AN" },
					{ MonHocID: 10, TenMonHoc_HienThi: "Mĩ thuật", MonHocCode: "MT" },
					{ MonHocID: 11, TenMonHoc_HienThi: "Hoạt động trải nghiệm", MonHocCode: "TC" },
	
					{ MonHocID: 12, TenMonHoc_HienThi: "Thể dục", MonHocCode: "TD" },
					{ MonHocID: 6, TenMonHoc_HienThi: "Tin học và Công nghệ (Tin học)", MonHocCode: "Tin" },
					{ MonHocID: 35, TenMonHoc_HienThi: "Tin học và Công nghệ (Công nghệ)", MonHocCode: "CNghe" },
				]
				const chiTieus = await this.fn_LoadChiTieu(this.NienKhoa)
	
				// Load data TẤT CẢ các học kì của năm hiện tại
				const allHocKiData = {}
				for (const hocKi of this.DSHocKi) {
					allHocKiData[hocKi.value] = await this.fn_LoadByNienKhoa_Va_HocKi(this.NienKhoa, hocKi.value)
				}
	
				// Load data cùng kì các năm trước
				const dataCacNamTruoc = {}
				for (const nienKhoa of this.CacNienKhoaSoSanh) {
					dataCacNamTruoc[nienKhoa] = await this.fn_LoadByNienKhoa_Va_HocKi(nienKhoa, this.HocKiSoSanh)
				}
	
				const hocKiSoSanhObj = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
	
				// Render từng môn học một
				for (let i = 0; i < DSMonHoc.length; i++) {
					const monHoc = DSMonHoc[i]
					const headers = this.renderHeader_HKs(monHoc.MonHocCode, monHoc.TenMonHoc_HienThi, this.NienKhoa, hocKiSoSanhObj)
					const chiTieuByMonHocID = chiTieus.filter(x => x.MonHocID === monHoc.MonHocID)
					const items = this.getDataByMonHocID(
						allHocKiData,
						chiTieuByMonHocID,
						monHoc.MonHocID,
						monHoc.MonHocCode,
						this.NienKhoa,
						hocKiSoSanhObj,
						dataCacNamTruoc
					)
					// Cập nhật từng môn học một
					DSMonHoc[i] = {
						...monHoc,
						headers,
						items
					}
				}
				this.DSMonHoc = DSMonHoc
			},
			getHocKiTextValue(hocKiValue) {
				return this.DSHocKi.find(x => x.value === hocKiValue)?.textValue ?? ''
			},
			async fn_LoadByNienKhoa_Va_HocKi(NienKhoa, HocKi) {
				let _data = []
				const HK_LMS = this.DSHocKi.find(x => x.value === HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 4,
					HocKi: HK_LMS.textValue,
					CapID: 1,
					NienKhoa: NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0] //Lấy chi tiết
				if (this.BaoCaoItem?.IsChotBaoCao) {
					_data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					let data
					if (this.NguonDuLieu === 'LMS') {
						data = await ajaxCALLPromise("lms/BaoCao_LMS_GetThongKeDanhGia_TheoMon", {
							HocKi: HK_LMS.textValue,
							NienKhoa: NienKhoa,
						})
					} else {
						data = await ajaxCALLPromise("psmark1/LMS_GetThongKeDanhGia_TheoMon", {
							"NamHoc": NienKhoa,
							"KyDanhGia": HocKi
						})
					}
					_data = data
					this.DataQLDiem = data
				}
				return _data.flat() // đúng và đủ
			},
			async fn_LoadChiTieu(NienKhoa) {
				const data = await ajaxCALLPromise("lms/ChiTieu_C1_Get", { NienKhoa })
				return data
			},
			getMonValue(dataArray, khoiID, monCode, suffix) {
				if (!dataArray || !Array.isArray(dataArray)) return null
				const item = dataArray.find(row =>
					row.KhoiID === khoiID &&
					row.hasOwnProperty(`${monCode}${suffix}`)
				)
				return item ? item[`${monCode}${suffix}`] : null
			},
	
			isSumField(key) {
				return key.includes('SoLuong')
			},
	
			getDataByMonHocID(allHocKiData, chiTieuByMonHocID, MonHocID, MonHocCode, NienKhoa, hocKiSoSanhObj, dataCacNamTruoc) {
				const khois = new Set()
	
				// Thu thập tất cả Khối từ tất cả học kì
				Object.values(allHocKiData).forEach(arr => {
					arr?.forEach(item => {
						if (item?.KhoiID) khois.add(item.KhoiID)
					})
				})
	
				const rows = []
				let SumSoLuong = 0
	
				for (const khoiID of khois) {
					const row = { KhoiID: khoiID }
					// Chỉ tiêu của môn này ở khối này
					const chiTieu = chiTieuByMonHocID.find(x => x.MonHocID === MonHocID && x.KhoiID === khoiID)
					const ct_Tot = chiTieu?.ChiTieu_HoanThanhTot ?? null
					const ct_HT = chiTieu?.ChiTieu_HoanThanh ?? null
					const ct_CHT = chiTieu?.ChiTieu_ChuaHoanThanh ?? null
	
					const hkText = hocKiSoSanhObj.textValue
	
					row[`${MonHocCode}ChiTieu_HoanThanhTot_${hkText}_NK${NienKhoa}`] = ct_Tot
					row[`${MonHocCode}ChiTieu_HoanThanh_${hkText}_NK${NienKhoa}`] = ct_HT
					row[`${MonHocCode}ChiTieu_ChuaHoanThanh_${hkText}_NK${NienKhoa}`] = ct_CHT
	
					// Dữ liệu thực tế năm hiện tại – tất cả học kì
					for (const hk of this.DSHocKi) {
						const dataHK = allHocKiData[hk.value]
						row[`${MonHocCode}TileTot_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'TileTot')
						row[`${MonHocCode}SoLuongTot_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'Tot')
	
						row[`${MonHocCode}TileHoanThanh_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'TileHT')
						row[`${MonHocCode}SoLuongHoanThanh_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'HT')
	
						row[`${MonHocCode}TileChuaHoanThanh_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'TileCHT')
						row[`${MonHocCode}SoLuongChuaHoanThanh_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'CHT')
					}
	
					// Dữ liệu cùng kì các năm trước
					const sortedNamTruoc = [...this.CacNienKhoaSoSanh].sort((a, b) => a - b)
					for (const nk of sortedNamTruoc) {
						const dataNK = dataCacNamTruoc[nk]
						row[`${MonHocCode}TileTot_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileTot')
						row[`${MonHocCode}TileHoanThanh_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileHT')
						row[`${MonHocCode}TileChuaHoanThanh_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileCHT')
					}
	
					// Giá trị thực tế của học kì đang so sánh (để tính tăng/giảm)
					const dataSoSanh = allHocKiData[hocKiSoSanhObj.value]
					const thuc_Tot = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileTot')
					const thuc_HT = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileHT')
					const thuc_CHT = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileCHT')
	
					// Tính tăng/giảm so với chỉ tiêu
					row[`TangGiam_SoVoi_ChiTieu_HoanThanhTot_${hkText}_NK${NienKhoa}`] =
						thuc_Tot !== null && ct_Tot !== null ? _.round(thuc_Tot - ct_Tot, 2) : null
					row[`TangGiam_SoVoi_ChiTieu_HoanThanh_${hkText}_NK${NienKhoa}`] =
						thuc_HT !== null && ct_HT !== null ? _.round(thuc_HT - ct_HT, 2) : null
					row[`TangGiam_SoVoi_ChiTieu_ChuaHoanThanh_${hkText}_NK${NienKhoa}`] =
						thuc_CHT !== null && ct_CHT !== null ? _.round(thuc_CHT - ct_CHT, 2) : null
	
					rows.push(row)
				}
				const totalRow = {
					KhoiID: 'Tổng'
				}
				const countMap = {}
	
				for (const row of rows) {
					for (const key in row) {
						const value = row[key]
						// SUM
						if (this.isSumField(key) && value != null) {
							totalRow[key] = (totalRow[key] ?? 0) + Number.parseInt(value)
							continue
						}
					}
				}
				for (const hk of this.DSHocKi) {
					const dataHK = allHocKiData[hk.value]
					const total = (totalRow[`${MonHocCode}SoLuongTot_${hk.textValue}`] ?? 0) + (totalRow[`${MonHocCode}SoLuongHoanThanh_${hk.textValue}`] ?? 0) + (totalRow[`${MonHocCode}SoLuongChuaHoanThanh_${hk.textValue}`] ?? 0)
					if (total != 0) {
						totalRow[`${MonHocCode}TileTot_${hk.textValue}`] = `${_.round(totalRow[`${MonHocCode}SoLuongTot_${hk.textValue}`] * 100 / total, 2)} %`
						totalRow[`${MonHocCode}TileHoanThanh_${hk.textValue}`] = `${_.round(totalRow[`${MonHocCode}SoLuongHoanThanh_${hk.textValue}`] * 100 / total, 2)} %`
						totalRow[`${MonHocCode}TileChuaHoanThanh_${hk.textValue}`] = `${_.round(totalRow[`${MonHocCode}SoLuongChuaHoanThanh_${hk.textValue}`] * 100 / total, 2)} %`
					}
				}
				rows.push(totalRow)
				return rows
			},
			renderHeader_HKs(MonHocCode, TenMonHoc_HienThi, NienKhoa, hocKiSoSanhObj) {
				// Tạo 3 nhóm lớn: HOÀN THÀNH TỐT, HOÀN THÀNH, CHƯA HOÀN THÀNH
				const groups = [
					{ title: 'HOÀN THÀNH TỐT', type: 'HoanThanhTot', field: 'Tot' },
					{ title: 'HOÀN THÀNH', type: 'HoanThanh', field: 'HoanThanh' },
					{ title: 'CHƯA HOÀN THÀNH', type: 'ChuaHoanThanh', field: 'ChuaHoanThanh' },
				]
	
				const groupHeaders = []
	
				for (const group of groups) {
					const children = []
	
					// Thêm các cột cho cùng kì các năm trước (sắp xếp từ xa đến gần)
					const sortedNienKhoas = [...this.CacNienKhoaSoSanh].sort((a, b) => a - b)
					for (const nienKhoaTruoc of sortedNienKhoas) {
						children.push({
							title: `${hocKiSoSanhObj.title.replace('Giữa ', 'G').replace('Cuối ', 'C')} ${nienKhoaTruoc} - ${nienKhoaTruoc + 1}`,
							value: `${MonHocCode}${group.field}_CungKy_NK${nienKhoaTruoc}`,
							align: 'end'
						})
					}
	
					// Thêm cột "Chỉ tiêu" cho học kì được chọn
					children.push({
						title: `Chỉ tiêu ${NienKhoa} - ${NienKhoa + 1}`,
						value: `${MonHocCode}ChiTieu_${group.type}_${hocKiSoSanhObj.textValue}_NK${NienKhoa}`,
						align: 'end'
					})
	
					// Thêm các cột cho từng học kì của năm hiện tại
					for (const hocKi of this.DSHocKi) {
						const hocKiTextValue = hocKi.textValue
						children.push({
							title: hocKi.title.replace('Giữa ', 'G').replace('Cuối ', 'C') + ` ${NienKhoa} - ${NienKhoa + 1}`,
							value: `${MonHocCode}SoLuong${group.field}_${hocKiTextValue}`,
							align: 'end'
						})
						children.push({
							title: hocKi.title.replace('Giữa ', 'G').replace('Cuối ', 'C') + ` ${NienKhoa} - ${NienKhoa + 1}\n(%)`,
							value: `${MonHocCode}Tile${group.field}_${hocKiTextValue}`,
							align: 'end',
							width: 85,
							minWidth: 85,
						})
					}
	
					// Thêm cột "Tăng giảm" với tên học kì trong ngoặc
					children.push({
						title: `Tăng (+) giảm (-) so với chỉ tiêu (${hocKiSoSanhObj.title})`,
						value: `TangGiam_SoVoi_ChiTieu_${group.type}_${hocKiSoSanhObj.textValue}_NK${NienKhoa}`,
						align: 'end',
						width: 150,
						minWidth: 150,
					})
	
					groupHeaders.push({
						title: group.title,
						align: 'center',
						children: children
					})
				}
	
				// Bọc tất cả các nhóm trong header tên môn học
				const headers = [
					{
						title: TenMonHoc_HienThi.toUpperCase(),
						align: 'center',
						children: groupHeaders
					}
				]
				return [...this.header_HKs, ...headers]
			},
			renderTextClassTangGiam(value) {
				let string = ''
				if (value > 0) string = 'text-success'
				else if (value < 0) string = 'text-red'
				return string
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_CHT_NK(nk) {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_ChuaHoanThanh_${hk?.textValue}_NK${nk ?? ''}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_HoanThanh_NK(nk) {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_HoanThanh_${hk?.textValue}_NK${nk ?? ''}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_HoanThanhTot_NK(nk) {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_HoanThanhTot_${hk?.textValue}_NK${nk ?? ''}`
			},
			onExportExcel() {
				exportExcel(this.DSMonHoc, this.DSHocKi, this.HocKiSoSanh, `MonHoc_TongHop_HK_NK${this.NienKhoa}.xlsx`)
				// Implement export logic here
			},
		},
	}
</script>