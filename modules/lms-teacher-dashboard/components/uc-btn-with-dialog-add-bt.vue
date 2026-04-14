<template>
	<v-dialog v-model="isOpen" max-width="500">
		<v-card>
			<v-card-title class="d-flex align-center">
				{{ $t('message.CreateContent') }} - {{ $t('message.Grade') }} {{ KhoiItem.KhoiID
				}}
				<v-spacer />
				<v-icon @click="CloseModal()">mdi-close</v-icon>
			</v-card-title>
			<v-card-text>
				<v-form ref="form">
					<v-row>
						<v-col cols="12">
							<!-- Thông tin Khối - Môn (bên trái) -->
							<div class="d-flex align-center">
								<v-avatar :color="getSubjectColor(KhoiItem?.MonHocName)" size="40" class="mr-4">
									<v-icon color="white">{{ getSubjectIcon(KhoiItem?.MonHocName) }}</v-icon>
								</v-avatar>
								<div>
									<div class="text-overline">{{ $t('message.Grade') }} {{ KhoiItem.KhoiID
									}}</div>
									<div class="text-h6">{{ $i18n.locale == 'en' && KhoiItem?.MonHocName == 'Ngoại ngữ'
										? 'English' : KhoiItem?.MonHocName }}</div>
								</div>
							</div>
						</v-col>
						<v-col cols="12">
							<v-select :items="typeItems" item-title='text' item-value='value' v-model="form.type"
								:label="$t('message.ChooseContent')" />
						</v-col>
						<v-col cols="12">
							<v-select :items="DSTuan" item-title='Tuan_HienThi' item-value='TuanHocID'
								v-model="form.TuanHocID" :label="$t('message.ChooseWeek')" />
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="form.Chuong" :label="$t('message.Chapter')" />
						</v-col>
						<v-col cols="12">
							<v-text-field v-model="form.Title" :label="$t('message.Title')" required
								:rules="[v => !!v || 'Vui lòng nhập tiêu đề']" />
						</v-col>
						<v-col cols="12">
							<v-text-field v-if="form.type == 1" v-model="form.Description"
								:label="$t('message.Decriptions')" />
							<v-text-field v-else v-model="form.Instructions" :label="$t('message.Instructions')" />
						</v-col>

					</v-row>
				</v-form>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn @click="CloseModal" :text="$t('message.Close')" />
				<v-btn @click="handleSubmit()" color="primary" variant="elevated" :text="$t('message.Create')" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	emits: ['update:isOpen'],
	props: {
		KhoiItem: Object,
		isOpen: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		return {
			form: {
				Title: "",
				Instructions: "",
				Description: "",
				TuanHocID: null,
				Chuong: "",
				type: 1
			},
			typeItems: [
				{ text: this.$i18n.locale == 'en' ? 'Create lesson' : 'Tạo bài học', value: 1 },
				{ text: this.$i18n.locale == 'en' ? 'Create assignment' : 'Tạo bài tập', value: 0 }
			],
			vueData,
		}
	},
	mounted() { },
	computed: {
		DSTuan: function () {
			this.form.TuanHocID = vueData.DSTuanHoc.find(tuan => tuan.Is_Active)?.TuanHocID
			return vueData.DSTuanHoc
		}

	},
	watch: {},
	methods: {
		clearData() {

			this.form.Title = ""
			this.form.Instructions = ""
			this.form.Description = ""
			this.form.TuanHocID = null
			this.form.Chuong = ""
		},
		async handleSubmit() {

			const { valid } = await this.$refs.form.validate()

			if (!valid) {

				Vue.$toast.error("Vui lòng nhập đầy đủ thông tin", { position: "top" });
				return;
			}

			if (valid) {
				if (this.form.type == 0) {
					ajaxCALL('lms/EL_Assignment_Ins', {
						...this.form,
						MonHocID: this.KhoiItem.MonHocID,
						KhoiID: this.KhoiItem.KhoiID,
						NienKhoa: vueData.NienKhoa,
						HocKi: 1
					}, res => {
					this.snackbarRef.value.showSnackbar({ message: 'Tạo bài tập thành công', color: 'success' })
					this.clearData();
					this.CloseModal();

					this.iframeRef.value.openWindow({
						title: "Soạn bài tập",
						url: `/lms_tc_asm_builder?AssignmentID=${res?.data[0].AssignmentID}`,
						onclose: () => vueData.apiCall3()
						});
					},
						err => {
							// xử lý khi lỗi
							Vue.$toast.error(err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', { position: "top" });
						}
					)
				}
				else {
					ajaxCALL('lms/EL_Lesson_Save', {
						...this.form,
						MonHocID: this.KhoiItem.MonHocID,
						KhoiID: this.KhoiItem.KhoiID,
						NienKhoa: vueData.NienKhoa,
						HocKi: 1,
						Status: 1
					}, res => {
						Vue.$toast.success('Tạo bài học thành công', { position: "top" })
						this.clearData();
						this.CloseModal();
						openWindow({
							title: "Soạn bài học",
							url: `lms_tc_lesson_builder?LessonID=${res?.data[0].LessonID}`,
							id: "WinSoanBaiGiang",
							onclose: {
								"EXE": "apiCall3()"
							}
						});
					},
						err => {
							// xử lý khi lỗi
							Vue.$toast.error(err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', { position: "top" });
						})
				}
			}
		},
		getSubjectIcon(subjectName) {
			const name = (subjectName || '').toLowerCase();
			if (name.includes('toán')) return 'mdi-calculator-variant';
			if (name.includes('tin học') || name.includes('robotics')) return 'mdi-robot-industrial';
			if (name.includes('văn') || name.includes('việt')) return 'mdi-book-open-page-variant';
			if (name.includes('anh')) return 'mdi-translate';
			if (name.includes('lý')) return 'mdi-atom';
			if (name.includes('hóa')) return 'mdi-flask';
			return 'mdi-school';
		},
		getSubjectColor(subjectName) {
			const name = (subjectName || '').toLowerCase();
			if (name.includes('toán')) return 'blue';
			if (name.includes('tin học') || name.includes('robotics')) return 'teal';
			if (name.includes('văn') || name.includes('việt')) return 'red';
			if (name.includes('anh')) return 'purple';
			if (name.includes('lý')) return 'indigo';
			if (name.includes('hóa')) return 'green';
			return 'grey';
		},
		CloseModal() {
			this.$emit('update:isOpen', false);
		}
	},
}
</script>