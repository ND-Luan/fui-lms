<template>
	<v-card>
		<v-card-text>
			<v-row>
				<v-col cols="12">
					<uc-chart-apex :options='optionsChart1'></uc-chart-apex>
				</v-col>
				<v-col cols="12">
					<uc-chart-apex :options='optionsChart2'></uc-chart-apex>
				</v-col>
				<v-col cols="12">
					<uc-chart-apex :options='optionsChart3'></uc-chart-apex>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		props: {
			dataChart1: {
				type: Array
			},
			dataChart2: {
				type: Array
			},
			dataChart3: {
				type: Array
			}
		},
		data() {
			return {
				optionsChart1: {
					"id": "chart1",
					chart: {
						type: 'bar',
						height: 350,
						stacked: true,
					},
					responsive: [{
						breakpoint: 480,
						options: {
							legend: {
								position: 'bottom',
								offsetX: -10,
								offsetY: 0
							}
						}
					}],
	
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: 90,
						}
					},
					xaxis: {
						categories: [
							// 'Nghe',
							// 'Đọc',
							// 'Viết',
							// 'Nói',
							// 'TB',
						],
						labels: {
							rotate: 0,
							style: { fontSize: '12px' }
						},
						tickPlacement: 'between',
					},
					fill: {
						opacity: 1
					},
					tooltip: {
						enabled: true,
					},
					colors: ['#fdd835', '#a5d6a7', '#1b5e20'], // vàng, xanh nhạt, xanh đậm
					legend: {
						position: 'right',
						offsetX: 0,
						offsetY: 50
					},
					dataLabels: {
						formatter: (val) => {
							return val + '%'
						}
					},
					title: {
						text: 'Thống kê điểm kĩ năng',
						align: 'center'
					},
					series: [],
					yaxis: {
						max: 100,
						labels: {
							formatter: (val) => {
								return val + '%'
							}
						}
					},
				},
				optionsChart2: {
					"id": "chart2",
					chart: {
						type: 'bar',
						height: 350,
						stacked: true,
	
					},
					responsive: [{
						breakpoint: 480,
						options: {
							legend: {
								position: 'bottom',
								offsetX: -10,
								offsetY: 0
							}
						}
					}],
	
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: 90,
						}
					},
					xaxis: {
						categories: [
							'Nghe',
							'Đọc',
							'Viết',
							'Nói',
							'TB',
						],
						labels: {
							rotate: 0,
							style: { fontSize: '12px' }
						},
						tickPlacement: 'between',
					},
					fill: {
						opacity: 1
					},
					tooltip: {
						enabled: true,
					},
					colors: ['#fdd835', '#a5d6a7', '#1b5e20'], // vàng, xanh nhạt, xanh đậm
					legend: {
						position: 'right',
						offsetX: 0,
						offsetY: 50
					},
					dataLabels: {
						formatter: (val) => {
							return val + '%'
						}
					},
					title: {
						text: 'Thống kê điểm kĩ năng',
						align: 'center'
					},
					series: [
						{
							name: 'Chưa đạt 1',
							group: 'AV3',
							color: '#fdd835',
							data: []
						}, {
							name: 'Đạt 1',
							color: '#a5d6a7',
							group: 'AV3',
							data: []
						}, {
							name: 'Vượt đạt 1',
							group: 'AV3',
							color: '#1b5e20',
							data: []
						},
						{
							name: 'Chưa đạt 2',
							color: '#fdd835',
							group: 'AV4',
							data: []
						},
						{
							name: 'Đạt 2',
							color: '#a5d6a7',
							group: 'AV4',
							data: []
						},
						{
							name: 'Vượt đạt 2',
							group: 'AV4',
							color: '#1b5e20',
							data: []
						},
					],
					yaxis: {
						max: 100,
						labels: {
							formatter: (val) => {
								return val + '%'
							}
						}
					},
				},
				optionsChart3: {
					"id": "chart3",
					chart: {
						type: 'bar',
						height: 350,
						stacked: true,
	
					},
					responsive: [{
						breakpoint: 480,
						options: {
							legend: {
								position: 'bottom',
								offsetX: -10,
								offsetY: 0
							}
						}
					}],
	
					plotOptions: {
						bar: {
							horizontal: false,
							columnWidth: 90,
						}
					},
					xaxis: {
						categories: [
							'Nghe',
							'Đọc',
							'Viết',
							'Nói',
							'TB',
						],
						labels: {
							rotate: 0,
							style: { fontSize: '12px' }
						},
						tickPlacement: 'between',
					},
					fill: {
						opacity: 1
					},
					tooltip: {
						enabled: true,
					},
					colors: ['#fdd835', '#a5d6a7', '#1b5e20'], // vàng, xanh nhạt, xanh đậm
					legend: {
						position: 'right',
						offsetX: 0,
						offsetY: 50
					},
					dataLabels: {
						formatter: (val) => {
							return val + '%'
						}
					},
					title: {
						text: 'Thống kê điểm kĩ năng',
						align: 'center'
					},
					series: [
						{
							name: 'Chưa đạt 1',
							group: 'AV5',
							color: '#fdd835',
							data: []
						}, {
							name: 'Đạt 1',
							color: '#a5d6a7',
							group: 'AV5',
							data: []
						}, {
							name: 'Vượt đạt 1',
							group: 'AV5',
							color: '#1b5e20',
							data: []
						},
						{
							name: 'Chưa đạt 2',
							color: '#fdd835',
							group: 'AV6',
							data: []
						},
						{
							name: 'Đạt 2',
							color: '#a5d6a7',
							group: 'AV6',
							data: []
						},
						{
							name: 'Vượt đạt 2',
							group: 'AV6',
							color: '#1b5e20',
							data: []
						},
					],
					yaxis: {
						max: 100,
						labels: {
							formatter: (val) => {
								return val + '%'
							}
						}
					},
				}
			}
		},
		mounted() {
		},
		computed: {
	
		},
		watch: {
			dataChart1: {
				handler: function (dataChart1) {
					debugger
					let [seriesChart, nhomName, nhomCategories] = this.generateSeriesChart(dataChart1)
					this.optionsChart1 = {
						...this.optionsChart1,
						title: {
							align: 'center',
							text: `Thống kê điểm kĩ năng ${nhomName} `
						},
						series: seriesChart,
						xaxis: {
							categories: nhomCategories
						}
					}
					console.log('this.optionsChart1', this.optionsChart1.series)
				},
				deep: true
			},
			dataChart2: {
				handler: function (dataChart2) {
					debugger
					let [seriesChart, nhomName, nhomCategories] = this.generateSeriesChart(dataChart2)
					this.optionsChart2 = {
						...this.optionsChart2,
						title: {
							align: 'center',
							text: `Thống kê điểm kĩ năng ${nhomName} `
						},
						series: seriesChart,
						xaxis: {
							categories: nhomCategories
						}
					}
				},
				// handler: function (dataChart2) {
				// 	let [seriesChart, nhomName, nhomCategories] = this.generateSeriesChart(dataChart2)
				// 	this.optionsChart2 = {
				// 		...this.optionsChart2,
				// 		title: {
				// 			align: 'center',
				// 			text: `Thống kê điểm kĩ năng ${nhomName} `
				// 		},
				// 		series: [{
				// 			name: 'Chưa đạt ' + `${vueData.KhoiItem.value}AV3`,
				// 			group: 'AV3',
				// 			color: '#fdd835',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}03` && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements')).map(item => item.TyLeChinhSua)
				// 		}, {
				// 			name: 'Đạt ' + `${vueData.KhoiItem.value}AV3`,
				// 			color: '#a5d6a7',
				// 			group: 'AV3',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}03` && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt')).map(item => item.TyLeChinhSua)
				// 		}, {
				// 			name: 'Vượt đạt ' + `${vueData.KhoiItem.value}AV3`,
				// 			group: 'AV3',
				// 			color: '#1b5e20',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}03` && item.KetQuaDanhGia_VI.includes('Exceeding')).map(item => item.TyLeChinhSua)
				// 		},
				// 		{
				// 			name: 'Chưa đạt ' + `${vueData.KhoiItem.value}AV4`,
				// 			color: '#fdd835',
				// 			group: 'AV4',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}04` && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements')).map(item => item.TyLeChinhSua)
	
				// 		},
				// 		{
				// 			name: 'Đạt ' + `${vueData.KhoiItem.value}AV4`,
				// 			color: '#a5d6a7',
				// 			group: 'AV4',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}04` && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt')).map(item => item.TyLeChinhSua)
	
				// 		},
				// 		{
				// 			name: 'Vượt đạt ' + `${vueData.KhoiItem.value}AV4`,
				// 			group: 'AV4',
				// 			color: '#1b5e20',
				// 			data: dataChart2.filter(item => item.LopID == `N24${vueData.KhoiItem.value}04` && item.KetQuaDanhGia_VI.includes('Exceeding')).map(item => item.TyLeChinhSua)
	
				// 		},]
				// 	}
				// },
				deep: true
			},
			dataChart3: {
				handler: function (dataChart3) {
				debugger
				let [seriesChart, nhomName, nhomCategories] = this.generateSeriesChart(dataChart3)
				this.optionsChart3 = {
				...this.optionsChart3,
				title: {
				align: 'center',
				text: `Thống kê điểm kĩ năng ${nhomName} `
				},
				series: seriesChart,
				xaxis: {
				categories: nhomCategories
				}
				}
				},
				// handler: function (dataChart3) {
				// 	if (vueData.KhoiItem.value == 10) {
				// 		this.optionsChart3 = {
				// 			...this.optionsChart3,
				// 			title: {
				// 				align: 'center',
				// 				text: `Thống kê điểm kĩ năng ${vueData.KhoiItem.value}AV5`
				// 			},
				// 			series: [{
				// 				name: 'Chưa đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				group: 'AV5',
				// 				color: '#fdd835',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements')).map(item => item.TyLeChinhSua)
				// 			}, {
				// 				name: 'Đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				color: '#a5d6a7',
				// 				group: 'AV5',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt')).map(item => item.TyLeChinhSua)
				// 			}, {
				// 				name: 'Vượt đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				group: 'AV5',
				// 				color: '#1b5e20',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Exceeding')).map(item => item.TyLeChinhSua)
				// 			}]
				// 		}
				// 	} else {
				// 		this.optionsChart3 = {
				// 			...this.optionsChart3,
				// 			title: {
				// 				align: 'center',
				// 				text: `Thống kê điểm kĩ năng ${vueData.KhoiItem.value}AV5 - ${vueData.KhoiItem.value}AV6`
				// 			},
				// 			series: [{
				// 				name: 'Chưa đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				group: 'AV5',
				// 				color: '#fdd835',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements')).map(item => item.TyLeChinhSua)
				// 			}, {
				// 				name: 'Đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				color: '#a5d6a7',
				// 				group: 'AV5',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt')).map(item => item.TyLeChinhSua)
				// 			}, {
				// 				name: 'Vượt đạt ' + `${vueData.KhoiItem.value}AV5`,
				// 				group: 'AV5',
				// 				color: '#1b5e20',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}05` && item.KetQuaDanhGia_VI.includes('Exceeding')).map(item => item.TyLeChinhSua)
				// 			},
				// 			{
				// 				name: 'Chưa đạt ' + `${vueData.KhoiItem.value}AV6`,
				// 				color: '#fdd835',
				// 				group: 'AV6',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}06` && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements')).map(item => item.TyLeChinhSua)
	
				// 			},
				// 			{
				// 				name: 'Đạt ' + `${vueData.KhoiItem.value}AV6`,
				// 				color: '#a5d6a7',
				// 				group: 'AV6',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}06` && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt')).map(item => item.TyLeChinhSua)
	
				// 			},
				// 			{
				// 				name: 'Vượt đạt ' + `${vueData.KhoiItem.value}AV6`,
				// 				group: 'AV6',
				// 				color: '#1b5e20',
				// 				data: dataChart3.filter(item => item.LopID == `N24${vueData.KhoiItem.value}06` && item.KetQuaDanhGia_VI.includes('Exceeding')).map(item => item.TyLeChinhSua)
	
				// 			},]
				// 		}
				// 	}
	
				// },
				deep: true
			}
		},
		methods: {
			generateSeriesChart(dataChart) {
	
				// Bước 1: Nhóm theo LopID
				const byClass = _.groupBy(dataChart, 'LopID');
	
				// Bước 2: Với mỗi lớp, nhóm tiếp theo MaCotDiem
				const result = _.mapValues(byClass, (items) => {
					return _.groupBy(items, 'MaCotDiem');
				});
	
				console.log(result);
				// 1. Extract unique KetQuaDanhGia_VI values
				const ketQuaSet = new Set();
				Object.values(result).forEach(lop => {
					Object.values(lop).forEach(diemList => {
						diemList.forEach(entry => {
							ketQuaSet.add(entry.KetQuaDanhGia_VI);
						});
					});
				});
	
				// 2. Assign colors (you can customize these)
				const colorPalette = ['#1b5e20', '#a5d6a7', '#fdd835', '#64b5f6', '#e57373'];
				const ketQuaLabels = Array.from(ketQuaSet).map((label, index) => ({
					key: label,
					color: colorPalette[index % colorPalette.length],
					label: label.split(' / ')[1] || label, // lấy phần tiếng Việt nếu có
					labelEN: label.split(' / ')[0] || label // lấy phần tiếng Việt nếu có
				}));
	
				// 3. Build series from result
				const series = [];
	
				Object.entries(result).forEach(([lopID, cotDiemData]) => {
					Object.entries(cotDiemData).forEach(([maCotDiem, items]) => {
						ketQuaLabels.forEach(({ key, color, label, labelEN }) => {
							const filtered = items.find(i => i.KetQuaDanhGia_VI === key);
							if (filtered) {
								series.push({
									name: `${label} ${filtered.TenNhom} (${maCotDiem})`,
									group: filtered.TenNhom,
									color: color,
									labelEN: labelEN,
									data: [filtered.TyLeChinhSua]
								});
							}
						});
					});
				});
	
				const resultSeries = [];
	
				// Xử lý từng nhóm
				const groups = [...new Set(series.map(item => item.group))]; // Lấy danh sách các nhóm
	
				groups.forEach(group => {
					// Tạo các phần tử cho từng nhóm (Vượt đạt, Đạt, Chưa đạt)
					const groupData = series.filter(item => item.group === group);
	
					const exceeding = groupData.filter(item => item.name.includes("Vượt đạt"));
					const pass = groupData.filter(item => item.name.includes("Đạt"));
					const notPass = groupData.filter(item => item.name.includes("Chưa đạt"));
	
					// Đưa vào kết quả
					resultSeries.push(
	
	
						{
							name: `Chưa đạt ${group}`,
							group,
							color: "#fdd835",
							data: notPass.map(item => item.data[0])
						},
						{
							name: `Đạt ${group}`,
							group,
							color: "#a5d6a7",
							data: pass.map(item => item.data[0])
						},
						{
							name: `Vượt đạt ${group}`,
							group,
							color: "#1b5e20",
							data: exceeding.map(item => item.data[0])
						}
					);
				});
	
	
				const byNhomName = _.groupBy(dataChart, 'TenNhom');
				const nhomName = Object.keys(byNhomName); // lấy tất cả key
				
				const byMaCotDiem = _.groupBy(dataChart, 'MaCotDiem');
				const maCotDiemUniq = Object.keys(byMaCotDiem); // lấy tất cả key
				debugger
				const shortNames = maCotDiemUniq.map(code => {
					const parts = code.split('_');
					// Lấy từ thứ 2 từ cuối
					return parts.length >= 2 ? parts[parts.length - 2] : code;
				});
				translationMap = {
				"Listening": "Nghe",
				"Reading": "Đọc",
				"Writing": "Viết",
				"Speaking": "Nói",
				"Avg": "Trung bình"
				}
				const vietnameseNames = shortNames.map(name => translationMap[name]);
	
				console.log(vietnameseNames);
				return [resultSeries, nhomName, vietnameseNames]
				// let sampleSeries[{
				// 	{
				// 	name: 'Chưa đạt',
				// 	group: '',
				// 	color: '#fdd835',
				// 	data: []
				// 	}, {
				// 	name: 'Đạt',
				// 	color: '#a5d6a7',
				// 	group: '',
				// 	data: []
				// 	}, {
				// 	name: 'Vượt đạt',
				// 	group: '',
				// 	color: '#1b5e20',
				// 	data:[]
				// 	},
				// }]
				// return {
				// 	title: {
				// 		align: 'center',
				// 		text: chartTitle
				// 	},
				// 	series: avList.flatMap(av => {
				// 		const lopID = `N24${khoiValue}${av}`;
				// 		return [
				// 			{
				// 				name: `Chưa đạt ${khoiValue}${av}`,
				// 				group: av,
				// 				color: '#fdd835',
				// 				data: dataChart
				// 					.filter(item => item.LopID === lopID && item.KetQuaDanhGia_VI.includes('Not Meeting Requirements'))
				// 					.map(item => item.TyLeChinhSua)
				// 			},
				// 			{
				// 				name: `Đạt ${khoiValue}${av}`,
				// 				group: av,
				// 				color: '#a5d6a7',
				// 				data: dataChart
				// 					.filter(item => item.LopID === lopID && item.KetQuaDanhGia_VI.includes('Meeting Requirements / Đạt'))
				// 					.map(item => item.TyLeChinhSua)
				// 			},
				// 			{
				// 				name: `Vượt đạt ${khoiValue}${av}`,
				// 				group: av,
				// 				color: '#1b5e20',
				// 				data: dataChart
				// 					.filter(item => item.LopID === lopID && item.KetQuaDanhGia_VI.includes('Exceeding'))
				// 					.map(item => item.TyLeChinhSua)
				// 			}
				// 		];
				// 	})
				// };
			}
	
		},
	}
</script>