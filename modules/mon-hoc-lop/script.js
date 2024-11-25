Vue.component('uc-main-layout', {
    data() {
        return {
            DSMonHoc: [],
            MonHocID: null,
            DSMonHocLop: [],
            IsShowDialogAdd: false,
            DSLop: [],
            IsLoadingDSLop: false,
            formAdd: {
                List_LopID: null,
            }
        }
    },
    mounted() {
        this.getMonHoc_Get()
    },
    watch: {
        MonHocID: function (MonHocID) {
            if (MonHocID) {
                this.getMonHocLop_Get_ByMonHocID()
            }
        },
        IsShowDialogAdd: function (isShow) {
            if (isShow) {
                this.IsLoadingDSLop = true
                apiUtil.kqht('/Lop_Get_ByNienKhoa', {
                    NienKhoa: NIENKHOA.CURRENT
                }).then(res => {
                    if (res.data) {
                        this.DSLop = res.data
                        this.IsLoadingDSLop = false
                    }
                })
            }
        }
    },
    methods: {
        onSearch() {
            this.getMonHocLop_Get_ByMonHocID()
        },
        getMonHoc_Get() {
            apiUtil.kqht('/MonHoc_Get').then((res) => {
                if (res.data) {
                    this.DSMonHoc = res.data
                    this.MonHocID = res.data[0].MonHocID
                }
            })
        },
        getMonHocLop_Get_ByMonHocID() {
            apiUtil.kqht('/MonHocLop_Get_ByMonHocID', {
                MonHocID: this.MonHocID
            }).then(res => {
                if (res.data) {
                    this.DSMonHocLop = res.data
                }
            })
        },
        insMonHocLop_Ins() {
            const form = this.$refs.formAdd
            console.log(form.validate());
            const $this = this
            if (form.validate()) {
                const promises = $this.formAdd.List_LopID.map(LopID => {
                    return apiUtil.kqht('/MonHocLop_Ins', {
                        MonHocID: $this.MonHocID,
                        LopID: LopID,
                        NienKhoa: NIENKHOA.CURRENT,
                    }).then(res => {
                        if (res.data) {
                            const objLop = $this.DSLop.find(x => x.LopID === LopID)
                            const objMon = $this.DSMonHoc.find(x => x.MonHocID === $this.MonHocID)
                            Vue.$toast.success(`Thêm môn học ${objMon?.MonHocName} của lớp ${objLop?.TenLopHienThi} thành công`, { position: 'top' })
                        }
                        return res;
                    })
                });
                Promise.allSettled(promises).then((res) => {
                    $this.formAdd.List_LopID = null
                    $this.getMonHocLop_Get_ByMonHocID();
                    $this.IsShowDialogAdd = false;
                });
            }
        }
    },
    template: /*html */`
        <uc-admin-layout class="pa-4">
            <v-card>
                <v-card-title class="primary--text">Tìm kiếm</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="2">
                            <v-select v-model="MonHocID" label="Chọn môn học" :items="DSMonHoc" item-text="MonHocName" item-value="MonHocID" dense hide-details="auto" outlined></v-select>
                        </v-col>
                        <v-col>
                            <v-btn @click="onSearch" color="primary">Làm mới</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <v-card class="mt-4">
                <v-card-title class="primary--text">Môn học lớp
                    <v-spacer></v-spacer>
                    <v-btn @click="IsShowDialogAdd = true" outlined fab small color="primary"><v-icon>mdi-plus</v-icon></v-btn>
                </v-card-title>
                <a-table :data-source="DSMonHocLop" size="small">
                    <a-table-column title="Tên lớp" data-index="TenLop">
                    </a-table-column>
                     <a-table-column title="Tên khối" data-index="TenKhoi">
                    </a-table-column>
                      <a-table-column title="Tên đơn vị" data-index="TenDonVi">
                    </a-table-column>
                </a-table>
            </v-card>
            <v-dialog v-model="IsShowDialogAdd" width="500">
                <v-card>
                    <v-card-title>
                        Thêm mới
                        <v-spacer></v-spacer>
                        <v-icon @click="IsShowDialogAdd = false" >mdi-close</v-icon>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formAdd">
                            <v-row>
                                <v-col >
                                    <v-autocomplete
                                        class="select-chip"
                                        v-model="formAdd.List_LopID"
                                        label="Chọn lớp"
                                        :items="DSLop" item-text="TenLopHienThi" item-value="LopID" multiple outlined dense hide-details="auto"
                                        :rules="[v => !!v || 'Bạn chưa chọn lớp']"
                                        :loading="IsLoadingDSLop"
                                        chips
                                        deletable-chips = "true"
                                    >
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="IsShowDialogAdd = false" text>Đóng</v-btn>
                        <v-btn @click="insMonHocLop_Ins" color="primary">Lưu</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </uc-admin-layout>
    `
})