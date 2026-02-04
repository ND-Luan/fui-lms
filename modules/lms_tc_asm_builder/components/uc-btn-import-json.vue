<template>
	<v-dialog max-width="1200">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" color="primary" variant="outlined" size="small">
				<v-icon start>mdi-code-json</v-icon>
				Import JSON
			</v-btn>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex justify-space-between align-center">
					<span class="text-h5">🤖 Import JSON - AI Assistant</span>
					<v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
				</v-card-title>

				<v-card-text>
					<!-- Step 1: Chọn target cho import -->
					<!-- <v-card variant="outlined" class="mb-4" v-if="hasGroups">
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
					</v-card> -->

					<!-- Step 2: JSON Input -->
					<v-card variant="outlined" class="mb-4">
						<v-card-title class="text-h6">
							📝 {{ $t('message.Step') }} 1: {{ $t('message.PasteQuestionJSON') }}
						</v-card-title>
						<v-card-text>
							<v-textarea v-model="jsonInput" label="JSON Data" variant="outlined" :rows="12"
								:placeholder="$t('message.PasteQuestionJSONIn')" persistent-placeholder>
							</v-textarea>

							<!-- JSON Format Helper -->
							<v-expansion-panels variant="accordion" class="mt-2">
								<v-expansion-panel>
									<v-expansion-panel-title>
										<v-icon class="mr-2">mdi-help-circle</v-icon>
										{{ $t('message.ViewSampleJSON') }}
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-code class="json-example">{{ exampleJson }}</v-code>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>

							<!-- Validation Messages -->
							<v-alert v-if="validationError" type="error" variant="tonal" class="mt-2">
								<v-icon>mdi-alert-circle</v-icon>
								<strong>{{ $t('message.JSONError') }}</strong> {{ validationError }}
							</v-alert>

							<v-alert v-if="parseSuccess && !validationError" type="success" variant="tonal"
								class="mt-2">
								<v-icon>mdi-check-circle</v-icon>
								<strong>{{ $t('message.ValidJSON') }}!</strong> {{ $t('message.Found') }} {{ parsedQuestions.length }} {{ $t('message.Question') }}
							</v-alert>
						</v-card-text>
					</v-card>

					<!-- Step 3: Preview -->
					<v-card v-if="parsedQuestions.length > 0" variant="outlined">
						<v-card-title class="text-h6 d-flex justify-space-between">
							<span>👀 {{ $t('message.Step') }} 2: {{ $t('message.PreviewResult') }}</span>
							<div class="d-flex align-center gap-2">
								<v-chip :color="validQuestions.length > 0 ? 'success' : 'grey'" size="small">
									✅ {{ validQuestions.length }} {{ $t('message.Valid') }}
								</v-chip>
								<v-chip :color="invalidQuestions.length > 0 ? 'error' : 'grey'" size="small">
									❌ {{ invalidQuestions.length }} {{ $t('message.Error') }}
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
											<uc-latex-view class="prompt-preview mb-3"
												:content="question.config.questionText" />

											<!-- Single Choice -->
											<div v-if="question.type === 'QUIZ_SINGLE_CHOICE'" class="options-preview">
												<div v-for="option in question.config.options" :key="option.id"
													class="option-item"
													:class="{ 'correct-option': option.id === question.config.correctAnswer }">
													<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text }}
													<v-icon v-if="option.id === question.config.correctAnswer"
														color="success" size="small" class="ml-2">mdi-check</v-icon>
												</div>
											</div>

											<!-- Multiple Choice -->
											<div v-else-if="question.type === 'QUIZ_MULTIPLE_CHOICE'"
												class="options-preview">
												<div v-for="option in question.config.options" :key="option.id"
													class="option-item"
													:class="{ 'correct-option': question.config.correctAnswers?.includes(option.id) }">
													<strong>{{ option.id.toUpperCase() }}.</strong> {{ option.text }}
													<v-icon v-if="question.config.correctAnswers?.includes(option.id)"
														color="success" size="small" class="ml-2">mdi-check</v-icon>
												</div>
											</div>

											<!-- True/False -->
											<div v-else-if="question.type === 'QUIZ_TRUE_FALSE'"
												class="options-preview">
												<div v-for="option in [{text: 'Đúng', id: true}, {text: 'Sai', id: false} ]"
													:key="option.id" class="option-item"
													:class="{ 'correct-option': option.id === question.config.correctAnswer }">
													<strong>{{ option.text }}</strong>
													<v-icon v-if="question.config.correctAnswer" color="success"
														size="small" class="ml-2">
														mdi-check
													</v-icon>
												</div>
											</div>
											<div v-else-if="question.type === 'QUIZ_MULTIPLE_TRUE_FALSE'"
												class="options-preview">
												<v-row v-for="(option, index) in question.config.options" :key="index">
													<v-col class="d-flex ga-2" cols="4">
														<v-checkbox v-model="option.correctAnswer" color="primary"
															label="Đúng"
															@update:modelValue="(val) => {if(val) option.inCorrectAnswer = false}" />
														<v-checkbox v-model="option.inCorrectAnswer" color="red"
															label="Sai"
															@update:modelValue="(val) => {if(val) option.correctAnswer = false}" />
													</v-col>
													<v-col>
														<v-text-field v-if="!question.config.isAdvanced"
															v-model="option.text" density="compact" variant="outlined"
															hide-details :clearable="false" style="max-width: 200px" />
														<uc-latex-edit v-else v-model:content="option.text"
															:isEditable="true" />
													</v-col>
												</v-row>
											</div>

											<!-- Other types summary -->
											<div v-else class="other-preview">
												<v-chip size="small" color="info">{{ question.type }}</v-chip>
												<span class="ml-2">{{ getQuestionSummary(question) }}</span>
											</div>

											<!-- Points and explanation -->
											<div class="mt-2">
												<v-chip size="x-small" color="orange" class="mr-2">
													{{ question.points || 1 }} {{$t('message.Score')}}
												</v-chip>
												<span v-if="question.config.explanation" class="text-caption">
													💡 {{$t('message.Explaination')}}
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
					<v-btn @click="clearAll" color="black" variant="text" >
						{{$t('message.DeleteAll')}}
					</v-btn>
					<v-btn @click="validateAndPreview" variant="outlined" color="primary" :loading="processing">
						🔍 {{$t('message.Preview')}}
					</v-btn>
					<v-spacer></v-spacer>
					<v-btn @click="isActive.value = false" variant="text">{{$t('message.Cancel')}}</v-btn>
					<v-btn @click="handleImport(isActive)" color="primary" :disabled="validQuestions.length === 0"
						variant="outlined">
						✅ Import {{ validQuestions.length }} {{$t('message.Question')}}
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			hasGroups: {
				type: Boolean,
				default: false
			},
			questions: {
				type: Array,
				default: () => []
			},
			groups: {
				type: Array
			},
			targetGroupIndex: {
				type: Number,
				default: 0
			}
		},
		emits: ['update:questions'],
		data() {
			return {
				window,
				jsonInput: '',
				selectedGroupIndex: 0,
				parsedQuestions: [],
				validationError: '',
				parseSuccess: false,
				processing: false,
				vueData,
				// Supported question types
				supportedQuestionTypes: [
					{ value: 'QUIZ_SINGLE_CHOICE', title: 'Trắc nghiệm (1 đáp án)', icon: 'mdi-radiobox-marked' },
					{ value: 'QUIZ_MULTIPLE_CHOICE', title: 'Trắc nghiệm (Nhiều đáp án)', icon: 'mdi-checkbox-multiple-marked-outline' },
					{ value: 'QUIZ_MULTIPLE_TRUE_FALSE', title: 'Trắc nghiệm (Nhiều Đúng sai)', icon: 'mdi-checkbox-multiple-marked-outline' },
					{ value: 'QUIZ_TRUE_FALSE', title: 'Đúng / Sai', icon: 'mdi-check-circle-outline' },
					{ value: 'QUIZ_FILL_IN_BLANK', title: 'Điền vào chỗ trống', icon: 'mdi-form-textbox' },
					{ value: 'SHORT_ANSWER', title: 'Trả lời ngắn', icon: 'mdi-text-short' },
					{ value: 'ESSAY', title: 'Tự luận (Soạn thảo)', icon: 'mdi-text-long' },
					// { value: 'FILE_UPLOAD', title: 'Nộp File', icon: 'mdi-upload-multiple' },
					// { value: 'AUDIO_RESPONSE', title: 'Ghi âm trả lời', icon: 'mdi-microphone-plus' },
				],
				// Example JSON format
				exampleJson: `
																															[
																															{
																																"id": "q_1757832127437",
																																"type": "QUIZ_SINGLE_CHOICE",
																																"points": 1,
																																"gradingType": "auto",
																																"config": {
																																"media": {
																																	"type": "YOUTUBE",
																																	"sourceYT": {
																																	"id": "",
																																	"name": "",
																																	"source": ""
																																	},
																																	"sourceRecord": {
																																	"id": "",
																																	"name": "",
																																	"source": ""
																																	},
																																	"sourceFiles": {
																																	"file": [],
																																	"image": []
																																	}
																																},
																																"isAdvanced": false,
																																"questionText": "<p>Peter enjoys mountain biking because</p>",
																																"options": [
																																	{
																																	"id": "opt_1",
																																	"text": "it gives him the opportunity to enjoy the views."
																																	},
																																	{
																																	"id": "opt_2",
																																	"text": "he can use the time to plan his work."
																																	},
																																	{
																																	"id": "opt_1757832145173",
																																	"text": "he is able to stop thinking about his problems."
																																	},
																																	{
																																	"id": "opt_1757832145897",
																																	"text": "it helps him to concentrate better."
																																	}
																																],
																																"correctAnswer": "opt_2"
																																}
																															}
																														]
																													`
			}
		},
		computed: {
			groupOptions() {
				if (!this.hasGroups || !this.questions) return [];
				return this.questions.map((group, index) => ({
					value: index,
					title: `${group.title} (${group.questions?.length || 0} câu)`
				}));
			},
	
			selectedGroup() {
				if (!this.hasGroups || !this.questions || this.questions.length === 0) return null;
				if (this.selectedGroupIndex < 0 || this.selectedGroupIndex >= this.questions.length) return null;
				return this.questions[this.selectedGroupIndex];
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
	
			jsonInput(val) {
				// Reset validation when input changes
				this.validationError = '';
				this.parseSuccess = false;
				this.parsedQuestions = [];
				vueData.JSONINPUT = val
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
	
					const questions = data.map(item => { return [...item.questions] }).flat().map((item, index) => {
						return this.validateAndTransformQuestion(item, index);
					});
					// Step 3: Validate and transform each question
					// const questions = data.map((item, index) => {
					// 	return this.validateAndTransformQuestion(item, index);
					// });
	
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
					if (!item.config) {
						throw new Error('Thiếu field "config"');
					}
	
					// if (!itemConfig.questionText) {
					// 	throw new Error('Thiếu field "questionText"');
					// }
	
					// if (item.type !== 'QUIZ_TRUE_FALSE' || item.type !== 'QUIZ_FILL_IN_BLANK') {
					// 	if (!itemConfig.options) {
					// 		throw new Error('Thiếu field "options"');
					// 	}
					// }
	
					// if (item.type === 'QUIZ_SINGLE_CHOICE') {
					// 	if (!itemConfig.correctAnswer) {
					// 		throw new Error('Thiếu field "correctAnswer"');
					// 	}
					// } else {
					// 	if (item.type === 'QUIZ_TRUE_FALSE') {
					// 		if (!itemConfig.correctAnswer) throw new Error('Thiếu field "correctAnswer"');
					// 	} else {
					// 		if (!itemConfig.correctAnswers) throw new Error('Thiếu field "correctAnswers"');
					// 	}
					// }
	
					// Check supported type
					const supportedTypes = this.supportedQuestionTypes.map(t => t.value);
					if (!supportedTypes.includes(item.type)) {
						throw new Error(`Loại câu hỏi "${item.type}" không được hỗ trợ`);
					}
	
					// Validate content based on type
					this.validateQuestionContent(item.type, item.config);
	
					// Transform to internal format
					const question = {
						id: item.id || `json_q_${Date.now()}_${index}`,
						type: item.type,
						points: item.points || 1,
						config: this.normalizeQuestionContent(item.type, item.config)
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
	
			validateQuestionContent(type, config) {
				// console.log(type, config)
				if (!config.questionText) throw new Error('Thiếu "questionText" (câu hỏi)');
	
				switch (type) {
					case 'QUIZ_SINGLE_CHOICE':
						if (!config.options || !Array.isArray(config.options) || config.options.length < 2) {
							throw new Error('Cần ít nhất 2 options');
						}
	
						if (!config.hasOwnProperty('correctAnswer')
							|| config?.correctAnswer === undefined
						) throw new Error('Thiếu correctAnswer');
						break;
					case 'QUIZ_MULTIPLE_CHOICE':
						if (!config.options || !Array.isArray(config.options) || config.options.length < 2) {
							throw new Error('Cần ít nhất 2 options');
						}
						if (!config.correctAnswers || !Array.isArray(config.correctAnswers)) {
							throw new Error('Thiếu correctAnswers array');
						}
						break;
					// case 'QUIZ_TRUE_FALSE':
					// 	if (!config.correctAnswer) {
					// 		throw new Error('Thiếu correctAnswer flags');
					// 	}
					// 	break;
					// case 'QUIZ_FILL_IN_BLANK':
					// 	if (!config.parts || !Array.isArray(config.parts)) {
					// 		throw new Error('Thiếu parts array');
					// 	}
					// 	break;
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
				if (!this.questions || this.questions.length === 0) return 'Chưa có nhóm nào';
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
	
	
				let _questions = [...this.questions, ...this.validQuestions]
					.map(x => {
						//Xử lý clear lại media khi import json
						x.config.media = {
							type: "YOUTUBE",
							sourceYT: {
								id: "",
								source: "",
								name: ""
							},
							sourceRecord: {
								id: "",
								source: "",
								name: ""
							},
							sourceFiles: {
								file: [],
								image: []
							}
						}
						return x
					})
					.map((x, idx) => ({ ...x, ordinalNumber: idx + 1 }))
	
				this.$emit('update:questions', _questions);
	
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