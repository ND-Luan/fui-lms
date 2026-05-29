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
										$i18n.locale == 'en' &&
											teachingGroups.filter(item => item.MonHocName == mh.MonHocName)[0]?.MonHocName ==
											'Ngoại ngữ' ?
											'English' : teachingGroups.filter(item =>
												item.MonHocName == mh.MonHocName)[0]?.MonHocName}}</span>
								<v-spacer></v-spacer>

								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn color="primary" variant="outlined" size="small"
											v-bind="props"><v-icon>mdi-plus</v-icon>{{ $t('message.CreateContent')
											}}</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == mh.MonHocName)"
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
										v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == mh.MonHocName && item.weeks.length > 0)"
										:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">{{ $t('message.Grade') }} {{
											KhoiItem.KhoiID }}
									</v-tab>
								</v-tabs>
							</div>
						</template>
					</v-toolbar>

					<v-tabs-window v-model="mh.activeTab">
						<v-tabs-window-item
							v-for="(KhoiItem, index) in teachingGroups.filter(item => item.MonHocName == mh.MonHocName)"
							:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
							<v-card>
								<v-card-text class="pa-2">
									<v-row dense>
										<v-col cols="12" md="12">
											<v-expansion-panels variant="popout"
												:model-value="KhoiItem.weeks?.map((k, index) => index)" multiple>
												<p v-if="KhoiItem.weeks.length == 0">{{
													$t('message.EmptyLessonAndAssignment')
												}}</p>
												<!-- Mỗi tuần là 1 expansion panel -->
												<v-expansion-panel v-for="week in KhoiItem.weeks" :key="week.TuanHocID"
													:model-value="KhoiItem.weeks?.map((k, index) => index)" multiple>
													<v-expansion-panel-title class="week-group-header text-white"
														style="background-color: #009688; min-height: 38px !important; padding: 0 8px !important">
														{{ week.Tuan_HienThi }}
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-expansion-panels
															:model-value="week.classes.map((k, index) => index)"
															multiple>
															<v-expansion-panel
																v-for="classItem in week.classes.sort((a, b) => b.LopID - a.LopID)"
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
			vueData,
			isShowModalAddNoiDung: false,
			DSMonHocActive: [],
			KhoiItem: {},
			isShowMyLiberies: false,
			assignmentNeedGradingPanel: [],
			toggle,
		}
	},
	props: {
		teachingGroups: Array,
		contentLibrary: Array,
	},
	watch: {
		toggle(val) {
			localStorage.setItem('IsLanguage', val)
			this.$i18n.locale = val ? 'en' : 'vi'
		},
	},
	created() {
		this.DSMonHocActive = [...new Set(this.teachingGroups.map(item => item.MonHocName))].map(mh => ({ MonHocName: mh, activeTab: this.teachingGroups.filter(item => item.MonHocName == mh)[0].KhoiID }));
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
			this.isShowModalChangeUser = true
		},
	}
}
</script>