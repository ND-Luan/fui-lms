<template>
	<!-- Thẻ card chính, không còn sự kiện click trực tiếp -->
	<v-card class="focus-card w-100" :class="statusInfo.cardClass" variant="outlined" @click.stop="chamBai(task)">
		<v-card-text class="pa-2">
			<div class="d-flex align-center justify-space-between align-sm-center justify-sm-center">
				<!-- Cột 1: Thông tin -->
				<div class="flex-grow-1 ga-2" style="min-width: 0;">
					<div class="task-title text-subtitle-2 font-weight-medium">
						{{ task.Title }}
					</div>
					<div class="task-meta text-caption text-grey-darken-1 d-flex align-center">
						<v-icon size="14" class="mr-1">mdi-book-open-variant</v-icon>
						<span class="task-subject">
							{{ [5, 46, 76].includes(task.MonHocID) ? ($i18n.locale == 'en' ? 'English' :
								task.MonHocName) :
								task.MonHocName }}
						</span> <span v-if="task.TenLopHoacNhom">• {{ task.TenLopHoacNhom }}</span>
						<v-spacer></v-spacer>
						<div class="d-flex flex-wrap flex-md-nowrap justify-center mb-1">
							<v-chip variant="text" size="x-small" color="success" prepend-icon="mdi-file-upload-outline"
								class="me-0 pe-2">
								{{ $t('message.Submitted') }}:{{ task.SubmittedCount }}/{{ task.TotalStudents }}
							</v-chip>
							<v-chip :color="statusInfo.color" size="x-small" variant="text" class="me-0 pa-0">
								{{ statusInfo.text }}
							</v-chip>
						</div>
					</div>
					<div v-if="task.DueDate" class="task-due-date text-caption d-flex align-center"
						:class="dueDateInfo.colorClass">
						<div>
							<v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
							{{ formatDate(task.DueDate) }} ({{ dueDateInfo.text }})
						</div>
						<v-spacer></v-spacer>
						<v-btn v-tooltip="task.IsHided ? 'Hiện bài tập' : 'Ẩn bài tập'" size="x-small"
							:icon="task.IsHided ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
							@click.stop="handleHide(task)"></v-btn>
					</div>
				</div>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	name: 'uc-teacher-focus-card',
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	props: {
		task: {
			type: Object,
			required: true
		}
	},
	data() {
		return {}
	},
	mounted() { },
	computed: {
		// Thông tin trạng thái để quyết định màu sắc, icon và text
		statusInfo() {
			const statuses = {
				'PENDING_GRADING': { color: 'warning', icon: 'mdi-file-clock-outline', iconColor: '#fb8c00', text: this.$i18n.locale == 'en' ? 'Need Grade' : 'Cần chấm', cardClass: 'warning' },
				'OVERDUE': { color: 'error', icon: 'mdi-calendar-remove', iconColor: '#f44336', text: this.$i18n.locale == 'en' ? 'Over Due' : 'Quá hạn', cardClass: 'urgent' },
				'UPCOMING': { color: 'primary', icon: 'mdi-calendar-arrow-right', iconColor: '#1976d2', text: this.$i18n.locale == 'en' ? 'Coming' : 'Sắp tới', cardClass: 'primary' }
			};
			return statuses[this.task.Status] || statuses['UPCOMING'];
		},

		// Tính toán thời gian còn lại so với hạn nộp
		dueDateInfo() {
			if (!this.task.DueDate) return { text: '', colorClass: '' };
			const now = new Date();
			const dueDate = new Date(this.task.DueDate);
			const diffSeconds = Math.floor((dueDate - now) / 1000);

			if (diffSeconds < 0) {
				return { text: this.$i18n.locale == 'en' ? 'Over Due' : 'đã quá hạn', colorClass: 'text-error' };
			}

			const diffMinutes = Math.floor(diffSeconds / 60);
			if (diffMinutes < 60) {
				return { text: this.$i18n.locale == 'en' ? ` ${diffMinutes} minutes left` : `còn ${diffMinutes} phút`, colorClass: 'text-warning' };
			}

			const diffHours = Math.floor(diffMinutes / 60);
			if (diffHours < 24) {
				return { text: this.$i18n.locale == 'en' ? ` ${diffHours} hours left` : `còn ${diffHours} giờ`, colorClass: 'text-warning' };
			}

			const diffDays = Math.floor(diffHours / 24);
			return { text: this.$i18n.locale == 'en' ? ` ${diffDays} days left` : `còn ${diffDays} ngày`, colorClass: 'text-success' };
		}
	},
	unmounted() { },
	methods: {
		// Xử lý sự kiện click nút "Chấm ngay"
		goToGradingPage() {
			// Ví dụ: openWindow({ url: `/lms_tc_grade_assignment?AssignToClassID=${this.task.AssignToClassID}` })
			this.snackbarRef.value.showSnackbar({ message: `Mở trang chấm bài cho "${this.task.Title}"...`, color: 'info' })
			console.log("Navigate to grading page for AssignToClassID:", this.task.AssignToClassID);

		},

		// Định dạng lại ngày tháng cho dễ đọc
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleString('vi-VN', {
				hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
			});
		},
		chamBai(assignment) {
			const url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${assignment?.AssignToClassID}&LopID=${assignment?.LopID}&MonHocID=${assignment?.MonHocID}&AssignType=${assignment?.AssignType}&KhoiID=${assignment?.KhoiID}`
			this.iframeRef.value.openWindow({
				title: assignment?.Title || 'Chấm bài',
				url,
				onclose: () => vueData.apiCall1()
			})
		},
		handleHide(task) {
			task.IsHided = !task.IsHided
			this.Update_IsHided(task.AssignToClassID)
		},
		Update_IsHided

	}
}
</script>