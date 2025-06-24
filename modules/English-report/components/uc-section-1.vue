<template>
	<!-- Card lọc -->
	<v-card class="pa-4 elevation-1 rounded-lg" style="position: sticky;
    top: 0;
    z-index: 1000;
    padding-top: 0px !important;">
		<v-card-title class="text-primary text-h6 font-weight-bold pb-2">
			English Report
		</v-card-title>
		<v-card-text>
			<v-row dense>
				<v-col cols="12" md="3" lg="2">
					<v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
						item-value="KhoiID" hide-details />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-select v-model="LopID" label="Chọn lớp" :items="DSLop.filter(item => item.TenLop.includes('AV'))"
						item-title="TenLop" item-value="LopID" hide-details />
				</v-col>
				<v-col cols="12" md="4" lg="3">
					<v-select v-model="HocSinhID" label="Chọn học sinh" :items="DSHocSinh" item-title="HoTen"
						item-value="HocSinhID" hide-details />
				</v-col>
				<v-col cols="12" md="2" class="d-flex align-end">
					<v-btn color="primary" variant="outlined" class="w-100" :disabled="HocSinhID == null"
						@click="ReloadData">
						Xem biểu đồ
					</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>

	<!-- Biểu đồ tổng các theme -->
	<v-card class="mt-5 pa-4 elevation-1 rounded-lg" v-if="HocSinhID">
		<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2">
			📊 Thống kê điểm tổng các theme
		</v-card-title>
		<v-card-text>
			<div class="pt-3">
				<uc-chart-apex :options="options" v-if="options" />
			</div>
		</v-card-text>
	</v-card>

	<!-- Biểu đồ Tiếng Anh 2 -->
	<v-card class="mt-5 pa-4 elevation-1 rounded-lg" v-if="HocSinhID">
		<v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2">
			📘 Thống kê điểm Tiếng Anh 2
		</v-card-title>
		<v-card-text>
			<v-row dense>
				<v-col cols="12" md="6">
					<uc-chart-apex :options="optionsChart2" />
				</v-col>
				<v-col cols="12" md="6">
					<uc-chart-apex :options="optionsChart3" />
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
					text: 'Thống kê điểm trung bình Tiếng Anh 2',
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
		}
	},
	mounted() {
		this.getKhoiHocByCapID(3)
	},
	computed: {},
	watch: {
		KhoiID: function (KhoiID) {
			if (KhoiID) {
				this.onLoadDSLop(KhoiID)
					.then(() => {
						const isValid = this.DSLop.some(item => item.LopID === this.LopID);
						if (!isValid) {
							this.LopID = null; // Hoặc gán giá trị mặc định
						}
					});
			}
		},
		LopID: function (LopID) {
			this.HocSinhID = null
			if (LopID) {
				this.onLoadDSHocSinh(LopID)
			} else {

				this.DSHocSinh = []
			}
		},
		HocSinhID: async function (HocSinhID) {
			if (HocSinhID) {
				await this.ThongKeDiemTA2_ByHocSinh()
				await this.DashboardDiemTrungBinhTheoTheme_Get()
			} else {
				this.DSHocSinh = []
			}
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

		async ThongKeDiemTA2_ByHocSinh() {
			return new Promise(resolve => {
				ajaxCALL('lms/ThongKeDiemTA2_ByHocSinh',
					{
						HocSinhID: this.HocSinhID,
						NienKhoa: vueData.NienKhoa,
						KhoiID: this.KhoiID,
					},
					res => {
						this.DataChart2 = res.data
						const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
						let dataHandle = []
						for (let ky of DSKyHoc) {
							let obj = this.DataChart2.find(item => item.MaNhomCotDiem == ky)
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
							yaxis: {
								min: Math.min(...dataHandle) - 2,
								max: 10,
								stepSize: 0.5
							}
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
						HocSinhID: this.HocSinhID,
						KhoiID: this.KhoiID,
						MonHocID: 76,
						LopID: this.LopID
					},
					res => {
						let dataHandleTheme = res.data[0].filter(item => item.MaCotDiem.includes('Theme')).map(item => item.KetQuaDanhGia_VI)
						this.options = {
							...this.options,
							series: [
								{
									name: 'Point',
									data: dataHandleTheme
								}
							],
							xaxis: {
								categories: ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5', 'Theme 6', 'Theme 7', 'Theme 8'],
								title: {
									text: ''
								}
							},
							yaxis: {
								min: Math.min(...dataHandleTheme),
								max: 10,
								stepSize: 0.5
							}
						}
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
		async ReloadData() {
			await this.ThongKeDiemTA2_ByHocSinh()
			await this.DashboardDiemTrungBinhTheoTheme_Get()
		}
	},
}
</script>