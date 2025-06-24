<template>
	<v-toolbar color="primary">

		<v-toolbar-title>Xu hướng phát triển theo lớp năm học {{ vueData.NienKhoa }} - {{ vueData.NienKhoa +
			1 }}</v-toolbar-title>

		<template v-slot:extension>
			<div class="px-5">
				<v-tabs v-model="tab" selected-class='bg-white text-primary'>
					<v-tab v-for="khoi in DSKhoi" :key="khoi.KhoiID" :text='khoi.TenKhoiHoc' :value="khoi.KhoiID">
					</v-tab>
				</v-tabs>
			</div>

		</template>
	</v-toolbar>

	<v-tabs-window v-model="tab">
		<v-tabs-window-item v-for="khoi in DSKhoi" :key="khoi.KhoiID" :value="khoi.KhoiID">
			<v-card>
				<v-card-text>
					<!-- Biểu đồ tổng các theme -->
					<v-card class="  rounded-lg">
						<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2"
							style="background-color: #d1e4f5">
							📊 1. Thống kê điểm tổng các theme
						</v-card-title>
						<v-card-text class="pb-0">
							<div class="d-flex flex-column align-center justify-center" v-if="isBusy == true"
								style="min-height:500px ">
								<v-progress-circular color="primary" indeterminate></v-progress-circular>
								<span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
							</div>
							<div class="pt-3" v-else>
								<uc-chart-apex :options="khoi.options" v-if="khoi.options" />
							</div>
						</v-card-text>
					</v-card>
					<v-divider class="my-3"></v-divider>
					<!-- Biểu đồ TA2 -->
					<v-card class="mt-5  rounded-lg">
						<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2 mb-3 "
							style="background-color: #d1e4f5">
							📘 2. Thống kê điểm TA2
						</v-card-title>
						<v-card-text class="pb-0">
							<v-row dense>
								<v-col cols="12" md="6">
									<div class="d-flex flex-column align-center justify-center" v-if="isBusy == true"
										style="min-height:500px ">
										<v-progress-circular color="primary" indeterminate></v-progress-circular>
										<span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
									</div>
									<uc-chart-apex :options="khoi.optionsChart2" v-if="khoi.optionsChart2" />
								</v-col>
								<v-col cols="12" md="6">
									<div class="d-flex flex-column align-center justify-center" v-if="isBusy == true"
										style="min-height:500px ">
										<v-progress-circular color="primary" indeterminate></v-progress-circular>
										<span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
									</div>
									<uc-chart-apex :options="khoi.optionsChart3" v-if="khoi.optionsChart3" />
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>
				</v-card-text>
			</v-card>
		</v-tabs-window-item>
	</v-tabs-window>

</template>



<script>
export default {
	props: [],
	data() {
		return {
			tab: 10,
			vueData,
			DSLop: [],
			DSKhoi: [],
			DSHocSinh: [],
			HocSinhID: null,
			LopID: null,
			KhoiID: null,
			isBusy: false,
			options: {
				series: [
					{
						name: "Theme",
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
						name: "Point",
						data: ['6.36', '6.51', '6.70', '6.55']
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
					categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
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
				grid: {
					show: false,
					padding: { left: 50, right: 0, top: 0, bottom: 0 },
				},
			},
			DataChart2: [],
			DataChart3: [],
			_
		}
	},
	mounted() {
		this.getKhoiHocByCapID(3)
		// this.ReloadData()
		this.ThongKeDiem_TA2_Theme_Get_All_Khoi()
	},
	computed: {},
	watch: {

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
						const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
						const DSCotDiem = ['TA2_Listening_Point', 'TA2_Speaking_Point', 'TA2_Reading_Point', 'TA2_Writing_Point', 'TA2_Avg_Point']
						this.DataChart3 = res.data[1].filter(item => item.MaNhomCotDiem.includes('TA2'))
						let dataHandle = []
						for (let ky of DSKyHoc) {
							let obj = {
								KyHoc: ky,
								data: []
							}
							for (let cotDiem of DSCotDiem) {
								let objFind = this.DataChart3.filter(item => item.MaNhomCotDiem == ky).find(obj => obj.MaCotDiem.includes(cotDiem))
								if (cotDiem == 'TA2_Avg_Point') {
									objFind = this.DataChart2.find(obj => obj.MaNhomCotDiem == ky)
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
								categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
								title: {
									text: 'Theme'
								}
							},
						}
						console.log('this.optionsChart3', this.optionsChart3.series)
						resolve()
					}
				)
			})
		},
		fnCalcDiemTB(data, DSCotDiem) {
			if (data.length == 0 || DSCotDiem.length == 0) return
			let DiemTB = []
			for (let i = 0; i < DSCotDiem.length; i++) {
				let DataDiem = data.filter(item => item.MaCotDiem == DSCotDiem[i]).map(item => {
					if (item.KetQuaDanhGia_VI) {
						return parseFloat(item.KetQuaDanhGia_VI)
					} else {
						return 0
					}
				})
				let dtb = _.mean(DataDiem)
				DiemTB.push(dtb)
			}
			return DiemTB
		},
		ajaxCallAsync(url, data) {
			this.isBusy = true
			return new Promise((resolve, reject) => {
				ajaxCALL(url, data, res => resolve(res), err => reject(err))
			})
		},
		async ThongKeDiem_TA2_Theme_Get_All_Khoi() {
			const $this = this
			const res = await this.ajaxCallAsync('lms/ThongKeDiem_TA2_Theme_Get_All_Khoi', {
				NienKhoa: vueData.NienKhoa,
				KhoiID: 0
			});

			// let test = res.data[1].filter(item => item.MaCotDiem == 'S1_Mid_TA2_Avg_Point' && item.KhoiID==11).map(item => {
			// 	if (item.KetQuaDanhGia_VI) {
			// 		return parseFloat(item.KetQuaDanhGia_VI)
			// 	} else {
			// 		return 0
			// 	}
			// })
			// console.log('test',test)

			// let mean = _.mean(test)
			// console.log('meanS1',meanS1)  


			//Lấy ds Theme
			const DSCotDiemTheme = [...new Set(res.data[0].map(item => item.MaCotDiem))]
			// Lấy DSDiemTrungBinh
			const DSDiemTBTheoKi = [...new Set(res.data[1].filter(item => item.MaCotDiem.includes('Avg')).map(item => item.MaCotDiem))]


			for (khoi of this.DSKhoi) {
				khoi.dataThemeKhoi = res.data[0].filter(item => item.KhoiID == khoi.KhoiID)
				khoi.dataTA2Khoi = res.data[1].filter(item => item.KhoiID == khoi.KhoiID)
				khoi['options'] = {
					...this.options,
					series: [
						{
							name: 'Point',
							data: this.fnCalcDiemTB(khoi.dataThemeKhoi, DSCotDiemTheme).map(item => item.toFixed(2))
						}
					],
					xaxis: {
						categories: ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5', 'Theme 6', 'Theme 7', 'Theme 8'],
						title: {
							text: ''
						}
					},
				}
				let DSCotDiemTBCacKi = khoi.dataTA2Khoi.filter(item => item.MaCotDiem.includes('Avg'))
				khoi['optionsChart2'] = {
					...this.optionsChart2,
					series: [
						{
							name: 'Point',
							data: this.fnCalcDiemTB(DSCotDiemTBCacKi, DSDiemTBTheoKi).map(item => item.toFixed(2))
						}
					],
					xaxis: {
						categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
						title: {
							text: ''
						}
					},
				}
				const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
				const DSCotDiem = ['TA2_Listening_Point', 'TA2_Speaking_Point', 'TA2_Reading_Point', 'TA2_Writing_Point',
					'TA2_Avg_Point']
				let dataHandle = []
				for (let ky of DSKyHoc) {
					let obj = {
						KyHoc: ky,
						data: []
					}
					for (let cotDiem of DSCotDiem) {
						let DataDiemBySkill = khoi.dataTA2Khoi.filter(item => item.MaNhomCotDiem == ky && item.MaCotDiem.includes(cotDiem)).map(item => {
							if (item.KetQuaDanhGia_VI) {
								return parseFloat(item.KetQuaDanhGia_VI)
							} else {
								return 0
							}
						})
						let dtb = _.mean(DataDiemBySkill)
						obj.data.push(dtb.toFixed(2))
					}
					dataHandle.push(obj)
				}
				khoi['optionsChart3'] = {
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
						categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
						title: {
							text: 'Theme'
						}
					},
				}
			}
			this.isBusy = false
			console.log('this.DSKhoi', this.DSKhoi)
		},
		async ReloadData() {
			await this.ThongKeDiemTheoTheme_Get()
			await this.ThongKeDiemTA2_ByHocSinh()
			await this.DashboardDiemTrungBinhTheoTheme_Get()
		}
	},
}
</script>