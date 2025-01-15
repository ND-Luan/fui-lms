<template>
	<canvas ref="myChart"></canvas>
</template>

<script>
	export default {
		props: ["modelValue", "data", "type", "options", "plugins", "reverseData"],
		data: function () {
			return {
				myChart: null,
				config: {
					type: this.type,
					data: this.data,
					options: this.options,
					plugins: this.plugins
				}
			}
		},
		mounted() {
			this.buildChart(this);
		},
		watch: {
			data: {
				deep: true,
				handler(newValue) {
					if (newValue) {
						this.myChart.destroy();
						this.config.data = newValue;
						this.buildChart(this);
					}
				}
			}
		},
		updated() {
		},
		methods: {
			buildChart(self) {
				// if (self.reverseData && self.config.data.labels) self.config.data.labels = _.reverse(self.config.data.labels);
				// _.forEach(self.config.data.datasets, function (v, k) {
				// 	if (self.reverseData && v.data) v.data = _.reverse(v.data);
	
				// 	// if (self.config.type == 'line') {
				// 		// if (!v.borderColor) v.borderColor = COLORS[k % COLORS.length];
				// 		// if (!v.backgroundColor) v.backgroundColor = CHART_COLORS[k % CHART_COLORS.length];
				// 	// } else if (!v.backgroundColor) v.backgroundColor = CHART_COLORS;
				// });
				// console.log("self.config", self.config)
				self.myChart = Vue.shallowRef(new ChartBoxPlot.BoxPlotChart(self.$refs.myChart, self.config))
				// self.myChart = new Chart(self.$refs.myChart, self.config)
				this.$emit('update:modelValue', self.myChart)
			},
		}
	}
</script>