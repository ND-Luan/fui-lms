<template>
	<v-dialog :model-value="visible" @update:model-value="$emit('update:visible', false)" max-width="90%">
		<v-card>
			<v-card-title class="d-flex justify-space-between align-center">
				<span>Sổ điểm cá nhân - {{ subjectName }}</span>
				<v-btn icon="mdi-close" variant="text" @click="$emit('update:visible', false)"></v-btn>
			</v-card-title>
			<v-divider></v-divider>
			<v-card-text>
				<div v-if="loading" class="text-center pa-8">
					<v-progress-circular indeterminate color="primary"></v-progress-circular>
				</div>
				<v-table v-else fixed-header height="60vh" density="compact">
					<thead>
						<tr>
							<th class="assignment-title-col">Bài tập/Bài kiểm tra</th>
							<th class="text-center">Điểm số</th>
							<th class="text-center">Điểm tối đa</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in gradeData" :key="item.AssignToClassID">
							<td class="font-weight-medium">{{ item.AssignmentTitle }}</td>
							<td class="text-center" :class="getScoreColor(item.Score, item.MaxScore)">
								{{ item.Score != null ? item.Score.toFixed(1) : '—' }}
							</td>
							<td class="text-center">{{ item.MaxScore.toFixed(1) }}</td>
						</tr>
					</tbody>
				</v-table>
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
    name: 'uc-student-gradebook-dialog',
    props: {
        visible: Boolean,
        monHocId: Number,
        subjectName: String
    },
    emits: ['update:visible'],
    data() {
        return {
            loading: false,
            gradeData: []
        };
    },
    watch: {
        visible(newVal) {
            if (newVal && this.monHocId) {
                this.fetchGradebook();
            }
        }
    },
    methods: {
        async fetchGradebook() {
            this.loading = true;
            this.gradeData = [];
            await ajaxCALL("lms/EL_Student_GetMyGradebook", { MonHocID: this.monHocId }, (res) => {
                if (res && res.data && res.data.length >= 2) {
                    const headers = res.data[0];
                    
                    const scores = new Map(res.data[2].map(s => [s.AssignToClassID, s.Score]));
                    this.gradeData = headers.map(h => ({
                        ...h,
                        Score: scores.get(h.AssignToClassID)
                    }));
                }
            });
            this.loading = false;
        },
        getScoreColor(score, maxScore) {
            if (score == null) return '';
            const ratio = score / maxScore;
            if (ratio < 0.5) return 'text-error';
            if (ratio < 0.7) return 'text-warning';
            return 'text-success';
        }
    }
}
</script>

<style scoped>
	.assignment-title-col {
		width: 60%;
	}
</style>