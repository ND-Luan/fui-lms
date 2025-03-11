<template>
    <uc-dialog v-model="modelValue.isShowDialogReject" title="Từ chối" doneText="Từ chối" @onSubmit="onSubmit">
        <v-form ref="form">
            <v-row>
                <v-col cols="12">
                    <v-select v-model="form.MaNhomCotDiem" label="Chọn nhóm cột điểm" :items="dsMaNhomCotDiem_MonHoc"
                        item-value="MaNhomCotDiem" item-title="TenNhomCotDiem_VI"
                        :rules="[(v) => !!v || 'Bạn chưa chọn nhóm cột điểm']"></v-select>
                </v-col>
                <v-col cols="12">
                    <v-textarea v-model="form.ReasonReject" label="Lý do từ chối"></v-textarea>
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
                ReasonReject: null
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
                title: "Bạn có chắc chắn muốn từ chối không?",
                action: function () {
                    ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                        MonHocLopID: $this.monHocItem.MonHocLopID,
                        LopID: vueData.LopItem.LopID,
                        TinhTrang: 3,
                        MaNhomCotDiem: $this.form.MaNhomCotDiem,
                        IsSendToManager: 0,
                        ReasonReject_GV: $this.form.ReasonReject
                    }, (res) => {
                        $this.$emit('update:modelValue', { ...this.modelValue, isShowDialogReject: false })
                        $this.$emit('onFinishDialog')
                    })
                }
            })
        }
    }
}
</script>