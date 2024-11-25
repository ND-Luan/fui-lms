<template>
    <div>
        <v-dialog v-model="isOpen" max-width="1200">
            <v-card>
                <template #title>
                    <div class="d-flex justify-space-between">
                        Thêm cột điểm
                        <v-icon @click="onHandleCloseModal()">mdi-close</v-icon>
                    </div>
                </template>
                <v-card-text>
                    <v-row style="">
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
                                        <!-- <v-number-input :reverse="false" control-variant="default" label="Thứ tự"
                                            :hideInput="false" :inset="false" variant="outlined"></v-number-input> -->
                                        <v-text-field label="Thứ tự"></v-text-field>
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select label="Dữ liệu" :items="DSLoaiDuLieu" item-title="TenLoaiDuLieu"
                                            item-value="Id" variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select label="Loại biến" :items="DSLoaiBien" item-title="TenLoaiBien"
                                            item-value="Id" variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-select label="Hiển thị" :items="DSHienThi" item-title="TenHienThi"
                                            item-value="Id" variant="outlined" density="compact" />
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field label="ID hệ thống"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field label="Mã thuộc tính"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Tên hiển thị"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea label="Mô tả" rows="2"></v-textarea>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-textarea label="Công thức" rows="5"></v-textarea>
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
    props: ['isOpen'],
    emits: ['update:isOpen'],
    data() {
        return {
            tab: '',
            DSLoaiDuLieu: [
                {
                    Id: 1,
                    TenLoaiDuLieu: 'Số'
                },
                {
                    Id: 2,
                    TenLoaiDuLieu: 'Văn bản'
                }
            ],
            DSLoaiBien: [
                {
                    Id: 'CT',
                    TenLoaiBien: 'Công thức'
                },
                {
                    Id: 'NL',
                    TenLoaiBien: 'Nhập liệu'
                }, {
                    Id: 'HS',
                    TenLoaiBien: 'Hằng số'
                },
                {
                    Id: 'TD',
                    TenLoaiBien: 'Tự động'
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
            ]
        }
    },
    mounted() { },
    computed: {},
    watch: {},
    methods: {
        onHandleCloseModal() {
            this.$emit('update:isOpen', false)
        },
        onHandleAdd() {
            Vue.$toast.success('Thêm điểm thành công!', { position: 'top' })
            this.onHandleCloseModal()
        },
        onCopy(text) {
            navigator.clipboard.writeText(text)
            Vue.$toast.info('Đã sao chép ' + text, { position: 'top' })
        },
    },
}
</script>
</script>