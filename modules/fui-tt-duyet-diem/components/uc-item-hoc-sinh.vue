<template>
    <v-row class="ma-9">
        <!-- Phần thông tin học sinh -->
        <v-col cols="2" class="text-center">
            <v-avatar color="grey" size="80">
                <v-img :src="urlAvatarHocSinh + hocSinh?.HocSinhID" cover></v-img>
            </v-avatar>
            <p class="font-weight-medium">
                {{ hocSinh?.HoTen }} <uc-gender v-model="hocSinh.Nu" />
            </p>
            <p class="text-body-2">{{ hocSinh.HocSinhID }} • {{ hocSinh?.NgaySinh }}</p>
            <v-divider class="my-2"></v-divider>
            <div class="text-left">
                <p class="font-weight-medium text-title text-error">Môn học bị từ chối:</p>
                <div v-if="subjectsWithGroups_Reject && Object.keys(subjectsWithGroups_Reject).length > 0">
                    <div v-for="(info, monHoc) in subjectsWithGroups_Reject" :key="monHoc" class="subject-container">
                        <!-- Tên môn học -->
                        <div class="subject-header">
                            <v-icon color="error" size="small" class="mr-2">mdi-book-remove</v-icon>
                            <span class="subject-name">{{ monHoc }}</span>
                        </div>

                        <!-- Danh sách mã nhóm -->
                        <div class="groups-list">
                            <v-chip v-for="maNhom in info.maNhomList" :key="maNhom" size="small" color="error"
                                variant="outlined" class="mr-2 mb-2">
                                {{ maNhom }}
                            </v-chip>
                        </div>

                        <!-- Thông tin thời gian và lý do từ chối -->
                        <div class="info-section">
                            <div class="info-item mt-1" v-if="info.lyDo">
                                <v-icon size="small" color="grey">mdi-information-outline</v-icon>
                                <span class="text-error">Lý do: {{ info.lyDo }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="text-body-2 text-grey">
                    Không có môn học nào bị từ chối
                </div>
            </div>
        </v-col>

        <!-- Phần tabs và nội dung -->
        <v-col cols="10">
            <v-tabs v-model="tab">
                <v-tab v-for="(item, index) in tabItems" :key="index" :value="index">
                    {{ item.label }}
                </v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <!-- Tab 1: Môn chính khóa -->
                <v-tabs-window-item :value="0">
                    <v-data-table class="custom-border border-t-sm" :headers="headers_ChinhKhoa"
                        :items="items_ChinhKhoa" :items-per-page="-1" hide-default-footer>
                        <template #item.combineTenMonDuLieuNganh="{ item }">
                            <span class="mt-2 text-title font-weight-medium">{{ item.TenMonDuLieuNganh }}</span>
                            <v-divider class="my-2"></v-divider>
                            <div v-for="(group, tinhTrang) in item.GroupedByTinhTrang" :key="tinhTrang">
                                <div :class="'text-' + group.MauTinhTrang">
                                    • {{ group.TenTinhTrang }}
                                </div>

                                <!-- Hiển thị các nhóm trong tình trạng -->
                                <div v-for="nhom in group.Nhoms" :key="nhom.MaNhomCotDiem" class="ml-2">
                                    <v-chip size="small" :color="group.MauTinhTrang" class="mt-1">
                                        {{ nhom.TenNhomCotDiem_VI }}
                                    </v-chip>
                                </div>
                            </div>
                        </template>
                        <template #item.actions="{ item }">
                            <div class="d-flex ga-2">
                                <v-btn color="error" @click="handleReject(item)" :disabled="item.TinhTrang === 4">
                                    Từ chối
                                </v-btn>
                                <v-btn color="primary" @click="handleSendManager(item)"
                                    :disabled="item.TinhTrang === 4"> Gửi BGH</v-btn>
                            </div>
                        </template>
                    </v-data-table>
                </v-tabs-window-item>

                <!-- Tab 2: Môn bổ trợ -->
                <v-tabs-window-item :value="1">
                    <v-card v-for="monHoc in DSMonHoc_BoTro" :key="monHoc.MonHocID" border class="mb-4">
                        <v-card-title class="d-flex justify-space-between align-center">
                            <span>{{ monHoc.TenMonDuLieuNganh }}</span>
                            <div class="d-flex ga-2">
                                <v-btn color="error" @click="handleReject(monHoc)">Từ chối</v-btn>
                                <v-btn color="primary" @click="handleSendManager(monHoc)">Gửi BGH</v-btn>
                            </div>
                        </v-card-title>
                        <v-data-table class="custom-border border-t-sm" :headers="getHeadersForBoTro(monHoc)"
                            :items="getItemsForBoTro(monHoc)" :items-per-page="-1" hide-default-footer />
                    </v-card>
                    <uc-empty v-if="DSMonHoc_BoTro.length === 0" />
                </v-tabs-window-item>

                <!-- Tab 3,4,5: Tiếng Anh, Tiếng Việt, Toán -->
                <v-tabs-window-item v-for="(type, index) in ['TA', 'TV', 'Toan']" :key="index" :value="index + 2">
                    <v-card border>
                        <v-card-title>{{ specialSubjects[type].name }}</v-card-title>
                        <v-data-table class="custom-border border-t-sm" :headers="getSpecialSubjectHeaders(type)"
                            :items="getSpecialSubjectItems(type)" :items-per-page="-1" hide-default-footer />
                    </v-card>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-col>
    </v-row>
    <uc-dialog-reject v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
        @onFinishDialog="onLoadHocSinh" />

    <uc-dialog-approve v-model="action" :monHocItem="monHocItem" :dsMaNhomCotDiem_MonHoc="DSMaNhomCotDiem_MonHoc"
        @onFinishDialog="onLoadHocSinh" />
</template>

<script>
export default {
    name: 'StudentGrades',

    props: {
        modelValue: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            vueData,
            tab: 0,
            action: {
                isShowDialogReject: false,
                isShowDialogApprove: false
            },
            monHocItem: null,
            DSMaNhomCotDiem_MonHoc: [],
            tabItems: [
                { label: 'Môn chính khóa', value: 0 },
                { label: 'Môn bổ trợ', value: 1 },
            ],
            specialSubjects: {
                // TA: {
                //     ids: [5, 46, 76],
                //     name: 'Tiếng Anh'
                // },
                // TV: {
                //     ids: [1, 74, 104],
                //     name: 'Tiếng Việt'
                // },
                // Toan: {
                //     ids: [2, 73, 103],
                //     name: 'Toán'
                // }
            }
        }
    },

    computed: {
        hocSinh() {
            return this.modelValue
        },

        urlAvatarHocSinh() {
            return vueData.v_Set.urlAvatarHocSinh
        },

        rejectedSubjects() {
            const rejected = {}

            if (this.hocSinh?.DSCotDiem) {
                this.hocSinh.DSCotDiem.forEach(cotDiem => {
                    if (cotDiem.Is_Reject_GV && cotDiem.TinhTrang === 3) {
                        // Sử dụng tên môn học làm key để tránh trùng lặp
                        rejected[cotDiem.TenMonDuLieuNganh] = cotDiem.ReasonReject_GV
                    }
                })
            }

            return rejected
        },
        subjectsWithGroups_Reject() {
            const subjects = {}

            if (this.hocSinh?.DSCotDiem) {
                this.hocSinh.DSCotDiem.forEach(cotDiem => {
                    if (cotDiem.TinhTrang === 3) { // 3 = Từ chối
                        const monHoc = cotDiem.TenMonDuLieuNganh

                        // Khởi tạo thông tin môn học nếu chưa tồn tại
                        if (!subjects[monHoc]) {
                            subjects[monHoc] = {
                                maNhomList: new Set(),
                                lyDo: cotDiem.ReasonReject_GV || 'Không có lý do',
                                lastUpdate: cotDiem.NgayDuyet
                            }
                        }

                        // Thêm mã nhóm vào Set
                        subjects[monHoc].maNhomList.add(cotDiem.MaNhomCotDiem)

                        // Cập nhật thời gian mới nhất
                        if (new Date(cotDiem.NgayDuyet) > new Date(subjects[monHoc].lastUpdate)) {
                            subjects[monHoc].lastUpdate = cotDiem.NgayDuyet
                            subjects[monHoc].lyDo = cotDiem.ReasonReject_GV || 'Không có lý do'
                        }
                    }
                })

                // Chuyển Set thành Array cho mỗi môn học
                Object.keys(subjects).forEach(monHoc => {
                    subjects[monHoc].maNhomList = Array.from(subjects[monHoc].maNhomList)
                })
            }

            return subjects
        },

        allSpecialSubjectIds() {
            return Object.values(this.specialSubjects).flatMap(subject => subject.ids)
        },

        filteredSubjects() {
            return vueData.DSMonHoc.filter(x =>
                !this.allSpecialSubjectIds.includes(x.MonHocID)
            )
        },

        DSMonHoc_ChinhKhoa() {
            return this.filteredSubjects.filter(x => x.Is_MonHoc_BoTro === 0)
        },

        DSMonHoc_BoTro() {
            return this.filteredSubjects.filter(x => x.Is_MonHoc_BoTro === 1)
        },

        headers_ChinhKhoa() {
            const firstSubject = this.DSMonHoc_ChinhKhoa[0]
            if (!firstSubject) return []

            return this.buildHeaders(firstSubject)
        },

        items_ChinhKhoa() {
            return this.DSMonHoc_ChinhKhoa.map(monHoc => {
                const baseInfo = {
                    MonHocID: monHoc.MonHocID,
                    TenMonDuLieuNganh: monHoc.TenMonDuLieuNganh,

                }

                const grades = this.getGradesForSubject(monHoc)
                return { ...baseInfo, ...grades }
            })
        }
    },

    methods: {
        buildHeaders(monHoc) {
            const baseHeaders = [
                {
                    title: "Tên môn học",
                    value: "combineTenMonDuLieuNganh",
                    minWidth: 200,
                    fixed: true
                }
            ]

            const gradeHeaders = this.getGradeHeaders(monHoc)

            return [
                ...baseHeaders,
                ...gradeHeaders,
                {
                    title: "",
                    value: "actions",
                    right: 0,
                    lastFixed: true
                }
            ]
        },

        getGradeHeaders(monHoc) {
            const DSCotDiem = this.modelValue.DSCotDiem
                .filter(x => x.MonHocID === monHoc.MonHocID)

            const groupedColumns = _.groupBy(DSCotDiem, 'MaNhomCotDiem')

            return Object.entries(groupedColumns).map(([groupId, columns]) => {
                const group = columns[0]
                return {
                    title: group.TenNhomCotDiem_VI,
                    value: group.MaNhomCotDiem,
                    align: 'center',
                    children: columns.map(col => ({
                        title: col.TenCotDiem_VI,
                        value: col.MaCotDiem,
                        minWidth: col.LoaiCotDiem === 'text' ? 500 : 200,
                        align: 'center'
                    }))
                }
            })
        },

        getGradesForSubject(monHoc) {
            const grades = {
                List_MaNhomCotDiem: [], // Danh sách gốc
                GroupedByTinhTrang: {}  // Danh sách đã được group
            }

            const DSCotDiem = this.modelValue.DSCotDiem
                .filter(x => x.MonHocID === monHoc.MonHocID)

            DSCotDiem.forEach(cotDiem => {
                // Lưu điểm theo mã cột điểm
                grades[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI ?? cotDiem.KetQuaDanhGia_EN

                // Tạo object chứa thông tin nhóm
                const nhomInfo = {
                    TinhTrang: cotDiem.TinhTrang,
                    TenTinhTrang: cotDiem.TenTinhTrang,
                    MauTinhTrang: cotDiem.MauTinhTrang,
                    MaNhomCotDiem: cotDiem.MaNhomCotDiem,
                    TenNhomCotDiem_VI: cotDiem.TenNhomCotDiem_VI
                }

                // Kiểm tra xem nhóm đã tồn tại trong danh sách chưa
                const existingNhom = grades.List_MaNhomCotDiem.find(
                    nhom => nhom.MaNhomCotDiem === cotDiem.MaNhomCotDiem
                )

                // Nếu chưa tồn tại thì thêm vào danh sách
                if (!existingNhom) {
                    grades.List_MaNhomCotDiem.push(nhomInfo)

                    // Thêm vào grouped list
                    if (!grades.GroupedByTinhTrang[cotDiem.TinhTrang]) {
                        grades.GroupedByTinhTrang[cotDiem.TinhTrang] = {
                            TenTinhTrang: cotDiem.TenTinhTrang,
                            MauTinhTrang: cotDiem.MauTinhTrang,
                            Nhoms: []
                        }
                    }
                    grades.GroupedByTinhTrang[cotDiem.TinhTrang].Nhoms.push(nhomInfo)
                }

                // Cập nhật thông tin tình trạng chung của môn học
                grades.TinhTrang = cotDiem.TinhTrang
                grades.TenTinhTrang = cotDiem.TenTinhTrang
                grades.MauTinhTrang = cotDiem.MauTinhTrang
            })

            return grades
        },


        getHeadersForBoTro(monHoc) {
            return this.getGradeHeaders(monHoc)
        },

        getItemsForBoTro(monHoc) {
            return [{
                MonHocID: monHoc.MonHocID,
                ...this.getGradesForSubject(monHoc)
            }]
        },

        getSpecialSubject(type) {
            const subjectIds = this.specialSubjects[type].ids
            return vueData.DSMonHoc.find(x => subjectIds.includes(x.MonHocID))
        },

        getSpecialSubjectHeaders(type) {
            const subject = this.getSpecialSubject(type)
            if (!subject) return []

            return this.getGradeHeaders(subject)
        },

        getSpecialSubjectItems(type) {
            const subject = this.getSpecialSubject(type)
            if (!subject) return []

            return [{
                MonHocID: subject.MonHocID,
                ...this.getGradesForSubject(subject)
            }]
        },

        handleReject(item) {
            const listMonHoc = this.modelValue.DSCotDiem.filter(x => x.MonHocID === item.MonHocID)
            const DSMaNhomCotDiem = [...new Set(listMonHoc.map(x => x.MaNhomCotDiem))]

            this.monHocItem = _.cloneDeep({ ...item, ...listMonHoc[0] })
            this.DSMaNhomCotDiem_MonHoc = DSMaNhomCotDiem.map(x => {
                return {
                    TenNhomCotDiem_VI: listMonHoc.find(y => y.MaNhomCotDiem === x).TenNhomCotDiem_VI,
                    MaNhomCotDiem: listMonHoc.find(y => y.MaNhomCotDiem === x).MaNhomCotDiem,
                }
            })
            this.action.isShowDialogReject = true
        },

        handleSendManager(item) {
            const $this = this

            const listMonHoc = this.modelValue.DSCotDiem.filter(x => x.MonHocID === item.MonHocID)
            const DSMaNhomCotDiem = [...new Set(listMonHoc.map(x => x.MaNhomCotDiem))]

            this.monHocItem = _.cloneDeep({ ...item, ...listMonHoc[0] })
            this.DSMaNhomCotDiem_MonHoc = DSMaNhomCotDiem.map(x => {
                const objExist = listMonHoc.find(y => y.MaNhomCotDiem === x)
                return {
                    TenNhomCotDiem_VI: objExist?.TenNhomCotDiem_VI ?? '',
                    MaNhomCotDiem: objExist?.MaNhomCotDiem ?? '',
                    TinhTrang: objExist?.TinhTrang ?? '',
                    TenTinhTrang: objExist?.TenTinhTrang ?? '',
                    MauTinhTrang: objExist?.MauTinhTran ?? ''
                }
            })
            this.action.isShowDialogApprove = true
        },
        onLoadHocSinh() {
            CALL('HocSinhBangDiem_Get')
        }
    }
}
</script>