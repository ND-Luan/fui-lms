Vue.component('uc-main-layout-2', {
    props: [],
    data() {
        return {
            DSHocSinhLop: [],
            DSHocSinhLopFilter: [],
            DSLop: [],
            DSHocSinh: [],
            LopID: null,
            columns: [{
                title: "STT",
                dataIndex: 'STT',
                key: 'STT',
                className: "black--text",
                width: WIDTH_COLUMN_TABLE.STT,
            },
            {
                title: "Mã học sinh",
                dataIndex: 'HocSinhID',
                key: 'HocSinhID',
                width: WIDTH_COLUMN_TABLE.MAHOCSINH,
                className: "black--text"
            },
            {
                title: 'Họ và tên / Ngày sinh',
                dataIndex: 'combineHoTen',
                key: 'combineHoTen',
                width: WIDTH_COLUMN_TABLE.HOTEN_NGAYSINH,
                className: "black--text",
                scopedSlots: { customRender: 'combineHoTen' },
            }
            ],
            Search: ""
        }
    },
    watch: {
        LopID: function (val) {
            if (val) {
                this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(this.DSHocSinhLop)
            }
        }
    },
    computed: {
        filterDSHocSinh: function () {
            let ds = []
            if (this.DSHocSinhLopFilter.length > 0) {
                ds = this.DSHocSinhLopFilter.map((hs, index) => ({ ...hs, STT: index + 1 })).filter(x => {
                    return x.HocSinhID.toString().toLowerCase().includes(this.Search.toLowerCase()) ||
                        x.Ho.toLowerCase().includes(this.Search.toLowerCase()) ||
                        x.Ten.toLowerCase().includes(this.Search.toLowerCase())
                })
            }
            return ds
        }
    },
    async created() {
        await this.getEdubot_GetLop()
        await this.getEdubot_GetHocSinh()
        await this.getEdubot_GetHocSinhLop()
    },
    methods: {
        getEdubot_GetLop() {
            apiUtil.lhbs('/Edubot_GetLop').then(res => {
                const data = res.data
                this.DSLop = data
                if (data[0]) this.LopID = data[0].LopID
            })
        },
        getEdubot_GetHocSinh() {
            apiUtil.lhbs('/Edubot_GetHocSinh').then(res => {
                this.DSHocSinh = res.data.map((hs, index) => ({ ...hs, STT: index + 1 }))
            })
        },
        getEdubot_GetHocSinhLop() {
            apiUtil.lhbs('/Edubot_GetHocSinhLop').then(res => {
                const dsHocSinhLop = res.data
                const arrHslMapDSHocSinh = dsHocSinhLop.map((hsl, index) => {
                    const hocSinh = this.DSHocSinh.find(hs => hs.HocSinhID === hsl.HocSinhID)
                    if (hocSinh) {
                        hsl.Ho = hocSinh.Ho
                        hsl.Ten = hocSinh.Ten
                        hsl.NgaySinh = hocSinh.NgaySinh
                        hsl.Nu = hocSinh.Nu
                    }
                    return hsl
                })
                this.DSHocSinhLop = dsHocSinhLop
                this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(arrHslMapDSHocSinh)
            })
        },
        filterDSHocSinhWithLop(DSHocSinh) {
            const arr = DSHocSinh.filter(hs => hs.LopID === this.LopID)
            return arr
        },
        onSearch() {
            this.DSHocSinhLopFilter = this.filterDSHocSinhWithLop(this.DSHocSinhLop)
        }
    },
    template: /*html*/`
        <uc-admin-layout-2 class="pa-4">
            <v-card>
                <v-card-title class="primary--text">Tìm kiếm</v-card-title>
                <v-card-text >
                    <v-row>
                        <v-col cols="2">
                            <v-autocomplete v-model="LopID" label="Chọn lớp" :items="DSLop" item-text="TenLop" item-value="LopID" outlined dense hide-details></v-autocomplete>
                        </v-col>
                        <v-col>
                            <v-btn @click="onSearch" color="primary">Tìm kiếm</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <v-card class="mt-2">
                <v-card-title class="primary--text">
                    Danh sách học sinh lớp
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-spacer></v-spacer>
                    <v-text-field
                        v-model="Search"
                        label="Tìm kiếm"
                        :style="{width : WIDTH_TEXT_FIELD_SEARCH + 'px'}"
                        prepend-inner-icon="mdi-magnify"
                        single-line dense hide-details
                    ></v-text-field>
                </v-card-title>
                <v-card-text>
                    <a-table
                        :columns="columns"
                        :data-source="filterDSHocSinh"
                    >
                        <span slot="combineHoTen" slot-scope="value, record">
                            <p class="mb-1 text-subtitle-1 font-weight-medium">{{record.Ho}} {{record.Ten}}</p>
                            <p class="mb-0">{{record.NgaySinh}}</p>
                        </span>
                    </a-table>
                </v-card-text>
            </v-card>
        </uc-admin-layout>
    `
})