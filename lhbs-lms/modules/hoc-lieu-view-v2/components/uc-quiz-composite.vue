<template>
	<div class="uc-quiz-composite">
		<!-- 🚀 Màn hình Bắt đầu -->
		<div v-if="quizState === 'start'" class="lh-quiz-start">
			<div class="lh-start-hero">
				<!-- <div class="lh-start-icon">🏆</div> -->
				<h1 class="lh-start-title">{{ slideData.content.title }}</h1>
				<p class="lh-start-subtitle">Cùng thử sức với bài kiểm tra nhé!</p>
			</div>

			<div class="lh-start-info">
				<div class="lh-info-card">
					<div class="lh-info-icon">⏰</div>
					<div class="lh-info-content">
						<div class="lh-info-label">Thời gian</div>
						<div class="lh-info-value">{{ Math.floor((slideData.content.timeLimit || 0) / 60) }} phút</div>
					</div>
				</div>
				<div class="lh-info-card">
					<div class="lh-info-icon">📝</div>
					<div class="lh-info-content">
						<div class="lh-info-label">Số câu hỏi</div>
						<div class="lh-info-value">{{ totalQuestions }} câu</div>
					</div>
				</div>
				<div class="lh-info-card">
					<div class="lh-info-icon">🎯</div>
					<div class="lh-info-content">
						<div class="lh-info-label">Để qua bài</div>
						<div class="lh-info-value">{{ slideData.content.passingScore || Math.ceil(totalPoints * 0.7)
							}}/{{ totalPoints }}</div>
					</div>
				</div>
			</div>

			<!-- Groups Preview -->
			<div v-if="slideData.content.hasGroups" class="lh-groups-preview">
				<h3 class="lh-preview-title">Cấu trúc bài kiểm tra:</h3>
				<div class="lh-preview-groups">
					<div v-for="(group, index) in slideData.content.groups" :key="group.id" class="lh-preview-group">
						<div class="lh-preview-group-header">
							<span class="lh-preview-group-number">Phần {{ index + 1 }}</span>
							<span class="lh-preview-group-title">{{ group.title }}</span>
						</div>
						<div class="lh-preview-group-info">
							<span>{{ group.questions.length }} câu</span>
							<span>{{ group.points }} điểm</span>
							<span v-if="group.timeLimit">{{ Math.floor(group.timeLimit / 60) }} phút</span>
						</div>
						<div v-if="group.description" class="lh-preview-group-desc">{{ group.description }}</div>
					</div>
				</div>
			</div>

			<div class="lh-start-actions">
				<button class="lh-btn lh-btn-primary lh-btn-large" @click="startTest">
					<span class="lh-btn-icon">🚀</span>
					<span>Bắt đầu làm bài</span>
				</button>
			</div>
		</div>

		<!-- 📝 Màn hình Làm bài -->
		<div v-else-if="quizState === 'doing'" class="lh-quiz-layout">

			<!-- Content Area -->
			<div class="lh-quiz-content">

				<!-- Fullscreen Button -->
				<button class="lh-fullscreen-btn" @click="toggleQuizFullscreen"
					:title="isQuizFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'">
					<span class="lh-fullscreen-icon">{{ isQuizFullscreen ? '⛔' : '⛶' }}</span>
				</button>

				<div v-if="currentQuestion" class="lh-question-container">

					<!-- Question Header -->
					<div class="lh-question-header">
						<div class="lh-question-number">
							<span class="lh-question-badge">Câu {{ currentQuestionGlobalIndex + 1 }}</span>
							<span class="lh-question-type">{{ getQuestionTypeLabel(currentQuestion.type) }}</span>
						</div>
						<div v-if="currentGroup" class="lh-question-group-info">
							<span class="lh-group-badge">{{ currentGroup.title }}</span>
							<span class="lh-group-points">{{ currentQuestion.points || 1 }} điểm</span>
						</div>
					</div>

					<!-- Group Instruction -->
					<div v-if="currentGroup && currentGroup.instruction" class="lh-group-current-instruction">
						<div class="lh-instruction-header">
							<span class="lh-instruction-icon">💡</span>
							<span class="lh-instruction-title">Hướng dẫn {{ currentGroup.title }}:</span>
						</div>
						<div class="lh-instruction-content">{{ currentGroup.instruction }}</div>
					</div>

					<!-- Question Content -->
					<div class="lh-question-block"
						:class="'lh-quiz-' + currentQuestion.type.toLowerCase().replace('quiz_', '')">

						<!-- SingleChoice trong composite -->
						<div v-if="currentQuestion.type === 'QUIZ_SINGLE_CHOICE'" class="lh-single-choice">
							<!-- Prompt -->
							<uc-latex-view class="lh-question-prompt" :key="'prompt-' + currentQuestion.id"
								:content="currentQuestion.content.prompt" />

							<div class="lh-options-grid">
								<label v-for="option in currentQuestion.content.options" :key="option.id"
									class="lh-option-card"
									:class="{ 'lh-selected': userAnswers.composite[currentQuestion.id].singleChoice === option.id }">
									<input type="radio" :value="option.id"
										v-model="userAnswers.composite[currentQuestion.id].singleChoice"
										class="lh-option-input">
									<div class="lh-option-content">
										<div class="lh-option-indicator"></div>
										<!-- Option text -->
										<uc-latex-view class="lh-option-text"
											:key="'option-' + currentQuestion.id + '-' + option.id"
											:content="option.text" />
									</div>
								</label>
							</div>
						</div>

						<!-- MultipleChoice trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_MULTIPLE_CHOICE'" class="lh-multiple-choice">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion?.id" />
							<div class="lh-options-grid">
								<label v-for="option in currentQuestion.content.options" :key="option.id"
									class="lh-option-card lh-checkbox-card"
									:class="{ 'lh-selected': userAnswers.composite[currentQuestion.id].multipleChoice.includes(option.id) }">
									<input type="checkbox" :value="option.id"
										v-model="userAnswers.composite[currentQuestion.id].multipleChoice"
										class="lh-option-input">
									<div class="lh-option-content">
										<div class="lh-checkbox-indicator">
											<div class="lh-checkmark">✓</div>
										</div>
										<uc-latex-view class="lh-option-text" :content="option.text"
											:key="'option-' + currentQuestion.id + '-' + option.id" />
									</div>
								</label>
							</div>
						</div>

						<!-- Ordering trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_ORDERING'" class="lh-ordering">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion.id" />
							<div class="lh-ordering-hint">
								<span class="lh-hint-icon">💡</span>
								<span>Kéo thả để sắp xếp theo thứ tự đúng</span>
							</div>
							<div class="lh-ordering-container" :ref="'orderingContainer_' + currentQuestion.id">
								<div v-for="(item, index) in userAnswers.composite[currentQuestion.id].ordering"
									:key="item.id" class="lh-ordering-item" :data-id="item.id">
									<div class="lh-ordering-handle">
										<span class="lh-ordering-number">{{ index + 1 }}</span>
										<span class="lh-drag-icon">⋮⋮</span>
									</div>
									<uc-latex-view class="lh-ordering-text" :content="item.text"
										:key="'option-' + currentQuestion.id + '-' + item.id" />
								</div>
							</div>
						</div>

						<!-- Fill in blank trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_FILL_IN_BLANK'" class="lh-fill-blank">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion.id" />
							<div class="lh-fill-container">
								<template v-for="(part, index) in currentQuestion.content.parts" :key="index">
									<!-- SỬA: dùng v-html cho text có MathML -->
									<uc-latex-view v-if="part.type === 'text'" class="lh-fill-text"
										:content="part.value" />
									<div v-if="part.type === 'blank'" class="lh-fill-input-wrapper">
										<input type="text"
											v-model="userAnswers.composite[currentQuestion.id].fillInTheBlank[part.id]"
											class="lh-fill-input"
											:style="{ width: Math.max((part.size || 10) * 12, 80) + 'px' }"
											:placeholder="'___'">
									</div>
								</template>
							</div>
						</div>

						<!-- Matching trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_MATCHING'" class="lh-matching">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion.id" />
							<div class="lh-matching-hint">
								<span class="lh-hint-icon">💡</span>
								<span>Kéo thả để ghép đôi chính xác</span>
							</div>
							<div class="lh-matching-container">
								<div class="lh-matching-column lh-column-a">
									<div class="lh-column-title">Cột A</div>
									<div v-for="itemA in currentQuestion.content.columnA" :key="itemA.id"
										class="lh-matching-item-a">
										{{ itemA.text }}
									</div>
								</div>
								<div class="lh-matching-column lh-column-b">
									<div class="lh-column-title">Cột B</div>
									<div class="lh-matching-list" :ref="'matchingBContainer_' + currentQuestion.id">
										<div v-for="itemB in userAnswers.composite[currentQuestion.id].matching"
											:key="itemB.id" class="lh-matching-item-b" :data-id="itemB.id">
											<span class="lh-drag-icon">⋮⋮</span>
											<span class="lh-matching-text">{{ itemB.text }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Categorize trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_DRAG_DROP_CATEGORIZE'" class="lh-categorize">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion.id" />

							<div class="lh-source-pool">
								<div class="lh-pool-title">
									<span class="lh-pool-icon">📦</span>
									<span>Kéo từ đây:</span>
								</div>
								<div class="lh-items-container" :ref="'sourceContainer_' + currentQuestion.id">
									<div v-for="item in userAnswers.composite[currentQuestion.id].unclassifiedItems"
										:key="item.id" class="lh-draggable-item" :data-id="item.id">
										<span class="lh-item-text">{{ item.text }}</span>
									</div>
								</div>
							</div>

							<div class="lh-categories-grid">
								<div v-for="category in currentQuestion.content.categories" :key="category.id"
									class="lh-category-box">
									<div class="lh-category-header">
										<img v-if="isImage(category.name)" :src="category.name" alt="Category"
											class="lh-category-image">
										<span v-else class="lh-category-name">{{ category.name }}</span>
									</div>
									<div class="lh-category-dropzone" :data-category-id="category.id"
										:ref="'categoryContainer_' + currentQuestion.id + '_' + category.id"
										:data-ref="'categoryContainer_' + currentQuestion.id + '_' + category.id">
										<div class="lh-dropzone-hint">Thả vào đây</div>
									</div>
								</div>
							</div>
						</div>

						<!-- TRUE_FALSE trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_TRUE_FALSE'" class="lh-single-choice">
							<!-- Prompt -->
							<uc-latex-view class="lh-question-prompt" :key="'prompt-' + currentQuestion.id"
								:content="currentQuestion.content.prompt" />
							<div class="lh-options-grid"
								style="grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));">
								<label v-for="option in currentQuestion.content.options" :key="option.id"
									class="lh-option-card"
									:class="[getOptionClass(option.id), { 'lh-selected': getTrueFalseValue(option.id) !== undefined }]">

									<v-select placeholder="Đúng/Sai..."
										:items="[{title: '✅ Đúng', value: true}, {title: '❌ Sai', value: false}]"
										item-title='title' item-value='value'
										:model-value="getTrueFalseValue(option.id)"
										@update:modelValue="updateTrueFalseComposite(option, $event)"
										:bg-color="getTrueFalseBackgroundColor(option.id)" style="min-width:150px" />

									<div class="lh-option-content">
										<!-- Option text -->
										<uc-latex-view class="lh-option-text"
											:key="'option-' + currentQuestion.id + '-' + option.id"
											:content="option.text" />
									</div>
								</label>
							</div>
						</div>

						<!-- Connection (Nối đường thẳng) trong composite -->
						<div v-else-if="currentQuestion.type === 'QUIZ_CONNECTION'" class="lh-connection">
							<uc-latex-view class="lh-question-prompt" :content="currentQuestion.content.prompt"
								:key="'prompt-' + currentQuestion.id" />

							<div class="lh-connection-instructions">
								<span class="lh-hint-icon">💡</span>
								<span>Bước 1: Chọn nhóm bên trái → Bước 2: Chọn mục bên phải để nối</span>
							</div>

							<div class="lh-connection-parent-container" :ref="'connectionParent_' + currentQuestion.id">
								<svg class="lh-connection-lines-svg" :ref="'svgContainer_' + currentQuestion.id"
									style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
									<line v-for="(line, index) in getConnectionLines(currentQuestion.id)"
										:key="'line-' + index" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2"
										:stroke="line.color" stroke-width="4" stroke-linecap="round"
										class="lh-connection-line" />
								</svg>

								<div class="lh-connection-container" :ref="'connectionContainer_' + currentQuestion.id">
									<div class="lh-connection-column lh-groups-column">
										<div class="lh-connection-header">
											<span class="lh-connection-icon">🏷️</span>
											<span>Nhóm</span>
										</div>
										<div class="lh-connection-items">
											<div v-for="group in currentQuestion.content.groups"
												:key="'group-' + group.id"
												:id="'connect-' + currentQuestion.id + '-group-' + group.id"
												class="lh-connection-item lh-connection-group"
												:class="getCompositeGroupClass(currentQuestion.id, group.id)"
												:style="{ backgroundColor: getCompositeGroupColor(currentQuestion.id, group.id) }"
												@click="selectCompositeGroup(currentQuestion.id, group.id)">
												<div class="lh-group-content">
													<span class="lh-group-text">{{ group.text }}</span>
													<span
														v-if="getCompositeActiveGroup(currentQuestion.id) === group.id"
														class="lh-active-indicator">👆</span>
												</div>
											</div>
										</div>
									</div>

									<div class="lh-connection-column lh-items-column">
										<div class="lh-connection-header">
											<span class="lh-connection-icon">📝</span>
											<span>Mục</span>
										</div>
										<div class="lh-connection-items">
											<div v-for="item in currentQuestion.content.items" :key="'item-' + item.id"
												:id="'connect-' + currentQuestion.id + '-item-' + item.id"
												class="lh-connection-item lh-connection-item-target"
												:class="getCompositeItemClass(currentQuestion.id, item.id)"
												@click="selectCompositeItem(currentQuestion.id, item.id)">
												<div class="lh-item-content">
													<span class="lh-item-text">{{ item.text }}</span>
													<span
														v-if="getCompositeConnectionForItem(currentQuestion.id, item.id)"
														class="lh-connected-indicator">🔗</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div v-if="getCompositeActiveGroup(currentQuestion.id)" class="lh-connection-status">
								<span class="lh-status-icon">👉</span>
								<span>Đã chọn nhóm: <strong>{{ getCompositeGroupText(currentQuestion.id,
										getCompositeActiveGroup(currentQuestion.id)) }}</strong>
									- Giờ hãy chọn mục để nối!</span>
							</div>
						</div>

					</div>
				</div>
			</div>

			<!-- Navigation Panel -->
			<div class="lh-quiz-sidebar">
				<div class="lh-sidebar-content">

					<!-- Timer -->
					<div class="lh-timer-card">
						<div class="lh-timer-icon">⏰</div>
						<div class="lh-timer-time">{{ formatTime(timeLeft) }}</div>
						<div class="lh-timer-label">Thời gian còn lại</div>
					</div>

					<!-- Progress -->
					<div class="lh-progress-card">
						<div class="lh-progress-header">
							<span class="lh-progress-icon">📊</span>
							<span class="lh-progress-title">Tiến độ</span>
						</div>
						<div class="lh-progress-stats">
							<span class="lh-progress-number">{{ getCompletedCount() }}/{{ totalQuestions }}</span>
							<span class="lh-progress-text">đã làm</span>
						</div>
						<div class="lh-progress-bar">
							<div class="lh-progress-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
						</div>
						<div class="lh-progress-stars">
							<span v-for="n in 5" :key="n" class="lh-star"
								:class="{ 'lh-star-filled': n <= Math.ceil(getProgressPercentage() / 20) }">⭐</span>
						</div>
					</div>

					<!-- Question Grid với Groups -->
					<div class="lh-questions-grid">
						<div class="lh-grid-title">
							<span class="lh-grid-icon">📝</span>
							<span>Danh sách câu hỏi</span>
						</div>

						<!-- Hiển thị có groups -->
						<div v-if="slideData.content.hasGroups" class="lh-groups-container">
							<div v-for="(group, groupIndex) in slideData.content.groups" :key="group.id"
								class="lh-group-section">
								<div class="lh-group-header">
									<span class="lh-group-title">{{ group.title }}</span>
									<span class="lh-group-info">{{ group.questions.length }} câu - {{ group.points }}
										điểm</span>
									<div v-if="group.timeLimit" class="lh-group-timer">
										⏱️ {{ Math.floor(group.timeLimit / 60) }}p
									</div>
									<div class="lh-group-progress" :style="{ width: getGroupProgress(group) + '%' }">
									</div>
								</div>
								<div class="lh-group-questions">
									<button v-for="(q, qIndex) in group.questions" :key="q.id" class="lh-question-btn"
										:class="getQuestionButtonClass(getGlobalIndex(groupIndex, qIndex), q.id)"
										@click="navigateToQuestion(getGlobalIndex(groupIndex, qIndex))">
										<span class="lh-question-btn-number">{{ getGlobalIndex(groupIndex, qIndex) + 1
											}}</span>
										<span v-if="isQuestionCompleted(q.id)" class="lh-question-btn-check">✓</span>
									</button>
								</div>
							</div>
						</div>

						<!-- Hiển thị không có groups (legacy) -->
						<div v-else class="lh-grid-container">
							<button v-for="(q, index) in slideData.content.questions" :key="q.id"
								class="lh-question-btn" :class="getQuestionButtonClass(index, q.id)"
								@click="navigateToQuestion(index)">
								<span class="lh-question-btn-number">{{ index + 1 }}</span>
								<span v-if="isQuestionCompleted(q.id)" class="lh-question-btn-check">✓</span>
							</button>
						</div>
					</div>

					<!-- Navigation Controls -->
					<div class="lh-nav-controls">
						<button class="lh-btn lh-btn-secondary" :disabled="currentQuestionGlobalIndex === 0"
							@click="previousQuestion">
							<span class="lh-btn-icon">⬅️</span>
							<span>Trước</span>
						</button>
						<button class="lh-btn lh-btn-secondary"
							:disabled="currentQuestionGlobalIndex === allQuestions.length - 1" @click="nextQuestion">
							<span>Tiếp</span>
							<span class="lh-btn-icon">➡️</span>
						</button>
					</div>

					<!-- Submit Button -->
					<div class="lh-submit-section">
						<button class="lh-btn lh-btn-success lh-btn-large" @click="submitTest">
							<span class="lh-btn-icon">🏁</span>
							<span>Nộp bài</span>
						</button>
					</div>

				</div>
			</div>
		</div>

		<!-- 🏆 Màn hình Kết quả -->
		<div v-else-if="quizState === 'result'" class="lh-quiz-result"
			:class="{ 'lh-result-passed': testResult.passed, 'lh-result-failed': !testResult.passed }">
			<div class="lh-result-hero">
				<div class="lh-result-icon">{{ testResult.passed ? '🎉' : '💪' }}</div>
				<h1 class="lh-result-title">{{ testResult.passed ? 'Xuất sắc!' : 'Cố gắng lên!' }}</h1>
				<p class="lh-result-subtitle">{{ testResult.passed ? 'Em đã hoàn thành bài kiểm tra!' : 'Hãy ôn tập và
					thử lại nhé!' }}</p>
			</div>

			<div class="lh-result-score">
				<div class="lh-score-circle">
					<div class="lh-score-number">{{ testResult.score }}</div>
					<div class="lh-score-total">/{{ testResult.totalPoints }}</div>
				</div>
				<div class="lh-score-percentage">{{ testResult.percentage }}%</div>
				<div class="lh-score-stars">
					<span v-for="n in 5" :key="n" class="lh-star"
						:class="{ 'lh-star-filled': n <= Math.ceil(testResult.percentage / 20) }">⭐</span>
				</div>
			</div>

			<!-- Groups Result Detail (nếu có) -->
			<div v-if="slideData.content.hasGroups" class="lh-groups-result">
				<h3 class="lh-result-groups-title">Kết quả chi tiết theo phần:</h3>
				<div class="lh-result-groups-grid">
					<div v-for="(group, index) in slideData.content.groups" :key="group.id"
						class="lh-result-group-card">
						<div class="lh-result-group-header">
							<span class="lh-result-group-name">{{ group.title }}</span>
							<span class="lh-result-group-score">{{ getGroupScore(group) }}/{{ group.points }}</span>
						</div>
						<div class="lh-result-group-progress">
							<div class="lh-result-progress-bar">
								<div class="lh-result-progress-fill"
									:style="{ width: (getGroupScore(group) / group.points * 100) + '%' }"></div>
							</div>
							<span class="lh-result-group-percentage">{{ Math.round(getGroupScore(group) / group.points *
								100) }}%</span>
						</div>
						<div class="lh-result-group-stats">
							<span>{{ getGroupCompletedCount(group) }}/{{ group.questions.length }} câu đúng</span>
						</div>
					</div>
				</div>
			</div>

			<div class="lh-result-actions">
				<button class="lh-btn lh-btn-primary lh-btn-large" @click="reviewTest">
					<span class="lh-btn-icon">🔍</span>
					<span>Xem lại bài làm</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-quiz-composite',
		props: {
			slideData: { type: Object, required: true }
		},
		emits: ['quiz-completed'],
	
		data() {
			return {
				// Quiz states
				quizState: 'start', // 'start', 'doing', 'result'
				currentQuestionIndex: 0,
				timer: null,
				timeLeft: 0,
				testResult: { score: 0, passed: false },
	
				// User answers for composite quiz
				userAnswers: {
					composite: {}
				},
	
				// Sortable instances management
				sortableInstances: [],
	
				// Fullscreen states
				isQuizFullscreen: false,
				fullscreenContainer: null,
				originalParent: null,
				originalNextSibling: null,
	
				// Connection quiz specific data
				compositeGroupColors: {},
				compositeLines: {},
	
				// Question type labels for display
				questionTypeLabels: {
					'QUIZ_SINGLE_CHOICE': '🎯 Chọn một đáp án',
					'QUIZ_MULTIPLE_CHOICE': '☑️ Chọn nhiều đáp án',
					'QUIZ_FILL_IN_BLANK': '✏️ Điền vào chỗ trống',
					'QUIZ_ORDERING': '📝 Sắp xếp thứ tự',
					'QUIZ_MATCHING': '🔗 Ghép nối',
					'QUIZ_DRAG_DROP_CATEGORIZE': '📦 Phân loại',
					'QUIZ_CONNECTION': '🔗 Nối đường thẳng',
					'QUIZ_COMPOSITE': '🏆 Bài kiểm tra tổng hợp',
					'QUIZ_TRUE_FALSE': '🎯 Chọn đáp án đúng sai',
				}
			}
		},
	
		computed: {
			// Tính tổng điểm của composite quiz
			totalPoints() {
				if (this.slideData.content.hasGroups) {
					return this.slideData.content.groups.reduce((total, group) => total + group.points, 0);
				} else {
					return this.slideData.content.questions.reduce((total, q) => total + (q.points || 1), 0);
				}
			},
	
			// Tính tổng số câu hỏi
			totalQuestions() {
				if (this.slideData.content.hasGroups) {
					return this.slideData.content.groups.reduce((total, group) => total + group.questions.length, 0);
				} else {
					return this.slideData.content.questions.length;
				}
			},
	
			// Lấy tất cả questions từ groups hoặc direct questions
			allQuestions() {
				if (this.slideData.content.hasGroups) {
					let questions = [];
					this.slideData.content.groups.forEach(group => {
						questions = questions.concat(group.questions);
					});
					return questions;
				} else {
					return this.slideData.content.questions || [];
				}
			},
	
			// Lấy question hiện tại
			currentQuestion() {
				if (this.quizState === 'doing') {
					const questions = this.allQuestions;
					return questions[this.currentQuestionIndex];
				}
				return null;
			},
	
			// Lấy group hiện tại của question đang làm
			currentGroup() {
				if (this.slideData.content.hasGroups && this.currentQuestion) {
					return this.slideData.content.groups.find(group =>
						group.questions.some(q => q.id === this.currentQuestion.id)
					);
				}
				return null;
			},
	
			// Lấy index của question trong tất cả questions
			currentQuestionGlobalIndex() {
				if (this.currentQuestion) {
					return this.allQuestions.findIndex(q => q.id === this.currentQuestion.id);
				}
				return 0;
			}
		},
	
		watch: {
	
			slideData: {
				handler(newSlide) {
					if (newSlide) {
						this.initializeQuiz();
					}
				},
				immediate: true,
				deep: false
			},
	
			userAnswers: {
				handler(newAnswers) {
					// Redraw connection lines for current question if it's connection type
					if (this.currentQuestion?.type === 'QUIZ_CONNECTION') {
						Vue.nextTick(() => {
							setTimeout(() => {
								this.drawCompositeConnectionLines(this.currentQuestion.id);
							}, 100);
						});
					}
				},
				deep: true
			}
		},
	
		methods: {
			// ==================== QUIZ LIFECYCLE METHODS ====================
			initializeQuiz() {
				// Initialize quiz state
				this.quizState = 'start';
				this.currentQuestionIndex = 0;
				this.timeLeft = this.slideData.content.timeLimit || 3600;
				this.userAnswers = { composite: {} };
				this.compositeGroupColors = {};
				this.compositeLines = {};
	
				// Clear any existing timer
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
	
			startTest() {
				this.quizState = 'doing';
				this.timeLeft = this.slideData.content.timeLimit || 3600; // Default 1 hour
				this.currentQuestionIndex = 0;
	
				// Initialize answers for all questions
				this.initializeCompositeAnswers();
	
				// Initialize sortables for current question
				Vue.nextTick(() => {
					this.initCompositeSortables();
				});
	
				this.startTimer();
				this.playSound('start');
			},
	
			initializeCompositeAnswers() {
				const initialAnswers = {};
				const questions = this.allQuestions;
	
				questions.forEach(q => {
					if (q.type === 'QUIZ_SINGLE_CHOICE') {
						initialAnswers[q.id] = { singleChoice: null };
					} else if (q.type === 'QUIZ_MULTIPLE_CHOICE') {
						initialAnswers[q.id] = { multipleChoice: [] };
					} else if (q.type === 'QUIZ_ORDERING') {
						initialAnswers[q.id] = { ordering: this.shuffleArray([...q.content.items]) };
					} else if (q.type === 'QUIZ_FILL_IN_BLANK') {
						const fillInBlank = {};
						q.content.parts.forEach(part => {
							if (part.type === 'blank') {
								fillInBlank[part.id] = '';
							}
						});
						initialAnswers[q.id] = { fillInTheBlank: fillInBlank };
					} else if (q.type === 'QUIZ_MATCHING') {
						initialAnswers[q.id] = { matching: this.shuffleArray([...q.content.columnB]) };
					} else if (q.type === 'QUIZ_DRAG_DROP_CATEGORIZE') {
						initialAnswers[q.id] = { unclassifiedItems: this.shuffleArray([...q.content.items]) };
					} else if (q.type === 'QUIZ_TRUE_FALSE') {
						initialAnswers[q.id] = { trueFalse: {} };
					} else if (q.type === 'QUIZ_CONNECTION') {
						initialAnswers[q.id] = {
							connection: {
								activeGroup: null,
								selections: []
							}
						};
						// Generate colors for this question's groups
						this.generateCompositeGroupColors(q.id, q.content.groups);
					}
				});
				this.userAnswers.composite = initialAnswers;
			},
	
			startTimer() {
				if (this.timer) clearInterval(this.timer);
				this.timer = setInterval(() => {
					if (this.timeLeft > 0) {
						this.timeLeft--;
					} else {
						clearInterval(this.timer);
						this.submitTest();
					}
				}, 1000);
			},
	
			formatTime(seconds) {
				const m = Math.floor(seconds / 60).toString().padStart(2, '0');
				const s = (seconds % 60).toString().padStart(2, '0');
				return `${m}:${s}`;
			},
	
			// ==================== CONNECTION QUIZ METHODS FOR COMPOSITE ====================
			generateCompositeGroupColors(questionId, groups) {
				const presetColors = [
					'#FF6B6B', '#4DD0E1', '#FFD93D',
					'#6BCB77', '#FF9F1C', '#C084FC',
					'#38BDF8', '#F472B6', '#FBBF24', '#34D399'
				];
	
				if (!this.compositeGroupColors[questionId]) {
					this.compositeGroupColors[questionId] = {};
				}
	
				let i = 0;
				groups.forEach(group => {
					this.compositeGroupColors[questionId][group.id] = presetColors[i % presetColors.length];
					i++;
				});
			},
	
			selectCompositeGroup(questionId, groupId) {
				if (!this.userAnswers.composite[questionId]) {
					this.userAnswers.composite[questionId] = {
						connection: { activeGroup: null, selections: [] }
					};
				}
				if (!this.userAnswers.composite[questionId].connection) {
					this.userAnswers.composite[questionId].connection = { activeGroup: null, selections: [] };
				}
	
				this.userAnswers.composite[questionId].connection.activeGroup = groupId;
				this.playSound('navigate');
			},
	
			selectCompositeItem(questionId, itemId) {
				if (!this.userAnswers.composite[questionId]?.connection) {
					return;
				}
	
				const activeGroup = this.userAnswers.composite[questionId].connection.activeGroup;
				if (!activeGroup) {
					this.showToast("Vui lòng chọn một mục ở cột trái trước.", 'warning');
					return;
				}
	
				console.log('Connecting:', activeGroup, 'to', itemId, 'for question:', questionId);
	
				// Remove old connection for this item
				this.userAnswers.composite[questionId].connection.selections =
					this.userAnswers.composite[questionId].connection.selections.filter(sel => sel.to !== itemId);
	
				// Add new connection
				this.userAnswers.composite[questionId].connection.selections.push({
					from: activeGroup,
					to: itemId
				});
	
				console.log('Current selections:', this.userAnswers.composite[questionId].connection.selections);
	
				this.playSound('drop');
	
				// Draw lines for this question
				Vue.nextTick(() => {
					setTimeout(() => {
						this.drawCompositeConnectionLines(questionId);
					}, 100);
				});
			},
	
			drawCompositeConnectionLines(questionId) {
				if (!this.userAnswers.composite[questionId]?.connection?.selections?.length) {
					if (!this.compositeLines) this.compositeLines = {};
					this.compositeLines[questionId] = [];
					return;
				}
	
				// Wait for DOM update and ensure elements are ready
				this.$nextTick(() => {
					setTimeout(() => {
						const containerEl = this.$refs['connectionContainer_' + questionId];
						const parentEl = this.$refs['connectionParent_' + questionId];
	
						if (!containerEl || !parentEl) {
							console.warn('Connection refs not found for question:', questionId);
							return;
						}
	
						const parentRect = parentEl.getBoundingClientRect();
						const newLines = [];
	
						console.log('Drawing lines for question:', questionId, 'selections:', this.userAnswers.composite[questionId].connection.selections);
	
						this.userAnswers.composite[questionId].connection.selections.forEach((selection, index) => {
							const fromEl = document.getElementById('connect-' + questionId + '-group-' + selection.from);
							const toEl = document.getElementById('connect-' + questionId + '-item-' + selection.to);
	
							if (fromEl && toEl) {
								const fromRect = fromEl.getBoundingClientRect();
								const toRect = toEl.getBoundingClientRect();
	
								// Calculate relative to parent container
								const x1 = fromRect.right - parentRect.left - 10;
								const y1 = fromRect.top + fromRect.height / 2 - parentRect.top;
								const x2 = toRect.left - parentRect.left + 10;
								const y2 = toRect.top + toRect.height / 2 - parentRect.top;
	
								const line = {
									x1: Math.max(0, x1),
									y1: Math.max(0, y1),
									x2: Math.min(parentRect.width, Math.max(0, x2)),
									y2: Math.max(0, y2),
									color: this.getCompositeGroupColor(questionId, selection.from)
								};
	
								console.log(`Line ${index} for question ${questionId}:`, line);
								newLines.push(line);
							} else {
								console.warn(`Elements not found for selection:`, selection, 'question:', questionId);
							}
						});
	
						// Store lines for this question
						if (!this.compositeLines) this.compositeLines = {};
						this.compositeLines[questionId] = [...newLines];
						console.log('Lines updated for question:', questionId, 'count:', newLines.length);
					}, 100);
				});
			},
	
			getConnectionLines(questionId) {
				if (!this.compositeLines) this.compositeLines = {};
				return this.compositeLines[questionId] || [];
			},
	
			getCompositeActiveGroup(questionId) {
				return this.userAnswers.composite[questionId]?.connection?.activeGroup || null;
			},
	
			getCompositeGroupClass(questionId, groupId) {
				const isActive = this.getCompositeActiveGroup(questionId) === groupId;
				const hasConnection = this.userAnswers.composite[questionId]?.connection?.selections?.find(s => s.from === groupId);
				return {
					'lh-active': isActive,
					'lh-connected': hasConnection
				};
			},
	
			getCompositeItemClass(questionId, itemId) {
				const matches = this.userAnswers.composite[questionId]?.connection?.selections?.filter(s => s.to === itemId) || [];
				return matches.length > 0 ? 'lh-connected' : '';
			},
	
			getCompositeGroupColor(questionId, groupId) {
				return this.compositeGroupColors[questionId]?.[groupId] || '#4CAF50';
			},
	
			getCompositeConnectionForItem(questionId, itemId) {
				return this.userAnswers.composite[questionId]?.connection?.selections?.find(s => s.to === itemId);
			},
	
			getCompositeGroupText(questionId, groupId) {
				const question = this.allQuestions.find(q => q.id === questionId);
				const group = question?.content?.groups?.find(g => g.id === groupId);
				return group ? group.text : '';
			},
	
	
			navigateToQuestion(globalIndex) {
				// Save current sortable state before switching
				this.saveCurrentSortableState();
	
				// Clean up current sortables
				this.destroySortableInstances();
	
				this.currentQuestionIndex = globalIndex;
	
				// Initialize sortables for new question
				Vue.nextTick(() => {
					// Draw connection lines if it's connection type
					if (this.currentQuestion?.type === 'QUIZ_CONNECTION') {
						setTimeout(() => {
							this.drawCompositeConnectionLines(this.currentQuestion.id);
						}, 200);
					}
					this.initCompositeSortables();
				});
	
				this.playSound('navigate');
			},
	
			nextQuestion() {
				if (this.currentQuestionGlobalIndex < this.allQuestions.length - 1) {
					this.navigateToQuestion(this.currentQuestionGlobalIndex + 1);
				}
			},
	
			previousQuestion() {
				if (this.currentQuestionGlobalIndex > 0) {
					this.navigateToQuestion(this.currentQuestionGlobalIndex - 1);
				}
			},
	
			// ==================== PROGRESS TRACKING METHODS ====================
			getCompletedCount() {
				const questions = this.allQuestions;
				return questions.filter(question => {
					return this.isQuestionCompleted(question.id);
				}).length;
			},
	
			getProgressPercentage() {
				const totalQuestions = this.allQuestions.length;
				if (totalQuestions === 0) return 0;
				return Math.round((this.getCompletedCount() / totalQuestions) * 100);
			},
	
			isQuestionCompleted(questionId) {
				const answer = this.userAnswers.composite[questionId];
				if (!answer) return false;
	
				// Check specific answer types
				if (answer.singleChoice !== null && answer.singleChoice !== undefined) {
					return true;
				}
	
				if (answer.multipleChoice && Array.isArray(answer.multipleChoice) && answer.multipleChoice.length > 0) {
					return true;
				}
	
				if (answer.fillInTheBlank && typeof answer.fillInTheBlank === 'object') {
					const hasFilledBlanks = Object.values(answer.fillInTheBlank).some(val => val && val.toString().trim() !== '');
					return hasFilledBlanks;
				}
	
				if (answer.trueFalse && typeof answer.trueFalse === 'object') {
					const hasAnswered = Object.keys(answer.trueFalse).length > 0;
					return hasAnswered;
				}
	
				if (answer.connection && typeof answer.connection === 'object') {
					const hasConnections = answer.connection.selections && answer.connection.selections.length > 0;
					return hasConnections;
				}
	
				if (answer.unclassifiedItems !== undefined) {
					const allQuestions = this.allQuestions;
					const question = allQuestions.find(q => q.id === questionId);
					if (question && question.content.items) {
						const completed = answer.unclassifiedItems.length < question.content.items.length;
						return completed;
					}
				}
	
				return false;
			},
	
			getQuestionButtonClass(globalIndex, questionId) {
				const classes = ['lh-question-btn'];
				if (this.currentQuestionGlobalIndex === globalIndex) {
					classes.push('lh-current');
				} else if (this.isQuestionCompleted(questionId)) {
					classes.push('lh-completed');
				} else {
					classes.push('lh-pending');
				}
				return classes;
			},
	
			getGlobalIndex(groupIndex, questionIndex) {
				let globalIndex = 0;
				for (let i = 0; i < groupIndex; i++) {
					globalIndex += this.slideData.content.groups[i].questions.length;
				}
				return globalIndex + questionIndex;
			},
	
			getGroupProgress(group) {
				const completedInGroup = group.questions.filter(q =>
					this.isQuestionCompleted(q.id)).length;
				return Math.round((completedInGroup / group.questions.length) * 100);
			},
	
			getGroupScore(group) {
				let score = 0;
				group.questions.forEach(question => {
					if (this.checkQuestionAnswer(question)) {
						score += question.points || 1;
					}
				});
				return score;
			},
	
			getGroupCompletedCount(group) {
				return group.questions.filter(question => this.checkQuestionAnswer(question)).length;
			},
	
			// ==================== SORTABLE METHODS ====================
			initCompositeSortables() {
				if (!this.currentQuestion) return;
	
				// Destroy existing instances first
				this.destroySortableInstances();
	
				if (this.currentQuestion.type === 'QUIZ_ORDERING') {
					this.initOrderingSortable(this.currentQuestion.id);
				} else if (this.currentQuestion.type === 'QUIZ_MATCHING') {
					this.initMatchingSortable(this.currentQuestion.id);
				} else if (this.currentQuestion.type === 'QUIZ_DRAG_DROP_CATEGORIZE') {
					this.initCategorizeSortable(this.currentQuestion.id);
				}
			},
	
			initOrderingSortable(questionId) {
				const refName = 'orderingContainer_' + questionId;
				const container = this.$refs[refName];
				if (container) {
					const instance = new Sortable(container, {
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						chosenClass: 'lh-sortable-chosen',
						dragClass: 'lh-sortable-drag',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(instance);
				}
			},
	
			initMatchingSortable(questionId) {
				const refName = 'matchingBContainer_' + questionId;
				const container = this.$refs[refName];
				if (container) {
					const instance = new Sortable(container, {
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						chosenClass: 'lh-sortable-chosen',
						dragClass: 'lh-sortable-drag',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(instance);
				}
			},
	
			initCategorizeSortable(questionId) {
				// Source container
				const sourceRefName = 'sourceContainer_' + questionId;
				const sourceContainer = this.$refs[sourceRefName];
				if (sourceContainer) {
					const sourceInstance = new Sortable(sourceContainer, {
						group: 'categorize-group-' + questionId,
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						chosenClass: 'lh-sortable-chosen',
						dragClass: 'lh-sortable-drag',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(sourceInstance);
				}
	
				// Category containers
				if (this.currentQuestion.content.categories) {
					this.currentQuestion.content.categories.forEach(category => {
						const categoryRefName = 'categoryContainer_' + questionId + '_' + category.id;
						const categoryContainer = this.$refs[categoryRefName];
						if (categoryContainer) {
							const categoryInstance = new Sortable(categoryContainer, {
								group: 'categorize-group-' + questionId,
								animation: 200,
								ghostClass: 'lh-sortable-ghost',
								chosenClass: 'lh-sortable-chosen',
								dragClass: 'lh-sortable-drag',
								onEnd: () => this.playSound('drop')
							});
							this.sortableInstances.push(categoryInstance);
						}
					});
				}
			},
	
			destroySortableInstances() {
				this.sortableInstances.forEach(instance => {
					try {
						instance.destroy();
					} catch (e) {
						console.warn('Error destroying sortable instance:', e);
					}
				});
				this.sortableInstances = [];
			},
	
			saveCurrentSortableState() {
				if (!this.currentQuestion) return;
	
				const questionId = this.currentQuestion.id;
	
				if (this.currentQuestion.type === 'QUIZ_ORDERING') {
					const refName = 'orderingContainer_' + questionId;
					const container = this.$refs[refName];
					if (container) {
						const orderedItems = Array.from(container.children).map(el => {
							const itemId = el.dataset.id;
							return this.userAnswers.composite[questionId].ordering.find(item => item.id === itemId);
						}).filter(Boolean);
						this.userAnswers.composite[questionId].ordering = orderedItems;
					}
				}
				// Similar for other sortable types...
			},
	
			// ==================== SUBMISSION & SCORING METHODS ====================
			submitTest() {
				if (this.timer) clearInterval(this.timer);
	
				// Save current state
				this.saveCurrentSortableState();
	
				// Calculate score
				let score = 0;
				const questions = this.allQuestions;
	
				questions.forEach(question => {
					if (this.checkQuestionAnswer(question)) {
						score += question.points || 1;
					}
				});
	
				const totalPoints = this.totalPoints;
				const passingScore = this.slideData.content.passingScore || Math.ceil(totalPoints * 0.7);
	
				this.testResult = {
					score: score,
					totalPoints: totalPoints,
					passed: score >= passingScore,
					percentage: Math.round((score / totalPoints) * 100)
				};
	
				this.quizState = 'result';
				this.playSound(this.testResult.passed ? 'success' : 'try-again');
	
				// Emit result to parent
				this.$emit('quiz-completed', this.testResult);
			},
	
			reviewTest() {
				this.quizState = 'doing';
				this.currentQuestionIndex = 0;
			},
	
			checkQuestionAnswer(question) {
				const userAnswer = this.userAnswers.composite[question.id];
				if (!userAnswer) return false;
	
				switch (question.type) {
					case 'QUIZ_SINGLE_CHOICE':
						const userChoice = String(userAnswer.singleChoice);
						const correctChoice = String(question.content.correctAnswer);
						return userChoice === correctChoice;
	
					case 'QUIZ_MULTIPLE_CHOICE':
						const correctAnswers = (question.content.correctAnswers || []).map(String).sort();
						const userAnswers = (userAnswer.multipleChoice || []).map(String).sort();
						return JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
	
					case 'QUIZ_FILL_IN_BLANK':
						let allCorrect = true;
						question.content.parts.forEach(part => {
							if (part.type === 'blank') {
								const userAns = (userAnswer.fillInTheBlank[part.id] || '').toLowerCase().trim();
								const correctAns = (part.correctAnswer || '').toLowerCase().trim();
								if (userAns !== correctAns) {
									allCorrect = false;
								}
							}
						});
						return allCorrect;
	
					case 'QUIZ_CONNECTION':
						let correctCount = 0;
						const userSelectionsMap = new Map(
							(userAnswer.connection?.selections || []).map(s => [String(s.to), String(s.from)])
						);
	
						question.content.items.forEach(item => {
							const userGroup = userSelectionsMap.get(String(item.id));
							const correctGroup = String(item.groupId);
							console.log(`Connection item ${item.id} - User group: ${userGroup}, Correct group: ${correctGroup}`);
							if (userGroup === correctGroup) {
								correctCount++;
							}
						});
						const isCorrect = correctCount === question.content.items.length;
						console.log('Connection - Correct count:', correctCount, 'Total items:', question.content.items.length, 'Result:', isCorrect);
						return isCorrect;
	
					// Add other question types here...
					default:
						return false;
				}
			},
	
			// ==================== TRUE/FALSE METHODS ====================
			updateTrueFalseComposite(option, val) {
				if (val !== null && val !== undefined) {
					if (this.currentQuestion) {
						if (!this.userAnswers.composite[this.currentQuestion.id]) {
							this.userAnswers.composite[this.currentQuestion.id] = { trueFalse: {} };
						}
						if (!this.userAnswers.composite[this.currentQuestion.id].trueFalse) {
							this.userAnswers.composite[this.currentQuestion.id].trueFalse = {};
						}
	
						this.userAnswers.composite[this.currentQuestion.id].trueFalse[option.id] = val;
					}
				}
			},
	
			getTrueFalseValue(optionId) {
				if (this.currentQuestion && this.userAnswers.composite[this.currentQuestion.id]?.trueFalse) {
					return this.userAnswers.composite[this.currentQuestion.id].trueFalse[optionId];
				}
				return undefined;
			},
	
			getTrueFalseBackgroundColor(optionId) {
				const value = this.getTrueFalseValue(optionId);
				if (value === true) return 'success';
				if (value === false) return 'error';
				return 'white';
			},
	
			// ==================== UTILITY METHODS ====================
			shuffleArray(array) {
				const newArray = [...array];
				for (let i = newArray.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
				}
				return newArray;
			},
	
			getQuestionTypeLabel(type) {
				return this.questionTypeLabels[type] || type;
			},
	
			getOptionClass(optionId) {
				// Return empty for now in composite quiz
				return '';
			},
	
			isImage(value) {
				if (!value) return false;
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
				return /^https?:\/\//.test(value) && imageExtensions.some(ext => value.toLowerCase().endsWith(ext));
			},
	
			playSound(type) {
				const sounds = {
					start: '/_cdn/lhbs-lms/sounds/start.mp3',
					correct: '/_cdn/lhbs-lms/sounds/correct.mp3',
					wrong: '/_cdn/lhbs-lms/sounds/wrong.mp3',
					success: '/_cdn/lhbs-lms/sounds/success.mp3',
					'try-again': '/_cdn/lhbs-lms/sounds/try-again.mp3',
					navigate: '/_cdn/lhbs-lms/sounds/click.mp3',
					drop: '/_cdn/lhbs-lms/sounds/drop.mp3',
					'fullscreen-enter': '/_cdn/lhbs-lms/sounds/fullscreen-enter.mp3',
					'fullscreen-exit': '/_cdn/lhbs-lms/sounds/fullscreen-exit.mp3'
				};
	
				if (sounds[type]) {
					const audio = new Audio(sounds[type]);
					audio.volume = 0.3;
					audio.play().catch(() => { }); // Ignore audio errors
				}
			},
	
			showToast(message, type = 'info') {
				// Use Vue toast if available, otherwise fallback to console
				if (this.$toast) {
					this.$toast[type](message);
				} else if (Vue.$toast) {
					Vue.$toast[type](message);
				} else {
					// console.log(`[${type.toUpperCase()}] ${message}`);
				}
			},
	
			// ==================== FULLSCREEN METHODS ====================
			toggleQuizFullscreen() {
				if (this.isQuizFullscreen) {
					this.exitQuizFullscreen();
				} else {
					this.enterQuizFullscreen();
				}
			},
	
			enterQuizFullscreen() {
				const container = this.$el.querySelector('.lh-quiz-layout');
				if (!container) return;
	
				container.requestFullscreen().then(() => {
					this.isQuizFullscreen = true;
					document.addEventListener('keydown', this.handleFullscreenKeydown);
					this.playSound('fullscreen-enter');
				}).catch((err) => {
					console.error('Fullscreen failed:', err);
				});
			},
	
			exitQuizFullscreen() {
				if (document.fullscreenElement) {
					document.exitFullscreen();
					this.isQuizFullscreen = false;
					document.removeEventListener('keydown', this.handleFullscreenKeydown);
					this.playSound('fullscreen-exit');
				}
			},
	
			handleFullscreenKeydown(event) {
				if (event.key === 'Escape') {
					event.preventDefault();
					this.exitQuizFullscreen();
				}
			},
	
			addFullscreenOverlay() {
				const overlay = document.createElement('div');
				overlay.className = 'lh-fullscreen-overlay';
				overlay.id = 'lh-fullscreen-overlay';
				overlay.addEventListener('click', this.exitQuizFullscreen);
				document.body.appendChild(overlay);
			},
	
			removeFullscreenOverlay() {
				const overlay = document.getElementById('lh-fullscreen-overlay');
				if (overlay) {
					overlay.remove();
				}
			},
	
			announceFullscreen(message) {
				const announcer = document.createElement('div');
				announcer.setAttribute('aria-live', 'polite');
				announcer.setAttribute('aria-atomic', 'true');
				announcer.style.position = 'absolute';
				announcer.style.left = '-10000px';
				announcer.textContent = message;
	
				document.body.appendChild(announcer);
	
				setTimeout(() => {
					announcer.remove();
				}, 1000);
			},
	
			resetStates() {
				// Clear timer
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
	
				// Destroy sortable instances
				this.destroySortableInstances();
	
				// Exit fullscreen if active
				if (this.isQuizFullscreen) {
					this.exitQuizFullscreen();
				}
	
				// Reset to initial state
				this.quizState = 'start';
				this.currentQuestionIndex = 0;
				this.timeLeft = 0;
				this.userAnswers = { composite: {} };
				this.testResult = { score: 0, passed: false };
				this.compositeGroupColors = {};
				this.compositeLines = {};
			}
		},
	
		mounted() {
			// Component mounted logic
			if (this.slideData) {
				this.initializeQuiz();
			}
	
			// Add window resize listener for connection quiz
			this.resizeHandler = () => {
				if (this.currentQuestion?.type === 'QUIZ_CONNECTION') {
					setTimeout(() => {
						this.drawCompositeConnectionLines(this.currentQuestion.id);
					}, 100);
				}
			};
			window.addEventListener('resize', this.resizeHandler);
		},
	
		beforeDestroy() {
			this.resetStates();
	
			// Clean up resize listener
			if (this.resizeHandler) {
				window.removeEventListener('resize', this.resizeHandler);
			}
		}
	}
</script>