<template>
	<v-card variant="flat" class="submission-stats-card">
		<div v-if="loading" class="pa-4">
			<v-skeleton-loader type="card-avatar, article"></v-skeleton-loader>
		</div>
		<v-card-text v-else class="pa-1">
			<v-row align="center" dense class="stats-header-row">
				<v-col cols="12" md="8" class="border-e-md ">
					<div>
						<div class=" d-flex align-baseline ga-2">
							<div class="text-overline">{{ $t('message.Statistics') }}:</div>
							<div class="text-subtitle-1 font-weight-medium text-black" :title="assignmentTitle">
								{{ assignmentTitle || $t('message.PleaseSelectAssignment') }}
							</div>
						</div>
					</div>
					<div class="mb-1">
						<div class="text-overline">{{ $t('message.LimitAssigned') }}: <b class="text-pink-darken-1">
								{{ assignmentInfo?.LimitAssigned ?? 1 }}</b>
						</div>
					</div>
					<!-- Hàng chứa các bộ lọc -->
					<v-row dense>
						<!-- <v-col cols="4" sm="2">
							<v-select v-model="AssignType"
								:items="[{ title: 'Giao bài theo lớp', value: 1 }, { title: 'Giao bài học sinh', value: 0 }]"
								:label="$i18n.locale == 'en' ? 'Assigned Type' : 'Hình thức giao bài'"
								variant="outlined" density="compact" hide-details
								@update:modelValue="handleChangeAssignType" />
						</v-col> -->
						<v-col cols="4" sm="2">
							<v-select v-model="selectedKhoiID" :items="DSKhoi"
								:item-title="(item) => renderTitleKhoi(item.KhoiID)" item-value="KhoiID" label="Khối"
								variant="outlined" density="compact" hide-details />
						</v-col>
						<v-col cols="4" sm="2">
							<v-select v-model="selectedMonHocID"
								:items="DSMonHoc.filter(item => item.KhoiID == selectedKhoiID)"
								item-title="TenMonHoc_HienThi" item-value="MonHocID" :label="$t('message.Subject')"
								variant="outlined" density="compact" hide-details :disabled="!selectedKhoiID" />
						</v-col>
						<v-col cols="12" sm="8" class="d-flex ga-2">
							<v-select v-model="selectedAssignToClassID" :items="assignmentList"
								item-title="AssignmentTitle" :item-value="(item) => mappingValue(item)"
								:label="$t('message.Assignment')" variant="outlined" density="compact" hide-details
								:disabled="!selectedMonHocID" />
							<v-btn variant="outlined" color="primary"
								@click="() => { this.loadAllDataForAssignment(this.selectedAssignToClassID) }"><v-icon
									size="small">mdi-refresh</v-icon>{{ $t('message.Refresh') }}</v-btn>
						</v-col>
					</v-row>
				</v-col>

				<!-- ======================================================= -->
				<!-- == CỘT BÊN PHẢI: THỐNG KÊ GỌN                       	== -->
				<!-- ======================================================= -->
				<v-col cols="12" md="4" class="d-flex align-center justify-space-around ">
					<!-- Thống kê Tỉ lệ nộp bài -->
					<div class="text-center">
						<div class="text-overline"  style="color:black">{{ $t('message.Submitted') }}</div>
						<div class="d-flex align-baseline justify-center">
							<div class="text-h4 font-weight-bold">{{ stats.SubmittedCount || 0 }}</div>
							<div class="text-h6" style="color:black">/{{ stats.TotalStudents || 0 }}</div>
						</div>
						<v-progress-linear :model-value="completionRate" :color="completionColor" height="8" rounded
							class="my-2 mx-auto" style="width: 120px;" />
						<div class="text-caption">{{ completionRate.toFixed(2) }}% {{ $t('message.Completed') }}</div>
					</div>

					<!-- Đường kẻ dọc phân cách -->
					<v-divider vertical class="mx-2"></v-divider>

					<!-- Thống kê Điểm Trung bình -->
					<div class="text-center">
						<div class="text-overline"  style="color:black">{{ $t('message.averageScore') }}</div>
						<div class="text-h4 font-weight-bold">{{ (stats.AverageScore || 0) }}</div>
						<div class="text-caption">{{ $t('message.OnScaleOf') }} {{ stats.MaxScore || '-' }}</div>
					</div>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>

	<!-- Bảng danh sách học sinh -->
	<v-card class="table-card mt-2">
		<v-card-title
			class="d-flex flex-column flex-md-row align-md-center align-start justify-md-space-between justify-start">
			<div v-if="!isMobile" class="d-flex ga-2 flex-wrap">{{ $t('message.studentList') }}
				<span class="text-primary text-body" style="font-size: 15px !important;"
					v-if="assignmentInfo?.LimitAssigned > 1">*{{ $t('message.NoticeHighestScoreSubmission') }}</span>
			</div>
			<div class="d-flex flex-column flex-md-row justify-md-end w-100 ga-2">
				<!-- <v-btn color="primary" variant="flat" :disabled="!studentSubmissions.length"
					@click.stop="viewClassReport" :size="isMobile ? 'small' : 'default'">
					{{ $t('message.ViewClassReport') }}
				</v-btn> -->
				<!-- <v-btn color="primary" variant="flat" :disabled="!studentSubmissions.length"
					@click.stop="onChamBaiAll()" :size="isMobile ? 'small' : 'default'">
					{{ $t('message.GradeAllAssignments') }}
				</v-btn> -->
				<v-text-field class="text-grey-darken-1" v-model="search" :label="$t('message.FindStudent')"
					prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details
					style="max-width: 300px;" />
			</div>

		</v-card-title>
		<v-data-table class="table-custom" :headers="headers" :items="processedSubmissions" :search="search"
			:items-per-page="-1" :mobile="isMobile" :loading="loading" :hide-default-footer="true"
			@update:sort-by="false" style="max-height: calc(100dvh - 197px)" density="compact"
			:show-expand="assignmentInfo?.LimitAssigned > 1 ? true : false" item-value="HocSinhID">

			<template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
				<v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
					:text="isExpanded(internalItem) ? $t('message.Close') : $t('message.ViewDetail')" class="text-none"
					color="medium-emphasis" size="small" variant="text" style="    min-width: fit-content !important;"
					border slim @click=" toggleExpand(internalItem); console.log('internalItem', internalItem)"
					:disabled="!internalItem.raw.SubmissionStatus"></v-btn>
			</template>

			<template v-slot:expanded-row="{ columns, item }">
				<tr>
					<td :colspan="columns.length" class="py-2">
						<v-sheet rounded="lg" border>
							<v-table density="compact" :mobile="isMobile">
								<tbody class="bg-surface-light">
									<tr>
										<th>{{ $t('message.SubmissionNumber') }}</th>
										<th>{{ $t('message.Status') }}</th>
										<th>{{ $t('message.SubmissionTime') }}</th>
										<th>{{ $t('message.Score') }}</th>
										<th></th>
									</tr>
								</tbody>

								<tbody>
									<tr v-for="(obj, index) in getAllAssigned(item)">
										<td class="py-2">
											<v-chip size="small" variant="flat" color="deep-orange-lighten-1"
												class="me-1" v-if="obj.Status !== 'NOT_SUBMITTED'">
												{{ $t('message.Attempt') }} {{ index + 1 }}
											</v-chip>
										</td>
										<td class="py-2">
											<v-chip :color="statusColors[item.Status]" size="small" variant="flat"
												class="font-weight-medium">
												{{ statusTexts[item.Status] }}
											</v-chip>
										</td>
										<td class="py-2"><span v-if="obj.SubmissionTime">{{
												formatDate(obj.SubmissionTime) }}</span>
											<span v-else class="text-medium-emphasis">—</span>
										</td>
										<td class="py-2">
											<span class="font-weight-bold" :class="getScoreColor(obj.Score)">
												{{ obj.Score != null ? obj.Score : '—' }}
											</span>
											<span class="font-weight-bold text-success"
												v-tooltip="$t('message.MaximumScore')">
												/{{ stats.MaxScore || '-' }}
											</span>
										</td>
										<td class="py-2 text-end">
											<v-btn size="small" color="primary" variant="flat"
												:disabled="!obj.SubmissionID || obj.SubmissionStatus == 1 || obj.SubmissionStatus == 0"
												@click.stop="RedirectToGrade(obj)">
												{{ obj.SubmissionStatus == 4 ? $t('message.ReviewGraded') :
												$t('message.GradeAssignment') }}
											</v-btn>
										</td>
									</tr>
								</tbody>
							</v-table>
						</v-sheet>

					</td>
				</tr>
			</template>
			<template #item.TenLop="{item, value}">
				<div class="text-muted">{{item.TenLop}}</div>
				</template>
			<template #item.HocSinhID="{ item }">
				<div class="text-muted">{{ item.HocSinhID }}</div>
			</template>
			<template #item.HoTen="{ item }">
				<div class="">{{ item.HoTen }}</div>
			</template>
			<template #item.Status="{ item }">
				<v-chip :color="statusColors[item.Status]" size="small" variant="text" class="font-weight-medium">
					{{ statusTexts[item.Status] }}
				</v-chip>
			</template>
			<template #item.SubmissionTime="{ item }">
				<div v-if="item.SubmissionTime" class="d-flex flex-column py-1">
					<div>
						<span>{{ formatDate(item.SubmissionTime) }}</span>
					</div>
					<div class="d-flex ga-2">
						<v-chip size="small" color="blue" variant="text">Số lần truy cập: <span
								class="font-weight-medium ms-1"> {{
								item.AccessTime ?? 'Chưa ghi nhận' }}</span></v-chip>
						<v-chip size="small" color="success" variant="text">Thời gian làm bài: <span
								class="font-weight-medium ms-1">
								{{ item.DurationTime ? secondsToMinuteSecond(item.DurationTime) : 'Chưa ghi nhận'
								}}</span></v-chip>
					</div>
				</div>
				<span v-else class="text-medium-emphasis">—</span>
			</template>
			<template #item.thongtinnopbai="{ item }">
				<div class="d-flex flex-wrap ga-2">
					<v-chip v-for="(obj, index) in getAllAssigned(item)" :key="index" :color="statusColors[obj.Status]"
						size="small" variant="flat" class="font-weight-medium "
						:class="obj.Status !== 'NOT_SUBMITTED' ? 'ps-0' : ''" style="min-height: fit-content;">
						<v-chip size="small" variant="flat" color="deep-orange-lighten-1" class="me-1"
							v-if="obj.Status !== 'NOT_SUBMITTED'">
							Lần {{ index + 1 }}
						</v-chip>
						{{
						statusTexts[obj.Status]
						}}
					</v-chip>
				</div>

			</template>
			<template #item.Score="{ item }">
				<span class="font-weight-bold" :class="getScoreColor(item.Score)">
					{{ item.Score != null ? item.Score : '—' }}
				</span>
				<span class="font-weight-bold text-success" v-tooltip="$t('message.MaximumScore')">
					/ {{ item.MaxScore != null ? item.MaxScore : '—' }}
				</span>
			</template>
			<!-- <template #item.IncorrectQuestionsJSON="{ item }">
				     <span v-if="item.SubmissionID"
				         :class="{'text-error font-weight-bold': item.IncorrectQuestionsJSON > 0, 'text-muted': item.IncorrectQuestionsJSON === 0 || item.IncorrectQuestionsJSON === null}">
				         {{ item.IncorrectQuestionsJSON === null ? '—' : item.IncorrectQuestionsJSON }}
				     </span>
				     <span v-else class="text-medium-emphasis">—</span>
				 </template> -->

			<!-- <template #item.note="{ item }">
				<i class="text-primary">Hệ thống ghi nhận lần nộp bài được chấm điểm cao nhất</i>
			</template> -->
			<template #item.actions="{ item }">
				<v-tooltip location="top">
					<template #activator="{ props }">
						<v-btn v-bind="props" icon size="small" variant="text" color="primary"
							:disabled="!item.SubmissionID || item.SubmissionStatus == 1 || item.SubmissionStatus == 0"
							@click.stop="RedirectToGrade(item)">
							<v-icon>
								{{ getGradeActionIcon(item.SubmissionStatus) }}
							</v-icon>
						</v-btn>
					</template>

					<span>
						{{ getGradeActionTooltip(item.SubmissionStatus) }}
					</span>
				</v-tooltip>
			</template>
			<template #no-data>
				<div class="text-center pa-4 text-medium-emphasis">
					{{ $t('message.PleaseSelectClassSubjectAssignment') }}
				</div>
			</template>
		</v-data-table>
	</v-card>
	<v-dialog v-model="isOpen" fullscreen>
		<v-card class="ChamBaiDialog" id="ChamBaiDialog" style=" position: sticky; top: 0 ;z-index:9999">
			<v-card-title class="d-flex bg-primary" style="max-height: 48px;">
				<span class="text-white">{{ $t('message.GradeAssignment') }}</span><v-spacer></v-spacer>
				<v-btn @click="onClose()" variant="text" icon="mdi-close"></v-btn>
			</v-card-title>
			<v-card-text class="pa-0 glass-Assignment" style="position: relative; height: 100vh;">
				<iframe class="position-absolute grade-list" :src="url" width="100%" allow="fullscreen"
					style="border:none;height: calc(100dvh - 48px);"></iframe>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-baocaobaitapdanop',
		props: {
			assigntoclassid: Number,
			assignmentid: Number,
			khoiid: Number,
			lopid: String,
			monhocid: Number
		},
		data() {
			const { mobile } = Vuetify.useDisplay()
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return {
				vueData,
				loading: false,
				lopList: [], monHocList: [], assignmentList: [],
				stats: {}, mostIncorrect: [], studentSubmissions: [],
				selectedLopID: null,
				selectedMonHocID: null,
				selectedAssignToClassID: this.assigntoclassid,
				search: '',
				headers: [],
				statusColors: { 'SUBMITTED': 'info', 'GRADED': 'success', 'NOT_SUBMITTED': 'grey', 'SAVE_DRAFT': 'purple', 'IN_PROGRESS': 'teal', 'RESUBMIT': 'warning' },
				statusTexts: {
					'SUBMITTED': this.$t('message.Submitted'),
					'GRADED': this.$t('message.Graded'),
					'NOT_SUBMITTED': this.$t('message.NotSubmitted'),
					'SAVE_DRAFT': this.$t('message.DraftGrading'),
					'IN_PROGRESS': this.$t('message.DoingAssignment'),
					'RESUBMIT': this.$t('message.ResubmissionRequested')
				},
				isOpen: false,
				url: "",
				isMobile: mobile,
				_,
				studentSubmissionsOriginal: [],
				DSMonHoc: [],
				DSKhoi: [],
				selectedKhoiID: null,
				AssignType: null
			}
		},
		computed: {
			assignmentTitle() {
				return this.assignmentList.find(a => a.AssignToStudentID === this.selectedAssignToClassID)?.AssignmentTitle || '...';
			},
			assignmentInfo() {
				return this.assignmentList.find(a => a.AssignToStudentID === this.selectedAssignToClassID) || {};
			},
			completionRate() {
				if (!this.stats.TotalStudents || this.stats.TotalStudents === 0) return 0;
				return ((this.stats.SubmittedCount || 0) / this.stats.TotalStudents) * 100;
			},
			processedSubmissions() {
				if (!this.studentSubmissions || !Array.isArray(this.studentSubmissions)) return [];
				const arr = this.studentSubmissions.map(item => ({
					TenLop: item.TenLop,
					HocSinhID: item.HocSinhID,
					SoDanhBo: item.SoDanhBo,
					HoTen: item.HoTen || 'Lỗi dữ liệu',
					Status: item.Status || 'NOT_SUBMITTED',
					SubmissionTime: item.SubmissionTime,
					Score: item.Score,
					IncorrectQuestionsJSON: item.IncorrectQuestionsJSON,
					SubmissionID: item.SubmissionID,
					SubmissionStatus: item.SubmissionStatus,
					SubmissionContent: item.SubmissionContent,
					MaxScore: this.stats.MaxScore,
					AccessTime: item.AccessTime,
					DurationTime: item.DurationTime
				}));
				console.log("arr", arr)
				return arr
			},
			completionColor() {
				const rate = this.completionRate;
				if (rate < 30) return 'error'; if (rate < 70) return 'warning'; return 'success';
			}
		},
		watch: {
			selectedKhoiID(newKhoiID, oldLopID) {
				if (newKhoiID && newKhoiID !== oldLopID) {
					this.selectedMonHocID = null;
					this.assignmentList = []; this.selectedAssignToClassID = null;
					console.log('run watch')
					this.selectedMonHocID = this.DSMonHoc.filter(item => item.KhoiID == this.selectedKhoiID).find(x => x.MonHocID == parseInt(this.monhocid))?.MonHocID ?? this.DSMonHoc.some(item => item.KhoiID == this.selectedKhoiID)?.MonHocID;
					console.log('this.DSMonHoc', this.DSMonHoc)
					this.clearReportData();
				}
			},
			selectedMonHocID(newMonHocID, oldMonHocID) {
				if (newMonHocID && newMonHocID !== oldMonHocID) {
					this.assignmentList = []; this.selectedAssignToClassID = null;
					this.clearReportData();
					if (this.selectedKhoiID) {
						this.fetchAssignmentsByClass(this.selectedKhoiID, newMonHocID);
					}
	
				}
			},
			selectedAssignToClassID(newId, oldId) {
				console.log('newId', newId)
				if (newId && newId !== oldId) {
					vueData.AssignToStudentID_FromURL = newId
					this.loadAllDataForAssignment(newId);
				}
			},
			lopid(newVal, oldVal) {
			},
			isOpen(val) {
				if (val) {
					let dom = document.getElementsByClassName("v-toolbar")[2]
					if (dom) {
						dom.style.display = 'none'
	
					}
				} else {
					let dom = document.getElementsByClassName("v-toolbar")[2]
					if (dom) {
						dom.style.display = 'block'
					}
				}
			},
			'vueData.NienKhoa'(val) {
				if (val) {
					console.log(val)
				}
			},
			AssignType(val) {
				if (val) {
					// vueData.AssignType = (val == 1 ? 'CLASS' : 'STUDENT')
					// vueData.keyComp++
				}
			}
		},
		methods: {
			getGradeActionIcon(status) {
				return status === 4
					? 'mdi-eye-outline'
					: 'mdi-clipboard-check-outline'
			},
	
			getGradeActionTooltip(status) {
				return status === 4
					? this.$t('message.ReviewGraded')
					: this.$t('message.GradeAssignment')
			},
			onChamBaiAll() {
				const $this = this
				confirm({
					title: "Xác nhận chấm tất cả bài",
					action: () => {
						let AsmConfigString = $this.assignmentList.find(a => a.AssignToClassID === $this.selectedAssignToClassID)?.AssignmentConfig ?? null
						if (!AsmConfigString) return
	
						const AsmConfig = JSON.parse(AsmConfigString)
						let isNotExistQuiz = false
						for (var group of AsmConfig.groups) {
							for (var question of group.questions) {
								if (!question.type.includes('QUIZ')) isNotExistQuiz = true
							}
						}
						if (isNotExistQuiz) {
							Vue.$toast.warning('Bài tập đang có dạng không phải trắc nghiệm. Vui lòng chấm bài từng học sinh', { position: "top" })
							return
						}
	
						//Lấy học sinh đã nộp hoặc giáo viên đã chấm nháp
						const DSHocSinhSubmited = $this.studentSubmissionsOriginal.filter(x => x.SubmissionStatus === 2 || x.SubmissionStatus === 3)
						const DSHocSinhGraded = []
						for (var hocSinh of DSHocSinhSubmited) {
							const { SubmissionContent, Score } = $this.fn_ChamBaiStudent(hocSinh, AsmConfig)
							if (!SubmissionContent && !Score) continue
							hocSinh.SubmissionContent = SubmissionContent
							hocSinh.Score = Score
							DSHocSinhGraded.push(hocSinh)
						}
	
						console.log('DSHocSinhGraded', DSHocSinhGraded)
						ajaxCALL("lms/EL_Teacher_PublishGrade_Multiple", {
							Json_HocSinhSubmited: DSHocSinhGraded
						}, res => {
							$this.loadAllDataForAssignment(vueData.AssignToStudentID_FromURL)
						})
					}
				})
			},
			fn_ChamBaiStudent(hocSinh, AsmConfig) {
				if (!hocSinh.SubmissionContent) return { SubmissionContent: null, Score: null }
				const SubmissionContent = JSON.parse(hocSinh.SubmissionContent)
				let answers = SubmissionContent?.answers ?? {}
	
				let Score = 0
	
				for (var group of AsmConfig.groups) {
					for (var question of group.questions) {
						let manualScore = 0
						const answerData = answers[question.id]?.answerData
						//Nếu học sinh k trả lời bài thì return => ko cần tính cộng điểm
						if (!answerData) continue
	
						if (question.type === "QUIZ_SINGLE_CHOICE") {
							if (question.config.correctAnswer == answerData) {
								Score += question.points
								manualScore = question.points
							}
						}
						else if (question.type === "QUIZ_MULTIPLE_CHOICE") {
							const arr1 = question.config.correctAnswers
							const mode = question.config.scoringMode || 'equal'
							let correctIndex = 0
							arr1.forEach(opt => { if (answerData.includes(opt)) correctIndex++ })
							if (mode === 'partial') {
								const partialMap = { 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 }
								manualScore = partialMap[correctIndex] ?? 0
							} else {
								manualScore = arr1.length ? Math.round((correctIndex / arr1.length) * question.points * 100) / 100 : 0
							}
							Score += manualScore
						}
						else if (question.type === "QUIZ_TRUE_FALSE") {
							if (question.config.correctAnswer == answerData) {
								Score += question.points
								manualScore = question.points
							}
						}
						else if (question.type === "QUIZ_MULTIPLE_TRUE_FALSE") {
							let flag = false
							for (var option of question.config.options) {
								if (option.correctAnswer === answerData[option.id]) {
	
								}
							}
							if (flag) {
								Score += question.points
								manualScore = question.points
							}
						}
						else if (question.type === "QUIZ_MATCHING") {
							let numberOfCorrect = 0
							const correctPairs = question.config.correctPairs
							correctPairs.forEach(q => {
								let findAnswer = answerData.find(a => a.from == q.from)
								if (findAnswer) {
									if (findAnswer.to == q.to) {
										numberOfCorrect += 1
									}
								}
							})
							const pts = Number(question?.points ?? 0)
							manualScore = (numberOfCorrect / correctPairs.length) * pts
							Score += manualScore
						}
						else if (question.type === "QUIZ_FILL_IN_BLANK") {
							const parts = question.config.parts || []
							const blanks = parts.filter(p => p.type === 'blank')
							if (blanks.length === 0) {
								manualScore = question.points
							} else {
								let correctsAnswer = 0
								blanks.forEach(x => {
									const answerToLowerCase = answerData[x.id].toLowerCase().trim() ?? ''
									if (x.acceptedAnswers.map(item => item.toLowerCase().trim()).includes(answerToLowerCase)) {
										correctsAnswer += 1
									}
								})
								const pts = Number(question?.points ?? 0)
								manualScore = (correctsAnswer / blanks.length) * pts
								Score += manualScore
							}
						}
						answers = {
							...answers,
							[question.id]: {
								...answers[question.id],
								grading: {
									...answers[question.id].grading,
									manualScore: manualScore
								}
							}
						}
	
					}
				}
				let dataSubmissionContentReturn = {
					answers: answers,
				}
				return {
					SubmissionContent: JSON.stringify(dataSubmissionContentReturn),
					Score
				}
			},
			clearReportData() {
				this.stats = {};
				this.mostIncorrect = [];
				this.studentSubmissions = [];
			},
			async initialize() {
				vueData.loading = true;
				await this.fetchKhoiLop();
				vueData.loading = false;
			},
			async loadAllDataForAssignment(AssignToStudentID) {
				if (!AssignToStudentID) return
				vueData.loading = true;
				await Promise.all([
					this.fetchAssignmentStatsAssignToStudent(AssignToStudentID),
					this.fetchMostIncorrectQuestionsAssignToStudent(AssignToStudentID),
					this.fetchStudentSubmissionsAssignToStudent(AssignToStudentID)
				]);
				vueData.loading = false;
			},
			async fetchKhoiLop() {
				let data = await this.getKhoi_Lop()
				this.DSKhoi = data[0]
				this.DSMonHoc = data[1]
				console.log('this.DSKhoi ', this.DSKhoi)
				this.selectedKhoiID = this.DSKhoi.find(item => item.KhoiID == vueData.KhoiID_FromURL)?.KhoiID ?? data[0].KhoiID
				console.log('this.selectedMonHocID ', this.selectedMonHocID)
			},
			async fetchSubjectsByClass(lopId) {
				await ajaxCALL("lms/EL_Teacher_GetSubjectsByClass", { LopID: lopId, HocKi: vueData.NienKhoaItem?.HocKi }, (res) => {
					this.monHocList = res.data || [];
					if (this.monHocList.length > 0) {
						this.selectedMonHocID = this.monHocList.find(x => x.MonHocID == parseInt(this.monhocid))?.MonHocID ?? this.monHocList[0].MonHocID;
					}
				});
			},
			async fetchAssignmentsByClass(lopId, monHocId) {
				ajaxCALL("lms/EL_Teacher_GetAssignmentsByClass_AssignToStudent", { KhoiID: this.selectedKhoiID, MonHocID: monHocId, HocKi: vueData.NienKhoaItem?.HocKi }, (res) => {
					this.assignmentList = res.data || [];
					if (this.assignmentList.length > 0) {
						// console.log('this.assignmentList', this.assignmentList)
						// console.log('vueData.AssignToStudentID_FromURL', vueData.AssignToStudentID_FromURL)
						// console.log('this.assignmentList.find(x => x.AssignToStudentID == vueData.AssignToStudentID_FromURL)?.AssignToStudentID', this.assignmentList.find(x => x.AssignToStudentID == vueData.AssignToStudentID_FromURL)?.AssignToStudentID)
						this.selectedAssignToClassID = this.assignmentList.find(x => x.AssignToStudentID == vueData.AssignToStudentID_FromURL)?.AssignToStudentID ?? this.assignmentList[0].AssignToStudentID;
					}
					if (this.assignmentInfo && (this.assignmentInfo.LimitAssigned == 1 || this.assignmentInfo.LimitAssigned == null)) {
						this.headers = [
							{ title: this.$t('message.Classname'), key: 'TenLop', value: "TenLop", sortable: false, width: 100, align: 'center' },
							{ title: this.$t('message.StudentID'), key: 'HocSinhID', sortable: false, width: 100, align: 'center' },
							{ title: this.$t('message.StudentName'), key: 'HoTen', sortable: false, width: 300 },
							{ title: this.$t('message.Status'), key: 'Status', sortable: true },
							{ title: this.$t('message.SubmissionTime'), key: 'SubmissionTime', sortable: true },
							{ title: this.$t('message.Score'), key: 'Score', sortable: true },
							{ title: this.$t('message.GradeAssignment'), key: 'actions', sortable: false, align: 'end' }]
					} else {
						this.headers = [
							{ title: this.$t('message.Classname'), key: 'TenLop', sortable: false, width: 100 },
							{ title: this.$t('message.StudentID'), key: 'HocSinhID', sortable: false, width: 100, align: 'center' },
							{ title: this.$t('message.StudentName'), key: 'HoTen', sortable: false, width: 300 },
							{ title: this.$t('message.SubmissionInfo'), key: 'thongtinnopbai', }]
					}
	
				});
			},
			//API giao cho học sinh
			async fetchAssignmentStatsAssignToStudent(AssignToStudentID) {
				ajaxCALL("lms/EL_Teacher_GetAssignmentStats_AssignToStudent", {
					AssignToStudentID: AssignToStudentID,
					HocKi: vueData.NienKhoaItem?.HocKi
				}, (res) => {
					this.stats = res.data[0] || {};
				});
			},
			async fetchMostIncorrectQuestionsAssignToStudent(AssignToStudentID) {
				await ajaxCALL("lms/EL_Teacher_GetMostIncorrectQuestions_AssignToStudent", {
					AssignToStudentID: AssignToStudentID,
					HocKi: vueData.NienKhoaItem?.HocKi
				}, (res) => {
					this.mostIncorrect = res.data || [];
				});
			},
			async fetchStudentSubmissionsAssignToStudent(AssignToStudentID) {
				vueData.loading = true;
				ajaxCALL("lms/EL_Teacher_GetSubmissionStatusByStudent_AssignToStudent", {
					AssignToStudentID: AssignToStudentID,
					HocKi: vueData.NienKhoaItem?.HocKi
				}, (res) => {
					let handleData = res.data || [];
					this.studentSubmissionsOriginal = res.data || [];
					this.studentSubmissions = res.data.reduce((acc, obj) => {
						const existIndex = acc.findIndex(x => x.HocSinhID === obj.HocSinhID);
						if (existIndex === -1) {
							acc.push(obj);
						} else if ((acc[existIndex].Score ?? -Infinity) < (obj.Score ?? -Infinity)) {
							acc[existIndex] = obj;
						}
						return acc;
					}, []);
					vueData.loading = false;
				});
			},
			formatDate(iso) {
				if (!iso) return '—';
				return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
			},
			getScoreColor(score) {
				if (score == null) return '';
				if (score < 5.0) return 'score-bad'; if (score < 7.0) return 'score-average'; return 'score-good';
			},
			viewClassReport() {
				openWindow({
					title: "Xem báo cáo nộp bài",
					url: `/lms-teacher-score?AssignToClassID=${vueData.AssignToClassID_FromURL}`,
					id: "WinBaoCaoNopBai999",
					onclose: {
					}
				});
			},
			chamBai(item) {
				const $this = this
				openWindow({
					title: "Thao tác",
					url: `https://lms.lhbs.vn/lms_tc_grade_asm?SubmissionID=${item.SubmissionID}`,
					id: "WinBaoCaoNopBai00",
					onclose: {
						"EXE": "console.log('aaabccádeqưe')"
					}
				});
			},
			RedirectToGrade(item) {
				this.emitToParent()
				this.url = `https://lms.lhbs.vn/lms_tc_grade_asm?SubmissionID=${item.SubmissionID}&AssignType=${vueData.AssignType}`
				this.isOpen = true
	
			},
			async onClose() {
				this.isOpen = false
				window.parent.postMessage(
					{ type: "fromIframe", value: "show" },
					"*"
				)
				await this.initialize()
				await this.loadAllDataForAssignment(vueData.AssignToStudentID_FromURL)
			},
			emitToParent() {
				window.parent.postMessage(
					{ type: "fromIframe", value: "hide" },
					"*"
				)
			},
			getAllAssigned(hocsinh) {
				return this.studentSubmissionsOriginal.filter(item => item.HocSinhID == hocsinh.HocSinhID)
	
			},
			mappingValue(item) {
	
				return item.AssignToStudentID
			},
			getKhoi_Lop() {
				return new Promise((resolve, reject) => {
					ajaxCALL('lms/EL_Teacher_GetKhoi_MonHoc_ByGiaoVienID', {
						NienKhoa: vueData.NienKhoa,
						HocKi: vueData.NienKhoaItem?.HocKi
					}, res => {
						resolve(res.data)
					})
				})
			},
			renderTitleKhoi(KhoiID) {
				return 'Khối ' + KhoiID
			},
			handleChangeAssignType() {
				if (this.AssignType == 1) {
					vueData.AssignType = 'CLASS'
				} else {
					vueData.AssignType = 'STUDENT'
				}
			},
			secondsToMinuteSecond
	
		},
		async mounted() {
			console.log('vueData.AssignToStudentID_FromURL', vueData.AssignToStudentID_FromURL)
			if (vueData.AssignType == 'CLASS') {
				this.AssignType = 1
			} else {
				this.AssignType = 0
			}
			await this.initialize();
		},
	
	}
</script>
<style scoped>
	.submission-stats-card .v-col {
		padding: 16px;
	}

	.text-truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>