<template>
	<div>
		<v-row style="border-collapse: collapse !important;">
			<v-col cols="12" class="pa-0 mb-2">
				<v-card class="border rounded" style="background-color: #ffffff;">
					<v-card-title class="text-white d-flex text-success w-100">
						<span class="text-h5">Báo cáo chỉ tiêu tiếng anh</span>
						<v-spacer></v-spacer>
						<v-select v-model="HocKi" :disabled="true"
							:items="[{ title: 'Học kì 1', value: 1 }, { title: 'Học kì 2', value: 2 }]"
							style="max-width: 200px;"></v-select>
					</v-card-title>
				</v-card>
			</v-col>
			<v-col class="border pa-0 rounded" md="3">
				<v-toolbar color="#217d46">
					<v-tabs class="border-t" v-model="tabs" grow>
						<v-tab v-for="cap in DSCap" :value="cap.value" :key="cap.value"
							:style="{ 'background-color': tabs == cap.value ? 'darkseagreen' : '' }">
							<span class="font-weight-medium text-white">{{ cap.title }}</span>
						</v-tab>
					</v-tabs>
				</v-toolbar>
				<v-tabs-window v-model="tabs">
					<v-tabs-window-item v-for="i in 3" :key="i" :value="i">
						<v-card>
							<v-card-text class="pa-0  mt-1">
								<div class="d-flex justify-end my-3 px-2">
									<v-select v-model="Is_TA2" v-if="i == 3" label="Chọn loại báo cáo"
										:items="[{ title: 'Tiếng Anh 1', value: 0 }, { title: 'Tiếng Anh 2', value: 1 }]">
									</v-select>
								</div>
								<v-list class="d-flex flex-column ga-1 px-1" active-strategy="single-leaf">
									<v-list-item v-for="khoi in DSKhoiFilter" class="border rounded px-2"
										:key="khoi.KhoiID" :value="khoi.KhoiID" @click=" handleSelectedKhoi(khoi)">
										<template #title>
											<div class="d-flex align-center border-b pb-1">
												<span class="font-weight-medium">Khối {{ khoi.KhoiID }}</span>
												<v-spacer></v-spacer>
												<v-chip color="pink" size="small">{{ khoi.TongHocSinh
												}} học sinh</v-chip>
											</div>
										</template>
										<template #subtitle>
											<div class="d-flex flex-wrap mt-1 align-center ga-1">
												Lớp: <v-chip size="small" color="primary" v-for="lop in khoi.DSLop">{{
													lop.TenLop }}</v-chip>
											</div>

										</template>
									</v-list-item>
								</v-list>
							</v-card-text>
						</v-card>
					</v-tabs-window-item>
				</v-tabs-window>
			</v-col>
			<v-col class="border pa-0 rounded" md="9"
				style="overflow-y: auto; scrollbar-width: thin; height: calc(100vh - 90px);">
				<div class="d-flex flex-column ga-3">
					<v-card v-for="lop in selectedKhoi?.DSLop" class="border d-flex flex-column" style="height: 500px;">
						<v-card-title class="d-flex" style="background-color: #217d46;">
							<span class="text-white">{{ lop.TenLop }}</span>
							<v-spacer></v-spacer>
							<span class="text-white">Sỉ số: {{ lop.SiSo }} học sinh </span>
						</v-card-title>
						<v-card-text class="flex-grow-2 pa-2 d-flex" style="overflow: hidden; position: relative;">
							<div style="height: 100%; width: 100%; position: relative;">
								<uc-chart :key="keyComp" :type="lop.chartLop?.type" :data="lop.chartLop?.data"
									:options="lop.chartLop?.options" :plugins="lop.chartLop?.plugins"
									style="height: 100%; width: 100%;" />
							</div>
							<!-- <div class="d-flex flex-column ga-2" style="height: 100%; width: 30%; position: relative;">
								<v-row class="w-100 d-flex ga-2">
									<v-col v-for="md in DSMucDo" cols="12" class="border rounded">
										<div class="d-flex rounded" style="background-color: bisque;padding: 10px;">
											<span style="font-weight: 600;color: chocolate;">{{ md.TenMucDo }}</span>
											<v-spacer></v-spacer>
											<span>Thực tế so với chỉ tiêu</span>
										</div>
										<v-divider class="my-1"></v-divider>
										<v-progress-linear rounded :model-value="handleMapMucDo(md, lop, 1)"
											bg-color="blue-grey" color="#C8E6C9" height="25">
											<template v-slot:default="{ value }">
												<strong>{{ Math.ceil(value) }}%</strong>
											</template>
										</v-progress-linear>
									</v-col>
								</v-row>
							</div> -->
						</v-card-text>
						<v-card-text>
							<v-data-table :headers="lop.headers" :items="lop.items" :hide-default-footer="true">
								<template #item.ThucTeSoVoiChiTieu="{ item }">
									<div>
										<span class="font-weight-medium" v-if="item.ThucTeSoVoiChiTieu < 0"
											style="color: red;">
											Giảm {{ parseFloat(item.ThucTeSoVoiChiTieu.toString().replace('-',
												'')).toFixed('2', 0)
											}} %
										</span>
										<span class="font-weight-medium" v-else-if="item.ThucTeSoVoiChiTieu == 0">
											{{ item.ThucTeSoVoiChiTieu }} %
										</span>
										<span class="font-weight-medium" v-else style="color: green;">
											Tăng {{ item.ThucTeSoVoiChiTieu.toFixed('2', 0) }} %
										</span>
									</div>
								</template>
							</v-data-table>
						</v-card-text>
					</v-card>
				</div>
			</v-col>
		</v-row>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		const { h } = Vue
		return {
			h,
			vueData,
			tabs: 1,
			skill: 50,
			DSCap: [
				{
					title: "CẤP 1",
					value: 1,
					icon: "mdi-phone"
				},
				{
					title: "CẤP 2",
					value: 2,
					icon: "mdi-phone"
				},
				{
					title: "CẤP 3",
					value: 3,
					icon: "mdi-phone"
				}
			],
			DSKhoi: [
				{
					KhoiID: 1,
					CapID: 1
				},
				{
					KhoiID: 2,
					CapID: 1
				},
				{
					KhoiID: 3,
					CapID: 1
				}, {
					KhoiID: 4,
					CapID: 1
				},
				{
					KhoiID: 5,
					CapID: 1
				}, {
					KhoiID: 6,
					CapID: 2
				},
				{
					KhoiID: 7,
					CapID: 2
				},
				{
					KhoiID: 8,
					CapID: 2
				},
				{
					KhoiID: 9,
					CapID: 2
				}, {
					KhoiID: 10,
					CapID: 3
				},
				{
					KhoiID: 11,
					CapID: 3
				}, {
					KhoiID: 12,
					CapID: 3
				},

			],
			keyComp: 1,
			DataChart: {
				type: 'bar',
				data: {
					labels: ["Không đạt", "Đạt", "Khá", "Tốt"],
					datasets: [{
						label: 'Chỉ tiêu %',
						data: [],
						borderColor: '#36A2EB',
						backgroundColor: '#9BD0F5',
					},
					{
						label: 'Thực tế %',
						data: [],
						borderColor: '#aad987',
						backgroundColor: '#c8e6c9',
					},
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false, // quan trọng
					layout: {
						padding: 10, // để tránh cắt label hoặc legend
					},
					plugins: {
						legend: {
							labels: {
								boxWidth: 12,
							},
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							max: 100
						}
					}
				},
				plugins: {

				}
			},
			selectedKhoi: null,
			DSMucDo: [],
			HocKi: 1,
			Is_TA2: 0
		}
	},
	async mounted() {
		await this.GET_BaoCaoChiTieu_GetLop()
		// await this.GET_ChiTieu_Dashboard_ByCapKhoi()

	},
	computed: {
		DSKhoiFilter: function () {
			// await this.$nextTick()
			let map = this.DSKhoi.filter(khoi => khoi.CapID == this.tabs)
			return map
		},

	},
	watch: {
		tabs: {
			handler: async function (newVal, oldVal) {
				this.selectedKhoi = this.DSKhoiFilter[0]
				this.Is_TA2 = 0
			},
			immediate: false
		},
		selectedKhoi: {
			handler: async function (newVal, oldVal) {
				await this.GET_ChiTieu_Dashboard_ByCapKhoi()
			},
			immediate: false
		},
		Is_TA2: {
			handler: async function (newVal, oldVal) {
				await this.GET_ChiTieu_Dashboard_ByCapKhoi()
			},
			immediate: false
		}
	},
	methods: {
		async GET_BaoCaoChiTieu_GetLop() {
			const response = await new Promise((resolve, reject) => {
				ajaxCALL('lms/BaoCaoChiTieu_GetLop', {
					NienKhoa: vueData.NienKhoa
				}, res => {

					resolve(res)
				})
			})
			console.log(response)
			let data = response.data.filter(item =>
				!(item.CapID == 3 && item.Is_TA1)
			);
			this.handleData(data)
		},
		async GET_ChiTieu_Dashboard_ByCapKhoi() {
			console.log('this.selectedKhoiinfn', this.selectedKhoi)
			const response = await new Promise((resolve, reject) => {
				ajaxCALL('lms/ChiTieu_Dashboard_ByCapKhoi', {
					CapID: this.tabs,
					KhoiID: this.selectedKhoi?.KhoiID,
					NienKhoa: vueData.NienKhoa,
					Is_TA2: this.Is_TA2,
					HocKi: this.HocKi
				}, res => {

					resolve(res.data)
				})
			})
			this.DSMucDo = response[1]

			console.log(response)
			let KhoiPosition = this.DSKhoi.findIndex(khoi => khoi.KhoiID == this.selectedKhoi?.KhoiID)
			//Map dữ liệu chỉ tiêu lên chart
			this.DSKhoi[KhoiPosition].DSLop = this.DSKhoi[KhoiPosition]?.DSLop.map(lop => {
				let lopData = response[0].find(item => item.LopNhomID == lop.LopID)
				if (lopData) {
					let chartLop = JSON.parse(JSON.stringify(lop.chartLop))
					//Xử lí chart chỉ tiêu TA2
					if (this.Is_TA2 == 1 && this.tabs == 3) {
						console.log('lopData.TrinhDo', lopData.TrinhDo)
						chartLop.data.labels = [lopData.TrinhDo]
						chartLop.data.datasets[0].data = [lopData.ChiTieuDatRa]
						chartLop.data.datasets[1].data = [lopData.ChiTieuThucTe]
						//Tạo dữ liệu table 
						//header
						lop['headers'] = [
							{ title: 'Mức độ', value: 'TenMucDo', sortable: false },
							{ title: 'Chỉ tiêu %', value: 'ChiTieu', align: 'end', sortable: false },
							{ title: 'Thực tế %', value: 'ThucTe', align: 'end', sortable: false },
							{ title: 'Thực tế so với chỉ tiêu %', key: 'ThucTeSoVoiChiTieu', align: 'end', sortable: false },
						]
						//data
						let ChiTieu = lopData.ChiTieuDatRa
						let ThucTe = lopData.ChiTieuThucTe
						let ThucTeSoVoiChiTieu = (Number.isFinite(ChiTieu) && Number.isFinite(ThucTe)) ? (ThucTe - ChiTieu) : '-'
						lop['items'] = [{
							TenMucDo: lopData.TrinhDo,
							ChiTieu: Number.isFinite(ChiTieu) ? ChiTieu + ' %' : '-',
							ThucTe: Number.isFinite(ThucTe) ? ThucTe + ' %' : '-',
							ThucTeSoVoiChiTieu: ThucTeSoVoiChiTieu
						}]
					}
					//Xử lí chart chỉ tiêu TA1
					else {
						//Build label chart
						chartLop.data.labels = this.DSMucDo.map(md => md.TenMucDo)
						if (this.tabs == 1) {
							//Build data chart
							chartLop.data.datasets[0].data = [
								lopData.ChiTieu_ChuaHoanThanh,
								lopData.ChiTieu_HoanThanh,
								lopData.ChiTieu_Tot
							]
							chartLop.data.datasets[1].data = [
								lopData.ChiTieuThucTe_ChuaHoanThanh,
								lopData.ChiTieuThucTe_HoanThanh,
								lopData.ChiTieuThucTe_Tot
							]
							//Thực tế
							lop.ChiTieu_ChuaHoanThanh = lopData.ChiTieu_ChuaHoanThanh
							lop.ChiTieu_HoanThanh = lopData.ChiTieu_HoanThanh
							lop.ChiTieu_Tot = lopData.ChiTieu_Tot
							//Chỉ tiêu
							lop.ChiTieuThucTe_ChuaHoanThanh = lopData.ChiTieuThucTe_ChuaHoanThanh
							lop.ChiTieuThucTe_HoanThanh = lopData.ChiTieuThucTe_HoanThanh
							lop.ChiTieuThucTe_Tot = lopData.ChiTieuThucTe_Tot
						} else {
							//Build data chart
							chartLop.data.datasets[0].data = [
								lopData.ChiTieu_KhongDat,
								lopData.ChiTieu_Dat,
								lopData.ChiTieu_Kha,
								lopData.ChiTieu_Tot
							]
							chartLop.data.datasets[1].data = [
								lopData.ChiTieuThucTe_KhongDat,
								lopData.ChiTieuThucTe_Dat,
								lopData.ChiTieuThucTe_Kha,
								lopData.ChiTieuThucTe_Tot
							]
							//Thực tế
							lop.ChiTieu_KhongDat = lopData.ChiTieu_KhongDat
							lop.ChiTieu_Dat = lopData.ChiTieu_Dat
							lop.ChiTieu_Kha = lopData.ChiTieu_Kha
							lop.ChiTieu_Tot = lopData.ChiTieu_Tot
							//Chỉ tiêu
							lop.ChiTieuThucTe_KhongDat = lopData.ChiTieuThucTe_KhongDat
							lop.ChiTieuThucTe_Dat = lopData.ChiTieuThucTe_Dat
							lop.ChiTieuThucTe_Kha = lopData.ChiTieuThucTe_Kha
							lop.ChiTieuThucTe_Tot = lopData.ChiTieuThucTe_Tot
						}

						//Tạo dữ liệu table 
						//header
						lop['headers'] = [
							{ title: 'Mức độ', value: 'TenMucDo', sortable: false },
							{ title: 'Chỉ tiêu %', value: 'ChiTieu', align: 'end', sortable: false },
							{ title: 'Thực tế %', value: 'ThucTe', align: 'end', sortable: false },
							{ title: 'Thực tế so với chỉ tiêu %', key: 'ThucTeSoVoiChiTieu', align: 'end', sortable: false },
						]
						//data
						lop['items'] = this.DSMucDo.map(md => {
							let ChiTieu = Number(this.handleMapMucDo(md, lop, 1))
							let ThucTe = Number(this.handleMapMucDo(md, lop, 2))
							let ThucTeSoVoiChiTieu = (Number.isFinite(ChiTieu) && Number.isFinite(ThucTe)) ? (ThucTe - ChiTieu) : '-'
							return {
								TenMucDo: md.TenMucDo,
								ChiTieu: Number.isFinite(ChiTieu) ? ChiTieu + ' %' : '-',
								ThucTe: Number.isFinite(ThucTe) ? ThucTe + ' %' : '-',
								ThucTeSoVoiChiTieu: ThucTeSoVoiChiTieu
							}
						})
					}



					lop.chartLop = chartLop


				}
				return lop
			})
			console.log('this.DSKhoi', this.DSKhoi)
		},
		handleData(data) {
			let DSKhoiMap = []
			DSKhoiMap = this.DSKhoi.map(khoi => {
				let chartLop = { ...this.DataChart }
				let dslop = data.filter(lop => lop.KhoiID == khoi.KhoiID).map(lop => ({ ...lop, chartLop }))
				return { ...khoi, DSLop: dslop, TongHocSinh: dslop.reduce((result, item) => result + item.SiSo, 0) }
			}),
				this.DSKhoi = [...DSKhoiMap]
			console.log('this.DSKhoi after map', this.DSKhoi)
			if (!this.selectedKhoi) this.selectedKhoi = this.DSKhoi[0]
		},
		handleSelectedKhoi(khoi) {
			this.selectedKhoi = { ...khoi }
		},
		handleMapMucDo(md, lop, loaiDuLieu) {
			let key = null
			if (loaiDuLieu == 1) {
				const mapTabs = {
					1: {
						'Hoàn thành': 'ChiTieu_HoanThanh',
						'Chưa hoàn thành': 'ChiTieu_ChuaHoanThanh',
						'Tốt': 'ChiTieu_Tot'
					},
					2: {
						'Không đạt': 'ChiTieu_KhongDat',
						'Đạt': 'ChiTieu_Dat',
						'Khá': 'ChiTieu_Kha',
						'Tốt': 'ChiTieu_Tot'
					},
					3: {
						'Không đạt': 'ChiTieu_KhongDat',
						'Đạt': 'ChiTieu_Dat',
						'Khá': 'ChiTieu_Kha',
						'Tốt': 'ChiTieu_Tot'
					}
				}
				key = mapTabs[this.tabs]?.[md.TenMucDo]
			} else {
				const mapTabs = {
					1: {
						'Hoàn thành': 'ChiTieuThucTe_HoanThanh',
						'Chưa hoàn thành': 'ChiTieuThucTe_ChuaHoanThanh',
						'Tốt': 'ChiTieuThucTe_Tot'
					},
					2: {
						'Không đạt': 'ChiTieuThucTe_KhongDat',
						'Đạt': 'ChiTieuThucTe_Dat',
						'Khá': 'ChiTieuThucTe_Kha',
						'Tốt': 'ChiTieuThucTe_Tot'
					},
					3: {
						'Không đạt': 'ChiTieuThucTe_KhongDat',
						'Đạt': 'ChiTieuThucTe_Dat',
						'Khá': 'ChiTieuThucTe_Kha',
						'Tốt': 'ChiTieuThucTe_Tot'
					}
				}
				key = mapTabs[this.tabs]?.[md.TenMucDo]
			}
			return key ? lop[key] : 0
		},
		renderTextCompare(value) {
			let valueNum = Number(value)
			if (valueNum > 0) {
				return { title: `Tăng ${valueNum}%`, color: 'green' }
			} else if (valueNum < 0) {
				return { title: `Giảm ${valueNum.toString().replace('-', '')}%`, color: 'red' }
			} else {
				return { title: `Bằng`, color: 'priamry' }
			}

		}
	},
}
</script>