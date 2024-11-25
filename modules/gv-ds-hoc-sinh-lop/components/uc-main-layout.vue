<template>
    <uc-admin-layout class="pa-4">
        <v-card class="pb-0">
            <v-card-title class="text-primary">Tìm kiếm</v-card-title>
            <v-card-text class="pb-0">
                <v-row>
                    <v-col cols="1">
                        <v-select v-model="CapID" label="Chọn cấp" :items="DSCap" :item-title="'TenCap'" item-value="MaCap" outlined dense hide-details></v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-select v-model="KhoiID" label="Chọn khối" :items="DSKhoi" :item-title="'TenKhoi'" item-value="KhoiID" outlined dense hide-details></v-select>
                    </v-col>
                    <v-col cols="2"><v-select v-model="LopItem" label="Chọn lớp" :items="DSLopFilter" dense outlined item-title="TenLopHienThi" hide-details return-object></v-select></v-col>
                    <!-- <v-col><v-btn color="primary" @click="onRefresh">Làm mới</v-btn></v-col> -->
                </v-row>
            </v-card-text>
        </v-card>
        <v-card class="mt-2">
            <v-card-title class="text-primary">
                Danh sách học sinh lớp
                <v-chip class="ml-2" color="primary" v-if="LopItem?.LopID">{{ LopItem?.TenLopHienThi }}</v-chip>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-spacer></v-spacer>
                <v-text-field v-model="Search" label="Tìm kiếm" :width="WIDTH_TEXT_FIELD_SEARCH" prepend-inner-icon="mdi-magnify" single-line dense hide-details clearable />
                <v-btn class="ml-2" color="primary" @click="udpHocSinh_Udp">Cập nhật DS học sinh </v-btn>
            </v-card-title>
            <v-data-table :items="filterDS" :headers="columns" :loading="isTableLoading">
                <template v-slot:item.TinhTrangQLHS="{ item }">
                    <v-chip :color="item.TinhTrangQLHS === 0 ? 'primary' : 'error'">
                        {{ item.TenTinhTrangQLHS ? item.TenTinhTrangQLHS : 'Không có' }}
                    </v-chip>
                </template>
                <template v-slot:item.TinhTrangKQHT="{ item }">
                    <v-chip :color="item.TinhTrangKQHT === 0 ? 'primary' : 'error'">
                        {{ item.TenTinhTrangKQHT ? item.TenTinhTrangKQHT : 'Không có' }}
                    </v-chip>
                </template>
                <template v-slot:item.Is_TinhTrang="{ item }">
                    <!-- <v-chip>
                        <v-checkbox color="primary" class="mt-0 checkbox-center" v-model="item.Is_TinhTrang" hide-details />
                    </v-chip> -->
                    <div class="w-100 d-flex justify-center align-center">
                        <v-checkbox color="primary" class="mt-0 checkbox-center" v-model="item.Is_TinhTrang" hide-details />
                    </div>
                </template>
            </v-data-table>
        </v-card>
    </uc-admin-layout>
</template>

<script>
export default {
    props: [],
    data() {
        return {
            IsAuth: true,
            LopItem: null,
            WIDTH_TEXT_FIELD_SEARCH: 50,
            DSHocSinhLopKQHT: [],
            DSLop: [],
            DSLopFilter: [],
            DSHocSinh: [],
            DSHocSinhLop: [],
            KhoiID: 1,
            CapID: 1,
            isTableLoading: false,
            DSKhoi: [
                { TenKhoi: 'Khối 1', KhoiID: 1 },
                { TenKhoi: 'Khối 2', KhoiID: 2 },
                { TenKhoi: 'Khối 3', KhoiID: 3 },
                { TenKhoi: 'Khối 4', KhoiID: 4 },
                { TenKhoi: 'Khối 5', KhoiID: 5 },
            ],
            DSCap: [
                {
                    TenCap: 'Cấp 1',
                    MaCap: 1,
                },
                {
                    TenCap: 'Cấp 2',
                    MaCap: 2,
                },
                {
                    TenCap: 'Cấp 3',
                    MaCap: 3,
                },
            ],
            columns: [
                {
                    title: 'STT',
                    value: 'STT',
                    align: 'center',
                    width: 50,
                },
                {
                    title: 'Mã học sinh',
                    value: 'HocSinhID',
                    className: 'black--text',
                },
                {
                    title: 'Họ tên',
                    value: 'HoTen',
                    className: 'black--text',
                },
                {
                    title: 'Tình trạng HS của phần mềm KQHT',
                    value: 'TinhTrangKQHT',
                    align: 'center',
                    className: 'black--text',
                    scopedSlots: { customRender: 'TinhTrangKQHT' },
                },
                {
                    title: 'Tình trạng HS của phần mềm QLHS',
                    value: 'TinhTrangQLHS',
                    align: 'center',
                    className: 'black--text',
                    scopedSlots: { customRender: 'TinhTrangQLHS' },
                },
                {
                    title: 'Cập nhật tình trạng đang học',
                    value: 'Is_TinhTrang',
                    align: 'center',
                    className: 'black--text',
                    // width: 150,
                    scopedSlots: { customRender: 'Is_TinhTrang' },
                },
            ],
            Search: '',
            dataSource: [],
            filterDS: [],
        }
    },
    mounted() {
        this.getLop_Get_ByNienKhoa()
    },
    computed: {},
    watch: {
        'LopItem.LopID': function (val) {
            this.onRefresh()
            console.log('val', val)
        },
        dataSource: function (val) {
            if (val.length > 0) {
                const ds = val.filter((x) => {
                    if (this.Search === null || this.Search === '') {
                        return true // Trả về true để bao gồm tất cả các phần tử
                    }
                    return x.HoTen.toLowerCase().includes(this.Search.toLowerCase()) || x.HocSinhID.toString().toLowerCase().includes(this.Search.toLowerCase())
                })
                this.filterDS = ds
            }
        },
        KhoiID: function (val) {
            if (val) {
                this.filterDS = []
                this.LopItem = null
                this.DSLopFilter = this.DSLop.filter((khoi) => khoi.KhoiID === val)
            }
        },
        CapID: function (val) {
            const $this = this
            $this.filterDS = []
            let khoiData
            switch (val) {
                case 1:
                    ;(khoiData = [
                        { TenKhoi: 'Khối 1', KhoiID: 1 },
                        { TenKhoi: 'Khối 2', KhoiID: 2 },
                        { TenKhoi: 'Khối 3', KhoiID: 3 },
                        { TenKhoi: 'Khối 4', KhoiID: 4 },
                        { TenKhoi: 'Khối 5', KhoiID: 5 },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                case 2:
                    ;(khoiData = [
                        { TenKhoi: 'Khối 6', KhoiID: 6 },
                        { TenKhoi: 'Khối 7', KhoiID: 7 },
                        { TenKhoi: 'Khối 8', KhoiID: 8 },
                        { TenKhoi: 'Khối 9', KhoiID: 9 },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                case 3:
                    ;(khoiData = [
                        { TenKhoi: 'Khối 10', KhoiID: 10 },
                        { TenKhoi: 'Khối 11', KhoiID: 11 },
                        { TenKhoi: 'Khối 12', KhoiID: 12 },
                    ]),
                        ($this.DSKhoi = khoiData)
                    break
                default:
                    ;(khoiData = [
                        { TenKhoi: 'Khối 1', KhoiID: 1 },
                        { TenKhoi: 'Khối 2', KhoiID: 2 },
                        { TenKhoi: 'Khối 3', KhoiID: 3 },
                        { TenKhoi: 'Khối 4', KhoiID: 4 },
                        { TenKhoi: 'Khối 5', KhoiID: 5 },
                        { TenKhoi: 'Khối 6', KhoiID: 6 },
                        { TenKhoi: 'Khối 7', KhoiID: 7 },
                        { TenKhoi: 'Khối 8', KhoiID: 8 },
                        { TenKhoi: 'Khối 9', KhoiID: 9 },
                        { TenKhoi: 'Khối 10', KhoiID: 10 },
                        { TenKhoi: 'Khối 11', KhoiID: 11 },
                        { TenKhoi: 'Khối 12', KhoiID: 12 },
                    ]),
                        ($this.DSKhoi = khoiData)
            }
            this.KhoiID = khoiData[0].KhoiID
        },
    },
    methods: {
        async onRefresh() {
            if (this.LopItem?.LopID) {
                const promise = () => {
                    return new Promise(async (resolve) => {
                        this.isTableLoading = true
                        await this.getHocSinhLop_Get()
                        await this.getEdubot_GetHocSinh()
                        await this.getEdubot_GetHocSinhLop()
                        resolve()
                    })
                }
                promise()
                    .then(() => {
                        const DSHocSinhFilter = []
                        //fix
                        const newDSFilter_Edubot = this.DSHocSinhLop.filter((x) => x.LopID === this.LopItem.LopID).map((hs) => {
                            const obj = this.DSHocSinh.find((x) => x.HocSinhID === hs.HocSinhID)
                            return { ...hs, ...obj }
                        })

                        const uniqueHocSinhID = new Set([...newDSFilter_Edubot, ...this.DSHocSinhLopKQHT].map((x) => x.HocSinhID))

                        for (var hsId of uniqueHocSinhID) {
                            let obj = {}
                            const hs = this.DSHocSinhLopKQHT.find((x) => x.HocSinhID === hsId)
                            const hsEduBot = this.DSHocSinhLop.find((x) => x.HocSinhID === hsId)

                            if (hs) {
                                //KQHT
                                const _hs = this.DSHocSinhLopKQHT.find((x) => x.HocSinhID === hs.HocSinhID)
                                obj.HSLopID = hs.HSLopID
                                obj.LopID = hs.LopID
                                obj.HocSinhID = _hs.HocSinhID
                                obj.HoTen = _hs.Ho + ' ' + _hs.Ten
                                obj.Ho = _hs.Ho
                                obj.Ten = _hs.Ten
                                obj.NgaySinh = _hs.NgaySinh
                                obj.Nu = _hs.Nu
                                obj.TinhTrangKQHT = _hs?.TinhTrang
                                obj.TenTinhTrangKQHT = _hs?.TenTinhTrang
                            }
                            if (hsEduBot) {
                                //EDUBOT
                                const _hs = this.DSHocSinh.find((x) => x.HocSinhID === hsEduBot.HocSinhID)
                                obj.HSLopID = hsEduBot.HSLopID
                                obj.LopID = hsEduBot.LopID
                                obj.HocSinhID = _hs.HocSinhID
                                obj.HoTen = _hs.Ho + ' ' + _hs.Ten
                                obj.Ho = _hs.Ho
                                obj.Ten = _hs.Ten
                                obj.NgaySinh = _hs.NgaySinh
                                obj.Nu = _hs.Nu
                                obj.TinhTrangQLHS = _hs?.TinhTrang
                                obj.TenTinhTrangQLHS = _hs?.TenTinhTrang
                            }
                            DSHocSinhFilter.push(obj)
                        }
                        console.table(DSHocSinhFilter)
                        this.dataSource = DSHocSinhFilter.map((x, index) => ({ ...x, STT: index + 1 }))
                        this.isTableLoading = false
                    })
                    .error((err) => {
                        this.isTableLoading = false
                        Toast.error({ text: err })
                    })
            }
        },
        udpHocSinh_Udp() {
            const dsHocSinh = this.dataSource.filter((x) => x.Is_TinhTrang)
            if (dsHocSinh.length === 0) {
                Toast.error({ text: `Bạn chưa chọn học sinh để cập nhật` })
                return
            }
            console.log('dsHocSinh', dsHocSinh)
            const HocSinhObjArr = dsHocSinh.map((x) => {
                return {
                    HSLopID: x.HSLopID,
                    LopID: x.LopID,
                    HocSinhID: x.HocSinhID,
                    Ho: x.Ho,
                    Ten: x.Ten,
                    NgaySinh: x.NgaySinh,
                    Nu: x.Nu,
                    TinhTrang: x.TinhTrangQLHS,
                    TenTinhTrang: x.TenTinhTrangQLHS,
                }
            })
            console.log('HocSinh ObjArr', HocSinhObjArr)

            const promise = () => {
                return new Promise(async (resolve) => {
                    await NhapDiem_Service.IO_IN_HocSinh_Ins({
                        HocSinhObjArr: HocSinhObjArr,
                    })
                    await NhapDiem_Service.IO_IN_HocSinhLop_Ins({
                        HocSinhLopObjArr: HocSinhObjArr,
                    })
                    resolve()
                })
            }
            promise().then(() => {
                this.onRefresh()
                Toast.success({ text: `Cập nhật danh sách học sinh thành công` })
            })
        },
        async getHocSinhLop_Get() {
            const isSelect = await NhapDiem_Service.HocSinhLop_Get({
                LopID: this.LopItem.LopID,
            })
            if (isSelect) {
                this.DSHocSinhLopKQHT = isSelect
            }
        },
        async getLop_Get_ByNienKhoa() {
            const currentYear = new Date().getFullYear()
            const param = {
                NienKhoa: currentYear,
            }
            const isSelect = await NhapDiem_Service.Lop_Get_ByNienKhoa(param)
            if (isSelect) {
                this.DSLop = isSelect
                this.DSLopFilter = isSelect.filter((khoi) => khoi.KhoiID === 1)
            }
        },
        // async getLop_Get_ByNienKhoa() {
        //     const currentYear = new Date().getFullYear()
        //     const isSelect = await LMS_Service.LMS_GetLop()
        //     if (isSelect) {
        //         this.DSLop = isSelect
        //         this.DSLopFilter = isSelect.filter((khoi) => khoi.KhoiID === 1)
        //     }
        // },
        async getEdubot_GetHocSinh() {
            const isSelect = await LMS_Service.LMS_GetHocSinh()
            if (isSelect) {
                this.DSHocSinh = isSelect
            }
        },
        async getEdubot_GetHocSinhLop() {
            const isSelect = await LMS_Service.LMS_GetHocSinhLop()
            if (isSelect) {
                this.DSHocSinhLop = isSelect
            }
        },
    },
}
</script>
