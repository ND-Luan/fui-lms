<template>
	<div class="bg-blue-lighten-5" @click="checkTienDo(subject)">
		<v-row class="d-flex align-center">
			<v-col cols="3">
				<span class="text-subtitle-5 font-weight-bold text-no-wrap"> {{subject.MonHocName}}</span>
			</v-col>
			<v-col cols="9">
				<v-progress-linear :model-value="progress" color="teal-lighten-3" height="15" rounded
					bg-color="rgba(255, 255, 255, 0.3)" class="border ma-0">
					<template v-slot:default="{ value }">
						<strong>{{ Math.ceil(progress) }}%</strong>
					</template>
				</v-progress-linear>
			</v-col>
		</v-row>
	</div>
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
				})
					;
			}
		},
	}
</script>