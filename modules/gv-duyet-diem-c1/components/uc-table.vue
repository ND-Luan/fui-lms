<template>
	<div v-for="hocSinh in DSHocSinh" class="mt-2">
		<v-lazy :min-height="100" :options="{ 'threshold': 0.3 }">
			<v-card border>
				<v-card-title class="font-weight-medium text-primary">
					Học sinh: {{hocSinh.SoDanhBo}} {{ hocSinh.HoTen}}
				</v-card-title>
				<v-data-table-virtual class="custom-border" :headers="getHeaders(hocSinh)" :items="getItems(hocSinh)"
					:items-per-page="-1" hide-default-footer>
					<template #item.TenMonHoc_HienThi="{item}">
						{{item.TenMonHoc_HienThi}}
						<v-chip v-if="item.TinhTrang" class="ml-2" :color="item.MauTinhTrang"
							size="small">{{item.TenTinhTrang}}
						</v-chip>
					</template>
					<template #item.log="{item}">
						<v-btn v-if="item.Count_Log_Diem > 0" @click="redirectLog(item)">
							<v-icon>mdi-history</v-icon>
						</v-btn>
					</template>
				</v-data-table-virtual>
			</v-card>
		</v-lazy>
	</div>
	<uc-empty v-if="DSHocSinh.length === 0" />
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
				DSHocSinh: [],
				vueData
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
				const listMaCotDiem = ['MucDoDanhGia', 'Diem', 'Sao', 'NhanXet',];
	
				let filteredMaCotDiemHeaders = uniqueMaCotDiemHeaders.filter(MaCotDiem =>
					listMaCotDiem.some(prefix =>
						MaCotDiem.startsWith(prefix) &&
						MaCotDiem.includes(getKi) &&
						!ignoreColumns.includes(MaCotDiem) // Sửa chỗ này
					)
				);
				filteredMaCotDiemHeaders = filteredMaCotDiemHeaders.sort((a, b) => {
					const getKey = (s) => listMaCotDiem.findIndex(k => s.startsWith(k));
					return getKey(a) - getKey(b);
				});
				// console.log('filteredMaCotDiemHeaders', filteredMaCotDiemHeaders)
				for (const MaCotDiem of filteredMaCotDiemHeaders) {
					const objHeader = DSCotDiem.find(x => x.MaCotDiem === MaCotDiem);
					if (objHeader) {
						headers.push({
							title: objHeader.TenCotDiem_VI,
							value: objHeader.MaCotDiem,
							minWidth: objHeader.WidthCSS,
							align: (objHeader.GiaTriCotDiem === 'number' || objHeader.MaCotDiem.includes('MucDoDanhGia')) ? 'center' : "left"
						});
					}
				}
				const newHeaders = [...noiDungDanhGia, ...headers, { title: "Lịch sử chỉnh sửa", value: "log", align: 'center' },]
				console.log("newHEader", newHeaders)
				return newHeaders
			},
			getItems(hocSinh) {
				const DSCotDiem = hocSinh.DSCotDiem
				const items = []
				const uniqueMonHocID = [...new Set(DSCotDiem.map(x => x.MonHocID))]
				for (var MonHocID of uniqueMonHocID) {
					const obj = {}
					const objMonHoc = DSCotDiem.find(x => x.MonHocID === MonHocID)
					if (objMonHoc) {
						const arrCotDiemFilter = DSCotDiem.filter(x => x.MonHocID === MonHocID && x.MaCotDiem.includes(vueData.Semester.value))
						console.log("arrCotDiemFilter", arrCotDiemFilter)
						for (var CotDiem of arrCotDiemFilter) {
							console.log('=>', CotDiem.MaCotDiem)
							obj[CotDiem.MaCotDiem] = CotDiem.KetQuaDanhGia_VI || CotDiem.KetQuaDanhGia_EN
						}
						if (arrCotDiemFilter.length > 0) {
							obj.TinhTrang = arrCotDiemFilter[0].TinhTrang
							obj.TenTinhTrang = arrCotDiemFilter[0].TenTinhTrang
							obj.MauTinhTrang = arrCotDiemFilter[0].MauTinhTrang
						}
						console.log("obj", MonHocID, obj)
						items.push({
							...obj,
							TenMonHoc_HienThi: objMonHoc.TenMonHoc_HienThi,
							NhapDiemUser: objMonHoc.NhapDiemUser,
							NhapDiemTime: objMonHoc.NhapDiemTime,
							LopID: vueData.LopItem.LopID,
							MaNhomCotDiem: vueData.Semester.value,
							HocSinhID: objMonHoc.HocSinhID,
							MonHocID: MonHocID,
							Count_Log_Diem: objMonHoc.Count_Log_Diem
						})
					}
				}
				console.log('items', items)
				return items
			},
			redirectLog(item) {
				const url = `/log-diem?lopid=${item.LopID}&monhocid=${item.MonHocID}&manhomcotdiem=${item.MaNhomCotDiem}&hocsinhid=${item.HocSinhID}&NienKhoa=${vueData.NienKhoa}`
				openWindow({
					title: "Lịch sử chỉnh sửa",
					url: url,
				})
			}
		},
	}
</script>