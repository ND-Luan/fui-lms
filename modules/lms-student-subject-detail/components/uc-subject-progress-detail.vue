<template>
	<v-container class="page-container" fluid>
		<div v-if="loading" class="text-center pa-10">
			<v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
			<p class="mt-4 text-medium-emphasis">Đang tải chi tiết môn học...</p>
		</div>

		<div v-else-if="!stats || !stats.MonHocName" class="text-center pa-10">
			<v-icon size="64" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
			<h2 class="mt-4 text-h6">Không tìm thấy dữ liệu</h2>
			<p class="text-medium-emphasis">Không thể tải thông tin cho môn học này.</p>
		</div>

		<div v-else>
			<v-card class="summary-card mb-6" variant="tonal" color="primary">
				<v-row class="mb-3" dense>
					<v-col cols="12" md="9">
						<v-avatar :color="stats.Color || 'grey'" size="64" class="mr-4">
							<v-icon color="white" size="32">{{ stats.Icon || 'mdi-school' }}</v-icon>
						</v-avatar>
						<div class="mr-auto">
							<div class="text-h5 font-weight-bold">{{ stats.MonHocName }}</div>
							<div class="text-body-2 text-medium-emphasis">Giáo viên: {{ stats.TeacherName || 'N/A' }}
							</div>
						</div>
					</v-col>
					<v-col cols="12" md="3">
						<div class="progress-stats mt-4 mt-sm-0 d-flex flex-column align-center justify-center">
							<div class="text-overline">Tiến độ tổng thể</div>
							<div class="text-h4 font-weight-bold">
								{{ stats.CompletedResources || 0 }} / {{ stats.TotalResources || 0 }}
							</div>
							<v-progress-linear :model-value="completionRate" height="6" rounded color="primary"
								class="mt-2 w-50"></v-progress-linear>
						</div>
					</v-col>


				</v-row>
				<v-btn variant="tonal" prepend-icon="mdi-table-large" @click="gradebookDialogVisible = true"
					class="mr-4">
					Xem sổ điểm
				</v-btn>
			</v-card>

			<div v-if="groupedResources.length === 0" class="text-center pa-10 border rounded">
				<p class="text-grey">Môn học này chưa có bài giảng hoặc bài tập nào.</p>
			</div>
			<v-expansion-panels v-else variant="accordion">
				<v-expansion-panel v-for="weekGroup in groupedResources" :key="weekGroup.weekTitle" eager
					class="week-panel">
					<v-expansion-panel-title class="week-title" style="flex-wrap: wrap ;line-height: 2">
						<p>{{ weekGroup.weekTitle }}</p>
						<v-spacer></v-spacer>
						<v-chip size="small" variant="tonal" color="primary" class="mr-4">
							Hoàn thành: {{ weekGroup.completedCount }}/{{ weekGroup.totalCount }}
						</v-chip>
					</v-expansion-panel-title>
					<v-expansion-panel-text class="pa-0">
						<uc-resource-row v-for="item in weekGroup.items" :key="item.ResourceType + item.ResourceID"
							:item="item" />
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</div>
	</v-container>
	<uc-student-gradebook-dialog v-model:visible="gradebookDialogVisible" :mon-hoc-id="monHocId"
		:subject-name="stats.MonHocName" />
</template>

<script>
	export default {
		name: 'uc-subject-progress-detail',
		props: {
			monHocId: {
				type: Number,
				required: true
			}
		},
		data() {
			return {
				loading: true,
				stats: {},
				resources: [],
				gradebookDialogVisible: false
			};
		},
		computed: {
			completionRate() {
				if (!this.stats.TotalResources || this.stats.TotalResources === 0) return 0;
				return ((this.stats.CompletedResources || 0) / this.stats.TotalResources) * 100;
			},
			groupedResources() {
				if (!this.resources) return [];
	
				const grouped = this.resources.reduce((acc, item) => {
					const weekKey = `${item.Tuan_HienThi || '[Chưa xếp tuần]'}`;
					if (!acc[weekKey]) {
						acc[weekKey] = { weekTitle: weekKey, items: [] };
					}
					acc[weekKey].items.push(item);
					return acc;
				}, {});
	
				return Object.values(grouped).map(group => {
					const completedCount = group.items.filter(i => ['COMPLETED', 'SUBMITTED', 'GRADED'].includes(i.StudentStatus)).length;
					return { ...group, completedCount, totalCount: group.items.length };
				});
			}
		},
		methods: {
			async fetchData() {
				this.loading = true;
				ajaxCALL("lms/EL_Student_GetSubjectProgressDetail", { MonHocID: this.monHocId }, (res) => {
					if (res && res.data && res.data.length >= 2) {
						this.resources = res.data[0] || [];
						this.stats = res.data[1][0] || {};
					} else {
						this.stats = {};
						this.resources = [];
					}
				});
				this.loading = false;
			}
		},
		mounted() {
			if (this.monHocId) {
				this.fetchData();
			} else {
				console.error("MonHocID không được cung cấp!");
				this.loading = false;
			}
		}
	}
</script>