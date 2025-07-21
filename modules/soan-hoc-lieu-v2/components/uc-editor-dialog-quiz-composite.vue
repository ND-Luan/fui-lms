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
							<f-editor v-model="textEditor" variant="outlined" :height="300"
								placeholder="Dán nội dung câu hỏi vào đây...">
							</f-editor>
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
		props: {
			text: {
				type: Array,
				default: () => []
			},
	
			// Test method
			testMethod() {
				console.log('Test method called!');
				alert('Test method works!');
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
					alert('Vui lòng nhập nội dung câu hỏi');
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
						alert(`⚠️ Kết quả parse:\n✅ ${validQuestions} câu thành công\n❌ ${errorQuestions} câu lỗi\n\nVui lòng kiểm tra preview và sửa lỗi.`);
					} else {
						alert(`✅ Parse thành công ${validQuestions} câu hỏi!`);
					}
				} catch (error) {
					console.error('❌ Parse error:', error);
					alert('Lỗi phân tích nội dung: ' + error.message);
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
				// Auto-detect nếu không chỉ định loại cụ thể
				if (questionType === 'AUTO_DETECT') {
					questionType = this.detectQuizType(html);
				}
	
				switch (questionType) {
					case 'QUIZ_SINGLE_CHOICE':
						console.log(html);
						return this.parseSingleChoice(html);
					case 'QUIZ_TRUE_FALSE':
						console.log(html);
						return this.parseTrueFalse(html);
					case 'QUIZ_MULTIPLE_CHOICE':
						console.log(html);
						return this.parseMultipleChoice(html);
					default:
						throw new Error('Loại câu hỏi không được hỗ trợ');
				}
			},
	
			// Method để tự động detect loại quiz
			detectQuizType(html) {
				// Check True/False pattern: "Đáp án: a-Đ, b-S"
				if (/Đáp án[:\s]*[a-d][\s–\-]*[ĐS]/i.test(html)) {
					return 'QUIZ_TRUE_FALSE';
				}
	
				// Count correct answers (underlined options)
				const correctCount = (html.match(/<strong><u>[A-D]<\/u><\/strong>|<strong>[A-D]<\/strong>|<u>[A-D]<\/u>/gi) || []).length;
				const optionsCount = (html.match(/<strong>\s*[A-D]\s*\.<\/strong>/gi) || []).length;
	
				if (correctCount > 1) {
					return 'QUIZ_MULTIPLE_CHOICE';
				}
				if (correctCount === 1 && optionsCount >= 2) {
					return 'QUIZ_SINGLE_CHOICE';
				}
	
				return 'QUIZ_SINGLE_CHOICE'; // Default fallback
			},
	
			// Parse Single Choice (version đơn giản)
			parseSingleChoice(html) {
				const blocks = html.split(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi);
				const numbered = html.match(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi) || [];
	
				console.log(`📊 Phân tích: Tìm được ${blocks.length - 1} câu hỏi từ ${numbered.length} markers`);
	
				const questions = [];
	
				for (let i = 1; i < blocks.length; i++) {
					const rawBlock = (numbered[i - 1] || `<p><strong>Câu ${i}.</strong></p>`) + blocks[i];
					console.log(`🔍 Xử lý câu ${i}:`, rawBlock.substring(0, 100) + '...');
					const parsed = this.parseLocalBlock(i, rawBlock, 'QUIZ_SINGLE_CHOICE');
					questions.push(parsed);
				}
	
				return questions;
			},
	
			// Parse True/False (version đơn giản)
			parseTrueFalse(html) {
				const blocks = html.split(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi);
				const numbered = html.match(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi) || [];
	
				const questions = [];
	
				for (let i = 1; i < blocks.length; i++) {
					const rawBlock = (numbered[i - 1] || `<p><strong>Câu ${i}.</strong></p>`) + blocks[i];
					const parsed = this.parseLocalBlock(i, rawBlock, 'QUIZ_TRUE_FALSE');
					questions.push(parsed);
				}
	
				return questions;
			},
	
			// Parse Multiple Choice (version đơn giản)
			parseMultipleChoice(html) {
				const blocks = html.split(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi);
				const numbered = html.match(/<p[^>]*><span[^>]*><strong>Câu\s*\d+\.?<\/strong>|<strong>Câu\s*\d+\.?<\/strong>|Câu\s*\d+\./gi) || [];
	
				const questions = [];
	
				for (let i = 1; i < blocks.length; i++) {
					const rawBlock = (numbered[i - 1] || `<p><strong>Câu ${i}.</strong></p>`) + blocks[i];
					const parsed = this.parseLocalBlock(i, rawBlock, 'QUIZ_MULTIPLE_CHOICE');
					questions.push(parsed);
				}
	
				return questions;
			},
	
			parseLocalBlock(i, rawHtml, questionType) {
				try {
					const html = this.extractPromptHtml(rawHtml);
	
					if (questionType === 'QUIZ_TRUE_FALSE') {
						return this.parseTrueFalseBlock(i, html);
					} else if (questionType === 'QUIZ_MULTIPLE_CHOICE') {
						return this.parseMultipleChoiceBlock(i, html);
					} else {
						return this.parseSingleChoiceBlock(i, html);
					}
				} catch (e) {
					return {
						error: 'Lỗi phân tích câu hỏi',
						errorDetail: e.toString(),
						block: rawHtml.substring(0, 500) + '...'
					};
				}
			},
	
			parseSingleChoiceBlock(i, html) {
	
				const optionRegex = /<strong[^>]*>(<u>)?([A-D])\.?(<\/u>)?<\/strong>([^<]*)/gi;
				const optionMatches = [...html.matchAll(optionRegex)];
				console.log(`🔍 Found ${optionMatches.length} option matches for question ${i}`);
				console.log('Option matches:', optionMatches); // Debug log
				if (optionMatches.length < 2) {
					throw `Không đủ đáp án (chỉ tìm được ${optionMatches.length})`;
				}
				const options = [];
				let correctId = null;
				for (const match of optionMatches) {
					const id = match[2].toLowerCase(); // A -> a (match[2] vì có capture group)
					const labelHtml = match[0]; // ✅ Toàn bộ <strong>... string
					let answerText = match[4].replace(/<[^>]+>/g, '').trim(); // match[4] vì có capture groups
	
					// Clean up text
					answerText = this.cleanHtmlContent(answerText);
	
					// ✅ ĐÚNG: Check underline trong labelHtml như HTML mẫu
					if (/u>/.test(labelHtml)) {
						correctId = id;
						console.log(`✅ Found correct answer: ${match[2]} (${id}) - labelHtml: ${labelHtml}`);
					}
	
					options.push({ id, text: answerText });
				}
	
				// Tìm vị trí của option đầu tiên để tách prompt
				const firstOptionPos = html.indexOf(optionMatches[0][0]);
				const promptHtml = html.slice(0, firstOptionPos).trim();
	
				return {
					id: `q_${this.selectedGroupIndex}_${i}`,
					type: "QUIZ_SINGLE_CHOICE",
					points: 1,
					content: {
						prompt: promptHtml,
						options,
						correctAnswer: correctId || options[0]?.id || "a"
					}
				};
			},
	
			parseTrueFalseBlock(i, html) {
				// Parse theo format: A. Nội dung câu A, B. Nội dung câu B
				// Với đáp án ở cuối: "Đáp án: a-Đ, b-S" hoặc tương tự
	
				// 1. Tìm các options A, B, C, D
				const optionsRaw = [...html.matchAll(/<strong>\s*([A-D])\s*\.<\/strong>([\s\S]*?)(?=(<strong>\s*[A-D]\s*\.<\/strong>|<\/p>|<\/span>|$))/gi)];
				const options = optionsRaw.map(match => {
					const id = match[1].toLowerCase();
					const text = match[2].replace(/<[^>]+>/g, '').trim();
					return { id, text };
				});
	
				if (options.length < 2) {
					throw `Không đủ lựa chọn True/False (chỉ tìm được ${options.length})`;
				}
	
				// 2. Parse đáp án từ text "Đáp án: a-Đ, b-S"
				const answerKey = this.parseTrueFalseAnswers(html);
	
				// 3. Tạo options với correct/incorrect flags
				const tfOptions = options.map(opt => ({
					id: opt.id,
					text: opt.text,
					correctAnswer: !!answerKey?.[opt.id],
					inCorrectAnswer: answerKey?.[opt.id] === false
				}));
	
				// 4. Tách prompt (phần trước options đầu tiên)
				const firstOptionPos = html.indexOf(optionsRaw[0][0]);
				const promptHtml = html.slice(0, firstOptionPos).trim();
	
				// 5. Extract explanation nếu có
				const explanation = this.extractExplanation(html);
	
				return {
					id: `q${i}`,
					type: "QUIZ_TRUE_FALSE",
					points: 1,
					content: {
						prompt: promptHtml,
						options: tfOptions,
						explanation: explanation
					}
				};
			},
	
			// Helper method: Parse "Đáp án: a-Đ, b-S" format
			parseTrueFalseAnswers(text) {
				const result = {};
	
				// Tìm pattern "Đáp án:" followed by answer pairs
				const match = text.match(/Đáp án[:：]?([^<\n]+)/i);
				if (!match || !match[1]) return {};
	
				// Split by comma hoặc semicolon
				const pairs = match[1].split(/[;,]/).map(s => s.trim());
	
				pairs.forEach(pair => {
					// Match pattern: "a-Đ" hoặc "a - Đúng" hoặc "a–Sai"
					const m = pair.match(/([a-dA-D])\s*[–\-]\s*([ĐSđs])/);
					if (m) {
						const optionId = m[1].toLowerCase();
						const isCorrect = m[2].toUpperCase() === 'Đ';
						result[optionId] = isCorrect;
					}
				});
	
				return result;
			},
	
			// Helper method: Extract explanation từ text
			extractExplanation(text) {
				// Tìm pattern như "(a - Giải thích...)"
				const match = text.match(/\([a-dA-D]\s*[–\-]\s*[^)]+\)/i);
				return match ? match[0] : '';
			},
	
			parseMultipleChoiceBlock(i, html) {
				const optionRegex = /<strong[^>]*>(<u>)?([A-D])\.?(<\/u>)?<\/strong>([^<]*)/gi;
				const optionMatches = [...html.matchAll(optionRegex)];
	
				if (optionMatches.length < 2) {
					throw `Không đủ đáp án (chỉ tìm được ${optionMatches.length})`;
				}
	
				const options = [];
				const correctAnswers = [];
	
				for (const match of optionMatches) {
					const id = match[2].toLowerCase();
					const labelHtml = match[0];
					let answerText = match[4].replace(/<[^>]+>/g, '').trim();
	
					answerText = this.cleanHtmlContent(answerText);
	
					// Kiểm tra nếu có thẻ <u> để xác định đáp án đúng
					if (/u>/.test(labelHtml)) {
						correctAnswers.push(id);
					}
	
					options.push({ id, text: answerText });
				}
	
				// Tìm vị trí của option đầu tiên để tách prompt
				const firstOptionPos = html.indexOf(optionMatches[0][0]);
				const promptHtml = html.slice(0, firstOptionPos).trim();
	
				return {
					id: `q_${this.selectedGroupIndex}_${i}`,
					type: "QUIZ_MULTIPLE_CHOICE",
					points: 1,
					content: {
						prompt: promptHtml,
						options,
						correctAnswers: correctAnswers.length > 0 ? correctAnswers : [options[0]?.id || "a"]
					}
				};
			},
	
			extractPromptHtml(block) {
				const regex = /^(<p[^>]*>\s*<strong>)?Câu\s*\d+\.?<\/strong>(.*?)((<p|<table|<figure|<img)[\s\S]*)/i;
				const match = block.match(regex);
				if (match) {
					let promptContent = `<p><strong>Câu hỏi.</strong>${match[2]}</p>` + match[3];
					promptContent = this.cleanHtmlContent(promptContent);
					return promptContent;
				}
				return this.cleanHtmlContent(block);
			},
	
			cleanHtmlContent(content) {
				return content
					.replace(/&nbsp;/g, ' ')
					.replace(/\s+/g, ' ')
					.replace(/>\s+</g, '><')
					.trim();
			},
	
			onImport(isActive) {
				if (this.previewQuestions.length === 0) {
					alert('Vui lòng tạo preview trước khi import');
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

<style scoped>
	.question-preview {
		background: #f8f9fa;
		padding: 16px;
		border-radius: 8px;
		border-left: 4px solid #2196f3;
	}

	.prompt-preview {
		font-weight: 500;
		margin-bottom: 12px;
	}

	.option-preview {
		padding: 8px 12px;
		margin: 4px 0;
		border-radius: 4px;
		background: white;
		border: 1px solid #e0e0e0;
	}

	.correct-option {
		background: #e8f5e8;
		border-color: #4caf50;
		color: #2e7d32;
	}
</style>