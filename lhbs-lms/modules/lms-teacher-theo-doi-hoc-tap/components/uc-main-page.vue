<template>
	<div>
		<v-card>
			<v-card-text class="mt-3 pa-0">
				<v-row>
					<v-col v-for="cap in Object.keys(CapList)">
						<v-card class="border rounded ">
							<v-card-title class="d-flex flex-column border-b" style="background-color:#E3F2FD;">
								<div class="w-100 text-center text-body-1 cap-title">
									Cấp {{ cap }}
								</div>
								<div class="w-100 text-center text-body-2 cap-sub" style="color: black">
									Tổng số bài tập:
									<span class="cap-total">
										{{ CapList[cap].TongBaiTap }}
									</span>
								</div>
							</v-card-title>
							<v-card-text class="d-flex justify-center">
								<uc-chart-apex v-if="CapList[cap].optionsChartPie"
									:options="CapList[cap].optionsChartPie" :key='cap' />
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>


			</v-card-text>
			<v-card-text class=" border rounded mt-3 pa-0">
				<div class="d-flex pa-2 ga-2 border-b">
					<v-spacer></v-spacer>
					<v-select v-model="selectedLopID" label="Lớp" style="max-width:200px" :items="lopList"
						item-title="TenLop" item-value="LopID"></v-select>
					<v-select v-model="selectedMonHocID" label="Môn học" style="max-width:200px" :items="monHocList"
						item-title="MonHocName" item-value="MonHocID"></v-select>
					<v-btn @click="refresh()" color="primary" variant="outlined"><v-icon start class="me-1">mdi-reload</v-icon>Làm mới</v-btn>
				</div>
				<v-data-table :headers="headers" :items="DataTable" item-value="HocSinhID" hide-default-footer
					show-expand :items-per-page="-1">
					<template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
						<v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
							:text="isExpanded(internalItem) ? 'Thu gọn' : 'Chi tiết'" class="text-none"
							color="medium-emphasis" size="small" variant="text" width="105" border slim
							@click="toggleExpand(internalItem)"></v-btn>
					</template>

					<template v-slot:expanded-row="{ columns, item }">
						<tr>
							<td :colspan="columns.length" class="py-2">
								<v-sheet rounded="lg" border>
									<div class="pa-2">
										<h4 style="font-size: 16px; font-weight: 500;">Xu hướng phát triển học tập</h4>
										<uc-chart-apex v-if="item.OptionsData" :options="item.OptionsData"
											:key='item.HocSinhID' />
									</div>


									<v-row>
										<!-- <v-col cols="12" md="6">
											<h4 style="font-size: 16px; font-weight: 500;">Kĩ năng học tập</h4>
											<uc-chart-apex v-if="item.OptionsData_Radar"
												:options="item.OptionsData_Radar" :key='item.HocSinhID' />
										</v-col> -->
										<v-col cols="12" md="12">
											<div class="d-flex flex-column ga-2 mt-3">
												<div><b>Nhận xét: </b><span class="text-wrap">
														{{ item.NhanXet ?? '-' }}
													</span>
												</div>

												<v-btn variant="outlined" color="primary" :loading="isLoadingNhanXet"
													@click="getNhanXet(item, item.OptionsData)">
													<v-icon start class="me-1">mdi-robot-outline</v-icon> Chọn để hiển thị nhận xét từ AI
													</v-btn>
											</div>
										</v-col>
									</v-row>
								</v-sheet>

							</td>
						</tr>
					</template>
				</v-data-table>
			</v-card-text>

			<v-card-text class=" border rounded mt-3 pa-0">
				<v-row>
					<v-col cols="12">
						<v-card>
							<v-card-title class="d-flex flex-wrap ga-2" style="height: fit-content">
								<span class="text-primary">Thống kê học lực của học sinh dựa trên 100% điểm tối đa bài
									tập</span>
								<v-spacer></v-spacer>
								<v-btn color="success" variant="text" icon @click="jsonToExcel({
									data: Data_HeatMap.map(i => ({
										HocSinhID: i.HocSinhID,
										HoTen: i.HoTen,
										Title: i.Title,
										PercentScore: i.PercentScore
									}))
								})"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
							</v-card-title>
							<v-card-text class="pa-0">
								<uc-chart-apex :options="chartHeatmap" />
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
export default {
	props: ['hocKi'],
	data() {
		const chartHeatmap = {
			series: [],
			chart: {
				height: 650,
				type: 'heatmap',
			},
			plotOptions: {
				heatmap: {
					radius: 5,
					min: 0,
					max: 100,
					colorScale: {
						ranges: [{
							from: 0,
							to: 30,
							name: '0% - 30%',
							color: '#ff0000'
						},
						{
							from: 30.01,
							to: 60,
							name: '30.01% - 60%',
							color: '#FFB200'
						},
						{
							from: 60.01,
							to: 80,
							name: '60.01% - 80%',
							color: '#128FD9'
						},
						{
							from: 80.01,
							to: 100,
							name: '80.01% - 100%',
							color: '#00A100'
						}
						]
					}
				}
			},
			dataLabels: {
				enabled: false
			},
			tooltip: {
				y: {
					formatter: (val) => `${val}%`
				}

			},
		}
		return {
			headers: [
				{ width: '150px', title: 'Mã học sinh', key: 'HocSinhID', sortable: false },
				{ width: 150, title: 'Số danh bộ', key: 'SoDanhBo', sortable: false },
				{ title: 'Học sinh', key: 'HoTen', align: 'start', sortable: false },
				{ width: 1, key: 'data-table-expand', align: 'end', sortable: false }, // optional, to keep it as short as possible
			],
			optionsChartStudent: {
				series: [{
					name: 'Bài tập',
					data: [31, 40, 28, 51, 42, 100, 100]
				}],
				chart: {
					height: 300,
					type: 'area',
					toolbar: {
						show: false,
						tools: {
							zoom: false
						}
					},
					zoom: {
						enabled: false,
						type: 'x',
						autoScaleYaxis: false,
						allowMouseWheelZoom: false,
						zoomedArea: {
							fill: {
								color: '#90CAF9',
								opacity: 0.4
							},
							stroke: {
								color: '#0D47A1',
								opacity: 0.4,
								width: 1
							}
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					curve: 'smooth'
				},
				xaxis: {
					categories: ["BT 1", "BT 2", "BT 3", "BT 4", "BT 5", "BT 6", "BT 7"]
				},
				yaxis: {
					max: 100,
					min: 0
				},
				tooltip: {
					x: {
						format: 'dd/MM/yy HH:mm'
					},
				},
			},

			optionsChartStudent_Radar: {
				series: [{
					name: 'Bài tập',
					data: [31, 40, 28, 51, 42, 100, 100]
				}],
				chart: {
					height: 500,
					type: 'radar',
					toolbar: {
						show: false,
						tools: {
							zoom: false
						}
					},
					zoom: {
						enabled: false,
						type: 'x',
						autoScaleYaxis: false,
						allowMouseWheelZoom: false,
						zoomedArea: {
							fill: {
								color: '#90CAF9',
								opacity: 0.4
							},
							stroke: {
								color: '#0D47A1',
								opacity: 0.4,
								width: 1
							}
						}
					}
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					curve: 'smooth'
				},
				xaxis: {
					categories: ["BT 1", "BT 2", "BT 3", "BT 4", "BT 5", "BT 6", "BT 7"]
				},
				yaxis: {
					max: 100,
					min: 0
				},
				tooltip: {
					x: {
						format: 'dd/MM/yy HH:mm'
					},
				},
			},
			isLoadingNhanXet: false,
			optionsChartPie: {
				series: [44, 55, 13, 43, 22],
				chart: {
					width: 380,
					type: 'pie',
				},
				legend: {
					position: 'bottom'
				},
				labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
				responsive: [{
					breakpoint: 480,
					options: {
						chart: {
							width: 200
						},
						legend: {
							position: 'bottom'
						}
					}
				}]
			},
			chartHeatmap,
			Data_HeatMap: [],
			selectedLopID: null,
			selectedMonHocID: null,
			lopList: [],
			monHocList: [],
			vueData,
			DataTable: [],
			CapList: []
		}
	},
	async mounted() {
		await this.fetchMyClasses()
		await this.GET_BaoCaoLMS_PhanCap_TheoKhoi_Cap()
	},
	computed: {},
	watch: {
		selectedLopID: function (val) {
			if (val) {
				this.DataTable = []
				this.selectedMonHocID = null
				this.fetchSubjectsByClass(val)
			}
		},
		selectedMonHocID: function (val) {
			if (val) {
				this.GET_BaoCaoLMS_XuHuong_HocTap()
				this.GET_BaoCaoLMS_DiemTrungVi_By_LopID()
			}
		}
	},
	methods: {
		async fetchMyClasses() {
			await ajaxCALL("lms/EL_Teacher_GetMyClasses", { HocKi: this.hocKi }, (res) => {
				this.lopList = res.data || [];

				if (this.lopList.length > 0) {
					this.selectedLopID = this.lopList.find(x => x.LopID == this.lopid)?.LopID ?? this.lopList[0].LopID;
				}
			});
		},
		async fetchSubjectsByClass(lopId) {
			await ajaxCALL("lms/EL_Teacher_GetSubjectsByClass", { LopID: lopId, HocKi: this.hocKi }, (res) => {
				this.monHocList = res.data || [];
				if (this.monHocList.length > 0) {
					this.selectedMonHocID = this.monHocList.find(x => x.MonHocID == parseInt(this.monhocid))?.MonHocID ??
						this.monHocList[0].MonHocID;
				}
			});
		},
		async GET_BaoCaoLMS_XuHuong_HocTap() {
			const params = {
				NienKhoa: vueData.NienKhoa,
				LopID: this.selectedLopID,
				MonHocID: this.selectedMonHocID
			}
			await ajaxCALL('/lms/BaoCaoLMS_XuHuong_HocTap', params, res => {
				let DSHocSinhID = new Set([...res.data.map(hs => hs.HocSinhID)])
				let AssignmentIDList = new Set([...res.data.map(hs => hs.AssignmentID)])
				console.log('AssignmentIDList', AssignmentIDList)
				const FilterSubmissionByStudent = [...DSHocSinhID].map(id => {
					let hs = res.data.find(hs => hs.HocSinhID == id)
					return {
						HocSinhID: id,
						HoTen: hs.HoTen,
						SoDanhBo: hs.SoDanhBo,
						DSSubmission: res.data.filter(hs => hs.HocSinhID == id)
					}
				})
				console.log('FilterSubmissionByStudent', FilterSubmissionByStudent)
				this.handleDataChartTable(FilterSubmissionByStudent, AssignmentIDList)
			})
			await this.GET_EL_BaoCaoLMS_KyNang_GetBy_HocSinhID()

		},
		async handleDataChartTable(FilterSubmissionByStudent, AssignmentIDList) {
			let dataHandle = FilterSubmissionByStudent.map(hs => {
				hs.OptionsData = JSON.parse(JSON.stringify(this.optionsChartStudent))
				hs.OptionsData.xaxis.categories = [...AssignmentIDList].map(id => hs.DSSubmission.find(item => item.AssignmentID == id)?.Title ?? '-')
				hs.OptionsData.series[0].data = [...AssignmentIDList].map(id => hs.DSSubmission.find(item => item.AssignmentID == id)?.PERCENT ?? 0)
				return hs
			})
			this.DataTable = dataHandle
			console.log('this.DataTable', this.DataTable)
		},
		refresh() {
			if (!this.selectedLopID || !this.selectedMonHocID) return
			this.GET_BaoCaoLMS_XuHuong_HocTap()
			this.GET_BaoCaoLMS_DiemTrungVi_By_LopID()
		},
		async GET_BaoCaoLMS_PhanCap_TheoKhoi_Cap() {
			ajaxCALL('lms/BaoCaoLMS_PhanCap_TheoKhoi_Cap', {
				NienKhoa: vueData.NienKhoa,
				HocKi: this.hocKi
			}, res => {
				console.log(res)
				this.CapList = res.data.reduce((result, item) => {
					if (!result[item.CapID]) {
						result[item.CapID] = {
							DSKhoi: [item],
							TongBaiTap: item.BT,
							optionsChartPie: Object.assign({}, this.optionsChartPie)
						}
						result[item.CapID].optionsChartPie.series = [item.BT]
						result[item.CapID].optionsChartPie.labels = ['Khối ' + item.KhoiID]
					} else {
						result[item.CapID].DSKhoi.push(item)
						result[item.CapID].TongBaiTap += item.BT
						result[item.CapID].optionsChartPie.series.push(item.BT)
						result[item.CapID].optionsChartPie.labels.push('Khối ' + item.KhoiID)
					}
					return result
				}, {})
				console.log('this.CapList', this.CapList)
			})
		},
		async getNhanXet(item, chartOptions) {
			this.isLoadingNhanXet = true
			let params = {
				NoiDung: this.jsonToObjectLiteral(JSON.stringify(chartOptions))
			}
			let response = await new Promise((resolve, reject) => {
				ajaxCALL('lms/BaoCaoLMS_PhanTich_XuHuong_HocTap', params, res => {
					resolve(res.data[0].NhanXet)
				})
			})
			item.NhanXet = response
			this.isLoadingNhanXet = false

		},
		jsonToObjectLiteral(jsonString) {
			return JSON.stringify(JSON.parse(jsonString), null, 4)
				.replace(/"([^"]+)":/g, '$1:'); // bỏ ngoặc kép của key
		},
		async GET_EL_BaoCaoLMS_KyNang_GetBy_HocSinhID() {
			const params = {
				// LopID: this.selectedLopID,
				// MonHocID: this.selectedMonHocID,
				LopID: '2448',
				MonHocID: 46,
				HocSinhID: 0,
				AssignmentID: 0
			}
			ajaxCALL('lms/EL_BaoCaoLMS_KyNang_GetBy_HocSinhID', params, async (res) => {
				let DSHocSinhID = new Set([...res.data.map(hs => hs.HocSinhID)])
				let ListKyNang_MonHoc_ChiTietID = new Set([...res.data.map(hs => hs.KyNang_MonHoc_ChiTietID)])
				console.log('ListKyNang_MonHoc_ChiTietID', ListKyNang_MonHoc_ChiTietID)
				const FilterSkillByStudent = [...DSHocSinhID].map(id => {
					return {
						HocSinhID: id,
						SkillsList: res.data.filter(hs => hs.HocSinhID == id)
					}
				})
				console.log('FilterSkillByStudent', FilterSkillByStudent)
				let data = await this.handleDataChartTable_Radar(FilterSkillByStudent, ListKyNang_MonHoc_ChiTietID)
				console.log('data', data)
				this.DataTable = this.DataTable.map(i => {
					i.OptionsData_Radar = data.find(e => e.HocSinhID == i.HocSinhID)?.OptionsData_Radar
					return i
				})
				console.log('this.DataTable', this.DataTable)
			})
		},
		async handleDataChartTable_Radar(FilterSkillByStudent, ListKyNang_MonHoc_ChiTietID) {

			let dataHandle = FilterSkillByStudent.map(hs => {
				hs.OptionsData_Radar = JSON.parse(JSON.stringify(this.optionsChartStudent_Radar))
				hs.OptionsData_Radar.xaxis.categories = [...ListKyNang_MonHoc_ChiTietID].map(id => hs.SkillsList.find(item => item.KyNang_MonHoc_ChiTietID == id)?.TenKyNang ?? '-')
				hs.OptionsData_Radar.series[0].data = [...ListKyNang_MonHoc_ChiTietID].map(id => hs.SkillsList.find(item => item.KyNang_MonHoc_ChiTietID == id)?.Score ?? 0)
				return hs
			})
			return dataHandle
		},
		async GET_BaoCaoLMS_DiemTrungVi_By_LopID() {
			if (!this.selectedLopID || !this.selectedMonHocID) return
			const params = {
				LopID: this.selectedLopID,
				MonHocID: this.selectedMonHocID
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/BaoCaoLMS_DiemTrungVi_By_LopID', params, res => {
					rs(res.data)
				})
			})
			let DSBaiTap = response.reduce((rs, rj) => {
				if (!rs.find(i => i.AssignmentID == rj.AssignmentID)) {
					rs.push({
						AssignmentID: rj.AssignmentID,
						Title: rj.Title,
					})
				}
				return rs
			}, [])
			this.Data_HeatMap = response
			let DSHocSinh = response.reduce((rs, rj) => {
				if (!rs.find(i => i.HocSinhID == rj.HocSinhID)) {
					rs.push({
						HocSinhID: rj.HocSinhID,
						HoTen: rj.HoTen,
						SoDanhBo: rj.SoDanhBo
					})
				}
				return rs
			}, [])
			let series = []
			console.log('DSHocSinh', DSHocSinh)
			DSHocSinh.forEach(hs => {
				let seriesData = {
					name: hs.HoTen + `(${hs.SoDanhBo})`,
					data: []
				}
				DSBaiTap.forEach(bt => {
					let objDiem = response.find(i => i.HocSinhID == hs.HocSinhID && i.AssignmentID == bt.AssignmentID)
					if (objDiem) {
						seriesData.data.push(objDiem.PercentScore)
					} else {
						seriesData.data.push(0)
					}
				})
				series.unshift(seriesData)
			})
			this.chartHeatmap = {
				...this.chartHeatmap,
				series: series,
				xaxis: {
					categories: DSBaiTap.map(i => i.Title)
				}
			}
			console.log('this.chartHeatmap', this.chartHeatmap)
		},

	},
}
</script>