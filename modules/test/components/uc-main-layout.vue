<template>
	<Global>
		<v-btn @click="openPage">Mở trang</v-btn>
		<v-select />
		<GlobalDataTable :headers :items />
	</Global>
</template>

<script>
export default {
	inject: ['iframeRef'],
	data() {
		return {
			headers: [{ title: "xxx", value: "xxx" }],
			items: [{ xxx: "Nooijk dung 1" }]
		}
	},
	methods: {
		openPage() {
			this.iframeRef.value?.openWindow({
				title: 'Google',
				url: '/nhap-diem?capid=1',
				icon: 'mdi-google',
				onclose: () => console.log('đã đóng'),
			})
		},
		closePage() {
			this.iframeRef.value?.closeWindow()
		}
	}
}
</script>