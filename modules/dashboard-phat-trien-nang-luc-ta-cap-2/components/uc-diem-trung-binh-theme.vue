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
						<v-btn color="primary" :disabled="!form.LopID || !form.HocKy  || !form.HocSinhID"  variant="tonal" @click="onLoadChart({
							HocKy: form.HocKy,
							HocSinhID: form.HocSinhID,
							KhoiID: khoiid,
							LopID: form.LopID,
							MonHocID: monhocid
						})" >
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
						Điểm giữa kì và cuối kì (%)
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
				grid: {
					padding: {
						top: 0,
						right: 20,
						bottom: 0,
						left: 20
					},
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
				},
				xaxis: {
					categories: []
				}
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
					},

				},
				grid: {
					padding: {
						top: 0,
						right: 20,
						bottom: 0,
						left: 20
					},
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
					min: 0,
					max: 100,
					tickAmount: 5,
					labels: {
						formatter: function (val) {
							return val.toFixed(0);
						}
					}
				},
				xaxis: {
					categories: []
				}
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
				grid: {
					padding: {
						top: 0,
						right: 20,
						bottom: 0,
						left: 20
					},
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
				},
				xaxis: {
					categories: []
				}
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
			if (LopID) {
				this.onLoadDSHocSinh(LopID)
			} else {
				this.DSHocSinh = []
			}
		},
		'form.HocSinhID': function (val) {
			if (val && this.form.LopID && this.form.HocKy) {
				this.onLoadChart({
					HocKy: this.form.HocKy,
					HocSinhID: this.form.HocSinhID,
					KhoiID: this.khoiid,
					LopID: this.form.LopID,
					MonHocID: this.monhocid
				})
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
			debugger
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
									data: DataChart_DiemTrungBinhTheme_API.map(x => parseFloat(x.KetQuaDanhGia_VI)),
								}
							],
							xaxis: {
								categories: DataChart_DiemTrungBinhTheme_API.map(x => x.MaCotDiem),
							}
						}

						const kyNang_S1 = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem === 'S1_Mid' || x.MaNhomCotDiem === 'S1_Final')
						const kyNang_S2 = DataChart_KyNangTheme_API.filter(x => x.MaNhomCotDiem === 'S2_Mid' || x.MaNhomCotDiem === 'S2_Final')
						const labelsKyNang_S1 = [...new Set(kyNang_S1.map(x => x.TenCotDiem_EN))]
						const labelsKyNang_S2 = [...new Set(kyNang_S2.map(x => x.TenCotDiem_EN))]

						const theme_S1 = DataChart_KyNangTheme_API.filter(x =>
							x.MaNhomCotDiem !== 'S1_Mid'
							&& x.MaNhomCotDiem !== 'S1_Final'

						)
						const theme_S2 = DataChart_KyNangTheme_API.filter(x =>
							x.MaNhomCotDiem !== 'S2_Mid'
							&& x.MaNhomCotDiem !== 'S2_Final'
						)

						const labelsTheme = HocKy === 'HK1' ? [...new Set(theme_S1.map(x => x.TenCotDiem_EN))] : [...new Set(theme_S2.map(x => x.TenCotDiem_EN))]

						const datasetsTheme_1 = this.normalizeDatasetByLabels(theme_S1, "Theme_1", labelsTheme)
						const datasetsTheme_2 = this.normalizeDatasetByLabels(theme_S1, "Theme_2", labelsTheme)
						const datasetsTheme_3 = this.normalizeDatasetByLabels(theme_S1, "Theme_3", labelsTheme)
						const datasetsTheme_4 = this.normalizeDatasetByLabels(theme_S1, "Theme_4", labelsTheme)

						const datasetsTheme_5 = this.normalizeDatasetByLabels(theme_S2, "Theme_5", labelsTheme)
						const datasetsTheme_6 = this.normalizeDatasetByLabels(theme_S2, "Theme_6", labelsTheme)
						const datasetsTheme_7 = this.normalizeDatasetByLabels(theme_S2, "Theme_7", labelsTheme)
						const datasetsTheme_8 = this.normalizeDatasetByLabels(theme_S2, "Theme_8", labelsTheme)


						console.log(datasetsTheme_5)
						console.log(datasetsTheme_6)
						console.log(datasetsTheme_7)
						console.log(datasetsTheme_8)
						let serieThemes = []
						if (HocKy === 'HK1') {
							serieThemes = [
								{ name: "Theme 1", data: datasetsTheme_1 },
								{ name: "Theme 2", data: datasetsTheme_2 },
								{ name: "Theme 3", data: datasetsTheme_3 },
								{ name: "Theme 4", data: datasetsTheme_4 }
							]
						} else if (HocKy === 'HK2') {
							serieThemes = [
								{ name: "Theme 5", data: datasetsTheme_5 },
								{ name: "Theme 6", data: datasetsTheme_6 },
								{ name: "Theme 7", data: datasetsTheme_7 },
								{ name: "Theme 8", data: datasetsTheme_8 }
							]
						}
						const chartTheme = {
							...this.Chart_Theme,
							series: serieThemes,
							xaxis: {
								categories: labelsTheme
							}
						}

						let seriesKyNang = []
						let labelsKyNang = HocKy === 'HK1' ? labelsKyNang_S1 : labelsKyNang_S2
						if (HocKy === 'HK1') {
							seriesKyNang = [{
								name: "Điểm giữa kì (%)",
								data: kyNang_S1.filter(x => x.MaNhomCotDiem === 'S1_Mid').map(x => {
									// Xác định điểm tối đa cho từng kỹ năng
									let maxScore;
									switch (x.TenCotDiem_EN.toLowerCase()) {
										case 'listening': maxScore = x.DiemMax; break;
										case 'language': maxScore = x.DiemMax; break;
										case 'reading': maxScore = x.DiemMax; break;
										case 'writing': maxScore = x.DiemMax; break;
										case 'speaking': maxScore = x.DiemMax; break;
										default:
											maxScore = 2;
									}
									return (parseFloat(x.KetQuaDanhGia_VI) / maxScore) * 100;
								})
							},
							{
								name: "Điểm cuối kì (%)",
								data: kyNang_S1.filter(x => x.MaNhomCotDiem === 'S1_Final').map(x => {
									// Xác định điểm tối đa cho từng kỹ năng
									let maxScore;
									switch (x.TenCotDiem_EN.toLowerCase()) {
										case 'listening': maxScore = x.DiemMax; break;
										case 'language': maxScore = x.DiemMax; break;
										case 'reading': maxScore = x.DiemMax; break;
										case 'writing': maxScore = x.DiemMax; break;
										case 'speaking': maxScore = x.DiemMax; break;
										default:
											maxScore = 2;
									}
									return (parseFloat(x.KetQuaDanhGia_VI) / maxScore) * 100;
								})
							}]
						} else if (HocKy === 'HK2') {
							seriesKyNang = [{
								name: "Điểm giữa kì (%)",
								data: kyNang_S2.filter(x => x.MaNhomCotDiem === 'S2_Mid').map(x => {
									// Xác định điểm tối đa cho từng kỹ năng
									let maxScore;
									switch (x.TenCotDiem_EN.toLowerCase()) {
										case 'listening': maxScore = x.DiemMax; break;
										case 'language': maxScore = x.DiemMax; break;
										case 'reading': maxScore = x.DiemMax; break;
										case 'writing': maxScore = x.DiemMax; break;
										case 'speaking': maxScore = x.DiemMax; break;
										default:
											maxScore = 2;
									}
									return (parseFloat(x.KetQuaDanhGia_VI) / maxScore) * 100;
								})
							},
							{
								name: "Điểm cuối kì (%)",
								data: kyNang_S2.filter(x => x.MaNhomCotDiem === 'S2_Final').map(x => {
									// Xác định điểm tối đa cho từng kỹ năng
									let maxScore;
									switch (x.TenCotDiem_EN.toLowerCase()) {
										case 'listening': maxScore = x.DiemMax; break;
										case 'language': maxScore = x.DiemMax; break;
										case 'reading': maxScore = x.DiemMax; break;
										case 'writing': maxScore = x.DiemMax; break;
										case 'speaking': maxScore = x.DiemMax; break;
										default:
											maxScore = 2;
									}
									console.log('ee', (parseFloat(x.KetQuaDanhGia_VI) / maxScore) * 100)
									return (parseFloat(x.KetQuaDanhGia_VI) / maxScore) * 100;
								})
							}]
						}
						console.log('seriesKyNang', seriesKyNang)
						const chartKyNang = {
							...this.Chart_KyNang,
							series: seriesKyNang,
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

					})
			})
		},
		normalizeDatasetByLabels(datasetRaw, maNhom, labels) {
			const filtered = datasetRaw.filter(x => x.MaNhomCotDiem === maNhom);
			const map = {};
			filtered.forEach(x => {
				map[x.TenCotDiem_EN] = x.KetQuaDanhGia_VI;
			});

			// Trả về mảng data có thứ tự theo labels, chỗ nào không có thì null
			return labels.map(label => map[label] ?? null);
		},
		calculateLinearRegression
	}
}
</script>