<template>
	<Global>
        <template #header>
            <v-card>
                <v-card-title>
                    {{ TitlePage }} • {{ TitleCap }}
                    <v-chip color="primary" variant="tonal" size="small" class="ms-2">
                        Tổng số học sinh: {{ DSKhenThuong.length }}
                    </v-chip>
                </v-card-title>
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" sm="3">
                            <v-select v-model="KhoiItem" label="Chọn khối"
                                :items="[{ TenKhoiHoc: 'Tất cả các khối', KhoiID: '__all__', isAll: true }, ...DSKhoi]"
                                item-title="TenKhoiHoc" item-value="KhoiID" return-object />
                        </v-col>

                        <v-col cols="12" sm="3" v-if="!KhoiItem?.isAll">
                            <v-select v-model="LopItem" label="Chọn lớp"
                                :items="[{ TenLop: 'Xem tất cả các lớp', LopID: 'ALL' }, ...DSLop.filter(item => !item.LopID.includes('N'))]"
                                item-title="TenLop" item-value="LopID" return-object />
                        </v-col>

                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-btn variant="outlined" color="primary" @click="onRefresh">
                                <v-icon start>mdi-refresh</v-icon>
                                Làm mới
                            </v-btn>

                            <v-btn v-if="!isAfterDeadline" variant="outlined" color="primary"
                                prepend-icon="mdi-content-save"
                                :disabled="(!KhoiItem?.isAll && !LopItem) || DSKhenThuong.length === 0" @click="onSave">
                                Lưu khen thưởng
                            </v-btn>

                            <v-btn v-if="!isAfterDeadline" variant="outlined" color="teal"
                                prepend-icon="mdi-microsoft-excel"
                                :disabled="(!KhoiItem?.isAll && !LopItem) || DSKhenThuong.length === 0"
                                @click="openImport">
                                Nhập từ Excel
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <v-data-table-virtual :headers :items="DSKhenThuong" item-value="HocSinhID" :items-per-page="-1"
            hide-default-footer  style="max-height: calc(100dvh - 77px); overflow-y: auto;">
            <template #item.HocSinh="{ item }">
                <uc-info-student :item="item" />
            </template>

            <template #item.ThongTinKhenThuong="{ item }">
                <div class="d-flex flex-column ga-2 pa-2" style="min-width: 320px;">
                    <v-text-field v-model="item.VaoSoKT" label="Số vào sổ KT" hide-details="auto" />
                    <v-textarea v-model="item.DanhHieu" label="Danh hiệu" rows="2" hide-details="auto" />
                    <v-text-field v-model="item.SoQuyetDinhKT" label="Số quyết định KT" hide-details="auto" />
                    <div class="text-caption text-medium-emphasis mt-1">Giấy khen</div>
                    <v-text-field v-model="item.NgayKhenThuong_VI" label="Ngày khen thưởng (VI)" hide-details="auto" />
                    <v-text-field v-model="item.NgayKhenThuong_EN" label="Ngày khen thưởng (EN)" hide-details="auto" />
                    <div class="text-caption text-medium-emphasis mt-1">Thư khen</div>
                    <v-text-field v-model="item.NgayKhenThuong_ThuKhen_VI" label="Ngày khen thưởng - Thư khen (VI)"
                        hide-details="auto" />
                    <v-text-field v-model="item.NgayKhenThuong_ThuKhen_EN" label="Ngày khen thưởng - Thư khen (EN)"
                        hide-details="auto" />
                </div>
            </template>

            <template #item.HocSinhTieuBieu="{ item }">
                <div class="d-flex justify-center pa-2">
                    <v-checkbox-btn v-model="item.HocSinhTieuBieu" />
                </div>
            </template>

            <template #item.NoiDungThuKhen="{ item }">
                <div class="pa-2" style="min-width: 260px;">
                    <v-textarea v-model="item.NoiDungThuKhen" hide-details="auto"
                        placeholder="Nhập nội dung thư khen..." rows="3" auto-grow />
                </div>
            </template>

            <template #item.ThanhTichKhac="{ item }">
                <div class="pa-2" style="min-width: 260px;">
                    <v-textarea v-model="item.ThanhTichKhac" hide-details="auto" placeholder="Nhập thành tích khác..."
                        rows="3" auto-grow />
                </div>
            </template>

            <template #no-data>
                <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
                    <p class="text-body-2">Chọn lớp để xem danh sách khen thưởng</p>
                </div>
            </template>
        </v-data-table-virtual>

        <!-- Dialog loading tiến độ tải từng lớp -->
        <v-dialog v-model="loadingDialog.show" persistent width="400">
            <v-card>
                <v-card-title class="text-subtitle-1">{{ loadingDialog.title }}</v-card-title>
                <v-card-text>
                    <div class="mb-1 text-body-2">
                        Lớp: <strong>{{ loadingDialog.currentLopName }}</strong>
                        <span v-if="loadingDialog.totalLop > 0">
                            ({{ loadingDialog.currentLop }}/{{ loadingDialog.totalLop }})
                        </span>
                    </div>
                    <v-progress-linear
                        :model-value="loadingDialog.totalLop ? (loadingDialog.currentLop / loadingDialog.totalLop) * 100 : 0"
                        color="teal" rounded height="8" />
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog nhập liệu jspreadsheet -->
        <v-dialog v-model="isShowImportDialog" max-width="1200" persistent>
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between pb-2">
                    <span class="text-primary font-weight-medium">Nhập dữ liệu khen thưởng từ Excel</span>
                    <v-btn icon variant="text" size="small" @click="isShowImportDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text class="pt-4">
                    <div class="text-caption text-medium-emphasis mb-3">
                        Chọn các cột cần nhập, sau đó copy từ Excel và dán (Ctrl+V) vào bảng. Hệ thống sẽ tự map theo
                        HocSinhID khi bấm Áp dụng.
                    </div>
                    <v-row class="mb-2" align="center">
                        <v-col cols="12" md="8">
                            <v-select v-model="selectedImportFields" label="Chọn cột muốn nhập"
                                :items="availableImportFields" item-title="title" item-value="name" multiple chips
                                closable-chips />
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="text-caption text-medium-emphasis">
                                Cột HocSinhID là bắt buộc để map dữ liệu.
                            </div>
                        </v-col>
                    </v-row>
                    <uc-jexcel v-model="importInstance" v-model:dataSource="importData" :columns="importColumns"
                        :key="importKey" style="max-height: calc(100vh - 280px); overflow: auto;" />
                </v-card-text>
                <v-divider />
                <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn variant="outlined" color="secondary" @click="isShowImportDialog = false">Đóng</v-btn>
                    <v-btn color="teal" variant="flat" class="text-white" @click="applyImport">
                        <v-icon start>mdi-check</v-icon>
                        Áp dụng
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'confirmRef'],

    data() {
        return {
            vueData,
            CapID: vueData.CapID,
            DSKhoi: [],
            KhoiItem: null,
            DSLop: [],
            LopItem: null,
            DSKhenThuong: [],
            headers: [
                { title: 'Học sinh', key: 'HocSinh', align: 'center', width: 220, sortable: false },
                { title: 'Thông tin khen thưởng', key: 'ThongTinKhenThuong', sortable: false, minWidth: 340 },
                { title: 'Học sinh tiêu biểu', key: 'HocSinhTieuBieu', align: 'center', width: 150, sortable: false },
                { title: 'Nội dung thư khen', key: 'NoiDungThuKhen', sortable: false, minWidth: 280 },
                { title: 'Thành tích khác', key: 'ThanhTichKhac', sortable: false, minWidth: 280 },
            ],
            // Trạng thái cho chọn tất cả các lớp & loading dialog
            loadingDialog: {
                show: false,
                title: '',
                currentLopName: '',
                currentLop: 0,
                totalLop: 0
            },
            loadGeneration: 0,
            // Trạng thái nhập liệu jspreadsheet
            isShowImportDialog: false,
            importInstance: null,
            importData: [],
            importKey: 0,
            importColumns: [],
            availableImportFields: [
                { type: 'text', title: 'Số vào sổ KT', name: 'VaoSoKT', width: 110 },
                { type: 'text', title: 'Danh hiệu', name: 'DanhHieu', width: 220, align: 'left' },
                { type: 'text', title: 'Số quyết định KT', name: 'SoQuyetDinhKT', width: 130 },
                { type: 'text', title: 'Ngày KT - Giấy khen (VI)', name: 'NgayKhenThuong_VI', width: 160 },
                { type: 'text', title: 'Ngày KT - Giấy khen (EN)', name: 'NgayKhenThuong_EN', width: 160 },
                { type: 'dropdown', title: 'Tiêu biểu', name: 'HocSinhTieuBieu', source: ['Có', 'Không'], width: 100, align: 'center' },
                { type: 'text', title: 'Ngày KT - Thư khen (VI)', name: 'NgayKhenThuong_ThuKhen_VI', width: 170 },
                { type: 'text', title: 'Ngày KT - Thư khen (EN)', name: 'NgayKhenThuong_ThuKhen_EN', width: 170 },
                { type: 'text', title: 'Nội dung thư khen', name: 'NoiDungThuKhen', width: 260, align: 'left' },
                { type: 'text', title: 'Thành tích khác', name: 'ThanhTichKhac', width: 260, align: 'left' }
            ],
            selectedImportFields: ['VaoSoKT', 'DanhHieu', 'SoQuyetDinhKT', 'HocSinhTieuBieu', 'NoiDungThuKhen', 'ThanhTichKhac']
        }
    },

    computed: {
        TitleCap() {
            return renderText(parseInt(this.CapID))
        },
        TitlePage() {
            return getTitlePageByURL(window.location.pathname + window.location.search)
        },
        isAfterDeadline() {
            const now = new Date()
            const month = now.getMonth() + 1
            const day = now.getDate()
            return month > 5 || (month === 5 && day >= 26)
        },
    },

    watch: {
        'vueData.NienKhoa': {
            immediate: true,
            handler(value) {
                this.KhoiItem = null
                this.LopItem = null
                this.DSKhenThuong = []
                this.DSKhoi = []
                this.DSLop = []
                if (value !== null && value !== undefined) {
                    this.getDSKhoi()
                }
            },
        },
        KhoiItem(value) {
            this.LopItem = null
            this.DSLop = []
            this.DSKhenThuong = []
            if (value?.isAll) {
                this.getKhenThuongAllKhoi()
            } else if (value?.KhoiID) {
                this.getDSLop()
            }
        },
        LopItem(value) {
            this.DSKhenThuong = []
            if (value?.LopID) {
                this.getKhenThuong()
            }
        },
        selectedImportFields() {
            this.importColumns = this.buildImportColumns()
            this.resetImportData()
            this.importKey++
        }
    },

    methods: {
        extractList(res) {
            if (Array.isArray(res)) return res
            return res?.data ?? []
        },

        toBoolean(value) {
            if (typeof value === 'boolean') return value
            if (typeof value === 'number') return value === 1
            const normalized = String(value ?? '').trim().toLowerCase()
            return ['1', 'true', 'x', 'yes', 'có', 'co'].includes(normalized)
        },

        toFlag(value) {
            return this.toBoolean(value) ? 1 : 0
        },

        normalizeText(value) {
            return value == null ? '' : String(value)
        },

        normalizeItem(item) {
            return {
                ...item,
                VaoSoKT: this.normalizeText(item?.VaoSoKT),
                DanhHieu: this.normalizeText(item?.DanhHieu),
                SoQuyetDinhKT: this.normalizeText(item?.SoQuyetDinhKT),
                NgayKhenThuong_VI: this.normalizeText(item?.NgayKhenThuong_VI),
                NgayKhenThuong_EN: this.normalizeText(item?.NgayKhenThuong_EN),
                NgayKhenThuong_ThuKhen_VI: this.normalizeText(item?.NgayKhenThuong_ThuKhen_VI),
                NgayKhenThuong_ThuKhen_EN: this.normalizeText(item?.NgayKhenThuong_ThuKhen_EN),
                HocSinhTieuBieu: this.toBoolean(item?.HocSinhTieuBieu),
                NoiDungThuKhen: this.normalizeText(item?.NoiDungThuKhen),
                ThanhTichKhac: this.normalizeText(item?.ThanhTichKhac),
            }
        },

        buildImportColumns() {
            const idColumn = { type: 'text', title: 'HocSinhID', name: 'HocSinhID', width: 130 }
            const selected = this.availableImportFields.filter(field => this.selectedImportFields.includes(field.name))
            return [idColumn, ...selected]
        },

        resetImportData(rowCount = 40) {
            const template = {}
            for (const col of this.importColumns) {
                template[col.name] = ''
            }
            this.importData = Array.from({ length: rowCount }, () => ({ ...template }))
        },

        normalizeImportRows(writableFields) {
            const selectedTextFields = writableFields.filter(field => field !== 'HocSinhTieuBieu' && this.selectedImportFields.includes(field))
            const splitField = selectedTextFields.length === 1 ? selectedTextFields[0] : null
            if (!splitField) return this.importData

            const normalizedRows = []
            for (const rawRow of this.importData) {
                const row = { ...rawRow }
                const hocSinhID = String(row.HocSinhID ?? '').trim()
                const rawText = String(row[splitField] ?? '').replace(/\r/g, '').trim()

                if (!rawText) {
                    normalizedRows.push(row)
                    continue
                }

                const lines = rawText.split('\n').map(x => x.trim()).filter(Boolean)
                if (lines.length <= 1) {
                    normalizedRows.push(row)
                    continue
                }

                let currentRow = { ...row, HocSinhID: hocSinhID, [splitField]: '' }
                const appendText = (target, value) => {
                    target[splitField] = target[splitField] ? `${target[splitField]}\n${value}` : value
                }

                for (const line of lines) {
                    const match = line.match(/^(\d{6,})\s+(.+)$/)
                    if (match) {
                        if (String(currentRow.HocSinhID ?? '').trim() || String(currentRow[splitField] ?? '').trim()) {
                            normalizedRows.push({ ...currentRow })
                        }
                        currentRow = {
                            ...row,
                            HocSinhID: match[1],
                            [splitField]: match[2].trim()
                        }
                        continue
                    }
                    appendText(currentRow, line)
                }

                if (String(currentRow.HocSinhID ?? '').trim() || String(currentRow[splitField] ?? '').trim()) {
                    normalizedRows.push({ ...currentRow })
                }
            }

            return normalizedRows
        },

        isLoadActive(generation) {
            return generation === this.loadGeneration
        },

        buildPayload() {
            return this.DSKhenThuong.map(({ STT, ...item }) => ({
                ...item,
                NienKhoa: item.NienKhoa ?? this.LopItem?.NienKhoa ?? vueData.NienKhoa,
                HocSinhTieuBieu: this.toFlag(item.HocSinhTieuBieu),
                VaoSoKT: this.normalizeText(item.VaoSoKT).trim(),
                DanhHieu: this.normalizeText(item.DanhHieu).trim(),
                SoQuyetDinhKT: this.normalizeText(item.SoQuyetDinhKT).trim(),
                NgayKhenThuong_VI: this.normalizeText(item.NgayKhenThuong_VI).trim(),
                NgayKhenThuong_EN: this.normalizeText(item.NgayKhenThuong_EN).trim(),
                NgayKhenThuong_ThuKhen_VI: this.normalizeText(item.NgayKhenThuong_ThuKhen_VI).trim(),
                NgayKhenThuong_ThuKhen_EN: this.normalizeText(item.NgayKhenThuong_ThuKhen_EN).trim(),
                NoiDungThuKhen: this.normalizeText(item.NoiDungThuKhen).trim(),
                ThanhTichKhac: this.normalizeText(item.ThanhTichKhac).trim(),
            }))
        },

        showSnackbar(message, color = 'info') {
            this.snackbarRef?.value?.showSnackbar({ message, color })
        },

        async confirmAction(title) {
            const dialog = this.confirmRef?.value
            if (dialog?.show) {
                return dialog.show({ title, type: 'confirm' })
            }
            return window.confirm(title)
        },

        async getDSKhoi() {
            try {
                const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
                    CapID: this.CapID,
                    NienKhoa: vueData.NienKhoa,
                    HocKi: vueData.NienKhoaItem?.HocKi
                })
                this.DSKhoi = this.extractList(res)
            } catch (error) {
                this.DSKhoi = []
                this.showSnackbar('Không tải được danh sách khối', 'error')
            }
        },

        async getDSLop() {
            if (!this.KhoiItem?.KhoiID) {
                this.DSLop = []
                return
            }
            try {
                const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
                    NienKhoa: vueData.NienKhoa,
                    KhoiID: this.KhoiItem.KhoiID
                })
                this.DSLop = this.extractList(res)
            } catch (error) {
                this.DSLop = []
                this.showSnackbar('Không tải được danh sách lớp', 'error')
            }
        },

        async getKhenThuong() {
            const generation = ++this.loadGeneration
            if (!this.LopItem?.LopID) {
                this.DSKhenThuong = []
                return
            }
            if (this.LopItem.LopID === 'ALL') {
                try {
                    this.DSKhenThuong = []
                    const realLops = this.DSLop.filter(l => l.LopID !== 'ALL' && !String(l.LopID).includes('N'))
                    this.loadingDialog.show = true
                    this.loadingDialog.title = 'Đang tải khen thưởng các lớp...'
                    this.loadingDialog.totalLop = realLops.length
                    this.loadingDialog.currentLop = 0
                    this.loadingDialog.currentLopName = ''
                    
                    if (realLops.length === 0) {
                        this.showSnackbar('Không tìm thấy lớp học nào', 'warning')
                        return
                    }

                    for (let i = 0; i < realLops.length; i++) {
                        if (!this.isLoadActive(generation)) return
                        const lop = realLops[i]
                        this.loadingDialog.currentLopName = lop.TenLop
                        this.loadingDialog.currentLop = i + 1

                        const res = await fetchPromise('lms/KhenThuong_Get', {
                            LopID: lop.LopID,
                        }, { cache: false, silent: true })
                        if (!this.isLoadActive(generation)) return
                        const list = this.extractList(res).map(item => this.normalizeItem(item))
                        if (list.length > 0) {
                            this.DSKhenThuong.push(...list)
                        }
                    }
                    if (!this.isLoadActive(generation)) return
                    this.showSnackbar(`Tải thành công khen thưởng của ${realLops.length} lớp!`, 'success')
                } catch (error) {
                    if (this.isLoadActive(generation)) {
                        this.DSKhenThuong = []
                    }
                    this.showSnackbar('Không tải được dữ liệu khen thưởng hàng loạt', 'error')
                } finally {
                    if (this.isLoadActive(generation)) {
                        this.loadingDialog.show = false
                    }
                }
            } else {
                try {
                    const res = await fetchPromise('lms/KhenThuong_Get', {
                        LopID: this.LopItem.LopID,
                    }, { cache: false })
                    if (!this.isLoadActive(generation)) return
                    this.DSKhenThuong = this.extractList(res).map(item => this.normalizeItem(item))
                } catch (error) {
                    if (this.isLoadActive(generation)) {
                        this.DSKhenThuong = []
                    }
                    this.showSnackbar('Không tải được dữ liệu khen thưởng', 'error')
                }
            }
        },

        async getKhenThuongAllKhoi() {
            const generation = ++this.loadGeneration
            try {
                this.DSKhenThuong = []
                const realKhoi = this.DSKhoi
                if (!realKhoi || realKhoi.length === 0) return

                this.loadingDialog.show = true
                this.loadingDialog.title = 'Đang tải khen thưởng tất cả các lớp...'
                this.loadingDialog.totalLop = 0
                this.loadingDialog.currentLop = 0
                this.loadingDialog.currentLopName = ''

                let totalLop = 0
                for (const khoi of realKhoi) {
                    if (!this.isLoadActive(generation)) return
                    const res = await fetchPromise('lms/Lop_Get_ByKhoiID', {
                        NienKhoa: vueData.NienKhoa,
                        KhoiID: khoi.KhoiID
                    }, { silent: true })
                    if (!this.isLoadActive(generation)) return
                    const lops = this.extractList(res).filter(l => !String(l.LopID).includes('N'))
                    totalLop += lops.length
                    this.loadingDialog.totalLop = totalLop

                    for (const lop of lops) {
                        if (!this.isLoadActive(generation)) return
                        this.loadingDialog.currentLop += 1
                    this.loadingDialog.currentLopName = lop.TenLop

                    const res = await fetchPromise('lms/KhenThuong_Get', {
                        LopID: lop.LopID,
                    }, { cache: false, silent: true })
                        if (!this.isLoadActive(generation)) return
                        const list = this.extractList(res).map(item => this.normalizeItem(item))
                        if (list.length > 0) {
                            this.DSKhenThuong.push(...list)
                        }
                    }
                }

                if (!this.isLoadActive(generation)) return
                if (totalLop === 0) {
                    this.showSnackbar('Không tìm thấy lớp học nào', 'warning')
                    return
                }
                this.showSnackbar(`Tải thành công khen thưởng của tất cả ${totalLop} lớp!`, 'success')
            } catch (error) {
                if (this.isLoadActive(generation)) {
                    this.DSKhenThuong = []
                }
                this.showSnackbar('Không tải được dữ liệu khen thưởng của tất cả các khối', 'error')
            } finally {
                if (this.isLoadActive(generation)) {
                    this.loadingDialog.show = false
                }
            }
        },

        async onRefresh() {
            if (this.KhoiItem?.isAll) {
                await this.getKhenThuongAllKhoi()
            } else if (this.LopItem?.LopID) {
                await this.getKhenThuong()
            } else {
                this.showSnackbar('Vui lòng chọn khối hoặc lớp trước khi làm mới', 'warning')
            }
        },

        async onSave() {
            const hasSelection = this.KhoiItem?.isAll || this.LopItem?.LopID
            if (!hasSelection || this.DSKhenThuong.length === 0) {
                this.showSnackbar('Không có dữ liệu để lưu', 'warning')
                return
            }

            const ok = await this.confirmAction('Xác nhận lưu khen thưởng?')
            if (!ok) return

            try {
                await fetchPromise('lms/KhenThuong_Ins', {
                    Json_KhenThuong: this.buildPayload(),
                }, { cache: false })
                this.showSnackbar('Lưu khen thưởng thành công', 'success')
                if (this.KhoiItem?.isAll) {
                    await this.getKhenThuongAllKhoi()
                } else {
                    await this.getKhenThuong()
                }
            } catch (error) {
                this.showSnackbar('Lưu khen thưởng thất bại', 'error')
            }
        },

        openImport() {
            const hasSelection = this.KhoiItem?.isAll || this.LopItem?.LopID
            if (!hasSelection || this.DSKhenThuong.length === 0) {
                this.showSnackbar('Vui lòng chọn khối/lớp có học sinh để nhập', 'warning')
                return
            }
            this.importColumns = this.buildImportColumns()
            this.resetImportData()
            this.importKey++
            this.isShowImportDialog = true
        },

        applyImport() {
            let count = 0
            const selectedSet = new Set(this.selectedImportFields)
            const writableFields = ['VaoSoKT', 'DanhHieu', 'SoQuyetDinhKT', 'NgayKhenThuong_VI', 'NgayKhenThuong_EN', 'HocSinhTieuBieu', 'NgayKhenThuong_ThuKhen_VI', 'NgayKhenThuong_ThuKhen_EN', 'NoiDungThuKhen', 'ThanhTichKhac']
            const normalizedRows = this.normalizeImportRows(writableFields)
            for (const row of normalizedRows) {
                const hocSinhID = String(row.HocSinhID ?? '').trim()
                if (!hocSinhID) continue
                const target = this.DSKhenThuong.find(x => String(x.HocSinhID) === hocSinhID)
                if (target) {
                    for (const field of writableFields) {
                        if (!selectedSet.has(field)) continue
                        if (field === 'HocSinhTieuBieu') {
                            target.HocSinhTieuBieu = this.toBoolean(row[field])
                        } else {
                            target[field] = String(row[field] ?? '').trim()
                        }
                    }
                    count++
                }
            }
            this.isShowImportDialog = false
            this.showSnackbar(`Đã map dữ liệu import cho ${count} học sinh theo HocSinhID. Nhớ bấm "Lưu khen thưởng" để lưu lại!`, 'success')
        },
    },
	}
</script>