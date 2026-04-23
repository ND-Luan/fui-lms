<template>
	<v-card class="mb-4 content-item-card" variant="outlined">
		<div class="d-flex flex-column flex-sm-row align-center  pa-4" @click.stop="openAssignedDialog">
			<!-- Cột 1 -->
			<div class="flex-md-4 flex-sm-12 d-flex align-center flex-grow-1 mr-md-4 mb-3 mb-md-0"
				style="min-width: 0;">
				<v-icon :color="itemInfo.color" size="32" class="mr-4">
					{{ itemInfo.icon }}
				</v-icon>
				<div class="item-details">
					<div class="item-title text-wrap break-words">
						{{ item.Title }}
					</div>
					<div class="item-meta">
						<span>{{ item.TenKhoi }}</span>
						<v-divider vertical class="mx-2" />
						<span>{{ item.MonHocName }}</span>
					</div>
				</div>
			</div>
			<!-- Cột 2 -->
			<div class="flex-md-6 flex-sm-12  d-flex flex-column align-end ga-2">
				<div class="d-flex align-center ga-2">
					<v-chip :color="statusInfo.color" class="font-weight-medium" variant="text" size="small">
						{{ statusInfo.text }}
					</v-chip>
					<v-menu location="bottom">
						<template v-slot:activator="{ props }">
							<v-btn color="primary" v-bind="props" icon="mdi-dots-vertical" variant="tonal"
								size="small" />
						</template>
						<v-list>
							<v-list-item title="Sửa" @click="isDialogEditBT = true" />
							<v-list-item :title="item.ResourceType === 'ASSIGNMENT'
								? 'Sửa và giao bài tập'
								: 'Sửa và giao bài học'
								" @click="onRedirectToASM" />
							<v-list-item title="Xem báo cáo" @click="goToClassDetail(item)" />
							<v-list-item title="Xóa" @click="onDelete" />
						</v-list>
					</v-menu>
				</div>
				<div>
					<div v-if="item.Status === 3 && item.AssignedClassNames" class="mr-2">
						<div class="d-flex flex-nowrap align-start">
							<!-- Cột icon -->
							<v-icon size="16" class="mr-1 flex-shrink-0">mdi-check</v-icon>

							<!-- Cột text -->
							<div class="flex-grow-1 min-w-0 assigned-text">
								Đã giao cho:
								<strong class="ml-1">{{ item.AssignedClassNames }}</strong>
							</div>
						</div>
					</div>
					<div v-if="item.AssignedClassNamesPublic" class="mr-2 mt-n2">
						<div class="d-flex align-start">
							<v-icon size="16" class="mr-1 flex-shrink-0">mdi-check-all</v-icon>
							<div class="flex-grow-1 min-w-0 assigned-text">
								Đã mở cho lớp:
								<strong class="ml-1">{{ item.AssignedClassNamesPublic }}</strong>
							</div>
						</div>
					</div>
				</div>
				<!-- <div v-else class="assigned-classes-info-placeholder"></div> -->
			</div>
		</div>
	</v-card>
	<v-dialog v-model="assignDialog" max-width="600px">
		<v-card>
			<v-card-title class="text-h6">Giao bài cho lớp</v-card-title>
			<v-divider />
			<v-card-text>
				<v-select v-model="selectedClasses" :items="classOptions" item-title="TenLop" item-value="LopID"
					label="Chọn lớp" multiple chips variant="outlined" @update:model-value="onClassesChange" />
				<v-row v-for="id in selectedClasses" :key="id" class="mt-4" dense>
					<v-col cols="12">
						<strong>{{ getClassName(id) }}</strong>
					</v-col>
					<v-col cols="5">
						<v-text-field :model-value="formattedDate(deadlines[id]?.date)" label="Ngày hết hạn" readonly
							variant="outlined" @click="openDate(id)" />
					</v-col>
					<v-col cols="5">
						<v-text-field :model-value="formattedTime(deadlines[id]?.time)" label="Giờ hết hạn" readonly
							variant="outlined" @click="openTime(id)" />
					</v-col>
					<v-col cols="2">
						<v-btn variant="outlined" color="primary" :disabled="!deadlines[id]"
							@click.stop="editGiaoBaiDialog(deadlines[id])">
							Giao bài
						</v-btn>
					</v-col>
					<v-col cols="12" class="py-1">
						<v-divider />
					</v-col>
				</v-row>
			</v-card-text>
			<v-divider />
			<v-card-actions>
				<v-spacer />
				<v-btn variant="text" @click="assignDialog = false">Hủy</v-btn>
				<!-- <v-btn color="primary">Xác nhận</v-btn> -->
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- Dialog chọn ngày (dùng 1 cái cho tất cả lớp) -->
	<v-dialog v-model="dateDialogVisible" max-width="350">
		<v-card>
			<v-date-picker v-if="activeId && deadlines[activeId]" v-model="deadlines[activeId].date"
				@update:model-value="dateDialogVisible = false" />
			<v-card-actions>
				<v-spacer />
				<v-btn variant="text" @click="dateDialogVisible = false">Hủy</v-btn>
				<v-btn color="primary" @click="dateDialogVisible = false">OK</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- Dialog chọn giờ (dùng 1 cái cho tất cả lớp) -->
	<v-dialog v-model="timeDialogVisible" max-width="350">
		<v-card>
			<v-time-picker v-if="activeId && deadlines[activeId]" v-model="deadlines[activeId].time" format="24hr"
				@update:model-value="timeDialogVisible = false" />
			<v-card-actions>
				<v-spacer />
				<v-btn variant="text" @click="timeDialogVisible = false">Hủy</v-btn>
				<v-btn color="primary" @click="timeDialogVisible = false">OK</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- Dialog: Danh sách lớp đã giao -->
	<v-dialog v-model="assignedDialog" max-width="800">
		<v-card>
			<v-card-title class="text-h6">
				Danh sách lớp đã giao
			</v-card-title>
			<v-divider />
			<v-card-text>
				<v-table density="comfortable">
					<thead>
						<tr>
							<th>Lớp/Học sinh</th>
							<th>Trạng Thái</th>
							<th>Hạn nộp</th>
							<th>Điểm tối đa</th>
							<th>Sửa hạn nộp</th>
							<th>Sửa nội dung</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(cls, i) in dataAssignedClassList" :key="i">
							<td>{{ cls.TenLop }}</td>
							<td>
								<!-- <v-chip :color="cls.Status === 1 ? 'primary' : 'error'">
												{{ cls.Status === 1 ? 'Đã giao' : 'Đang khóa' }}
											</v-chip> -->
								<v-switch v-model="cls.Status" :true-value="1" :false-value="0"
									:label="cls.Status === 1 ? 'Đã mở' : 'Đang khóa'" inset
									:loading="cls._loading === true" :disabled="cls._loading === true"
									@change="onToggleStatus(cls)" />
							</td>
							<td class="text-center">{{ formatDate(cls.DueDate) }}</td>
							<td class="text-center">{{ cls.MaxScore ?? '—' }}</td>
							<td class="text-center">
								<v-btn icon="mdi-pencil" size="x-small" variant="tonal" color="primary"
									@click="openEditAssignedDialog(cls, i)" />
							</td>
							<td class="text-center">
								<v-btn icon="mdi-pencil" size="x-small" variant="tonal" color="primary"
									@click="editGiaoBaiTapDialog(cls, i)" />
							</td>
						</tr>
					</tbody>
				</v-table>
			</v-card-text>
			<v-divider />
			<v-card-actions>
				<v-spacer />
				<v-btn color="primary" @click="assignedDialog = false">Đóng</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- Dialog Sửa -->
	<v-dialog v-model="editDialog" max-width="400">
		<v-card>
			<v-card-title class="text-h6">Sửa thông tin lớp</v-card-title>
			<v-divider />
			<v-card-text>
				<v-text-field class="my-2" v-model="editData.TenLop" label="Tên lớp" disabled variant="outlined" />
				<v-select v-model="editData.Status" :items="statusItems" item-title="text" item-value="value"
					label="Trạng thái" outlined>
				</v-select>
				<v-text-field class="my-2" v-model.number="editData.MaxScore" disabled label="Điểm tối đa" type="number"
					variant="outlined" />
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
	</v-dialog>
	<uc-dialog-edit-bt v-model="isDialogEditBT" :khoiid="item.KhoiID" :monhocid="item.MonHocID" :item="item" />
</template>

<script>
	export default {
		name: 'uc-content-library-item',
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		props: {
			item: { type: Object, required: true }
		},
		data() {
			return {
				assignDialog: false,
				classOptions: [],
				resourceType: null,
				resourceID: null,
				selectedClasses: [],            // mảng LopID đã chọn (string/number)
				deadlines: {},                  // { [LopID]: { date: 'YYYY-MM-DD' | null, time: 'HH:mm' | null } }
				activeId: null,                 // LopID đang chọn ngày/giờ
				dateDialogVisible: false,
				timeDialogVisible: false,
				assignedDialog: false,
				assignmentIDSave: null,
				editDialog: false,
				editData: {},
				editIndex: null,
				dataItemOriginal: null,
				dataAssignedClassList: [],
				isDialogEditBT: false,
				statusItems: [
					{ text: 'Đã giao', value: 1 },
					{ text: 'Đang khóa', value: 0 }
				]
			};
		},
		watch: {
			item: {
				immediate: true,
				deep: false,
				handler(newVal, oldVal) {
	
					// Chỉ sync khi item đổi identity
					if (!oldVal || newVal?.ResourceID !== oldVal?.ResourceID) {
						this.dataItemOriginal = newVal ? JSON.parse(JSON.stringify(newVal)) : null;
						this.dataAssignedClassList = this.buildAssignedClassList();
	
					}
				}
			}
		},
		computed: {
			itemInfo() {
				return this.item.ResourceType === 'ASSIGNMENT'
					? { icon: 'mdi-notebook-edit-outline', color: 'blue' }
					: { icon: 'mdi-presentation-play', color: 'green' };
			},
			statusInfo() {
				const statusMap = {
					1: { text: 'Đang soạn thảo', color: 'grey' },
					2: { text: 'Sẵn sàng giao', color: 'orange' },
					3: { text: `Đã giao ${this.item.AssignedClassCount} lớp`, color: 'success' }
				};
				return statusMap[this.item.Status] || statusMap[1];
			},
			assignedClassList() {
				const raw = this.item?.AssignedDetails;
				// TH1: backend trả mảng object (hiếm)
				if (Array.isArray(raw)) {
					return raw.map(n => ({
						AssignToClassID: n?.AssignToClassID,
						AssignmentID: n?.AssignmentID,
						TenLopHoacNhom: n?.TenLopHoacNhom,
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
								LopID: n?.LopID,
								AssignedClassNamesPublic: n?.AssignedClassNamesPublic,
								AssignmentID: n?.AssignmentID,
								TenLopHoacNhom: n?.TenLopHoacNhom,
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
				const names = this.item?.AssignedClassNames;
				if (typeof names === 'string' && names.trim()) {
					return names.split(',').map(s => s.trim()).filter(Boolean)
						.map(TenLop => ({ TenLop, DueDate: null, MaxScore: null }));
				}
	
				return [];
			},
			assignedClassCount() {
				return this.assignedClassList.length;
			}
		},
		methods: {
			getNow() {
				let date = dayjs().add(1, "minute").format("YYYY-MM-DDTHH:mm");
				return date
			},
			buildAssignedClassList() {
				const raw = this.dataItemOriginal?.AssignedDetails;
				if (Array.isArray(raw)) {
					return raw.map(n => ({
						AssignToClassID: n?.AssignToClassID,
						LopID: n?.LopHoacNhomID,
						AssignmentID: n?.AssignmentID,
						TenLop: n?.TenLopHoacNhom ?? '',
						AssignedClassNamesPublic: n?.AssignedClassNamesPublic,
						Status: n?.Status ?? '',
						DueDate: n?.DueDate ?? null,
						MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
						ResourceType: n?.ResourceType,
						ResourceID: n?.ResourceID
					})).filter(x => x.TenLop);
				}
	
				if (typeof raw === 'string' && raw.trim()) {
					try {
						const arr = JSON.parse(raw);
						if (Array.isArray(arr)) {
							return arr.map(n => ({
								AssignToClassID: n?.AssignToClassID,
								LopID: n?.LopHoacNhomID,
								AssignmentID: n?.AssignmentID,
								AssignedClassNamesPublic: n?.AssignedClassNamesPublic,
								Status: n?.Status ?? '',
								TenLop: n?.TenLopHoacNhom ?? '',
								DueDate: n?.DueDate ?? null,
								MaxScore: n?.MaxScore != null ? Number(n.MaxScore) : null,
								ResourceType: n?.ResourceType,
								ResourceID: n?.ResourceID
							})).filter(x => x.TenLop);
						}
					} catch (e) {
						console.warn('Parse AssignedDetails failed:', e);
					}
				}
			},
			// ==== Hành động ngoài dialog ====
			onRedirectToASM() {
				let url = null
				if (this.item.ResourceType === 'ASSIGNMENT') {
					url = `/lms_tc_asm_builder?AssignmentID=${this.item.ResourceID}`
				} else if (this.item.ResourceType === 'LESSON') {
					url = `/lms_tc_lesson_builder?LessonID=${this.item.ResourceID}`
				}
				this.iframeRef.value.openWindow({
					title: this.item.Title || '',
					url,
					onclose: () => vueData.apiCall3()
				});
			},
			goToClassDetail(item) {
				this.iframeRef.value.openWindow({
					title: "Thống kê nộp bài theo lớp",
					url: `/lms-tc-lesson-assign?assignmentID=${item?.ResourceID}&resourceType=${item.ResourceType}`,
					onclose: () => vueData.apiCall3()
				});
			},
			onDelete() {
				this.confirmRef.value.show({
					title: `Xác nhận xóa ${this.item.ResourceType === 'ASSIGNMENT' ? 'bài tập' : 'bài học'} - ${this.item.Title}`
				}).then(ok => {
					if (!ok) return
					if (this.item.ResourceType === 'ASSIGNMENT') {
						ajaxCALL('lms/EL_Assignment_Delete', {
							AssignmentID: this.item.ResourceID
						}, res => {
							vueData.apiCall3()
						})
					} else {
						ajaxCALL('lms/EL_Lesson_Delete', {
							LessonID: this.item.ResourceID
						}, res => {
							vueData.apiCall3()
						})
					}
				})
			},
			getClassName(id) {
				const cls = this.classOptions.find(c => String(c.LopID) === String(id))
				return cls ? cls.TenLop : ""
			},
			// ==== Helpers hiển thị ====
			formattedDate(dateStr) {
				return dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "";
			},
			formattedTime(timeStr) {
				return timeStr ? dayjs(timeStr, "HH:mm").format("HH:mm") : "";
			},
			formatDate(dateStr) {
				if (!dateStr) return '—'
				const d = dayjs(dateStr)
				return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(dateStr)
			},
			// ==== Quản lý chọn lớp & deadline ====
			onClassesChange(ids) {
				// tái tạo deadlines theo danh sách mới (không cần $set/delete)
				const next = {};
				ids.forEach((idRaw) => {
					const id = String(idRaw); // key ổn định
					next[id] = this.deadlines[id] || { LopID: id, date: null, time: null, ResourceType: this.resourceType, ResourceID: this.resourceID };
				});
				this.deadlines = next;
				if (this.activeId && !ids.map(String).includes(this.activeId)) {
					this.activeId = null;
					this.dateDialogVisible = false;
					this.timeDialogVisible = false;
				}
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
			openDate(id) {
				const key = String(id);
				if (!this.deadlines[key]) this.deadlines[key] = { date: null, time: null };
				this.activeId = key;
				this.dateDialogVisible = true;
			},
			openTime(id) {
				const key = String(id);
				if (!this.deadlines[key]) this.deadlines[key] = { date: null, time: null };
				this.activeId = key;
				this.timeDialogVisible = true;
			},
			openAssignedDialog() {
				this.assignedDialog = true;
			},
			openEditAssignedDialog(cls, index) {
				this.editData = { ...cls } // clone dữ liệu để tránh thay đổi trực tiếp
				this.editIndex = index
				this.editDialog = true
			},
			async saveEditAssign() {
				if (this.editIndex != null) {
					// sửa chuẩn ngày hết hạn
					this.editData.DueDate = this.getDue({
						date: dayjs(this.editData.DueDate).format('YYYY-MM-DD'),
						time: dayjs(this.editData.DueDate).format('HH:mm')
					});
					const payload = [this.editData]
	
					ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
						AssignmentID: this.editData.AssignmentID,
						JsonClassItems: payload
					}, (res) => {
						this.snackbarRef.value.showSnackbar({ message: 'Sửa ngày thành công', color: 'success' })
						this.getAssignClass()
						vueData.apiCall4()
					},
						err => {
							// xử lý khi lỗi
							this.snackbarRef.value.showSnackbar({ message: err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', color: 'error' })
						}
					);
				}
				this.editDialog = false
				this.editIndex = null
			},
			editGiaoBaiTapDialog(id, index) {
				if (id?.ResourceType == "ASSIGNMENT") {
					this.iframeRef.value.openWindow({
						title: "Sửa bài tập",
						url: `/lms_tc_asm_builder?AssignmentID=${id?.AssignmentID}&AssignToClassID=${id?.AssignToClassID}`,
						onclose: () => vueData.apiCall3()
					});
				}
				else if (id?.ResourceType == "LESSON") {
					this.iframeRef.value.openWindow({
						title: "Sửa bài học",
						url: `lms_tc_lesson_builder?LessonID=${id?.ResourceID}`,
						onclose: () => vueData.apiCall3()
					});
				}
			},
			editGiaoBaiDialog(id) {
				const d = { date: id?.date, time: id?.time };
				const due = this.getDue(d);
				const payload = [{
					LopID: id.LopID,
					DueDate: due,
	
					ResourceID: this.resourceID,
					ResourceType: this.resourceType,
					MaxScore: 0, // thêm nếu cần
					Status: 1
				}]
				console.log("Payload gửi API:", payload);
				console.log("AssignmentID:", this.assignmentIDSave);
				ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
					AssignmentID: this.assignmentIDSave,
					JsonClassItems: payload
				}, (res) => {
					if (res.data || res.data[1]) {
						const dataItem = res?.data?.[1]?.[0] ?? {};
						const assignmentID = dataItem.AssignmentID ?? null;
						const assignToClassID = dataItem.AssignToClassID ?? null;
						if (assignmentID !== null && assignToClassID !== null) {
							openWindow({
								title: "Sửa bài tập",
								url: `/lms_tc_asm_builder?AssignmentID=${assignmentID}&AssignToClassID=${assignToClassID}`,
								onclose: {
									EXE: "apiCall3()"
								}
							});
						}
					}
					this.snackbarRef.value.showSnackbar({ message: 'Giao bài thành công', color: 'success' })
					this.assignDialog = false;
				},
					err => {
						// xử lý khi lỗi
						this.snackbarRef.value.showSnackbar({ message: err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', color: 'error' })
					});
	
			},
			async getAssignClass() {
				ajaxCALL("/lms/EL_Teacher_GetMyContentLibrary", null, (res) => {
					if (res?.data) {
						let itemfetch = res.data.find(x => x.ResourceID === this.dataItemOriginal.ResourceID && x.AssignmentID === this.dataItemOriginal.AssignmentID);
						this.dataItemOriginal = itemfetch
						this.dataAssignedClassList = this.buildAssignedClassList();
					}
				});
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
						this.snackbarRef.value.showSnackbar({ message: 'Thay đổi trạng thái thành công', color: 'success' })
						this.getAssignClass()
						vueData.apiCall4()
					});
				} catch (err) {
					row.Status = prev
					this.snackbarRef.value.showSnackbar({ message: 'Cập nhật trạng thái thất bại', color: 'error' })
					console.error(err)
				} finally {
					row._loading = false
				}
			}
		}
	}
</script>
<style>
	.assigned-text {
		display: block !important;
		white-space: normal !important;
		word-break: break-all !important;
		/* bẻ bất kỳ chỗ nào */
		overflow-wrap: anywhere !important;
		min-width: 0 !important;
	}
</style>