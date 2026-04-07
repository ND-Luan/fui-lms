<template>
	<div class="sq">
		<!-- HEADER -->
		<div class="sq__header">
			<div class="sq__header-left">
				<div class="sq__header-icon">
					<v-icon size="18" color="white">mdi-flag-variant</v-icon>
				</div>
				<div>
					<div class="sq__header-title">Câu hỏi đã đánh dấu</div>
					<div class="sq__header-count">{{ filteredList.length }} câu hỏi</div>
				</div>
			</div>
			<div class="sq__header-actions">
				<v-btn size="small" variant="text" icon="mdi-refresh" :loading="isLoading || isLoadingMonHoc" @click="getMonHoc" />
				<!-- Mobile filter -->
				<v-btn v-if="isMobile" size="small" variant="tonal" color="primary" icon="mdi-filter-variant"
					@click="showFilterSheet = true" />
			</div>
		</div>

		<!-- FILTER CHIPS (desktop) -->
		<div v-if="!isMobile" class="sq__chips">
			<v-progress-circular v-if="isLoadingMonHoc" indeterminate size="20" width="2" color="primary" />
			<template v-else>
				<div v-for="mh in DSMonHoc" :key="mh.MonHocID" class="sq__chip"
					:class="{ 'sq__chip--active': selectedMonHocID === mh.MonHocID }"
					@click="selectedMonHocID = mh.MonHocID">
					<v-icon :color="selectedMonHocID === mh.MonHocID ? 'white' : mh.Color" size="13"
						start>{{ mh.Icon }}</v-icon>
					{{ mh.TenMonHoc_HienThi }}
				</div>
			</template>
		</div>

		<!-- EMPTY STATE — chưa chọn môn -->
		<div v-if="!isLoadingMonHoc && DSMonHoc.length === 0" class="sq__empty">
			<v-icon size="52" color="grey-lighten-2">mdi-book-off-outline</v-icon>
			<div class="sq__empty-title">Không có môn học nào</div>
		</div>

		<!-- PROMPT chọn môn -->
		<div v-else-if="!selectedMonHocID && !isLoadingMonHoc" class="sq__empty">
			<v-icon size="52" color="grey-lighten-2">mdi-flag-variant-outline</v-icon>
			<div class="sq__empty-title">Chọn môn học để xem câu hỏi đã đánh dấu</div>
		</div>

		<!-- EMPTY STATE — đã chọn môn, không có câu hỏi -->
		<div v-else-if="!isLoading && selectedMonHocID && filteredList.length === 0" class="sq__empty">
			<v-icon size="52" color="grey-lighten-2">mdi-flag-variant-off-outline</v-icon>
			<div class="sq__empty-title">Chưa có câu hỏi nào được đánh dấu</div>
			<div class="sq__empty-sub">Nhấn
				<v-icon size="14" color="red">mdi-flag-variant-outline</v-icon>
				trong bài làm để đánh dấu câu hỏi cần xem lại.
			</div>
		</div>

		<!-- LOADING -->
		<div v-if="isLoading" class="sq__list">
			<v-skeleton-loader v-for="i in 3" :key="i" type="card" rounded="lg" class="mb-3" />
		</div>

		<!-- DANH SÁCH -->
		<div v-else-if="filteredList.length > 0" class="sq__list">
			<v-card v-for="item in filteredList" :key="item.questionId + '_' + item.AssignToClassID"
				flat border rounded="lg" class="mb-3">

				<!-- Assignment banner -->
				<div class="sq__asgn-banner" :style="{ borderLeftColor: item.Color || '#e53935' }">
					<div class="sq__asgn-banner-left">
						<v-icon size="14" color="grey">mdi-file-document-outline</v-icon>
						<span>{{ item.AssignmentTitle }}</span>
						<span class="sq__asgn-sep">•</span>
						<span>Câu {{ item.OrdinalNumber }}</span>
						<span class="sq__asgn-sep">•</span>
						<span>{{ item.Points }}đ</span>
					</div>
					<div class="sq__asgn-banner-right">
					<v-chip size="x-small" :color="qStatus(item).color" variant="tonal">
						<v-icon start :icon="qStatus(item).icon" size="11" />
						{{ qStatus(item).label }}
						</v-chip>
						<v-icon size="14" color="red">mdi-flag-variant</v-icon>
						<v-btn size="x-small" variant="text" color="primary" icon="mdi-open-in-new"
							v-tooltip="'Mở bài làm'" @click="openAssignment(item)" />
					</div>
				</div>

				<v-card-text class="pt-2 pb-3 px-3">
					<!-- Question text -->
					<div class="d-flex ga-2 mb-2">
						<v-chip size="x-small" :color="item.Color || 'primary'" variant="tonal" class="flex-shrink-0">
							{{ questionTypeLabel(item.questionObj.type) }}
						</v-chip>
					</div>
					<uc-latex-view :escape-html="false" v-model:content="item.questionObj.config.questionText"
						class="sq__question-text mb-3" />

					<!-- Answer (readonly) -->
					<component :is="questionComponent(item.questionObj.type)"
						:question="item.questionObj"
						:answer="item.AnswerData"
						:grading="cleanGrading(item.Grading)"
						:readonly="true"
						:isGrade="true"
						:submissionstatus="item.SubmissionStatus"
						:max-points="item.questionObj.points"
						:student-comment="''"
						:is-block-copy-paste="false"
						:is-show-btn-comment="false" />

				<!-- Nhận xét GV (chỉ hiện khi có) -->
				<v-alert v-if="item.Grading?.teacherComment" class="mt-2" variant="tonal"
					type="info" density="compact" border="start" icon="mdi-comment-quote-outline">
					<strong>Nhận xét GV:</strong> {{ item.Grading.teacherComment }}
				</v-alert>
				</v-card-text>
			</v-card>
		</div>

		<!-- MOBILE FILTER BOTTOM SHEET -->
		<v-bottom-sheet v-model="showFilterSheet">
			<v-card rounded="t-xl">
				<v-card-title class="d-flex align-center pt-4 pb-2 px-4">
					<v-icon start>mdi-filter-variant</v-icon>Chọn môn học
					<v-spacer />
					<v-btn icon="mdi-close" variant="text" size="small" @click="showFilterSheet = false" />
				</v-card-title>
				<v-list>
					<v-list-item v-for="mh in DSMonHoc" :key="mh.MonHocID" :active="selectedMonHocID === mh.MonHocID"
						color="primary"
						@click="selectedMonHocID = mh.MonHocID; showFilterSheet = false">
						<template #prepend>
							<v-icon :color="mh.Color">{{ mh.Icon }}</v-icon>
						</template>
						<v-list-item-title>{{ mh.TenMonHoc_HienThi }}</v-list-item-title>
					</v-list-item>
				</v-list>
				<div class="pb-4" />
			</v-card>
		</v-bottom-sheet>
	</div>
</template>

<script>
export default {
	name: 'UcStoreQuestion',
	inject: ['iframeRef'],
	props: {
		HocSinh: { type: Object, default: () => ({}) },
		NienKhoa: { type: Number, default: null },
		isMobile: { type: Boolean, default: false },
	},
	data() {
		return {
			isLoadingMonHoc: false,
			isLoading: false,
			DSFlagged: [],
			DSMonHoc: [],
			selectedMonHocID: null,
			showFilterSheet: false,
		};
	},
	computed: {
		hocSinhID() {
			return this.HocSinh?.HocSinhID || vueData.user?.UserID;
		},
		filteredList() {
			return this.DSFlagged;
		},
	},
	watch: {
		'HocSinh.HocSinhID': {
			immediate: true,
			handler(id) {
				if (id) this.getMonHoc();
			},
		},
		selectedMonHocID(v) {
			if (v) this.getDS();
			else this.DSFlagged = [];
		},
	},
	methods: {
		async getMonHoc() {
			if (!this.hocSinhID || !this.NienKhoa) return;
			this.isLoadingMonHoc = true;
			this.DSMonHoc = [];
			this.DSFlagged = [];
			this.selectedMonHocID = null;
			try {
				const res = await fetchPromise('lms/EL_Student_Get_MonHoc_ByHocSinhID', {
					HocSinhID: this.hocSinhID,
					NienKhoa: this.NienKhoa,
				}, { cache: false });
				this.DSMonHoc = res?.data ?? res ?? [];
			} catch (e) {
				console.error('[uc-store-question] getMonHoc:', e);
			} finally {
				this.isLoadingMonHoc = false;
			}
		},
		async getDS() {
			if (!this.hocSinhID || !this.NienKhoa || !this.selectedMonHocID) return;
			this.isLoading = true;
			this.DSFlagged = [];
			try {
				const res = await fetchPromise('lms/EL_Student_Get_QuestionFlag', {
					HocSinhID: this.hocSinhID,
					MonHocID: this.selectedMonHocID,
					NienKhoa: this.NienKhoa,
				}, { cache: false });
				const rows = res?.data ?? res ?? [];
				this.DSFlagged = this._extractFlaggedQuestions(rows);
			} catch (e) {
				console.error('[uc-store-question] getDS:', e);
			} finally {
				this.isLoading = false;
			}
		},
		_extractFlaggedQuestions(rows) {
			const result = [];
			for (const row of rows) {
				let config = null;
				let answers = {};
				try { config = JSON.parse(row.AssignmentConfig); } catch { continue; }
				try { answers = JSON.parse(row.SubmissionContent)?.answers ?? {}; } catch { /* no answers */ }

				const allQuestions = (config.groups ?? []).flatMap(g => g.questions ?? []);
				for (const q of allQuestions) {
					if (!answers[q.id]?.flag) continue;
					result.push({
					// full question object (shape QuestionCard expects)
					questionId: q.id,
					questionObj: q,
					OrdinalNumber: q.ordinalNumber,
					Points: q.points,
						// answer state
						AnswerData: answers[q.id]?.answerData ?? null,
						Grading: answers[q.id]?.grading ?? null,
						// from submission row
						AssignmentTitle: row.AssignmentTitle,
						SubmissionStatus: row.SubmissionStatus,
						AssignToClassID: row.AssignToClassID,
						AssignToStudentID: row.AssignToStudentID,
						Is_SendToClass: row.Is_SendToClass,
						// from subject
						MonHocID: row.MonHocID,
						TenMonHoc_HienThi: row.TenMonHoc_HienThi,
						Color: row.Color,
						Icon: row.Icon,
					});
				}
			}
			return result;
		},
		openAssignment(item) {
			const base = '/lms-student-assignment';
			const params = item.Is_SendToClass
				? `Is_SendToClass=true&AssignToClassID=${item.AssignToClassID}&HocSinhID=${this.hocSinhID}`
				: `Is_SendToClass=false&AssignToStudentID=${item.AssignToStudentID}&HocSinhID=${this.hocSinhID}`;
			this.iframeRef?.value?.open({
				title: item.AssignmentTitle,
				url: `${base}?${params}`,
			});
		},
		statusChip(status) {
			const map = {
				1: { label: 'Nháp', color: 'grey' },
				2: { label: 'Đã nộp', color: 'success' },
				3: { label: 'Đang chấm', color: 'orange' },
				4: { label: 'Đã chấm', color: 'primary' },
			};
			return map[status] ?? { label: 'Không rõ', color: 'grey' };
		},
		cleanGrading(grading) {
			if (!grading) return {};
			const { comment, ...rest } = grading;
			return rest;
		},
		qStatus(item) {
			const g = item.Grading;
			const answered = item.AnswerData != null && item.AnswerData !== '';
			const status = item.SubmissionStatus;
			if (status < 2) {
				return answered
					? { label: 'Đã trả lời', color: 'primary', icon: 'mdi-pencil-circle' }
					: { label: 'Chưa trả lời', color: 'grey', icon: 'mdi-help-circle-outline' };
			}
			if (status !== 4) return { label: 'Chờ chấm', color: 'grey', icon: 'mdi-clock-outline' };
			// status == 4: graded
			if (!answered) return { label: 'Chưa trả lời', color: 'grey', icon: 'mdi-help-circle-outline' };
			if (!g) return { label: 'Chờ chấm', color: 'grey', icon: 'mdi-clock-outline' };
			const score = g.manualScore ?? g.autoScore ?? null;
			if (score === null) return { label: 'Chờ chấm', color: 'grey', icon: 'mdi-clock-outline' };
			if (score <= 0) return { label: 'Sai', color: 'error', icon: 'mdi-close-circle' };
			if (score >= item.Points) return { label: 'Đúng', color: 'success', icon: 'mdi-check-circle' };
			return { label: 'Một phần', color: 'warning', icon: 'mdi-minus-circle-outline' };
		},
		questionComponent(type) {
			const map = {
				QUIZ_SINGLE_CHOICE: 'uc-question-single-choice',
				QUIZ_MULTIPLE_CHOICE: 'uc-question-multiple-choice',
				QUIZ_TRUE_FALSE: 'uc-question-true-false',
				QUIZ_MULTIPLE_TRUE_FALSE: 'uc-question-multiple-true-false',
				QUIZ_FILL_IN_BLANK: 'uc-question-fill-in-blank',
				QUIZ_MATCHING: 'uc-question-matching',
				SHORT_ANSWER: 'uc-question-short-answer',
				ESSAY: 'uc-question-essay',
				FILE_UPLOAD: 'uc-question-file-upload',
				AUDIO_RESPONSE: 'uc-question-audio-response',
			};
			return map[type] || 'div';
		},
		questionTypeLabel(type) {
			if (typeof questionsTypesLabel === 'function') {
				return questionsTypesLabel(type)?.label ?? type;
			}
			const map = {
				QUIZ_SINGLE_CHOICE: 'Trắc nghiệm',
				QUIZ_MULTIPLE_CHOICE: 'Nhiều đáp án',
				QUIZ_TRUE_FALSE: 'Đúng / Sai',
				QUIZ_MULTIPLE_TRUE_FALSE: 'Đúng / Sai (nhiều)',
				QUIZ_FILL_IN_BLANK: 'Điền vào chỗ trống',
				QUIZ_MATCHING: 'Nối cột',
				SHORT_ANSWER: 'Trả lời ngắn',
				ESSAY: 'Tự luận',
				FILE_UPLOAD: 'Nộp file',
				AUDIO_RESPONSE: 'Ghi âm',
			};
			return map[type] ?? type;
		},
	},
}
</script>

