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
                <v-col cols="12" v-for="item in NoiDungDanhGia">
                    <v-card>
                        <v-card-text>
                            <b>{{ item.TieuDe }}</b> {{ item.NoiDung }}
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
                                Chúng tôi rất vui khi thấy cháu có sự tiến bộ trong học tập và tích cực tham gia các
                                hoạt động của lớp. Cháu ngoan ngoãn, lễ phép, và biết tự giác hoàn thành nhiệm vụ. Tuy
                                nhiên, chúng tôi sẽ nhắc nhở cháu tập trung hơn trong giờ học, hạn chế nói chuyện riêng
                                và rèn luyện thêm tính cẩn thận khi làm bài tập. Cảm ơn cô giáo đã quan tâm và hướng dẫn
                                cháu tận tình!
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
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
			vueData,
            NoiDungDanhGia: [
                {
                    TieuDe: "Học tập:",
                    NoiDung: " Tiếp thu bài tốt, nắm được kiến thức các môn học trong tháng, vận dụng làm được các bài tập liên quan. Nhưng để đạt được kết quả tốt hơn, hãy ôn luyện kĩ các kiến thức đã học."
                },
                {
                    TieuDe: "Môn Tiếng Việt:",
                    NoiDung: "Có kĩ năng viết văn tốt, đọc to rõ ràng và trả lời được các câu hỏi trong bài, chữ viết đẹp."
                },
                {
                    TieuDe: "Môn Toán:",
                    NoiDung: "Có kĩ năng tính toán tốt, nắm vững bảng nhân, chia và vận dụng vào làm bài tốt. Tuy nhiên cần đọc kĩ đề bài và tính toán cẩn thận hơn."
                },
                {
                    TieuDe: "Năng lực - Phẩm chất:",
                    NoiDung: "Ngoan ngoãn, lễ phép, hòa đồng với bạn bè. Tích cực tham gia phát biểu, xây dựng bài. Biết tự giác chuẩn bị đồ dùng học tập cũng như hoàn thành các nhiệm vụ được giao trên lớp và ở nhà, biết tự giác phụ giúp gia đình. Tuy nhiên cần có sự tập trung hơn trong các giờ học, hạn chế nói chuyện và làm việc riêng trong giờ học."
                },
                {
                    TieuDe: "Hoạt động khác",
                    NoiDung: "Tích cực tham gia các hoạt động qua từng môn học, phong trào của lớp theo chủ đề trong tháng"
                },
                {
                    TieuDe: "Robotics - AI:",
                    NoiDung: "Chủ đề Mắc phơi đồ tự động thông minh."
                },
            ],
            DSHocSinh: [],
            HocSinhDetail: null,
            IsLoadingDSHocSinh: false,
            IsLoadingPage: false,
            urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh
        }
    },
    mounted() {
        const url = new URL(window.location.href); // Lấy URL hiện tại
        const params = new URLSearchParams(url.search); // Lấy phần query string
        const id = params.get("id"); // Lấy giá trị của tham số "id"
        console.log(id); // Kết quả: 3
        this.onSelectHocSinh(id)

    },
    watch: {
        HocSinhDetail: function (hocSinh) {
            console.log(hocSinh);
        }
    },
    methods: {
        loadHocSinhDetail(HocSinhID) {
            return new Promise(async resolve => {
                const response = await hocSinhLopService.HocSinh_Detail_GetBy_HocSinhID({
                    HocSinhID: HocSinhID,
					NienKhoa: vueData.NienKhoa
                })
                if (response.IsSuccess) {
                    this.HocSinhDetail = response.Result
                    resolve()
                }
            })

        },
        async onSelectHocSinh(id) {
            this.IsLoadingPage = true
            this.loadHocSinhDetail(id).then(() => {
                this.IsLoadingPage = false
            })
        }
    }
}
</script>