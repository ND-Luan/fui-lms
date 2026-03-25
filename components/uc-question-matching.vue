<template>
	<div>
		<!-- Hướng dẫn -->
		<v-alert v-if="guideText || useTapAssignMode" class="mb-2" variant="tonal" type="info" density="comfortable"
			border="start" border-color="info">
			<div v-if="guideText"><strong>Hướng dẫn:</strong> {{ guideText }}</div>
			<div v-if="useTapAssignMode" :class="{ 'mt-1': guideText }">
				<strong>Chế độ iOS:</strong> Chạm 1 đáp án ở <strong>Cột B</strong>, rồi chạm ô <strong>Cột A</strong>
				để gán.
				Chạm vào đáp án đã gán ở <strong>Cột A</strong> để chọn, rồi chạm ô A khác để đổi hoặc bấm nút <em>Bỏ về
					Cột B</em> để hoàn trả.
			</div>
		</v-alert>

		<!-- =============== DESKTOP: 2 CỘT NGANG =============== -->
		<div v-if="!isMobile" class="d-flex ga-12 w-100 justify-center">
			<!-- CỘT A -->
			<div class="drop-zones">
				<div v-for="item in columnA" :key="item.id" class="drop-zone pa-4" :class="{
						'drop-zone-tap-active': useTapAssignMode && !!selectedTapItemB,
						'drop-zone-tap-selected-source': useTapAssignMode && selectedTapSourceAId === item.id
					}" @click="onTapAssignToA(item)">
					<div class="d-flex flex-row">
						<div class="jigsaw2">
							<span class="r"></span>
							<span class="text">{{ item.text }}</span>
						</div>

						<!-- ĐÁP ÁN ĐÃ CHỌN -->
						<vuedraggable v-model="item.dropArray" item-key="id" :group="dragGroup" :sort="false"
							:disabled="isDragDisabled || useTapAssignMode" @add="onAddToA(item)"
							@change="onDragDataChanged" :animation="150" :force-fallback="isIOS"
							:fallback-on-body="isIOS" :delay-on-touch-only="true" :delay="touchDragDelay"
							:touch-start-threshold="4" :fallback-tolerance="4" :empty-insert-threshold="24"
							class="flex-grow-1 min-w-0 drop-zone-answer-slot">
							<template #item="{ element }">
								<div class="jigsaw1" :class="{
									'correct-match': showResult && isCorrectPair(item.id, element.id),
									'incorrect-match': showResult && !isCorrectPair(item.id, element.id)
								}">
									<span class="l"></span>
									<span class="text">{{ element.text }}</span>
								</div>
							</template>
							<template #footer>
								<div v-if="!item.dropArray?.length" class="drop-zone-answer-placeholder"></div>
							</template>
						</vuedraggable>
					</div>
					<!-- <div>
						<v-icon :color=""></v-icon>
					</div> -->
				</div>
			</div>


			<!-- CỘT B -->
			<div class="drop-zones">
				<!-- NÚT TRẢ VỀ CỘT B khi đang giữ item từ Cột A -->
				<div v-if="useTapAssignMode && selectedTapSourceAId" class="tap-return-zone mt-1 mb-2"
					@click="returnTapItemToB">
					<v-icon size="18" class="mr-1">mdi-arrow-left-bold</v-icon>
					Bỏ về Cột B: <strong class="ml-1">"{{ selectedTapItemB?.text }}"</strong>
				</div>
				<vuedraggable v-model="columnB" item-key="id" @start="onStart" @end="endDrag" :animation="150"
					:group="dragGroup" :disabled="isDragDisabled || useTapAssignMode" @change="onDragDataChanged"
					:force-fallback="isIOS" :fallback-on-body="isIOS" :delay-on-touch-only="true"
					:delay="touchDragDelay" :touch-start-threshold="4" :fallback-tolerance="4">
					<template #item="{ element }">
						<div class="d-flex drop-zone-columnB pa-4"
							:class="{ 'tap-item-selected': useTapAssignMode && selectedTapItemB?.id === element.id }"
							@click="onTapPickFromB(element)">
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
					<div v-if="itemA.dropArray?.length" class="jigsaw1 d-flex align-center"
						style="background-color: #ffffff !important; border:solid 1px #217d46" :class="{
						'correct-match': showResult && isCorrectPair(itemA.id, itemA.dropArray[0].id),
						'incorrect-match': showResult && !isCorrectPair(itemA.id, itemA.dropArray[0].id)
					}">
						<span class="l"></span>
						<span class="text">{{ itemA.dropArray[0].text }}</span>
						<v-btn size="small" color="error" variant="text" @click.stop="handleRemoveAnswer(itemA)">
							Xóa
						</v-btn>
					</div>
					<div v-else class="mobile-placeholder">
						<v-icon small>mdi-plus</v-icon> Chọn đáp án
					</div>
				</div>
			</div>

			<!-- Hướng dẫn -->
			<div class="pt-4 pb-0 text-center text-grey">
				<p class="text-caption">Nhấn vào ô đáp án để chọn</p>
			</div>
		</div>

		<!-- DIALOG MOBILE -->
		<v-dialog v-model="mobileDialog" max-width="400" persistent>
			<v-card>
				<v-card-title class="bg-primary text-white text-subtitle-1">
					<span class="text-white">Chọn đáp án cho: <strong class="ml-1">"{{ selectedLeftItem?.text
							}}"</strong></span>
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
					<template #activator="{ props: menuProps }">
						<v-tooltip location="top">
							<template #activator="{ props: tooltipProps }">
								<v-btn v-bind="{ ...menuProps, ...tooltipProps }" icon="mdi-notebook-edit-outline"
									size="small" variant="text" color="primary" />
							</template>
							<span>Ý kiến của bạn</span>
						</v-tooltip>
					</template>
					<v-card :min-width="widthScreen < 650 ? null : 600" variant="outlined" class="elevation-0">
						<v-card-title class="px-4 py-3"
							style="background-color:#E3F2FD; color:#1565C0; font-weight:600;">
							Ý kiến của bạn
						</v-card-title>
						<v-list>
							<v-list-item>
								<v-textarea :model-value="grading?.comment || ''"
									@update:model-value="onStudentCommentInput" rows="2" hide-details variant="outlined"
									placeholder="Nhập ý kiến của bạn" />
							</v-list-item>
						</v-list>
						<v-card-actions class="border-t py-0">
							<v-spacer />
							<v-btn variant="text" color="primary" @click="menu = false">
								Đóng
							</v-btn>
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
			dragGroup: { name: 'matching-items', pull: true, put: true },
			selectedTapItemB: null,
		selectedTapSourceAId: null,
		useTapAssignMode: false,
		isIOS: false,
		touchDragDelay: 0
		};
	},
	computed: {
		isDragDisabled() {
			return this.readonly || this.isGrade || this.submissionstatus >= 2;
		},
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
		this._detectDevice();
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
		_detectDevice() {
			const ua = navigator.userAgent || '';
			const iOSByUA = /iPad|iPhone|iPod/i.test(ua);
			const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
			this.isIOS = iOSByUA || iPadOS;
			const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
			this.touchDragDelay = isCoarsePointer ? 120 : 0;
			this.useTapAssignMode = !this.isMobile && this.isIOS && isCoarsePointer;
		},
		handleResize() {
			this.widthScreen = window.innerWidth;
			this.checkMobile();
			this._detectDevice();
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
			this.selectedTapItemB = null;
			this.selectedTapSourceAId = null;
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
			if(this.columnB.length == 0) return 
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
		// === DESKTOP/TABLET DRAG ===
		onAddToA(targetA) {
			if (!targetA?.dropArray?.length) return;
			if (targetA.dropArray.length > 1) {
				const latestItem = targetA.dropArray[targetA.dropArray.length - 1];
				const oldItems = targetA.dropArray.slice(0, -1);
				if (oldItems.length) this.columnB.push(...oldItems);
				targetA.dropArray = [latestItem];
			}
			this.showResult = false;
			this.emitAnswerChange();
		},
		onDragDataChanged() {
			this.showResult = false;
			this.selectedTapItemB = null;
			this.selectedTapSourceAId = null;
			this.emitAnswerChange();
		},
		onTapPickFromB(itemB) {
			if (!this.useTapAssignMode || this.isDragDisabled) return;
			this.selectedTapSourceAId = null;
			this.selectedTapItemB = this.selectedTapItemB?.id === itemB.id ? null : itemB;
		},
		returnTapItemToB() {
			if (!this.selectedTapSourceAId || !this.selectedTapItemB) return;
			const sourceA = this.columnA.find(a => a.id === this.selectedTapSourceAId);
			if (sourceA) {
				this.columnB.push(sourceA.dropArray[0]);
				sourceA.dropArray = [];
			}
			this.selectedTapItemB = null;
			this.selectedTapSourceAId = null;
			this.showResult = false;
			this.emitAnswerChange();
		},
		onTapAssignToA(targetA) {
			if (!this.useTapAssignMode || this.isDragDisabled) return;

			if (!this.selectedTapItemB) {
				const existing = targetA.dropArray?.[0];
				if (!existing) return;
				this.selectedTapItemB = existing;
				this.selectedTapSourceAId = targetA.id;
				return;
			}

			if (this.selectedTapSourceAId && this.selectedTapSourceAId === targetA.id) {
				this.selectedTapItemB = null;
				this.selectedTapSourceAId = null;
				return;
			}

			const sourceA = this.selectedTapSourceAId ? this.columnA.find(a => a.id === this.selectedTapSourceAId) : null;
			const selectedId = this.selectedTapItemB.id;
			const selectedItem = sourceA ? sourceA.dropArray?.[0] : this.columnB.find(b => b.id === selectedId);
			if (!selectedItem) {
				this.selectedTapItemB = null;
				this.selectedTapSourceAId = null;
				return;
			}

			const oldItem = targetA.dropArray?.[0];

			if (sourceA) {
				sourceA.dropArray = [];
			} else {
				this.columnB = this.columnB.filter(b => b.id !== selectedId);
			}

			targetA.dropArray = [selectedItem];

			if (oldItem) {
				if (sourceA) {
					sourceA.dropArray = [oldItem];
				} else {
					this.columnB.push(oldItem);
				}
			}

			this.selectedTapItemB = null;
			this.selectedTapSourceAId = null;
			this.showResult = false;
			this.emitAnswerChange();
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
		},
		handleRemoveAnswer(itemA){
			this.columnB.push(itemA.dropArray[0])
			itemA.dropArray = []
			this.selectedTapItemB = null
			this.selectedTapSourceAId = null
			this.selectedLeftItem = {...itemA}
		}
	}
}
</script>