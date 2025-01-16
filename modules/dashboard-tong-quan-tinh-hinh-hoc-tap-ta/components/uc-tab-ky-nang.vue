<template>
	<v-card class="pa-4" style="background-color: #f9f9f9;">
		<v-card>
			<v-card-title class="text-primary">Chọn</v-card-title>
			<v-card-text>
				<v-row>
					<v-col>
						<v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm điểm" :items="DSNhomDiem"
							item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem"
							:loading="isLoadingMaNhomCotDiem"></v-select>
					</v-col>
					<v-col>
						<v-btn color="primary" variant="tonal" @click="onLoadChart({
							NienKhoa: 2024,
							CapID: capid,
							MonHocID: form.MonHocItem.MonHocID,
							MaNhomDiem: form.MaNhomCotDiem
						})">Xem biểu đồ</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider></v-divider>
		<v-card-text>
			<v-row>
				<v-col>
					<v-card :flat="false">
						<v-card-title class="text-primary">
							Biểu đồ điểm (Listening, Language, Reading, Writing, Speaking) kỹ năng theo cấp
						</v-card-title>
						<v-card-text>
							<uc-chart-apex :options="Chart_TongDiem_KyNang_TheoKhoi" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12">
					<v-card :flat="false" style="min-height: 300px;">
						<v-card-title class="text-primary">Điểm kỹ năng theo khối</v-card-title>
						<v-row>
							<v-col cols="4" v-for="(chart, index) in List_Chart_KyNang_TheoKhoi">
								<uc-chart-apex :options="chart" :key="index" />
							</v-col>
						</v-row>
					</v-card>
				</v-col>
				<v-col cols="12">
					<v-card :flat="false" style="min-height: 300px;">
						<v-card-title class="text-primary">Điểm kỹ năng theo lớp</v-card-title>
						<v-row>
							<v-col cols="6" v-for="(chart, index) in List_Chart_KyNang_TheoLop">
								<uc-chart-apex :options="chart" :key="index" />
							</v-col>
						</v-row>
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
			DSNhomDiem: [],
			DSCotDiem: [],
			isLoadingMaNhomCotDiem: false,
			isLoadingMaCotDiem: false,
			Chart_TongDiem_KyNang_TheoKhoi: {
				"id": "chart-line-tong-diem-theo-khoi",
				"series": [],
				"chart": {
					"height": 350,
					"type": "line",
					"zoom": {
						"enabled": false
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
			},
			List_Chart_KyNang_TheoKhoi: [],
			List_Chart_KyNang_TheoLop: []
		}
	},
	async mounted() {
		if (!this.form.KhoiID) return

		this.isLoadingMaNhomCotDiem = true
		// this.isLoadingMaCotDiem = true

		// const MaNhomCotDiem = localStorage.getItem('MaNhomCotDiem_TA_C2')
		// const MaCotDiem = null//localStorage.getItem('MaCotDiem_TA_C2')
		await this.onLoadDSMaNhomCotDiem(this.form.KhoiID)
			// .then(() => this.form.MaNhomCotDiem = MaNhomCotDiem)
			.finally(() => this.isLoadingMaNhomCotDiem = false)
		// await this.onLoadDSMaCotDiem(this.form.MaNhomCotDiem, this.form.MonHocItem.TemplateBangDiemID)
		// 	// .then(() => this.form.MaCotDiem = MaCotDiem)
		// 	.finally(() => this.isLoadingMaCotDiem = false)
		// await this.onLoadChart({
		// 	NienKhoa: 2024,
		// 	CapID: this.capid,
		// 	MonHocID: this.form.MonHocItem.MonHocID,
		// 	MaNhomDiem: MaNhomCotDiem
		// })
	},
	computed: {},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		'form.KhoiID': function (khoiID) {
			if (khoiID) {
				this.onLoadDSMaNhomCotDiem(khoiID)
			}
		},
		'form.MaNhomCotDiem': function (MaNhomCotDiem_new, MaNhomCotDiem_old) {
			// if (MaNhomCotDiem_new !== null && MaNhomCotDiem_old !== null) {
			// 	localStorage.setItem('MaNhomCotDiem_TA_C2', MaNhomCotDiem_new)
			// 	this.onLoadDSMaCotDiem(MaNhomCotDiem_new, this.form.MonHocItem.TemplateBangDiemID)
			// 		.then(() => {
			// 			const isValid = this.DSCotDiem.some(item => item.MaCotDiem === this.form.MaCotDiem);
			// 			if (!isValid) {
			// 				this.form.MaCotDiem = null; // Hoặc gán giá trị mặc định
			// 			}
			// 		});
			// }
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
								KhoiID: KhoiID
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
							this.DSNhomDiem = [
								{
									"MaNhomCotDiem": "S1_Mid",
									"TenNhomCotDiem_VI": "Điểm giữa kỳ HK1",
									"TenNhomCotDiem_EN": "Mid_term Points (Semester 1)",
									"ThuTuNhom": 5,
									"Semester": "HK1"
								},
								{
									"MaNhomCotDiem": "S1_Final",
									"TenNhomCotDiem_VI": "Điểm cuối HK1",
									"TenNhomCotDiem_EN": "Final_term Points (Semester 1)",
									"ThuTuNhom": 6,
									"Semester": "HK1"
								}
							]//res.data
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
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiemKyNang_Get',
					{
						NienKhoa,
						CapID,
						MonHocID,
						MaNhomDiem
					},
					res => {
						const DataChartHistogram_Khoi_API = res.data

						this.convertChartLineTongDiem_KyNang_TheoKhoi(DataChartHistogram_Khoi_API)

						this.convertChartLine_KyNang_TheoKhoi(DataChartHistogram_Khoi_API)
						this.convertChartLine_KyNang_TheoLop(DataChartHistogram_Khoi_API)
						resolve()
					}
				)
			})
		},
		convertChartLineTongDiem_KyNang_TheoKhoi(rawData) {
			const stats = this.processData(rawData, 'TenLop');
			const classes = Object.keys(stats);
			// Chuẩn bị dữ liệu cho biểu đồ
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
			this.Chart_TongDiem_KyNang_TheoKhoi = {
				...this.Chart_TongDiem_KyNang_TheoKhoi,
				series: seriesData,
				chart: {
					height: 450,
					type: 'line',
					zoom: {
						enabled: true
					},
					toolbar: {
						show: true
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
					text: 'Mean, Median, and Standard Deviation of Total Scores (Listening, Language, Reading, Writing, Speaking) by Grade',
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
						text: 'Grade'
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
			}
		},
		convertChartLine_KyNang_TheoKhoi(_rawData) {
			this.List_Chart_KyNang_TheoKhoi = []
			const chart = {
				"id": "chart-line-statistic",
				"series": [],
				"chart": {
					"height": 350,
					"type": "line",
					"zoom": {
						"enabled": false
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
			const uniqueKhoiID = [... new Set(_rawData.map(x => x.KhoiID))]
			for (const khoiID of uniqueKhoiID) {
				const rawData = _rawData.filter(x => x.KhoiID === this.form.KhoiID)
				const khoiObj = _rawData.find(x => x.KhoiID === khoiID)

				const stats = this.processData(rawData, 'TenCotDiem_EN');
				const classes = Object.keys(stats);

				// Chuẩn bị dữ liệu cho biểu đồ
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

				this.List_Chart_KyNang_TheoKhoi.push({
					...chart,
					"id": "chart-line-statistic-" + khoiID,
					series: seriesData,
					chart: {
						height: 450,
						type: 'line',
						zoom: {
							enabled: true
						},
						toolbar: {
							show: true
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
						text: khoiObj?.TenKhoi,// 'Mean, Median, and Standard Deviation of Total Scores by Grade ' + khoiObj?.TenKhoi,
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
							text: 'Grade'
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
		convertChartLine_KyNang_TheoLop(_rawData) {
			this.List_Chart_KyNang_TheoLop = []
			let kyNang = {
				Listening: {},
				Language: {},
				Reading: {},
				Writing: {},
				Speaking: {},
			}
			const chart = {
				"id": "chart-line",
				"series": [],
				"chart": {
					"height": 350,
					"type": "line",
					"zoom": {
						"enabled": false
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
			//Listening
			const dataListening = _rawData.filter(x => x.TenCotDiem_EN === 'Listening')
			const dataLanguage = _rawData.filter(x => x.TenCotDiem_EN === 'Language')
			const dataReading = _rawData.filter(x => x.TenCotDiem_EN === 'Reading')
			const dataWriting = _rawData.filter(x => x.TenCotDiem_EN === 'Writing')
			const dataSpeaking = _rawData.filter(x => x.TenCotDiem_EN === 'Speaking')

			console.log('dataListening', dataListening)

			const sortDataListening = this.sortTenLop(dataListening);
			const sortDataLanguage = this.sortTenLop(dataLanguage)
			const sortDataReading = this.sortTenLop(dataReading)
			const sortDataWriting = this.sortTenLop(dataWriting)
			const sortDataSpeaking = this.sortTenLop(dataSpeaking)

			console.log('sortDataListening', sortDataListening)

			const stats_Listening = this.processData(sortDataListening, 'TenLop');
			const stats_Language = this.processData(sortDataLanguage, 'TenLop');
			const stats_Reading = this.processData(sortDataReading, 'TenLop');
			const stats_Writing = this.processData(sortDataWriting, 'TenLop');
			const stats_Speaking = this.processData(sortDataSpeaking, 'TenLop');

			const classes = Object.keys(stats_Listening); //Lấy 1 stats là đủ lớp
			console.log('stats_Listening', stats_Listening)
			const seriesData_Listening = [
				{
					name: 'Trung bình (Mean)',
					type: 'line',
					data: classes.map(lop => stats_Listening[lop].mean)
				},
				{
					name: 'Trung vị (Median)',
					type: 'line',
					data: classes.map(lop => stats_Listening[lop].median)
				},
				{
					name: 'Độ lệch chuẩn (Std Dev)',
					type: 'line',
					data: classes.map(lop => stats_Listening[lop].standardDeviation)
				}
			];
			const seriesData_Language = [
				{
					name: 'Trung bình (Mean)',
					type: 'line',
					data: classes.map(lop => stats_Language[lop].mean)
				},
				{
					name: 'Trung vị (Median)',
					type: 'line',
					data: classes.map(lop => stats_Language[lop].median)
				},
				{
					name: 'Độ lệch chuẩn (Std Dev)',
					type: 'line',
					data: classes.map(lop => stats_Language[lop].standardDeviation)
				}
			];
			const seriesData_Reading = [
				{
					name: 'Trung bình (Mean)',
					type: 'line',
					data: classes.map(lop => stats_Reading[lop].mean)
				},
				{
					name: 'Trung vị (Median)',
					type: 'line',
					data: classes.map(lop => stats_Reading[lop].median)
				},
				{
					name: 'Độ lệch chuẩn (Std Dev)',
					type: 'line',
					data: classes.map(lop => stats_Reading[lop].standardDeviation)
				}
			];
			const seriesData_Writing = [
				{
					name: 'Trung bình (Mean)',
					type: 'line',
					data: classes.map(lop => stats_Writing[lop].mean)
				},
				{
					name: 'Trung vị (Median)',
					type: 'line',
					data: classes.map(lop => stats_Writing[lop].median)
				},
				{
					name: 'Độ lệch chuẩn (Std Dev)',
					type: 'line',
					data: classes.map(lop => stats_Writing[lop].standardDeviation)
				}
			];
			const seriesData_Speaking = [
				{
					name: 'Trung bình (Mean)',
					type: 'line',
					data: classes.map(lop => stats_Speaking[lop].mean)
				},
				{
					name: 'Trung vị (Median)',
					type: 'line',
					data: classes.map(lop => stats_Speaking[lop].median)
				},
				{
					name: 'Độ lệch chuẩn (Std Dev)',
					type: 'line',
					data: classes.map(lop => stats_Speaking[lop].standardDeviation)
				}
			];

			const option = {
				chart: {
					height: 450,
					type: 'line',
					zoom: {
						enabled: true
					},
					toolbar: {
						show: true
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
					text: 'Mean, Median, and Standard Deviation of Total Scores (Listening, Language, Reading, Writing, Speaking) by Class',
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
						text: 'Class'
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
			}

			kyNang.Listening = {
				...chart,
				id: "chart-line-listening",
				series: seriesData_Listening,
				...option,
				title: {
					text: 'Mean, Median, and Standard Deviation of Listening Scores by Class',
					align: 'center'
				}
			}
			kyNang.Language = {
				...chart,
				id: "chart-line-language",
				series: seriesData_Language,
				...option,
				title: {
					text: 'Mean, Median, and Standard Deviation of Language Scores by Class',
					align: 'center'
				}
			}
			kyNang.Reading = {
				...chart,
				id: "chart-line-reading",
				series: seriesData_Reading,
				...option,
				title: {
					text: 'Mean, Median, and Standard Deviation of Reading Scores by Class',
					align: 'center'
				}
			}
			kyNang.Writing = {
				...chart,
				id: "chart-line-writing",
				series: seriesData_Writing,
				...option,
				title: {
					text: 'Mean, Median, and Standard Deviation of Writing Scores by Class',
					align: 'center'
				}
			}
			kyNang.Speaking = {
				...chart,
				id: "chart-line-speaking",
				series: seriesData_Speaking,
				...option,
				title: {
					text: 'Mean, Median, and Standard Deviation of Speaking Scores by Class',
					align: 'center'
				}
			}

			this.List_Chart_KyNang_TheoLop = [kyNang.Listening, kyNang.Language, kyNang.Reading, kyNang.Writing, kyNang.Speaking]
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