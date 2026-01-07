<template>
	<v-card>
		<v-card-text>
			<v-row dense>
				<v-col cols="6">
					<v-select v-model="HocKi" label="Chọn học kì để so với chỉ tiêu" :items="DSHocKi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col>
					<v-btn color="primary" variant="tonal" @click="onLoad">Tìm kiếm</v-btn>
					<v-btn color="primary" variant="tonal" :disabled="DSMonHoc.length === 0" @click="onExportExcel">
						Xuất excel
					</v-btn>
					<v-btn color="primary" variant="tonal"
						:disabled="!BaoCaoItem || DSMonHoc.length === 0 || BaoCaoItem?.IsChotBaoCao"
						@click="onChotBaoCao">Chốt báo cáo</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
	<v-card>
		<v-card-text class="py-0">
			<p v-if="BaoCaoItem?.IsChotBaoCao" class="text-caption">
				<span class="text-red">Thời điểm chốt:</span> [{{BaoCaoItem.NguoiChot}}] {{BaoCaoItem.HoTenNguoiChot}} •
				{{BaoCaoItem.NgayChot}}
			</p>
		</v-card-text>
	</v-card>
	<v-card class="w-100" style="max-height: calc(100dvh - 116px); overflow: auto">
		<v-card-text v-for="(monHoc, index) in DSMonHoc">
			<v-data-table class="table-bordered" :headers="monHoc.headers" :items="monHoc.items" hide-default-footer
				:items-per-page="-1">
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_CanCoGang_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_Dat_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
				<template v-slot:[stringHeader_TangGiam_SoVoi_ChiTieu_Tot_NK(NienKhoa)]="{item, value}">
					<p :class="renderTextClassTangGiam(value)">{{value}}</p>
				</template>
				<!-- DÒNG TỔNG CUỐI BẢNG -->
				<template v-slot:body.append>
					<tr class="font-weight-bold">
						<td v-for="h in getLeafHeaders(monHoc.headers)" :key="h.value"
							:class="h.value === 'KhoiID' ? 'text-center' : 'text-end'">
							{{ calcFooterCell(monHoc.items, h.value) }}
						</td>
					</tr>
				</template>
			</v-data-table>
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
				HocKi: null,
				DSMonHoc: [],
				Data: [],
				header_HKs: [
					{
						title: "Khối",
						value: "KhoiID",
						align: "center",
						minWidth: 50,
						width: 50,
						fixed: true
					}
				],
				DataQLDiem: [],
				BaoCaoItem: null
			}
		},
		methods: {
			async onLoad() {
				const DSMonHoc = [
					{ MonHocID: 23, TenMonHoc_HienThi: 'Phẩm chất - Yêu nước', MonHocCode: 'PC1' },
					{ MonHocID: 24, TenMonHoc_HienThi: 'Phẩm chất - Nhân ái', MonHocCode: 'PC2' },
					{ MonHocID: 25, TenMonHoc_HienThi: 'Phẩm chất - Chăm chỉ', MonHocCode: 'PC3' },
					{ MonHocID: 26, TenMonHoc_HienThi: 'Phẩm chất - Trung thực', MonHocCode: 'PC4' },
					{ MonHocID: 27, TenMonHoc_HienThi: 'Phẩm chất - Trách nhiệm', MonHocCode: 'PC5' },
				]
				const newData = []
				const objHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const data = await this.fn_LoadByNienKhoa_Va_HocKi(this.NienKhoa, this.HocKi)
				console.log("data", data)
				const chiTieus = await this.fn_LoadChiTieu(this.NienKhoa)
				for (var monHoc of DSMonHoc) {
					const headers = this.renderHeader_HKs(monHoc.MonHocCode, monHoc.TenMonHoc_HienThi, this.NienKhoa, objHK?.title ?? '')
					const chiTieuByMonHocID = chiTieus.filter(x => x.MonHocID === monHoc.MonHocID)
					const items = this.getDataByMonHocID(data.flat(), chiTieuByMonHocID, monHoc.MonHocID, monHoc.MonHocCode, this.NienKhoa)
					newData.push({
						...monHoc,
						headers,
						items
					})
				}
				this.DSMonHoc = newData
			},
			async fn_LoadByNienKhoa_Va_HocKi(NienKhoa, HocKi) {
				let _data
				const HK_LMS = this.DSHocKi.find(x => x.value === HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 5,
					HocKi: HK_LMS.textValue,
					CapID: 1,
					NienKhoa: NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0] //Lấy chi tiế
				if (this.BaoCaoItem.IsChotBaoCao) {
					_data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				} else {
					const data = await ajaxCALLPromise("psmark1/LMS_GetThongKeDanhGia_TheoNLPC", {
						"NamHoc": NienKhoa,
						"KyDanhGia": HocKi
					})
					_data = data
					this.DataQLDiem = data
				}
				return _data
			},
			async fn_LoadChiTieu(NienKhoa) {
				return await ajaxCALLPromise("lms/ChiTieu_C1_Get", { NienKhoa })
			},
			getDataByMonHocID(data, chiTieuByMonHocID, MonHocID, MonHocCode, NienKhoa) {
				const newData = []
	
				for (var item of data) {
					for (var key in item) {
						if (key.includes(MonHocCode)) {
	
							const x = chiTieuByMonHocID.find(n => n.MonHocID === MonHocID && item.KhoiID === n.KhoiID)
	
							// Lấy các tỷ lệ thực tế từ item
							const tlTot = item[`${MonHocCode}TileTot`] ?? null
							const tlDat = item[`${MonHocCode}TileHoanThanh`] ?? null
							const tlCCG = item[`${MonHocCode}TileChuaHoanThanh`] ?? null
	
							// Lấy chỉ tiêu
							const ct_Tot = x?.ChiTieu_Tot ?? null
							const ct_Dat = x?.ChiTieu_Dat ?? null
							const ct_CCG = x?.ChiTieu_CanCoGang ?? null
	
							const slTot = Number(item[`${MonHocCode}Tot`]) || 0
							const slDat = Number(item[`${MonHocCode}HoanThanh`]) || 0
							const slCCG = Number(item[`${MonHocCode}ChuaHoanThanh`]) || 0
	
							newData.push({
								...item,
	
								TongSL: slTot + slDat + slCCG,
	
								// Chỉ tiêu
								[`${MonHocCode}ChiTieu_Tot_NK${NienKhoa}`]: ct_Tot,
								[`${MonHocCode}ChiTieu_Dat_NK${NienKhoa}`]: ct_Dat,
								[`${MonHocCode}ChiTieu_CanCoGang_NK${NienKhoa}`]: ct_CCG,
	
								// Tăng giảm
								[`TangGiam_SoVoi_ChiTieu_Tot_NK${NienKhoa}`]: tlTot != null && ct_Tot != null ? _.round(tlTot - ct_Tot, 2) : null,
								[`TangGiam_SoVoi_ChiTieu_Dat_NK${NienKhoa}`]: tlDat != null && ct_Dat != null ? _.round(tlDat - ct_Dat, 2) : null,
								[`TangGiam_SoVoi_ChiTieu_CanCoGang_NK${NienKhoa}`]: tlCCG != null && ct_CCG != null ? _.round(tlCCG - ct_CCG, 2) : null,
							})
							break
						}
					}
				}
	
				return newData
			},
			renderHeader_HKs(MonHocCode, TenMonHoc_HienThi, NienKhoa, Semester) {
				const headers = [
					{
						title: "TSHS ĐÁNH GIÁ",
						value: "TongSL",
						align: "end",
						minWidth: 70,
						width: 70
					},
					{
						title: TenMonHoc_HienThi.toUpperCase(),
						align: "center",
						children: [
	
							{
								title: "TỐT",
								align: "center",
								children: [
									{ title: `Chỉ tiêu ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}ChiTieu_Tot_NK${NienKhoa}`, align: "end" },
									{ title: `Số lượng ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}Tot`, align: "end" },
									{ title: `${Semester} ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}TileTot`, align: "end" },
									{ title: "Tăng giảm so với chỉ tiêu", value: `TangGiam_SoVoi_ChiTieu_Tot_NK${NienKhoa}`, align: "end" }
								]
							},
							{
								title: "ĐẠT",
								align: "center",
								children: [
									{ title: `Chỉ tiêu ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}ChiTieu_Dat_NK${NienKhoa}`, align: "end" },
									{ title: `Số lượng ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}HT`, align: "end" },
									{ title: `${Semester} ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}TileHT`, align: "end" },
									{ title: "Tăng giảm so với chỉ tiêu", value: `TangGiam_SoVoi_ChiTieu_Dat_NK${NienKhoa}`, align: "end" }
								]
							},
							{
								title: "CẦN CỐ GẮNG",
								align: "center",
								children: [
									{ title: `Chỉ tiêu ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}ChiTieu_CanCoGang_NK${NienKhoa}`, align: "end" },
									{ title: `Số lượng ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}CHT`, align: "end" },
									{ title: `${Semester} ${NienKhoa} - ${NienKhoa + 1}`, value: `${MonHocCode}TileCHT`, align: "end" },
									{ title: "Tăng giảm so với chỉ tiêu", value: `TangGiam_SoVoi_ChiTieu_CHT_NK${NienKhoa}`, align: "end" }
								]
							}
						]
					},
				]
				return [...this.header_HKs, ...headers]
			},
			renderTextClassTangGiam(value) {
				let string = ''
				if (value > 0) string = 'text-success'
				else if (value < 0) string = 'text-red'
				return string
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_CanCoGang_NK(nk) {
				return `item.TangGiam_SoVoi_ChiTieu_CanCoGang_NK${nk ?? ''}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_Dat_NK(nk) {
				return `item.TangGiam_SoVoi_ChiTieu_Dat_NK${nk ?? ''}`
			},
			stringHeader_TangGiam_SoVoi_ChiTieu_Tot_NK(nk) {
				return `item.TangGiam_SoVoi_ChiTieu_Tot_NK${nk ?? ''}`
			},
	
			getLeafHeaders(headers) {
				const res = []
				const walk = (arr) => {
					(arr || []).forEach(h => {
						if (h?.children?.length) walk(h.children)
						else if (h) res.push(h)
					})
				}
				walk(headers)
				return res
			},
	
			calcFooterCell(items, colKey) {
				// Tổng SLHS đánh giá
				const totalSL = (items || []).reduce((s, x) => s + (Number(x.TongSL) || 0), 0)
	
				// 1) Cột Khối/Cấp: text "Tổng"
				if (colKey === 'KhoiID') return 'Tổng'
	
				// 2) Cột TSHS ĐÁNH GIÁ: Sum(TongSL)
				if (colKey === 'TongSL') return totalSL
	
				// 3) Cột Số lượng theo mức: *Tot, *HT, *CHT => SUM
				// (tránh nhầm TileTot/TileHT/TileCHT)
				if (/(Tot|HT|CHT)$/.test(colKey) && !colKey.includes('Tile')) {
					return (items || []).reduce((s, x) => s + (Number(x[colKey]) || 0), 0)
				}
	
				// 4) Cột %: *TileTot, *TileHT, *TileCHT => SUM(mức)/SUM(TongSL)*100
				if (/Tile(Tot|HT|CHT)$/.test(colKey)) {
					const countKey = colKey
						.replace('TileTot', 'Tot')
						.replace('TileHoanThanh', 'Dat')
						.replace('TileChuaHoanThanh', 'CanCoGang')
	
					const sumCount = (items || []).reduce((s, x) => s + (Number(x[countKey]) || 0), 0)
					const pct = totalSL > 0 ? (sumCount / totalSL) * 100 : 0
					return `${_.round(pct, 2)}%`
				}
	
				// Các cột khác (ChiTieu, TangGiam...) nếu chưa cần tổng thì để trống
				return ''
			},
	
			onExportExcel() {
				const hk = this.DSHocKi.find(x => x.value === this.HocKi)
				exportExcel(this.DSMonHoc, this.DSHocKi, this.HocKi, `PhanChat_${hk.textValue}_NK${this.NienKhoa}.xlsx`)
			},
			onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataQLDiem
						}).then(() => {
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
							$this.onLoad()
						})
					}
				})
			},
			formatPercent(value) {
				// value có thể là string "69.02" hoặc number
				const n = Number(value)
				if (!Number.isFinite(n)) return ''
				return `${_.round(n, 2)}%`
			}
		},
	}
</script>