<template>
	<v-card class="px-4 pt-0 pb-4 card-border">
		<v-card-title class=" my-3 ga-2 card-border rounded-sm ">
			<span class="text-primary">TIỂU HỌC</span>
			<v-spacer></v-spacer>
			<div class="d-flex ga-2">
				<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" style="min-width: 200px;"></v-select>
				<v-btn @click="ThongKe_KQRL_Get_All_Khoi_C1" color="primary" :loading="isBusy" variant="outlined"
					:disabled="!HocKi">
					Làm mới
				</v-btn>
			</div>
		</v-card-title>


		<v-card-text class="pa-0  d-flex flex-column ga-5 mt-5">
			<v-row class="elevation-1 pa-3">
				<v-col cols="12">
					<v-card class="card-border">
						<v-card-title class="text-primary " style="text-wrap:auto">
							KẾT QUẢ RÈN LUYỆN KHỐI 1, 2, 3, 4 – PHẨM CHẤT</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart1" :headers="headersChart1" :hide-default-footer="true" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="12" class="mt-5 elevation-2" v-if="!isBusy && DataChart1.length > 0">
					<uc-chart-apex :options="OptionsChart1" />
				</v-col>
			</v-row>
			<v-row class="elevation-1 pa-3">
				<v-col cols="12">
					<v-card class="card-border">
						<v-card-title class="text-primary" style="text-wrap:auto">KẾT QUẢ RÈN LUYỆN KHỐI 1, 2, 3, 4 –
							NĂNG LỰC</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart2" :headers="headersChart2" :hide-default-footer="true">
								<template #item="{ item, index }">
									<tr :style="getRowStyle(item)" :class="getRowClass(item)">
										<td v-for="obj of headersChart2"
											:class="obj.value == 'TenMonHoc_HienThi' ? '' : 'text-end'">
											{{ item[obj.value] }}
										</td>
									</tr>
								</template>
							</v-data-table>
						</v-card-text>
					</v-card>

				</v-col>
				<v-col cols="12" class="mt-5 elevation-2" v-if="!isBusy && DataChart2.length > 0">
					<uc-chart-apex :options="OptionsChart2" />
				</v-col>
			</v-row>

			<v-row class="elevation-1 pa-3">
				<v-col cols="12">
					<v-card class="card-border">
						<v-card-title class="text-primary" style="text-wrap:auto">KẾT QUẢ RÈN LUYỆN KHỐI 5 – PHẨM CHẤT,
							NĂNG
							LỰC</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart3" :headers="headersChart3" :hide-default-footer="true">
								<template #item="{ item, index }">
									<tr :style="getRowStyle(item)" :class="getRowClass(item)">
										<td v-for="obj of headersChart3"
											:class="obj.value == 'TenMonHoc_HienThi' ? '' : 'text-end'">
											{{ item[obj.value] }}
										</td>
									</tr>
								</template>
							</v-data-table>
						</v-card-text>
					</v-card>

				</v-col>
				<v-col cols="12" class="mt-5 elevation-2 " v-if="!isBusy && DataChart3.length > 0">
					<uc-chart-apex :options="OptionsChart3" />
				</v-col>
			</v-row>

			<v-row class="elevation-1 pa-3">
				<v-col cols="12">
					<v-card class="card-border">
						<v-card-title class="text-primary" style="text-wrap:auto">
							KẾT QUẢ HỌC TẬP – CẤP TIỂU HỌC
						</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart4" :headers="headersChart4" :hide-default-footer="true" />
						</v-card-text>
					</v-card>

				</v-col>
				<v-col cols="12" class="my-5 elevation-2 " v-if="!isBusy && DataChart4.length > 0">
					<uc-chart-apex :options="OptionsChart4" />
				</v-col>
			</v-row>


			<v-row class="elevation-1 pa-3">
				<v-col cols="12">
					<v-card class="card-border">
						<v-card-title class="text-primary" style="text-wrap:auto">
							XẾP LOẠI KẾT QUẢ GIÁO DỤC – KHEN THƯỞNG
						</v-card-title>
					</v-card>
				</v-col>
				<v-col cols="6">
					<v-card class="card-border">
						<v-card-title class="text-primary">
							Khối 1,2,3,4
						</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart5" :headers="headersChart5" :hide-default-footer="true" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="6">
					<v-card class="card-border">
						<v-card-title class="text-primary" style="text-wrap:auto">
							Khối 5
						</v-card-title>
						<v-card-text class="pa-0">
							<v-data-table :items="DataChart6" :headers="headersChart5" :hide-default-footer="true" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="6" class="mt-5 elevation-2 pa-2" v-if="!isBusy && DataChart5.length > 0">
					<uc-chart-apex :options="OptionsChart5" />
				</v-col>
				<v-col cols="6" class="mt-5 elevation-2 pa-2" v-if="!isBusy && DataChart6.length > 0">
					<uc-chart-apex :options="OptionsChart6" />
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		props: [],
		data() {
			var options = {
	
				chart: {
					type: 'bar',
					height: 500
				},
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '55%',
						borderRadius: 5,
						borderRadiusApplication: 'end'
					},
				},
				dataLabels: {
					enabled: false
				},
				title: {
					text: 'Biểu đồ tỉ lệ',
					align: 'left',
					style: {
						fontSize: '16px',
						color: '#263238'
					}
				},
				stroke: {
					show: true,
					width: 2,
					colors: ['transparent']
				},
				xaxis: {
					categories: [],
				},
				series: [],
				yaxis: {
					title: {
						text: '%'
					},
					max: 100,
					min: 0,
				},
				fill: {
					opacity: 1
				},
				tooltip: {
					y: {
						formatter: function (val) {
							return val + "%"
						}
					}
				}
			}
			var optionsPie = {
				series: [],
				chart: {
					type: 'pie',
					height: 350
				},
				responsive: [{
					breakpoint: 480,
					options: {
						chart: {
							width: 200
						},
						legend: {
							position: 'bottom'
						}
					}
				}],
				xaxis: {
					categories: [],
				},
				legend: {
					position: 'bottom'
				}
			};
			return {
				vueData,
				isBusy: false,
				HocKi: null,
				ChartPie_PC: options,
				OptionsChart1: options,
				OptionsChart2: options,
				OptionsChart3: options,
				OptionsChart4: options,
				OptionsChart5: optionsPie,
				OptionsChart6: optionsPie,
				DSHocKi: [
					{
						title: "Giữa HK1",
						value: "GK_HK1"
					},
					{
						title: "Cuối HK1",
						value: "CK_HK1"
					},
					{
						title: "Giữa HK2",
						value: "GK_HK2"
					},
					{
						title: "Cuối HK2",
						value: "CK_HK2"
					}
				],
				DataChart1: [],
				DataChart2: [],
				DataChart3: [],
				DataChart4: [],
				DataChart5: [],
				DataChart6: [],
				headersChart1: [
					{
						title: "Phẩm chất",
						value: "TenMonHoc_HienThi"
					},
					{
						title: "Tổng số HS",
						value: "TongSoHS",
						align: "end"
					},
					{
						title: "Tốt (T)",
						value: "Tot",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Tot",
						align: "end"
					},
					{
						title: "Đạt (Đ)",
						value: "Dat",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Dat",
						align: "end"
					},
					{
						title: "CCG (C)",
						value: "C",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_C",
						align: "end"
					}
				],
				headersChart2: [
					{
						title: "Năng lực",
						value: "TenMonHoc_HienThi"
					},
					{
						title: "Tổng số HS",
						value: "TongSoHS",
						align: "end"
					},
					{
						title: "Tốt (T)",
						value: "Tot",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Tot",
						align: "end"
					},
					{
						title: "Đạt (Đ)",
						value: "Dat",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Dat",
						align: "end"
					},
					{
						title: "CCG (C)",
						value: "C",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_C",
						align: "end"
					}
				],
				headersChart3: [
					{
						title: "Phẩm chất, năng lực",
						value: "TenMonHoc_HienThi"
					},
					{
						title: "Tổng số HS",
						value: "TongSoHS",
						align: "end"
					},
					{
						title: "Tốt (T)",
						value: "Tot",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Tot",
						align: "end"
					},
					{
						title: "Đạt (Đ)",
						value: "Dat",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Dat",
						align: "end"
					},
					{
						title: "CCG (C)",
						value: "C",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_C",
						align: "end"
					}
				],
				headersChart4: [
					{
						title: "Các môn học",
						value: "TenMonHoc_HienThi"
					},
					{
						title: "Tổng số HS",
						value: "TongSoHS",
						align: "end"
					},
					{
						title: "Hoàn thành tốt (T)",
						value: "Tot",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_Tot",
						align: "end"
					},
					{
						title: "Hoàn thành (H)",
						value: "HH",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_HH",
						align: "end"
					},
					{
						title: "Chưa hoàn thành (C)",
						value: "C",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe_C",
						align: "end"
					}
				],
				headersChart5: [
					{
						title: "Khen thưởng",
						value: "DanhHieu"
					},
					{
						title: "Số HS",
						value: "SoHocSinh",
						align: "end"
					},
					{
						title: "Tỉ lệ (%)",
						value: "TiLe",
						align: "end"
					}
				]
			}
		},
		mounted() { },
		computed: {},
		watch: {
			HocKi: function (val) {
				if (val) {
					this.ThongKe_KQRL_Get_All_Khoi_C1()
				}
			}
		},
		methods: {
			PromiseAPI(url, param) {
				this.isBusy = true
				return new Promise((resolve, reject) => {
					ajaxCALL(url, param, res => resolve(res), err => reject(err))
				})
			},
			async ThongKe_KQRL_Get_All_Khoi_C1() {
				if (!this.HocKi) return
				const res = await this.PromiseAPI('/lms/ThongKe_KQRL_Get_All_Khoi_C1', {
					HocKi: this.HocKi,
					NienKhoa: vueData.NienKhoa
				})
				this.handleChart4(res.data[3])
				this.handleChart5(res.data[4])
				this.handleChart6(res.data[5])
				//Lấy khối 1 -> 4 => Phẩm Chất
				let Chart1 = res.data[0]
				this.DataChart1 = res.data[0].map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) {
						item.TenMonHoc_HienThi = item.TenMonHoc_HienThi + ` (${item.KhoiDay})`
					}
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot).toFixed(2),
						TiLe_Dat: (item.TiLe_Dat).toFixed(2),
						TiLe_C: (item.TiLe_C).toFixed(2)
					}
				})
				let arrSeriesData = ['TiLe_Tot', 'TiLe_Dat', 'TiLe_C']
				let arrPhamChat = [...new Set(Chart1.map(item => item.TenMonHoc_HienThi))]
				let seriesHandleChart1 = []
				for (let tile of arrSeriesData) {
					let obj = {
						name: tile,
						data: []
					}
					if (tile == 'TiLe_Tot') {
						obj.name = 'Tốt'
					} else if (tile == 'TiLe_Dat') {
						obj.name = 'Đạt'
					} else if (tile == 'TiLe_C') {
						obj.name = 'Cần cố gắng'
					}
					for (let pc of arrPhamChat) {
						let objFind = this.DataChart1.find(item => item.TenMonHoc_HienThi == pc)
						if (objFind) {
							obj.data.push(objFind[tile])
						} else {
							obj.data.push(null)
						}
					}
					seriesHandleChart1.push(obj)
				}
				this.OptionsChart1 = {
					...this.OptionsChart1,
					chart: {
						type: 'bar',
						stacked: true,
						height: 500
					},
					title: {
						text: 'Biểu đồ tỉ lệ',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					},
					xaxis: {
						categories: arrPhamChat,
					},
					series: seriesHandleChart1,
					yaxis: {
						title: {
							text: '%'
						},
						max: 100,
						min: 0,
					},
					fill: {
						opacity: 1
					},
					tooltip: {
						y: {
							formatter: function (val) {
								return val + "%"
							}
						}
					}
				}
	
				//Lấy khối 1 -> 4 => Năng lực
				let Chart2 = res.data[1]
				let arrNangLuc = [...new Set(Chart2.map(item => item.TenMonHoc_HienThi))]
				let seriesHandleChart2 = []
				for (let tile of arrSeriesData) {
					let obj = {
						name: tile,
						data: []
					}
					if (tile == 'TiLe_Tot') {
						obj.name = 'Tốt'
					} else if (tile == 'TiLe_Dat') {
						obj.name = 'Đạt'
					} else if (tile == 'TiLe_C') {
						obj.name = 'Cần cố gắng'
					}
					for (let nl of arrNangLuc) {
						let objFind = Chart2.find(item => item.TenMonHoc_HienThi == nl)
						if (objFind) {
							obj.data.push(objFind[tile])
						} else {
							obj.data.push(0)
						}
					}
					seriesHandleChart2.push(obj)
				}
				this.OptionsChart2 = {
					...this.OptionsChart2,
					chart: {
						type: 'bar',
						stacked: true,
						height: 500
					},
					xaxis: {
						categories: arrNangLuc,
					},
					title: {
						text: 'Biểu đồ tỉ lệ',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					},
					series: seriesHandleChart2,
					fill: {
						opacity: 1
					},
					tooltip: {
						y: {
							formatter: function (val) {
								return val + "%"
							}
						}
					}
				}
				let NangLucChungArr = res.data[1].filter(item => item.TenMonHoc_HienThi.includes('và')).map(item => {
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot).toFixed(2),
						TiLe_Dat: (item.TiLe_Dat).toFixed(2),
						TiLe_C: (item.TiLe_C).toFixed(2)
					}
				})
				let NangLucDacThuArr = res.data[1].filter(item => !item.TenMonHoc_HienThi.includes('và')).map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) {
						item.TenMonHoc_HienThi = item.TenMonHoc_HienThi + ` (${item.KhoiDay})`
					}
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot).toFixed(2),
						TiLe_Dat: (item.TiLe_Dat).toFixed(2),
						TiLe_C: (item.TiLe_C).toFixed(2)
					}
				})
				let objNangLucChung = [{
					TenMonHoc_HienThi: 'Năng lực chung'
				}]
				let objNangLucDacThu = [{
					TenMonHoc_HienThi: 'Năng lực đặc thù'
				}]
				this.DataChart2 = [...objNangLucChung, ...NangLucChungArr, ...objNangLucDacThu, ...NangLucDacThuArr]
				//Lấy khối 5 => Phẩm Chất- Năng lực
				let Chart3 = res.data[2]
				let arrNangLucPhamChat = [...new Set(Chart3.map(item => item.TenMonHoc_HienThi))]
				let seriesHandleChart3 = []
				for (let tile of arrSeriesData) {
					let obj = {
						name: tile,
						data: []
					}
					if (tile == 'TiLe_Tot') {
						obj.name = 'Tốt'
					} else if (tile == 'TiLe_Dat') {
						obj.name = 'Đạt'
					} else if (tile == 'TiLe_C') {
						obj.name = 'Cần cố gắng'
					}
					for (let nlpc of arrNangLucPhamChat) {
						let objFind = Chart3.find(item => item.TenMonHoc_HienThi == nlpc)
						if (objFind) {
							obj.data.push(objFind[tile])
						} else {
							obj.data.push(0)
						}
					}
					seriesHandleChart3.push(obj)
				}
				this.OptionsChart3 = {
					...this.OptionsChart3,
					chart: {
						type: 'bar',
						stacked: true,
						height: 500
					},
					title: {
						text: 'Biểu đồ tỉ lệ',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					},
					xaxis: {
						categories: arrNangLucPhamChat,
					},
					series: seriesHandleChart3,
					fill: {
						opacity: 1
					},
					tooltip: {
						y: {
							formatter: function (val) {
								return val + "%"
							}
						}
					}
				}
				let PhamChatArr = res.data[2].filter(item => item.Is_PhamChat).map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) {
						item.TenMonHoc_HienThi = item.TenMonHoc_HienThi + ` (${item.KhoiDay})`
					}
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot).toFixed(2),
						TiLe_Dat: (item.TiLe_Dat).toFixed(2),
						TiLe_C: (item.TiLe_C).toFixed(2)
					}
				})
				let NangLucArr = res.data[2].filter(item => !item.Is_PhamChat).map(item => {
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot).toFixed(2),
						TiLe_Dat: (item.TiLe_Dat).toFixed(2),
						TiLe_C: (item.TiLe_C).toFixed(2)
					}
				})
				let objPhamChat = [{ TenMonHoc_HienThi: 'Phẩm chất' }]
				let objNangLuc = [{ TenMonHoc_HienThi: 'Năng lực' }]
				this.DataChart3 = [...objPhamChat, ...PhamChatArr, ...objNangLuc, ...NangLucArr]
	
	
				this.isBusy = false
			},
			handleChart4(DataChart4) {
				console.log('DataChart4', DataChart4)
				this.DataChart4 = DataChart4.map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) {
						item.TenMonHoc_HienThi = item.TenMonHoc_HienThi + ` (${item.KhoiDay})`
					}
					return {
						...item,
						TiLe_Tot: (item.TiLe_Tot)?.toFixed(2),
						TiLe_HH: (item.TiLe_HH)?.toFixed(2),
						TiLe_C: (item.TiLe_C)?.toFixed(2)
					}
				})
				let arrMonHoc = [...new Set(DataChart4.map(item => item.TenMonHoc_HienThi))]
				let seriesHandleChart4 = []
				let arrSeriesData = ['TiLe_Tot', 'TiLe_HH', 'TiLe_C']
				for (let tile of arrSeriesData) {
					let obj = {
						name: tile,
						data: []
					}
					if (tile == 'TiLe_Tot') {
						obj.name = 'Hoàn thành tốt'
					} else if (tile == 'TiLe_HH') {
						obj.name = 'Hoàn thành'
					} else if (tile == 'TiLe_C') {
						obj.name = 'Chưa hoàn thành'
					}
					for (let mh of arrMonHoc) {
						let objFind = DataChart4.find(item => item.TenMonHoc_HienThi == mh)
						if (objFind) {
							obj.data.push(objFind[tile])
						} else {
							obj.data.push(0)
						}
					}
					seriesHandleChart4.push(obj)
				}
				this.OptionsChart4 = {
					...this.OptionsChart4,
					chart: {
						type: 'bar',
						stacked: true,
						height: 500
					},
					title: {
						text: 'Biểu đồ tỉ lệ',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					},
					xaxis: {
						categories: arrMonHoc,
					},
					series: seriesHandleChart4,
					fill: {
						opacity: 1
					},
					tooltip: {
						y: {
							formatter: function (val) {
								return val + "%"
							}
						}
					}
				}
			},
			handleChart5(DataChart5) {
				this.DataChart5 = DataChart5.map(item => {
					return {
						...item,
						TiLe: (item.TiLe)?.toFixed(2)
					}
				})
				this.OptionsChart5 = {
					...this.OptionsChart5,
					series: DataChart5.map(item => item.TiLe),
					labels: DataChart5.map(item => item.DanhHieu),
					title: {
						text: 'Biểu đồ tỉ lệ khối 1,2,3,4',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					}
				}
			},
			handleChart6(DataChart6) {
				this.DataChart6 = DataChart6.map(item => {
					return {
						...item,
						TiLe: (item.TiLe)?.toFixed(2)
					}
				})
				this.OptionsChart6 = {
					...this.OptionsChart6,
					series: DataChart6.map(item => item.TiLe),
					labels: DataChart6.map(item => item.DanhHieu),
					title: {
						text: 'Biểu đồ tỉ lệ khối 5',
						align: 'left',
						style: {
							fontSize: '16px',
							color: '#263238'
						}
					}
				}
			},
			getRowStyle(item) {
				console.log('item', item)
				if (item.TenMonHoc_HienThi == 'Năng lực chung' || item.TenMonHoc_HienThi == 'Phẩm chất') {
					return 'background-color: rgb(0 176 255 / 83%);font-weight: bold;color: #ffffff;';
				} else if (item.TenMonHoc_HienThi == 'Năng lực đặc thù' || item.TenMonHoc_HienThi == 'Năng lực') {
					return 'background-color: rgb(255 152 0);font-weight: bold;color: #ffffff;';
				}
				return '';
			},
			getRowClass(item) {
				if (item.TenMonHoc_HienThi == 'Năng lực chung' || item.TenMonHoc_HienThi == 'Năng lực đặc thù' || item.TenMonHoc_HienThi == 'Phẩm chất' || item.TenMonHoc_HienThi == 'Năng lực') {
					return 'text-uppercase'; // chữ in hoa
				}
				return '';
			}
		},
	}
</script>