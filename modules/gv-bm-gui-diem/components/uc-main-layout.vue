<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi"
								item-title="TenKhoiHoc" item-value="KhoiID" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop"
								item-title="TenLop" item-value="LopID" :disabled="!KhoiItem" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="MonHocItem" label="Chọn môn học" :items="DSMonHoc"
								item-title="TenMonHoc_HienThi" item-value="MonHocID" :disabled="!LopItem" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="MaNhomCotDiemItem" label="Chọn nhóm điểm" :items="DSNhomDiem"
								item-title="TenNhomCotDiem_VI" item-value="MaNhomCotDiem" :disabled="!MonHocItem" return-object />
						</v-col>
					</v-row>
					<v-row v-if="DSHocSinh.length > 0" align="center" class="mt-0">
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<span class="text-body-2 font-weight-medium text-primary">Giáo viên bộ môn gửi điểm</span>
							<v-chip v-if="showLyDoTuChoi" size="small" color="error" variant="tonal">
								Lý do: <span class="text-red ml-1">{{ DSHocSinh[0].NoiDungNhanXet }}</span>
							</v-chip>
							<v-spacer />
							<v-btn color="primary" variant="outlined" prepend-icon="mdi-send"
								:disabled="DSHocSinhSelected.length === 0 || TinhTrang?.isDisabled"
								@click="onGuiDiem">
								Gửi điểm ({{ DSHocSinhSelected.length }})
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<v-data-table v-model="DSHocSinhSelected" :headers :items="DSHocSinh" item-value="HocSinhID"
			:show-select="true" items-per-page="-1" hide-default-footer hover
			style="max-height: calc(100dvh - 77px); overflow-y: auto;">
			<template #item.hocSinh="{ item }">
				<uc-info-student :item="item" />
			</template>
			<template #item.TenTinhTrang="{ item }">
				<v-chip size="x-small" :color="item.MauTinhTrang || 'default'" variant="tonal">
					{{ item.TenTinhTrang }}
				</v-chip>
			</template>
			<template #no-data>
				<div class="d-flex flex-column align-center justify-center py-12 text-medium-emphasis">
					<v-icon size="48" class="mb-3 opacity-40">mdi-table-search</v-icon>
					<p class="text-body-2">Chọn lớp, môn học và nhóm điểm để xem danh sách học sinh</p>
				</div>
			</template>
		</v-data-table>
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
            DSMonHoc: [],
            DSNhomDiem: [],
            KhoiItem: null,
            LopItem: null,
            MonHocItem: null,
            MaNhomCotDiemItem: null,
            DSHocSinh: [],
            DSHocSinhSelected: [],
            headers: [],
            TinhTrang: null,
            VaiTro: 0,
            Is_MonHoc_GiangDay: false,
            EnumTinhTrang: {
                ChuaLuu: 0, LuuTam: 1, GVBM_GuiDiem: 2, GVCN_TuChoi_GVBM: 3,
                GVCN_GuiDiem: 4, TT_TuChoi: 5, TT_GuiBGH: 6, BGH_TuChoi: 7, BGH_Duyet: 8,
            },
        }
    },

    computed: {
        TitleCap() { return renderText(parseInt(vueData.CapID)) },
        TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
        showLyDoTuChoi() {
            const tt = this.DSHocSinh[0]?.TinhTrang
            return tt === 3 || tt === 5 || tt === 7
        },
    },

    watch: {
        'vueData.NienKhoa'() {
            this.LopItem = null
            this.MonHocItem = null
            this.MaNhomCotDiemItem = null
            this.DSLop = []
            this.DSMonHoc = []
            this.DSNhomDiem = []
            this.DSHocSinh = []
            this.getLop()
        },
        KhoiItem(val) {
            if (!val?.KhoiID) return
            this.LopItem = null
            this.MonHocItem = null
            this.MaNhomCotDiemItem = null
            this.DSLop = []
            this.DSMonHoc = []
            this.DSNhomDiem = []
            this.DSHocSinh = []
            this.getLop()
        },
        LopItem(val) {
            if (!val?.LopID) return
            this.MonHocItem = null
            this.MaNhomCotDiemItem = null
            this.DSHocSinh = []
            this.getMonHoc()
        },
        MonHocItem(val) {
            if (!val?.MonHocID) return
            this.MaNhomCotDiemItem = null
            this.DSHocSinh = []
            this.checkVaiTro()
            this.getNhomCauTrucDiem()
        },
        MaNhomCotDiemItem(val) {
            if (!val) return
            this.DSHocSinh = []
            this.loadHocSinhBangDiem()
        },
    },

    mounted() {
        this.getKhoi()
    },

    methods: {
        async getKhoi() {
            this.DSKhoi = await fetchPromise('lms/KhoiHocByCapHoc_Get', { CapID: vueData.CapID })
        },

        async getLop() {
            if (!this.KhoiItem?.KhoiID) return
            this.DSLop = await fetchPromise('lms/Lop_Get_ByKhoiID', {
                NienKhoa: vueData.NienKhoa,
                KhoiID: this.KhoiItem.KhoiID,
            })
        },

        async getMonHoc() {
            this.DSMonHoc = await fetchPromise('lms/MonHoc_Get_ByLopID_BoMon', {
                NienKhoa: vueData.NienKhoa,
                LopID: this.LopItem.LopID,
                HocKi: vueData.NienKhoaItem?.HocKi,
            })
        },

        async checkVaiTro() {
            const res = await fetchPromise('lms/CheckVaiTro_By_GiaoVienID_LopID_MonHocID', {
                LopID: this.LopItem.LopID,
                MonHocID: this.MonHocItem.MonHocID,
                HocKi: vueData.NienKhoaItem?.HocKi,
            })
            this.VaiTro = res.VaiTro
            this.Is_MonHoc_GiangDay = res.Is_MonHoc_GiangDay
        },

        async getNhomCauTrucDiem() {
            this.DSNhomDiem = await fetchPromise('lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID', {
                TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
            })
        },

        async loadHocSinhBangDiem() {
            const res = await fetchPromise('lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom', {
                LopID: this.LopItem.LopID,
                MonHocID: this.MonHocItem.MonHocID,
                TemplateBangDiemID: this.MonHocItem.TemplateBangDiemID,
                MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
            }, { cache: false })
            this.TinhTrang = fn_IsDisabledTinhTrangDiem(
                fn_ProrityTinhTrang(res).TinhTrang,
                'GV',
                vueData.CapID,
            )
            this.renderDSHocSinh(res)
        },

        renderDSHocSinh(DSHocSinh_API) {
            if (!DSHocSinh_API.length) return
            const ListCotDiemFilter = [
                'GK_C1_HK1', 'GK_C2_HK1', 'GK_C3_HK1', 'GK_C4_HK1', 'GK_C5_HK1',
                'GK_C6_HK1', 'GK_C7_HK1', 'GK_C8_HK1', 'GK_C9_HK1', 'GK_C10_HK1',
                'CK_C1_HK1', 'CK_C2_HK1', 'CK_C3_HK1', 'CK_C4_HK1', 'CK_C5_HK1',
                'CK_C6_HK1', 'CK_C7_HK1', 'CK_C8_HK1', 'CK_C9_HK1', 'CK_C10_HK1',
            ]
            const firstStudentID = DSHocSinh_API[0].HocSinhID
            const arrFirst = DSHocSinh_API.filter(x => x.HocSinhID === firstStudentID)
            const uniqueMaCotDiem = [...new Set(arrFirst.map(x => x.MaCotDiem))].filter(x => !ListCotDiemFilter.includes(x))

            const headers = [{ key: 'hocSinh', title: 'Học sinh', align: 'center', width: 180, sortable: false }]
            for (const maCotDiem of uniqueMaCotDiem) {
                const col = DSHocSinh_API.find(x => x.MaCotDiem === maCotDiem)
                headers.push({
                    title: col.TenCotDiem_VI,
                    value: col.MaCotDiem,
                    align: (col.GiaTriCotDiem === 'number' || col.MaCotDiem.includes('MucDoDanhGia')) ? 'center' : 'start',
                    width: col.WidthCSS,
                })
            }
            this.headers = headers

            const dsHocSinhID = [...new Set(DSHocSinh_API.map(x => x.HocSinhID))]
            const _dsHocSinh = []
            for (const HocSinhID of dsHocSinhID) {
                const objHocSinh = DSHocSinh_API.find(x => x.HocSinhID === HocSinhID)
                if (!objHocSinh) continue
                const obj = {
                    HocSinhID: objHocSinh.HocSinhID,
                    HoTen: objHocSinh.HoTen,
                    NgaySinh: objHocSinh.NgaySinh,
                    SoDanhBo: objHocSinh.SoDanhBo,
                    TinhTrang: objHocSinh.TinhTrang,
                    TenTinhTrang: objHocSinh.TenTinhTrang,
                    MauTinhTrang: objHocSinh.MauTinhTrang,
                    NoiDungNhanXet: objHocSinh.NoiDungNhanXet ?? '',
                }
                for (const item of DSHocSinh_API.filter(x => x.HocSinhID === HocSinhID)) {
                    obj[item.MaCotDiem] = item.KetQuaDanhGia_VI || item.KetQuaDanhGia_EN
                }
                _dsHocSinh.push(obj)
            }
            this.DSHocSinh = _dsHocSinh
            this.DSHocSinhSelected = _dsHocSinh.map(x => x.HocSinhID)
        },

        onGuiDiem() {
            confirm({
                title: `Xác nhận — Gửi điểm cho ${this.DSHocSinh[0]?.TinhTrang === this.EnumTinhTrang.TT_TuChoi ? 'Tổ trưởng' : 'Giáo viên chủ nhiệm'}`,
                action: () => {
                    ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                        NienKhoa: vueData.NienKhoa,
                        MonHocLopID: this.MonHocItem.MonHocLopID,
                        LopID: this.LopItem.LopID,
                        TinhTrang: 2,
                        MaNhomCotDiem: this.MaNhomCotDiemItem.MaNhomCotDiem,
                    }, () => { this.loadHocSinhBangDiem() })
                },
            })
        },
    },
}
</script>
