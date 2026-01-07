<template>
	<v-list>
		<v-list-subheader>Tiến độ môn học</v-list-subheader>
		<div class="px-2">
			<v-expansion-panels v-model="panel" class="rounded-sm">
				<v-expansion-panel v-for="td in DSTienDo" class="mb-3">
					<v-expansion-panel-title class="pa-2" style="background-color: rgb(229 229 229);">
						<div class="d-flex algin-center w-100">
							<span class="text-subtitle-5 font-weight-medium text-no-wrap">
								<v-icon class="mr-2" :color="td.Color">{{ td.Icon }}</v-icon> {{ td.MonHocName }}
							</span>
							<v-spacer />
							<!-- <v-progress-linear :model-value="calc_progress(td)" color="teal-lighten-3" height="15"
								rounded bg-color="rgba(255, 255, 255, 0.3)" class="border ma-0"
								style="max-width: 200px">
								<template v-slot:default="{ value }">
									<strong>{{ Math.ceil(calc_progress(td)) }}%</strong>
								</template></v-progress-linear> -->
							<div class="progress-label d-flex align-center" style="white-space: nowrap;">
								{{ Math.round(calc_progress(td)) }}% hoàn thành
							</div>
						</div>
					</v-expansion-panel-title>
					<v-expansion-panel-text class="border">
						<v-list :density="vueData.density">
							<v-list-subheader>
								<div class="d-flex align-center">
									<p>Danh sách bài tập & bài học</p>
									<v-spacer />
									<v-btn size="small" color="primary" variant="tonal">Xem sổ điểm</v-btn>
								</div>
							</v-list-subheader>
							<template v-for="(ct, idx) in DetailMonHoc.DanhSachChiTiet">
								<v-list-item @click="onOpenWindow(ct)">
									<v-list-item-title>{{ ct.Title }}</v-list-item-title>
									<v-list-item-subtitle>
										{{ ct.Tuan_HienThi }}
										<span v-if="ct.DueDate">• Hạn nộp: {{ formatDate(ct.DueDate) }}</span>
									</v-list-item-subtitle>
									<template #append>
										<v-chip size="small" v-if="ct.StudentScore">Điểm: {{ ct.StudentScore }}</v-chip>
									</template>
									<template #prepend>
										<v-icon v-if="ct.ResourceType === 'ASSIGNMENT'"
											color="primary">mdi-book</v-icon>
										<v-icon v-else color="green">mdi-book-open-variant</v-icon>
									</template>
								</v-list-item>
								<v-divider v-if="idx !== DetailMonHoc.DanhSachChiTiet.length - 1" />
							</template>
						</v-list>
					</v-expansion-panel-text>

				</v-expansion-panel>
			</v-expansion-panels>
		</div>

	</v-list>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number
		},
		data() {
			return {
				panel: [],
				DSTienDo: [],
				DetailMonHoc: {
					DanhSachChiTiet: [],
					Tong: []
				},
				vueData
			}
		},
		async mounted() {
			this.DSTienDo = await ajaxCALLPromise("lms/EL_Student_Get_TienDo_ByHocSinhID", {
				HocSinhID: vueData.user.UserID,
				NienKhoa: this.NienKhoa
			})
		}, computed: {}, watch: {
			panel: function (panel) {
				if (panel === null) return
				const MonHoc = this.DSTienDo.find((_, idx) => idx === panel)
				this.onLoadDetailMonHoc(MonHoc?.MonHocID ?? 0)
				console.log("panel", panel)
			}
		},
		methods: {
			calc_progress(td) {
				if (!td?.TotalTasks || td?.TotalTasks === 0) return 0;
				return (td?.CompletedTasks / td?.TotalTasks) * 100;
			},
			onOpenWindow(ct) {
				let url = null
				if (ct.ResourceType === 'LESSON') url = `/lms-student-lesson-viewer?AssignToClassID=${ct.AssignToClassID}`
				else url = `/lms-student-assignment?AssignToClassID=${ct.AssignToClassID}`
				openWindow({
					title: 'Xem lại ' + `${ct.ResourceType === 'LESSON' ? 'bài học ' : 'bài tập '}` + ct.Title,
					url: url,
				})
			},
			async onLoadDetailMonHoc(id) {
				const DetailMonHoc = await ajaxCALLPromise("lms/EL_Student_GetSubjectProgressDetail", {
					MonHocID: id
				})
				this.DetailMonHoc.DanhSachChiTiet = DetailMonHoc[0]
				this.DetailMonHoc.Tong = DetailMonHoc[1][0]
			},
			formatDate(dateString) {
				if (!dateString) return '';
				return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
			}
		},
	}
</script>