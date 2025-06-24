<template>
	<v-card>
		<v-card-title class="text-primary px-0 pt-0 my-3">
			{{ getTitlePageByURL(urlPage) }}
		</v-card-title>
		<v-card-title class="px-0">
			<v-row dense class="px-0">
				<v-col cols="12" md="3" lg="2">
					<v-select label="Chọn khối" v-model="KhoiID" :items="DSKhoi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-select label="Chọn lớp" v-model="LopID" :items="DSLop" item-title="TenLop" item-value="LopID" />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-select label="Chọn học kì" v-model="HocKyValue" :items="DSKiHoc" item-title="title"
						item-value="value" />
				</v-col>
				<v-col cols="12" md="3" lg="2">
					<v-btn variant='outlined' color="primary" @click="ThongKe_TiLeDat_TA2_GET()"
						:disabled='!HocKyValue || !LopID'>Xem thống kê</v-btn>
				</v-col>
			</v-row>
		</v-card-title>
	</v-card>
	<v-card class="elevation-1 mt-1">
		<v-card-title>
			<span class="text-primary">Thống kê bảng điểm Tiếng Anh 2</span>
		</v-card-title>
		<v-card-text>
			<uc-jexcel class="height-excel" v-if="DataSheet?.length > 0" v-model="instance"
				:freezeColumns="freezeColumns" v-model:dataSource="DataSheet" :columns="columnHeader"
				:nestedHeaders="nestedHeaders" :key="keyComp">
			</uc-jexcel>
			<uc-empty v-else />
		</v-card-text>
	</v-card>

</template>

<script>
export default {
	props: [],
	data() {
		let urlPage = window.location.pathname + window.location.search
		return {
			vueData,
			freezeColumns: 2,
			DataSheet: [],
			instance: null,
			urlPage: urlPage,
			columnHeader: [
				{
					"type": "text",
					"title": "Tên lớp",
					"name": "TenLop",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Phân loại",
					"name": "PhanLoai",
					"width": 300,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true,
					align: 'start'
				},
				{
					"type": "text",
					"title": "Sỉ Số",
					"name": "SiSo",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Số lượng",
					"name": "SSNghe",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Tỷ lệ %",
					"name": "TLNghe",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Số lượng",
					"name": "SSDoc",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Tỷ lệ %",
					"name": "TLDoc",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Số lượng",
					"name": "SSViet",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Tỷ lệ %",
					"name": "TLViet",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Số lượng",
					"name": "SSNoi",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Tỷ lệ %",
					"name": "TLNoi",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Số lượng",
					"name": "SSTrungBinh",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},
				{
					"type": "text",
					"title": "Tỷ lệ %",
					"name": "TLTrungBinh",
					"width": 80,
					"backGroundColor": null,
					"wrap": true,
					"readOnly": true
				},

			],
			nestedHeaders: [
				[
					{
						"title": "",
						"colspan": 3,
						"id": ""
					},
					{
						"title": "Nghe",
						"colspan": 2,
						"id": ""
					},
					{
						"title": "Đọc",
						"colspan": 2,
						"id": ""
					},
					{
						"title": "Viết",
						"colspan": 2,
						"id": ""
					},
					{
						"title": "Nói",
						"colspan": 2,
						"id": ""
					},
					{
						"title": "Trung bình",
						"colspan": 2,
						"id": ""
					}
				]
			],
			keyComp: 0,
			KhoiID: null,
			LopID: null,
			HocKyValue: null,
			DSKiHoc: [
				{
					title: 'Giữa HK1',
					value: 1
				},
				{
					title: 'Cuối HK1',
					value: 2
				},
				{
					title: 'Giữa HK2',
					value: 3
				},
				{
					title: 'Cuối HK2',
					value: 4
				}
			],
			DSKhoi: [
				{
					title: 'Khối 10',
					value: 10
				},
				{
					title: 'Khối 11',
					value: 11
				},
				{
					title: 'Khối 12',
					value: 12
				}
			],
			DSLop: []
		}
	},
	computed: {
	},
	mounted() {

	},
	watch: {
		KhoiID: function (val) {
			this.LopID = null
			if (val) {
				this.LoadDSLop()
				this.HocKyValue = null
				this.DataSheet = []
			}
		},
		LopID: function (val) {
			if (val) {
				this.HocKyValue = null
			}
		},
		HocKyValue: function (val) {
			if (val && this.KhoiID && this.LopID) {
				this.DataSheet = []
				this.ThongKe_TiLeDat_TA2_GET()
			}
		}
	},
	methods: {
		async ThongKe_TiLeDat_TA2_GET() {
			this.DataSheet = []
			if (this.HocKyValue && this.KhoiID && this.LopID) {
				let params = {
					KhoiID: this.KhoiID,
					LopID: this.LopID,
					MonHocID: 76,
					NienKhoa: vueData.NienKhoa
				}
				let HocKi = ''
				if (this.HocKyValue == 1) {
					HocKi = 'S1_Mid'
				} else if (this.HocKyValue == 2) {
					HocKi = 'S1_Final'
				} else if (this.HocKyValue == 3) {
					HocKi = 'S2_Mid'
				} else if (this.HocKyValue == 4) {
					HocKi = 'S2_Final'
				}

				ajaxCALL('lms/ThongKe_TiLeDat_TA2_GET', params, res => {
					const $this = this
					if (res.data.length == 0) {

						Vue.$toast.error('Không có dữ liệu', { position: 'top' })
						return
					}
					let DSMucDoLop = [...new Set(res.data.map(item => item.KetQuaDanhGia_VI))]
					let DSLopID = [...new Set(res.data.map(item => item.LopID))]
					for (var lop of DSLopID) {
						let dataLop = res.data.filter(item => item.LopID == lop && item.MaCotDiem.includes(HocKi))
						console.log('dataLop ' + lop, dataLop)

						for (var mucDo of DSMucDoLop) {
							let obj = {
								TenLop: dataLop[0].TenLop,
								PhanLoai: mucDo,
								SSNghe: null,
								TLNghe: null,
								SSDoc: null,
								TLDoc: null,
								SSViet: null,
								TLViet: null,
								SSNoi: null,
								TLNoi: null,
								SSTrungBinh: null,
								TLTrungBinh: null,
								SiSo: dataLop[0].SiSo
							}
							let dataMucDo = dataLop.filter(item => item.KetQuaDanhGia_VI == mucDo)
							let objNghe = dataMucDo.find(item => item.MaCotDiem.includes('Listening'))
							let objDoc = dataMucDo.find(item => item.MaCotDiem.includes('Reading'))
							let objViet = dataMucDo.find(item => item.MaCotDiem.includes('Writing'))
							let objNoi = dataMucDo.find(item => item.MaCotDiem.includes('Speaking'))
							let objTrungBinh = dataMucDo.find(item => item.MaCotDiem.includes('Avg'))
							if (objNghe) {
								obj.SSNghe = objNghe.SoLuong
								obj.TLNghe = objNghe.TyLe
							}
							if (objDoc) {
								obj.SSDoc = objDoc.SoLuong
								obj.TLDoc = objDoc.TyLe
							}
							if (objViet) {
								obj.SSViet = objViet.SoLuong
								obj.TLViet = objViet.TyLe
							}
							if (objNoi) {
								obj.SSNoi = objNoi.SoLuong
								obj.TLNoi = objNoi.TyLe
							}
							if (objTrungBinh) {
								obj.SSTrungBinh = objTrungBinh.SoLuong
								obj.TLTrungBinh = objTrungBinh.TyLe
							}
							this.DataSheet.push(obj)
						}
					}
					let DataKhoi = []
					if (this.LopID == '0') {
						for (let mucDo of DSMucDoLop) {
							let data = this.DataSheet.filter(item => item.PhanLoai == mucDo)
							let obj = {
								TenLop: `Khối ${this.KhoiID}`,
								PhanLoai: mucDo,
								SSNghe: data.reduce((res, item) => res + item.SSNghe, 0),
								TLNghe: null,
								SSDoc: data.reduce((res, item) => res + item.SSDoc, 0),
								TLDoc: null,
								SSViet: data.reduce((res, item) => res + item.SSViet, 0),
								TLViet: null,
								SSNoi: data.reduce((res, item) => res + item.SSNoi, 0),
								TLNoi: null,
								SSTrungBinh: data.reduce((res, item) => res + item.SSTrungBinh, 0),
								TLTrungBinh: null,
								SiSo: data.reduce((res, item) => res + item.SiSo, 0),
							}
							DataKhoi.push(obj)
						}
						console.log('DataKhoi', DataKhoi)
					}

					this.DataSheet = [...DataKhoi, ...this.DataSheet]


					this.keyComp++
				}, err => {

				})
			}

		},
		LoadDSLop() {
			ajaxCALL('lms/Lop_Get_ByKhoiID', {
				NienKhoa: vueData.NienKhoa,
				KhoiID: this.KhoiID
			}, res => {
				this.DSLop = res.data.filter(item => item.TenLop.includes('AV'));
				this.DSLop.unshift({
					"LopID": "0",
					"TenLop": "Tất cả",
				});
			})
		},
		getTitlePageByURL
	}
}
</script>