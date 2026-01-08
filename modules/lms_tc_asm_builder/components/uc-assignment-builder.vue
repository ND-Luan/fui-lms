<template>
	<div class="assignment-builder">
		<v-row class="ma-0" dense>
			<v-col cols="12" md="2">
				<uc-assignment-component-library @add-component="addComponent"
					style="height: calc(-157px + 100dvh); overflow: auto" />
				<v-divider />
				<p class="text-subtitle-2">
					{{ $t('message.Setting') }}
				</p>
				<div>
					<v-checkbox v-model="setting.IsBlockCopy_Paste" label="Chặn copy paste" />
				</div>
				<v-divider />
				<div class="mt-4">
					<div class="text-display text-center">
						{{ $t('message.TotalScore') }}
						<v-chip color="primary" size="small"> {{ totalScoreAsm }}</v-chip>
					</div>
					<v-divider class="mt-1 mb-1 " />
					<v-row dense>
						<v-col cols="6">
							<v-btn @click="onOpenPreview" color="teal" block variant="tonal">
								{{ $t('message.Preview') }}
							</v-btn>
						</v-col>
						<v-col cols="6">
							<v-btn @click="onRemarkQuestion" color="amber" block variant="tonal">
								{{ $t('message.SortNumber') }}
							</v-btn>
						</v-col>
					</v-row>
				</div>
				<!-- Component uc-quiz-importer của bạn có thể đặt ở đây -->
				<v-divider vertical />

			</v-col>

			<v-col cols="12" md="7" style="height: calc(100dvh); overflow: auto">
				<uc-assignment-canvas :groups="assignment?.AssignmentConfig?.groups" :selected-item="selectedItem"
					@update:groups="updateGroups" @update:selected-item="selectedItem = $event" />
				<v-divider vertical />

			</v-col>
			<v-col class="pa-0" cols="12" md="3">
				<div style="height: calc(100dvh - 45px); overflow: auto;" class="position-relative pa-2">
					<uc-assignment-properties v-if="selectedItem" :assignment="assignment"
						:groups="assignment.AssignmentConfig?.groups" :item="selectedItem"
						@update:groups="updateGroups" />
				</div>
				<v-divider />
				<v-row class="ma-0" dense v-if="assignment.AssignmentConfig?.groups.length > 0">
					<!-- <v-col :cols="!vueData.AssignToClassID ? 4 : 6">
						<v-btn @click="onOpenPreview" text='Xem trước' color="teal" block />
					</v-col> -->
					<v-col :cols="!vueData.AssignToClassID ? 6 : 12">
						<v-btn color="primary" block elevation="2" @click="handleSave(true)">
							{{ $t('message.SaveAssignment') }}
						</v-btn>
					</v-col>
					<v-col cols="6" v-if="!vueData.AssignToClassID">
						<v-btn class="w-100" color="success" @click="openDialogAssignToStudent">
							{{ $t('message.Assigned') }}
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
		<v-dialog v-model="isOpenDialogForAssignToStudent" max-width="800px">
			<v-card>
				<v-card-title class="bg-warning d-flex">
					<span class="text-white">
						{{ $t('message.AssignAssignment') }}
					</span>
					<v-spacer></v-spacer>
					<v-btn variant="text" icon="mdi-close" color="white"
						@click="isOpenDialogForAssignToStudent = false"></v-btn>
				</v-card-title>
				<v-card-text>
					<v-row dense class="mb-3">
						<v-col cols="12">
							<p class="text-subtitle-2 mb-3">
								{{ $t('message.Time') }}
							</p>
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
					<v-divider class="mb-1"></v-divider>
					<div class="d-flex flex-column ga-1 my-1">
						<span class="text-subtitle-2">Phân quyền cho giáo viên quản lí</span>
						<v-select v-model="GiaoVienPermissionSelected" label="Chọn giáo viên"
							:items="DSGiaoVien_Permission" item-title="HoTenGV" item-value="GiaoVienID" multiple chips>
							<template #chip="{ item }">
								<v-chip color="blue">{{ item.title }}</v-chip>
							</template>
						</v-select>
					</div>
					<v-divider class="mb-1"></v-divider>
					<div class="d-flex">
						<span class="text-subtitle-2 d-flex align-center">
							{{ $t('message.ChooseClassToAssign') }}
						</span>
						<v-spacer></v-spacer>
						<div class="d-flex ga-2" @click='selectedAllClass()'>
							<v-checkbox color="success" :indeterminate="isIndeterminate" v-model="isAllSelected"
								:label="$t('message.SelectAll')">
							</v-checkbox>
						</div>
					</div>
					<div class="d-flex ga-5 flex-wrap">
						<div v-for="item in classOptions.filter(classes => { if (DSHocSinhSelected.find(hs => hs.LopID == classes.LopID) || DSHocSinhAssigned.find(hs => hs.LopID == classes.LopID)) return false; else return true })"
							class="d-flex ga-1 justify-center align-center">
							<v-checkbox v-model='selectedClass' :key="item.LopID" :value="item.LopID" color="success">
							</v-checkbox>
							<p>{{ item.TenLop }}</p>
						</div>
					</div>
					<v-divider class="mb-2"></v-divider>
					<div class="d-flex mb-2">
						<p class="text-subtitle-2 d-flex align-center">
							{{ $t('message.ChooseStudentToAssign') }}
						</p>
						<v-spacer></v-spacer>
						<v-chip color="pink">{{ $t('message.Selected') }}: {{ DSHocSinhSelected.length }} {{
							$t('message.Students') }}</v-chip>
					</div>
					<div class="d-flex">
						<v-combobox v-model="DSHocSinhSelected" return-object :items="mappedItems"
							:label="$t('message.studentList')" density="compact" item-color="success" chips multiple
							variant="outlined">
							<template #chip="{ item }">
								<v-chip color="green">{{ item.title }}</v-chip>
							</template>

							<template #item="{ props, item }">
								<v-list-item v-bind="props" :disabled="item.raw.disabled"
									@click.stop="item.raw.disabled && $event.stopPropagation()">
								</v-list-item>
							</template>
						</v-combobox>
					</div>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn variant="text" color="primary" @click="onAssignToStudentAndSave" :loading="isLoadDSHocSinh">
						{{ $t('message.AssignAssignment') }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
		<!-- Dialog chọn ngày (dùng 1 cái cho tất cả lớp) -->
		<v-dialog v-model="dateDialogVisible" max-width="350">
			<v-card>
				<v-date-picker v-model="deadlines.date" @update:model-value="dateDialogVisible = false" />
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
				<v-time-picker v-model="deadlines.time" format="24hr" @update:model-value="timeDialogVisible = false" />
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" @click="timeDialogVisible = false">Hủy</v-btn>
					<v-btn color="primary" @click="timeDialogVisible = false">OK</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
export default {
	name: 'uc-assignment-builder',
	props: {
		initialAssignment: undefined,
		isEditMode: Boolean,
		onSave: { type: Function, default: () => { } }
	},
	data() {
		const toggle = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
		this.$i18n.locale = toggle ? "en" : "vi"
		return {
			SelectedClasses: null,
			timeDialogVisible: false,
			dateDialogVisible: false,
			isOpenDialogForAssignToStudent: false,
			setting: {
				IsBlockCopy_Paste: false
			},
			vueData,
			loadingPage: {
				isLoading: false,
				text: 'Đang tải dữ liệu...'
			},
			assignment: {
				Title: '',
				Instructions: '',
				AssignmentConfig: { groups: [] }
			},
			selectedItem: null,
			fileAudio: null,
			classOptions: [],
			isOpenSheetAssignToClass: false,
			deadlines: {
				date: null,
				time: null
			},
			selectedClass: [],
			classAssigned: [],
			isLoadDSHocSinh: false,
			DSHocSinhByLopID: [],
			DSHocSinhSelected: [],
			DSGiaoVien_Permission: [],
			GiaoVienPermissionSelected: []
		}
	},
	mounted() {
		ajaxCALL("/lms/EL_Teacher_GetLop_GiaoBai", {
			AssignmentID: vueData.assignment.AssignmentID,
			MonHocID: vueData.assignment.MonHocID,
			ResourceType: 'ASSIGNMENT'
		}, (res) => {
			this.classOptions = res.data
			console.log("this.classOptions", this.classOptions)
		});
	},
	computed: {
		isIndeterminate: function () {
			return this.selectedClass.length != 0 && this.selectedClass.length !== this.classOptions.length
		},
		isAllSelected: function () {
			return this.selectedClass.length != 0 && this.selectedClass.length == this.classOptions.length
		},
		totalScoreAsm: function () {
			let total = 0
			this.assignment?.AssignmentConfig?.groups.forEach(group => {
				for (question of group.questions) {
					total += question.points
				}
			})
			return total
		},
		mappedItems: function () {
			return this.DSHocSinhByLopID.filter(item => !this.selectedClass.includes(item.LopID)).map(item => { return { title: item.TenLop + ` - ` + item.Ho + ' ' + item.Ten, value: item.HocSinhID, ...item } })
		},
		DSHocSinhAssigned: function () {
			return this.DSHocSinhByLopID.filter(item => item.disabled)
		}
	},
	methods: {
		onRemarkQuestion() {
			let number = 0
			this.assignment?.AssignmentConfig?.groups.forEach((group) => {
				group.questions = group.questions.map((x) => {
					number++ // tăng lần lượt 1, 2, 3, 4...
					x.ordinalNumber = number
					return x
				})
			})
		},
		async onOpenPreview() {
			const groups = this.assignment.AssignmentConfig.groups
			const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
			if (isNotChoose) {
				Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: "top" })
				return
			}
			await this.handleSave(true)
			openWindow({
				title: "Xem trước bài soạn",
				url: `/lms-tc-asm-preview?AssignmentID=${vueData.AssignmentID || 0}&AssignToClassID=${vueData.AssignToClassID || 0}`
			})
		},
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
		},
		openSheetAssignToClass() {
			const groups = this.assignment.AssignmentConfig.groups
			const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
			if (isNotChoose) {
				Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: "top" })
				return
			}
			this.isOpenSheetAssignToClass = true
		},
		openDialogAssignToStudent() {
			const groups = this.assignment.AssignmentConfig.groups
			const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
			if (isNotChoose) {
				Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: "top" })
				return
			}
			this.isOpenDialogForAssignToStudent = true
		},
		async onAssignToClassAndSave() {
			if (this.deadlines?.date == null || this.deadlines?.time == null) {
				Vue.$toast.error("Vui lòng nhập ngày giờ", { position: 'top' })
				return
			}
			if (this.selectedClass.length == 0) {
				Vue.$toast.error("Vui lòng chọn ít nhất 1 lớp để giao bài!", { position: 'top' })
				return
			}
			const d = { date: this.deadlines?.date, time: this.deadlines?.time };
			const due = this.getDue(d);
			// truyền true => isPushlish = true
			const groups = this.assignment.AssignmentConfig.groups
			const isNotFullQuiz = vueData.isCheckAllGroupFullQuiz(groups)
			await this.handleSave(true)
			await new Promise(resolve => setTimeout(resolve, 1000)) // thực sự delay 2s


			Vue.$toast.success("Lưu bài và giao bài thành công!", { position: 'top' });
			this.isOpenDialogForAssignToStudent = false
			// Quay về trang dashboard

			window.open("/lms-teacher-dashboard", '_parent');
		},
		async onAssignToStudentAndSave() {
			if (this.deadlines?.date == null || this.deadlines?.time == null) {
				Vue.$toast.error("Vui lòng nhập ngày giờ", { position: 'top' })
				return
			}
			if (this.DSHocSinhSelected.length == 0 && this.selectedClass.length == 0) {
				Vue.$toast.error("Vui lòng chọn ít nhất 1 lớp hoặc 1 học sinh để giao bài!", { position: 'top' })
				return
			}
			this.isLoadDSHocSinh = true
			const d = { date: this.deadlines?.date, time: this.deadlines?.time };
			const due = this.getDue(d);
			// truyền true => isPushlish = true
			const groups = this.assignment.AssignmentConfig.groups
			const isNotFullQuiz = vueData.isCheckAllGroupFullQuiz(groups)
			await this.handleSave(true)
			await new Promise(resolve => setTimeout(resolve, 500)) // thực sự delay 2s
			if (this.DSHocSinhSelected.length > 0) {
				let isReponse = await new Promise((resolve, reject) => {
					for (item of this.DSHocSinhSelected) {
						const payload = [{
							LopID: item.LopID,
							HocSinhID: item.HocSinhID,
							DueDate: due,
							MaxScore: this.totalScoreAsm, // thêm nếu cần
							Status: 1,
							ResourceType: "ASSIGNMENT",
							ResourceID: vueData.AssignmentID,
							LimitAssigned: 1,
							Is_Full_Quiz: !isNotFullQuiz ? 1 : 0
						}]

						ajaxCALL("/lms/EL_Teacher_AssignToStudent", {
							AssignmentID: vueData.AssignmentID,
							JsonStudentItems: payload
						});
						console.log('payload----', item, ' nnn--- ', payload)
					}
					resolve()
				})
			}
			if (this.selectedClass.length > 0) {
				let isReponse = await new Promise((resolve, reject) => {
					for (item of this.selectedClass) {
						const payload = [{
							LopID: item,
							DueDate: due,
							MaxScore: this.totalScoreAsm, // thêm nếu cần
							Status: 1,
							ResourceType: "ASSIGNMENT",
							ResourceID: vueData.AssignmentID,
							LimitAssigned: 1,
							Is_Full_Quiz: !isNotFullQuiz ? 1 : 0
						}]

						ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
							AssignmentID: vueData.AssignmentID,
							JsonClassItems: payload,
							ListTeacherPermission: this.GiaoVienPermissionSelected.length > 0 ? this.GiaoVienPermissionSelected.join(',') : ''
						});
						console.log('payload----', item, ' nnn--- ', payload)
					}
					resolve()
				})
			}
			Vue.$toast.success("Lưu bài và giao bài thành công!", { position: 'top' });
			this.isLoadDSHocSinh = false
			// Quay về trang dashboard
			window.open("/lms-teacher-dashboard", '_parent');
		},
		addComponent(componentInfo) {
			console.log('componentInfo', componentInfo)
			const newGroups = [...JSON.parse(JSON.stringify(this.assignment.AssignmentConfig.groups))];
			let ordinalNumber = 1;
			let previousQuestion = 1
			for (let i = 0; i < newGroups.length; i++) {
				if (newGroups[i].questions.length > 0) {
					ordinalNumber += newGroups[i].questions.length;
					previousQuestion = ordinalNumber
				}
				else ordinalNumber = previousQuestion
			}

			const newQuestion = {
				id: `q_${Date.now()}`,
				type: componentInfo.type,
				label: componentInfo.label,
				skills: [],
				ordinalNumber,
				points: 1.0,
				gradingType: 'auto',
				config: {
					media: {
						type: "YOUTUBE", //DEFAULT
						sourceYT: {
							id: "",
							name: "",
							source: ""
						},
						sourceRecord: {
							id: "",
							name: "",
							source: ""
						},
						sourceFiles: {
							file: [],
							image: []
						}
					},
					isAdvanced: false,
					questionText: ''
				}
			};

			switch (componentInfo.type) {
				case 'QUIZ_SINGLE_CHOICE':
					newQuestion.config.options = [{ id: `opt_1`, text: 'Lựa chọn A' }, { id: `opt_2`, text: 'Lựa chọn B' }, { id: `opt_3`, text: 'Lựa chọn C' }, { id: `opt_4`, text: 'Lựa chọn D' }];
					newQuestion.config.correctAnswer = null;
					break;
				case 'QUIZ_MULTIPLE_CHOICE':
					newQuestion.config.options = [{ id: `opt_1`, text: 'Lựa chọn A' }, { id: `opt_2`, text: 'Lựa chọn B' }, { id: `opt_3`, text: 'Lựa chọn C' }, { id: `opt_5`, text: 'Lựa chọn D' }];
					newQuestion.config.correctAnswers = [];
					break;
				case 'QUIZ_TRUE_FALSE':
					newQuestion.config.statement = "Mệnh đề cần xác định đúng/sai.";
					newQuestion.config.correctAnswer = true;
					break;
				case 'QUIZ_MULTIPLE_TRUE_FALSE':
					newQuestion.config.options = [{ id: 'a', text: '', correctAnswer: null, inCorrectAnswer: null }]
					break;
				case 'QUIZ_FILL_IN_BLANK':
					newQuestion.config.parts = [
						{ type: 'text', value: 'Điền vào ' },
						{ type: 'blank', id: 'blank_1', acceptedAnswers: ['chỗ trống'] },
						{ type: 'text', value: ' này.' }
					];
					break;
				case 'QUIZ_MATCHING':
					newQuestion.config.columnA = []
					newQuestion.config.columnB = []
					newQuestion.config.correctPairs = []
					break
				case 'QUIZ_MATCHING_V2':
					newQuestion.config.columnA = []
					newQuestion.config.columnB = []
					newQuestion.config.correctPairs = []
					break
				case 'ESSAY':
					newQuestion.gradingType = 'manual';
					// newQuestion.config.media = {
					// 	"type": "IMAGE_GALLERY",
					// 	"sources": []
					// }
					// console.log('newQuestion', newQuestion)
					break;
				case 'SHORT_ANSWER':
					newQuestion.gradingType = 'manual';
					break;
				case 'FILE_UPLOAD':
					newQuestion.gradingType = 'manual';
					// newQuestion.config.media = {
					// 	"type": "FILE_UPLOAD",
					// 	"sources": ""
					// }
					break;
				case 'AUDIO_RESPONSE':
					newQuestion.gradingType = 'manual';
					// newQuestion.config.media = {
					// 	"type": "AUDIO_RESPONSE",
					// 	"sourceYT": "",
					// 	"sourceIMG": "",
					// 	"sourceRecord": "",
					// }
					break;
			}

			if (newGroups.length > 0) {
				newGroups[newGroups.length - 1].questions.push(newQuestion);
			} else {
				newGroups.push({
					id: `group_${Date.now()}`,
					title: 'Phần 1',
					description: '',
					media: {
						type: "YOUTUBE",
						sourceYT: {
							id: "",
							source: "",
							name: ""
						},
						sourceRecord: {
							id: "",
							source: "",
							name: ""
						},
						sourceFiles: {
							file: [],
							image: []
						}
					},
					questions: [newQuestion]
				});
			}
			this.updateGroups(newGroups);
			this.selectedItem = { type: 'question', groupIndex: newGroups.length - 1, qIndex: newGroups[newGroups.length - 1].questions.length - 1 };
		},
		updateGroups(newGroups) {
			this.assignment.AssignmentConfig.groups = newGroups.map(item => {
				if (!item.media) {
					let media = {
						type: "YOUTUBE",
						sourceYT: {
							id: "",
							source: "",
							name: ""
						},
						sourceRecord: {
							id: "",
							source: "",
							name: ""
						},
						sourceFiles: {
							file: [],
							image: []
						}
					}
					return { ...item, media }
				} else {
					return item
				}
			});
		},
		async handleSave(isPublishing) {
			console.log('luu......')
			const groups = this.assignment.AssignmentConfig.groups
			const { message, isNotChoose } = vueData.isCheckGroupHasAnswerQuestionNotChoose(groups)
			if (isNotChoose) {
				Vue.$toast.warning(message + ' chưa có đáp án. Vui lòng kiểm tra lại.', { position: "top" })
				return
			}
			const isNotFullQuiz = vueData.isCheckAllGroupFullQuiz(groups)
			const payload = {
				assignment: this.assignment,
				isPublishing: isPublishing,
				Is_Full_Quiz: !isNotFullQuiz,
				setting: this.setting
			};
			console.log('payload', payload)

			await this.onSave(payload);
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
		loadDSHocSinhByDSLopID(DSLopID) {
			return new Promise((resolve, reject) => {
				ajaxCALL('/lms/HocSinhLop_GetByLopIDList', { DSLopID, AssignmentID: vueData.AssignmentID }, (res) => {
					if (res && res.data) {
						resolve(res.data.map(item => {
							return {
								...item, isSelected: false, disabled: item.Is_Assigned == 1 ? true : false
							}
						}));
					} else {
						resolve([]);
					}
				});
			});
		},
		loadDSHocSinhAssignedByLopID(LopID) {

			return new Promise((resolve, reject) => {
				ajaxCALL('/lms/Teacher_GetDSHocSinh_AssignToStudent_ByLopID', { LopID, AssignmentID: vueData.AssignmentID }, (res) => {
					if (res && res.data) {
						resolve(res.data);
					} else {
						resolve([]);
					}
				});
			});
		},
		async loadDSGiaoVien_Permission() {

			let data = await new Promise((resolve, reject) => {
				ajaxCALL('/lms/EL_Teacher_GetTeacherByMonHocID', {
					MonHocID: vueData.assignment.MonHocID,
					AssignmentID: vueData.AssignmentID,
					HocKi: vueData.NienKhoaItem.HocKi
				}, (res) => {
					if (res && res.data) {
						resolve(res.data);
					} else {
						resolve([]);
					}
				});
			})
			this.DSGiaoVien_Permission = data
		},
	},
	watch: {
		initialAssignment: {
			handler(newVal) {
				if (newVal) {
					this.assignment = JSON.parse(JSON.stringify(newVal));
				}
			},
			immediate: true,
			deep: true
		},
		selectedItem: function (item) {
			this.fileAudio = null
		},
		assignment: {
			handler(newVal) {
				if (newVal && this.isEditMode) {
					vueData.AssignmentDataLog = _.cloneDeep(newVal);
				}
			},
			deep: true
		},
		selectedClass: {
			handler(newVal) {
				if (this.selectedClass.length > 0) {
					this.DSHocSinhSelected = this.DSHocSinhSelected.filter(item => !this.selectedClass.includes(item.LopID))
				}
			},
			deep: true
		},
		isOpenDialogForAssignToStudent: {
			async handler(newVal) {
				if (newVal) {
					this.GiaoVienPermissionSelected = []
					let DSLop = JSON.stringify(this.classOptions.map(item => item.LopID))
					this.DSHocSinhByLopID = await this.loadDSHocSinhByDSLopID(DSLop)
					console.log('this.DSHocSinhByLopID', this.DSHocSinhByLopID)
					this.loadDSGiaoVien_Permission()
				} else {
					this.deadlines = {
						date: null,
						time: null
					}
				}

			},
			deep: true
		},
	}
}
</script>