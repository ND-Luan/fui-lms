<template>
	<v-dialog v-model="isShow" max-width="400">
		<v-card>
			<v-card-title>
				Cập nhật tên tiếng anh
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" variant="text" size="small" @click="onCloseModalEditProfile" />
			</v-card-title>
			<v-card-text>
				<v-form>
					<v-row>
						<v-col cols="6">
							<v-text-field v-model="StudentProfile_Comp.HocSinhID" label="Mã học sinh" disabled />
						</v-col>
						<v-col cols="6">
							<v-text-field v-model="StudentProfile_Comp.HoTen" label="Họ tên học sinh" disabled />
						</v-col>
						<v-col>
							<v-text-field v-model="StudentProfile_Comp.EnglishName" label="English Name" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="onSave" color="primary" variant="outlined">Cập nhật</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			modelValue: Boolean,
			StudentProfile: Object,
			onSubmitFinish: Function
		},
		data() {
			return {
				vueData,
				isShow: false,
				StudentProfile_Comp: null
			}
		},
		mounted() { },
		computed: {},
		watch: {
			modelValue: function (isShow) {
				this.isShow = isShow
				if (isShow) this.StudentProfile_Comp = this.StudentProfile
			}
		},
		methods: {
			onCloseModalEditProfile() {
				this.$emit("update:StudentProfile", {})
				this.$emit("update:modelValue", false)
			},
			onSave() {
				const $this = this
				confirm({
					title: "Xác nhận cập nhật tên tiếng anh cho học sinh " + $this.StudentProfile.HoTen,
					action: async function () {
						const x = await fetchPromise("lms/HocSinh_Upd", {
							HocSinhID: $this.StudentProfile.HocSinhID,
							Ho: $this.StudentProfile.Ho,
							Ten: $this.StudentProfile.Ten,
							NgaySinh: $this.StudentProfile.NgaySinh,
							Nu: $this.StudentProfile.Nu,
							TinhTrang: $this.StudentProfile.TinhTrangQLHS,
							EnglishName: $this.StudentProfile.EnglishName,
						})
						if (x) {
							Vue.$toast.success("Cập nhật tên tiếng anh học sinh thành công!", { position: "top" })
							$this.onCloseModalEditProfile()
							$this.$emit('onSubmitFinish')
						}
	
					},
					cancel: function () {
						$this.onCloseModalEditProfile()
					},
				})
			}
		},
	}
</script>