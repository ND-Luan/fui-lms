<template>
	<v-card>
		<v-card-title class="text-primary"> Tìm kiếm </v-card-title>
		<v-card-text>
			<v-row>
				<v-col>
					<v-autocomplete label="Học kỳ" :items="['Học kỳ I', 'Học kỳ II', 'Cuối kỳ']">
					</v-autocomplete>
				</v-col>
				<v-col><v-autocomplete v-model="KhoiID" label="Khối" :items="DSKhoi" item-title="text"
						item-value="value">
					</v-autocomplete></v-col>
				<v-col><v-autocomplete v-model="LopID" label="Lớp" :items="DSLop" item-title="TenLop" item-value="LopID"
						:disabled="KhoiID === null">
					</v-autocomplete></v-col>
				<v-col><v-autocomplete v-model="MonHocID" label="Môn học" :items="DSMonHoc" item-value="MonHocID"
						item-title="MonHocName" :disabled="LopID === null">
					</v-autocomplete></v-col>
				<v-col><v-autocomplete placeholder="Chọn nhóm điểm" v-model="MaNhomCotDiem" label="Nhóm điểm"
						:items="DSNhomDiem" style="max-width: 400px;" item-value="MaNhomCotDiem"
						item-title="TenNhomCotDiem_VI" :disabled="MonHocID === null">
					</v-autocomplete></v-col>
			</v-row>
		</v-card-text>
	</v-card>
	<v-card class="mt-4">
		<v-card-title class="text-primary">
			Nhập điểm
			<v-spacer></v-spacer>
			<div>
				<v-btn color="success" @click="onHandleSubmit()" :disabled="!dataSource.length > 0">
					Lưu điểm</v-btn>
				<v-btn icon="mdi-microsoft-excel" color="success" variant="text" @click="exportExcel = true"></v-btn>
			</div>
		</v-card-title>
		<uc-jexcel v-if="dataSource.length > 0" v-model="instance" :freezeColumns="2" v-model:dataSource="dataSource"
			:columns="colHeaders" :exportExcel="exportExcel" :isSubmit="isSubmit" :key="keyComp"
			:updateTable="updateTable" styleExcel="height: calc(100vh - 252px)">
		</uc-jexcel>
	</v-card>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			instance: null,
			exportExcel: false,
			isSubmit: false,
			keyComp: 0, //Set key để render lại jexcel
			dataSource: [], //Data của jexcel
			colHeaders: [], //Header của jexcel
			DSKhoi: [
				{
					text: 'Khối 1',
					value: 1
				},
				{
					text: 'Khối 2',
					value: 2
				},
				{
					text: 'Khối 3',
					value: 3
				},
				{
					text: 'Khối 4',
					value: 4
				},
				{
					text: 'Khối 5',
					value: 5
				},
				{
					text: 'Khối 6',
					value: 6
				},
				{
					text: 'Khối 7',
					value: 7
				},
				{
					text: 'Khối 8',
					value: 8
				},
				{
					text: 'Khối 9',
					value: 9
				},
				{
					text: 'Khối 10',
					value: 10
				},
				{
					text: 'Khối 11',
					value: 11
				},
				{
					text: 'Khối 12',
					value: 12
				}
			],
			DSLop: [],
			DSMonHoc: [],
			DSHocSinh: [],
			DSNhomDiem: [],
			DSCotDiem: [],
			DSCotDiem_ByMaNhomCotDiem: [],
			KhoiID: null,
			LopID: null,
			MonHocID: null,
			TemplateBangDiemID: null,
			MaNhomCotDiem: null,
			MonHocLopID: null,
		}
	},
	mounted() { },
	computed: {},
	watch: {
		KhoiID: function (val) {
			if (val) {
				this.LopID = null
				this.MonHocID = null
				this.MaNhomCotDiem = null
				this.DSLop = []
				this.DSMonHoc = []
				this.DSNhomDiem = []
				this.dataSource = []
				this.loadDSLop()
			}
		},
		LopID: function (val) {
			if (val) {
				this.dataSource = []
				this.MonHocID = null
				this.loadDSHocSinh()
				this.loadDSMonHoc()
			}
		},
		MonHocID: function (val) {
			if (val) {
				let objMonHoc = this.DSMonHoc.find(obj => obj.MonHocID === val)
				this.dataSource = []
				this.MonHocLopID = objMonHoc.MonHocLopID
				this.MaNhomCotDiem = null
				this.loadDSNhomDiem(objMonHoc.TemplateBangDiemID)
			}
		},
		MaNhomCotDiem: function (val) {
			if (val) {
				this.loadDSCotDiem()
			}
		},
	},
	methods: {
		async loadDSLop() {
			const $this = this
			if ($this.KhoiID > 0) {
				const res = await NhapDiem_Service.Lop_Get_ByKhoiID({
					KhoiID: $this.KhoiID
				})
				if (res.length > 0) {
					$this.DSLop = res
				}
			}
		},
		async loadDSHocSinh() {
			const $this = this
			if ($this.LopID > 0) {
				const res = await NhapDiem_Service.HocSinhLop_Get_ByLopID({
					LopID: $this.LopID
				})
				if (res.length > 0) {
					$this.DSHocSinh = res
				}
			}
		},
		async loadDSMonHoc() {
			const $this = this
			if ($this.LopID > 0) {
				const res = await NhapDiem_Service.MonHoc_Get_ByLopID({
					LopID: $this.LopID
				})
				if (res.length > 0) {
					$this.DSMonHoc = res
				}
			}
		},
		async loadDSNhomDiem(TemplateBangDiemID) {
			const $this = this
			$this.TemplateBangDiemID = TemplateBangDiemID
			if (TemplateBangDiemID > 0) {
				const res = await NhapDiem_Service.NhomCauTrucDiem_Get_ByTemplateBangDiemID({
					TemplateBangDiemID: $this.TemplateBangDiemID
				})
				if (res.length > 0) {
					$this.DSNhomDiem = [...new Set(res.map(x => {
						let obj = {
							CssClass: x.CssClass,
							MaNhomCotDiem: x.MaNhomCotDiem,
							Semester: x.Semester,
							TenNhomCotDiem_EN: x.TenNhomCotDiem_EN,
							TenNhomCotDiem_VI: x.TenNhomCotDiem_VI,
							ThuTuNhom: x.ThuTuNhom,
						}
						return obj
					}))]
				}
			}
		},
		async loadDSCotDiem() {
			const $this = this
			if ($this.MaNhomCotDiem !== '' || $this.MaNhomCotDiem !== null) {
				const res = await NhapDiem_Service.HocSinhBangDiem_Get_ByMonHocID_MaNhom({
					LopID: $this.LopID,
					MonHocID: $this.MonHocID,
					TemplateBangDiemID: $this.TemplateBangDiemID,
					MaNhomCotDiem: $this.MaNhomCotDiem
				})
				if (res.length > 0) {
					$this.DSCotDiem_ByMaNhomCotDiem = res.filter(item => item.HocSinhID === res[0].HocSinhID)
					//Xử lý động cột điểm jexcel
					let columnsCotDiem = res.filter(item => item.HocSinhID === res[0].HocSinhID).map(x => {

						if (x.GiaTriCotDiem === 'number') {
							let column = {
								type: 'numeric',
								title: x.TenCotDiem_VI,
								name: x.MaCotDiem,
								typeValue: x.GiaTriCotDiem,
								width: 120,
								decimal: '.',
								mask: '0.00',
								backGroundColor: x.HexBackground,
								wrap: true,
								readOnly: x.LoaiCotDiem === 'Công thức' ? true : false
							}
							return column
						} else if (x.GiaTriCotDiem === 'text') {
							let column = {
								type: 'text',
								title: x.TenCotDiem_VI,
								name: x.MaCotDiem,
								typeValue: x.GiaTriCotDiem,
								width: this.calculateColumnWidth(x.TenCotDiem_VI),
								backGroundColor: x.HexBackground,
								wrap: true
							}
							return column
						} else if (x.GiaTriCotDiem === 'ICO_Star') {
							let column = {
								type: 'html',
								title: x.TenCotDiem_VI,
								name: x.MaCotDiem,
								width: 120,
								typeValue: x.GiaTriCotDiem,
								backGroundColor: x.HexBackground,
								wrap: true,
								align: 'center',
								readOnly: x.LoaiCotDiem === 'Công thức' ? true : false
							}
							return column
						}

					})
					let columnThongTinHocSinh = [
						{ type: "text", title: "Mã học sinh", name: "HocSinhID", width: 120, backGroundColor: null, wrap: true },
						{ type: "text", title: "Họ tên học sinh", name: "HoVaTenHocSinh", width: 300, backGroundColor: null, wrap: true }
					]
					$this.colHeaders = [...columnThongTinHocSinh, ...columnsCotDiem]
					//Xử lý data jexcel
					const uniqueHocSinhID = [...new Set(res.map(x => x.HocSinhID))] //Lấy HocSinhID phân biệt
					const dataJexcel = []
					let indexRow = 1
					for (var hocSinhID of uniqueHocSinhID) {
						const arrCotDiemExist = res.filter(x => x.HocSinhID === hocSinhID)
						let obj = {
							HocSinhID: arrCotDiemExist[0].HocSinhID,
							HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
						}
						for (var cotDiemExist of arrCotDiemExist) {
							if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
								obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)) : cotDiemExist.KetQuaDanhGia_VI
							} else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
								obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow);
							} else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
								obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)})`
							}
						}
						indexRow++
						dataJexcel.push(obj)
					}
					console.log('$this.colHeaders', $this.colHeaders)
					console.log('dataJexcel', dataJexcel)
					$this.dataSource = dataJexcel
					$this.keyComp++
					$this.DSCotDiem = res
				}
			}
		},
		updateTable() {

		}
	},
}
</script>