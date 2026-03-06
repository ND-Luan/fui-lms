<template>
	<v-card class="subject-progress-card bg-blue-lighten-1" @click="checkTienDo(subject)">
		<div class="subject-progress-content">
			<div class="subject-info">
				<span class="subject-name">{{ subject.MonHocName }}</span>
				<v-chip size="small" class="subject-stats">
					{{ subject.CompletedTasks }}/{{ subject.TotalTasks }}
				</v-chip>
			</div>
			<div class="d-flex flex-md-column flex-sm-row ga-2 align-sm-center">
				<v-progress-linear :model-value="progress" color="white" height="6" rounded
					bg-color="rgba(255, 255, 255, 0.3)" class="subject-progress">
				</v-progress-linear>
				<div class="progress-label" style="white-space: nowrap;">{{ Math.round(progress) }}% hoàn thành</div>
			</div>

		</div>
	</v-card>
</template>

<script>
export default {
	name: 'uc-subject-progress-bar',
	props: {
		subject: {
			type: Object,
			required: true
		}
	},
	emits: ['filter'],
	computed: {
		progress() {

			if (!this.subject.TotalTasks || this.subject.TotalTasks === 0) return 0;
			return (this.subject.CompletedTasks / this.subject.TotalTasks) * 100;
		}
	},

	methods: {
		checkTienDo(subject) {
			this.$emit('filter', subject)

			openWindow({
				title: `Tiến độ môn học ${subject?.MonHocName}`,
				url:
					`/lms-student-subject-detail?MonHocID=${subject?.MonHocID}`,
				id: "TienDoMonHoc",
				onclose: {
					"CALL": "vueData.initPage()"
				}
			});
		}
	},
}
</script>