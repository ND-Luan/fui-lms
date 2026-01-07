<template>
	<v-card>
		<v-card-title class="d-flex">
			<p>Kiểm tra số liệu giao bài</p>
			<v-spacer></v-spacer>
			<div class="d-flex ga-2">
				<v-select label="Chọn cấp" v-model="CapID" :items="DSCap" style="width: 200px;"></v-select>
				<v-select label="Chọn khối" v-model="KhoiID" :items="DSKhoi" item-title="TenKhoiHoc" item-value="KhoiID"
					style="width: 200px;"></v-select>
				<v-btn variant="outlined" @click="getData()">Làm mới</v-btn>
			</div>
		</v-card-title>
		<v-card-text>
			<v-data-table :items="DataTable" :headers="headers" class="custom-table" hide-default-footer>
				<template #item.NoiDung="{ item }">
					<div class="d-flex ga-2" @click="onOpenDetail(item)" style="cursor: pointer;">
						<v-chip color="primary" size="small">{{ item.SoLuongBaiTap }} bài
							tập</v-chip>
						<v-chip color="success" size="small">{{ item.SoLuongBaiHoc }} bài
							học</v-chip>
					</div>
				</template>
			</v-data-table>
		</v-card-text>
	</v-card>
	<uc-giao-bai-detailt v-model:isOpen="isShowModalDetail" :itemDetail v-if="isShowModalDetail"/>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			vueData,
			CapID: 2,
			KhoiID: 9,
			DSCap: [
				{
					title: "Cấp 1",
					value: 1
				},
				{
					title: "Cấp 2",
					value: 2
				},
				{
					title: "Cấp 3",
					value: 3
				}
			],
			DSKhoi: [],
			DataTable: [],
			headers: [],
			_,
			DSGiaoVien: [],
			DSLopOriginal: [],
			formData: {
				GiaoVienID: '',
				LopID: null,
				MonHocID: null
			},
			DSMonHocOriginal: [],
			headers: [
				{
					title: 'Giáo viên ID',
					value: 'GiaoVienID',
				}, {
					title: 'Họ tên',
					value: 'HoTen',
				}, {
					title: 'Môn học',
					value: 'TenMonHoc_HienThi',
				}, {
					title: 'Đã tạo nội dung',
					key: 'NoiDung',
				}
			],
			itemDetail: {},
			isShowModalDetail: false
		}
	},
	mounted() {
		if (this.CapID && this.KhoiID) this.getKhoi(); this.getData()
	},
	computed: {
	},
	watch: {
		CapID(val) {
			if (val) {
				this.KhoiID = null
				this.formData = {
					GiaoVienID: '',
					LopID: null,
					MonHocID: null
				}
				this.getKhoi()
			}
		},
		KhoiID(val) {
			if (val) {
				this.formData = {
					GiaoVienID: '',
					LopID: null,
					MonHocID: null
				}
				this.getData()
			}
		}
	},
	methods: {
		getData() {
			if (!this.KhoiID || !this.CapID) return
			this.DataTable = []
			ajaxCALL('/lms/TienDo_GiaoBai', {
				NienKhoa: vueData.NienKhoa,
				CapID: this.CapID,
				KhoiID: this.KhoiID
			}, res => {
				this.DataTable = res.data
				console.log('this.DataTable', this.DataTable)
			})
		},
		getKhoi() {
			ajaxCALL('/lms/KhoiHocByCapHoc_Get', {
				CapID: this.CapID
			}, res => {
				this.DSKhoi = res.data
			})

		},
		onOpenDetail(item) {
			this.itemDetail = item
			this.itemDetail.KhoiID = this.KhoiID
			this.isShowModalDetail = true
		},
       

	}


}
</script>