<template>
	<div>
		asdsd
		<uc-table />
    <uc></uc>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {}
		},
		mounted() {
			ajaxCALL('lms/NhomAV_Get',
				{ NienKhoa: 2025 },
				res => {
					console.log(res.data)
				})
		},
		computed: {},
		watch: {},
		methods: {},
	}
</script>