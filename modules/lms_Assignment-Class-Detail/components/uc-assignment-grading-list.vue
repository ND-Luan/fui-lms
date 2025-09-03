<template>
	<v-container class="page-container" fluid>
		<v-card variant="tonal" color="primary" class="submission-stats-card">
			<div v-if="loading" class="pa-4">
				<v-skeleton-loader type="card-avatar, article"></v-skeleton-loader>
			</div>
			<v-card-text v-else class="pa-2">
				<v-row align="center">
					<v-col cols="12" md="8" class="border-e-md ">
						<div class="mb-4">
							<div class="d-flex align-baseline ga-2">
								<div class="text-overline">Thống kê:</div>
								<div class="text-h6 font-weight-bold text-truncate" :title="assignmentTitle">
									{{ assignmentTitle || 'Vui lòng chọn bài tập' }}
								</div>
							</div>
						</div>
						<!-- Hàng chứa các bộ lọc -->
						<v-row dense>
							<v-col cols="12" sm="4">
								<v-select v-model="selectedLopID" :items="lopList" item-title="TenLop"
									item-value="LopID" label="Lớp" variant="outlined" density="compact" hide-details
									 />
							</v-col>
							<v-col cols="12" sm="4">
								<v-select v-model="selectedMonHocID" :items="monHocList" item-title="MonHocName"
									item-value="MonHocID" label="Môn học" variant="outlined" density="compact"
									hide-details :disabled="!selectedLopID"  />
							</v-col>
							<v-col cols="12" sm="4">
								<v-select v-model="selectedAssignToClassID" :items="assignmentList"
									item-title="AssignmentTitle" item-value="AssignToClassID" label="Bài tập"
									variant="outlined" density="compact" hide-details :disabled="!selectedMonHocID"
									 />
							</v-col>
						</v-row>
					</v-col>

					<!-- ======================================================= -->
					<!-- == CỘT BÊN PHẢI: THỐNG KÊ GỌN                       == -->
					<!-- ======================================================= -->
					<v-col cols="12" md="4" class="d-flex align-center justify-space-around ">
						<!-- Thống kê Tỉ lệ nộp bài -->
						<div class="text-center">
							<div class="text-overline mb-1">Đã nộp</div>
							<div class="d-flex align-baseline justify-center">
								<div class="text-h4 font-weight-bold">{{ stats.SubmittedCount || 0 }}</div>
								<div class="text-h6">/{{ stats.TotalStudents || 0 }}</div>
							</div>
							<v-progress-linear :model-value="completionRate" :color="completionColor" height="8" rounded
								class="my-2 mx-auto" style="width: 120px;" />
							<div class="text-caption">{{ completionRate.toFixed(0) }}% Hoàn thành</div>
						</div>

						<!-- Đường kẻ dọc phân cách -->
						<v-divider vertical class="mx-2"></v-divider>

						<!-- Thống kê Điểm Trung bình -->
						<div class="text-center">
							<div class="text-overline mb-1">Điểm TB</div>
							<div class="text-h4 font-weight-bold">{{ (stats.AverageScore || 0).toFixed(2) }}</div>
							<div class="text-caption">trên thang 10</div>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>

		<!-- Bảng danh sách học sinh -->
		<v-card class="table-card mt-2">
			<v-card-title class="d-flex align-center">
				<span>Danh sách học sinh</span>
				<v-spacer></v-spacer>
				<v-btn color="primary" variant="flat" :disabled="!studentSubmissions.length"
					@click.stop="viewClassReport">
					Xem báo cáo lớp
				</v-btn>
				<v-text-field v-model="search" label="Tìm học sinh..." prepend-inner-icon="mdi-magnify"
					variant="outlined" density="compact" hide-details style="max-width: 300px;" class="px-2" />
			</v-card-title>
			<v-card-text>
				<v-data-table :headers="headers" :items="processedSubmissions" :search="search" :items-per-page="-1"
					:loading="loading" density="default" :hide-default-footer="true">
					<template #item.HocSinhID="{ item }">
						<div class="text-muted">{{ item.HocSinhID }}</div>
					</template>
					<template #item.HoTen="{ item }">
						<div class="font-weight-medium text-secondary">{{ item.HoTen }}</div>
					</template>
					<template #item.Status="{ item }">
						<v-chip :color="statusColors[item.Status]" size="small" variant="flat"
							class="font-weight-medium">
							{{ statusTexts[item.Status] }}
						</v-chip>
					</template>
					<template #item.SubmissionTime="{ item }">
						<span v-if="item.SubmissionTime">{{ formatDate(item.SubmissionTime) }}</span>
						<span v-else class="text-medium-emphasis">—</span>
					</template>
					<template #item.Score="{ item }">
						<span class="font-weight-bold" :class="getScoreColor(item.Score)">
							{{ item.Score != null ? item.Score.toFixed(2) : '—' }}
						</span>
					</template>
					<!-- <template #item.IncorrectQuestionsJSON="{ item }">
					                    <span v-if="item.SubmissionID"
					                        :class="{'text-error font-weight-bold': item.IncorrectQuestionsJSON > 0, 'text-muted': item.IncorrectQuestionsJSON === 0 || item.IncorrectQuestionsJSON === null}">
					                        {{ item.IncorrectQuestionsJSON === null ? '—' : item.IncorrectQuestionsJSON }}
					                    </span>
					                    <span v-else class="text-medium-emphasis">—</span>
					                </template> -->
					<template #item.actions="{ item }">
						<v-btn size="small" color="primary" variant="flat" :disabled="!item.SubmissionID || item.SubmissionStatus == 1"
							@click.stop="chamBai(item)">
							{{item.SubmissionStatus == 4 ? 'Xem lại bài chấm' : 'Chấm bài'}}
						</v-btn>
					</template>
					<template #no-data>
						<div class="text-center pa-4 text-medium-emphasis">
							Vui lòng chọn Lớp, Môn và Bài tập để xem dữ liệu.
						</div>
					</template>
				</v-data-table>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<script>
	export default {
		name: 'uc-baocaobaitapdanop',
		props: {
			assigntoclassid: Number,
			assignmentid: Number,
			khoiid: Number,
			lopid: Number,
			monhocid: Number
		},
		data() {
			return {
				vueData,
				loading: false,
				lopList: [], monHocList: [], assignmentList: [],
				stats: {}, mostIncorrect: [], studentSubmissions: [],
				selectedLopID: null,
				selectedMonHocID: null,
				selectedAssignToClassID: this.assigntoclassid,
				search: '',
				headers: [
					{ title: 'Mã HS', key: 'HocSinhID', sortable: true },
					{ title: 'Học sinh', key: 'HoTen', sortable: true },
					{ title: 'Trạng thái', key: 'Status', sortable: true },
					{ title: 'Thời gian nộp', key: 'SubmissionTime', sortable: true },
					{ title: 'Điểm', key: 'Score', sortable: true },
					// { title: 'Số câu sai', key: 'IncorrectQuestionsJSON', sortable: true },
					{ title: 'Chấm bài', key: 'actions', sortable: false, align: 'end' }
				],
				statusColors: { 'SUBMITTED': 'info', 'GRADED': 'success', 'NOT_SUBMITTED': 'warning','SAVE_DRAFT':'purple' , 'IN_PROGRESS': 'teal'},
				statusTexts: { 'SUBMITTED': 'Đã nộp', 'GRADED': 'Đã chấm', 'NOT_SUBMITTED': 'Chưa nộp','SAVE_DRAFT':"Chấm nháp", 'IN_PROGRESS': 'Đang làm' },
			}
		},
		computed: {
			getDataFromProps() {
				console.log(this.lopid);
			},
			assignmentTitle() {
				return this.assignmentList.find(a => a.AssignToClassID === this.selectedAssignToClassID)?.AssignmentTitle || '...';
			},
			completionRate() {
				if (!this.stats.TotalStudents || this.stats.TotalStudents === 0) return 0;
				return ((this.stats.SubmittedCount || 0) / this.stats.TotalStudents) * 100;
			},
			processedSubmissions() {
				if (!this.studentSubmissions || !Array.isArray(this.studentSubmissions)) return [];
				return this.studentSubmissions.map(item => ({
					HocSinhID: item.HocSinhID,
					HoTen: item.HoTen || 'Lỗi dữ liệu',
					Status: item.Status || 'NOT_SUBMITTED',
					SubmissionTime: item.SubmissionTime,
					Score: item.Score,
					IncorrectQuestionsJSON: item.IncorrectQuestionsJSON,
					SubmissionID: item.SubmissionID,
					SubmissionStatus: item.SubmissionStatus
				}));
			},
			completionColor() {
				const rate = this.completionRate;
				if (rate < 30) return 'error'; if (rate < 70) return 'warning'; return 'success';
			}
		},
		watch: {
			selectedLopID(newLopID, oldLopID) {
	
				if (newLopID && newLopID !== oldLopID) {
					this.monHocList = []; this.selectedMonHocID = null;
					this.assignmentList = []; this.selectedAssignToClassID = null;
					this.clearReportData();
					this.fetchSubjectsByClass(newLopID);
				}
			},
			selectedMonHocID(newMonHocID, oldMonHocID) {
	
				if (newMonHocID && newMonHocID !== oldMonHocID) {
					this.assignmentList = []; this.selectedAssignToClassID = null;
					this.clearReportData();
					if (this.selectedLopID) {
						this.fetchAssignmentsByClass(this.selectedLopID, newMonHocID);
					}
				}
			},
			selectedAssignToClassID(newId, oldId) {
				if (newId && newId !== oldId) {
					this.loadAllDataForAssignment(newId);
				}
			},
			lopid(newVal, oldVal) {
				console.log(newVal)
			}
		},
		methods: {
			clearReportData() {
				this.stats = {};
				this.mostIncorrect = [];
				this.studentSubmissions = [];
			},
			async initialize() {
				this.loading = true;
				await this.fetchMyClasses();
				this.loading = false;
			},
			async loadAllDataForAssignment(assignToClassID) {
				this.loading = true;
				await Promise.all([
					this.fetchAssignmentStats(assignToClassID),
					this.fetchMostIncorrectQuestions(assignToClassID),
					this.fetchStudentSubmissions(assignToClassID)
				]);
				this.loading = false;
			},
			async fetchMyClasses() {
				await ajaxCALL("lms/EL_Teacher_GetMyClasses", null, (res) => {
					this.lopList = res.data || [];
					if (this.lopList.length > 0) {
	
						this.selectedLopID = this.lopList.find(x => x.LopID == this.lopid)?.LopID ?? this.lopList[0].LopID;
					}
				});
			},
			async fetchSubjectsByClass(lopId) {
				await ajaxCALL("lms/EL_Teacher_GetSubjectsByClass", { LopID: lopId }, (res) => {
					this.monHocList = res.data || [];
					if (this.monHocList.length > 0) {
	
						console.log(this.monhocid, this.monHocList)
						this.selectedMonHocID = this.monHocList.find(x => x.MonHocID == parseInt(this.monhocid)) ?? this.monHocList[0].MonHocID;
	
					}
				});
			},
			async fetchAssignmentsByClass(lopId, monHocId) {
				await ajaxCALL("lms/EL_Teacher_GetAssignmentsByClass", { LopID: lopId, MonHocID: monHocId }, (res) => {
					this.assignmentList = res.data || [];
					if (this.assignmentList.length > 0) {
						console.log(this.assigntoclassid);
						this.selectedAssignToClassID = this.assignmentList.find(x => x.AssignToClassID == this.assigntoclassid)?.AssignToClassID ?? this.assignmentList[0].AssignToClassID;
					}
				});
			},
			async fetchAssignmentStats(assignToClassID) {
				await ajaxCALL("lms/EL_Teacher_GetAssignmentStats", { AssignToClassID: assignToClassID }, (res) => {
					this.stats = res.data[0] || {};
				});
			},
			async fetchMostIncorrectQuestions(assignToClassID) {
				await ajaxCALL("lms/EL_Teacher_GetMostIncorrectQuestions", { AssignToClassID: assignToClassID }, (res) => {
					this.mostIncorrect = res.data || [];
				});
			},
			async fetchStudentSubmissions(assignToClassID) {
				this.loading = true;
				await ajaxCALL("lms/EL_Teacher_GetSubmissionStatusByStudent", { AssignToClassID: assignToClassID }, (res) => {
					this.studentSubmissions = res.data || [];
				});
				this.loading = false;
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
					url: `/lms-teacher-score?AssignToClassID=${this.assigntoclassid}`,
					id: "WinBaoCaoNopBai",
					onclose: {
					}
				});
			},
			chamBai(item) {
				console.log(item)
				const $this= this
				openWindow({
					title: "Chấm bài",
					url: `https://lms.lhbs.vn/lms_tc_grade_asm?SubmissionID=${item.SubmissionID}`,
					id: "WinBaoCaoNopBai",
					onclose: {
						"EXE":"console.log('aaabccádeqưe'); vueData.initialize"
					}
				});
			}
		},
		async mounted() {
			vueData.initialize = this.initialize()
			await this.initialize();
		}
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