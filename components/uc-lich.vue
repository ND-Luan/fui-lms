<template>
	<v-dialog fullscreen>
		<template v-slot:activator="{ props: activatorProps }">
			<slot name="activator" :activator-props="activatorProps">
				<v-btn v-bind="activatorProps" variant="flat" size="small">
					<v-icon start>mdi-calendar-month</v-icon>
					Thời khóa biểu
				</v-btn>
			</slot>
		</template>

		<template v-slot:default=" { isActive }">
			<v-card elevation="0" outlined>
				<!-- Header compact -->
				<div class="d-flex align-center justify-space-between border-b w-100">
					<v-list-item class="w-100">
						<v-list-item-title class="font-weight-medium">Thời Khóa Biểu</v-list-item-title>
						<v-list-item-subtitle class="text-caption text-grey-darken-1">
							{{ThoiKhoaBieu.ThoiGian?.TuNgay}}
							-
							{{ThoiKhoaBieu.ThoiGian?.DenNgay}}
						</v-list-item-subtitle>
						<template #prepend><v-icon size="20" color="primary"
								class="mr-2">mdi-calendar-month</v-icon></template>
						<template #append>
							<v-btn @click="isActive.value = false" icon="mdi-close" />
						</template>
					</v-list-item>
				</div>

				<!-- Tabs compact -->
				<v-tabs v-model="tab" color="primary" density="compact" show-arrows>
					<v-tab :value="lh.LopHocID" v-for="lh in DSLopHoc" :key="lh.LopHocID" class="text-caption">
						{{lh.TenLop}}
					</v-tab>
				</v-tabs>

				<!-- Content -->
				<v-tabs-window v-model="tab">
					<v-tabs-window-item :value="lh.LopHocID" v-for="lh in DSLopHoc" :key="lh.LopHocID"
						style="max-height: calc(100dvh - 90px); overflow: auto">
						<div class="pa-2">
							<v-row dense>
								<v-col v-for="kb in ThoiKhoaBieu.DSTKB" :key="kb.Thu" cols="4" sm="4" md="4" lg="3"
									xl="2">
									<v-card variant="outlined" class="schedule-card-compact"
										:class="kb.Thu === getCurrentDay() ? 'current-day-compact' : ''">
										<!-- Header ngày compact -->
										<div class="day-header px-2 py-1">
											<!-- <div class="text-caption text-grey" style="font-size: 9px;">{{getThuName(kb.Thu)}}
												</div> -->
											<div class="text-body-2 font-weight-bold" style="font-size: 12px;">Thứ
												{{kb.Thu}}</div>
										</div>

										<!-- Danh sách tiết -->
										<div class="pa-1">
											<div v-for="(buoi, index) in kb.DSBuoi" :key="index" class="mb-1">
												<!-- Tên buổi compact -->
												<div class="d-flex align-center mb-1">
													<div class="buoi-dot mr-1"
														:class="buoi.Buoi === 1 ? 'dot-morning' : 'dot-afternoon'">
													</div>
													<span class="buoi-label">
														{{buoi.TenBuoi}}
													</span>
												</div>

												<!-- Danh sách tiết compact -->
												<div v-for="tiet in buoi.jsonTiet" :key="tiet.Tiet"
													class="tiet-compact-mini mb-1">
													<div class="tiet-row">
														<span class="tiet-num">{{tiet.Tiet}}</span>
														<div class="tiet-info">
															<div class="mon-hoc">{{tiet.TenMon}}</div>
															<div class="giao-vien">{{tiet.GiaoVien}}</div>
														</div>
													</div>
												</div>
											</div>

											<!-- Empty state compact -->
											<div v-if="kb.DSBuoi.length === 0" class="text-center py-2">
												<v-icon size="x-small" color="grey-lighten-1">mdi-sleep</v-icon>
												<div class="empty-text">Nghỉ</div>
											</div>
										</div>
									</v-card>
								</v-col>
							</v-row>

							<!-- Empty state -->
							<div v-if="ThoiKhoaBieu.DSTKB.length === 0" class="text-center py-6">
								<v-icon size="48" color="grey-lighten-2">mdi-calendar-blank</v-icon>
								<div class="text-body-2 text-grey mt-2">Chưa có thời khóa biểu</div>
							</div>
						</div>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-card>
		</template>
	</v-dialog>

</template>

<script>
	export default {
		props: {
			HocSinh: Object
		},
		data() {
			return {
				tab: null,
				vueData,
				HocSinhSelected_Calen: null,
				DSLopHoc: [],
				ThoiKhoaBieu: {
					ThoiGian: null,
					DSTKB: []
				}
			}
		},
		mounted() {
			if (this.HocSinh) {
	this.getLop()
			}
		},
		watch: {
			tab: function (LopHocID) {
				if (!LopHocID) return
				this.getTKB(LopHocID)
			},
			HocSinh: function (HocSinh) {
				console.log("HocSinh", HocSinh)
				if (!this.HocSinh) return
				this.getLop()
			}
		},
		methods: {
			async getLop() {
				this.DSLopHoc = await ajaxCALLPromise("quansinh/TKB_LopHocSelectByHocSinh", { HocSinhID: this.HocSinh.HocSinhID })
				this.tab = this.DSLopHoc[0]?.LopHocID ?? null
			},
			async getTKB(LopHocID) {
				const monday = moment().startOf('isoWeek').format('YYYY-MM-DD');
				const tkb = await ajaxCALLPromise("quansinh/TKB_Lop_HocSinh", { LopHocID, NgayDauTuan: monday })
				this.ThoiKhoaBieu.ThoiGian = tkb[0][0] ?? {}
				const kb = tkb[2].map(x => {
					return {
						...x,
						jsonTiet: JSON.parse(x.jsonTiet)
					}
				})
				const ListThu = [...new Set(kb.map(x => x.Thu))]
				const newArr = []
				for (var thu of ListThu) {
					const arrFilter = kb.filter(x => x.Thu === thu)
					newArr.push({
						Thu: thu,
						LopHocID,
						DSBuoi: arrFilter
					})
				}
				this.ThoiKhoaBieu.DSTKB = newArr
				console.log("ThoiKhoaBieu", this.ThoiKhoaBieu)
			},
			getThuName(thu) {
				const names = ['', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN']
				return names[thu] || ''
			},
			getCurrentDay() {
				return moment().isoWeekday() // 1 = Monday, 7 = Sunday
			}
		},
	}
</script>