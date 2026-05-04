<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					<div class="td-header-title-wrap">
						<div class="td-header-title">{{ TitlePage }}</div>
						<div class="td-header-subtitle">Bảng điều khiển giảng dạy</div>
					</div>
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" md="8" class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" @click="OpenDashboard">
								<v-icon class="me-1">mdi-view-dashboard-outline</v-icon>{{ $t('message.Statistical') }}
							</v-btn>
							<v-btn variant="tonal" color="teal" @click="OpenMyLiberies">
								<v-icon class="me-1">mdi-library-shelves</v-icon>{{ $t('message.MyDocument') }}
							</v-btn>
							<v-btn v-if="isDevUser" variant="outlined" color="warning" @click="isShowModalChangeUser = true">
								<v-icon class="me-1">mdi-account-switch</v-icon>Chọn GV
							</v-btn>
						</v-col>
						<v-col cols="12" md="4" class="d-flex justify-md-end align-center ga-2 flex-wrap">
							<v-btn-toggle v-model="toggle" density="compact">
								<v-btn :value="false" :disabled="!toggle" :color="!toggle ? 'green' : 'white'" size="small">
									<v-img src="/_cdn/lhbs-lms/img_page_ph/Viet.png" width="35" />
								</v-btn>
								<v-btn :value="true" :disabled="toggle" :color="toggle ? 'green' : 'white'" size="small">
									<v-img src="/_cdn/lhbs-lms/img_page_ph/Anh.png" width="35" />
								</v-btn>
							</v-btn-toggle>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<div class="teacher-dashboard">
			<section class="dashboard-summary">
				<div class="metric-card">
					<div class="metric-label">Môn học</div>
					<div class="metric-value">{{ totalMonHoc }}</div>
				</div>
				<div class="metric-card">
					<div class="metric-label">Lớp đang phụ trách</div>
					<div class="metric-value">{{ totalLop }}</div>
				</div>
				<div class="metric-card">
					<div class="metric-label">Bài cần chấm</div>
					<div class="metric-value metric-value--warning">{{ totalPendingCount }}</div>
				</div>
			</section>

			<div class="dashboard-grid">
				<!-- Assignment Section - Full Width Top -->
				<section class="dashboard-section assignment-section">
					<div class="dashboard-section-title">{{ $t('message.AssignmentsToGrade') }}</div>
					<uc-focus-task />
				</section>

				<!-- Subject Section - Full Width Bottom -->
				<section class="dashboard-section subject-section" v-if="DSMonHocActive.length > 0">
				<div class="dashboard-section-title">{{ $t('message.Subject') }}</div>
				
				<!-- Subject Tabs -->
				<v-tabs v-model="activeSubjectTab" bg-color="transparent" class="subject-tabs">
					<v-tab v-for="mh in DSMonHocActive" :key="mh.MonHocName" :value="mh.MonHocName">
						{{ getSubjectDisplayName(mh.MonHocName) }}
						<v-chip size="x-small" variant="tonal" color="primary" class="ms-2">
							{{ (subjectGroupsMap[mh.MonHocName] || []).length }}
						</v-chip>
					</v-tab>
				</v-tabs>

				<!-- Subject Tab Content -->
				<v-tabs-window v-model="activeSubjectTab" class="subject-tabs-window">
					<v-tabs-window-item v-for="mh in DSMonHocActive" :key="mh.MonHocName" :value="mh.MonHocName">
						<div class="subject-content">
							<div class="subject-shell-actions mb-3">
								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn color="primary" variant="outlined" size="small" v-bind="props">
											<v-icon>mdi-plus</v-icon>{{ $t('message.CreateContent') }}
										</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="KhoiItem in (subjectGroupsMap[mh.MonHocName] || [])"
											:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID"
											@click="OpenModalAddNoiDung(KhoiItem)">
											<v-list-item-title>{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>

							<!-- Grade Tabs (Khối) -->
							<v-tabs v-model="mh.activeTab" bg-color="transparent" class="mb-3" density="compact">
								<v-tab
									v-for="KhoiItem in (subjectGroupsMap[mh.MonHocName] || []).filter(item => item.weeks.length > 0)"
									:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
									{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}
								</v-tab>
							</v-tabs>

							<!-- Grade Tab Content -->
							<v-tabs-window v-model="mh.activeTab">
								<v-tabs-window-item
									v-for="KhoiItem in (subjectGroupsMap[mh.MonHocName] || [])"
									:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
									<v-card flat>
										<v-card-text class="pa-1">
											<div v-if="!KhoiItem.weeks || KhoiItem.weeks.length === 0" class="text-grey-darken-1 pa-2">
												{{ $t('message.EmptyLessonAndAssignment') }}
											</div>
											<v-data-table
												v-else
												:headers="[]"
												:items="buildKhoiTableRows(KhoiItem)"
												item-value="_key"
												items-per-page="-1"
												hide-default-footer
												hide-default-header
												density="compact"
												class="td-khoi-table"
											>
												<template #body="{ items }">
													<tbody>
														<tr v-for="row in items" :key="row.raw._key" :class="getRowClass(row.raw)">
															<template v-if="row.raw.rowType === 'week-header'">
																<td colspan="7" class="td-khoi-week-row">
																	<div class="td-khoi-week-container">
																		<v-btn
																			:icon="row.raw.isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
																			size="x-small"
																			variant="text"
																			@click="toggleWeekExpand(row.raw.weekKey)"
																			class="me-2"
																		/>
																		<span class="font-weight-medium">{{ row.raw.Tuan_HienThi }}</span>
																		<v-chip v-if="row.raw.Is_Tuan_Active" size="x-small" color="success" variant="tonal" class="ms-3">
																			Tuần hiện tại
																		</v-chip>
																	</div>
																</td>
															</template>
															<template v-else-if="row.raw.rowType === 'class-header'">
																<td colspan="7" class="td-khoi-class-row">
																	<div class="td-khoi-class-container">
																		<v-btn
																			:icon="row.raw.isExpanded ? 'mdi-chevron-down' : 'mdi-chevron-right'"
																			size="x-small"
																			variant="text"
																			@click="toggleClassExpand(row.raw.classId)"
																			class="me-2"
																		/>
																		<span class="font-weight-medium">{{ row.raw.TenLop }}</span>
																		<v-chip v-if="row.raw.pendingDetail > 0" size="x-small" color="warning" variant="tonal" class="ms-3">
																			{{ row.raw.pendingDetail }} cần chấm
																		</v-chip>
																	</div>
																</td>
															</template>
															<template v-else-if="row.raw.rowType === 'assignment'">
																<td class="td-khoi-assignment-row">
																	<v-chip size="x-small" variant="tonal" :color="row.raw.ResourceType === 'ASSIGNMENT' ? 'primary' : 'teal'">
																		{{ resourceTypeLabel(row.raw.ResourceType) }}
																	</v-chip>
																</td>
																<td colspan="3" class="td-khoi-assignment-row">
																	<span class="text-body-2">{{ row.raw.Title }}</span>
																</td>
																<td class="td-khoi-assignment-row">
																	<span class="text-caption">{{ formatDueDate(row.raw.DueDate) }}</span>
																</td>
																<td class="td-khoi-assignment-row">
																	<v-chip v-if="row.raw.Pending > 0" size="x-small" color="warning" variant="tonal">
																		{{ row.raw.Pending }}
																	</v-chip>
																	<span v-else class="text-medium-emphasis text-caption">-</span>
																</td>
																<td class="td-khoi-assignment-row">
																	<v-btn
																		v-if="row.raw.classItem && row.raw.classItem.LopID != -1"
																		size="x-small"
																		variant="text"
																		icon="mdi-table-eye"
																		color="indigo"
																		@click="xemTinhTrang(row.raw.classItem)"
																	/>
																</td>
															</template>
														</tr>
													</tbody>
												</template>
											</v-data-table>
										</v-card-text>
									</v-card>
								</v-tabs-window-item>
							</v-tabs-window>
						</div>
					</v-tabs-window-item>
				</v-tabs-window>
				<v-empty-state icon="mdi-magnify" v-else class="border elevation-2 mx-2"
					:text="$t('message.ContactDev')" :title="$t('message.NotFoundSubject')" />
			</div>
		</div>

		<uc-btn-with-dialog-add-bt v-if="isShowModalAddNoiDung" v-model:isOpen="isShowModalAddNoiDung" :KhoiItem />
		<uc-my-liberies v-if="isShowMyLiberies" v-model:isOpen="isShowMyLiberies"
			:DSMonHocActive :teachingGroups
			v-model:contentLibrary="contentLibrary"
			@CreateContent="item => OpenModalAddNoiDung(item)" />
		<uc-change-user v-if="isShowModalChangeUser" v-model:isOpen="isShowModalChangeUser"
			:giaovienid="vueData.GiaoVienID_Selected" />
	</Global>
</template>

<script>
export default {
	inject: ['snackbarRef', 'iframeRef'],
	data() {
		const toggle = localStorage.getItem('IsLanguage') === 'true'
		this.$i18n.locale = toggle ? 'en' : 'vi'
		return {
			vueData,
			teachingGroups: [],
			contentLibrary: [],
			DSMonHocActive: [],
			toggle,
			assignmentNeedGradingPanel: [],
			isShowModalAddNoiDung: false,
			isShowMyLiberies: false,
			isShowModalChangeUser: false,
			KhoiItem: {},
			expandedWeeks: {},  // Use object instead of Set for Vue 3 reactivity
			expandedClasses: {},  // Use object instead of Map for Vue 3 reactivity
			activeSubjectTab: null,  // Track the active subject tab
		}
	},
	computed: {
		TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
		isDevUser() { return vueData.user.UserID === 'NA0000022' || vueData.user.UserID === 'NV0000134' },
		khoiTableHeaders() {
			return [
				{ title: 'Tuần', key: 'Tuan_HienThi', sortable: false, width: 120 },
				{ title: 'Lớp', key: 'TenLop', sortable: false, width: 140 },
				{ title: 'Loại', key: 'ResourceType', sortable: false, width: 90 },
				{ title: 'Nội dung', key: 'Title', sortable: false },
				{ title: 'Hạn nộp', key: 'DueDate', sortable: false, width: 120 },
				{ title: 'Cần chấm', key: 'Pending', sortable: false, align: 'center', width: 90 },
				{ title: '', key: 'actions', sortable: false, align: 'center', width: 56 },
			]
		},
		subjectGroupsMap() {
			return this.teachingGroups.reduce((acc, item) => {
				if (!acc[item.MonHocName]) acc[item.MonHocName] = []
				acc[item.MonHocName].push(item)
				return acc
			}, {})
		},
		totalMonHoc() {
			return this.DSMonHocActive.length
		},
		totalLop() {
			const classSet = new Set()
			this.teachingGroups.forEach(group => {
				group.weeks?.forEach(week => {
					week.classes?.forEach(cls => {
						if (cls.LopID !== -1) classSet.add(cls.LopID)
					})
				})
			})
			return classSet.size
		},
		totalPendingCount() {
			let total = 0
			this.teachingGroups.forEach(group => {
				group.weeks?.forEach(week => {
					week.classes?.forEach(cls => {
						total += this.getPendingCount(cls)
					})
				})
			})
			return total
		},
	},
	watch: {
		'vueData.NienKhoa'() { this.initPage() },
		toggle(val) {
			localStorage.setItem('IsLanguage', val)
			this.$i18n.locale = val ? 'en' : 'vi'
		},
	},
	mounted() {
		vueData.initPage = () => this.initPage()
		this.initPage()
	},
	methods: {
		async initPage() {
			const [resDashboard, resLibrary, resFocusTasks] = await Promise.all([
				fetchPromise('lms/EL_Teacher_GetGroupedDashboard', { HocKi: vueData.NienKhoaItem?.HocKi }, { cache: false }),
				fetchPromise('lms/EL_Teacher_GetMyContentLibrary', { NienKhoa: vueData.NienKhoa }, { cache: false }),
				fetchPromise('lms/EL_Teacher_GetFocusTasks_Student', {}, { cache: false }),
			])
			this.renderTeachingGroups(resDashboard)
			this.contentLibrary = this.processLibraryData(resLibrary)
			vueData.focusTasks_student = resFocusTasks
		},
		renderTeachingGroups(data) {
			if (!data || data.length < 3) { this.teachingGroups = []; return }
			const groups = data[0]
			const classes = data[1]
			const assignments = [...data[2], ...data[3]]
			const groupedData = groups.map(group => {
				const childClasses = classes.filter(c =>
					String(c.KhoiID) === String(group.KhoiID) &&
					String(c.MonHocID) === String(group.MonHocID)
				)
				const weeksMap = {}
				assignments.filter(a => a.MonHocID == group.MonHocID && a.KhoiID == group.KhoiID).forEach(a => {
					if (!weeksMap[a.TuanHocID]) {
						weeksMap[a.TuanHocID] = {
							TuanHocID: a.TuanHocID,
							Tuan_HienThi: a.Tuan_HienThi,
							Is_Tuan_Active: a.Is_Tuan_Active,
							classes: [],
						}
					}
					const week = weeksMap[a.TuanHocID]
					if (a.AssignType == 'CLASS' && childClasses.some(c => String(c.LopID) === String(a.LopID))) {
						let cls = week.classes.find(c => c.LopID === a.LopID)
						if (!cls) {
							cls = { ...childClasses.find(c => c.LopID === a.LopID), assignments: [] }
							week.classes.push(cls)
						}
						cls.assignments.push(a)
					} else if (a.AssignType == 'STUDENT') {
						let ats = week.classes.find(c => c.TenLop == a.AssignmentTitle)
						if (!ats) {
							ats = {
								KhoiID: a.KhoiID, LopID: -1, MonHocID: a.MonHocID,
								PendingGradingCountInClass: 0, StudentCount: 0,
								TenLop: a.AssignmentTitle, assignments: [],
							}
							week.classes.push(ats)
						}
						ats.assignments.push(a)
					}
				})
				const currentId = Object.values(weeksMap).find(w => w.Is_Tuan_Active)?.TuanHocID ?? 0
				const sorted = Object.values(weeksMap).sort((a, b) => {
					if (a.Is_Tuan_Active && !b.Is_Tuan_Active) return -1
					if (!a.Is_Tuan_Active && b.Is_Tuan_Active) return 1
					if (a.TuanHocID > currentId && b.TuanHocID > currentId) return a.TuanHocID - b.TuanHocID
					if (a.TuanHocID < currentId && b.TuanHocID < currentId) return b.TuanHocID - a.TuanHocID
					return a.TuanHocID > currentId ? -1 : 1
				})
				return { ...group, weeks: sorted }
			})
			this.teachingGroups = groupedData
			vueData.GiaoVienID_Selected = data[4]?.[0]?.GiaoVienID ?? null
			this.DSMonHocActive = [...new Set(groupedData.map(item => item.MonHocName))].map(mh => ({
				MonHocName: mh,
				activeTab: groupedData.find(item => item.MonHocName == mh)?.KhoiID,
			}))
			// Set the first subject tab as active
			if (this.DSMonHocActive.length > 0) {
				this.activeSubjectTab = this.DSMonHocActive[0].MonHocName
			}
		},
		processLibraryData(flatData) {
			if (!flatData || flatData.length === 0) return []
			const grouped = flatData.reduce((acc, item) => {
				const gKey = `${item.KhoiID}-${item.MonHocID}`
				if (!acc[gKey]) {
					acc[gKey] = {
						KhoiID: item.KhoiID, TenKhoi: item.TenKhoi,
						MonHocID: item.MonHocID, MonHocName: item.MonHocName,
						weeks: {},
					}
				}
				const wKey = item.Tuan_HienThi || '[Chưa xếp tuần]'
				if (!acc[gKey].weeks[wKey]) acc[gKey].weeks[wKey] = { title: wKey, chapters: {} }
				const cKey = item.Chuong || 'Nội dung chung'
				if (!acc[gKey].weeks[wKey].chapters[cKey]) acc[gKey].weeks[wKey].chapters[cKey] = { title: cKey, items: [] }
				acc[gKey].weeks[wKey].chapters[cKey].items.push(item)
				return acc
			}, {})
			return Object.values(grouped).map(g => {
				g.weeks = Object.values(g.weeks).map(w => ({ ...w, chapters: Object.values(w.chapters) }))
				return g
			})
		},
		getPendingCount(classItem) {
			if (!classItem.assignments) return 0
			return classItem.assignments.reduce((sum, a) => sum + (a.PendingGradingCount || 0), 0)
		},
		xemTinhTrang(assignment) {
			openWindow({
				title: 'Sổ điểm lớp học',
				url: `/lms-teacher-gradebook?LopID=${assignment.LopID}&MonHocID=${assignment.MonHocID}&HocKi=${vueData.NienKhoaItem?.HocKi}&AssignType=CLASS`,
				id: 'WinGiaoBaiTap',
				onclose: { EXE: 'vueData.initPage()' },
			})
		},
		OpenModalAddNoiDung(KhoiItem) {
			this.KhoiItem = { ...KhoiItem }
			this.isShowModalAddNoiDung = true
		},
		OpenMyLiberies() { this.isShowMyLiberies = true },
		buildKhoiTableRows(khoiItem) {
			if (!khoiItem || !khoiItem.weeks) return []
			const rows = []
			const weekKey = (tuanHocID) => `week-${tuanHocID}`
			const classKey = (tuanHocID, lopID) => `class-${tuanHocID}-${lopID}`
			
			;(khoiItem.weeks || []).forEach(week => {
				const wKey = weekKey(week.TuanHocID)
				const isWeekExpanded = this.expandedWeeks[wKey] === true
				
				// Add week header row
				rows.push({
					_key: wKey,
					rowType: 'week-header',
					weekKey: wKey,
					Tuan_HienThi: week.Tuan_HienThi || 'Tuần không xác định',
					Is_Tuan_Active: week.Is_Tuan_Active,
					TuanHocID: week.TuanHocID,
					TenLop: '',
					ResourceType: '',
					Title: '',
					DueDate: null,
					Pending: 0,
					isExpanded: isWeekExpanded,
					weekData: week,
				})
				
				// Only show class rows if week is expanded
				if (isWeekExpanded) {
					this.sortClasses(week.classes || []).forEach(classItem => {
						const cKey = classKey(week.TuanHocID, classItem.LopID)
						const isClassExpanded = this.expandedClasses[cKey] !== false
						
						// Add class header row
						rows.push({
							_key: cKey,
							rowType: 'class-header',
							classId: cKey,
							Tuan_HienThi: week.Tuan_HienThi || 'Tuần không xác định',
							TuanHocID: week.TuanHocID,
							TenLop: classItem.TenLop || 'Lớp không xác định',
							ResourceType: '',
							Title: '',
							DueDate: null,
							Pending: this.getPendingCount(classItem),
							pendingDetail: this.getPendingCount(classItem),
							isExpanded: isClassExpanded,
							classItem,
						})
						
						// Only show assignment rows if class is expanded
						if (isClassExpanded) {
							const assignments = classItem.assignments || []
							if (assignments.length === 0) {
								rows.push({
									_key: `${cKey}-empty`,
									rowType: 'assignment',
									Tuan_HienThi: '',
									TenLop: '',
									ResourceType: 'ASSIGNMENT',
									Title: this.$t('message.ClassNotAssigned'),
									DueDate: null,
									Pending: 0,
									classItem,
									padLevel: 2,
								})
							} else {
								assignments.forEach((assignment, idx) => {
									rows.push({
										_key: `${cKey}-${assignment.AssignToClassID || assignment.AssignToStudentID || idx}`,
										rowType: 'assignment',
										Tuan_HienThi: '',
										TenLop: '',
										ResourceType: assignment.ResourceType || '',
										Title: assignment.AssignmentTitle || assignment.LessonTitle || assignment.Title || '-',
										DueDate: assignment.DueDate,
										Pending: assignment.PendingGradingCount || 0,
										classItem,
										assignment,
										padLevel: 2,
									})
								})
							}
						}
					})
				}
			})
			
			return rows
		},
		toggleWeekExpand(weekKey) {
			// Toggle the expanded state for the week
			this.$set(this.expandedWeeks, weekKey, !this.expandedWeeks[weekKey])
		},
		toggleClassExpand(classId) {
			// Toggle the expanded state for the class
			this.$set(this.expandedClasses, classId, this.expandedClasses[classId] !== true)
		},
		getRowClass(row) {
			const classList = ['td-khoi-data-row']
			if (row.rowType === 'week-header') classList.push('td-khoi-week-header')
			if (row.rowType === 'class-header') classList.push('td-khoi-class-header')
			if (row.rowType === 'assignment') classList.push('td-khoi-assignment-detail')
			return classList.join(' ')
		},
		resourceTypeLabel(type) {
			if (type === 'ASSIGNMENT') return this.$i18n.locale === 'en' ? 'Assignment' : 'Bài tập'
			if (type === 'LESSON') return this.$i18n.locale === 'en' ? 'Lesson' : 'Bài học'
			return '-'
		},
		formatDueDate(dueDate) {
			if (!dueDate) return '-'
			const parsedDate = new Date(dueDate)
			if (Number.isNaN(parsedDate.getTime())) return '-'
			return parsedDate.toLocaleDateString('vi-VN')
		},
		getSubjectDisplayName(monHocName) {
			if (this.$i18n.locale === 'en' && monHocName === 'Ngoại ngữ') return 'English'
			return monHocName
		},
		sortClasses(classes) {
			return [...(classes || [])].sort((a, b) => b.LopID - a.LopID)
		},
		OpenDashboard() {
			openWindow({
				url: `/lms-teacher-theo-doi-hoc-tap?HocKi=${vueData.NienKhoaItem.HocKi}`,
				title: 'Theo dõi học tập',
			})
		},
	},
}
</script> 
