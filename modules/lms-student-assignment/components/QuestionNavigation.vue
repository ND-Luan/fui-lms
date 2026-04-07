<template>
	<v-card class="question-nav" sticky top="80px" flat>
		<v-card-title class="d-flex justify-space-between align-center header-respondsive-fs py-2">
			<span style="font-size: clamp(14px,2vw,16px);">Cấu trúc bài tập</span>
			<div class="d-flex ga-2 align-center">
				<v-btn icon size="small" @click="navCollapsed = !navCollapsed">
					<v-icon>{{ navCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
				</v-btn>
			</div>
		</v-card-title>

		<v-divider></v-divider>

		<v-expand-transition>
			<div v-show="!navCollapsed" class="pa-2 pb-0" style="max-height: calc(-185px + 100vh);overflow: auto;">
				<div class="d-flex justify-end mb-2">
					<v-btn-toggle :model-value="viewMode" @update:model-value="$emit('update:viewMode', $event)"
						color="primary" variant="outlined" density="compact" divided mandatory size="x-small">
						<v-btn value="single" size="x-small">
							<v-icon size="16">mdi-numeric-1-box</v-icon>
							<span class="ml-1 d-none d-sm-inline">Từng câu</span>
						</v-btn>
						<v-btn value="all" size="x-small">
							<v-icon size="16">mdi-view-list</v-icon>
							<span class="ml-1 d-none d-sm-inline">Tất cả</span>
						</v-btn>
					</v-btn-toggle>
				</div>

				<div v-for="(group, groupIndex) in groups" :key="group.id" class="mb-2">
					<v-list-item @click="toggleGroup(groupIndex)" class="group-header-item px-0 py-1" density="compact">
						<template #prepend>
							<v-icon size="20" class="group-toggle-icon">
								{{ groupCollapsed[groupIndex] ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
							</v-icon>
						</template>
						<v-list-item-title class="group-title body-respondsive-fs">
							{{ group.title }}
						</v-list-item-title>
						<template #append>
							<v-chip size="x-small" color="primary" variant="outlined">
								{{ group.questions.length }} câu
							</v-chip>
						</template>
					</v-list-item>

					<v-expand-transition>
						<div v-show="!groupCollapsed[groupIndex]" class="mt-2">
							<div class="question-grid">
								<v-badge v-for="(q, questionIndexInGroup) in group.questions" :key="q.id"
									location="top right" :color="userAnswers[q.id]?.flag ? 'red' : 'white'"
									:icon="userAnswers[q.id]?.flag ? 'mdi-flag-variant' : ''"
							:model-value="!!userAnswers[q.id]?.flag">
									<v-btn @click="$emit('navigate', groupIndex, questionIndexInGroup, q.id)"
										:color="getIconColor(q.id)"
										:variant="isActive(groupIndex, questionIndexInGroup) ? 'elevated' : 'tonal'"
										class="question-btn w-100" size="small">
										<v-icon size="16">{{ getStatusIcon(q.id) }}</v-icon>
										{{ getQuestionNumber(groupIndex, questionIndexInGroup) }}
									</v-btn>
								</v-badge>
							</div>
						</div>
					</v-expand-transition>
				</div>
			</div>
		</v-expand-transition>
	</v-card>
</template>

<script>
	export default {
		name: 'QuestionNavigation',
		props: {
			groups: {
				type: Array,
				default: () => []
			},
			userAnswers: {
				type: Object,
				default: () => ({})
			},
			currentGroupIndex: {
				type: Number,
				default: 0
			},
			currentQuestionIndex: {
				type: Number,
				default: 0
			},
			viewMode: {
				type: String,
				default: 'all'
			},
			draft: {
				type: Object,
				default: () => ({})
			},
			getIconColor: {
				type: Function,
				required: true
			},
			getStatusIcon: {
				type: Function,
				required: true
			},
			getQuestionNumber: {
				type: Function,
				required: true
			}
		},
		emits: ['navigate', 'update:viewMode'],
		data() {
			return {
				navCollapsed: false,
				groupCollapsed: {}
			};
		},
		watch: {
			groups: {
				immediate: true,
				handler(newGroups) {
					if (newGroups) {
						const initialCollapsed = {};
						newGroups.forEach((group, index) => {
							initialCollapsed[index] = false;
						});
						this.groupCollapsed = initialCollapsed;
					}
				}
			}
		},
		methods: {
			toggleGroup(groupIndex) {
				this.groupCollapsed = {
					...this.groupCollapsed,
					[groupIndex]: !this.groupCollapsed[groupIndex]
				};
			},
	
			isActive(groupIndex, questionIndex) {
				return this.currentGroupIndex === groupIndex &&
					this.currentQuestionIndex === questionIndex;
			}
		}
	}
</script> 