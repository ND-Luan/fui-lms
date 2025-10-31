<template>
	<!-- Bảng danh sách học sinh -->
	<v-card class="table-card mt-2">
		<v-card-title
			class="d-flex flex-column flex-md-row align-md-center align-start justify-md-space-between justify-start">
<div class="d-flex ga-2">
	<span>Danh sách học sinh || </span>
	<v-chip :color="assignmentInfo.ResourceType == 'Bài tập' ? 'primary' : 'success'" size="small">
		{{assignmentInfo.ResourceType}}</v-chip>{{assignmentInfo.Title}}</div>			
			
			<div class="d-flex flex-column flex-md-row justify-md-end w-100 ga-2">
				<v-text-field v-model="search" label="Tìm học sinh..." prepend-inner-icon="mdi-magnify"
					variant="outlined" density="compact" hide-details style="max-width: 300px;" />
			</div>

		</v-card-title>
		<v-data-table class="table-custom" :headers="headers" :items="processedSubmissions" :search="search"
			:items-per-page="-1" :hide-default-footer="true" @update:sort-by="false" density="compact">
			<template #item.HocSinhID="{ item }">
				<div class="text-muted">{{ item.HocSinhID }}</div>
			</template>
			<template #item.HoTen="{ item }">
				<div class="font-weight-medium text-secondary">{{ item.HoTen }}</div>
			</template>
			<template #item.Status="{ item }">
				<v-chip :color="statusColors[item.Status]" size="small" variant="flat" class="font-weight-medium">
					{{ statusTexts[item.Status] }}
				</v-chip>
			</template>
			<template #item.SubmissionTime="{ item }">
				<span v-if="item.SubmissionTime">{{ formatDate(item.SubmissionTime) }}</span>
				<span v-else class="text-medium-emphasis">—</span>
			</template>
			<template #item.Score="{ item }">
				<span class="font-weight-bold" :class="getScoreColor(item.Score)">
					{{ item.Score != null ? item.Score : '—' }}
				</span>
				<span class="font-weight-bold text-success" v-tooltip="`Điểm tối đa`">
					/ {{ AssignmentToClassInfo.MaxScore != null ? AssignmentToClassInfo.MaxScore : '—' }}
				</span>
			</template>
			<template #no-data>
				<div class="text-center pa-4 text-medium-emphasis">
					Vui lòng chọn Lớp, Môn và Bài tập để xem dữ liệu.
				</div>
			</template>
		</v-data-table>
	</v-card>
</template>

<script>
	export default {
		props: {
			isOpen: Boolean,
			classDetail: Object,
			assignedDetail: Object,
			itemDetail: Object,
			assignmentInfo: Object,
		},
		emits: ['update:isOpen'],
		data() {
			return {
				stats: {},
				studentSubmissions: [],
				search: '',
				headers: [
					{ title: 'Mã HS', key: 'HocSinhID', sortable: true },
					{ title: 'Số danh bộ', key: 'SoDanhBo', sortable: true },
					{ title: 'Học sinh', key: 'HoTen', sortable: true },
					{ title: 'Trạng thái', key: 'Status', sortable: true },
					{ title: 'Thời gian nộp', key: 'SubmissionTime', sortable: true },
					{ title: 'Điểm', key: 'Score', sortable: true },
					// { title: 'Số câu sai', key: 'IncorrectQuestionsJSON', sortable: true },
					{ title: 'Chấm bài', key: 'actions', sortable: false, align: 'end' }
				],
				AssignmentToClassInfo: {},
				statusColors: { 'SUBMITTED': 'info', 'GRADED': 'success', 'NOT_SUBMITTED': 'grey', 'SAVE_DRAFT': 'purple', 'IN_PROGRESS': 'teal', 'RESUBMIT': 'warning' },
				statusTexts: { 'SUBMITTED': 'Đã nộp', 'GRADED': 'Đã chấm', 'NOT_SUBMITTED': 'Chưa nộp', 'SAVE_DRAFT': "Chấm nháp", 'IN_PROGRESS': 'Đang làm', 'RESUBMIT': 'Yêu cầu nộp lại' },
			}
		},
		computed: {
			completionRate() {
				if (!this.stats.TotalStudents || this.stats.TotalStudents === 0) return 0;
				return ((this.stats.SubmittedCount || 0) / this.stats.TotalStudents) * 100;
			},
			processedSubmissions() {
				if (!this.studentSubmissions || !Array.isArray(this.studentSubmissions)) return [];
				return this.studentSubmissions.map(item => ({
					HocSinhID: item.HocSinhID,
					SoDanhBo: item.SoDanhBo,
					HoTen: item.HoTen || 'Lỗi dữ liệu',
					Status: item.Status || 'NOT_SUBMITTED',
					SubmissionTime: item.SubmissionTime,
					Score: item.Score,
					IncorrectQuestionsJSON: item.IncorrectQuestionsJSON,
					SubmissionID: item.SubmissionID,
					SubmissionStatus: item.SubmissionStatus,
					SubmissionContent: item.SubmissionContent
				}));
			},
			completionColor() {
				const rate = this.completionRate;
				if (rate < 30) return 'error'; if (rate < 70) return 'warning'; return 'success';
			}
		},
		watch: {},
		methods: {
			formatDate(iso) {
				if (!iso) return '—';
				return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
			},
			getScoreColor(score) {
				if (score == null) return '';
				if (score < 5.0) return 'score-bad'; if (score < 7.0) return 'score-average'; return 'score-good';
			},
			async onClose() {
				this.$emit('update:isOpen', false)
			},
			getClassDetail() {
				let payload = {
					AssignToClassID: this.classDetail.AssignToClassID,
					GiaoVienID: this.assignedDetail.GiaoVienID,
				}
				ajaxCALL('lms/TienDo_GiaoBai_DetailClassByAssignToClassID', payload, res => {
					this.studentSubmissions = res.data[0]
					this.AssignmentToClassInfo = res.data[1][0]
				})
			},
		},
		async mounted() {
			
			console.log('itemDetail', this.itemDetail)
			console.log('classDetail', this.classDetail)
				console.log('assignedDetail', this.assignedDetail)
			await this.getClassDetail();
		},
	
	}
</script>