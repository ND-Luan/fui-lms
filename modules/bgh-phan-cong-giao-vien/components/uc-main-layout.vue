<template>
    <div>
        <v-card>
            <v-card-title class="text-primary">Tìm kiếm</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="1">
                        <v-select v-model="CapID" label="Chọn cấp" :items="DSCap" :item-title="'TenCap'"
                            item-value="MaCap" outlined dense hide-details></v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" :item-title="'TenKhoi'"
                            item-value="KhoiID" outlined dense hide-details></v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-title="TenLop" item-value="LopID"
                            outlined dense hide-details></v-select>
                    </v-col>
                    <!-- <v-col cols="1">
						<v-btn @click="onSearch" color="primary">Tìm kiếm</v-btn>
					</v-col> -->
                </v-row>
            </v-card-text>
        </v-card>

        <v-card class="mt-4">
            <v-card-title class="text-primary">
                Phân công giáo viên
                <v-chip v-if="KhoiID" class="ml-1" color="primary">{{ renderTextKhoi(KhoiID) }}</v-chip>
                <v-chip v-if="LopID" class="ml-1" color="primary">{{ renderTextLop(LopID) }}</v-chip>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <!-- :style="{width: WIDTH_TEXT_FIELD_SEARCH + 'px'}" -->
                <v-text-field v-model="Search" label="Tìm kiếm" prepend-inner-icon="mdi-magnify" single-line dense
                    hide-details></v-text-field>
                <v-btn class="ml-4" @click="actions.IsNewDialog = true" icon outlined color="primary">
                    <v-icon> mdi-plus</v-icon>
                </v-btn>
            </v-card-title>

            <v-data-table :items="filterDS" :headers="columns" item-key="GVLopID"
                :footer-props="{ itemsPerPageOptions: [] }" hide-default-footer :search="Search">
                <template v-slot:item.VaiTro="{ item }">
                    <span class="text-black-">
                        <!-- :color="renderGiaoVien(item)" -->
                        <v-chip v-if="item" :color="renderGiaoVien(item)">{{ renderTextVaiTro(item.VaiTro) }}</v-chip>
                    </span>
                </template>
                <template v-slot:item.actions="{ item }">
                    <span class="text-black">
                        <uc-action-row @onEditItem="editItem(item)" @onDeleteItem="deleteItem(item)" />
                    </span>
                </template>
            </v-data-table>
        </v-card>

        <uc-new-model v-model="actions" :dskhoi="DSKhoi" :dslop="DSLop" :KhoiID="KhoiID" :LopID="LopID"
            :dsvaitro="DSVaiTro" :dsgiaovien="DSGiaoVien" :dsmonhoc="DSMonHoc" :dsdonvi="DSDonVi"
            @onSubmitDialog="getGiaoVienLop_Get_ByLopID" />
        <uc-edit-model v-model="actions" :EditData="EditData" :dskhoi="DSKhoi" :dslop="DSLop" :KhoiID="KhoiID"
            :LopID="LopID" :dsvaitro="DSVaiTro" :dsgiaovien="DSGiaoVien" :dsmonhoc="DSMonHoc" :dsdonvi="DSDonVi"
            @onSubmitDialog="getGiaoVienLop_Get_ByLopID" />
    </div>
</template>

<script>
export default {
    props: [],
    data() {
        return {
            actions: {
                IsNewDialog: false,
                IsEditDialog: false,
            },
            ColorEnum: ColorEnum,
            EditData: {},
            DSMonHoc: [],
            MonHocID: null,
            DSDonVi: [
                {
                    TenDonVi: 'Biên Hòa',
                    MaDonVi: 1,
                },
                {
                    TenDonVi: 'Long Khánh',
                    MaDonVi: 2,
                },
            ],
            DSKhoi: [
                { TenKhoi: 'Khối 1', KhoiID: '1' },
                { TenKhoi: 'Khối 2', KhoiID: '2' },
                { TenKhoi: 'Khối 3', KhoiID: '3' },
                { TenKhoi: 'Khối 4', KhoiID: '4' },
                { TenKhoi: 'Khối 5', KhoiID: '5' },
            ],
            DSCap: [
                {
                    TenCap: 'Cấp 1',
                    MaCap: 1,
                },
                {
                    TenCap: 'Cấp 2',
                    MaCap: 2,
                },
                {
                    TenCap: 'Cấp 3',
                    MaCap: 3,
                },
            ],
            KhoiID: null,
            CapID: 1,
            DSLop: [],
            LopID: null,
            DSVaiTro: [
                {
                    TenVaiTro: 'Giáo viên Lớp',
                    VaiTro: 1,
                },
                {
                    TenVaiTro: 'Khối Trưởng (Duyệt)',
                    VaiTro: 2,
                },
                {
                    TenVaiTro: 'Giáo viên bộ môn (Tiếng Anh, Kỹ Năng)',
                    VaiTro: 3,
                },
            ],
            columns: [
                {
                    title: 'STT',
                    value: 'STT', // Sẽ cần xử lý bổ sung để tính STT
                    align: 'center',
                    width: 50,
                },
                {
                    title: 'Họ tên giảng viên',
                    value: 'HoTenGV',
                    className: 'black--text',
                },
                {
                    title: 'Tên môn học',
                    value: 'MonHocName',
                    className: 'black--text',
                    scopedSlots: { customRender: 'MonHocName' },
                },
                {
                    title: 'Vai trò',
                    value: 'VaiTro',
                    className: 'black--text',
                    scopedSlots: { customRender: 'VaiTro' },
                },
                {
                    title: 'Chức năng',
                    value: 'actions',
                    className: 'black--text',
                    // width: WIDTH_COLUMN_TABLE.ACTIONS,
                    scopedSlots: { customRender: 'actions' },
                },
            ],
            DSGiaoVien: [],
            DSPhanCongGiaoVien: [],
            Search: '',
            IsAuth: true,
            vueData
        }
    },
    mounted() {
        this.getGiaoVien_Get() //Lấy giáo viên
        this.getMonHoc_Get(1) //Lấy môn học
        this.KhoiID = '1'
    },
    computed: {
        filterDS: function () {
            const ds = this.DSPhanCongGiaoVien.filter((x) => {
                return x.HoTenGV.toLowerCase().includes(this.Search.toLowerCase()) || x.GiaoVienID.toLowerCase().includes(this.Search.toLowerCase())
            })
            return ds
        },
    },
    watch: {
        KhoiID: function () {
            this.getLop_Get_ByKhoiID()
        },
        LopID: function () {
            this.getGiaoVienLop_Get_ByLopID()
        },
        CapID: function (val) {
            const $this = this
            $this.getMonHoc_Get(val)
            let khoiData
            switch (val) {
                case 1:
                    ; (khoiData = [
                        { TenKhoi: 'Khối 1', KhoiID: '1' },
                        { TenKhoi: 'Khối 2', KhoiID: '2' },
                        { TenKhoi: 'Khối 3', KhoiID: '3' },
                        { TenKhoi: 'Khối 4', KhoiID: '4' },
                        { TenKhoi: 'Khối 5', KhoiID: '5' },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                case 2:
                    ; (khoiData = [
                        { TenKhoi: 'Khối 6', KhoiID: '6' },
                        { TenKhoi: 'Khối 7', KhoiID: '7' },
                        { TenKhoi: 'Khối 8', KhoiID: '8' },
                        { TenKhoi: 'Khối 9', KhoiID: '9' },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                case 3:
                    ; (khoiData = [
                        { TenKhoi: 'Khối 10', KhoiID: '10' },
                        { TenKhoi: 'Khối 11', KhoiID: '11' },
                        { TenKhoi: 'Khối 12', KhoiID: '12' },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                default:
                    ; (khoiData = [
                        { TenKhoi: 'Khối 1', KhoiID: '1' },
                        { TenKhoi: 'Khối 2', KhoiID: '2' },
                        { TenKhoi: 'Khối 3', KhoiID: '3' },
                        { TenKhoi: 'Khối 4', KhoiID: '4' },
                        { TenKhoi: 'Khối 5', KhoiID: '5' },
                        { TenKhoi: 'Khối 6', KhoiID: '6' },
                        { TenKhoi: 'Khối 7', KhoiID: '7' },
                        { TenKhoi: 'Khối 8', KhoiID: '8' },
                        { TenKhoi: 'Khối 9', KhoiID: '9' },
                        { TenKhoi: 'Khối 10', KhoiID: '10' },
                        { TenKhoi: 'Khối 11', KhoiID: '11' },
                        { TenKhoi: 'Khối 12', KhoiID: '12' },
                    ]),
                        ($this.DSKhoi = khoiData)
            }
            this.KhoiID = khoiData[0].KhoiID
        },
    },
    methods: {
        onSearch() {
            this.getGiaoVienLop_Get_ByLopID()
        },
        async getLop_Get_ByKhoiID() {
            const currentYear = new Date().getFullYear()
            return new Promise(async (resolve) => {
                const param = {
                    KhoiID: this.KhoiID,
                    //NIENKHOA.CURRENT
                    NienKhoa: vueData.NienKhoa || currentYear,
                }

                const res = await NhapDiem_Service.Lop_Get_ByKhoiID(param)

                if (res) {
                    this.DSLop = res
                    this.LopID = res[0]?.LopID
                    resolve()
                } else {
                    resolve([]) // Trả về mảng rỗng nếu không có dữ liệu
                }
            })
        },
        async getGiaoVienLop_Get_ByLopID() {
            const param = {
                LopID: this.LopID,
            }

            const isSelect = await GiaoVien_Service.GiaoVienLop_Get_ByLopID(param)
            if (isSelect) {
                if (isSelect.length > 0) {
                    this.DSPhanCongGiaoVien = isSelect.map((item, index) => ({
                        ...item,
                        STT: index + 1,
                    }))
                } else {
                    this.DSPhanCongGiaoVien = isSelect
                }
            }
        },
        async getGiaoVien_Get() {
            const isSelect = await GiaoVien_Service.GiaoVien_Get()
            if (isSelect) {
                this.DSGiaoVien = isSelect.map((item) => {
                    return {
                        ...item,
                        GiaoVienID: item.GiaoVienID?.trim(),
                    }
                })
            }
        },
        async getMonHoc_Get(capId) {
            const param = {
                CapID: capId,
            }
            const isSelect = await NhapDiem_Service.MonHoc_Get_ByCapID(param)
            if (isSelect) {
                this.DSMonHoc = isSelect
            }
        },
        async deleteItem(record) {
            const $this = this
            Alert.confirm({
                text: 'Bạn có muốn xóa không?',
            }).then(async (isConfirmed) => {
                if (isConfirmed) {
                    const param = {
                        GVLopID: record.GVLopID,
                    }

                    const isDelete = await GiaoVien_Service.GiaoVienLop_Del(param)
                    if (isDelete) {
                        this.getGiaoVienLop_Get_ByLopID()
                        Toast.success({ text: `Xóa giảng viên thành công` })
                    }
                }
            })
        },
        editItem(record) {
            this.EditData = record
            this.actions.IsEditDialog = true
        },
        renderTextKhoi(KhoiID) {
            const obj = this.DSKhoi.find((x) => parseInt(x.KhoiID) === parseInt(KhoiID))
            return obj ? obj.TenKhoi : ''
        },
        renderTextLop(LopID) {
            const obj = this.DSLop.find((x) => x.LopID === LopID)
            return obj ? obj.TenLop : ''
        },
        renderGiaoVien(item) {
            let color = ''
            if (item.VaiTro === 1) color = ColorEnum.GiaoVien.GVLop
            else if (item.VaiTro === 2) color = ColorEnum.GiaoVien.KhoiTruong
            else if (item.VaiTro === 3) color = ColorEnum.GiaoVien.GVBoMon
            return color
        },
        renderTextVaiTro(VaiTro) {
            const obj = this.DSVaiTro.find((x) => x.VaiTro === VaiTro)
            return obj ? obj.TenVaiTro : ''
        },
    },
}
</script>
