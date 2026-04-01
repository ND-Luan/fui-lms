<template>
    <Global>
        <template #header>
            <v-card>
                <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" sm="3">
                            <v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLopDisplay"
                                item-value="LopID" return-object />
                        </v-col>

                        <v-col cols="12" sm="3">
                            <v-select v-model="MonHocItem" label="Chọn môn học" :items="DSMonHoc" item-title="TenMonHoc"
                                item-value="MonHocID" :disabled="!LopItem" return-object />
                        </v-col>

                        <v-col cols="12" sm="3">
                            <v-select v-model="MaNhomCotDiemItem" label="Nhóm cột điểm" :items="DSMaNhomCotDiem"
                                item-title="TenNhomCotDiemDisplay" item-value="MaNhomCotDiem" :disabled="!MonHocItem"
                                return-object />
                        </v-col>

                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-btn variant="outlined" color="primary" @click="onRefresh">
                                <v-icon start>mdi-reload</v-icon>
                                Làm mới
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <v-data-table v-model="DSSelected" :headers="headers" :items="DS" item-value="MaCotDiem" :show-select="true"
            items-per-page="-1" hide-default-footer hover style="max-height: calc(100dvh - 77px); overflow-y: auto;">
            <template #item.actions="{ item }">
                <v-btn size="small" :color="item.IsLocked ? 'warning' : 'success'" variant="tonal"
                    @click="onClickToggle(item)">
                    <v-icon start>{{ item.IsLocked ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
                    {{ item.IsLocked ? 'Mở khóa' : 'Khóa' }}
                </v-btn>
            </template>

            <template #item.TenTinhTrang="{ item }">
                <v-chip size="x-small" :color="item.MauTinhTrang || 'default'" variant="tonal">
                    {{ item.TenTinhTrang || 'Chưa cập nhật' }}
                </v-chip>
            </template>

            <template #no-data>

                <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
                    <p class="text-body-2">Chọn lớp để xem danh sách khóa cột điểm</p>
                </div>
            </template>
        </v-data-table>

        <uc-dialog v-model="dialogKhoa.show" title="Xác nhận mở khóa" done-text="Xác nhận"
            @onSubmit="onConfirmMoKhoa">
            <v-textarea v-model="dialogKhoa.LyDo" label="Lý do mở khóa" rows="3" auto-grow
                placeholder="Nhập lý do mở khóa cột điểm..." />
        </uc-dialog>
    </Global>
</template>

<script>
export default {
    inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
    data() {
        return {
            vueData,
            CapID: vueData.CapID,
            DSLop: [],
            LopItem: null,
            DSMonHoc: [],
            MonHocItem: null,
            DSMaNhomCotDiem: [],
            MaNhomCotDiemItem: null,
            DS: [],
            DSSelected: [],
            dialogKhoa: { show: false, item: null, LyDo: '' },
            headers: [
                { title: 'STT', key: 'STT', width: 60 },
                { title: 'Mã cột điểm', key: 'MaCotDiem', minWidth: 160 },
                { title: 'Tên cột điểm', key: 'TenCotDiem_VI', minWidth: 220 },
                { title: 'Tình trạng', key: 'TenTinhTrang', minWidth: 120, sortable: false },
                { title: 'Thao tác', key: 'actions', width: 130, sortable: false },
            ],
        }
    },
    computed: {
        TitleCap() { return renderText(parseInt(this.CapID)) },
        TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
        HocKi() { return vueData.NienKhoaItem?.HocKi },
        HocKiCode() { return this.HocKi === 1 ? 'HK1' : 'HK2' },
    },
    watch: {
        LopItem(v) {
            this.MonHocItem = null
            this.DSMonHoc = []
            this.MaNhomCotDiemItem = null
            this.DSMaNhomCotDiem = []
            this.DS = []
            if (v) this.getMonHoc()
        },
        MonHocItem(v) {
            this.MaNhomCotDiemItem = null
            this.DSMaNhomCotDiem = []
            this.DS = []
            if (v) this.getMaNhomCotDiem()
        },
        MaNhomCotDiemItem(v) {
            this.DS = []
            if (v) this.getDS()
        },
    },
    mounted() {
        this.getAllLop()
    },
    methods: {
        async getAllLop() {
            const resKhoi = await fetchPromise('lms/KhoiHocByCapHoc_Get', { CapID: this.CapID })
            const dsKhoi = resKhoi.data ?? resKhoi ?? []
            if (!dsKhoi.length) return
            const batch = dsKhoi.map(khoi => ({
                url: 'lms/Lop_Get_ByKhoiID',
                params: { NienKhoa: vueData.NienKhoa, KhoiID: khoi.KhoiID },
            }))
            const results = await fetchBatchPromise(batch)
            const dsLop = []
            results.forEach((res, idx) => {
                const lops = res.data ?? res ?? []
                const khoi = dsKhoi[idx]
                lops.forEach(lop => dsLop.push({
                    ...lop,
                    TenLopDisplay: `${lop.TenLop} (${khoi.TenKhoiHoc})`,
                    KhoiID: khoi.KhoiID,
                }))
            })
            this.DSLop = dsLop
        },
        async getMonHoc() {
            if (!this.LopItem) return
            const res = await fetchPromise('lms/MonHoc_Get_ByLopID_BoMon', {
                LopID: this.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
                HocKi: this.HocKi,
            })
            const dsMonHoc = res.data ?? res ?? []
            this.DSMonHoc = dsMonHoc.map(x => ({
                ...x,
                TenMonHoc: x.TenMonHoc_HienThi || x.TenMonHoc || '',
            }))
            if (this.DSMonHoc.length === 1) this.MonHocItem = this.DSMonHoc[0]
        },
        async getMaNhomCotDiem() {
            if (!this.MonHocItem) return
            const res = await fetchPromise('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID', {
                TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
            })
            const dsNhom = res.data ?? res ?? []
            this.DSMaNhomCotDiem = dsNhom
                .filter(x => x.Semester === this.HocKiCode)
                .map(x => ({
                    ...x,
                    TenNhomCotDiemDisplay: x.TenNhomCotDiem_VI || x.MaNhomCotDiem,
                }))
            if (this.DSMaNhomCotDiem.length === 1) this.MaNhomCotDiemItem = this.DSMaNhomCotDiem[0]
        },
        async getDS() {
            if (!this.LopItem || !this.MonHocItem || !this.MaNhomCotDiemItem) {
                this.DS = []
                return
            }
            try {
                const [resBangDiem, resKhoaCotDiem] = await Promise.all([
                    fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom', {
                        LopID: this.LopItem.LopID,
                        MonHocID: this.MonHocItem.MonHocID,
                        TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
                        MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                        ThuTuNhom: this.MaNhomCotDiemItem.ThuTuNhom,
                        Semester: this.MaNhomCotDiemItem.Semester,
                        NienKhoa: vueData.NienKhoa,
                        KhoiID: this.LopItem.KhoiID,
                    }, { cache: false }),
                    fetchPromise('lms/KhoaCotDiem_Get', {
                        LopID: this.LopItem.LopID,
                        MonHocLopID: this.MonHocItem.MonHocLopID,
                        MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                        Semester: this.MaNhomCotDiemItem.Semester,
                        NienKhoa: vueData.NienKhoa,
                    }, { cache: false }),
                ])

                const dsBangDiem = resBangDiem.data ?? resBangDiem ?? []
                const dsKhoaCotDiem = resKhoaCotDiem.data ?? resKhoaCotDiem ?? []

                const firstHocSinhID = dsBangDiem[0]?.HocSinhID
                const dsCotDiemTheoNhom = firstHocSinhID
                    ? dsBangDiem.filter(x => x.HocSinhID === firstHocSinhID)
                    : []

                const khoaMap = dsKhoaCotDiem.reduce((acc, item) => {
                    acc[item.MaCotDiem] = { TinhTrang: item.TinhTrang, KhoaCotDiemID: item.KhoaCotDiemID }
                    return acc
                }, {})

                this.DS = dsCotDiemTheoNhom.map((cotDiem, index) => {
                    const khoaInfo = khoaMap[cotDiem.MaCotDiem] || {}
                    const isLocked = !!khoaInfo.TinhTrang
                    return {
                        STT: index + 1,
                        MaCotDiem: cotDiem.MaCotDiem,
                        TenCotDiem_VI: cotDiem.TenCotDiem_VI || cotDiem.MaCotDiem,
                        KhoaCotDiemID: khoaInfo.KhoaCotDiemID || null,
                        IsLocked: isLocked,
                        TenTinhTrang: isLocked ? 'Đã khóa' : 'Chưa khóa',
                        MauTinhTrang: isLocked ? 'success' : 'warning',
                    }
                })
            } catch (error) {
                this.DS = []
            }
        },
        _confirm() {
            return this.confirmRef?.value
        },
        onClickToggle(item) {
            if (item.IsLocked && item.KhoaCotDiemID) {
                this.dialogKhoa = { show: true, item, LyDo: '' }
            } else {
                this.onLock(item)
            }
        },
        async onLock(item) {
            const ok = await this._confirm()?.show({ title: `Khóa cột điểm "${item.TenCotDiem_VI}"?`, type: 'confirm' })
            if (!ok) return
            if (item.KhoaCotDiemID) {
                await fetchPromise('lms/KhoaCotDiem_TinhTrang_Upd_ByKhoaCotDiem', {
                    KhoaCotDiemID: item.KhoaCotDiemID,
                    TinhTrang: 1,
                    LyDo: '',
                }, { cache: false })
            } else {
                await fetchPromise('lms/KhoaCotDiem_Ins_And_Upd', {
                    LopID: this.LopItem.LopID,
                    MonHocLopID: this.MonHocItem.MonHocLopID,
                    MaCotDiem: item.MaCotDiem,
                    MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                    Semester: this.MaNhomCotDiemItem.Semester,
                    NienKhoa: vueData.NienKhoa,
                    TinhTrang: 1,
                }, { cache: false })
            }
            this.snackbarRef.value.showSnackbar({ message: 'Khóa cột điểm thành công', color: 'success' })
            this.getDS()
        },
        async onConfirmMoKhoa() {
            if (!this.dialogKhoa.LyDo?.trim()) {
                this.snackbarRef.value.showSnackbar({ message: 'Vui lòng nhập lý do mở khóa', color: 'error' })
                return
            }
            await fetchPromise('lms/KhoaCotDiem_TinhTrang_Upd_ByKhoaCotDiem', {
                KhoaCotDiemID: this.dialogKhoa.item.KhoaCotDiemID,
                TinhTrang: 0,
                LyDo: this.dialogKhoa.LyDo.trim(),
            }, { cache: false })
            this.dialogKhoa.show = false
            this.snackbarRef.value.showSnackbar({ message: 'Mở khóa thành công', color: 'success' })
            this.getDS()
        },
        async onRefresh() {
            if (!this.MaNhomCotDiemItem) {
                this.snackbarRef.value.showSnackbar({
                    message: 'Vui lòng chọn đủ bộ lọc trước khi làm mới',
                    color: 'warning',
                })
                return
            }
            await this.getDS()
        },
    },
}
</script>
