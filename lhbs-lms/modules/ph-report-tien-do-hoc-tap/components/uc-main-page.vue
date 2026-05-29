<template>
	<div>
		<v-app>
			<v-app-bar color="primary" prominent>
				<v-app-bar-title>
					<v-icon class="mr-2">mdi-school</v-icon>
					Theo dõi tiến độ học tập
				</v-app-bar-title>
			</v-app-bar>

			<v-main>
				<v-container fluid>
					<v-card class="mb-4">
						<v-card-title class="bg-blue-lighten-5">
							<v-icon class="mr-2">mdi-account-circle</v-icon>
							Thông tin học sinh
						</v-card-title>
						<v-card-text>
							<v-row>
								<v-col cols="12" md="6">
									<strong>Họ và tên:</strong> {{ studentInfo.name }}
								</v-col>
								<v-col cols="12" md="6">
									<strong>Lớp:</strong> {{ studentInfo.class }}
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>

					<v-card>
						<v-tabs v-model="tab" bg-color="primary">
							<v-tab value="subjects">
								<v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
								Môn học
							</v-tab>
							<v-tab value="assignments">
								<v-icon class="mr-2">mdi-clipboard-text</v-icon>
								Bài tập
							</v-tab>
							<v-tab value="lessons">
								<v-icon class="mr-2">mdi-book-education</v-icon>
								Bài học
							</v-tab>
						</v-tabs>

						<v-card-text>
							<v-window v-model="tab">
								<!-- Tab Môn học -->
								<v-window-item value="subjects">
									<v-row>
										<v-col v-for="subject in subjects" :key="subject.id" cols="12" md="6" lg="4">
											<v-card @click="selectSubject(subject)" class="hover-card" elevation="2">
												<v-card-title class="bg-indigo-lighten-5">
													<v-icon :color="subject.color" class="mr-2">{{ subject.icon
														}}</v-icon>
													{{ subject.name }}
												</v-card-title>
												<v-card-text>
													<v-row dense>
														<v-col cols="6">
															<div class="text-caption text-grey">Bài tập</div>
															<div class="text-h6">{{ subject.assignmentCount }}</div>
														</v-col>
														<v-col cols="6">
															<div class="text-caption text-grey">Bài học</div>
															<div class="text-h6">{{ subject.lessonCount }}</div>
														</v-col>
													</v-row>
												</v-card-text>
											</v-card>
										</v-col>
									</v-row>
								</v-window-item>

								<!-- Tab Bài tập -->
								<v-window-item value="assignments">
									<v-row class="mb-4">
										<v-col cols="12" md="4">
											<v-select v-model="selectedSubjectFilter" :items="subjectFilterOptions"
												label="Lọc theo môn học" variant="outlined"
												density="compact"></v-select>
										</v-col>
										<v-col cols="12" md="4">
											<v-select v-model="selectedStatusFilter" :items="statusFilterOptions"
												label="Lọc theo trạng thái" variant="outlined"
												density="compact"></v-select>
										</v-col>
									</v-row>

									<v-data-table :headers="assignmentHeaders" :items="filteredAssignments"
										:items-per-page="10" class="elevation-1">
										<template v-slot:item.subject="{ item }">
											<v-chip :color="getSubjectColor(item.subject)" size="small">
												{{ item.subject }}
											</v-chip>
										</template>

										<template v-slot:item.status="{ item }">
											<v-chip :color="getStatusColor(item.status)" size="small"
												class="status-chip">
												{{ getStatusText(item.status) }}
											</v-chip>
										</template>

										<template v-slot:item.score="{ item }">
											<span :class="getScoreClass(item.score)">
												{{ item.score !== null ? item.score + '/10' : 'Chưa chấm' }}
											</span>
										</template>

										<template v-slot:item.actions="{ item }">
											<v-btn size="small" color="primary" variant="text"
												@click="viewAssignmentDetail(item)">
												Xem chi tiết
											</v-btn>
										</template>
									</v-data-table>
								</v-window-item>

								<!-- Tab Bài học -->
								<v-window-item value="lessons">
									<v-row class="mb-4">
										<v-col cols="12" md="4">
											<v-select v-model="selectedSubjectFilterLesson"
												:items="subjectFilterOptions" label="Lọc theo môn học"
												variant="outlined" density="compact"></v-select>
										</v-col>
										<v-col cols="12" md="4">
											<v-select v-model="selectedLessonStatusFilter"
												:items="lessonStatusFilterOptions" label="Lọc theo trạng thái"
												variant="outlined" density="compact"></v-select>
										</v-col>
									</v-row>

									<v-data-table :headers="lessonHeaders" :items="filteredLessons" :items-per-page="10"
										class="elevation-1">
										<template v-slot:item.subject="{ item }">
											<v-chip :color="getSubjectColor(item.subject)" size="small">
												{{ item.subject }}
											</v-chip>
										</template>

										<template v-slot:item.status="{ item }">
											<v-chip :color="getLessonStatusColor(item.status)" size="small"
												class="status-chip">
												{{ getLessonStatusText(item.status) }}
											</v-chip>
										</template>

										<template v-slot:item.progress="{ item }">
											<v-progress-linear :model-value="item.progress"
												:color="item.progress === 100 ? 'success' : 'primary'" height="20"
												rounded>
												<strong>{{ item.progress }}%</strong>
											</v-progress-linear>
										</template>

										<template v-slot:item.actions="{ item }">
											<v-btn size="small" color="primary" variant="text"
												@click="viewLessonDetail(item)">
												Xem chi tiết
											</v-btn>
										</template>
									</v-data-table>
								</v-window-item>
							</v-window>
						</v-card-text>
					</v-card>
				</v-container>
			</v-main>

			<!-- Dialog Chi tiết bài tập -->
			<v-dialog v-model="assignmentDialog" max-width="600px">
				<v-card v-if="selectedAssignment">
					<v-card-title class="bg-primary text-white">
						Chi tiết bài tập
					</v-card-title>
					<v-card-text class="pt-4">
						<v-list>
							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-book</v-icon>
								</template>
								<v-list-item-title>Môn học</v-list-item-title>
								<v-list-item-subtitle>{{ selectedAssignment.subject }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-text</v-icon>
								</template>
								<v-list-item-title>Tên bài tập</v-list-item-title>
								<v-list-item-subtitle>{{ selectedAssignment.title }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-calendar-clock</v-icon>
								</template>
								<v-list-item-title>Thời gian nộp</v-list-item-title>
								<v-list-item-subtitle>{{ selectedAssignment.dueDate }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-check-circle</v-icon>
								</template>
								<v-list-item-title>Trạng thái</v-list-item-title>
								<v-list-item-subtitle>
									<v-chip :color="getStatusColor(selectedAssignment.status)" size="small">
										{{ getStatusText(selectedAssignment.status) }}
									</v-chip>
								</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-star</v-icon>
								</template>
								<v-list-item-title>Điểm số</v-list-item-title>
								<v-list-item-subtitle>
									<span :class="getScoreClass(selectedAssignment.score)">
										{{ selectedAssignment.score !== null ? selectedAssignment.score + '/10' : 'Chưa
										chấm' }}
									</span>
								</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-account</v-icon>
								</template>
								<v-list-item-title>Giáo viên giao bài</v-list-item-title>
								<v-list-item-subtitle>{{ selectedAssignment.assignedBy }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item v-if="selectedAssignment.gradedBy">
								<template v-slot:prepend>
									<v-icon>mdi-account-check</v-icon>
								</template>
								<v-list-item-title>Giáo viên chấm bài</v-list-item-title>
								<v-list-item-subtitle>{{ selectedAssignment.gradedBy }}</v-list-item-subtitle>
							</v-list-item>
						</v-list>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" @click="assignmentDialog = false">Đóng</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

			<!-- Dialog Chi tiết bài học -->
			<v-dialog v-model="lessonDialog" max-width="600px">
				<v-card v-if="selectedLesson">
					<v-card-title class="bg-primary text-white">
						Chi tiết bài học
					</v-card-title>
					<v-card-text class="pt-4">
						<v-list>
							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-book</v-icon>
								</template>
								<v-list-item-title>Môn học</v-list-item-title>
								<v-list-item-subtitle>{{ selectedLesson.subject }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-text</v-icon>
								</template>
								<v-list-item-title>Tên bài học</v-list-item-title>
								<v-list-item-subtitle>{{ selectedLesson.title }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-calendar-check</v-icon>
								</template>
								<v-list-item-title>Thời gian hoàn thành</v-list-item-title>
								<v-list-item-subtitle>{{ selectedLesson.completionDate }}</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-check-circle</v-icon>
								</template>
								<v-list-item-title>Trạng thái</v-list-item-title>
								<v-list-item-subtitle>
									<v-chip :color="getLessonStatusColor(selectedLesson.status)" size="small">
										{{ getLessonStatusText(selectedLesson.status) }}
									</v-chip>
								</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-progress-check</v-icon>
								</template>
								<v-list-item-title>Tiến độ</v-list-item-title>
								<v-list-item-subtitle>
									<v-progress-linear :model-value="selectedLesson.progress"
										:color="selectedLesson.progress === 100 ? 'success' : 'primary'" height="20"
										rounded class="mt-2">
										<strong>{{ selectedLesson.progress }}%</strong>
									</v-progress-linear>
								</v-list-item-subtitle>
							</v-list-item>

							<v-list-item>
								<template v-slot:prepend>
									<v-icon>mdi-account</v-icon>
								</template>
								<v-list-item-title>Giáo viên giao bài</v-list-item-title>
								<v-list-item-subtitle>{{ selectedLesson.assignedBy }}</v-list-item-subtitle>
							</v-list-item>
						</v-list>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" @click="lessonDialog = false">Đóng</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-app>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				tab: 'subjects',
				studentInfo: {
					name: 'Nguyễn Văn An',
					class: '10A1'
				},
				subjects: [
					{ id: 1, name: 'Toán', icon: 'mdi-calculator', color: 'blue', assignmentCount: 8, lessonCount: 12 },
					{ id: 2, name: 'Văn', icon: 'mdi-book-alphabet', color: 'red', assignmentCount: 6, lessonCount: 10 },
					{ id: 3, name: 'Anh', icon: 'mdi-translate', color: 'green', assignmentCount: 7, lessonCount: 11 },
					{ id: 4, name: 'Lý', icon: 'mdi-atom', color: 'purple', assignmentCount: 5, lessonCount: 9 },
					{ id: 5, name: 'Hóa', icon: 'mdi-flask', color: 'orange', assignmentCount: 5, lessonCount: 8 },
					{ id: 6, name: 'Sinh', icon: 'mdi-dna', color: 'teal', assignmentCount: 4, lessonCount: 7 }
				],
				assignments: [
					{
						id: 1, subject: 'Toán', title: 'Bài tập Đại số', dueDate: '15/12/2025', status: 'submitted', score: 8.5, assignedBy:
							'Cô Nguyễn Thị Lan', gradedBy: 'Cô Nguyễn Thị Lan'
					},
					{
						id: 2, subject: 'Văn', title: 'Phân tích tác phẩm', dueDate: '18/12/2025', status: 'pending', score: null, assignedBy:
							'Thầy Trần Văn Nam', gradedBy: null
					},
					{
						id: 3, subject: 'Anh', title: 'Bài luận tiếng Anh', dueDate: '12/12/2025', status: 'submitted', score: 9.0,
						assignedBy: 'Cô Lê Thị Hoa', gradedBy: 'Cô Lê Thị Hoa'
					},
					{
						id: 4, subject: 'Lý', title: 'Bài tập Cơ học', dueDate: '20/12/2025', status: 'pending', score: null, assignedBy:
							'Thầy Phạm Minh Tuấn', gradedBy: null
					},
					{
						id: 5, subject: 'Toán', title: 'Hình học không gian', dueDate: '10/12/2025', status: 'late', score: 6.5, assignedBy:
							'Cô Nguyễn Thị Lan', gradedBy: 'Cô Nguyễn Thị Lan'
					},
					{
						id: 6, subject: 'Hóa', title: 'Bài tập Hóa vô cơ', dueDate: '22/12/2025', status: 'pending', score: null, assignedBy:
							'Cô Đặng Thu Hà', gradedBy: null
					},
					{
						id: 7, subject: 'Sinh', title: 'Báo cáo thực tập', dueDate: '25/12/2025', status: 'not_submitted', score: null,
						assignedBy: 'Thầy Hoàng Minh Đức', gradedBy: null
					},
					{
						id: 8, subject: 'Anh', title: 'Bài tập ngữ pháp', dueDate: '14/12/2025', status: 'submitted', score: 8.0, assignedBy:
							'Cô Lê Thị Hoa', gradedBy: 'Cô Lê Thị Hoa'
					}
				],
				lessons: [
					{
						id: 1, subject: 'Toán', title: 'Phương trình bậc hai', completionDate: '08/12/2025', status: 'completed', progress:
							100, assignedBy: 'Cô Nguyễn Thị Lan'
					},
					{
						id: 2, subject: 'Văn', title: 'Chí Phèo - Nam Cao', completionDate: '15/12/2025', status: 'in_progress', progress: 65,
						assignedBy: 'Thầy Trần Văn Nam'
					},
					{
						id: 3, subject: 'Anh', title: 'Present Perfect Tense', completionDate: '10/12/2025', status: 'completed', progress:
							100, assignedBy: 'Cô Lê Thị Hoa'
					},
					{
						id: 4, subject: 'Lý', title: 'Định luật Newton', completionDate: '20/12/2025', status: 'not_started', progress: 0,
						assignedBy: 'Thầy Phạm Minh Tuấn'
					},
					{
						id: 5, subject: 'Toán', title: 'Hàm số bậc nhất', completionDate: '12/12/2025', status: 'in_progress', progress: 45,
						assignedBy: 'Cô Nguyễn Thị Lan'
					},
					{
						id: 6, subject: 'Hóa', title: 'Bảng tuần hoàn', completionDate: '18/12/2025', status: 'in_progress', progress: 30,
						assignedBy: 'Cô Đặng Thu Hà'
					},
					{
						id: 7, subject: 'Sinh', title: 'Cấu trúc tế bào', completionDate: '05/12/2025', status: 'completed', progress: 100,
						assignedBy: 'Thầy Hoàng Minh Đức'
					},
					{
						id: 8, subject: 'Anh', title: 'Passive Voice', completionDate: '22/12/2025', status: 'not_started', progress: 0,
						assignedBy: 'Cô Lê Thị Hoa'
					}
				],
				selectedSubjectFilter: 'all',
				selectedStatusFilter: 'all',
				selectedSubjectFilterLesson: 'all',
				selectedLessonStatusFilter: 'all',
				assignmentDialog: false,
				lessonDialog: false,
				selectedAssignment: null,
				selectedLesson: null,
				assignmentHeaders: [
					{ title: 'Môn học', key: 'subject', sortable: true },
					{ title: 'Tên bài tập', key: 'title', sortable: true },
					{ title: 'Hạn nộp', key: 'dueDate', sortable: true },
					{ title: 'Trạng thái', key: 'status', sortable: true },
					{ title: 'Điểm', key: 'score', sortable: true },
					{ title: 'Thao tác', key: 'actions', sortable: false }
				],
				lessonHeaders: [
					{ title: 'Môn học', key: 'subject', sortable: true },
					{ title: 'Tên bài học', key: 'title', sortable: true },
					{ title: 'Hoàn thành', key: 'completionDate', sortable: true },
					{ title: 'Trạng thái', key: 'status', sortable: true },
					{ title: 'Tiến độ', key: 'progress', sortable: true },
					{ title: 'Thao tác', key: 'actions', sortable: false }
				]
			};
		},
		computed: {
			subjectFilterOptions() {
				const subjects = this.subjects.map(s => ({ title: s.name, value: s.name }));
				return [{ title: 'Tất cả môn học', value: 'all' }, ...subjects];
			},
			statusFilterOptions() {
				return [
					{ title: 'Tất cả trạng thái', value: 'all' },
					{ title: 'Đã nộp', value: 'submitted' },
					{ title: 'Chưa nộp', value: 'pending' },
					{ title: 'Nộp trễ', value: 'late' },
					{ title: 'Không nộp', value: 'not_submitted' }
				];
			},
			lessonStatusFilterOptions() {
				return [
					{ title: 'Tất cả trạng thái', value: 'all' },
					{ title: 'Hoàn thành', value: 'completed' },
					{ title: 'Đang học', value: 'in_progress' },
					{ title: 'Chưa bắt đầu', value: 'not_started' }
				];
			},
			filteredAssignments() {
				let filtered = this.assignments;
	
				if (this.selectedSubjectFilter !== 'all') {
					filtered = filtered.filter(a => a.subject === this.selectedSubjectFilter);
				}
	
				if (this.selectedStatusFilter !== 'all') {
					filtered = filtered.filter(a => a.status === this.selectedStatusFilter);
				}
	
				return filtered;
			},
			filteredLessons() {
				let filtered = this.lessons;
	
				if (this.selectedSubjectFilterLesson !== 'all') {
					filtered = filtered.filter(l => l.subject === this.selectedSubjectFilterLesson);
				}
	
				if (this.selectedLessonStatusFilter !== 'all') {
					filtered = filtered.filter(l => l.status === this.selectedLessonStatusFilter);
				}
	
				return filtered;
			}
		},
		methods: {
			selectSubject(subject) {
				this.selectedSubjectFilter = subject.name;
				this.selectedSubjectFilterLesson = subject.name;
				this.tab = 'assignments';
			},
			getSubjectColor(subjectName) {
				const subject = this.subjects.find(s => s.name === subjectName);
				return subject ? subject.color : 'grey';
			},
			getStatusColor(status) {
				const colors = {
					submitted: 'success',
					pending: 'warning',
					late: 'error',
					not_submitted: 'grey'
				};
				return colors[status] || 'grey';
			},
			getStatusText(status) {
				const texts = {
					submitted: 'Đã nộp',
					pending: 'Chưa nộp',
					late: 'Nộp trễ',
					not_submitted: 'Không nộp'
				};
				return texts[status] || status;
			},
			getLessonStatusColor(status) {
				const colors = {
					completed: 'success',
					in_progress: 'primary',
					not_started: 'grey'
				};
				return colors[status] || 'grey';
			},
			getLessonStatusText(status) {
				const texts = {
					completed: 'Hoàn thành',
					in_progress: 'Đang học',
					not_started: 'Chưa bắt đầu'
				};
				return texts[status] || status;
			},
			getScoreClass(score) {
				if (score === null) return 'text-grey';
				if (score >= 8) return 'text-success font-weight-bold';
				if (score >= 6.5) return 'text-primary font-weight-bold';
				return 'text-warning font-weight-bold';
			},
			viewAssignmentDetail(assignment) {
				this.selectedAssignment = assignment;
				this.assignmentDialog = true;
			},
			viewLessonDetail(lesson) {
				this.selectedLesson = lesson;
				this.lessonDialog = true;
			}
		}
	}
	
</script>