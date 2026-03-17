<template>
	<Global>
		<v-card>
			<v-card-title>
				Điểm MH theo Khối
			</v-card-title>
			<v-card-text>
				<v-row>
					<v-col>
						<v-select v-model="HocKiItem" label="Chọn học kì" :items="DSHocKi" item-title="title"
							item-value="value" return-object />
					</v-col>
					<v-col>
						<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
							item-value="KhoiID" return-object />
					</v-col>
					<v-col>
						<v-select v-model="MonHocItem" label="Chọn môn học" :items="DSMonHoc" item-title="MonHocName"
							item-value="MonHocID" return-object />
					</v-col>
					<v-col>
						<v-btn text="Làm mới" @click="onRefresh" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-card title="Thống kê môn học theo khối">
			<v-data-table :headers="headerThongKe" :items="itemThongKe" :items-per-page="-1" hide-default-footer />
		</v-card>
		<v-divider />
		<v-card title="Danh sách bảng điểm học sinh">
			<v-data-table :headers="headerBangDiem" :items="itemBangDiem" :items-per-page="-1" hide-default-footer />
		</v-card>
	</Global>
</template>

<script>
export default {
	props: [],
	data() {
		let DSHocKi = []
		if (vueData.capid == 1) {
			DSHocKi = [
				{ title: "Giữa kì 1", value: "GK_HK1", textValue: "HK1" },
				{ title: "Cuối kì 1", value: "CK_HK1", textValue: "HK1" },
				{ title: "Giữa kì 2", value: "GK_HK2", textValue: "HK2" },
				{ title: "Cuối kì 2", value: "CK_HK2", textValue: "HK2" },
			]
		}
		else {
			DSHocKi = [
				{ title: "Học kì 1", value: "HK1" },
				{ title: "Học kì 2", value: "HK2" },
			]
		}
		return {
			vueData,
			DSHocKi,
			CapID: vueData.capid,
			HocKiItem: null,
			DSKhoi: [],
			KhoiItem: null,
			DSMonHoc: [],
			MonHocItem: null,
			DSBangDiem: [],
			DSThongKe: [],
			headerThongKe: [],
			itemThongKe: [],
			headerBangDiem: [],
			itemBangDiem: []
		}
	},
	mounted() {
	},
	computed: {},
	watch: {
		"HocKiItem.HocKi": function () {
			this.getKhoi()
		},
		"KhoiItem.KhoiID": function () {
			this.getMon()
		},
		"MonHocItem.MonHocID": function () {
			this.initHeader()
			this.onRefresh()
		}
	},
	methods: {
		async getKhoi() {
			this.DSKhoi = await fetchPromise("lms/KhoiHocByCapHoc_Get", {
				CapID: this.CapID,
				HocKi: vueData.NienKhoaItem.HocKi,
				NienKhoa: vueData.NienKhoa
			})
		},
		async getMon() {
			this.DSMonHoc = await fetchPromise("lms/MonHoc_GetByKhoiID", {
				NienKhoa: vueData.NienKhoa,
				KhoiID: this.KhoiItem.KhoiID,
				HocKi: vueData.NienKhoaItem.HocKi
			})
		},
		async onLoadHocSinhBangDiem() {
			const raw = await fetchPromise("lms/HocSinhBangDiem_Get_By_KhoiID_MonHocID", {
				KhoiID: this.KhoiItem.KhoiID,
				TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
				NienKhoa: vueData.NienKhoa,
				Semester: this.HocKiItem.value,
			}, { forceRefresh: true })

			const map = {}
			const columnArr = []

			raw.forEach(item => {
				// tạo học sinh
				if (!map[item.HocSinhID]) {
					map[item.HocSinhID] = {
						HocSinhID: item.HocSinhID,
						SoDanhBo: item.SoDanhBo,
						HoTen: item.HoTen,
					}
				}

				// 👉 dùng KetQuaDanhGia_VI
				map[item.HocSinhID][item.MaCotDiem] = item.KetQuaDanhGia_VI ?? "-"

				// build column (có sort)
				if (!columnArr.find(x => x.key === item.MaCotDiem)) {
					columnArr.push({
						key: item.MaCotDiem,
						title: item.TenCotDiem_VI,
						order: item.ThuTuCotDiem
					})
				}
			})

			// sort column
			columnArr.sort((a, b) => a.order - b.order)

			// data
			this.itemBangDiem = Object.values(map)

			// header
			this.headerBangDiem = [
				{ title: "Số danh bộ", value: "SoDanhBo", minWidth: "100px", width: "100px", align: "center" },
				{ title: "Họ tên", value: "HoTen", minWidth: "150px", width: "150px" },
				{ title: "Ngày sinh", value: "NgaySinh", minWidth: "120px", width: "120px" },
				{ title: "Giới tính", value: "GioiTinh", minWidth: "100px", width: "100px" },

				...columnArr.map(col => ({
					title: col.title,
					value: col.key,
					align: "center"
				}))
			]
		},
		async onLoadThongKeTheoCap() {
			this.itemThongKe = await fetchPromise("lms/ThongKeDiemTheoCap_MaCotDiem", {
				CapID: this.CapID,
				MonHocID: this.MonHocItem.MonHocID,
				MaCotDiem: "Diem" + this.HocKiItem.value,
				HocKi: this.HocKiItem.textValue,
				NhomHocKi: this.HocKiItem.value,
			}, { forceRefresh: true })
		},
		onRefresh() {
			this.onLoadHocSinhBangDiem()
			this.onLoadThongKeTheoCap()
		},
		initHeader() {
			let headers = []
			if ([106, 43, 42, 41, 40, 38, 37, 36].includes(this.MonHocItem?.MonHocID)) {
				headers = [
					{
						"title": "Giai đoạn",
						"value": "Semester"
					},
					{
						"title": "Khối",
						"value": "TenKhoiHoc"
					},
					{
						"title": "Tổng số học sinh",
						"value": "TongSoHocSinh",
						"align": "right"
					},
					{
						"title": "Sao < 3",
						"value": "SaoDuoi3"
					},
					{
						"title": "Tỉ lệ sao < 3",
						"value": "TiLeSao3"
					},
					{
						"title": "Sao 3",
						"value": "Sao3"
					},
					{
						"title": "Tỉ lệ sao 3",
						"value": "TiLeSao3"
					},
					{
						"title": "Sao 4",
						"value": "Sao4"
					},
					{
						"title": "Tỉ lệ sao 4",
						"value": "TiLeSao4"
					},
					{
						"title": "Sao 5",
						"value": "Sao5"
					},
					{
						"title": "Tỉ lệ sao 5",
						"value": "TiLeSao5"
					}
				]
			}
			else {
				headers = [
					{
						"title": "Giai đoạn",
						"value": "Semester"
					},
					{
						"title": "Khối",
						"value": "TenKhoiHoc"
					},
					{
						"title": "Tổng số học sinh",
						"value": "TongSoHocSinh",
						"align": "right"
					},
					{
						"title": "<5",
						"value": "DiemDuoi5",
						"align": "right"
					},
					{
						"title": "TL <5",
						"value": "TiLeDiem5",
						"align": "right"
					},
					{
						"title": "5",
						"value": "DiemDuoi5",
						"align": "right"
					},
					{
						"title": "TL 5",
						"value": "TiLeDiem5",
						"align": "right"
					},
					{
						"title": "6",
						"value": "Diem6",
						"align": "right"
					},
					{
						"title": "TL 6",
						"value": "TiLeDiem6",
						"align": "right"
					},
					{
						"title": "7",
						"value": "Diem7",
						"align": "right"
					},
					{
						"title": "TL 7",
						"value": "TiLeDiem7",
						"align": "right"
					},
					{
						"title": "8",
						"value": "Diem8",
						"align": "right"
					},
					{
						"title": "TL 8",
						"value": "TiLeDiem8",
						"align": "right"
					},
					{
						"title": "9",
						"value": "Diem9",
						"align": "right"
					},
					{
						"title": "TL 9",
						"value": "TiLeDiem9",
						"align": "right"
					},
					{
						"title": "10",
						"value": "Diem10",
						"align": "right"
					},
					{
						"title": "TL 10",
						"value": "TiLeDiem10",
						"align": "right"
					}
				]
			}
			this.headerThongKe = headers

		}
	},
}
</script>