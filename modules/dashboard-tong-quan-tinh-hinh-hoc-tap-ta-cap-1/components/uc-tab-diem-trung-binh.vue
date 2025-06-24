<template>
	<v-card style="background-color: #f9f9f9;">
		<v-card-text>
			<v-row>
				<v-col cols="12">
					<v-card :flat="false">
						<v-card-title class="text-primary d-flex align-center">
							Điểm tiến bộ cuối kì so với giữa kì
							<v-spacer></v-spacer>
							<v-btn color="primary" variant="tonal" @click="
								onLoadChart3({
									NienKhoa: vueData.NienKhoa,
									CapID: capid,
									MonHocID: monhocid
								})
								">Xem dữ liệu</v-btn>
						</v-card-title>
						<v-card-text>
							<v-row>
								<v-col cols="2">
									<v-list lines="two">
										<v-card-title class="text-primary font-weight-medium pl-4">Cấp
											C{{ vueData.CapID }}</v-card-title>

										<v-list-item>
											<p class="text-body">Tổng số học sinh</p>
											<template v-slot:prepend>
												<v-btn color="red" icon="mdi-account-group" variant="text"></v-btn>
											</template>
											<v-list-item-title class="font-weight-medium">
												{{ Tong_Growth_GiuaKy_CuoiKi?.TongSoHocSinh ?? 0 }}
											</v-list-item-title>
										</v-list-item>
										<v-divider inset></v-divider>
										<v-list-item>
											<p class="text-body">Số học sinh cao hơn</p>
											<template v-slot:prepend>
												<v-btn color="orange" icon="mdi-human-capacity-increase"
													variant="text"></v-btn>
											</template>
											<v-list-item-title class="font-weight-medium">
												{{ Tong_Growth_GiuaKy_CuoiKi?.SoHocSinhCaoHon ?? 0 }}
											</v-list-item-title>
										</v-list-item>
										<v-divider inset></v-divider>
										<v-list-item>
											<p class="text-body">Tỉ lệ phần trăm</p>
											<template v-slot:prepend>
												<v-btn color="light-green" icon="mdi-arrow-up-circle-outline"
													variant="text"></v-btn>
											</template>
											<v-list-item-title class="font-weight-medium">
												{{ Tong_Growth_GiuaKy_CuoiKi?.TiLePhanTram ?? 0 }} %
											</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-col>
								<v-divider vertical></v-divider>
								<v-col>
									<v-row>
										<v-col v-for="(item, index) in List_Tong_Grade_Growth_GiuaKy_CuoiKi" cols="6">
											<v-card :flat="false">
												<v-card-title class="text-primary">
													Khối {{ item.KhoiID }}
													<v-spacer></v-spacer>
													<div class="d-flex ga-2">
														<v-chip color="red" prepend-icon="mdi-account-group">{{
															item?.TongSoHocSinh ?? 0 }}</v-chip>
														<v-chip color="orange"
															prepend-icon="mdi-human-capacity-increase">{{
																item?.SoHocSinhCaoHon ?? 0
															}}</v-chip>
														<v-chip color="light-green"
															prepend-icon="mdi-arrow-up-circle-outline">{{
																item?.TiLePhanTram ??
																0 }} %</v-chip>
													</div>
												</v-card-title>
												<v-row no-gutters>
													<v-col style="height: 200px; overflow:auto">
														<v-table>
															<thead>
																<tr>
																	<th class="text-right">
																		<v-btn color="primary" icon="mdi-school-outline"
																			variant="text"></v-btn>
																		Lớp
																	</th>
																	<th class="text-right">
																		<v-btn color="red" icon="mdi-account-group"
																			variant="text"></v-btn>
																		Số HS
																	</th>
																	<th class="text-right">
																		<v-btn color="orange"
																			icon="mdi-human-capacity-increase"
																			variant="text"></v-btn>
																		CK1 > GK1
																	</th>
																	<th class="text-right">
																		<v-btn color="light-green"
																			icon="mdi-arrow-up-circle-outline"
																			variant="text"></v-btn>
																		%
																	</th>
																</tr>
															</thead>
															<tbody>
																<tr
																	v-for="(lop, indexLop) in List_Tong_Class_Growth_GiuaKy_CuoiKi.filter(x => x.KhoiID === item.KhoiID)">
																	<td class="text-right">{{ lop.TenLop }}</td>
																	<td class="text-right">{{ lop.TongSoHocSinh }}</td>
																	<td class="text-right"> {{ lop.SoHocSinhCaoHon }}
																	</td>
																	<td class="text-right">{{ lop.TiLePhanTram }} %</td>
																</tr>
															</tbody>
														</v-table>
													</v-col>
												</v-row>
											</v-card>
										</v-col>
									</v-row>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="6">
					<v-card :flat="false">
						<v-card-title class="text-primary d-flex align-center">
							Tương quan điểm giữa kì và cuối kì
							<v-spacer></v-spacer>
							<v-btn color="primary" variant="tonal" @click="onLoadChart({
								NienKhoa: vueData.NienKhoa,
								KhoiID: khoiid,
								MonHocID: monhocid
							})">Xem biểu đồ</v-btn>
						</v-card-title>
						<v-card-text>
							<uc-chart-apex :options="Chart_DiemTrungBinh" />
						</v-card-text>
					</v-card>
				</v-col>
				<v-col cols="6">
					<v-card :flat="false">
						<v-card-title class="text-primary d-flex align-center">
							Tỉ lệ học sinh đạt và chưa đạt
							<v-spacer></v-spacer>
							<v-btn color="primary" variant="tonal" @click="onLoadChart2({
								NienKhoa: vueData.NienKhoa,
								KhoiID: khoiid,
								LopID: 0,
								MonHocID: monhocid
							})">Xem biểu đồ</v-btn>
						</v-card-title>
						<v-card-text>
							<uc-chart-apex :options="Chart_TiLe_TheoLop" />
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: {
		capid: {
			type: Number,
			required: true
		},
		khoiid: {},
		monhocid: {
			type: Number,
			required: true
		}
	},
	data() {
		return {
			form: {
				KhoiID: this.khoiid,
				MonHocItem: {
					MonHocID: this.monhocid
				},
			},
			isLoadingLop: false,
			Chart_TiLe_TheoLop: {
				"id": "chart-compare-giua-ky-cuoi-ki",
				"series": [],
				"chart": {
					"type": "bar",
					"height": 350,
					"stacked": true,
					"toolbar": {
						"show": true
					},
					"zoom": {
						"enabled": false
					}
				},
				"xaxis": {
					"categories": []
				},
				"plotOptions": {
					"bar": {
						"horizontal": false,
						"borderRadius": 10,
						"borderRadiusApplication": "end",
						"borderRadiusWhenStacked": "last",
						"dataLabels": {
							"total": {
								"enabled": true,
								"style": {
									"fontSize": "13px",
									"fontWeight": 900
								}
							}
						}
					}
				},
				"legend": {
					"position": "right",
					"offsetY": 40
				},
				"fill": {
					"opacity": 1
				}
			},
			Chart_DiemTrungBinh: {
				chart: {
					type: "bar",
					height: 350
				},
				series: [],
				yaxis: {
					min: 0,
					labels: {
						formatter: function (value) {
							return value.toFixed(2);
						}
					}
				}
			},
			Tong_Growth_GiuaKy_CuoiKi: null,
			List_Tong_Grade_Growth_GiuaKy_CuoiKi: null,
			List_Tong_Class_Growth_GiuaKy_CuoiKi: null,
			vueData
		}
	},
	async mounted() {
		// if (!this.form.KhoiID) return

		// // this.isLoadingLop = true
		// this.isLoadingMaNhomCotDiem = true
		// this.isLoadingMaCotDiem = true

		// // const LopID = localStorage.getItem('LopID_TA_C2')

		// if (LopID) {
		// 	// await this.onLoadDSLop(this.form.KhoiID)
		// 	// 	.then(() => this.form.LopID = LopID)
		// 	// 	.finally(() => this.isLoadingLop = false)
		// 	await this.onLoadChart({
		// 		NienKhoa: 2024,
		// 		KhoiID: this.form.KhoiID,
		// 		LopID: this.form.LopID,
		// 	})
		// }
		this.onLoadChart3({
			NienKhoa: vueData.NienKhoa,
			CapID: this.capid,
			MonHocID: this.monhocid
		})
	},
	computed: {},
	watch: {
		// khoiid: function (khoiID) {
		// 	if (khoiID) {
		// 		this.onLoadChart(
		// 			{
		// 				NienKhoa: 2024,
		// 				KhoiID: khoiID,
		// 				MonHocID: this.monhocid
		// 			}
		// 		)
		// 	}
		// }
	},
	methods: {
		onLoadChart({ NienKhoa, KhoiID, MonHocID }) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardDiem_Mean_Get',
					{
						NienKhoa,
						KhoiID,
						MonHocID
					},
					res => {
						const DiemTrungBinh = res.data
						const series = [
							{
								name: "Điểm giữa học kì 1",
								data: DiemTrungBinh.map(x => x.DiemGiua_HK1)
							},
							{
								name: "Điểm cuối học kì 1",
								data: DiemTrungBinh.map(x => x.DiemCuoi_HK1)
							},
							{
								name: "Điểm mean (TB) học kì 1",
								data: DiemTrungBinh.map(x => x.DiemTB_HK1)
							}
						]
						const categories = [...new Set(DiemTrungBinh.map(x => x.TenLop))]
						this.Chart_DiemTrungBinh = {
							...this.Chart_DiemTrungBinh,
							series: series,
							xaxis: {
								categories: categories
							},
							dataLabels: {
								enabled: false
							},
							stroke: {
								show: true,
								width: 2,
								colors: ['transparent']
							},
						}
						resolve()
					}
				)
			})
		},
		onLoadDSLop(KhoiID) {
			return new Promise(resolve => {
				ajaxCALL('lms/Lop_Get_ByKhoiID',
					{
						NienKhoa: vueData.NienKhoa,
						KhoiID: KhoiID
					},
					res => {
						this.DSLop = res.data
						resolve()
					}
				)
			})
		},
		onLoadChart2({ NienKhoa, KhoiID, LopID, MonHocID }) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardTiLeDat_Compare_GiuaKy_CuoiKi_Get',
					{
						NienKhoa,
						KhoiID,
						LopID: LopID ?? 0,
						MonHocID
					},
					res => {
						const categoriesChartTiLe_TheoLops = [...new Set(res.data.map(x => x.TenLop))]
						const serieChartTiLe_TheoLops = [
							{
								name: 'Exceeding Requirements/Vượt yêu cầu - Giữa kì',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Exceeding Requirements/Vượt yêu cầu - Cuối kì',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Exceeding Requirements/Vượt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Meeting Requirements/Đạt yêu cầu - Giữa kì',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Meeting Requirements/Đạt yêu cầu - Cuối kì',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Meeting Requirements/Đạt yêu cầu').map(x => x.TyLe)
							},
							{
								name: 'Not Meeting Requirements/Chưa đạt - Giữa kì',
								group: 'S1_Mid_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Mid_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
							},
							{
								name: 'Not Meeting Requirements/Chưa đạt - Cuối kì',
								group: 'S1_Final_Total_Conv',
								data: res.data.filter(x => x.MaCotDiem === 'S1_Final_Total_Conv' && x.KetQuaDanhGia_VI === 'Not Meeting Requirements/Chưa đạt').map(x => x.TyLe)
							}
						]
						this.Chart_TiLe_TheoLop = {
							...this.Chart_TiLe_TheoLop,
							series: serieChartTiLe_TheoLops,
							colors: ['#008FFB', '#008FFB', '#80c7fd', '#80c7fd', '#fdb72f', '#fdb72f'],
							xaxis: {
								categories: categoriesChartTiLe_TheoLops
							},
							plotOptions: {
								bar: {
									horizontal: false
								}
							},
						}
						resolve()
					}
				)
			})
		},
		onLoadChart3({ NienKhoa, CapID, MonHocID }) {
			return new Promise(resolve => {
				ajaxCALL('lms/DashboardTiLeDat_Growth_GiuaKy_CuoiKi_Get',
					{
						NienKhoa,
						CapID,
						MonHocID
					},
					res => {
						this.Tong_Growth_GiuaKy_CuoiKi = res.data[0][0]
						this.List_Tong_Grade_Growth_GiuaKy_CuoiKi = res.data[1]
						this.List_Tong_Class_Growth_GiuaKy_CuoiKi = res.data[2]
						resolve()
					}
				)
			}
			)
		}
	},
}
</script>