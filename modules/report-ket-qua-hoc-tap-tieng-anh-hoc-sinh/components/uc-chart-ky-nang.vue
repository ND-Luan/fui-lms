<template>
	<uc-chart-apex :options="Chart_KyNang" />
</template>

<script>
export default {
	props: [],
	data() {
		return {
			Chart_KyNang: {
				series: [{
					name: 'Series 1',
					data: [...vueData.skills.filter(item => vueData.HocSinhDetail.CapID == 2 ? true : item.isResultCB == 1).filter(x => x.label != 'Ngôn ngữ').map(item => vueData.HocSinhDetail.CapID == 2 ? item.percent+'%' : item.score)],
				}
			],
				toolbar: {
					show: false, // Ẩn toàn bộ toolbar
				},
				chart: {
					height: 350,
					type: 'radar',
					dropShadow: {
						enabled: true,
						blur: 1,
						left: 1,
						top: 1
					},
					toolbar: {
						show: false
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
					// text: vueData.tnd ?? ''
				},
				stroke: {
					width: 2
				},
				fill: {
					opacity: 0.1
				},
				markers: {
					size: 2,
					hover: {
						size: 4
					}
				},
				yaxis: {
					//	stepSize: 20,
					max: vueData.HocSinhDetail.CapID == 2 ? 100 : undefined
				},
				xaxis: {
					categories: vueData.skills.filter(item => vueData.HocSinhDetail.CapID == 2 ? true : item.isResultCB == 1).filter(x => vueData.HocSinhDetail.CapID == 2 ? (x.label != 'Ngôn ngữ') :(x.label !== 'Tổng') ).map(item => vueData.IsLanguage ? item.label_EN : item.label),
				},
				dataLabels: {
					enabled: true,
					background: {
						enabled: true,
						borderRadius: 1,
					}
				}
			},
		}
	},
	mounted() { },
	computed: {},
	watch: {},
	methods: {
		
	},
}
</script>