// ============================================================
// CONSTANTS — dùng chung cho toàn module lms-student-assignment
// ============================================================
var SUBMISSION_STATUS = {
	DRAFT: 1,
	SUBMITTED: 2,
	IN_REVIEW: 3,
	GRADED: 4
};
var QUIZ_TYPES = {
	SINGLE_CHOICE: 'QUIZ_SINGLE_CHOICE',
	MULTIPLE_CHOICE: 'QUIZ_MULTIPLE_CHOICE',
	TRUE_FALSE: 'QUIZ_TRUE_FALSE',
	MULTIPLE_TRUE_FALSE: 'QUIZ_MULTIPLE_TRUE_FALSE',
	FILL_IN_BLANK: 'QUIZ_FILL_IN_BLANK',
	MATCHING: 'QUIZ_MATCHING'
};
// ============================================================
// MIXIN: useQuestionNavigation
// ============================================================
function useQuestionNavigation() {
	return {
		methods: {
			getGlobalQuestionNumber(groupIndex, questionIndex) {
				if (!this.assignment?.groups) return 1;
				let number = 1;
				for (let i = 0; i < groupIndex; i++) {
					number += this.assignment.groups[i].questions.length;
				}
				return number + questionIndex;
			},
			getGlobalQuestionNumberByQuestionId(questionId) {
				if (!this.allQuestions) return 0;
				const index = this.allQuestions.findIndex(q => q.id === questionId);
				return index + 1;
			},
			navigateToQuestion(groupIndex, questionIndexInGroup, id) {
				if (this.viewMode === 'all') {
					const element = document.getElementById(id);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					} else {
						console.warn(`Element with id ${id} not found`);
					}
				}
				this.currentGroupIndex = groupIndex;
				this.currentQuestionIndexInGroup = questionIndexInGroup;
				if (this.groupCollapsed[groupIndex]) {
					this.toggleGroupCollapse(groupIndex);
				}
			},
			prevQuestion() {
				if (this.currentQuestionIndexInGroup > 0) {
					this.currentQuestionIndexInGroup--;
				} else if (this.currentGroupIndex > 0) {
					this.currentGroupIndex--;
					this.currentQuestionIndexInGroup =
						this.assignment.groups[this.currentGroupIndex].questions.length - 1;
				}
			},
			nextQuestion() {
				if (!this.assignment?.groups) return;
				const currentGroup = this.assignment.groups[this.currentGroupIndex];
				if (!currentGroup) return;
				if (this.currentQuestionIndexInGroup < currentGroup.questions.length - 1) {
					this.currentQuestionIndexInGroup++;
				} else if (this.currentGroupIndex < this.assignment.groups.length - 1) {
					this.currentGroupIndex++;
					this.currentQuestionIndexInGroup = 0;
				}
			}
		},
		computed: {
			allQuestions() {
				return this.assignment?.groups?.flatMap(g => g.questions) || [];
			},
			totalQuestions() {
				if (!this.assignment?.groups) return 0;
				return this.assignment.groups.reduce((total, group) => total + group.questions.length, 0);
			},
			currentGroup() {
				return this.assignment?.groups?.[this.currentGroupIndex];
			},
			currentQuestion() {
				return this.currentGroup?.questions?.[this.currentQuestionIndexInGroup];
			},
			globalQuestionNumber() {
				if (!this.assignment?.groups) return 1;
				return this.getGlobalQuestionNumber(this.currentGroupIndex, this.currentQuestionIndexInGroup);
			}
		}
	};
}
// ============================================================
// MIXIN: useAnswerTracking
// ============================================================
function useAnswerTracking() {
	return {
		methods: {
			isAnswered(questionId) {
				const answer = this.userAnswers[questionId]?.answerData;
				if (answer === null || answer === undefined) return false;
				if (typeof answer === 'string' && answer.trim() === '') return false;
				if (Array.isArray(answer) && answer.length === 0) return false;
				if (typeof answer === 'object' && !Array.isArray(answer) && Object.keys(answer).length === 0) return false;
				return true;
			},
			getGroupAnsweredCount(group) {
				if (!group?.questions) return 0;
				return group.questions.filter(q => this.isAnswered(q.id)).length;
			}
		},
		computed: {
			answeredCount() {
				return this.allQuestions.filter(q => this.isAnswered(q.id)).length;
			},
			progressPercent() {
				if (!this.totalQuestions) return 0;
				return (this.answeredCount / this.totalQuestions) * 100;
			}
		}
	};
}
// ============================================================
// MIXIN: useAutoSave
// ============================================================
function useAutoSave() {
	return {
		data() {
			return {
				saveStatus: 'Đã lưu',
				saveStatusColor: 'grey',
				saveStatusIcon: 'mdi-cloud-check-outline',
				isSaving: false,
				autoSaveTimer: null,
				lastSaveTime: 0,
				MIN_SAVE_INTERVAL: 2000
			};
		},
		methods: {
			triggerAutoSave() {
				this.saveStatus = 'Đang soạn...';
				this.saveStatusColor = 'orange';
				this.saveStatusIcon = 'mdi-pencil-outline';
				if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = setTimeout(() => { this.saveDraft(); }, 1000);
			},
			async saveDraft() {
				if (this.isSaving || this.isSubmitted) return;
				if (!this.assignment?.AssignToClassID && !this.assignment?.AssignToStudentID) return;
				const now = Date.now();
				if (now - this.lastSaveTime < this.MIN_SAVE_INTERVAL) {
					if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
					this.autoSaveTimer = setTimeout(
						() => { this.saveDraft(); },
						this.MIN_SAVE_INTERVAL - (now - this.lastSaveTime)
					);
					return;
				}
				this.isSaving = true;
				this.lastSaveTime = now;
				this.saveStatus = 'Đang lưu...';
				this.saveStatusColor = 'blue';
				this.saveStatusIcon = 'mdi-cloud-upload-outline';
				const payload = {
					AssignToClassID: this.assignment?.AssignToClassID ?? this.assignment?.AssignToStudentID,
					SubmissionContent: JSON.stringify({ answers: this.userAnswers }),
					SubmissionStatus: SUBMISSION_STATUS.DRAFT,
					HocSinhID: this.hocSinhDetail?.HocSinhID
				};
				try {
					await this.onSaveDraft(payload);
					this.saveStatus = 'Đã lưu';
					this.saveStatusColor = 'grey';
					this.saveStatusIcon = 'mdi-cloud-check-outline';
				} catch (error) {
					console.error('Lỗi lưu bài:', error);
					this.saveStatus = 'Lỗi lưu';
					this.saveStatusColor = 'error';
					this.saveStatusIcon = 'mdi-cloud-alert';
					setTimeout(() => { this.saveDraft(); }, 3000);
				} finally {
					this.isSaving = false;
				}
			},
			// Lưu flag sau khi học sinh đã nộp bài — không reset SubmissionStatus
			async saveFlagsOnly(answers) {
				if (this.isSaving) return;
				if (!this.assignment?.AssignToClassID && !this.assignment?.AssignToStudentID) return;
				const currentStatus = this.draft?.SubmissionStatus;
				this.isSaving = true;
				this.saveStatus = 'Đang lưu...';
				this.saveStatusColor = 'blue';
				this.saveStatusIcon = 'mdi-cloud-upload-outline';
				const payload = {
					AssignToClassID: this.assignment?.AssignToClassID ?? this.assignment?.AssignToStudentID,
					SubmissionContent: JSON.stringify({ answers: answers ?? this.userAnswers }),
					SubmissionStatus: currentStatus,
					HocSinhID: this.hocSinhDetail?.HocSinhID,
				};
				try {
					if (currentStatus > 2) {
						await this.onSaveFlagsPostSubmit(payload);
					} else {
						await this.onSaveDraft(payload);
					}
					this.saveStatus = 'Đã lưu';
					this.saveStatusColor = 'grey';
					this.saveStatusIcon = 'mdi-cloud-check-outline';
				} catch (error) {
					console.error('Lỗi lưu flag:', error);
					this.saveStatus = 'Lỗi lưu';
					this.saveStatusColor = 'error';
					this.saveStatusIcon = 'mdi-cloud-alert';
				} finally {
					this.isSaving = false;
				}
			}
		}
	};
}
// ============================================================
// MIXIN: useQuestionStatus
// ============================================================
function useQuestionStatus() {
	return {
		methods: {
			getQuestionScore(questionId) {
				const g = this.userAnswersSubmitted?.[questionId]?.grading;
				if (!g) return null;
				let s = 0, has = false;
				if (typeof g.autoScore === 'number') { s += g.autoScore; has = true; }
				if (typeof g.manualScore === 'number') { s += g.manualScore; has = true; }
				return has ? s : null;
			},
			questionStatus(questionId, maxPoint) {
				const answered = this.isAnswered(questionId);
				if (!this.isSubmitted) {
					return answered
						? { label: 'Đã TL', color: 'primary', variant: 'tonal' }
						: { label: 'Chưa TL', color: 'grey', variant: 'tonal' };
				}
				if (!this.isGraded) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' };
				if (!answered) return { label: 'Chưa TL', color: 'grey', variant: 'tonal' };
				const s = this.getQuestionScore(questionId);
				if (s === null) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' };
				if (s <= 0) return { label: 'Sai', color: 'error', variant: 'tonal' };
				if (s >= (maxPoint ?? 0)) return { label: 'Đúng', color: 'success', variant: 'tonal' };
				return { label: 'Một phần', color: 'warning', variant: 'tonal' };
			},
			getQuestionStatusIcon(questionId) {
				if (this.isGraded) {
					const question = this.allQuestions.find(q => q.id === questionId);
					const grading = this.userAnswersSubmitted?.[questionId]?.grading;
					if (!grading || !question) return 'mdi-help-circle-outline';
					if (grading.isCorrect === true || grading.manualScore === question.points) return 'mdi-check-circle';
					if (grading.manualScore < question.points && grading.manualScore > 0) return 'mdi-minus-circle-outline';
					return 'mdi-close-circle';
				}
				return this.isAnswered(questionId) ? 'mdi-pencil-circle' : 'mdi-help-box-outline';
			},
			getIconColor(questionId) {
				if (this.isGraded) {
					const question = this.allQuestions.find(q => q.id === questionId);
					const grading = this.userAnswersSubmitted?.[questionId]?.grading;
					if (!grading || !question) return 'grey';
					if (grading.isCorrect === true || grading.manualScore === question.points) return 'green';
					if (grading.manualScore < question.points && grading.manualScore > 0) return 'warning';
					return 'red';
				}
				return this.isAnswered(questionId) ? 'blue' : 'grey';
			}
		}
	};
}
// ============================================================
// MIXIN: useCopyPasteBlocker
// ============================================================
function useCopyPasteBlocker() {
	return {
		methods: {
			blockCopyPaste(e) {
				if (this.isSubmitted) return;
				if (e.isComposing || e.keyCode === 229) return;
				const target = e.target;
				if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
					if (target._isComposing) return;
					e.preventDefault();
					e.stopPropagation();
					Vue.$toast?.warning('Không được phép sao chép/dán nội dung trong bài thi này', { position: 'top' });
				}
			},
			blockContextMenu(e) {
				if (this.isSubmitted) return;
				const target = e.target;
				if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
					e.preventDefault();
				}
			},
			blockKeyboardShortcuts(e) {
				if (this.isSubmitted) return;
				if (e.isComposing || e.keyCode === 229) return;
				const target = e.target;
				if (!target || !(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
				if (target._isComposing) return;
				if (!e.ctrlKey && !e.metaKey) return;
				if (e.key && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
					e.preventDefault();
					e.stopPropagation();
					Vue.$toast?.warning('Không được phép sử dụng phím tắt sao chép/dán', { position: 'top' });
				}
			},
			handleCompositionStart(e) {
				if (e.target) e.target._isComposing = true;
			},
			handleCompositionEnd(e) {
				if (e.target) {
					setTimeout(() => { if (e.target) e.target._isComposing = false; }, 50);
				}
			},
			addCopyPasteBlocker() {
				document.addEventListener('copy', this.blockCopyPaste);
				document.addEventListener('cut', this.blockCopyPaste);
				document.addEventListener('paste', this.blockCopyPaste);
				document.addEventListener('contextmenu', this.blockContextMenu);
				document.addEventListener('keydown', this.blockKeyboardShortcuts);
				document.addEventListener('compositionstart', this.handleCompositionStart);
				document.addEventListener('compositionend', this.handleCompositionEnd);
			},
			removeCopyPasteBlocker() {
				document.removeEventListener('copy', this.blockCopyPaste);
				document.removeEventListener('cut', this.blockCopyPaste);
				document.removeEventListener('paste', this.blockCopyPaste);
				document.removeEventListener('contextmenu', this.blockContextMenu);
				document.removeEventListener('keydown', this.blockKeyboardShortcuts);
				document.removeEventListener('compositionstart', this.handleCompositionStart);
				document.removeEventListener('compositionend', this.handleCompositionEnd);
			}
		}
	};
}
// ============================================================
// MIXIN: useTimeTracking
// ============================================================
function useTimeTracking() {
	return {
		methods: {
			async insertDurationTime(submitionInfo) {
				if (!this._isActiveSubmission(submitionInfo?.SubmissionStatus)) return;
				await fetchPromise(
					'lms/EL_Student_UpdateDurationTime',
					{ SubmissionID: submitionInfo.SubmissionID },
					{ silent: true, cache: false }
				);
			},
			insertAccessTime(submitionInfo) {
				if (!this._isActiveSubmission(submitionInfo?.SubmissionStatus)) return;
				fetchPromise(
					'lms/EL_Student_UpdateAccessTime',
					{ SubmissionID: submitionInfo.SubmissionID },
					{ silent: true, cache: false }
				);
			},
			_isActiveSubmission(status) {
				return ![
					SUBMISSION_STATUS.SUBMITTED,
					SUBMISSION_STATUS.IN_REVIEW,
					SUBMISSION_STATUS.GRADED
				].includes(status);
			}
		}
	};
}