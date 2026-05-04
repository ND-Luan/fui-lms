<template>
	<div class="pa-4" style="max-height: calc(100dvh - 212px); overflow: auto; padding-bottom: 48px !important">
		<!-- Tổng quan - Cards nhỏ gọn -->
		<v-row dense class="mb-2">
			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="blue lighten-5" elevation="1">
					<v-icon color="white" size="28">mdi-book-open-variant</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ tongSoMon }}</div>
					<div class="text-caption">Môn học</div>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="green lighten-5" elevation="1">
					<v-icon color="white" size="28">mdi-check-circle</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ hoanhThanh }}</div>
					<div class="text-caption">Hoàn thành</div>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="orange lighten-5" elevation="1">
					<v-icon color="white" size="28">mdi-clock-outline</v-icon>
					<div class="text-white text-h6 font-weight-bold mt-1">{{ dangLam }}</div>
					<div class="text-white text-caption">Đang làm</div>
				</v-card>
			</v-col>
			<v-col cols="6" sm="3">
				<v-card class="pa-3 text-center" color="purple lighten-5" elevation="1">
					<v-icon color="white" size="28">mdi-file-document</v-icon>
					<div class="text-h6 font-weight-bold mt-1">{{ tongBaiTap }}</div>
					<div class="text-caption">Tổng bài tập</div>
				</v-card>
			</v-col>
		</v-row>

		<!-- Danh sách môn học - Compact -->
		<v-card elevation="2">
			<v-card-title class="py-2 bg-blue darken-2 text-white">
				<v-icon color="white" size="20" class="mr-2">mdi-format-list-bulleted</v-icon>
				<span class="text-subtitle-1">Tiến độ theo môn</span>
			</v-card-title>

			<v-expansion-panels accordion flat>
				<v-expansion-panel v-for="(mon, index) in danhSachMonHoc" :key="index">
					<v-expansion-panel-title class="py-2">
						<div class="d-flex align-center justify-space-between" style="width: 100%;">
							<div class="d-flex align-center">
								<v-icon :color="mon.color" size="20" class="mr-2">
									{{ mon.icon }}
								</v-icon>
								<div>
									<div class="text-subtitle-2 font-weight-medium">{{ mon.ten }}</div>
									<div class="text-caption text--secondary">{{ mon.baiTap.length }} bài</div>
								</div>
							</div>
							<v-chip x-small :color="getTienDoColor(mon.tiLe)" dark class="mr-2">
								{{ mon.tiLe }}%
							</v-chip>
						</div>
					</v-expansion-panel-title>

					<v-expansion-panel-text>
						<v-progress-linear :value="mon.tiLe" :color="getTienDoColor(mon.tiLe)" height="6" class="mb-3"
							rounded></v-progress-linear>

						<v-list class="mt-0 pt-0">
							<template v-for="(baiTap, idx) in mon.baiTap" :key="idx">
								<v-list-item class="py-2" two-line>
									<v-list-item-title class="text-body-2 font-weight-medium mb-1">
										{{ baiTap.Title }}
									</v-list-item-title>
									<v-list-item-subtitle class="text-caption">
										<v-icon x-small class="mr-1">mdi-calendar</v-icon>
										{{ getTuanShort(baiTap.TuanHienThi) }}
										<span class="mx-1">•</span>
										<v-icon x-small class="mr-1">mdi-clock</v-icon>
										{{ formatDateShort(baiTap.SubmissionTime) }}
									</v-list-item-subtitle>
									<template #append>
										<div class="text-right">
											<v-chip x-small :color="getStatusColor(baiTap.SubmissionStatus)" dark>
												{{ getStatusText(baiTap.SubmissionStatus) }}
											</v-chip>
											<div v-if="baiTap.Score !== null" class="text-body-2 font-weight-bold mt-1">
												{{ baiTap.Score }}/{{ baiTap.MaxScore }}
											</div>
											<div v-else class="text-caption text--secondary mt-1">
												Chưa chấm
											</div>
										</div>
									</template>
								</v-list-item>
								<v-divider v-if="idx < mon.baiTap.length - 1"></v-divider>
							</template>
						</v-list>
					</v-expansion-panel-text>
				</v-expansion-panel>
			</v-expansion-panels>
		</v-card>
	</div>
</template>

<script>
	export default {
		name: 'HomeworkTracker',
		data() {
			return {
				vueData,
				homeworkData: []
			}
		},
		async mounted() {
			this.homeworkData = await ajaxCALLPromise("lms/EL_PhuHuynh_TienDoBaiTap_ByHocSinhID", {
				HocSinhID: vueData.HocSinhSelected.HocSinhID
			})
		},
		computed: {
			danhSachMonHoc() {
				const monHocMap = {};
	
				this.homeworkData.forEach(item => {
					if (!monHocMap[item.TenMonHoc_HienThi]) {
						monHocMap[item.TenMonHoc_HienThi] = {
							icon: item.Icon || 'mdi-book',
							color: item.Color || '#757575',
							items: []
						};
					}
					monHocMap[item.TenMonHoc_HienThi].items.push(item);
				});
	
				return Object.keys(monHocMap).map(tenMon => {
					const baiTap = monHocMap[tenMon].items;
					const hoanhThanh = baiTap.filter(bt => bt.SubmissionStatus === 4).length;
					const tiLe = Math.round((hoanhThanh / baiTap.length) * 100);
	
					return {
						ten: tenMon,
						icon: monHocMap[tenMon].icon,
						color: monHocMap[tenMon].color,
						baiTap: baiTap,
						hoanhThanh: hoanhThanh,
						tong: baiTap.length,
						tiLe: tiLe
					};
				});
			},
	
			tongSoMon() {
				return this.danhSachMonHoc.length;
			},
	
			hoanhThanh() {
				return this.homeworkData.filter(item => item.SubmissionStatus === 4).length;
			},
	
			dangLam() {
				return this.homeworkData.filter(item => item.SubmissionStatus === 2).length;
			},
	
			tongBaiTap() {
				return this.homeworkData.length;
			}
		},
	
		methods: {
			getStatusText(status) {
				switch (status) {
					case 0: return 'Chưa làm';
					case 1: return 'Đang làm';
					case 2: return 'Đã nộp';
					case 3: return 'Đang chấm';
					case 4: return 'Hoàn thành';
					default: return 'Không xác định';
				}
			},
		
				getStatusColor(status) {
				return status === 4 ? 'success' : 'warning';
			},
	
			getTienDoColor(tiLe) {
				if (tiLe >= 80) return 'success';
				if (tiLe >= 50) return 'info';
				if (tiLe >= 30) return 'warning';
				return 'error';
			},
	
			getTuanShort(tuanStr) {
				// "Tuần 4 - Tháng 10 - (27/10/2025 - 31/10/2025)" => "Tuần 4 - T10"
				const match = tuanStr.match(/Tuần (\d+) - Tháng (\d+)/);
				if (match) {
					return `Tuần ${match[1]} - T${match[2]}`;
				}
				return tuanStr;
			},
	
			formatDateShort(dateStr) {
				const date = new Date(dateStr);
				const day = String(date.getDate()).padStart(2, '0');
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${day}/${month} ${hours}:${minutes}`;
			}
		}
	}
</script>

<style scoped>
	.v-expansion-panel-text {
		padding-top: 8px !important;
	}
</style>