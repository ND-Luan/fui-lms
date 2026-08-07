<template>
	<v-dialog v-model="modelValue" max-width="700">
		<v-card>
			<v-card-title class="d-flex align-center">
				Sửa bài tập
				<v-spacer />
				<v-icon @click="$emit('update:modelValue', false)">mdi-close</v-icon>
			</v-card-title>
			<v-card-text>
				<v-form ref="form">
					<v-row>
						<v-col cols="12" md="7" class="d-flex flex-column" style="gap: 8px; align-self: flex-start">
							<v-text-field v-model="form.Title" label="Tiêu đề" />
							<v-text-field v-model="form.Instructions" label="Hướng dẫn" />
						</v-col>
						<v-col cols="12" md="5" class="ps-md-4">
							<uc-hoclieu-resource-selector-dashboard v-model="hocLieuLink"
								:khoi-id="form.KhoiID" :mon-hoc-id="form.MonHocID"
								:resource-type="form.ResourceType" :resource-id="resourceIdForMapping" />
						</v-col>
					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn @click="$emit('update:modelValue', false)" text="Đóng" />
				<v-btn @click="handleSubmit(isActive)" color="primary" variant="elevated" text="Sửa" />
			</v-card-actions>
		</v-card>

	</v-dialog>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		props: {
			modelValue: Boolean,
			item: Object,
			khoiid: Number,
			monhocid: Number
		},
		data() {
			return {
				form: {
					Title: "",
					Instructions: "",
				},
				hocLieuLink: {},
				vueData
			}
		},
		mounted() { },
		computed: {
			resourceIdForMapping() {
				return this.form.ResourceID || this.form.AssignmentID || this.form.LessonID
			}
		},
		watch: {
			modelValue: function (val) {
				if (val) {
					this.form = { ...this.item }
					this.hocLieuLink = {}
				}
			}
		},
		methods: {
			saveHocLieuLink(done) {
				const link = this.hocLieuLink || {}
				ajaxCALL('lms/EL_HocLieuResource_Save', {
					ResourceType: this.form.ResourceType,
					ResourceID: this.resourceIdForMapping,
					HocLieuID: link.HocLieuID || null,
					NoiDungID: link.NoiDungID || null,
				}, () => done())
			},
			async handleSubmit(isActive) {
				const { valid } = await this.$refs.form.validate()
				if (valid) {
					this.confirmMissingHocLieu(() => this.submitContent())
				}
			},
			confirmMissingHocLieu(onConfirmed) {
				const link = this.hocLieuLink || {}
				if (link.HocLieuID && link.NoiDungID) return onConfirmed()
				this.confirmRef.value.show({
					title: 'Bài chưa gắn mục lục học liệu số',
					text: 'Bạn vẫn có thể lưu bài, nhưng nên gắn vào mục lục học liệu số để thuận tiện truy xuất ngược và tái sử dụng bài này ở các niên khóa sau.',
					type: 'warning',
					confirmText: 'Vẫn lưu bài',
					cancelText: 'Quay lại gắn học liệu',
					maxWidth: 520
				}).then(ok => { if (ok) onConfirmed() })
			},
			submitContent() {
				if (this.form.ResourceType === 'LESSON') {
						ajaxCALL('lms/EL_Lesson_Save', {
							...this.form,
							Description: this.form.Instructions,
							LessonID: this.resourceIdForMapping,
							NienKhoa: vueData.NienKhoa
						}, res => {
							this.saveHocLieuLink(() => {
								this.snackbarRef.value.showSnackbar({ message: 'Cập nhật bài học thành công', color: 'success' })
								vueData.apiCall3()
								this.$emit('update:modelValue', false)
							})
						})
					} else {
						ajaxCALL('lms/EL_Assignment_Upd', {
							...this.form,
							AssignmentID: this.resourceIdForMapping,
							Instructions: this.form.Instructions,
							NienKhoa: vueData.NienKhoa
						}, res => {
							this.saveHocLieuLink(() => {
								this.snackbarRef.value.showSnackbar({ message: 'Cập nhật bài tập thành công', color: 'success' })
								vueData.apiCall3()
								this.$emit('update:modelValue', false)
							})
						})
				}
			}
		},
	}
</script>
