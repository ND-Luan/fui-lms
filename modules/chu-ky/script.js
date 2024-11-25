Vue.component('uc-main-layout-temp', {
    data() {
        return {
            DSChuKy: [],
            DSGiaoVien: [],
            IsShowDialogAdd: false,
            IsShowDialogEdit: false,
            FormAdd: {
                GiaoVienID: null,
                HinhAnhChuKy: null
            },
            FormEdit: {
                GiaoVienID: null,
                HinhAnhChuKy: null
            }
        }
    },
    mounted() {
        this.getGiaoVien_Get()
        this.getChuKy_Get()
    },
    methods: {
        uploadFile(file, item) {
            const _file = file.Files[0]
            item.HinhAnhChuKy = _file.FILE_ID
            item.IsExistFile = true
        },
        renderTextGiangVien(obj) {
            return `[${obj.GiaoVienID}] - ${obj.HoGV} ${obj.TenGV}`
        },
        getGiaoVien_Get() {
            apiUtil.kqht('/GiaoVien_Get').then(res => {
                if (res.data) {
                    this.DSGiaoVien = res.data
                }
            })
        },
        getChuKy_Get() {
            apiUtil.kqht('/ChuKy_Get').then(res => {
                if (res.data) {
                    this.DSChuKy = res.data.map((x, index) => ({ ...x, STT: index + 1 }))
                }
            })
        },
        insChuKy_Ins() {
            const form = this.$refs.formAdd
            if (form.validate()) {
                apiUtil.kqht('/ChuKy_Ins', {
                    GiaoVienID: this.FormAdd.GiaoVienID,
                    HinhAnhChuKy: this.FormAdd.HinhAnhChuKy
                }).then(res => {
                    if (res.data) {
                        Vue.$toast.success('Thêm chữ ký thành công')
                        this.getChuKy_Get()
                        this.IsShowDialogAdd = false
                    }
                })
            }
        },
        udpChuKy_Udp() {
            const form = this.$refs.formEdit
            if (form.validate()) {
                apiUtil.kqht('/ChuKy_Udp', {
                    ChuKyId: this.FormEdit.ChuKyID,
                    GiaoVienID: this.FormEdit.GiaoVienID,
                    HinhAnhChuKy: this.FormEdit.HinhAnhChuKy
                }).then(res => {
                    if (res.data) {
                        Vue.$toast.success('Cập nhật chữ ký thành công')
                        this.getChuKy_Get()
                        this.IsShowDialogEdit = false
                    }
                })
            }
        },
        deleteItem(record) {
            const $this = this
            confirm({
                title: `Xác nhận xóa chữ ký của ${record.HoGV} ${record.TenGV}`,
                content: "",
                action: function () {
                    apiUtil.kqht("/ChuKy_Del", {
                        ChuKyID: record.ChuKyID,
                    }).then(res => {
                        if (res.data) {
                            Vue.$toast.success(`Xóa giảng viên thành công`, { position: "top" })
                            $this.getChuKy_Get()
                        }
                    })
                }
            })
        },
        editItem(record) {
            this.FormEdit = JSON.parse(JSON.stringify(record))
            this.IsShowDialogEdit = true
        }
    },
    template: /*html*/`
        <div class="pa-4">
            <v-card>
                <v-card-title class="primary--text">
                    Danh sách chữ ký
                    <v-spacer></v-spacer>
                    <v-btn @click="IsShowDialogAdd = true" fab outlined small color="primary"><v-icon>mdi-plus</v-icon></v-btn>
                </v-card-title>
                <a-table :data-source="DSChuKy" size="small">
                    <a-table-column key="STT" data-index="STT">
                        <span slot="title">STT</span>
                        <span slot-scope="STT" slot-scope="text, record" class="black--text">
                            {{text}}
                        </span>
                    </a-table-column>
                    <a-table-column key="GiaoVienID" data-index="GiaoVienID">
                        <span slot="title">Họ tên</span>
                        <span slot-scope="GiaoVien" slot-scope="text, record" class="black--text">
                            {{record.HoGV}} {{record.TenGV}}
                        </span>
                    </a-table-column>
                    <a-table-column key="HinhAnhChuKy" data-index="HinhAnhChuKy">
                        <span slot="title">Hình ảnh</span>
                        <span slot-scope="HinhAnhChuKy" slot-scope="text, record" class="black--text">
                            <v-chip :href="vueData.v_Set.urlReadFile + 'FileData/' + record.HinhAnhChuKy" target="_blank" color="primary">
                                <v-icon left>mdi-code-tags</v-icon>
                                Ảnh
                            </v-chip>
                        </span>
                    </a-table-column>
                    <a-table-column key="actions" data-index="actions">
                        <span slot="title">Thao tác</span>
                        <span slot-scope="text, record">
                            <v-btn @click="editItem(record)" x-small fab icon><v-icon color="green darken-2">mdi-square-edit-outline</v-icon></v-btn>
                            <v-btn @click="deleteItem(record)" x-small fab icon><v-icon color="red darken-3">mdi-trash-can-outline</v-icon></v-btn>
                        </span>
                    </a-table-column>
                </a-table>
            </v-card>
            <v-dialog v-model="IsShowDialogAdd"  width="500">
                <v-card>
                    <v-card-title>
                        Thêm mới
                        <v-spacer></v-spacer>
                        <v-icon @click="IsShowDialogAdd = false">mdi-close</v-icon>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formAdd">
                            <v-row>
                                <v-col cols="12">
                                    <v-autocomplete v-model="FormAdd.GiaoVienID" label="Chọn giáo viên" :items="DSGiaoVien" :item-text="renderTextGiangVien" item-value="GiaoVienID" outlined dense hide-details='auto'
                                            :rules="[v => !!v || 'Bạn chưa chọn giáo viên']"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <f-file-upload
                                        label="Upload"
                                        :url="vueData.v_Set.apiFile"
                                        color="primary"
                                        @input="(value) => uploadFile(value, FormAdd)"
                                        style="width:fit-content"
                                    ></f-file-upload>
                                    <v-img
                                        v-if="FormAdd.HinhAnhChuKy"
                                        class="mt-2"
                                        :src="vueData.v_Set.urlReturnFile + '/FileData/' + FormAdd.HinhAnhChuKy"
                                        style="height:300px; align-self:center; position: relative"
                                        contain
                                    >
                                    </v-img>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="IsShowDialogAdd = false">Đóng</v-btn>
                        <v-btn @click="insChuKy_Ins" color="primary">Lưu</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog v-model="IsShowDialogEdit" width="500">
                <v-card >
                    <v-card-title>
                        Cập nhật
                        <v-spacer></v-spacer>
                        <v-icon @click="IsShowDialogEdit = false">mdi-close</v-icon>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formEdit">
                            <v-row>
                                <v-col cols="12">
                                    <v-autocomplete
                                        v-model="FormEdit.GiaoVienID"
                                        label="Chọn giáo viên"
                                        :items="DSGiaoVien"
                                        :item-text="renderTextGiangVien"
                                        item-value="GiaoVienID"
                                        outlined
                                        dense
                                        readonly
                                        hide-details='auto'
                                        :rules="[v => !!v || 'Bạn chưa chọn giáo viên']"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="12">
                                    <f-file-upload
                                        label="Upload"
                                        :url="vueData.v_Set.apiFile"
                                        color="primary"
                                        @input="(value) => uploadFile(value, FormEdit)"
                                        style="width:fit-content"
                                    ></f-file-upload>
                                    <v-img
                                        v-if="FormEdit.HinhAnhChuKy"
                                        class="mt-2"
                                        :src="vueData.v_Set.urlReturnFile + '/FileData/' + FormEdit.HinhAnhChuKy"
                                        style="height:300px; align-self:center; position: relative"
                                        contain
                                    >
                                    </v-img>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="IsShowDialogEdit = false">Đóng</v-btn>
                        <v-btn @click="udpChuKy_Udp" color="primary">Cập nhật</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>
    `
})