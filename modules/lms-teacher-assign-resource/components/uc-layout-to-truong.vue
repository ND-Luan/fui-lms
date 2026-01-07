<template>
	<div class="container-page-to-truong w-100 d-flex ga-2 flex-column">
		<v-sheet class=" d-flex w-100 align-center border-sm pa-2" :border="true" rounded="lg" style="min-height:70px">
			<div class="d-flex flex-column">
				<span class="text-h5 font-weight-medium">Báo cáo thống kê giao bài</span>
				<span class="text-subtitle-2">Giáo viên: {{ user }}</span>
			</div>
			<v-spacer></v-spacer>
			<v-select color="success" placeholder="Chọn cấp" v-model="CapID" density="compact" :items="DSCapHoc"
				style="max-width:200px" />
		</v-sheet>
		<v-row dense>
			<!-- BT -->
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Tổng số bài tập được tạo"
					:value="DataDashboard.ChiTietBT?.TongBaiTap_Tao_TheoCap" icon="mdi-book-arrow-up-outline"
					color="#1976d2" />
			</v-col>
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Môn học có bài tập nhiều nhất"
					:value="DataDashboard.ChiTietBT?.MonHoc_TaoBT_NhieuNhat" icon="mdi-book-open-variant-outline"
					color="#1976d2" />
			</v-col>
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Giáo viên tạo bài tập nhiều nhất" icon="mdi-account-outline" color="#1976d2">
					<template #content>
						{{ JSON.parse(DataDashboard.ChiTietBT?.GiaoVien_TaoBT_NhieuNhat ?? {})?.GiaoVienID }}
						- Số lượng bài tập:
						{{ JSON.parse(DataDashboard.ChiTietBT?.GiaoVien_TaoBT_NhieuNhat ?? {})?.SoLuongBaiTap }}
					</template>
				</uc-card-dashboard>
			</v-col>
			<!-- BH -->
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Tổng số bài học được tạo"
					:value="DataDashboard.ChiTietBH?.TongBaiHoc_Tao_TheoCap" icon="mdi-book-arrow-up-outline"
					color="green" /></v-col>
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Môn học có bài học nhiều nhất"
					:value="DataDashboard.ChiTietBH?.MonHoc_TaoBH_NhieuNhat" icon="mdi-book-open-variant-outline"
					color="green" />
			</v-col>
			<v-col md="4" cols="12" sm="6">
				<uc-card-dashboard title="Giáo viên tạo bài học nhiều nhất" icon="mdi-account-outline" color="green">
					<template #content>
						{{ JSON.parse(DataDashboard.ChiTietBH?.GiaoVien_TaoBH_NhieuNhat ?? {})?.GiaoVienID }}
						- Số lượng bài học:
						{{ JSON.parse(DataDashboard.ChiTietBH?.GiaoVien_TaoBH_NhieuNhat ?? {})?.SoLuongBaiHoc }}
					</template>
				</uc-card-dashboard>
			</v-col>
		</v-row>

		<!-- SECTION 2: Thống kê số liệu bài tập theo khối -->
		<v-row dense class="mt-0" align="stretch">
			<v-col md="8" cols="12">
				<v-card class="mx-auto border fill-height" style="min-height: 600px">
					<v-card-title class="d-flex flex-wrap" style="height: fit-content">
						<span>Biểu đồ học tập - Cấp {{ CapID }}</span>
						<v-spacer></v-spacer>
						<v-btn variant="tonal" color="primary" size="small" text='Xem chi tiết'
							@click="onOpenChiTietCapMon_BaiTap()" />
					</v-card-title>
					<v-card-text>
						<v-tabs v-model="sc2_tab" class="border-b">
							<v-tab value="theomon">Môn học</v-tab>
							<v-tab value="theotuan">Tuần học</v-tab>
						</v-tabs>
						<v-tabs-window v-model="sc2_tab">
							<v-tabs-window-item value="theomon">
								<div class="w-100 d-flex align-center">
									<span class="text-primary " style="font-weight: 500;font-size: 16px;">
										Thống kê bài tập theo môn học
									</span>
									<v-spacer />
									<v-btn color="success" variant="text" icon
										@click="jsonToExcel({ data: DataDashboard.ThongKeBaiTap })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
								</div>
								<uc-chart-apex :key="keyChart_BT" :options="chartBT" />
							</v-tabs-window-item>
							<v-tabs-window-item value="theotuan">
								<div class="d-flex flex-wrap ga-2 py-3 align-center">
									<span class="text-primary " style="font-weight: 500;font-size: 16px;">Thống
										kê bài tập theo tháng/ tuần học</span>
									<v-spacer />
									<v-select v-model="ObjThang" color="primary" label="Chọn tháng" return-object
										:items="DSThangHoc" item-title="Thang_Nam_HienThi" item-value="Thang"
										style="max-width: 250px;" chips />
									<v-btn color="success" variant="text" icon
										@click="jsonToExcel({ data: Data_TuanHoc })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
								</div>
								<uc-chart-apex :options="chartMutilTypeData" v-if="!loading" />
							</v-tabs-window-item>
						</v-tabs-window>
					</v-card-text>

				</v-card>
			</v-col>
			<v-col md="4" cols="12">
				<v-card class="mx-auto border fill-height">
					<v-card-title class="d-flex border-b flex-wrap" style="height: fit-content">
						<span>Số lượng bài tập giáo viên tạo</span>
						<v-spacer />
						<v-btn color="success" variant="text" icon
							@click="jsonToExcel({ data: DataDashboard.GiaoVienSummary_BT })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
						<!-- <v-btn color="success" variant="text" icon
							@click="printPDF({ data: pdfExm.content })"><v-icon>mdi-microsoft-excel</v-icon></v-btn> -->

					</v-card-title>

					<v-data-table :items="DataDashboard.GiaoVienSummary_BT" :headers="headersTop10Teacher"
						:hide-default-footer="true" style="max-height: 700px" :items-per-page="-1">
						<template v-slot:item.GiaoVien="{ item }">
							<div class="d-flex flex-column py-1">
								<p>{{ item.HoTen }}</p>
								<span>{{ item.GiaoVienID }}</span>
							</div>
						</template>
						<template v-slot:item.SoLuong="{ item }">
							<v-chip color="green">{{ item.SoLuong }}</v-chip>
						</template>
					</v-data-table>
				</v-card>
			</v-col>
			<v-col md="8" cols="12">
				<v-card class="mx-auto border fill-height" style="min-height: 600px">
					<v-card-item>
						<v-card-title class="d-flex flex-wrap" style="height: fit-content">
							<span>Thống kê số lượng bài học - Cấp {{ CapID }}</span>
							<v-spacer></v-spacer>
							<v-btn variant="tonal" color="primary" text='Xem chi tiết' size="small"
								@click="onOpenChiTietCapMon_BaiHoc()" />
						</v-card-title>
					</v-card-item>

					<uc-chart-apex :key="keyChart_BH" :options="chartBH" />
				</v-card>
			</v-col>
			<v-col md="4" cols="12">
				<v-card class="mx-auto border fill-height" style="min-height: 600px">
					<v-card-title class="d-flex border-b flex-wrap" style="height: fit-content">
						<span>Số lượng bài học giáo viên tạo</span>
						<v-spacer />
						<v-btn color="success" variant="text" icon
							@click="jsonToExcel({ data: DataDashboard.GiaoVienSummary_BH })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>


					</v-card-title>

					<v-data-table :items="DataDashboard.GiaoVienSummary_BH" style="max-height: 700px"
						:headers="headersTop10Teacher" :items-per-page="-1" :hide-default-footer="true">

						<template v-slot:item.GiaoVien="{ item }">
							<div class="d-flex flex-column py-1">
								<p>{{ item.HoTen }}</p>
								<span>{{ item.GiaoVienID }}</span>
							</div>
						</template>
						<template v-slot:item.SoLuong="{ item }">
							<v-chip color="green">{{ item.SoLuong }}</v-chip>
						</template>
					</v-data-table>
				</v-card>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title class="d-flex flex-wrap ga-2" style="height: fit-content">
						<span class="text-primary">Tỉ lệ điểm đạt được của bài tập theo học sinh </span>
						<v-spacer></v-spacer>
						<v-select v-model="LopID" color="primary" label="Lớp" :items="DSLop" item-value="LopID"
							item-title="TenLop" style="max-width: 200px;">
						</v-select>
						<v-select v-model="MonHocID" color="primary" label="Môn học" :items="DSMonHocHeatchart"
							item-value="MonHocID" item-title="MonHocName" style="max-width: 200px;">
						</v-select>

						<v-btn color="success" variant="text" icon @click="jsonToExcel({
							data: Data_HeatMap.map(i => ({
								HocSinhID: i.HocSinhID,
								HoTen: i.HoTen,
								Title: i.Title,
								PercentScore: i.PercentScore
							}))
						})"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<uc-chart-apex :options="chartHeatmap" v-if="chartHeatmap.series.length > 0" />
						<uc-empty v-else></uc-empty>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Chart4: Học lực-->
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title class="d-flex flex-wrap ga-2" style="height: fit-content">
						<span class="text-primary">Tỉ lệ điểm đạt được của bài tập theo lớp / khối</span>
						<v-spacer></v-spacer>
						<v-select v-model="KhoiID_Chart4" color="primary" label="Khối" :items="DSKhoi"
							item-value="KhoiID" item-title="TenKhoiHoc" style="max-width: 200px;">
						</v-select>
						<v-select v-model="MonHocID_ChartLopKhoi" color="primary" label="Môn học"
							:items="DSMonHocLopKhoi" item-value="MonHocID" item-title="MonHocName"
							style="max-width: 200px;">
						</v-select>
					</v-card-title>
					<v-card-text v-if="KhoiID_Chart4 == 0" class="border pa-2 ma-2">
						<div class="border-b pa-2">
							<span class="text-body-1 font-weight-medium text-primary">Theo khối</span>
						</div>
						<uc-chart-apex :options="chartBar_5" v-if="chartBar_5.series.length > 0" />
						<uc-empty v-else></uc-empty>
					</v-card-text>
					<v-card-text class="border pa-2 ma-2">
						<div class="border-b pa-2">
							<span class="text-body-1 font-weight-medium text-primary">Theo lớp</span>
						</div>
						<uc-chart-apex :options="chartBar_4" v-if="chartBar_4.series.length > 0 && !loading_Chart4" />
						<uc-empty v-else></uc-empty>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Chart Tỉ lệ hoàn thành bài tập-->
		<v-row>
			<v-col cols="12">
				<v-card>
					<v-card-title class="d-flex flex-wrap ga-2" style="height: fit-content">
						<span class="text-primary">Tỉ lệ hoàn thành bài tập theo lớp / khối</span>
						<v-spacer></v-spacer>
						<v-select v-model="KhoiID_TiLeHoanThanh_BT" color="primary" label="Khối" :items="DSKhoi"
							item-value="KhoiID" item-title="TenKhoiHoc" style="max-width: 200px;">
						</v-select>
						<v-select v-model="MonID_TiLeHoanThanh_BT" color="primary" label="Môn học"
							:items="DSMonHocLopKhoi" item-value="MonHocID" item-title="MonHocName"
							style="max-width: 200px;">
						</v-select>
					</v-card-title>
					<v-card-text v-if="KhoiID_TiLeHoanThanh_BT == 0" class="border pa-2 ma-2">
						<div class="border-b pa-2 d-flex">
							<span class="text-body-1 font-weight-medium text-primary">Theo khối</span>
							<v-spacer></v-spacer>
							<v-btn color="success" variant="text" icon
										@click="jsonToExcel({ data: Data_TiLeHoanThanh_Khoi })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>

						</div>
						<uc-chart-apex :options="ChartBar_TileHoanThanh_Khoi"
							v-if="ChartBar_TileHoanThanh_Khoi.series.length > 0" />
						<uc-empty v-else></uc-empty>
					</v-card-text>
					<v-card-text class="border pa-2 ma-2">
						<div class="border-b pa-2 d-flex">
							<span class="text-body-1 font-weight-medium text-primary">Theo lớp</span>
								<v-spacer></v-spacer>
							<v-btn color="success" variant="text" icon
										@click="jsonToExcel({ data: Data_TiLeHoanThanh_Lop })"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
						</div>
						<uc-chart-apex :options="ChartBar_TileHoanThanh_Lop"
							v-if="ChartBar_TileHoanThanh_Lop.series.length > 0" />
						<uc-empty v-else></uc-empty>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<uc-modal-chi-tiet-theo-khoi v-if="isOpenModalChiTietKhoiMon" v-model:isOpen="isOpenModalChiTietKhoiMon"
			:KhoiMonObj />
		<uc-modal-chi-tiet-theo-cap v-if="isOpenModalChiTietCapMon" v-model:isOpen="isOpenModalChiTietCapMon"
			:DSMonHocTheoCap :CapID />
	</div>
</template>

<script>
export default {
	props: {
		CapIDParent: {
			type: Number,
			default: 2
		},
		DataDashboard: {
			type: Object,
			default: {}
		},
		DSThangHoc: {
			type: Array,
			default: []
		}
	},
	emits: ['ChangeCapID'],
	data() {
		const optionChart = {
			chart: {
				type: 'bar',
			},
			plotOptions: {
				bar: {
					horizontal: true,
					dataLabels: {
						position: 'top',
					},
				}
			},
			dataLabels: {
				enabled: true,
				offsetX: -6,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				}
			},
			stroke: {
				show: true,
				width: 1,
				colors: ['#fff']
			},
			tooltip: {
				shared: true,
				intersect: false
			},
		}
		const chartMutilType = {
			series: [{
				name: 'Website Blog',
				type: 'column',
				group: 'A',
				data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
			},
			{
				name: 'Website Blog 1',
				type: 'column',
				group: 'A',
				data: [430, 105, 314, 571, 427, 713, 401, 252, 552, 520, 357, 360]
			},
			{
				name: 'Social Media',
				type: 'line',
				data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
			}],
			chart: {
				height: 650,
				type: 'line',
			},
			stroke: {
				width: [0, 4]
			},
			dataLabels: {
				enabled: true,
				enabledOnSeries: [1]
			},
			plotOptions: {
				bar: {
					horizontal: true,
					dataLabels: {
						position: 'top',
					},
				}
			},
			labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
			yaxis: []
		}
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
		const chartBar_4 = {
			chart: {
				height: 450,
				type: 'bar',
			},
			plotOptions: {
				bar: {
					dataLabels: {
						position: 'top',
					},
				}
			},
			series: [],
			labels: [],
			yaxis: {
				formatter: (val) => `${val}%`
			},
			dataLabels: {
				enabled: true,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				},
				formatter: (val) => `${val}%`
			},
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: (val) => `${val}%`
				}
			},
		}
		const chartBar_5 = {
			chart: {
				height: 450,
				type: 'bar',
			},
			plotOptions: {
				bar: {
					dataLabels: {
						position: 'top',
					},
				}
			},
			series: [],
			labels: [],
			yaxis: {
				formatter: (val) => `${val}%`
			},
			dataLabels: {
				enabled: true,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				},
				formatter: (val) => `${val}%`
			},
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: (val) => `${val}%`
				}
			},
		}
		const ChartBar_TileHoanThanh_Lop = {
			chart: {
				height: 450,
				type: 'bar',
			},
			plotOptions: {
				bar: {
					dataLabels: {
						position: 'top',
					},
				}
			},
			series: [],
			labels: [],
			yaxis: {
				formatter: (val) => `${val}%`
			},
			dataLabels: {
				enabled: true,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				},
				formatter: (val) => `${val}%`
			},
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: (val) => `${val}%`
				}
			},
		}
		const ChartBar_TileHoanThanh_Khoi = {
			chart: {
				height: 450,
				type: 'bar',
			},
			plotOptions: {
				bar: {
					dataLabels: {
						position: 'top',
					},
				}
			},
			series: [],
			labels: [],
			yaxis: {
				formatter: (val) => `${val}%`
			},
			dataLabels: {
				enabled: true,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				},
				formatter: (val) => `${val}%`
			},
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: (val) => `${val}%`
				}
			},
		}
		return {
			loading_Chart4: false,
			DSLop: [],
			ThangHoc: null,
			sc2_tab: 'theomon',
			keyComp: 1,
			keyChart_BT: 0,
			keyChart_BH: 0,
			isOpenModalChiTietCapMon: false,
			chartBH: {
				...optionChart,
				series: [],
				xaxis: {
					categories: [],
				},
			},
			chartBT: {
				...optionChart,
				series: [],
				xaxis: {
					categories: [],
				},
			},
			DataChartThongKeGV_BaiTap: {
				type: 'bar',
				data: {

				},
				options: optionChart,
				plugins: {}
			},
			DataChartThongKeGV_BaiHoc: {
				type: 'bar',
				data: {},
				options: optionChart,
				plugins: {}
			},
			headersTop10Teacher: [
				{
					title: 'Giáo viên',
					key: 'GiaoVien'
				},
				{
					title: "Số lượng",
					key: 'SoLuong',
					align: 'end'
				}
			],
			SummarySubmission: [
				{
					title: "Tổng bài tập đã tạo",
					color: '#ffe2e6'
				},
				{
					title: "Tổng bài tập được giao",
					color: '#fff7e8',

				},
				{
					title: "Tổng bài tập được giao",
					color: '#e7fdee',
				}, {
					title: "Tổng bài tập được giao",
					color: '#f4e8fe',
				}
			],
			SummarySubmissionByClassAndStudent: [
				{
					title: "Theo lớp",
					group: []
				},
				{
					title: "Theo học sinh",
					group: []
				}
			],
			headersKhoiMon: [],
			CapID: this.CapIDParent,
			DSMonHoc: [],
			DSCapHoc: [
				{
					title: 'Cấp 1',
					value: 1
				},
				{
					title: 'Cấp 2',
					value: 2
				}, {
					title: 'Cấp 3',
					value: 3
				}
			],
			KhoiMonObj: {},
			isOpenModalChiTietKhoiMon: false,
			DSMonHocTheoCap: [],
			vueData,
			chartMutilType,
			chartMutilTypeData: {},
			loading: false,
			ObjThang: {},
			LopID: null,
			chartHeatmap,
			KhoiID_Chart4: null,
			DSKhoi: [],
			optionChart,
			chartBar_4,
			chartBar_5,
			DSMonHocHeatchart: [],
			MonHocID: null,
			MonHocID_ChartLopKhoi: null,
			Data_HeatMap: [],
			pdfExm: {
				content: [
					{
						text: 'This is a header (whole paragraph uses the same header style)\n\n',
						style: 'header'
					},
					{
						text: [
							'It is however possible to provide an array of texts ',
							'to the paragraph (instead of a single string) and have ',
							{ text: 'a better ', fontSize: 15, bold: true },
							'control over it. \nEach inline can be ',
							{ text: 'styled ', fontSize: 20 },
							{ text: 'independently ', italics: true, fontSize: 40 },
							'then.\n\n'
						]
					},
					{ text: 'Mixing named styles and style-overrides', style: 'header' },
					{
						style: 'bigger',
						italics: false,
						text: [
							'We can also mix named-styles and style-overrides at both paragraph and inline level. ',
							'For example, this paragraph uses the "bigger" style, which changes fontSize to 15 and sets italics to true. ',
							'Texts are not italics though. It\'s because we\'ve overriden italics back to false at ',
							'the paragraph level. \n\n',
							'We can also change the style of a single inline. Let\'s use a named style called header: ',
							{ text: 'like here.\n', style: 'header' },
							'It got bigger and bold.\n\n',
							'OK, now we\'re going to mix named styles and style-overrides at the inline level. ',
							'We\'ll use header style (it makes texts bigger and bold), but we\'ll override ',
							'bold back to false: ',
							{ text: 'wow! it works!', style: 'header', bold: false },
							'\n\nMake sure to take a look into the sources to understand what\'s going on here.'
						]
					}
				]
			},
			DSMonHocLopKhoi: [],
			KhoiID_TiLeHoanThanh_BT: 0,
			MonID_TiLeHoanThanh_BT: null,
			ChartBar_TileHoanThanh_Khoi,
			ChartBar_TileHoanThanh_Lop,
			Data_TiLeHoanThanh_Khoi:[],
			Data_TiLeHoanThanh_Lop:[]
		}
	},
	async mounted() {
		console.log('mouting...')
		const categoryBHs = [...new Set(this.DataDashboard.ThongKeBaiHoc.map(x => x.TenMonHoc_HienThi))]
		this.chartBH = {
			...this.chartBH,
			series: [{
				name: 'SL bài học đã tạo',
				data: this.DataDashboard.ThongKeBaiHoc.map(item => item.SoLuongBH_Tao)
			}, {
				name: 'SL bài học đã giao',
				data: this.DataDashboard.ThongKeBaiHoc.map(item => item.SoLuongBH_DaGiao)
			}],
			xaxis: {
				categories: categoryBHs
			}
		}
		console.log('this.DataDashboard.ThongKeBaiTap', this.DataDashboard.ThongKeBaiTap)
		const categoryBTs = [...new Set(this.DataDashboard.ThongKeBaiTap.map(x => x.TenMonHoc_HienThi))]
		this.chartBT = {
			...this.chartBT,
			series: [{
				name: 'SL bài tập đã tạo',
				data: this.DataDashboard.ThongKeBaiTap.map(item => item.SoLuongBT_Tao)
			}, {
				name: 'SL bài tập đã giao cho lớp',
				data: this.DataDashboard.ThongKeBaiTap.map(item => item.SoLuongBT_DaGiao_Lop)
			}, {
				name: 'SL bài tập đã giao cho học sinh',
				data: this.DataDashboard.ThongKeBaiTap.map(item => item.SoLuongBT_DaGiao_HocSinh)
			}
			],
			xaxis: {
				categories: categoryBTs
			}
		}
		await this.GET_Lop_Get_By_CapID()
		await this.GET_KhoiHocByCapHoc_Get()
		// if (this.MonHocID) {
		// 	await this.GET_BaoCaoLMS_DiemTrungVi_Get_Khoi_Lop_ByKhoiID()

		// }
		this.KhoiID_Chart4 = 0
		this.GET_MonHoc_Get_ByCapID()
		const thangHienTai = dayjs().month() + 1
		const NamHienTai = dayjs().year()
		this.ObjThang = this.DSThangHoc.find(i => i.Thang == thangHienTai && i.Nam == NamHienTai) || this.DSThangHoc[0]
	},
	computed: {
		baitapTheoKhoiMon_byCapID() {
			let DataReturn = this.handleData(this.baitapTheoKhoiMon.filter(item => item.CapID == this.CapID))
			return DataReturn
		},
		user: function () {
			return vueData.user.LastName + ' ' + vueData.user.FirstName
		}
	},
	watch: {
		CapID: function (val) {
			if (val) {
				this.$emit('ChangeCapID', val)
				this.keyComp++
				console.log('this.this.giaoBaiOverview', this.giaoBaiOverview)
			}
		},
		giaoBaiOverview: {
			deep: true,
			handler() {
				this.updateChart()
			},
		},
		sc2_tab(val) {
			if (val == 'theomon') {
			} else {
				this.GET_BaoCaoLMS_Tuan_Mon_BaiTap_By_TuanHocID()
			}
		},
		ObjThang: {
			deep: true,
			async handler(newVal, oldVal) {
				if (this.sc2_tab == 'theotuan') {
					await this.GET_BaoCaoLMS_Tuan_Mon_BaiTap_By_TuanHocID()
				}
			}
		},
		LopID: async function (val) {
			if (val) {
				await this.GET_EL_Teacher_GetSubjectsByClass()
				await this.GET_BaoCaoLMS_DiemTrungVi_By_LopID()
			}
		},
		KhoiID_Chart4: function (val) {
			if (val || val == 0) {
				this.GET_BaoCaoLMS_DiemTrungVi_Get_Khoi_Lop_ByKhoiID()
			}
		},
		MonHocID_ChartLopKhoi: function (val) {
			if (val) {
				this.GET_BaoCaoLMS_DiemTrungVi_Get_Khoi_Lop_ByKhoiID()
			}
		},
		MonID_TiLeHoanThanh_BT: function (val) {
			if (val) {
				this.GET_BaoCaoLMS_TiLeHoanThanh_BaiTap()
			}
		},
		KhoiID_TiLeHoanThanh_BT: function (val) {
			if (val || val == 0) {
				this.GET_BaoCaoLMS_TiLeHoanThanh_BaiTap()
			}
		},
	},
	methods: {
		handleData(data) {
			const DSMonHoc = new Set([...data.map(e => e.MonHocID)])
			const DSKhoi = new Set([...data.map(e => e.KhoiID)])
			this.DSMonHoc = [...DSMonHoc]
			const headersKhoiMon = [{ title: 'Khối', key: 'TenKhoi', align: 'center' }, ...[...DSMonHoc].map(item => {
				const findMon = data.find(mh => mh.MonHocID == item)
				let obj = { title: findMon.TenMonHoc_HienThi, align: 'center' }
				obj['key'] = item
				return obj
			})]
			const DataKhoi = [...DSKhoi].map(khoi => {
				let obj = {
					TenKhoi: khoi
				}
				for (let mh of [...DSMonHoc]) {
					obj[mh] = data.find(e => e.KhoiID == khoi && e.MonHocID == mh)
				}
				return obj
			})
			this.headersKhoiMon = headersKhoiMon
			return DataKhoi
		},
		onOpenChiTietKhoiMon(item) {
			this.isOpenModalChiTietKhoiMon = true
			this.KhoiMonObj = { ...item }
		},
		getStringSlot(mh) {
			return 'item.' + mh
		},
		updateChart() {
			this.DataChartThongKeGV_BaiTap.data.labels = this.giaoBaiOverview.map(i => i.TenMonHoc_HienThi)
			this.DataChartThongKeGV_BaiTap.data.datasets[0].data = this.giaoBaiOverview.map(i => i.SoLuongBT_Tao)
			this.DataChartThongKeGV_BaiTap.data.datasets[1].data = this.giaoBaiOverview.map(i => i.SoLuongBT_DaGiao_Lop)
		},
		onOpenChiTietCapMon_BaiTap() {
			this.isOpenModalChiTietCapMon = true
			this.DSMonHocTheoCap = this.DataDashboard.ThongKeBaiTap.filter(i => i.SoLuongBT_DaGiao_Lop > 0 || i.SoLuongBT_DaGiao_HocSinh > 0).map(i => {
				return {
					MonHocID: i.MonHocID,
					TenMonHoc_HienThi: i.TenMonHoc_HienThi,
					Type: "Assignment"
				}
			})
		},
		onOpenChiTietCapMon_BaiHoc() {
			this.isOpenModalChiTietCapMon = true
			this.DSMonHocTheoCap = this.DataDashboard.ThongKeBaiHoc.filter(i => i.SoLuongBH_DaGiao > 0).map(i => {
				return {
					MonHocID: i.MonHocID,
					TenMonHoc_HienThi: i.TenMonHoc_HienThi,
					Type: "Lesson"
				}
			})
		},
		async GET_BaoCaoLMS_Tuan_Mon_BaiTap_By_TuanHocID() {
			this.loading = true
			const params = {
				CapID: this.CapID,
				Thang: this.ObjThang.Thang,
				NienKhoa: vueData.NienKhoa,
				Nam: this.ObjThang.Nam
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/BaoCaoLMS_Tuan_Mon_BaiTap_By_TuanHocID', params, res => {
					rs(res.data)
				})
			})
			let series = []
			//Lấy dsMonHoc
			let DSMonHoc = response[1].reduce((result, item) => {
				if (result.find(mon => mon.MonHocID === item.MonHocID)) return result;
				else {
					result.push({
						MonHocID: item.MonHocID,
						TenMonHoc_HienThi: item.TenMonHoc_HienThi,
					})
					return result;
				}
			}, [])

			this.Data_TuanHoc = response[0]
			DSMonHoc.forEach(mon => {
				let dataMon = []

				let dataByMonHoc = response[1].filter(i => i.MonHocID == mon.MonHocID)
				response[0].forEach(tuan => {
					let objTuan = dataByMonHoc.find(i => i.TuanHocID == tuan.TuanHocID)
					if (objTuan)
						dataMon.push(objTuan.SoLuongBaiTap)
					else {
						dataMon.push(0)
					}
				})
				series.push({
					name: mon.TenMonHoc_HienThi,
					group: 'monHoc',
					data: dataMon
				})
			})
			this.chartMutilTypeData = {
				...this.chartMutilType,
				chart: {
					height: 650,
					type: 'bar',
				},
				series: series,
				labels: response[0].map(i => i.Tuan_HienThi)
			}
			this.loading = false
		},
		async GET_BaoCaoLMS_DiemTrungVi_By_LopID() {
			if (!this.LopID || !this.MonHocID) return
			const params = {
				LopID: this.LopID,
				MonHocID: this.MonHocID
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
					})
				}
				return rs
			}, [])
			let series = []
			DSHocSinh.forEach(hs => {
				let seriesData = {
					name: hs.HoTen,
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
				series.push(seriesData)
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
		async GET_Lop_Get_By_CapID() {
			const params = {
				CapID: this.CapID,
				NienKhoa: vueData.NienKhoa
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/EL_Teacher_GetMyClasses', params, res => {
					rs(res.data)
				})
			})
			this.DSLop = response
			this.LopID = this.DSLop[0]?.LopID || null
		},
		async GET_KhoiHocByCapHoc_Get() {
			const params = {
				CapID: this.CapID,
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/KhoiHocByCapHoc_Get', params, res => {
					rs(res.data)
				})
			})
			this.DSKhoi = response
			this.DSKhoi.unshift({
				"KhoiID": 0,
				"TenKhoiHoc": "Tất cả",
				"KhoiHocCode": "0"
			})
		},
		async GET_BaoCaoLMS_DiemTrungVi_Get_Khoi_Lop_ByKhoiID() {
			if (this.KhoiID_Chart4 == null || !this.MonHocID_ChartLopKhoi) return
			this.loading_Chart4 = true
			const params = {
				CapID: this.CapID,
				KhoiID: this.KhoiID_Chart4,
				NienKhoa: vueData.NienKhoa,
				MonHocID: this.MonHocID_ChartLopKhoi
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/BaoCaoLMS_DiemTrungVi_Get_Khoi_Lop_ByKhoiID', params, res => {
					rs(res.data)
				})
			})

			let series = response[0].length > 0 ? [
				{
					name: "Phần trăm",
					data: response[0].map(item => item.MedianPercent_Lop)
				}
			] : []
			this.chartBar_4 = {
				...this.chartBar_4,
				series: series,
				labels: response[0].map(item => item.TenLop)
			}

			if (this.KhoiID_Chart4 == 0) {
				let series_Chart5 = response[1].length > 0 ? [
					{
						name: "Phần trăm",
						data: response[1].map(item => item.MedianPercent_Khoi)
					}
				] : []
				this.chartBar_5 = {
					...this.chartBar_5,
					series: series_Chart5,
					labels: response[1].map(item => 'Khối ' + item.KhoiID)
				}
			}
			this.loading_Chart4 = false
		},
		async GET_EL_Teacher_GetSubjectsByClass() {
			const params = {
				CapID: this.CapID,
				NienKhoa: vueData.NienKhoa,
				LopID: this.LopID
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/EL_Teacher_GetSubjectsByClass', params, res => {
					rs(res.data)
				})
			})
			this.DSMonHocHeatchart = response
			this.MonHocID = response.find(obj => [5, 46, 76].includes(obj.MonHocID))?.MonHocID || null
		},
		async GET_MonHoc_Get_ByCapID() {

			const params = {
				CapID: this.CapID
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/MonHoc_Get_ByCapID', params, res => {
					rs(res.data)
				})
			})
			this.DSMonHocLopKhoi = response
			this.MonHocID_ChartLopKhoi = response.find(obj => [5, 46, 76].includes(obj.MonHocID))?.MonHocID || null
			this.MonID_TiLeHoanThanh_BT = response.find(obj => [5, 46, 76].includes(obj.MonHocID))?.MonHocID || null
		},

		async GET_BaoCaoLMS_TiLeHoanThanh_BaiTap() {

			const params = {
				CapID: this.CapID,
				MonHocID: this.MonID_TiLeHoanThanh_BT,
				NienKhoa: vueData.NienKhoa
			}
			const response = await new Promise((rs, rj) => {
				ajaxCALL('lms/BaoCaoLMS_TiLeHoanThanh_BaiTap', params, res => {
					rs(res.data)
				})
			})
			this.Data_TiLeHoanThanh_Lop = response[0]
			let series = response[0].length > 0 ? [
				{
					name: "Phần trăm",
					data: response[0].filter(i => { if (this.KhoiID_TiLeHoanThanh_BT != 0) return i.KhoiID == this.KhoiID_TiLeHoanThanh_BT; else return true }).map(item => item.TiLeHoanThanh)
				}
			] : []
			this.ChartBar_TileHoanThanh_Lop = {
				...this.ChartBar_TileHoanThanh_Lop,
				series: series,
				labels: response[0].filter(i => { if (this.KhoiID_TiLeHoanThanh_BT != 0) return i.KhoiID == this.KhoiID_TiLeHoanThanh_BT; else return true }).map(item => item.TenLop)
			}

			if (this.KhoiID_Chart4 == 0) {
				this.Data_TiLeHoanThanh_Khoi = response[1]
				let series_Chart5 = response[1].length > 0 ? [
					{
						name: "Phần trăm",
						data: response[1].filter(i => { if (this.KhoiID_TiLeHoanThanh_BT != 0) return i.KhoiID == this.KhoiID_TiLeHoanThanh_BT; else return true }).map(item => item.TiLeHoanThanh)
					}
				] : []
				this.ChartBar_TileHoanThanh_Khoi = {
					...this.ChartBar_TileHoanThanh_Khoi,
					series: series_Chart5,
					labels: response[1].filter(i => { if (this.KhoiID_TiLeHoanThanh_BT != 0)  return i.KhoiID == this.KhoiID_TiLeHoanThanh_BT; else return true }).map(item => item.TenKhoiHoc)
				}
			}

		},
		printPDF,
		jsonToExcel,
		dayjs
	},
}
</script>