<template>
	<v-card>
		<v-card-title class="text-primary px-0">
			{{vueData.TitlePage}}
		</v-card-title>
	</v-card>
	<v-row dense>
		<v-col>
			<v-select v-model="vueData.HocKi" label="Chọn học kì" :items="vueData.DSHocKi" item-title="TenHocKi"
				item-value="HocKi" /></v-col>
		<v-col>
			<v-select v-model="vueData.KhoiID" label="Chọn khối" :items="vueData.DSKhoi" item-title="TenKhoiHoc"
				item-value="KhoiID" /></v-col>
		<v-col>
			<v-select v-model="vueData.MonHocItem" label="Chọn môn học" :items="vueData.DSMonHoc" item-title="MonHocName"
				item-value="MonHocID" :return-object="true" />
		</v-col>
		<v-col>
			<f-button label="Làm mới" variant="tonal" color="primary" :action="action" />
		</v-col>
	</v-row>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				action: [
					{
						"CALL": "getHocSinh"
					},
					{
						"CALL": "ThongKeDiemTheoCap_MaCotDiem"
					}
				]
			}
		},
		mounted() { },
		computed: {},
		watch: {
			'vueData.HocKi':function(val){
				if(val){
					vueData.KhoiID = null 
					vueData.MonHocItem = null
				}
			}
		},
		methods: {},
	}
</script>