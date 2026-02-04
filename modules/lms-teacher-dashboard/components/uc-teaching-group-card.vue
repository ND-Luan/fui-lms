<template>
	<v-card class="mb-2 teaching-group-card" variant="outlined">
		<div class="d-flex justify-space-between align-center">
			<!-- Thông tin Khối - Môn (bên trái) -->
			<!-- <div class="d-flex align-center">
				<v-avatar :color="getSubjectColor(group.MonHocName)" size="40" class="mr-4">
					<v-icon color="white">{{ getSubjectIcon(group.MonHocName) }}</v-icon>
				</v-avatar>
				<div>
					<div class="text-overline">{{ group.TenKhoi }}</div>
					<div class="text-h6">{{ group.MonHocName }}</div>
				</div>
			</div> -->

			<!-- Các hành động cho cả nhóm (bên phải) -->
			<!-- <div class="d-flex align-center ga-3">
				<div class="d-flex flex-column flex-md-row ga-3"> -->
			<!-- <v-chip v-if="!isLibraryView && group.TotalPendingGradingCount > 0" color="error" variant="flat" -->
			<!-- <v-chip color="error" variant="flat"
						prepend-icon="mdi-alert-circle-outline">
						Có {{ group.TotalPendingGradingCount }} bài cần chấm
					</v-chip>
				
					<uc-btn-with-dialog-add-bt :khoiid="group.KhoiID" :monhocid="group.MonHocID" :group />
				</div>
				
			</div> -->

			<v-row class="align-center" border="opacity-50 sm"
				:class="['ma-2', 'rounded', $vuetify.display.smAndDown ? 'bg-grey-lighten-3' : '']">

				<v-col cols="12" sm="6" md="5" class="pa-1">
					<div class="d-flex align-center  justify-center justify-md-start pl-4">
						<v-avatar :color="getSubjectColor(group.MonHocName)" size="40" class="mr-4">
							<v-icon color="white">{{ getSubjectIcon(group.MonHocName) }}</v-icon>
						</v-avatar>
						<div>
							<div class="text-overline">{{ group.TenKhoiHoc ?? group.TenKhoi }}</div>
							<div class="text-h6">{{ group.MonHocName }}</div>
						</div>
					</div>
				</v-col>


				<v-col cols="12" sm="6" md="7" class="d-flex align-center justify-center justify-md-end">
					<div class="d-flex flex-column flex-lg-row ga-3">
						<v-chip v-if="!isLibraryView && group.TotalPendingGradingCount > 0" color="error" variant="flat"
							prepend-icon="mdi-alert-circle-outline">
							Có {{ group.TotalPendingGradingCount }} bài cần chấm
						</v-chip>

						<uc-btn-with-dialog-add-bt :khoiid="group.KhoiID" :monhocid="group.MonHocID" :group />
					</div>
				</v-col>
			</v-row>

		</div>



		<!--  hiển thị danh sách lớp  (Bảng điều khiển lớp học)-->
		<v-expansion-panels variant="accordion" v-model="panel" v-if="!isLibraryView">
			<!-- Mỗi tuần là 1 expansion panel1 -->
			<v-expansion-panel v-model="showWeek" v-for="week in group.weeks" :key="week.TuanHocID">
				<v-expansion-panel-title class="week-group-header">
					{{ week.Tuan_HienThi }}
				</v-expansion-panel-title>

				<v-expansion-panel-text>
					<v-expansion-panels variant="accordion">
						<v-expansion-panel v-for="classItem in week.classes" :key="classItem.LopID">
							<v-expansion-panel-title>
								<div class="class-row-header">
									<div class="class-info">
										<div class="class-name">{{ classItem.TenLop }}</div>
										<div class="class-meta mt-2">
											<span>Sĩ số: {{ classItem.StudentCount }} học sinh</span>
											<span class="pending-tag"
												v-if="getPendingCount(classItem) > 0 && classItem.ResourceType == 'ASSIGNMENT'">
												<v-icon size="small" class="mr-1">mdi-alert-circle</v-icon>
												{{ getPendingCount(classItem) }} bài cần chấm
											</span>
										</div>
									</div>
									<div class="class-actions">
										<v-btn size="small" variant="tonal" color="purple" text="Xem sổ điểm"
											@click.stop="xemTinhTrang(classItem)" />
									</div>
								</div>
							</v-expansion-panel-title>

							<v-expansion-panel-text>
								<div>
									<uc-assignment-status-row v-for="assignment in classItem.assignments"
										:key="assignment.AssignToClassID" :assignment="assignment" />
								</div>
								<div class="text-center text-grey pa-2" v-if="classItem.assignments.length === 0">
									Lớp này chưa được giao bài tập nào.
								</div>
							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>

		<!-- Library view -->
		<v-list v-if="isLibraryView">
			<div v-for="weekGroup in group.weeks" :key="weekGroup.title" class="week-group">
				<v-list-subheader class="week-group-header">{{ weekGroup.title }}</v-list-subheader>

				<div v-for="chapterGroup in weekGroup.chapters" :key="chapterGroup.title">
					<uc-content-library-item v-for="item in chapterGroup.items.filter(x => x.ResourceID > 0)"
						:key="item.ResourceType + item.ResourceID" :item="item" />
					<p v-if="chapterGroup.items.filter(x => x.ResourceID > 0).length === 0"
						class="text-center text-caption text-center">
						Bạn chưa thêm Assignment hoặc Lesson. Vui lòng bấm tạo nội dung
					</p>
				</div>
			</div>
		</v-list>


	</v-card>
</template>

<script>
export default {
	name: 'uc-teaching-group-card',
	props: {
		group: Object,
		isLibraryView: {
			type: Boolean,
			default: false
		}
	},
	emits: ['view-class', 'grade-class', 'create-assignment'],
	data() {
		return {
			isDialogEditBT: false,
			panel: [0],

		}
	},
	computed: {
		showWeek: function () {
			return []
		}
	},
	methods: {
		onOpenWindow(title, url) {
			openWindow({
				title, url,
				onclose: {
					EXE: "vueData.initPage()"
				}
			})
		},
		getSubjectIcon(subjectName) {
			const name = (subjectName || '').toLowerCase();
			if (name.includes('toán')) return 'mdi-calculator-variant';
			if (name.includes('tin học') || name.includes('robotics')) return 'mdi-robot-industrial';
			if (name.includes('văn') || name.includes('việt')) return 'mdi-book-open-page-variant';
			if (name.includes('anh')) return 'mdi-translate';
			if (name.includes('lý')) return 'mdi-atom';
			if (name.includes('hóa')) return 'mdi-flask';
			return 'mdi-school';
		},
		getSubjectColor(subjectName) {
			const name = (subjectName || '').toLowerCase();
			if (name.includes('toán')) return 'blue';
			if (name.includes('tin học') || name.includes('robotics')) return 'teal';
			if (name.includes('văn') || name.includes('việt')) return 'red';
			if (name.includes('anh')) return 'purple';
			if (name.includes('lý')) return 'indigo';
			if (name.includes('hóa')) return 'green';
			return 'grey';
		},
		getTypeColor(type) {
			const resourceType = (type || '').toLowerCase();
			if (resourceType.includes('ASSIGNMENT')) return 'blue';
			if (resourceType.includes('LESSON') || name.includes('robotics')) return 'teal';

			return 'grey';
		},
		getPendingCount(classItem) {
			if (!classItem.assignments) return 0;
			return classItem.assignments.reduce((sum, a) => {
				return sum + (a.PendingGradingCount || 0);
			}, 0);
		},
		xemTinhTrang(assignment) {
			this.$emit('view-class', this.classItem);
			// onOpenWindow('Tình trạng nộp bài', `/lms_Assignment-Class-Detail?Flag=1` )}
			console.log(assignment);
			// console.log(assignmentID)
			openWindow({
				title: "Sổ điểm Lớp học",
				url: `/lms-teacher-gradebook?LopID=${assignment.LopID}&MonHocID=${assignment.MonHocID}&HocKi=${vueData.HocKiItem.HocKi}`,
				id: "WinGiaoBaiTap"
			});
		}
	}
}
</script>