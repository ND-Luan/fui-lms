<template>
	<v-divider></v-divider>
	<div class="d-flex flex-column h-100 pa-4">
		<!-- Card lọc -->
		<v-card class=" rounded-lg ">
			<v-card-title class="text-primary px-0 text-body-1 font-weight-bold pb-3" style="text-wrap:auto">
				Xu hướng phát triển bản thân năm học {{ vueData.HocSinhSelected.NienKhoa }} -
				{{ vueData.HocSinhSelected.NienKhoa + 1 }}
			</v-card-title>
			<v-card-text class="pa-0">
				<!-- Biểu đồ tổng các theme -->
				<!-- <v-card class="  rounded-lg">
					<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2"
						style="background-color: #d1e4f5">
						📊 1. Thống kê điểm tổng các theme
					</v-card-title>
					<v-card-text class="pb-0">
						<div class="pt-3">
							<uc-chart-apex :options="options" />
						</div>
					</v-card-text>
				</v-card>
				<v-divider class="my-3"></v-divider> -->
				<!-- Biểu đồ TA2 -->
				<v-card class="mt-5  rounded-lg">
					<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2 mb-3 "
						style="background-color: #d1e4f5">
						📘 1. {{ DSLopIelts.includes(HocSinhSelected.TenLopAV) ? titleIELTS : titleTA2 }}
					</v-card-title>
					<v-card-text class="pb-0">
						<v-row dense>
							<v-col cols="12" md="12">
								<uc-chart-apex :options="optionsChart2" />
							</v-col>
							<v-divider class="my-3"></v-divider>
							<v-col cols="12" md="12">
								<uc-chart-apex :options="optionsChart3" />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-card-text>
		</v-card>
	</div>
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
			titleTA2: "Thống kê điểm TA2",
			titleIELTS: "Thống kê điểm IELTS",
			options: {
				series: [
					{
						name: "Theme",
						data: []
					},
				],
				chart: {
					height: 350,
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
					text: 'Statistics',
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
					height: 350,
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
					text: 'Thống kê điểm trung bình TA2',
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
					position: 'top',
					horizontalAlign: 'center',

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
					},
					toolbar: {
						show: false
					}
				},
				title: {
					text: 'Thống kê điểm kĩ năng TA2',
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
					categories: ['Nghe', 'Đọc', 'Nói', 'Viết', 'Trung bình'],
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
				grid: {
					show: false,
					padding: { left: 50, right: 0, top: 0, bottom: 0 },
				},
			},
			DataChart2: [],
			DataChart3: [],
			HocSinhSelected: {},
			DSLopIelts: ['12AV1', '12AV2', '12AV3', '12AV4'],
			_
		}
	},
	mounted() {
		this.getKhoiHocByCapID(3)
		this.ReloadData()
		this.onSelectedHocSinh()
	},
	computed: {},
	watch: {

	},
	methods: {
		onSelectedHocSinh() {
			if (!vueData.NienKhoa) return
			ajaxCALL('lms/HocSinh_Detail_GetBy_HocSinhID',
				{
					HocSinhID: vueData.HocSinhSelected.HocSinhID,
					NienKhoa: vueData.NienKhoa
				}, data => {
					this.HocSinhSelected = data
				}
			)
		},
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
		async ThongKeDiemTheoTheme_Get() {
			return new Promise(resolve => {
				ajaxCALL('lms/ThongKeDiemTheoTheme_Get',
					{
						HocSinhID: vueData.HocSinhSelected.HocSinhID,
						NienKhoa: vueData.HocSinhSelected.NienKhoa,
						KhoiID: vueData.HocSinhSelected.KhoiID,
					},
					res => {
						this.DataChart1 = res.data
						console.log('DataChart1', this.DataChart1)
						this.options = {
							...this.options,
							series: [
								{
									name: 'Point',
									data: res.data.map(item => item.KetQuaDanhGia_VI)
								}
							],
							xaxis: {
								categories: ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5', 'Theme 6', 'Theme 7', 'Theme 8'],
								title: {
									text: ''
								}
							},
						}
						console.log('options', this.options)
						resolve()
					}
				)
			})
		},
		async ThongKeDiemTA2_ByHocSinh() {
			return new Promise(resolve => {
				ajaxCALL('lms/ThongKeDiemTA2_ByHocSinh',
					{
						HocSinhID: vueData.HocSinhSelected.HocSinhID,
						NienKhoa: vueData.HocSinhSelected.NienKhoa,
						KhoiID: vueData.HocSinhSelected.KhoiID,
					},
					res => {
						this.DataChart2 = res.data
						const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
						let dataHandle = []
						for (let ky of DSKyHoc) {
							let obj = this.DataChart2[0].find(item => item.MaNhomCotDiem == ky)
							console.log(' obj', obj)
							if (obj) {
								dataHandle.push(obj.KetQuaDanhGia_VI)
							}
							else {
								dataHandle.push(null)
							}
						}
						this.optionsChart2 = {
							...this.optionsChart2,
							series: [
								{
									name: 'Point',
									data: dataHandle
								}
							],
							xaxis: {
								categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
								title: {
									text: ''
								}
							},
						}
						console.log('this.DataChart2', this.DataChart2)
						resolve()
					}
				)
			})
		},
		async DashboardDiemTrungBinhTheoTheme_Get() {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiemTrungBinhTheoTheme_Get',
					{
						HocKy: 'CN',
						MonHocID: 76,
						LopID: vueData.HocSinhSelected.LopID,
						HocSinhID: vueData.HocSinhSelected.HocSinhID,
						NienKhoa: vueData.HocSinhSelected.NienKhoa,
						KhoiID: vueData.HocSinhSelected.KhoiID,
					},
					res => {
						console.log('this.DSLopIelts',this.DSLopIelts)
						console.log('this.HocSinhSelected.TenLopAV',this.HocSinhSelected.TenLopAV)
						if (this.DSLopIelts.includes(this.HocSinhSelected.TenLopAV)) {
							const DSKyHoc = ['S1_Mid_IELTS', 'S1_Final_IELTS', 'S2_Mid_IELTS', 'S2_Final_IELTS']
							const DSCotDiem = ['IELTS_Listening', 'IELTS_Reading', 'IELTS_Writing', 'IELTS_Speaking', 'IELTS_Band']
							this.DataChart3 = res.data[1].filter(item => item.MaNhomCotDiem.includes('IELTS'))
							console.log('this.DataChart3', this.DataChart3.map(item => item.KetQuaDanhGia_VI))
							let dataHandle = []
							for (let ky of DSKyHoc) {
								let obj = {
									KyHoc: ky,
									data: []
								}
								for (let cotDiem of DSCotDiem) {
									let objFind = this.DataChart3.filter(item => item.MaNhomCotDiem == ky).find(obj => obj.MaCotDiem.includes(cotDiem))

									if (objFind) {
										obj.data.push(objFind.KetQuaDanhGia_VI)
									} else {
										obj.data.push(null)
									}
								}
								dataHandle.push(obj)
							}
							console.log('dataHandle', dataHandle)
							this.optionsChart3 = {
								...this.optionsChart3,
								series: [
									{
										name: 'Giữa HK1',
										data: dataHandle[0].data
									},
									{
										name: 'Cuối HK1',
										data: dataHandle[1].data
									},
									{
										name: 'Giữa HK2',
										data: dataHandle[2].data
									},
									{
										name: 'Cuối HK2',
										data: dataHandle[3].data
									}
								],
								xaxis: {
									categories: ['Listening', 'Reading', 'Writing', 'Speaking', 'Band'],
									title: {
										text: 'Theme'
									}
								},
								title: {
									text: 'Thống kê điểm kĩ năng IELTS',
									align: 'left'
								},
							}
							let DiemIELTSBand = [_.last(dataHandle[0].data), _.last(dataHandle[1].data), _.last(dataHandle[2].data), _.last(dataHandle[3].data)]
							console.log('test', DiemIELTSBand)
							this.optionsChart2 = {
								...this.optionsChart2,
								series: [
									{
										name: 'Point',
										data: DiemIELTSBand
									}
								],
								xaxis: {
									categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
									title: {
										text: ''
									}
								},
								title: {
									text: 'Thống kê điểm IELTS Band',
									align: 'left'
								},
							}
							console.log('this.optionsChart2', this.optionsChart2)
							resolve()
						} else {
							const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
							const DSCotDiem = ['TA2_Listening_Point', 'TA2_Reading_Point', 'TA2_Writing_Point', 'TA2_Speaking_Point',
								'TA2_Avg_Point']
							this.DataChart3 = res.data[1].filter(item => item.MaNhomCotDiem.includes('TA2') && !item.MaCotDiem.includes('TA2_Point'))
							let dataHandle = []
							for (let ky of DSKyHoc) {
								let obj = {
									KyHoc: ky,
									data: []
								}
								for (let cotDiem of DSCotDiem) {
									let objFind = this.DataChart3.filter(item => item.MaNhomCotDiem == ky).find(obj => obj.MaCotDiem.includes(cotDiem))
									if (cotDiem == 'TA2_Avg_Point') {
										objFind = this.DataChart2[0].find(cd => cd.MaNhomCotDiem == ky)
									}
									if (objFind) {
										obj.data.push(objFind.KetQuaDanhGia_VI)
									} else {
										obj.data.push(null)
									}
								}
								dataHandle.push(obj)
							}
							console.log('this.DataChart3', this.DataChart3)
							console.log('dataHandle', dataHandle)
							this.optionsChart3 = {
								...this.optionsChart3,
								series: [
									{
										name: 'Giữa HK1',
										data: dataHandle[0].data
									},
									{
										name: 'Cuối HK1',
										data: dataHandle[1].data
									},
									{
										name: 'Giữa HK2',
										data: dataHandle[2].data
									},
									{
										name: 'Cuối HK2',
										data: dataHandle[3].data
									}
								],
								xaxis: {
									categories: ['Nghe', 'Đọc', 'Viết', 'Nói', 'Trung bình'],
									title: {
										text: 'Theme'
									}
								},
								title: {
									text: 'Thống kê điểm trung bình TA2',
									align: 'left'
								},
							}
							resolve()
						}

					}
				)
			})
		},
		async ReloadData() {
			await this.ThongKeDiemTheoTheme_Get()
			await this.ThongKeDiemTA2_ByHocSinh()
			await this.DashboardDiemTrungBinhTheoTheme_Get()
		}
	},
}
</script>