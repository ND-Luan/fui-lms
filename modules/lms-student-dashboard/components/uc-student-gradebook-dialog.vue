<template>
	<v-dialog :model-value="visible" @update:model-value="$emit('update:visible', false)" max-width="720px" scrollable>
		<v-card class="gb-card">

			<!-- Header -->
			<v-card-title class="gb-title">
				<div class="gb-title-left">
					<div class="gb-title-icon">
						<v-icon size="18" color="white">mdi-book-open-page-variant</v-icon>
					</div>
					<div>
						<div class="gb-title-text">Sổ điểm cá nhân</div>
						<div class="gb-title-sub">{{ subjectName }}</div>
					</div>
				</div>
				<v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:visible', false)" />
			</v-card-title>

			<v-divider />

			<!-- Stats bar -->
			<div class="gb-stats-bar" v-if="!loading && gradeData.length">
				<div class="gb-stat">
					<div class="gb-stat-val">{{ gradeData.length }}</div>
					<div class="gb-stat-lbl">Bài tập</div>
				</div>
				<div class="gb-stat-div"></div>
				<div class="gb-stat">
					<div class="gb-stat-val">{{ gradedCount }}</div>
					<div class="gb-stat-lbl">Đã chấm</div>
				</div>
				<div class="gb-stat-div"></div>
				<div class="gb-stat">
					<div class="gb-stat-val" :class="avgColor">{{ avgScore }}</div>
					<div class="gb-stat-lbl">Điểm TB</div>
				</div>
			</div>

			<!-- Body -->
			<v-card-text class="gb-body pa-0">

				<!-- Loading -->
				<div v-if="loading" class="gb-loading">
					<v-progress-circular indeterminate color="primary" size="36" />
					<span class="gb-loading-text">Đang tải sổ điểm…</span>
				</div>

				<!-- Empty -->
				<div v-else-if="!gradeData.length" class="gb-empty">
					<v-icon size="40" color="grey-lighten-2">mdi-file-document-outline</v-icon>
					<div>Chưa có dữ liệu điểm</div>
				</div>

				<!-- Table -->
				<v-table v-else fixed-header height="52vh" density="comfortable" class="gb-table">
					<thead>
						<tr>
							<th class="gb-col-title">Bài tập / Bài kiểm tra</th>
							<th class="text-center gb-col-score">Điểm số</th>
							<th class="text-center gb-col-max">Tối đa</th>
							<th class="text-center gb-col-pct">%</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in gradeData" :key="item.AssignToClassID" class="gb-row">
							<td class="gb-col-title font-weight-medium">
								<div class="gb-row-name">{{ item.AssignmentTitle }}</div>
							</td>
							<td class="text-center">
								<span v-if="item.Score != null" class="gb-score-chip"
									:class="getScoreClass(item.Score, item.MaxScore)">
									{{ item.Score }}
								</span>
								<span v-else class="gb-score-empty">—</span>
							</td>
							<td class="text-center gb-max-cell">{{ item.MaxScore }}</td>
							<td class="text-center">
								<div v-if="item.Score != null" class="gb-pct-bar-wrap">
									<div class="gb-pct-bar" :class="getScoreClass(item.Score, item.MaxScore)"
										:style="{ width: Math.round((item.Score / item.MaxScore) * 100) + '%' }"></div>
									<span class="gb-pct-label">{{ Math.round((item.Score / item.MaxScore) * 100)
										}}%</span>
								</div>
								<span v-else class="gb-score-empty">—</span>
							</td>
						</tr>
					</tbody>
				</v-table>

			</v-card-text>

			<v-divider />
			<v-card-actions class="gb-actions">
				<v-spacer />
				<v-btn variant="tonal" color="primary" size="small" @click="$emit('update:visible', false)">
					Đóng
				</v-btn>
			</v-card-actions>

		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-student-gradebook-dialog',
		props: {
			visible: { type: Boolean, default: false },
			monHocId: { type: Number, default: null },
			subjectName: { type: String, default: '' },
			isMobile: Boolean
		},
		emits: ['update:visible'],
	
		data() {
			return {
				loading: false,
				gradeData: []
			}
		},
	
		computed: {
			gradedCount() {
				return this.gradeData.filter(r => r.Score != null).length
			},
			avgScore() {
				const graded = this.gradeData.filter(r => r.Score != null && r.MaxScore)
				if (!graded.length) return '—'
				const sum = graded.reduce((s, r) => s + (r.Score / r.MaxScore) * 10, 0)
				return (sum / graded.length).toFixed(1)
			},
			avgColor() {
				const v = parseFloat(this.avgScore)
				if (isNaN(v)) return ''
				if (v < 5) return 'text-error'
				if (v < 7) return 'text-warning'
				return 'text-success'
			}
		},
	
		watch: {
			// Fetch khi dialog mở và monHocId sẵn sàng
			visible(newVal) {
				if (newVal && this.monHocId) this.fetchGradebook()
			},
			// Fetch lại nếu môn thay đổi trong khi dialog đang mở
			monHocId(newVal) {
				if (this.visible && newVal) this.fetchGradebook()
			}
		},
	
		methods: {
			async fetchGradebook() {
				this.loading = true
				this.gradeData = []
				try {
					await ajaxCALL(
						'lms/EL_Student_GetMyGradebook',
						{ MonHocID: this.monHocId },
						(res) => {
							// res.data[0] = danh sách assignment headers
							// res.data[1] = (optional) tổng kết
							// res.data[2] = danh sách điểm theo AssignToClassID
							if (res?.data?.length >= 1) {
								const headers = res.data[0] ?? []
								const scores = new Map(
									(res.data[2] ?? []).map(s => [s.AssignToClassID, s.Score])
								)
								this.gradeData = headers.map(h => ({
									...h,
									Score: scores.has(h.AssignToClassID) ? scores.get(h.AssignToClassID) : null
								}))
							}
						}
					)
				} finally {
					this.loading = false
				}
			},
	
			getScoreClass(score, maxScore) {
				if (score == null || !maxScore) return ''
				const ratio = score / maxScore
				if (ratio < 0.5) return 'score--fail'
				if (ratio < 0.7) return 'score--mid'
				return 'score--pass'
			}
		}
	}
</script>