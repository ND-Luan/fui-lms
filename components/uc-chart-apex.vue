<template>
	<div :id="uniqueId"></div>
</template>

<script>
	export default {
		props: {
			modelValue: {},
			options: {
				type: Object
			}
		},
		data() {
			return {
				myChart: null,
				config: this.options,
				_
			}
		},
		mounted() {
			this.buildChart(this)
		},
		computed: {
			uniqueId() {
				return `chart-${_.uniqueId()}`; // Sử dụng _uid của Vue để tạo ID duy nhất
			}
		},
		watch: {
			options: function (newValue, oldValue) {
				const config = {
					...this.options,
					chart: this.options.chart,
					series: this.options.series,
					xaxis: this.options.xaxis,
					yaxis: this.options.yaxis,
				}
	
				if (this.myChart) {
					this.myChart.destroy()
					this.buildChart(this)
				}
			}
		},
		methods: {
			buildChart(self) {
				self.myChart = new ApexCharts(
					document.querySelector(`#${this.uniqueId}`), // Sử dụng ID động
					this.options
				);
				self.myChart.render();
				this.$emit('update:modelValue', self.myChart);
			}
		},
	}
</script>