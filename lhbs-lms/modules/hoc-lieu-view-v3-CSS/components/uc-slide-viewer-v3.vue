<template>
	<div v-if="slideData && slideData.content" class="lh-slide-viewer">

		<!-- ==================== QUIZ_COMPOSITE (Bài kiểm tra tổng hợp) ==================== -->
		<uc-quiz-composite v-if="slideData.type === 'QUIZ_COMPOSITE' && slideData.content" :slide-data="slideData"
			@quiz-completed="onQuizCompleted" />

		<!-- ==================== CÁC LOẠI SLIDE ĐƠN LẺ KHÁC ==================== -->
		<div v-else class="lh-single-slide">

			<!-- Reading / HTML Content với Fullscreen Button -->
			<div v-if="['HTML', 'READING', 'ReadingWithImage'].includes(slideData.type)" class="lh-reading-slide">
				<div class="lh-slide-header" v-if="slideData.content.title">
					<h1 class="lh-slide-title">{{ slideData.content.title }}</h1>
					<p v-if="slideData.content.author" class="lh-slide-author">{{ slideData.content.author }}</p>
				</div>

				<div class="lh-reading-content">
					<!-- Iframe Container với Fullscreen Button -->
					<div class="lh-iframe-container" v-if="slideData.content.htmlContent">
						<div v-if="slideData.content.isType === 'rich'" class="lh-reading-iframe pa-4"
							v-html="slideData.content.textContent" />
						<iframe v-else :srcdoc="slideData.content.htmlContent"
							sandbox="allow-scripts  allow-popups allow-forms" class="lh-reading-iframe"
							ref="htmlContentIframe">
						</iframe>

						<!-- Fullscreen Float Button -->
						<button class="lh-fullscreen-btn" @click="toggleFullscreen"
							:title="isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'">
							<span class="lh-fullscreen-icon">{{ isFullscreen ? '⛔' : '⛶' }}</span>
						</button>
					</div>

					<img v-if="slideData.content.image" :src="slideData.content.image" class="lh-reading-image" />
				</div>
			</div>

			<div v-else-if="slideData.type === 'ISPRING_CONTENT'" class="lh-ispring-slide">
				<div class="lh-slide-header" v-if="slideData.content.title">
					<h1 class="lh-slide-title">
						<span class="lh-ispring-icon">📚</span>
						{{ slideData.content.title }}
					</h1>
					<p v-if="slideData.content.description" class="lh-slide-description">{{
						slideData.content.description }}</p>
				</div>

				<div class="lh-ispring-content">
					<!-- iSpring Iframe Container -->
					<div class="lh-iframe-container" v-if="slideData.content.iSpringURL">
						<iframe :src="slideData.content.iSpringURL" class="lh-ispring-iframe" ref="iSpringContentIframe"
							frameborder="0" allowfullscreen
							sandbox="allow-scripts  allow-forms allow-popups allow-modals" @load="oniSpringLoad"
							@error="oniSpringError" style="width: 100%; height: calc(100dvh - 189px);">
						</iframe>

						<!-- Fullscreen Float Button -->
						<button class="lh-fullscreen-btn" @click="toggleiSpringFullscreen"
							:title="isiSpringFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'">
							<span class="lh-fullscreen-icon">{{ isiSpringFullscreen ? '⛔' : '⛶' }}</span>
						</button>
					</div>

					<!-- Error State -->
					<div v-else-if="slideData.content.error" class="lh-ispring-error">
						<div class="lh-error-icon">❌</div>
						<h3>Không thể tải nội dung iSpring</h3>
						<p>{{ slideData.content.error }}</p>
						<button class="lh-btn lh-btn-primary" @click="retryiSpringLoad">
							🔄 Thử lại
						</button>
					</div>

					<!-- No Content State -->
					<div v-else class="lh-ispring-placeholder">
						<div class="lh-placeholder-icon">📚</div>
						<h3>iSpring Content</h3>
						<p>Nội dung iSpring chưa được thiết lập</p>
					</div>
				</div>
			</div>

			<!-- VIDEO -->
			<div v-else-if="slideData.type === 'VIDEO'">
				<uc-media-player :url="slideData.content.url" :title="slideData.content.title" />
			</div>

			<!-- ==================== AUDIO ==================== -->
			<div v-else-if="slideData.type === 'AUDIO'">
				<!-- <uc-media-player :url="slideData.content.url" :title="slideData.content.title" /> -->
				<!-- sử dụng bên drive vì có file audio -->
				<uc-office-reader :file-url="slideData.content.url" style="height: calc(100dvh - 289px)" />
			</div>

			<!-- Single Quiz Types -->
			<div v-else-if="slideData.type.startsWith('QUIZ')" class="lh-quiz-single"
				:class="'lh-quiz-' + slideData.type.toLowerCase().replace('quiz_', '')">

				<!-- Quiz Header -->
				<div class="lh-quiz-header">
					<div class="lh-quiz-type-badge">{{ getQuestionTypeLabel(slideData.type) }}</div>
				</div>

				<!-- Quiz Content -->
				<div class="lh-quiz-content-single">

					<!-- SingleChoice -->
					<div v-if="slideData.type === 'QUIZ_SINGLE_CHOICE'" class="lh-single-choice">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-options-grid">
							<label v-for="option in slideData.content.options" :key="option.id" class="lh-option-card"
								:class="[getOptionClass(option.id), { 'lh-selected': userAnswers.singleChoice === option.id }]">
								<input type="radio" :value="option.id" v-model="userAnswers.singleChoice"
									class="lh-option-input">
								<div class="lh-option-content">
									<div class="lh-option-indicator"></div>
									<uc-latex-view class="lh-option-text" v-html="option.text" />
								</div>
							</label>
						</div>
					</div>

					<!-- MultipleChoice -->
					<div v-else-if="slideData.type === 'QUIZ_MULTIPLE_CHOICE'" class="lh-multiple-choice">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-options-grid">
							<label v-for="option in slideData.content.options" :key="option.id"
								class="lh-option-card lh-checkbox-card"
								:class="[getOptionClass(option.id), { 'lh-selected': userAnswers.multipleChoice.includes(option.id) }]">
								<input type="checkbox" :value="option.id" v-model="userAnswers.multipleChoice"
									class="lh-option-input">
								<div class="lh-option-content">
									<div class="lh-checkbox-indicator">
										<div class="lh-checkmark">✓</div>
									</div>
									<uc-latex-view class="lh-option-text" v-html="option.text" />
								</div>
							</label>
						</div>
					</div>

					<!-- Ordering -->
					<div v-else-if="slideData.type === 'QUIZ_ORDERING'" class="lh-ordering">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-ordering-hint">
							<span class="lh-hint-icon">💡</span>
							<span>Kéo thả để sắp xếp theo thứ tự đúng</span>
						</div>
						<div class="lh-ordering-container" ref="orderingContainer">
							<div v-for="(item, index) in userAnswers.ordering" :key="item.id" class="lh-ordering-item"
								:data-id="item.id">
								<div class="lh-ordering-handle">
									<span class="lh-ordering-number">{{ index + 1 }}</span>
									<span class="lh-drag-icon">⋮⋮</span>
								</div>
								<uc-latex-view class="lh-ordering-text" v-html="item.text" />
							</div>
						</div>
					</div>

					<!-- Matching (Ghép nối) -->
					<div v-else-if="slideData.type === 'QUIZ_MATCHING'" class="lh-matching">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-matching-hint">
							<span class="lh-hint-icon">💡</span>
							<span>Kéo thả để ghép đôi chính xác</span>
						</div>
						<div class="lh-matching-container">
							<div class="lh-matching-column lh-column-a">
								<div class="lh-column-title">Cột A</div>
								<uc-latex-view v-for="itemA in slideData.content.columnA" :key="itemA.id"
									class="lh-matching-item-a" :content="itemA.text" />

							</div>
							<div class="lh-matching-column lh-column-b">
								<div class="lh-column-title">Cột B</div>
								<div class="lh-matching-list" ref="matchingBContainer">
									<div v-for="itemB in userAnswers.matching" :key="itemB.id"
										class="lh-matching-item-b" :data-id="itemB.id">
										<span class="lh-drag-icon">⋮⋮</span>
										<uc-latex-view class="lh-matching-text" :content="itemB.text" />
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Categorize (Kéo-thả Phân loại) -->
					<div v-else-if="slideData.type === 'QUIZ_DRAG_DROP_CATEGORIZE'" class="lh-categorize">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-source-pool">
							<div class="lh-pool-title">
								<span class="lh-pool-icon">📦</span>
								<span>Kéo từ đây:</span>
							</div>
							<div class="lh-items-container" ref="sourceContainer">
								<div v-for="item in unclassifiedItems" :key="item.id" class="lh-draggable-item"
									:data-id="item.id">
									<span class="lh-item-text">{{ item.text }}</span>
								</div>
							</div>
						</div>

						<div class="lh-categories-grid">
							<div v-for="category in slideData.content.categories" :key="category.id"
								class="lh-category-box">
								<div class="lh-category-header">
									<img v-if="isImage(category.name)" :src="category.name" alt="Category"
										class="lh-category-image">
									<span v-else class="lh-category-name">{{ category.name }}</span>
								</div>
								<div class="lh-category-dropzone" :data-category-id="category.id"
									ref="categoryContainers">
									<div class="lh-dropzone-hint">Thả vào đây</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Fill in Blank -->
					<div v-else-if="slideData.type === 'QUIZ_FILL_IN_BLANK'" class="lh-fill-blank">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-fill-container">
							<template v-for="(part, index) in slideData.content.parts" :key="index">
								<span v-if="part.type === 'text'" class="lh-fill-text">{{ part.value }}</span>
								<div v-if="part.type === 'blank'" class="lh-fill-input-wrapper">
									<input type="text" v-model="userAnswers.fillInTheBlank[part.id]"
										class="lh-fill-input"
										:style="{ width: Math.max((part.size || 10) * 12, 80) + 'px' }"
										:placeholder="'___'">
								</div>
							</template>
						</div>
					</div>

					<!-- Connection (Nối đường thẳng) -->
					<div v-else-if="slideData.type === 'QUIZ_CONNECTION'" class="lh-connection">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-connection-instructions">
							<span class="lh-hint-icon">💡</span>
							<span>Bước 1: Chọn nhóm bên trái → Bước 2: Chọn mục bên phải để nối</span>
						</div>

						<div class="lh-connection-parent-container" ref="connectionParent">
							<svg class="lh-connection-lines-svg" ref="svgContainer"
								style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
								<line v-for="(line, index) in lines" :key="'line-' + index" :x1="line.x1" :y1="line.y1"
									:x2="line.x2" :y2="line.y2" :stroke="line.color" stroke-width="4"
									stroke-linecap="round" class="lh-connection-line" />
							</svg>

							<div class="lh-connection-container" ref="connectionContainer">
								<div class="lh-connection-column lh-groups-column">
									<div class="lh-connection-header">
										<span class="lh-connection-icon">🏷️</span>
										<span>Nhóm</span>
									</div>
									<div class="lh-connection-items">
										<div v-for="group in slideData.content.groups" :key="'group-' + group.id"
											:id="'connect-' + group.id" class="lh-connection-item lh-connection-group"
											:class="getGroupClass(group.id)"
											:style="{ backgroundColor: groupColors[group.id] }"
											@click="selectGroup(group.id)">
											<div class="lh-group-content">
												<span class="lh-group-text">{{ group.text }}</span>
												<span v-if="userAnswers.connection.activeGroup === group.id"
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
										<div v-for="item in slideData.content.items" :key="'item-' + item.id"
											:id="'connect-' + item.id"
											class="lh-connection-item lh-connection-item-target"
											:class="getItemClass(item.id)" @click="selectItem(item.id)">
											<div class="lh-item-content">
												<span class="lh-item-text">{{ item.text }}</span>
												<span v-if="getConnectionForItem(item.id)"
													class="lh-connected-indicator">🔗</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div v-if="userAnswers.connection.activeGroup" class="lh-connection-status">
							<span class="lh-status-icon">👉</span>
							<span>Đã chọn nhóm: <strong>{{ getGroupText(userAnswers.connection.activeGroup) }}</strong>
								- Giờ hãy chọn mục để nối!</span>
						</div>
					</div>

					<!-- QUIZ_TRUE_FALSE -->
					<div v-else-if="slideData.type === 'QUIZ_TRUE_FALSE'" class="lh-single-choice">
						<!-- <div class="lh-question-prompt" v-html="slideData.content.prompt"></div> -->
						<uc-latex-view class="lh-question-prompt" v-html="slideData.content.prompt" />
						<div class="lh-options-grid"
							style="grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));">
							<label v-for="option in slideData.content.options" :key="option.id" class="lh-option-card"
								:class="[getOptionClass(option.id), { 'lh-selected': userAnswers.singleChoice === option.id }]">
								<v-select placeholder="Đúng/Sai..."
									:items="[{title: '✅ Đúng', value : true}, {title: '❌ Sai', value: false}]"
									item-title='title' item-value='value'
									@update:modelValue="(val) => {if(val) {option._correctAnswer = true; option._inCorrectAnswer = false }else{option._correctAnswer = false; option._inCorrectAnswer = true}}"
									:bg-color="option._correctAnswer == true ? 'success' : (option._correctAnswer === false ? 'error': 'white' )"
									style="min-width:150px" />
								<div class="lh-option-content">
									<uc-latex-view class="lh-option-text" v-html="option.text" />
								</div>
							</label>
						</div>
					</div>
				</div>
			</div>

			<!-- ==================== SLIDE VIEWER (PDF, Office, etc.) ==================== -->
			<div v-else-if="slideData.type === 'SLIDE' && slideData.content?.slideType">

				<!-- 1. Render PDF Reader -->
				<div v-if="slideData.content.slideType === 'PDF'" class="lh-pdf-book-container">
					<!-- <uc-pdf-book-reader :pdf-url="slideData.content.url"
						:initial-page="slideData.content.progress?.currentPage || 1" @page-changed="onPDFPageChanged" /> -->
					<uc-office-reader :file-url="slideData.content.url" />
				</div>
				<!-- 2. Render Office Reader -->
				<div v-else-if="slideData.content.slideType === 'DOCX'" class="lh-pdf-book-container">
					<uc-office-reader :file-url="slideData.content.url" />
				</div>
				<div v-else-if="slideData.content.slideType === 'PPT'" class="lh-pdf-book-container">
					<uc-office-reader :file-url="slideData.content.url" />
				</div>

				<!-- 3. Fallback cho loại slide chưa được hỗ trợ -->
				<div v-else class="unsupported-slide">
					<p>Loại slide <strong>"{{ slideData.content.slideType }}"</strong> chưa được hỗ trợ xem trước.</p>
				</div>

			</div>

			<!-- Other content types -->
			<div v-else-if="slideData.type === 'RawHTML'" class="lh-raw-html" v-html="slideData.content"></div>

			<!-- Unsupported type -->
			<div v-else class="lh-unsupported">
				<div class="lh-unsupported-icon">❓</div>
				<p class="lh-unsupported-text">Loại hoạt động <strong>{{ slideData.type }}</strong> chưa được hỗ trợ.
				</p>
			</div>

			<!-- Explanation Block -->
			<div v-if="showExplanation && slideData.content.explanation" class="lh-explanation-block">
				<div class="lh-explanation-header">
					<span class="lh-explanation-icon">💡</span>
					<span class="lh-explanation-title">Hướng dẫn</span>
				</div>
				<div class="lh-explanation-content" v-html="slideData.content.explanation"></div>
			</div>

			<!-- Floating Action Buttons cho Single Slides -->
			<div v-if="isQuiz && slideData.type !== 'QUIZ_COMPOSITE'" class="lh-floating-actions">
				<button class="lh-fab lh-fab-hint" @click="showHint" :title="'Gợi ý'">
					<span class="lh-fab-icon">💡</span>
				</button>
				<button class="lh-fab lh-fab-solution" @click="showSolution" :title="'Đáp án'">
					<span class="lh-fab-icon">🔑</span>
				</button>
				<button class="lh-fab lh-fab-check" @click="checkAnswer" :title="'Kiểm tra'">
					<span class="lh-fab-icon">🎯</span>
				</button>
			</div>

			<!-- Footer Controls for Single Slides - Simplified -->
			<div v-if="!isQuiz && isSubmitted && feedbackMessage" class="lh-slide-footer">
				<div class="lh-feedback-container">
					<div v-if="isSubmitted && feedbackMessage" class="lh-feedback-block" :class="feedbackType">
						{{ feedbackMessage }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'uc-slide-viewer-v3',
	
		props: {
			slideData: { type: Object, default: () => null },
			userAnswer: { default: null }
		},
		emits: ['next', 'update:userAnswer', 'pdf-progress', 'quiz-result'], // ✅ Thêm quiz-result emit
	
		data() {
			return {
				// Single quiz states
				unclassifiedItems: [],
				isSubmitted: false,
				feedbackMessage: '',
				feedbackType: '',
				showExplanation: false,
	
				// ✅ CLEANED User answers - chỉ cho single quiz
				userAnswers: {
					singleChoice: null,
					multipleChoice: [],
					ordering: [],
					matching: [],
					fillInTheBlank: {},
					connection: {
						activeGroup: null,
						selections: []
					}
					// ❌ REMOVED: composite: {}
					// ❌ REMOVED: trueFalse: []
				},
	
				// Connection quiz specific
				lines: [],
				groupColors: {},
	
				// Sortable instances management
				sortableInstances: [],
	
				// Enhanced features
				soundEnabled: true,
				animationsEnabled: true,
				showHints: true,
	
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
				},
				isFullscreen: false,
				fullscreenContainer: null,
				originalParent: null,
				originalNextSibling: null,
	
				// ✅ Anti-recursive properties
				pdfProgressTimeout: null,
				lastProgressUpdate: 0,
				progressUpdateThrottle: 2000,
	
				iSpringLoading: true,
				isiSpringFullscreen: false
			}
		},
	
		computed: {
			embedVideoUrl() {
				if (!this.slideData || this.slideData.type !== 'VIDEO' || !this.slideData.content.url) return '';
				const urlStr = this.slideData.content.url;
				try {
					const url = new URL(urlStr);
					if (url.hostname.includes('youtube.com')) {
						const videoId = url.searchParams.get('v');
						return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
					}
					if (url.hostname === 'youtu.be') {
						const videoId = url.pathname.slice(1);
						return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
					}
				} catch (e) {
					console.warn('Invalid video URL:', urlStr);
				}
				return urlStr;
			},
	
			isQuiz() {
				return this.slideData && this.slideData.type.startsWith('QUIZ') && this.slideData.type !== 'QUIZ_COMPOSITE';
			},
	
			isPDFBookReader() {
				return this.slideData &&
					this.slideData.type === 'SLIDE' &&
					this.slideData.content?.slideType === 'PDF';
			},
	
			isRegularSlide() {
				return this.slideData &&
					this.slideData.type === 'SLIDE' &&
					this.slideData.content?.slideType !== 'PDF';
			},
	
			shouldShowControls() {
				// Ẩn controls mặc định khi dùng PDF Book Reader
				return !this.isPDFBookReader;
			}
		},
	
		watch: {
			slideData: {
				handler(newSlide) {
					if (newSlide && !this.isInitializing) {
						this.initializeSlide(newSlide);
					}
				},
				immediate: true,
				deep: false // ✅ Turn off deep watching to prevent loops
			},
	
			// Watch connection selections for line drawing  
			'userAnswers.connection.selections': {
				handler(newSelections, oldSelections) {
					console.log('Watch triggered:', newSelections);
					if (this.slideData?.type === 'QUIZ_CONNECTION') {
						this.drawLines();
					}
				},
				deep: true,
				immediate: false
			}
		},
	
		methods: {
			// ==================== INITIALIZATION ====================
			initializeSlide(slide) {
				// ✅ Prevent recursive calls
				if (this.isInitializing) return;
				this.isInitializing = true;
	
				try {
					this.resetStates();
	
					// ✅ REMOVED: Composite quiz handling (now handled by separate component)
	
					// Handle PDF Book Reader
					if (slide.type === 'SLIDE' && slide.content?.slideType === 'PDF') {
						this.initializePDFBookSafe(slide);
						return;
					}
	
					// Initialize regular quiz answers
					this.initializeUserAnswers();
	
					// Setup specific quiz types
					this.setupQuizType(slide);
				} finally {
					// ✅ Reset flag after initialization
					setTimeout(() => {
						this.isInitializing = false;
					}, 100);
				}
			},
	
			resetStates() {
				this.isSubmitted = false;
				this.feedbackMessage = '';
				this.feedbackType = '';
				this.showExplanation = false;
				this.lines = [];
				this.unclassifiedItems = [];
	
				// Clear PDF progress timeout
				if (this.pdfProgressTimeout) {
					clearTimeout(this.pdfProgressTimeout);
					this.pdfProgressTimeout = null;
				}
	
				// Destroy sortable instances
				this.destroySortableInstances();
			},
	
			// ✅ CLEANED: Only for single quiz
			initializeUserAnswers() {
				this.userAnswers = {
					singleChoice: null,
					multipleChoice: [],
					ordering: [],
					matching: [],
					fillInTheBlank: {},
					connection: {
						activeGroup: null,
						selections: []
					}
					// ❌ REMOVED: composite: {}
					// ❌ REMOVED: trueFalse: []
				};
			},
	
			setupQuizType(slide) {
				if (slide.type === 'QUIZ_ORDERING' && slide.content?.items) {
					this.userAnswers.ordering = this.shuffleArray([...slide.content.items]);
					Vue.nextTick(() => this.initSortableOrdering());
				}
				else if (slide.type === 'QUIZ_DRAG_DROP_CATEGORIZE' && slide.content?.items) {
					this.unclassifiedItems = this.shuffleArray([...slide.content.items]);
					Vue.nextTick(() => this.initSortableCategorize());
				}
				else if (slide.type === 'QUIZ_MATCHING' && slide.content?.columnB) {
					this.userAnswers.matching = this.shuffleArray([...slide.content.columnB]);
					Vue.nextTick(() => this.initSortableMatching());
				}
				else if (slide.type === 'QUIZ_FILL_IN_BLANK' && slide.content?.parts) {
					slide.content.parts.forEach(part => {
						if (part.type === 'blank') {
							this.userAnswers.fillInTheBlank[part.id] = '';
						}
					});
				}
				else if (slide.type === 'QUIZ_CONNECTION' && slide.content?.groups) {
					this.generateGroupColors(slide.content.groups);
					// Setup initial drawing after DOM is ready
					Vue.nextTick(() => {
						setTimeout(() => {
							this.drawLines();
						}, 200);
					});
				}
			},
	
			// ==================== PDF BOOK METHODS (SAFE VERSION) ====================
			initializePDFBookSafe(slide) {
				console.log('Initializing PDF Book:', slide.content?.title || 'Unknown');
	
				// ✅ Initialize progress WITHOUT reactive assignment to prevent loops
				if (!slide.content.progress) {
					// Use Object.defineProperty to make it non-reactive
					Object.defineProperty(slide.content, 'progress', {
						value: {
							currentPage: 1,
							totalPages: 0,
							viewedPages: [],
							lastViewed: new Date().toISOString()
						},
						writable: true,
						enumerable: true,
						configurable: true
					});
				}
	
				// Load saved progress ONCE without triggering watchers
				this.loadPDFProgressOnce(slide);
			},
	
			loadPDFProgressOnce(slide) {
				if (!slide?.id) return;
	
				try {
					const progressKey = `pdf_progress_${slide.id}`;
					const saved = localStorage.getItem(progressKey);
	
					if (saved) {
						const progress = JSON.parse(saved);
	
						// ✅ Use direct assignment without Vue reactivity
						Object.assign(slide.content.progress, progress);
					}
				} catch (error) {
					console.warn('Cannot load PDF progress from localStorage:', error);
				}
			},
	
			onPDFPageChanged(pageData) {
				console.log(`PDF Book page changed: ${pageData.page}/${pageData.total}`);
	
				// ✅ Throttle updates to prevent recursive loops
				const now = Date.now();
				if (now - this.lastProgressUpdate < this.progressUpdateThrottle) {
					console.log('Progress update throttled');
					return;
				}
	
				this.lastProgressUpdate = now;
	
				// ✅ Use timeout to defer the update
				if (this.pdfProgressTimeout) {
					clearTimeout(this.pdfProgressTimeout);
				}
	
				this.pdfProgressTimeout = setTimeout(() => {
					this.updatePDFProgressSafe(pageData);
					this.emitPDFProgressSafe(pageData);
					this.playSound('navigate');
				}, 100);
			},
	
			updatePDFProgressSafe(pageData) {
				if (!this.slideData?.content?.progress) return;
	
				try {
					// ✅ Direct property updates to avoid Vue reactivity
					this.slideData.content.progress.currentPage = pageData.page;
					this.slideData.content.progress.totalPages = pageData.total;
					this.slideData.content.progress.lastViewed = new Date().toISOString();
	
					// Update viewed pages array safely
					const viewedPages = this.slideData.content.progress.viewedPages || [];
					if (!viewedPages.includes(pageData.page)) {
						viewedPages.push(pageData.page);
					}
	
					// Save to localStorage
					this.savePDFProgressSafe(pageData, viewedPages);
	
				} catch (error) {
					console.warn('Error updating PDF progress:', error);
				}
			},
	
			emitPDFProgressSafe(pageData) {
				try {
					this.$emit('pdf-progress', {
						slideId: this.slideData?.id,
						currentPage: pageData.page,
						totalPages: pageData.total,
						timestamp: new Date().toISOString(),
						completionPercentage: Math.round((pageData.page / pageData.total) * 100)
					});
				} catch (error) {
					console.warn('Error emitting PDF progress:', error);
				}
			},
	
			savePDFProgressSafe(pageData, viewedPages) {
				if (!this.slideData?.id) return;
	
				try {
					const progressKey = `pdf_progress_${this.slideData.id}`;
					const progress = {
						currentPage: pageData.page,
						totalPages: pageData.total,
						lastViewed: new Date().toISOString(),
						completionPercentage: Math.round((pageData.page / pageData.total) * 100),
						viewedPages: viewedPages || []
					};
	
					localStorage.setItem(progressKey, JSON.stringify(progress));
				} catch (error) {
					console.warn('Cannot save PDF progress to localStorage:', error);
				}
			},
	
			onSlidePageChanged(pageData) {
				console.log(`Regular slide page changed: ${pageData.page}/${pageData.total}`);
				this.trackSlideProgressSafe(pageData);
				this.$emit('slide-progress', pageData);
				this.playSound('navigate');
			},
	
			trackSlideProgressSafe(pageData) {
				if (this.slideData?.content) {
					if (!this.slideData.content.progress) {
						this.slideData.content.progress = {};
					}
	
					// Direct assignment without reactive triggering
					this.slideData.content.progress.currentPage = pageData.page;
					this.slideData.content.progress.lastViewed = new Date().toISOString();
				}
			},
	
			isPDFBookSlide() {
				return this.slideData &&
					this.slideData.type === 'SLIDE' &&
					this.slideData.content?.slideType === 'PDF';
			},
	
			// ==================== SORTABLE METHODS FOR SINGLE QUIZ ====================
			// ✅ GIỮ LẠI: Cần cho composite quiz (với questionId parameter)
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
	
			// ✅ GIỮ LẠI: Cần cho composite quiz (với questionId parameter)
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
	
			// ✅ FIXED: Sử dụng slideData.content thay vì this.currentQuestion
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
	
				// ✅ FIXED: Lấy categories từ slideData.content
				if (this.slideData?.content?.categories) {
					this.slideData.content.categories.forEach(category => {
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
	
			// ==================== SINGLE QUIZ SORTABLE METHODS ====================
			shuffleArray(array) {
				const newArray = [...array];
				for (let i = newArray.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
				}
				return newArray;
			},
	
			initSortableOrdering() {
				this.destroySortableInstances();
				if (this.$refs.orderingContainer) {
					const instance = new Sortable(this.$refs.orderingContainer, {
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						chosenClass: 'lh-sortable-chosen',
						dragClass: 'lh-sortable-drag',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(instance);
				}
			},
	
			initSortableCategorize() {
				this.destroySortableInstances();
				if (this.$refs.sourceContainer) {
					const sourceInstance = new Sortable(this.$refs.sourceContainer, {
						group: 'categorize-group',
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(sourceInstance);
				}
				if (this.$refs.categoryContainers) {
					this.$refs.categoryContainers.forEach(container => {
						const instance = new Sortable(container, {
							group: 'categorize-group',
							animation: 200,
							ghostClass: 'lh-sortable-ghost',
							onEnd: () => this.playSound('drop')
						});
						this.sortableInstances.push(instance);
					});
				}
			},
	
			initSortableMatching() {
				this.destroySortableInstances();
				if (this.$refs.matchingBContainer) {
					const instance = new Sortable(this.$refs.matchingBContainer, {
						animation: 200,
						ghostClass: 'lh-sortable-ghost',
						onEnd: () => this.playSound('drop')
					});
					this.sortableInstances.push(instance);
				}
			},
	
			// ==================== SINGLE QUIZ CHECKING ====================
			checkAnswer() {
				if (!this.isQuiz || !this.slideData.content) return;
	
				let isCorrect = false;
				const content = this.slideData.content;
				const userAnswers = this.userAnswers;
	
				console.log('Checking answer for quiz type:', this.slideData.type);
				console.log('User answers:', userAnswers);
				console.log('Correct data:', content);
	
				if (this.slideData.type === 'QUIZ_SINGLE_CHOICE') {
					if (userAnswers.singleChoice === null || userAnswers.singleChoice === undefined) {
						this.showToast('Vui lòng chọn một đáp án.', 'warning');
						return;
					}
					const userChoice = String(userAnswers.singleChoice);
					const correctChoice = String(content.correctAnswer);
					isCorrect = userChoice === correctChoice;
					console.log('Single Choice - User:', userChoice, 'Correct:', correctChoice, 'Result:', isCorrect);
	
				} else if (this.slideData.type === 'QUIZ_MULTIPLE_CHOICE') {
					const userAnswer = userAnswers.multipleChoice;
	
					if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
						this.showToast('Vui lòng chọn ít nhất một đáp án.', 'warning');
						return;
					}
	
					const correctAnswers = Array.isArray(content.correctAnswers) ? content.correctAnswers : [];
					const userAnswerSorted = [...userAnswer].map(String).sort();
					const correctAnswerSorted = [...correctAnswers].map(String).sort();
					isCorrect = JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted);
					console.log('Multiple Choice - User:', userAnswerSorted, 'Correct:', correctAnswerSorted, 'Result:', isCorrect);
	
				} else if (this.slideData.type === 'QUIZ_ORDERING') {
					if (!this.$refs.orderingContainer) {
						console.warn('Ordering container not found');
						return;
					}
					const userOrderIds = Array.from(this.$refs.orderingContainer.children).map(el => String(el.dataset.id));
					const correctOrderIds = content.items.map(item => String(item.id));
					isCorrect = JSON.stringify(userOrderIds) === JSON.stringify(correctOrderIds);
					console.log('Ordering - User:', userOrderIds, 'Correct:', correctOrderIds, 'Result:', isCorrect);
	
				} else if (this.slideData.type === 'QUIZ_DRAG_DROP_CATEGORIZE') {
					console.log('=== CATEGORIZE DEBUG START ===');
	
					// Kiểm tra refs
					if (!this.$refs.sourceContainer || !this.$refs.categoryContainers) {
						console.warn('Categorize containers not found');
						console.log('sourceContainer:', this.$refs.sourceContainer);
						console.log('categoryContainers:', this.$refs.categoryContainers);
						return;
					}
	
					let allCorrect = true;
	
					// 1. Kiểm tra không còn item nào trong source
					const unclassifiedItems = Array.from(this.$refs.sourceContainer.children);
					console.log('Items still in source:', unclassifiedItems.length);
	
					if (unclassifiedItems.length > 0) {
						this.showToast('Vui lòng phân loại hết tất cả các từ.', 'warning');
						return;
					}
	
					// 2. Kiểm tra từng category
					const categoryResults = {};
	
					this.$refs.categoryContainers.forEach(container => {
						const categoryId = String(container.dataset.categoryId);
						const droppedItemIds = Array.from(container.children)
							.filter(child => !child.classList.contains('lh-dropzone-hint')) // Loại bỏ hint element
							.map(el => String(el.dataset.id))
							.filter(id => id && id !== 'undefined'); // Loại bỏ undefined
	
						const correctItemIds = this.slideData.content.items
							.filter(item => String(item.categoryId) === categoryId)
							.map(item => String(item.id));
	
						// Sort để so sánh chính xác
						const droppedSorted = [...droppedItemIds].sort();
						const correctSorted = [...correctItemIds].sort();
	
						const isMatch = JSON.stringify(droppedSorted) === JSON.stringify(correctSorted);
	
						categoryResults[categoryId] = {
							dropped: droppedSorted,
							correct: correctSorted,
							isMatch: isMatch
						};
	
						console.log(`Category ${categoryId}:`, categoryResults[categoryId]);
	
						if (!isMatch) {
							allCorrect = false;
						}
					});
	
					console.log('=== FINAL RESULT ===');
					console.log('All categories correct:', allCorrect);
					console.log('Category details:', categoryResults);
					console.log('=== CATEGORIZE DEBUG END ===');
	
					isCorrect = allCorrect;
	
				} else if (this.slideData.type === 'QUIZ_MATCHING') {
					if (!this.$refs.matchingBContainer) {
						console.warn('Matching container not found');
						return;
					}
	
					let allCorrect = true;
					const userOrderB_Ids = Array.from(this.$refs.matchingBContainer.children).map(el => String(el.dataset.id));
	
					console.log('userOrderB_Ids', userOrderB_Ids)
					console.log('content.correctPairs', content.correctPairs.length)
					if (userOrderB_Ids.length !== content.correctPairs.length) {
						console.log(1)
						allCorrect = false;
					} else {
						content.correctPairs.forEach((pair, index) => {
							if (String(userOrderB_Ids[index]) !== String(pair.to)) {
								allCorrect = false;
							}
						});
						console.log(2)
					}
					isCorrect = allCorrect;
					console.log('Matching - User order:', userOrderB_Ids, 'Correct pairs:', content.correctPairs, 'Result:', isCorrect);
	
				} else if (this.slideData.type === 'QUIZ_FILL_IN_BLANK') {
					let allCorrect = true;
					content.parts.forEach(part => {
						if (part.type === 'blank') {
							const userAnswer = (userAnswers.fillInTheBlank[part.id] || '').toLowerCase().trim();
							const correctAnswer = (part.correctAnswer || '').toLowerCase().trim();
							console.log(`Fill blank ${part.id} - User: "${userAnswer}", Correct: "${correctAnswer}"`);
							if (userAnswer !== correctAnswer) {
								allCorrect = false;
							}
						}
					});
					isCorrect = allCorrect;
	
				} else if (this.slideData.type === 'QUIZ_CONNECTION') {
					let correctCount = 0;
					const userSelectionsMap = new Map(this.userAnswers.connection.selections.map(s => [String(s.to), String(s.from)]));
	
					this.slideData.content.items.forEach(item => {
						const userGroup = userSelectionsMap.get(String(item.id));
						const correctGroup = String(item.groupId);
						console.log(`Connection item ${item.id} - User group: ${userGroup}, Correct group: ${correctGroup}`);
						if (userGroup === correctGroup) {
							correctCount++;
						}
					});
					isCorrect = correctCount === this.slideData.content.items.length;
					console.log('Connection - Correct count:', correctCount, 'Total items:', this.slideData.content.items.length, 'Result:', isCorrect);
	
				} else if (this.slideData.type === 'QUIZ_TRUE_FALSE') {
					const userAnswer = this.slideData.content.options;
					let flag = false
					for (var item of userAnswer) {
						// User trả lời đáp án đúng
						if (item.correctAnswer === item._correctAnswer && item.inCorrectAnswer === item._inCorrectAnswer) {
							console.log(1)
							flag = true
						} else {
							console.log(2)
							flag = false
							break
						}
					}
					isCorrect = flag
				}
	
				// Show explanation and feedback
				if (this.slideData.content.explanation) {
					this.showExplanation = true;
				}
	
				// Play sound
				this.playSound(isCorrect ? 'correct' : 'wrong');
	
				if (isCorrect) {
					this.showToast('🎉 Chính xác rồi! Em làm rất tốt!', 'success');
				} else {
					this.showToast('😅 Chưa đúng rồi. Em hãy xem lại nhé!', 'error');
				}
	
				this.isSubmitted = true;
			},
	
			showHint() {
				if (this.slideData.content.explanation) {
					this.showExplanation = true;
					this.showToast('💡 Xem phần hướng dẫn bên dưới nhé!', 'info');
				} else {
					this.showToast('❓ Câu hỏi này không có gợi ý.', 'info');
				}
			},
	
			showSolution() {
				this.showToast('🔑 Tính năng xem đáp án đang được phát triển.', 'info');
				console.log('Show solution for:', this.slideData.type);
			},
	
			getOptionClass(optionId) {
				if (!this.isSubmitted || !this.slideData || !this.slideData.content) {
					return '';
				}
	
				const content = this.slideData.content;
	
				if (this.slideData.type === 'QUIZ_SINGLE_CHOICE') {
					const isCorrectAnswer = String(optionId) === String(content.correctAnswer);
					const isSelectedAnswer = String(optionId) === String(this.userAnswers.singleChoice);
					if (isCorrectAnswer) return 'lh-correct-answer';
					if (isSelectedAnswer && !isCorrectAnswer) return 'lh-wrong-answer';
				}
				else if (this.slideData.type === 'QUIZ_MULTIPLE_CHOICE') {
					const correctAnswers = Array.isArray(content.correctAnswers) ? content.correctAnswers : [];
					const isCorrect = correctAnswers.map(String).includes(String(optionId));
					const isSelected = this.userAnswers.multipleChoice.map(String).includes(String(optionId));
					if (isCorrect) return 'lh-correct-answer';
					if (isSelected && !isCorrect) return 'lh-wrong-answer';
				}
	
				return 'lh-not-selected';
			},
	
			// ==================== CONNECTION QUIZ METHODS ====================
			generateGroupColors(groups) {
				const presetColors = [
					'#FF6B6B', '#4DD0E1', '#FFD93D',
					'#6BCB77', '#FF9F1C', '#C084FC',
					'#38BDF8', '#F472B6', '#FBBF24', '#34D399'
				];
				let i = 0;
				groups.forEach(group => {
					this.groupColors[group.id] = presetColors[i % presetColors.length];
					i++;
				});
			},
	
			selectGroup(groupId) {
				this.userAnswers.connection.activeGroup = groupId;
				this.playSound('navigate');
			},
	
			selectItem(itemId) {
				const activeGroup = this.userAnswers.connection.activeGroup;
				if (!activeGroup) {
					this.showToast("Vui lòng chọn một mục ở cột trái trước.", 'warning');
					return;
				}
	
				console.log('Connecting:', activeGroup, 'to', itemId);
	
				// Remove old connection for this item
				this.userAnswers.connection.selections = this.userAnswers.connection.selections
					.filter(sel => sel.to !== itemId);
	
				// Add new connection
				this.userAnswers.connection.selections.push({ from: activeGroup, to: itemId });
	
				console.log('Current selections:', this.userAnswers.connection.selections);
	
				this.playSound('drop');
	
				// Force trigger watch by creating new array reference
				this.userAnswers.connection.selections = [...this.userAnswers.connection.selections];
			},
	
			drawLines() {
				if (this.slideData?.type !== 'QUIZ_CONNECTION') return;
				if (!this.userAnswers.connection.selections.length) {
					this.lines = [];
					return;
				}
	
				// Wait for DOM update and ensure elements are ready
				this.$nextTick(() => {
					setTimeout(() => {
						const containerEl = this.$refs.connectionContainer;
						const parentEl = this.$refs.connectionParent;
	
						if (!containerEl || !parentEl) {
							console.warn('Connection refs not found');
							return;
						}
	
						const parentRect = parentEl.getBoundingClientRect();
						const newLines = [];
	
						console.log('Drawing lines for selections:', this.userAnswers.connection.selections);
	
						this.userAnswers.connection.selections.forEach((selection, index) => {
							const fromEl = document.getElementById('connect-' + selection.from);
							const toEl = document.getElementById('connect-' + selection.to);
	
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
									color: this.groupColors[selection.from] || '#4CAF50'
								};
	
								console.log(`Line ${index}:`, line);
								newLines.push(line);
							} else {
								console.warn(`Elements not found for selection:`, selection);
							}
						});
	
						// Force reactivity update
						this.lines = [...newLines];
						console.log('Lines updated:', this.lines.length);
					}, 100);
				});
			},
	
			getItemClass(itemId) {
				const matches = this.userAnswers.connection.selections.filter(s => s.to === itemId);
				return matches.length > 0 ? 'lh-connected' : '';
			},
	
			getGroupClass(groupId) {
				const isActive = this.userAnswers.connection.activeGroup === groupId;
				const hasConnection = this.userAnswers.connection.selections.find(s => s.from === groupId);
				return {
					'lh-active': isActive,
					'lh-connected': hasConnection
				};
			},
	
			getConnectionForItem(itemId) {
				return this.userAnswers.connection.selections.find(s => s.to === itemId);
			},
	
			getGroupText(groupId) {
				const group = this.slideData?.content?.groups?.find(g => g.id === groupId);
				return group ? group.text : '';
			},
	
			// ==================== UTILITY METHODS ====================
			getQuestionTypeLabel(type) {
				return this.questionTypeLabels[type] || type;
			},
	
			isImage(value) {
				if (!value) return false;
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
				return /^https?:\/\//.test(value) && imageExtensions.some(ext => value.toLowerCase().endsWith(ext));
			},
	
			playSound(type) {
				if (!this.soundEnabled) return;
	
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
					console.log(`[${type.toUpperCase()}] ${message}`);
				}
			},
	
			// ==================== FULLSCREEN METHODS ====================
			toggleFullscreen() {
				if (this.isFullscreen) {
					this.exitFullscreen();
				} else {
					this.enterFullscreen();
				}
			},
	
			enterFullscreen() {
				const container = this.$el.querySelector('.lh-iframe-container');
				if (!container) return;
	
				// Lưu vị trí gốc
				this.originalParent = container.parentNode;
				this.originalNextSibling = container.nextSibling;
	
				// Thêm class fullscreen
				container.classList.add('lh-fullscreen');
	
				// Di chuyển container ra body
				document.body.appendChild(container);
	
				// Update state
				this.isFullscreen = true;
				this.fullscreenContainer = container;
	
				// Add keyboard listener
				document.addEventListener('keydown', this.handleFullscreenKeydown);
	
				// Prevent body scroll
				document.body.style.overflow = 'hidden';
	
				// Optional: Add overlay
				this.addFullscreenOverlay();
	
				// Play sound
				this.playSound('fullscreen-enter');
	
				// Announce to screen readers
				this.announceFullscreen('Đã vào chế độ toàn màn hình');
			},
	
			exitFullscreen() {
				if (!this.fullscreenContainer || !this.isFullscreen) return;
	
				const container = this.fullscreenContainer;
	
				// Add exit animation
				container.classList.add('lh-fullscreen-exit');
	
				setTimeout(() => {
					// Remove fullscreen classes
					container.classList.remove('lh-fullscreen', 'lh-fullscreen-exit');
	
					// Move back to original position
					if (this.originalNextSibling) {
						this.originalParent.insertBefore(container, this.originalNextSibling);
					} else {
						this.originalParent.appendChild(container);
					}
	
					// Update state
					this.isFullscreen = false;
					this.fullscreenContainer = null;
	
					// Remove keyboard listener
					document.removeEventListener('keydown', this.handleFullscreenKeydown);
	
					// Restore body scroll
					document.body.style.overflow = '';
	
					// Remove overlay
					this.removeFullscreenOverlay();
	
					// Play sound
					this.playSound('fullscreen-exit');
	
					// Announce to screen readers
					this.announceFullscreen('Đã thoát chế độ toàn màn hình');
				}, 100);
			},
	
			handleFullscreenKeydown(event) {
				if (event.key === 'Escape') {
					event.preventDefault();
					this.exitFullscreen();
				} else if (event.key === 'F11') {
					event.preventDefault();
					// Optional: Handle browser fullscreen
					this.toggleBrowserFullscreen();
				}
			},
	
			addFullscreenOverlay() {
				const overlay = document.createElement('div');
				overlay.className = 'lh-fullscreen-overlay';
				overlay.id = 'lh-fullscreen-overlay';
	
				// Click overlay to exit
				overlay.addEventListener('click', this.exitFullscreen);
	
				document.body.appendChild(overlay);
			},
	
			removeFullscreenOverlay() {
				const overlay = document.getElementById('lh-fullscreen-overlay');
				if (overlay) {
					overlay.remove();
				}
			},
	
			async toggleBrowserFullscreen() {
				try {
					if (!document.fullscreenElement) {
						await this.fullscreenContainer.requestFullscreen();
					} else {
						await document.exitFullscreen();
					}
				} catch (error) {
					console.warn('Fullscreen API not supported:', error);
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
	
			// ==================== ISPRING METHODS ====================
			oniSpringLoad() {
				console.log('✅ iSpring content loaded');
				this.iSpringLoading = false;
				this.playSound('success');
			},
	
			oniSpringError() {
				console.error('❌ iSpring content failed to load');
				this.iSpringLoading = false;
				this.showToast('Không thể tải nội dung iSpring', 'error');
			},
	
			retryiSpringLoad() {
				this.iSpringLoading = true;
				const iframe = this.$refs.iSpringContentIframe;
				if (iframe) {
					iframe.src = iframe.src; // Force reload
				}
			},
	
			openiSpringExternal() {
				if (this.slideData?.content?.iSpringURL) {
					window.open(this.slideData.content.iSpringURL, '_blank');
					this.playSound('navigate');
				}
			},
	
			toggleiSpringFullscreen() {
				const container = this.$refs.iSpringContentIframe?.parentElement;
				if (!container) return;
	
				if (this.isiSpringFullscreen) {
					this.exitiSpringFullscreen();
				} else {
					this.enteriSpringFullscreen();
				}
			},
	
			enteriSpringFullscreen() {
				const container = this.$refs.iSpringContentIframe?.parentElement;
				if (!container) return;
	
				container.classList.add('lh-fullscreen');
				this.isiSpringFullscreen = true;
				document.body.style.overflow = 'hidden';
	
				// ESC key listener
				document.addEventListener('keydown', this.handleiSpringEscape);
				this.playSound('fullscreen-enter');
			},
	
			exitiSpringFullscreen() {
				const container = this.$refs.iSpringContentIframe?.parentElement;
				if (!container) return;
	
				container.classList.remove('lh-fullscreen');
				this.isiSpringFullscreen = false;
				document.body.style.overflow = '';
	
				document.removeEventListener('keydown', this.handleiSpringEscape);
				this.playSound('fullscreen-exit');
			},
	
			handleiSpringEscape(event) {
				if (event.key === 'Escape') {
					event.preventDefault();
					this.exitiSpringFullscreen();
				}
			},
	
			// ==================== QUIZ COMPOSITE EVENT HANDLER ====================
			// ✅ THÊM METHOD MỚI để xử lý kết quả từ uc-quiz-composite
			onQuizCompleted(result) {
				console.log('Quiz completed:', result);
				// Xử lý kết quả quiz tại đây
				// Ví dụ: emit lên parent, save vào database, etc.
				this.$emit('quiz-result', {
					slideId: this.slideData?.id,
					result: result,
					timestamp: new Date().toISOString()
				});
			}
		},
	
		mounted() {
			// Add window resize listener for connection quiz
			this.resizeHandler = () => {
				if (this.slideData?.type === 'QUIZ_CONNECTION') {
					setTimeout(() => {
						this.drawLines();
					}, 100);
				}
			};
			window.addEventListener('resize', this.resizeHandler);
	
			// Listen for browser fullscreen changes
			document.addEventListener('fullscreenchange', () => {
				if (!document.fullscreenElement && this.isFullscreen) {
					// Browser exited fullscreen, sync our state
					this.exitFullscreen();
				}
			});
	
			// Handle page visibility change
			document.addEventListener('visibilitychange', () => {
				if (document.hidden && this.isFullscreen) {
					// Page hidden, exit fullscreen for better UX
					this.exitFullscreen();
				}
			});
		},
	
		beforeDestroy() {
			// ✅ Clean up PDF progress timeout
			if (this.pdfProgressTimeout) {
				clearTimeout(this.pdfProgressTimeout);
			}
	
			// Clean up sortable instances
			this.destroySortableInstances();
	
			// Clean up resize listener
			if (this.resizeHandler) {
				window.removeEventListener('resize', this.resizeHandler);
			}
	
			// Cleanup fullscreen
			if (this.isFullscreen) {
				this.exitFullscreen();
			}
	
			// Remove event listeners
			document.removeEventListener('keydown', this.handleFullscreenKeydown);
			document.removeEventListener('keydown', this.handleiSpringEscape);
			this.removeFullscreenOverlay();
	
			// Restore body scroll
			document.body.style.overflow = '';
		}
	}
</script>