<template>
	<div class="builder-layout">
		<!-- Cột trái: Thư viện -->
		<div class="builder-sidebar left-sidebar">
			<uc-lesson-component-library @add-element="addElement"></uc-lesson-component-library>
			<!-- {{lesson.elements}} -->
		</div>

		<!-- Cột giữa: Canvas -->
		<div class="builder-canvas">
			<uc-lesson-canvas :elements="lesson.elements" v-model:selected-index="selectedElementIndex"
				@update:elements="updateElements" />
		</div>

		<!-- Cột phải: Thuộc tính và Nút Lưu -->
		<div class="builder-sidebar right-sidebar">
			<uc-lesson-properties v-model:lesson-header="lesson" :element="selectedElement"
				:index="selectedElementIndex" @update:element="updateElement" />
			<div class="action-buttons">
				<v-btn variant="outlined" block @click="handleSave(false)" class="mb-2"><v-icon start class="me-1">mdi-file-edit-outline</v-icon>
					{{ $t('message.SaveDraft')}}</v-btn>
				<v-btn color="primary" variant="outlined" block @click="handleSave(true)" class="mb-2"><v-icon start class="me-1">mdi-content-save-outline</v-icon>
					{{$t('message.SaveAndPublish') }}</v-btn>
				<v-btn color="orange" variant="outlined" v-if="classOptions.length > 0" block
					@click="openSheetAssignToClass()" class="mb-2"><v-icon start class="me-1">mdi-clipboard-arrow-right-outline</v-icon>
					{{ $t('message.SaveAndAssign') }}</v-btn>
			</div>
		</div>
		<v-bottom-sheet v-model="isOpenSheetAssignToClass" persistent inset>
			<v-card height="fit-content">
				<v-card-title class="bg-warning d-flex">
					<span class="text-white">{{ $t('message.AssignAssignment') }}</span>
					<v-spacer></v-spacer>
					<v-btn variant="text" icon="mdi-close" color="white"
						@click="isOpenSheetAssignToClass = false"></v-btn>
				</v-card-title>
				<v-card-text>
					<v-row dense class="mb-3">
						<v-col cols="12">
							<p class="text-subtitle-2 mb-3">{{ $t('message.Time') }}</p>
							<div class="d-flex ga-3">
								<v-text-field :model-value="formattedDate(deadlines?.date)"
									:label="$t('message.ExpirationDate')" readonly variant="outlined"
									@click="openDate(id)" />
								<v-text-field :model-value="formattedTime(deadlines?.time)"
									:label="$t('message.ExpirationTime')" readonly variant="outlined"
									@click="openTime(id)" />
							</div>
						</v-col>
					</v-row>
					<div class="d-flex">
						<p class="text-subtitle-2">{{ $t('message.ClassList') }}</p>
						<v-spacer></v-spacer>
						<div class="d-flex ga-2" @click='selectedAllClass()'>
							<v-checkbox color="success" :indeterminate="isIndeterminate" v-model="isAllSelected"
								:label="$t('message.SelectAll')">
							</v-checkbox>
						</div>
					</div>
					<div class="d-flex  flex-wrap ga-5">
						<div v-for="item in classOptions" class="d-flex ga-1 justify-center align-center">
							<v-checkbox v-model='selectedClass' :key="item.LopID" :value="item.LopID" color="success">
							</v-checkbox>
							<p>{{ item.TenLop }}</p>
						</div>

					</div>

				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn variant="text" color="primary" @click="onAssignToClassAndSave">{{ $t('message.Assigned')
					}}</v-btn>
				</v-card-actions>
			</v-card>
		</v-bottom-sheet>
		<!-- Dialog chọn ngày (dùng 1 cái cho tất cả lớp) -->
		<v-dialog v-model="dateDialogVisible" max-width="350">
			<v-card>
				<v-date-picker v-model="deadlines.date" @update:model-value="dateDialogVisible = false" />
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" @click="dateDialogVisible = false">{{ $t('message.Cancel') }}</v-btn>
					<v-btn color="primary" @click="dateDialogVisible = false">OK</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog chọn giờ (dùng 1 cái cho tất cả lớp) -->
		<v-dialog v-model="timeDialogVisible" max-width="350">
			<v-card>
				<v-time-picker v-model="deadlines.time" format="24hr" @update:model-value="timeDialogVisible = false" />
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" @click="timeDialogVisible = false">{{ $t('message.Cancel') }}</v-btn>
					<v-btn color="primary" @click="timeDialogVisible = false">OK</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
export default {
	name: 'uc-lesson-builder',
	props: {
		initialLesson: Object,
		isEditMode: Boolean,
		onSave: { type: Function, default: () => { } }
	},
	emits: ['update:initialLesson'],
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return {
			vueData,
			lesson: { elements: [] },
			selectedElementIndex: null,
			isOpenSheetAssignToClass: false,
			deadlines: {
				date: null,
				time: null
			},
			selectedClass: [],
			classAssigned: [],
			timeDialogVisible: false,
			dateDialogVisible: false,
			classOptions: [],
			lessonID: null
		}
	},
	computed: {
		selectedElement() {
			if (this.selectedElementIndex === null || !this.lesson.elements) return null;
			return this.lesson.elements[this.selectedElementIndex];
		},
		isIndeterminate: function () {
			return this.selectedClass.length != 0 && this.selectedClass.length !== this.classOptions.length
		},
		isAllSelected: function () {
			return this.selectedClass.length != 0 && this.selectedClass.length == this.classOptions.length
		},
	},
	mounted() {
		// ajaxCALL("/lms/EL_Teacher_GetGroupedDashboard", {

		// }, (res) => {
		// 	const lesson = { ...vueData.Lesson_API[0][0] }
		// 	const id = lesson.LessonID
		// 	this.lessonID = id
		// 	this.classAssignedAssignment = (res?.data[2] || []).filter(x => x.AssignmentID == id);
		// 	this.classAssignedLesson = (res?.data[3] || []).filter(x => x.AssignmentID == id);


		// 	let classAssignedByKhoiMon = (res?.data[1] || []).filter(
		// 		c => c.KhoiID == lesson.KhoiID && c.MonHocID == lesson.MonHocID
		// 	);
		// 	const assignmentAssignedByLopIDs = this.classAssignedAssignment.map(c => c.LopID);
		// 	const lessonAssignedByLopIDs = this.classAssignedLesson.map(c => c.LopID);
		// 	this.classOptions = classAssignedByKhoiMon.filter(
		// 		item => !assignmentAssignedByLopIDs.includes(item.LopID) && !lessonAssignedByLopIDs.includes(item.LopID)
		// 	);

		// });

		ajaxCALL("/lms/EL_Teacher_GetLop_GiaoBai", {
		AssignmentID: vueData.lesson.LessonID,
		MonHocID: vueData.lesson.MonHocID,
			ResourceType: 'LESSON'
		}, (res) => {
		this.classOptions = res.data
		console.log("this.classOptions", this.classOptions)
		});
	},
	watch: {
		initialLesson: {
			handler(newVal) {
				if (newVal) {
					const processedElements = (newVal.elements || []).map(el => {
						try {
							el.ElementData = typeof el.ElementData === 'string' ? JSON.parse(el.ElementData) : (el.ElementData || {});
						} catch (e) {
							console.error("Lỗi parse ElementData:", el.ElementData, e);
							el.ElementData = {};
						}
						return el;
					});
					this.lesson = { ...newVal, elements: processedElements };
				}
			},
			immediate: true,
			deep: true
		}
	},
	methods: {
		selectedAllClass() {
			if (this.isAllSelected) {
				this.selectedClass = []
			} else {
				this.selectedClass = this.classOptions.map(i => i.LopID)
			}
		},
		handleClickClass(item) {
			if (!this.selectedClass.includes(item.LopID)) {
				this.selectedClass.push(item.LopID)
			} else {
				let indexOfLopID = this.selectedClass.indexOf(item.LopID)
				this.selectedClass.splice(indexOfLopID, 1)
			}
			console.log('this.selectedClass', this.selectedClass)
		},
		openSheetAssignToClass() {
			this.isOpenSheetAssignToClass = true
		},
		async onAssignToClassAndSave() {
			if (this.deadlines?.date == null || this.deadlines?.time == null) {
				Vue.$toast.error(this.$t('message.PleaseEnterDateTime'), { position: 'top' })
				return
			}
			if (this.selectedClass.length == 0) {
				Vue.$toast.error(this.$t('message.PleaseSelectAtLeastOneClass'), { position: 'top' })
				return
			}
			const d = { date: this.deadlines?.date, time: this.deadlines?.time };
			const due = this.getDue(d);
			let isReponse = await new Promise((resolve, reject) => {
				for (item of this.selectedClass) {
					const payload = [{
						LopID: item,
						DueDate: due,
						MaxScore: 0, // thêm nếu cần
						Status: 1,
						ResourceType: "LESSON",
						ResourceID: vueData.lesson.LessonID
					}]

					ajaxCALL("/lms/EL_Teacher_Lesson_CLASS", {
						AssignmentID: vueData.lesson.LessonID,
						JsonClassItems: payload
					}, (res) => {
						if (res.data || res.data[1]) {

						}
					});
					console.log('payload----', item, ' nnn--- ', payload)
				}
				resolve()
			})
			// truyền true => isPushlish = true
			await this.handleSave(true)
			Vue.$toast.success(this.$t('message.SaveAndAssignSuccess'), { position: 'top' });
			this.isOpenSheetAssignToClass = false
			await setTimeout(() => { }, 2000)
			window.open("/lms-teacher-dashboard", '_parent');
		},
		addElement(elementInfo) {
			const newElement = {
				LessonID: vueData.LessonID,
				ElementType: elementInfo.type,
				ElementData: JSON.parse(JSON.stringify(elementInfo.defaultData)),
				SortOrder: (this.lesson.elements.length + 1) * 10
			};
			ajaxCALL('lms/EL_Element_Save', newElement, res => {
				CALL('getLessonData')
				this.selectedElementIndex = this.lesson.elements.length  //- 1;
			})
			// this.lesson.elements.push(newElement);
		},
		updateElements(newElements) {
			this.lesson.elements = newElements;
		},
		updateElement(updatedPayload) {
			const newElements = [...this.lesson.elements];
			if (newElements[updatedPayload.index]) {
				newElements[updatedPayload.index] = updatedPayload.element;
				this.updateElements(newElements);
			}
		},
		handleSave(isPublishing) {
			this.$emit('update:initialLesson', this.lesson);
			this.onSave({ lesson: this.lesson, isPublishing });
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

		openDate() {
			if (!this.deadlines) this.deadlines = { date: null, time: null };
			this.dateDialogVisible = true;
		},

		openTime() {
			if (!this.deadlines) this.deadlines = { date: null, time: null };
			this.timeDialogVisible = true;
		},
	}
}
</script>