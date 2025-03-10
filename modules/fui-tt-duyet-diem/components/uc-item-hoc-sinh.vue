<template>
    <v-row class="ma-9">
        <v-col cols="2" class="text-center">
            <v-avatar color="grey" size="80">
                <v-img :src="urlAvatarHocSinh + hocSinh?.HocSinhID" cover></v-img>
            </v-avatar>
            <p class="font-weight-medium ">{{ hocSinh?.HoTen }} <uc-gender v-model="hocSinh.Nu" /></p>
            <p class="text-body-2">{{ hocSinh.HocSinhID }} • {{ hocSinh?.NgaySinh }}</p>
            <v-divider class="my-2"></v-divider>
            <!-- Nội dung từ chối -->
            <div class="text-left">
                <p class="font-weight-medium text-title text-red">Nội dung từ chối:</p>
                <span class="text-body-2">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex odit facilis vero
                    omnis
                    corrupti explicabo cumque eum delectus aut? Ex soluta nihil esse vitae ducimus ea aliquam laboriosam
                    recusandae sint.
                </span>
            </div>
        </v-col>
        <v-col cols="10">
            <v-tabs v-model="tab">
                <v-tab :value="0" :key="0">Môn học chính khóa</v-tab>
                <v-tab :value="1" :key="1">Môn học bổ trợ</v-tab>
                <v-tab :value="2" :key="2">Môn học Tiếng Anh</v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item :value="0" :key="0">
                    <v-data-table class="custom-border border-t-sm" :headers="headers_ChinhKhoa"
                        :items="items_ChinhKhoa" :items-per-page="-1" hide-default-footer>
                        <template #item.actions="{ item }">
                            <div class="d-flex ga-4 pa-2">
                                <v-btn color="red">
                                    Từ chối
                                </v-btn>
                                <v-btn color="primary">
                                    Gửi BGH
                                </v-btn>
                            </div>
                        </template>
                    </v-data-table>
                </v-tabs-window-item>

                <v-tabs-window-item :value="1" :key="1">
                    <v-card class="mt-2" border v-for="monHoc in DSMonHoc_BoTro" :key="monHoc.MonHocID">
                        <v-card-title class="d-flex text-primary">
                            {{ monHoc.TenMonDuLieuNganh }}
                            <v-spacer></v-spacer>
                            <div class="d-flex ga-4 pa-2">
                                <v-btn color="red">
                                    Từ chối
                                </v-btn>
                                <v-btn color="primary">
                                    Gửi BGH
                                </v-btn>
                            </div>
                        </v-card-title>
                        <v-data-table class="custom-border border-t-sm" :headers="monHoc.headers" :items="monHoc.items"
                            :items-per-page="-1" hide-default-footer>
                        </v-data-table>
                    </v-card>
                </v-tabs-window-item>

                <v-tabs-window-item :value="2" :key="2"></v-tabs-window-item>
            </v-tabs-window>
        </v-col>
    </v-row>
</template>
<script>
export default {
    props: {
        modelValue: {
            type: Object,
        }
    },
    data() {
        const DSMonHoc = _.cloneDeep(vueData.DSMonHoc)
        //Xử lý gắn headers và items => dữ liệu cho từng môn học
        for (var monHoc of DSMonHoc) {
            let headers = []
            let items = []
            if (!monHoc.Is_ChinhKhoa) {
                headers = this.handleHeaders(monHoc)
                items = this.handleItems(monHoc)
            }
            monHoc.headers = headers
            monHoc.items = items
        }

        return {
            hocSinh: this.modelValue,
            urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh,
            DSMonHoc_ChinhKhoa: DSMonHoc.filter(x => x.Is_ChinhKhoa),
            DSMonHoc_BoTro: DSMonHoc.filter(x => !x.Is_ChinhKhoa),
            MonHocItem: null,
            tab: 0,
            vueData,
            headers_ChinhKhoa: this.handleHeaders_ChinhKhoa(DSMonHoc.filter(x => x.Is_ChinhKhoa)[0]),
            items_ChinhKhoa: this.handleItems_ChinhKhoa()
        }
    },
    methods: {
        handleHeaders(monHoc) {
            let arr = []
            const DSCotDiem = this.modelValue.DSCotDiem.filter(x => x.MonHocID === monHoc.MonHocID)
            const uniqueDSNhomCotDiem = [...new Set(DSCotDiem.map(item => item.MaNhomCotDiem))]
            for (var MaNhomCotDiem of uniqueDSNhomCotDiem) {
                const existMaNhomCotDiem = DSCotDiem.find(item => item.MaNhomCotDiem === MaNhomCotDiem)
                if (existMaNhomCotDiem) {
                    // const dsCotDiem = DSCotDiem.filter(item => item.MaNhomCotDiem === MaNhomCotDiem)
                    const children = []
                    const uniqueDSCotDiem = [...new Set(DSCotDiem.map(item => item.MaCotDiem))]

                    for (var MaCotDiem of uniqueDSCotDiem) {
                        const existMaCotDiem = DSCotDiem.find(item => item.MaCotDiem === MaCotDiem && item.MaNhomCotDiem === MaNhomCotDiem)
                        if (existMaCotDiem) {
                            children.push({
                                title: existMaCotDiem.TenCotDiem_VI,
                                value: existMaCotDiem.MaCotDiem,
                                minWidth: existMaCotDiem.LoaiCotDiem === 'text' ? 500 : 200,
                                align: 'center'
                            })
                        }
                    }

                    arr.push({
                        title: existMaNhomCotDiem.TenNhomCotDiem_VI,
                        value: existMaNhomCotDiem.MaNhomCotDiem,
                        align: 'center',
                        children: children
                    })
                }
            }
            arr = [
                // { title: "Tên môn học", value: "TenMonDuLieuNganh", minWidth: 200, fixed: true },
                ...arr,
                // {
                //     title: "", value: "actions", right: 0, lastFixed: true,
                // },
            ]
            return arr
        },
        handleItems(monHoc) {
            const DSCotDiem = this.modelValue.DSCotDiem.filter(x => x.MonHocID === monHoc.MonHocID)
            const uniqueMonHocID = [...new Set(DSCotDiem.map(item => item.MonHocID))]
            const newDSCotDiem = []
            for (var MonHocID of uniqueMonHocID) {
                const existMonHocID = DSCotDiem.find(item => item.MonHocID === MonHocID)
                if (existMonHocID) {
                    const arrDSCotDiem_MonHocID = DSCotDiem.filter(item => item.MonHocID === MonHocID)
                    for (var cotDiem of arrDSCotDiem_MonHocID) {
                        if (cotDiem.MonHocID === MonHocID) {
                            existMonHocID[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI ?? cotDiem.KetQuaDanhGia_EN
                        }
                    }
                    newDSCotDiem.push({
                        ...existMonHocID,
                    })
                }
            }
            return newDSCotDiem
        },
        handleHeaders_ChinhKhoa(monHoc) {
            let arr = []
            const DSCotDiem = this.modelValue.DSCotDiem.filter(x => x.MonHocID === monHoc.MonHocID)
            const uniqueDSNhomCotDiem = [...new Set(DSCotDiem.map(item => item.MaNhomCotDiem))]
            for (var MaNhomCotDiem of uniqueDSNhomCotDiem) {
                const existMaNhomCotDiem = DSCotDiem.find(item => item.MaNhomCotDiem === MaNhomCotDiem)
                if (existMaNhomCotDiem) {
                    // const dsCotDiem = DSCotDiem.filter(item => item.MaNhomCotDiem === MaNhomCotDiem)
                    const children = []
                    const uniqueDSCotDiem = [...new Set(DSCotDiem.map(item => item.MaCotDiem))]

                    for (var MaCotDiem of uniqueDSCotDiem) {
                        const existMaCotDiem = DSCotDiem.find(item => item.MaCotDiem === MaCotDiem && item.MaNhomCotDiem === MaNhomCotDiem)
                        if (existMaCotDiem) {
                            children.push({
                                title: existMaCotDiem.TenCotDiem_VI,
                                value: existMaCotDiem.MaCotDiem,
                                minWidth: existMaCotDiem.LoaiCotDiem === 'text' ? 500 : 200,
                                align: 'center'
                            })
                        }
                    }

                    arr.push({
                        title: existMaNhomCotDiem.TenNhomCotDiem_VI,
                        value: existMaNhomCotDiem.MaNhomCotDiem,
                        align: 'center',
                        children: children
                    })
                }
            }
            arr = [
                { title: "Tên môn học", value: "TenMonDuLieuNganh", minWidth: 200, fixed: true },
                ...arr,
                {
                    title: "", value: "actions", right: 0, lastFixed: true,
                },
            ]
            return arr
        },
        handleItems_ChinhKhoa(monHoc) {
            const DSCotDiem = this.modelValue.DSCotDiem.filter(x => x.Is_ChinhKhoa)
            const uniqueMonHocID = [...new Set(DSCotDiem.map(item => item.MonHocID))]
            const newDSCotDiem = []
            for (var MonHocID of uniqueMonHocID) {
                const existMonHocID = DSCotDiem.find(item => item.MonHocID === MonHocID)
                if (existMonHocID) {
                    const arrDSCotDiem_MonHocID = DSCotDiem.filter(item => item.MonHocID === MonHocID)
                    for (var cotDiem of arrDSCotDiem_MonHocID) {
                        if (cotDiem.MonHocID === MonHocID) {
                            existMonHocID[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI ?? cotDiem.KetQuaDanhGia_EN
                        }
                    }
                    newDSCotDiem.push({
                        ...existMonHocID,
                    })
                }
            }
            return newDSCotDiem
        },
    }
}
</script>