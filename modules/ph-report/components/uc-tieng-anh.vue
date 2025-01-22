<template>
	<div>
		<v-divider></v-divider>
		<v-skeleton-loader v-if="IsLoading" type="heading"></v-skeleton-loader>
		<v-skeleton-loader v-if="IsLoading" type="list-item-two-line" v-for="i in 6">
		</v-skeleton-loader>
		<v-fade-transition>
			<v-list lines="two" v-if="!IsLoading">
				<v-list-subheader>Danh sách chủ đề</v-list-subheader>
				<div v-for="(nhomDiem, index) in DSNhomDiem">
					<v-list-item :title="nhomDiem.TenNhomCotDiem_VI" @click="onRedirect(nhomDiem)">
						<template v-slot:prepend>
							<v-avatar>
								<v-img src="/_cdn/lhbs-lms/icon_tieng_anh/icon_tieng_anh.png" :cover="false" />
							</v-avatar>
						</template>
					</v-list-item>
					<v-divider v-if="index !== DSNhomDiem.length - 1" inset></v-divider>
				</div>
			</v-list>
		</v-fade-transition>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			DSNhomDiem: [],
			IsLoading: false
		}
	},
	mounted() {
		this.IsLoading = true
		ajaxCALL('lms/PH_TA_MaNhomDiem_Get_By_HocSinhID',
			{
				HocSinhID: vueData.HocSinhSelected.StudentID
			},
			res => {
				this.DSNhomDiem = res.data
				this.IsLoading = false
			}
		)
	},
	computed: {},
	watch: {},
	methods: {
		onRedirect(nhomDiem) {
			openWindow({
				title: "Tiếng anh",
				url: '/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?hsid=' + nhomDiem.HocSinhID + '&mnd=' + nhomDiem.MaNhomCotDiem
			})
		},
		openWindow,
		redirect
	},
}
</script>