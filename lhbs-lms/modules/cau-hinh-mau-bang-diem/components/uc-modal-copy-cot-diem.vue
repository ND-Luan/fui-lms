<template>
    <div>
        <v-dialog v-model="isOpen" max-width="500">
            <v-card>
                <template #title>
                    <span>Sao chép cấu trúc điểm {{ recordMauBangDiem.TemplateBangDiemName }}</span>
                </template>
                <v-card-text>
                    <v-form>
                        <v-row>
                            <v-col cols="12">
                                <v-select v-model="formData.TemplateBangDiemID_Src" label="Chọn cấu trúc sao chép"
                                    :items="TBMauBangDiem" item-title="TemplateBangDiemName"
                                    placeholder="Chọn cấu trúc sao chép" item-value="TemplateBangDiemID"
                                    variant="outlined" density="compact"></v-select>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Đóng" @click="onHandleCloseModal()"></v-btn>
                    <v-btn color="success" variant="outlined" text="Sao chép" @click="onHandleAdd()"></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
export default {
    props: ['isOpen', 'TBMauBangDiem', 'recordMauBangDiem'],
    emits: ['update:isOpen', 'onFinish'],
    data() {
        return {
            formData: {
                TemplateBangDiemID_Src: null,
                TemplateBangDiemID_Des: null
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
            let params = { ...this.formData, TemplateBangDiemID_Des: this.recordMauBangDiem.TemplateBangDiemID }
            const { IsSuccess } = await TemplateBangDiemChiTiet_Service.Copy(params)
            if (IsSuccess) {
                Vue.$toast.success('Sao chép cấu trúc thành công!', { position: 'top' })
                this.$emit('onFinish')
                this.onHandleCloseModal()

            }

        }
    },
}
</script>