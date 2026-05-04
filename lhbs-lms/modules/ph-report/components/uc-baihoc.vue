<template>
	<div class="pa-4" style="max-height: calc(100dvh - 212px); overflow: auto; padding-bottom: 48px !important">

		<!-- Tổng quan -->
		<v-row dense class="mb-2">
			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="blue lighten-5" elevation="1">
					<v-icon color="white">mdi-book-open-variant</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ tongSoMon }}</div>
					<div class="text-caption">Môn học</div>
				</v-card>
			</v-col>

			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="green lighten-5" elevation="1">
					<v-icon color="white">mdi-check-circle</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ tongHoanThanh }}</div>
					<div class="text-caption">Hoàn thành</div>
				</v-card>
			</v-col>

			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="orange lighten-5" elevation="1">
					<v-icon color="white">mdi-clock-outline</v-icon>
					<div class="text-white text-h6 font-weight-bold mt-1">{{ tongDangHoc }}</div>
					<div class="text-white text-caption">Đang học</div>
				</v-card>
			</v-col>

			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="purple lighten-5" elevation="1">
					<v-icon color="white">mdi-file-document</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ tongBaiHoc }}</div>
					<div class="text-caption">Tổng bài học</div>
				</v-card>
			</v-col>
		</v-row>

		<!-- Danh sách bài học -->
		<v-card elevation="2">
			<v-card-title class="py-2 bg-blue darken-2 text-white">
				<v-icon color="white" size="20" class="mr-2">mdi-format-list-bulleted</v-icon>
				<span class="text-subtitle-1">Tiến độ bài học</span>
			</v-card-title>

			<v-expansion-panels accordion flat>
				<v-expansion-panel v-for="(mon, index) in danhSachMonHoc" :key="index">
					<v-expansion-panel-title class="py-2">
						<div class="d-flex align-center justify-space-between" style="width: 100%">
							<div class="d-flex align-center">
								<v-icon :color="mon.color" class="mr-2">{{ mon.icon }}</v-icon>

								<div>
									<div class="text-subtitle-2 font-weight-medium">{{ mon.ten }}</div>
									<div class="text-caption text--secondary">{{ mon.baiHoc.length }} bài</div>
								</div>
							</div>

							<v-chip x-small :color="getTienDoColor(mon.tiLe)" dark>
								{{ mon.tiLe }}%
							</v-chip>
						</div>
					</v-expansion-panel-title>

					<v-expansion-panel-text>
						<v-progress-linear :value="mon.tiLe" :color="getTienDoColor(mon.tiLe)" height="6" rounded
							class="mb-3"></v-progress-linear>

						<v-list class="mt-0 pt-0">
							<div v-for="(lesson, idx) in mon.baiHoc" :key="idx">
								<v-list-item class="py-2" two-line>
									<v-list-item-title class="text-body-2 font-weight-medium mb-1">
										{{ lesson.Title }}
									</v-list-item-title>

									<v-list-item-subtitle class="text-caption">
										<v-icon x-small class="mr-1">mdi-calendar</v-icon>
										{{ getTuanShort(lesson.TuanHienThi) }}

										<span class="mx-1">•</span>

										<v-icon x-small class="mr-1">mdi-clock</v-icon>
										{{ formatTimeSpent(lesson.TimeSpentSeconds) }}
									</v-list-item-subtitle>

									<template #append>
										<div class="text-right">
											<v-chip x-small :color="lesson.IsCompleted ? 'success' : 'warning'" dark>
												{{ lesson.IsCompleted ? 'Hoàn thành' : 'Chưa hoàn thành' }}
											</v-chip>

											<div v-if="lesson.CompletedDate" class="text-caption mt-1">
												Hoàn thành: {{ formatDateShort(lesson.CompletedDate) }}
											</div>
											<div v-else class="text-caption mt-1 text--secondary">
												Chưa hoàn thành
											</div>
										</div>
									</template>
								</v-list-item>

								<v-divider v-if="idx < mon.baiHoc.length - 1"></v-divider>
							</div>
						</v-list>

					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>
	</div>
</template>

<script>
	export default {
		name: "LessonTracker",
	
		data() {
			return {
				lessonData: [] // nhận từ API
			};
		},
	
		async mounted() {
			this.lessonData = await ajaxCALLPromise("lms/EL_PhuHuynh_TienDoBaiHoc_ByHocSinhID", {
				HocSinhID: vueData.HocSinhSelected.HocSinhID
			});
		},
	
		computed: {
			danhSachMonHoc() {
				const map = {};
	
				this.lessonData.forEach(item => {
					if (!map[item.TenMonHoc_HienThi]) {
						map[item.TenMonHoc_HienThi] = {
							icon: item.Icon || 'mdi-book',
							color: item.Color || '#757575',
							items: []
						};
					}
					map[item.TenMonHoc_HienThi].items.push(item);
				});
	
				return Object.keys(map).map(tenMon => {
					const baiHoc = map[tenMon].items;
	
					const hoanThanh = baiHoc.filter(x => Number(x.IsCompleted) === 1).length;
	
					return {
						ten: tenMon,
						icon: map[tenMon].icon,
						color: map[tenMon].color,
						baiHoc: baiHoc,
						hoanThanh: hoanThanh,
						tong: baiHoc.length,
						tiLe: baiHoc.length > 0 ? Math.round((hoanThanh / baiHoc.length) * 100) : 0
					};
				});
			},
	
			tongSoMon() {
				return this.danhSachMonHoc.length;
			},
	
			tongHoanThanh() {
				return this.lessonData.filter(x => x.IsCompleted === 1).length;
			},
	
			tongDangHoc() {
				// Đang học = chưa hoàn thành & có TimeSpentSeconds > 0
				return this.lessonData.filter(x => x.IsCompleted === 0 && x.TimeSpentSeconds > 0).length;
			},
	
			tongBaiHoc() {
				return this.lessonData.length;
			}
		},
	
		methods: {
			getTuanShort(str) {
				const match = str.match(/Tuần (\d+) - Tháng (\d+)/);
				if (match) return `Tuần ${match[1]} - T${match[2]}`;
				return str;
			},
	
			formatDateShort(dateStr) {
				if (!dateStr) return '';
				const d = new Date(dateStr);
				return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
					.toString().padStart(2, '0')} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
			},
	
			formatTimeSpent(sec) {
				if (!sec) return "0:00";
				const m = Math.floor(sec / 60);
				const s = sec % 60;
				return `${m}:${s.toString().padStart(2, '0')}`;
			},
	
			getTienDoColor(val) {
				if (val >= 80) return "success";
				if (val >= 50) return "info";
				if (val >= 30) return "warning";
				return "error";
			}
		}
	}
</script>

<style scoped>
	.v-expansion-panel-text {
		padding-top: 8px !important;
	}
</style>