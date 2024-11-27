<template>
    <div>
        <v-dialog v-model="isOpen" max-width="1400">
            <v-card>
                <template #title>
                    <div class="d-flex justify-space-between">
                        Thêm cột điểm
                        <v-icon @click="onHandleCloseModal()">mdi-close</v-icon>
                    </div>
                </template>
                <v-card-text>
                    <v-row style="">
                        <v-col cols="3">
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
                        <v-col cols="9">
                            <v-form>
                                <v-row>
                                    <v-col cols="2">
                                        <v-text-field v-model="formData.ThuTuNhom"
                                            label="Thứ tự nhóm CĐ"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field v-model="formData.MaNhomCotDiem"
                                            label="Mã nhóm CĐ"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="formData.TenNhomCotDiem_VI"
                                            label="Tên nhóm CĐ (VI)"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="formData.TenNhomCotDiem_EN"
                                            label="Tên nhóm CĐ (EN)"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field v-model="formData.ThuTuCotDiem" label="Thứ tự CĐ"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field v-model="formData.MaCotDiem" label="Mã CĐ"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="formData.TenCotDiem_VI"
                                            label="Tên CĐ (VI)"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="formData.TenCotDiem_EN"
                                            label="Tên CĐ (EN)"></v-text-field>
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model="formData.IDHeThong" label="ID hệ thống"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="formData.LoaiCotDiem" label="Loại CĐ" :items="DSLoaiCotDiem"
                                            item-title="TenLoaiBien" item-value="value" variant="outlined"
                                            density="compact" />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="formData.GiaTriCotDiem" label="Giá trị CĐ"
                                            :items="DSLoaiDuLieu" item-title="TenLoaiDuLieu" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-text-field v-model="formData.LamTronBaoNhieuSo"
                                            label="Làm tròn"></v-text-field>
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="formData.IsVisibleToParents" label="Hiển thị"
                                            :items="DSHienThi" item-title="TenHienThi" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="4">
                                        <v-select v-model="formData.KieuDanhGiaID" label="Kiểu đánh giá"
                                            :items="DSKieuDanhGia" item-title="TenHienThi" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="formData.IsUserInput" label="Phụ huynh nhập"
                                            :items="DSUserInput" item-title="TenHienThi" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-select v-model="formData.IsSendToManager" label="Gửi cho người quản lý"
                                            :items="DSSendToManager" item-title="TenHienThi" item-value="value"
                                            variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="formData.MotaCotDiem_VI" label="Mô tả"
                                            rows="2"></v-textarea>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea v-model="formData.Formula" label="Công thức" rows="5"></v-textarea>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModal()"></v-btn>
                    <v-btn text="Thêm" @click="onHandleAdd()" color="green"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
export default {
    props: ['isOpen', 'recordMauBangDiem'],
    emits: ['update:isOpen', 'onFinish'],
    data() {
        return {
            tab: '',
            DSLoaiDuLieu: [
                {
                    value: 'number',
                    TenLoaiDuLieu: 'Số'
                },
                {
                    value: 'text',
                    TenLoaiDuLieu: 'Văn bản'
                }
            ],
            DSLoaiCotDiem: [
                {
                    value: 'Công thức',
                    TenLoaiBien: 'Công thức'
                },
                {
                    value: 'Nhập',
                    TenLoaiBien: 'Nhập liệu'
                }, {
                    value: 'Hằng số',
                    TenLoaiBien: 'Hằng số'
                },
                {
                    value: 'Tự động',
                    TenLoaiBien: 'Tự động'
                }
            ],
            DSHienThi: [
                {
                    value: false,
                    TenHienThi: 'Không'
                },
                {
                    value: true,
                    TenHienThi: 'Có'
                },
            ],
            DSKieuDanhGia: [
                {
                    value: 1,
                    TenHienThi: 'Kiểu đánh giá 1'
                },
                {
                    value: 2,
                    TenHienThi: 'Kiểu đánh giá 2'
                },
            ],
            DSUserInput: [
                {
                    value: false,
                    TenHienThi: 'Không'
                },
                {
                    value: true,
                    TenHienThi: 'Có'
                },
            ],
            DSSendToManager: [
                {
                    value: false,
                    TenHienThi: 'Không'
                },
                {
                    value: true,
                    TenHienThi: 'Có'
                },
            ],
            formData: {
                IDHeThong: '',
                MaCotDiem: '',
                TenCotDiem_VI: '',
                TenCotDiem_EN: '',
                TenHienThi_VI: '',
                TenHienThi_EN: '',
                MotaCotDiem_VI: '',
                MotaCotDiem_EN: '',
                LoaiCotDiem: 'Công thức',
                KieuDanhGiaID: null,
                GiaTriCotDiem: 'number',
                LamTronBaoNhieuSo: null,
                Formula: '',
                ThuTuCotDiem: null,
                MaNhomCotDiem: '',
                TenNhomCotDiem_VI: '',
                TenNhomCotDiem_EN: '',
                ThuTuNhom: null,
                IsUserInput: false,
                IsVisibleToParents: false,
                IsSendToManager: false,
            }
        }
    },
    mounted() { },
    computed: {},
    watch: {},
    methods: {
        onHandleCloseModal() {
            this.$emit('update:isOpen', false)
        },
        async onHandleAdd() {
            let params = { TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID, JsonData: JSON.stringify(this.formData) }
            const { IsSuccess } = await TemplateBangDiemChiTiet_Service.Ins(params)
            if (IsSuccess) {
                Vue.$toast.success('Thêm cột điểm thành công!', { position: 'top' })
                this.$emit('onFinish')
                this.onHandleCloseModal()
            }
        },
        onCopy(text) {
            navigator.clipboard.writeText(text)
            Vue.$toast.info('Đã sao chép ' + text, { position: 'top' })
        },
    },
}
</script>
</script>