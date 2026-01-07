<template>
	<div>
		<!-- Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<!-- =============== DESKTOP: 2 CỘT NGANG =============== -->
		<div v-if="!isMobile" class="d-flex ga-12 w-100 justify-center">
			<!-- CỘT A -->
			<div class="drop-zones">
				<div v-for="item in columnA" :key="item.id" class="drop-zone pa-4" @drop="onDrop($event, item)"
					@dragover.prevent @dragenter.prevent>
					<div class="d-flex flex-row">
						<div class="jigsaw2">
							<span class="r"></span>
							<span class="text">{{ item.text }}</span>
						</div>

						<!-- ĐÁP ÁN ĐÃ CHỌN – CÓ THỂ KÉO RA -->
						<div v-if="item.dropArray?.length" class="jigsaw1" :class="{
							'correct-match': showResult && isCorrectPair(item.id, item.dropArray[0].id),
							'incorrect-match': showResult && !isCorrectPair(item.id, item.dropArray[0].id)
						}" @dragstart="onDragStartFromA($event, item)" draggable="true">
							<span class="l"></span>
							<span class="text">{{ item.dropArray[0].text }}</span>
						</div>
					</div>
					<!-- <div>
						<v-icon :color=""></v-icon>
					</div> -->
				</div>
			</div>


			<!-- CỘT B -->
			<div class="drop-zones" v-if="columnB.length > 0">
				<vuedraggable v-model="columnB" item-key="id" @start="onStart" @end="endDrag" :animation="150"
					:sort="false" :disabled="readonly || isGrade || submissionstatus >= 2">
					<template #item="{ element }">
						<div class="d-flex drop-zone-columnB pa-4" @dragstart="onDragStart($event, element)">
							<div class="jigsaw1-wrapper">
								<span class="l"></span>
								<div class="jigsaw1">
									<span class="text">{{ element.text }}</span>
								</div>
							</div>
						</div>
					</template>
				</vuedraggable>
			</div>
		</div>

		<!-- =============== MOBILE: TỪNG CẶP DỌC =============== -->
		<div v-else class="mobile-pair-container">
			<div v-for="itemA in columnA" :key="itemA.id" class="mobile-pair">
				<!-- FROM (Cột A) -->
				<div class="mobile-from" @click="openMobileDialog(itemA)">
					<div class="jigsaw2">
						<span class="r"></span>
						<span class="text">{{ itemA.text }}</span>
					</div>
				</div>

				<!-- TO (Cột B) -->
				<div class="mobile-to" @click="openMobileDialog(itemA)">
					<div v-if="itemA.dropArray?.length" class="jigsaw1" :class="{
						'correct-match': showResult && isCorrectPair(itemA.id, itemA.dropArray[0].id),
						'incorrect-match': showResult && !isCorrectPair(itemA.id, itemA.dropArray[0].id)
					}">
						<span class="l"></span>
						<span class="text">{{ itemA.dropArray[0].text }}</span>
					</div>
					<div v-else class="mobile-placeholder">
						<v-icon small>mdi-plus</v-icon> Chọn đáp án
					</div>
				</div>
			</div>

			<!-- Hướng dẫn -->
			<div class="pa-4 text-center text-grey">
				<p class="text-caption">Nhấn vào ô đáp án để chọn</p>
			</div>
		</div>

		<!-- DIALOG MOBILE -->
		<v-dialog v-model="mobileDialog" max-width="400" persistent>
			<v-card>
				<v-card-title class="bg-primary text-white text-subtitle-1">
					Chọn đáp án cho: <strong class="ml-1">"{{ selectedLeftItem?.text }}"</strong>
				</v-card-title>
				<v-card-text class="pt-4">
					<v-list density="compact">
						<v-list-item v-for="item in availableRightItems" :key="item.id"
							@click="selectMobileAnswer(item)" class="border ma-1 rounded"
							:class="{ 'bg-success text-white': isSelectedInDialog(item) }">
							<v-list-item-title>{{ item.text }}</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="grey" @click="mobileDialog = false">Hủy</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- NÚT KIỂM TRA
		<div class="mt-4 d-flex justify-center ga-2" v-if="!readonly && submissionstatus < 2 && !isGrade">
			<v-btn color="primary" @click="checkAnswers" :disabled="!canCheckAnswers">
				<v-icon start>mdi-check-circle</v-icon>
				Kiểm tra đáp án
			</v-btn>
			<v-btn color="warning" variant="outlined" @click="resetAnswers">
				<v-icon start>mdi-refresh</v-icon>
				Làm lại
			</v-btn>
		</div>
		-->

		<!-- KẾT QUẢ -->
		<!-- <v-alert v-if="showResult && !isGrade" class="mt-4" :type="resultType" variant="tonal" border="start">
			<div class="d-flex align-center ga-2">
				<v-icon :icon="resultIcon" size="24"></v-icon>
				<div>
					<strong>Kết quả:</strong> {{ correctCount }}/{{ columnA.length }} câu đúng
					<div class="text-caption">
						{{ resultMessage }}
						<br>
						<strong>Điểm đạt được:</strong> {{ calculatedScore }}/{{ effectiveMaxPoints }}
						<span class="text-grey">({{ pointsPerPair }} điểm/câu)</span>
					</div>
				</div>
			</div> 
		</v-alert> -->

		<!-- Ý KIẾN HỌC SINH -->
		<div class="mt-2">
			<div class="text-end" v-if="!isGrade && submissionstatus < 2 && isShowBtnComment">
				<v-menu v-model="menu" :close-on-content-click="false" scroll-strategy="close" location="start">
					<template v-slot:activator="{ props }">
						<v-btn color="orange-darken-1" v-bind="props" icon="mdi-notebook-edit-outline" size="small"
							v-tooltip="'Ý kiến của bạn'">
						</v-btn>
					</template>
					<v-card :min-width="widthScreen < 650 ? null : 600" class="elevation-0" variant="outlined"
						color="orange">
						<v-card-title class="bg-orange-darken-1">Ý kiến của bạn</v-card-title>
						<v-list>
							<v-list-item>
								<v-textarea :model-value="grading?.comment || ''"
									@update:model-value="onStudentCommentInput" rows="2" dense hide-details
									variant="outlined" placeholder="Nhập ý kiến của bạn" />
							</v-list-item>
						</v-list>
						<v-card-actions class="border-t py-0">
							<v-spacer></v-spacer>
							<v-btn text color="orange-darken-1" @click="menu = false">Đóng</v-btn>
						</v-card-actions>
					</v-card>
				</v-menu>
			</div>
			<div v-else-if="grading?.comment" class="pa-2 rounded bg-blue-lighten-1">
				<b>
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon>
					<span v-if="$i18n.locale == 'en' && isGrade">Student's Feedback</span>
					<span v-else-if="$i18n.locale != 'en' && isGrade">Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:</span>
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- ĐIỂM -->
		<div v-if="submissionstatus == 4 || isGrade" class="mt-2">
			<strong>{{ $i18n.locale == 'en' ? 'Score' : 'Điểm' }}:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- NHẬN XÉT GV -->
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment?.length > 0" border="start"
			color="info" elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-2 qMatching-grading" v-if="isGrade">
			<v-textarea :model-value="grading?.teacherComment || ''" @update:model-value="updateTeacherComment"
				:label="$t('message.TeacherCommentOptional')" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
export default {
	name: "uc-question-matching",
	components: { vuedraggable },
	props: {
		question: { type: Object, required: true },
		answer: { default: () => [] },
		readonly: { type: Boolean, default: false },
		grading: { type: Object, default: null },
		isGrade: { type: Boolean, default: false },
		submissionstatus: { type: Number, default: -1 },
		isShowBtnComment: { type: Boolean, default: true }
	},
	emits: ["answer-change", "grading-change"],
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi';
		return {
			menu: false,
			widthScreen: null,
			isMobile: false,
			mobileDialog: false,
			selectedLeftItem: null,
			showResult: false,
			correctCount: 0,
			columnA: [],
			columnB: [],
			draggingFromA: false
		};
	},
	computed: {
		guideText() {
			return this.question?.config?.submissionNote ||
				this.question?.config?.instruction ||
				'Kéo các mục từ Cột B và thả vào vị trí tương ứng ở Cột A';
		},
		canCheckAnswers() {
			return this.columnA.every(item => item.dropArray?.length === 1);
		},
		displayScore() {
			const s = this.grading?.manualScore ?? this.grading?.autoScore ?? 0;
			return typeof s === 'number' ? s : 0;
		},
		effectiveMaxPoints() { return this.question?.points ?? 0; },
		scoreChipColor() {
			const s = this.displayScore;
			const max = this.effectiveMaxPoints;
			if (s <= 0) return 'error';
			if (max && s >= max) return 'success';
			return 'primary';
		},
		resultType() {
			const ratio = this.correctCount / this.columnA.length;
			if (ratio === 1) return 'success';
			if (ratio >= 0.5) return 'warning';
			return 'error';
		},
		resultIcon() {
			const ratio = this.correctCount / this.columnA.length;
			if (ratio === 1) return 'mdi-check-circle';
			if (ratio >= 0.5) return 'mdi-alert-circle';
			return 'mdi-close-circle';
		},
		resultMessage() {
			const ratio = this.correctCount / this.columnA.length;
			if (ratio === 1) return 'Xuất sắc! Bạn đã làm đúng tất cả.';
			if (ratio >= 0.7) return 'Tốt lắm! Còn một chút nữa thôi.';
			if (ratio >= 0.5) return 'Khá tốt! Hãy cố gắng thêm nhé.';
			return 'Hãy xem lại và thử lại nhé!';
		},
		pointsPerPair() {
			return Math.round((this.effectiveMaxPoints / this.columnA.length) * 100) / 100;
		},
		calculatedScore() {
			return Math.round((this.correctCount * this.pointsPerPair) * 100) / 100;
		},
		availableRightItems() {
			if (!this.selectedLeftItem) return [];
			const used = this.columnA
				.filter(a => a.id !== this.selectedLeftItem.id && a.dropArray?.length > 0)
				.map(a => a.dropArray[0].id);
			return this.columnB.filter(b => !used.includes(b.id));
		}
	},
	mounted() {
		if (this.submissionstatus == 4 || this.isGrade) {
			this.showResult = true
		}
		this.widthScreen = window.innerWidth;
		this.checkMobile();
		this.initializeData();
		if (this.isGrade) this.autoGrade();
		window.addEventListener('resize', this.handleResize);
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.handleResize);
	},
	watch: {
		answer: 'initializeData',
		'question.config': { handler: 'initializeData', deep: true }
	},
	methods: {
		handleResize() {
			this.widthScreen = window.innerWidth;
			this.checkMobile();
		},
		checkMobile() {
			this.isMobile = window.innerWidth <= 768;
		},
		initializeData() {
			this.columnA = (this.question?.config?.columnA || []).map(item => ({
				...item,
				dropArray: []
			}));
			this.columnB = [...(this.question?.config?.columnB || [])];
			if (this.answer?.length) this.loadAnswers();
		},
		loadAnswers() {
			if (!Array.isArray(this.answer)) return;
			const usedBIds = new Set();
			this.answer.forEach(pair => {
				const itemA = this.columnA.find(a => a.id === pair.from);
				const itemB = this.columnB.find(b => b.id === pair.to);
				if (itemA && itemB && !usedBIds.has(pair.to)) {
					itemA.dropArray = [itemB];
					usedBIds.add(pair.to);
				}
			});
			this.columnB = this.columnB.filter(b => !usedBIds.has(b.id));
		},
		// === MOBILE ===
		openMobileDialog(itemA) {
			if (this.readonly || this.isGrade || this.submissionstatus >= 2) return;
			this.selectedLeftItem = itemA;
			this.mobileDialog = true;
		},
		selectMobileAnswer(itemB) {
			const old = this.selectedLeftItem.dropArray[0];
			if (old) this.columnB.push(old);
			this.selectedLeftItem.dropArray = [itemB];
			this.columnB = this.columnB.filter(b => b.id !== itemB.id);
			this.mobileDialog = false;
			this.selectedLeftItem = null;
			this.showResult = false;
			this.emitAnswerChange();
		},
		isSelectedInDialog(itemB) {
			return this.selectedLeftItem?.dropArray[0]?.id === itemB.id;
		},
		// === DESKTOP DRAG ===
		onDragStart(e, item) {
			e.dataTransfer.setData('itemId', item.id);
			e.dataTransfer.setData('fromA', ''); // từ B
		},
		onDragStartFromA(e, targetA) {
			if (this.readonly || this.isGrade || this.submissionstatus >= 2) return;
			const itemB = targetA.dropArray[0];
			e.dataTransfer.setData('itemId', itemB.id);
			e.dataTransfer.setData('fromA', targetA.id);
			this.draggingFromA = true;
		},
		onDrop(e, targetA) {
			if (this.isMobile || this.readonly || this.isGrade || this.submissionstatus >= 2) return;
			e.preventDefault();

			const itemId = e.dataTransfer.getData('itemId');
			const fromAId = e.dataTransfer.getData('fromA');

			// Tìm item bị kéo
			let draggedItem = this.columnB.find(b => b.id === itemId);
			if (!draggedItem && fromAId) {
				const sourceA = this.columnA.find(a => a.id === fromAId);
				draggedItem = sourceA?.dropArray[0];
				if (sourceA) sourceA.dropArray = [];
			}
			if (!draggedItem) return;

			// Xử lý item cũ
			let oldItem = targetA.dropArray[0];
			if (oldItem) this.columnB.push(oldItem);

			// Gán mới
			targetA.dropArray = [draggedItem];
			this.columnB = this.columnB.filter(b => b.id !== itemId);

			this.emitAnswerChange();
			this.draggingFromA = false;
		},
		onStart() { this.showResult = false; },
		endDrag() { this.emitAnswerChange(); },
		// === CHUNG ===
		emitAnswerChange() {
			const newAnswer = this.columnA
				.filter(item => item.dropArray?.length === 1)
				.map(item => ({ from: item.id, to: item.dropArray[0].id }));
			this.$emit("answer-change", newAnswer);
		},
		checkAnswers() {
			this.correctCount = this.columnA.filter(a => a.dropArray?.length === 1 && this.isCorrectPair(a.id, a.dropArray[0].id)).length;
			this.showResult = true;
			this.$emit('grading-change', { ...this.grading, autoScore: this.calculatedScore });
		},
		resetAnswers() {
			this.columnA.forEach(itemA => {
				if (itemA.dropArray?.length > 0) {
					this.columnB.push(itemA.dropArray[0]);
					itemA.dropArray = [];
				}
			});
			this.showResult = false;
			this.emitAnswerChange();
		},
		isCorrectPair(aId, bId) {
			return this.question?.config?.correctPairs?.some(p => p.from === aId && p.to === bId) || false;
		},
		autoGrade() {
			this.correctCount = this.columnA.filter(a => a.dropArray?.length === 1 && this.isCorrectPair(a.id, a.dropArray[0].id)).length;
			this.$emit('grading-change', { ...this.grading, manualScore: this.calculatedScore });
		},
		onStudentCommentInput(val) {
			this.$emit('grading-change', { ...this.grading, comment: val });
		},
		updateTeacherComment(val) {
			this.$emit("grading-change", { ...this.grading, teacherComment: val });
		}
	}
}
</script>