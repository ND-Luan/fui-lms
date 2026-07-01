<template>
	<uc-chart-apex :options="Chart_KyNang" />
</template>

<script>
	export default {
		data() {
		return {}
	},
	computed: {
		Chart_KyNang() {
			const themes     = vueData.DSThemeNumber ?? []
			const activities = vueData.activities   ?? []
			const theme0     = themes[0]
			const theme1     = themes[1]

			const dataFor = (theme) => theme
				? activities.filter(a => a.MaNhomCotDiem === theme.value && a.label !== 'Total').map(a => a.score)
				: []

			const categoriesFor = (theme) => theme
				? activities.filter(a => a.MaNhomCotDiem === theme.value).map(a => a.label).filter(l => l !== 'Total')
				: []

			return {
				series: [
					{ name: theme0?.title, data: dataFor(theme0) },
					{ name: theme1?.title, data: dataFor(theme1) },
				],
				chart: {
					height: 350,
					type: 'radar',
					dropShadow: { enabled: true, blur: 1, left: 1, top: 1 },
					toolbar: { show: false },
				},
				grid: {
					padding: { top: 0, right: 20, bottom: 0, left: 20 },
				},
				stroke: { width: 2 },
				fill:   { opacity: 0.1 },
				markers: {
					size: 2,
					hover: { size: 4 },
				},
				xaxis: {
					categories: categoriesFor(theme0),
				},
				dataLabels: {
					enabled: true,
					background: { enabled: true, borderRadius: 1 },
				},
			}
		},
	},
	}
</script>