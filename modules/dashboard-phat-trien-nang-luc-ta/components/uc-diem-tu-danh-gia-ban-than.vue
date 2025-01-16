<template>
	<v-card class="pa-4">
		<v-row>
			<v-col cols="12" class="d-flex justify-end">
				<v-btn color="primary" variant="tonal" @click="onLoadChart({
							NienKhoa: 2024,
							CapID: capid,
							MonHocID: monhocid
						})">
					Xem biểu đồ
				</v-btn>
			</v-col>
			<v-col cols="6">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Mối quan hệ giữa điểm trung bình và đường hồi quy của GV Việt Nam

					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_GVVN" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="6">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Mối quan hệ giữa điểm trung bình và đường hồi quy của GV Nước ngoài
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_GVNN" />
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
				Chart_GVVN: {
					series: [],
					chart: {
						height: 350,
						type: 'line',
						zoom: {
							enabled: true,
							type: 'xy'
						}
					},
					xaxis: {
						tickAmount: 10,
						labels: {
							formatter: function (val) {
								return parseFloat(val).toFixed(1)
							}
						}
					},
					yaxis: {
						tickAmount: 7
					}
				},
				Chart_GVNN: {
					series: [],
					chart: {
						height: 350,
						type: 'line',
						zoom: {
							enabled: true,
							type: 'xy'
						}
					},
					xaxis: {
						tickAmount: 10,
						labels: {
							formatter: function (val) {
								return parseFloat(val).toFixed(1)
							}
						}
					},
					yaxis: {
						tickAmount: 7
					}
				}
			}
		},
		mounted() {
			this.onLoadChart({ NienKhoa: 2024, CapID: this.capid, MonHocID: this.monhocid })
		},
		computed: {},
		watch: {},
		methods: {
			onLoadChart({ NienKhoa, CapID, MonHocID }) {
				return new Promise(resolve => {
					ajaxCALL('lms/Dashboard_NangLuc_GiangVien_DiemTrungBinh',
						{
							NienKhoa, CapID, MonHocID
						},
						res => {
							const data = res.data
							// Chuẩn bị dữ liệu
							const xData_NN = data.map(item => item.PDP_GV_NN);
							const yData_NN = data.map(item => item.DiemTB);
							// Tính toán hồi quy
							const regression_NN = this.calculateLinearRegression(xData_NN, yData_NN);
							// Chuẩn bị dữ liệu
							const xData_VN = data.map(item => item.PDP_GV_VN);
							const yData_VN = data.map(item => item.DiemTB);
							// Tính toán hồi quy
							const regression_VN = this.calculateLinearRegression(xData_VN, yData_VN);
	
							this.Chart_GVNN = {
								...this.Chart_GVNN,
								series: [{
									name: 'Điểm',
									type: 'scatter',
									data: data.map(item => ({ x: item.PDP_GV_NN, y: item.DiemTB })),
								},
								{
									name: 'Đường Hồi Quy',
									data: regression_NN.regressionLine,
								}],
								yaxis: {
									labels: {
										formatter: function (value) {
											return value.toFixed(2);
										}
									},
								},
								fill: {
									type: 'solid',
								},
								markers: {
									size: [6, 0]
								},
								tooltip: {
									shared: false,
									intersect: true,
								},
							}
							this.Chart_GVVN = {
								...this.Chart_GVVN,
								series: [{
									name: 'Điểm',
									type: 'scatter',
									data: data.map(item => ({ x: item.PDP_GV_VN, y: item.DiemTB })),
								},
								{
									name: 'Đường Hồi Quy',
									data: regression_VN.regressionLine,
								}],
								yaxis: {
									labels: {
										formatter: function (value) {
											return value.toFixed(2);
										}
									},
								},
								fill: {
									type: 'solid',
								},
								markers: {
									size: [6, 0]
								},
								tooltip: {
									shared: false,
									intersect: true,
								},
							}
						}
					)
				})
			},
			calculateLinearRegression
		},
	}
</script>