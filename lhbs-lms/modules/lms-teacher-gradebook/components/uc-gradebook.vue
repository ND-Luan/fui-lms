<template>
	<v-container class="page-container" fluid>
		<div v-if="loading && !studentGrades.length" class="text-center pa-10">
			<v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
			<p class="mt-4 text-muted">{{ $t('message.LoadingGradebookData') }}</p>
		</div>

		<div v-else>
			<!-- Header & Bộ lọc -->
			<div class="page-header d-flex justify-space-between align-center py-3 mb-0">

				<!-- ============================================= -->
				<!-- == KHỐI BÊN TRÁI: TIÊU ĐỀ                 == -->
				<!-- ============================================= -->
				<div class="header-title-group d-flex align-center px-2">
					<!-- <v-icon size="40" class="mr-4" color="primary">mdi-table-large-plus</v-icon> -->
					<div>
						<!-- <div class="text-h6 font-weight-bold">{{ $t('message.ClassGradebook') }}</div> -->
						<!-- Sử dụng v-if để chỉ hiển thị khi có lựa chọn -->
						<div v-if="selectedClassName" class="text-body-2 text-medium-emphasis text-truncate"
							:title="selectedClassName">
							{{ selectedClassName }}
						</div>
					</div>
				</div>

				<!-- ============================================= -->
				<!-- == KHỐI BÊN PHẢI: BỘ LỌC & HÀNH ĐỘNG      == -->
				<!-- ============================================= -->
				<div class="header-filters d-flex align-center ga-3">
					<v-select :label="$t('message.class')" :items="lopList" item-title="TenLop" item-value="LopID"
						v-model="selectedLopID" variant="outlined" density="compact" hide-details 
						style="min-width: 200px;" />
					<v-select :label="$t('message.Subject')" :items="monHocList" item-title="MonHocName"
						item-value="MonHocID" v-model="selectedMonHocID" variant="outlined" density="compact"
						hide-details :disabled="!selectedLopID"  style="min-width: 200px;" />
					<!-- <v-btn color="primary" @click="exportToCSV" prepend-icon="mdi-file-excel-outline"
                        :disabled="!studentGrades.length || loading" :loading="exporting" variant="flat">
                        Xuất Excel
                    </v-btn> -->
				</div>
			</div>


			<!-- Bảng điểm ma trận -->
			<v-card class="table-card">
				<v-table fixed-header height="90vh" density="compact">
					<thead>
						<tr>
							<th class="fixed-col student-col">{{ $t('message.StudentID') }}</th>
							<th class="fixed-col student-col">{{ $t('message.RegistrationNumber') }}</th>
							<th class="fixed-col student-col-name">{{ $t('message.FullName') }}</th>
							<th v-for="header in assignmentHeaders" :key="header.AssignToClassID"
								class="assignment-header text-center">
								<v-tooltip location="top">
									<template v-slot:activator="{ props }">
										<span v-bind="props">{{ header.AssignmentTitle }}</span>
									</template>
									<span>{{ $t('message.DueDate') }}: {{ formatDate(header.DueDate) }} | {{
										$t('message.Maximum') }}: {{ header.MaxScore }}đ</span>
								</v-tooltip>
							</th>
							<th class="fixed-col-right score-col text-center">{{ $t('message.averageScore') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr v-if="!studentGrades.length">
							<td :colspan="assignmentHeaders.length + 3" class="text-center text-muted pa-4">
								{{ $t('message.SelectClassSubjectNotice') }}
							</td>
						</tr>
						<tr v-for="student in studentGrades" :key="student.HocSinhID">
							<td class="fixed-col student-col text-medium-emphasis">{{ student.HocSinhID }}</td>
							<td class="fixed-col student-col text-medium-emphasis">{{ student.SoDanhBo }}</td>
							<td class="fixed-col student-col-name ">{{ student.HoTen }}</td>
							<td v-for="header in assignmentHeaders" :key="header.AssignToClassID" class="text-center">
								<uc-gradebook-cell :cell-data="student[header.AssignToClassID]"
								@grade="chamBai" @update-score="updateStudentScore" />
							</td>
							<td class="fixed-col-right score-col text-center font-weight-bold">{{
								calculateStudentAverage(student) }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th colspan="3" class="fixed-col">{{ $t('message.ClassAverageScore') }}</th>
							<th v-for="header in assignmentHeaders" :key="header.AssignToClassID" class="text-center">
								{{ getColumnAverage(header.AssignToClassID) }}
							</th>
							<th class="fixed-col-right score-col"></th>
						</tr>
					</tfoot>
				</v-table>
			</v-card>
		</div>
	</v-container>
</template>

<script>
	export default {
		name: 'uc-gradebook',
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	props: {
		initialLopId: Number,
		initialMonHocId: Number,
		initialHocKi: Number,
		initialNienKhoa: Number,
	},
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return {
			loading: true,
			lopList: [], monHocList: [],
			selectedLopID: this.initialLopId || null,
			selectedMonHocID: this.initialMonHocId || null,
			assignmentHeaders: [],
			studentGrades: [],
			columnStats: [],
			vueData,
			selectedClassName:'',
			isInitializing: false
		};
	},
	computed: {
		currentHocKi() {
			return this.initialHocKi || vueData.NienKhoaItem?.HocKi || vueData.HocKiItem?.HocKi || null;
		},
		currentNienKhoa() {
			return this.initialNienKhoa || vueData.NienKhoa || null;
		}
	},
	watch: {
		selectedLopID(newLopID, oldLopID) {

			if (!this.isInitializing && newLopID && newLopID !== oldLopID) {
				this.monHocList = [];
				this.selectedMonHocID = null;
				this.selectedClassName = this.lopList.find(x => x.LopID == newLopID)?.TenLop || '';
				this.clearData();
				this.fetchSubjectsByClass(newLopID);
			}
		},
		selectedMonHocID(newMonHocID, oldMonHocID) {
			if (!this.isInitializing && newMonHocID && newMonHocID !== oldMonHocID) {
				this.fetchData();
			}
		}
	},
	methods: {
		initialize() {
			this.isInitializing = true;
			this.fetchMyClasses(() => {
				if (!this.selectedLopID) {
					this.loading = false;
					this.isInitializing = false;
					return;
				}
				this.fetchSubjectsByClass(this.selectedLopID, () => {
					this.isInitializing = false;
					if (this.selectedMonHocID) this.fetchData();
					else this.loading = false;
				});
			});
		},
		fetchMyClasses(done) {
			const params = { HocKi: this.currentHocKi };
			if (this.currentNienKhoa) params.NienKhoa = this.currentNienKhoa;

			fetchPromise("lms/EL_Teacher_GetMyClasses", params, { cache: false }).then((data) => {
				// API cũ trả 2 resultset, API mới trả trực tiếp danh sách lớp.
				this.lopList = (Array.isArray(data) && Array.isArray(data[1])) ? data[1] : (Array.isArray(data) ? data : []);
				this.selectedLopID = this.lopList.find(x => x.LopID == this.initialLopId)?.LopID ?? this.lopList[0]?.LopID ?? null;
				this.selectedClassName = this.lopList.find(x => x.LopID == this.selectedLopID)?.TenLop || '';
				if (done) done();
			}).catch(() => {
				this.loading = false;
				this.isInitializing = false;
			});
		},
		fetchSubjectsByClass(lopId, done) {
			if(!lopId) return
			fetchPromise("lms/EL_Teacher_GetSubjectsByClass", { LopID: lopId, HocKi: this.currentHocKi }, { cache: false }).then((data) => {
				this.monHocList = Array.isArray(data) ? data : [];
				this.selectedMonHocID = this.monHocList.find(x => x.MonHocID == this.initialMonHocId)?.MonHocID ?? this.monHocList[0]?.MonHocID ?? null;
				if (done) done();
			}).catch(() => {
				this.loading = false;
				this.isInitializing = false;
			});
		},
		fetchData() {
			if (!this.selectedLopID || !this.selectedMonHocID) return;
			this.loading = true;
			fetchPromise("lms/EL_Teacher_GetGradebook", { LopID: this.selectedLopID, MonHocID: this.selectedMonHocID }, { cache: false }).then((data) => {
				if (Array.isArray(data) && data.length >= 3) {
					this.assignmentHeaders = data[0] || [];
					this.studentGrades = data[1] || [];
					this.columnStats = data[2] || [];
				} else this.clearData();
				this.loading = false;
			}).catch(() => {
				this.loading = false;
			});
		},
		async updateStudentScore(payload) {
			ajaxCALL("lms/EL_Teacher_UpdateQuickGrade", { SubmissionID: payload.submissionId, NewScore: payload.newScore }, (res) => {
				if (res.data && res.data[0] && res.data[0].Success) {
					Vue.$toast.success( "Cập nhật điểm thành công.",{position:'top'});
					this.fetchData();
				} else {
					Vue.$toast.error( "Cập nhật điểm thất bại.",{position:'top'});
				}
			});
		},
		calculateStudentAverage(student) {
			let totalScore = 0;
			let count = 0;
			this.assignmentHeaders.forEach(header => {
				const cellData = student[header.AssignToClassID];
				if (cellData) {
					try {
						const data = JSON.parse(cellData);
						if (data.status === 'GRADED' && typeof data.score === 'number') {
							totalScore += data.score;
							count++;
						}
					} catch (e) { }
				}
			});
			return count > 0 ? (totalScore / count).toFixed(2) : '';
		},
		getColumnAverage(assignToClassID) {
			const stat = this.columnStats.find(s => s.AssignToClassID === assignToClassID);
			return stat && stat.AverageScore != null ? stat.AverageScore.toFixed(2) : '';
		},
		exportToCSV() { /* Logic xuất Excel */ },
		formatDate(iso) {
			if (!iso) return '';
			return new Date(iso).toLocaleDateString('vi-VN');
		},
		clearData() {
			this.assignmentHeaders = [];
			this.studentGrades = [];
			this.columnStats = [];
		},
		chamBai(submissionId) {
			if (!submissionId) return
			this.iframeRef.value.openWindow({
				title: 'Chấm bài',
				url: `/lms_tc_grade_asm?SubmissionID=${submissionId}&AssignType=${vueData.AssignType}`,
				onclose: () => this.fetchData()
			})
		},
		test() {
			CALL('CallTest')
		}
	},
	mounted() {
		console.log('initialLopId', this.initialLopId);
		this.initialize();
	}
	}
</script>