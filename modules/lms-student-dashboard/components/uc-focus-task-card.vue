<template>
	<v-card class="focus-card" @click="goToResource" variant="outlined">

		<!-- DẢI BĂNG GÓC - Chỉ hiển thị cho BÀI TẬP -->
		<div v-if="typeInfo.isAssignment" class="corner-banner" :class="statusInfo.cardClass">
			<span>BÀI TẬP</span>
		</div>

		<v-card-text class="focus-card-content">
			<!-- ICON ĐẶC TRƯNG CHO LOẠI NHIỆM VỤ -->
			<div class="task-type-icon" :style="{ backgroundColor: typeInfo.color + '1A' }">
				<v-icon :icon="typeInfo.icon" :color="typeInfo.color" size="28"></v-icon>
			</div>

			<!-- THÔNG TIN CHÍNH -->
			<div class="task-info">
				<div class="task-title">{{ task.Title }}</div>
				<div v-if="task.DueDate && typeInfo.isAssignment" class="task-due-date" :class="dueDateInfo.colorClass">
					<v-icon size="14" class="mr-1">mdi-calendar-clock</v-icon>
					Hạn nộp: {{ formatDate(task.DueDate) }} ({{ dueDateInfo.text }})
				</div>
			</div>

			<!-- CHIP TRẠNG THÁI -->
			<v-chip :color="statusInfo.color" size="small" class="task-status-chip" variant="tonal">
				{{ statusInfo.text }}
			</v-chip>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	name: 'uc-focus-task-card',
	props: {
		task: {
			type: Object,
			required: true
		}
	},
	computed: {
		typeInfo() {
			if (this.task.ResourceType === 'ASSIGNMENT') {
				return {
					isAssignment: true,
					icon: 'mdi-pencil-ruler',
					color: '#1976D2' // Primary
				};
			}
			return {
				isAssignment: false,
				icon: 'mdi-book-open-page-variant',
				color: '#388E3C' // Success
			};
		},
		statusInfo() {
			const statuses = {
				'OVERDUE': { color: 'error', text: 'Quá hạn', cardClass: 'urgent' },
				'IN_PROGRESS': { color: 'warning', text: this.task.ResourceType === 'ASSIGNMENT' ? 'Đang làm' : 'Đang học', cardClass: 'warning' },
				'NOT_STARTED': { color: this.typeInfo.isAssignment ? 'primary' : 'success', text: 'Bắt đầu', cardClass: 'normal' }
			};
			return statuses[this.task.Status] || statuses['NOT_STARTED'];
		},
		dueDateInfo() {
			if (!this.task.DueDate) return { text: '', colorClass: '' };
			const now = new Date();
			const dueDate = new Date(this.task.DueDate);
			const diffSeconds = Math.floor((dueDate - now) / 1000);
			if (diffSeconds < 0) return { text: 'đã quá hạn', colorClass: 'text-error' };
			const diffMinutes = Math.floor(diffSeconds / 60);
			if (diffMinutes < 60) return { text: `còn ${diffMinutes} phút`, colorClass: 'text-warning-darken-2' };
			const diffHours = Math.floor(diffMinutes / 60);
			if (diffHours < 24) return { text: `còn ${diffHours} giờ`, colorClass: 'text-warning-darken-2' };
			const timeDiff = dueDate.getTime() - now.getTime();
			const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
			return { text: `còn ${daysDiff} ngày`, colorClass: 'text-success-darken-1' };
		}
	},
	methods: {
		goToResource() {
			const type = (this.task.ResourceType || '').toLowerCase();
			const id = this.task.ResourceID;
			if (type && id) {
				if (type === 'assignment') {
					openWindow({
						title: this.task.Title,
						url: `/lms-student-assignment?AssignToClassID=${id}`,
						id: 'StudentDoASM',
						onclose: {
							"EXE": "vueData.initPage()"
						}
					})
				} else if (type === 'lesson') {
					openWindow({
						title: this.task.Title,
						url: `/lms-student-lesson-viewer?AssignToClassID=${id}`,
						onclose: {
							"EXE": "vueData.initPage()"
						}
					})
				}
			}
		},
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleString('vi-VN', {
				hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
			});
		}
	}
}
</script>