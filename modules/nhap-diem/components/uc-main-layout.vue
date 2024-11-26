<template>
    <div>
        <v-card>
            <v-card-title class="text-primary"> Tìm kiếm </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" sm="6" md="2">
                        <v-autocomplete label="Học kỳ" :items="['Học kỳ I', 'Học kỳ II', 'Cuối kỳ']"> </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-autocomplete v-model="KhoiID" label="Khối" :items="DSKhoi" item-title="text"
                            item-value="value">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-autocomplete v-model="LopID" label="Lớp" :items="DSLop" item-title="TenLop"
                            item-value="LopID" :disabled="KhoiID === null">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-autocomplete v-model="MonHocID" label="Môn học" :items="DSMonHoc" item-value="MonHocID"
                            item-title="MonHocName" :disabled="LopID === null">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-autocomplete placeholder="Chọn nhóm điểm" v-model="MaNhomCotDiem" label="Nhóm điểm"
                            :items="DSNhomDiem" style="max-width: 400px" item-value="MaNhomCotDiem"
                            item-title="TenNhomCotDiem_VI" :disabled="MonHocID === null">
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <v-card class="mt-4">
            <v-card-title class="text-primary">
                Nhập điểm
                <v-spacer></v-spacer>
                <div>
                    <v-btn color="success" @click="onHandleSubmit()" :disabled="!dataSource.length > 0"> Lưu
                        điểm</v-btn>
                    <v-btn icon="mdi-microsoft-excel" color="success" variant="text"
                        @click="exportExcel = true"></v-btn>
                </div>
            </v-card-title>
            <!-- @onChange="onChange" -->
            <uc-jexcel v-if="dataSource.length > 0" v-model="instance" :freezeColumns="2"
                v-model:dataSource="dataSource" :columns="colHeaders" :exportExcel="exportExcel" :isSubmit="isSubmit"
                :updateTable="updateTable" :key="keyComp" styleExcel="height: calc(100vh - 252px)">
            </uc-jexcel>
        </v-card>
    </div>
</template>

<script>
export default {
    props: [],
    data() {
        //Tao khoi
        const DSKhoi = Array.from({ length: 12 })
            .fill(0)
            .map((_, i) => {
                return {
                    text: `Khối ${i + 1}`,
                    value: i + 1,
                }
            })
        return {
            instance: null,
            exportExcel: false,
            isSubmit: false,
            keyComp: 0, //Set key để render lại jexcel
            dataSource: [], //Data của jexcel
            colHeaders: [], //Header của jexcel
            DSKhoi: DSKhoi,
            DSLop: [],
            DSMonHoc: [],
            DSHocSinh: [],
            DSNhomDiem: [],
            DSCotDiem: [],
            DSCotDiem_ByMaNhomCotDiem: [],
            KhoiID: null,
            LopID: null,
            MonHocID: null,
            TemplateBangDiemID: null,
            MaNhomCotDiem: null,
            MonHocLopID: null,
        }
    },
    mounted() { },
    created() { },
    computed: {},
    watch: {
        KhoiID: function (val) {
            if (val) {
                this.LopID = null
                this.MonHocID = null
                this.MaNhomCotDiem = null
                this.DSLop = []
                this.DSMonHoc = []
                this.DSNhomDiem = []
                this.dataSource = []
                this.loadDSLop()
            }
        },
        LopID: function (val) {
            if (val) {
                this.dataSource = []
                this.MonHocID = null
                this.loadDSHocSinh()
                this.loadDSMonHoc()
            }
        },
        MonHocID: function (val) {
            if (val) {
                let objMonHoc = this.DSMonHoc.find((obj) => obj.MonHocID === val)
                if (objMonHoc) {
                    this.MonHocLopID = objMonHoc.MonHocLopID
                    this.loadDSNhomDiem(objMonHoc.TemplateBangDiemID)
                }
                this.MaNhomCotDiem = null
                this.dataSource = []
            }
        },
        MaNhomCotDiem: function (val) {
            if (val) {
                this.loadDSCotDiem()
            }
        },
    },
    methods: {
        async loadDSLop() {
            if (this.KhoiID > 0) {
                this.DSLop = await NhapDiem_Service.Lop_Get_ByKhoiID({
                    KhoiID: this.KhoiID,
                })
            }
        },
        async loadDSHocSinh() {
            if (this.LopID > 0) {
                this.DSHocSinh = await NhapDiem_Service.HocSinhLop_Get_ByLopID({
                    LopID: this.LopID,
                })
            }
        },
        async loadDSMonHoc() {
            if (this.LopID > 0) {
                this.DSMonHoc = await NhapDiem_Service.MonHoc_Get_ByLopID({
                    LopID: this.LopID,
                })
            }
        },
        async loadDSNhomDiem(TemplateBangDiemID) {
            this.TemplateBangDiemID = TemplateBangDiemID
            if (TemplateBangDiemID > 0) {
                const data = await NhapDiem_Service.NhomCauTrucDiem_Get_ByTemplateBangDiemID({
                    TemplateBangDiemID: this.TemplateBangDiemID,
                })
                if (data.length > 0) {
                    const mapArr = data.map((x) => {
                        let obj = {
                            CssClass: x.CssClass,
                            MaNhomCotDiem: x.MaNhomCotDiem,
                            Semester: x.Semester,
                            TenNhomCotDiem_EN: x.TenNhomCotDiem_EN,
                            TenNhomCotDiem_VI: x.TenNhomCotDiem_VI,
                            ThuTuNhom: x.ThuTuNhom,
                        }
                        return obj
                    })
                    this.DSNhomDiem = [...new Set(mapArr)]
                }
            }
        },
        async loadDSCotDiem() {
            if (this.MaNhomCotDiem !== '' || this.MaNhomCotDiem !== null) {
                const data = await NhapDiem_Service.HocSinhBangDiem_Get_ByMonHocID_MaNhom({
                    LopID: this.LopID,
                    MonHocID: this.MonHocID,
                    TemplateBangDiemID: this.TemplateBangDiemID,
                    MaNhomCotDiem: this.MaNhomCotDiem,
                })
                if (data.length > 0) {
                    let SLCotDiem_OfFirstSTD = data.filter((item) => item.HocSinhID === data[0].HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
                    this.DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
                    //Xử lý động cột điểm header jexcel
                    let columnsCotDiem = SLCotDiem_OfFirstSTD
                        .map((x) => {
                            if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
                                let column = {
                                    type: 'numeric',
                                    title: x.TenCotDiem_VI,
                                    name: x.MaCotDiem,
                                    typeValue: x.GiaTriCotDiem,
                                    width: 80,
                                    decimal: '.',
                                    mask: '0.00',
                                    backGroundColor: x.HexBackground,
                                    wrapText: true,
                                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                                }
                                return column
                            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                                let column = {
                                    type: 'text',
                                    title: x.TenCotDiem_VI,
                                    name: x.MaCotDiem,
                                    typeValue: x.GiaTriCotDiem,
                                    width: this.calculateColumnWidth(x.TenCotDiem_VI),
                                    backGroundColor: x.HexBackground,
                                    wrap: true,
                                }
                                return column
                            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                                let column = {
                                    type: 'html',
                                    title: x.TenCotDiem_VI,
                                    name: x.MaCotDiem,
                                    width: 120,
                                    typeValue: x.GiaTriCotDiem,
                                    backGroundColor: x.HexBackground,
                                    wrap: true,
                                    align: 'center',
                                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                                }
                                return column
                            }
                        })
                    let columnThongTinHocSinh = [
                        {
                            type: 'text',
                            title: 'Mã học sinh',
                            name: 'HocSinhID',
                            width: 120,
                            backGroundColor: null,
                            wrap: true,
                        },
                        {
                            type: 'text',
                            title: 'Họ tên học sinh',
                            name: 'HoVaTenHocSinh',
                            width: 300,
                            backGroundColor: null,
                            wrap: true,
                        },
                    ]
                    this.colHeaders = [...columnThongTinHocSinh, ...columnsCotDiem]
                    //Xử lý data jexcel
                    const HocSinhIDList = data.map((x) => x.HocSinhID)  // lấy danh sách mã học sinh
                    const uniqueHocSinhID = [...new Set(HocSinhIDList)] //Lấy danh sách mã học sinh phân biệt
                    const dataJexcel = []
                    let indexRow = 1
                    for (var hocSinhID of uniqueHocSinhID) {
                        const arrCotDiemExist = data.filter((x) => x.HocSinhID === hocSinhID) // Lấy danh sách điểm của học sinh
                        if (arrCotDiemExist.length === 0) return
                        let obj = {
                            HocSinhID: arrCotDiemExist[0].HocSinhID,
                            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
                        }
                        for (var cotDiemExist of arrCotDiemExist) {
                            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                                obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)) : cotDiemExist.KetQuaDanhGia_VI
                            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)
                            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                                obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)})`
                            }
                        }
                        indexRow++
                        dataJexcel.push(obj)
                    }
                    console.log('$this.colHeaders', this.colHeaders)
                    console.log('dataJexcel', dataJexcel)
                    console.log('dataJexcel', data)
                    this.dataSource = dataJexcel
                    this.keyComp++
                    this.DSCotDiem = data
                }
            }
        },
        updateTable(instance, cell, col, row, val, label, cellName) {
            cell.style.backgroundColor = this.colHeaders[col]?.backGroundColor
            this.colHeaders.forEach((x, index) => {
                if (x.type == 'numeric') {
                    if (col === index) {
                        cell.style.textAlign = 'right'
                    }
                } else if (x.type == 'text') {
                    if (col === index) {
                        cell.style.textAlign = 'left'
                    }
                }
            })
        },
        async onHandleSubmit() {
            let val = this.dataSource
            //val là dữ liệu trên sheet jexcel
            let DSCotDiem = this.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
            //   let arrCotDiem = Object.keys(val[0]).splice(2); //Lấy các cột điểm của 1 học sinh
            dataBeforeInsertToDB = []
            //Xử lý data mapping giá trị
            //B1: Vòng lặp thứ nhất để lặp các học sinh
            //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
            console.log('val', val)
            for (let i = 0; i < val.length; i++) {
                for (let j = 0; j < DSCotDiem.length; j++) {
                    const cellAdresss = jexcel.getColumnNameFromId([j + 2, i]) // (j+2) là địa chỉ cột điểm đầu tiên, i là row
                    // let giaTriCotDiem = val[i][arrCotDiem[j]]
                    let giaTriCotDiem = this.instance.getCell(cellAdresss).innerHTML
                    let cotDiem_HS = {
                        HocSinhID: val[i].HocSinhID,
                        LopID: this.LopID,
                        NienKhoa: 2024,
                        CotDiemID: DSCotDiem[j].CotDiemID,
                        KetQuaDanhGia_VI: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                        KetQuaDanhGia_EN: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                        Is_Reject: '',
                        ReasonReject: '',
                    }
                    let typeColumn = DSCotDiem[j].GiaTriCotDiem
                    let value = cotDiem_HS.KetQuaDanhGia_VI
                    const min = DSCotDiem[j].DiemMin
                    const max = DSCotDiem[j].DiemMax
                    cotDiem_HS.IsError = this.validateSave(typeColumn, value, min, max)

                    if (cotDiem_HS.IsError === 1) {
                        this.instance.setStyle(cellAdresss, 'background-color', 'red')
                        Toast.error({
                            text: `Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`,
                        })
                        return
                    }
                    cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
                    dataBeforeInsertToDB.push(cotDiem_HS)
                }
            }
            console.log('dataBeforeInsertToDB', dataBeforeInsertToDB)
            let validIndex = dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
            if (validIndex != -1) {
                Toast.error({ text: 'Cột điểm chỉ cho phép nhập thang điểm 10!' })
                return
            }
            // Tạo params lưu xuống BD
            let params = {
                MonHocLopID: this.MonHocLopID,
                LopID: this.LopID,
                MonHocID: this.MonHocID,
                TemplateBangDiemID: this.TemplateBangDiemID,
                KetQuaObjArr: JSON.stringify(dataBeforeInsertToDB),
            }
            const res = await NhapDiem_Service.KQHT_MonHocLop_Ins(params)
            if (res) {
                Toast.success({ text: 'Nhập điểm thành công!' })
                this.loadDSCotDiem()
            }
            this.keyComp++
            this.isSubmit = false
        },
        validateSave(typeCell, value, min, max) {
            if ((typeCell === 'number' && value < min) || value > max) {
                return 1
            } else {
                return 0
            }
        },
        // Hàm tính width của cột điểm có giá trị dạng text
        calculateColumnWidth,
    },
}
</script>