<template>
	<v-dialog v-model="isOpen" width="800" persistent>
		<v-card>
			<v-card-title class="border-b d-flex pe-0">
				{{ title }}
				<v-spacer />
				<v-btn icon="mdi-close" @click="CloseModal"></v-btn>
			</v-card-title>
			<v-card-text class="px-2 py-3">

				<div class="d-flex mb-4 ga-2">
					<v-chip color="orange">{{ formData.TenKhoi }}</v-chip>
					<v-chip color="pink">{{ formData.Tuan_HienThi }}</v-chip>
				</div>

				<v-form ref="formData">
					<v-row dense>
						<v-col cols="12" md="12">
							<v-text-field label="Tiêu đề" v-model="formData.Title" hide-details="auto"
								dense></v-text-field>
						</v-col>
						<v-col cols="12" md="12">
							<v-textarea :label="formData.ResourceType == 'LESSON' ? 'Mô tả' : 'Hướng dẫn'"
								variant="outlined" density="compact" v-model="formData.Instructions" hide-details="auto"
								:rows="2"></v-textarea>
						</v-col>
					</v-row>
				</v-form>
				<v-btn @click="onRedirectToASM(selectedLibery)" color="success" variant="tonal" size="small"
					class="mt-2">Xem chi tiết {{ formData.ResourceType == 'LESSON' ? 'bài học' : 'bài tập' }}</v-btn>
			</v-card-text>
			<div class="d-flex border-t px-2 py-3 ga-2" style="flex-wrap: wrap;"
				v-if="formData?.AssignedClassNames?.split(',').length > 0">
				<b>Các lớp học đã giao {{ formData.ResourceType == 'LESSON' ? 'bài học' : 'bài tập' }}: </b>
				<v-chip v-for="lop in formData?.AssignedClassNames?.split(',')" color="primary" size="small">
					{{ lop }}
				</v-chip>
			</div>
			<div class="my-3" v-if="selectedLibery?.AssignedClassNames?.length>0">
				<v-table density="comfortable">
					<thead>
						<tr>
							<th>Lớp</th>
							<th>Hạn nộp</th>
							<th>Điểm tối đa</th>
							<th>Thao tác</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(cls, i) in assignedClassList" :key="i">
							<td>{{ cls.TenLopHoacNhom }}</td>

							<td class="text-center d-flex ga-2 align-center">
								<v-text-field v-if="editDialog[i]" :clearable="false" density="compact" class="my-2"
									v-model="editData[i].DueDate" label="Hạn nộp" type="datetime-local" variant="outlined"
									:min="getNow()"
									 >
									<template v-slot:append-inner>
										<v-icon @click="saveEditAssign()" color="success" icon="mdi-check" />
									</template>
									</v-text-field>
								<span v-if="!editDialog[i]">{{ formatDate(cls.DueDate) }}</span>
								<v-btn v-if="!editDialog[i]" icon="mdi-pencil" size="x-small" variant="tonal" color="primary"
									@click="openEditAssignedDialog(cls, i)" />
							</td>
							<td class="text-center">{{ cls.MaxScore ?? '—' }}</td>

							<td class="text-center">
								<v-btn icon="mdi-pencil" size="x-small" variant="tonal" color="primary"
									@click="editGiaoBaiTapDialog(cls, i)" v-tooltip="'Sửa nội dung'" />
								<!-- <v-btn icon="mdi-trash-can-outline" color="red" variant="text" size="x-small"
									v-tooltip="'Xóa bài tập'" @click="onDeleleAssigned(cls, i)">
								</v-btn> -->
							</td>
						</tr>
					</tbody>
				</v-table>
			</div>
			<v-card-actions class="border-t">
				<v-spacer></v-spacer>
				<v-btn @click="onSave()" variant="text" color="primary">Cập nhật</v-btn>
			</v-card-actions>
		</v-card>
		<!-- Dialog Sửa -->
		<!-- <v-dialog v-model="editDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">Sửa thông tin lớp</v-card-title>
                <v-divider />
                <v-card-text>
                    <v-text-field class="my-2" v-model="editData.TenLop" label="Tên lớp" disabled variant="outlined" />
                    <v-select v-model="editData.Status" :items="statusItems" item-title="text" item-value="value"
                        label="Trạng thái" outlined>
                    </v-select>
                    <v-text-field class="my-2" v-model.number="editData.MaxScore" disabled label="Điểm tối đa"
                        type="number" variant="outlined" />
                    <v-text-field class="my-2" v-model="editData.DueDate" label="Hạn nộp" type="datetime-local"
                        variant="outlined" :min="getNow()" />
                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="editDialog = false">Hủy</v-btn>
                    <v-btn color="primary" @click="saveEditAssign">Lưu</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> -->
	</v-dialog>

</template>
<script>
	export default {
		props: ["selectedLibery", "isOpen"],
		emits: ["update:isOpen", 'update:selectedLibery'],
		data() {
			return {
				formData: {},
				editDialog: [],
				editData: [],
				editIndex: null,
				statusItems: [
					{ text: 'Đã giao', value: 1 },
					{ text: 'Đang khóa', value: 0 }
				]
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
					return raw.map(n => ({
						AssignToClassID: n?.AssignToClassID,
						AssignmentID: n?.AssignmentID,
						LopID: n?.TenLopHoacNhom,
						TenLopHoacNhom:n?.TenLopHoacNhom,
						DueDate: n?.DueDate ?? null,
						MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
						ResourceType: n?.ResourceType,
						ResourceID: n?.ResourceID
					}))
				}
				// TH2: backend trả CHUỖI JSON (trường hợp của bạn)
				if (typeof raw === 'string' && raw.trim()) {
					try {
						const arr = JSON.parse(raw);
						if (Array.isArray(arr)) {
							return arr.map(n => ({
								AssignToClassID: n?.AssignToClassID,
								LopHoacNhomID: n?.LopHoacNhomID,
								AssignmentID: n?.AssignmentID,
								TenLopHoacNhom:n?.TenLopHoacNhom,
								LopID: n?.LopHoacNhomID,
								DueDate: n?.DueDate ?? null,
								MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
								ResourceType: n?.ResourceType,
								ResourceID: n?.ResourceID
							}))
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
				this.formData = { ...this.selectedLibery }
				console.log('assignedClassList', this.assignedClassList)
	
			})
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
							NienKhoa: vueData.NienKhoa
						}, res => {
							this.$emit('update:selectedLibery', { ...this.formData })
							Vue.$toast.success('Cập nhật bài học thành công', { position: "top" })
							this.CloseModal()
						})
					} else {
						ajaxCALL('lms/EL_Assignment_Upd', {
							...this.formData,
							AssignmentID: this.formData.ResourceID,
							Instructions: this.formData.Instructions,
							NienKhoa: vueData.NienKhoa
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
			openEditAssignedDialog(cls, index) {
				this.editData[index] = { ...cls } // clone dữ liệu để tránh thay đổi trực tiếp
				console.log('this.editData[index]',this.editData[index])
				this.editIndex = index
				this.editDialog[index] = true
			},
			editGiaoBaiTapDialog(id, index) {
				if (id?.ResourceType == "ASSIGNMENT") {
					openWindow({
						title: "Sửa bài tập",
						url: `/lms_tc_asm_builder?AssignmentID=${id?.AssignmentID}&AssignToClassID=${id?.AssignToClassID}`,
						onclose: {
							EXE: "apiCall3()"
						}
					});
				}
				else if (id?.ResourceType == "LESSON") {
					openWindow({
						title: "Sửa bài học",
						url: `lms_tc_lesson_builder?LessonID=${id?.ResourceID}`,
						id: "WINSUABAIHOC",
						onclose: {
							EXE: "apiCall3()"
						}
					});
				}
			},
			async saveEditAssign() {
	
				if (this.editIndex != null) {
					// sửa chuẩn ngày hết hạn
					this.editData[this.editIndex].DueDate = this.getDue({
						date: dayjs(this.editData[this.editIndex].DueDate).format('YYYY-MM-DD'),
						time: dayjs(this.editData[this.editIndex].DueDate).format('HH:mm')
					});
					const payload = JSON.stringify([this.editData[this.editIndex]])
	
					ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
						AssignmentID: this.editData[this.editIndex].AssignmentID,
						JsonClassItems: payload
					}, (res) => {
						Vue.$toast.success("Sửa ngày thành công", { position: "top" });
						this.$emit('update:selectedLibery', payload)
						vueData.initPage()
					},
						err => {
							// xử lý khi lỗi
							Vue.$toast.error(err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', {
								position:
									"top"
							});
						}
					);
	
				}
				this.editDialog[this.editIndex] = false
				this.editIndex = null
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
					url = `/lms_tc_asm_builder?AssignmentID=${item.ResourceID}`
				} else if (item.ResourceType === 'LESSON') {
					url = `/lms_tc_lesson_builder?LessonID=${item.ResourceID}`
				}
				openWindow({
					title: item.Title,
					url,
					onclose: {}
				});
			},
			onDeleleAssigned(item) {
				console.log('item', item)
			}
		}
	}
</script>