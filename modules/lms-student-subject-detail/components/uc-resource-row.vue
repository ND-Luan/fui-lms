<template>
	<div class="resource-row">
		<div class="d-flex align-center resource-info">
			<v-icon :color="itemInfo.color" class="mr-3">{{ itemInfo.icon }}</v-icon>
			<div class="resource-details">
				<div class="resource-title">{{ item.Title }}</div>
				<div v-if="item.DueDate" class="resource-meta">Hạn nộp: {{ formatDate(item.DueDate) }}</div>
			</div>
		</div>
		<div class="d-flex align-center ga-2 resource-actions">
			<v-chip :color="statusInfo.color" size="small" variant="flat" label> {{ statusInfo.text }}</v-chip>
			<v-btn size="small" color="primary" variant="tonal" @click="onOpenWindow">{{ actionButtonText }}</v-btn>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-resource-row',
		props: {
			item: {
				type: Object,
				required: true
			}
		},
		computed: {
			itemInfo() {
				if (this.item.ResourceType === 'ASSIGNMENT') {
					return { icon: 'mdi-notebook-edit-outline', color: '#1E88E5' }; // Blue
				}
				return { icon: 'mdi-presentation-play', color: '#43A047' }; // Green
			},
			statusInfo() {
				const scoreText = this.item.StudentScore != null ? `Kết quả: ${this.item.StudentScore.toFixed(2)} điểm` : 'Đã chấm';
				const statusMap = {
					'NOT_STARTED': { text: 'Chưa bắt đầu', color: 'grey' },
					'IN_PROGRESS': { text: 'Đang thực hiện', color: 'orange' },
					'COMPLETED': { text: 'Đã hoàn thành', color: 'success' },
					'SUBMITTED': { text: 'Đã nộp', color: 'info' },
					'GRADED': { text: scoreText, color: 'teal' }
				};
				return statusMap[this.item.StudentStatus] || statusMap['NOT_STARTED'];
			},
			actionButtonText() {
				const status = this.item.StudentStatus;
				if (['GRADED', 'SUBMITTED', 'COMPLETED'].includes(status)) {
					return 'Xem lại';
				}
				return this.item.ResourceType === 'LESSON' ? 'Vào học' : 'Làm bài';
			}
		},
		methods: {
			onOpenWindow() {
				let url = null
				if (this.item.ResourceType === 'LESSON') {
					url = `/lms-student-lesson-viewer?AssignToClassID=${this.item.AssignToClassID}`
				} else {
					url = `/lms-student-assignment?AssignToClassID=${this.item.AssignToClassID}`
				}
				openWindow({
					title: "",
					url: url,
					onclose: {
	
					}
				})
			},
			formatDate(dateString) {
				if (!dateString) return '';
				return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
			}
		}
	}
</script>