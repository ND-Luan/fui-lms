<template>
	<v-card class="pa-4" style="background-color: #f9f9f9;
	height: calc(100dvh - 124px);
    overflow: auto;">
		<v-card>
			<v-card-text>
				<v-row>
					<v-col cols="2">
						<v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm điểm" :items="DSNhomDiem"
							item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" :loading="isLoadingMaNhomCotDiem">
						</v-select>
					</v-col>
					<v-col cols="2">
						<v-btn color="primary" variant="outlined"  prepend-icon= "mdi-chart-line" @click="onLoadChart({
							NienKhoa: vueData.NienKhoa,
							CapID: capid,
							MonHocID: form.MonHocItem.MonHocID,
							MaNhomDiem: form.MaNhomCotDiem
						})">Xem biểu đồ</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider></v-divider>
		<v-row class="mt-2">
			<v-col>
				<v-card :flat="false" style="min-height: 150px">
					<v-card-title class="text-primary">Điểm theo chủ đề từng lớp</v-card-title>
					<v-row>
						<v-col cols="6" v-for="(chart, index) in List_Chart_ChuDe_TheoLop">
							<uc-chart-apex :options="chart" :key="index" />
						</v-col>
					</v-row>
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
			vueData,
			_,
			form: {
				KhoiID: this.khoiid,
				MonHocItem: {
					MonHocID: this.monhocid
				},
				MaNhomCotDiem: null,
				MaCotDiem: null,
			},
			DSMonHoc: [],
			DSNhomDiem: [
				{
					TenNhomCotDiem_VI: "Theme 1",
					MaNhomCotDiem: "Theme_1"
				},
				{
					TenNhomCotDiem_VI: "Theme 2",
					MaNhomCotDiem: "Theme_2"
				},
				{
					TenNhomCotDiem_VI: "Theme 3",
					MaNhomCotDiem: "Theme_3"
				},
				{
					TenNhomCotDiem_VI: "Theme 4",
					MaNhomCotDiem: "Theme_4"
				}
				,
				{
					TenNhomCotDiem_VI: "Theme 5",
					MaNhomCotDiem: "Theme_5"
				},
				{
					TenNhomCotDiem_VI: "Theme 6",
					MaNhomCotDiem: "Theme_6"
				},
				{
					TenNhomCotDiem_VI: "Theme 7",
					MaNhomCotDiem: "Theme_7"
				},
				{
					TenNhomCotDiem_VI: "Theme 8",
					MaNhomCotDiem: "Theme_8"
				},

			],
			DSCotDiem: [],
			isLoadingMaNhomCotDiem: false,
			isLoadingMaCotDiem: false,
			List_Chart_ChuDe_TheoLop: []
		}
	},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		monhocid: {
			handler(newMonHocID) {
				// this.onLoadDSMaNhomCotDiem(this.form.KhoiID)
				// 	.then(() => {
				// 		const isValid = this.DSNhomDiem.some(item => item.MaNhomCotDiem === this.form.MaNhomCotDiem);
				// 		if (!isValid) {
				// 			this.form.MaNhomCotDiem = null; // Hoặc gán giá trị mặc định
				// 		}
				// 	});
			},
		},
	},
	methods: {
		onLoadDSMaNhomCotDiem(KhoiID) {
			return new Promise(resolve => {
				const promise = () => {
					return new Promise(resolve => {
						ajaxCALL('lms/MonHoc_GetByKhoiID',
							{
								NienKhoa: vueData.NienKhoa,
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
		onLoadChart({ NienKhoa, CapID, MonHocID, MaNhomDiem }) {
			if (!MaNhomDiem) return
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiemKyNang_Get',
					{
						NienKhoa,
						CapID,
						MonHocID,
						MaNhomDiem,
						Is_KyNang: false
					},
					res => {
						const DataChartHistogram_Khoi_API = res.data
						this.convertChartLineTongDiem_ChuDe_TheoLop(res.data)
						resolve()
					}
				)
			})
		},
		convertChartLineTongDiem_ChuDe_TheoLop(_rawData) {
			this.List_Chart_ChuDe_TheoLop = []
			const chart = {
				"id": "chart-line",
				"series": [],
				"chart": {
					"height": 350,
					"type": "line",
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false,
					}
				},
				"grid": {
					"row": {
						"colors": [
							"#f3f3f3",
							"transparent"
						],
						"opacity": 0.5
					}
				},
				"dataLabels": {
					"enabled": false
				},
				"stroke": {
					"curve": "straight"
				},
				"xaxis": {
					"categories": []
				}
			}
			const sortData = this.sortTenLop(_rawData)
			const uniqueLopID = [...new Set(sortData.map(x => parseInt(x.LopID)))]
			for (const lopID of uniqueLopID) {
				const lop = _rawData.find(x => parseInt(x.LopID) === lopID)
				const rawData = _rawData.filter(x => parseInt(x.LopID) === lopID);

				const stats = this.processData(rawData, 'TenCotDiem_EN');
				const classes = Object.keys(stats);

				const seriesData = [
					{
						name: 'Trung bình (Mean)',
						type: 'line',
						data: classes.map(lop => stats[lop].mean)
					},
					{
						name: 'Trung vị (Median)',
						type: 'line',
						data: classes.map(lop => stats[lop].median)
					},
					{
						name: 'Độ lệch chuẩn (Std Dev)',
						type: 'line',
						data: classes.map(lop => stats[lop].standardDeviation)
					}
				];
				this.List_Chart_ChuDe_TheoLop.push({
					...chart,
					"id": "chart-line-theme-" + lopID,
					series: seriesData,
					chart: {
						height: 450,
						type: 'line',
						toolbar: {
							show: false
						},
						zoom: {
							enabled: false,
						}
					},
					dataLabels: {
						enabled: true,
						style: {
							fontSize: '10px'
						}
					},
					stroke: {
						curve: 'smooth',
						width: [3, 3, 3]
					},
					title: {
						text: 'Mean, Median, and Standard Deviation of Total Scores by Class ' + lop?.TenLop,
						align: 'center'
					},
					grid: {
						row: {
							colors: ['#f3f3f3', 'transparent'],
							opacity: 0.5
						},
					},
					xaxis: {
						categories: classes,
						title: {
							text: 'Cột điểm'
						}
					},
					yaxis: {
						title: {
							text: 'Scores'
						},
						labels: {
							formatter: function (value) {
								return value ? value.toFixed(2) : (value ?? 0);
							}
						}
					},
					legend: {
						position: 'top',
						horizontalAlign: 'center'
					},
					colors: ['#008FFB', '#00E396', '#FEB019'],
					tooltip: {
						shared: true,
						intersect: false,
						y: {
							formatter: function (value) {
								return value.toFixed(2);
							}
						}
					}
				})
			}
		},
		calculateKDE,
		linspace,
		createHistogramDataWithFixedBins,
		calculateBoxplotStats,
		processData,
		calculateMean,
		calculateMedian,
		calculateStandardDeviation,
		sortTenLop,
	},
}
</script>