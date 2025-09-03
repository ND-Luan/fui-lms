<template>
	<v-dialog max-width="500">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="{ ...activatorProps, ...$attrs }" prepend-icon="mdi-plus-circle" color="primary"
				text="Tạo bài giảng mới" />
		</template>

		<template v-slot:default="{ isActive }">
			<v-card title="Tạo bài giảng mới">
				<v-card-text>
					<v-form ref="form">
						<v-row>
							<v-col cols="12"><v-text-field v-model="form.Title" label="Title" /></v-col>
							<v-col cols="12"><v-text-field v-model="form.Instructions" label="Instructions" /></v-col>
						</v-row>
					</v-form>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text="Đóng" @click="isActive.value = false"></v-btn>
					<v-btn text="Tạo" @click="onCreate(isActive)"></v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				form: {
					Title: '',
					Instructions: '',
				},
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			async onCreate(isActive) {
				const { valid } = await this.$refs.form.validate()
	
				console.log(this.$refs.form)
				if (valid) {
					ajaxCALL('lms/EL_Assignment_Ins', {
						...this.form,
						MonHocID: vueData.MonHocItem.MonHocID,
						KhoiID: vueData.KhoiItem.KhoiID,
						AssignmentConfig: '',
						NienKhoa: vueData.NienKhoa,
						HocKi: 1,
					}, res => {
						Vue.$toast.success('Thêm bài giảng thành công', { position: "top" })
						CALL('getLessonList')
						isActive.value = false
					})
				}
			}
		},
	}
</script>