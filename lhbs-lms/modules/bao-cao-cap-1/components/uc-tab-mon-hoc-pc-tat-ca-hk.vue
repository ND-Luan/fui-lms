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

	<v-card class="w-100" style="max-height: calc(100dvh - 132px); overflow: auto">
		<v-card-title>Tất cả học kì năm {{NienKhoa}} - {{NienKhoa + 1}}</v-card-title>
		<v-card-text v-for="(monHoc, index) in DSMonHoc" :key="index">
			<v-data-table class="table-bordered" :headers="monHoc.headers" :items="monHoc.items" hide-default-footer
				:items-per-page="-1" density="compact">
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_Tot_NK(NienKhoa)]="{ value }">
					<p :class="renderTextClassTangGiam(value)">{{ value }}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_Dat_NK(NienKhoa)]="{ value }">
					<p :class="renderTextClassTangGiam(value)">{{ value }}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_CanCoGang_NK(NienKhoa)]="{ value }">
					<p :class="renderTextClassTangGiam(value)">{{ value }}</p>
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
				HocKiSoSanh: null,
				CacNienKhoaSoSanh: [],
				DSNienKhoaCoThe: [],
				DSMonHoc: [],
				header_HKs: [{ title: "Khối", value: "KhoiID" }],
				NguonDuLieu: 'QLDiem'
			}
		},
		mounted() {
			this.DSNienKhoaCoThe = [
				{ title: '2024 - 2025', value: 2024 },
				{ title: '2023 - 2024', value: 2023 }
			]
		},
		methods: {
			// ──────────────────────────────────────────────────────────────
			// Hàm helper QUAN TRỌNG – tìm đúng dòng dữ liệu theo môn + khối
			// ──────────────────────────────────────────────────────────────
			getMonValue(dataArray, khoiID, monCode, suffix) {
				if (!dataArray || !Array.isArray(dataArray)) return null
				const row = dataArray.find(item =>
					item.KhoiID === khoiID && item.hasOwnProperty(`${monCode}${suffix}`)
				)
				return row ? row[`${monCode}${suffix}`] : null
			},
	
			async onLoad() {
				if (!this.HocKiSoSanh) {
					alert('Vui lòng chọn học kì để lấy chỉ tiêu so sánh')
					return
				}
	
				const DSMonHoc = [
					{ MonHocID: 23, TenMonHoc_HienThi: 'Phẩm chất - Yêu nước', MonHocCode: 'PC1' },
					{ MonHocID: 24, TenMonHoc_HienThi: 'Phẩm chất - Nhân ái', MonHocCode: 'PC2' },
					{ MonHocID: 25, TenMonHoc_HienThi: 'Phẩm chất - Chăm chỉ', MonHocCode: 'PC3' },
					{ MonHocID: 26, TenMonHoc_HienThi: 'Phẩm chất - Trung thực', MonHocCode: 'PC4' },
					{ MonHocID: 27, TenMonHoc_HienThi: 'Phẩm chất - Trách nhiệm', MonHocCode: 'PC5' },
				]
	
				const chiTieus = await this.fn_LoadChiTieu(this.NienKhoa)
	
				// Load tất cả học kì năm hiện tại
				const allHocKiData = {}
				for (const hk of this.DSHocKi) {
					allHocKiData[hk.value] = await this.fn_LoadByNienKhoa_Va_HocKi(this.NienKhoa, hk.value)
				}
	
				// Load cùng kì các năm trước
				const dataCacNamTruoc = {}
				for (const nk of this.CacNienKhoaSoSanh) {
					dataCacNamTruoc[nk] = await this.fn_LoadByNienKhoa_Va_HocKi(nk, this.HocKiSoSanh)
				}
	
				const hocKiSoSanhObj = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
	
				// Render từng phẩm chất
				for (let i = 0; i < DSMonHoc.length; i++) {
					const mon = DSMonHoc[i]
					const headers = this.renderHeader_HKs(mon.MonHocCode, mon.TenMonHoc_HienThi, this.NienKhoa, hocKiSoSanhObj)
					const chiTieuByMon = chiTieus.filter(x => x.MonHocID === mon.MonHocID)
					const items = this.getDataByMonHocID(
						allHocKiData,
						chiTieuByMon,
						mon.MonHocID,
						mon.MonHocCode,
						this.NienKhoa,
						hocKiSoSanhObj,
						dataCacNamTruoc
					)
	
					DSMonHoc[i] = { ...mon, headers, items }
				}
	
				this.DSMonHoc = DSMonHoc
			},
	
			async fn_LoadByNienKhoa_Va_HocKi(NienKhoa, HocKi) {
				let _data = []
				const HK_LMS = this.DSHocKi.find(x => x.value === HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 5,
					HocKi: HK_LMS.textValue,
					CapID: 1,
					NienKhoa: NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0] //Lấy chi tiế
				if (this.BaoCaoItem?.IsChotBaoCao) {
					_data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					let data
					if (this.NguonDuLieu === 'LMS') {
						data = await ajaxCALLPromise("lms/BaoCao_LMS_GetThongKeDanhGia_TheoNLPC", {
							HocKi: HK_LMS.textValue,
							NienKhoa: NienKhoa,
						})
					} else {
						data = await ajaxCALLPromise("psmark1/LMS_GetThongKeDanhGia_TheoNLPC", {
							"NamHoc": NienKhoa,
							"KyDanhGia": HocKi
						})
					}
					_data = this.fn_NormalizeNLPC(data)
					this.DataQLDiem = _data
				}
				return _data
			},
	
			async fn_LoadChiTieu(NienKhoa) {
				const data = await ajaxCALLPromise("lms/ChiTieu_C1_Get", { NienKhoa })
				return data || []
			},
	
			// Chuẩn hóa tên field: QLDiem (HoanThanh/ChuaHoanThanh) và LMS (HT/CHT) → Dat/CanCoGang
			fn_NormalizeNLPC(rows) {
				const flatRows = Array.isArray(rows[0]) ? rows.flat() : (rows || [])
				return flatRows.map(item => {
					const normalized = { ...item }
					for (const key of Object.keys(item)) {
					if (key.endsWith('HoanThanh') && !key.endsWith('TileHoanThanh')) {
						normalized[key.replace('HoanThanh', 'Dat')] = item[key]
					} else if (key.endsWith('TileHoanThanh')) {
						normalized[key.replace('TileHoanThanh', 'TileDat')] = item[key]
					} else if (key.endsWith('ChuaHoanThanh') && !key.endsWith('TileChuaHoanThanh')) {
						normalized[key.replace('ChuaHoanThanh', 'CanCoGang')] = item[key]
					} else if (key.endsWith('TileChuaHoanThanh')) {
						normalized[key.replace('TileChuaHoanThanh', 'TileCanCoGang')] = item[key]
					// LMS format
					} else if (key.endsWith('TileCHT')) {
						normalized[key.replace('TileCHT', 'TileCanCoGang')] = item[key]
					} else if (key.endsWith('CHT') && !key.endsWith('TileCHT')) {
						normalized[key.replace('CHT', 'CanCoGang')] = item[key]
					} else if (key.endsWith('TileHT') && !key.endsWith('TileCHT')) {
						normalized[key.replace('TileHT', 'TileDat')] = item[key]
					} else if (key.endsWith('HT') && !key.endsWith('CHT') && !key.endsWith('TileHT')) {
						normalized[key.replace('HT', 'Dat')] = item[key]
					}
					}
					return normalized
				})
			},
			isSumField(key) {
				return key.includes('SoLuong')
			},
	
			isAvgField(key) {
				return key.includes('Tile')
			},
	
			// ──────────────────────────────────────────────────────────────
			// Hàm chính đã được FIX – hoạt động đúng với dữ liệu chia nhóm
			// ──────────────────────────────────────────────────────────────
			getDataByMonHocID(allHocKiData, chiTieuByMonHocID, MonHocID, MonHocCode, NienKhoa, hocKiSoSanhObj, dataCacNamTruoc) {
				const khois = new Set()
	
				Object.values(allHocKiData).forEach(arr => {
					arr?.forEach(item => item?.KhoiID && khois.add(item.KhoiID))
				})
	
				const rows = []
	
				for (const khoiID of khois) {
					const row = { KhoiID: khoiID }
	
					// --- Chỉ tiêu ---
					const ct = chiTieuByMonHocID.find(x => x.MonHocID === MonHocID && x.KhoiID === khoiID)
					const ct_Tot = ct?.ChiTieu_Tot ?? null
					const ct_Dat = ct?.ChiTieu_Dat ?? null
					const ct_CCG = ct?.ChiTieu_CanCoGang ?? null
	
					const hkText = hocKiSoSanhObj.textValue
					row[`${MonHocCode}ChiTieu_Tot_${hkText}_NK${NienKhoa}`] = ct_Tot
					row[`${MonHocCode}ChiTieu_Dat_${hkText}_NK${NienKhoa}`] = ct_Dat
					row[`${MonHocCode}ChiTieu_CanCoGang_${hkText}_NK${NienKhoa}`] = ct_CCG
	
					// --- Dữ liệu tất cả học kì năm hiện tại ---
					for (const hk of this.DSHocKi) {
						const dataHK = allHocKiData[hk.value]
						row[`${MonHocCode}TileTot_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'TileTot')
						row[`${MonHocCode}SoLuongTot_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'Tot')
	
						row[`${MonHocCode}TileDat_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'TileDat')
						row[`${MonHocCode}SoLuongDat_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'Dat')
	
						row[`${MonHocCode}TileCanCoGang_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode,
							'TileCanCoGang')
						row[`${MonHocCode}SoLuongCanCoGang_${hk.textValue}`] = this.getMonValue(dataHK, khoiID, MonHocCode, 'CanCoGang')
					}
	
					// --- Cùng kì các năm trước ---
					const sortedNK = [...this.CacNienKhoaSoSanh].sort((a, b) => a - b)
					for (const nk of sortedNK) {
						const dataNK = dataCacNamTruoc[nk]
						row[`${MonHocCode}TileTot_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileTot')
						row[`${MonHocCode}TileDat_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileDat')
						row[`${MonHocCode}TileCanCoGang_CungKy_NK${nk}`] = this.getMonValue(dataNK, khoiID, MonHocCode, 'TileCanCoGang')
					}
	
					// --- Giá trị thực tế học kì đang so sánh (để tính tăng/giảm) ---
					const dataSoSanh = allHocKiData[hocKiSoSanhObj.value]
					const thuc_Tot = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileTot')
					const thuc_Dat = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileDat')
					const thuc_CCG = this.getMonValue(dataSoSanh, khoiID, MonHocCode, 'TileCanCoGang')
	
					// --- Tính tăng/giảm ---
					row[`TangGiam_SoVoi_ChiTieu_Tot_${hkText}_NK${NienKhoa}`] =
						thuc_Tot !== null && ct_Tot !== null ? _.round(thuc_Tot - ct_Tot, 2) : null
					row[`TangGiam_SoVoi_ChiTieu_Dat_${hkText}_NK${NienKhoa}`] =
						thuc_Dat !== null && ct_Dat !== null ? _.round(thuc_Dat - ct_Dat, 2) : null
					row[`TangGiam_SoVoi_ChiTieu_CanCoGang_${hkText}_NK${NienKhoa}`] =
						thuc_CCG !== null && ct_CCG !== null ? _.round(thuc_CCG - ct_CCG, 2) : null
	
					rows.push(row)
				}
	
				const totalRow = {
					KhoiID: 'Tổng'
				}
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
					const total = (totalRow[`${MonHocCode}SoLuongTot_${hk.textValue}`] ?? 0) +
						(totalRow[`${MonHocCode}SoLuongDat_${hk.textValue}`] ?? 0) +
						(totalRow[`${MonHocCode}SoLuongCanCoGang_${hk.textValue}`] ?? 0)
					if (total != 0) {
						totalRow[`${MonHocCode}TileTot_${hk.textValue}`] = `${_.round(totalRow[`${MonHocCode}SoLuongTot_${hk.textValue}`] * 100
							/ total, 2)} %`
						totalRow[`${MonHocCode}TileDat_${hk.textValue}`] =
							`${_.round(totalRow[`${MonHocCode}SoLuongDat_${hk.textValue}`] * 100 / total, 2)} %`
						totalRow[`${MonHocCode}TileCanCoGang_${hk.textValue}`] =
							`${_.round(totalRow[`${MonHocCode}SoLuongCanCoGang_${hk.textValue}`] * 100 / total, 2)} %`
					}
				}
				rows.push(totalRow)
	
				return rows
			},
	
			renderHeader_HKs(MonHocCode, TenMonHoc_HienThi, NienKhoa, hocKiSoSanhObj) {
				const groups = [
					{ title: 'TỐT', type: 'Tot', field: 'Tot' },
					{ title: 'ĐẠT', type: 'Dat', field: 'Dat' },
					{ title: 'CẦN CỐ GẮNG', type: 'CanCoGang', field: 'CanCoGang' }
				]
	
				const groupHeaders = []
	
				for (const g of groups) {
					const children = []
	
					// Cùng kì các năm trước
					const sortedNK = [...this.CacNienKhoaSoSanh].sort((a, b) => a - b)
					for (const nk of sortedNK) {
						children.push({
							title: `${hocKiSoSanhObj.title.replace('Giữa ', 'GK_').replace('Cuối ', 'CK_')} ${nk}-${nk + 1}`,
							value: `${MonHocCode}${g.field}_CungKy_NK${nk}`,
							align: 'end'
						})
					}
	
					// Chỉ tiêu
					const chiTieuKey = g.type === 'Tot' ? 'ChiTieu_Tot' : (g.type === 'Dat' ? 'ChiTieu_Dat' : 'ChiTieu_CanCoGang')
					children.push({
						title: `Chỉ tiêu ${NienKhoa}-${NienKhoa + 1}`,
						value: `${MonHocCode}${chiTieuKey}_${hocKiSoSanhObj.textValue}_NK${NienKhoa}`,
						align: 'end'
					})
	
					// Tất cả học kì hiện tại
					for (const hk of this.DSHocKi) {
						children.push({
							title: `${hk.title.replace('Giữa ', 'GK_').replace('Cuối ', 'CK_')} ${NienKhoa}-${NienKhoa + 1}`,
							value: `${MonHocCode}SoLuong${g.field}_${hk.textValue}`,
							align: 'end'
						})
						children.push({
							title: `${hk.title.replace('Giữa ', 'GK_').replace('Cuối ', 'CK_')} ${NienKhoa}-${NienKhoa + 1}\n(%)`,
							value: `${MonHocCode}Tile${g.field}_${hk.textValue}`,
							align: 'end',
							width: 85,
							minWidth: 85,
						})
					}
	
					// Tăng giảm
					children.push({
						title: `Tăng (+) giảm (-) so với chỉ tiêu (${hocKiSoSanhObj.title})`,
						value: `TangGiam_SoVoi_ChiTieu_${g.type}_${hocKiSoSanhObj.textValue}_NK${NienKhoa}`,
						align: 'end',
						width: 150
					})
	
					groupHeaders.push({ title: g.title, align: 'center', children })
				}
	
				return [
					...this.header_HKs,
					{ title: TenMonHoc_HienThi.toUpperCase(), align: 'center', children: groupHeaders },
	
				]
			},
	
			renderTextClassTangGiam(value) {
				if (value > 0) return 'text-success'
				if (value < 0) return 'text-red'
				return ''
			},
	
			stringHeader_TangGiam_SoVoi_ChiTieu_Tot_NK() {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_Tot_${hk?.textValue}_NK${this.NienKhoa}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_Dat_NK() {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_Dat_${hk?.textValue}_NK${this.NienKhoa}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_CanCoGang_NK() {
				const hk = this.DSHocKi.find(x => x.value === this.HocKiSoSanh)
				return `item.TangGiam_SoVoi_ChiTieu_CanCoGang_${hk?.textValue}_NK${this.NienKhoa}`
			},
	
			onExportExcel() {
				exportExcel(this.DSMonHoc, this.DSHocKi, this.HocKiSoSanh, `PhamChat_TongHop_NK${this.NienKhoa}.xlsx`)
			},
		}
	}
</script>