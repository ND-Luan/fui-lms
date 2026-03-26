<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn @click="OpenDashboard">
								<v-icon class="me-1">mdi-blinds-horizontal-closed</v-icon>{{ $t('message.Statistical') }}
							</v-btn>
							<v-btn @click="OpenMyLiberies">
								<v-icon class="me-1">mdi-library-shelves</v-icon>{{ $t('message.MyDocument') }}
							</v-btn>
							<v-btn-toggle v-model="toggle" size="small">
								<v-btn :value="false" :disabled="!toggle" :color="!toggle ? 'green' : 'white'">
									<v-img src="/_cdn/lhbs-lms/img_page_ph/Viet.png" width="35" />
								</v-btn>
								<v-btn :value="true" :disabled="toggle" :color="toggle ? 'green' : 'white'">
									<v-img src="/_cdn/lhbs-lms/img_page_ph/Anh.png" width="35" />
								</v-btn>
							</v-btn-toggle>
							<v-btn v-if="isDevUser" @click="isShowModalChangeUser = true">Chọn GV</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<div class="d-flex flex-column ga-2 teacher-dashboard px-2"
			style="overflow-y: auto; max-height: calc(100dvh - 77px)">

			<!-- BÀI TẬP CẦN CHẤM -->
			<div class="flex-1-0 mt-2 rounded bg-white">
				<v-expansion-panels v-model="assignmentNeedGradingPanel" variant="accordion" multiple>
					<v-expansion-panel>
						<v-expansion-panel-title class="pa-2" style="min-height: 38px">
							<span class="text-body-1 font-weight-medium">{{ $t('message.AssignmentsToGrade') }}</span>
						</v-expansion-panel-title>
						<v-expansion-panel-text>
							<uc-focus-task />
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</div>

			<!-- MÔN HỌC CỦA TÔI -->
			<div class="flex-1-0 w-100 bg-white rounded mb-2" v-for="mh in DSMonHocActive" :key="mh.MonHocName">
				<v-card>
					<v-toolbar color="white">
						<v-toolbar-title style="margin-left: 8px; margin-right: 8px; min-height: 38px; display: grid"
							class="align-center">
							<div class="d-flex w-100">
								<span class="text-primary font-weight-medium" style="font-size: 16px !important">
									{{ $t('message.Subject') }}: {{
										$i18n.locale == 'en' &&
											teachingGroups.filter(item => item.MonHocName == mh.MonHocName)[0]?.MonHocName == 'Ngoại ngữ'
											? 'English'
											: teachingGroups.filter(item => item.MonHocName == mh.MonHocName)[0]?.MonHocName
									}}
								</span>
								<v-spacer></v-spacer>
								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn color="primary" variant="outlined" size="small" v-bind="props">
											<v-icon>mdi-plus</v-icon>{{ $t('message.CreateContent') }}
										</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == mh.MonHocName)"
											:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID"
											@click="OpenModalAddNoiDung(KhoiItem)">
											<v-list-item-title>{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</v-toolbar-title>
						<template v-slot:extension>
							<div class="d-flex flex-column w-100">
								<v-divider></v-divider>
								<v-tabs v-model="mh.activeTab" bg-color="transparent" class="mb-1">
									<v-tab
										v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == mh.MonHocName && item.weeks.length > 0)"
										:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
										{{ $t('message.Grade') }} {{ KhoiItem.KhoiID }}
									</v-tab>
								</v-tabs>
							</div>
						</template>
					</v-toolbar>

					<v-tabs-window v-model="mh.activeTab">
						<v-tabs-window-item
							v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == mh.MonHocName)"
							:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
							<v-card>
								<v-card-text class="pa-2">
									<v-expansion-panels variant="popout"
										:model-value="KhoiItem.weeks?.map((k, i) => i)" multiple>
										<p v-if="KhoiItem.weeks.length == 0">{{ $t('message.EmptyLessonAndAssignment') }}</p>
										<v-expansion-panel v-for="week in KhoiItem.weeks" :key="week.TuanHocID"
											:model-value="KhoiItem.weeks?.map((k, i) => i)" multiple>
											<v-expansion-panel-title class="week-group-header text-white"
												style="background-color: #009688; min-height: 38px !important; padding: 0 8px !important">
												{{ week.Tuan_HienThi }}
											</v-expansion-panel-title>
											<v-expansion-panel-text>
												<v-expansion-panels :model-value="week.classes.map((k, i) => i)" multiple>
													<v-expansion-panel
														v-for="classItem in week.classes.sort((a, b) => b.LopID - a.LopID)"
														:key="classItem.LopID" class="mb-1">
														<div v-if="classItem.LopID != -1">
															<v-expansion-panel-title
																style="background-color: #f1f1f1; line-height: 10px; height: 10px"
																class="px-3 py-0">
																<div class="class-row-header">
																	<div class="class-info">
																		<div class="class-name">{{ classItem.TenLop }}</div>
																		<div class="class-meta mt-2">
																			<span>{{ $t('message.ClassSize') }}: {{ classItem.StudentCount }} {{ $t('message.Students') }}</span>
																			<span class="pending-tag"
																				v-if="getPendingCount(classItem) > 0 && classItem.ResourceType == 'ASSIGNMENT'">
																				<v-icon size="small" class="mr-1">mdi-alert-circle</v-icon>
																				{{ getPendingCount(classItem) }} {{ $t('message.NeedGrade') }}
																			</span>
																		</div>
																	</div>
																	<div class="class-actions">
																		<v-tooltip location="top">
																			<template #activator="{ props }">
																				<v-btn v-bind="props" icon size="small" variant="text" color="purple"
																					@click.stop="xemTinhTrang(classItem)">
																					<v-icon>mdi-table-eye</v-icon>
																				</v-btn>
																			</template>
																			<span>{{ $t('message.ViewGradebook') }}</span>
																		</v-tooltip>
																	</div>
																</div>
															</v-expansion-panel-title>
															<v-expansion-panel-text class="pt-1">
																<div class="rounded">
																	<uc-assignment-status-row
																		v-for="assignment in classItem.assignments"
																		:key="assignment.AssignToClassID"
																		:assignment="assignment" />
																</div>
																<div class="text-center text-grey pa-2"
																	v-if="classItem.assignments.length === 0">
																	{{ $t('message.ClassNotAssigned') }}
																</div>
															</v-expansion-panel-text>
														</div>
														<div v-else>
															<v-divider class="my-2"></v-divider>
															<uc-assignment-status-row-assign-to-student
																:assignment="classItem.assignments.reduce((result, item) => result.AssignToStudentID > item.AssignToStudentID ? result : item)" />
														</div>
													</v-expansion-panel>
												</v-expansion-panels>
											</v-expansion-panel-text>
										</v-expansion-panel>
									</v-expansion-panels>
								</v-card-text>
							</v-card>
						</v-tabs-window-item>
					</v-tabs-window>
				</v-card>
			</div>

			<v-empty-state icon="mdi-magnify" v-if="DSMonHocActive.length == 0" class="border elevation-2"
				:text="$t('message.ContactDev')" :title="$t('message.NotFoundSubject')" />
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
		}
	},
	computed: {
		TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
		isDevUser() { return vueData.user.UserID === 'NA0000022' || vueData.user.UserID === 'NV0000134' },
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
		OpenDashboard() {
			openWindow({
				url: `/lms-teacher-theo-doi-hoc-tap?HocKi=${vueData.NienKhoaItem.HocKi}`,
				title: 'Theo dõi học tập',
			})
		},
	},
}
</script>
