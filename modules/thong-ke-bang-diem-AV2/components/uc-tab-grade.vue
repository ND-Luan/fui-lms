<template>
    <v-toolbar color="primary" style="position: sticky;
    top: 0;
    z-index: 1000;
    padding-top: 0px !important;">

        <v-toolbar-title>Xu hướng phát triển theo khối năm học {{ vueData.NienKhoa }} -
            {{ vueData.NienKhoa + 1 }}</v-toolbar-title>

        <template v-slot:extension>
            <div class="px-5">
                <v-tabs v-model="KhoiID" selected-class='bg-white text-primary'>
                    <v-tab v-for="khoi in DSKhoi" :key="khoi.KhoiID" :text='khoi.TenKhoiHoc' :value="khoi.KhoiID">
                    </v-tab>
                </v-tabs>
            </div>
        </template>
    </v-toolbar>

    <v-tabs-window v-model="KhoiID">
        <v-tabs-window-item v-for="khoi in DSKhoi" :key="khoi.KhoiID" :value="khoi.KhoiID">
            <v-card>
                <v-card-title class="d-flex my-3">
                    <v-spacer />
                    <v-select label="Chọn lớp" v-model="LopID" :items="DSLop" item-title="TenLop" item-value="LopID"
                        style="max-width: 250px"></v-select>
                </v-card-title>
                <v-card-text>
                    <!-- Biểu đồ tổng các theme -->
                    <v-card class="  rounded-lg" v-if="LopID == -1">
                        <v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2"
                            style="background-color: #d1e4f5">
                            📊 1. Thống kê điểm tổng các theme
                        </v-card-title>
                        <v-card-text class="pb-0">
                            <div class="d-flex flex-column align-center justify-center" v-if="isBusy == true"
                                style="min-height:500px ">
                                <v-progress-circular color="primary" indeterminate></v-progress-circular>
                                <span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
                            </div>
                            <div class="pt-3" v-else>
                                <uc-chart-apex :options="khoi.options" v-if="khoi.options" :key="keyComp" />
                            </div>
                        </v-card-text>
                    </v-card>
                    <v-divider class="my-3" v-if="LopID == -1"></v-divider>
                    <!-- Biểu đồ Tiếng Anh 2 -->
                    <v-card class="mt-5  rounded-lg">
                        <v-card-title class="text-primary text-subtitle-1 font-weight-medium pb-2 mb-3 "
                            style="background-color: #d1e4f5">
                            📘 {{ LopID == -1 ? '2' : "1" }}. Thống kê điểm Tiếng Anh 2
                        </v-card-title>
                        <v-card-text class="pb-0">
                            <v-row dense>
                                <v-col cols="12" md="6" v-if="isBusy == true">
                                    <div class="d-flex flex-column align-center justify-center"
                                        style="min-height:500px ">
                                        <v-progress-circular color="primary" indeterminate></v-progress-circular>
                                        <span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6" v-if="isBusy == false">
                                    <uc-chart-apex :options="khoi.optionsChart2" v-if="khoi.optionsChart2"
                                        :key="keyComp" />
                                </v-col>
                                <v-col cols="12" md="6" v-if="isBusy == true">
                                    <div class="d-flex flex-column align-center justify-center"
                                        style="min-height:500px ">
                                        <v-progress-circular color="primary" indeterminate></v-progress-circular>
                                        <span class="mt-2 text-button" style="color: grey">Đang tải dữ liệu...</span>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6" v-if="isBusy == false">
                                    <uc-chart-apex :options="khoi.optionsChart3" v-if="khoi.optionsChart3"
                                        :key="keyComp" />
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card>
        </v-tabs-window-item>
    </v-tabs-window>

</template>



<script>
export default {
    props: [],
    data() {
        return {
            keyComp: 0,
            tab: 10,
            vueData,
            DSLop: [],
            DSKhoi: [],
            HocSinhID: null,
            LopID: -1,
            KhoiID: 10,
            isBusy: false,
            options: {
                series: [
                    {
                        name: "Theme",
                        data: []
                    },
                ],
                chart: {
                    height: 500,
                    type: 'line',
                    dropShadow: {
                        enabled: true,
                        color: '#000',
                        top: 18,
                        left: 7,
                        blur: 10,
                        opacity: 0.5
                    },
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    }
                },
                colors: ['#217d46'],
                dataLabels: {
                    enabled: true,
                },
                stroke: {
                    curve: 'straight'
                },
                title: {
                    text: 'Thống kê Theme total',
                    align: 'left'
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                markers: {
                    size: 1
                },
                xaxis: {
                    categories: [],
                    title: {
                        text: ''
                    }
                },
                yaxis: {
                    title: {
                        text: ''
                    },
                    min: 0,
                    max: 10
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    floating: true,
                    offsetY: -25,
                    offsetX: -5
                }
            },
            optionsChart2: {
                series: [
                    {
                        name: "Point",
                        data: []
                    },
                ],
                chart: {
                    height: 500,
                    type: 'line',
                    dropShadow: {
                        enabled: true,
                        color: '#000',
                        top: 18,
                        left: 7,
                        blur: 10,
                        opacity: 0.5
                    },
                    zoom: {
                        enabled: false
                    },
                    toolbar: {
                        show: false
                    }
                },
                colors: [],
                dataLabels: {
                    enabled: true,
                },
                stroke: {
                    curve: 'smooth'
                },
                title: {
                    text: 'Thống kê điểm trung bình Tiếng Anh 2',
                    align: 'left'
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                markers: {
                    size: 1
                },
                xaxis: {
                    categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
                    title: {
                        text: ''
                    }
                },
                yaxis: {
                    title: {
                        text: ''
                    },
                    min: 0,
                    max: 10
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'center',

                }
            },
            optionsChart3: {
                series: [],
                chart: {
                    height: 500,
                    type: 'radar',
                    dropShadow: {
                        enabled: true,
                        blur: 1,
                        left: 1,
                        top: 1
                    },
                    toolbar: {
                        show: false
                    }
                },
                title: {
                    text: 'Thống kê điểm kĩ năng Tiếng Anh 2',
                    align: 'left'
                },
                stroke: {
                    width: 2
                },
                fill: {
                    opacity: 0.1
                },
                markers: {
                    size: 0
                },
                yaxis: {
                    //	stepSize: 20
                    min: 0,
                    max: 10
                },
                xaxis: {
                    categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
                    labels: {
                        style: {
                            colors: '#FF0000',
                            fontSize: '12px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            fontWeight: 'bold', // hoặc dùng số: 600
                            cssClass: 'apexcharts-xaxis-label1'
                        },
                    },

                },
                dataLabels: {
                    enabled: true,
                },
                grid: {
                    show: false,
                    padding: { left: 50, right: 0, top: 0, bottom: 0 },
                },
            },
            DataChart2: [],
            DataChart3: [],
            _
        }
    },
    mounted() {
        this.getKhoiHocByCapID(3)
        this.ThongKeDiem_TA2_Theme_Get_All_Khoi()
        this.onLoadDSLop()
    },
    computed: {},
    watch: {
        KhoiID: function (val) {
            this.LopID = -1
            if (val) {
                this.onLoadDSLop()
            }
        },
        LopID: function (val) {
            this.keyComp++
            this.DSKhoi.forEach(khoi => {
                khoi.options = { ...this.options }
                khoi.optionsChart2 = { ...this.optionsChart2 }
                khoi.optionsChart3 = { ...this.optionsChart3 }
            })
            if (val == -1) {
                this.ThongKeDiem_TA2_Theme_Get_All_Khoi()
            } else {
                this.ThongKeDiem_TA2_Theme_Get_Khoi_ByLopID()
            }
        }
    },
    methods: {
        async getKhoiHocByCapID(id) {
            return new Promise(async (resolve) => {
                let params = {
                    CapID: id
                }
                const res = await SearchLMSService.GetKhoiHocbyCapHocID(params)
                if (res) {
                    this.DSKhoi = res?.Result
                    resolve()
                } else {
                    resolve(null) // Trả về mảng rỗng nếu không có dữ liệu
                }
            })
        },
        onLoadDSLop() {
            if (!this.KhoiID) return
            return new Promise(resolve => {
                ajaxCALL('lms/Lop_Get_ByKhoiID',
                    {
                        NienKhoa: vueData.NienKhoa,
                        KhoiID: this.KhoiID
                    },
                    res => {
                        let obj = {
                            LopID: -1,
                            TenLop: "Tất cả"
                        }
                        this.DSLop = res.data.filter(item => item.TenLop.includes('AV'))
                        this.DSLop.unshift(obj)
                        resolve()
                    }
                )
            })
        },
        fnCalcDiemTrungVi(data) {
            const sortedData = data.sort((a, b) => a - b)
            let n = sortedData.length
            if (n % 2 != 0) {
                return sortedData[Math.floor(n / 2)]
            } else {
                let mid = n / 2
                return (sortedData[mid - 1] + sortedData[mid]) / 2
            }
        },
        fnHandleData(data, DSCotDiem) {
            if (data.length == 0 || DSCotDiem.length == 0) return
            let DiemTB = []
            for (let i = 0; i < DSCotDiem.length; i++) {
                let DataDiem = data.filter(item => item.MaCotDiem == DSCotDiem[i] && item.KetQuaDanhGia_VI != '' && item.KetQuaDanhGia_VI != null).map(item => {
                    return parseFloat(item.KetQuaDanhGia_VI)
                })
                const diemTrungVi = this.fnCalcDiemTrungVi(DataDiem)
                DiemTB.push(diemTrungVi)
            }
            console.log('DiemTB', DiemTB)
            return DiemTB
        },
        ajaxCallAsync(url, data) {
            this.isBusy = true
            return new Promise((resolve, reject) => {
                ajaxCALL(url, data, res => resolve(res), err => reject(err))
            })
        },
        async ThongKeDiem_TA2_Theme_Get_All_Khoi() {
            const $this = this
            const res = await this.ajaxCallAsync('lms/ThongKeDiem_TA2_Theme_Get_All_Khoi', {
                NienKhoa: vueData.NienKhoa,
                KhoiID: 0
            });
            //Lấy ds Theme
            const DSCotDiemTheme = [...new Set(res.data[0].map(item => item.MaCotDiem))]
            // Lấy DSDiemTrungBinh
            const DSDiemTBTheoKi = [...new Set(res.data[1].filter(item => item.MaCotDiem.includes('Avg')).map(item => item.MaCotDiem))]
            for (khoi of this.DSKhoi) {
                khoi.dataThemeKhoi = res.data[0].filter(item => item.KhoiID == khoi.KhoiID)
                khoi.dataTA2Khoi = res.data[1].filter(item => item.KhoiID == khoi.KhoiID)
                const DataOptions = this.fnHandleData(khoi.dataThemeKhoi, DSCotDiemTheme).map(item => item.toFixed(2))
                khoi['options'] = {
                    ...this.options,
                    series: [
                        {
                            name: 'Point',
                            data: DataOptions
                        }
                    ],
                    xaxis: {
                        categories: ['Theme 1', 'Theme 2', 'Theme 3', 'Theme 4', 'Theme 5', 'Theme 6', 'Theme 7', 'Theme 8'],
                        title: {
                            text: ''
                        }
                    },
                    yaxis: {
                        min: Math.min(...DataOptions),
                        max: 10,
                        stepSize: 0.5
                    },
                }
                let DSCotDiemTBCacKi = khoi.dataTA2Khoi.filter(item => item.MaCotDiem.includes('Avg'))
                khoi['optionsChart2'] = {
                    ...this.optionsChart2,
                    series: [
                        {
                            name: 'Point',
                            data: this.fnHandleData(DSCotDiemTBCacKi, DSDiemTBTheoKi).map(item => item.toFixed(2))
                        }
                    ],
                    xaxis: {
                        categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
                        title: {
                            text: ''
                        }
                    },
                }
                const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
                const DSCotDiem = ['TA2_Listening_Point', 'TA2_Speaking_Point', 'TA2_Reading_Point', 'TA2_Writing_Point',
                    'TA2_Avg_Point']
                let dataHandle = []
                for (let ky of DSKyHoc) {
                    let obj = {
                        KyHoc: ky,
                        data: []
                    }
                    for (let cotDiem of DSCotDiem) {
                        let DataDiemBySkill = khoi.dataTA2Khoi.filter(item => item.MaNhomCotDiem == ky && item.MaCotDiem.includes(cotDiem) && item.KetQuaDanhGia_VI != '' && item.KetQuaDanhGia_VI != null).map(item => {
                            return parseFloat(item.KetQuaDanhGia_VI)
                        })
                        let diemTrungVi = this.fnCalcDiemTrungVi(DataDiemBySkill)
                        obj.data.push(diemTrungVi.toFixed(2))
                    }
                    dataHandle.push(obj)
                }
                khoi['optionsChart3'] = {
                    ...this.optionsChart3,
                    series: [
                        {
                            name: 'Giữa HK1',
                            data: dataHandle[0].data
                        },
                        {
                            name: 'Cuối HK1',
                            data: dataHandle[1].data
                        },
                        {
                            name: 'Giữa HK2',
                            data: dataHandle[2].data
                        },
                        {
                            name: 'Cuối HK2',
                            data: dataHandle[3].data
                        }
                    ],
                    xaxis: {
                        categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
                        title: {
                            text: 'Theme'
                        }
                    },
                }
            }
            this.isBusy = false
        },
        async ThongKeDiem_TA2_Theme_Get_Khoi_ByLopID() {
            if (!this.LopID || this.LopID == -1) {
                this.isBusy = false
                return
            }
            let res = await this.ajaxCallAsync('lms/ThongKeDiem_TA2_Theme_Get_Khoi_ByLopID', {
                LopID: this.LopID,
                NienKhoa: vueData.NienKhoa
            })
            // Lấy DSDiemTrungBinh
            const DSDiemTBTheoKi = [...new Set(res.data[1].filter(item => item.MaCotDiem.includes('Avg')).map(item => item.MaCotDiem))]
            let DSCotDiemTBCacKi = res.data[1].filter(item => item.MaCotDiem.includes('Avg'))
            let indexKhoi = null
            if (this.KhoiID == 10) {
                indexKhoi = 0
            } else if (this.KhoiID == 11) {
                indexKhoi = 1
            } else if (this.KhoiID == 12) {
                indexKhoi = 2
            }
            if (indexKhoi === null) {
                this.isBusy = false
                return
            }
            this.DSKhoi[indexKhoi]['optionsChart2'] = {
                ...this.optionsChart2,
                series: [
                    {
                        name: 'Point',
                        data: this.fnHandleData(DSCotDiemTBCacKi, DSDiemTBTheoKi).map(item => item.toFixed(2))
                    }
                ],
                xaxis: {
                    categories: ['Giữa HK1', 'Cuối HK1', 'Giữa HK2', 'Cuối HK2'],
                    title: {
                        text: ''
                    }
                },
            }
            console.log('optionsChart2', this.optionsChart2.series)
            const DSKyHoc = ['S1_Mid_TA2', 'S1_Final_TA2', 'S2_Mid_TA2', 'S2_Final_TA2']
            const DSCotDiem = ['TA2_Listening_Point', 'TA2_Speaking_Point', 'TA2_Reading_Point', 'TA2_Writing_Point',
                'TA2_Avg_Point']
            let dataHandle = []
            for (let ky of DSKyHoc) {
                let obj = {
                    KyHoc: ky,
                    data: []
                }
                for (let cotDiem of DSCotDiem) {
                    let DataDiemBySkill = res.data[1].filter(item => item.MaNhomCotDiem == ky &&
                        item.MaCotDiem.includes(cotDiem)).map(item => {
                            if (item.KetQuaDanhGia_VI) {
                                return parseFloat(item.KetQuaDanhGia_VI)
                            } else {
                                return 0
                            }
                        })
                    if (DataDiemBySkill.length == 0) {
                        obj.data.push(null)
                        continue
                    }
                    let diemTrungVi = this.fnCalcDiemTrungVi(DataDiemBySkill)
                    obj.data.push(diemTrungVi.toFixed(2))
                }
                dataHandle.push(obj)
            }
            this.DSKhoi[indexKhoi]['optionsChart3'] = {
                ...this.optionsChart3,
                series: [
                    {
                        name: 'Giữa HK1',
                        data: dataHandle[0].data
                    },
                    {
                        name: 'Cuối HK1',
                        data: dataHandle[1].data
                    },
                    {
                        name: 'Giữa HK2',
                        data: dataHandle[2].data
                    },
                    {
                        name: 'Cuối HK2',
                        data: dataHandle[3].data
                    }
                ],
                xaxis: {
                    categories: ['Nghe', 'Nói', 'Đọc', 'Viết', 'Trung bình'],
                    title: {
                        text: 'Theme'
                    }
                },
            }
            this.isBusy = false
        }
    },
}
</script>