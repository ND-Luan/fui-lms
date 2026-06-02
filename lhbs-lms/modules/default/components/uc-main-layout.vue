<template>
	<Global>
        <div style="height: calc(100dvh - 24px); overflow-y: auto; padding: 8px">
            <v-card elevation="2" class="mb-4 rounded-lg" density="compact">
                <v-card-item class="py-2">
                    <v-card-title class="text-h6 font-weight-bold">
                        <v-icon icon="mdi-account-circle" size="small" class="mr-2"></v-icon>
                        Welcome Back! <span class="text-primary ml-2"> {{ vueData.user.LastName }} {{ vueData.user.FirstName }}</span>
                    </v-card-title>
                    <v-card-subtitle class="">
                        <p>{{ vueData.user.UserID }} - {{ vueData.user.Email }}</p>
                    </v-card-subtitle>
                </v-card-item>
            </v-card>

            <v-img src="/_cdn/lhbs-lms/bg_home_lms.png" height="450" />
            <div>
                <div class="text-h6">🌟 Giới thiệu hệ thống LMS dành cho giáo viên</div>
                <div>
                    Chào mừng đến với Hệ thống Quản lý Học tập (LMS) – công cụ hỗ trợ đắc lực cho giáo viên trong việc theo dõi, đánh giá và quản lý học sinh một cách hiệu quả và thuận tiện.
                    <br />
                    Với giao diện thân thiện và hiện đại, hệ thống giúp giáo viên tiết kiệm thời gian, tập trung vào việc giảng dạy chất lượng hơn.
                </div>
            </div>
            <div class="text-h6">🔧 Tính năng chính</div>
            <div>
                <div>
                    <div class="text-title">📝 Nhập điểm</div>
                    <v-list-item>
                        <v-list-item-title> • Dễ dàng nhập và cập nhật điểm số theo môn học, từng kỳ hoặc từng bài kiểm tra. </v-list-item-title>
                    </v-list-item>
                </div>
                <div>
                    <div class="text-title">🗒️ Nhập nhận xét tháng</div>
                    <v-list-item>
                        <v-list-item-title> • Ghi nhận và lưu trữ nhận xét định kỳ về thái độ học tập, ý thức và tiến bộ của học sinh. </v-list-item-title>
                    </v-list-item>
                </div>
                <div>
                    <div class="text-title">📊 Xem báo cáo học tập</div>
                    <v-list-item>
                        <v-list-item-title> • Truy cập nhanh các báo cáo tổng hợp: điểm trung bình, biểu đồ tiến bộ, đánh giá tổng quan của lớp. </v-list-item-title>
                    </v-list-item>
                </div>
                <div>
                    <div class="text-title">📋 Xem danh sách học sinh</div>
                    <v-list-item>
                        <v-list-item-title> • Danh sách học sinh được trình bày rõ ràng, dễ tìm kiếm, kèm thông tin cơ bản và tình trạng học tập. </v-list-item-title>
                    </v-list-item>
                </div>
            </div>
        </div>
    </Global>
</template>

<script>
	export default {
		data() {
        return {
            vueData,
            data: [],
            activeKhoi: 0,
            khoiList: [],
            loading: false,
        }
    },
    mounted() {
        // this.getDSLop(vueData.user.FunctionRight);
    },
    methods: {
        getDSLop(FunctionRight) {
            this.loading = true
            ajaxCALL('lms/Lop_Mon_Get', null, (res) => {
                const _data = res.data.map((x) => ({
                    ...x,
                    FunctionRight: x.CapID === 1 ? '10' : x.CapID === 2 ? '20' : '30',
                }))

                const filteredData = _data.filter((x) => FunctionRight.includes(x.FunctionRight))

                this.khoiList = [...new Set(filteredData.map((x) => x.KhoiID))].sort((a, b) => a - b)
                const DSLop = this.khoiList
                    .map((khoiID) => {
                        const khoiFiltered = filteredData.filter((x) => x.KhoiID === khoiID)
                        const lopIDs = [...new Set(khoiFiltered.map((x) => x.LopID))]

                        const DSLop = lopIDs.map((lopID) => {
                            const lopFiltered = khoiFiltered.filter((x) => x.LopID === lopID)
                            const _lop = lopFiltered[0]
                            return {
                                LopID: lopID,
                                TenLop: _lop?.TenLop ?? '',
                                KhoiID: khoiID,
                                DSMon: lopFiltered.map((mon) => ({
                                    Color: mon.Color || 'primary',
                                    MonID: mon.MonID,
                                    TenMon: mon.MonHocName,
                                })),
                            }
                        })

                        return DSLop
                    })
                    .flat()

                this.data = DSLop
                this.loading = false
                console.log('Structured Data:', this.data)
            })
        },
        getLopByKhoi(khoiID) {
            return this.data.filter((lop) => lop.KhoiID === khoiID)
        },
    },
	}
</script>