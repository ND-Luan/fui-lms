<template>
	<!-- <div>{{state}}</div> -->
	<!-- <div>{{arr}}</div> -->
	<div>{{isCheckStatus}}</div>
	<button @click="onAdd">CLICK</button>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				state: 0,
				isLoading: false,
				obj: {
					obj_1: {
	
					}
				},
				arr: []
			}
		},
		created() {
			console.log('CREATED...')
		},
		mounted() {
			// CALL API
			// Xử lý logic
			console.log('MOUNTED...')
		},
		//Lắng nghe 1 biến 
		watch: {
			// state: function (newVal, oldVal) {
			// 	console.log('WATCHING...', newVal, oldVal)
			// },
			// arr: function (val) {
			// 	console.log('watching arr...', val)
			// }
			arr: {
				handler(val) {
					console.log('watching arr...', val)
				},
				deep: true,
			}
		},
		computed: {
			// computed 2 cách getter settter / viết bth như watch có dữ liệu return
			isCheckStatus: function () {
				let flag = false
				this.arr = [1231231]
				return flag
			}
		},
		methods: {
			onAdd() {
				this.isCheckStatus = true
				// this.state += 1
				this.arr.push({ id: Math.random() })
			}
		},
	}
</script>