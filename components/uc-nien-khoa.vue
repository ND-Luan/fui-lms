<template>
	<!-- v-if="vueData.user.UserID == 'NA0000022' -->
	<div :class="[classCustom ? 'px-0' : 'bg-white pa-3 mx-1 rounded d-flex justify-space-between align-center']">
		<p v-if="isShowTitle">Niên khóa:</p>
		<v-menu v-if="!isShowBottomSheet">
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
				<v-list-item v-for="(item, index) in DSNienKhoa" :key="index" :value="index"
					:class="vueData.NienKhoa === item.NienKhoa ? 'bg-primary' : ''">
					<v-list-item-title @click="selectedNienKhoa(item)"> {{ item.NienKhoa }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
		<v-bottom-sheet v-else v-model="sheet">
			<template v-slot:activator="{ props: activatorProps }">
				<v-btn v-bind="activatorProps" :text="vueData.NienKhoa?.toString()" color="primary" varriant="tonal"
					size="small" />
			</template>
			<v-list>
				<v-list-subheader>Niên khóa</v-list-subheader>
				<v-list-item v-for="(item, index) in DSNienKhoa" :key="index" :value="index"
					:class="vueData.NienKhoa === item.NienKhoa ? 'bg-primary' : ''">
					<v-list-item-title @click="()=> {selectedNienKhoa(item); sheet = false; }">
						{{ item.NienKhoa }} • {{item.TenLop}}
					</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-bottom-sheet>
	</div>
</template>

<script>
	export default {
		props: {
			isShowTitle: {
				type: Boolean,
				default: true
			},
			classCustom: {
				type: Boolean,
				default: false
			},
			dsnienkhoacustom: {
				type: Array,
				default: []
			},
			isShowBottomSheet: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				vueData,
				sheet: false,
				DSNienKhoa: [],
				isLoading: false
			}
		},
		created() {
			vueData.NienKhoa = null
		},
		watch: {
			dsnienkhoacustom: function (v) {
				this.DSNienKhoa = v
			}
		},
		async mounted() {
			if (this.dsnienkhoacustom.length > 0) {
			} else {
				this.NienKhoa_Get()
			}
		},
		computed: {
		},
		methods: {
			initComp() {
				console.log('run...', this.dsnienkhoacustom)
				let NienKhoaBefore = vueData.NienKhoa
				this.isLoading = true
	
				vueData.NienKhoa = this.dsnienkhoacustom.filter(item => item.IsActive == 1)[0].NienKhoa
				localStorage.setItem("NienKhoa", vueData.NienKhoa)
				this.isLoading = false
				console.log('this.DSNienKhoa', this.DSNienKhoa)
			},
			mergeProps(menu, tooltip) {
				return Vue.mergeProps(menu, tooltip)
			},
			async NienKhoa_Get() {
				console.log('call api..')
				let NienKhoaBefore = vueData.NienKhoa
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
					vueData.NienKhoa = res.data.filter(item => item.IsActive == 1)[0].NienKhoa
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