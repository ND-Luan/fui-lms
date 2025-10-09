<template>
	<v-container class="page-container" fluid>
		<div v-if="loading" class="text-center pa-10">
			<v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
			<p class="mt-4 text-muted">Đang tải dữ liệu báo cáo...</p>
		</div>
		<v-card v-else-if="!hasData" class="ma-4 pa-10 text-center" flat>
			<v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
			<h2 class="mt-4 text-h6">Không thể tải dữ liệu</h2>
			<p class="text-muted">Không tìm thấy dữ liệu cho bài tập này hoặc đã có lỗi xảy ra.</p>
		</v-card>

		<div v-else>
			<div class="page-header mb-6">
				<div class="d-flex align-center">
					<div class="d-flex align-center">
						<v-avatar variant="tonal" color="primary" size="56" class="mr-4">
							<v-icon size="32">mdi-table-large</v-icon>
						</v-avatar>
						<div>
							<div class="text-h5 font-weight-bold">Báo cáo chi tiết bài làm</div>
							<div class="text-body-2 text-medium-emphasis">
								Lớp: {{ className }} - Bài: {{ assignmentTitle }}
							</div>
						</div>
					</div>
					<v-spacer></v-spacer>
					<div>
						<v-btn color="primary" variant="flat" prepend-icon="mdi-file-excel-outline" @click="exportToCSV">
							Xuất CSV
						</v-btn>
					</div>
			
				</div>
			</div>

			<!-- Bảng Crosstab -->
			<v-card class="table-card pa-2" >
				<v-table fixed-header height="80vh" density="compact">
					<thead>
						<tr>
							<th class="fixed-col student-id-col">Mã HS</th>
							<th class="fixed-col student-name-col">Học sinh</th>
								<th class="fixed-col student-name-col">Số danh bộ</th>
							<th v-for="(header, index) in questionHeaders" :key="header.QuestionID_InJSON"
								class="text-center question-col">
								<v-tooltip location="top">
									<template v-slot:activator="{ props }">
										<span v-bind="props">{{ 'Câu ' + (index + 1) }}</span>
									</template>
									<div v-html="header.QuestionTitle"></div>
								</v-tooltip>
							</th>
							<th class="fixed-col-right score-col text-center">Tổng điểm</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="student in studentResults" :key="student.HocSinhID"
							:class="getRowClass(student.FinalScore)">
							<td class="fixed-col student-id-col text-medium-emphasis"
								@click="viewStudentSubmission(student)">
								{{ student.HocSinhID }}
							</td>
							<td class="fixed-col student-name-col font-weight-medium student-name-link"
								@click="viewStudentSubmission(student)">
								{{ student.HoTen }}
							</td>
							<td class="fixed-col font-weight-medium "
								>
								{{ student.SoDanhBo }}
							</td>
							<td v-for="header in questionHeaders" :key="header.QuestionID_InJSON" class="text-center">
								<uc-cell-display :cell-data="student[header.QuestionID_InJSON]" />
							</td>
							<td class="fixed-col-right score-col text-center font-weight-bold">{{ student.FinalScore }}
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th class="fixed-col student-id-col"></th>
							<th class="fixed-col student-name-col">Tỉ lệ đúng (%)</th>
							<th v-for="header in questionHeaders" :key="header.QuestionID_InJSON" class="text-center">
								{{ isNaN(getCorrectPercentage(header.QuestionID_InJSON))    ? ''    : getCorrectPercentage(header.QuestionID_InJSON) + '%' }}

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
		name: 'uc-crosstab-report',
		props: {
			assignToClassId: { type: Number, required: true }
		},
		data() {
			return {
				loading: true,
				questionHeaders: [],
				studentResults: [],
				columnStats: [],
				className: '...',
				assignmentTitle: '...'
			};
		},
		computed: {
			hasData() {
				return !this.loading && this.questionHeaders.length > 0 && this.studentResults.length > 0;
			}
		},
		methods: {
			async fetchData() {
				if (!this.assignToClassId) {
					this.loading = false;
					return;
				}
				this.loading = true;
				await ajaxCALL("lms/EL_Teacher_GetAssignmentCrosstabReport", { AssignToClassID: this.assignToClassId }, (res) => {
					if (res && res.data && res.data.length >= 4) {
						this.className = res.data[0][0].ClassName;
						this.assignmentTitle = res.data[0][0].AssignmentTitle;
						this.questionHeaders = res.data[1];
						this.columnStats = res.data[2];
						this.studentResults = res.data[3];
					} else {
						this.questionHeaders = [];
						this.studentResults = [];
					}
				});
				this.loading = false;
			},
			getCorrectPercentage(questionId) {
				const stat = this.columnStats.find(s => s.QuestionID_InJSON === questionId);
				return stat ? stat.CorrectPercentage.toFixed(1) : 'N/A';
			},
			getRowClass(score) {
				if (score != null && score < 5.0) {
					return 'low-score-row';
				}
				return '';
			},
			viewStudentSubmission(student) {
				if (student.SubmissionID) {
					Toast.info({ text: `Mở bài của ${student.HoTen}...` });
					// Mở trang chấm bài chi tiết
					// openWindow({ url: `/lms_teacher_grading?SubmissionID=${student.SubmissionID}` });
				} else {
					Toast.warn({ text: `Học sinh ${student.HoTen} chưa nộp bài.` });
				}
			},
			exportToCSV() {
				if (!this.hasData) {
					Toast.warn({ text: 'Không có dữ liệu để xuất file.' });
					return;
				}
	
				// 1. Tạo Header cho file CSV
				const headers = [
					'Mã HS', 'Họ và tên',
					...this.questionHeaders.map((h, i) => `Câu ${i + 1}`),
					'Tổng điểm'
				];
				let csvContent = headers.join(',') + '\r\n';
	
				// 2. Thêm dữ liệu từng học sinh
				this.studentResults.forEach(student => {
					const row = [
						student.HocSinhID,
						`"${student.HoTen}"`, // Đặt trong dấu nháy kép để xử lý tên có dấu phẩy
						...this.questionHeaders.map(h => {
							const cellData = student[h.QuestionID_InJSON];
							if (!cellData) return 'N/A';
							try {
								const data = JSON.parse(cellData);
								switch (data.status) {
									case 'CORRECT': return 'Đúng';
									case 'INCORRECT': return 'Sai';
									case 'GRADED': return data.score;
									case 'PENDING': return 'Chờ chấm';
									case 'NOT_ANSWERED': return 'Không làm';
									default: return 'N/A';
								}
							} catch (e) {
								return 'N/A';
							}
						}),
						student.FinalScore
					];
					csvContent += row.join(',') + '\r\n';
				});
	
				// 3. Kích hoạt tải file
				const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
				const link = document.createElement("a");
				if (link.download !== undefined) {
					const url = URL.createObjectURL(blob);
					const fileName = `BaoCao_${this.className}_${this.assignmentTitle.replace(/ /g, '_')}.csv`;
					link.setAttribute("href", url);
					link.setAttribute("download", fileName);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			},
		},
		mounted() {
			this.fetchData();
		}
	}
</script>