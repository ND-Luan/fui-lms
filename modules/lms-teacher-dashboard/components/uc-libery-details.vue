<template>
	<v-dialog v-model="isOpen" width="1000" persistent>
		<v-card>
			<v-card-title class="border-b d-flex pe-0 text-wrap pa-0 card-title-libery-details">
				{{ title }}
				<v-spacer />
				<v-btn icon="mdi-close" @click="CloseModal"></v-btn>
			</v-card-title>
			<v-card-text class="px-2 py-3">

				<div class="d-flex mb-4 ga-2">
					<v-chip class="pe-0" variant="text" color="#7C3AED">{{ $t('message.Grade') }} {{ formData.KhoiID
						}}</v-chip>
					<v-chip class="pa-0" variant="text" color="#7C3AED">{{ formData.Tuan_HienThi }}</v-chip>
				</div>

				<v-form ref="formData">
					<v-row dense>
						<v-col cols="12" md="12">
							<v-text-field :label="$t('message.Title')" v-model="formData.Title" hide-details="auto"
								dense></v-text-field>
						</v-col>
						<v-col cols="12" md="12">
							<v-textarea v-if="$i18n.locale == 'en'"
								:label="formData.ResourceType == 'LESSON' ? 'Decriptions' : 'Instructions'"
								variant="outlined" density="compact" v-model="formData.Instructions" hide-details="auto"
								:rows="2"></v-textarea>
							<v-textarea v-else :label="formData.ResourceType == 'LESSON' ? 'Mô tả' : 'Hướng dẫn'"
								variant="outlined" density="compact" v-model="formData.Instructions" hide-details="auto"
								:rows="2"></v-textarea>
						</v-col>
						<v-col cols="12" md="12">
							<v-checkbox v-model="formData.IsPublic"
								:label="$i18n.locale == 'en' ? 'Public' : 'Chia sẻ bài tập'" hide-details="auto"
								dense />
						</v-col>
					</v-row>
				</v-form>
				<v-btn @click="onRedirectToASM(selectedLibery)" color="success" variant="outlined" size="small"
					class="mt-2"><v-icon class="me-1">mdi-file-document-outline</v-icon>{{ $t('message.ViewDetail') }}
					{{ formData.ResourceType == 'LESSON' ? ($i18n.locale ==
						'en' ? 'lesson' : 'bài học') : ($i18n.locale == 'en' ? 'assignment' : 'bài tập') }}
				</v-btn>
			</v-card-text>
			<div class="d-flex border-t px-2 pt-3 ga-2" style="flex-wrap: wrap;"
				v-if="formData?.AssignedClassNames?.split(',').length > 0 && selectedLibery?.Is_AssignedToClass == 1">
				<b>{{ $t('message.ListClassAssigned') }} {{ formData.ResourceType == 'LESSON' ? ($i18n.locale ==
					'en' ? 'lesson' : 'bài học') : ($i18n.locale == 'en' ? 'assignment' : 'bài tập')
				}} </b>
				<!-- <v-chip v-for="lop in formData?.AssignedClassNames?.split(',')" color="primary" size="small">
					{{ lop }}
				</v-chip> -->
			</div>
			<div class="mt-3"
				v-if="selectedLibery?.AssignedClassNames?.length > 0 && formData.ResourceType != 'LESSON'">
				<v-data-table :headers="headersAssignedClass" :items="assignedClassList" :hide-default-footer="true">
					<template v-slot:item.TenHoacLopNhom="{ item }">
						<span @click="() => console.log('item', item)">{{ item.TenLopHoacNhom }}</span>
					</template>
					<template v-slot:item.DueDate="{ item, index }">
						<div class="text-center d-flex ga-2 justify-center align-center">
							<v-text-field v-if="editDialog[getIndexToEdit(item)]" :clearable="false" density="compact"
								class="my-2" v-model="editData[getIndexToEdit(item)].DueDate" label="Hạn nộp"
								type="datetime-local" variant="outlined" :min="getNow()">
								<template v-slot:append-inner>
									<v-icon @click="saveEditAssign(item)" color="success" icon="mdi-check" />
								</template>
							</v-text-field>
							<span v-if="!editDialog[getIndexToEdit(item)]">{{ formatDate(item.DueDate) }}</span>
							<v-btn v-if="!editDialog[getIndexToEdit(item)]" icon="mdi-pencil" size="x-small"
								variant="text" color="primary" @click="openEditAssignedDialog(item)" />
						</div>
					</template>
					<template v-slot:item.LimitAssigned="{ item }">
						<div class="text-center d-flex ga-2 align-center justify-center w-100">
							<v-text-field v-if="editDialogLimitAssigned[getIndexToEdit(item)]" :clearable="false"
								density="compact" class="my-2"
								v-model="editDataLimitAssigned[getIndexToEdit(item)].LimitAssigned"
								label="Số lần cho phép nộp" variant="outlined">
								<template v-slot:append-inner>
									<v-icon @click="saveEditLimitAssigned(item)" color="success" icon="mdi-check" />
								</template>
							</v-text-field>
							<span v-if="!editDialogLimitAssigned[getIndexToEdit(item)]">{{ item.LimitAssigned ?? '-'
							}}</span>
							<v-btn v-if="!editDialogLimitAssigned[getIndexToEdit(item)]" icon="mdi-pencil"
								size="x-small" variant="text" color="primary" :disabled="!item.Is_Full_Quiz"
								@click="openEditLimitAssigned(item)" />
						</div>
					</template>
					<template v-slot:item.MaxScore="{ item }">
						<span>{{ item.MaxScore ?? '—' }}</span>
					</template>
					<template v-slot:item.actions="{ item }">
						<v-btn style="font-weight: 500;" size="small" variant="outlined" color="primary"
							@click="editGiaoBaiTapDialog(item)">
							<v-icon start class="me-1">mdi-pencil</v-icon>{{ $t('message.EditContent') }}
						</v-btn>
					</template>
				</v-data-table>
			</div>
			<div class="mt-3"
				v-if="selectedLibery?.AssignedClassNames?.length > 0 && formData.ResourceType == 'LESSON'">
				<v-data-table
					:headers="headersAssignedClass.filter(i => !['DueDate', 'MaxScore', 'LimitAssigned'].includes(i.key))"
					:items="assignedClassList" :hide-default-footer="true">
					<template v-slot:item.TenHoacLopNhom="{ item }">
						<span @click="() => console.log('item', item)">{{ item.TenLopHoacNhom }}</span>
					</template>
					<template v-slot:item.actions="{ item }">
						<v-btn style="font-weight: 500;" size="small" variant="outlined" color="primary"
							@click="editGiaoBaiTapDialog(item)">
							{{ $t('message.EditContent') }}
						</v-btn>
					</template>
				</v-data-table>
			</div>
			<div class="border-t px-2 py-3" v-if="selectedLibery?.Is_AssignedToClass == 0">
				<v-chip color="primary">Bài tập đã giao cho {{ selectedLibery.AssignedClassCount }} học sinh</v-chip>
			</div>
			<v-card-actions class="border-t">
				<v-spacer></v-spacer>
				<v-btn @click="onSave()" variant="outlined" color="primary"><v-icon
						class="me-1">mdi-content-save-outline</v-icon>{{
							$t('message.Update') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

</template>
<script>
export default {
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	props: ["selectedLibery", "isOpen"],
	emits: ["update:isOpen", 'update:selectedLibery'],
	data() {
		return {
			formData: {},
			editDialog: [],
			editDialogLimitAssigned: [],
			editDataLimitAssigned: [],
			editData: [],
			editIndex: null,
			statusItems: [
				{ text: 'Đã giao', value: 1 },
				{ text: 'Đang khóa', value: 0 }
			],
			headersAssignedClass: [
				{ title: this.$i18n.locale == 'en' ? 'Class' : 'Lớp', value: 'TenLopHoacNhom', key: 'TenLopHoacNhom', sortable: false },
				{ title: this.$i18n.locale == 'en' ? 'Due date' : 'Hạn nộp', value: 'DueDate', align: 'center', key: 'DueDate', sortable: false },
				{ title: this.$i18n.locale == 'en' ? 'Limit assign' : 'Giới hạn lần nộp', value: 'LimitAssigned', align: 'center', key: 'LimitAssigned', sortable: false },
				{ title: this.$i18n.locale == 'en' ? 'Max score' : 'Điểm tối đa', value: 'MaxScore', align: 'center', key: 'MaxScore', sortable: false },
				{ title: this.$i18n.locale == 'en' ? 'Action' : 'Thao tác', value: 'actions', align: 'center', sortable: false, key: 'actions', sortable: false, width: 100 },
			],
		}
	},
	computed: {
		title: function () {
			return this.selectedLibery.Title
		},
		assignedClassList() {
			const raw = this.selectedLibery?.AssignedDetails;
			// TH1: backend trả mảng object (hiếm)
			if (Array.isArray(raw)) {
				let dataReturn = raw.map(n => ({
					AssignToClassID: n?.AssignToClassID,
					AssignToStudentID: n?.AssignToStudentID,
					AssignmentID: n?.AssignmentID,
					LopID: n?.TenLopHoacNhom,
					TenLopHoacNhom: n?.TenLopHoacNhom,
					DueDate: n?.DueDate ?? null,
					MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
					ResourceType: n?.ResourceType,
					ResourceID: n?.ResourceID,
					LimitAssigned: n?.LimitAssigned,
					Is_AssignedToClass: n?.Is_AssignedToClass,
					Is_Full_Quiz: n?.Is_Full_Quiz ?? false
				}))
				this.editData = dataReturn
				this.editDataLimitAssigned = dataReturn
				return dataReturn
			}
			// TH2: backend trả CHUỖI JSON (trường hợp của bạn)
			if (typeof raw === 'string' && raw.trim()) {
				try {
					const arr = JSON.parse(raw);
					if (Array.isArray(arr)) {
						let dataReturn = arr.map(n => ({
							AssignToClassID: n?.AssignToClassID,
							AssignToStudentID: n?.AssignToStudentID,
							LopHoacNhomID: n?.LopHoacNhomID,
							AssignmentID: n?.AssignmentID,
							TenLopHoacNhom: n?.TenLopHoacNhom,
							LopID: n?.LopHoacNhomID,
							DueDate: n?.DueDate ?? null,
							MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
							ResourceType: n?.ResourceType,
							ResourceID: n?.ResourceID,
							LimitAssigned: n?.LimitAssigned,
							Is_AssignedToClass: n?.Is_AssignedToClass,
							Is_Full_Quiz: n?.Is_Full_Quiz ?? false
						}))
						this.editData = dataReturn
						this.editDataLimitAssigned = dataReturn
						return dataReturn
					}
				} catch (e) {
					console.warn('Parse AssignedDetails failed:', e);
				}
			}

			const names = this.selectedLibery?.AssignedClassNames;
			if (typeof names === 'string' && names.trim()) {
				return names.split(',').map(s => s.trim()).filter(Boolean)
					.map(TenLop => ({ TenLop, DueDate: null, MaxScore: null }));
			}

			return [];
		},
	},
	mounted() {

		this.$nextTick(() => {
			this.formData = { ...this.selectedLibery, IsPublic: !this.selectedLibery?.IsPublic ? false : true }
			console.log('assignedClassList', this.assignedClassList)
			console.log('this.formData', this.formData)
		})

	},
	watch: {
		editData: function (newVal) {
			console.log('newVal', newVal)
		}
	},
	methods: {
		getNow() {
			let date = dayjs().add(1, "minute").format("YYYY-MM-DDTHH:mm");
			return date
		},
		CloseModal() {
			this.$emit('update:isOpen', false)
		},
		async onSave() {
			const { valid } = await this.$refs.formData.validate()
			if (valid) {
				if (this.formData.ResourceType === 'LESSON') {
					ajaxCALL('lms/EL_Lesson_Save', {
						...this.formData,
						Description: this.formData.Instructions,
						LessonID: this.formData.ResourceID,
						NienKhoa: vueData.NienKhoa,
						IsPublic: this.formData.IsPublic ? 1 : 0,
					}, res => {
						this.$emit('update:selectedLibery', { ...this.formData })
						Vue.$toast.success('Cập nhật bài học thành công', { position: "top" })
						this.CloseModal()
					})
				} else {
					ajaxCALL('lms/EL_Assignment_Upd', {
						Title: this.formData.Title,
						AssignmentID: this.formData.ResourceID,
						Instructions: this.formData.Instructions,
						IsPublic: this.formData.IsPublic ? 1 : 0,
						NienKhoa: vueData.NienKhoa,
						LimitAssigned: this.formData.LimitAssigned ?? 1
					}, res => {
						this.$emit('update:selectedLibery', { ...this.formData })
						Vue.$toast.success('Cập nhật bài tập thành công', { position: "top" })
						this.CloseModal()
					})
				}
			}
		},
		async onToggleStatus(row) {
			const prev = row.Status // lưu trạng thái cũ (1/0)
			row._loading = true
			const payload = [row]

			try {
				ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
					AssignmentID: row.AssignmentID,
					JsonClassItems: payload
				}, (res) => {
					Vue.$toast.success("Thay đổi trạng thái thành công", { position: "top" });
					this.getAssignClass()
				});
			} catch (err) {
				row.Status = prev
				// (tùy chọn) báo lỗi
				Vue.$toast.error('Cập nhật trạng thái thất bại', { position: "top" })
				console.error(err)
			} finally {
				row._loading = false
			}
		},
		formatDate(dateStr) {
			if (!dateStr) return '—'
			const d = dayjs(dateStr)
			return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(dateStr)
		},
		openEditAssignedDialog(cls) {
			let index = this.getIndexToEdit(cls)
			this.editData[index] = { ...cls } // clone dữ liệu để tránh thay đổi trực tiếp
			console.log('this.editData[index]', this.editData[index])
			this.editIndex = index
			this.editDialog[index] = true
		},
		openEditLimitAssigned(cls) {
			let index = this.getIndexToEdit(cls)
			this.editDataLimitAssigned[index] = { ...cls } // clone dữ liệu để tránh thay đổi trực tiếp
			this.editIndex = index
			this.editDialogLimitAssigned[index] = true
		},
		editGiaoBaiTapDialog(item) {
			if (item?.ResourceType == "ASSIGNMENT") {
				if (item.Is_AssignedToClass === 1) {
					this.iframeRef.value.openWindow({
						title: "Sửa bài tập",
						url: `/lms_tc_asm_builder?AssignmentID=${item?.AssignmentID}&AssignToClassID=${item?.AssignToClassID}`,
						onclose: () => vueData.apiCall3()
					});
				} else {
					this.iframeRef.value.openWindow({
						title: "Sửa bài tập",
						url: `/lms_tc_asm_builder?AssignmentID=${item?.AssignmentID}&AssignToStudentID=${item?.AssignToStudentID}`,
						onclose: () => vueData.apiCall3()
					});
				}

			}
			else if (item?.ResourceType == "LESSON") {
				this.iframeRef.value.openWindow({
					title: "Sửa bài học",
					url: `lms_tc_lesson_builder?LessonID=${item?.ResourceID}`,
					onclose: () => vueData.apiCall3()
				});
			}
		},
		async saveEditAssign(item) {
			let index = this.getIndexToEdit(item)
			if (index != null) {
				// sửa chuẩn ngày hết hạn
				this.editData[index].DueDate = this.getDue({
					date: dayjs(this.editData[index].DueDate).format('YYYY-MM-DD'),
					time: dayjs(this.editData[index].DueDate).format('HH:mm')
				});

				ajaxCALL("/lms/EL_Teacher_AssignToClass_Upd_ByAssignToClassID", {
					AssignToClassID: this.editData[index].AssignToClassID,
					DueDate: this.editData[index].DueDate,
					LimitAssigned: this.editData[index].LimitAssigned
				}, (res) => {
					this.snackbarRef.value.showSnackbar({ message: 'Sửa ngày thành công', color: 'success' })
					this.$emit('update:selectedLibery', { ...this.selectedLibery, AssignedDetails: this.editData })
					// vueData.apiCall3()
				},
					err => {
						// xử lý khi lỗi
						this.snackbarRef.value.showSnackbar({ message: err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', color: 'error' })
					}
				);

			}
			this.editDialog[index] = false
		},
		async getAssignClass() {
			this.$emit('update:selectedLibery', { ...this.formData })
		},
		getDue(d) {
			if (!d.date || !d.time) return null;

			const dateObj = dayjs(d.date); // parse ISO date
			const [hour, minute] = d.time.split(':').map(Number);

			return dateObj
				.hour(hour)
				.minute(minute)
				.second(0)
				.format('YYYY-MM-DD HH:mm:ss');
		},
		onRedirectToASM(item) {
			let url = null
			if (item.ResourceType === 'ASSIGNMENT') {
				url = `/lms_tc_asm_builder?AssignmentID=${item.AssignmentID}`
			} else if (item.ResourceType === 'LESSON') {
				url = `/lms_tc_lesson_builder?LessonID=${item.ResourceID}`
			}
			this.iframeRef.value.openWindow({
				title: item.Title,
				url,
			});
		},
		saveEditLimitAssigned(item) {
			let index = this.getIndexToEdit(item)
			if (index != null) {
				ajaxCALL("/lms/EL_Teacher_AssignToClass_Upd_ByAssignToClassID", {
					AssignToClassID: this.editDataLimitAssigned[index].AssignToClassID,
					DueDate: this.editDataLimitAssigned[index].DueDate,
					LimitAssigned: this.editDataLimitAssigned[index].LimitAssigned
				}, (res) => {
					this.snackbarRef.value.showSnackbar({ message: 'Sửa số lần cho phép nộp thành công', color: 'success' })
					this.$emit('update:selectedLibery', { ...this.selectedLibery, AssignedDetails: this.editDataLimitAssigned })
					// vueData.apiCall3()
				},
					err => {
						// xử lý khi lỗi
						this.snackbarRef.value.showSnackbar({ message: err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', color: 'error' })
					}
				);

			}
			this.editDialogLimitAssigned[index] = false
		},
		getIndexToEdit(item) {
			let index = this.assignedClassList.findIndex(cls => cls.AssignToClassID === item.AssignToClassID)
			return index
		}
	}
}
</script>