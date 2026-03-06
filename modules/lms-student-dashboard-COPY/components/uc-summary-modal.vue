<template>
	<v-dialog :model-value="visible" @update:model-value="closeDialog" :width="mobile ? '95%' : 680"
		:max-height="mobile ? '95dvh' : '88vh'" scrollable>
		<!-- ── LOADING ── -->
		<v-card v-if="loading" class="smd-card smd-card--loading" rounded="xl" elevation="0">
			<div class="smd-loading-body">
				<div class="smd-spinner-ring">
					<svg viewBox="0 0 44 44" class="smd-spinner-svg">
						<circle cx="22" cy="22" r="18" fill="none" stroke-width="3" class="smd-spinner-track" />
						<circle cx="22" cy="22" r="18" fill="none" stroke-width="3" class="smd-spinner-arc"
							stroke-dasharray="56 56" stroke-linecap="round" />
					</svg>
				</div>
				<p class="smd-loading-text">Đang tải kết quả bài làm…</p>
			</div>
		</v-card>

		<!-- ── MAIN CARD ── -->
		<v-card v-else-if="summaryData && summaryData.overview" class="smd-card" rounded="xl" elevation="0">
			<!-- HEADER -->
			<div class="smd-header">
				<div class="smd-header-glow" :style="{ background: scoreGradient }"></div>
				<div class="smd-header-content">
					<div class="smd-header-tag">Kết quả bài làm</div>
					<h2 class="smd-header-title">{{ summaryData.overview.Title }}</h2>

					<!-- Score ring -->
					<div class="smd-score-wrap">
						<div class="smd-score-ring-outer">
							<svg viewBox="0 0 120 120" class="smd-ring-svg">
								<circle cx="60" cy="60" r="50" fill="none" stroke-width="8" class="smd-ring-bg" />
								<circle cx="60" cy="60" r="50" fill="none" stroke-width="8" class="smd-ring-fg"
									:stroke="scoreColor" stroke-linecap="round" :stroke-dasharray="strokeDasharray"
									transform="rotate(-90 60 60)" />
							</svg>
							<div class="smd-ring-inner">
								<span class="smd-score-num" :style="{ color: scoreColor }">
									{{ summaryData.overview.Score }}
								</span>
								<span class="smd-score-max">/ {{ summaryData.overview.MaxScore }}</span>
							</div>
						</div>

						<div class="smd-score-stats">
							<div class="smd-stat-row">
								<div class="smd-stat-pill"
									:style="{ background: scoreColor + '20', color: scoreColor }">
									<v-icon size="13">{{ scoreMoodIcon }}</v-icon>
									{{ scoreMoodLabel }}
								</div>
							</div>
							<div class="smd-stat-grid">
								<div class="smd-stat-box">
									<span class="smd-stat-val text-success">{{ correctCount }}</span>
									<span class="smd-stat-lbl">Đúng</span>
								</div>
								<div class="smd-stat-box">
									<span class="smd-stat-val text-warning">{{ partialCount }}</span>
									<span class="smd-stat-lbl">Một phần</span>
								</div>
								<div class="smd-stat-box">
									<span class="smd-stat-val text-error">{{ wrongCount }}</span>
									<span class="smd-stat-lbl">Sai</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<button class="smd-close-btn" @click="closeDialog">
					<v-icon size="18">mdi-close</v-icon>
				</button>
			</div>

			<!-- TEACHER COMMENT -->
			<div v-if="summaryData.overview.TeacherComment && summaryData.overview.TeacherComment.trim()"
				class="smd-comment">
				<div class="smd-comment-label">
					<v-icon size="14" color="primary">mdi-comment-text-outline</v-icon>
					Nhận xét của giáo viên
				</div>
				<div class="smd-comment-body" v-html="summaryData.overview.TeacherComment"></div>
			</div>

			<!-- QUESTION TABLE -->
			<div class="smd-table-wrap">
				<div class="smd-table-head">
					<span class="smd-th smd-th--q">Câu hỏi</span>
					<span class="smd-th smd-th--r">Kết quả</span>
					<span class="smd-th smd-th--s">Điểm</span>
				</div>

				<div class="smd-table-body">
					<div v-for="(item, i) in summaryData.details" :key="item.QuestionID" class="smd-table-row"
						:class="'smd-row--'+getStatusInfo(item).status">
						<div class="smd-td smd-td--q">
							<span class="smd-q-num">{{ i + 1 }}</span>
							<span class="smd-q-text" v-html="item.QuestionText"></span>
						</div>
						<div class="smd-td smd-td--r">
							<div class="smd-status-chip" :class="'smd-status-chip--'+getStatusInfo(item).status">
								<v-icon size="14">{{ getStatusInfo(item).icon }}</v-icon>
							</div>
						</div>
						<div class="smd-td smd-td--s">
							<span class="smd-score-cell" :style="{ color: getStatusInfo(item).chipColor }">
								{{ item.Score }}
							</span>
							<span class="smd-score-denom"> / {{ item.MaxScore }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- FOOTER -->
			<div class="smd-footer">
				<v-btn variant="text" class="smd-btn-close" @click="closeDialog" size="small">
					Đóng
				</v-btn>
				<v-btn variant="flat" class="smd-btn-detail" @click="navigateToDetails" size="small"
					append-icon="mdi-arrow-right">
					Xem bài làm chi tiết
				</v-btn>
			</div>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-summary-modal',
		props: {
			visible: Boolean,
			loading: Boolean,
			summaryData: Object,
		},
		emits: ['update:visible', 'navigate-to-details'],
		data() {
			const { mobile } = Vuetify.useDisplay();
			return { mobile };
		},
		computed: {
			strokeDasharray() {
				return `${(this.scorePct / 100) * 314} 314`
			},
			scorePct() {
				const ov = this.summaryData?.overview;
				if (!ov || !ov.MaxScore) return 0;
				return Math.round((ov.Score / ov.MaxScore) * 100);
			},
			scoreColor() {
				const p = this.scorePct;
				if (p === 100) return 'rgb(var(--v-theme-primary))';
				if (p >= 80) return '#22c55e';
				if (p >= 50) return '#f59e0b';
				return '#ef4444';
			},
			scoreGradient() {
				return `radial-gradient(ellipse at 60% 0%, ${this.scoreColor}28 0%, transparent 70%)`;
			},
			scoreMoodIcon() {
				const p = this.scorePct;
				if (p >= 80) return 'mdi-trophy-outline';
				if (p >= 50) return 'mdi-thumb-up-outline';
				return 'mdi-book-open-page-variant-outline';
			},
			scoreMoodLabel() {
				const p = this.scorePct;
				if (p >= 80) return `Xuất sắc — ${this.scorePct}%`;
				if (p >= 50) return `Khá — ${this.scorePct}%`;
				return `Cần cố gắng — ${this.scorePct}%`;
			},
			correctCount() {
				return (this.summaryData?.details || []).filter(i =>
					typeof i.IsCorrect === 'boolean' ? i.IsCorrect : (i.Score > 0 && i.Score === i.MaxScore)
				).length;
			},
			partialCount() {
				return (this.summaryData?.details || []).filter(i =>
					typeof i.IsCorrect === 'boolean' ? false : (i.Score > 0 && i.Score < i.MaxScore)
				).length;
			},
			wrongCount() {
				return (this.summaryData?.details || []).filter(i =>
					typeof i.IsCorrect === 'boolean' ? !i.IsCorrect : i.Score === 0
				).length;
			},
		},
		methods: {
			closeDialog() {
				if (this.visible) this.$emit('update:visible', false);
			},
			navigateToDetails() {
				const overview = this.summaryData?.overview;
				if (overview) {
					this.$emit('navigate-to-details', overview);
				} else {
					Vue.$toast?.error('Thiếu thông tin AssignToClassID để điều hướng.');
				}
			},
			getStatusInfo(item) {
				// Ưu tiên field IsCorrect nếu có (từ API thực tế)
				if (typeof item.IsCorrect === 'boolean') {
					return item.IsCorrect
						? { icon: 'mdi-check-circle', status: 'correct', color: 'success', chipColor: '#22c55e' }
						: { icon: 'mdi-close-circle', status: 'wrong', color: 'error', chipColor: '#ef4444' };
				}
				// Fallback: tính theo Score
				if (item.Score === 0) return { icon: 'mdi-close-circle', status: 'wrong', color: 'error', chipColor: '#ef4444' };
				if (item.Score === item.MaxScore) return { icon: 'mdi-check-circle', status: 'correct', color: 'success', chipColor: '#22c55e' };
				return { icon: 'mdi-star-half-full', status: 'partial', color: 'warning', chipColor: '#f59e0b' };
			},
		},
	}
</script>