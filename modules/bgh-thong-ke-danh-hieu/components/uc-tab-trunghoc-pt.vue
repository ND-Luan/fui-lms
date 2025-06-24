<template>
	<v-card class="px-4 pt-0 pb-4 ">
		<v-card-title class=" my-3 ga-2 card-border rounded-sm ">
			<span class="text-primary">TRUNG HỌC PHỔ THÔNG</span>
		</v-card-title>
		<div>
			<v-card border>
				<v-card-title class="text-primary">Học lực / Học tập</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersHocTap" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart1" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>

			</v-card>

			<v-card border class="mt-4">
				<v-card-title class="text-primary">Hạnh kiểm (Kết quả rèn luyện)</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersKQRL" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart2" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>

			<v-card border class="mt-4">
				<v-card-title class="text-primary">Danh hiệu</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersDanhHieu" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart3" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</div>
	</v-card>

</template>

<script>
export default {
	props: [],
	data() {
		var options = {
			chart: {
				type: 'bar',
				height: 500,
				stacked: true,
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
		return {
			vueData,
			OptionsChart1: options,
			OptionsChart2: options,
			OptionsChart3: options,
			Data_THPT: [],
			headersKQRL: [
				{
					title: "Khối",
					value: "Lớp",
				},
				{
					title: "Sỉ số",
					value: "Sỉ số",
					align: "end"
				},
				{
					title: "% KQRL Tốt",
					value: "% KQRL Tốt",
					align: "end"
				},
				{
					title: "% KQRL Khá",
					value: "% KQRL Khá",
					align: "end"
				},
				{
					title: "% KQRL Đạt",
					value: "% KQRL Đạt",
					align: "end"
				},
				{
					title: "% KQRL Chưa đạt",
					value: "% KQRL Chưa đạt",
					align: "end"
				}
			],
			headersHocTap: [
				{
					title: "Khối",
					value: "Lớp",
				},
				{
					title: "Sỉ số",
					value: "Sỉ số",
					align: "end"
				},
				{
					title: "% KQHT Tốt",
					value: "% KQHT Tốt",
					align: "end"
				},
				{
					title: "% KQHT Khá",
					value: "% KQHT Khá",
					align: "end"
				},
				{
					title: "% KQHT Đạt",
					value: "% KQHT Đạt",
					align: "end"
				},
				{
					title: "% KQHT Chưa đạt",
					value: "% KQHT Chưa đạt",
					align: "end"
				}
			],
			headersDanhHieu: [
				{
					title: "Khối",
					value: "Lớp",
				},
				{
					title: "HS Xuất Sắc",
					align: "center",
					children: [
						{
							title: "SL",
							value: "DH Xuất sắc",
							align: "end"
						},
						{
							title: "Tỉ lệ (%)",
							value: "% DH Xuất sắc",
							align: "end"
						},
					]
				},
				{
					title: "HS Giỏi",
					align: "center",
					children: [
						{
							title: "SL",
							value: "DH Giỏi",
							align: "end"
						},
						{
							title: "Tỉ lệ (%)",
							value: "% DH Giỏi",
							align: "end"
						},
					]
				}
			]
		}
	},
	mounted() {
		this.getHocLucHangKiem(3)
	},
	computed: {},
	watch: {},
	methods: {
		getHocLucHangKiem(capid) {
			ajaxCALL(`diemc${capid}/LMS_ThongKeChung`, {
				HocKy: 0, //Cả năm
				NamHoc: vueData.NienKhoa,
				TypeBaoCao: 2
			}, res => {
				console.log(res.data)
				const data = res.data.filter(x => x['Lớp'].includes('Khối'))
				this.Data_THPT = data
				console.log('this.Data_THPT', this.Data_THPT)
				this.handleChart1(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% KQHT Tốt': item['% KQHT Tốt'],
						'% KQHT Khá': item['% KQHT Khá'],
						'% KQHT Đạt': item['% KQHT Đạt'],
						'% KQHT Chưa đạt': item['% KQHT Chưa đạt'],
					}
					return obj
				}))
				this.handleChart2(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% KQRL Tốt': item['% KQRL Tốt'],
						'% KQRL Khá': item['% KQRL Khá'],
						'% KQRL Đạt': item['% KQRL Đạt'],
						'% KQRL Chưa đạt': item['% KQRL Chưa đạt'],
					}
					return obj
				}))
				this.handleChart3(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% DH Giỏi': item['% DH Giỏi'],
						'% DH Xuất sắc': item['% DH Xuất sắc'],
					}
					return obj
				}))
			})
		},
		handleChart1(DataChart1) {
			this.OptionsChart1 = {
				...this.OptionsChart1,
				xaxis: {
					categories: DataChart1.map(item => item['Lớp'])
				},
				series: [
					{
						name: '% KQHT Tốt',
						data: DataChart1.map(item => item['% KQHT Tốt'])
					},
					{
						name: '% KQHT Khá',
						data: DataChart1.map(item => item['% KQHT Khá'])
					},
					{
						name: '% KQHT Đạt',
						data: DataChart1.map(item => item['% KQHT Đạt'])
					},
					{
						name: '% KQHT Chưa đạt',
						data: DataChart1.map(item => item['% KQHT Chưa đạt'])
					}
				]
			}
		},
		handleChart2(DataChart2) {
			this.OptionsChart2 = {
				...this.OptionsChart2,
				xaxis: {
					categories: DataChart2.map(item => item['Lớp'])
				},
				series: [
					{
						name: '% KQRL Tốt',
						data: DataChart2.map(item => item['% KQRL Tốt'])
					},
					{
						name: '% KQRL Khá',
						data: DataChart2.map(item => item['% KQRL Khá'])
					},
					{
						name: '% KQRL Đạt',
						data: DataChart2.map(item => item['% KQRL Đạt'])
					},
					{
						name: '% KQRL Chưa đạt',
						data: DataChart2.map(item => item['% KQRL Chưa đạt'])
					}
				]
			}
		},
		handleChart3(DataChart3) {
			this.OptionsChart3 = {
				...this.OptionsChart3,
				xaxis: {
					categories: DataChart3.map(item => item['Lớp'])
				},
				series: [
					{
						name: '% DH Giỏi',
						data: DataChart3.map(item => item['% DH Giỏi'])
					},
					{
						name: '% DH Xuất sắc',
						data: DataChart3.map(item => item['% DH Xuất sắc'])
					}
				]
			}
		}
	},
}
</script>