<template>
    <uc-app :isAdmin="false">
        <div class="font-weight-medium text-primary mt-4 d-flex justify-space-between align-center">
            <p>{{ $t('message.studyResult') }}</p>
            <v-chip label size="large" color="primary">
                Tháng 10
            </v-chip>
        </div>
        <v-divider class="mx-auto w-50 mt-2 mb-2" style="background-color: white; min-height:2px"></v-divider>
        <div>
            <p class="text-primary  font-weight-medium mb-2">{{ $t('message.selectedStudent') }}</p>
            <v-skeleton-loader v-if="IsLoadingPage" class="mx-auto" elevation="4" type="article"
                boilerplate></v-skeleton-loader>
            <v-card v-else>
                <v-card-text v-if="HocSinhDetail">
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
                                <p class="text-caption">{{ HocSinhDetail?.HocSinhID }} • {{ HocSinhDetail?.NgaySinh }}
                                </p>
                                <v-divider class="mt-1 mb-1" style="height: 4px;"></v-divider>
                                <div class="d-flex justify-space-evenly align-center">
                                    <div class="text-center">
                                        {{ $t('message.grade') }}
                                        <p class="text-subtitle-2">{{ HocSinhDetail?.KhoiID }}</p>
                                    </div>
                                    <v-divider vertical></v-divider>
                                    <div class="text-center">
                                        {{ $t('message.class') }}
                                        <p class="text-subtitle-2">{{ HocSinhDetail?.TenLop }}</p>
                                    </div>
                                </div>

                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-text v-else>
                    <uc-empty text="Không tìm thấy học sinh" />
                </v-card-text>
            </v-card>

            <v-row class="mt-2">
                <v-col cols="12" class="text-primary font-weight-medium pb-0"> {{ $t('message.evaluation') }}</v-col>
                <v-col cols="12" v-for="item in 6">
                    <v-card>
                        <v-card-text>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ea rerum veniam excepturi
                            quod doloribus reiciendis tenetur repellendus! Commodi atque natus culpa hic quas tempora
                            amet fuga autem totam, consectetur quae.
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" class="pb-0">
                    <p class="text-primary font-weight-medium ">{{ $t('message.comment') }}</p>
                </v-col>
                <v-col cols="12" class="mb-16">
                    <v-card>
                        <v-card-text>
                            <p>
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nesciunt quos magni ipsum
                                error
                                nostrum
                                ea
                                exercitationem facere ducimus deleniti, ipsa facilis, officiis, fuga soluta fugiat?
                                Consequuntur
                                sequi atque explicabo sint!
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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
                    <v-list-subheader>{{ $t('message.studentList') }}</v-list-subheader>
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
        </div>
        <uc-loading-page v-model="IsLoadingPage"></uc-loading-page>
    </uc-app>
</template>

<script>
export default {
    props: {

    },
    data() {
        return {
            DSHocSinh: [],
            HocSinhDetail: null,
            IsLoadingDSHocSinh: false,
            IsLoadingPage: false,
            urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh
        }
    },
    mounted() {
        this.loadDSHocSinh()
    },
    watch: {
        HocSinhDetail: function (hocSinh) {
            console.log(hocSinh);
        }
    },
    methods: {
        async loadDSHocSinh() {
            this.IsLoadingPage = true
            this.IsLoadingDSHocSinh = true
            const response = await hocSinhLopService.Calen_GetInfoStudentByPhuHuynhID()
            if (response.IsSuccess) {
                this.IsLoadingDSHocSinh = false
                this.DSHocSinh = response.Result
                const DSHocSinhWithoutMamNon = response.Result.filter(x => x.Khoi > 0)
                if (DSHocSinhWithoutMamNon.length > 0) {
                    const firstHocSinhDetail = DSHocSinhWithoutMamNon[0]
                    this.loadHocSinhDetail(firstHocSinhDetail.StudentID).then(() => {
                        this.IsLoadingPage = false
                    })
                } else {
                    this.HocSinhDetail = null
                    this.IsLoadingPage = false
                }
            }
        },
        loadHocSinhDetail(HocSinhID) {
            return new Promise(async resolve => {
                const response = await hocSinhLopService.HocSinh_Detail_GetBy_HocSinhID({
                    HocSinhID: HocSinhID
                })
                if (response.IsSuccess) {
                    this.HocSinhDetail = response.Result
                    resolve()
                }
            })

        },
        async onSelectHocSinh(item) {
            this.IsLoadingPage = true
            this.loadHocSinhDetail(item.StudentID).then(() => {
                this.IsLoadingPage = false
            })
        }
    }
}
</script>