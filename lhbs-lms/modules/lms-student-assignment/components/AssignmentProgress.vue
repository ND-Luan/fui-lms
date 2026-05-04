<template>
	<v-card class="mb-2 mx-2" flat border style="position: sticky; top: 0; z-index: 1;">
		<v-card-text class="py-2">
			<div class="d-flex align-center ga-2">
				<v-progress-linear :model-value="progressPercent" color="primary" height="6" rounded
					class="flex-grow-1 w-50" />
				<span class="text-caption text-medium-emphasis">
					{{ answeredCount }} / {{ totalQuestions }} ({{ Math.round(progressPercent) }}%)
				</span>
				<v-spacer />
				<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
					<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
				</v-chip>
				<v-btn v-if="!isSubmitted" color="success" variant="outlined" size="small" @click="$emit('submit')">
					<v-icon start size="16">mdi-check-all</v-icon>Nộp bài
				</v-btn>
				<v-chip v-else color="success" size="small" label>
					<v-icon start size="14">mdi-check-decagram</v-icon>
					{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
				</v-chip>
			</div>
		</v-card-text>
	</v-card>
</template>

<script>
	export default {
		name: 'AssignmentProgress',
		props: {
			answeredCount: {
				type: Number,
				default: 0
			},
			totalQuestions: {
				type: Number,
				default: 0
			},
			progressPercent: {
				type: Number,
				default: 0
			},
			saveStatus: {
				type: String,
				default: 'Đã lưu'
			},
			saveStatusColor: {
				type: String,
				default: 'grey'
			},
			saveStatusIcon: {
				type: String,
				default: 'mdi-cloud-check-outline'
			},
			isSubmitted: {
				type: Boolean,
				default: false
			},
			isGraded: {
				type: Boolean,
				default: false
			}
		},
		emits: ['submit']
	}
</script>