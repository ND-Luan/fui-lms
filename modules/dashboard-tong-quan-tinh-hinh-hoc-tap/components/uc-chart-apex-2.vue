<template>
	<div>
		<div id="chart"></div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				inputData: [
					{ x: 10, y: 10 },
					{ x: 9.5, y: 20 },
					{ x: 9, y: 30 },
				],
				bandwidth: 0.5, // Chỉnh sửa giá trị băng thông nếu cần
				range: _.range(0, 20, 0.1), // Giới hạn cho KDE
				kdeData: [],
			};
		},
		mounted() {
			this.calculateKDE();
			this.renderChart();
		},
		methods: {
			gaussianKernel(x) {
				return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
			},
			calculateKDE() {
				const data = this.inputData.map(point => point.x); // Lấy giá trị x từ inputData
				const bandwidth = this.bandwidth;
	console.log(data)
				this.kdeData = this.range.map(x => {
					const density = data.reduce((sum, xi) => {
						const kernelValue = this.gaussianKernel((x - xi) / bandwidth);
						return sum + kernelValue;
					}, 0);
					return { x, y: density / (data.length * bandwidth) };
				});
			},
			renderChart() {
				const options = {
					series: [
						{
							name: "KDE",
							data: this.kdeData,
						},
					],
					chart: {
						type: "line",
						height: 350,
					},
					xaxis: {
						title: {
							text: "X Values",
						},
					},
					yaxis: {
						title: {
							text: "Density",
						},
					},
					title: {
						text: "KDE Chart",
						align: "center",
					},
				};
	
				const chart = new ApexCharts(document.querySelector("#chart"), options);
				chart.render();
			},
		},
	}
</script>

<style>
	#chart {
		max-width: 650px;
		margin: 35px auto;
	}
</style>