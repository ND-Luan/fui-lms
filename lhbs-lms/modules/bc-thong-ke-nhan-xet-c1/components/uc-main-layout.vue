<template>
    <Global>
        <template #header>
            <v-card>
                <v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
                <v-card-text>
                    <v-row align="center">
                        <v-col cols="12" sm="4" md="3">
                            <v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
                                item-value="LopID" return-object />
                        </v-col>
                        <v-col cols="12" sm="4" md="3">
                            <v-select
                                v-model="HocKiItem"
                                label="Chọn học kì"
                                :items="DSHocKi"
                                item-title="text"
                                item-value="value"
                            />
                        </v-col>
                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-switch
                                v-model="OnlyVuot"
                                color="error"
                                hide-details
                                inset
                                label="Chỉ hiển thị nhận xét vượt ký tự"
                            />
                            <v-btn variant="outlined" color="primary" :disabled="!LopItem || !HocKiItem" @click="getDS()">
                                <v-icon start>mdi-reload</v-icon>
                                Làm mới
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row class="pt-2" v-if="DS.length">
                        <v-col class="d-flex align-center ga-2 flex-wrap">
                            <v-chip color="error" variant="tonal" prepend-icon="mdi-alert-circle-outline">
                                Học sinh vượt: {{ SoDongVuot }}
                            </v-chip>
                            <v-chip color="primary" variant="tonal">Tổng học sinh: {{ DS.length }}</v-chip>
                            <span class="text-caption text-medium-emphasis">· Giới hạn mỗi nhóm: 400 kí tự &nbsp;·&nbsp; Click hàng để xem chi tiết từng môn</span>
                        </v-col>
                        <v-col cols="auto" class="text-right">
                            <span class="text-medium-emphasis">Học kì: <strong>{{ HocKiItem }}</strong></span>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </template>

        <v-divider />

        <GlobalDataTable
            :headers="headers"
            :items="DSHienThi"
            item-value="rowKey"
            items-per-page="-1"
            hide-default-footer
            hover
            show-expand
            expand-on-click
            v-data-table-height="calc(100dvh - 77px)"
        >
            <template #item.hocSinh="{ item }">
                <uc-info-student :item="item" />
            </template>

            <!-- Năng lực chung: số kí tự tổng + trạng thái -->
            <template #item.NangLucChung="{ item }">
                <div class="d-flex align-center ga-2">
                    <span :class="item.VuotNhanXet_NangLucChung ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
                        {{ item.KiTu_NangLucChung ?? '—' }}
                    </span>
                    <v-chip size="x-small" :color="item.VuotNhanXet_NangLucChung ? 'error' : 'success'" variant="tonal">
                        {{ item.VuotNhanXet_NangLucChung ? 'Vượt' : 'Đạt' }}
                    </v-chip>
                </div>
            </template>

            <!-- Năng lực đặc thù -->
            <template #item.NangLucDacThu="{ item }">
                <div class="d-flex align-center ga-2">
                    <span :class="item.VuotNhanXet_NangLucDacThu ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
                        {{ item.KiTu_NangLucDacThu ?? '—' }}
                    </span>
                    <v-chip size="x-small" :color="item.VuotNhanXet_NangLucDacThu ? 'error' : 'success'" variant="tonal">
                        {{ item.VuotNhanXet_NangLucDacThu ? 'Vượt' : 'Đạt' }}
                    </v-chip>
                </div>
            </template>

            <!-- Phẩm chất -->
            <template #item.PhamChat="{ item }">
                <div class="d-flex align-center ga-2">
                    <span :class="item.VuotNhanXet_PhamChat ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
                        {{ item.KiTu_PhamChat ?? '—' }}
                    </span>
                    <v-chip size="x-small" :color="item.VuotNhanXet_PhamChat ? 'error' : 'success'" variant="tonal">
                        {{ item.VuotNhanXet_PhamChat ? 'Vượt' : 'Đạt' }}
                    </v-chip>
                </div>
            </template>

            <!-- Chi tiết từng môn khi mở rộng hàng — nhóm được merge rowspan -->
            <template #expanded-row="{ columns, item }">
                <tr>
                    <td :colspan="columns.length" class="pa-3 bg-grey-lighten-5">
                        <p class="text-caption text-medium-emphasis mb-2">
                            <v-icon size="14">mdi-format-list-bulleted</v-icon>
                            Chi tiết nhận xét của <strong>{{ item.HoTen }}</strong>
                            <span class="ms-1">· Tính vượt theo tổng kí tự gộp cả nhóm ≥ 400</span>
                        </p>
                        <v-table density="compact" class="rounded elevation-0">
                            <thead>
                                <tr>
                                    <th style="width:230px">Nhóm nhận xét</th>
                                    <th style="width:200px">Môn/tiêu chí</th>
                                    <th style="min-width:320px">Nội dung nhận xét</th>
                                    <th class="text-right" style="width:100px">Kí tự (môn)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(ct, idx) in buildChiTietRows(item)" :key="ct.TenMon + idx">
                                    <!-- Ô nhóm merge nhiều dòng, hiển thị tổng + chip trạng thái nhóm -->
                                    <td v-if="ct.isFirstInGroup"
                                        :rowspan="ct.groupRowspan"
                                        class="align-top pt-2"
                                        style="border-right: 1px solid rgba(0,0,0,0.08); vertical-align: top">
                                        <div class="d-flex flex-column ga-1">
                                            <v-chip size="x-small" color="info" variant="tonal">{{ ct.NhomNhanXet }}</v-chip>
                                            <div class="d-flex align-center ga-1 mt-1">
                                                <span class="text-caption"
                                                    :class="ct.nhomVuot ? 'text-error font-weight-bold' : 'text-medium-emphasis'">
                                                    Tổng: {{ ct.nhomKiTu ?? '—' }} kí tự
                                                </span>
                                                <v-chip size="x-small" :color="ct.nhomVuot ? 'error' : 'success'" variant="tonal">
                                                    {{ ct.nhomVuot ? 'Vượt' : 'Đạt' }}
                                                </v-chip>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{{ ct.TenMon }}</td>
                                    <td style="max-width:480px">
                                        <span class="text-body-2">
                                            {{ expandedNhanXet[item.rowKey + ct.TenMon] ? ct.NhanXet : truncate(ct.NhanXet, 120) }}
                                        </span>
                                        <a v-if="ct.NhanXet && ct.NhanXet.length > 120"
                                            class="text-primary text-caption ms-1"
                                            style="cursor:pointer; white-space:nowrap"
                                            @click.stop="toggleNhanXet(item.rowKey + ct.TenMon)">
                                            {{ expandedNhanXet[item.rowKey + ct.TenMon] ? 'Thu gọn' : '…Xem thêm' }}
                                        </a>
                                    </td>
                                    <td class="text-right text-medium-emphasis">{{ ct.SoKyTu }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </td>
                </tr>
            </template>

            <template #no-data>
                <div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
                    <v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
                    <p class="text-body-2">Chọn lớp để xem dữ liệu</p>
                </div>
            </template>
        </GlobalDataTable>
    </Global>
</template>

<script>
export default {
    inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
    data() {
        return {
            vueData,
            LopItem: null,
            HocKiItem: 'GK_HK1',
            OnlyVuot: true,
            DSLop: [],
            DSHocKi: [
                { text: 'Giữa HK1', value: 'GK_HK1' },
                { text: 'Cuối HK1', value: 'CK_HK1' },
                { text: 'Giữa HK2', value: 'GK_HK2' },
                { text: 'Cuối HK2', value: 'CK_HK2' },
            ],
            DS: [],
            expandedNhanXet: {},
            headers: [
                { title: 'STT', key: 'STT', width: 70, align: 'center' },
                { title: 'Học sinh', key: 'hocSinh', width: 260 },
                { title: 'Lớp', key: 'TenLop', width: 110 },
                { title: 'Năng lực chung (kí tự)', key: 'NangLucChung', width: 200 },
                { title: 'Năng lực đặc thù (kí tự)', key: 'NangLucDacThu', width: 210 },
                { title: 'Phẩm chất (kí tự)', key: 'PhamChat', width: 180 },
            ],
        }
    },
    computed: {
        TitleCap() {
            return renderText(parseInt(vueData.CapID) || 1)
        },
        TitlePage() {
            return getTitlePageByURL(window.location.pathname + window.location.search)
        },
        DSHienThi() {
            if (!this.OnlyVuot) return this.DS
            return this.DS.filter((x) =>
                x.VuotNhanXet_NangLucChung || x.VuotNhanXet_NangLucDacThu || x.VuotNhanXet_PhamChat
            )
        },
        SoDongVuot() {
            return this.DS.filter((x) =>
                x.VuotNhanXet_NangLucChung || x.VuotNhanXet_NangLucDacThu || x.VuotNhanXet_PhamChat
            ).length
        },
    },
    watch: {
        'vueData.NienKhoa'() {
            this.LopItem = null
            this.DS = []
            this.getLop()
        },
        HocKiItem(v) {
            this.DS = []
            if (v && this.LopItem?.LopID) this.getDS()
        },
        LopItem(v) {
            this.DS = []
            if (v?.LopID && this.HocKiItem) this.getDS()
        },
    },
    mounted() {
        this.ensureCapIDDefault()
        const params = new URLSearchParams(window.location.search)
        const hk = params.get('hk')
        if (hk && this.DSHocKi.some((x) => x.value === hk)) this.HocKiItem = hk
        this.getLop(params.get('lopid'))
    },
    methods: {
        ensureCapIDDefault() {
            vueData.CapID = parseInt(vueData.CapID) || 1
        },
        async getLop(initLopID = null) {
            this.ensureCapIDDefault()
            const res = await fetchPromise('lms/Lop_Get_By_CapID', {
                NienKhoa: vueData.NienKhoa,
                CapID: vueData.CapID,
            })
            this.DSLop = res ?? []
            if (initLopID) {
                const found = this.DSLop.find((x) => String(x.LopID) === String(initLopID))
                if (found) this.LopItem = found
            }
        },
        async getDS() {
            if (!this.LopItem?.LopID || !this.HocKiItem) return
            const res = await fetchPromise('lms/BaoCao_ThongKe_NhanXet_Cap1', {
                LopID: `${this.LopItem.LopID}`,
                NienKhoa: vueData.NienKhoa,
                HocKi: `${this.HocKiItem}`,
            })

            const rows = Array.isArray(res) ? res : []

            // Gộp theo học sinh — 1 dòng/học sinh với tóm tắt 3 nhóm, mở rộng xem chi tiết từng môn
            const studentMap = new Map()
            rows.forEach((row) => {
                if (!studentMap.has(row.HocSinhID)) {
                    studentMap.set(row.HocSinhID, {
                        HocSinhID: row.HocSinhID,
                        HoTen: row.HoTen,
                        NgaySinh: row.NgaySinh,
                        SoDanhBo: row.SoDanhBo,
                        LopID: row.LopID,
                        TenLop: row.TenLop,
                        KiTu_NangLucChung: row.KiTu_NangLucChung,
                        VuotNhanXet_NangLucChung: row.VuotNhanXet_NangLucChung,
                        KiTu_NangLucDacThu: row.KiTu_NangLucDacThu,
                        VuotNhanXet_NangLucDacThu: row.VuotNhanXet_NangLucDacThu,
                        KiTu_PhamChat: row.KiTu_PhamChat,
                        VuotNhanXet_PhamChat: row.VuotNhanXet_PhamChat,
                        chiTiet: [],
                    })
                }
                studentMap.get(row.HocSinhID).chiTiet.push({
                    NhomNhanXet: row.NhomNhanXet,
                    TenMon: row.TenMon,
                    NhanXet: row.NhanXet,
                    SoKyTu: row.SoKyTu,
                    ConLai: row.ConLai,
                    VuotNhanXet: row.VuotNhanXet,
                })
            })
            this.DS = [...studentMap.values()].map((s, index) => ({
                ...s,
                STT: index + 1,
                rowKey: `${s.HocSinhID}`,
            }))
        },
        truncate(text, max) {
            if (!text) return '—'
            return text.length > max ? text.slice(0, max) : text
        },
        toggleNhanXet(key) {
            this.expandedNhanXet = { ...this.expandedNhanXet, [key]: !this.expandedNhanXet[key] }
        },
        buildChiTietRows(item) {
            const nhomMeta = {
                'Năng lực chung':  { kiTu: item.KiTu_NangLucChung,  vuot: item.VuotNhanXet_NangLucChung },
                'Năng lực đặc thù': { kiTu: item.KiTu_NangLucDacThu, vuot: item.VuotNhanXet_NangLucDacThu },
                'Phẩm chất':       { kiTu: item.KiTu_PhamChat,       vuot: item.VuotNhanXet_PhamChat },
            }
            // Gộp theo nhóm, giữ thứ tự xuất hiện
            const grouped = {}
            item.chiTiet.forEach((ct) => {
                if (!grouped[ct.NhomNhanXet]) grouped[ct.NhomNhanXet] = []
                grouped[ct.NhomNhanXet].push(ct)
            })
            const rows = []
            Object.entries(grouped).forEach(([nhom, list]) => {
                const meta = nhomMeta[nhom] || {}
                list.forEach((ct, idx) => {
                    rows.push({
                        ...ct,
                        isFirstInGroup: idx === 0,
                        groupRowspan: list.length,
                        nhomKiTu: meta.kiTu,
                        nhomVuot: meta.vuot,
                    })
                })
            })
            return rows
        },
    },
}
</script>
