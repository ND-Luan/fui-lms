<template>
	<div v-for="hocSinh in DSHocSinh" class="mt-2">
		<v-lazy>
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">Học sinh: {{hocSinh.HoTen}}</v-card-title>
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
		mounted() { },
		computed: {},
		watch: {
			modelValue: function (_) {
				this.DSHocSinh = _
			}
		},
		methods: {
			getHeaders(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem
	
				const headers = []
	
				const noiDungDanhGia = [
					{
						title: "Nội dung đánh giá",
						value: "TenMonHoc_HienThi",
						minWidth: 400,
						// left: true,
						// fixed: true
					}
				]
				const uniqueMaCotDiemHeaders = [...new Set(DSCotDiem.map(x => x.MaCotDiem))]
				for (var MaCotDiem of uniqueMaCotDiemHeaders) {
					const objHeader = DSCotDiem.find(x => x.MaCotDiem === MaCotDiem)
					if (objHeader) {
						headers.push({
							title: objHeader.TenCotDiem_VI,
							value: objHeader.MaCotDiem,
							minWidth: objHeader.WidthCSS,
							align: "center"
						})
					}
				}
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