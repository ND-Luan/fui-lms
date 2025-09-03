<template>
	<v-dialog v-model="vueData.isOpenModalEditProfile" width="800">
		<v-card>
			<v-card-title class="bg-primary">
				<p class="text-white">
					Cập nhật tên tiếng anh
				</p>
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" variant="text" size="small" @click="onCloseModalEditProfile"></v-btn>
			</v-card-title>
			<v-card-text>
				<v-form>
					<v-row>
						<v-col cols="6">
							<v-text-field v-model="vueData.StudentProfile.HocSinhID" label="Mã học sinh"
								disabled></v-text-field>
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="vueData.StudentProfile.HoTen" label="Họ tên học sinh"
								disabled></v-text-field>
						</v-col>
						<v-col>
							<v-text-field v-model="vueData.StudentProfile.EnglishName"
								label="English Name"></v-text-field>
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn variant="text" @click="onSave" color="primary">Cập nhật</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onCloseModalEditProfile() {
				vueData.StudentProfile = {}
				vueData.isOpenModalEditProfile = false
			},
			onSave() {
				const $this = this
				confirm({
					title: "Xác nhận cập nhật tên tiếng anh cho học sinh " + vueData.StudentProfile.HoTen,
					action: function () {
						ajaxCALL('/lms/HocSinh_Upd', {
							HocSinhID: vueData.StudentProfile.HocSinhID,
							Ho: vueData.StudentProfile.Ho,
							Ten: vueData.StudentProfile.Ten,
							NgaySinh: vueData.StudentProfile.NgaySinh,
							Nu: vueData.StudentProfile.Nu,
							TinhTrang: vueData.StudentProfile.TinhTrangQLHS,
							EnglishName: vueData.StudentProfile.EnglishName,
						},res => {
							Vue.$toast.success("Cập nhật tên tiếng anh học sinh thành công!",{position:"top"})
							$this.onCloseModalEditProfile()
							CALL("onRefresh")
						})
					},
					cancel: function () {
						$this.onCloseModalEditProfile()
					},
				})
			}
		},
	}
</script>