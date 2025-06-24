<template>
	<v-card class="pa-4" style="background-color: #f9f9f9;">
		<v-card>
			<v-card-text>
				<v-row dense>
					<v-col cols="12" md="3">
						<v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm điểm" :items="DSNhomDiem"
							item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" :loading="isLoadingMaNhomCotDiem">
						</v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-btn color="primary" variant="tonal" @click="onLoadChart({
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
		<v-card-text class="px-0">
			<v-row>
				<v-col>
					<v-card :flat="false">
						<v-card-title class="text-primary">
							Biểu đồ điểm (Listening, Language, Reading, Writing, Speaking) kĩ năng theo cấp
						</v-card-title>
						<v-card-text>
							<uc-chart-apex :options="Chart_TongDiem_KyNang_TheoKhoi" />
						</v-card-text>
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
			this.onLoadChart({
				NienKhoa: vueData.NienKhoa,
				CapID: this.capid,
				MonHocID: this.form.MonHocItem.MonHocID,
				MaNhomDiem: this.form.MaNhomCotDiem
			})
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
								NienKhoa: vueData.NienKhoa,
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
							this.DSNhomDiem = res.data.filter(x => {
								const ten = x.TenNhomCotDiem_VI.toLowerCase();
								return (ten.includes('giữa hk') || ten.includes('cuối hk'))
							})
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
						MaNhomDiem: MaNhomDiem,
						Is_KyNang: this.monhocid === 46 ? true : false
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
			const stats_GK = this.processData(rawData.filter(x => (x.MaNhomCotDiem.includes('S1_Mid'))
				|| (x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');
			const classes_GK = Object.keys(stats_GK);

			const stats_CK = this.processData(rawData.filter(x => (x.MaNhomCotDiem.includes('S1_Final'))
				|| (x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');
			const classes_CK = Object.keys(stats_CK);

			const stats = this.processData(rawData, 'TenLop');
			const classes = Object.keys(stats);
			// Chuẩn bị dữ liệu cho biểu đồ
			let seriesData = []
			if (Object.keys(stats_GK).length > 0) {
				seriesData.push({
					name: 'Trung bình (Mean) - GK1',
					type: 'line',
					data: classes_GK.map(lop => stats_GK[lop].mean)
				})
				seriesData.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_GK.map(lop => stats_GK[lop].median)
				})
				seriesData.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_GK.map(lop => stats_GK[lop].standardDeviation)
				})
			}

			if (Object.keys(stats_CK).length > 0) {
				seriesData.push({
					name: 'Trung bình (Mean) - CK1',
					type: 'line',
					data: classes_CK.map(lop => stats_CK[lop].mean)
				})
				seriesData.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_CK.map(lop => stats_CK[lop].median)
				})
				seriesData.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_CK.map(lop => stats_CK[lop].standardDeviation)
				})
			}

			this.Chart_TongDiem_KyNang_TheoKhoi = {
				...this.Chart_TongDiem_KyNang_TheoKhoi,
				series: seriesData,
				chart: {
					height: 450,
					type: 'line',
					zoom: {
						enabled: false
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
				colors: ['#008FFB', '#00E396', '#FEB019', '#E91E63', '#66DA26', '#546E7A'],
				tooltip: {
					shared: true,
					intersect: false,
					y: {
						formatter: function (value) {
							return value ? value.toFixed(2) : 0;
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
				// const rawData = _rawData.filter(x => x.KhoiID === this.form.KhoiID)
				const khoiObj = _rawData.find(x => x.KhoiID === khoiID)

				// const stats = this.processData(rawData, 'TenCotDiem_EN');
				// const classes = Object.keys(stats);

				// // Chuẩn bị dữ liệu cho biểu đồ
				// const seriesData = [
				// 	{
				// 		name: 'Trung bình (Mean)',
				// 		type: 'line',
				// 		data: classes.map(lop => stats[lop].mean)
				// 	},
				// 	{
				// 		name: 'Trung vị (Median)',
				// 		type: 'line',
				// 		data: classes.map(lop => stats[lop].median)
				// 	},
				// 	{
				// 		name: 'Độ lệch chuẩn (Std Dev)',
				// 		type: 'line',
				// 		data: classes.map(lop => stats[lop].standardDeviation)
				// 	}
				// ];

				const stats_GK = this.processData(_rawData.filter(x => (x.MaNhomCotDiem.includes('S1_Mid') && x.KhoiID ===
					this.form.KhoiID) || (x.MaNhomCotDiem.includes('S2_Mid') && x.KhoiID === this.form.KhoiID)), 'TenCotDiem_EN');
				const classes_GK = Object.keys(stats_GK);

				const stats_CK = this.processData(_rawData.filter(x => (x.MaNhomCotDiem.includes('S1_Final') && x.KhoiID ===
					this.form.KhoiID) || (x.MaNhomCotDiem.includes('S2_Final') && x.KhoiID === this.form.KhoiID)), 'TenCotDiem_EN');
				const classes_CK = Object.keys(stats_CK);
				const stats = this.processData(_rawData, 'TenCotDiem_EN');
				const classes = Object.keys(stats);

				let seriesData = []
				if (Object.keys(stats_GK).length > 0) {
					seriesData.push({
						name: 'Trung bình (Mean) - GK1',
						type: 'line',
						data: classes_GK.map(lop => stats_GK[lop].mean)
					})
					seriesData.push({
						name: 'Trung vị (Median) - GK1',
						type: 'line',
						data: classes_GK.map(lop => stats_GK[lop].median)
					})
					seriesData.push({
						name: 'Độ lệch chuẩn (Std Dev) - GK1',
						type: 'line',
						data: classes_GK.map(lop => stats_GK[lop].standardDeviation)
					})
				}

				if (Object.keys(stats_CK).length > 0) {
					seriesData.push({
						name: 'Trung bình (Mean) - CK1',
						type: 'line',
						data: classes_CK.map(lop => stats_CK[lop].mean)
					})
					seriesData.push({
						name: 'Trung vị (Median) - CK1',
						type: 'line',
						data: classes_CK.map(lop => stats_CK[lop].median)
					})
					seriesData.push({
						name: 'Độ lệch chuẩn (Std Dev) - CK1',
						type: 'line',
						data: classes_CK.map(lop => stats_CK[lop].standardDeviation)
					})
				}
				this.List_Chart_KyNang_TheoKhoi.push({
					...chart,
					"id": "chart-line-statistic-" + khoiID,
					series: seriesData,
					chart: {
						height: 450,
						type: 'line',
						zoom: {
							enabled: false
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
					colors: ['#008FFB', '#00E396', '#FEB019', '#E91E63', '#66DA26', '#546E7A'],
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

			const sortDataListening = this.sortTenLop(dataListening);
			const sortDataLanguage = this.sortTenLop(dataLanguage)
			const sortDataReading = this.sortTenLop(dataReading)
			const sortDataWriting = this.sortTenLop(dataWriting)
			const sortDataSpeaking = this.sortTenLop(dataSpeaking)

			const stats_Listening_GK = this.processData(sortDataListening.filter(x => (x.MaNhomCotDiem.includes('S1_Mid')) ||
				(x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');
			const stats_Language_GK = this.processData(sortDataLanguage.filter(x => (x.MaNhomCotDiem.includes('S1_Mid')) ||
				(x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');
			const stats_Reading_GK = this.processData(sortDataReading.filter(x => (x.MaNhomCotDiem.includes('S1_Mid')) ||
				(x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');
			const stats_Writing_GK = this.processData(sortDataWriting.filter(x => (x.MaNhomCotDiem.includes('S1_Mid')) ||
				(x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');
			const stats_Speaking_GK = this.processData(sortDataSpeaking.filter(x => (x.MaNhomCotDiem.includes('S1_Mid')) ||
				(x.MaNhomCotDiem.includes('S2_Mid'))), 'TenLop');

			const stats_Listening_CK = this.processData(sortDataListening.filter(x => (x.MaNhomCotDiem.includes('S1_Final')) ||
				(x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');
			const stats_Language_CK = this.processData(sortDataLanguage.filter(x => (x.MaNhomCotDiem.includes('S1_Final')) ||
				(x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');
			const stats_Reading_CK = this.processData(sortDataReading.filter(x => (x.MaNhomCotDiem.includes('S1_Final')) ||
				(x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');
			const stats_Writing_CK = this.processData(sortDataWriting.filter(x => (x.MaNhomCotDiem.includes('S1_Final')) ||
				(x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');
			const stats_Speaking_CK = this.processData(sortDataSpeaking.filter(x => (x.MaNhomCotDiem.includes('S1_Final')) ||
				(x.MaNhomCotDiem.includes('S2_Final'))), 'TenLop');

			const classes_Listening_GK = Object.keys(stats_Listening_GK);
			const classes_Language_GK = Object.keys(stats_Language_GK);
			const classes_Reading_GK = Object.keys(stats_Reading_GK);
			const classes_Writing_GK = Object.keys(stats_Writing_GK);
			const classes_Speaking_GK = Object.keys(stats_Speaking_GK);

			const classes_Listening_CK = Object.keys(stats_Listening_CK);
			const classes_Language_CK = Object.keys(stats_Language_CK);
			const classes_Reading_CK = Object.keys(stats_Reading_CK);
			const classes_Writing_CK = Object.keys(stats_Writing_CK);
			const classes_Speaking_CK = Object.keys(stats_Speaking_CK);

			const stats = this.processData(_rawData, 'TenLop')
			const classes = Object.keys(stats); //Lấy 1 stats là đủ lớp

			let seriesData_Listening = []
			let seriesData_Language = []
			let seriesData_Reading = []
			let seriesData_Writing = []
			let seriesData_Speaking = []

			//Listening
			if (Object.keys(stats_Listening_GK).length > 0) {
				seriesData_Listening.push({
					name: 'Trung bình (Mean) - GK1',
					type: 'line',
					data: classes_Listening_GK.map(lop => stats_Listening_GK[lop].mean)
				})
				seriesData_Listening.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_Listening_GK.map(lop => stats_Listening_GK[lop].median)
				})
				seriesData_Listening.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_Listening_GK.map(lop => stats_Listening_GK[lop].standardDeviation)
				})
			}
			if (Object.keys(stats_Listening_CK).length > 0) {
				seriesData_Listening.push({
					name: 'Trung bình (Mean) - CK1',
					type: 'line',
					data: classes_Listening_CK.map(lop => stats_Listening_CK[lop].mean)
				})
				seriesData_Listening.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_Listening_CK.map(lop => stats_Listening_CK[lop].median)
				})
				seriesData_Listening.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_Listening_CK.map(lop => stats_Listening_CK[lop].standardDeviation)
				})
			}
			//Language
			if (Object.keys(classes_Language_GK).length > 0) {
				seriesData_Language.push({
					name: 'Trung bình (Mean) - GK1',
					type: 'line',
					data: classes_Language_GK.map(lop => stats_Language_GK[lop].mean)
				})
				seriesData_Language.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_Language_GK.map(lop => stats_Language_GK[lop].median)
				})
				seriesData_Language.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_Language_GK.map(lop => stats_Language_GK[lop].standardDeviation)
				})
			}
			if (Object.keys(classes_Language_CK).length > 0) {
				seriesData_Language.push({
					name: 'Trung bình (Mean) - CK1',
					type: 'line',
					data: classes_Language_CK.map(lop => stats_Language_CK[lop].mean)
				})
				seriesData_Language.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_Language_CK.map(lop => stats_Language_CK[lop].median)
				})
				seriesData_Language.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_Language_CK.map(lop => stats_Language_CK[lop].standardDeviation)
				})
			}
			//Reading
			if (Object.keys(classes_Reading_GK).length > 0) {
				seriesData_Reading.push(
					{
						name: 'Trung bình (Mean) - GK1',
						type: 'line',
						data: classes_Reading_GK.map(lop => stats_Reading_GK[lop].mean)
					})
				seriesData_Reading.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_Reading_GK.map(lop => stats_Reading_GK[lop].median)
				})
				seriesData_Reading.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_Reading_GK.map(lop => stats_Reading_GK[lop].standardDeviation)
				})
			}
			if (Object.keys(classes_Reading_CK).length > 0) {
				seriesData_Reading.push(
					{
						name: 'Trung bình (Mean) - CK1',
						type: 'line',
						data: classes_Reading_CK.map(lop => stats_Reading_CK[lop].mean)
					})
				seriesData_Reading.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_Reading_CK.map(lop => stats_Reading_CK[lop].median)
				})
				seriesData_Reading.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_Reading_CK.map(lop => stats_Reading_CK[lop].standardDeviation)
				})
			}
			//Writing
			if (Object.keys(classes_Writing_GK).length > 0) {
				seriesData_Writing.push({
					name: 'Trung bình (Mean) - GK1',
					type: 'line',
					data: classes_Writing_GK.map(lop => stats_Writing_GK[lop].mean)
				})
				seriesData_Writing.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_Writing_GK.map(lop => stats_Writing_GK[lop].median)
				})
				seriesData_Writing.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_Writing_GK.map(lop => stats_Writing_GK[lop].standardDeviation)
				})
			}
			if (Object.keys(classes_Writing_CK).length > 0) {
				seriesData_Writing.push({
					name: 'Trung bình (Mean) - CK1',
					type: 'line',
					data: classes_Writing_CK.map(lop => stats_Writing_CK[lop].mean)
				})
				seriesData_Writing.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_Writing_CK.map(lop => stats_Writing_CK[lop].median)
				})
				seriesData_Writing.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_Writing_CK.map(lop => stats_Writing_CK[lop].standardDeviation)
				})
			}
			//Speaking
			if (Object.keys(classes_Speaking_GK).length > 0) {
				seriesData_Speaking.push({
					name: 'Trung bình (Mean) - GK1',
					type: 'line',
					data: classes_Speaking_GK.map(lop => stats_Speaking_GK[lop].mean)
				})
				seriesData_Speaking.push({
					name: 'Trung vị (Median) - GK1',
					type: 'line',
					data: classes_Speaking_GK.map(lop => stats_Speaking_GK[lop].median)
				})
				seriesData_Speaking.push({
					name: 'Độ lệch chuẩn (Std Dev) - GK1',
					type: 'line',
					data: classes_Speaking_GK.map(lop => stats_Speaking_GK[lop].standardDeviation)
				})
			}
			if (Object.keys(classes_Speaking_CK).length > 0) {
				seriesData_Speaking.push({
					name: 'Trung bình (Mean) - CK1',
					type: 'line',
					data: classes_Speaking_CK.map(lop => stats_Speaking_CK[lop].mean)
				})
				seriesData_Speaking.push({
					name: 'Trung vị (Median) - CK1',
					type: 'line',
					data: classes_Speaking_CK.map(lop => stats_Speaking_CK[lop].median)
				})
				seriesData_Speaking.push({
					name: 'Độ lệch chuẩn (Std Dev) - CK1',
					type: 'line',
					data: classes_Speaking_CK.map(lop => stats_Speaking_CK[lop].standardDeviation)
				})
			}


			// const seriesData_Listening_GK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Language_GK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Reading_GK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Writing_GK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Speaking_GK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].standardDeviation)
			// 	}
			// ];

			// const seriesData_Listening_CK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Listening[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Language_CK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Language[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Reading_CK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Reading[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Writing_CK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Writing[lop].standardDeviation)
			// 	}
			// ];
			// const seriesData_Speaking_CK = [
			// 	{
			// 		name: 'Trung bình (Mean)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].mean)
			// 	},
			// 	{
			// 		name: 'Trung vị (Median)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].median)
			// 	},
			// 	{
			// 		name: 'Độ lệch chuẩn (Std Dev)',
			// 		type: 'line',
			// 		data: classes.map(lop => stats_Speaking[lop].standardDeviation)
			// 	}
			// ];

			const option = {
				chart: {
					height: 450,
					type: 'line',
					zoom: {
						enabled: false
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
				colors: ['#008FFB', '#00E396', '#FEB019', '#E91E63', '#66DA26', '#546E7A'],
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