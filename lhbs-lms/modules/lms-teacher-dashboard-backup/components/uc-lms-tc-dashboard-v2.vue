<template>
	<div>
		<v-toolbar border density="compact" title="Bảng điều khiển" class="bg-white border-sm">
			<!-- <template #append>
            <v-btn class="text-none" stacked v-tooltip="'Hoạt động gần đây'">
                <v-badge color="error" content="2">
                    <v-icon>mdi-bell-outline</v-icon>
                </v-badge>
            </v-btn>
        </template> -->
		</v-toolbar>
		<div class="teacher-dashboard px-2 h-100">
			<!-- Header và Tabs không đổi -->

			<div class="mb-2 pa-2">
				<h2 class="widget-title mb-2 d-flex align-center">
					<v-icon color="orange" class="me-2">mdi-target</v-icon>Bài tập cần chấm
				</h2>
				<div v-if="!focusTasks || focusTasks.length === 0" class="text-center pa-5 grey--text rounded border">
					<p class="mb-0">Không có bài tập nào cần chấm ngay. Rất tốt!</p>
				</div>
				<v-row v-else>
					<v-col v-for="task in focusTasks" :key="task.AssignToClassID" cols="12" lg="4" md="6" class="pa-1">
						<uc-teacher-focus-card :task="task" />
					</v-col>
				</v-row>
			</div>
			<v-tabs v-model="activeTab" bg-color="transparent" class="mb-4">
				<v-tab value="classes">Bảng điều khiển Lớp học</v-tab>
				<v-tab value="library">Thư viện của tôi</v-tab>
			</v-tabs>

			<v-window v-model="activeTab">
				<!-- Tab 1: Bảng điều khiển Lớp học (Đã đúng, không đổi) -->
				<v-window-item value="classes">
					<v-row dense>
						<v-col cols="12" md="8">
							<div v-if="!teachingGroups || teachingGroups.length === 0"
								class="text-center pa-10 border rounded">
								<p class="text-grey">Bạn chưa được phân công giảng dạy lớp nào.</p>
							</div>
							<uc-teaching-group-card v-for="group in teachingGroups"
								:key="group.KhoiID + '-' + group.MonHocID" :group="group"
								@view-class="$emit('view-class', $event)" @grade-class="$emit('grade-class', $event)"
								@create-assignment="$emit('create-assignment', $event)" />
						</v-col>
						<v-col cols="12" md="4">
							<!-- <uc-task-list title="Lịch dạy hôm nay" :items="schedule" icon="mdi-calendar-clock" class="sidebar-widget" /> -->
							<uc-activity-feed :activities="activities" class=" sidebar-widget" />
						</v-col>
					</v-row>
				</v-window-item>

				<!-- ======================================================= -->
				<!-- == NỘI DUNG TAB 2: THƯ VIỆN CỦA TÔI      == -->
				<!-- ======================================================= -->
				<v-window-item value="library">
					<v-row dense>
						<div v-if="!contentLibrary || contentLibrary.length === 0"
							class="text-center pa-10 border rounded">
							<p class="text-grey">Thư viện của bạn chưa có nội dung nào.</p>
						</div>
						<v-col v-else cols="12" md="6" v-for="subjectGroup in contentLibrary" class="py-0">
							<uc-teaching-group-card :key="subjectGroup.KhoiID + '-' + subjectGroup.MonHocID"
								:group="subjectGroup" :is-library-view="true"
								@create-assignment="$emit('create-assignment', $event)"
								@gradeClass="(val) => console.log(val)" @view-class="(val) => console.log(123)">
								<!-- <v-list>
								<div v-for="weekGroup in subjectGroup.weeks" :key="weekGroup.title" class="week-group">
									<v-list-subheader class="week-group-header">{{ weekGroup.title }}</v-list-subheader>
									<div v-for="chapterGroup in weekGroup.chapters" :key="chapterGroup.title">
										<uc-content-library-item
											v-for="item in chapterGroup.items.filter(x => x.ResourceID > 0 )"
											:key="item.ResourceType + item.ResourceID" :item="item" />
										<p v-if="chapterGroup.items.filter(x=> x.ResourceID > 0).length === 0"
											class="text-center text-caption text-center">
											Bạn chưa thêm Assignment hoặc Lesson. Vui lòng bấm tạo nội dung
										</p>
									</div>
								</div>
							</v-list> -->
							</uc-teaching-group-card>
						</v-col>
						<!-- Sidebar cho Tab Thư viện (nếu cần) -->
						<!-- <v-col cols="12" md="4">
						
					</v-col> -->
					</v-row>
				</v-window-item>
			</v-window>
		</div>
	</div>

</template>

<script>
export default {
	name: 'uc-lms-tc-dashboard-v2',
	data() {
		return { activeTab: 'classes', x: null, vueData }
	},
	emits: ['view-class', 'grade-class', 'create-assignment'],
	props: {
		focusTasks: Array,
		teachingGroups: Array,
		schedule: Array,
		activities: Array,
		contentLibrary: Array,
	},
	mounted() {
		console.log('app', app.config.globalProperties.v_OpenWindowList)
	},
}
</script>