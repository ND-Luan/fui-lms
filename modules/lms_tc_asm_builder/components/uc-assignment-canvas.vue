<template>
	<div class="assignment-canvas">
		<div v-if="!groups || groups.length === 0" class="text-center pa-6 text-grey">
			<v-icon size="48" class="mb-2">mdi-paperclip</v-icon>
			<div>{{ $t('message.DragOrSelectAComponentFromTheLibraryToGetStarted') }}.</div>
		</div>

		<!-- Vòng lặp qua các Nhóm (Groups) -->
		<div v-for="(group, groupIndex) in groups" :key="group.id" class="group-wrapper">
			<v-card class="group-card" variant="outlined">
				<div class="group-header" @click="selectItem('group', groupIndex)">
					<v-icon class="drag-handle">mdi-drag-vertical</v-icon>
					<div class="group-title">{{ group.title }}</div>
					<div class="ml-2 d-flex ga-2">
						<v-chip size="small" v-if="group.media.sourceYT.source?.length > 0" color="red">
							<v-icon>mdi-video-outline</v-icon>
						</v-chip>
						<v-chip size="small" v-if="group.media.sourceRecord.source?.length > 0" color="teal">
							<v-icon>mdi-multimedia</v-icon>
						</v-chip>
						<v-chip size="small"
							v-if="group.media.sourceFiles.file?.length > 0 || group.media.sourceFiles.image?.length > 0"
							color="blue">
							<v-icon>mdi-file</v-icon>
						</v-chip>
					</div>
					<v-chip variant="text" color="primary" class="ml-1 font-weight-medium"
						v-if="renderPointInGroup(group) > 0" size="small">
						{{ $t('message.Total') }} {{ $t('message.Score') }}: {{ renderPointInGroup(group) }}
					</v-chip>
					<v-spacer />
					<uc-btn-import-json v-model:questions="group.questions" :targetGroupIndex="groupIndex" />
					<v-chip class="ml-2 font-weight-medium" size="small" color="primary" variant="text">
						{{ group.questions.length }} {{ $t('message.Question') }}
					</v-chip>
					<v-btn icon size="small" variant="text" @click.stop="removeGroup(groupIndex)">
						<v-icon>mdi-delete-outline</v-icon>
					</v-btn>
				</div>

				<!-- Container cho câu hỏi với drop zone -->
				<div class="questions-container">
					<!-- Vòng lặp qua các Câu hỏi (Questions) trong nhóm -->
					<v-list v-if="group.questions.length > 0" class="pa-0">
						<div v-for="(question, qIndex) in group.questions" :key="question.id"
							class="question-item-wrapper"
							@dragover.prevent="handleQuestionDragOver($event, groupIndex, qIndex)"
							@dragenter.prevent="handleQuestionDragEnter($event, groupIndex, qIndex)"
							@dragleave="handleQuestionDragLeave($event)"
							@drop.prevent="handleQuestionDrop($event, groupIndex, qIndex)">
							<!-- Drop indicator phía trên -->
							<div v-if="showDropIndicator(groupIndex, qIndex, 'before')" class="drop-indicator"></div>

							<v-list-item class="question-preview" :class="{
								'selected': isSelectedQuestion(groupIndex, qIndex),
								'dragging': isDragging(groupIndex, qIndex)
							}" @click="selectItem('question', groupIndex, qIndex)" draggable="true"
								@dragstart="handleQuestionDragStart($event, groupIndex, qIndex)"
								@dragend="handleDragEnd">
								<template #prepend>
									<v-icon class="drag-handle">mdi-drag</v-icon>
								</template>
								<template #append>
									<v-chip size="x-small" class="mr-1">{{ question.type }}</v-chip>
									<div class="d-flex align-center">
										<v-btn icon size="x-small" variant="text"
											@click.stop="removeQuestion(groupIndex, qIndex)">
											<v-icon>mdi-close</v-icon>
										</v-btn>
									</div>
								</template>

								<v-list-item-title class="font-weight-bold d-flex align-center">
									{{ $t('message.Question') }} {{ question.ordinalNumber }}:
									<span class="ml-2" v-if="question.type?.includes('QUIZ')">
										<v-chip size="x-small" color="red"
											v-if="vueData.isCheckAnswerQuestionNotChoose(question)">
											{{ $t('message.NoAnswer') }}
										</v-chip>
									</span>
									<span class="ml-2 d-flex ga-2">
										<v-chip size="small" v-if="question.config.media.sourceYT.source?.length > 0"
											color="red">
											<v-icon>mdi-video-outline</v-icon>
										</v-chip>
										<v-chip size="small"
											v-if="question.config.media.sourceRecord.source?.length > 0" color="teal">
											<v-icon>mdi-multimedia</v-icon>
										</v-chip>
										<v-chip size="small"
											v-if="question.config.media.sourceFiles.file?.length > 0 || question.config.media.sourceFiles.image?.length > 0"
											color="blue">
											<v-icon>mdi-file</v-icon>
										</v-chip>
									</span>
								</v-list-item-title>
								<v-list-item-subtitle>
									<uc-latex-view v-model:content="question.config.questionText" class="flex-column"
										:escapeHtml="false"
										style="-webkit-box-orient: unset; word-break: break-word; line-height: 1.25rem !important; align-items: unset !important; display: table !important;" />
								</v-list-item-subtitle>
							</v-list-item>

							<!-- Drop indicator phía dưới (chỉ hiện ở item cuối) -->
							<div v-if="showDropIndicator(groupIndex, qIndex, 'after')" class="drop-indicator"></div>
						</div>
					</v-list>

					<!-- Empty state với drop zone -->
					<div v-else class="empty-group-placeholder"
						:class="{ 'drag-over': dragOverGroupIndex === groupIndex }"
						@dragover.prevent="handleEmptyGroupDragOver"
						@dragenter.prevent="handleEmptyGroupDragEnter($event, groupIndex)"
						@dragleave="handleEmptyGroupDragLeave" @drop.prevent="handleEmptyGroupDrop($event, groupIndex)">
						<v-icon class="mb-2" color="grey-lighten-1">mdi-inbox-arrow-down</v-icon>
						<div class="text-grey">{{ $t('message.DropQuestionHere') }}</div>
					</div>
				</div>
			</v-card>
		</div>

		<v-btn block variant="elevated" color="primary" class="mt-4" @click="addGroup"
			style="position: sticky;bottom: -4px;">
			<v-icon start>mdi-plus-box-outline</v-icon>
			{{ $t('message.AddNewSection') }}
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
	data() {
		return {
			draggedQuestion: null, // { groupIndex, qIndex, question }
			dragOverGroupIndex: null,
			dragOverPosition: null, // { groupIndex, qIndex, position }
			vueData
		}
	},
	computed: {
		getTotalQuestion() {
			let number = 0
			for (let i = 0; i < this.groups.length; i++) {
				number += this.groups[i].questions.length
			}
			return number
		},
	},
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
		isSelectedQuestion(groupIndex, qIndex) {
			return this.selectedItem?.type === 'question' &&
				this.selectedItem?.groupIndex === groupIndex &&
				this.selectedItem?.qIndex === qIndex;
		},
		isDragging(groupIndex, qIndex) {
			return this.draggedQuestion?.groupIndex === groupIndex &&
				this.draggedQuestion?.qIndex === qIndex;
		},
		showDropIndicator(groupIndex, qIndex, position) {
			if (!this.dragOverPosition) return false;

			const isSameGroup = this.dragOverPosition.groupIndex === groupIndex;
			const isSameIndex = this.dragOverPosition.qIndex === qIndex;
			const isSamePosition = this.dragOverPosition.position === position;

			// Không hiển thị indicator cho chính item đang kéo
			if (this.draggedQuestion &&
				this.draggedQuestion.groupIndex === groupIndex &&
				this.draggedQuestion.qIndex === qIndex) {
				return false;
			}

			if (position === 'after') {
				// Chỉ hiển thị 'after' indicator ở item cuối cùng
				const isLastItem = qIndex === this.groups[groupIndex].questions.length - 1;
				return isLastItem && isSameGroup && isSameIndex && isSamePosition;
			}

			return isSameGroup && isSameIndex && isSamePosition;
		},
		addGroup() {
			const newGroups = [...this.groups];
			newGroups.push({
				id: `group_${Date.now()}`,
				title: `${this.$i18n.locale == 'en' ? 'Section' : 'Phần'} ${newGroups.length + 1}`,
				description: '',
				media: {
					type: "YOUTUBE",
					sourceYT: { id: "", source: "", name: "" },
					sourceIMGs: [],
					sourceRecord: { id: "", source: "", name: "" },
					sourceFiles: {
						file: [],
						image: []
					}
				},
				questions: []
			});
			this.$emit('update:groups', newGroups);
		},
		removeGroup(groupIndex) {
			const $this = this
			console.log($this.groups[groupIndex])
			if ($this.groups[groupIndex].questions.length === 0) {
				const newGroups = $this.groups.filter((_, index) => index !== groupIndex);
				$this.$emit('update:groups', newGroups);
				$this.$emit('update:selectedItem', null);
				return
			}
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

			for (const question of group.questions) {
				total += Number(question?.points ?? 0)
			}

			return this.formatNumber(total, 2)
		},

		formatNumber(value, decimals = 2) {
			if (isNaN(value)) return (0).toFixed(decimals)
			return Number(value).toFixed(decimals)
		},
		moveQuestion(groupIndex, qIndex, direction) {
			const newGroups = JSON.parse(JSON.stringify(this.groups))
			const questions = newGroups[groupIndex].questions
			const targetIndex = direction === 'up' ? qIndex - 1 : qIndex + 1
			if (targetIndex < 0 || targetIndex >= questions.length) return
			const temp = questions[qIndex]
			questions[qIndex] = questions[targetIndex]
			questions[targetIndex] = temp
			this.$emit('update:groups', newGroups)
			this.$emit('update:selectedItem', { type: 'question', groupIndex, qIndex: targetIndex })
		},
		// Drag & Drop handlers for questions
		handleQuestionDragStart(event, groupIndex, qIndex) {
			this.draggedQuestion = {
				groupIndex,
				qIndex,
				question: JSON.parse(JSON.stringify(this.groups[groupIndex].questions[qIndex]))
			};

			event.dataTransfer.effectAllowed = 'move';
			event.target.classList.add('dragging');
		},

		handleDragEnd(event) {
			event.target.classList.remove('dragging');
			this.draggedQuestion = null;
			this.dragOverGroupIndex = null;
			this.dragOverPosition = null;
		},

		handleQuestionDragEnter(event, groupIndex, qIndex) {
			if (!this.draggedQuestion) return;

			// Không xử lý nếu kéo vào chính nó
			if (this.draggedQuestion.groupIndex === groupIndex &&
				this.draggedQuestion.qIndex === qIndex) {
				return;
			}
		},

		handleQuestionDragLeave(event) {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				this.dragOverPosition = null;
			}
		},

		handleQuestionDragOver(event, groupIndex, qIndex) {
			if (!this.draggedQuestion) return;

			// Không xử lý nếu kéo vào chính nó
			if (this.draggedQuestion.groupIndex === groupIndex &&
				this.draggedQuestion.qIndex === qIndex) {
				return;
			}

			// Tính toán vị trí drop dựa vào vị trí chuột
			const rect = event.currentTarget.getBoundingClientRect();
			const mouseY = event.clientY;
			const itemCenterY = rect.top + rect.height / 2;

			const position = mouseY < itemCenterY ? 'before' : 'after';

			this.dragOverPosition = {
				groupIndex,
				qIndex,
				position
			};
		},

		handleQuestionDrop(event, targetGroupIndex, targetQIndex) {
			if (!this.draggedQuestion || !this.dragOverPosition) return;

			const { groupIndex: sourceGroupIndex, qIndex: sourceQIndex, question } = this.draggedQuestion;
			const { position } = this.dragOverPosition;

			// Tạo bản copy của groups
			const newGroups = JSON.parse(JSON.stringify(this.groups));

			// Tính toán vị trí insert
			let insertIndex = targetQIndex;
			if (position === 'after') {
				insertIndex += 1;
			}

			// Nếu di chuyển trong cùng group
			if (sourceGroupIndex === targetGroupIndex) {
				// Điều chỉnh index nếu cần
				if (sourceQIndex < insertIndex) {
					insertIndex -= 1;
				}

				// Không làm gì nếu vị trí không thay đổi
				if (sourceQIndex === insertIndex) {
					return;
				}

				// Di chuyển trong cùng group
				newGroups[sourceGroupIndex].questions.splice(sourceQIndex, 1);
				newGroups[targetGroupIndex].questions.splice(insertIndex, 0, question);
			} else {
				// Di chuyển giữa các group
				newGroups[sourceGroupIndex].questions.splice(sourceQIndex, 1);
				newGroups[targetGroupIndex].questions.splice(insertIndex, 0, question);
			}

			// Cập nhật
			this.$emit('update:groups', newGroups);
			this.$emit('update:selectedItem', {
				type: 'question',
				groupIndex: targetGroupIndex,
				qIndex: insertIndex
			});

			// Clear state
			this.draggedQuestion = null;
			this.dragOverPosition = null;
		},

		// Handlers for empty groups
		handleEmptyGroupDragOver(event) {
			event.dataTransfer.dropEffect = 'move';
		},

		handleEmptyGroupDragEnter(event, groupIndex) {
			this.dragOverGroupIndex = groupIndex;
		},

		handleEmptyGroupDragLeave(event) {
			if (!event.currentTarget.contains(event.relatedTarget)) {
				this.dragOverGroupIndex = null;
			}
		},

		handleEmptyGroupDrop(event, targetGroupIndex) {
			if (!this.draggedQuestion) return;

			const { groupIndex: sourceGroupIndex, qIndex: sourceQIndex, question } = this.draggedQuestion;

			// Không xử lý nếu drop vào cùng group
			if (sourceGroupIndex === targetGroupIndex) {
				return;
			}

			const newGroups = JSON.parse(JSON.stringify(this.groups));

			// Remove from source
			newGroups[sourceGroupIndex].questions.splice(sourceQIndex, 1);

			// Add to target (empty group)
			newGroups[targetGroupIndex].questions.push(question);

			this.$emit('update:groups', newGroups);
			this.$emit('update:selectedItem', {
				type: 'question',
				groupIndex: targetGroupIndex,
				qIndex: 0
			});

			this.draggedQuestion = null;
			this.dragOverGroupIndex = null;
		}
	}
}
</script>