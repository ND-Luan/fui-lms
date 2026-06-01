<template>
	<v-card border flat class="pa-4">
		<v-card-title class="px-0 d-flex align-center teaser-title mb-4">
			<span class="text-primary font-weight-bold">BÁO CÁO THỐNG KÊ CHI TIẾT</span>
			<v-spacer />
			<div v-if="BaoCaoItem?.IsChotBaoCao"
				class="text-caption bg-red-lighten-5 px-3 py-1 rounded-pill border-red">
				<v-icon size="small" color="red" class="me-1">mdi-lock</v-icon>
				<span class="text-red font-weight-bold">Đã chốt:</span>
				<span class="text-black ms-1">{{BaoCaoItem.HoTenNguoiChot}} - {{BaoCaoItem.NgayChot}}</span>
			</div>
		</v-card-title>
		<div class="d-flex flex-column ga-5">
			<v-card border flat>
				<v-card-title class="text-primary">Học lực / Học tập</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersHocTap" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart1" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>

			<v-card border flat>
				<v-card-title class="text-primary">Hạnh kiểm (Kết quả rèn luyện)</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersKQRL" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart2" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>

			<v-card border flat>
				<v-card-title class="text-primary">Danh hiệu</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="12">
							<v-data-table :headers="headersDanhHieu" :items="Data_THPT" :hide-default-footer="true"
								class="table-bordered"></v-data-table>
						</v-col>
						<v-col cols="12">
							<uc-chart-apex :options="OptionsChart3" v-if="Data_THPT.length > 0" />
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</div>
	</v-card>
</template>

<script>
	export default {
		props: {
HocKi: String
},
inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
data() {
var options = {
chart: {
type: 'bar',
height: 500,
stacked: true,
},
plotOptions: {
bar: {
horizontal: false,
columnWidth: '55%',
borderRadius: 5,
borderRadiusApplication: 'end'
},
},
dataLabels: {
enabled: false
},
title: {
text: 'Biểu đồ tỉ lệ',
align: 'left',
style: {
fontSize: '16px',
color: '#263238'
}
},
stroke: {
show: true,
width: 2,
colors: ['transparent']
},
xaxis: {
categories: [],
},
series: [],
yaxis: {
title: {
text: '%'
},
max: 100,
min: 0,
},
fill: {
opacity: 1
},
tooltip: {
y: {
formatter: function (val) {
return val + "%"
}
}
}
}
return {
vueData,
BaoCaoItem: null,
DataChotBaoCao: null,
OptionsChart1: options,
OptionsChart2: options,
OptionsChart3: options,
Data_THPT: [],
headersKQRL: [
{ title: "Khối", value: "Lớp" },
{ title: "Sỉ số", value: "Sỉ số", align: "end" },
{ title: "KQRL Tốt", value: "KQRL Tốt", align: "end" },
{ title: "% KQRL Tốt", value: "% KQRL Tốt", align: "end" },
{ title: "KQRL Khá", value: "KQRL Khá", align: "end" },
{ title: "% KQRL Khá", value: "% KQRL Khá", align: "end" },
{ title: "KQRL Đạt", value: "KQRL Đạt", align: "end" },
{ title: "% KQRL Đạt", value: "% KQRL Đạt", align: "end" },
{ title: "KQRL Chưa đạt", value: "KQRL Chưa đạt", align: "end" },
{ title: "% KQRL Chưa đạt", value: "% KQRL Chưa đạt", align: "end" }
],
headersHocTap: [
{ title: "Khối", value: "Lớp" },
{ title: "Sỉ số", value: "Sỉ số", align: "end" },
{ title: "KQHT Tốt", value: "KQHT Tốt", align: "end" },
{ title: "% KQHT Tốt", value: "% KQHT Tốt", align: "end" },
{ title: "KQHT Khá", value: "KQHT Khá", align: "end" },
{ title: "% KQHT Khá", value: "% KQHT Khá", align: "end" },
{ title: "KQHT Đạt", value: "KQHT Đạt", align: "end" },
{ title: "% KQHT Đạt", value: "% KQHT Đạt", align: "end" },
{ title: "KQHT Chưa đạt", value: "KQHT Chưa đạt", align: "end" },
{ title: "% KQHT Chưa đạt", value: "% KQHT Chưa đạt", align: "end" }
],
headersDanhHieu: [
{ title: "Khối", value: "Lớp" },
{
title: "HS Xuất Sắc",
align: "center",
children: [
{ title: "SL", value: "DH Xuất sắc", align: "end" },
{ title: "Tỉ lệ (%)", value: "% DH Xuất sắc", align: "end" },
]
},
{
title: "HS Giỏi",
align: "center",
children: [
{ title: "SL", value: "DH Giỏi", align: "end" },
{ title: "Tỉ lệ (%)", value: "% DH Giỏi", align: "end" },
]
}
],
DSHocKi: [
{ title: "Học kì 1", value: 1, textValue: "HK1" },
{ title: "Học kì 2", value: 2, textValue: "HK2" },
{ title: "Cả năm", value: 0, textValue: "CaNam" }
]
}
},
mounted() {
if (this.HocKi) this.getHocLucHangKiem(2)
},
watch: {
HocKi(v) {
if (v) this.getHocLucHangKiem(2)
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
this.getHocLucHangKiem(2)
},
async getHocLucHangKiem(capid) {
if (!vueData.NienKhoa || !this.HocKi) return
let data
const dataLMS = await fetchPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
BaoCaoID: 9,
HocKi: this.HocKi,
CapID: 2,
NienKhoa: vueData.NienKhoa,
})
this.BaoCaoItem = dataLMS[1][0]
if (this.BaoCaoItem?.IsChotBaoCao) {
data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
}
else {
const hkItem = this.DSHocKi.find(x => x.textValue === this.HocKi || x.value == this.HocKi)
data = await fetchPromise(`diemc${capid}/LMS_ThongKeChung`, {
HocKy: hkItem?.value ?? 1,
NamHoc: vueData.NienKhoa,
TypeBaoCao: 2
})
this.DataChotBaoCao = data
}
data = data.filter(x => x['Lớp'].includes('Khối'))
this.Data_THPT = data
this.handleChart1(data.map(item => ({
'Sỉ số': item['Sỉ số'],
'Lớp': item['Lớp'],
'% KQHT Tốt': item['% KQHT Tốt'] ? item['% KQHT Tốt'] : null,
'% KQHT Khá': item['% KQHT Khá'] ? item['% KQHT Khá'] : null,
'% KQHT Đạt': item['% KQHT Đạt'] ? item['% KQHT Đạt'] : null,
'% KQHT Chưa đạt': item['% KQHT Chưa đạt'] ? item['% KQHT Chưa đạt'] : null,
})))
this.handleChart2(data.map(item => ({
'Sỉ số': item['Sỉ số'],
'Lớp': item['Lớp'],
'% KQRL Tốt': item['% KQRL Tốt'] ? item['% KQRL Tốt'] : null,
'% KQRL Khá': item['% KQRL Khá'] ? item['% KQRL Khá'] : null,
'% KQRL Đạt': item['% KQRL Đạt'] ? item['% KQRL Đạt'] : null,
'% KQRL Chưa đạt': item['% KQRL Chưa đạt'] ? item['% KQRL Chưa đạt'] : null,
})))
this.handleChart3(data.map(item => ({
'Sỉ số': item['Sỉ số'],
'Lớp': item['Lớp'],
'% DH Giỏi': item['% DH Giỏi'] ? item['% DH Giỏi'] : null,
'% DH Xuất sắc': item['% DH Xuất sắc'] ? item['% DH Xuất sắc'] : null,
})))
},
handleChart1(DataChart1) {
this.OptionsChart1 = {
...this.OptionsChart1,
xaxis: { categories: DataChart1.map(item => item['Lớp']) },
series: [
{ name: '% KQHT Tốt', data: DataChart1.map(item => item['% KQHT Tốt']) },
{ name: '% KQHT Khá', data: DataChart1.map(item => item['% KQHT Khá']) },
{ name: '% KQHT Đạt', data: DataChart1.map(item => item['% KQHT Đạt']) },
{ name: '% KQHT Chưa đạt', data: DataChart1.map(item => item['% KQHT Chưa đạt']) }
]
}
},
handleChart2(DataChart2) {
this.OptionsChart2 = {
...this.OptionsChart2,
xaxis: { categories: DataChart2.map(item => item['Lớp']) },
series: [
{ name: '% KQRL Tốt', data: DataChart2.map(item => item['% KQRL Tốt']) },
{ name: '% KQRL Khá', data: DataChart2.map(item => item['% KQRL Khá']) },
{ name: '% KQRL Đạt', data: DataChart2.map(item => item['% KQRL Đạt']) },
{ name: '% KQRL Chưa đạt', data: DataChart2.map(item => item['% KQRL Chưa đạt']) }
]
}
},
handleChart3(DataChart3) {
this.OptionsChart3 = {
...this.OptionsChart3,
xaxis: { categories: DataChart3.map(item => item['Lớp']) },
series: [
{ name: '% DH Giỏi', data: DataChart3.map(item => item['% DH Giỏi']) },
{ name: '% DH Xuất sắc', data: DataChart3.map(item => item['% DH Xuất sắc']) }
]
}
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