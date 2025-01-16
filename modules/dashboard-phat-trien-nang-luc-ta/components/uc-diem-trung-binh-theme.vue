<template>
	<v-card class="pa-4">
		<v-card :flat="false">
			<v-card-title class="text-primary">Chọn</v-card-title>
			<v-card-text>
				<v-row>
					<v-col>
						<v-select v-model="form.LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID"></v-select>
					</v-col>
					<v-col>
						<v-select v-model="form.HocKy" label="Chọn học kỳ" :items="DSHocKy" item-title="title"
							item-value="value"></v-select>
					</v-col>
					<v-col>
						<v-select v-model="form.HocSinhID" label="Chọn học sinh" :items="DSHocSinh" item-title="HoTen"
							item-value="HocSinhID"></v-select>
					</v-col>
					<v-col>
						<v-btn color="primary" variant="tonal" @click="onLoadChart({
			  	HocKy: form.HocKy,
			  	HocSinhID: form.HocSinhID,
			  	KhoiID: khoiid,
			  	LopID: form.LopID,
			  	MonHocID: monhocid
			  })">
							Xem biểu đồ
						</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-row class="mt-4">
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm trung bình
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_DiemTrungBinh" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm giữa kì và cuối kì
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_KyNang" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm chủ đề
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_Theme" />
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
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
				form: {
					KhoiID: null,
					LopID: null,
					HocKy: null,
					HocSinhID: null
				},
				DSHocKy: [
					{
						"title": "HK1",
						"value": "HK1"
					},
					{
						"title": "HK2",
						"value": "HK2"
					}
				],
				DSLop: [],
				DSHocSinh: [],
				Chart_DiemTrungBinh: {
					series: [],
					chart: {
						height: 500,
						type: 'radar',
						dropShadow: {
							enabled: true,
							blur: 1,
							left: 1,
							top: 1
						}
					},
					title: {
						//text: 'Radar Chart - Multi Series'
					},
					stroke: {
						width: 2
					},
					fill: {
						opacity: 0.1
					},
					markers: {
						size: 0
					},
					yaxis: {
						//	stepSize: 20
					},
					xaxis: {
						categories: []
					}
				},
				Chart_KyNang: {
					series: [],
					chart: {
						height: 500,
						type: 'radar',
						dropShadow: {
							enabled: true,
							blur: 1,
							left: 1,
							top: 1
						}
					},
					title: {
						//text: 'Radar Chart - Multi Series'
					},
					stroke: {
						width: 2
					},
					fill: {
						opacity: 0.1
					},
					markers: {
						size: 0
					},
					yaxis: {
						//	stepSize: 20
					},
					xaxis: {
						categories: []
					}
				},
				Chart_Theme: {
					series: [],
					chart: {
						height: 500,
						type: 'radar',
						dropShadow: {
							enabled: true,
							blur: 1,
							left: 1,
							top: 1
						}
					},
					title: {
						//text: 'Radar Chart - Multi Series'
					},
					stroke: {
						width: 2
					},
					fill: {
						opacity: 0.1
					},
					markers: {
						size: 0
					},
					yaxis: {
						//	stepSize: 20
					},
					xaxis: {
						categories: []
					}
				}
			}
		},
		mounted() {
			this.onLoadDSLop(this.khoiid)
		},
		computed: {},
		watch: {
			khoiid: function (KhoiID) {
				this.form.KhoiID = KhoiID
			},
			'form.KhoiID': function (KhoiID) {
				if (KhoiID) {
					this.onLoadDSLop(KhoiID)
					.then(() => {
						const isValid = this.DSLop.some(item => item.LopID === this.form.LopID);
						if (!isValid) {
							this.form.LopID = null; // Hoặc gán giá trị mặc định
						}
					});
				}
			},
			'form.LopID': function (LopID) {
				if (LopID) {
					this.onLoadDSHocSinh(LopID)
				}else{
					this.form.HocSinhID = null
					this.DSHocSinh = []
				}
			}
		},
		methods: {
			onLoadDSLop(KhoiID) {
				return new Promise(resolve => {
					ajaxCALL('lms/Lop_Get_ByKhoiID',
						{
							KhoiID: KhoiID
						},
						res => {
							this.DSLop = res.data
							resolve()
						}
					)
				})
			},
			onLoadDSHocSinh(LopID) {
				return new Promise(resolve => {
					ajaxCALL('lms/HocSinhLop_Get_ByLopID',
						{
							LopID: LopID
						},
						res => {
							this.DSHocSinh = res.data
							resolve()
						}
					)
				})
			},
			onLoadChart({
				HocKy,
				HocSinhID,
				KhoiID,
				LopID,
				MonHocID
			}) {
				return new Promise(resolve => {
					ajaxCALL('lms/DashboardDiemTrungBinhTheoTheme_Get',
						{
							HocKy,
							HocSinhID,
							KhoiID,
							LopID,
							MonHocID
						},
						res => {
							const DataChart_DiemTrungBinhTheme_API = res.data[0]
							const DataChart_KyNangTheme_API = res.data[1]
	
							this.Chart_DiemTrungBinh = {
								...this.Chart_DiemTrungBinh,
								series: [
									{
										name: "Điểm",
										data: DataChart_DiemTrungBinhTheme_API.map(x => parseFloat(x.KetQuaDanhGia_VI)),
									}
								],
								xaxis: {
									categories: DataChart_DiemTrungBinhTheme_API.map(x => x.MaCotDiem),
								}
							}
	
	
							const kyNang = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem === 'S1_Mid' || x.MaNhomCotDiem === 'S1_Final')
							const labelsKyNang = [...new Set(kyNang.map(x => x.TenCotDiem_EN))]
							const theme = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem !== 'S1_Mid' && x.MaNhomCotDiem !== 'S1_Final')
							const labelsTheme = [...new Set(theme.map(x => x.TenCotDiem_EN))]
							const datasetsTheme_1 = theme.filter(x => x.MaNhomCotDiem === "Theme_1").map(x => x.KetQuaDanhGia_VI)
							const datasetsTheme_2 = theme.filter(x => x.MaNhomCotDiem === "Theme_2").map(x => x.KetQuaDanhGia_VI)
							const datasetsTheme_3 = theme.filter(x => x.MaNhomCotDiem === "Theme_3").map(x => x.KetQuaDanhGia_VI)
							const datasetsTheme_4 = theme.filter(x => x.MaNhomCotDiem === "Theme_4").map(x => x.KetQuaDanhGia_VI)
							const chartTheme = {
								...this.Chart_Theme,
								series: [
									{
										name: "Theme 1",
										data: datasetsTheme_1
									},
									{
										name: "Theme 2",
										data: datasetsTheme_2
									},
									{
										name: "Theme 3",
										data: datasetsTheme_3
									},
									{
										name: "Theme 4",
										data: datasetsTheme_4
									}
								],
								xaxis: {
									categories: labelsTheme
								}
							}
							const chartKyNang = {
								...this.Chart_KyNang,
								series: [{
									name: "Điểm giữa kì",
									data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Mid').map(x => x.KetQuaDanhGia_VI)
								},
								{
									name: "Điểm cuối kì",
									data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Final').map(x => x.KetQuaDanhGia_VI)
								}],
								xaxis: {
									categories: labelsKyNang
								}
							}
							const DataChart_KyNang = {
								Theme: chartTheme,
								KyNang: chartKyNang
							}
							this.Chart_Theme = DataChart_KyNang.Theme
							this.Chart_KyNang = DataChart_KyNang.KyNang
	
						})
				})
			},
			calculateLinearRegression
		}
	}
</script>