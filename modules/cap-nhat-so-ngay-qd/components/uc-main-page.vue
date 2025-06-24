<template>
	<div>
		<v-card>
			<v-card-title class="text-primary">Cập nhật số/ngày quyết định khen thưởng</v-card-title>
			<v-card-text class="mt-5">
				<v-select class="mb-5" v-model="List_CapID" label="Chọn cấp" :items="DSCap" item-title="title"
					item-value="value" multiple chips style="width:400px">
				</v-select>
				<v-card color="blue-lighten-5" class="mb-2"
					v-for="element in DSCap.filter(x => List_CapID.includes(x.value))">
					<v-card-title class="d-flex justify-space-between" style="gap: 100px">
						<div>
							<v-icon start>mdi-drag</v-icon>
							{{ element.title }}
						</div>
						<v-row style="max-width: 600px">
							<v-col cols="12" class="pb-0">
								<v-text-field label="Số quyết định KT" v-model="element.SoQuyetDinhKT"></v-text-field>
							</v-col>
							<v-col cols="6" class="pr-0">
								<v-text-field label="Ngày KT (VI)" v-model="element.NgayKhenThuong_VI"
									:clearable="false">
								</v-text-field>
							</v-col>
							<v-col cols="6">
								<v-text-field label="Ngày KT (EN)" v-model="element.NgayKhenThuong_EN"
									:clearable="false">
								</v-text-field>
							</v-col>
						</v-row>
					</v-card-title>
				</v-card>
				<uc-empty v-if="DSCap.filter(x => List_CapID.includes(x.value)).length === 0" />
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="onSave()" variant="outlined" color="primary"
					:disabled="DSCap.filter(x => List_CapID.includes(x.value)).length == 0">Cập
					nhật</v-btn>
			</v-card-actions>
		</v-card>
	</div>
</template>

<script>
export default {
	components: {
		vuedraggable: window.vuedraggable
	},
	data() {
		return {
			vueData,
			drag: false,
			List_KhoiID: [],
			DSKhoi: [
				{
					"KhoiID": 1,
					"TenKhoiHoc": "Khối 1",
					CapID: 1
				},
				{
					"KhoiID": 2,
					"TenKhoiHoc": "Khối 2",
					CapID: 1
				},
				{
					"KhoiID": 3,
					"TenKhoiHoc": "Khối 3",
					CapID: 1
				},
				{
					"KhoiID": 4,
					"TenKhoiHoc": "Khối 4",
					CapID: 1
				},
				{
					"KhoiID": 5,
					"TenKhoiHoc": "Khối 5",
					CapID: 1
				},
				{
					"KhoiID": 6,
					"TenKhoiHoc": "Khối 6",
					CapID: 2
				},
				{
					"KhoiID": 7,
					"TenKhoiHoc": "Khối 7",
					CapID: 2
				},
				{
					"KhoiID": 8,
					"TenKhoiHoc": "Khối 8",
					CapID: 2
				},
				{
					"KhoiID": 9,
					"TenKhoiHoc": "Khối 9",
					CapID: 2
				},
				{
					"KhoiID": 10,
					"TenKhoiHoc": "Khối 10",
					CapID: 3
				},
				{
					"KhoiID": 11,
					"TenKhoiHoc": "Khối 11",
					CapID: 3
				},
				{
					"KhoiID": 12,
					"TenKhoiHoc": "Khối 12",
					CapID: 3
				}
			],
			List_CapID: [],
			DSCap: [
				{
					title: "Tiểu học", value: 1,
					SoQuyetDinhKT: "",
					NgayKhenThuong_VI: "",
					NgayKhenThuong_EN: ""
				},
				{
					title: "Trung học cơ sở", value: 2,
					SoQuyetDinhKT: "",
					NgayKhenThuong_VI: "",
					NgayKhenThuong_EN: ""
				},
				{
					title: "Trung học phổ thông", value: 3,
					SoQuyetDinhKT: "",
					NgayKhenThuong_VI: "",
					NgayKhenThuong_EN: ""
				},
			],
			DSKhoi_Sort: [],
			formModel: {
				SoQuyetDinhKT: "",
				NgayKhenThuong_VI: "",
				NgayKhenThuong_EN: ""
			}
		}
	},
	mounted() {
		// this.DSKhoi = Array.from({ length: 12 }, (_, i) => ({
		// 	KhoiID: i + 1,
		// 	TenKhoiHoc: `Khối ${i + 1}`,
		// 	SoQuyetDinhKT: "",
		// 	NgayKhenThuong_VI: "",
		// 	NgayKhenThuong_EN: ""
		// }))
		// console.log(this.DSKhoi)
		this.onLoadSoQD()
	},
	computed: {},
	watch: {
		List_KhoiID: {
			handler: function (List_KhoiID) {
				this.DSKhoi_Sort = this.DSKhoi.filter(x => List_KhoiID.includes(x.KhoiID))
			},
			deep: true
		}
	},
	methods: {
		onLoadSoQD() {
			ajaxCALL('lms/KhenThuong_SoQD_Get', null, res => {
				for (var item of this.DSCap) {
					console.log(res.data, item)
					const objCap = res.data.find(x => x.CapID === item.value)
					item.SoQuyetDinhKT = objCap?.SoQuyetDinhKT ?? ""
					item.NgayKhenThuong_VI = objCap?.NgayKhenThuong_VI ?? ""
					item.NgayKhenThuong_EN = objCap?.NgayKhenThuong_EN ?? ""
				}
			})
		},
		onSave() {
			console.log(this.DSCap)
			console.log(this.DSKhoi)
			let JsonData = []
			for (var item of this.DSKhoi) {
				const objKhoi = this.DSCap.find(x => x.value === item.CapID)
				item.SoQuyetDinhKT = objKhoi.SoQuyetDinhKT || null
				item.NgayKhenThuong_VI = objKhoi.NgayKhenThuong_VI || null
				item.NgayKhenThuong_EN = objKhoi.NgayKhenThuong_EN || null
				item.CapID = item.CapID
				JsonData.push(item)
			}

			JsonData = this.DSKhoi.filter(x => this.List_CapID.includes(x.CapID))
			console.log('this.DSKhoi', JsonData)
			ajaxCALL('lms/KhenThuong_Upd',
				{
					JsonData: JsonData.map(x => ({ ...x, NienKhoa: vueData.NienKhoa }))
				},
				res => {
					Vue.$toast.success('Lưu số/ngày quyết định thành công', { position: "top" })
					this.onLoadSoQD()
					vueData.isShowDialogEdit = false
				}
			)
		}
	},
}
</script>