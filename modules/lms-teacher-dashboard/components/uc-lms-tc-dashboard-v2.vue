<template>
	<div class="d-flex flex-column ga-2 teacher-dashboard" style="height: auto; box-sizing:border-box ;"
		ref="containerPage">
		<!-- NAVBAR -->
		<v-toolbar border density="compact" class="bg-white border-sm" style="position: sticky;top: 0; z-index: 50;">
			<template #title>
				<div class="d-flex align-center">
					<span class="text-h6">{{ $t('message.ControlPanel') }}</span>
					<v-btn class="ms-3" v-if="vueData.user.UserID == 'NA0000022' || vueData.user.UserID == 'NV0000134' " @click="onHandleOpenChangeGV">
						Chọn GV
					</v-btn>
				</div>
			</template>
			<template #append>
				<v-btn @click="OpenDashboard()">
					<v-icon class="me-1 text-h6">mdi-blinds-horizontal-closed</v-icon>{{ $t('message.Statistical') }}
				</v-btn>
				<v-btn @click="OpenMyLiberies()" class="me-1">
					<v-icon class="me-1 text-h6">mdi-library-shelves</v-icon> {{ $t('message.MyDocument') }}
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
		<!-- CONTENT -->
		<div class="d-flex flex-column px-2">
			<!-- BÀI TẬP CẦN CHẤM -->
			<div class="flex-1-0 mb-2 rounded bg-white">
				<v-expansion-panels v-model="assignmentNeedGradingPanel" variant="accordion" multiple>
					<v-expansion-panel >
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
			<div class="flex-1-0 w-100  bg-white rounded" v-for="mh in DSMonHocActive">
				<v-card>
					<v-toolbar color="white">
						<v-toolbar-title style="margin-left: 8px; margin-right: 8px; min-height: 38px; display: grid " class="align-center">
							<div class="d-flex w-100" >
								<span class="text-primary font-weight-medium" style="font-size: 16px !important">{{
									$t('message.Subject') }}: {{
										mh.MonHocName == 'Ngoại ngữ' ? 'English' : mh.MonHocName}}</span>
								<v-spacer></v-spacer>

								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn color="primary" variant="outlined" size="small"
											v-bind="props"><v-icon>mdi-plus</v-icon>{{ $t('message.CreateContent')
											}}</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="KhoiItem in mh.groups"
											:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID"
											@click="OpenModalAddNoiDung(KhoiItem)">
											<v-list-item-title>{{ $t('message.Grade') }} {{
												KhoiItem.KhoiID }}</v-list-item-title>
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
										v-for="KhoiItem in mh.groupsWithWeeks"
										:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">{{ $t('message.Grade') }} {{
											KhoiItem.KhoiID }}
									</v-tab>
								</v-tabs>
							</div>
						</template>
					</v-toolbar>

					<v-tabs-window v-model="mh.activeTab">
						<v-tabs-window-item
							v-for="(KhoiItem, index) in mh.groups"
							:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
							<v-card>
								<v-card-text class="pa-2">
									<v-row dense>
										<v-col cols="12" md="12">
											<v-expansion-panels variant="popout"
												:model-value="KhoiItem.allIndices" multiple>
												<p v-if="KhoiItem.weeks.length == 0">{{
													$t('message.EmptyLessonAndAssignment')
												}}</p>
												<!-- Mỗi tuần là 1 expansion panel -->
												<v-expansion-panel v-for="week in KhoiItem.weeks" :key="week.TuanHocID"
													:model-value="KhoiItem.allIndices" multiple>
													<v-expansion-panel-title class="week-group-header text-white"
														style="background-color: #009688; min-height: 38px !important; padding: 0 8px !important">
														{{ week.Tuan_HienThi }}
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-expansion-panels
															:model-value="week.allClassIndices"
															multiple>
															<v-expansion-panel
																v-for="classItem in week.sortedClasses"
																:key="classItem.LopID" class="mb-1">
																<div v-if="classItem.LopID != -1">
																	<v-expansion-panel-title
																		style="background-color: #f1f1f1; line-height: 10px; height:10px"
																		class="px-3 py-0">
																		<div class="class-row-header">
																			<div class="class-info">
																				<div class="class-name">{{
																					classItem.TenLop
																				}}</div>
																				<div class="class-meta mt-2">
																					<span>
																						{{ $t('message.ClassSize') }}:
																						{{
																							classItem.StudentCount }}
																						{{ $t('message.Students')
																						}}</span>
																					<span class="pending-tag"
																						v-if="getPendingCount(classItem) > 0 && classItem.ResourceType == 'ASSIGNMENT'">
																						<v-icon size="small"
																							class="mr-1">mdi-alert-circle</v-icon>
																						{{ getPendingCount(classItem) }}
																						{{
																							$t('message.NeedGrade') }}
																					</span>
																				</div>
																			</div>
																			<div class="class-actions">
																				<v-tooltip location="top">
																					<template #activator="{ props }">
																						<v-btn v-bind="props" icon size="small" variant="text" color="purple" @click.stop="xemTinhTrang(classItem)">
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
										</v-col>
									</v-row>
								</v-card-text>
							</v-card>
						</v-tabs-window-item>
					</v-tabs-window>
				</v-card>
			</div>
			<v-empty-state icon="mdi-magnify" v-if="DSMonHocActive.length == 0" class="border elevation-2"
				:text="$t('message.ContactDev')" :title="$t('message.NotFoundSubject')">
			</v-empty-state>
		</div>
		<uc-btn-with-dialog-add-bt v-model:isOpen="isShowModalAddNoiDung" v-if="isShowModalAddNoiDung" :KhoiItem />
		<uc-my-liberies v-model:isOpen="isShowMyLiberies" :DSMonHocActive :teachingGroups v-if="isShowMyLiberies"
			v-model:contentLibrary="contentLibrary" @CreateContent="(item) => { this.OpenModalAddNoiDung(item) }" />
		<uc-change-user v-if="isShowModalChangeUser" v-model:isOpen="isShowModalChangeUser" #f
			:giaovienid="vueData.GiaoVienID_Selected" />
		<!-- <uc-focus-task v-if="isShowModalFocusTask" v-model:isOpen="isShowModalFocusTask"></uc-focus-task> -->
	</div>
</template>

<script>
export default {
	name: 'uc-lms-tc-dashboard-v2',
	data() {
		const toggle = localStorage.getItem('IsLanguage') ? (localStorage.getItem('IsLanguage') == 'true' ? true : false) : false
		this.$i18n.locale = toggle ? "en" : "vi"
		return {
			isShowModalChangeUser: false,
			activeTab: 'classes', x: null, vueData,
			isShowModalAddNoiDung: false,
			DSMonHocActive: [],
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
				'PENDING_GRADING': { color: 'warning', icon: 'mdi-file-clock-outline', iconColor: '#fb8c00', text: this.$i18n.locale == 'en' ? 'Need Grade' : 'Cần chấm', cardClass: 'warning' },
				'OVERDUE': { color: 'error', icon: 'mdi-calendar-remove', iconColor: '#f44336', text: this.$i18n.locale == 'en' ? 'Over Due' : 'Quá hạn', cardClass: 'urgent' },
				'UPCOMING': { color: 'primary', icon: 'mdi-calendar-arrow-right', iconColor: '#1976d2', text: this.$i18n.locale == 'en' ? 'Coming' : 'Sắp tới', cardClass: 'primary' }
			},
			filterArray: [
				{ title: this.$i18n.locale == 'en' ? 'Need Grade' : 'Cần chấm', value: 'PENDING_GRADING' },
				{ title: this.$i18n.locale == 'en' ? 'Over Due' : 'Quá hạn', value: 'OVERDUE' },
				{ title: this.$i18n.locale == 'en' ? 'Coming' : 'Sắp tới', value: 'UPCOMING' }
			],
			KhoiFilter: null,
			LopFilter: null,
			page: 1,
			pageSize: 10,
			isShowModalFocusTask: false
		}
	},
	emits: ['view-class', 'grade-class', 'create-assignment'],
	props: {
		focusTasks: Array,
		teachingGroups: Array,
		schedule: Array,
		activities: Array,
		contentLibrary: Array,
	},
	computed: {
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
					acc.push({ title: 'Khối ' + task.KhoiID, value: task.KhoiID });
				}
				return acc;
			}, [{ title: 'Tất cả', value: -1 }]);
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
		}
	},
	watch: {
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
	},
	methods: {
		getPendingCount(classItem) {
			if (!classItem.assignments) return 0;
			return classItem.assignments.reduce((sum, a) => {
				return sum + (a.PendingGradingCount || 0);
			}, 0);
		},
		xemTinhTrang(assignment) {
			openWindow({
				title: "Sổ điểm lớp học",
				url: `/lms-teacher-gradebook?LopID=${assignment.LopID}&MonHocID=${assignment.MonHocID}&HocKi=${vueData.NienKhoaItem?.HocKi}&AssignType=CLASS`,
				id: "WinGiaoBaiTap",
				onclose: {
					EXE: "vueData.initPage()"
				}
			});
		},
		OpenModalAddNoiDung(KhoiItem) {
			this.KhoiItem = { ...KhoiItem }
			this.isShowModalAddNoiDung = true;
		},
		OpenMyLiberies() {
			this.isShowMyLiberies = true;
		},
		OpenDashboard() {
			openWindow({
				url: `/lms-teacher-theo-doi-hoc-tap?HocKi=${vueData.NienKhoaItem.HocKi}`,
				title: 'Theo dõi học tập'
			})
		},
		onHandleOpenChangeGV() {
			console.log('this.isShowModalChangeUser', this.isShowModalChangeUser)
			this.isShowModalChangeUser = true
		},
		TestUIFocusTask() {
			this.isShowModalFocusTask = true
		}
	}
}
</script>