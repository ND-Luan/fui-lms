<template>
	<div v-if="editableData" class="quiz-editor-container v-col-12">
		<!-- ==================== 1. QUIZ_SINGLE_CHOICE ==================== -->
		<div v-if="loaiNoiDung === 'QUIZ_SINGLE_CHOICE'">
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>
			<div class="d-flex align-center justify-space-between form-label mt-4">
				<label>Các lựa chọn và đáp án đúng:</label>
				<v-checkbox v-model="isAdvanced" label="Soạn đáp án nâng cao" />
			</div>
			<v-radio-group v-model="editableData.correctAnswer">
				<div v-for="(option, index) in editableData.options" :key="index" class="d-flex align-center mb-2">
					<v-radio :value="option.id"></v-radio>
					<v-text-field v-if="!isAdvanced" v-model="option.text" density="compact" variant="outlined"
						hide-details>
					</v-text-field>
					<uc-editor-dialog v-else v-model:text="option.text" />
					<v-btn v-if="editableData.options.length > 2" icon="mdi-delete-outline" variant="text" size="small"
						color="red" @click="removeOption('options', index)"></v-btn>
				</div>
			</v-radio-group>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')">Thêm lựa
				chọn
			</v-btn>
			<v-textarea class="mt-6" label="Giải thích (Tùy chọn)" v-model="editableData.explanation" variant="outlined"
				rows="2" auto-grow></v-textarea>
		</div>

		<!-- ==================== 2. QUIZ_MULTIPLE_CHOICE ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_MULTIPLE_CHOICE'">
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>

			<div class="d-flex align-center justify-space-between form-label mt-4">
				<label class="form-label mt-4">Các lựa chọn (chọn các đáp án đúng):</label>
				<v-checkbox v-model="isAdvanced" label="Soạn đáp án nâng cao" />
			</div>
			<div v-for="(option, index) in editableData.options" :key="index" class="d-flex align-center mb-2">
				<v-checkbox v-model="editableData.correctAnswers" :value="option.id" hide-details class="mr-2">
				</v-checkbox>
				<v-text-field v-if="!isAdvanced" v-model="option.text" density="compact" variant="outlined"
					hide-details>
				</v-text-field>
				<uc-editor-dialog v-else v-model:text="option.text" />
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
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>
			<div>
				<v-checkbox v-model="isAdvanced" label="Soạn đáp án nâng cao" />
			</div>
			<v-row>
				<v-col><label class="form-label">Cột A</label></v-col>
				<v-col><label class="form-label">Cột B (tương ứng)</label></v-col>
			</v-row>
			<v-row v-for="(pair, index) in editableData.columnA" :key="index" class="mb-n5">
				<v-col>
					<v-text-field v-if="!isAdvanced" v-model="pair.text" density="compact" variant="outlined"
						hide-details></v-text-field>
					<uc-editor-dialog v-else v-model:text="pair.text" />
				</v-col>
				<v-col class="d-flex align-center">
					<v-text-field v-if="!isAdvanced" v-model="editableData.columnB[index].text" density="compact"
						variant="outlined" hide-details></v-text-field>
					<uc-editor-dialog v-else v-model:text="editableData.columnB[index].text" />
					<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red" @click="removePair(index)">
					</v-btn>
				</v-col>
			</v-row>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addPair" class="mt-4">Thêm cặp</v-btn>
		</div>

		<!-- ==================== 4. QUIZ_ORDERING ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_ORDERING'">
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>
			<div class="d-flex align-center justify-space-between form-label mt-4">
				<label class="form-label mt-4">Các mục (nhập theo thứ tự đúng):</label>
				<v-checkbox v-model="isAdvanced" label="Soạn đáp án nâng cao" />
			</div>

			<div v-for="(item, index) in editableData.items" :key="index" class="d-flex align-center mb-2">
				<span class="mr-2 font-weight-bold">{{ index + 1 }}.</span>
				<v-text-field v-if="!isAdvanced" v-model="item.text" density="compact" variant="outlined"
					hide-details></v-text-field>
				<uc-editor-dialog v-else v-model:text="item.text" />
				<v-btn icon="mdi-delete-outline" variant="text" size="small" color="red"
					@click="removeOption('items', index)"></v-btn>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('items')">Thêm mục</v-btn>
		</div>

		<!-- ==================== 5. QUIZ_DRAG_DROP_CATEGORIZE ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_DRAG_DROP_CATEGORIZE'">
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>
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
		<!-- Thay thế phần QUIZ_COMPOSITE hiện tại trong template -->
		<div v-else-if="loaiNoiDung === 'QUIZ_COMPOSITE'">
			<label class="form-label">Thiết lập chung cho bài kiểm tra</label>
			<v-card variant="outlined" class="pa-4 mb-4">
				<v-text-field label="Tiêu đề bài kiểm tra" v-model="editableData.title" density="compact"
					variant="outlined">
				</v-text-field>
				<v-row class="ma-0 pa-0">
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

				<!-- Toggle Groups Mode -->
				<v-row class="ma-0 pa-0">
					<v-col cols="12">
						<v-switch v-model="editableData.hasGroups" @change="toggleGroupMode" color="primary"
							density="compact">
							<template v-slot:label>
								<div class="d-flex align-center">
									<v-icon class="mr-2">{{ editableData.hasGroups ? 'mdi-folder-multiple' :
										'mdi-format-list-bulleted' }}</v-icon>
									<span>{{ editableData.hasGroups ? 'Chế độ nhóm câu hỏi' : 'Chế độ danh sách đơn'
										}}</span>
									<v-chip class="ml-2" size="small"
										:color="editableData.hasGroups ? 'success' : 'grey'">
										{{ editableData.hasGroups ? 'BẬT' : 'TẮT' }}
									</v-chip>
								</div>
							</template>
						</v-switch>
					</v-col>
				</v-row>

				<!-- Summary Stats -->
				<v-alert type="info" variant="tonal" density="compact" class="mt-2">
					<div class="d-flex justify-space-between align-center flex-wrap">
						<span>📊 Tổng quan:</span>
						<div class="d-flex gap-3">
							<span>📝 {{ totalQuestionsCount }} câu</span>
							<span>🎯 {{ totalPointsCalculated }} điểm</span>
							<span v-if="editableData.hasGroups">📁 {{ editableData.groups?.length || 0 }} nhóm</span>
						</div>
					</div>
				</v-alert>
			</v-card>

			<!-- GROUP MODE: Group Management -->
			<div v-if="editableData.hasGroups">
				<v-card variant="outlined" class="mb-4">
					<v-card-title class="d-flex justify-space-between align-center pa-3">
						<span class="text-h6">📁 Quản lý nhóm câu hỏi</span>
						<v-btn color="primary" prepend-icon="mdi-plus" @click="addGroup" size="small" variant="tonal">
							Thêm nhóm
						</v-btn>
					</v-card-title>

					<v-card-text>
						<!-- Group Tabs -->
						<v-tabs v-model="activeGroupIndex" class="mb-4" color="primary" density="compact"
							v-if="editableData.groups && editableData.groups.length > 0">
							<v-tab v-for="(group, index) in editableData.groups" :key="group.id" :value="index"
								class="group-tab">
								<div class="d-flex align-center">
									<span>{{ group.title }}</span>
									<v-chip class="ml-2" size="x-small"
										:color="group.questions.length > 0 ? 'success' : 'grey'">
										{{ group.questions.length }}
									</v-chip>
									<v-btn v-if="editableData.groups.length > 1" icon="mdi-close" size="x-small"
										variant="text" color="error" class="ml-2" @click.stop="removeGroup(index)">
									</v-btn>
								</div>
							</v-tab>
						</v-tabs>

						<!-- Group Settings -->
						<v-window v-model="activeGroupIndex"
							v-if="editableData.groups && editableData.groups.length > 0">
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
												<v-text-field :model-value="group.points" label="Tổng điểm"
													variant="outlined" density="compact" readonly
													prepend-inner-icon="mdi-star" hint="Tự động tính" />
											</v-col>

											<v-col cols="12">
												<v-textarea v-model="group.description" label="Mô tả nhóm"
													variant="outlined" density="compact" rows="2"
													prepend-inner-icon="mdi-text" />
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
			</div>

			<!-- QUESTIONS SECTION (Both modes) -->
			<div class="d-flex align-center justify-space-between form-label mt-4">
				<label v-if="editableData.hasGroups">
					📝 Câu hỏi trong {{ currentGroup?.title || 'nhóm' }}
				</label>
				<label v-else>
					Danh sách câu hỏi
				</label>
				<!-- <uc-editor-dialog-quiz-composite v-model:text="currentQuestionsList" /> -->
				<uc-editor-dialog-quiz-composite v-model:text="currentQuestionsList"
					:has-groups="editableData.hasGroups" :groups="editableData.groups || []"
					:target-group-index="activeGroupIndex" @update:text="handleImportQuestions" />

			</div>

			<!-- HIỂN THỊ DANH SÁCH CÂU HỎI -->
			<v-expansion-panels v-if="currentQuestionsList && currentQuestionsList.length > 0" v-model="panel">
				<v-expansion-panel v-for="(question, index) in currentQuestionsList" :key="question.id">
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
									:disabled="index === currentQuestionsList.length - 1"
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
											item-title="title" item-value="value" label="Loại câu hỏi"
											variant="outlined" density="compact"
											@update:model-value="question.content = ensureDataStructure(question.type, {})" />
									</v-col>
								</v-row>
							</v-card-text>
						</v-card>

						<uc-quiz-editor :loai-noi-dung="question.type" v-model="question.content"
							class="question-editor" />
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
						kiểm tra'
						}}</p>
				</div>
			</v-alert>

			<!-- KHỐI THÊM CÂU HỎI MỚI -->
			<v-card variant="tonal" class="mt-4 pa-4">
				<v-row align="center">
					<v-col cols="12" md="8">
						<v-select label="Chọn loại câu hỏi để thêm" :items="quizTypesForComposite" item-title="title"
							item-value="value" v-model="nextQuizType" density="compact" variant="outlined" hide-details
							prepend-inner-icon="mdi-plus-circle">
						</v-select>
					</v-col>
					<v-col cols="12" md="4">
						<v-btn prepend-icon="mdi-plus" color="success" @click="addQuestion" block
							:disabled="editableData.hasGroups && !currentGroup">
							Thêm câu hỏi
						</v-btn>
					</v-col>
				</v-row>
			</v-card>
		</div>
		<!-- ====================  QUIZ_TRUE_FALSE ==================== -->
		<div v-else-if="loaiNoiDung === 'QUIZ_TRUE_FALSE'">
			<!-- <v-textarea label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</v-textarea> -->
			<f-editor label="Câu hỏi/Yêu cầu" v-model="editableData.prompt" variant="outlined" rows="2" auto-grow>
			</f-editor>
			<div class="d-flex align-center justify-space-between form-label mt-4">
				<label>Các lựa chọn và đáp án đúng:</label>
			</div>
			<div>
				
				<div v-for="(option, index) in editableData.options" :key="index" class="d-flex align-center mb-2 ga-4">
					<div class="d-flex ga-2">
						<v-checkbox v-model="option.correctAnswer" color="primary" label="Đúng"
							@update:modelValue="(val) => {if(val) option.inCorrectAnswer = false}" />
						<v-checkbox v-model="option.inCorrectAnswer" color="red" label="Sai"
							@update:modelValue="(val) => {if(val) option.correctAnswer = false}" />
					</div>
					<!-- <v-checkbox v-model="editableData.correctAnswers" :value="option.id" hide-details class="mr-2">
									</v-checkbox> -->
					<v-text-field v-model="option.text" density="compact" variant="outlined" hide-details
						:clearable="false">
					</v-text-field>
					<v-btn v-if="editableData.options.length > 2" icon="mdi-delete-outline" variant="text" size="small"
						color="red" @click="removeOption('options', index)"></v-btn>
				</div>
			</div>
			<v-btn prepend-icon="mdi-plus" variant="text" color="primary" @click="addOption('options')">Thêm lựa
				chọn
			</v-btn>
			<v-textarea class="mt-6" label="Giải thích (Tùy chọn)" v-model="editableData.explanation" variant="outlined"
				rows="2" auto-grow></v-textarea>
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
			loaiNoiDung: {
				type: String,
			},
			modelValue: { type: Object, default: () => ({}) }
		},
		emits: ['update:modelValue'],
		data() {
			return {
				editableData: {},
				panel: 0,
				nextQuizType: 'QUIZ_SINGLE_CHOICE',
				quizTypesForComposite: [
					{ value: 'QUIZ_SINGLE_CHOICE', title: 'Trắc nghiệm đơn' },
					{ value: 'QUIZ_MULTIPLE_CHOICE', title: 'Trắc nghiệm đa lựa chọn' },
					{ value: 'QUIZ_MATCHING', title: 'Ghép cặp' },
					{ value: 'QUIZ_ORDERING', title: 'Sắp xếp thứ tự' },
					{ value: 'QUIZ_DRAG_DROP_CATEGORIZE', title: 'Kéo thả phân loại' },
					{ value: 'QUIZ_FILL_IN_BLANK', title: 'Điền từ' },
					{ value: 'QUIZ_CONNECTION', title: 'Nối nhóm' },
					{ value: 'QUIZ_TRUE_FALSE', title: 'Đúng sai' },
				],
				isAdvanced: false,
				isOpenDialogImport_QUIZ_COMPOSITE: false,
	
				// Thêm cho Groups mode
				activeGroupIndex: 0
			}
		},
		computed: {
			currentGroup() {
				return this.editableData.hasGroups && this.editableData.groups?.length > 0
					? this.editableData.groups[this.activeGroupIndex]
					: null;
			},
	
			currentQuestionsList() {
				if (this.editableData.hasGroups && this.currentGroup) {
					return this.currentGroup.questions || [];
				}
				return this.editableData.questions || [];
			},
	
			totalQuestionsCount() {
				if (this.editableData.hasGroups && this.editableData.groups) {
					return this.editableData.groups.reduce((sum, group) => sum + (group.questions?.length || 0), 0);
				}
				return this.editableData.questions?.length || 0;
			},
	
			totalPointsCalculated() {
				if (this.editableData.hasGroups && this.editableData.groups) {
					return this.editableData.groups.reduce((sum, group) => sum + (group.points || 0), 0);
				}
				return this.editableData.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
			}
		},
		watch: {
			// KÊNH NHẬN DỮ LIỆU TỪ CHA
			modelValue: {
				handler(newData) {
					// Chỉ cập nhật state nội bộ nếu dữ liệu từ cha thực sự khác
					// với dữ liệu hiện tại. Điều này phá vỡ vòng lặp.
					if (JSON.stringify(newData) !== JSON.stringify(this.editableData)) {
						console.log('ensure...')
						this.editableData = this.ensureDataStructure(this.loaiNoiDung, newData);
					}
				},
				immediate: true,
				deep: true
			},
			// KÊNH GỬI DỮ LIỆU LÊN CHA
			editableData: {
				handler(newData) {
					let _editableData = newData// 
					const keys = Object.keys(newData)
	
					const isOnlyKeyPrompt = Object.keys(newData).length === 1 && keys.includes('prompt')
					if (isOnlyKeyPrompt) _editableData = this.ensureDataStructure(this.loaiNoiDung, {});
					// Khi state nội bộ thay đổi, emit sự kiện lên cho cha
					this.$emit('update:modelValue', _editableData);
				},
				deep: true
			},
			loaiNoiDung: {
				handler: function (newType) {
					console.log('loai noi dung...', newType)
					// if (newType) {
					this.editableData = this.ensureDataStructure(newType, {});
					// }
				},
				deep: true
			}
		},
		methods: {
			ensureDataStructure(type, data) {
				let defaults = {};
				switch (type) {
					case 'QUIZ_SINGLE_CHOICE':
						defaults = { prompt: '', options: [{ id: 'a', text: '' }], correctAnswer: null, isAdvanced: false };
						break;
					case 'QUIZ_MULTIPLE_CHOICE':
						defaults = { prompt: '', options: [{ id: 'a', text: '' }], correctAnswers: [], isAdvanced: false };
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
						defaults = {
							title: '',
							timeLimit: 1800,
							totalPoints: 10,
							passingScore: 5,
							hasGroups: false,
							groups: [],
							questions: []
						};
						break;
					case 'QUIZ_TRUE_FALSE':
						defaults = {
							prompt: '', options: [{ id: 'a', text: '', correctAnswer: null, inCorrectAnswer: null }]
							// , correctAnswer: [], inCorrectAnswer: []
						};
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
	
			// Thêm methods mới cho Groups
			toggleGroupMode() {
				if (this.editableData.hasGroups) {
					// Switch to flat mode: merge all questions
					const allQuestions = [];
					if (this.editableData.groups) {
						this.editableData.groups.forEach(group => {
							if (group.questions) {
								allQuestions.push(...group.questions);
							}
						});
					}
					this.editableData = {
						...this.editableData,
						questions: allQuestions,
						groups: []
					};
				} else {
					// Switch to group mode: create default group
					const defaultGroup = {
						id: this.generateId(),
						title: 'Phần I',
						description: 'Nhóm câu hỏi chính',
						timeLimit: null,
						points: this.totalPointsCalculated,
						instruction: 'Chọn đáp án đúng nhất',
						questions: [...(this.editableData.questions || [])]
					};
	
					this.editableData = {
						...this.editableData,
						groups: [defaultGroup],
						questions: []
					};
					this.activeGroupIndex = 0;
				}
			},
	
			addGroup() {
				const newGroup = {
					id: this.generateId(),
					title: `Phần ${(this.editableData.groups?.length || 0) + 1}`,
					description: 'Mô tả nhóm câu hỏi',
					timeLimit: null,
					points: 0,
					instruction: 'Hướng dẫn làm bài',
					questions: []
				};
	
				const currentGroups = this.editableData.groups || [];
				this.editableData = {
					...this.editableData,
					groups: [...currentGroups, newGroup]
				};
				this.activeGroupIndex = this.editableData.groups.length - 1;
			},
	
			removeGroup(groupIndex) {
				if (this.editableData.groups && this.editableData.groups.length <= 1) {
					alert('Phải có ít nhất 1 nhóm câu hỏi'); return;
				} if (confirm('Xóa nhóm này sẽ xóa tất cả câu hỏi bên trong. Bạn có chắc?')) {
					const
						newGroups = [...this.editableData.groups]; newGroups.splice(groupIndex, 1); this.editableData = {
							...this.editableData,
							groups: newGroups
						}; this.activeGroupIndex = Math.min(this.activeGroupIndex, newGroups.length - 1);
				}
			}, generateId() { return 'id_' + Math.random().toString(36).substr(2, 9); }, updateGroupPoints() {
				if (this.currentGroup) {
					const
						points = this.currentGroup.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0;
					this.currentGroup.points = points;
	
					// Update total points
					this.editableData.totalPoints = this.totalPointsCalculated;
				}
			},
	
	
			//update 
			addQuestion() {
				const newQuestionContent = this.ensureDataStructure(this.nextQuizType, {});
				const newQuestion = {
					id: `q_${Date.now()}`,
					type: this.nextQuizType,
					points: 1,
					content: newQuestionContent
				};
	
				if (this.editableData.hasGroups) {
					if (!this.currentGroup) {
						this.addGroup();
					}
	
					const currentQuestions = this.currentGroup.questions || [];
					const newQuestions = [...currentQuestions, newQuestion];
					this.currentGroup.questions = newQuestions;
					this.updateGroupPoints();
				} else {
					const currentQuestions = this.editableData.questions || [];
					const newQuestions = [...currentQuestions, newQuestion];
					this.editableData = {
						...this.editableData,
						questions: newQuestions
					};
				}
	
				// Auto expand the new question
				this.$nextTick(() => {
					this.panel = this.currentQuestionsList.length - 1;
				});
			},
	
			//update
	
			moveQuestion(fromIndex, toIndex) {
				const questions = this.editableData.hasGroups
					? this.currentGroup?.questions
					: this.editableData.questions;
	
				if (!questions || toIndex < 0 || toIndex >= questions.length) return;
	
				const question = questions.splice(fromIndex, 1)[0];
				questions.splice(toIndex, 0, question);
	
				// Trigger reactivity
				if (this.editableData.hasGroups && this.currentGroup) {
					this.currentGroup.questions = [...questions];
				} else {
					this.editableData = {
						...this.editableData,
						questions: [...questions]
					};
				}
			},
	
			// Cập nhật removeQuestion method
			removeQuestion(index) {
				if (this.editableData.hasGroups && this.currentGroup) {
					const newQuestions = [...this.currentGroup.questions];
					newQuestions.splice(index, 1);
					this.currentGroup.questions = newQuestions;
					this.updateGroupPoints();
				} else {
					const newQuestions = [...this.editableData.questions];
					newQuestions.splice(index, 1);
					this.editableData = {
						...this.editableData,
						questions: newQuestions
					};
				}
			},
			getQuizTypeName(type) {
				const found = this.quizTypesForComposite.find(t => t.value === type);
				return found ? found.title : 'Câu hỏi';
			},
	
			handleImportQuestions(importData) {
				// Kiểm tra format data
				if (!importData || !importData.questions) {
					console.error('Invalid import data');
					return;
				}
	
				const { questions, targetGroupIndex, questionType } = importData;
	
				if (this.editableData.hasGroups) {
					// Import vào group cụ thể
					const targetGroup = this.editableData.groups[targetGroupIndex];
					if (!targetGroup) {
						alert('Không tìm thấy nhóm đích');
						return;
					}
	
					// Thêm questions vào group
					const currentQuestions = targetGroup.questions || [];
					const newQuestions = [...currentQuestions, ...questions];
					targetGroup.questions = newQuestions;
	
					// Update points
					this.updateGroupPoints();
	
					// Switch to target group
					this.activeGroupIndex = targetGroupIndex;
	
					alert(`✅ Đã import ${questions.length} câu hỏi vào "${targetGroup.title}"`);
				} else {
					// Import vào danh sách flat
					const currentQuestions = this.editableData.questions || [];
					const newQuestions = [...currentQuestions, ...questions];
	
					this.editableData = {
						...this.editableData,
						questions: newQuestions
					};
	
					alert(`✅ Đã import ${questions.length} câu hỏi`);
				}
	
				// Auto expand câu hỏi đầu tiên vừa import
				this.$nextTick(() => {
					const startIndex = this.editableData.hasGroups
						? (this.currentGroup?.questions?.length || 0) - questions.length
						: (this.editableData.questions?.length || 0) - questions.length;
	
					this.panel = Math.max(0, startIndex);
				});
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