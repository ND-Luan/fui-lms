<template>
	<v-card class="pa-4" style="background-color: #f9f9f9;">
		<v-card>
			<v-card-text>
				<v-row>
					<v-col cols="12" md="4">
						<v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm điểm" :items="DSNhomDiem"
							item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem"
							:loading="isLoadingMaNhomCotDiem"></v-select>
					</v-col>
					<!-- <v-col>
						<v-select v-model="form.MaCotDiem" label="Chọn cột điểm" :items="DSCotDiem"
							item-title="TenCotDiem_VI" item-value="MaCotDiem" :loading="isLoadingMaCotDiem"></v-select>
					</v-col> -->
					<v-col cols="6" md="2">
						<v-btn color="primary" variant="outlined" prepend-icon="mdi-chart-line" @click="onLoadChart({
							NienKhoa: vueData.NienKhoa,
							KhoiID: form.KhoiID,
							MonHocID: monhocid,
							MaCotDiem: form.MaCotDiem
						})">Xem biểu đồ</v-btn>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider class="my-4"></v-divider>
		<v-row>
			<v-col :cols="12">
				<v-card :flat="false">
					<v-card-title class="text-primary">Biểu đồ phân phối điểm theo khối</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="ChartHistogram" />
						<uc-chart-apex :options="ChartBoxPlot" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col :cols="12">
				<v-card :flat="false">
					<v-card-text>
						<uc-chart-apex :options="ChartLine_AllLop" />
					</v-card-text>
				</v-card>
			</v-col>

			<v-col :cols="12">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Phân phối điểm theo lớp
						<v-spacer></v-spacer>
						<v-select v-model="selectedLopID" label="Chọn lớp" :items="List_Lop_DataChart_Histogram"
							item-title="TenLop" item-value="LopID" multiple chips style="max-width: 500px"></v-select>
					</v-card-title>
					<v-card-text>
						<v-row>
							<v-col
								:cols="handleColChart(List_Lop_DataChart_Histogram.filter(x => selectedLopID.indexOf(x.LopID) >= 0))"
								v-for="(chart, index) in List_Lop_DataChart_Histogram.filter(x => selectedLopID.indexOf(x.LopID) >= 0)"
								:key="index">
								<uc-chart-apex :options="chart" />
							</v-col>
						</v-row>
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
			vueData,
			selectedLopID: [],
			_,
			form: {
				KhoiID: this.khoiid ?? 0,
				MonHocItem: {
					MonHocID: this.monhocid ?? 0
				},
				MaNhomCotDiem: null,
				MaCotDiem: null,
			},
			DSMonHoc: [],
			DSNhomDiem: [],
			DSCotDiem: [],
			isLoadingMaNhomCotDiem: false,
			isLoadingMaCotDiem: false,
			DataChartHistogram_API: [],
			DataChartHistogram_Khoi_API: [],
			ChartHistogram: {
				id: "chart-historgram",
				chart: {
					type: "line",
					height: 350,
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false,
					}
				},
				series: [],
				xaxis: {
					categories: []
				},
				yaxis: {},
				series: [],
				options: {
					plotOptions: {
						bar: {
							columnWidth: "100%",
							endingShape: "flat"
						}
					}
				}
			},
			ChartBoxPlot: {
				id: "chart-boxplot",
				series: [],
				chart: {
					type: "boxPlot",
					height: 350
				},
				title: {
					text: "",
					align: "left"
				},
				plotOptions: {
					bar: {
						horizontal: true,
						barHeight: "40%"
					},
					boxPlot: {
						colors: {
							upper: "#B6C454",
							lower: "#EDBFB7"
						}
					}
				},
				stroke: {
					colors: [
						"#333"
					]
				}
			},
			ChartLine_AllLop: {
				id: "chart-line",
				series: [],
				chart: {
					height: 350,
					type: "line",
					zoom: {
						"enabled": false
					}
				},
				grid: {
					row: {
						colors: [
							"#f3f3f3",
							"transparent"
						],
						opacity: 0.5
					}
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					curve: "straight"
				},
				xaxis: {
					categories: []
				}
			},
			List_Lop_DataChart_Histogram: [],
			Chart_TongDiemTheoKhoi: {
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
			}
		}
	},
	async mounted() {
		if (!this.form.KhoiID && !this.form.MonHocItem.MonHocID) return
		console.log(this.form)

		this.isLoadingMaNhomCotDiem = true
		this.isLoadingMaCotDiem = true

		const MaNhomCotDiem = localStorage.getItem('MaNhomCotDiem_TA_C' + vueData.CapID)
		const MaCotDiem = localStorage.getItem('MaCotDiem_TA_C' + vueData.CapID)
		console.log('MaCotDiem', MaCotDiem)
		await this.onLoadDSMaNhomCotDiem(this.form.KhoiID)
			.then(() => this.form.MaNhomCotDiem = MaNhomCotDiem)
			.finally(() => this.isLoadingMaNhomCotDiem = false)
		await this.onLoadDSMaCotDiem(MaNhomCotDiem, this.form.MonHocItem.TemplateBangDiemID)
			.then(() => this.form.MaCotDiem = MaCotDiem)
			.finally(() => this.isLoadingMaCotDiem = false)

		if (!this.form?.MonHocItem) return
		await this.onLoadChart({
			NienKhoa: vueData.NienKhoa,
			KhoiID: this.form.KhoiID,
			MonHocID: this.form.MonHocItem.MonHocID,
			MaCotDiem: MaCotDiem
		})
	},
	computed: {},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		monhocid: function (MonHocID) {
			this.form.MonHocItem.MonHocID = MonHocID
		},
		'form.KhoiID': function (khoiID) {
			if (khoiID) {
				this.onLoadDSMaNhomCotDiem(khoiID)
			}
		},
		'form.MaNhomCotDiem': function (MaNhomCotDiem_new, MaNhomCotDiem_old) {
			if (MaNhomCotDiem_new !== null && MaNhomCotDiem_old !== null) {
				localStorage.setItem('MaNhomCotDiem_TA_C' + vueData.CapID, MaNhomCotDiem_new)
				this.onLoadDSMaCotDiem(MaNhomCotDiem_new, this.form.MonHocItem.TemplateBangDiemID)
					.then(() => {
						const isValid = this.DSCotDiem.some(item => item.MaCotDiem === this.form.MaCotDiem);
						if (!isValid) {
							this.form.MaCotDiem = null; // Hoặc gán giá trị mặc định
						}
					});
				if (!this.form?.MonHocItem) return
				this.onLoadChart({
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.form.KhoiID,
					MonHocID: this.form.MonHocItem.MonHocID,
					MaCotDiem: this.form.MaCotDiem
				})
			}
		},
		'form.MaCotDiem': function (MaCotDiem) {
			if (MaCotDiem !== null) {
				localStorage.setItem('MaCotDiem_TA_C' + vueData.CapID, MaCotDiem)
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
								NienKhoa: vueData.NienKhoa,
								KhoiID: KhoiID,
								HocKi: vueData.NienKhoaItem.HocKi
							},
							res => {
								console.log(res.data)
								const monHocTiengAnh = res.data.find(x => x.MonHocID === this.monhocid)
								console.log('monHocTiengAnh', monHocTiengAnh)
								this.form.MonHocItem = monHocTiengAnh
								resolve()
							}
						)
					})
				}
				promise().then(() => {
					if (this.form.MonHocItem) {
						ajaxCALL('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID',
							{
								TemplateBangDiemID: this.form.MonHocItem.TemplateBangDiemID
							},
							res => {
								// this.DSNhomDiem = [
								// 	{
								// 		"MaNhomCotDiem": "S1_Mid",
								// 		"TenNhomCotDiem_VI": "Điểm giữa kì HK1",
								// 		"TenNhomCotDiem_EN": "Mid_term Points (Semester 1)",
								// 		"ThuTuNhom": 5,
								// 		"Semester": "HK1"
								// 	},
								// 	{
								// 		"MaNhomCotDiem": "S1_Final",
								// 		"TenNhomCotDiem_VI": "Điểm cuối HK1",
								// 		"TenNhomCotDiem_EN": "Final_term Points (Semester 1)",
								// 		"ThuTuNhom": 6,
								// 		"Semester": "HK1"
								// 	},
								// 	{
								// 		"MaNhomCotDiem": "DiemTB_HK1",
								// 		"TenNhomCotDiem_VI": "Điểm trung bình HK1",
								// 		"TenNhomCotDiem_EN": "Average Points (Semester 1)",
								// 		"ThuTuNhom": 7,
								// 		"Semester": "HK1"
								// 	}
								// ]
								this.DSNhomDiem = res.data.filter(x => {
									const ten = x.TenNhomCotDiem_VI.toLowerCase();
									return (ten.includes('giữa hk') || ten.includes('cuối hk'))
								})
								//res.data
								resolve()
							}
						)
					}
				})

				resolve()
			})
		},
		onLoadDSMaCotDiem(MaNhomCotDiem, TemplateBangDiemID) {
			return new Promise(resolve => {
				// ajaxCALL('lms/MaCotDiem_Get_ByMaNhomCotDiem',
				// 	{
				// 		TemplateBangDiemID: TemplateBangDiemID,
				// 		MaNhomCotDiem: MaNhomCotDiem
				// 	},
				// 	res => {

				// 		resolve()
				// 	}
				// )
				this.DSCotDiem = [{
					"MaNhomCotDiem": "S1_Mid",
					"TenNhomCotDiem_VI": "Điểm giữa kỳ HK1",
					"TenCotDiem_VI": "Tổng",
					"MaCotDiem": "S1_Mid_Total_Point",
				},
				{
					"MaNhomCotDiem": "S1_Final",
					"TenNhomCotDiem_VI": "Điểm cuối HK1",
					"TenCotDiem_VI": "Tổng",
					"MaCotDiem": "S1_Final_Total_Point",
				},
				{
					"MaNhomCotDiem": "DiemTB_HK1",
					"TenNhomCotDiem_VI": "Điểm TB HK1",
					"TenCotDiem_VI": "Điểm TB HK1",
					"MaCotDiem": "DiemTB_HK1",
				},
				{
					"MaNhomCotDiem": "S2_Mid",
					"TenNhomCotDiem_VI": "Điểm giữa kỳ HK2",
					"TenCotDiem_VI": "Tổng",
					"MaCotDiem": "S2_Mid_Total_Point",
				},
				{
					"MaNhomCotDiem": "S2_Final",
					"TenNhomCotDiem_VI": "Điểm cuối HK2",
					"TenCotDiem_VI": "Tổng",
					"MaCotDiem": "S2_Final_Total_Point",
				},
				{
					"MaNhomCotDiem": "DiemTB_HK2",
					"TenNhomCotDiem_VI": "Điểm TB HK2",
					"TenCotDiem_VI": "Điểm TB HK2",
					"MaCotDiem": "DiemTB_HK2",

				}]
				resolve()
			})
		},
		onLoadChart({ NienKhoa, KhoiID, MonHocID, MaCotDiem }) {
			return new Promise(resolve => {
				const objMaCotDiem = this.DSCotDiem.find(x => x.MaNhomCotDiem === this.form.MaNhomCotDiem)
				console.log('objMaCotDiem', objMaCotDiem)
				ajaxCALL('lms/DashboardPhanPhoiDiem_Get',
					{
						NienKhoa, KhoiID, MonHocID, MaCotDiem: objMaCotDiem?.MaCotDiem ?? ''
					},
					res => {
						const DataChartHistogram_API = res.data[0]
						const DataChartHistogram_Khoi_API = res.data[1]

						this.convertChartHistogram(DataChartHistogram_API)
						this.convertChartBoxPlot(DataChartHistogram_API)

						this.convertChartLineToTalScore_AllLop(DataChartHistogram_API)
						this.convertChartMultipleLop(DataChartHistogram_API)

						resolve()
					}
				)
			})
		},
		convertChartHistogram(rawData) {
			let bin_x;
			// 2. Tạo histogram data với bin cố định
			const { histogramData, fixedBins, bin_x_data } = this.createHistogramDataWithFixedBins(rawData);
			// 3. Lấy trung điểm của bin
			const midPoints = histogramData.map(item => item.midPoint)
			// 4. Tính toán KDE
			const kdeData = this.calculateKDE(rawData, midPoints);
			const histogramDataWithKDE = histogramData.map((item, index) => ({
				...item,
				kde: kdeData[index]?.y || 0
			}));
			bin_x = bin_x_data
			this.ChartHistogram = {
				...this.DataChartHistogram,
				series: [
					{
						name: 'Histogram',
						type: 'column',
						data: histogramDataWithKDE.map(item => item.y),
						borderColor: '#000',
						borderWidth: 1,
						backgroundColor: 'rgba(255, 193, 7, 0.7)',
						yAxis: 0
					},
					{
						name: 'KDE',
						type: 'line',
						//data: histogramDataWithKDE.map(item => ({ x: item.x, y: item.kde })),
						data: histogramDataWithKDE.map(item => item.kde),
						borderColor: 'red',
						yAxis: 1,
						tension: 0.4,
					}
				],
				chart: {
					height: 500,
					type: 'line',
					stacked: false,
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false,
					}
				},
				stroke: {
					width: [1, 2],
					curve: 'smooth'
				},
				plotOptions: {
					bar: {
						columnWidth: '100%'
					}
				},
				xaxis: {
					categories: bin_x,//histogramDataWithKDE.map(item => item.x),
					title: {
						text: 'Tổng (Total) Score',
						style: {
							fontSize: '12px',
							fontWeight: 600
						}
					},
					labels: {
						hideOverlappingLabels: false, // Hiển thị tất cả nhãn, ngay cả khi chúng bị chồng chéo
						formatter: function (value) {
							if (typeof value === 'number') {
								return value.toFixed(2); // Định dạng thành số thập phân
							}
							return value; // Trả lại giá trị nguyên gốc nếu không phải là số
						},
						style: {
							fontSize: '10px'
						},
						show: true, // Hiển thị nhãn
					},
					// tickAmount: 20, // Thử tăng số lượng tick
					// min: bin_x[0], // Thiết lập giá trị min để đảm bảo hiển thị đầy đủ
					// max: bin_x[bin_x.length - 1], // Thiết lập giá trị max
				},
				yaxis: [
					{
						seriesName: 'Histogram',
						min: 0,
						title: {
							text: 'Frequency',
							style: {
								color: '#008FFB'
							}
						},
						labels: {
							formatter: function (value) {
								return value.toFixed(2);
							},
							style: {
								color: '#008FFB'
							}
						}
					},
					{
						seriesName: 'KDE',
						opposite: true,
						min: 0,
						title: {
							text: 'Mật Độ KDE',
							style: {
								color: '#FF4560'
							}
						},
						labels: {
							formatter: function (value) {
								return value.toFixed(2);
							},
							style: {
								color: '#FF4560'
							}
						}
					}
				],
				tooltip: {
					shared: true,
					intersect: false
				},
				legend: {
					show: true,
					position: 'top'
				},
				grid: {
					show: true,
					borderColor: '#90A4AE',
					strokeDashArray: 4,
					xaxis: {
						lines: {
							show: true,
						}
					},
					yaxis: {
						lines: {
							show: true,
						}
					},
				},
				title: {
					text: 'Distribution of Tổng (Total) Scores',
					align: 'center'
				}
			}
		},
		convertChartBoxPlot(rawData) {
			const data = rawData.map(x => x.Diem)
			const stats = this.calculateBoxplotStats(data);
			this.ChartBoxPlot = {
				...this.ChartBoxPlot,
				series: [{
					data: [{
						x: '',
						y: [stats.min, stats.q1, stats.median, stats.q3, stats.max],
						goals: stats.outliers.map(outlier => ({
							name: 'Điểm Ngoại Lai',
							value: outlier,
							strokeColor: '#FF4560',
							strokeWidth: 10,
							strokeHeight: 0,
							strokeLineCap: 'round',
						}))
					}]
				}],
				chart: {
					type: 'boxPlot',
					height: 150,
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false,
					}
				},
				title: {
					text: 'Phân Phối Điểm',
					align: 'center'
				},
				plotOptions: {
					bar: { horizontal: true },
					boxPlot: {
						horizontal: true,
						colors: {
							upper: '#2E93fA',
							lower: '#66DA26'
						}
					}
				},
				xaxis: {
					title: { text: 'Điểm Số' },
					// min: 0,
					// max: 10,
					tickAmount: 10,
					decimalsInFloat: 1
				},
				tooltip: {
					shared: false,
					intersect: true
				}
			};
		},
		convertChartLineToTalScore_AllLop(_rawData) {
			const rawData = _rawData
			// Xử lý dữ liệu thống kê
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
			]
			this.ChartLine_AllLop = {
				...this.ChartLine_AllLop,
				series: seriesData,
				chart: {
					height: 350,
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
					text: 'Mean, Median, and Standard Deviation of Total Scores by Class',
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
		},
		convertChartMultipleLop(rawData) {
			this.List_Lop_DataChart_Histogram = []
			this.selectedLopID = []
			const chart = {
				"id": "chart-histogram",
				"chart": {
					"type": "line",
					toolbar: {
						show: false
					},
					zoom: {
						enabled: false,
					}
				},
				"xaxis": {
					"categories": []
				},
				"yaxis": {},
				"series": [],
				"options": {
					"plotOptions": {
						"bar": {
							"columnWidth": "100%",
							"endingShape": "flat"
						}
					}
				}
			}
			const sortData = this.sortTenLop(rawData)
			const uniqueLopID = [...new Set(sortData.map(x => x.LopID))]
			for (const lopID of uniqueLopID) {
				let bin_x
				const lop = sortData.find(x => x.LopID === lopID)
				// 1. Lấy dữ liệu điểm từ API
				const rawData = sortData.filter(x => x.LopID === lopID);
				// 2. Tạo histogram data với bin cố định
				const { histogramData, fixedBins, bin_x_data } = this.createHistogramDataWithFixedBins(rawData);
				// 3. Lấy trung điểm của bin
				const midPoints = histogramData.map(item => item.midPoint)
				// 4. Tính toán KDE
				const kdeData = this.calculateKDE(rawData, midPoints);
				const histogramDataWithKDE = histogramData.map((item, index) => ({
					...item,
					kde: kdeData[index]?.y || 0
				}));
				bin_x = bin_x_data
				this.List_Lop_DataChart_Histogram.push({
					...chart,
					LopID: lopID,
					TenLop: lop.TenLop,
					id: `chart-histogram-${lopID}`,
					series: [
						{
							name: 'Histogram',
							type: 'column',
							data: histogramDataWithKDE.map(item => item.y),
							borderColor: '#000',
							borderWidth: 1,
							backgroundColor: 'rgba(255, 193, 7, 0.7)',
							yAxis: 0
						},
						{
							name: 'KDE',
							type: 'line',
							//data: histogramDataWithKDE.map(item => ({ x: item.x, y: item.kde })),
							data: histogramDataWithKDE.map(item => item.kde),
							borderColor: 'red',
							yAxis: 1,
							tension: 0.4,
						}
					],
					chart: {
						height: 500,
						type: 'line',
						stacked: false,
						toolbar: {
							show: false
						},
						zoom: {
							enabled: false,
						}
					},
					stroke: {
						width: [1, 2],
						curve: 'smooth'
					},
					plotOptions: {
						bar: {
							columnWidth: '100%'
						}
					},
					xaxis: {
						categories: bin_x,//histogramDataWithKDE.map(item => item.x),
						title: {
							text: 'Tổng (Total) Score',
							style: {
								fontSize: '12px',
								fontWeight: 600
							}
						},
						labels: {
							hideOverlappingLabels: false, // Hiển thị tất cả nhãn, ngay cả khi chúng bị chồng chéo
							formatter: function (value) {
								if (typeof value === 'number') {
									return value.toFixed(2);  // Định dạng thành số thập phân
								}
								return value;  // Trả lại giá trị nguyên gốc nếu không phải là số
							},
							style: {
								fontSize: '10px'
							},
							show: true, // Hiển thị nhãn
						},
						// tickAmount: 20, // Thử tăng số lượng tick
						// min: bin_x[0], // Thiết lập giá trị min để đảm bảo hiển thị đầy đủ
						// max: bin_x[bin_x.length - 1], // Thiết lập giá trị max
					},
					yaxis: [
						{
							seriesName: 'Histogram',
							min: 0,
							title: {
								text: 'Frequency',
								style: {
									color: '#008FFB'
								}
							},
							labels: {
								formatter: function (value) {
									return value.toFixed(2);
								},
								style: {
									color: '#008FFB'
								}
							}
						},
						{
							seriesName: 'KDE',
							opposite: true,
							min: 0,
							title: {
								text: 'Mật Độ KDE',
								style: {
									color: '#FF4560'
								}
							},
							labels: {
								formatter: function (value) {
									return value.toFixed(2);
								},
								style: {
									color: '#FF4560'
								}
							}
						}
					],
					tooltip: {
						shared: true,
						intersect: false
					},
					legend: {
						show: true,
						position: 'top'
					},
					grid: {
						show: true,
						borderColor: '#90A4AE',
						strokeDashArray: 4,
						xaxis: {
							lines: {
								show: true,
							}
						},
						yaxis: {
							lines: {
								show: true,
							}
						},
					},
					title: {
						text: `Distribution of Tổng (Total) Scores - ${lop.TenLop}`,
						align: 'center'
					}
				});
				this.selectedLopID.push(lopID)
			}
		},
		//Tính toán
		calculateKDE,
		linspace,
		createHistogramDataWithFixedBins,
		calculateBoxplotStats,
		processData,
		calculateMean,
		calculateMedian,
		calculateStandardDeviation,
		sortTenLop,

		handleColChart(arrColumn) {
			// if(arrColumn.length == 1){
			// 	return 12
			// }else if(arrColumn.length == 2){
			// 	return 6
			// }
			// else if(arrColumn.length >= 3){
			// 	return 4
			// }
			return 12
		}
	},
}
</script>