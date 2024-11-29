<template>
    <uc-app :isAdmin="false">
        <div class="font-weight-medium text-primary mt-4 d-flex justify-space-between align-center">
            <p>KẾT QUẢ HỌC TẬP</p>
        </div>
        <v-divider class="mb-1 mt-1"></v-divider>
        <p class="text-primary  font-weight-medium mb-1">Học sinh đang chọn</p>
        <v-skeleton-loader v-if="IsLoadingPage" class="mx-auto" elevation="4" type="article"
            boilerplate></v-skeleton-loader>
        <v-card v-else>
            <v-card-text>
                <v-row>
                    <v-col cols="4" class="d-flex justify-center align-center">
                        <v-avatar size="100" class="elevation-4">
                            <v-img :src="urlAvatarHocSinh + HocSinhDetail?.HocSinhID" />
                        </v-avatar>
                    </v-col>
                    <v-col cols="8">
                        <div class="d-flex flex-column justify-center algin-center ga-1">
                            <p class="text-h6 text-primary">{{ HocSinhDetail?.HoTen }}
                                <v-icon class="mb-1" size="20" v-if="!HocSinhDetail?.Nu">mdi-face-man</v-icon>
                                <v-icon class="mb-1" size="20" v-else>mdi-face-woman</v-icon>
                            </p>
                            <p class="text-caption">{{ HocSinhDetail?.HocSinhID }} • {{ HocSinhDetail?.NgaySinh }}</p>
                            <v-divider class="mt-1 mb-1" style="height: 4px;"></v-divider>
                            <div class="d-flex justify-space-evenly align-center">
                                <div class="text-center">
                                    Khối
                                    <p class="text-subtitle-2">{{ HocSinhDetail?.KhoiID }}</p>
                                </div>
                                <v-divider vertical></v-divider>
                                <div class="text-center">
                                    Lớp
                                    <p class="text-subtitle-2">{{ HocSinhDetail?.TenLop }}</p>
                                </div>
                            </div>

                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <p class="text-primary pt-4 font-weight-medium text-title mb-1">Phụ huynh</p>
        <v-card :flat="false" variant="elevated">
            <v-list-item>
                <v-list-item-title>
                    {{ userAccount.LastName }} {{ userAccount.FirstName }}
                    <v-icon v-if="userAccount.Sex" color="pink">mdi-gender-female</v-icon>
                    <v-icon v-else color="primary">mdi-gender-male</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle>
                    {{ userAccount.UserID }}
                    <span v-if="!!userAccount.Phone">• {{ userAccount.Phone ?? '-' }} </span>
                </v-list-item-subtitle>
                <template v-slot:prepend>
                    <v-avatar>
                        <v-img :src="urlAvatarPhuHuynh + userAccount.UserID" />
                    </v-avatar>
                </template>
            </v-list-item>
        </v-card>
        <v-divider class="mx-auto mt-4" inset></v-divider>
        <p class="text-primary pt-4 font-weight-medium text-title mb-1">Kỳ thi</p>
        <div class="d-flex flex-column ga-4 mb-16">
            <v-card v-for="hk in DSHocKy" :key="hk.id">
                <v-card-title class="d-flex ">
                    <img src="/_cdn/lhbs-lms/icon_hk.png" height="30" />
                    <p class="ml-4"> {{ hk.name }}</p>
                </v-card-title>
                <v-divider></v-divider>
                <v-expansion-panels flat multiple>
                    <v-expansion-panel v-for="(monHocGroup, index) in DSMonHocGroup" :key="index"
                        @click="(e) => onExpandMonHocGroup(e, hk, monHocGroup)">
                        <v-expansion-panel-title expand-icon="mdi-menu-down">
                            <div class="d-flex align-center ga-4">
                                <v-img :src="monHocGroup.icon" height="30" width="30"></v-img>
                                <p>{{ monHocGroup.Name_VI }}</p>
                            </div>
                            <div></div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <div class="pa-4 d-flex flex-column ga-4">
                                <v-card :color="randomColor()" v-for="monHoc in hk.DSMonHoc">
                                    <v-card-text>
                                        <p class="font-weight-medium">{{ monHoc.MonHocName }}</p>
                                        <p class="text-caption">Xếp loại: {{ monHoc.XepLoai ?? '-' }}</p>
                                        <p class="text-caption">
                                            Điểm trung bình:
                                            <v-chip :color="getColorChipDiem(monHoc.Diem)" size="small">
                                                {{ monHoc.Diem ?? '-' }}
                                            </v-chip>
                                        </p>
                                    </v-card-text>
                                    <v-list>
                                        <div v-for="(diem, index) in hk.DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)"
                                            :key="index">
                                            <v-list-subheader class="text-primary font-weight-medium"
                                                v-if="DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index].TenNhomCotDiem_VI !== DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index - 1]?.TenNhomCotDiem_VI">
                                                <v-icon size="small" class="mb-1 me-1">mdi-star-four-points</v-icon>
                                                {{ diem.TenNhomCotDiem_VI }}
                                            </v-list-subheader>
                                            <v-list-item>
                                                <v-list-item-title class="text-body-2">
                                                    <v-icon size="x-large">mdi-star-four-points-small</v-icon>
                                                    {{ diem.TenCotDiem_VI }}
                                                </v-list-item-title>
                                                <template v-slot:append>
                                                    <v-chip
                                                        :color="getColorChipDiem(parseFloat(diem.KetQuaDanhGia_VI))">{{
                                                            parseFloat(diem.KetQuaDanhGia_VI) }}</v-chip>
                                                </template>
                                            </v-list-item>
                                        </div>
                                        <v-divider class="mx-auto w-50 mt-2"></v-divider>
                                        <v-list-item>
                                            <v-list-item-title class="text-body-2 font-weight-medium text-primary">
                                                <v-icon size="small" class="mb-1">mdi-lead-pencil</v-icon> Nhận xét
                                            </v-list-item-title>
                                            <v-list-item-subtitle class="noLineClamp"> Chưa có nhận xét
                                            </v-list-item-subtitle>
                                        </v-list-item>
                                    </v-list>
                                </v-card>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card>
        </div>
        <v-menu transition="fab-transition">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="position-fixed" style="
            z-index: 10;
            bottom: 16px;
            right: 16px;
        " icon="" size="large" variant="elevated" :loading="IsLoadingDSHocSinh">
                    <v-img src="/_cdn/lhbs-lms/hoc_sinh.png" width="40" height="40" />
                </v-btn>
            </template>
            <v-list>
                <v-list-subheader>Danh sách học sinh</v-list-subheader>
                <v-list-item v-for="item in DSHocSinh" :key="item.StudentID" :disabled="item.Khoi <= 0"
                    @click="() => onSelectHocSinh(item)">
                    <template v-slot:prepend>
                        <v-avatar>
                            <v-img :src="urlAvatarHocSinh + item.StudentID" />
                        </v-avatar>
                    </template>
                    <v-list-item-title>{{ item.HoTen }}</v-list-item-title>
                    <v-list-item-title>{{ item.TenLop ?? '-' }} • {{ item.StudentID }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-bottom-sheet v-model="isShowSheet" fullscreen origin="overlap">
            <v-card rounded="0" flat>
                <v-toolbar color="primary ">
                    <div class="d-flex align-center pl-2 ga-4">
                        <img :src="MonHocGroup_Obj?.icon" width="30" height="30" style="object-fit: contain" />
                        <b>{{ MonHocGroup_Obj.Name_VI }}</b>
                    </div>
                    <v-spacer></v-spacer>

                    <v-btn icon="mdi-close" @click="isShowSheet = false" variant="text" />
                </v-toolbar>
                <v-card-text class="pa-0" style="height: calc(100vh - 60px); overflow: auto">
                    <p class="text-primary pl-4 pt-4 font-weight-medium text-title">Môn học</p>
                    <div>
                        <div v-if="DSMonHoc_ByGroup.length > 0" class="d-flex pa-4 ga-4" style="overflow-x: auto">
                            <v-card v-for="(item, index) in DSMonHoc_ByGroup" :key="index" :flat="false"
                                variant="elevated" minWidth="200" @click="() => (MonHocSelected = item)"
                                :color="MonHocSelected === item ? 'primary' : ''">
                                <v-card-text>
                                    <p class="font-weight-medium">{{ item.MonHocName }}</p>
                                    <p class="text-caption">Xếp loại: {{ item.XepLoai ?? '-' }}</p>
                                    <p class="text-caption">
                                        Điểm trung bình:
                                        <v-chip :color="getColorChipDiem(item.Diem)" size="small">
                                            {{ item.Diem ?? '-' }}
                                        </v-chip>
                                    </p>
                                </v-card-text>
                            </v-card>
                        </div>
                        <uc-empty v-else text="Không có dữ liệu môn học" />
                        <v-divider></v-divider>
                        <div v-if="MonHocSelected">
                            <v-list>
                                <p class="pl-4 font-weight-medium text-primary">
                                    {{ MonHocSelected?.MonHocName }}
                                </p>
                                <p class="pl-4 text-caption">Xếp loại: {{ MonHocSelected?.XepLoai ?? 'Chưa có xếp loại'
                                    }}</p>
                                <div class="pl-4 text-caption">
                                    Điểm trung bình:
                                    <v-chip v-if="MonHocSelected?.Diem" :color="getColorChipDiem(MonHocSelected?.Diem)"
                                        size="small">
                                        {{ MonHocSelected?.Diem }}
                                    </v-chip>
                                    <p v-else>Chưa có điểm</p>
                                </div>
                                <div v-for="(diem, index) in DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)"
                                    :key="index">
                                    <v-list-subheader class="text-primary font-weight-medium"
                                        v-if="DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index].TenNhomCotDiem_VI !== DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index - 1]?.TenNhomCotDiem_VI">
                                        <v-icon size="small" class="mb-1 me-1">mdi-star-four-points</v-icon>
                                        {{ diem.TenNhomCotDiem_VI }}
                                    </v-list-subheader>
                                    <v-list-item>
                                        <v-list-item-title class="text-body-2">
                                            <v-icon size="x-large">mdi-star-four-points-small</v-icon>
                                            {{ diem.TenCotDiem_VI }}
                                        </v-list-item-title>
                                        <template v-slot:append>
                                            <v-chip :color="getColorChipDiem(parseFloat(diem.KetQuaDanhGia_VI))">{{
                                                parseFloat(diem.KetQuaDanhGia_VI) }}</v-chip>
                                        </template>
                                    </v-list-item>
                                </div>
                                <v-divider class="mx-auto w-50 mt-2"></v-divider>
                                <v-list-item>
                                    <v-list-item-title class="text-body-2 font-weight-medium text-primary"> <v-icon
                                            size="small" class="mb-1">mdi-lead-pencil</v-icon> Nhận xét
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="noLineClamp"> Chưa có nhận xét </v-list-item-subtitle>
                                </v-list-item>
                            </v-list>
                        </div>
                        <uc-empty v-else />
                    </div>
                </v-card-text>
            </v-card>
            <v-card size="small"
                style="background-image: url(/_cdn/lhbs-lms/bg_report.png); background-repeat: no-repeat; background-size: 100% 100%; height: 100vh; background-attachment: fixed">
                <v-card-item class="pa-0">
                    <v-card-title class="pa-2 bg-primary" style="height: 48px">
                        <v-img :src="MonHocGroup_Obj?.icon" width="30" height="30"></v-img>
                        <span>{{ MonHocGroup_Obj.Name_VI }}</span>
                        <v-spacer />
                    </v-card-title>
                </v-card-item>
            </v-card>
        </v-bottom-sheet>
        <uc-loading-page v-model="IsLoadingPage"></uc-loading-page>
    </uc-app>
</template>

<script>
export default {
    props: [],
    data() {
        return {
            urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh,
            urlAvatarPhuHuynh: vueData.v_Set.urlAvatarPhuHuynh,
            tabs: 'HK1',
            tabIndex: 0,
            isShowSheet: false,
            arrayExpandValue: [],
            DSHocSinh: [],
            userAccount: vueData.user,
            HocSinhDetail: {},
            DSHocKy: [
                {
                    id: 1,
                    code: 'HK1',
                    name: 'Học kỳ 1'
                },
                {
                    id: 2,
                    code: 'HK2',
                    name: 'Học kỳ 2'
                },
            ],
            DSMonHocGroup: [
                {
                    MonHocGroup: 1,
                    Name_VI: 'KIẾN THỨC - KỸ NĂNG',
                    Name_EN: '',
                    icon: '/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png',
                },
                {
                    MonHocGroup: 2,
                    Name_VI: 'NĂNG LỰC CHUNG',
                    Name_EN: '',
                    icon: '/_cdn/lhbs-lms/nang_luc_chung_icon.png',
                },
                {
                    MonHocGroup: 3,
                    Name_VI: 'PHẨM CHẤT',
                    Name_EN: '',
                    icon: '/_cdn/lhbs-lms/pham_chat_icon.png',
                },
                {
                    MonHocGroup: 4,
                    Name_VI: 'NĂNG LỰC RIÊNG',
                    Name_EN: '',
                    icon: '/_cdn/lhbs-lms/nang_luc_rieng.png',
                },
            ],
            DSMonHoc: [],
            DSMonHoc_ByGroup: [],
            MonHocGroup_Obj: {},
            DSNhomDiem: [],
            MonHocSelected: null,
            IsLoadingPage: false,
            IsLoadingDSHocSinh: false
        }
    },
    mounted() {
        this.loadInfoHocSinh()
    },
    watch: {
        isShowSheet: function (isShow) {
            if (!isShow) {
                this.MonHocSelected = null
            }
        }
    },
    methods: {
        async loadInfoHocSinh() {
            this.IsLoadingPage = true
            const response = await hocSinhLopService.Calen_GetInfoStudentByPhuHuynhID()
            if (response.IsSuccess) {
                this.DSHocSinh = response.Result
                const DSHocSinhWithoutMamNon = response.Result.filter(x => x.Khoi > 0)
                if (DSHocSinhWithoutMamNon.length > 0) {
                    const firstHocSinhDetail = DSHocSinhWithoutMamNon[0]
                    this.loadHocSinhDetail(firstHocSinhDetail.StudentID).then(() => {
                        this.IsLoadingPage = false
                        console.log(this.DSHocKy)
                    })
                } else {
                    this.HocSinhDetail = null
                    this.IsLoadingPage = false
                }
            }
        },
        loadHocSinhDetail(HocSinhID) {
            return new Promise(async resolve => {
                const response = await hocSinhService.GetByHocSinhID({
                    HocSinhID: HocSinhID
                })
                if (response.IsSuccess) {
                    this.HocSinhDetail = response.Result
                    for (var hk of this.DSHocKy) {
                        const { DSMonHoc, DSDiem, DSNhomDiem } = await this.loadHocSinhKQHT(hk.code)
                        hk.DSMonHoc = DSMonHoc
                        hk.DSDiem = DSDiem
                        hk.DSNhomDiem = DSNhomDiem
                    }
                    resolve()
                }
            })
        },
        loadHocSinhKQHT(code) {
            return new Promise(async resolve => {
                const response = await hocSinhService.KQHT({
                    HocSinhID: this.HocSinhDetail.StudentID,
                    LopID: this.HocSinhDetail.LopID,
                    Semester: code
                })
                if (response.IsSuccess) {
                    const DSMonHoc = response.Result[0]
                    const DSDiem = response.Result[1]

                    const DSNhomDiem = DSDiem.reduce((result, element) => {
                        if (!result[element.TenNhomCotDiem_VI]) {
                            result[element.TenNhomCotDiem_VI] = []
                        }
                        result[element.TenNhomCotDiem_VI].push(element)
                        return result
                    }, [])
                    resolve({ DSMonHoc, DSDiem, DSNhomDiem })
                }
            })
        },
        handleClickMonHocGroup(hk, monHoc) {
            this.IsLoadingPage = true
            this.loadHocSinhKQHT(hk.code).then(() => {
                this.isShowSheet = true
                this.DSMonHoc_ByGroup = this.DSMonHoc.filter((i) => i.MonHocGroup === monHoc.MonHocGroup)
                this.MonHocGroup_Obj = _.cloneDeep(monHoc)
            }).finally(() => this.IsLoadingPage = false)
        },
        onSelectHocSinh(item) {
            this.IsLoadingPage = true
            this.loadHocSinhDetail(item.StudentID).then(() => {
                this.IsLoadingPage = false
            })
        },
        onExpandMonHocGroup(event, hk, monHocGroup) {
            if (event.currentTarget.classList.contains('v-expansion-panel--active')) {
                // this.loadHocSinhKQHT(hk.code)
            }
        },
        getColorChipDiem,
        stringToColor,
        randomColor() {
            const colorList = [
                'red-lighten-1',
                'pink-lighten-1',
                'purple-lighten-2',
                'purple-lighten-3',
                'deep-purple-lighten-2',
                'indigo-lighten-2',
                'blue-lighten-1',
                'cyan-darken-1',
                'teal-lighten-2',
                'green-lighten-1',
                'light-green-darken-1',
                'lime-lighten-2',
                'amber-lighten-4',
                'orange-darken-1',
                'deep-orange-lighten-1',
                'brown-lighten-2',
                'blue-grey-lighten-2',
                'grey-darken-1',
            ]
            const randomIndex = Math.floor(Math.random() * colorList.length);
            return colorList[randomIndex];
        },
    },
}
</script>