<template>
	<div style="height: calc(100dvh - 24px); overflow-y: auto; padding: 8px">
		<v-card elevation="2" class="mb-4 rounded-lg" density="compact">
			<v-card-item class="py-2">
				<v-card-title class="text-h6 font-weight-bold">
					<v-icon icon="mdi-account-circle" size="small" class="mr-2"></v-icon>
					Welcome Back! <span class="text-primary ml-2"> {{ vueData.user.LastName }} {{vueData.user.FirstName
						}}</span>
				</v-card-title>
				<v-card-subtitle class="">
					<p>{{vueData.user.UserID}} - {{vueData.user.Email}}</p>
				</v-card-subtitle>
			</v-card-item>
		</v-card>

		<v-img src="/_cdn/lhbs-lms/bg_home_lms.png" height="450" />
		<div>
			<div class="text-h6">
				🌟 Giới thiệu hệ thống LMS dành cho giáo viên
			</div>
			<div>
				Chào mừng đến với Hệ thống Quản lý Học tập (LMS) – công cụ hỗ trợ đắc lực cho giáo viên trong việc theo
				dõi, đánh giá và quản lý học sinh một cách hiệu quả và thuận tiện.
				<br /> Với giao diện thân thiện và hiện đại,
				hệ thống giúp giáo viên tiết kiệm thời gian, tập trung vào việc giảng dạy chất lượng hơn.
			</div>
		</div>
		<div class="text-h6 mt-2">
			🔧 Tính năng chính
		</div>
		<div>
			<div>
				<div class="text-title">
					📝 Nhập điểm
				</div>
				<v-list-item>
					<v-list-item-title>
						• Dễ dàng nhập và cập nhật điểm số theo môn học, từng kỳ hoặc từng bài kiểm tra.
					</v-list-item-title>
				</v-list-item>
			</div>
			<div>
				<div class="text-title">
					🗒️ Nhập nhận xét tháng
				</div>
				<v-list-item>
					<v-list-item-title>
						• Ghi nhận và lưu trữ nhận xét định kỳ về thái độ học tập, ý thức và tiến bộ của học sinh.
					</v-list-item-title>
				</v-list-item>
			</div>
			<div>
				<div class="text-title">
					📊 Xem báo cáo học tập
				</div>
				<v-list-item>
					<v-list-item-title>
						• Truy cập nhanh các báo cáo tổng hợp: điểm trung bình, biểu đồ tiến bộ, đánh giá tổng quan của
						lớp.
					</v-list-item-title>
				</v-list-item>
			</div>
			<div>
				<div class="text-title">
					📋 Xem danh sách học sinh
				</div>
				<v-list-item>
					<v-list-item-title>
						• Danh sách học sinh được trình bày rõ ràng, dễ tìm kiếm, kèm thông tin cơ bản và tình trạng học
						tập.
					</v-list-item-title>
				</v-list-item>

			</div>
		</div>
		<!-- <v-card class="mb-3" flat>
			<v-tabs v-model="activeKhoi" bg-color="primary" density="compact" show-arrows slider-color="primary"
				selected-class='text-primary bg-white'>
				<v-tab v-for="(khoi, index) in khoiList" :key="index" :value="index"
					class="text-body-2 font-weight-medium">
					Khối {{ khoi }}
				</v-tab>
			</v-tabs>

			<v-window v-model="activeKhoi">
				<v-window-item v-for="(khoi, index) in khoiList" :key="index" :value="index">
					<v-card flat>
						<v-card-text class="pa-2">
							<div v-if="getLopByKhoi(khoi).length === 0" class="text-center pa-3">
								<v-icon icon="mdi-alert-circle-outline" size="small" color="warning" class="mb-1">
								</v-icon>
								<div class="text-caption">Không có lớp nào thuộc khối này</div>
							</div>

							<v-expansion-panels v-else variant="accordion" multiple density="compact">
								<v-expansion-panel v-for="lop in getLopByKhoi(khoi)" :key="lop.LopID" class="mb-1"
									rounded="sm">
									<v-expansion-panel-title density="compact">
										<div class="d-flex align-center">
											<v-icon icon="mdi-google-classroom" size="small" class="mr-2"></v-icon>
											<span class="text-body-2">Lớp {{ lop.TenLop }}</span>
										</div>
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-row dense>
											<v-col cols="6" sm="4" md="3" lg="2" v-for="mon in lop.DSMon"
												:key="mon.MonID" class="pa-1">
												<v-card :color="mon.Color" class="pa-2 d-flex align-center" height="48"
													elevation="1" rounded="sm" density="compact">
													<v-icon icon="mdi-book-open-variant" size="small"
														class="mr-1"></v-icon>
													<span class="  text-caption font-weight-medium text-truncate">{{
														mon.TenMon }}</span>
												</v-card>
											</v-col>
											<v-col v-if="lop.DSMon.length === 0" cols="12" class="text-center pa-1">
												<v-alert type="info" text="Không có môn học nào" variant="tonal"
													density="compact" class="text-caption"></v-alert>
											</v-col>
										</v-row>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card-text>
					</v-card>
				</v-window-item>
			</v-window>
		</v-card> -->
	</div>
</template>

<script>
	export default {
		data() {
			return {
				vueData,
				data: [],
				activeKhoi: 0,
				khoiList: [],
				loading: false
			};
		},
		mounted() {
			// this.getDSLop(vueData.user.FunctionRight);
		},
		methods: {
			getDSLop(FunctionRight) {
				this.loading = true;
				ajaxCALL('lms/Lop_Mon_Get', null, res => {
					const _data = res.data.map(x => ({
						...x,
						FunctionRight: x.CapID === 1 ? '10' : x.CapID === 2 ? '20' : '30'
					}));
	
					const filteredData = _data.filter(x => FunctionRight.includes(x.FunctionRight));
	
					this.khoiList = [...new Set(filteredData.map(x => x.KhoiID))].sort((a, b) => a - b);
					const DSLop = this.khoiList.map(khoiID => {
						const khoiFiltered = filteredData.filter(x => x.KhoiID === khoiID);
						const lopIDs = [...new Set(khoiFiltered.map(x => x.LopID))];
	
						const DSLop = lopIDs.map(lopID => {
							const lopFiltered = khoiFiltered.filter(x => x.LopID === lopID);
							const _lop = lopFiltered[0];
							return {
								LopID: lopID,
								TenLop: _lop?.TenLop ?? '',
								KhoiID: khoiID,
								DSMon: lopFiltered.map(mon => ({
									Color: mon.Color || 'primary',
									MonID: mon.MonID,
									TenMon: mon.MonHocName
								}))
							};
						});
	
						return DSLop;
					}).flat();
	
					this.data = DSLop;
					this.loading = false;
					console.log('Structured Data:', this.data);
				});
			},
			getLopByKhoi(khoiID) {
				return this.data.filter(lop => lop.KhoiID === khoiID);
			}
		}
	}
</script>