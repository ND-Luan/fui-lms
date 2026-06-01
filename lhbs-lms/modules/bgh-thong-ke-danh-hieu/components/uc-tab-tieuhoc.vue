<template>
	<Global>
		<template #header>
			<v-card border flat v-if="BaoCaoItem?.IsChotBaoCao">
				<v-card-title class="px-0 d-flex align-center teaser-title">
					<div class="text-caption bg-red-lighten-5 px-3 py-1 rounded-pill border-red">
						<v-icon size="small" color="red" class="me-1">mdi-lock</v-icon>
						<span class="text-red font-weight-bold">Đã chốt:</span>
						<span class="text-black ms-1">{{BaoCaoItem.HoTenNguoiChot}} - {{BaoCaoItem.NgayChot}}</span>
					</div>
				</v-card-title>
			</v-card>
		</template>

		<v-card class="mt-2" border flat>
			<v-row>
				<v-col cols="12">
					<v-card-title class="text-primary" style="text-wrap:auto">
						KẾT QUẢ RÈN LUYỆN KHỐI 1, 2, 3, 4, 5 – PHẨM CHẤT
					</v-card-title>
					<v-card-text class="pa-0">
						<v-data-table :items="DataChart1" :headers="headersChart1" :hide-default-footer="true" />
					</v-card-text>
				</v-col>
				<v-col cols="12" class="mt-5 elevation-2" v-if="DataChart1.length > 0">
					<uc-chart-apex :options="OptionsChart1" />
				</v-col>
			</v-row>
		</v-card>
		<v-card class="mt-2" border flat>
			<v-row>
				<v-col cols="12">
					<v-card-title class="text-primary" style="text-wrap:auto">
						KẾT QUẢ RÈN LUYỆN KHỐI 1, 2, 3, 4, 5 – NĂNG LỰC
					</v-card-title>
					<v-card-text class="pa-0">
						<v-data-table :items="DataChart2" :headers="headersChart2" :items-per-page="-1"
							:hide-default-footer="true">
							<template #item="{ item }">
								<tr :style="getRowStyle(item)" :class="getRowClass(item)">
									<td v-for="obj of headersChart2"
										:class="obj.value == 'TenMonHoc_HienThi' ? '' : 'text-end'" :key="obj.value">
										{{ item[obj.value] }}
									</td>
								</tr>
							</template>
						</v-data-table>
					</v-card-text>
				</v-col>
				<v-col cols="12" class="mt-5 elevation-2" v-if="DataChart2.length > 0">
					<uc-chart-apex :options="OptionsChart2" />
				</v-col>
			</v-row>
		</v-card>
		<v-card class="mt-2" border flat>
			<v-row>
				<v-col cols="12">
					<v-card-title class="text-primary" style="text-wrap:auto">
						KẾT QUẢ HỌC TẬP – CẤP TIỂU HỌC
					</v-card-title>
					<v-card-text class="pa-0">
						<v-data-table :items="DataChart4" :headers="headersChart4" :items-per-page="-1"
							:hide-default-footer="true" />
					</v-card-text>
				</v-col>
				<v-col cols="12" class="my-5 elevation-2" v-if="DataChart4.length > 0">
					<uc-chart-apex :options="OptionsChart4" />
				</v-col>
			</v-row>
		</v-card>
		<v-card class="mt-2" border flat>
			<v-row>
				<v-col cols="12">
					<v-card-title class="text-primary" style="text-wrap:auto">
						XẾP LOẠI KẾT QUẢ GIÁO DỤC - KHEN THƯỞNG
					</v-card-title>
					<v-card-text class="pa-0">
						<v-data-table :items="DataChart5" :headers="headersChart5" :hide-default-footer="true" />
					</v-card-text>
				</v-col>
				<v-col cols="12" class="mt-5 elevation-2 pa-2" v-if="DataChart5.length > 0">
					<uc-chart-apex :options="OptionsChart5" />
				</v-col>
			</v-row>
		</v-card>

		<v-card class="mt-2" border flat>
			<v-row>
				<v-col cols="12">
					<v-card-title class="text-primary" style="text-wrap:auto">
						KHEN THƯỞNG THEO KHỐI
					</v-card-title>
					<v-card-text class="pa-0">
						<v-data-table :items="DataChart6" :headers="headersChart6" :items-per-page="-1"
							:hide-default-footer="true">
							<template #item="{ item }">
								<tr :style="item.Khoi === 'TC' ? 'font-weight: bold; background-color: #f5f5f5;' : ''">
									<td :class="header.align === 'end' ? 'text-end' : ''"
										v-for="header in headersChart6" :key="header.value">
										{{ item[header.value] }}
									</td>
								</tr>
							</template>
						</v-data-table>
					</v-card-text>
				</v-col>
				<v-col cols="12" class="my-5 elevation-2" v-if="DataChart6.length > 0">
					<uc-chart-apex :options="OptionsChart6" />
				</v-col>
			</v-row>
		</v-card>

	</Global>
</template>

<script>
	export default {
		props: {
			HocKi: String
		},
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
			var options = {
				chart: { type: 'bar', height: 500 },
				plotOptions: {
					bar: {
						horizontal: false, columnWidth: '55%',
						borderRadius: 5, borderRadiusApplication: 'end'
					},
				},
				dataLabels: { enabled: false },
				title: {
					text: 'Biểu đồ tỉ lệ', align: 'left',
					style: { fontSize: '16px', color: '#263238' }
				},
				stroke: { show: true, width: 2, colors: ['transparent'] },
				xaxis: { categories: [] },
				series: [],
				yaxis: { title: { text: '%' }, max: 100, min: 0 },
				fill: { opacity: 1 },
				tooltip: {
					y: { formatter: function (val) { return val + "%" } }
				}
			}
			var optionsPie = {
				series: [],
				chart: { type: 'pie', height: 350 },
				xaxis: { categories: [] },
				legend: { position: 'bottom' }
			};
			return {
				vueData,
				BaoCaoItem: null,
				DataChotBaoCao: null,
				OptionsChart1: options,
				OptionsChart2: options,
				OptionsChart4: options,
				OptionsChart5: optionsPie,
				OptionsChart6: options,
				DataChart1: [],
				DataChart2: [],
				DataChart4: [],
				DataChart5: [],
				DataChart6: [],
				headersChart1: [
					{ title: "Phẩm chất", value: "TenMonHoc_HienThi" },
					{ title: "Tổng số HS", value: "TongSoHS", align: "end" },
					{ title: "Tốt (T)", value: "Tot", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_Tot", align: "end" },
					{ title: "Đạt (Đ)", value: "Dat", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_Dat", align: "end" },
					{ title: "CCG (C)", value: "C", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_C", align: "end" }
				],
				headersChart2: [
					{ title: "Năng lực", value: "TenMonHoc_HienThi" },
					{ title: "Tổng số HS", value: "TongSoHS", align: "end" },
					{ title: "Tốt (T)", value: "Tot", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_Tot", align: "end" },
					{ title: "Đạt (Đ)", value: "Dat", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_Dat", align: "end" },
					{ title: "CCG (C)", value: "C", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_C", align: "end" }
				],
				headersChart4: [
					{ title: "Các môn học", value: "TenMonHoc_HienThi" },
					{ title: "Tổng số HS", value: "TongSoHS", align: "end" },
					{ title: "Hoàn thành tốt (T)", value: "Tot", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_Tot", align: "end" },
					{ title: "Hoàn thành (H)", value: "HH", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_HH", align: "end" },
					{ title: "Chưa hoàn thành (C)", value: "C", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_C", align: "end" }
				],
				headersChart5: [
					{ title: "Khen thưởng", value: "DanhHieu" },
					{ title: "Số HS", value: "SoHocSinh", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe", align: "end" }
				],
				headersChart6: [
					{ title: "Khối", value: "Khoi_HienThi" },
					{ title: "Tổng số HS", value: "SoHocSinh", align: "end" },
					{ title: "HS Xuất sắc", value: "HocSinhXuatSac", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_XuatSac", align: "end" },
					{ title: "HS Tiêu biểu", value: "HocSinhTieuBieu", align: "end" },
					{ title: "Tỉ lệ (%)", value: "TiLe_TieuBieu", align: "end" }
				]
			}
		},
		mounted() {
			if (this.HocKi) this.ThongKe_KQRL_Get_All_Khoi_C1()
		},
		watch: {
			HocKi(v) {
				if (v) this.ThongKe_KQRL_Get_All_Khoi_C1()
			},
			BaoCaoItem: {
				handler(v) {
					this.$emit('onStateChange', { isLocked: !!v?.IsChotBaoCao })
				},
				deep: true
			}
		},
		methods: {
			onRefresh() {
				this.ThongKe_KQRL_Get_All_Khoi_C1()
			},
			async ThongKe_KQRL_Get_All_Khoi_C1() {
				if (!this.HocKi) return
				let data
				const dataLMS = await fetchPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 8,
					HocKi: this.HocKi,
					CapID: 1,
					NienKhoa: vueData.NienKhoa,
				})
				this.BaoCaoItem = dataLMS[1][0]
				if (this.BaoCaoItem?.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				}
				else {
					data = await fetchPromise('lms/ThongKe_KQRL_Get_All_Khoi_C1', {
						HocKi: this.HocKi,
						NienKhoa: vueData.NienKhoa
					})
					this.DataChotBaoCao = data
				}
	
				this.handleChart4(data[2])
				this.handleChart5(data[3])
				this.handleChart6(data[4])
	
				let Chart1 = data[0]
				this.DataChart1 = Chart1.map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) {
						item.TenMonHoc_HienThi = item.TenMonHoc_HienThi + ` (${item.KhoiDay})`
					}
					return {
						...item,
						TiLe_Tot: Number(item.TiLe_Tot).toFixed(2),
						TiLe_Dat: Number(item.TiLe_Dat).toFixed(2),
						TiLe_C: Number(item.TiLe_C).toFixed(2)
					}
				})
	
				let arrSeriesData = ['TiLe_Tot', 'TiLe_Dat', 'TiLe_C']
				let arrSeriesLabels = { 'TiLe_Tot': 'Tốt', 'TiLe_Dat': 'Đạt', 'TiLe_C': 'Cần cố gắng' }
				let arrPhamChat = [...new Set(this.DataChart1.map(item => item.TenMonHoc_HienThi))]
	
				this.OptionsChart1 = {
					...this.OptionsChart1,
					xaxis: { categories: arrPhamChat },
					series: arrSeriesData.map(tile => ({
						name: arrSeriesLabels[tile],
						data: arrPhamChat.map(pc => {
							let obj = this.DataChart1.find(item => item.TenMonHoc_HienThi == pc)
							return obj ? obj[tile] : 0
						})
					}))
				}
	
				let Chart2 = data[1]
				let arrNangLuc = [...new Set(Chart2.map(item => item.TenMonHoc_HienThi))]
				this.OptionsChart2 = {
					...this.OptionsChart2,
					xaxis: { categories: arrNangLuc },
					series: arrSeriesData.map(tile => ({
						name: arrSeriesLabels[tile],
						data: arrNangLuc.map(nl => {
							let obj = Chart2.find(item => item.TenMonHoc_HienThi == nl)
							return obj ? obj[tile] : 0
						})
					}))
				}
	
				let NangLucChungArr = data[1].filter(item => item.TenMonHoc_HienThi.includes('và')).map(item => ({
					...item,
					TiLe_Tot: Number(item.TiLe_Tot).toFixed(2),
					TiLe_Dat: Number(item.TiLe_Dat).toFixed(2),
					TiLe_C: Number(item.TiLe_C).toFixed(2)
				}))
				let NangLucDacThuArr = data[1].filter(item => !item.TenMonHoc_HienThi.includes('và')).map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) item.TenMonHoc_HienThi += ` (${item.KhoiDay})`
					return {
						...item,
						TiLe_Tot: Number(item.TiLe_Tot).toFixed(2),
						TiLe_Dat: Number(item.TiLe_Dat).toFixed(2),
						TiLe_C: Number(item.TiLe_C).toFixed(2)
					}
				})
				this.DataChart2 = [{ TenMonHoc_HienThi: 'Năng lực chung' }, ...NangLucChungArr, { TenMonHoc_HienThi: 'Năng lực đặc thù' }, ...NangLucDacThuArr]
			},
			handleChart4(DataChart4) {
				this.DataChart4 = DataChart4.map(item => {
					let Khoi = item.KhoiDay.split('-')
					if (Khoi.length < 5) item.TenMonHoc_HienThi += ` (${item.KhoiDay})`
					return {
						...item,
						TiLe_Tot: Number(item.TiLe_Tot).toFixed(2),
						TiLe_HH: Number(item.TiLe_HH).toFixed(2),
						TiLe_C: Number(item.TiLe_C).toFixed(2)
					}
				})
				let arrMonHoc = [...new Set(this.DataChart4.map(item => item.TenMonHoc_HienThi))]
				let arrSeriesData = ['TiLe_Tot', 'TiLe_HH', 'TiLe_C']
				let arrSeriesLabels = { 'TiLe_Tot': 'Hoàn thành tốt', 'TiLe_HH': 'Hoàn thành', 'TiLe_C': 'Chưa hoàn thành' }
	
				this.OptionsChart4 = {
					...this.OptionsChart4,
					xaxis: { categories: arrMonHoc },
					series: arrSeriesData.map(tile => ({
						name: arrSeriesLabels[tile],
						data: arrMonHoc.map(mh => {
							let obj = this.DataChart4.find(item => item.TenMonHoc_HienThi == mh)
							return obj ? obj[tile] : 0
						})
					}))
				}
			},
			handleChart5(DataChart5) {
				this.DataChart5 = DataChart5.map(item => ({ ...item, TiLe: Number(item.TiLe).toFixed(2) }))
				this.OptionsChart5 = {
					...this.OptionsChart5,
					series: this.DataChart5.map(item => Number(item.TiLe)),
					labels: this.DataChart5.map(item => item.DanhHieu),
					title: { text: 'Biểu đồ tỉ lệ khối 1,2,3,4,5' }
				}
			},
			handleChart6(DataChart6) {
				this.DataChart6 = (DataChart6 || []).map(item => ({
					...item,
					Khoi_HienThi: item.Khoi === 'TC' ? 'Tổng cộng' : 'Khối ' + item.Khoi,
					TiLe_XuatSac: Number(item.TiLe_XuatSac || 0).toFixed(2),
					TiLe_TieuBieu: Number(item.TiLe_TieuBieu || 0).toFixed(2)
				}))
				let dataToChart = this.DataChart6.filter(item => item.Khoi !== 'TC')
				let arrKhoi = dataToChart.map(item => item.Khoi_HienThi)
				this.OptionsChart6 = {
					...this.OptionsChart6,
					xaxis: { categories: arrKhoi },
					series: [
						{ name: 'Học sinh Xuất sắc', data: dataToChart.map(item => Number(item.HocSinhXuatSac)) },
						{ name: 'Học sinh Tiêu biểu', data: dataToChart.map(item => Number(item.HocSinhTieuBieu)) }
					],
					title: { text: 'Biểu đồ khen thưởng theo khối' }
				}
			},
			getRowStyle(item) {
				if (['Năng lực chung', 'Phẩm chất'].includes(item.TenMonHoc_HienThi)) return 'background-color: rgb(0 176 255 / 83%); font-weight: bold; color: #ffffff;';
				if (['Năng lực đặc thù', 'Năng lực'].includes(item.TenMonHoc_HienThi)) return 'background-color: rgb(255 152 0); font-weight: bold; color: #ffffff;';
				return '';
			},
			getRowClass(item) {
				if (['Năng lực chung', 'Năng lực đặc thù', 'Phẩm chất', 'Năng lực'].includes(item.TenMonHoc_HienThi)) return 'text-uppercase';
				return '';
			},
			async onChotBaoCao() {
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận chốt báo cáo' })
				if (!ok) return
				await fetchPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
					BaoCao_ChiTietID: this.BaoCaoItem.BaoCao_ChiTietID,
					JSON_BaoCao: this.DataChotBaoCao
				}, { cache: false })
				this.snackbarRef.value.showSnackbar({ message: 'Chốt báo cáo thành công', color: 'success' })
				this.onRefresh()
			}
		},
	}
</script>