<template>
	<div v-if="slideData && slideData.content" class="slide-viewer">
		<!-- Reading / HTML -->
		<div v-if="['HTML', 'READING', 'ReadingWithImage'].includes(slideData.type)">
			<h1 v-if="slideData.content.title" class="slide-title text-center mb-4">
				{{ slideData.content.title }} 
			</h1>
			<p v-if="slideData.content.author" class="slide-author text-center mb-6">
				<em>{{ slideData.content.author }}</em>
			</p>
			<div class="reading-layout">
				<iframe v-if="slideData.content.htmlContent" :srcdoc="slideData.content.htmlContent"
					sandbox="allow-same-origin allow-popups allow-forms" class="reading-iframe"
					style="width: 100%; height: 500px; border: none;"></iframe>
				<img v-if="slideData.content.image" :src="slideData.content.image" class="reading-image" />
			</div>
		</div>

		<!-- VIDEO -->
		<div v-else-if="slideData.type === 'VIDEO'" class="video-container">
			<iframe :src="embedVideoUrl" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
		</div>

		<!-- SingleChoice (Chọn 1) -->
		<div v-else-if="slideData.type === 'QUIZ_SINGLE_CHOICE'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<v-radio-group v-model="userAnswers.singleChoice">
				<v-radio v-for="option in slideData.content.options" :key="option.id" :label="option.text"
					:value="option.id" class="quiz-option" :class="getOptionClass(option.id)"></v-radio>
			</v-radio-group>
		</div>

		<!-- MultipleResponse (Chọn nhiều) -->
		<div v-else-if="slideData.type === 'QUIZ_MULTIPLE_CHOICE'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<div class="multiple-response-container">
				<v-checkbox v-for="option in slideData.content.options" :key="option.id" :label="option.text"
					:value="option.id" v-model="userAnswers.multipleChoice" class="quiz-option" hide-details>
				</v-checkbox>
			</div>
		</div>

		<!-- Ordering (Kéo-thả Sắp xếp) -->
		<div v-else-if="slideData.type === 'QUIZ_ORDERING'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<div class="ordering-container" ref="orderingContainer">
				<div v-for="item in userAnswers.ordering" :key="item.id" class="ordering-item" :data-id="item.id">
					<v-icon class="mr-2" color="grey">mdi-drag-vertical</v-icon>
					{{ item.text }}
				</div>
			</div>
		</div>

		<!-- Matching (Ghép nối) -->
		<div v-else-if="slideData.type === 'QUIZ_MATCHING'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<div class="matching-container">
				<div class="matching-column-a">
					<div v-for="itemA in slideData.content.columnA" :key="itemA.id" class="matching-item-a">
						{{ itemA.text }}
					</div>
				</div>
				<div class="matching-column-b" ref="matchingBContainer">
					<div v-for="itemB in userAnswers.matching" :key="itemB.id" class="matching-item-b draggable-item"
						:data-id="itemB.id">
						<v-icon class="mr-2" color="grey-darken-1">mdi-drag-vertical</v-icon>
						{{ itemB.text }}
					</div>
				</div>
			</div>
		</div>

		<!-- Categorize (Kéo-thả Phân loại) -->
		<div v-else-if="slideData.type === 'QUIZ_DRAG_DROP_CATEGORIZE'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<div class="unclassified-pool">
				<h4>Kéo từ đây:</h4>
				<div class="items-container" ref="sourceContainer">
					<div v-for="item in unclassifiedItems" :key="item.id" class="draggable-item" :data-id="item.id">
						{{ item.text }}
					</div>
				</div>
			</div>
			<div class="categories-container">
				<div v-for="category in slideData.content.categories" :key="category.id" class="category-box">
					<!-- Kiểm tra nếu name là hình ảnh (bằng cách kiểm tra có bắt đầu bằng http và đuôi là ảnh) -->
					<div class="category-header">
						<template v-if="isImage(category.name)">
							<img :src="category.name" alt="Category Image" class="category-image" />
						</template>
						<template v-else>
							{{ category.name }}
						</template>
					</div>
					<div class="category-dropzone" :data-category-id="category.id" ref="categoryContainers"></div>
				</div>
			</div>
		</div>

		<!-- ==================== QUIZ_FILL_IN_BLANK ==================== -->
		<div v-else-if="slideData.type === 'QUIZ_FILL_IN_BLANK'">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>
			<div class="fill-in-blank-container">
				<template v-for="(part, index) in slideData.content.parts" :key="index">
					<span v-if="part.type === 'text'" class="fill-in-text">{{ part.value }}</span>

					<!-- SỬA: Dùng v-text-field thay cho input -->
					<v-text-field v-if="part.type === 'blank'" v-model="userAnswers.fillInTheBlank[part.id]"
						class="fill-in-blank-input" :style="{ width: (part.size || 10) * 15 + 'px' }"
						variant="underlined" density="compact" hide-details autofocus></v-text-field>

				</template>
			</div>
		</div>

		<!-- ==================== QUIZ_CONNECTION (Nối ý bằng đường kẻ) ==================== -->
		<div v-else-if="slideData.type === 'QUIZ_CONNECTION'" class="connection-parent-container">
			<p class="quiz-prompt" v-html="slideData.content.prompt"></p>

			<svg class="connection-lines-svg" ref="svgContainer">
				<line v-for="(line, index) in lines" :key="index" :x1="line.x1" :y1="line.y1" :x2="line.x2"
					:y2="line.y2" :stroke="line.color" stroke-width="2" />
			</svg>

			<div class="connection-container" ref="connectionContainer">
				<div class="connection-column">
					<div v-for="group in slideData.content.groups" :key="group.id" :id="'connect-' + group.id"
						class="connection-item group" :class="getGroupClass(group.id)"
						:style="{ backgroundColor: groupColors[group.id] }" @click="selectGroup(group.id)">
						{{ group.text }}
					</div>
				</div>
				<div class="connection-column">
					<div v-for="item in slideData.content.items" :key="item.id" :id="'connect-' + item.id"
						class="connection-item item" :class="getItemClass(item.id)" @click="selectItem(item.id)">
						{{ item.text }}
					</div>
				</div>
			</div>
		</div>

		<!-- RawHTML (Dự phòng) -->
		<div v-else-if="slideData.type === 'RawHTML'" v-html="slideData.content"></div>

		<!-- Các loại khác chưa hỗ trợ -->
		<div v-else-if="true">
			<p>Loại hoạt động <strong>{{ slideData.type }}</strong> chưa được hỗ trợ.</p>
			<pre>{{ slideData.content }}</pre>
		</div>

		<!-- ==================== KHỐI HƯỚNG DẪN / GIẢI THÍCH ==================== -->
		<!-- Sẽ hiển thị khi người dùng click nút "Gợi ý" hoặc sau khi "Kiểm tra" -->
		<div v-if="showExplanation && slideData.content.explanation" class="feedback-block info mt-4">
			<div class="feedback-header">
				<v-icon>mdi-information-outline</v-icon>
				<span class="font-weight-bold">Hướng dẫn làm bài</span>
			</div>
			<div class="feedback-explanation" v-html="slideData.content.explanation"></div>
		</div>
		<div class="slide-footer">

			<div class="feedback-container">
				<div v-if="isSubmitted && feedbackMessage" class="feedback-block" :class="feedbackType">
					{{ feedbackMessage }}
				</div>
			</div>
			<v-btn v-if="isQuiz" variant="text" @click="showSolution" class="action-btn">
				<v-icon start>mdi-key-chain-variant</v-icon>Đáp án
			</v-btn>
			<v-spacer></v-spacer>
			<v-btn v-if="isQuiz" color="primary" variant="flat" rounded="lg" @click="checkAnswer"
				class="action-btn check-btn">
				<v-icon start>mdi-check-bold</v-icon>Kiểm tra
			</v-btn>
			<v-btn v-else color="primary" variant="flat" @click="$emit('next')">
				Tiếp tục<v-icon end>mdi-chevron-right</v-icon>
			</v-btn>
		</div>

	</div>

</template>

<script>
	export default {
		name: 'uc-slide-viewer',
		props: ['slideData'],
		data() {
			return {
				unclassifiedItems: [],
				isSubmitted: false,
				feedbackMessage: '',
				feedbackType: '',
				showExplanation: false,
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
				},
				lines: [],
				sortableInstances: [],
				groupColors: {},
				vueData
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
						return `https://www.youtube.com/embed/${videoId}`;
					}
					if (url.hostname === 'youtu.be') {
						const videoId = url.pathname.slice(1);
						return `https://www.youtube.com/embed/${videoId}`;
					}
				} catch (e) { }
				return urlStr;
			},
			isQuiz() {
				return this.slideData && this.slideData.type.startsWith('QUIZ');
			}
		},
		watch: {
			slideData: {
				handler(newSlide) {
					if (newSlide) {
						this.initializeSlide(newSlide);
					}
				},
				immediate: true,
				deep: true
			},
			//THEO DÕI CÁC LỰA CHỌN ĐỂ VẼ LẠI ĐƯỜNG NỐI
			'userAnswers.connection.selections': {
				handler() {
					this.drawLines();
				},
				deep: true
			}
		},
	
		methods: {
			initializeSlide(slide) {
				this.isSubmitted = false;
				this.feedbackMessage = '';
				this.feedbackType = '';
				this.showExplanation = false;
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
				};
				this.lines = [];
				this.unclassifiedItems = [];
	
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
					// Khởi tạo các giá trị rỗng cho các ô trống
					slide.content.parts.forEach(part => {
						if (part.type === 'blank') {
							this.userAnswers.fillInTheBlank[part.id] = '';
						}
					});
				}
				else if (slide.type === 'QUIZ_CONNECTION' && slide.content?.groups) {
					this.generateGroupColors(slide.content.groups);
				}
			},
			shuffleArray(array) {
				for (let i = array.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[array[i], array[j]] = [array[j], array[i]];
				}
				return array;
			},
			initSortableOrdering() {
				this.sortableInstances.forEach(s => s.destroy());
				this.sortableInstances = [];
				if (this.$refs.orderingContainer) {
					const instance = new Sortable(this.$refs.orderingContainer, { animation: 150, ghostClass: 'sortable-ghost' });
					this.sortableInstances.push(instance);
				}
			},
			initSortableCategorize() {
				this.sortableInstances.forEach(s => s.destroy());
				this.sortableInstances = [];
				if (this.$refs.sourceContainer) {
					this.sortableInstances.push(new Sortable(this.$refs.sourceContainer, { group: 'categorize-group', animation: 150, ghostClass: 'sortable-ghost' }));
				}
				if (this.$refs.categoryContainers) {
					this.$refs.categoryContainers.forEach(container => {
						this.sortableInstances.push(new Sortable(container, { group: 'categorize-group', animation: 150, ghostClass: 'sortable-ghost' }));
					});
				}
			},
			initSortableMatching() {
				this.sortableInstances.forEach(s => s.destroy());
				this.sortableInstances = [];
				if (this.$refs.matchingBContainer) {
					const instance = new Sortable(this.$refs.matchingBContainer, { animation: 150, ghostClass: 'sortable-ghost' });
					this.sortableInstances.push(instance);
				}
			},
			// HÀM MỚI cho bài Nối ý
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
			},
			selectItem(itemId) {
				const activeGroup = this.userAnswers.connection.activeGroup;
				if (!activeGroup) {
				Vue.$toast?.info("Vui lòng chọn một mục ở cột trái trước.");
				return;
				}
				
				// XÓA mối nối cũ nếu item này đã được group khác nối
				this.userAnswers.connection.selections = this.userAnswers.connection.selections
				.filter(sel => sel.to !== itemId);
				
				// THÊM mối nối mới
				this.userAnswers.connection.selections.push({ from: activeGroup, to: itemId });
			},
			drawLines() {
				Vue.nextTick(() => {
					const newLines = [];
					const containerRect = this.$refs.connectionContainer?.getBoundingClientRect();
					this.userAnswers.connection.selections.forEach(selection => {
						const fromEl = document.getElementById('connect-' + selection.from);
						const toEl = document.getElementById('connect-' + selection.to);
						if (fromEl && toEl && containerRect) {
							const fromRect = fromEl.getBoundingClientRect();
							const toRect = toEl.getBoundingClientRect();
							newLines.push({
								x1: fromRect.right - containerRect.left,
								y1: fromRect.top + fromRect.height / 2 - containerRect.top,
								x2: toRect.left - containerRect.left,
								y2: toRect.top + toRect.height / 2 - containerRect.top,
								color: this.groupColors[selection.from] || 'black'
							});
						}
					});
					this.lines = newLines;
				});
			},
			getItemClass(itemId) {
				const matches = this.userAnswers.connection.selections.filter(s => s.to === itemId);
				if (matches.length > 0) return 'connected';
				return '';
			},
			getGroupClass(groupId) {
				const isActive = this.userAnswers.connection.activeGroup === groupId;
				const hasConnection = this.userAnswers.connection.selections.find(s => s.from === groupId);
				return {
					active: isActive,
					connected: hasConnection
				};
			},
			checkAnswer() {
				if (!this.isQuiz || !this.slideData.content) return;
	
				let isCorrect = false;
				const content = this.slideData.content;
				const userAnswers = this.userAnswers;
	
				// ==========================================================
				// LOGIC CHẤM ĐIỂM CHO TỪNG LOẠI QUIZ
				// ==========================================================
	
				if (this.slideData.type === 'QUIZ_SINGLE_CHOICE') {
					if (userAnswers.singleChoice === null) {
						Vue.$toast.warning("Vui lòng chọn một đáp án."); return;
					}
					isCorrect = String(userAnswers.singleChoice) === String(content.correctAnswer);
	
				} else if (this.slideData.type === 'QUIZ_MULTIPLE_CHOICE') {
					// Lấy câu trả lời của người dùng
					const userAnswer = userAnswers.multipleChoice;
	
					// Validate: Người dùng đã chọn chưa?
					if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
						Vue.$toast.warning("Vui lòng chọn ít nhất một đáp án."); return;
					}
	
					// Lấy đáp án đúng, đảm bảo nó luôn là một mảng
					const correctAnswers = Array.isArray(content.correctAnswers) ? content.correctAnswers : [];
	
					// Sắp xếp cả hai mảng để so sánh nội dung, không phụ thuộc thứ tự
					const userAnswerSorted = [...userAnswer].sort();
					const correctAnswerSorted = [...correctAnswers].sort();
	
					// So sánh bằng cách chuyển thành chuỗi JSON
					isCorrect = JSON.stringify(userAnswerSorted) === JSON.stringify(correctAnswerSorted);
	
				} else if (this.slideData.type === 'QUIZ_ORDERING') {
					// Lấy danh sách ID theo thứ tự người dùng đã kéo thả
					const userOrderIds = Array.from(this.$refs.orderingContainer.children).map(el => el.dataset.id);
					// Lấy danh sách ID theo thứ tự đúng từ dữ liệu gốc
					const correctOrderIds = content.items.map(item => item.id);
					isCorrect = JSON.stringify(userOrderIds) === JSON.stringify(correctOrderIds);
	
				} else if (this.slideData.type === 'QUIZ_DRAG_DROP_CATEGORIZE') {
					const content = this.slideData.content;
					let allCorrect = true;
	
					// Kiểm tra còn mục chưa kéo
					const unclassifiedItems = Array.from(this.$refs.sourceContainer.children);
					if (unclassifiedItems.length > 0) {
						Vue.$toast.warning("Vui lòng phân loại hết tất cả các từ.");
						return;
					}
	
					// Duyệt qua từng khu vực phân loại
					this.$refs.categoryContainers.forEach(container => {
						const categoryId = container.dataset.categoryId;
	
						// Lấy các id item người dùng đã kéo vào
						const droppedItemIds = Array.from(container.children).map(el => String(el.dataset.id));
						console.log(content.items.filter(item => String(item.categoryId) === String(categoryId)));
	
						// Đáp án đúng: các item có category == categoryId
						const correctItemIds = content.items
							.filter(item => String(item.categoryId) === String(categoryId)) // ⚠️ kiểm tra key "category"
							.map(item => String(item.id));
	
						// So sánh
						const isSame =
							JSON.stringify([...droppedItemIds].sort()) === JSON.stringify([...correctItemIds].sort());
	
						if (!isSame) {
							allCorrect = false;
						}
					});
	
					isCorrect = allCorrect;
	
				} else if (this.slideData.type === 'QUIZ_MATCHING') {
					let allCorrect = true;
					// Lấy thứ tự các item ở cột B sau khi người dùng sắp xếp
					const userOrderB_Ids = Array.from(this.$refs.matchingBContainer.children).map(el => el.dataset.id);
	
					if (userOrderB_Ids.length !== content.correctPairs.length) {
						allCorrect = false;
					} else {
						// Lặp qua các cặp đáp án đúng
						content.correctPairs.forEach((pair, index) => {
							// Tại vị trí (index) của cột A (ví dụ: "Từ đơn"),
							// item ở cột B có đúng là item mong muốn không?
							if (userOrderB_Ids[index] !== pair.to) {
								allCorrect = false;
							}
						});
					}
					isCorrect = allCorrect;
	
				} else if (this.slideData.type === 'QUIZ_FILL_IN_BLANK') {
					let allCorrect = true;
					content.parts.forEach(part => {
						if (part.type === 'blank') {
							// So sánh câu trả lời của người dùng (đã chuyển về chữ thường và bỏ dấu cách)
							const userAnswer = (userAnswers.fillInTheBlank[part.id] || '').toLowerCase().trim();
							const correctAnswer = (part.correctAnswer || '').toLowerCase().trim();
							if (userAnswer !== correctAnswer) {
								allCorrect = false;
							}
						}
					});
					isCorrect = allCorrect;
				}
				else if (this.slideData.type === 'QUIZ_CONNECTION') {
					let correctCount = 0;
					// Tạo một map từ đáp án của người dùng để tra cứu nhanh
					const userSelectionsMap = new Map(this.userAnswers.connection.selections.map(s => [s.to, s.from]));
	
					this.slideData.content.items.forEach(item => {
						if (userSelectionsMap.get(item.id) === item.groupId) {
							correctCount++;
						}
					});
					isCorrect = correctCount === this.slideData.content.items.length;
				}
	
	
				// ==========================================================
				// HIỂN THỊ GIẢI THÍCH
				// ==========================================================
				if (this.slideData.content.explanation) {
					this.showExplanation = true;
				}
	
				// 🎵 Play sound
				const sound = new Audio(isCorrect ? '/_cdn/lhbs-lms/correct.wav' : 'https://audio-previews.elements.envatousercontent.com/files/101897517/preview.mp3');
				sound.play();
				if (isCorrect) {
					Vue.$toast.success('🎉 Chính xác rồi! Em làm rất tốt!');
					return;
				} else {
					Vue.$toast.warning('😅 Chưa đúng rồi. Em hãy xem lại nhé!'); return;
				}
	
				this.isSubmitted = true;
			},
			showHint() {
				// logic hiện gợi ý
				if (this.slideData.content.explanation) {
					this.showExplanation = true;
				} else {
					Vue.$toast.info("Câu hỏi này không có gợi ý.");
				}
			},
			showSolution() {
				// logic hiện đáp án
				console.log("Show Solution called");
			},
			getOptionClass(optionId) {
				// BƯỚC KIỂM TRA QUAN TRỌNG NHẤT
				if (!this.isSubmitted || !this.slideData || !this.slideData.content) {
					return ''; // Nếu chưa nộp bài hoặc chưa có dữ liệu, không làm gì cả
				}
	
				const content = this.slideData.content;
	
				if (this.slideData.type === 'QUIZ_SINGLE_CHOICE') {
					const isCorrectAnswer = optionId === content.correctAnswer;
					const isSelectedAnswer = optionId === this.userAnswers.singleChoice;
					if (isCorrectAnswer) return 'correct-answer';
					if (isSelectedAnswer && !isCorrectAnswer) return 'wrong-answer';
				}
				else if (this.slideData.type === 'QUIZ_MULTIPLE_CHOICE') {
					// Đảm bảo correctAnswers là một mảng
					const correctAnswers = Array.isArray(content.correctAnswers) ? content.correctAnswers : [];
					const isCorrect = correctAnswers.includes(optionId);
					const isSelected = this.userAnswers.multipleChoice.includes(optionId);
					if (isCorrect) return 'correct-answer';
					if (isSelected && !isCorrect) return 'wrong-answer';
				}
	
				return 'not-selected'; // Mặc định là các lựa chọn chưa được chọn
			},
			isImage(value) {
				if (!value) return false;
				const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
				return /^https?:\/\//.test(value) && imageExtensions.some(ext => value.toLowerCase().endsWith(ext));
			}
		},
		beforeUnmount() {
			this.sortableInstances.forEach(s => s.destroy());
		}
	}
</script>
<style scoped>

</style>