<template>
    <Global>
        <template #header>
            <v-card>
                <v-card-title>{{ TitlePage }} • {{ TitleCap }}
                    <v-chip variant="text" color="primary" class="font-weight-medium">
                        Tổng số học sinh: {{ DSHocSinhQLD.length }}
                    </v-chip>
                </v-card-title>
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" sm="3">
                            <v-select v-model="Semester" label="Chọn học kì" :items="DSSemester" item-title="title"
                                item-value="value" return-object />
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
                                item-value="KhoiID" return-object />
                        </v-col>
                        <v-col cols="12" sm="3">
                            <v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
                                item-value="LopID" :disabled="!KhoiItem" return-object />
                        </v-col>
                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-btn variant="outlined" color="primary" :disabled="!LopItem"
                                @click="getDiemTheoLopMonQLD">
                                <v-icon start>mdi-refresh</v-icon>Làm mới
                            </v-btn>
                            <v-btn v-if="isAdminCompare" variant="outlined" color="cyan-darken-2"
                                :disabled="DSHocSinhQLD.length === 0" @click="onLoadBangDiemLMS">
                                <v-icon start>mdi-compare</v-icon>So sánh điểm LMS
                            </v-btn>
                            <v-btn v-if="isAdminCompare" variant="outlined" color="amber-darken-2"
                                :disabled="DSHocSinhQLD.length === 0" @click="openKeoDiemDialog">
                                <v-icon start>mdi-database-import</v-icon>Kéo điểm
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <div v-auto-table-height>
            <template v-if="DSHocSinhQLD.length > 0">
                <div v-for="hocSinh in DSHocSinhQLD" :key="hocSinh.HocSinhID" class="mb-3 pa-3">
                    <v-lazy :min-height="100" :options="{ threshold: 0.3 }">
                        <v-card border>
                            <v-card-title class="font-weight-medium text-primary">
                                Học sinh: [{{ hocSinh.HocSinhID }}] {{ hocSinh.HoTen }}
                            </v-card-title>
                            <v-data-table :headers="getHeaders()" :items="getItems(hocSinh)" item-value="MonHocID"
                                items-per-page="-1" hide-default-footer density="compact">
                                <template #item.TX1="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'TX1')"
                                            :color="renderItemLMSIsLock(item, 'TX1') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'TX1') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'TX1') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.TX2="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'TX2')"
                                            :color="renderItemLMSIsLock(item, 'TX2') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'TX2') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'TX2') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.TX3="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'TX3')"
                                            :color="renderItemLMSIsLock(item, 'TX3') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'TX3') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'TX3') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.TX4="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'TX4')"
                                            :color="renderItemLMSIsLock(item, 'TX4') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'TX4') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'TX4') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.TX5="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'TX5')"
                                            :color="renderItemLMSIsLock(item, 'TX5') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'TX5') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'TX5') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.GK="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'GK')"
                                            :color="renderItemLMSIsLock(item, 'GK') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'GK') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'GK') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.CK="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'CK')"
                                            :color="renderItemLMSIsLock(item, 'CK') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'CK') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'CK') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                                <template #item.DTB="{ item, value }">
                                    <div class="d-flex ga-2 align-center justify-center">
                                        <span>{{ value }}</span>
                                        <v-chip v-if="IsCompareLMS && renderItemLMS(item, 'DTB')"
                                            :color="renderItemLMSIsLock(item, 'DTB') ? 'success' : 'orange'"
                                            size="small">
                                            {{ renderItemLMS(item, 'DTB') }}
                                            <v-tooltip activator="parent" location="top">{{ renderItemLMSIsLock(item, 'DTB') ? 'Đã khóa' : 'Chưa khóa' }}</v-tooltip>
                                        </v-chip>
                                    </div>
                                </template>
                            </v-data-table>
                        </v-card>
                    </v-lazy>
                </div>
            </template>
            <template v-else>
                <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
                    <p class="text-body-2">Chọn lớp để xem dữ liệu</p>
                </div>
            </template>
        </div>

        <uc-dialog v-model="IsShowDialogKeoDiem" title="Chọn cột kéo điểm" doneText="Xác nhận kéo"
            @onSubmit="onSubmitKeoDiem">
            <div class="d-flex ga-2 mb-3">
                <v-btn size="small" variant="outlined" color="primary" :disabled="IsPullingDiem"
                    @click="selectAllKeoDiemColumns">
                    Chọn tất cả
                </v-btn>
                <v-btn size="small" variant="outlined" color="secondary" :disabled="IsPullingDiem"
                    @click="clearAllKeoDiemColumns">
                    Bỏ chọn tất cả
                </v-btn>
            </div>
            <v-row>
                <v-col v-for="col in pullColumnOptions" :key="col.value" cols="12" sm="6" md="4">
                    <v-checkbox v-model="SelectedKeoDiemColumns" :label="col.title" :value="col.value" hide-details
                        density="compact" :disabled="IsPullingDiem" />
                </v-col>
            </v-row>
            <v-alert v-if="IsPullingDiem" type="info" variant="tonal" class="mt-2">
                {{ PullProgressText }}
            </v-alert>
            <v-progress-linear v-if="IsPullingDiem" class="mt-3" color="primary" height="8"
                :model-value="PullProgressPercent" rounded />
        </uc-dialog>
    </Global>
</template>

<script>
export default {
    inject: ['snackbarRef', 'iframeRef'],

    data() {
        return {
            vueData,
            DSKhoi: [],
            DSLop: [],
            KhoiItem: null,
            LopItem: null,
            DSHocSinh_API_QLD: [],
            DSHocSinhQLD: [],
            DSHocSinh_LMS: [],
            IsCompareLMS: false,
            IsShowDialogKeoDiem: false,
            SelectedKeoDiemColumns: [],
            IsPullingDiem: false,
            PullProgressText: '',
            PullProgressCurrent: 0,
            PullProgressTotal: 0,
            DSSemester: [
                { title: 'Học kì 1', value: 'HK1', HocKi: 1 },
                { title: 'Học kì 2', value: 'HK2', HocKi: 2 },
                { title: 'Cả năm', value: 'CaNam', HocKi: 0 },
            ],
            Semester: { title: 'Học kì 2', value: 'HK2', HocKi: 2 },
        }
    },

    computed: {
        TitleCap() { return renderText(parseInt(vueData.CapID)) },
        TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
        isAdminCompare() { return vueData?.user?.UserID === 'NA0000022' },
        pullColumnOptions() {
            return this.getHeaders()
                .filter(x => x.value !== 'MonHocID')
                .map(x => ({ title: x.title, value: x.value }))
        },
        PullProgressPercent() {
            if (!this.PullProgressTotal) return 0
            return Math.round((this.PullProgressCurrent / this.PullProgressTotal) * 100)
        },
    },

    watch: {
        'vueData.NienKhoa'() {
            this.resetAllFilters()
            this.getKhoi()
        },
        Semester() {
            this.resetAfterSemesterChanged()
            this.getKhoi()
        },
        KhoiItem(v) {
            this.LopItem = null
            this.DSLop = []
            this.clearData()
            if (v?.KhoiID) this.getLop()
        },
        LopItem(v) {
            this.clearData()
            if (v?.LopID) this.getDiemTheoLopMonQLD()
        },
    },

    mounted() {
        this.getKhoi()
    },

    methods: {
        extractList(res) {
            if (Array.isArray(res)) return res
            return res?.data ?? []
        },

        isNumber(value) {
            if (value === null || value === undefined) return false
            return String(value).trim() !== '' && !isNaN(value)
        },

        clearData() {
            this.DSHocSinh_API_QLD = []
            this.DSHocSinhQLD = []
            this.DSHocSinh_LMS = []
            this.IsCompareLMS = false
        },

        resetAllFilters() {
            this.KhoiItem = null
            this.LopItem = null
            this.DSKhoi = []
            this.DSLop = []
            this.clearData()
        },

        resetAfterSemesterChanged() {
            this.KhoiItem = null
            this.LopItem = null
            this.DSLop = []
            this.clearData()
            this.SelectedKeoDiemColumns = []
        },

        openKeoDiemDialog() {
            this.SelectedKeoDiemColumns = this.getDefaultKeoDiemColumns()
            this.IsShowDialogKeoDiem = true
        },

        getDefaultKeoDiemColumns() {
            const defaultColumns = this.Semester.HocKi === 0
                ? ['DiemTB_CaNam']
                : ['GK', 'CK', 'DTB']
            const availableColumns = new Set(this.pullColumnOptions.map(x => x.value))
            return defaultColumns.filter(x => availableColumns.has(x))
        },

        selectAllKeoDiemColumns() {
            this.SelectedKeoDiemColumns = this.pullColumnOptions.map(x => x.value)
        },

        clearAllKeoDiemColumns() {
            this.SelectedKeoDiemColumns = []
        },

        resetPullProgress() {
            this.IsPullingDiem = false
            this.PullProgressText = ''
            this.PullProgressCurrent = 0
            this.PullProgressTotal = 0
        },

        buildPayloadBySelectedColumns(data, selectedColumns) {
            const baseKeys = ['HocSinhID', 'HoTen', 'MonHocID', 'TenLop', 'HocKi']
            const scoreKeys = ['TX1', 'TX2', 'TX3', 'TX4', 'TX5', 'GK', 'CK', 'DTB', 'DiemTB_CaNam']
            const allowKeys = new Set([...baseKeys, ...selectedColumns])

            return data.map(item => {
                const payloadItem = { ...item }

                // Bỏ tick cột nào thì xóa key đó khỏi payload.
                for (const scoreKey of scoreKeys) {
                    if (!selectedColumns.includes(scoreKey) && Object.prototype.hasOwnProperty.call(payloadItem, scoreKey)) {
                        delete payloadItem[scoreKey]
                    }
                }

                // Giữ lại đúng các key cần gửi.
                for (const key in payloadItem) {
                    if (!allowKeys.has(key)) delete payloadItem[key]
                }

                return payloadItem
            })
        },

        async onSubmitKeoDiem() {
            if (this.IsPullingDiem) return
            if (!this.SelectedKeoDiemColumns.length) {
                this.snackbarRef.value.show({ message: 'Vui lòng chọn ít nhất 1 cột điểm', color: 'warning' })
                return
            }
            await this.fnKeoDiem(this.SelectedKeoDiemColumns)
        },

        async getKhoi() {
            const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
                CapID: vueData.CapID,
                NienKhoa: vueData.NienKhoa,
                HocKi: this.Semester.HocKi,
            })
            this.DSKhoi = this.extractList(res)
        },

        async getLop() {
            if (!this.KhoiItem?.KhoiID) return
            const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
                NienKhoa: vueData.NienKhoa,
                KhoiID: this.KhoiItem.KhoiID,
                HocKi: this.Semester.HocKi,
            })
            this.DSLop = this.extractList(res).filter(x => this.isNumber(x.LopID))
        },

        async getDiemTheoLopMonQLD() {
            if (!this.LopItem?.LopID) return
            this.IsCompareLMS = false
            if (this.Semester.HocKi === 0) {
                await this.getDiemTBLopMon()
                return
            }

            const res = await fetchPromise(`diemc${vueData.CapID}/LMS_GetDiemTheoLop`, {
                LopID: this.LopItem.LopID,
                MonHocID: 'toan',
                HocKy: this.Semester.HocKi,
                NamHoc: vueData.NienKhoa,
            }, { cache: false })
            const list = this.extractList(res).map(x => ({ ...x, HocKi: this.Semester.value }))
            this.DSHocSinh_API_QLD = list
            this.renderDSHocSinhQLD(list)
        },

        async getDiemTBLopMon() {
            const res = await fetchPromise(`diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`, {
                LopID: this.LopItem.LopID,
                HocKy: this.Semester.HocKi,
                NienKhoa: vueData.NienKhoa,
            }, { cache: false })

            const newData = this.extractList(res).map(x => ({ ...x, HocKi: this.Semester.value }))
            const monHocID = [
                'GDDP',
                'HDTN',
                'HKTN',
                'JA',
                'LS-DL',
                'NT',
                'AI',
                'toan',
                'tin',
                'van',
                'anh',
                'gdcd',
                'cn',
                'td',
            ]
            const data = []
            for (const item of newData) {
                for (const key in item) {
                    if (!monHocID.includes(key)) continue
                    data.push({
                        HocSinhID: item.HocSinhID,
                        HoTen: item.HoTen,
                        MonHocID: key,
                        TenLop: item.TenLop,
                        DiemTB_CaNam: item[key],
                        HocKi: this.Semester.value,
                    })
                }
            }
            this.DSHocSinh_API_QLD = data
            this.renderDSHocSinhQLD(data)
        },

        renderDSHocSinhQLD(data) {
            const hocSinhIds = [...new Set(data.map(x => x.HocSinhID))]
            const dsHocSinh = []
            for (const hocSinhID of hocSinhIds) {
                const hocSinh = data.find(x => x.HocSinhID === hocSinhID)
                if (!hocSinh) continue
                dsHocSinh.push({
                    ...hocSinh,
                    DSCotDiem: data.filter(x => x.HocSinhID === hocSinhID),
                })
            }
            this.DSHocSinhQLD = dsHocSinh
        },

        getHeaders() {
            const headers = []
            let listMaCotDiem = [
                { title: 'Tên môn học', value: 'MonHocID', minWidth: 100, align: 'left' },
            ]

            if (this.Semester.HocKi === 0) {
                listMaCotDiem = [
                    { title: 'Tên môn học', value: 'MonHocID', minWidth: 100, align: 'left' },
                    { title: 'DiemTB_CaNam', value: 'DiemTB_CaNam' },
                ]
            } else {
                listMaCotDiem = [
                    { title: 'Tên môn học', value: 'MonHocID', minWidth: 100, align: 'left' },
                    { title: 'TX1', value: 'TX1' },
                    { title: 'TX2', value: 'TX2' },
                    { title: 'TX3', value: 'TX3' },
                    { title: 'TX4', value: 'TX4' },
                    { title: 'GK', value: 'GK' },
                    { title: 'CK', value: 'CK' },
                    { title: 'ĐTB', value: 'DTB' },
                ]
            }

            for (const col of listMaCotDiem) {
                headers.push({
                    title: col.title,
                    value: col.value,
                    minWidth: col.minWidth || 50,
                    align: col.align || 'center',
                })
            }

            if (parseInt(vueData.CapID) === 3 && this.Semester.HocKi !== 0) {
                headers.splice(5, 0, {
                    title: 'TX5',
                    value: 'TX5',
                    align: 'center',
                    minWidth: 50,
                })
            }
            return headers
        },

        getItems(hocSinh) {
            return [...hocSinh.DSCotDiem].sort((a, b) => String(a.MonHocID).localeCompare(String(b.MonHocID)))
        },

        renderItemLMS(itemTable, key) {
            let diem = null
            if (!this.DSHocSinh_LMS?.length) return diem
            const itemHocSinhMon = this.DSHocSinh_LMS.find(x =>
                x.MonHocCode.toLowerCase() === itemTable.MonHocID.toLowerCase()
                && x.HocSinhID === itemTable.HocSinhID,
            )
            if (!itemHocSinhMon) return diem

            console.log("itemHocSinhMon", itemHocSinhMon)
            const monHocCode = itemHocSinhMon.MonHocCode.toLowerCase()
            const semester = this.Semester.value
            if (key === 'TX1') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon?.Theme1_Total ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon?.Theme5_Total ?? null
                } else {
                    diem = itemHocSinhMon['TX_L1_' + semester] ?? null
                }
            } else if (key === 'TX2') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon?.Theme2_Total ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon?.Theme6_Total ?? null
                } else {
                    diem = itemHocSinhMon['TX_L2_' + semester] ?? null
                }
            } else if (key === 'TX3') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon?.Theme3_Total ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon?.Theme7_Total ?? null
                } else {
                    diem = itemHocSinhMon['TX_L3_' + semester] ?? null
                }
            } else if (key === 'TX4') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon?.Theme4_Total ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon?.Theme8_Total ?? null
                } else {
                    diem = itemHocSinhMon['TX_L4_' + semester] ?? null
                }
            } else if (key === 'TX5') {
                diem = itemHocSinhMon['TX_L5_' + semester] ?? null
            } else if (key === 'GK') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon['S1_Mid_Total_Point'] ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon['S2_Mid_Total_Point'] ?? null
                }
                else {
                    diem = itemHocSinhMon['DiemGK_' + semester] ?? null
                }
            } else if (key === 'CK') {
                if (monHocCode === 'anh') {
                    if (semester === 'HK1') diem = itemHocSinhMon['S1_Final_Total_Point'] ?? null
                    if (semester === 'HK2') diem = itemHocSinhMon['S2_Final_Total_Point'] ?? null
                }
                else {
                    diem = itemHocSinhMon['DiemCK_' + semester] ?? null
                }
            } else if (key === 'DTB') {
                diem = itemHocSinhMon['DiemTB_' + semester] ?? null
            }
            return diem
        },

        renderItemLMSIsLock(itemTable, key) {
            if (!this.DSHocSinh_LMS?.length) return null
            const itemHocSinhMon = this.DSHocSinh_LMS.find(x =>
                x.MonHocCode.toLowerCase() === itemTable.MonHocID.toLowerCase()
                && x.HocSinhID === itemTable.HocSinhID,
            )
            if (!itemHocSinhMon) return null

            const monHocCode = itemHocSinhMon.MonHocCode.toLowerCase()
            const semester = this.Semester.value
            let maCotDiem = null

            if (key === 'TX1') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'Theme1_Total' : 'Theme5_Total')
                    : `TX_L1_${semester}`
            } else if (key === 'TX2') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'Theme2_Total' : 'Theme6_Total')
                    : `TX_L2_${semester}`
            } else if (key === 'TX3') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'Theme3_Total' : 'Theme7_Total')
                    : `TX_L3_${semester}`
            } else if (key === 'TX4') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'Theme4_Total' : 'Theme8_Total')
                    : `TX_L4_${semester}`
            } else if (key === 'TX5') {
                maCotDiem = `TX_L5_${semester}`
            } else if (key === 'GK') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'S1_Mid_Total_Point' : 'S2_Mid_Total_Point')
                    : `DiemGK_${semester}`
            } else if (key === 'CK') {
                maCotDiem = monHocCode === 'anh'
                    ? (semester === 'HK1' ? 'S1_Final_Total_Point' : 'S2_Final_Total_Point')
                    : `DiemCK_${semester}`
            } else if (key === 'DTB') {
                maCotDiem = `DiemTB_${semester}`
            }

            if (!maCotDiem) return null
            const lockKey = `${maCotDiem}_IsLock`
            if (!Object.prototype.hasOwnProperty.call(itemHocSinhMon, lockKey)) return null
            return itemHocSinhMon[lockKey]
        },

        async onLoadBangDiemLMS() {
            if (!this.LopItem?.LopID) return
            const res = await fetchPromise('lms/HocSinhBangDiem_Get_ByLopID_Semester', {
                Semester: this.Semester.value,
                NienKhoa: vueData.NienKhoa,
                LopID: this.LopItem.LopID,
            }, { cache: false })

            const hocSinhBangDiem = this.extractList(res)
            const newData = []
            const hocSinhIDs = [...new Set(hocSinhBangDiem.map(x => x.HocSinhID))]
            for (const hocSinhID of hocSinhIDs) {
                const obj = {
                    HocSinhID: hocSinhID,
                    DSCotDiem: [],
                }
                const cotDiemByHocSinh = hocSinhBangDiem.filter(x => x.HocSinhID === hocSinhID)
                const monHocCodes = [...new Set(cotDiemByHocSinh.map(x => x.MonHocCode))]
                for (const monHocCode of monHocCodes) {
                    const arrMonHoc = cotDiemByHocSinh.filter(x => x.MonHocCode === monHocCode)
                    const newObj = {
                        HocSinhID: hocSinhID,
                        MonHocCode: monHocCode,
                    }
                    for (const cd of arrMonHoc) {
                        newObj[cd.MaCotDiem] = cd.KetQuaDanhGia_VI
                        newObj[`${cd.MaCotDiem}_IsLock`] = cd.IsLock
                    }
                    obj.DSCotDiem.push(newObj)
                }
                newData.push(obj)
            }

            const arr = []
            for (const hs of newData) {
                arr.push(hs.DSCotDiem)
            }
            this.DSHocSinh_LMS = arr.flat()
            this.IsCompareLMS = true
        },

        async fnKeoDiem(selectedColumns = []) {
            const $this = this
            confirm({
                title: 'Xác nhận kéo điểm?',
                action: async () => {
                    const dataToPull = $this.buildPayloadBySelectedColumns($this.DSHocSinh_API_QLD, selectedColumns)
                    if (!dataToPull.length) {
                        $this.snackbarRef.value.show({ message: 'Không có dữ liệu để kéo điểm', color: 'warning' })
                        return
                    }

                    const taskMap = new Map()
                    for (const item of dataToPull) {
                        const key = `${item.HocSinhID}__${item.MonHocID}`
                        if (!taskMap.has(key)) {
                            taskMap.set(key, {
                                HocSinhID: item.HocSinhID,
                                MonHocID: item.MonHocID,
                                JsonData: [],
                            })
                        }
                        taskMap.get(key).JsonData.push(item)
                    }
                    const tasks = [...taskMap.values()]
                    $this.IsPullingDiem = true
                    $this.PullProgressTotal = tasks.length
                    $this.PullProgressCurrent = 0
                    $this.PullProgressText = 'Đang chuẩn bị kéo điểm...'

                    try {
                        for (const task of tasks) {
                            $this.PullProgressCurrent += 1
                            $this.PullProgressText = `Đang kéo HS ${task.HocSinhID} - môn ${task.MonHocID} (${$this.PullProgressCurrent}/${$this.PullProgressTotal})`
                            await fetchPromise(`lms/fn_HocSinh_KeoDiem_C${vueData.CapID}`, {
                                JsonData: task.JsonData,
                            }, { cache: false })
                        }

                        $this.PullProgressText = `Hoàn tất (${$this.PullProgressTotal}/${$this.PullProgressTotal})`
                        $this.snackbarRef.value.show({ message: 'Kéo điểm thành công', color: 'success' })
                        $this.IsShowDialogKeoDiem = false
                    } catch (error) {
                        $this.snackbarRef.value.show({ message: 'Kéo điểm thất bại', color: 'error' })
                    } finally {
                        $this.resetPullProgress()
                    }
                },
            })
        },
    },
}
</script>
