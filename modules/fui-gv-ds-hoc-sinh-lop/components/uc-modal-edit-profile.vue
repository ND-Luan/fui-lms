<template>
	<v-dialog v-model="isShow" max-width="420" persistent>
		<v-card elevation="4">

			<!-- Header -->
			<v-toolbar color="primary" density="compact" flat>
				<v-icon class="ml-3 mr-2" size="18">mdi-translate</v-icon>
				<v-toolbar-title class="text-body-2 font-weight-semibold">Cập nhật tên tiếng Anh</v-toolbar-title>
				<v-spacer />
				<v-btn icon="mdi-close" variant="text" color="white" size="small" class="mr-1"
					@click="onCloseModalEditProfile" />
			</v-toolbar>

			<v-card-text class="pa-4">

				<!-- Student Info -->
				<div class="d-flex align-center ga-3 mb-4 pb-4" style="border-bottom: 1px solid rgba(0,0,0,0.08)">
					<v-avatar size="40" class="flex-shrink-0">
						<v-img :src="vueData.v_Set?.urlAvatarHocSinh + StudentProfile_Comp.HocSinhID" />
					</v-avatar>
					<div>
						<div class="text-body-2 font-weight-bold">{{ StudentProfile_Comp.HoTen }}</div>
						<div class="text-caption text-medium-emphasis">{{ StudentProfile_Comp.HocSinhID }}</div>
					</div>
				</div>

				<!-- English Name Field -->
				<v-text-field v-model="StudentProfile_Comp.EnglishName" label="English Name"
					prepend-inner-icon="mdi-alphabetical-variant" variant="outlined" density="comfortable"
					hide-details="auto" clearable />
			</v-card-text>

			<v-divider />

			<!-- Actions -->
			<v-card-actions class="px-4 py-3">
				<v-spacer />
				<v-btn variant="text" color="grey" @click="onCloseModalEditProfile">Huỷ</v-btn>
				<v-btn color="primary" variant="flat" rounded="0" prepend-icon="mdi-content-save-outline"
					@click="onSave">
					Cập nhật
				</v-btn>
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