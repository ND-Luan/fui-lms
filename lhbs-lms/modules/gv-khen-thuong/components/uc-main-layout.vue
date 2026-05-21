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
                            <v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
                                item-value="LopID" return-object />
                        </v-col>

                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-btn variant="outlined" color="primary" @click="onRefresh">
                                <v-icon start>mdi-refresh</v-icon>
                                Làm mới
                            </v-btn>

                            <v-btn v-if="!isAfterDeadline" variant="outlined" color="primary" prepend-icon="mdi-content-save"
                                :disabled="!LopItem || DSKhenThuong.length === 0" @click="onSave">
                                Lưu khen thưởng
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <v-data-table :headers="headers" :items="DSKhenThuong" item-value="HocSinhID" items-per-page="-1"
            hide-default-footer hover style="max-height: calc(100dvh - 77px); overflow-y: auto;">
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
        </v-data-table>
    </Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'confirmRef'],

    data() {
        return {
            vueData,
            CapID: vueData.CapID,
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
            return month > 5 || (month === 5 && day >= 21)
        },
    },

    watch: {
        'vueData.NienKhoa': {
            immediate: true,
            handler(value) {
                this.LopItem = null
                this.DSKhenThuong = []
                this.DSLop = []
                if (value !== null && value !== undefined) {
                    this.getDSLop()
                }
            },
        },
        LopItem(value) {
            this.DSKhenThuong = []
            if (value?.LopID) {
                this.getKhenThuong()
            }
        },
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
            return ['1', 'true', 'x', 'yes'].includes(normalized)
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

        async getDSLop() {
            try {
                const res = await fetchPromise('lms/Lop_Get_By_CapID', {
                    NienKhoa: vueData.NienKhoa,
                    CapID: this.CapID,
                })
                this.DSLop = this.extractList(res)
            } catch (error) {
                this.DSLop = []
                this.showSnackbar('Không tải được danh sách lớp', 'error')
            }
        },

        async getKhenThuong() {
            if (!this.LopItem?.LopID) {
                this.DSKhenThuong = []
                return
            }
            try {
                const res = await fetchPromise('lms/KhenThuong_Get', {
                    LopID: this.LopItem.LopID,
                }, { cache: false })
                this.DSKhenThuong = this.extractList(res).map(item => this.normalizeItem(item))
            } catch (error) {
                this.DSKhenThuong = []
                this.showSnackbar('Không tải được dữ liệu khen thưởng', 'error')
            }
        },

        async onRefresh() {
            if (!this.LopItem?.LopID) {
                this.showSnackbar('Vui lòng chọn lớp trước khi làm mới', 'warning')
                return
            }
            await this.getKhenThuong()
        },

        async onSave() {
            if (!this.LopItem?.LopID || this.DSKhenThuong.length === 0) {
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
                await this.getKhenThuong()
            } catch (error) {
                this.showSnackbar('Lưu khen thưởng thất bại', 'error')
            }
        },
    },
	}
</script>