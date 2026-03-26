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
							<v-chip variant="text" size="x-small" color="success" prepend-icon="mdi-file-upload-outline" class="me-0 pe-2">
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
						<v-btn v-tooltip=" task.IsHided ? 'Hiện bài tập' : 'Ẩn bài tập'" size="x-small" :icon=" task.IsHided ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" @click.stop="handleHide(task)"></v-btn>
					</div>
				</div>
			</div>
			<v-dialog v-model="isOpen" fullscreen>
				<v-card id="ChamBaiDialog" style="overflow: hidden;">
					<v-card-title class="d-flex bg-primary ChamBaiDialog" style="max-height: 48px">
						<span class="text-white">Giao Bài Tập Theo {{ task?.AssignType == 'STUDENT' ? 'Học Sinh'
							: 'Lớp' }}</span>
						<v-spacer></v-spacer>
						<v-btn class="text-white" @click="onClose()" variant="text" icon="mdi-close"></v-btn>
					</v-card-title>
					<v-card-text class="pa-0 e">
						<iframe class="position-absolute focus-task" :src="url" width="100%" allow="fullscreen"
							style="border:none;"
							:style="{ 'height': gradeAssignment ? 'calc(100dvh)' : 'calc(100dvh - 64px)' }"></iframe>
					</v-card-text>
				</v-card>
			</v-dialog>
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
	data() {
		return {
			isOpen: false,
			url: '',
			gradeAssignment: false
		}
	},
	mounted() {
		window.addEventListener(`message`, (event) => this.handleMessage(event))
	},
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
	unmounted() {
		window.removeEventListener("message", this.handleMessage())
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
			console.log('assignment', assignment)
			this.url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${assignment?.AssignToClassID}&LopID=${assignment?.LopID}&MonHocID=${assignment?.MonHocID}&AssignType=${assignment?.AssignType}&KhoiID=${assignment?.KhoiID}`
			this.isOpen = true
		},
		onClose() {
			this.isOpen = false
			vueData.apiCall1()
		},
		handleMessage(event) {
			if (!event || !event.data || !event.data.type) return
			if (event.origin === 'https://lms.lhbs.vn' && event.data.type === "fromIframe") {
				if (event.data.value == 'hide') {
					this.gradeAssignment = true
					document.getElementsByClassName('ChamBaiDialog')[0].style.setProperty("display", "none", "important");
				} else {
					this.gradeAssignment = false
					document.getElementsByClassName('ChamBaiDialog')[0].style.setProperty("display", "flex", "important");
				}
			}
		},
		handleHide(task) {
			task.IsHided = !task.IsHided
			this.Update_IsHided(task.AssignToClassID)
		},
		Update_IsHided

	}
}
</script>