<!-- Tên file: uc-assignment-canvas.vue -->
<template>
	<div class="assignment-canvas">
		<div v-if="!groups || groups.length === 0" class="text-center pa-10 text-grey">
			<v-icon size="48" class="mb-2">mdi-paperclip</v-icon>
			<div>Kéo hoặc chọn thành phần từ thư viện để bắt đầu.</div>
		</div>

		<!-- Vòng lặp qua các Nhóm (Groups) -->
		<div v-for="(group, groupIndex) in groups" :key="group.id" class="group-wrapper">
			<v-card class="group-card" variant="outlined">
				<div class="group-header" @click="selectItem('group', groupIndex)">
					<v-icon class="drag-handle">mdi-drag-vertical</v-icon>
					<div class="group-title">{{ group.title }}</div>
					<v-chip color="primary" class="ml-2" v-if="renderPointInGroup(group) > 0" size="small">
						Tổng {{renderPointInGroup(group)}} điểm
					</v-chip>
					<v-spacer></v-spacer>
					<!-- v-model:text="currentQuestionsList" :has-groups="editableData.hasGroups"
												:groups="editableData.groups || []" :target-group-index="activeGroupIndex"
												@update:text="handleImportQuestions" -->

					<!-- {{assignment?.AssignmentConfig?.groups}} -->
					<uc-btn-import-json v-model:questions="group.questions" :targetGroupIndex="groupIndex" />
					<v-chip class="ml-2" size="small" color="primary" variant="tonal">
						{{ group.questions.length }} câu
					</v-chip>
					<v-btn icon size="small" variant="text" @click.stop="removeGroup(groupIndex)">
						<v-icon>mdi-delete-outline</v-icon>
					</v-btn>
				</div>

				<!-- Vòng lặp qua các Câu hỏi (Questions) trong nhóm -->
				<!-- <div class="questions-container"> -->
				<v-list class="questions-container">
					<v-list-item class="question-preview" v-for="(question, qIndex) in group.questions"
						:key="question.id" @click="selectItem('question', groupIndex, qIndex)">
						<template #prepend>
							<v-icon class="drag-handle">mdi-drag</v-icon>
						</template>

						<template #append>
							<v-chip size="x-small" class="mr-2">{{ question.type }}</v-chip>
							<v-btn icon size="x-small" variant="text" @click.stop="removeQuestion(groupIndex, qIndex)">
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</template>

						<v-list-item-title class="font-weight-bold">
							Câu {{ getGlobalQuestionNumber(groupIndex, qIndex) }}:
						</v-list-item-title>
						<v-list-item-subtitle>
							<uc-latex-view v-model:content="question.config.questionText" class="flex-column"
								style="-webkit-box-orient: unset; word-break: break-word; line-height: 1.25rem !important; align-items: unset !important" />
						</v-list-item-subtitle>
					</v-list-item>

					<div v-if="group.questions.length === 0" class="empty-group-placeholder">
						Thả câu hỏi vào đây
					</div>
				</v-list>
				<!-- </div> -->
			</v-card>
		</div>

		<v-btn block variant="elevated" color="primary" class="mt-4" @click="addGroup"
			style="position: sticky;bottom: -4px;">
			<v-icon start>mdi-plus-box-outline</v-icon>
			Thêm Phần mới
		</v-btn>
	</div>
</template>

<script>
	export default {
		name: 'uc-assignment-canvas',
		props: {
			groups: { type: Array, default: () => [] },
			selectedItem: Object // { type, groupIndex, qIndex }
		},
		emits: ['update:groups', 'update:selectedItem'],
		methods: {
			stripHtml(html) {
				if (!html) return 'Chưa có nội dung';
				let doc = new DOMParser().parseFromString(html, 'text/html');
				return doc.body.textContent || "";
			},
			getGlobalQuestionNumber(groupIndex, qIndex) {
				let number = 1;
				for (let i = 0; i < groupIndex; i++) {
					number += this.groups[i].questions.length;
				}
				return number + qIndex;
			},
			selectItem(type, groupIndex, qIndex = null) {
				this.$emit('update:selectedItem', { type, groupIndex, qIndex });
			},
			addGroup() {
				const newGroups = [...this.groups];
				newGroups.push({
					id: `group_${Date.now()}`,
					title: `Phần ${newGroups.length + 1}`,
					description: '',
					questions: []
				});
				this.$emit('update:groups', newGroups);
			},
			removeGroup(groupIndex) {
				const $this = this
				confirm({
					title: "Bạn có chắc muốn xóa toàn bộ phần này?",
					action: () => {
						const newGroups = $this.groups.filter((_, index) => index !== groupIndex);
						$this.$emit('update:groups', newGroups);
						$this.$emit('update:selectedItem', null);
					}
				})
	
			},
			removeQuestion(groupIndex, qIndex) {
				const newGroups = JSON.parse(JSON.stringify(this.groups));
				newGroups[groupIndex].questions.splice(qIndex, 1);
				this.$emit('update:groups', newGroups);
				this.$emit('update:selectedItem', null);
			},
			renderPointInGroup(group) {
				let total = 0
				for (question of group.questions) {
					total += question?.points ?? 0
				}
				return total
			}
		}
	}
</script>