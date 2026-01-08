<template>
	<v-card>
		<v-card-text>
			<v-row>
				<v-col>
					<v-select v-model="form.LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
						item-value="LopID" :loading="isLoadingLop" :clearable="true"></v-select>
				</v-col>
				<v-col>
					<v-btn color="primary" variant="tonal" @click="onLoadChart({
						NienKhoa: vueData.NienKhoa,
						KhoiID: form.KhoiID,
						LopID: form.LopID,
					})">Xem biểu đồ</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
		<v-divider></v-divider>
		<v-card-text>
			<v-row>
				<v-col cols="12">
					<v-card :flat="false">
						<v-card-title class="text-primary">Tỉ lệ học sinh</v-card-title>
						<uc-chart-apex :options="Chart_TiLe_TheoLop" />
					</v-card>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: {
		capid: {
			type: Number,
			required: true
		},
		khoiid: {},
		monhocid: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			vueData,
			_,
			form: {
				KhoiID: this.khoiid,
				MonHocItem: {
					MonHocID: this.monhocid
				},
			},
			DSMonHoc: [],
			DSNhomDiem: [],
			DSCotDiem: [],
			DSLop: [],
			isLoadingMaNhomCotDiem: false,
			isLoadingMaCotDiem: false,
			isLoadingLop: false,
			Chart_TiLe_TheoLop: {
				"id": "chart-compare-giua-ky-cuoi-ki",
				"series": [],
				"chart": {
					"type": "bar",
					"height": 350,
					"stacked": true,
					"toolbar": {
						"show": true
					},
					"zoom": {
						"enabled": false
					}
				},
				"xaxis": {
					"categories": []
				},
				"plotOptions": {
					"bar": {
						"horizontal": false,
						"borderRadius": 10,
						"borderRadiusApplication": "end",
						"borderRadiusWhenStacked": "last",
						"dataLabels": {
							"total": {
								"enabled": true,
								"style": {
									"fontSize": "13px",
									"fontWeight": 900
								}
							}
						}
					}
				},
				"legend": {
					"position": "right",
					"offsetY": 40
				},
				"fill": {
					"opacity": 1
				}
			}
		}
	},
	async mounted() {
		if (!this.form.KhoiID) return

		this.isLoadingLop = true
		this.isLoadingMaNhomCotDiem = true
		this.isLoadingMaCotDiem = true

		const LopID = localStorage.getItem('LopID_TA_C2')

		if (LopID) {
			await this.onLoadDSLop(this.form.KhoiID)
				.then(() => this.form.LopID = LopID)
				.finally(() => this.isLoadingLop = false)
			await this.onLoadChart({
				NienKhoa: vueData.NienKhoa,
				KhoiID: this.form.KhoiID,
				LopID: this.form.LopID,
			})
		}
	},
	computed: {},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		'form.KhoiID': function (khoiID) {
			if (khoiID) {
				this.onLoadDSLop(khoiID)
				this.onLoadDSMaNhomCotDiem(khoiID)
			}
		},
		'form.LopID': function (lopID) {
			if (lopID) {
				localStorage.setItem('LopID_TA_C2', lopID)
			}
		},
		'form.MaNhomCotDiem': function (MaNhomCotDiem_new, MaNhomCotDiem_old) {
			if (MaNhomCotDiem_new !== null && MaNhomCotDiem_old !== null) {
				localStorage.setItem('MaNhomCotDiem_TA_C2', MaNhomCotDiem_new)
				this.onLoadDSMaCotDiem(MaNhomCotDiem_new, this.form.MonHocItem.TemplateBangDiemID)
					.then(() => {
						const isValid = this.DSCotDiem.some(item => item.MaCotDiem === this.form.MaCotDiem);
						if (!isValid) {
							this.form.MaCotDiem = null; // Hoặc gán giá trị mặc định
						}
					});
			}
		},
		'form.MaCotDiem': function (MaCotDiem) {
			if (MaCotDiem !== null) {
				localStorage.setItem('MaCotDiem_TA_C2', MaCotDiem)
			}
		}
	},
	methods: {
		onLoadDSMaNhomCotDiem(KhoiID) {
			return new Promise(resolve => {
				const promise = () => {
					return new Promise(resolve => {
						ajaxCALL('lms/MonHoc_GetByKhoiID',
							{
								KhoiID: KhoiID,
								HocKi: vueData.NienKhoaItem.HocKi
							},
							res => {
								const monHocTiengAnh = res.data.find(x => x.MonHocID === this.form.MonHocItem.MonHocID)
								this.form.MonHocItem = monHocTiengAnh
								resolve()
							}
						)
					})
				}
				promise().then(() => {
					ajaxCALL('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID',
						{
							TemplateBangDiemID: this.form.MonHocItem.TemplateBangDiemID
						},
						res => {
							this.DSNhomDiem = res.data
							resolve()
						})
				})
			})
		},
		onLoadDSMaCotDiem(MaNhomCotDiem, TemplateBangDiemID) {
			return new Promise(resolve => {
				ajaxCALL('lms/MaCotDiem_Get_ByMaNhomCotDiem',
					{
						TemplateBangDiemID: TemplateBangDiemID,
						MaNhomCotDiem: MaNhomCotDiem
					},
					res => {
						this.DSCotDiem = res.data
						resolve()
					}
				)
			})
		},
		onLoadDSLop(KhoiID) {
			return new Promise(resolve => {
				ajaxCALL('lms/Lop_Get_ByKhoiID',
					{
						NienKhoa: vueData.NienKhoa,
						KhoiID: KhoiID
					},
					res => {
						this.DSLop = res.data
						resolve()
					}
				)
			})
		},
		onLoadChart({ NienKhoa, KhoiID, LopID }) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardTiLeDat_Compare_GiuaKy_CuoiKi_Get',
					{
						NienKhoa,
						KhoiID,
						LopID: LopID ?? 0
					},
					res => {
						const categoriesChartTiLe_TheoLops = [...new Set(res.data.map(x => x.TenLop))]
						const serieChartTiLe_TheoLops = [
							{
								name: 'Exceeding Requirements/Vượt yêu cầu - Giữa kỳ',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Exceeding Requirements/Vượt yêu cầu - Cuối kỳ',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Meeting Requirements/Đạt yêu cầu - Giữa kỳ',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Meeting Requirements/Đạt yêu cầu - Cuối kỳ',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Not Meeting Requirements/Chưa đạt - Giữa kỳ',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
							},
							{
								name: 'Not Meeting Requirements/Chưa đạt - Cuối kỳ',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
							}
						]
						this.Chart_TiLe_TheoLop = {
							...this.Chart_TiLe_TheoLop,
							series: serieChartTiLe_TheoLops,
							colors: ['#008FFB', '#008FFB', '#80c7fd', '#80c7fd', '#fdb72f', '#fdb72f'],
							xaxis: {
								categories: categoriesChartTiLe_TheoLops
							},
							plotOptions: {
								bar: {
									horizontal: false
								}
							},
						}
						resolve()
					}
				)
			})
		},
	},
}
</script>