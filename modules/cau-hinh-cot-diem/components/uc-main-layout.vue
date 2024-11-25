<template>
	<div>
		<v-card flat border>
			<v-card-title class="d-flex align-center pe-2">
				Cấu hình cột điểm
				<v-spacer></v-spacer>
				<v-btn icon color="primary" size="small" variant="outlined" @click="onOpenModalAddCauHinhCotDiem()">
					<v-icon>mdi-plus</v-icon>
				</v-btn>
			</v-card-title>

			<v-data-table :items="TBCauHinhCotDiem" :headers="headers" density="compact">
				<template v-slot:item.TongCotDiem="{ item }">
					<v-chip variant="outlined" color="green">
						{{ item.TongCotDiem }}
					</v-chip>
				</template>
				<template v-slot:item.LoaiCotDiem="{ item }">
					<span v-if="item.LoaiCotDiem === 'TD'">Tự động</span>
					<span v-else-if="item.LoaiCotDiem === 'NL'">Nhập liệu</span>
					<span v-else-if="item.LoaiCotDiem === 'HS'">Hằng số</span>
					<span v-if="item.LoaiCotDiem === 'CT'">Công thức</span>
				</template>
				<template v-slot:item.LoaiDuLieu="{ item }">
					<span v-if="item.LoaiDuLieu === 'TEXT'">Văn bản</span>
					<span v-else-if="item.LoaiDuLieu === 'NUM'">Số</span>
				</template>
				<template v-slot:item.Is_HienThi="{ item }">
					<v-icon v-if="item.Is_HienThi === 0" color="red">mdi-eye-off-outline</v-icon>
				</template>
				<template v-slot:item.Action>
					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn icon="mdi-dots-horizontal" variant="text" v-bind="props"></v-btn>
						</template>
						<v-list>
							<v-list-item @click="onOpenModalEditCauHinhCotDiem()">
								<v-list-item-title>
									<v-icon color="green darken-2" small class="mr-2">
										mdi-square-edit-outline
									</v-icon>
									Cập nhật</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onRedirectCauHinhCotDiem()">
								<v-list-item-title>
									<v-icon small class="mr-2">
										mdi-table-settings
									</v-icon>
									Cấu hình cột điểm
								</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onHandleDeleteMauBangDiem(item)">
								<v-list-item-title>
									<v-icon color="red darken-3" small class="mr-2">
										mdi-trash-can-outline
									</v-icon>
									Xóa
								</v-list-item-title>
							</v-list-item>
						</v-list>
					</v-menu>
				</template>
			</v-data-table>
		</v-card>
		<uc-modal-add-cau-hinh-cot-diem v-model:isOpen="isShowModalAddCauHinhCotDiem" />
		<uc-modal-edit-cau-hinh-cot-diem v-model:isOpen="isShowModalEditCauHinhCotDiem" />
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		return {
			search: '',
			isShowModalAddCauHinhCotDiem: false,
			isShowModalEditCauHinhCotDiem: false,
			headers: [
				{
					title: '#',
					key: 'ThuTu',
					align: 'center',
					sortable: false
				},
				{
					title: 'Thao tác',
					key: 'Action',
					align: 'center',
					sortable: false

				},
				{
					title: 'Hiển thị',
					key: 'Is_HienThi',
					align: 'center',
					sortable: false
				},
				{
					title: 'Loại',
					key: 'LoaiCotDiem',
					align: 'center',
					sortable: false
				},
				{
					title: 'Dữ liệu',
					key: 'LoaiDuLieu',
					align: 'center',
					sortable: false
				},
				{
					title: 'ID hệ thống',
					key: 'ID_HeThong',
					sortable: false

				},
				{
					title: 'Mã cột điểm',
					key: 'MaCotDiem',
					sortable: false
				},
				{
					title: 'Tên cột điểm',
					key: 'TenCotDiem',
					sortable: false
				},
				{
					title: 'Công thức',
					key: 'CongThuc',
					sortable: false
				},
			],
			TBCauHinhCotDiem: [
				{
					ThuTu: 1,
					Is_HienThi: 0,
					LoaiCotDiem: 'TD',
					LoaiDuLieu: 'TEXT',
					ID_HeThong: 'cotdiem_1',
					MaCotDiem: 'cotdiem_1',
					TenCotDiem: 'Cột điểm 1',
					CongThuc: '1+1'
				}
			]
		}
	},
	mounted() { },
	computed: {},
	watch: {},
	methods: {
		onOpenModalAddCauHinhCotDiem() {
			this.isShowModalAddCauHinhCotDiem = true
		},
		onOpenModalEditCauHinhCotDiem() {
			this.isShowModalEditCauHinhCotDiem = true
		},
		onHandleDeleteCauHinhCotDiem() { },
	},
}
</script>