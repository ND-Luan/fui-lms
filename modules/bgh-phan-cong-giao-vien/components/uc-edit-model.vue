<template>
    <uc-dialog v-model="modelValue.IsEditDialog" width="638" @onSubmit="updGiaoVienLop_Upd()" doneText="Lưu">
        <template v-slot:title>
            <div>
                Cập nhật
                <v-chip v-if="KhoiID" class="ml-1" color="primary">{{ renderTextKhoi(KhoiID) }}</v-chip>
                <v-chip v-if="LopID && EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1" class="ml-1" color="primary"> {{ renderTextLop(LopID) }}</v-chip>
            </div>
        </template>

        <v-form ref="EditItem">
            <v-row>
                <v-col cols="12">
                    <v-select v-model="EditItem.MaDonVi" label="Chọn đơn vị" :items="DSDonVi" item-title="TenDonVi" item-value="MaDonVi" outlined dense hide-details></v-select>
                </v-col>
                <v-col cols="12">
                    <v-select v-model="EditItem.VaiTro" label="Chọn vai trò" :items="DSVaiTro" item-title="TenVaiTro" item-value="VaiTro" outlined dense hide-details></v-select>
                </v-col>
                <v-col :cols="EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1 ? 6 : 12">
                    <v-autocomplete
                        v-model="EditItem.GiaoVienID"
                        label="Chọn giáo viên"
                        :items="DSGiaoVien"
                        :item-title="renderTextGiangVien"
                        item-value="GiaoVienID"
                        outlined
                        dense
                        hide-details="auto"
                        :rules="[(v) => !!v || 'Bạn chưa chọn giáo viên']"
                        disabled
                    ></v-autocomplete>
                </v-col>
                <v-col cols="6" v-if="EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1">
                    <v-select
                        v-model="EditItem.MonHocID"
                        label="Chọn môn học"
                        :items="DSMonHoc"
                        item-title="MonHocName"
                        item-value="MonHocID"
                        outlined
                        dense
                        hide-details="auto"
                        :rules="[(v) => !!v || 'Bạn chưa chọn môn học']"
                    >
                    </v-select>
                </v-col>
            </v-row>
        </v-form>
    </uc-dialog>
</template>

<script>
export default {
    props: ['EditData', 'modelValue', 'dskhoi', 'dslop', 'KhoiID', 'LopID', 'dsvaitro', 'dsgiaovien', 'dsmonhoc', 'onSubmitDialog', 'dsdonvi'],
    data() {
        return {
            EditItem: {
                KhoiID: null,
                LopID: null,
                GiaoVienID: null,
                VaiTro: null,
                MonHocID: null,
                MaDonVi: null,
            },
        }
    },
    mounted() {},
    computed: {
        DSKhoi: function () {
            return this.dskhoi
        },
        DSLop: function () {
            return this.dslop
        },
        DSVaiTro: function () {
            return this.dsvaitro
        },
        DSGiaoVien: function () {
            return this.dsgiaovien
        },
        DSMonHoc: function () {
            return this.dsmonhoc
        },
        DSDonVi: function () {
            return this.dsdonvi
        },
    },
    watch: {
        'modelValue.IsEditDialog': function (val) {
            if (val) {
                this.EditItem = { ...this.EditData }
                console.log('this.EditItem', this.EditItem)
            }
        },
    },
    methods: {
        async updGiaoVienLop_Upd() {
            let monHocID = null
            let lopID = this.EditItem.LopID
            let vaiTroID = this.EditItem.VaiTro
            //Khối trưởng và giáo viên lớp
            if (vaiTroID === 1 || vaiTroID === 2) monHocID = 0
            else monHocID = this.EditItem.MonHocID
            if (vaiTroID === 2) lopID = 0
            const form = this.$refs.EditItem

            const param = {
                GVLopID: this.EditItem.GVLopID,
                KhoiID: this.EditItem.KhoiID,
                LopID: lopID,
                GiaoVienID: this.EditItem.GiaoVienID,
                VaiTro: this.EditItem.VaiTro,
                MaDonVi: this.EditItem.MaDonVi,
                MonHocID: monHocID,
            }

            console.log('param', param)

            const isUpdate = await GiaoVien_Service.GiaoVienLop_Upd(param)
            if (isUpdate) {
                const vaiTro = this.DSVaiTro.find((x) => x.VaiTro === this.EditItem.VaiTro)
                const lop = this.DSLop.find((x) => x.LopID === this.LopID)
                Toast.success({ text: `Cập nhật ${vaiTro.TenVaiTro} của lớp ${lop.TenLop}` })
                this.$emit('onSubmitDialog', true)
                this.modelValue.IsEditDialog = false
            }
        },
        renderTextKhoi(KhoiID) {
            const obj = this.DSKhoi.find((x) => parseInt(x.KhoiID) === parseInt(KhoiID))
            return obj ? obj.TenKhoi : ''
        },
        renderTextLop(LopID) {
            const obj = this.DSLop.find((x) => x.LopID === LopID)
            return obj ? obj.TenLop : ''
        },
        renderTextGiangVien(obj) {
            return `[${obj.GiaoVienID}] - ${obj.HoGV} ${obj.TenGV}`
        },
    },
}
</script>
