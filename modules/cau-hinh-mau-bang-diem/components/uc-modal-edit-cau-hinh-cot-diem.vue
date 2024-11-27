<template>
    <div>
        <v-dialog v-model="isOpen" max-width="1400">
            <v-card>
                <template #title>
                    <div class="d-flex justify-space-between w-100">
                        Cập nhật nhóm cột điểm {{ recordNhomCotDiem_Obj.TenNhomCotDiem_VI }}
                        <v-icon @click="onHandleCloseModal()">mdi-close</v-icon>
                    </div>
                </template>
                <v-card-text>
                    <!-- <v-row>
                        <v-col cols="5">
                            <v-tabs v-model="tab" density="compact">
                                <v-tab value="bien-he-thong">Biến hệ thống</v-tab>
                                <v-tab value="ham">Hàm</v-tab>
                            </v-tabs>
                            <v-tabs-window v-model="tab">
                                <v-tabs-window-item value="bien-he-thong"
                                    style="height: 400px;overflow-y:  auto; scrollbar-width: thin;">
                                    <v-expansion-panels variant="accordion" class="mt-1" flat>
                                        <v-expansion-panel v-for="i in 5" :key="i">
                                            <template #title>
                                                Phân loại {{ i }}
                                            </template>
                                            <template #text>
                                                <v-list lines="two" density="compact">
                                                    <v-list-item v-for="n in 3" :key="n">
                                                        <template #title>
                                                            <div class=" w-100 d-flex justify-space-between">
                                                                <span>Biến {{ n }}</span>
                                                                <v-icon size="18"
                                                                    @click="onCopy(n)">mdi-content-copy</v-icon>
                                                            </div>
                                                        </template>
                                                        <template #subtitle>
                                                            <span>Mô tả {{ n }}</span>
                                                        </template>
                                                    </v-list-item>
                                                </v-list>
                                            </template>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-tabs-window-item>
                                <v-tabs-window-item value="ham"
                                    style="height: 400px;overflow-y:  auto; scrollbar-width: thin;">
                                    <v-expansion-panels variant="accordion" class="mt-1" flat>
                                        <v-expansion-panel v-for="i in 5" :key="i">
                                            <template #title>
                                                Phân loại {{ i }}
                                            </template>
                                            <template #text>
                                                <v-list lines="two">
                                                    <v-list-item v-for="n in 3" :key="n" :title="'Item ' + n"
                                                        subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"></v-list-item>
                                                </v-list>
                                            </template>
                                        </v-expansion-panel>

                                    </v-expansion-panels>
                                </v-tabs-window-item>
                            </v-tabs-window>
                        </v-col>

                        <v-col cols="7">
                            <v-form>
                                <v-row>
                                    <v-col cols="3">
                                        <v-text-field v-model="recordCotDiem.ThuTuCotDiem"
                                            label="Thứ tự"></v-text-field>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select v-model="recordCotDiem.GiaTriCotDiem" label="Giá trị cột điểm"
                                            :items="DSLoaiDuLieu" item-title="TenLoaiDuLieu" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select v-model="recordCotDiem.LoaiCotDiem" label="Loại cột điểm"
                                            :items="DSLoaiCotDiem" item-title="TenLoaiCotDiem" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select v-model="recordCotDiem.IsVisibleToParents" label="Hiển thị"
                                            :items="DSHienThi" item-title="TenHienThi" item-value="Id"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="recordCotDiem.IDHeThong"
                                            label="ID hệ thống"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field v-model="recordCotDiem.MaCotDiem"
                                            label="Mã cột điểm"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field v-model="recordCotDiem.TenHienThi_VI"
                                            label="Tên hiển thị"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="recordCotDiem.MotaCotDiem_VI" label="Mô tả"
                                            rows="2"></v-textarea>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="recordCotDiem.Formula" label="Công thức"
                                            rows="5"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-col>
                    </v-row> -->
                    <v-row>
                        <v-col cols="2">
                            <v-text-field label="Thứ tự nhóm" v-model="recordNhomCotDiem_Obj.ThuTuNhom"></v-text-field>
                        </v-col>
                        <v-col cols="2">
                            <v-text-field label="Mã nhóm cột điểm"
                                v-model="recordNhomCotDiem_Obj.MaNhomCotDiem"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Tên nhóm cột điểm (VI)"
                                v-model="recordNhomCotDiem_Obj.TenNhomCotDiem_VI"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Tên nhóm cột điểm (EN)"
                                v-model="recordNhomCotDiem_Obj.TenNhomCotDiem_EN"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-card flat class="mt-3">
                        <template #title>
                            <div class="d-flex justify-space-between align-center w-100">
                                <span>Các cột điểm</span>
                                <v-btn color="success" @click="onHandleAddCotDiem()"><v-icon> mdi-plus</v-icon>Thêm cột
                                    điểm</v-btn>
                            </div>
                        </template>
                        <v-data-table-virtual height="500" :headers="headers" :items="DSCotDiem" fixed-header
                            density="comfortable" hide-default-footer class="mt-2">
                            <template #item.TenCotDiem="{ item }">
                                <b>{{ item.TenCotDiem_VI }}<i v-if="item.TenCotDiem_EN !== ''"> - {{
                                    item.TenCotDiem_EN
                                        }}</i></b>
                            </template>
                            <template #item.LoaiCotDiem="{ item }">
                                <v-chip label :color="getColorChipLoaiCotDiem(item.LoaiCotDiem)">{{ item.LoaiCotDiem
                                    }}</v-chip>
                            </template>
                            <template #item.GiaTriCotDiem="{ item }">
                                <v-chip :color="getColorChipGiaTriCotDiem(item.GiaTriCotDiem)"
                                    v-if="item.GiaTriCotDiem === 'text'">Nhận xét</v-chip>
                                <v-chip :color="getColorChipGiaTriCotDiem(item.GiaTriCotDiem)"
                                    v-if="item.GiaTriCotDiem === 'ICO_Star'"><v-icon>mdi-star</v-icon></v-chip>
                                <v-chip :color="getColorChipGiaTriCotDiem(item.GiaTriCotDiem)"
                                    v-else-if="item.GiaTriCotDiem === 'number'">Số</v-chip>
                            </template>
                            <template v-slot:item.Action="{ item }">
                                <div class="d-flex">
                                    <v-icon @click="onHandleEditCotDiem(item)" color="success" small class="mr-2">
                                        mdi-square-edit-outline
                                    </v-icon>
                                    <v-icon @click="onHandleDeleteCotDiem(item)" color="red darken-3" small
                                        class="mr-2">
                                        mdi-trash-can-outline
                                    </v-icon>

                                </div>

                            </template>
                        </v-data-table-virtual>
                    </v-card>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModal()"></v-btn>
                    <v-btn text="Cập nhật" @click="onHandleEdit()" color="green"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="isShowModalAddCotDiem" max-width="400px">
            <v-card>
                <template #title>
                    <div class="d-flex justify-space-between w-100">
                        Thêm cột điểm
                        <v-icon @click="onHandleCloseModalAddCotDiem()">mdi-close</v-icon>
                    </div>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="soCotDiem" label="Số cột điểm" variant="outlined"></v-text-field>
                        </v-col>
                    </v-row>
                    <!-- <v-row dense>
                        <v-col cols="6" v-for="(item, index) in 3">
                            <v-row dense>
                                <v-col cols="12">
                                    <b> Cột điểm {{ index + 1 }}</b>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field label="Mã CĐ" density="compact"></v-text-field>
                                </v-col>
                                <v-col cols="5">
                                    <v-text-field label="Tên CĐ (VI)" density="compact"></v-text-field>
                                </v-col>
                                <v-col cols="5">
                                    <v-text-field label="Tên CĐ (EN)" density="compact"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field label="Loại CĐ" density="compact"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field label="Giá trị CĐ" density="compact"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field label="ID hệ thống" density="compact"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>

                    </v-row> -->
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModalAddCotDiem()"></v-btn>
                    <v-btn text="Xác nhận" color="success" @click="onSubmitSoCotDiem()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="isShowModalEditCotDiem" max-width="800px">
            <v-card>
                <template #title>
                    <div class="d-flex justify-space-between w-100">
                        Cập nhật cột điểm {{ titleEditCotDiem }}
                        <v-icon @click="onHandleCloseModalEditCotDiem()">mdi-close</v-icon>
                    </div>
                </template>
                <v-card-text>
                    <v-row>
                        <v-col cols="3">
                            <v-text-field label="Thứ tự CĐ" v-model="recordCotDiem.ThuTuCotDiem"
                                :rules="rules.ThuTuCotDDiem" density="compact">
                            </v-text-field>
                        </v-col>
                        <v-col cols="9">

                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Mã CĐ" v-model="recordCotDiem.MaCotDiem"
                                density="compact"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Tên CĐ (VI)" v-model="recordCotDiem.TenCotDiem_VI"
                                density="compact"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="Tên CĐ (EN)" v-model="recordCotDiem.TenCotDiem_EN"
                                density="compact"></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-select v-model="recordCotDiem.LoaiCotDiem" label="Loại cột điểm" :items="DSLoaiCotDiem"
                                item-title="TenLoaiCotDiem" item-value="value" variant="outlined" density="compact" />
                        </v-col>
                        <v-col cols="4">
                            <v-select v-model="recordCotDiem.GiaTriCotDiem" label="Giá trị cột điểm"
                                :items="DSLoaiDuLieu" item-title="TenLoaiDuLieu" item-value="value" variant="outlined"
                                density="compact" />
                        </v-col>
                        <v-col cols="4">
                            <v-text-field label="ID hệ thống" v-model="recordCotDiem.IDHeThong"
                                density="compact"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea label="Công thức" v-model="recordCotDiem.Formula"
                                density="compact"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModalEditCotDiem()"></v-btn>
                    <v-btn text="Xác nhận" color="success" @click="onSubmitEditCotDiem()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: ['isOpen', 'recordNhomCotDiem'],
    emits: ['update:isOpen', 'onFinish'],
    data() {
        return {
            isShowModalAddCotDiem: false,
            isShowModalEditCotDiem: false,
            tab: '',
            recordCotDiem: {},
            DSLoaiDuLieu: [
                {
                    value: 'number',
                    TenLoaiDuLieu: 'Số'
                },
                {
                    value: 'text',
                    TenLoaiDuLieu: 'Nhận xét'
                },
                {
                    value: 'ECO_Star',
                    TenLoaiDuLieu: 'Ngôi sao'
                }
            ],
            DSLoaiCotDiem: [
                {
                    value: 'Công thức',
                    TenLoaiCotDiem: 'Công thức'
                },
                {
                    value: 'Nhập',
                    TenLoaiCotDiem: 'Nhập liệu'
                }, {
                    value: 'Hằng số',
                    TenLoaiCotDiem: 'Hằng số'
                },
                {
                    value: 'Tự động',
                    TenLoaiCotDiem: 'Tự động'
                }
            ],
            DSHienThi: [
                {
                    Id: 0,
                    TenHienThi: 'Không'
                },
                {
                    Id: 1,
                    TenHienThi: 'Có'
                },
            ],
            headers: [
                {
                    title: "#",
                    key: "ThuTuCotDiem",
                    minWidth: 100,
                    align: 'center',
                    sortable: false
                },
                {
                    title: "Mã CĐ",
                    key: "MaCotDiem",
                    minWidth: 150,
                    sortable: false
                },
                {
                    title: 'Tên CĐ',
                    key: 'TenCotDiem',
                    sortable: false,
                    minWidth: 200
                },
                {
                    title: "Loại CĐ",
                    key: "LoaiCotDiem",
                    minWidth: 100,
                    sortable: false
                },
                {
                    title: "Giá trị CĐ",
                    key: "GiaTriCotDiem",
                    minWidth: 150,
                    sortable: false
                },
                {
                    title: "ID hệ thống",
                    key: "IDHeThong",
                    minWidth: 150,
                    sortable: false
                },
                {
                    title: "Công thức",
                    key: "Formula",
                    sortable: false,
                    minWidth: 550,
                },
                {
                    title: '',
                    key: 'Action',
                    align: 'center',
                    sortable: false,
                    minWidth: 50,
                    right: 0,
                    lastFixed: true,

                },
            ],
            recordNhomCotDiem_Obj: {},
            soCotDiem: null,
            DSCotDiem: [],
            titleEditCotDiem: '',
            rules: {
                ThuTuCotDiem: [
                    v => !!v || 'Vui lòng nhập thứ tự cột điểm',
                ],

            }

        }
    },
    mounted() { },
    computed: {

    },
    watch: {
        isOpen: function (val) {
            if (val) {
                console.log('this.recordNhomCotDiem', this.recordNhomCotDiem)
                let receiveDSCotDiem = _.cloneDeep(this.recordNhomCotDiem)
                //Lấy ra những thuộc tính không phải là mảng
                let objNhomCotDiem = Object.entries(receiveDSCotDiem).reduce((result, [key, value]) => {
                    if (!Array.isArray(receiveDSCotDiem[key])) {
                        result[key] = value
                    }
                    return result
                }, {})
                console.log('objNhomCotDiem', objNhomCotDiem)
                this.recordNhomCotDiem_Obj = _.cloneDeep(objNhomCotDiem)
                // Đảm bảo số lượng phần tử không vượt quá mảng nhỏ nhất
                const minLengthOf_receiveDSCotDiem = this.getMinArrayLength(receiveDSCotDiem)
                //_.range(minLengthOf_receiveDSCotDiem) để vòng lặp từ 0 đến minLengthOf_receiveDSCotDiem -1
                let handleDSCotDiem = _.range(minLengthOf_receiveDSCotDiem).map(index => {
                    return {
                        ...receiveDSCotDiem.MaCotDiem[index],
                    }
                })
                this.DSCotDiem = handleDSCotDiem
            }
        },
        isShowModalEditCotDiem: function (val) {
            if (val) {
                this.titleEditCotDiem = this.recordCotDiem?.TenCotDiem_VI
            }
        }
    },
    methods: {
        onHandleCloseModal() {
            this.$emit('update:isOpen', false)
        },
        async onHandleEdit() {
            const { IsSuccess } = await TemplateBangDiemChiTiet_Service.Upd(params)
            if (IsSuccess) {
                Vue.$toast.success('Cập nhật cột điểm thành công!', { position: 'top' })
                this.$emit('onFinish')
                this.onHandleCloseModal()
            }
        },
        onCopy(text) {
            navigator.clipboard.writeText(text)
            Vue.$toast.info('Đã sao chép ' + text, { position: 'top' })
        },
        getMinArrayLength(obj) {
            // Lọc và lấy các độ dài của các thuộc tính là mảng
            const lengths = Object.values(obj)
                .filter(Array.isArray)
                .map(arr => arr.length);
            // Nếu có mảng, tìm độ dài nhỏ nhất; ngược lại trả về null
            return lengths.length > 0 ? Math.min(...lengths) : null;
        },
        onHandleAddCotDiem() {
            this.isShowModalAddCotDiem = true
        },
        onHandleEditCotDiem(item) {
            this.isShowModalEditCotDiem = true
            this.recordCotDiem = _.cloneDeep(item)
            console.log('item', item)
        },
        onHandleDeleteCotDiem() { },
        onHandleCloseModalAddCotDiem() {
            this.isShowModalAddCotDiem = false
            this.soCotDiem = null
        },
        onSubmitSoCotDiem() {
            for (let i = 0; i < this.soCotDiem; i++) {
                let obj = {}
                obj = {
                    ...this.DSCotDiem[0],
                    ThuTuCotDiem: null,
                    MaCotDiem: '',
                    TenCotDiem_VI: '',
                    TenCotDiem_EN: '',
                    LoaiCotDiem: 'Nhập',
                    GiaTriCotDiem: 'number',
                    IDHeThong: '',
                    Formula: ''
                }
                this.DSCotDiem.push(obj)
            }
            Vue.$toast.success('Thêm cột điểm thành công!', { position: 'top' })
            this.onHandleCloseModalAddCotDiem()
        },
        onHandleCloseModalEditCotDiem() {
            this.isShowModalEditCotDiem = false
        },
        async onSubmitEditCotDiem() {
            const $this = this
            const { IsSuccess } = await TemplateBangDiemChiTiet_Service.Upd({
                ...$this.recordCotDiem,
            })
            if (IsSuccess) {
                $this.onHandleCloseModalEditCotDiem()
                // $this.onHandleCloseModal()
                $this.$emit('onFinish')
                Vue.$toast.success('Cập nhật cột điểm thành công!', { position: 'top' })
            }
        },
        getColorChipLoaiCotDiem: getColorChipLoaiCotDiem,
        getColorChipGiaTriCotDiem: getColorChipGiaTriCotDiem
    },
}
</script>
</script>