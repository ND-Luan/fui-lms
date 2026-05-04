<template>
	<div>
		<v-card flat border>
			<v-card-title class="d-flex align-center justify-center pe-2">
				Mẫu bảng điểm
				<v-spacer></v-spacer>
				<v-text-field v-model="searchInput" :loading="loading" append-inner-icon="mdi-magnify" density="compact"
					variant="outlined" hide-details single-line placeholder="Tìm kiếm..." style="max-width: 300px" />
				<v-btn class="ms-2" color="success" @click="onOpenModalAddMauBangDiem()">
					<v-icon>mdi-plus</v-icon>
					Thêm mẫu bảng điểm
				</v-btn>
			</v-card-title>

			<v-data-table :items="TBMauBangDiem" :headers="headers" :search="searchInput">
				<template v-slot:item.SoThuTu="{ item }" class="mt-1">
					<span>{{ TBMauBangDiem.indexOf(item) + 1 }}</span>
				</template>
				<template v-slot:item.TongCotDiem="{ item }">
					<v-chip variant="outlined" color="green">
						{{ item.SoCotDiem }}
					</v-chip>
				</template>
				<template v-slot:item.Action="{ item }">
					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn icon="mdi-dots-horizontal" variant="text" v-bind="props"></v-btn>
						</template>
						<v-list>
							<v-list-item @click="onOpenModalEditMauBangDiem(item)">
								<v-list-item-title>
									<v-icon color="green darken-2" small class="mr-2"> mdi-square-edit-outline </v-icon>
									Cập nhật</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onOpenModalCHCotDiem(item)">
								<v-list-item-title>
									<v-icon small class="mr-2"> mdi-table-settings </v-icon>
									Cấu hình cột điểmm
								</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onOpenModalCopyCotDiem(item)">
								<v-list-item-title>
									<v-icon small class="mr-2"> mdi-table-settings </v-icon>
									Sao chép cấu trúc điểm
								</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onHandleDeleteMauBangDiem(item)">
								<v-list-item-title>
									<v-icon color="red darken-3" small class="mr-2"> mdi-trash-can-outline </v-icon>
									Xóa
								</v-list-item-title>
							</v-list-item>
						</v-list>
					</v-menu>
				</template>
			</v-data-table>
		</v-card>
		<uc-modal-cau-hinh-cot-diem v-model:isOpen="isShowModalCHCotDiem" :recordMauBangDiem />
		<uc-modal-add-mau-bang-diem v-model:isOpen="isShowModalAddMauBangDiem" @onFinish="loadDSMauBangDiem" />
		<uc-modal-edit-mau-bang-diem v-model:isOpen="isShowModalEditMauBangDiem" :recordMauBangDiem
			@onFinish="loadDSMauBangDiem" />
		<uc-modal-copy-cot-diem v-model:isOpen="isShowModalCopyCotDiem" :recordMauBangDiem @onFinish="loadDSMauBangDiem"
			:TBMauBangDiem="TBMauBangDiem" />
	</div>
</template>

<script>
	export default {
	    props: [],
	    data() {
	        return {
	            vueData,
				keyComp:0,
	            searchInput: '',
	            isShowModalAddMauBangDiem: false,
	            isShowModalEditMauBangDiem: false,
	            isShowModalCHCotDiem: false,
	            isShowModalCopyCotDiem: false,
	            headers: [
	                {
	                    title: '#',
	                    key: 'SoThuTu',
	                    align: 'center',
	                    sortable: false,
	                },
	                {
	                    title: 'Tên mẫu bảng điểm',
	                    key: 'TemplateBangDiemName',
	                    sortable: false,
	                },
	                {
	                    title: 'Tổng cột điểm',
	                    key: 'TongCotDiem',
	                    align: 'center',
	                    sortable: false,
	                },
	                {
	                    title: 'Người tạo',
	                    key: 'CreateUser',
	                    sortable: false,
	                },
	
	                {
	                    title: 'Thao tác',
	                    key: 'Action',
	                    align: 'center',
	                    sortable: false,
	                },
	            ],
	            TBMauBangDiem: [],
	            recordMauBangDiem: {},
	            loading: false,
	        }
	    },
	    mounted() {
	        this.loadDSMauBangDiem()
	    },
	    watch: {},
	    methods: {
	        async loadDSMauBangDiem() {
	            const res = await TemplateBangDiem_Service.Get({
	                TemplateBangDiemID: 0,
	            })
	            if (res.IsSuccess) {
	                this.TBMauBangDiem = res.Result
					this.recordMauBangDiem={}
					this.keyComp++
	            }
	        },
	        onOpenModalAddMauBangDiem() {
	            this.isShowModalAddMauBangDiem = true
	        },
	        onOpenModalEditMauBangDiem(record) {
	            this.recordMauBangDiem = record
	            this.isShowModalEditMauBangDiem = true
	        },
	        onHandleDeleteMauBangDiem(record) {
	            Alert.confirm({
	                text: `Bạn có chắc muốn xóa mẫu bảng điểm ${record.TemplateBangDiemName}?`,
	            }).then(async (rs) => {
	                if (rs) {
	                    const res = await TemplateBangDiem_Service.Del({
	                        TemplateBangDiemID: record.TemplateBangDiemID,
	                    })
	                    if (res) {
	                        Vue.$toast.success('Xóa mẫu bảng điểm thành công!', { position: 'top' })
	                        this.loadDSMauBangDiem()
	                    }
	                }
	            })
	        },
	        onOpenModalCHCotDiem(record) {
	            this.recordMauBangDiem = record
	            this.isShowModalCHCotDiem = true
				vueData.TemplateBangDiemID = record.TemplateBangDiemID
	        },
	        onOpenModalCopyCotDiem(record) {
	            this.recordMauBangDiem = record
	            this.isShowModalCopyCotDiem = true
	        },
	    },
	}
</script>