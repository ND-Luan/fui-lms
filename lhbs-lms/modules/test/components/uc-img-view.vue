<template>
	<Global>
		<v-btn @click="onClick">CLICK</v-btn>
	</Global>
</template>

<script>
export default {
	methods: {
		onClick() {
			this.$root.$refs.iframeWin.openWindow({
				title: 'Google',
				url: 'https://google.com',
				icon: 'mdi-google',
				width: '1200px',
				height: '90vh',
				onclose: () => {
					console.log('Đã đóng cửa sổ')
				}
			})
		}
	}
}
</script>