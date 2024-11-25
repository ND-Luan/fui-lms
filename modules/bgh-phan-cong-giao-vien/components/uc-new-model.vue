<template>
    <uc-dialog v-model="modelValue.IsNewDialog" width="638" @onSubmit="insGiaoVienLop_Ins()" doneText="Lưu">
        <template v-slot:title>
            <div>
                Thêm mới
                <v-chip v-if="KhoiID" class="ml-1" color="primary">{{ renderTextKhoi(KhoiID) }}</v-chip>
                <v-chip v-if="LopID && NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1" class="ml-1" color="primary"> {{ renderTextLop(LopID) }}</v-chip>
            </div>
        </template>

        <v-form ref="NewItem">
            <v-row>
                <v-col cols="12">
                    <v-select v-model="NewItem.MaDonVi" label="Chọn đơn vị" :items="DSDonVi" item-title="TenDonVi" item-value="MaDonVi" outlined dense hide-details></v-select>
                </v-col>
                <v-col cols="12">
                    <v-select v-model="NewItem.VaiTro" label="Chọn vai trò" :items="DSVaiTro" item-title="TenVaiTro" item-value="VaiTro" outlined dense hide-details></v-select>
                </v-col>
                <v-col :cols="NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1 ? 6 : 12">
                    <v-autocomplete
                        v-model="NewItem.GiaoVienID"
                        label="Chọn giáo viên"
                        :items="DSGiaoVien"
                        :item-title="renderTextGiangVien"
                        item-value="GiaoVienID"
                        outlined
                        dense
                        hide-details="auto"
                        :rules="[(v) => !!v || 'Bạn chưa chọn giáo viên']"
                    ></v-autocomplete>
                </v-col>
                <v-col cols="6" v-if="NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1">
                    <v-select
                        v-model="NewItem.MonHocID"
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
    props: ['modelValue', 'dskhoi', 'dslop', 'KhoiID', 'LopID', 'dsvaitro', 'dsgiaovien', 'dsmonhoc', 'onSubmitDialog', 'dsdonvi'],
    data() {
        return {
            VaiTro: null,
            NewItem: {
                KhoiID: null,
                LopID: null,
                GiaoVienID: null,
                VaiTro: null,
                MonHocID: null,
                MaDonVi: 1,
            },
        }
    },
    mounted() {
        this.NewItem.VaiTro = 1
    },
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
    watch: {},
    methods: {
        async insGiaoVienLop_Ins() {
            let monHocID = null
            let lopID = this.LopID
            let vaiTroID = this.NewItem.VaiTro
            //Khối trưởng và giáo viên lớp
            if (vaiTroID === 1 || vaiTroID === 2) monHocID = 0
            else monHocID = this.NewItem.MonHocID
            if (vaiTroID === 2) lopID = 0
            const form = this.$refs.NewItem
            console.log('form.validate()', form.validate())
            if (form.validate()) {
                const param = {
                    KhoiID: this.KhoiID,
                    LopID: lopID,
                    GiaoVienID: this.NewItem.GiaoVienID,
                    VaiTro: this.NewItem.VaiTro,
                    MaDonVi: this.NewItem.MaDonVi,
                    MonHocID: monHocID,
                }

                const isInsert = await GiaoVien_Service.GiaoVienLop_Ins(param)
                if (isInsert) {
                    const vaiTro = this.DSVaiTro.find((x) => x.VaiTro === this.NewItem.VaiTro)
                    const lop = this.DSLop.find((x) => x.LopID === this.LopID)
                    Toast.success({ text: `Thêm ${vaiTro.TenVaiTro} của lớp ${lop.TenLop}` })
                    this.NewItem = {
                        KhoiID: null,
                        LopID: null,
                        GiaoVienID: null,
                        MonHocID: null,
                        VaiTro: 1,
                    }
                    this.$emit('onSubmitDialog', true)
                    this.modelValue.IsNewDialog = false
                }
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
