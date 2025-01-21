<template>
	<div>
		<v-divider></v-divider>
		<v-list lines="two">
			<v-list-subheader>Danh sách chủ đề</v-list-subheader>
			<div v-for="(nhomDiem, index) in DSNhomDiem">
				<v-list-item :title="nhomDiem.TenNhomCotDiem_VI"
					@click="() => redirect('/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?hsid=' + nhomDiem.HocSinhID +'&mnd=' + nhomDiem.MaNhomCotDiem )">
					<template v-slot:prepend>
						<v-avatar>
							<v-img src="/_cdn/lhbs-lms/icon_tieng_anh/icon_tieng_anh.png" :cover="false" />
						</v-avatar>
					</template>
				</v-list-item>
				<v-divider v-if="index !== DSNhomDiem.length - 1" inset></v-divider>
			</div>
		</v-list>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			DSNhomDiem: []
		}
	},
	mounted() {
		ajaxCALL('lms/PH_TA_MaNhomDiem_Get_By_HocSinhID',
			{
				HocSinhID: vueData.HocSinhSelected.StudentID
			},
			res => {
				this.DSNhomDiem = res.data
			}
		)
	},
	computed: {},
	watch: {},
	methods: {
		redirect
	},
}
</script>