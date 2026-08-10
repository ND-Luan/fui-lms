<template>
	<v-dialog max-width="1000">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" color="primary" variant="tonal">
				<v-icon start>mdi-import</v-icon>
				Import câu hỏi
			</v-btn>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex justify-space-between align-center">
					<span>📥 Import câu hỏi</span>
					<v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
				</v-card-title>

				<v-card-text>
					<!-- Step 1: Chọn loại câu hỏi -->
					<v-card variant="outlined" class="mb-4">
						<v-card-title class="text-h6">
							🎯 Bước 1: Chọn loại câu hỏi cần import
						</v-card-title>
						<v-card-text>
							<v-row>
								<v-col cols="12" md="6">
									<v-select v-model="selectedQuestionType" :items="supportedQuestionTypes"
										label="Loại câu hỏi" variant="outlined" density="compact"
										prepend-inner-icon="mdi-format-list-bulleted">
									</v-select>
								</v-col>

								<v-col cols="12" md="6" v-if="hasGroups">
									<v-select v-model="selectedGroupIndex" :items="groupOptions" label="Import vào nhóm"
										variant="outlined" density="compact" prepend-inner-icon="mdi-folder">
									</v-select>
								</v-col>
							</v-row>

							<!-- Format hints -->
							<v-alert type="info" variant="tonal" density="compact" class="mt-2">
								<v-icon>mdi-information</v-icon>
								<strong>{{ getFormatHint() }}</strong>
							</v-alert>
						</v-card-text>
					</v-card>

					<!-- Step 2: Paste nội dung -->
					<v-card variant="outlined" class="mb-4">
						<v-card-title class="text-h6">
							📝 Bước 2: Dán nội dung câu hỏi
						</v-card-title>
						<v-card-text>
							<uc-rich-text-editor :plugins="['ggb']" v-model="textEditor" variant="outlined" :height="300"
								:imageapi="vueData.v_Set.apiFile" placeholder="Dán nội dung câu hỏi vào đây...">
							</uc-rich-text-editor>
						</v-card-text>
					</v-card>

					<!-- Step 3: Preview -->
					<v-card v-if="previewQuestions.length > 0" variant="outlined">
						<v-card-title class="text-h6 d-flex justify-space-between">
							<span>👀 Bước 3: Xem trước kết quả</span>
							<v-chip :color="previewQuestions.length > 0 ? 'success' : 'grey'" size="small">
								{{ previewQuestions.length }} câu hỏi
							</v-chip>
						</v-card-title>
						<v-card-text style="max-height: 400px; overflow-y: auto;">
							<v-expansion-panels variant="accordion" multiple>
								<v-expansion-panel v-for="(question, index) in previewQuestions" :key="index">

									<v-expansion-panel-title>
										<span>Câu {{ index + 1 }}: {{ getQuestionTypeLabel(question.type) }}</span>
									</v-expansion-panel-title>

									<v-expansion-panel-text>
										<div v-if="question.error" class="text-error">
											❌ {{ question.error }}: {{ question.errorDetail }}
										</div>
										<div v-else>
											<div class="question-preview">
												<div class="prompt-preview" v-html="question.content.prompt"></div>

												<!-- Single Choice Options -->
												<div v-if="question.type === 'QUIZ_SINGLE_CHOICE'" class="mt-3">
													<div v-for="option in question.content.options" :key="option.id"
														class="option-preview"
														:class="{ 'correct-option': option.id === question.content.correctAnswer }">
														<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text
														}}
														<v-icon v-if="option.id === question.content.correctAnswer"
															color="success" size="small" class="ml-2">mdi-check</v-icon>
													</div>
												</div>

												<!-- True/False Options -->
												<div v-else-if="question.type === 'QUIZ_TRUE_FALSE'" class="mt-3">
													<div v-for="option in question.content.options" :key="option.id"
														class="option-preview"
														:class="{ 'correct-option': option.correctAnswer }">
														<strong>{{ option.text }}</strong>
														<v-icon v-if="option.correctAnswer" color="success" size="small"
															class="ml-2">mdi-check</v-icon>
													</div>
												</div>

												<!-- Multiple Choice Options -->
												<div v-else-if="question.type === 'QUIZ_MULTIPLE_CHOICE'" class="mt-3">
													<div v-for="option in question.content.options" :key="option.id"
														class="option-preview"
														:class="{ 'correct-option': question.content.correctAnswers.includes(option.id) }">
														<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text
														}}
														<v-icon
															v-if="question.content.correctAnswers.includes(option.id)"
															color="success" size="small" class="ml-2">mdi-check</v-icon>
													</div>
												</div>
											</div>
										</div>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card-text>
					</v-card>
				</v-card-text>

				<v-card-actions class="pa-4">
					<v-btn @click="previewQuestions = []" variant="text" color="grey">
						Xóa preview
					</v-btn>
					<v-btn @click="generatePreview" variant="tonal" color="primary">
						🔍 Xem trước
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn @click="isActive.value = false" variant="text">Hủy</v-btn>
					<v-btn @click="onImport(isActive)" color="primary" :disabled="previewQuestions.length === 0"
						variant="flat">
						✅ Import {{ previewQuestions.length }} câu
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
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
	
		data() {
			return {
				vueData,
				textEditor: '',
				selectedQuestionType: 'QUIZ_SINGLE_CHOICE',
				selectedGroupIndex: 0,
				previewQuestions: [],
	
				supportedQuestionTypes: [
					{
						value: 'QUIZ_SINGLE_CHOICE',
						title: '🎯 Trắc nghiệm 1 đáp án',
						hint: 'Format: <strong>Câu 1.</strong> [Nội dung]\\n<strong>A.</strong> Đáp án 1\\n<strong><u>B.</u></strong> Đáp án đúng (gạch chân)'
					},
					{
						value: 'QUIZ_TRUE_FALSE',
						title: '✓ Đúng/Sai',
						hint: 'Format: <strong>Câu 1.</strong> [Nội dung]\\n<strong>A.</strong> Mệnh đề 1\\n<strong>B.</strong> Mệnh đề 2\\nĐáp án: a-Đ, b-S'
					},
					{
						value: 'QUIZ_MULTIPLE_CHOICE',
						title: '☑️ Trắc nghiệm nhiều đáp án',
						hint: 'Format: <strong>Câu 1.</strong> [Nội dung]\\n<strong><u>A.</u></strong> Đáp án đúng\\n<strong><u>B.</u></strong> Đáp án đúng'
					}
				]
			}
		},
	
		computed: {
			groupOptions() {
				if (!this.hasGroups || !this.groups) return [];
				return this.groups.map((group, index) => ({
					value: index,
					title: `${group.title} (${group.questions?.length || 0} câu)`
				}));
			}
		},
	
		watch: {
			text(newText) {
				if (Array.isArray(newText)) {
					this.textEditor = '';
				}
			},
	
			targetGroupIndex(newIndex) {
				this.selectedGroupIndex = newIndex;
			}
		},
	
		methods: {
			notify(message, color = 'success') {
				this.snackbarRef?.value?.showSnackbar?.({ message, color });
			},
			getFormatHint() {
				const found = this.supportedQuestionTypes.find(t => t.value === this.selectedQuestionType);
				return found ? found.hint : 'Chọn loại câu hỏi để xem hướng dẫn format';
			},
	
			getQuestionTypeLabel(type) {
				const found = this.supportedQuestionTypes.find(t => t.value === type);
				return found ? found.title : type;
			},
	
			generatePreview() {
				console.log('🔍 generatePreview called');
	
				if (!this.textEditor.trim()) {
					this.notify('Vui lòng nhập nội dung câu hỏi', 'warning');
					return;
				}
	
				try {
					console.log('🚀 Starting parse...');
					const questions = this.parseQuestionsByType(this.textEditor, this.selectedQuestionType);
					console.log('📋 Parsed questions:', questions);
	
					this.previewQuestions = questions;
	
					// Show success message with stats
					const validQuestions = questions.filter(q => !q.error).length;
					const errorQuestions = questions.filter(q => q.error).length;
	
					console.log(`📊 Results: ${validQuestions} valid, ${errorQuestions} errors`);
	
					if (errorQuestions > 0) {
						this.notify(`Kết quả parse: ${validQuestions} câu thành công, ${errorQuestions} câu lỗi. Vui lòng kiểm tra preview.`, 'warning');
					} else {
						this.notify(`Parse thành công ${validQuestions} câu hỏi!`);
					}
				} catch (error) {
					console.error('❌ Parse error:', error);
					this.notify('Lỗi phân tích nội dung: ' + error.message, 'error');
				}
			},
	
			// Bỏ method validation phức tạp
			// validateHtmlInput() {...}
	
			// Method validation HTML input
			validateHtmlInput(html) {
				const result = {
					isValid: true,
					warnings: []
				};
	
				// 1. Check for common typos
				const typos = html.match(/<strong>(Cầu|câu|CÂU)\s*\d+/g);
				if (typos) {
					result.warnings.push(`Phát hiện ${typos.length} lỗi đánh máy: "${typos.join('", "')}" (nên là "Câu")`);
				}
	
				// 2. Count expected vs actual questions
				const questionMarkers = html.match(/<strong>(Câu|Cầu)\s*\d+/gi) || [];
				const uniqueNumbers = new Set();
				questionMarkers.forEach(marker => {
					const num = marker.match(/\d+/);
					if (num) uniqueNumbers.add(parseInt(num[0]));
				});
	
				const expectedCount = Math.max(...Array.from(uniqueNumbers));
				const actualCount = questionMarkers.length;
	
				if (expectedCount !== actualCount) {
					result.warnings.push(`Số câu hỏi không khớp: Mong đợi ${expectedCount} câu, tìm thấy ${actualCount} markers`);
				}
	
				// 3. Check for missing options
				const aOptions = (html.match(/<strong>\s*A\s*\./gi) || []).length;
				const bOptions = (html.match(/<strong>\s*B\s*\./gi) || []).length;
	
				if (aOptions !== bOptions) {
					result.warnings.push(`Số lượng đáp án không cân bằng: A=${aOptions}, B=${bOptions}`);
				}
	
				// 4. Check for underlined answers (correct answers)
				const underlinedAnswers = (html.match(/<u>\s*[A-D]\s*<\/u>/gi) || []).length;
				if (underlinedAnswers === 0 && this.selectedQuestionType === 'QUIZ_SINGLE_CHOICE') {
					result.warnings.push('Không tìm thấy đáp án được gạch chân (đáp án đúng)');
				}
	
				if (result.warnings.length > 0) {
					result.isValid = false;
				}
	
				return result;
			},
	
			parseQuestionsByType(html, questionType) {
				return window.QuizHelpers
					? window.QuizHelpers.parseQuestionsByType(html, questionType, this.selectedGroupIndex)
					: [];
			},
	
			onImport(isActive) {
				if (this.previewQuestions.length === 0) {
					this.notify('Vui lòng tạo preview trước khi import', 'warning');
					return;
				}
	
				// Emit với thông tin group nếu có
				const importData = {
					questions: this.previewQuestions,
					targetGroupIndex: this.hasGroups ? this.selectedGroupIndex : null,
					questionType: this.selectedQuestionType
				};
	
				this.$emit('update:text', importData);
	
				// Reset
				this.textEditor = '';
				this.previewQuestions = [];
				isActive.value = false;
			}
		}
	}
</script>