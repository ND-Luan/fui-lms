<template>
	<v-card>
		<v-card-title class="text-primary">Tìm kiếm</v-card-title>
		<v-card-text>
			<v-row>
				<v-col>
					<v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm điểm" :items="DSNhomDiem"
						item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem"
						:loading="isLoadingMaNhomCotDiem"></v-select>
				</v-col>
				<v-col>
					<v-select v-model="form.MaCotDiem" label="Chọn cột điểm" :items="DSCotDiem"
						item-title="TenCotDiem_VI" item-value="MaCotDiem" :loading="isLoadingMaCotDiem"></v-select>
				</v-col>
				<v-col>
					<v-btn color="primary" variant="tonal" @click="onLoadChart({
						NienKhoa: 2024,
						KhoiID: form.KhoiID,
						MonHocID: form.MonHocItem.MonHocID,
						MaCotDiem: form.MaCotDiem
					})">Tìm kiếm</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
		<v-divider></v-divider>
		<v-card-title class="text-primary">Biểu đồ phân phối điểm</v-card-title>
		<v-row>
			<v-col>
				<v-card :flat="false"><uc-chart-apex :options="ChartHistogram" /></v-card>
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
				form: {
					KhoiID: this.khoiid,
					MonHocItem: {
						MonHocID: this.monhocid
					},
					MaNhomCotDiem: null,
					MaCotDiem: null,
				},
				DSMonHoc: [],
				DSNhomDiem: [],
				DSCotDiem: [],
				isLoadingMaNhomCotDiem: false,
				isLoadingMaCotDiem: false,
				DataChartHistogram_API: [],
				DataChartHistogram_Khoi_API: [],
				ChartHistogram: {
					id: "chart-historgram",
					chart: {
						type: "line",
						height: 350
					},
					series: [],
					xaxis: {
						categories: []
					},
					yaxis: {},
					series: [],
					options: {
						plotOptions: {
							bar: {
								columnWidth: "100%",
								endingShape: "flat"
							}
						}
					}
				}
			}
		},
		async mounted() {
			if (!this.form.KhoiID) return
	
			this.isLoadingMaNhomCotDiem = true
			this.isLoadingMaCotDiem = true
	
			const MaNhomCotDiem = localStorage.getItem('MaNhomCotDiem_TA_C2')
			const MaCotDiem = localStorage.getItem('MaCotDiem_TA_C2')
	
			if (MaNhomCotDiem && MaCotDiem) {
				await this.onLoadDSMaNhomCotDiem(this.form.KhoiID)
					.then(() => {
						this.form.MaNhomCotDiem = MaNhomCotDiem
					})
					.finally(() => this.isLoadingMaNhomCotDiem = false)
	
				await this.onLoadDSMaCotDiem(MaNhomCotDiem, this.form.MonHocItem.TemplateBangDiemID)
					.then(() => {
						this.form.MaCotDiem = MaCotDiem
					})
					.finally(() => this.isLoadingMaCotDiem = false)
				await this.onLoadChart({
					NienKhoa: 2024,
					KhoiID: this.form.KhoiID,
					MonHocID: this.form.MonHocItem.MonHocID,
					MaCotDiem: MaCotDiem
				})
			}
		},
		computed: {},
		watch: {
			khoiid: function (KhoiID) {
				this.form.KhoiID = KhoiID
			},
			'form.KhoiID': function (khoiID) {
				if (khoiID) {
					this.onLoadDSMaNhomCotDiem(khoiID)
				}
			},
			'form.MaNhomCotDiem': function (MaNhomCotDiem_new, MaNhomCotDiem_old) {
				if (MaNhomCotDiem_new !== null && MaNhomCotDiem_old !== null) {
					localStorage.setItem('MaNhomCotDiem_TA_C2', MaNhomCotDiem_new)
					this.onLoadDSMaCotDiem(MaNhomCotDiem_new, this.form.MonHocItem.TemplateBangDiemID)
						.then(() => {
							const isValid = this.DSCotDiem.some(item => item.MaCotDiem === this.form.MaCotDiem);
							if (!isValid) {
								this.form.MaCotDiem = null; // Hoặc gán giá trị mặc định
							}
						});
				}
			},
			'form.MaCotDiem': function (MaCotDiem) {
				if (MaCotDiem !== null) {
					localStorage.setItem('MaCotDiem_TA_C2', MaCotDiem)
				}
			}
		},
		methods: {
			onLoadDSMaNhomCotDiem(KhoiID) {
				return new Promise(resolve => {
					const promise = () => {
						return new Promise(resolve => {
							ajaxCALL('lms/MonHoc_GetByKhoiID',
								{
									KhoiID: KhoiID
								},
								res => {
									const monHocTiengAnh = res.data.find(x => x.MonHocID === this.form.MonHocItem.MonHocID)
									this.form.MonHocItem = monHocTiengAnh
									resolve()
								}
							)
						})
					}
					promise().then(() => {
						ajaxCALL('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID',
							{
								TemplateBangDiemID: this.form.MonHocItem.TemplateBangDiemID
							},
							res => {
								this.DSNhomDiem = res.data
								resolve()
							})
					})
				})
			},
			onLoadDSMaCotDiem(MaNhomCotDiem, TemplateBangDiemID) {
				return new Promise(resolve => {
					ajaxCALL('lms/MaCotDiem_Get_ByMaNhomCotDiem',
						{
							TemplateBangDiemID: TemplateBangDiemID,
							MaNhomCotDiem: MaNhomCotDiem
						},
						res => {
							this.DSCotDiem = res.data
							resolve()
						}
					)
				})
			},
			onLoadChart({ NienKhoa, KhoiID, MonHocID, MaCotDiem }) {
				return new Promise(resolve => {
					ajaxCALL('lms/DashboardPhanPhoiDiem_Get',
						{
							NienKhoa, KhoiID, MonHocID, MaCotDiem
						},
						res => {
							const DataChartHistogram_API = res.data[0]
							const DataChartHistogram_Khoi_API = res.data[1]
	
							this.convertChartHistogram(DataChartHistogram_API)
							this.convertChartBoxPlot()
	
							resolve()
						}
					)
				})
			},
			convertChartHistogram(rawData) {
				let bin_x;
				// 2. Tạo histogram data với bin cố định
				const { histogramData, fixedBins, bin_x_data } = this.createHistogramDataWithFixedBins(rawData);
				// 3. Lấy trung điểm của bin
				const midPoints = histogramData.map(item => item.midPoint)
				// 4. Tính toán KDE
				const kdeData = this.calculateKDE(rawData, midPoints);
				const histogramDataWithKDE = histogramData.map((item, index) => ({
					...item,
					kde: kdeData[index]?.y || 0
				}));
				bin_x = bin_x_data
				this.ChartHistogram = {
					...this.DataChartHistogram,
					series: [
						{
							name: 'Histogram',
							type: 'column',
							data: histogramDataWithKDE.map(item => item.y),
							borderColor: '#000',
							borderWidth: 1,
							backgroundColor: 'rgba(255, 193, 7, 0.7)',
							yAxis: 0
						},
						{
							name: 'KDE',
							type: 'line',
							//data: histogramDataWithKDE.map(item => ({ x: item.x, y: item.kde })),
							data: histogramDataWithKDE.map(item => item.kde),
							borderColor: 'red',
							yAxis: 1,
							tension: 0.4,
						}
					],
					chart: {
						height: 500,
						type: 'line',
						stacked: false
					},
					stroke: {
						width: [1, 2],
						curve: 'smooth'
					},
					plotOptions: {
						bar: {
							columnWidth: '100%'
						}
					},
					xaxis: {
						categories: bin_x,//histogramDataWithKDE.map(item => item.x),
						title: {
							text: 'Tổng (Total) Score',
							style: {
								fontSize: '12px',
								fontWeight: 600
							}
						},
						labels: {
							hideOverlappingLabels: false, // Hiển thị tất cả nhãn, ngay cả khi chúng bị chồng chéo
							formatter: function (value) {
								if (typeof value === 'number') {
									return value.toFixed(2); // Định dạng thành số thập phân
								}
								return value; // Trả lại giá trị nguyên gốc nếu không phải là số
							},
							style: {
								fontSize: '10px'
							},
							show: true, // Hiển thị nhãn
						},
						// tickAmount: 20, // Thử tăng số lượng tick
						// min: bin_x[0], // Thiết lập giá trị min để đảm bảo hiển thị đầy đủ
						// max: bin_x[bin_x.length - 1], // Thiết lập giá trị max
					},
					yaxis: [
						{
							seriesName: 'Histogram',
							min: 0,
							title: {
								text: 'Frequency',
								style: {
									color: '#008FFB'
								}
							},
							labels: {
								formatter: function (value) {
									return value.toFixed(2);
								},
								style: {
									color: '#008FFB'
								}
							}
						},
						{
							seriesName: 'KDE',
							opposite: true,
							min: 0,
							title: {
								text: 'Mật Độ KDE',
								style: {
									color: '#FF4560'
								}
							},
							labels: {
								formatter: function (value) {
									return value.toFixed(2);
								},
								style: {
									color: '#FF4560'
								}
							}
						}
					],
					tooltip: {
						shared: true,
						intersect: false
					},
					legend: {
						show: true,
						position: 'top'
					},
					grid: {
						show: true,
						borderColor: '#90A4AE',
						strokeDashArray: 4,
						xaxis: {
							lines: {
								show: true,
							}
						},
						yaxis: {
							lines: {
								show: true,
							}
						},
					},
					title: {
						text: 'Distribution of Tổng (Total) Scores',
						align: 'center'
					}
				}
			},
			convertChartBoxPlot() {
	
			},
			//Tính toán
			calculateKDE(data, xValues) {
				// 1. Trích xuất điểm dữ liệu từ trường "Diem"
				const points = data.map(item => item.Diem);
				// 2. Tính toán các tham số thống kê
				const n = points.length;
				const mean = points.reduce((a, b) => a + b, 0) / n;
				const variance = points.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
				const std = Math.sqrt(variance);
				// 3. Bandwidth theo Scott's rule
				const bandwidth = 1.06 * std * Math.pow(n, -1 / 5); // Scott
				//const bandwidth = 0.3 * std * Math.pow(n, -1 / 3); //giai thuat ban đầu Silverman
				// Hàm Gaussian kernel
				const gaussianKernel = (u) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
				// 5. Tính mật độ KDE cho từng điểm x trong xValues
				const kdeData = xValues.map(x => {
					let density = 0;
					for (const point of points) {
						const u = (x - point) / bandwidth;
						density += gaussianKernel(u);
					}
					density /= (n * bandwidth);
					return {
						x: x,
						y: Number(density.toFixed(2))
					};
				});
				return kdeData;
			},
			linspace(start, end, steps) {
				const result = [];
				const step = (end - start) / (steps - 1);
				for (let i = 0; i < steps; i++) { result.push(start + step * i); } return result;
			},
			createHistogramDataWithFixedBins(data) {
				const points = data.map(item => item.Diem);
				const min = Math.min(...points);
				const max = Math.max(...points);
				let numBins = 15;//max - min;
				const bins = this.linspace(min, max, numBins + 1)
				// console.log(bins)
				// bin_x = bins;
				const counts = Array(numBins).fill(0)
				for (const value of points) {
					for (let i = 0; i < numBins; i++) { if (value >= bins[i] && value < bins[i + 1]) { counts[i]++; break; } }
				}
				console.log(counts)
				let binWidth;
				if (bins.length > 1) {
					binWidth = bins[1] - bins[0];
				}
				else {
					binWidth = 1
				}
				const density = counts.map(count => count / (points.length * binWidth));
				const histogramData = bins.slice(0, -1).map((binStart, index) => ({
					x: binStart,
					binStart: binStart.toFixed(2),
					binEnd: bins[index + 1],
					y: counts[index],
					midPoint: (binStart + bins[index + 1]) / 2,
					label: `${binStart.toFixed(2)}`
				}));
				//Add last element if it is equal to max
				if (bins[bins.length - 1] === 10) {
					histogramData.push({
						x: 10, // Use 10 for x coordinate
						binStart: 10,
						binEnd: 10,
						y: 0,
						midPoint: 10,
						label: `10`
					})
				}
				// console.log(histogramData);
				// console.log(bin_x);
				return { histogramData, fixedBins: bins, bin_x_data: bins };
			}
		},
	}
</script>