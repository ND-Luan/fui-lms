<template>
    <v-btn color="primary" variant="outlined" @click="onOpenMauNhanXet()" :disabled="vueData.DSHocSinh.length == 0">Mẫu
        nhận
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
                    <v-row class="px-1">
                        <v-col class="d-flex flex-column ga-1" cols="12" md="2">
                            <span class="text-body-2">Nhóm nhận xét</span>
                            <div class="mt-1">
                                <v-select v-model="TemplateCommentGroupID" label="Chọn nhóm nhận xét"
                                    :items="TemplateCommentGroup" item-title="CommentGroupName_VI"
                                    item-value="CommentGroupID"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1" cols="12" md="10">
                            <span class="text-body-2">Mẫu nhận xét</span>
                            <div class="mt-1">
                                <v-select v-model="TemplateCommentID" label="Chọn mẫu nhận xét"
                                    :items="Template"></v-select>
                            </div>
                        </v-col>
                        <v-col class="d-flex flex-column ga-1 border-t border-b" cols="12" md="12">
                            <span class="text-body-1 font-weight-medium text-decoration-underline">Xem trước:</span>
                            <div class="mt-1">
                                <span>
                                    {{ TemplatePreview }}
                                </span>
                            </div>
                        </v-col>

                    </v-row>
                    <div class="d-flex mt-2">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="tonal" class="text-end mt-3 me-2"
                            @click="onSelectedDetailTemplateComment()">Áp
                            dụng mẫu</v-btn>

                        <v-btn color="success" variant="tonal" class="text-end mt-3" @click="onSubmitTemplate()"
                            :disabled="IsDisabledBtnSubmit">Áp
                            dụng vào bảng điểm</v-btn>
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
            isOpen: false,
            vueData,
            HocSinhSelected: [],
            headers: [],
            itemsClone: [],
            TemplateCommentDetail: [],
            TemplateCommentGroup: [],
            TemplateCommentGroupID: null,
            TemplateCommentID: null
        }
    },
    watch: {
        isOpen: function (val) {
            if (val) {
                console.log('MaNhomCotDiemItem', vueData.MaNhomCotDiemItem)
                this.headers.push({
                    title: 'Họ và tên',
                    key: "HoVaTenHocSinh",
                    width: "200px"
                },)
                if (vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('Topic_')) {
                    const num = vueData.MaNhomCotDiemItem.MaNhomCotDiem.replace("Topic_", "");
                    this.headers.push(this.mapHeader(vueData.MaNhomCotDiemItem.MaNhomCotDiem, num))
                } else {
                    this.headers.push(this.mapHeader(vueData.MaNhomCotDiemItem.MaNhomCotDiem))
                }


            }
        },
        TemplateCommentGroupID: function (val) {
            if (val) {
                this.TemplateCommentID = null
            }
        }
    },
    computed: {
        Template: function () {
            return this.TemplateCommentDetail.filter(item => item.CommentGroupID == this.TemplateCommentGroupID).map(item => ({ title: item.CommentDetailName_VI, value: item.CommentDetailID }))
        },
        TemplatePreview: function () {
            if (this.TemplateCommentID) {
                return this.TemplateCommentDetail.find(i => i.CommentDetailID == this.TemplateCommentID).CommentDetailName_VI
            } else return ''
        },
        IsDisabledBtnSubmit: function () {
            if (this.TemplateCommentID && this.HocSinhSelected.length > 0) return false
            else return true
        }
    },
    methods: {
        handleCloseTemplate() {
            this.isOpen = false
            this.itemsClone = []
            this.headers = []
            this.HocSinhSelected = []
            this.TemplateCommentGroupID = null
            this.TemplateCommentID = null
            vueData.keyComp++
        },
        onOpenMauNhanXet() {
            this.isOpen = true
            this.itemsClone = JSON.parse(JSON.stringify(vueData.DSHocSinh))
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
                if (this.TemplateCommentID) {
                    const obj = this.TemplateCommentDetail.find(x => x.CommentDetailID === this.TemplateCommentID)
                    if (vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('Topic_')) {
                        const num = vueData.MaNhomCotDiemItem.MaNhomCotDiem.replace("Topic_", "");
                        if (obj) {
                            hs[`${this.mapAttr(vueData.MaNhomCotDiemItem.MaNhomCotDiem, num)}`] = this.handleMappingVariable(obj, hs)
                        }
                    } else {
                        if (obj) {
                            hs[`${this.mapAttr(vueData.MaNhomCotDiemItem.MaNhomCotDiem)}`] = this.handleMappingVariable(obj, hs)
                        }
                    }

                } else {
                    return Vue.$toast.warning('Vui lòng chọn mẫu nhận xét', { position: 'top' })
                }
            });
        },
        mapHeader(MaNhomCotDiem, Topic_Number = 0) {
            let mapNhanXet = new Map([
                ["DiemCK_HK1", "NhanXetCK_HK1"],
                ["DiemGK_HK1", "NhanXetGK_HK1"],
                ["DiemGK_HK2", "NhanXetGK_HK2"],
                ["DiemCK_HK2", "NhanXetCK_HK2"],
            ])
            if (Topic_Number != 0) {
                mapNhanXet.set(`Topic_${Topic_Number}`, `Topic${Topic_Number}_Comment`)
            }
            return { title: 'Nhận xét', key: mapNhanXet.get(MaNhomCotDiem) }
        },
        mapAttr(MaNhomCotDiem, Topic_Number = 0) {
            let mapNhanXet = new Map([
                ["DiemCK_HK1", "NhanXetCK_HK1"],
                ["DiemGK_HK1", "NhanXetGK_HK1"],
                ["DiemGK_HK2", "NhanXetGK_HK2"],
                ["DiemCK_HK2", "NhanXetCK_HK2"],
            ])
            if (Topic_Number != 0) {
                mapNhanXet.set(`Topic_${Topic_Number}`, `Topic${Topic_Number}_Comment`)
            }
            return mapNhanXet.get(MaNhomCotDiem)
        },
        async onSubmitTemplate() {
            vueData.DSHocSinh = await vueData.DSHocSinh.map(hs => {
                let findMap = this.HocSinhSelected.find(h => h.HocSinhID == hs.HocSinhID)
                if (findMap) {
                    return findMap
                } else return hs
            })
            this.handleCloseTemplate()
        },
        handleMappingVariable(obj, hs) {
            let strEN = obj.CommentDetailName_EN
            let strVI = obj.CommentDetailName_VI
            if (strEN.includes('{StudentName}')) {
                strEN = strEN.replaceAll('{StudentName}', hs.HoVaTenHocSinh)
            }
            if (strVI.includes('{StudentName}')) {
                strVI = strVI.replaceAll('{StudentName}', hs.HoVaTenHocSinh)
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