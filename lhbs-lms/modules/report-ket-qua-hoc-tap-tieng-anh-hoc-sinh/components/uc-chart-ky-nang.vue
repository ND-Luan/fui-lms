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
				const capID   = vueData.HocSinhDetail?.CapID
				const skills  = vueData.skills ?? []
				const filtered = skills
					.filter(item => capID === 2 ? true : item.isResultCB == 1)
					.filter(item => capID === 2 ? item.label !== 'Ngôn ngữ' : item.label !== 'Tổng')

				return {
					series: [{
						name: 'Series 1',
						data: filtered.map(item => capID === 2 ? item.percent + '%' : item.score),
					}],
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
					yaxis: {
						max: capID === 2 ? 100 : undefined,
					},
					xaxis: {
						categories: filtered.map(item => vueData.IsLanguage ? item.label_EN : item.label),
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