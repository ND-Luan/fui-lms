<template>
	<!-- Thẻ card chính, không còn sự kiện click trực tiếp -->
<v-card class="focus-card" :class="statusInfo.cardClass" variant="outlined" @click.stop="chamBai(task)">
	<v-card-text class="py-2 px-3">
		<div class="d-flex align-center justify-space-between">

			<!-- Cột 1: Thông tin -->
			<div class="flex-grow-1 min-w-0">
				<div class="task-title text-subtitle-2 font-weight-medium text-truncate">
					{{ task.Title }} ({{ task.TenLop }})
				</div>
				<div class="task-meta text-caption text-grey-darken-1 d-flex align-center">
					<v-icon size="14" class="mr-1">mdi-book-open-variant</v-icon>
					{{ task.MonHocName }}
				</div>
				<div v-if="task.DueDate" class="task-due-date text-caption d-flex align-center"
					:class="dueDateInfo.colorClass">
					<v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
					{{ formatDate(task.DueDate) }} ({{ dueDateInfo.text }})
				</div>
			</div>

			<!-- Cột 2: Chips + Actions -->
			<div class="d-flex flex-column align-center ml-3">
				<div class="d-flex flex-wrap justify-center mb-1">
					<v-chip size="x-small" color="blue-grey" prepend-icon="mdi-file-upload-outline" class="mr-1">
						Nộp:{{ task.SubmittedCount }}/{{ task.TotalStudents }}
					</v-chip>
					<v-chip :color="statusInfo.color" size="x-small" variant="tonal">
						{{ statusInfo.text }}
					</v-chip>
				</div>

				
			</div>
			<div class="d-flex flex-column align-end ml-3">
				
				<!-- Nút chấm -->
				<v-btn size="x-small" variant="flat" color="primary" @click.stop="goToGradingPage">
					Chấm
				</v-btn>
			</div>

		</div>
	</v-card-text>
</v-card>
</template>

<script>
	export default {
		name: 'uc-teacher-focus-card',
		props: {
			task: {
				type: Object,
				required: true
			}
		},
		computed: {
			// Thông tin trạng thái để quyết định màu sắc, icon và text
			statusInfo() {
				const statuses = {
					'PENDING_GRADING': { color: 'warning', icon: 'mdi-file-clock-outline', iconColor: '#fb8c00', text: 'Cần chấm', cardClass: 'warning' },
					'OVERDUE': { color: 'error', icon: 'mdi-calendar-remove', iconColor: '#f44336', text: 'Quá hạn', cardClass: 'urgent' },
					'UPCOMING': { color: 'primary', icon: 'mdi-calendar-arrow-right', iconColor: '#1976d2', text: 'Sắp tới', cardClass: 'primary' }
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
					return { text: 'đã quá hạn', colorClass: 'text-error' };
				}
	
				const diffMinutes = Math.floor(diffSeconds / 60);
				if (diffMinutes < 60) {
					return { text: `còn ${diffMinutes} phút`, colorClass: 'text-warning' };
				}
	
				const diffHours = Math.floor(diffMinutes / 60);
				if (diffHours < 24) {
					return { text: `còn ${diffHours} giờ`, colorClass: 'text-warning' };
				}
	
				const diffDays = Math.floor(diffHours / 24);
				return { text: `còn ${diffDays} ngày`, colorClass: 'text-success' };
			}
		},
		methods: {
			// Xử lý sự kiện click nút "Chấm ngay"
			goToGradingPage() {
				// Ví dụ: openWindow({ url: `/lms_tc_grade_assignment?AssignToClassID=${this.task.AssignToClassID}` })
				Toast.info({ text: `Mở trang chấm bài cho "${this.task.Title}"...` });
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
				openWindow({
					title: "Giao Bài Tập Theo Lớp",
					url: `/lms_Assignment-Class-Detail?AssignToClassID=${assignment?.AssignToClassID}&LopID=${assignment?.LopID}&MonHocID==${assignment?.MonHocID}`,
					id: "WinGiaoBaiTap",
				});
			}
		}
	}
</script>