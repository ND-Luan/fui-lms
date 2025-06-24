<template>
	<v-card class="pa-4">
		<v-card :flat="false">
			<v-card-text>
				<v-row>
					<v-col cols="12" md="3">
						<v-select v-model="form.LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID"></v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-select v-model="form.HocKy" label="Chọn học kì" :items="DSHocKy" item-title="title"
							item-value="value"></v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-select v-model="form.HocSinhID" label="Chọn học sinh" :items="DSHocSinh" item-title="HoTen"
							item-value="HocSinhID"></v-select>
					</v-col>
					<v-col cols="12" md="3">
						<v-btn color="primary" variant="tonal" :disabled="!form.HocSinhID" @click="onLoadChart({
							HocKy: form.HocKy,
							HocSinhID: form.HocSinhID,
							KhoiID: khoiid,
							LopID: form.LopID,
							MonHocID: monhocid
						})">
							Xem biểu đồ
						</v-btn>
					</v-col>
					<!-- <v-col>
						<v-btn color="primary" variant="tonal" @click="onLoadChart({
								  	HocKy: form.HocKy,
								  	HocSinhID: form.HocSinhID,
								  	KhoiID: khoiid,
								  	LopID: form.LopID,
								  	MonHocID: monhocid
								  })">
							Phân Tích Bằng AI
						</v-btn>
					</v-col> -->
				</v-row>
			</v-card-text>
		</v-card>
		<v-row class="mt-4">
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm trung bình
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_DiemTrungBinh" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm giữa kì và cuối kì
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_KyNang" />
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="4">
				<v-card :flat="false">
					<v-card-title class="d-flex text-primary">
						Điểm chủ đề
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="Chart_Theme" />
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
			form: {
				KhoiID: null,
				LopID: null,
				HocKy: null,
				HocSinhID: null
			},
			DSHocKy: [
				{
					"title": "HK1",
					"value": "HK1"
				},
				{
					"title": "HK2",
					"value": "HK2"
				}
			],
			DSLop: [],
			DSHocSinh: [],
			Chart_DiemTrungBinh: {
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
					//text: 'Radar Chart - Multi Series'
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
					max: 10
				},
				xaxis: {
					categories: []
				},
				dataLabels: {
					enabled: true,
				},
			},
			Chart_KyNang: {
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
					//text: 'Radar Chart - Multi Series'
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
					max: 10
				},
				xaxis: {
					categories: []
				},
				dataLabels: {
					enabled: true,
				},
			},
			Chart_Theme: {
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
					//text: 'Radar Chart - Multi Series'
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
					max: 10
				},
				xaxis: {
					categories: []
				},
				dataLabels: {
					enabled: true,
				},
			}
		}
	},
	mounted() {
		this.onLoadDSLop(this.khoiid)
	},
	computed: {},
	watch: {
		khoiid: function (KhoiID) {
			this.form.KhoiID = KhoiID
		},
		'form.KhoiID': function (KhoiID) {
			if (KhoiID) {
				this.onLoadDSLop(KhoiID)
					.then(() => {
						const isValid = this.DSLop.some(item => item.LopID === this.form.LopID);
						if (!isValid) {
							this.form.LopID = null; // Hoặc gán giá trị mặc định
						}
					});
			}
		},
		'form.LopID': function (LopID) {
			this.form.HocSinhID = null
			this.DSHocSinh = []
			if (LopID) {
				this.onLoadDSHocSinh(LopID)
			}
		}
	},
	methods: {
		getJsonImg(canvasId) {
			// Lấy đối tượng biểu đồ từ ID canvas
			const chartInstance = Chart.getChart(canvasId); // canvasId là ID của canvas mà bạn muốn lấy dữ liệu
			// Kiểm tra nếu không có biểu đồ với canvasId
			if (!chartInstance) {
				console.error("Biểu đồ không tồn tại với canvasId:", canvasId);
				return null;
			}
			// Lấy dữ liệu biểu đồ từ đối tượng chartInstance
			const chartData = chartInstance.data;
			// Chuyển dữ liệu thành JSON và trả về
			return JSON.stringify(chartData, null, 2);
		},
		async sendChartImageToGPT(params) {
			let { chart1, chart2, prompt } = params
			let promptSend = vueData.PromptGPT[prompt]
			const charts = Object.entries(params).filter(([key]) => key.startsWith("chart"));
			// Sinh ra các biến JSON tương ứng
			const chartJsons = charts.map(([key, value]) => ({
				[key + "Json"]: getJsonImg(value) // Gọi hàm `getJsonImg` với dữ liệu tương ứng
			}));
			// Kết quả là một mảng các đối tượng JSON
			console.log(chartJsons);
			let res = await new Promise((resolve) => {
				vueData.v_Loading = true
				$.ajax({
					type: 'POST',
					headers: {
						// key 1:sk- proj - uOP0INFuaRxPjJz1r65ytuCbOGPoGOvWu9mATwQvQrnHrP5LGOgZiHT2MNUU6rp8WE6xTPJXPoT3BlbkFJ9XgQgUyGsr3XOsBto1WlHQWw5bXVEolFF6_1Ht6NK44rPkm2UQwJD32UodOncXOc9uKMwF1bUA
						// key 2: sk - proj - v3qYrBAmYotum9Dt0jqmeIkQeQUT52rVZqPxkE3i0g -tvwrTKb3rLgc1mQUWaXsgrtYGIpnotUT3BlbkFJFSvDGL37PWBIeYPjFXH3BW0Hw_dZsiGE6qmr3j0pCKlQiT - 2Vt4rPOZVEFAuwF0cP3NU0Oq3MA
						authorization: `Bearer ${'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'}`,
					},
					url: 'https://api.openai.com/v1/chat/completions',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					crossDomain: true,
					data: JSON.stringify({
						model: "gpt-4o-mini", // Hoặc "gpt-4" nếu bạn sử dụng GPT-4
						messages: [
							{ role: "system", content: "You are a data visualization expert." },
							{ role: "system", content: promptSend },
							{ role: "user", content: JSON.stringify({ chartData: chartJsons }) },
						],
						temperature: 1, // Điều chỉnh theo nhu cầu
					}),
					success: function (d) {
						response = {
							IsSuccess: true,
							Message: null,
							Result: d.data
						}
						resolve(response)
					},
					error: function (xhr, ajaxOptions, thrownError) {
						Toast.error({
							title: 'Thông báo',
							text: xhr?.responseJSON?.Message,
						})
						response = {
							IsSuccess: false,
							Message: xhr.responseJSON?.Message,
							Result: null
						}
						resolve(response)
					},
					complete: function (data) {
						vueData.v_Loading = false
					},
				})
			})
			console.log(res)
			return res
		},

		onLoadDSLop(KhoiID) {
			return new Promise(resolve => {
				ajaxCALL('lms/Lop_Get_ByKhoiID',
					{
						NienKhoa: vueData.NienKhoa,
						KhoiID: KhoiID
					},
					res => {
						this.DSLop = res.data.filter(x => x.TenLop.includes('AV'))
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
		onLoadChart({
			HocKy,
			HocSinhID,
			KhoiID,
			LopID,
			MonHocID
		}) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiemTrungBinhTheoTheme_Get',
					{
						HocKy,
						HocSinhID,
						KhoiID,
						LopID,
						MonHocID
					},
					res => {
						const DataChart_DiemTrungBinhTheme_API = res.data[0]
						const DataChart_KyNangTheme_API = res.data[1]

						this.Chart_DiemTrungBinh = {
							...this.Chart_DiemTrungBinh,
							series: [
								{
									name: "Điểm",
									data: DataChart_DiemTrungBinhTheme_API.map(x => x.KetQuaDanhGia_VI),
								}
							],
							xaxis: {
								categories: DataChart_DiemTrungBinhTheme_API.map(x => x.MaCotDiem),
							}
						}

						console.log('this.Chart_DiemTrungBinh', this.Chart_DiemTrungBinh.series)


						const kyNang = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem === 'S1_Mid' || x.MaNhomCotDiem === 'S1_Final' || x.MaNhomCotDiem === 'S2_Mid' || x.MaNhomCotDiem === 'S2_Final')
						const labelsKyNang = [...new Set(kyNang.map(x => x.TenCotDiem_EN))]
						//Rào code 13/05/2025 - 16h30 , Mẫn
						// const theme = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem !== 'S1_Mid' && x.MaNhomCotDiem !== 'S1_Final' && x.MaNhomCotDiem !== 'S2_Mid' && x.MaNhomCotDiem !== 'S2_Final')
						const theme = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem.includes('Theme_') && !(x.MaCotDiem.includes('_TST')))

						console.log('theme', theme)
						const labelsTheme = [...new Set(theme.filter(x => !(x.TenCotDiem_EN.includes('Expat T'))).map(x => x.TenCotDiem_EN))]
						const DSTheme = [...new Set(theme.map(x => x.TenNhomCotDiem_EN))]
						const datasetsTheme_1 = theme.filter(x => x.MaNhomCotDiem === "Theme_1").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_2 = theme.filter(x => x.MaNhomCotDiem === "Theme_2").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_3 = theme.filter(x => x.MaNhomCotDiem === "Theme_3").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_4 = theme.filter(x => x.MaNhomCotDiem === "Theme_4").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_5 = theme.filter(x => x.MaNhomCotDiem === "Theme_5").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_6 = theme.filter(x => x.MaNhomCotDiem === "Theme_6").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_7 = theme.filter(x => x.MaNhomCotDiem === "Theme_7").map(x => x.KetQuaDanhGia_VI)
						const datasetsTheme_8 = theme.filter(x => x.MaNhomCotDiem === "Theme_8").map(x => x.KetQuaDanhGia_VI)
						const chartTheme = {
							...this.Chart_Theme,
							//Rào code 13/05/2025 - 16h32 , Mẫn
							// series: [
							// 	{
							// 		name: "Theme 1",
							// 		data: datasetsTheme_1
							// 	},
							// 	{
							// 		name: "Theme 2",
							// 		data: datasetsTheme_2
							// 	},
							// 	{
							// 		name: "Theme 3",
							// 		data: datasetsTheme_3
							// 	},
							// 	{
							// 		name: "Theme 4",
							// 		data: datasetsTheme_4
							// 	},
							// 	{
							// 	name: "Theme 5",
							// 	data: datasetsTheme_5
							// 	},
							// 	{
							// 	name: "Theme 6",
							// 	data: datasetsTheme_6
							// 	},
							// 	{
							// 	name: "Theme 7",
							// 	data: datasetsTheme_7
							// 	},
							// 	{
							// 	name: "Theme 8",
							// 	data: datasetsTheme_8
							// 	}
							// ],
							series: DSTheme.map(item => { return { name: item, data: theme.filter(e => e.TenNhomCotDiem_EN == item).map(e => e.KetQuaDanhGia_VI.length == 0 ? 0 : e.KetQuaDanhGia_VI) } }),
							xaxis: {
								categories: labelsTheme
							}
						}
						const chartKyNang = {
							...this.Chart_KyNang,
							series:
								[
									{
										name: "Điểm giữa kì",
										data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Mid' || x.MaNhomCotDiem === 'S2_Mid').map(x => x.KetQuaDanhGia_VI)
									},
									{
										name: "Điểm cuối kì",
										data: kyNang.filter(x => x.MaNhomCotDiem === 'S1_Final' || x.MaNhomCotDiem === 'S2_Final').map(x => x.KetQuaDanhGia_VI)
									}

								],
							xaxis: {
								categories: labelsKyNang
							}
						}
						const DataChart_KyNang = {
							Theme: chartTheme,
							KyNang: chartKyNang
						}

						this.Chart_Theme = DataChart_KyNang.Theme
						this.Chart_KyNang = DataChart_KyNang.KyNang
						console.log('this.Chart_Theme', this.Chart_Theme)

					})
			})
		},
		calculateLinearRegression

	}
}
</script>