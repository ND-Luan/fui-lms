<template>
	<div v-if="editableData" class="quiz-editor-container v-col-12">
		editableData {{editableData}}

		<!-- ==================== 1. QUIZ_SINGLE_CHOICE ==================== -->
		<div v-if="loaiNoiDung === 'QUIZ_SINGLE_CHOICE'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Các lựa chọn và đáp án đúng:</label>
			<v-radio-group v-model="editableData.correctAnswer">
				{{editableData.options}}
				<div v-for="(option, index) in editableData.options" :key="index" class="d-flex align-center mb-2">
					<v-radio :value="option.id"></v-radio>
					<v-text-field v-model="option.text" density="compact" variant="outlined" hide-details>
					</v-text-field>
					<v-btn v-if="editableData.options.length > 2" icon="mdi-delete-outline" variant="text" size="small"
						color="red" @click="removeOption('options', index)"></v-btn>
				</div>
			</v-radio-group>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')">Thêm lựa chọn
			</v-btn>
			<v-textarea class="mt-6" label="Giải thích (Tùy chọn)" v-model="editableData.explanation" variant="outlined"
				rows="2" auto-grow></v-textarea>
		</div>

		<!-- ==================== 2. QUIZ_MULTIPLE_CHOICE ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_MULTIPLE_CHOICE'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Các lựa chọn (chọn các đáp án đúng):</label>
			<div v-for="(option, index) in editableData.options" :key="index" class="d-flex align-center mb-2">
				<v-checkbox v-model="editableData.correctAnswers" :value="option.id" hide-details class="mr-2">
				</v-checkbox>
				<v-text-field v-model="option.text" density="compact" variant="outlined" hide-details></v-text-field>
				<v-btn v-if="editableData.options.length > 2" icon="mdi-delete-outline" variant="text" size="small"
					color="red" @click="removeOption('options', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')">Thêm lựa chọn
			</v-btn>
			<v-textarea class="mt-6" label="Giải thích (Tùy chọn)" v-model="editableData.explanation" variant="outlined"
				rows="2" auto-grow></v-textarea>
		</div>

		<!-- ==================== 3. QUIZ_MATCHING ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_MATCHING'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<v-row>
				<v-col><label class="form-label">Cột A</label></v-col>
				<v-col><label class="form-label">Cột B (tương ứng)</label></v-col>
			</v-row>
			<v-row v-for="(pair, index) in editableData.columnA" :key="index" class="mb-n5">
				<v-col>
					<v-text-field v-model="pair.text" density="compact" variant="outlined" hide-details></v-text-field>
				</v-col>
				<v-col class="d-flex align-center">
					<v-text-field v-model="editableData.columnB[index].text" density="compact" variant="outlined"
						hide-details></v-text-field>
					<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red" @click="removePair(index)">
					</v-btn>
				</v-col>
			</v-row>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addPair" class="mt-4">Thêm cặp</v-btn>
		</div>

		<!-- ==================== 4. QUIZ_ORDERING ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_ORDERING'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Các mục (nhập theo thứ tự đúng):</label>
			<div v-for="(item, index) in editableData.items" :key="index" class="d-flex align-center mb-2">
				<span class="mr-2 font-weight-bold">{{ index + 1 }}.</span>
				<v-text-field v-model="item.text" density="compact" variant="outlined" hide-details></v-text-field>
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('items', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('items')">Thêm mục</v-btn>
		</div>

		<!-- ==================== 5. QUIZ_DRAG_DROP_CATEGORIZE ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_DRAG_DROP_CATEGORIZE'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Các nhóm:</label>
			<div v-for="(cat, index) in editableData.categories" :key="index" class="d-flex align-center mb-2">
				<v-text-field v-model="cat.name" density="compact" variant="outlined" hide-details
					:placeholder="'Tên nhóm ' + (index + 1)"></v-text-field>
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('categories', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('categories')">Thêm nhóm
			</v-btn>

			<label class="form-label mt-6">Các mục cần phân loại:</label>
			<div v-for="(item, index) in editableData.items" :key="index" class="d-flex align-center mb-2">
				<v-text-field v-model="item.text" density="compact" variant="outlined" hide-details class="mr-2"
					:placeholder="'Nội dung mục ' + (index + 1)"></v-text-field>
				<v-select v-model="item.categoryId" :items="editableData.categories" item-title="name" item-value="id"
					label="Thuộc nhóm" density="compact" variant="outlined" hide-details style="max-width: 200px;">
				</v-select>
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('items', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('items')">Thêm mục</v-btn>
		</div>

		<!-- ==================== 6. QUIZ_FILL_IN_BLANK ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_FILL_IN_BLANK'">
			<v-textarea label="Hướng dẫn" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Nội dung câu (thêm các phần text và chỗ trống):</label>
			<div v-for="(part, index) in editableData.parts" :key="index" class="d-flex align-center mb-2">
				<v-chip class="mr-2">{{ part.type === 'text' ? 'Văn bản' : 'Ô trống' }}</v-chip>
				<v-text-field v-if="part.type === 'text'" v-model="part.value" density="compact" variant="outlined"
					hide-details placeholder="Nhập văn bản..."></v-text-field>
				<v-text-field v-else v-model="part.correctAnswer" density="compact" variant="outlined" hide-details
					placeholder="Nhập đáp án đúng..."></v-text-field>
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('parts', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="blue" @click="addPart('text')">Thêm Text</v-btn>
			<v-btn prepend-icon="mdi-plus" variant="text" color="green" @click="addPart('blank')">Thêm Ô trống</v-btn>
		</div>
		<!-- ==================== 7. Soạn thảo: Nối nhóm (QUIZ_CONNECTION) ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_CONNECTION'">
			<v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea>
			<label class="form-label mt-4">Các nhóm:</label>
			<div v-for="(group, index) in editableData.groups" :key="index" class="d-flex align-center mb-2">
				<v-text-field v-model="group.text" density="compact" variant="outlined" hide-details
					:placeholder="'Tên nhóm ' + (index + 1)"></v-text-field>
				<v-btn v-if="editableData.groups.length > 1" icon="mdi-delete-outline" variant="text" size="small"
					color="red" @click="removeOption('groups', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('groups')">Thêm nhóm</v-btn>

			<label class="form-label mt-6">Các mục cần nối:</label>
			<div v-for="(item, index) in editableData.items" :key="index" class="d-flex align-center mb-2">
				<v-text-field v-model="item.text" density="compact" variant="outlined" hide-details class="mr-2"
					:placeholder="'Nội dung mục ' + (index + 1)"></v-text-field>
				<v-select v-model="item.groupId" :items="editableData.groups" item-title="text" item-value="id"
					label="Thuộc nhóm" density="compact" variant="outlined" hide-details
					style="max-width: 200px;"></v-select>
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('items', index)">
				</v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('items')">Thêm mục</v-btn>
		</div>
		<!-- ==================== Soạn thảo: QUIZ_COMPOSITE (Bài kiểm tra) ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_COMPOSITE'">
			<label class="form-label">Thiết lập chung cho bài kiểm tra</label>
			<v-card variant="outlined" class="pa-4 mb-4">
				<v-text-field label="Tiêu đề bài kiểm tra" v-model="editableData.title" density="compact"
					variant="outlined">
				</v-text-field>
				<v-row>
					<v-col>
						<v-text-field label="Thời gian (giây)" v-model.number="editableData.timeLimit" type="number"
							density="compact" variant="outlined"></v-text-field>
					</v-col>
					<v-col>
						<v-text-field label="Điểm tối đa" v-model.number="editableData.totalPoints" type="number"
							density="compact" variant="outlined"></v-text-field>
					</v-col>
					<v-col>
						<v-text-field label="Điểm để đạt" v-model.number="editableData.passingScore" type="number"
							density="compact" variant="outlined"></v-text-field>
					</v-col>
				</v-row>
			</v-card>

			<label class="form-label mt-4">Danh sách câu hỏi</label>
			<v-expansion-panels v-model="panel">
				<v-expansion-panel v-for="(question, index) in editableData.questions" :key="question.id">
					<v-expansion-panel-title>
						Câu {{ index + 1 }}: {{ getQuizTypeName(question.type) }}
						<v-spacer></v-spacer>
						<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
							@click.stop="removeQuestion(index)"></v-btn>
					</v-expansion-panel-title>
					<v-expansion-panel-text class="pa-0">
						<!-- Gọi đệ quy chính component này để soạn câu hỏi con -->
						<uc-quiz-editor :loai-noi-dung="question.type" v-model="question.content"
							class="question-editor" />
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
			<div class="mt-4">
				<v-select label="Chọn loại câu hỏi để thêm" :items="quizTypesForComposite" v-model="nextQuizType"
					density="compact" variant="outlined" hide-details></v-select>
				<v-btn class="mt-2" prepend-icon="mdi-plus" color="primary" @click="addQuestion">Thêm câu hỏi</v-btn>
			</div>
		</div>

		<!-- ... và các loại khác ... -->
		<div v-else>
			<p class="text-grey">Không có trình soạn thảo chuyên dụng cho loại <strong>{{ loaiNoiDung }}</strong>.</p>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-quiz-editor',
		props: {
			loaiNoiDung: String,
			modelValue: { type: Object, default: () => ({}) }
		},
		emits: ['update:modelValue'],
		data() {
			return {
				panel: 0,
				nextQuizType: 'QUIZ_SINGLE_CHOICE',
				quizTypesForComposite: [
					{ value: 'QUIZ_SINGLE_CHOICE', title: 'Trắc nghiệm đơn' },
					{ value: 'QUIZ_MULTIPLE_CHOICE', title: 'Trắc nghiệm đa lựa chọn' },
					{ value: 'QUIZ_MATCHING', title: 'Ghép cặp' },
					{ value: 'QUIZ_ORDERING', title: 'Sắp xếp thứ tự' },
					{ value: 'QUIZ_DRAG_DROP_CATEGORIZE', title: 'Kéo thả phân loại' },
					{ value: 'QUIZ_FILL_IN_BLANK', title: 'Điền từ' },
					{ value: 'QUIZ_CONNECTION', title: 'Nối nhóm' }
				]
			}
		},
		computed: {
			editableData: {
				get() {
					return this.ensureDataStructure(this.loaiNoiDung, this.modelValue);
				},
				set(newValue) {
					console.log('newValue', newValue)
					this.$emit('update:modelValue', newValue);
				}
			}
		},
		methods: {
			ensureDataStructure(type, data) {
				let defaults = {};
				switch (type) {
					case 'QUIZ_SINGLE_CHOICE':
						defaults = { prompt: '', options: [{ id: 'a', text: '' }], correctAnswer: null };
						break;
					case 'QUIZ_MULTIPLE_CHOICE':
						defaults = { prompt: '', options: [{ id: 'a', text: '' }], correctAnswers: [] };
						break;
					case 'QUIZ_MATCHING':
						defaults = { prompt: '', columnA: [{ id: 'a1', text: '' }], columnB: [{ id: 'b1', text: '' }], correctPairs: [] };
						break;
					case 'QUIZ_ORDERING':
						defaults = { prompt: '', items: [{ id: 'i1', text: '' }] };
						break;
					case 'QUIZ_DRAG_DROP_CATEGORIZE':
						defaults = { prompt: '', categories: [{ id: 'cat1', name: '' }], items: [] };
						break;
					case 'QUIZ_FILL_IN_BLANK':
						defaults = { prompt: '', parts: [{ type: 'text', value: '' }] };
						break;
					case 'QUIZ_CONNECTION':
						defaults = { prompt: '', groups: [{ id: 'g1', text: '' }], items: [] };
						break;
					case 'QUIZ_COMPOSITE':
						defaults = { title: '', questions: [] };
						if (!data || !data.questions || data.questions.length === 0) {
							defaults.questions.push({
								id: `q_${Date.now()}`, type: 'QUIZ_SINGLE_CHOICE', points: 1,
								content: { prompt: '', options: [{ id: 'a', text: '' }], correctAnswer: null }
							});
						}
						break;
				}
				const merged = { ...defaults, ...data };
				for (const key in defaults) {
					if (Array.isArray(defaults[key]) && (!merged[key] || merged[key].length === 0)) {
						if (!data || !data[key]) merged[key] = defaults[key];
					}
				}
				return merged;
			},
	
			// SỬA: Logic thêm/xóa
			addOption(key) {
				const currentArray = this.editableData[key] || [];
				const newId = key === 'options' ? String.fromCharCode(97 + currentArray.length) : `item_${Date.now()}`;
				const newArray = [...currentArray, { id: newId, text: '' }];
				// this.editableData[key] = newArray
				// console.log('before', this.editableData)
				this.$nextTick(() => {
					this.editableData = { ...this.editableData, [key]: [...newArray] };
					console.log('options', key, this.editableData, this.panel)
				})
			},
			removeOption(key, index) {
				if (this.editableData[key] && this.editableData[key].length > 1) {
					const newArray = [...this.editableData[key]];
					newArray.splice(index, 1);
					this.editableData = { ...this.editableData, [key]: newArray };
				}
			},
			addPair() {
				const newIndex = Date.now();
				const aId = `a${newIndex}`; const bId = `b${newIndex}`;
				const newA = [...this.editableData.columnA, { id: aId, text: '' }];
				const newB = [...this.editableData.columnB, { id: bId, text: '' }];
				const newPairs = [...this.editableData.correctPairs, { from: aId, to: bId }];
				this.editableData = { ...this.editableData, columnA: newA, columnB: newB, correctPairs: newPairs };
			},
			removePair(index) {
				if (this.editableData.columnA.length > 1) {
					const newA = [...this.editableData.columnA]; newA.splice(index, 1);
					const newB = [...this.editableData.columnB]; newB.splice(index, 1);
					const newPairs = [...this.editableData.correctPairs]; newPairs.splice(index, 1);
					this.editableData = { ...this.editableData, columnA: newA, columnB: newB, correctPairs: newPairs };
				}
			},
			addPart(type) {
				const newId = `blank_${Date.now()}`;
				const newPart = type === 'text' ? { type: 'text', value: '' } : { type: 'blank', id: newId, correctAnswer: '', size: 10 };
				const newParts = [...(this.editableData.parts || []), newPart];
				this.editableData = { ...this.editableData, parts: newParts };
			},
	
			// SỬA: Logic thêm câu hỏi
			addQuestion() {
				const defaultContent = this.ensureDataStructure(this.nextQuizType, {});
				const newQuestion = {
					id: `q_${Date.now()}`,
					type: this.nextQuizType,
					points: 1,
					content: defaultContent
				};
				const newQuestions = [...this.editableData.questions, newQuestion];
				this.editableData = { ...this.editableData, questions: newQuestions };
	
				this.$nextTick(() => {
					this.panel = this.editableData.questions.length - 1;
					console.log('question', this.editableData.questions)
				});
			},
			removeQuestion(index) {
				const newQuestions = [...this.editableData.questions];
				newQuestions.splice(index, 1);
				this.editableData = { ...this.editableData, questions: newQuestions };
			},
			getQuizTypeName(type) {
				const found = this.quizTypesForComposite.find(t => t.value === type);
				return found ? found.title : 'Câu hỏi';
			}
		}
	}
</script>

<style scoped>
	.form-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: #555;
		display: block;
		margin-bottom: 8px;
	}

	.question-editor {
		border: 2px dashed #e0e0e0;
		padding: 16px;
		margin-top: 16px;
		border-radius: 8px;
	}
</style>