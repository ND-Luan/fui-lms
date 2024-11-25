Vue.component("uc-main-layout-2", {
    data() {
        return {
            DSMonHoc: [],
            MonHocID: null,
            DSKhoi: [
                { TenKhoi: "Nhà trẻ 24 tháng", KhoiID: "-3" },
                { TenKhoi: "Mầm", KhoiID: "-2" },
                { TenKhoi: "Chồi", KhoiID: "-1" },
                { TenKhoi: "Lá", KhoiID: "0" }
            ],
            KhoiID: null,
            DSLop: [],
            LopID: null,
            DSVaiTro: [
                {
                    TenVaiTro: "Giáo viên Lớp",
                    VaiTro: 1
                },
                {
                    TenVaiTro: "Khối Trưởng (Duyệt)",
                    VaiTro: 2
                },
                {
                    TenVaiTro: "Giáo viên bộ môn (Tiếng Anh, Kỹ Năng)",
                    VaiTro: 3
                },
            ],
            VaiTro: null,
            DSDonVi: [{
                TenDonVi: 'Biên Hòa',
                MaDonVi: 1
            }, {
                TenDonVi: 'Long Khánh',
                MaDonVi: 2
            }],
            columns: [
                {
                    title: "STT",
                    dataIndex: 'STT',
                    key: 'STT',
                    className: "black--text",
                    align: 'center',
                    width: WIDTH_COLUMN_TABLE.STT
                },
                {
                    title: "Họ tên giảng viên",
                    dataIndex: 'HoTenGV',
                    key: 'HoTenGV',
                    className: "black--text"
                },
                {
                    title: "Tên môn học",
                    dataIndex: 'MonHocName',
                    key: 'MonHocName',
                    className: "black--text",
                    scopedSlots: { customRender: 'MonHocName' },
                },
                {
                    title: "Vai trò",
                    dataIndex: 'VaiTro',
                    key: 'VaiTro',
                    className: "black--text",
                    scopedSlots: { customRender: 'VaiTro' },
                },
                {
                    title: "Chức năng",
                    dataIndex: 'actions',
                    key: 'actions',
                    className: "black--text",
                    width: WIDTH_COLUMN_TABLE.ACTIONS,
                    scopedSlots: { customRender: 'actions' },
                }
            ],
            NewItem: {
                KhoiID: null,
                LopID: null,
                GiaoVienID: null,
                VaiTro: null,
                MonHocID: null,
                MaDonVi: 1
            },
            EditItem: {
                KhoiID: null,
                LopID: null,
                GiaoVienID: null,
                VaiTro: null,
                MonHocID: null,
                MaDonVi: null
            },
            IsNewDialog: false,
            IsEditDialog: false,
            DSGiaoVien: [],
            DSPhanCongGiaoVien: [],
            Search: "",
            IsAuth: true
        }
    },
    mounted() {
        this.getMonHoc_Get() //Lấy môn học
        this.getGiaoVien_Get() //Lấy giáo viên
        this.KhoiID = "-3"
        this.NewItem.VaiTro = 1
    },
    watch: {
        KhoiID: function () {
            this.getLop_Get_ByKhoiID().then(() => {
                this.IsAuth = checkRole(vueData.user, this.DSLop)
                if (this.IsAuth === true) vueData.v_Set.menu = null
            })
        },
        LopID: function () {
            this.getGiaoVienLop_Get_ByLopID()
        }
    },
    computed: {
        filterDS: function () {
            const ds = this.DSPhanCongGiaoVien.filter(x => {
                return x.HoTenGV.toLowerCase().includes(this.Search.toLowerCase()) || x.GiaoVienID.toLowerCase().includes(this.Search.toLowerCase())
            })
            return ds
        }
    },
    methods: {
        // get() {
        //     apiUtil.kqht("/MonHocLop_Init", {
        //         NienKhoa: 2023
        //     })
        //     console.log("get...")
        // },
        getMonHoc_Get() {
            apiUtil.kqht("/MonHoc_Get").then(res => {
                this.DSMonHoc = res.data
            })
        },
        getGiaoVien_Get() {
            apiUtil.kqht("/GiaoVien_Get").then(res => {
                this.DSGiaoVien = res.data
            })
        },
        getLop_Get_ByKhoiID() {
            return new Promise(resolve => {
                apiUtil.kqht("/Lop_Get_ByKhoiID", {
                    KhoiID: this.KhoiID,
                    NienKhoa: NIENKHOA.CURRENT
                }).then(res => {
                    this.DSLop = res.data
                    this.LopID = res.data[0].LopID
                    resolve()
                })
            })
        },
        getGiaoVienLop_Get_ByLopID() {
            apiUtil.kqht("/GiaoVienLop_Get_ByLopID", {
                LopID: this.LopID
            }).then(res => {
                if (res.data.length > 0) {
                    this.DSPhanCongGiaoVien = res.data.map((item, index) => ({
                        ...item, STT: index + 1
                    }))
                } else {
                    this.DSPhanCongGiaoVien = res.data
                }
            })
        },
        insGiaoVienLop_Ins() {
            let monHocID = null
            let lopID = this.LopID
            let vaiTroID = this.NewItem.VaiTro
            //Khối trưởng và giáo viên lớp
            if (vaiTroID === 1 || vaiTroID === 2) monHocID = 0
            else monHocID = this.NewItem.MonHocID
            if (vaiTroID === 2) lopID = 0
            const form = this.$refs.newForm
            if (form.validate()) {
                apiUtil.kqht("/GiaoVienLop_Ins", {
                    KhoiID: this.KhoiID,
                    LopID: lopID,
                    GiaoVienID: this.NewItem.GiaoVienID,
                    VaiTro: this.NewItem.VaiTro,
                    MaDonVi: this.NewItem.MaDonVi,
                    MonHocID: monHocID,
                }).then(res => {
                    if (res.data) {
                        const vaiTro = this.DSVaiTro.find(x => x.VaiTro === this.NewItem.VaiTro)
                        const lop = this.DSLop.find(x => x.LopID === this.LopID)
                        Vue.$toast.success(`Thêm ${vaiTro.TenVaiTro} của lớp ${lop.TenLop}`, { position: "top" })
                        this.NewItem = {
                            KhoiID: null,
                            LopID: null,
                            GiaoVienID: null,
                            MonHocID: null,
                            VaiTro: 1,
                        }
                        this.getGiaoVienLop_Get_ByLopID()
                        this.IsNewDialog = false
                    }
                })
            }
        },
        updGiaoVienLop_Upd() {
            let monHocID = null
            let lopID = this.EditItem.LopID
            let vaiTroID = this.EditItem.VaiTro
            //Khối trưởng và giáo viên lớp
            if (vaiTroID === 1 || vaiTroID === 2) monHocID = 0
            else monHocID = this.EditItem.MonHocID
            if (vaiTroID === 2) lopID = 0
            const form = this.$refs.editForm
            if (form.validate()) {
                apiUtil.kqht("/GiaoVienLop_Upd", {
                    GVLopID: this.EditItem.GVLopID,
                    KhoiID: this.EditItem.KhoiID,
                    LopID: lopID,
                    GiaoVienID: this.EditItem.GiaoVienID,
                    VaiTro: this.EditItem.VaiTro,
                    MonHocID: monHocID,
                }).then(res => {
                    if (res.data) {
                        const vaiTro = this.DSVaiTro.find(x => x.VaiTro === this.EditItem.VaiTro)
                        const lop = this.DSLop.find(x => x.LopID === this.LopID)
                        Vue.$toast.success(`Cập nhật ${vaiTro.TenVaiTro} của lớp ${lop.TenLop}`, { position: "top" })
                        this.getGiaoVienLop_Get_ByLopID()
                        this.IsEditDialog = false
                    }
                })
            }
        },
        delGiaoVienLop_Del(record) {
            const $this = this
            confirm({
                title: `Xác nhận xóa ${record.HoTenGV}`,
                content: "",
                action: function () {
                    apiUtil.kqht("/GiaoVienLop_Del", {
                        GVLopID: record.GVLopID,
                    }).then(res => {
                        if (res.data) {
                            Vue.$toast.success(`Xóa giảng viên thành công`, { position: "top" })
                            $this.getGiaoVienLop_Get_ByLopID()
                        }
                    })
                }
            })
        },
        onSearch() {
            this.getGiaoVienLop_Get_ByLopID()
        },
        renderTextGiangVien(obj) {
            return `[${obj.GiaoVienID}] - ${obj.HoGV} ${obj.TenGV}`
        },
        renderTextKhoi(KhoiID) {
            const obj = this.DSKhoi.find(x => parseInt(x.KhoiID) === parseInt(KhoiID))
            return obj ? obj.TenKhoi : ""
        },
        renderTextLop(LopID) {
            const obj = this.DSLop.find(x => x.LopID === LopID)
            return obj ? obj.TenLop : ""
        },
        renderTextVaiTro(VaiTro) {
            const obj = this.DSVaiTro.find(x => x.VaiTro === VaiTro)
            return obj ? obj.TenVaiTro : ""
        },
        renderGiaoVien(item) {
            let color = ""
            if (item.VaiTro === 1) color = ColorEnum.GiaoVien.GVLop
            else if (item.VaiTro === 2) color = ColorEnum.GiaoVien.KhoiTruong
            else if (item.VaiTro === 3) color = ColorEnum.GiaoVien.GVBoMon
            return color
        },
        editItem(record) {
            const cloneRecord = JSON.parse(JSON.stringify(record))
            this.EditItem = cloneRecord
            this.IsEditDialog = true
        },
        deleteItem(record) {
            const cloneRecord = JSON.parse(JSON.stringify(record))
            this.delGiaoVienLop_Del(cloneRecord)
        }
    },
    template: /*html */`
        <uc-admin-layout-2 class="pa-4">
            <v-card>
                <v-card-title class="primary--text">Tìm kiếm</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="2">
                            <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" item-text="TenKhoi" item-value="KhoiID" outlined dense hide-details></v-select>
                        </v-col>
                        <v-col cols="2">
                            <v-select v-model="LopID" label="Chọn lớp" :items="DSLop" item-text="TenLop" item-value="LopID" outlined dense hide-details></v-select>
                        </v-col>
                        <v-col  cols="1">
                            <v-btn @click="onSearch" color="primary">Tìm kiếm</v-btn>
                        </v-col>
                        <!--
                        <v-col>
                            <v-btn @click="get">Clone Data</v-btn>
                        </v-col>
                        -->
                    </v-row>
                </v-card-text>
            </v-card>
            <v-card class="mt-4">
                <v-card-title class="primary--text">
                    Phân công giáo viên
                    <v-chip v-if="KhoiID" class="ml-1" color="primary">{{renderTextKhoi(KhoiID)}}</v-chip>
                    <v-chip v-if="LopID" class="ml-1" color="primary">{{renderTextLop(LopID)}}</v-chip>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="Search"
                        label="Tìm kiếm"
                        :style="{width: WIDTH_TEXT_FIELD_SEARCH + 'px'}"
                        prepend-inner-icon="mdi-magnify"
                        single-line dense hide-details
                    ></v-text-field>
                    <v-btn class="ml-4" @click="IsNewDialog = true" icon  outlined color="primary"><v-icon> mdi-plus</v-icon></v-btn>
                </v-card-title>
                <a-table
                    :columns= "columns"
                    :data-source="filterDS"
                    :scroll="{ y: '63vh' }"
                    :pagination="false"
                    size="small"
                    row-key="GVLopID"
                >
                    <span slot="VaiTro" slot-scope="text, record">
                        <v-chip v-if="text" :color="renderGiaoVien(record)" text-color="white">{{renderTextVaiTro(text)}}</v-chip>
                    </span>
                    <span slot="actions" slot-scope="text, record">
                        <v-btn @click="deleteItem(record)" x-small fab icon><v-icon color="red darken-3">mdi-trash-can-outline</v-icon></v-btn>
                        <v-btn @click="editItem(record)" x-small fab icon><v-icon color="green darken-2">mdi-square-edit-outline</v-icon></v-btn>
                    </span>
                </a-table>
                <v-dialog v-model="IsNewDialog" width="638">
                    <v-card>
                        <v-card-title>
                            Thêm mới
                            <v-chip v-if="KhoiID" class="ml-1" color="primary">{{renderTextKhoi(KhoiID)}}</v-chip>
                            <v-chip v-if="LopID && NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1" class="ml-1" color="primary">{{renderTextLop(LopID)}}</v-chip>
                            <v-spacer></v-spacer>
                            <v-icon @click="IsNewDialog = false">mdi-close</v-icon>
                        </v-card-title>
                        <v-card-text>
                            <v-form ref="newForm">
                                <v-row>
                                    <v-col cols="12">
                                        <v-select v-model="NewItem.MaDonVi" label="Chọn đơn vị" :items="DSDonVi" item-text="TenDonVi" item-value="MaDonVi" outlined dense hide-details></v-select>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-select v-model="NewItem.VaiTro" label="Chọn vai trò" :items="DSVaiTro" item-text="TenVaiTro" item-value="VaiTro" outlined dense hide-details></v-select>
                                    </v-col>
                                    <v-col :cols="NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1 ? 6 : 12">
                                        <v-autocomplete v-model="NewItem.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien" :item-text="renderTextGiangVien" item-value="GiaoVienID" outlined dense hide-details='auto'
                                            :rules="[v => !!v || 'Bạn chưa chọn giáo viên']"
                                        ></v-autocomplete>
                                    </v-col>
                                    <v-col cols="6" v-if="NewItem.VaiTro !== 2 && NewItem.VaiTro !== 1">
                                        <v-select v-model="NewItem.MonHocID" label="Chọn môn học" :items="DSMonHoc" item-text="MonHocName" item-value="MonHocID" outlined dense hide-details='auto'
                                            :rules="[v => !!v || 'Bạn chưa chọn môn học']"
                                        ></v-select>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="IsNewDialog = false" text>Đóng</v-btn>
                            <v-btn @click="insGiaoVienLop_Ins" color="primary">Lưu</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog v-model="IsEditDialog" width="638">
                    <v-card>
                        <v-card-title>Cập nhật
                            <v-chip v-if="EditItem.KhoiID" class="ml-1" color="primary">{{renderTextKhoi(EditItem.KhoiID)}}</v-chip>
                            <v-chip v-if="EditItem.LopID && EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1" class="ml-1" color="primary">{{renderTextLop(EditItem.LopID)}}</v-chip>
                            <v-spacer></v-spacer>
                            <v-icon @click="IsEditDialog = false">mdi-close</v-icon>
                        </v-card-title>
                        <v-card-text>
                            <v-form ref="editForm">
                                <v-row>
                                    <v-col cols="12">
                                        <v-select v-model="EditItem.MaDonVi" label="Chọn đơn vị" :items="DSDonVi" item-text="TenDonVi" item-value="MaDonVi" outlined dense hide-details></v-select>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-select v-model="EditItem.VaiTro" label="Chọn vai trò" :items="DSVaiTro" item-text="TenVaiTro" item-value="VaiTro" outlined dense hide-details></v-select>
                                    </v-col>
                                    <v-col :cols="EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1 ? 6 : 12">
                                        <v-autocomplete v-model="EditItem.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien" :item-text="renderTextGiangVien" item-value="GiaoVienID" outlined dense hide-details='auto'
                                            :rules="[v => !!v || 'Bạn chưa chọn giáo viên']"
                                        ></v-autocomplete>
                                    </v-col>
                                    <v-col cols="6" v-if="EditItem.VaiTro !== 2 && EditItem.VaiTro !== 1">
                                        <v-select v-model="EditItem.MonHocID" label="Chọn môn học" :items="DSMonHoc" item-text="MonHocName" item-value="MonHocID" outlined dense hide-details='auto'
                                            :rules="[v => !!v || 'Bạn chưa chọn môn học']"
                                        ></v-select>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn @click="IsEditDialog = false" text>Đóng</v-btn>
                            <v-btn @click="updGiaoVienLop_Upd" color="primary">Cập nhật</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-card>
        </uc-admin-layout>
    `
})