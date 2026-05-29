<template>


	<v-divider></v-divider>
	<v-list class="pt-0" style="overflow: auto; height: calc(100dvh - 248px);">
		<v-tabs v-model="tab" align-tabs="center" grow fixed-tabs>
			<v-tab :value="hocKy.id" :key="hocKy.id" v-for="hocKy in DSHocKy">
				<div class="d-flex justify-center align-center">
					<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
					<p class="font-weight-medium">{{ hocKy.name }}</p>
				</div>
			</v-tab>
			<!-- <v-tab :value="DSHocKy[0].id" :key="DSHocKy[0].id">
				<div class="d-flex justify-center align-center">
					<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
					<p class="font-weight-medium">{{ DSHocKy[0].name }}</p>
				</div>
			</v-tab>
			<v-tab :value="DSHocKy[1].id" :key="DSHocKy[1].id">
				<div class="d-flex justify-center align-center">
					<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
					<p class="font-weight-medium">{{ DSHocKy[1].name }}</p>
				</div>
			</v-tab> -->
		</v-tabs>
		<keep-alive>
			<v-tabs-window v-model="tab">
				<v-tabs-window-item v-for="hocKy in DSHocKy" :key="hocKy.id" :value="hocKy.id">
					<div class="my-2">
						<v-card-title class="bg-primary text-white">
							<div class="d-flex align-center text-subtitle-2">
								<i class="mdi mdi-school mr-2"></i> Bảng điểm các môn
							</div>
						</v-card-title>
						<div class="table-responsive " style="overflow-x: auto;">
							<uc-jexcel class="height-excel" v-if="bangDiem?.length > 0" v-model="vueData.instance"
								:freeze-columns="freezeColumns" v-model:dataSource="bangDiem" :columns="columns"
								:nestedHeaders="nestedHeaders" :updateTable="updateTable" :key="keyComp"
								:styleSheet="styleSheet" :tableHeader="false" :tableRowNumber="false">
							</uc-jexcel>
							<div v-else>
								<uc-empty />
							</div>
						</div>
					</div>

					<div class="my-4" v-if="vueData.HocSinhSelected.CapID !== 1">
						<v-card-title class="bg-green text-white">
							<div class="d-flex align-center text-subtitle-2">
								<i class="mdi mdi-school mr-2"></i> Bảng điểm môn Ngoại Ngữ
							</div>
						</v-card-title>
						<div class="table-responsive " style="overflow-x: auto;">
							<uc-jexcel class="height-excel" v-if="bangDiemTA?.length > 0" v-model="vueData.instance"
								:freeze-columns="freezeColumns" v-model:dataSource="bangDiemTA" :columns="columnsTA"
								:nestedHeaders="nestedHeadersTA" :updateTable="updateTable" :styleSheet="styleSheet"
								:tableHeader="false" :tableRowNumber="false">
							</uc-jexcel>
							<div v-else>
								<uc-empty />
							</div>
						</div>
					</div>
				</v-tabs-window-item>

			</v-tabs-window>
		</keep-alive>
	</v-list>


</template>

<script>
export default {
	props: [],
	data() {
		const { useI18n } = VueI18n
		const { t } = useI18n()
		return {
			keyComp: 0,
			tab: localStorage.getItem('Semester') ? JSON.parse(localStorage.getItem('Semester')) : 1,
			freezeColumns: 1,
			styleSheet: [
				{
					// Viền cho toàn bộ bảng
					'border': '2px solid #333',
					'border-collapse': 'collapse'
				},
				{
					// Viền cho các ô
					'td, th': {
						'border': '1px solid #ddd',
						'padding': '10px'
					}
				},
				{
					// Viền cho tiêu đề
					'th': {
						'border-bottom': '2px solid #4CAF50',
						'background-color': '#4CAF50',
						'color': 'white'
					}
				}
			],
			option: {
				worksheets: [{
					data: [[]],
					minDimensions: [8, 10],
				}]
			},
			bangDiem: [],
			bangDiemTA: [],
			nestedHeaders: [],
			nestedHeadersTA: [],
			columnsTA: [
				{ title: 'Tên Môn', width: 250 },
				{ title: '', width: 100 }, // Đặt ô đầu tiên của cột điểm bằng chuỗi rỗng
			],
			columns: [
				{ title: 'Tên Môn', width: 250 },
				{ title: '', width: 100 }, // Đặt ô đầu tiên của cột điểm bằng chuỗi rỗng
			],
			isNhomCotDiem: true,
			isTiengAnh: false,
			DSHocKy: [
				{
					id: 1,
					code: 'HK1',
					name: `${t('message.semester')} 1`
				},
				{
					id: 2,
					code: 'HK2',
					name: `${t('message.semester')} 2`
				},
			],
			vueData
		}
	},
	mounted() {
		let spreadsheet = jspreadsheet(this.$el, this.options);
		Object.assign(this, spreadsheet);
	},
	computed: {},
	watch: {
		tab: function (tab) {

			this.bangDiem = [],
				this.isNhomCotDiem = true,
				this.isTiengAnh = false,
				this.nestedHeaders[0] = []
			this.columns = [
				{ title: 'Tên Môn', width: 250 },
				{ title: '', width: 100 }, // Đặt ô đầu tiên của cột điểm bằng chuỗi rỗng
			],
				localStorage.setItem('Semester', tab)
			this.keyComp += 1
			this.getData('HK' + tab);
		}
	},
	methods: {
		async getData(semester) {
			this.bangDiem = await ajaxCALLPromise('lms/BangDiemHocKyHocSinh_Get', {
				HocSinhID: vueData.HocSinhSelected.HocSinhID,
				Semester: semester
			})
			if (this.bangDiem.length > 0) {
				this.processBangDiem(this.bangDiem);
			}
		},
		createHeader(dataHeader) {
			if (this.isNhomCotDiem) {
				const result = [
					{ title: "Tên Môn", colspan: "1" },
					...Object.values(dataHeader)
						.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom)
						.map(item => ({
							title: item.TenNhomCotDiem,
							colspan: item.SoLanXuatHien.toString(), // hoặc '6' nếu cố định,
							ten: item.TenNhomCotDiem
						}))
				];
				this.isNhomCotDiem = false;
				return result
			} else {
				const result = [
					{ title: " ", colspan: "1" },
					...Object.entries(dataHeader)
						.map(([key, item]) => ({
							title: item.TenCotDiem,
							minWidth: 150,
							width: 200,
							colspan: item.SoLanXuatHien.toString(), // hoặc '6' nếu cố định
							ten: item.TenCotDiem,
							tenNhom: item.TenNhomCotDiem,

						}))
				];
				this.isNhomCotDiem = true;
				return result
			}
		},
		createData(dataBangDiem, dataTenCotDiem) {
			// group by môn học
			const groupByMon = {};
			const tenNhomMonHoc = dataBangDiem[0]?.TenNhomCotDiem_VI || '';  // Nếu không có, sẽ là chuỗi rỗng
			dataBangDiem.forEach(item => {
				const mon = item.TenMonDuLieuNganh;
				if (!groupByMon[mon]) groupByMon[mon] = [];
				groupByMon[mon].push(item);
			});
			if (!this.isTiengAnh) {
				// Tạo dữ liệu theo từng môn
				const results = Object.entries(groupByMon).map(([mon, items]) => {
					const diemMap = {};
					items.forEach(i => {
						diemMap[i.TenCotDiem_VI] = i.KetQuaDanhGia_VI;
					});
					const row = [mon];
					dataTenCotDiem.forEach((colName, index) => {
						if (index !== 0) {
							row.push(diemMap[colName.title] || ''); // để rỗng nếu không có điểm
						}
					});
					return row;
				});
				return results
			}
			else {
				// Tạo dữ liệu theo từng môn
				const results = Object.entries(groupByMon).map(([mon, items]) => {
					const row = [mon];
					// Duyệt qua từng item trong items để lấy điểm
					items.forEach(i => {
						// Tạo khóa duy nhất từ TenNhomCotDiem_VI và TenCotDiem_VI
						const key = i.TenNhomCotDiem_VI + i.TenCotDiem_VI;
						// Thêm điểm vào row
						row.push(i.KetQuaDanhGia_VI || ''); // Để rỗng nếu không có điểm
					});
					return row;
				});
				return results
			}
		},
		processBangDiem(bangDiem) {
			const bangDiemThuong = bangDiem.filter((mh) => mh.MonHocID !== 46 && mh.MonHocID !== 76);
			if (!this.isTiengAnh) {
				// ktra xem có phải môn anh văn không
				const monHocChon = bangDiemThuong.find((mh, index) => index === 0 && mh.MonHocID !== 46 && mh.MonHocID !== 76)
					|| bangDiemThuong[1]
					|| null;
				// dem nhom cot diem
				const demNhom = bangDiemThuong
					.filter(item => item.MonHocID === monHocChon.MonHocID)
					.reduce((acc, item) => {
						const key = item.TenNhomCotDiem_VI;
						if (!acc[key]) {
							acc[key] = {
								TenNhomCotDiem: item.TenNhomCotDiem_VI,
								ThuTuNhom: item.ThuTuNhom,
								SoLanXuatHien: 1
							};
						} else {
							acc[key].SoLanXuatHien += 1;
						}
						return acc;
					}, {})
				this.nestedHeaders[0] = this.createHeader(demNhom)
				// dem cot diem
				const demcotdiem = bangDiemThuong
					.filter(item => item.MonHocID === monHocChon.MonHocID)
					.reduce((acc, item) => {
						const key = item.TenCotDiem_VI;
						if (!acc[key]) {
							acc[key] = {
								TenCotDiem: item.TenCotDiem_VI,
								TenNhomCotDiem: item.TenNhomCotDiem_VI,
								ThuTuCotDiem: item.ThuTuCotDiem,
								SoLanXuatHien: 1
							};
						} else {
							acc[key].SoLanXuatHien += 1;
						}
						return acc;
					}, {})
				this.columns = this.createHeader(demcotdiem)
				this.bangDiem = this.createData(bangDiemThuong, this.columns)
			}
			this.isTiengAnh = true
			const bangDiemTARAW = bangDiem.filter((mh) => mh.MonHocID === 46 || mh.MonHocID === 76);
			if (this.isTiengAnh) {
				// dem nhom cot diem
				const demNhom = bangDiemTARAW
					.reduce((acc, item) => {
						const key = item.TenNhomCotDiem_VI;
						if (!acc[key]) {
							acc[key] = {
								TenNhomCotDiem: item.TenNhomCotDiem_VI,
								ThuTuNhom: item.ThuTuNhom,
								SoLanXuatHien: 1
							};
						} else {
							acc[key].SoLanXuatHien += 1;
						}
						return acc;
					}, {})
				this.nestedHeadersTA[0] = this.createHeader(demNhom)
				// dem cot diem
				const demcotdiem = bangDiemTARAW
					.filter(item => item.MonHocID === bangDiem[0].MonHocID)
					.reduce((acc, item) => {
						// Tạo khóa duy nhất bằng cách kết hợp TenCotDiem_VI và TenNhomCotDiem_VI
						const key = `${item.TenCotDiem_VI}_${item.TenNhomCotDiem_VI}`;
						if (!acc[key]) {
							acc[key] = {
								TenCotDiem: item.TenCotDiem_VI,
								TenNhomCotDiem: item.TenNhomCotDiem_VI,
								ThuTuCotDiem: item.ThuTuCotDiem,
								SoLanXuatHien: 1
							};
						} else {
							acc[key].SoLanXuatHien += 1;
						}
						return acc;
					}, {});
				// Tạo header từ kết quả
				this.columnsTA = this.createHeader(demcotdiem);
				this.bangDiemTA = this.createData(bangDiemTARAW, this.columnsTA)
			}
		},
		updateTable(instance, cell, col, row, val, label, cellName) {
			cell.style.backgroundColor = vueData.columnHeader[col]?.backGroundColor
			vueData.columnHeader.forEach((x, index) => {
				if (x.type == 'numeric') {
					if (col === index) cell.style.textAlign = 'right'
				} else if (x.type == 'text') {
					if (col === index) cell.style.textAlign = 'left'
				}
			})
		},
	},
	created() {
		this.getData('HK' + this.tab);
	},

}
</script>
