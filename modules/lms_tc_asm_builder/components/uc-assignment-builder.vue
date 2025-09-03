<template>
	<div class="assignment-builder">
		<v-row class="ma-0">
			<v-col cols="12" md="3">
				<uc-assignment-component-library @add-component="addComponent"
					style="height: calc(100dvh - 73px); overflow: auto"></uc-assignment-component-library>

				<v-divider />
				<div class="mt-4">
					<p class="text-display text-center">Tổng điểm <v-chip color="primary">
							{{totalScoreAsm}}</v-chip></p>
				</div>
				<!-- Component uc-quiz-importer của bạn có thể đặt ở đây -->
			</v-col>

			<v-col cols="12" md="6" style="height: calc(100dvh); overflow: auto">
				<uc-assignment-canvas :groups="assignment?.AssignmentConfig?.groups" :selected-item="selectedItem"
					@update:groups="updateGroups" @update:selected-item="selectedItem = $event" />
			</v-col>

			<v-col cols="12" md="3">
				<div style="height: calc(100dvh - 60px); overflow: auto;">
					<uc-assignment-properties :groups="assignment.AssignmentConfig?.groups" :item="selectedItem"
						@update:groups="updateGroups" />
				</div>
				<v-row dense>
					<v-col :cols="!vueData.AssignToClassID ? 6 : 12">
						<v-btn color="primary" block elevation="2" @click="handleSave(true)">
							Lưu bài tập
						</v-btn>
					</v-col>
					<v-col cols="6" v-if="!vueData.AssignToClassID">
						<v-btn color="success" block elevation="2" @click="openSheetAssignToClass">
							Lưu bài tập và giao bài
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
		<uc-loading-page v-model="loadingPage.isLoading" v-model:text="loadingPage.text" />
		<v-bottom-sheet v-model="isOpenSheetAssignToClass" persistent inset>
			<v-card height="fit-content">
				<v-card-title class="bg-warning d-flex">
					<span class="text-white">Giao bài tập</span>
					<v-spacer></v-spacer>
					<v-btn variant="text" icon="mdi-close" color="white"
						@click="isOpenSheetAssignToClass=false"></v-btn>
				</v-card-title>
				<v-card-text>
					<v-row dense class="mb-3">
						<v-col cols="12">
							<p class="text-subtitle-2 mb-3">Thời gian</p>
							<div class="d-flex ga-3">
								<v-text-field :model-value="formattedDate(deadlines?.date)" label="Ngày hết hạn"
									readonly variant="outlined" @click="openDate(id)" />
								<v-text-field :model-value="formattedTime(deadlines?.time)" label="Giờ hết hạn" readonly
									variant="outlined" @click="openTime(id)" />
							</div>
						</v-col>
					</v-row>
					<div class="d-flex">
						<p class="text-subtitle-2">Danh sách lớp</p>
						<v-spacer></v-spacer>
						<div class="d-flex ga-2" @click='selectedAllClass()'>
							<v-checkbox color="success" :indeterminate="isIndeterminate" v-model="isAllSelected"
								label="Chọn tất cả">
							</v-checkbox>
						</div>
					</div>
					<div class="d-flex ga-5">
						<div v-for="item in classOptions" class="d-flex ga-1 justify-center align-center">
							<v-checkbox v-model='selectedClass' :key="item.LopID" :value="item.LopID" color="success">
							</v-checkbox>
							<p>{{item.TenLop}}</p>
						</div>

					</div>

				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn variant="text" color="primary" @click="onAssignToClassAndSave">Giao bài</v-btn>
				</v-card-actions>
			</v-card>
		</v-bottom-sheet>
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
			return {
				timeDialogVisible: false,
				dateDialogVisible: false,
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
				classAssigned: []
			}
		},
		mounted() {
			ajaxCALL("/lms/EL_Teacher_GetGroupedDashboard", {
	
			}, (res) => {
				const assignment = { ...vueData.assignment }
				const id = assignment.AssignmentID
				this.classAssigned = (res?.data[2] || []).filter(x => x.AssignmentID == id);
	
				let classAssignedByKhoiMon = (res?.data[1] || []).filter(
					c => c.KhoiID == assignment.KhoiID && c.MonHocID == assignment.MonHocID
				);
	
				const assignedLopIDs = this.classAssigned.map(c => c.LopID);
	
				this.classOptions = classAssignedByKhoiMon.filter(
					item => !assignedLopIDs.includes(item.LopID)
				);
	
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
					Vue.$toast.error("Vui lòng nhập ngày giờ", { position: 'top' })
					return
				}
				if (this.selectedClass.length == 0) {
					Vue.$toast.error("Vui lòng chọn ít nhất 1 lớp để giao bài!", { position: 'top' })
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
							ResourceType: "ASSIGNMENT",
							ResourceID: vueData.AssignmentID
						}]
	
						ajaxCALL("/lms/EL_Teacher_AssignToClasses_CLASS", {
							AssignmentID: vueData.AssignmentID,
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
				Vue.$toast.success("Lưu bài và giao bài thành công!", { position: 'top' });
				this.isOpenSheetAssignToClass = false
				await setTimeout(() => { }, 2000)
				window.open("/lms-teacher-dashboard",'_parent');
			},
			addComponent(componentInfo) {
				const newQuestion = {
					id: `q_${Date.now()}`,
					type: componentInfo.type,
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
							sourceIMGs: [],
							sourceRecord: {
								id: "",
								name: "",
								source: ""
							},
							sourceFiles: []
						},
						isAdvanced: false,
						questionText: 'Nội dung câu hỏi mới...'
					}
				};
				console.log('type', componentInfo.type)
				switch (componentInfo.type) {
					case 'QUIZ_SINGLE_CHOICE':
						newQuestion.config.options = [{ id: `opt_1`, text: 'Lựa chọn A' }, { id: `opt_2`, text: 'Lựa chọn B' }];
						newQuestion.config.correctAnswer = null;
						break;
					case 'QUIZ_MULTIPLE_CHOICE':
						newQuestion.config.options = [{ id: `opt_1`, text: 'Lựa chọn A' }, { id: `opt_2`, text: 'Lựa chọn B' }];
						newQuestion.config.correctAnswers = [];
						break;
					case 'QUIZ_TRUE_FALSE':
						newQuestion.config.statement = "Mệnh đề cần xác định đúng/sai.";
						newQuestion.config.correctAnswer = true;
						break;
					case 'QUIZ_MULTIPLE_TRUE_FALSE':
						console.log('add....')
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
					case 'ESSAY':
						// newQuestion.config.media = {
						// 	"type": "IMAGE_GALLERY",
						// 	"sources": []
						// }
						// console.log('newQuestion', newQuestion)
						break;
					case 'SHORT_ANSWER':
						break;
					case 'FILE_UPLOAD':
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
	
				const newGroups = JSON.parse(JSON.stringify(this.assignment.AssignmentConfig.groups));
				if (newGroups.length > 0) {
					newGroups[newGroups.length - 1].questions.push(newQuestion);
				} else {
					newGroups.push({
						id: `group_${Date.now()}`,
						title: 'Phần 1',
						description: '',
						questions: [newQuestion]
					});
				}
				this.updateGroups(newGroups);
				this.selectedItem = { type: 'question', groupIndex: newGroups.length - 1, qIndex: newGroups[newGroups.length - 1].questions.length - 1 };
	
			},
			updateGroups(newGroups) {
				this.assignment.AssignmentConfig.groups = newGroups;
			},
			async handleSave(isPublishing) {
				const payload = {
					assignment: this.assignment,
					isPublishing: isPublishing
				};
				//Thực thi đẩy file record 
				console.log('this.', this.selectedItem)
				console.log('groups.', this.assignment.AssignmentConfig.groups)
	
				//const indexGroup = this.selectedItem.groupIndex
				//const indexQuestion = this.selectedItem.qIndex
				//const question = this.assignment.AssignmentConfig.groups[indexGroup].questions[indexQuestion]
	
	
				console.log('file', this.fileAudio)
				//await this.uploadToGoogleDrive(this.fileAudio)
				await this.onSave(payload);
			},
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => {
						if (res?.data) { resolve(res.data) }
						else { resolve(res) }
					})
				})
			},
			async ensureFolderPathExists(path, access_token) {
				const parts = path.split('/');
				let parentId = 'root';
	
				for (const part of parts) {
					parentId = await this.getOrCreateFolderId(part, parentId, access_token);
				}
	
				return parentId; // Trả về folder cuối cùng
			},
			async getOrCreateFolderId(folderName, parentId = 'root', access_token) {
				const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`;
	
				const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
					headers: {
						Authorization: `Bearer ${access_token}`,
					},
				});
	
				const data = await res.json();
				if (data.files.length > 0) return data.files[0].id;
	
				// ⛏️ Nếu không có, tạo thư mục
				const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${access_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: folderName,
						mimeType: 'application/vnd.google-apps.folder',
						parents: [parentId],
					}),
				});
	
				const created = await createRes.json();
				return created.id;
			},
			async uploadToGoogleDrive(file) {
				//Trường hợp vô if
				//Khi nội dung source ko có thay đổi, vẫn là file cũ thì sẽ ko có "file"
				//Nêu ghi âm thì sẽ có file mới thì sẽ bảo qua điều kiện if
				if (!file) return
	
				this.loadingPage.isLoading = true
				this.loadingPage.text = "Đang tải dữ liệu..."
	
				//Lấy Token từ câu gọi Youtube
				const { access_token } = await this.ajaxCALLPromise('lms/FP_Youtube_Token_Get')
	
				this.loadingPage.text = "Đang tìm kiếm folder..."
				const pathPrefix = `LMS/${vueData.assignment.MonHocName} ${vueData.assignment.KhoiID}/${vueData.assignment.Title}/${vueData.user.UserID}`
				const folderId = await this.ensureFolderPathExists(pathPrefix, access_token);
	
				const metadata = {
					name: file.name,
					mimeType: file.type,
					parents: [folderId],
				};
	
				const form = new FormData();
				form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
				form.append('file', file);
	
				this.loadingPage.text = "Đang upload..."
				const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
					method: 'POST',
					headers: new Headers({ Authorization: 'Bearer ' + access_token }),
					body: form,
				});
	
				const fileDrive = await res.json();
	
				this.loadingPage.text = "Đang cấp quyền file..."
				//Cấp quyền cho file được công khai
				const reponse_permision = await fetch(`https://www.googleapis.com/drive/v3/files/${fileDrive?.id}/permissions`, {
					method: 'POST',
					headers: {
						Authorization: 'Bearer ' + access_token
					},
					body: JSON.stringify({
						role: 'reader', // Quyền xem
						type: 'anyone', // Bất kỳ ai
					}),
				});
	
				//Khi cập nhật permision xong thì lưu lại vào trong json editableItem
				if (reponse_permision.ok) {
					const driveFileUrl = `https://drive.google.com/file/d/${fileDrive.id}/preview`
					this.loadingPage.isLoading = false
	
	
					const newGroups = [...this.assignment.AssignmentConfig.groups]
					const group = newGroups[this.selectedItem.groupIndex]
					const question = group.questions[this.selectedItem.qIndex]
					console.log('group', group)
					console.log('question', question)
					question.config.media.sourceRecord = driveFileUrl
					console.log('newGroups', newGroups)
					this.updateGroups(newGroups)
					// this.selectedItem.config.media.source = driveFileUrl
				}
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
			}
		}
	}
</script>

<style scoped>
	.bottom-actions {
		position: sticky;
		bottom: 0;
		background-color: white;
		padding: 16px;
		border-top: 1px solid #e0e0e0;
		display: flex;
		gap: 8px;
		z-index: 10;
	}
</style>