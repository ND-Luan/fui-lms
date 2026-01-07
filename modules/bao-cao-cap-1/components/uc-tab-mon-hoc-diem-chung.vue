<template>
	<v-card>
		<v-card-text>
			<v-row>
				<v-col>
					<v-select v-model="HocKi" label="Chọn học kì" :items="DSHocKi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col>
					<v-btn color="primary" variant="tonal" @click="onLoad(HocKi, NienKhoa)">Tìm kiếm</v-btn>
					<v-btn color="primary" variant="tonal" :disabled="items.length === 0" @click="onExportExcel">
						Xuất excel
					</v-btn>
					<v-btn color="primary" variant="tonal"
						:disabled="!BaoCaoItem || items.length === 0 || BaoCaoItem?.IsChotBaoCao"
						@click="onChotBaoCao">Chốt báo cáo</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
		<v-card>
			<v-card-text class="py-0">
				<p v-if="BaoCaoItem?.IsChotBaoCao" class="text-caption">
					<span class="text-red">Thời điểm chốt:</span> [{{BaoCaoItem.NguoiChot}}]
					{{BaoCaoItem.HoTenNguoiChot}} •
					{{BaoCaoItem.NgayChot}}
				</p>
			</v-card-text>
		</v-card>
		<v-data-table class="table-bordered" :headers :items hide-default-footer :items-per-page="-1"
			style="max-height: calc(100dvh - 340px)"></v-data-table>
		<p class="ma-2 font-weight-medium text-primary">Tổng cộng</p>
		<v-data-table class="no-header table-bordered" :headers :items="itemSums" hide-default-footer
			:items-per-page="-1">
		</v-data-table>
		<v-card title="Phổ điểm gộp">
			<v-divider />
			<v-row>
				<v-col v-for="item in itemMonHocs" cols="12" sm="12" md="4" lg="4">
					<v-data-table class="table-bordered" :headers="item.headers" :items="item.items" hide-default-footer
						:items-per-page="-1"></v-data-table>
				</v-col>
			</v-row>
		</v-card>
	</v-card>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number
		},
		data() {
			return {
				headers: [
					{ title: "Khối", value: "KhoiID", align: "center", width: 40, minWidth: 40, fixed: true },
					{ title: "Tên môn học", value: "TenMon", width: 250, minWidth: 250 },
					{
						title: "TSHS được KT", align: "center",
						children: [
							{ title: "TS", value: "TongSo", align: "end" },
							{ title: "Nữ", value: "TongSoNu", align: "end" },
						]
					},
					{
						title: "Đề kiểm tra", align: "center",
						children: [
							{ title: "1", value: "TS1", align: "end" },
							{ title: "2", value: "TS2", align: "end" },
							{ title: "3", value: "TS3", align: "end" },
							{ title: "4", value: "TS4", align: "end" },
							{ title: "5", value: "TS5", align: "end" },
							{ title: "6", value: "TS6", align: "end" },
							{ title: "7", value: "TS7", align: "end" },
							{ title: "8", value: "TS8", align: "end" },
							{ title: "9", value: "TS9", align: "end" },
							{ title: "10", value: "TS10", align: "end" },
						]
					},
					{
						title: "",
						headerProps: { class: "bg-primary" },
						children: [
							{ title: "5;6", value: "Diem5_6", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
							{ title: "Tỉ lệ", value: "TiLe5_6", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
							{ title: "7;8", value: "Diem7_8", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
							{ title: "Tỉ lệ", value: "TiLe7_8", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
							{ title: "9:10", value: "Diem9_10", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
							{ title: "Tỉ lệ", value: "TiLe9_10", align: "end", width: 80, minWidth: 80, headerProps: { class: "bg-primary" }, cellProps: { class: "bg-primary" }, },
						]
					},
					{
						title: "Đề kiểm tra (Tỉ lệ)", align: "center", children: [
							{ title: "Dưới 5", value: "Duoi5", width: 80, minWidth: 80, align: "end" },
							{ title: "Tỉ lệ", value: "TileDuoi5", width: 60, minWidth: 60, align: "end" },
							{ title: "Điểm > 5", value: "Tren5", width: 90, minWidth: 90, align: "end" },
							{ title: "Tỷ lệ", value: "TileTren5", width: 80, minWidth: 80, align: "end" },
							{ title: "Điểm 9;10", value: "Diem910", width: 100, minWidth: 100, align: "end" },
							{ title: "Tỉ lệ", value: "Tile910", width: 80, minWidth: 80, align: "end" },
							{ title: "Điểm 7;8", value: "Diem78", width: 90, minWidth: 90, align: "end" },
							{ title: "Tỉ lệ", value: "Tile78", width: 80, minWidth: 80, align: "end" },
						]
					}
				],
				headerPhoDiemGop: [],
				DSHocKi: [
					{ title: "Giữa HK1", value: 1, textValue: "GK_HK1" },
					{ title: "Cuối HK1", value: 2, textValue: "CK_HK1" },
					{ title: "Giữa HK2", value: 3, textValue: "GK_HK2" },
					{ title: "Cuối HK2", value: 4, textValue: "CK_HK2" }
				],
				HocKi: null,
				itemMonHocs: [],
				items: [],
				itemSums: [],
				BaoCaoItem: null,
				DataQLDiem: [],
			}
		},
		methods: {
			async onLoad(KyDanhGia, NamHoc) {
				let data
				const HK_LMS = this.DSHocKi.find(x => x.value === KyDanhGia)
				const dataLMS = await ajaxCALLPromise("lms/BaoCao_TongHop_Get_BaoCaoID_HocKi_CapID", {
					BaoCaoID: 7,
					HocKi: HK_LMS.textValue,
					CapID: 1,
					NienKhoa: NamHoc,
				})
				this.BaoCaoItem = dataLMS[1][0] //Lấy chi tiết
				console.log("BaoCaoItem", this.BaoCaoItem)
				if (this.BaoCaoItem.IsChotBaoCao) {
					data = JSON.parse(this.BaoCaoItem.JSON_BaoCao)
				}
				else {
					data = await ajaxCALLPromise("psmark1/LMS_GetThongKeDanhGia_ThongKeDiem", {
						KyDanhGia,
						NamHoc
					})
					this.DataQLDiem = data
				}
	
	
				data[0] = data[0].map(x => {
					if (x.TenMon === "Lịch sử/Địa lí") x.TenMon = "Lịch sử và Địa lí"
					return x
				})
	
				data[1] = data[1].map(x => {
					if (x.TenMon === "Lịch sử/Địa lí") x.TenMon = "Lịch sử và Địa lí"
					return x
				})
	
				for (var item of data[0]) {
					item.DiemDuoi5 = item.TS1 + item.TS2 + item.TS3 + item.TS4
					item.TiLeDuoi5 = _.round((item.DiemDuoi5 / item.TongSo) * 100, 2)
	
					item.Diem5_6 = item.TS5 + item.TS6
					item.TiLe5_6 = _.round((item.Diem5_6 / item.TongSo) * 100, 2)
					item.Diem7_8 = item.TS7 + item.TS8
					item.TiLe7_8 = _.round((item.Diem7_8 / item.TongSo) * 100, 2)
					item.Diem9_10 = item.TS9 + item.TS10
					item.TiLe9_10 = _.round((item.Diem9_10 / item.TongSo) * 100, 2)
				}
	
				for (var item of data[1]) {
					item.Diem5_6 = item.TS5 + item.TS6
					item.TiLe5_6 = _.round((item.Diem5_6 / item.TongSo) * 100, 2)
					item.Diem7_8 = item.TS7 + item.TS8
					item.TiLe7_8 = _.round((item.Diem7_8 / item.TongSo) * 100, 2)
					item.Diem9_10 = item.TS9 + item.TS10
					item.TiLe9_10 = _.round((item.Diem9_10 / item.TongSo) * 100, 2)
				}
				const List_MonHoc = [
					'Toán',
					'Tiếng Việt',
					'Ngoại ngữ',
					'Tin học và công nghệ (tin học)',
					'Khoa học',
					'Tin học và công nghệ (công nghệ)',
					'Lịch sử và Địa lí'
				]
				let header = [
					{ title: "Khối", value: "KhoiID", align: "end" },
					{ title: "Dưới 5", value: "TiLeDuoi5", align: "end" },
					{ title: "5;6", value: "TiLe5_6", align: "end" },
					{ title: "7;8", value: "TiLe7_8", align: "end" },
					{ title: "9;10", value: "TiLe9_10", align: "end" }
				]
				const arr = []
				for (var mh of List_MonHoc) {
					let item = data[0].filter(x => x.TenMon === mh)
					arr.push({
						TenMon: mh,
						headers: [
							{
								title: mh,
								align: "center",
								children: header
							}
						],
						items: item
					})
				}
	
				this.itemMonHocs = arr
				this.items = data[0]
				this.itemSums = data[1]
			},
			onExportExcel() {
				if (!this.items.length) {
					this.$toast.warning("Chưa có dữ liệu!");
					return;
				}
	
				exportThongKeDiemExcel({
					headers: this.headers, // ← Truyền thẳng header hiện tại
					items: this.items,
					itemSums: this.itemSums,
					itemMonHocs: this.itemMonHocs,
					DSHocKi: this.DSHocKi,
					HocKi: this.HocKi
				});
			},
			onChotBaoCao() {
				const $this = this
				confirm({
					title: "Xác nhận chốt báo cáo",
					action: function () {
						ajaxCALLPromise("lms/BaoCao_TongHop_Upd_Chot_BaoCao", {
							BaoCao_ChiTietID: $this.BaoCaoItem.BaoCao_ChiTietID,
							JSON_BaoCao: $this.DataQLDiem
						}).then(() => {
							Vue.$toast.success("Chốt báo cáo thành công", { position: "top" })
							$this.onLoad($this.HocKi, $this.NienKhoa)
						})
					}
				})
			},
		},
	}
</script>