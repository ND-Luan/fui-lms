<template>
	<v-card class="px-4 pt-0 pb-4 ">
		<v-card-title class="d-flex my-3 ga-2 card-border rounded-sm ">
			<div>
				<span class="text-primary">TRUNG HỌC</span>
				<div v-if="BaoCaoItem?.IsChotBaoCao" class="text-caption">
					<span class="text-red">Thời điểm chốt:</span> 
					<span class="text-black">
					[{{BaoCaoItem.NguoiChot}}]
					{{BaoCaoItem.HoTenNguoiChot}} -
					{{BaoCaoItem.NgayChot}}
					</span>
				</div>
			</div>
			<v-spacer></v-spacer>
			<div class="d-flex ga-2 align-center">
				<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" style="min-width: 200px;" />
				<v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" :disabled="!HocKi"
					@click="getHocLucHangKiem(2)">
					Làm mới
				</v-btn>
				<v-btn color="success" variant="outlined" prepend-icon="mdi-lock-check"
					:disabled="!HocKi || !BaoCaoItem || BaoCaoItem?.IsChotBaoCao" @click="onChotBaoCao">
					Chốt báo cáo
				</v-btn>
			</div>
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
				BaoCaoItem: null,
				DataChotBaoCao: null,
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
						title: "KQRL Tốt",
						value: "KQRL Tốt",
						align: "end"
					},
					{
						title: "% KQRL Tốt",
						value: "% KQRL Tốt",
						align: "end"
					},
					{
						title: "KQRL Khá",
						value: "KQRL Khá",
						align: "end"
					},
					{
						title: "% KQRL Khá",
						value: "% KQRL Khá",
						align: "end"
					},
					{
						title: "KQRL Đạt",
						value: "KQRL Đạt",
						align: "end"
					},
					{
						title: "% KQRL Đạt",
						value: "% KQRL Đạt",
						align: "end"
					},
					{
						title: "KQRL Chưa đạt",
						value: "KQRL Chưa đạt",
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
						title: "KQHT Tốt",
						value: "KQHT Tốt",
						align: "end"
					},
					{
						title: "% KQHT Tốt",
						value: "% KQHT Tốt",
						align: "end"
					},
					{
						title: "KQHT Khá",
						value: "KQHT Khá",
						align: "end"
					},
					{
						title: "% KQHT Khá",
						value: "% KQHT Khá",
						align: "end"
					},
					{
						title: "KQHT Đạt",
						value: "KQHT Đạt",
						align: "end"
					},
					{
						title: "% KQHT Đạt",
						value: "% KQHT Đạt",
						align: "end"
					},
					{
						title: "KQHT Chưa đạt",
						value: "KQHT Chưa đạt",
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
				],
				DSHocKi: [
					{
						title: "Học kì 1",
						value: 1,
						textValue: "HK1",
					},
					{
						title: "Học kì 2",
						value: 2,
						textValue: "HK2"
					},
					{
						title: "Cả năm",
						value: 0,
						textValue: "CaNam",
					}
				],
				HocKi: null,
			}
		},
		mounted() {
			this.HocKi = 1
		},
		computed: {},
		watch: {
			HocKi: function (val) {
				if (val != null) {
					this.getHocLucHangKiem(2)
				}
			}
		},
		methods: {
			async getHocLucHangKiem(capid) {
				if (!vueData.NienKhoa) return
				let data
				const valueHK = this.DSHocKi.find(x => x.value === this.HocKi)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 9,
					HocKi: valueHK.textValue,
					CapID: 2,
					NienKhoa: vueData.NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				}
				else {
					data = await ajaxCALLPromise(`diemc${capid}/LMS_ThongKeChung`, {
						HocKy: this.HocKi, //Cả năm
						NamHoc: vueData.NienKhoa,
						TypeBaoCao: 2
					})
					this.DataChotBaoCao = data
				}
				data = data.filter(x => x['Lớp'].includes('Khối'))
				this.Data_THPT = data
				this.handleChart1(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% KQHT Tốt': item['% KQHT Tốt'] ? item['% KQHT Tốt'] : null,
						'% KQHT Khá': item['% KQHT Khá'] ? item['% KQHT Khá'] : null,
						'% KQHT Đạt': item['% KQHT Đạt'] ? item['% KQHT Đạt'] : null,
						'% KQHT Chưa đạt': item['% KQHT Chưa đạt'] ? item['% KQHT Chưa đạt'] : null,
					}
					return obj
				}))
				this.handleChart2(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% KQRL Tốt': item['% KQRL Tốt'] ? item['% KQRL Tốt'] : null,
						'% KQRL Khá': item['% KQRL Khá'] ? item['% KQRL Khá'] : null,
						'% KQRL Đạt': item['% KQRL Đạt'] ? item['% KQRL Đạt'] : null,
						'% KQRL Chưa đạt': item['% KQRL Chưa đạt'] ? item['% KQRL Chưa đạt'] : null,
					}
					return obj
				}))
				this.handleChart3(data.map(item => {
					let obj = {
						'Sỉ số': item['Sỉ số'],
						'Lớp': item['Lớp'],
						'% DH Giỏi': item['% DH Giỏi'] ? item['% DH Giỏi'] : null,
						'% DH Xuất sắc': item['% DH Xuất sắc'] ? item['% DH Xuất sắc'] : null,
					}
					return obj
				}))
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
			},
			onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataChotBaoCao
						}).then(() => {
							$this.getHocLucHangKiem(2)
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
						})
					}
				})
			}
		},
	}
</script>