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
					name: vueData.DSThemeNumber[0]?.title,
					data: vueData.activities.filter(item => item.MaNhomCotDiem == vueData.DSThemeNumber[0].value).filter(x => x.label !== 'Total').map(item => item.score),
				},
				{
					name: vueData.DSThemeNumber[1]?.title,
					data: vueData.activities.filter(item => item.MaNhomCotDiem == vueData.DSThemeNumber[1].value).filter(x => x.label !== 'Total').map(item => item.score),
				}],
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
					//	stepSize: 20
				},
				xaxis: {
					categories: vueData.activities.filter(item => item.MaNhomCotDiem == vueData.DSThemeNumber[0].value).map(item => item.label).filter(x => x !== 'Total'),
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
	methods: {},
}
</script>