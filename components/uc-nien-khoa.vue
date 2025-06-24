<template>
	<!-- v-if="vueData.user.UserID == 'NA0000022' -->
	<div  :class="[classCustom ? 'px-0' : 'bg-white pa-3 mx-1 rounded d-flex justify-space-between align-center']">
		<p v-if="isShowTitle">Niên khóa:</p> 
		<v-menu>
			<template v-slot:activator="{ props: menu }">
				<v-tooltip location="top">
					<template v-slot:activator="{ props: tooltip }">
						<v-btn color="primary" variant="tonal" v-bind="mergeProps(menu, tooltip)" :loading="isLoading">
							{{ vueData.NienKhoa}}
						</v-btn>
					</template>
					<span>Chọn niên khóa</span>
				</v-tooltip>
			</template>
			<v-list>
				<v-list-subheader>Niên khóa</v-list-subheader>
				<v-list-item v-for="(item, index) in DSNienKhoa" :key="index" :value="index">
					<v-list-item-title @click="selectedNienKhoa(item)"> {{ item.NienKhoa }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
	</div>
</template>

<script>
	export default {
		props: {
			isShowTitle: {
				type: Boolean,
				default: true
			},
			classCustom:{
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				vueData,
				DSNienKhoa: [],
				isLoading: false
			}
		},
		created() {
			vueData.NienKhoa = null
		},
		mounted() {
			this.NienKhoa_Get()
		},
		computed: {
		},
		methods: {
			mergeProps(menu, tooltip) {
				return Vue.mergeProps(menu, tooltip)
			},
			async NienKhoa_Get() {
				this.isLoading = true
				let res = await new Promise((resolve, reject) => {
					ajaxCALL('lms/NienKhoa_Get', {}, res => {
						resolve(res)
					}, err => {
						reject(err)
					})
				})
				if (res.data.length > 0) {
					this.DSNienKhoa = res.data
					vueData.NienKhoa = res.data.filter(item => item.IsActive==1)[0].NienKhoa
					localStorage.setItem("NienKhoa", vueData.NienKhoa)
				}
				this.isLoading = false
			},
			selectedNienKhoa(item) {
				vueData.NienKhoa = item.NienKhoa
				localStorage.setItem("NienKhoa", vueData.NienKhoa)
			}
		}
	}
</script>