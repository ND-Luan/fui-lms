<template>
	<v-dialog max-width="1200">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" color="primary" variant="tonal">
				<v-icon start>mdi-code-json</v-icon>
				Import JSON
			</v-btn>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex justify-space-between align-center">
					<span>🤖 Import JSON - AI Assistant</span>
					<v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
				</v-card-title>

				<v-card-text>
					<!-- Step 1: Chọn target cho import -->
					<v-card variant="outlined" class="mb-4" v-if="hasGroups">
						<v-card-title class="text-h6">
							🎯 Bước 1: Chọn vị trí import
						</v-card-title>
						<v-card-text>
							<v-row>
								<v-col cols="12" md="6">
									<v-select v-model="selectedGroupIndex" :items="groupOptions" label="Import vào nhóm"
										variant="outlined" density="compact" prepend-inner-icon="mdi-folder">
									</v-select>
								</v-col>
								<v-col cols="12" md="6">
									<v-text-field :model-value="getGroupStatus()" label="Trạng thái nhóm"
										variant="outlined" density="compact" readonly
										prepend-inner-icon="mdi-information">
									</v-text-field>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>

					<!-- Step 2: JSON Input -->
					<v-card variant="outlined" class="mb-4">
						<v-card-title class="text-h6">
							📝 Bước 2: Dán JSON câu hỏi
						</v-card-title>
						<v-card-text>
							<v-textarea v-model="jsonInput" label="JSON Data" variant="outlined" :rows="12"
								placeholder="Dán JSON câu hỏi vào đây..." persistent-placeholder>
							</v-textarea>

							<!-- JSON Format Helper -->
							<v-expansion-panels variant="accordion" class="mt-2">
								<v-expansion-panel>
									<v-expansion-panel-title>
										<v-icon class="mr-2">mdi-help-circle</v-icon>
										Xem format JSON mẫu
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-code class="json-example">{{ exampleJson }}</v-code>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>

							<!-- Validation Messages -->
							<v-alert v-if="validationError" type="error" variant="tonal" class="mt-2">
								<v-icon>mdi-alert-circle</v-icon>
								<strong>Lỗi JSON:</strong> {{ validationError }}
							</v-alert>

							<v-alert v-if="parseSuccess && !validationError" type="success" variant="tonal"
								class="mt-2">
								<v-icon>mdi-check-circle</v-icon>
								<strong>JSON hợp lệ!</strong> Tìm thấy {{ parsedQuestions.length }} câu hỏi
							</v-alert>
						</v-card-text>
					</v-card>

					<!-- Step 3: Preview -->
					<v-card v-if="parsedQuestions.length > 0" variant="outlined">
						<v-card-title class="text-h6 d-flex justify-space-between">
							<span>👀 Bước 3: Xem trước kết quả</span>
							<div class="d-flex align-center gap-2">
								<v-chip :color="validQuestions.length > 0 ? 'success' : 'grey'" size="small">
									✅ {{ validQuestions.length }} hợp lệ
								</v-chip>
								<v-chip :color="invalidQuestions.length > 0 ? 'error' : 'grey'" size="small">
									❌ {{ invalidQuestions.length }} lỗi
								</v-chip>
							</div>
						</v-card-title>
						<v-card-text style="max-height: 400px; overflow-y: auto;">
							<v-expansion-panels variant="accordion" multiple>
								<v-expansion-panel v-for="(question, index) in parsedQuestions" :key="index">
									<v-expansion-panel-title>
										<div class="d-flex justify-space-between align-center w-100">
											<span>Câu {{ index + 1 }}: {{ getQuestionTypeLabel(question.type) }}</span>
											<div class="d-flex align-center">
												<v-chip :color="question.error ? 'error' : 'success'" size="x-small"
													class="mr-2">
													{{ question.error ? 'LỖI' : 'OK' }}
												</v-chip>
												<v-chip size="x-small" color="primary">
													{{ question.points || 1 }} điểm
												</v-chip>
											</div>
										</div>
									</v-expansion-panel-title>

									<v-expansion-panel-text>
										<div v-if="question.error" class="text-error pa-2">
											<v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
											<strong>{{ question.error }}</strong>
											<div class="mt-1 text-caption">{{ question.errorDetail }}</div>
										</div>
										<div v-else class="question-preview">
											<div class="prompt-preview mb-3" v-html="question.content.prompt"></div>

											<!-- Single Choice -->
											<div v-if="question.type === 'QUIZ_SINGLE_CHOICE'" class="options-preview">
												<div v-for="option in question.content.options" :key="option.id"
													class="option-item"
													:class="{ 'correct-option': option.id === question.content.correctAnswer }">
													<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text }}
													<v-icon v-if="option.id === question.content.correctAnswer"
														color="success" size="small" class="ml-2">mdi-check</v-icon>
												</div>
											</div>

											<!-- Multiple Choice -->
											<div v-else-if="question.type === 'QUIZ_MULTIPLE_CHOICE'"
												class="options-preview">
												<div v-for="option in question.content.options" :key="option.id"
													class="option-item"
													:class="{ 'correct-option': question.content.correctAnswers?.includes(option.id) }">
													<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text }}
													<v-icon v-if="question.content.correctAnswers?.includes(option.id)"
														color="success" size="small" class="ml-2">mdi-check</v-icon>
												</div>
											</div>

											<!-- True/False -->
											<div v-else-if="question.type === 'QUIZ_TRUE_FALSE'"
												class="options-preview">
												<div v-for="option in question.content.options" :key="option.id"
													class="option-item"
													:class="{ 'correct-option': option.correctAnswer }">
													<strong>{{ option.text }}</strong>
													<v-icon v-if="option.correctAnswer" color="success" size="small"
														class="ml-2">mdi-check</v-icon>
												</div>
											</div>

											<!-- Other types summary -->
											<div v-else class="other-preview">
												<v-chip size="small" color="info">{{ question.type }}</v-chip>
												<span class="ml-2">{{ getQuestionSummary(question) }}</span>
											</div>

											<!-- Points and explanation -->
											<div class="mt-2">
												<v-chip size="x-small" color="orange" class="mr-2">
													{{ question.points || 1 }} điểm
												</v-chip>
												<span v-if="question.content.explanation" class="text-caption">
													💡 Có giải thích
												</span>
											</div>
										</div>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card-text>
					</v-card>
				</v-card-text>

				<v-card-actions class="pa-4">
					<v-btn @click="clearAll" variant="text" color="grey">
						Xóa tất cả
					</v-btn>
					<v-btn @click="validateAndPreview" variant="tonal" color="primary" :loading="processing">
						🔍 Xem trước
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn @click="isActive.value = false" variant="text">Hủy</v-btn>
					<v-btn @click="handleImport(isActive)" color="primary" :disabled="validQuestions.length === 0"
						variant="flat">
						✅ Import {{ validQuestions.length }} câu
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
	props: {
		text: {
			type: Array,
			default: () => []
		},
		hasGroups: {
			type: Boolean,
			default: false
		},
		groups: {
			type: Array,
			default: () => []
		},
		targetGroupIndex: {
			type: Number,
			default: 0
		}
	},

	emits: ['update:text'],

	data() {
		return {
			jsonInput: '',
			selectedGroupIndex: 0,
			parsedQuestions: [],
			validationError: '',
			parseSuccess: false,
			processing: false,

			// Supported question types
			supportedQuestionTypes: [
				{
					value: 'QUIZ_SINGLE_CHOICE',
					title: '🎯 Trắc nghiệm 1 đáp án'
				},
				{
					value: 'QUIZ_MULTIPLE_CHOICE',
					title: '☑️ Trắc nghiệm nhiều đáp án'
				},
				{
					value: 'QUIZ_TRUE_FALSE',
					title: '✓ Đúng/Sai'
				},
				{
					value: 'QUIZ_MATCHING',
					title: '🔗 Ghép cặp'
				},
				{
					value: 'QUIZ_ORDERING',
					title: '🔢 Sắp xếp thứ tự'
				},
				{
					value: 'QUIZ_FILL_IN_BLANK',
					title: '📝 Điền từ'
				},
				{
					value: 'QUIZ_DRAG_DROP_CATEGORIZE',
					title: '🗂️ Phân loại'
				},
				{
					value: 'QUIZ_CONNECTION',
					title: '🔗 Nối nhóm'
				}
			],

			// Example JSON format
			exampleJson: `[
  {
    "type": "QUIZ_SINGLE_CHOICE",
    "points": 1,
    "content": {
      "prompt": "Câu hỏi của bạn?",
      "options": [
        {"id": "a", "text": "Đáp án A"},
        {"id": "b", "text": "Đáp án B"},
        {"id": "c", "text": "Đáp án C"}
      ],
      "correctAnswer": "a",
      "explanation": "Giải thích đáp án"
    }
  },
  {
    "type": "QUIZ_TRUE_FALSE",
    "points": 1,
    "content": {
      "prompt": "Câu hỏi đúng/sai?",
      "options": [
        {"id": "a", "text": "Mệnh đề 1", "correctAnswer": true, "inCorrectAnswer": false},
        {"id": "b", "text": "Mệnh đề 2", "correctAnswer": false, "inCorrectAnswer": true}
      ]
    }
  }
]`
		}
	},

	computed: {
		groupOptions() {
			if (!this.hasGroups || !this.groups) return [];
			return this.groups.map((group, index) => ({
				value: index,
				title: `${group.title} (${group.questions?.length || 0} câu)`
			}));
		},

		selectedGroup() {
			if (!this.hasGroups || !this.groups || this.groups.length === 0) return null;
			if (this.selectedGroupIndex < 0 || this.selectedGroupIndex >= this.groups.length) return null;
			return this.groups[this.selectedGroupIndex];
		},

		validQuestions() {
			return this.parsedQuestions.filter(q => !q.error);
		},

		invalidQuestions() {
			return this.parsedQuestions.filter(q => q.error);
		}
	},

	watch: {
		targetGroupIndex(newIndex) {
			this.selectedGroupIndex = newIndex;
		},

		jsonInput() {
			// Reset validation when input changes
			this.validationError = '';
			this.parseSuccess = false;
			this.parsedQuestions = [];
		}
	},

	methods: {
		validateAndPreview() {
			this.processing = true;
			this.validationError = '';
			this.parseSuccess = false;

			try {
				// Step 1: Parse JSON
				let data;
				try {
					data = JSON.parse(this.jsonInput.trim());
				} catch (e) {
					throw new Error('JSON không hợp lệ: ' + e.message);
				}

				// Step 2: Ensure it's an array
				if (!Array.isArray(data)) {
					data = [data];
				}

				// Step 3: Validate and transform each question
				const questions = data.map((item, index) => {
					return this.validateAndTransformQuestion(item, index);
				});

				this.parsedQuestions = questions;
				this.parseSuccess = true;

				// Show summary
				const validCount = this.validQuestions.length;
				const invalidCount = this.invalidQuestions.length;

				if (invalidCount > 0) {
					this.validationError = `Có ${invalidCount} câu hỏi bị lỗi. Vui lòng kiểm tra và sửa.`;
				}

				console.log(`✅ Parsed ${validCount} valid questions, ${invalidCount} invalid`);

			} catch (error) {
				this.validationError = error.message;
				this.parsedQuestions = [];
			} finally {
				this.processing = false;
			}
		},

		validateAndTransformQuestion(item, index) {
			try {
				// Required fields
				if (!item.type) {
					throw new Error('Thiếu field "type"');
				}

				if (!item.content) {
					throw new Error('Thiếu field "content"');
				}

				// Check supported type
				const supportedTypes = this.supportedQuestionTypes.map(t => t.value);
				if (!supportedTypes.includes(item.type)) {
					throw new Error(`Loại câu hỏi "${item.type}" không được hỗ trợ`);
				}

				// Validate content based on type
				this.validateQuestionContent(item.type, item.content);

				// Transform to internal format
				const question = {
					id: item.id || `json_q_${Date.now()}_${index}`,
					type: item.type,
					points: item.points || 1,
					content: this.normalizeQuestionContent(item.type, item.content)
				};

				return question;

			} catch (error) {
				return {
					id: `error_${index}`,
					type: item.type || 'UNKNOWN',
					error: 'Lỗi validate',
					errorDetail: error.message,
					originalData: item
				};
			}
		},

		validateQuestionContent(type, content) {
			if (!content.prompt) {
				throw new Error('Thiếu "prompt" (câu hỏi)');
			}

			switch (type) {
				case 'QUIZ_SINGLE_CHOICE':
					if (!content.options || !Array.isArray(content.options) || content.options.length < 2) {
						throw new Error('Cần ít nhất 2 options');
					}
					if (!content.correctAnswer) {
						throw new Error('Thiếu correctAnswer');
					}
					break;

				case 'QUIZ_MULTIPLE_CHOICE':
					if (!content.options || !Array.isArray(content.options) || content.options.length < 2) {
						throw new Error('Cần ít nhất 2 options');
					}
					if (!content.correctAnswers || !Array.isArray(content.correctAnswers)) {
						throw new Error('Thiếu correctAnswers array');
					}
					break;

				case 'QUIZ_TRUE_FALSE':
					if (!content.options || !Array.isArray(content.options)) {
						throw new Error('Thiếu options array');
					}
					const hasCorrectFlags = content.options.some(opt => 
						opt.hasOwnProperty('correctAnswer') || opt.hasOwnProperty('inCorrectAnswer')
					);
					if (!hasCorrectFlags) {
						throw new Error('Thiếu correctAnswer/inCorrectAnswer flags');
					}
					break;

				case 'QUIZ_MATCHING':
					if (!content.columnA || !content.columnB) {
						throw new Error('Thiếu columnA hoặc columnB');
					}
					break;

				case 'QUIZ_ORDERING':
					if (!content.items || !Array.isArray(content.items)) {
						throw new Error('Thiếu items array');
					}
					break;

				case 'QUIZ_FILL_IN_BLANK':
					if (!content.parts || !Array.isArray(content.parts)) {
						throw new Error('Thiếu parts array');
					}
					break;

				case 'QUIZ_DRAG_DROP_CATEGORIZE':
					if (!content.categories || !content.items) {
						throw new Error('Thiếu categories hoặc items');
					}
					break;

				case 'QUIZ_CONNECTION':
					if (!content.groups || !content.items) {
						throw new Error('Thiếu groups hoặc items');
					}
					break;
			}
		},

		normalizeQuestionContent(type, content) {
			// Ensure proper ID format for options
			const normalized = { ...content };

			if (normalized.options && Array.isArray(normalized.options)) {
				normalized.options = normalized.options.map((option, index) => ({
					id: option.id || String.fromCharCode(97 + index), // a, b, c...
					text: option.text || '',
					...option
				}));
			}

			return normalized;
		},

		getQuestionTypeLabel(type) {
			const found = this.supportedQuestionTypes.find(t => t.value === type);
			return found ? found.title : type;
		},

		getQuestionSummary(question) {
			switch (question.type) {
				case 'QUIZ_MATCHING':
					return `${question.content.columnA?.length || 0} cặp ghép`;
				case 'QUIZ_ORDERING':
					return `${question.content.items?.length || 0} mục sắp xếp`;
				case 'QUIZ_FILL_IN_BLANK':
					return `${question.content.parts?.filter(p => p.type === 'blank').length || 0} chỗ trống`;
				case 'QUIZ_DRAG_DROP_CATEGORIZE':
					return `${question.content.categories?.length || 0} nhóm, ${question.content.items?.length || 0} mục`;
				case 'QUIZ_CONNECTION':
					return `${question.content.groups?.length || 0} nhóm, ${question.content.items?.length || 0} mục`;
				default:
					return 'Xem chi tiết bên trái';
			}
		},

		getGroupStatus() {
			if (!this.hasGroups) return 'Chế độ danh sách đơn';
			if (!this.groups || this.groups.length === 0) return 'Chưa có nhóm nào';
			const group = this.selectedGroup;
			if (!group) return 'Chưa chọn nhóm';
			return `${group.questions?.length || 0} câu hiện tại`;
		},

		clearAll() {
			this.jsonInput = '';
			this.parsedQuestions = [];
			this.validationError = '';
			this.parseSuccess = false;
		},

		handleImport(isActive) {
			if (this.validQuestions.length === 0) {
				alert('Không có câu hỏi hợp lệ để import');
				return;
			}

			// Emit với format giống uc-editor-dialog-quiz-composite
			const importData = {
				questions: this.validQuestions,
				targetGroupIndex: this.hasGroups ? this.selectedGroupIndex : null,
				questionType: 'JSON_IMPORT'
			};

			this.$emit('update:text', importData);

			// Show success message
			const validCount = this.validQuestions.length;
			const targetInfo = this.hasGroups ? ` vào "${this.selectedGroup?.title}"` : '';
			alert(`✅ Đã import thành công ${validCount} câu hỏi${targetInfo}!`);

			// Reset and close
			this.clearAll();
			isActive.value = false;
		}
	},

	mounted() {
		// Set default group index
		if (this.hasGroups && this.targetGroupIndex !== undefined) {
			this.selectedGroupIndex = this.targetGroupIndex;
		}
	}
}
</script>

<style scoped>
	.question-preview {
		background: #f8f9fa;
		padding: 16px;
		border-radius: 8px;
		border-left: 4px solid #2196f3;
	}

	.prompt-preview {
		font-weight: 500;
		color: #1976d2;
		margin-bottom: 12px;
	}

	.options-preview {
		margin-top: 8px;
	}

	.option-item {
		padding: 8px 12px;
		margin: 4px 0;
		border-radius: 4px;
		background: white;
		border: 1px solid #e0e0e0;
		transition: all 0.2s;
	}

	.correct-option {
		background: #e8f5e8;
		border-color: #4caf50;
		color: #2e7d32;
		font-weight: 500;
	}

	.other-preview {
		padding: 12px;
		background: #fff3e0;
		border-radius: 4px;
		border-left: 3px solid #ff9800;
	}

	.json-example {
		background: #2d3748;
		color: #e2e8f0;
		padding: 16px;
		border-radius: 8px;
		font-family: 'Courier New', monospace;
		font-size: 12px;
		line-height: 1.4;
		white-space: pre-wrap;
		overflow-x: auto;
	}

	.text-error {
		background: #ffebee;
		border-left: 4px solid #f44336;
		padding: 12px;
		border-radius: 4px;
	}
</style>