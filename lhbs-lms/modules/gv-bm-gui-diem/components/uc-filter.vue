<template>
	<v-card>
		<v-card-title class="text-primary px-0 pt-0">{{vueData.TitlePage}} {{vueData.TitleCap ? ('- ' +
			vueData.TitleCap) : '' }}</v-card-title>
		<v-row dense>
			<v-col>
				<v-select v-model="vueData.KhoiItem" label="Chọn khối" :items="vueData.DSKhoi" item-title="TenKhoiHoc"
					item-value="KhoiID" :return-object="true" />
			</v-col>
			<v-col>
				<v-select v-model="vueData.LopItem" label="Chọn lớp" :items="vueData.DSLop" item-title="TenLop"
					item-value="LopID" :return-object="true" />
			</v-col>
			<v-col>
				<v-select v-model="vueData.MonHocItem" label="Chọn môn học" :items="vueData.DSMonHoc"
					item-title="TenMonHoc_HienThi" item-value="MonHocID" :return-object="true" />
			</v-col>
			<v-col>
				<v-select v-model="vueData.MaNhomCotDiemItem" label="Chọn nhóm điểm" :items="vueData.DSNhomDiem"
					item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" :return-object="true" />
			</v-col>
			<v-col>
				<f-button label="Làm mới" variant="outlined" prepend-icon="mdi-refresh" :action="action" color="primary" />
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
	export default {
		props: [],
		data() {
			return { vueData, action: "HocSinhBangDiem_Get_ByMonHocID" }
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>