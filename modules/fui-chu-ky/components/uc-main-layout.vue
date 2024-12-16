<template>
	<div class="pa-4">
		<v-card>
			<v-card-title class="text-primary">
				Danh sách chữ ký
				<v-spacer></v-spacer>
				<!-- <v-btn @click="actions.IsShowDialogAdd = true" fab outlined small color="primary">
					<v-icon>mdi-plus</v-icon>
				</v-btn> -->
				<uc-search-field v-model="Search" />
				<uc-btn-add class="ml-2" @click="actions.IsShowDialogAdd = true" />
			</v-card-title>
			<v-data-table :items="DSChuKy" :headers="GiaoVienHeader" :search="Search">
				<template v-slot:item.GiaoVienID="{ item }">
					<span class="black--text">
						{{item.HoGV}} {{item.TenGV}}
					</span>
				</template>
				<template v-slot:item.HinhAnhChuKy="{ item }">
					<span class="black--text">
						<v-chip :href="urlReadFile + 'FileData/' + item.HinhAnhChuKy" target="_blank" color="primary">
							<v-icon left>mdi-code-tags</v-icon>
							Ảnh
						</v-chip>
					</span>
				</template>
				<template v-slot:item.actions="{ item }">
					<!-- <span>
						<v-btn text @click="editItem(record)" x-small fab icon>
							<v-icon color="green darken-2">mdi-square-edit-outline</v-icon>
						</v-btn>
						<v-btn text @click="deleteItem(record)" x-small fab icon>
							<v-icon color="red darken-3">mdi-trash-can-outline</v-icon>
						</v-btn>
					</span> -->
					<uc-action-row @onEditItem="editItem(item)" @onDeleteItem="deleteItem(item)" />
				</template>
			</v-data-table>
		</v-card>

		<uc-add-chu-ky-modal v-model="actions" :dsgiaovien="DSGiaoVien" @onSubmitDialog="onLoadChuKy" />
		<uc-edit-chu-ky-modal v-model="actions" :dsgiaovien="DSGiaoVien" :EditData="EditData" @onSubmitDialog="onLoadChuKy"/>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				actions: {
					IsShowDialogAdd: false,
					IsShowDialogEdit: false,
				},
	
				Search: "",
	
				urlReadFile: "https://file.lhbs.vn/lms/",
	
				DSChuKy: [],
				DSGiaoVien: [],
				EditData: {},
	
				GiaoVienHeader: [
					{
						title: "STT",
						value: "STT", // Sẽ cần xử lý bổ sung để tính STT
						align: "center",
						width: 50,
					},
					{
						title: "Họ tên",
						value: "GiaoVienID",
					},
					{
						title: "Hình ảnh chữ ký",
						value: "HinhAnhChuKy",
					},
					{
						title: "Thao tác",
						value: "actions",
					},
				]
			}
		},
		mounted() {
			this.onLoadChuKy()
			this.onLoadGiaoVien()
		},
		computed: {},
		watch: {},
		methods: {
			editItem(record) {
				this.actions.IsShowDialogEdit = true
				this.EditData = record
			},
			async deleteItem(record) {
				const $this = this
				Alert.confirm({
					text: 'Bạn có muốn xóa không?'
				}).then(async (isConfirmed) => {
					if (isConfirmed) {
						const param = {
							ChuKyID: record.ChuKyID,
						}
	
						const isDelete = await ChuKy_Service.ChuKy_Del(param)
						if (isDelete) {
							Toast.success({ text: `Xóa chữ ký thành công` })
							$this.onLoadChuKy()
						}
					}
				})
			},
			async onLoadGiaoVien() {
				const isSelect = await GiaoVien_Service.GiaoVien_Get()
	
				if (isSelect) {
					this.DSGiaoVien = isSelect.map(item => {
						return {
							...item,
							GiaoVienID: item.GiaoVienID?.trim()
						}
					})
				}
			},
			async onLoadChuKy() {
				const isSelect = await ChuKy_Service.ChuKy_Get()
	
				if (isSelect) {
					this.DSChuKy = isSelect.map((item, index) => {
						return {
							...item,
							STT: index + 1
						}
					})
				}
			} 
		},
	}
</script>