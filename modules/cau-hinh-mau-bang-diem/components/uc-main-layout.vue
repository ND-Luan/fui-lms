<template>
    <div>
        <v-card flat border>
            <v-card-title class="d-flex align-center justify-center pe-2">
                Mẫu bảng điểm
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="searchInput"
                    :loading="loading"
                    append-inner-icon="mdi-magnify"
                    density="compact"
                    variant="outlined"
                    hide-details
                    single-line
                    @click:append-inner="onSearch()"
                    placeholder="Tìm kiếm..."
                    style="max-width: 300px"
                />
                <v-btn class="ms-2" color="success" @click="onOpenModalAddMauBangDiem()"> <v-icon>mdi-plus</v-icon> Thêm mẫu bảng điểm </v-btn>
            </v-card-title>

            <v-data-table :items="TBMauBangDiemFilter" :headers="headers" density="compact">
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
                                    Cập nhật</v-list-item-title
                                >
                            </v-list-item>
                            <v-list-item @click="onOpenModalCHCotDiem(item)">
                                <v-list-item-title>
                                    <v-icon small class="mr-2"> mdi-table-settings </v-icon>
                                    Cấu hình cột điểm
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
        <uc-modal-edit-mau-bang-diem v-model:isOpen="isShowModalEditMauBangDiem" :recordMauBangDiem @onFinish="loadDSMauBangDiem" />
        <uc-modal-copy-cot-diem v-model:isOpen="isShowModalCopyCotDiem" :recordMauBangDiem @onFinish="loadDSMauBangDiem" :TBMauBangDiem="TBMauBangDiem" />
    </div>
</template>

<script>
export default {
    props: [],
    data() {
        return {
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
                    title: 'Người tạo',
                    key: 'CreateUser',
                    sortable: false,
                },
                {
                    title: 'Tổng cột điểm',
                    key: 'TongCotDiem',
                    align: 'center',
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
    computed: {
        TBMauBangDiemFilter: function () {
            return this.TBMauBangDiem.filter((x) => x.TemplateBangDiemName.toLowerCase().includes(this.searchInput.toLowerCase()))
        },
    },
    watch: {},
    methods: {
        async loadDSMauBangDiem() {
            const res = await TemplateBangDiem_Service.Get({
                TemplateBangDiemID: 0,
            })
            console.log(res)
            if (res.IsSuccess) {
                this.TBMauBangDiem = res.Result
            }
        },
        onOpenModalAddMauBangDiem() {
            this.isShowModalAddMauBangDiem = true
        },
        onOpenModalEditMauBangDiem(record) {
            this.recordMauBangDiem = _.cloneDeep(record)
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
            this.recordMauBangDiem = _.cloneDeep(record)
            this.isShowModalCHCotDiem = true
        },
        onSearch() {
            console.log('hello')
        },
        onOpenModalCopyCotDiem(record) {
            this.recordMauBangDiem = _.cloneDeep(record)
            this.isShowModalCopyCotDiem = true
        },
    },
}
</script>