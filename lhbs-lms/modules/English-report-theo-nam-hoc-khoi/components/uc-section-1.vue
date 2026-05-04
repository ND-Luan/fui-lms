<template>
	<!-- Card lọc -->
	<v-card class="pa-4 elevation-1 rounded-lg ">
		<v-card-title class="text-primary text-h6 font-weight-bold pb-2">
			English Report theo Khối
		</v-card-title>
		<v-card-text>
			<v-row dense>
				<v-col cols="12" md="3" lg="2">
					<v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
						item-value="KhoiID" hide-details='auto' />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop" item-value="LopID"
						hide-details='auto' />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-btn color="primary" variant="outlined" class="w-100" @click="ReloadData">
						Xem biểu đồ
					</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>

	<!-- Biểu đồ tổng các theme -->
	<v-card class="mt-5 pa-4 elevation-1 rounded-lg">
		<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2">
			📊 Thống kê điểm tổng các theme
		</v-card-title>
		<v-card-text>
			<div class="pt-3">
				<uc-chart-apex :options="options" v-if="options.series.length > 0" />
			</div>
		</v-card-text>
	</v-card>

	<!-- Biểu đồ Tiếng Anh 2 -->
	<v-card class="mt-5 pa-4 elevation-1 rounded-lg">
		<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2">
			📘 Thống kê điểm Tiếng Anh 1
		</v-card-title>
		<v-card-text>
			<v-row dense>
				<v-col cols="12">
					<uc-chart-apex :options="optionsChart2" v-if="optionsChart2.series.length > 0" />
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>



<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			DSLop: [],
			DSKhoi: [],
			DSHocSinh: [],
			HocSinhID: null,
			LopID: null,
			KhoiID: null,
			options: {
				series: [],
				chart: {
					height: 250,
					type: 'line',
					dropShadow: {
						enabled: true,
						color: '#000',
						top: 18,
						left: 7,
						blur: 10,
						opacity: 0.5
					},
					zoom: {
						enabled: false
					},
					toolbar: {
						show: false
					}
				},
				colors: ['#217d46'],
				dataLabels: {
					enabled: true,
				},
				stroke: {
					curve: 'straight'
				},
				title: {
					text: 'Thống kê Theme total',
					align: 'left'
				},
				grid: {
					borderColor: '#e7e7e7',
					row: {
						colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
						opacity: 0.5
					},
				},
				markers: {
					size: 1
				},
				xaxis: {
					categories: [],
					title: {
						text: ''
					}
				},
				yaxis: {
					title: {
						text: ''
					},
					min: 0,
					max: 10
				},
				legend: {
					showForSingleSeries: true,
					position: 'top',
					horizontalAlign: 'right',
					floating: true,
					offsetY: -25,
					offsetX: -5
				}
			},
			optionsChart2: {
				series: [
					{
						name: "",
						data: []
					},
				],
				chart: {
					height: 500,
					type: 'line',
					dropShadow: {
						enabled: true,
						color: '#000',
						top: 18,
						left: 7,
						blur: 10,
						opacity: 0.5
					},
					zoom: {
						enabled: false
					},
					toolbar: {
						show: false
					}
				},
				colors: [],
				dataLabels: {
					enabled: true,
				},
				stroke: {
					curve: 'smooth'
				},
				title: {
					text: 'Thống kê điểm trung bình Tiếng Anh 1',
					align: 'left'
				},
				grid: {
					borderColor: '#e7e7e7',
					row: {
						colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
						opacity: 0.5
					},
				},
				markers: {
					size: 1
				},
				xaxis: {
					categories: [],
					title: {
						text: ''
					}
				},
				yaxis: {
					title: {
						text: ''
					},
					min: 0,
					max: 10
				},
				legend: {
					showForSingleSeries: true,
					position: 'top',
					horizontalAlign: 'right',
					floating: true,
					offsetY: -25,
					offsetX: -5
				}
			},
			optionsChart3: {
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
					text: 'Thống kê điểm kĩ năng Tiếng Anh 2',
					align: 'left'
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
					min: 0,
					max: 10
				},
				xaxis: {
					categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
					labels: {
						style: {
							colors: '#FF0000',
							fontSize: '12px',
							fontFamily: 'Helvetica, Arial, sans-serif',
							fontWeight: 'bold', // hoặc dùng số: 600
							cssClass: 'apexcharts-xaxis-label1'
						},
					},

				},
				dataLabels: {
					enabled: true,
				},
			},
			DataChart2: [],
			DataChart3: [],
			vueData
		}
	},
	mounted() {
		this.getKhoiHocByCapID(vueData.CapID)
	},
	computed: {},
	watch: {
		KhoiID: function (KhoiID) {
			if (KhoiID) {
				this.onLoadDSLop(KhoiID)
			}
		},
		LopID: function (LopID) {
			this.DashboardDiemTrungBinhTheoTheme_Get()
		}
	},
	methods: {
		async getKhoiHocByCapID(id) {
			return new Promise(async (resolve) => {
				let params = {
					CapID: id
				}
				const res = await SearchLMSService.GetKhoiHocbyCapHocID(params)
				if (res) {
					this.DSKhoi = res?.Result
					resolve()
				} else {
					resolve(null) // Trả về mảng rỗng nếu không có dữ liệu
				}
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
						let _dsLop = res.data
						if (vueData.CapID === 3) {
							_dsLop = res.data.filter(item => !item.TenLop.includes('AV'))
						}
						_dsLop.unshift({ TenLop: "Tất cả các lớp", LopID: -1 })
						this.DSLop = _dsLop
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
		ajaxCALLPromise(url, params) {
			return new Promise(resolve => {
				ajaxCALL(url, params, res => resolve(res.data))
			})
		},
		async DashboardDiemTrungBinhTheoTheme_Get() {
			const namHocList = [2023, 2024]
			const DSLop = []
			for (var namHoc of namHocList) {
				const data = await this.ajaxCALLPromise(`student/LMS_GetLop?NamHoc=${namHoc}`)
				for (var lop of data) DSLop.push(lop)
			}
			let List_Khoi = []
			if (vueData.CapID === 1) List_Khoi = [1, 2, 3, 4, 5]
			if (vueData.CapID === 2) List_Khoi = [6, 7, 8, 9]
			if (vueData.CapID === 3) List_Khoi = [10, 11, 12]

			let filterDSLopByCapID = DSLop.filter(x => List_Khoi.includes(x.KhoiID))
			//Lấy hết khối
			if (this.LopID === -1) {
				filterDSLopByCapID = filterDSLopByCapID.filter(x => x.KhoiID === this.KhoiID)
			} else {
				const lop = this.DSLop.find(x => x.LopID === this.LopID)
				filterDSLopByCapID = filterDSLopByCapID.filter(x => x.TenLop === lop.TenLop)
			}
			console.log('filterDSLopByCapID', filterDSLopByCapID)
			const newData = []
			for (var lop of filterDSLopByCapID) {
				for (var hocKy of [1, 2]) {
					const data = await this.ajaxCALLPromise(`diemc${vueData.CapID}/LMS_GetDiemTheoLop`, {
						LopID: lop.LopID,
						MonHocID: "toan",
						HocKy: hocKy,
						NamHoc: lop.NienKhoa
					})
					if (Array.isArray(data)) {
						newData.push(
							data.map(x => ({ ...x, NienKhoa: lop.NienKhoa, HocKy: hocKy }))
								.filter(x => x.MonHocID === 'anh')
						)
					}
				}
			}
			console.log('newData', newData)
			const flatNewData = newData.flat()

			console.log('flatNewData', flatNewData)
			const series_Chart1 = []
			for (var namHoc of namHocList) {
				const data = flatNewData.filter(x => x.NienKhoa === namHoc)
				if (data.length > 0) {
					const data_HK1 = data.filter(x => x.HocKy === 1)
					const data_HK2 = data.filter(x => x.HocKy === 2)
					console.log('data_HK1.map(x => x.TX1)', data_HK1.map(x => x.TX1))
					const TrungVi_Theme1 = this.calculateMedian(data_HK1.map(x => x.TX1))
					const TrungVi_Theme2 = this.calculateMedian(data_HK1.map(x => x.TX2))
					const TrungVi_Theme3 = this.calculateMedian(data_HK1.map(x => x.TX3))
					const TrungVi_Theme4 = this.calculateMedian(data_HK1.map(x => x.TX4))

					const TrungVi_Theme5 = this.calculateMedian(data_HK2.map(x => x.TX1))
					const TrungVi_Theme6 = this.calculateMedian(data_HK2.map(x => x.TX2))
					const TrungVi_Theme7 = this.calculateMedian(data_HK2.map(x => x.TX3))
					const TrungVi_Theme8 = this.calculateMedian(data_HK2.map(x => x.TX4))

					const TrungBinh_Theme1 = parseFloat(_.mean(data_HK1.map(x => x.TX1))).toFixed(2)
					const TrungBinh_Theme2 = parseFloat(_.mean(data_HK1.map(x => x.TX2))).toFixed(2)
					const TrungBinh_Theme3 = parseFloat(_.mean(data_HK1.map(x => x.TX3))).toFixed(2)
					const TrungBinh_Theme4 = parseFloat(_.mean(data_HK1.map(x => x.TX4))).toFixed(2)

					const TrungBinh_Theme5 = parseFloat(_.mean(data_HK2.map(x => x.TX1))).toFixed(2)
					const TrungBinh_Theme6 = parseFloat(_.mean(data_HK2.map(x => x.TX2))).toFixed(2)
					const TrungBinh_Theme7 = parseFloat(_.mean(data_HK2.map(x => x.TX3))).toFixed(2)
					const TrungBinh_Theme8 = parseFloat(_.mean(data_HK2.map(x => x.TX4))).toFixed(2)
					console.table(data)
					series_Chart1.push({
						name: "Năm " + namHoc + ' (Trung vị)',
						data: [
							TrungVi_Theme1,
							TrungVi_Theme2,
							TrungVi_Theme3,
							TrungVi_Theme4,
							TrungVi_Theme5,
							TrungVi_Theme6,
							TrungVi_Theme7,
							TrungVi_Theme8,
						]
					},
						{
							name: "Năm " + namHoc + ' (Trung bình)',
							data: [
								TrungBinh_Theme1,
								TrungBinh_Theme2,
								TrungBinh_Theme3,
								TrungBinh_Theme4,
								TrungBinh_Theme5,
								TrungBinh_Theme6,
								TrungBinh_Theme7,
								TrungBinh_Theme8
							]

						}
					)
				}
			}

			const categories_Theme = ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5', 'Theme 6', 'Theme 7', 'Theme 8']
			let Min_YAxis_series_Chart1 = []
			for (var item of series_Chart1) {
				Min_YAxis_series_Chart1.push(item.data)
			}
			Min_YAxis_series_Chart1 = Min_YAxis_series_Chart1.flat()
			this.options = {
				...this.options,
				series: series_Chart1,
				xaxis: {
					categories: categories_Theme,
					title: {
						text: ''
					}
				},
				yaxis: {
					min: Math.min(...Min_YAxis_series_Chart1),
					max: 10,
					stepSize: 0.5
				},
				colors: ['#FF4560', '#217d46', '#775DD0', '#00E396', '#FEB019', '#FF66C3'],
				stroke: {
					curve: 'smooth', // hoặc 'straight' nếu muốn
					width: 3
				}
			}

			const series_NamHoc_DTB = []
			for (var namHoc of namHocList) {
				const data = flatNewData.filter(x => x.NienKhoa === namHoc)
				if (data.length > 0) {
					const data_HK1 = data.filter(x => x.HocKy === 1)
					const data_HK2 = data.filter(x => x.HocKy === 2)
					const TrungVi_GK1 = this.calculateMedian(data_HK1.map(x => x.GK))
					const TrungVi_CK1 = this.calculateMedian(data_HK1.map(x => x.CK))
					const TrungVi_DTB1 = this.calculateMedian(data_HK1.map(x => x.DTB))
					const TrungVi_GK2 = this.calculateMedian(data_HK2.map(x => x.GK))
					const TrungVi_CK2 = this.calculateMedian(data_HK2.map(x => x.CK))
					const TrungVi_DTB2 = this.calculateMedian(data_HK2.map(x => x.DTB))

					const TrungBinh_GK1 = parseFloat(_.mean(data_HK1.map(x => x.GK))).toFixed(2)
					const TrungBinh_CK1 = parseFloat(_.mean(data_HK1.map(x => x.CK))).toFixed(2)
					const TrungBinh_DTB1 = parseFloat(_.mean(data_HK1.map(x => x.DTB))).toFixed(2)
					const TrungBinh_GK2 = parseFloat(_.mean(data_HK2.map(x => x.GK))).toFixed(2)
					const TrungBinh_CK2 = parseFloat(_.mean(data_HK2.map(x => x.CK))).toFixed(2)
					const TrungBinh_DTB2 = parseFloat(_.mean(data_HK2.map(x => x.DTB))).toFixed(2)

					series_NamHoc_DTB.push({
						name: "Năm " + namHoc + " Trung vị",
						data: [
							TrungVi_GK1,
							TrungVi_CK1,
							TrungVi_DTB1,
							TrungVi_GK2,
							TrungVi_CK2,
							TrungVi_DTB2,
						]
					}, {
						name: "Năm " + namHoc + " Trung bình",
						data: [
							TrungBinh_GK1,
							TrungBinh_CK1,
							TrungBinh_DTB1,
							TrungBinh_GK2,
							TrungBinh_CK2,
							TrungBinh_DTB2
						]
					})
				}

			}
			let Min_YAxis_series_Chart2 = []
			for (var item of series_NamHoc_DTB) {
				Min_YAxis_series_Chart2.push(item.data)
			}
			Min_YAxis_series_Chart2 = Min_YAxis_series_Chart2.flat()

			this.optionsChart2 = {
				...this.optionsChart2,
				series: series_NamHoc_DTB,
				xaxis: {
					categories: ['Giữa HK1', 'Cuối HK1', 'TB HK1', 'Giữa HK2', 'Cuối HK2', 'TB HK2',],
					title: {
						text: ''
					}
				},
				yaxis: {
					min: Math.min(...Min_YAxis_series_Chart2) - 2,
					max: 10,
					stepSize: 0.5
				},
				colors: ['#FF4560', '#217d46', '#775DD0', '#00E396', '#FEB019', '#FF66C3'],
				stroke: {
					curve: 'smooth', // hoặc 'straight' nếu muốn
					width: 3
				}
			}
		},
		async ReloadData() {
			await this.DashboardDiemTrungBinhTheoTheme_Get()
		},
		calculateMedian
	},
}
</script>