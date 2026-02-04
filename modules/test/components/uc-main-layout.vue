<template>
	<Global>
		<div>{{data}}</div>
		<v-btn text="check" @click="getNienKhoa" />
		<v-btn text="clear cache" @click="getNienKhoa_disableCache" />
		<v-btn text="clear cache" @click="getNienKhoa_disableCache_withError" />
	</Global>
</template>

<script>
	export default {
		props: [],
		data() {
			return { data: [] }
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			async getNienKhoa() {
				this.data = await fetchPromise("lms/NienKhoa_Get", { params: 1 })
			},
			async getNienKhoa_disableCache() {
				this.data = await fetchPromise("lms/NienKhoa_Get", { params: 1 })
			},
			async getNienKhoa_disableCache_withError() {
				this.data = await fetchPromise("lms/NienKhoa_Get_2", { params: 1 })
			},
		}
	}
</script>