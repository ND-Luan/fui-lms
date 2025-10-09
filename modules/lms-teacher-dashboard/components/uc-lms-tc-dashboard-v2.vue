<template>
	<div class="d-flex flex-column ga-2 teacher-dashboard" style="height: 100vh; box-sizing:border-box ;"
		ref="containerPage">
		<!-- NAVBAR -->
		<v-toolbar border density="compact" class="bg-white border-sm" style="position: sticky;top: 0; z-index: 50;">
			<template #title>
				<span class="text-h5">Bảng điều khiển</span>
			</template>
			<template #append>
				<v-btn @click="OpenMyLiberies()">
					<v-icon class="me-1 text-h6">mdi-library-shelves</v-icon> Tài liệu của tôi
				</v-btn>
				<!-- <v-btn v-tooltip="'Hoạt động gần đây'">
					<v-badge color="error" content="2">
						<v-icon>mdi-bell-outline</v-icon>
					</v-badge>
				</v-btn> -->
			</template>
		</v-toolbar>
		<!-- CONTENT -->
		<div class=" d-flex flex-column px-2">
			<!-- BÀI TẬP CẦN CHẤM -->
			<div class=" flex-1-0 mb-2 rounded bg-white ">
				<v-expansion-panels variant="accordion" v-model="assignmentNeedGradingPanel" multiple>
					<v-expansion-panel>
						<v-expansion-panel-title class="d-flex pa-2">
							<span class="text-body-1 font-weight-medium">Bài tập cần chấm</span>
							<v-spacer></v-spacer>
							<v-chip color="warning" size="small" class="font-weight-medium"
								v-if="focusTasks.length > 0">Có {{
									focusTasks.length }} bài tập cần
								chấm</v-chip>
						</v-expansion-panel-title>

						<v-expansion-panel-text class="py-1">
							<div v-if="!focusTasks || focusTasks.length === 0"
								class="text-center pa-5 grey--text rounded border mx-3">
								<p class="mb-0">Không có bài tập nào cần chấm ngay!</p>
							</div>
							<v-row v-else class="pa-1" dense>
								<v-col v-for="task in focusTasks" :key="task.AssignToClassID" cols="12" lg="3" md="6">
									<uc-teacher-focus-card :task="task" />
								</v-col>
							</v-row>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</div>

			<!-- MÔN HỌC CỦA TÔI -->
			<div class=" flex-1-0 w-100  bg-white rounded" v-for="MonHocName in DSMonHocActive">
				<v-card>
					<v-toolbar color="white">
						<v-toolbar-title style="margin-right: 20px;">
							<div class="d-flex w-100">
								<span class="text-h6 text-primary font-weight-medium">Môn học: {{
									teachingGroups.filter(item => item.MonHocName == MonHocName)[0]?.MonHocName ??
									'unknow'}}</span>
								<v-spacer></v-spacer>

								<v-menu transition="slide-y-transition">
									<template v-slot:activator="{ props }">
										<v-btn color="primary" variant="tonal" size="small"
											v-bind="props"><v-icon>mdi-plus</v-icon>Tạo nội
											dung</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == MonHocName)"
											:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID"
											@click="OpenModalAddNoiDung(KhoiItem)">
											<v-list-item-title>{{ KhoiItem.TenKhoiHoc }}</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</v-toolbar-title>
						<template v-slot:extension>
							<div class="d-flex flex-column w-100">
								<v-divider></v-divider>
								<v-tabs v-model="activeTab" bg-color="transparent" class="mb-1">
									<v-tab
										v-for="KhoiItem in teachingGroups.filter(item => item.MonHocName == MonHocName)"
										:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">{{ KhoiItem.TenKhoiHoc
										}}</v-tab>
								</v-tabs>
							</div>
						</template>
					</v-toolbar>

					<v-tabs-window v-model="activeTab">
						<v-tabs-window-item
							v-for="(KhoiItem, index) in teachingGroups.filter(item => item.MonHocName == MonHocName)"
							:value="KhoiItem.KhoiID" :key="KhoiItem.KhoiID">
							<v-card>
								<v-card-text class="pa-2">
									<v-row dense>
										<v-col cols="12" md="12">
											<v-expansion-panels variant="popout"
												:model-value="KhoiItem.weeks?.map((k, index) => index)" multiple>
												<p v-if="KhoiItem.weeks.length == 0">Không có bài học và bài tập nào</p>
												<!-- Mỗi tuần là 1 expansion panel -->
												<v-expansion-panel v-for="week in KhoiItem.weeks" :key="week.TuanHocID"
													:model-value="KhoiItem.weeks?.map((k, index) => index)" multiple>
													<v-expansion-panel-title class="week-group-header text-white"
														style="background-color: #00A651;">
														{{ week.Tuan_HienThi }}
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-expansion-panels
															:model-value="week.classes.map((k, index) => index)"
															multiple>
															<v-expansion-panel v-for="classItem in week.classes"
																:key="classItem.LopID" class="mb-1">
																<v-expansion-panel-title
																	style="background-color: #f1f1f1;"
																	class="px-3 py-0">
																	<div class="class-row-header">
																		<div class="class-info">
																			<div class="class-name">{{ classItem.TenLop
																			}}</div>
																			<div class="class-meta mt-2">
																				<span>
																					Sĩ số: {{ classItem.StudentCount }}
																					học
																					sinh</span>
																				<span class="pending-tag"
																					v-if="getPendingCount(classItem) > 0 && classItem.ResourceType == 'ASSIGNMENT'">
																					<v-icon size="small"
																						class="mr-1">mdi-alert-circle</v-icon>
																					{{ getPendingCount(classItem) }} bài
																					cần
																					chấm
																				</span>
																			</div>
																		</div>
																		<div class="class-actions">
																			<v-btn size="small" variant="tonal"
																				color="purple" text="Xem sổ điểm"
																				@click.stop="xemTinhTrang(classItem)" />
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
																		Lớp này chưa được giao bài tập nào.
																	</div>
																</v-expansion-panel-text>
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
				text="Thầy/ cô hãy liên hệ bộ phận phát triển để tìm hiểu thêm thông tin!"
				title="Không tìm thấy môn học của thầy/cô">
			</v-empty-state>

		</div>
		<uc-btn-with-dialog-add-bt v-model:isOpen="isShowModalAddNoiDung" v-if="isShowModalAddNoiDung" :KhoiItem />
		<uc-my-liberies v-model:isOpen="isShowMyLiberies" :DSMonHocActive :teachingGroups v-if="isShowMyLiberies"
			:contentLibrary @CreateContent="(item) => { this.OpenModalAddNoiDung(item) }" />


	</div>
</template>

<script>
export default {
	name: 'uc-lms-tc-dashboard-v2',
	data() {
		return {
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
			text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

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
	watch: {
		activeTab: function (newVal) {
			this.$nextTick(() => {
				this.panel = [0]
				this.panelChild = [0]
			})
		},
	},
	created() {
		if (this.focusTasks && this.focusTasks.length > 0) {
			this.assignmentNeedGradingPanel = [0]
		}
		console.log('this.teachingGroups', this.teachingGroups)
		this.DSMonHocActive = [...new Set(this.teachingGroups.map(item => item.MonHocName))];
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
				title: "Sổ điểm Lớp học",
				url: `/lms-teacher-gradebook?LopID=${assignment.LopID}&MonHocID=${assignment.MonHocID}`,
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

	}
}
</script>