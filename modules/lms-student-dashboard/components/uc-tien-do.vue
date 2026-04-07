<template>
	<div class="td-wrap">

		<!-- ── HEADER ── -->
		<div class="td-header">
			<div class="td-header-left">
				<div class="td-header-icon">
					<v-icon size="16" color="white">mdi-chart-line</v-icon>
				</div>
				<div>
					<div class="td-header-title">Tiến Độ Môn Học</div>
					<div class="td-header-sub">{{ DSTienDo.length }} môn học</div>
				</div>
			</div>
			<div class="td-overall" v-if="DSTienDo.length">
				<div class="td-overall-pct">{{ overallPct }}%</div>
				<div class="td-overall-label">hoàn thành</div>
			</div>
		</div>

		<!-- ── LOADING ── -->
		<div v-if="isLoading" class="td-loading-list">
			<div v-for="n in 4" :key="n" class="td-card-skel">
				<div class="td-skel td-skel--icon"></div>
				<div class="td-skel-body">
					<div class="td-skel td-skel--title"></div>
					<div class="td-skel td-skel--bar"></div>
				</div>
				<div class="td-skel td-skel--pct"></div>
			</div>
		</div>

		<!-- ── EMPTY ── -->
		<div v-else-if="!DSTienDo.length" class="td-empty">
			<v-icon size="44" color="grey-lighten-2">mdi-book-off-outline</v-icon>
			<div class="td-empty-title">Chưa có dữ liệu tiến độ</div>
		</div>

		<!-- ── MÔN HỌC LIST ── -->
		<v-row v-else class="td-list ma-0 px-2">
			<v-col v-for="(td, idx) in DSTienDo" :key="td.MonHocID" cols="12" :sm="openIdx === idx ? 12 : 6"
				:lg="openIdx === idx ? 12 : 4" class="pa-2" style="transition: all .25s ease">
				<div class="td-card" :class="{ 'td-card--open': openIdx === idx }"
					:style="{ '--mon-color': td.Color || 'rgb(var(--v-theme-primary))' }">
					<!-- Card header -->
					<div class="td-card-header" @click="togglePanel(idx, td)">
						<div class="td-card-accent"></div>
						<div class="td-card-icon">
							<v-icon size="18" :color="td.Color || 'primary'">{{ td.Icon || 'mdi-book-outline' }}
							</v-icon>
						</div>
						<div class="td-card-info">
							<div class="td-card-name">{{ td.MonHocName }}</div>
							<div class="td-card-stats">
								<span class="td-card-done">{{ td.CompletedTasks }}/{{ td.TotalTasks }} nhiệm vụ</span>
								<div class="td-bar-wrap">
									<div class="td-bar" :style="{ width: calcProgress(td) + '%' }"></div>
								</div>
							</div>
						</div>
						<div class="td-card-right">
							<div class="td-pct-ring">
								<svg viewBox="0 0 36 36" class="td-ring-svg">
									<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="td-ring-track" />
									<circle cx="18" cy="18" r="14" fill="none" stroke-width="3" class="td-ring-fg"
										stroke-linecap="round" :stroke-dasharray="calcProgress(td) * 0.88 + ' 88'"
										transform="rotate(-90 18 18)" />
								</svg>
								<span class="td-pct-num">{{ Math.round(calcProgress(td)) }}</span>
							</div>
							<v-icon size="16" class="td-chevron" :class="{ 'td-chevron--open': openIdx === idx }">
								mdi-chevron-down
							</v-icon>
						</div>
					</div>

					<!-- ── DETAIL PANEL ── -->
					<div class="td-detail" :class="{ 'td-detail--open': openIdx === idx }">
						<div class="td-detail-inner">

							<div v-if="detailLoading" class="td-detail-loading">
								<div class="td-mini-spinner"></div>
								<span>Đang tải…</span>
							</div>

							<template v-else>
								<div class="td-summary-row" v-if="DetailMonHoc.Tong">
									<div class="td-sum-chip td-sum-chip--done">
										<v-icon size="12">mdi-check-circle-outline</v-icon>
										{{ DetailMonHoc.Tong.CompletedTasks ?? td.CompletedTasks }} hoàn thành
									</div>
									<div class="td-sum-chip td-sum-chip--pending">
										<v-icon size="12">mdi-clock-outline</v-icon>
										{{ td.TotalTasks - td.CompletedTasks }} còn lại
									</div>
									<v-spacer />
									<v-btn size="x-small" color="primary" variant="tonal" class="td-gradebook-btn"
										@click.stop="openGradebook(td)">
										<v-icon size="12" start>mdi-book-open-page-variant</v-icon>
										Sổ điểm
									</v-btn>
								</div>

								<div class="td-items-list">
									<div v-for="(ct, cidx) in DetailMonHoc.DanhSachChiTiet"
										:key="ct.AssignToClassID + '_' + cidx" class="td-item"
										@click="onOpenWindow(ct)">
										<div class="td-item-icon"
											:class="ct.ResourceType === 'ASSIGNMENT' ? 'td-item-icon--assign' : 'td-item-icon--lesson'">
											<v-icon size="13">
												{{ ct.ResourceType === 'ASSIGNMENT' ? 'mdi-pencil-box-outline' :
												'mdi-play-circle-outline' }}
											</v-icon>
										</div>
										<div class="td-item-body">
											<div class="td-item-title">{{ ct.Title }}</div>
											<div class="td-item-meta">
												<span v-if="ct.Tuan_HienThi">{{ ct.Tuan_HienThi }}</span>
												<span v-if="ct.DueDate" class="td-item-due">
													<v-icon size="10">mdi-calendar-clock</v-icon>
													{{ formatDate(ct.DueDate) }}
												</span>
											</div>
										</div>
										<div class="td-item-right">
											<div v-if="ct.StudentScore !== null && ct.StudentScore !== undefined"
												class="td-item-score">
												{{ ct.StudentScore }} / {{ct.MaxScore}}
											</div>
											<div v-else class="td-item-score td-item-score--empty">—</div>
											<v-icon size="13" color="grey-lighten-2">mdi-chevron-right</v-icon>
										</div>
									</div>

									<div v-if="!DetailMonHoc.DanhSachChiTiet.length" class="td-detail-empty">
										Chưa có bài tập hoặc bài học
									</div>
								</div>
							</template>
						</div>
					</div>

				</div>
			</v-col>
		</v-row>

		<uc-student-gradebook-dialog v-model:visible="gradebookVisible" :mon-hoc-id="gradebookMonHocId"
			:hoc-sinh-id="hocSinhID" :subject-name="gradebookMonHocName" :isMobile />
		<uc-iframe-window ref="iframeWindow" />
	</div>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number,
			HocSinh: Object,
			isMobile: Boolean
		},
		data() {
			return {
				isLoading: false,
				detailLoading: false,
				openIdx: null,
				DSTienDo: [],
				DetailMonHoc: {
					DanhSachChiTiet: [],
					Tong: null
				},
				gradebookVisible: false,
				gradebookMonHocId: null,
				gradebookMonHocName: '',
				vueData
			}
		},
		computed: {
			hocSinhID() {
				return this.HocSinh?.HocSinhID || vueData.user.UserID
			},
			overallPct() {
				if (!this.DSTienDo.length) return 0
				const total = this.DSTienDo.reduce((s, t) => s + (t.TotalTasks || 0), 0)
				const completed = this.DSTienDo.reduce((s, t) => s + (t.CompletedTasks || 0), 0)
				if (!total) return 0
				return Math.round((completed / total) * 100)
			}
		},
		async mounted() {
		},
		watch: {
			"HocSinh.HocSinhID": {
				immediate: true,
				async handler(hocSinhID) {
					if (!hocSinhID) return
					this.isLoading = true
					try {
						this.DSTienDo = await ajaxCALLPromise('lms/EL_Student_Get_TienDo_ByHocSinhID', {
							HocSinhID: hocSinhID,
							NienKhoa: this.NienKhoa
						})
					} finally {
						this.isLoading = false
					}
				}
			}
		},
		methods: {
			calcProgress(td) {
				if (!td?.TotalTasks) return 0
				return Math.min((td.CompletedTasks / td.TotalTasks) * 100, 100)
			},
	
			async togglePanel(idx, td) {
				if (this.openIdx === idx) {
					this.openIdx = null
					return
				}
				this.openIdx = idx
				this.DetailMonHoc.DanhSachChiTiet = []
				this.DetailMonHoc.Tong = null
				this.detailLoading = true
				try {
					const res = await ajaxCALLPromise('lms/EL_Student_GetSubjectProgressDetail', {
						MonHocID: td.MonHocID,
						HocSinhID: this.HocSinh?.HocSinhID
					})
					this.DetailMonHoc.DanhSachChiTiet = res[0] ?? []
					this.DetailMonHoc.Tong = res[1]?.[0] ?? null
				} finally {
					this.detailLoading = false
				}
			},
	
			openGradebook(td) {
				this.gradebookMonHocId = td.MonHocID
				this.gradebookMonHocName = td.MonHocName
				this.gradebookVisible = true
			},
	
			onOpenWindow(ct) {
				const isLesson = ct.ResourceType === 'LESSON'
	
				this.$refs.iframeWindow.openWindow({
					title: `Xem lại ${isLesson ? 'bài học' : 'bài tập'} ${ct.Title}`,
					url: isLesson
						? `/lms-student-lesson-viewer?AssignToClassID=${ct.AssignToClassID}&HocSinhID=${this.HocSinh.HocSinhID}`
						: `/lms-student-assignment?AssignToClassID=${ct.AssignToClassID}&HocSinhID=${this.HocSinh.HocSinhID}`
				})
			},
	
			formatDate(dateString) {
				if (!dateString) return ''
				return new Date(dateString).toLocaleDateString('vi-VN', {
					day: '2-digit', month: '2-digit', year: 'numeric'
				})
			}
		}
	}
</script>