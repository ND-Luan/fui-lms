<template>
    <div>
        <v-dialog v-model="isOpen" max-width="600">
            <v-card>
                <template #title>
                    Thêm mẫu bảng điểm
                </template>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <!-- <v-col cols="12">
                                <v-text-field label="Mã mẫu bảng điểm" variant="outlined"
                                    density="compact"></v-text-field>
                            </v-col> -->
                            <v-col cols="12">
                                <v-text-field v-model="formData.TemplateBangDiemName" label="Tên mẫu bảng điểm"
                                    variant="outlined" density="compact" />
                            </v-col>
                            <!-- <v-col cols="12">
                                <v-select label="Người chốt điểm" :items="DSNguoiChotDiem" item-title="TenNguoiChotDiem"
                                    item-value="NguoiChotDiem_Id" variant="outlined" density="compact"></v-select>
                            </v-col> -->
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModal()"></v-btn>
                    <v-btn color="success" text="Thêm" @click="onHandleAdd()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
export default {
    props: ['isOpen'],
    emits: ['update:isOpen', 'onFinish'],
    data() {
        return {
            formData: {
                TemplateBangDiemName: ''
            },
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
            let params = { ...this.formData }
            const { IsSuccess } = await TemplateBangDiem_Service.Ins(params)
            if (IsSuccess) {
                Vue.$toast.success('Thêm mẫu bảng điểm thành công!', { position: 'top' })
                this.$emit('onFinish')
                this.onHandleCloseModal()

            }

        }
    },
}
</script>