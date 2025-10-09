<template>
	<div class="assignment-row" :class="getBgColor(assignment.ResourceType)">
		<!-- Cột thông tin bài tập -->
		<div class="assignment-details">
			<div class="assignment-title">
				<v-chip size="small" label variant="flat" :color="getTypeColor(assignment.ResourceType)">
					{{ getNameType(assignment.ResourceType) }}
				</v-chip>
				{{ assignment.AssignmentTitle ?? assignment.LessonTitle }}
			</div>
			<div class="assignment-meta">
				Hạn nộp: {{ formatDate(assignment.DueDate) }}
			</div>

		</div>

		<!-- Cột thống kê -->
		<div class="assignment-stats d-flex flex-wrap gap-2 flex-column flex-md-row">


			<v-chip size="small" variant="tonal" color="info" class="mr-2"
				v-if="assignment.ResourceType === 'ASSIGNMENT'">
				Đã nộp: {{ assignment.SubmittedCount }}/{{ assignment.TotalStudentsInClass }}
			</v-chip>
			<v-chip size="small" variant="tonal" color="info" class="mr-2" v-else>
				Đang học: {{ assignment.LearningCount }}/{{ assignment.TotalStudentsInClass }}
			</v-chip>
			<v-chip size="small" variant="flat" color="warning" v-if="assignment.ResourceType === 'ASSIGNMENT'">
				Đã chấm: {{ assignment.GradedCount }}
			</v-chip>
			<v-chip size="small" variant="flat" color="warning" v-else>
				Đã hoàn thành {{ assignment.CompletedCount }}
			</v-chip>
			<!-- Cột hành động -->
			<div class="assignment-actions">
				<v-btn size="small" variant="flat" color="primary" @click="chamBai(assignment)"
					v-if="assignment.ResourceType === 'ASSIGNMENT'">Chấm ngay</v-btn>
			</div>
		</div>


	</div>
</template>

<script>
export default {
	name: 'uc-assignment-status-row',
	props: { assignment: Object },
	methods: {
		formatDate(dateString) {
			if (!dateString) return 'N/A';
			return new Date(dateString).toLocaleDateString('vi-VN', {
				day: '2-digit', month: '2-digit', year: 'numeric'
			});
		},
		chamBai(assignment) {
			openWindow({
				title: "Giao Bài Tập Theo Lớp",
				url: `/lms_Assignment-Class-Detail?AssignToClassID=${assignment?.AssignToClassID}&LopID=${assignment?.LopID}&MonHocID=${assignment?.MonHocID}`,
				id: "WinGiaoBaiTap",
				onclose: {
					EXE: "vueData.initPage()"
				}
			});
		},
		getTypeColor(type) {
			const resourceType = (type || '')
			if (resourceType.includes('ASSIGNMENT')) return 'blue';
			if (resourceType.includes('LESSON')) return 'teal';

		},
		getBgColor(type) {
			const resourceType = (type || '')
			if (resourceType.includes('ASSIGNMENT')) return 'bg-blue-lighten-4';
			if (resourceType.includes('LESSON')) return 'bg-green-lighten-4';

		},
		getNameType(nameType) {
			const name = (nameType || '')
			if (name.includes('ASSIGNMENT')) return 'Bài Tập';
			if (name.includes('LESSON')) return 'Bài Học';

		}
	}
}
</script>