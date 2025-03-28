<template>
	<div v-for="hocSinh in DSHocSinh" class="mt-2">
		<v-lazy :min-height="100" :options="{ 'threshold': 0.3 }">
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">Học sinh: {{ hocSinh.HoTen }}</v-card-title>
				<v-data-table-virtual class="custom-border" :headers="getHeaders(hocSinh)" :items="getItems(hocSinh)"
					:items-per-page="-1" hide-default-footer></v-data-table-virtual>
			</v-card>
		</v-lazy>
	</div>
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Array
			}
		},
		data() {
			return {
				DSHocSinh: []
			}
		},
		watch: {
			modelValue: function (_) {
				this.DSHocSinh = _
			}
		},
		methods: {
			getHeaders(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem
	
				const headers = []
				// Danh sách các MaCotDiem cần loại bỏ
				const ignoreColumns = [
					"DiemGK_Doc_HK1",
					"DiemGK_Viet_HK1",
					"DiemCK_Doc_HK1",
					"DiemCK_Viet_HK1"
				];
				const noiDungDanhGia = [
					{
						title: "Nội dung đánh giá",
						value: "TenMonHoc_HienThi",
						minWidth: 400,
						left: true,
						fixed: true
					}
				]
				const Semester = vueData.Semester
				const getKi = Semester.value.split('_')[0]
				const uniqueMaCotDiemHeaders = [...new Set(DSCotDiem.map(x => x.MaCotDiem))]
				const listMaCotDiem = ['MucDoDanhGia', 'NhanXet', 'Diem'];
	
				const filteredMaCotDiemHeaders = uniqueMaCotDiemHeaders.filter(MaCotDiem =>
					listMaCotDiem.some(prefix =>
						MaCotDiem.startsWith(prefix) &&
						MaCotDiem.includes(getKi) &&
						!ignoreColumns.includes(MaCotDiem) // Sửa chỗ này
					)
				);
				for (const MaCotDiem of filteredMaCotDiemHeaders) {
					const objHeader = DSCotDiem.find(x => x.MaCotDiem === MaCotDiem);
					if (objHeader) {
						headers.push({
							title: objHeader.TenCotDiem_VI,
							value: objHeader.MaCotDiem,
							minWidth: objHeader.WidthCSS,
							align: "center"
						});
					}
				}
				console.log("headers", headers);
				return [...noiDungDanhGia, ...headers]
			},
			getItems(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem
				const items = []
				const uniqueMonHocID = [...new Set(DSCotDiem.map(x => x.MonHocID))]
	
				for (var MonHocID of uniqueMonHocID) {
					const obj = {}
					const objMonHoc = DSCotDiem.find(x => x.MonHocID === MonHocID)
					if (objMonHoc) {
						const arrCotDiemFilter = DSCotDiem.filter(x => x.MonHocID === MonHocID)
						for (var CotDiem of arrCotDiemFilter) {
							obj[CotDiem.MaCotDiem] = CotDiem.KetQuaDanhGia_VI || CotDiem.KetQuaDanhGia_EN
						}
						items.push({
							...obj,
							TenMonHoc_HienThi: objMonHoc.TenMonHoc_HienThi
						})
					}
				}
				return items
			}
		},
	}
</script>