<template>
    <v-btn color="primary" variant="outlined" @click="onOpenMauNhanXet()" :disabled="vueData.items.length == 0">Mẫu nhận
        xét</v-btn>
    <v-dialog v-model="isOpen">
        <v-card>
            <v-card-title class="d-flex ga-2" style="background-color: #217d46;">
                <span class="text-white">Mẫu nhận xét</span>
                <v-spacer></v-spacer>
                <v-btn class="text-white" icon variant="text"
                    @click="handleCloseTemplate()"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <v-card-text>
                <div class="mb-3 elevation-2 rounded px-2 pb-2">
                    <v-row>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="3">
                            <span class="text-body-2">Nhận xét môn Toán</span>
                            <div>
                                <v-select v-model="TemplateToanID" label="Chọn mẫu nhận xét"
                                    :items="TemplateToan"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="3">
                            <span class="text-body-2">Nhận xét môn Tiếng Việt</span>
                            <div>
                                <v-select v-model="TemplateTiengVietID" label="Chọn mẫu nhận xét"
                                    :items="TemplateTiengViet"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="3">
                            <span class="text-body-2">Nhận xét môn học khác</span>
                            <div>
                                <v-select v-model="TemplateMonHocKhacID" label="Chọn mẫu nhận xét"
                                    :items="TemplateMonHocKhac"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="3">
                            <span class="text-body-2">Hoạt động giáo dục khác</span>
                            <div>
                                <v-select v-model="TemplateHoatDongGDKhacID" label="Chọn mẫu nhận xét"
                                    :items="TemplateHoatDongGDKhac"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="3">
                            <span class="text-body-2">Phẩm chất năng lực</span>
                            <div>
                                <v-select v-model="TemplateNLPCID" label="Chọn mẫu nhận xét"
                                    :items="TemplateNLPC"></v-select>
                            </div>
                        </v-col>
                    </v-row>
                    <div class="d-flex">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="tonal" class="text-end mt-3"
                            @click="onSelectedDetailTemplateComment()">Áp
                            dụng</v-btn>
                    </div>

                </div>

                <v-data-table class="mt-5" v-model="HocSinhSelected" :headers :items="itemsClone" item-value="HocSinhID"
                    return-object :items-per-page="-1" :hide-default-footer="true" show-select>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    data() {
        return {
            TemplateToanID: null,
            TemplateTiengVietID: null,
            TemplateMonHocKhacID: null,
            TemplateNLPCID: null,
            TemplateHoatDongGDKhacID: null,
            isOpen: false,
            vueData,
            HocSinhSelected: [],
            headers: [
                {
                    title: 'Họ và tên',
                    key: "HoTen",
                    width: "200px"
                },
                {
                    title: 'Nhận xét môn Toán',
                    key: "NhanXetToan_HTML"
                },
                {
                    title: 'Nhận xét môn Tiếng Việt',
                    key: "NhanXetTiengViet_HTML"
                }, {
                    title: 'Nhận xét môn học khác',
                    key: "NhanXetMonHocKhac_HTML"
                },
                {
                    title: 'Hoạt động giáo dục khác',
                    key: "HoatDongGiaoDucKhac_HTML"
                },
                {
                    title: 'Phẩm chất - Năng lực',
                    key: "PhamChatNangLuc_HTML"
                }
            ],
            itemsClone: [],
            TemplateCommentDetail: [],
            TemplateCommentGroup: []
        }
    },
    watch: {

    },
    computed: {
        TemplateToan: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == 7).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
        TemplateTiengViet: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == 8).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
        TemplateMonHocKhac: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == 9).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
        TemplateNLPC: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == 11).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
        TemplateHoatDongGDKhac: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == 10).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
    },
    methods: {
        handleCloseTemplate() {
            this.isOpen = false
            this.itemsClone = []
            this.TemplateToanID = null
            this.TemplateTiengVietID = null
            this.TemplateMonHocKhacID = null
            this.TemplateNLPCID = null
            this.TemplateHoatDongGDKhacID = null
        },
        onOpenMauNhanXet() {
            this.isOpen = true
            this.itemsClone = JSON.parse(JSON.stringify(vueData.items))
            this.onLoadTemplateNhanXet()
        },
        onLoadTemplateNhanXet() {
            ajaxCALL('lms/_V3_Template_Comment_Get', { MonHocID: 5 }, res => {
                this.TemplateCommentGroup = res.data[0]
                this.TemplateCommentDetail = res.data[1]
            })
        },
        onSelectedDetailTemplateComment() {
            if (this.HocSinhSelected.length == 0) {
                Vue.$toast.warning('Vui lòng chọn học sinh để áp dụng mẫu', { position: 'top' })
                return
            }
            this.HocSinhSelected.forEach(hs => {
                if (this.TemplateToanID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.TemplateToanID)
                    if (obj) {
                        hs.NhanXetToan_HTML = this.handleMappingVariable(obj)
                    }
                }
                if (this.TemplateTiengVietID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.TemplateTiengVietID)
                    if (obj) {
                        hs.NhanXetTiengViet_HTML = this.handleMappingVariable(obj)
                    }
                }
                if (this.TemplateMonHocKhacID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.NhanXetMonHocKhac_HTML)
                    if (obj) {
                        hs.NhanXetMonHocKhac_HTML = this.handleMappingVariable(obj)
                    }
                }
                if (this.TemplateHoatDongGDKhacID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.TemplateHoatDongGDKhacID)
                    if (obj) {
                        hs.HoatDongGiaoDucKhac_HTML = this.handleMappingVariable(obj, hs)
                    }
                }
                if (this.TemplateNLPCID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.TemplateNLPCID)
                    if (obj) {
                        hs.PhamChatNangLuc_HTML = this.handleMappingVariable(obj, hs)
                    }
                }
            });
        },
        handleMappingVariable(obj, hs) {
            let strEN = obj.CommentDetailName_EN
            let strVI = obj.CommentDetailName_VI
            if (strEN.includes('{StudentName}')) {
                strEN = strEN.replaceAll('{StudentName}', hs.HoTen)
            }
            if (strVI.includes('{StudentName}')) {
                strVI = strVI.replaceAll('{StudentName}', hs.HoTen)
            }
            //Thầy/Cô
            if (strVI.includes('{TeacherGender}')) {
                // strVI = strVI.replaceAll('{TeacherGender}', vueData.user.Sex ? 'Cô' : 'Thầy')
            }
            if (strEN.includes('{Gender}')) {
                // strEN = strEN.replaceAll('{Gender}', this.NhanXetItem.Nu ? 'She' : 'He')
            }
            //him/herself
            if (strEN.includes('{ReflexivePronouns}')) {
                // strEN = strEN.replaceAll('{ReflexivePronouns}', this.NhanXetItem.Nu ? 'herself' : 'himself')
            }
            //his/her
            if (strEN.includes('{PossessivePronouns}')) {
                // strEN = strEN.replaceAll('{PossessivePronouns}', this.NhanXetItem.Nu ? 'her' : 'his')
            }
            //him/her
            if (strEN.includes('{ObjectPronouns}')) {
                // strEN = strEN.replaceAll('{ObjectPronouns}', this.NhanXetItem.Nu ? 'her' : 'him')
            }
            return strVI
        }
    }
}


</script>