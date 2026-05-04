<template>
	<div class="lms-dashboard-root teacher-dashboard" ref="containerPage">
		<!-- TOPBAR -->
		<v-toolbar border density="compact" class="bg-white border-sm"
			style="position:sticky;top:0;z-index:50;flex-shrink:0;">
			<template #title>
				<div class="d-flex align-center">
					<span class="text-subtitle-1 font-weight-semibold">{{ $t('message.ControlPanel') }}</span>
					<v-btn size="small" class="ms-2" variant="text"
						v-if="vueData.user.UserID == 'NA0000022' || vueData.user.UserID == 'NV0000134'"
						@click="onHandleOpenChangeGV">{{ $t('message.ChooseTeacher') }}</v-btn>
					<!-- BREADCRUMB -->
					<div class="lms-breadcrumb ms-3">
						<template v-for="(bc, i) in cascadeBreadcrumb" :key="i">
							<span v-if="i > 0" class="bc-sep">›</span>
							<span class="bc-chip" :class="bc.active ? 'bc-active' : bc.done ? 'bc-done' : 'bc-lock'"
								@click="bc.done ? resetCascadeFrom(bc.step) : null">{{ bc.label }}</span>
						</template>
					</div>
				</div>
			</template>
			<template #append>
				<v-btn ref="tourBtnThongKe" @click="OpenDashboard()">
					<v-icon class="me-1">mdi-blinds-horizontal-closed</v-icon>{{ $t('message.Statistical') }}
				</v-btn>
				<v-btn ref="tourBtnThuVien" @click="OpenMyLiberies()" class="me-1">
					<v-icon class="me-1">mdi-library-shelves</v-icon>{{ $t('message.MyDocument') }}
				</v-btn>
				<v-btn icon @click="startTour" class="me-1">
					<v-icon>mdi-help-circle-outline</v-icon>
					<v-tooltip activator="parent" location="bottom">{{ $t('message.TourGuide') }}</v-tooltip>
				</v-btn>
				<v-btn-toggle v-model="toggle" size="small">
					<v-btn :value="false" :disabled="!toggle" :color="!toggle ? 'green' : 'white'">
						<v-img src="/_cdn/lhbs-lms/img_page_ph/Viet.png" width="35" />
					</v-btn>
					<v-btn :value="true" :disabled="toggle" :color="toggle ? 'green' : 'white'">
						<v-img src="/_cdn/lhbs-lms/img_page_ph/Anh.png" width="35" />
					</v-btn>
				</v-btn-toggle>
			</template>
		</v-toolbar>

		<!-- 3-PANEL LAYOUT -->
		<div class="lms-layout">

			<!-- LEFT: CASCADE SIDEBAR -->
			<div class="lms-cascade" ref="tourCascade">
				<!-- Tier 1: Khối -->
				<div class="lms-tier">
					<div class="lms-tier-hd"><span class="lms-tier-label">{{ $t('message.Grade') }}</span></div>
					<div class="lms-tier-body">
						<!-- Skeleton khi đang tải -->
						<template v-if="loadingGroups">
							<div v-for="n in 4" :key="'sk-k-'+n" class="lms-t-item" style="pointer-events:none">
								<span class="lms-t-dot" style="background:#e0e0e0"></span>
								<v-skeleton-loader type="text" width="60%" style="flex:1" />
							</div>
						</template>
						<template v-else>
							<div v-for="k in DSKhoiCascade" :key="k.KhoiID" class="lms-t-item"
								:class="{ active: cascadeKhoiID === k.KhoiID }" @click="pickKhoi(k.KhoiID)">
								<span class="lms-t-dot" :style="{ background: k.dot }"></span>
								<span class="lms-t-label">{{ k.label }}</span>
								<v-icon v-if="cascadeKhoiID === k.KhoiID" size="14" color="teal">mdi-check</v-icon>
								<span v-else class="lms-t-arrow">›</span>
							</div>
						</template>
					</div>
				</div>

				<!-- Tier 2: Môn -->
				<div class="lms-tier">
					<div class="lms-tier-hd">
						<span class="lms-tier-label">{{ $t('message.Subject') }}</span>
						<button v-if="cascadeKhoiID" class="lms-tier-reset" @click="resetCascadeFrom(1)">{{ $t('message.ChangeGrade') }}</button>
					</div>
					<div class="lms-tier-body">
						<div v-if="!cascadeKhoiID" class="lms-tier-locked">
							<v-icon size="13">mdi-lock-outline</v-icon> {{ $t('message.SelectGradeFirst') }}
						</div>
						<div v-for="m in DSMonCascade" v-else :key="m.MonHocName" class="lms-t-item"
							:class="{ active: cascadeMonHocName === m.MonHocName }" @click="pickMon(m.MonHocName)">
							<span class="lms-t-dot" :style="{ background: m.dot }"></span>
							<span class="lms-t-label">{{ m.MonHocName === 'Ngoại ngữ' ? 'English' : m.MonHocName
								}}</span>
							<v-icon v-if="cascadeMonHocName === m.MonHocName" size="14" color="teal">mdi-check</v-icon>
							<span v-else class="lms-t-arrow">›</span>
						</div>
					</div>
				</div>

				<!-- Tier 3: Tuần -->
				<div class="lms-tier lms-tier-flex">
					<div class="lms-tier-hd">
						<span class="lms-tier-label">{{ $t('message.WeekStudy') }}</span>
						<button v-if="cascadeMonHocName" class="lms-tier-reset" @click="resetCascadeFrom(2)">{{ $t('message.ChangeSubject') }}</button>
					</div>
					<div class="lms-tier-body">
						<div v-if="!cascadeMonHocName" class="lms-tier-locked">
							<v-icon size="13">mdi-lock-outline</v-icon> {{ $t('message.SelectSubjectFirst') }}
						</div>
						<template v-else>
							<div v-for="w in DSTuanCascade" :key="w.TuanHocID" class="lms-t-item lms-t-item--week"
								:class="{ active: cascadeTuanID === w.TuanHocID }" @click="pickTuan(w.TuanHocID)">
								<div class="lms-t-label">
									<div>{{ w.Tuan_HienThi }}</div>
									<div class="d-flex ga-1 mt-1">
										<span v-if="w.ok" class="lms-pill lms-pill-ok">{{ w.ok }}</span>
										<span v-if="w.warn" class="lms-pill lms-pill-warn">{{ w.warn }}</span>
										<span v-if="w.danger" class="lms-pill lms-pill-danger">{{ w.danger }}</span>
									</div>
								</div>
								<v-icon v-if="cascadeTuanID === w.TuanHocID" size="14" color="teal">mdi-check</v-icon>
								<span v-else class="lms-t-arrow">›</span>
							</div>
							<!-- Fallback: tuần hiện tại chưa có dữ liệu -->
							<div v-if="currentTuanFallback" class="lms-t-item lms-t-item--week"
								:class="{ active: cascadeTuanID === currentTuanFallback.TuanHocID }"
								@click="pickTuan(currentTuanFallback.TuanHocID)">
								<div class="lms-t-label">
									<div>{{ currentTuanFallback.Tuan_HienThi }}</div>
									<div class="d-flex ga-1 mt-1">
										<span class="lms-pill lms-pill-warn">{{ $t('message.NoLessonYet') }}</span>
									</div>
								</div>
								<v-icon v-if="cascadeTuanID === currentTuanFallback.TuanHocID" size="14"
									color="teal">mdi-check</v-icon>
								<span v-else class="lms-t-arrow">›</span>
							</div>
						</template>
					</div>
				</div>
			</div><!-- /lms-cascade -->

			<!-- CENTER: MAIN CONTENT -->
			<div class="lms-main">
				<!-- Empty state -->
				<template v-if="!cascadeTuanID">
					<div class="lms-empty-state">
						<v-icon size="44" class="mb-3 opacity-40">mdi-table-search</v-icon>
						<p class="text-body-2 font-weight-medium text-medium-emphasis">
							{{ !cascadeKhoiID ? $t('message.SelectGradeToStart') : !cascadeMonHocName ? $t('message.SelectSubjectFirst') : $t('message.SelectWeekStudy') }}
						</p>
						<p class="text-caption text-disabled">{{ $t('message.CurrentWeekAutoSelected') }}</p>
					</div>
				</template>

				<template v-else>
					<!-- Panel header -->
					<div class="lms-panel-head">
						<div>
							<div class="lms-panel-title">
								{{ cascadeMonHocName === 'Ngoại ngữ' ? 'English' : cascadeMonHocName }}
								&nbsp;·&nbsp;{{ cascadeTuanHienThi }}
							</div>
							<div class="lms-panel-sub">{{ $t('message.Grade') }} {{ cascadeKhoiID }}</div>
						</div>
						<div v-if="cascadeKhoiItem" class="d-flex ga-2">
							<v-btn color="teal" variant="outlined" size="small"
								@click="OpenModalAddNoiDung(cascadeKhoiItem, 1)">
								<v-icon start>mdi-plus</v-icon>{{ $t('message.AddLesson') }}
							</v-btn>
							<v-btn color="primary" variant="outlined" size="small"
								@click="OpenModalAddNoiDung(cascadeKhoiItem, 0)">
								<v-icon start>mdi-plus</v-icon>{{ $t('message.AddAssignment') }}
							</v-btn>
						</div>
					</div>

					<!-- Stat grid -->
					<div class="lms-stat-grid" ref="tourStatGrid">
						<div class="lms-stat-card lms-stat-ok">
							<div class="lms-stat-val">{{ centerStats.ok }}</div>
							<div class="lms-stat-label">{{ $t('message.ClassCompleted') }}</div>
						</div>
						<div class="lms-stat-card lms-stat-warn">
							<div class="lms-stat-val">{{ centerStats.warn }}</div>
							<div class="lms-stat-label">{{ $t('message.ClassNeedGrade') }}</div>
						</div>
						<div class="lms-stat-card lms-stat-danger">
							<div class="lms-stat-val">{{ centerStats.danger }}</div>
							<div class="lms-stat-label">{{ $t('message.ClassNoAssignment') }}</div>
						</div>
					</div>

					<!-- Classes + assignments -->
					<div class="lms-table-card" ref="tourClassTable">
						<div class="lms-table-card-head">
							<span class="lms-table-card-title">{{ $t('message.ClassAndAssignmentList') }}</span>
							<span class="text-caption text-disabled">{{ centerClasses.length }} lớp</span>
						</div>
						<div v-if="centerClasses.length === 0"
							class="text-center pa-8 text-disabled d-flex justify-center align-center flex-column">
							<v-icon size="32" class="mb-2 d-block opacity-40">mdi-table-off</v-icon>
							<span class="text-body-2">{{ $t('message.ClassNotAssigned') }}</span>
						</div>
						<template v-else>
							<div v-for="classItem in centerClasses" :key="classItem.LopID">
								<template v-if="classItem.LopID !== -1">
									<!-- Class header row -->
									<div class="lms-class-row">
										<div class="d-flex align-center ga-3">
											<span class="lms-lop-badge">{{ classItem.TenLop }}</span>
											<div>
												<div class="lms-class-name">{{ classItem.TenLop }}</div>
												<div class="lms-class-meta">
													<span>{{ $t('message.ClassSize') }}: {{ classItem.StudentCount }} {{
														$t('message.Students') }}</span>
													<span v-if="getPendingCount(classItem) > 0" class="lms-pending-tag">
														<v-icon size="13">mdi-alert-circle</v-icon>
														{{ getPendingCount(classItem) }} {{ $t('message.NeedGrade') }}
													</span>
												</div>
											</div>
										</div>
										<v-btn icon size="small" variant="text" color="purple"
											@click="xemTinhTrang(classItem)">
											<v-icon>mdi-table-eye</v-icon>
											<v-tooltip activator="parent" location="top">{{ $t('message.ViewGradebook')
												}}</v-tooltip>
										</v-btn>
									</div>
									<!-- Assignment rows -->
									<div class="lms-assignments-body">
										<uc-assignment-status-row v-for="assignment in classItem.assignments"
											:key="assignment.AssignToClassID" :assignment="assignment" />
										<div v-if="!classItem.assignments || classItem.assignments.length === 0"
											class="text-center text-grey pa-3 text-caption">
											{{ $t('message.ClassNotAssigned') }}
										</div>
									</div>
								</template>
								<template v-else>
									<v-divider class="my-2" />
									<uc-assignment-status-row-assign-to-student
										:assignment="classItem.assignments.reduce((result, item) => result.AssignToStudentID > item.AssignToStudentID ? result : item)" />
								</template>
							</div>
						</template>
					</div>
				</template>
			</div><!-- /lms-main -->

			<!-- RIGHT: CHẤM BÀI SIDEBAR -->
			<div class="lms-right-sidebar" ref="tourRightSidebar">
				<div class="lms-right-hd">
					<div class="lms-right-title">
						<v-icon size="15" color="teal" class="me-1">mdi-check-circle-outline</v-icon>
						{{ $t('message.AssignmentsToGrade') }}
					</div>
				</div>
				<div class="lms-right-body">
					<uc-focus-task :khoiID="cascadeKhoiID" />
				</div>
			</div><!-- /lms-right-sidebar -->

		</div><!-- /lms-layout -->

		<uc-btn-with-dialog-add-bt v-model:is-open="isShowModalAddNoiDung" v-if="isShowModalAddNoiDung" :khoi-item="KhoiItem"
			:tuan-hoc-id="cascadeTuanID" :default-type="defaultType" />
		<uc-my-liberies v-model:is-open="isShowMyLiberies" :ds-mon-hoc-active="DSMonHocActive" :teaching-groups="teachingGroups" v-if="isShowMyLiberies"
			v-model:content-library="contentLibrary" @create-content="(item) => { this.OpenModalAddNoiDung(item) }" />
		<uc-change-user v-if="isShowModalChangeUser" v-model:is-open="isShowModalChangeUser"
			:giaovienid="vueData.GiaoVienID_Selected" />

		<!-- Onboarding drawer (first-time only) -->
		<uc-onboarding v-model="drawerOnboarding" @done="onOnboardingDone" @start-tour="startTour" />

		<!-- Feature tour spotlight -->
		<uc-tour-overlay :active="tourActive" :step="tourStep" :total-steps="tourSteps.length"
			:title="tourSteps[tourStep] && tourSteps[tourStep].title"
			:body="tourSteps[tourStep] && tourSteps[tourStep].body" :target-rect="tourTargetRect" @prev="tourPrev"
			@next="tourNext" @close="closeTour" />
	</div>
</template>

<script>
	export default {
		name: 'uc-lms-tc-dashboard-v2',
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			const toggle = localStorage.getItem('IsLanguage') ? (localStorage.getItem('IsLanguage') == 'true' ? true : false) : false
			this.$i18n.locale = toggle ? "en" : "vi"
			return {
				isShowModalChangeUser: false,
				activeTab: 'classes', x: null, vueData,
				isShowModalAddNoiDung: false, defaultType: 0, DSMonHocActive: [],
				panel: [0],
				panelChild: [0],
				KhoiItem: {},
				isShowMyLiberies: false,
				assignmentNeedGradingPanel: [],
				isOpen: false,
				url: '',
				toggle,
				filterStatus: [],
				statuses: {
					'PENDING_GRADING': { color: 'warning', icon: 'mdi-file-clock-outline', iconColor: '#fb8c00', text: this.$t('message.NeedGrade'), cardClass: 'warning' },
					'OVERDUE': { color: 'error', icon: 'mdi-calendar-remove', iconColor: '#f44336', text: this.$t('message.OverDue'), cardClass: 'urgent' },
					'UPCOMING': { color: 'primary', icon: 'mdi-calendar-arrow-right', iconColor: '#1976d2', text: this.$t('message.Coming'), cardClass: 'primary' }
				},
				filterArray: [
					{ title: this.$t('message.NeedGrade'), value: 'PENDING_GRADING' },
					{ title: this.$t('message.OverDue'), value: 'OVERDUE' },
					{ title: this.$t('message.Coming'), value: 'UPCOMING' }
				],
				KhoiFilter: null,
				LopFilter: null,
				page: 1,
				pageSize: 10,
				isShowModalFocusTask: false,
				// Cascade sidebar state
				cascadeKhoiID: null,
				cascadeMonHocName: null,
				cascadeTuanID: null,
				// Onboarding
				drawerOnboarding: false,
				// Feature tour
				tourActive: false,
				tourStep: 0,
				tourTargetRect: null,
				tourStepKeys: [
					{ ref: 'tourCascade', titleKey: 'TourStep1Title', bodyKey: 'TourStep1Body' },
					{ ref: 'tourStatGrid', titleKey: 'TourStep2Title', bodyKey: 'TourStep2Body' },
					{ ref: 'tourClassTable', titleKey: 'TourStep3Title', bodyKey: 'TourStep3Body' },
					{ ref: 'tourRightSidebar', titleKey: 'TourStep4Title', bodyKey: 'TourStep4Body' },
					{ ref: 'tourBtnThuVien', titleKey: 'TourStep5Title', bodyKey: 'TourStep5Body' },
					{ ref: 'tourBtnThongKe', titleKey: 'TourStep6Title', bodyKey: 'TourStep6Body' },
				],
				khoiDotColors: ['#378ADD', '#1D9E75', '#BA7517', '#7F77DD', '#D85A30', '#888780'],
				monDotColors: {
					'Toán': '#378ADD', 'Tiếng Việt': '#1D9E75', 'Ngoại ngữ': '#7F77DD',
					'Khoa học': '#D85A30', 'Lịch sử': '#BA7517', 'Địa lý': '#D4537E',
					'Mỹ thuật': '#888780', 'Thể dục': '#888780', 'Tin học': '#378ADD',
					'GDCD': '#D4537E', 'Vật lý': '#BA7517', 'Hóa học': '#1D9E75',
					'Sinh học': '#3B6D11', 'Âm nhạc': '#D4537E',
				},
			}
		},
		emits: ['view-class', 'grade-class', 'create-assignment'],
		props: {
			loadingGroups: Boolean,
			focusTasks: Array,
			teachingGroups: Array,
			schedule: Array,
			activities: Array,
			contentLibrary: Array,
		},
		computed: {
			tourSteps() {
				return this.tourStepKeys.map(s => ({
					ref: s.ref,
					title: this.$t('message.' + s.titleKey),
					body: this.$t('message.' + s.bodyKey),
				}))
			},
			focusTaskFiltered() {
				return this.focusTasks.concat(vueData.focusTasks_student).filter(task => {
					// 1. Filter theo trạng thái (nhiều trạng thái)
					if (this.filterStatus.length > 0 && !this.filterStatus.includes(task.Status)) {
						return false
					}
	
					// 2. Filter theo Khối
					if (this.KhoiFilter && this.KhoiFilter != -1 && task.KhoiID !== this.KhoiFilter) {
						return false
					}
	
					// 3. Filter theo Lớp
					if (this.LopFilter && task.LopID !== this.LopFilter) {
						return false
					}
	
					return true
				});
			},
			DSKhoi() {
				return this.focusTasks.reduce((acc, task) => {
					if (task.KhoiID && !acc.some(x => x.value === task.KhoiID)) {
						acc.push({ title: this.$t('message.Grade') + ' ' + task.KhoiID, value: task.KhoiID });
					}
					return acc;
				}, [{ title: this.$t('message.All'), value: -1 }]);
			},
			DSLop() {
				return this.focusTasks.reduce((acc, task) => {
					if (task.LopID && !acc.some(x => x.value === task.LopID)) {
						acc.push({ title: task.TenLopHoacNhom, value: task.LopID, KhoiID: task.KhoiID });
					}
					return acc;
				}, []).filter(item => {
					if (!this.KhoiFilter) return true;
					return this.KhoiFilter == -1 ? true : item.KhoiID == this.KhoiFilter;
				});
			},
			pagedItems() {
				const start = (this.page - 1) * this.pageSize;
				return this.focusTaskFiltered.slice(start, start + this.focusTaskFiltered.length);
			},
			totalPages() {
				return Math.ceil(this.focusTaskFiltered.length / this.focusTaskFiltered.length)
			},
			// ── Cascade computeds ──────────────────────────────────────
			DSKhoiCascade() {
				const seen = {}, result = []
				this.teachingGroups.forEach(g => {
					if (!seen[g.KhoiID]) {
						seen[g.KhoiID] = true
						result.push({
							KhoiID: g.KhoiID,
							label: this.$t('message.Grade') + ' ' + g.KhoiID,
							dot: this.khoiDotColors[result.length % this.khoiDotColors.length]
						})
					}
				})
				return result.sort((a, b) => a.KhoiID - b.KhoiID)
			},
			DSMonCascade() {
				if (!this.cascadeKhoiID) return []
				const seen = {}, result = []
				this.teachingGroups.filter(g => g.KhoiID === this.cascadeKhoiID).forEach(g => {
					if (!seen[g.MonHocName]) {
						seen[g.MonHocName] = true
						result.push({ MonHocName: g.MonHocName, dot: this.monDotColors[g.MonHocName] || '#888780' })
					}
				})
				return result
			},
			currentTuanFallback() {
				if (!this.cascadeMonHocName || this.DSTuanCascade.length > 0) return null
				const active = vueData.DSTuanHoc?.find(t => t.Is_Active)
				if (!active) return null
				return { TuanHocID: active.TuanHocID, Tuan_HienThi: active.Tuan_HienThi || ('Tuần ' + active.TuanHocID) }
			},
			DSTuanCascade() {
				if (!this.cascadeKhoiID || !this.cascadeMonHocName) return []
				const group = this.teachingGroups.find(g => g.KhoiID === this.cascadeKhoiID && g.MonHocName === this.cascadeMonHocName)
				if (!group || !group.weeks) return []
				return [...group.weeks].sort((a, b) => b.TuanHocID - a.TuanHocID).map(w => {
					const classes = w.sortedClasses || w.classes || []
					const real = classes.filter(c => c.LopID !== -1)
					return {
						TuanHocID: w.TuanHocID,
						Tuan_HienThi: w.Tuan_HienThi,
						sortedClasses: classes,
						ok: real.filter(c => c.assignments?.length > 0 && this.getPendingCount(c) === 0).length,
						warn: real.filter(c => this.getPendingCount(c) > 0).length,
						danger: real.filter(c => !c.assignments || c.assignments.length === 0).length,
					}
				})
			},
			centerClasses() {
				if (!this.cascadeTuanID) return []
				const week = this.DSTuanCascade.find(w => w.TuanHocID === this.cascadeTuanID)
				return week ? week.sortedClasses : []
			},
			centerStats() {
				const real = this.centerClasses.filter(c => c.LopID !== -1)
				return {
					ok: real.filter(c => c.assignments?.length > 0 && this.getPendingCount(c) === 0).length,
					warn: real.filter(c => this.getPendingCount(c) > 0).length,
					danger: real.filter(c => !c.assignments || c.assignments.length === 0).length,
				}
			},
			cascadeKhoiItem() {
				if (!this.cascadeKhoiID || !this.cascadeMonHocName) return null
				return this.teachingGroups.find(g => g.KhoiID === this.cascadeKhoiID && g.MonHocName === this.cascadeMonHocName) || null
			},
			cascadeTuanHienThi() {
				if (!this.cascadeTuanID) return null
				const week = this.DSTuanCascade.find(w => w.TuanHocID === this.cascadeTuanID)
				return week ? week.Tuan_HienThi : null
			},
			cascadeBreadcrumb() {
				const monLabel = this.cascadeMonHocName ? (this.cascadeMonHocName === 'Ngoại ngữ' ? 'English' : this.cascadeMonHocName) : this.$t('message.Subject')
				return [
					{ label: this.cascadeKhoiID ? this.$t('message.Grade') + ' ' + this.cascadeKhoiID : this.$t('message.Grade'), done: !!this.cascadeKhoiID, active: !this.cascadeKhoiID, step: 0 },
					{ label: monLabel, done: !!this.cascadeMonHocName, active: !!this.cascadeKhoiID && !this.cascadeMonHocName, step: 1 },
					{ label: this.cascadeTuanHienThi || this.$t('message.WeekStudy'), done: !!this.cascadeTuanID, active: !!this.cascadeMonHocName && !this.cascadeTuanID, step: 2 },
				]
			},
		},
		watch: {
			teachingGroups: {
				handler(newVal) {
					if (!newVal || newVal.length === 0) return
					this.DSMonHocActive = [...new Set(newVal.map(item => item.MonHocName))].map(mh => {
						const groups = newVal.filter(item => item.MonHocName == mh)
						groups.forEach(g => {
							g.allIndices = g.weeks?.map((_, i) => i) ?? []
							g.weeks?.forEach(w => {
								w.sortedClasses = [...w.classes].sort((a, b) => b.LopID - a.LopID)
								w.allClassIndices = w.classes.map((_, i) => i)
							})
						})
						return {
							MonHocName: mh,
							activeTab: groups[0].KhoiID,
							groups,
							groupsWithWeeks: groups.filter(g => g.weeks?.length > 0),
						}
					})
				},
				immediate: false,
			},
			activeTab: function (newVal) {
				this.$nextTick(() => {
					this.panel = [0]
					this.panelChild = [0]
				})
			},
			contentLibrary: function (newVal) {
			},
			toggle: function (val) {
				localStorage.setItem('IsLanguage', val)
				if (val) {
					this.$i18n.locale = 'en'
				}
				else this.$i18n.locale = 'vi';
			},
			KhoiFilter: function (val) {
				if (val) {
					this.LopFilter = null
					this.filterStatus = []
				}
			},
			LopFilter: function (val) {
				if (val) {
					this.filterStatus = []
				}
			}
	
		},
		created() {
			this.DSMonHocActive = [...new Set(this.teachingGroups.map(item => item.MonHocName))].map(mh => {
				const groups = this.teachingGroups.filter(item => item.MonHocName == mh)
				groups.forEach(g => {
					g.allIndices = g.weeks?.map((_, i) => i) ?? []
					g.weeks?.forEach(w => {
						w.sortedClasses = [...w.classes].sort((a, b) => b.LopID - a.LopID)
						w.allClassIndices = w.classes.map((_, i) => i)
					})
				})
				return {
					MonHocName: mh,
					activeTab: groups[0].KhoiID,
					groups,
					groupsWithWeeks: groups.filter(g => g.weeks?.length > 0),
				}
			})
		},
		mounted() {
			if (this.teachingGroups && this.teachingGroups.length > 0) {
				this.activeTab = this.teachingGroups[0].KhoiID
			}
			if (!localStorage.getItem('lms-tc-tour-done')) {
				this.drawerOnboarding = true
			}
		},
		methods: {
			getPendingCount(classItem) {
				if (!classItem.assignments) return 0;
				return classItem.assignments.reduce((sum, a) => {
					return sum + (a.PendingGradingCount || 0);
				}, 0);
			},
			xemTinhTrang(assignment) {
				this.iframeRef.value.openWindow({
					title: this.$t('message.ClassGradebook'),
					url: `/lms-teacher-gradebook?LopID=${assignment.LopID}&MonHocID=${assignment.MonHocID}&HocKi=${vueData.NienKhoaItem?.HocKi}&AssignType=CLASS`,
					onclose: () => vueData.initPage()
				});
			},
			OpenModalAddNoiDung(KhoiItem, type = 0) {
				this.KhoiItem = { ...KhoiItem }
				this.defaultType = type
				this.isShowModalAddNoiDung = true;
			},
			OpenMyLiberies() {
				this.isShowMyLiberies = true;
			},
			OpenDashboard() {
				this.iframeRef.value.openWindow({
					title: this.$t('message.LearningTracking'),
					url: `/lms-teacher-theo-doi-hoc-tap?HocKi=${vueData.NienKhoaItem.HocKi}`,
				})
			},
			onHandleOpenChangeGV() {
				console.log('this.isShowModalChangeUser', this.isShowModalChangeUser)
				this.isShowModalChangeUser = true
			},
			TestUIFocusTask() {
				this.isShowModalFocusTask = true
			},
			// ── Onboarding & Tour methods ─────────────────────────────
			onOnboardingDone() {
				localStorage.setItem('lms-tc-tour-done', '1')
				this.drawerOnboarding = false
			},
			startTour() {
				this.tourActive = true
				this.tourStep = 0
				this.$nextTick(() => this.updateTourRect())
			},
			updateTourRect() {
				const stepDef = this.tourSteps[this.tourStep]
				if (!stepDef) { this.tourActive = false; return }
				const el = this.$refs[stepDef.ref]
				const domEl = el ? (el.$el ?? el) : null
				if (!domEl) { this.tourTargetRect = null; return }
				const r = domEl.getBoundingClientRect()
				this.tourTargetRect = { top: r.top, left: r.left, width: r.width, height: r.height }
			},
			tourNext() {
				if (this.tourStep < this.tourSteps.length - 1) {
					this.tourStep++
					this.$nextTick(() => this.updateTourRect())
				} else {
					this.closeTour()
				}
			},
			tourPrev() {
				if (this.tourStep > 0) {
					this.tourStep--
					this.$nextTick(() => this.updateTourRect())
				}
			},
			closeTour() {
				this.tourActive = false
				this.tourTargetRect = null
			},
			// ── Cascade methods ────────────────────────────────────────
			pickKhoi(khoiID) {
				if (this.cascadeKhoiID === khoiID) return
				this.cascadeKhoiID = khoiID
				this.cascadeMonHocName = null
				this.cascadeTuanID = null
			},
			pickMon(monHocName) {
				if (this.cascadeMonHocName === monHocName) return
				this.cascadeMonHocName = monHocName
				this.cascadeTuanID = null
				this.$nextTick(() => {
					if (this.DSTuanCascade.length > 0) {
						this.cascadeTuanID = this.DSTuanCascade[0].TuanHocID
					}
				})
			},
			pickTuan(tuanID) {
				this.cascadeTuanID = tuanID
			},
			resetCascadeFrom(step) {
				if (step === 0) { this.cascadeKhoiID = null; this.cascadeMonHocName = null; this.cascadeTuanID = null }
				else if (step === 1) { this.cascadeMonHocName = null; this.cascadeTuanID = null }
				else if (step === 2) { this.cascadeTuanID = null }
			},
		}
	}
</script>