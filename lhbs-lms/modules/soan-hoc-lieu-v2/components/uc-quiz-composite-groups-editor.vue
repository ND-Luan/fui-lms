<template>
	<div class="quiz-composite-groups-editor">
		<!-- Header thông tin chung -->
		<v-card class="mb-4" variant="outlined">
			<v-card-title class="d-flex justify-space-between align-center pa-3">
				<span class="text-h6">⚙️ Cấu hình bài kiểm tra</span>
				<v-chip :color="editableData.hasGroups ? 'success' : 'grey'" size="small">
					{{ editableData.hasGroups ? 'Chế độ nhóm' : 'Chế độ đơn' }}
				</v-chip>
			</v-card-title>

			<v-card-text>
				<v-row>
					<v-col cols="12" md="6">
						<v-text-field v-model="editableData.title" label="Tiêu đề bài kiểm tra" variant="outlined"
							density="compact" prepend-inner-icon="mdi-format-title" />
					</v-col>

					<v-col cols="6" md="3">
						<v-text-field v-model.number="editableData.timeLimit" label="Thời gian (phút)" type="number"
							variant="outlined" density="compact" prepend-inner-icon="mdi-timer" />
					</v-col>

					<v-col cols="6" md="3">
						<v-text-field v-model.number="editableData.passingScore" label="Điểm qua bài" type="number"
							variant="outlined" density="compact" prepend-inner-icon="mdi-target" />
					</v-col>
				</v-row>

				<!-- Summary Stats -->
				<v-alert type="info" variant="tonal" density="compact" class="mt-2">
					<div class="d-flex justify-space-between align-center flex-wrap">
						<span>📊 Tổng quan:</span>
						<div class="d-flex gap-3">
							<span>📝 {{ totalQuestionsCount }} câu</span>
							<span>🎯 {{ totalPointsCalculated }} điểm</span>
							<span v-if="editableData.hasGroups">📁 {{ editableData.groups.length }} nhóm</span>
						</div>
					</div>
				</v-alert>
			</v-card-text>
		</v-card>

		<!-- Group Management -->
		<v-card v-if="editableData.hasGroups" class="mb-4" variant="outlined">
			<v-card-title class="d-flex justify-space-between align-center pa-3">
				<span class="text-h6">📁 Quản lý nhóm câu hỏi</span>
				<v-btn color="primary" prepend-icon="mdi-plus" @click="addGroup" size="small" variant="tonal">
					Thêm nhóm
				</v-btn>
			</v-card-title>

			<v-card-text>
				<!-- Group Tabs -->
				<v-tabs v-model="activeGroupIndex" class="mb-4" color="primary" density="compact">
					<v-tab v-for="(group, index) in editableData.groups" :key="group.id" :value="index"
						class="group-tab">
						<div class="d-flex align-center">
							<span>{{ group.title }}</span>
							<v-chip class="ml-2" size="x-small"
								:color="group.questions.length > 0 ? 'success' : 'grey'">
								{{ group.questions.length }}
							</v-chip>
							<v-btn v-if="editableData.groups.length > 1" icon="mdi-close" size="x-small" variant="text"
								color="error" class="ml-2" @click.stop="removeGroup(index)">
							</v-btn>
						</div>
					</v-tab>
				</v-tabs>

				<!-- Group Settings -->
				<v-window v-model="activeGroupIndex" v-if="editableData.groups.length > 0">
					<v-window-item v-for="(group, index) in editableData.groups" :key="group.id" :value="index">

						<v-card variant="tonal" class="mb-4">
							<v-card-text>
								<v-row>
									<v-col cols="12" md="6">
										<v-text-field v-model="group.title" label="Tên nhóm" variant="outlined"
											density="compact" prepend-inner-icon="mdi-folder" />
									</v-col>

									<v-col cols="6" md="3">
										<v-text-field v-model.number="group.timeLimit" label="Thời gian (phút)"
											type="number" variant="outlined" density="compact" clearable
											prepend-inner-icon="mdi-timer" hint="Để trống = không giới hạn" />
									</v-col>

									<v-col cols="6" md="3">
										<v-text-field :model-value="group.points" label="Tổng điểm" variant="outlined"
											density="compact" readonly prepend-inner-icon="mdi-star"
											hint="Tự động tính" />
									</v-col>

									<v-col cols="12">
										<v-textarea v-model="group.description" label="Mô tả nhóm" variant="outlined"
											density="compact" rows="2" prepend-inner-icon="mdi-text" />
									</v-col>

									<v-col cols="12">
										<v-textarea v-model="group.instruction" label="Hướng dẫn làm bài"
											variant="outlined" density="compact" rows="2"
											prepend-inner-icon="mdi-information" />
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>
					</v-window-item>
				</v-window>
			</v-card-text>
		</v-card>

		<!-- Questions Management -->
		<v-card variant="outlined">
			<v-card-title class="d-flex justify-space-between align-center pa-3">
				<span v-if="editableData.hasGroups" class="text-h6">
					📝 Câu hỏi trong {{ currentGroup?.title || 'nhóm' }}
				</span>
				<span v-else class="text-h6">📝 Danh sách câu hỏi</span>

				<v-chip v-if="editableData.hasGroups && currentGroup" color="primary" size="small">
					{{ currentGroup.questions.length }} câu
				</v-chip>
				<v-chip v-else color="primary" size="small">
					{{ editableData.questions.length }} câu
				</v-chip>
			</v-card-title>

			<v-card-text>
				<!-- Questions List -->
				<v-expansion-panels
					v-if="(editableData.hasGroups && currentGroup?.questions.length > 0) || (!editableData.hasGroups && editableData.questions.length > 0)"
					v-model="panel" multiple>

					<v-expansion-panel
						v-for="(question, index) in editableData.hasGroups ? currentGroup.questions : editableData.questions"
						:key="question.id">

						<v-expansion-panel-title>
							<div class="d-flex justify-space-between align-center w-100">
								<div class="d-flex align-center">
									<v-chip class="mr-3" size="small" color="primary">
										Câu {{ index + 1 }}
									</v-chip>
									<span class="question-title">{{ getQuizTypeName(question.type) }}</span>
									<v-chip class="ml-2" size="x-small" color="orange">
										{{ question.points || 1 }} điểm
									</v-chip>
								</div>

								<div class="d-flex align-center" @click.stop>
									<v-btn icon="mdi-arrow-up" size="x-small" variant="text" :disabled="index === 0"
										@click="moveQuestion(index, index - 1)">
									</v-btn>
									<v-btn icon="mdi-arrow-down" size="x-small" variant="text"
										:disabled="index === (editableData.hasGroups ? currentGroup.questions.length - 1 : editableData.questions.length - 1)"
										@click="moveQuestion(index, index + 1)">
									</v-btn>
									<v-btn icon="mdi-delete-outline" size="x-small" variant="text" color="error"
										@click="removeQuestion(index)">
									</v-btn>
								</div>
							</div>
						</v-expansion-panel-title>

						<v-expansion-panel-text class="pa-0">
							<!-- Question Points & Type -->
							<v-card variant="tonal" class="ma-4 mb-2">
								<v-card-text class="py-2">
									<v-row align="center">
										<v-col cols="6">
											<v-text-field v-model.number="question.points" label="Điểm số" type="number"
												min="0.5" step="0.5" variant="outlined" density="compact"
												@update:model-value="updateGroupPoints()" />
										</v-col>
										<v-col cols="6">
											<v-select v-model="question.type" :items="quizTypesForComposite"
												label="Loại câu hỏi" variant="outlined" density="compact"
												@update:model-value="question.content = createEmptyQuestion(question.type).content" />
										</v-col>
									</v-row>
								</v-card-text>
							</v-card>

							<!-- Question Editor -->
							<div class="ma-4">
								<uc-quiz-editor :loai-noi-dung="question.type" v-model="question.content"
									class="question-editor" />
							</div>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>

				<!-- Empty State -->
				<v-alert v-else type="info" variant="tonal" class="mb-4">
					<template v-slot:prepend>
						<v-icon>mdi-help-circle</v-icon>
					</template>
					<div class="text-center">
						<h4>Chưa có câu hỏi nào</h4>
						<p class="mt-2 mb-0">Hãy thêm câu hỏi đầu tiên cho {{ editableData.hasGroups ? 'nhóm này' : 'bài
							kiểm tra' }}</p>
					</div>
				</v-alert>

				<!-- Add Question Section -->
				<v-card variant="tonal" class="mt-4">
					<v-card-text>
						<v-row align="center">
							<v-col cols="12" md="8">
								<v-select v-model="nextQuizType" :items="quizTypesForComposite"
									label="Chọn loại câu hỏi để thêm" variant="outlined" density="compact"
									prepend-inner-icon="mdi-plus-circle" />
							</v-col>

							<v-col cols="12" md="4">
								<v-btn color="success" prepend-icon="mdi-plus" @click="addQuestion" block
									:disabled="editableData.hasGroups && !currentGroup">
									Thêm câu hỏi
								</v-btn>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
	export default {
  name: 'uc-quiz-composite-groups-editor',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:modelValue'],
  
  data() {
    return {
      editableData: {
        title: '',
        timeLimit: 60,
        totalPoints: 10,
        passingScore: 5,
        hasGroups: false,
        groups: [],
        questions: []
      },
      
      // UI state
      activeGroupIndex: 0,
      panel: [],
      
      // Options
      quizTypesForComposite: [
        { title: '🎯 Trắc nghiệm 1 đáp án', value: 'QUIZ_SINGLE_CHOICE' },
        { title: '☑️ Trắc nghiệm nhiều đáp án', value: 'QUIZ_MULTIPLE_CHOICE' },
        { title: '📝 Sắp xếp thứ tự', value: 'QUIZ_ORDERING' },
        { title: '🔗 Ghép nối', value: 'QUIZ_MATCHING' },
        { title: '✏️ Điền vào chỗ trống', value: 'QUIZ_FILL_IN_BLANK' },
        { title: '📦 Phân loại kéo thả', value: 'QUIZ_DRAG_DROP_CATEGORIZE' },
        { title: '🔗 Nối đường thẳng', value: 'QUIZ_CONNECTION' },
        { title: '✓ Đúng/Sai', value: 'QUIZ_TRUE_FALSE' }
      ],
      
      nextQuizType: 'QUIZ_SINGLE_CHOICE'
    }
  },
  
  computed: {
    currentGroup() {
      return this.editableData.hasGroups && this.editableData.groups.length > 0 
        ? this.editableData.groups[this.activeGroupIndex] 
        : null;
    },
    
    totalQuestionsCount() {
      if (this.editableData.hasGroups) {
        return this.editableData.groups.reduce((sum, group) => sum + group.questions.length, 0);
      }
      return this.editableData.questions.length;
    },
    
    totalPointsCalculated() {
      if (this.editableData.hasGroups) {
        return this.editableData.groups.reduce((sum, group) => sum + group.points, 0);
      }
      return this.editableData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }
  },
  
  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal) {
          this.editableData = JSON.parse(JSON.stringify(newVal));
          this.validateData();
        }
      },
      immediate: true,
      deep: true
    },
    
    editableData: {
      handler() {
        this.$emit('update:modelValue', this.editableData);
      },
      deep: true
    }
  },
  
  methods: {
    // ======================== GROUP MANAGEMENT ========================
    addGroup() {
      const newGroup = {
        id: this.generateId(),
        title: `Phần ${this.editableData.groups.length + 1}`,
        description: 'Mô tả nhóm câu hỏi',
        timeLimit: null,
        points: 0,
        instruction: 'Hướng dẫn làm bài',
        questions: []
      };
      this.editableData.groups.push(newGroup);
      this.activeGroupIndex = this.editableData.groups.length - 1;
    },
    
    removeGroup(groupIndex) {
      if (this.editableData.groups.length <= 1) {
        alert('Phải có ít nhất 1 nhóm câu hỏi');
        return;
      }
      
      if (confirm('Xóa nhóm này sẽ xóa tất cả câu hỏi bên trong. Bạn có chắc?')) {
        this.editableData.groups.splice(groupIndex, 1);
        this.activeGroupIndex = Math.min(this.activeGroupIndex, this.editableData.groups.length - 1);
      }
    },
    
    // ======================== QUESTION MANAGEMENT ========================
    addQuestion() {
      const newQuestion = this.createEmptyQuestion(this.nextQuizType);
      
      if (this.editableData.hasGroups) {
        if (!this.currentGroup) {
          this.addGroup();
        }
        this.currentGroup.questions.push(newQuestion);
        this.updateGroupPoints();
      } else {
        this.editableData.questions.push(newQuestion);
      }
      
      // Auto expand the new question
      this.$nextTick(() => {
        this.panel = [this.getQuestionIndex(newQuestion.id)];
      });
    },
    
    removeQuestion(questionIndex) {
      if (this.editableData.hasGroups) {
        this.currentGroup.questions.splice(questionIndex, 1);
        this.updateGroupPoints();
      } else {
        this.editableData.questions.splice(questionIndex, 1);
      }
    },
    
    moveQuestion(fromIndex, toIndex) {
      const questions = this.editableData.hasGroups 
        ? this.currentGroup.questions 
        : this.editableData.questions;
        
      if (toIndex < 0 || toIndex >= questions.length) return;
      
      const question = questions.splice(fromIndex, 1)[0];
      questions.splice(toIndex, 0, question);
    },
    
    // ======================== HELPER METHODS ========================
    createEmptyQuestion(type) {
      const baseQuestion = {
        id: this.generateId(),
        type: type,
        points: 1,
        content: {}
      };
      
      switch (type) {
        case 'QUIZ_SINGLE_CHOICE':
        case 'QUIZ_MULTIPLE_CHOICE':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Nhập nội dung câu hỏi tại đây</p>',
            options: [
              { id: 'a', text: 'Đáp án A' },
              { id: 'b', text: 'Đáp án B' },
              { id: 'c', text: 'Đáp án C' },
              { id: 'd', text: 'Đáp án D' }
            ],
            correctAnswer: type === 'QUIZ_SINGLE_CHOICE' ? 'a' : ['a']
          };
          break;
          
        case 'QUIZ_FILL_IN_BLANK':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Hoàn thành câu sau</p>',
            parts: [
              { type: 'text', value: 'Điền vào chỗ trống: ' },
              { type: 'blank', id: 'blank1', size: 10, correctAnswer: '' },
              { type: 'text', value: ' để hoàn thành câu.' }
            ]
          };
          break;
          
        case 'QUIZ_ORDERING':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Sắp xếp các mục sau theo thứ tự đúng</p>',
            items: [
              { id: 'item1', text: 'Mục 1', order: 1 },
              { id: 'item2', text: 'Mục 2', order: 2 },
              { id: 'item3', text: 'Mục 3', order: 3 }
            ]
          };
          break;
          
        case 'QUIZ_MATCHING':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Ghép nối các cặp tương ứng</p>',
            columnA: [
              { id: 'a1', text: 'Mục A1' },
              { id: 'a2', text: 'Mục A2' }
            ],
            columnB: [
              { id: 'b1', text: 'Mục B1' },
              { id: 'b2', text: 'Mục B2' }
            ]
          };
          break;
          
        case 'QUIZ_DRAG_DROP_CATEGORIZE':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Phân loại các mục vào nhóm phù hợp</p>',
            groups: [
              { id: 'group1', name: 'Nhóm 1', items: [] },
              { id: 'group2', name: 'Nhóm 2', items: [] }
            ],
            items: [
              { id: 'item1', text: 'Mục 1', correctGroup: 'group1' },
              { id: 'item2', text: 'Mục 2', correctGroup: 'group2' }
            ]
          };
          break;
          
        case 'QUIZ_CONNECTION':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Nối các điểm tương ứng</p>',
            groups: [
              {
                id: 'group1',
                name: 'Nhóm 1',
                items: [
                  { id: 'item1', text: 'Mục 1', connects: ['item3'] },
                  { id: 'item2', text: 'Mục 2', connects: ['item4'] }
                ]
              },
              {
                id: 'group2', 
                name: 'Nhóm 2',
                items: [
                  { id: 'item3', text: 'Mục 3' },
                  { id: 'item4', text: 'Mục 4' }
                ]
              }
            ]
          };
          break;
          
        case 'QUIZ_TRUE_FALSE':
          baseQuestion.content = {
            prompt: '<p><strong>Câu hỏi:</strong> Mệnh đề sau đúng hay sai?</p>',
            correctAnswer: true
          };
          break;
          
        default:
          baseQuestion.content.prompt = '<p><strong>Câu hỏi:</strong> Nhập nội dung câu hỏi</p>';
      }
      
      return baseQuestion;
    },
    
    generateId() {
      return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    getQuestionIndex(questionId) {
      if (this.editableData.hasGroups) {
        let index = 0;
        for (const group of this.editableData.groups) {
          for (const question of group.questions) {
            if (question.id === questionId) return index;
            index++;
          }
        }
      } else {
        return this.editableData.questions.findIndex(q => q.id === questionId);
      }
      return -1;
    },
    
    updateGroupPoints() {
      if (this.currentGroup) {
        this.currentGroup.points = this.currentGroup.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      }
      
      // Update total points
      this.editableData.totalPoints = this.totalPointsCalculated;
    },
    
    validateData() {
      if (!this.editableData.title) {
        this.editableData.title = 'Bài kiểm tra';
      }
      
      if (this.editableData.hasGroups && (!this.editableData.groups || this.editableData.groups.length === 0)) {
        this.addGroup();
      }
      
      if (!this.editableData.hasGroups && (!this.editableData.questions || this.editableData.questions.length === 0)) {
        this.editableData.questions = [];
      }
    },
    
    getQuizTypeName(type) {
      const typeMap = {
        'QUIZ_SINGLE_CHOICE': 'Trắc nghiệm 1 đáp án',
        'QUIZ_MULTIPLE_CHOICE': 'Trắc nghiệm nhiều đáp án',
        'QUIZ_ORDERING': 'Sắp xếp thứ tự',
        'QUIZ_MATCHING': 'Ghép nối',
        'QUIZ_FILL_IN_BLANK': 'Điền vào chỗ trống',
        'QUIZ_DRAG_DROP_CATEGORIZE': 'Phân loại kéo thả',
        'QUIZ_CONNECTION': 'Nối đường thẳng',
        'QUIZ_TRUE_FALSE': 'Đúng/Sai'
      };
      return typeMap[type] || type;
    }
  }
}
</script>

<style scoped>
	.quiz-composite-groups-editor {
		max-width: 100%;
	}

	.group-tab {
		min-width: 120px;
	}

	.question-title {
		font-weight: 500;
		color: #1976d2;
	}

	.question-editor {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 16px;
		background: #fafafa;
	}

	/* Animation cho expansion panels */
	.v-expansion-panel {
		transition: all 0.3s ease;
	}

	.v-expansion-panel:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* Custom styling cho group tabs */
	.v-tab--selected {
		background: rgba(25, 118, 210, 0.1);
		border-radius: 8px 8px 0 0;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.quiz-composite-groups-editor {
			padding: 8px;
		}

		.group-tab {
			min-width: 100px;
			font-size: 0.875rem;
		}
	}
</style>