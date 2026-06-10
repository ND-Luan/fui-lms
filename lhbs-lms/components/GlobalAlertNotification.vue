<template>
	<div>

	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				Alerts: []
			}
		},
		mounted() {
			this.onLoad()
		},
		computed: {},
		watch: {},
		methods: {
			async onLoad() {
				this.Alerts = await fetchPromise("lms/Alert_Get", { NienKhoa: vueData.NienKhoa })
			}
		},
	}
</script>