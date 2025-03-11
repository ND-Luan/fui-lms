<template>
    <uc-dialog v-model="modelValue.isShowDialogApprove" title="Gửi Ban Giám Hiệu" doneText="Xác nhận"
        @onSubmit="onSubmit">
        <v-form ref="form">
            <v-row>
                <v-col cols="12">
                    <v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm cột điểm" :items="dsMaNhomCotDiem_MonHoc"
                        item-value="MaNhomCotDiem" item-title="TenNhomCotDiem_VI"
                        :rules="[(v) => !!v || 'Bạn chưa chọn nhóm cột điểm']">
                        <template v-slot:item="{ props: itemProps, item }">
                            <v-list-item v-bind="itemProps"
                                :disabled="item.raw.TinhTrang === 3 || item.raw.TinhTrang === 4"
                                :subtitle="item.raw.TenTrangThai"></v-list-item>
                        </template>
                    </v-select>
                </v-col>
            </v-row>
        </v-form>
    </uc-dialog>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Object,
        },
        monHocItem: {
            type: Object
        },
        dsMaNhomCotDiem_MonHoc: {
            type: Array
        },
        onFinishDialog: {
            type: Function
        }
    },
    data() {
        return {
            form: {
                MaNhomCotDiem: null,
            },
            vueData
        }
    },
    watch: {
        'modelValue.isShowDialogReject': function (isShow) {
            if (isShow) {
                console.log(this.monHocItem);
            }
        }
    },
    methods: {
        async onSubmit() {
            const $this = this
            const form = this.$refs.form
            const { valid } = await form.validate()
            if (!valid) return

            confirm({
                title: "Bạn có chắc chắn muốn gửi điểm cho BGH không?",
                action: function () {
                    ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                        MonHocLopID: $this.monHocItem.MonHocLopID,
                        LopID: vueData.LopItem.LopID,
                        TinhTrang: 4,
                        MaNhomCotDiem: $this.form.MaNhomCotDiem,
                        IsSendToManager: 1
                    }, (res) => {
                        $this.$emit('update:modelValue', { ...this.modelValue, isShowDialogApprove: false })
                        $this.$emit('onFinishDialog')
                    })
                }
            })
        }
    }
}
</script>