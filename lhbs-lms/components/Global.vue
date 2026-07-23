<template>
	<div>
        <GlobalLoading />
        <GlobalApiErrorDialog />
        <GlobalStaleDataBanner />
        <GlobalUiSnackbar ref="snackbarRef" />
        <GlobalIframeWindow ref="iframeWin" />
        <GlobalConfirmDialog ref="confirmRef" />
        <GlobalUploadManager />
        <uc-system-toolbar v-if="!isInIframe" />
        <uc-ticket-status v-if="!isInIframe" />
        <v-responsive>
            <v-app theme="light">
                <!-- Navigation Drawer & Toolbar (Commented out)
                <v-layout v-if="hasNavigation">
                    <GlobalNavigationDrawer
                        :menu-left="resolvedMenuLeft"
                        :user-info="resolvedUserInfo"
                        :avatar-url="resolvedAvatarUrl"
                        :role-label="resolvedRoleLabel"
                        :school-name="schoolName"
                        :version="version"
                        :is-mobile="isMobile"
                        :current-url="activeModuleUrl"
                        :rail="rail"
                        :mobile-drawer="mobileDrawer"
                        @update:mobile-drawer="mobileDrawer = $event"
                        @navigate="handleDrawerNavigate"
                        @nienkhoa-loaded="onNienKhoaLoaded"
                    />

                    <v-main>
                        <v-toolbar v-if="hasNavigation" density="compact" color="white" style="position: sticky; top: 0; z-index: 1000">
                            <v-btn icon="mdi-menu" v-if="!isMobile" @click="rail = !rail" variant="text" />
                            <v-btn icon="mdi-menu" v-if="isMobile" @click="mobileDrawer = !mobileDrawer" variant="text" />

                            <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                                {{ activeTitle || schoolName }}
                            </v-toolbar-title>

                            <v-spacer />

                            <div class="d-flex align-center ga-1 px-2">
                                <v-btn icon size="small" variant="text" @click="changeLang('VI')">
                                    <v-img src="https://flagcdn.com/w40/vn.png" width="24" />
                                    <v-tooltip activator="parent" location="bottom">Tiếng Việt</v-tooltip>
                                </v-btn>
                                <v-btn icon size="small" variant="text" @click="changeLang('EN')">
                                    <v-img src="https://flagcdn.com/w40/gb.png" width="24" />
                                    <v-tooltip activator="parent" location="bottom">English (Coming soon)</v-tooltip>
                                </v-btn>
                            </div>
                        </v-toolbar>

                        <div v-if="!isNienKhoaReady" class="d-flex flex-column align-center justify-center" style="height: calc(100dvh - 48px)">
                            <v-progress-circular indeterminate color="primary" size="48" />
                            <p class="mt-4 text-body-2 text-medium-emphasis">Đang tải dữ liệu...</p>
                        </div>

                        <div v-else class="global-content-wrapper" style="height: calc(100dvh - 48px); width: 100%">
                            <iframe v-show="resolvedModuleSrc" ref="moduleIframe" :src="resolvedModuleSrc" style="width: 100%; height: 100%; border: none; display: block" @load="onIframeLoad"></iframe>
                            <div v-if="!resolvedModuleSrc" class="h-100">
                                <slot />
                            </div>
                        </div>
                    </v-main>
                </v-layout> 
                -->

                <v-main>
                    <v-container fluid class="pa-0">
                        <div ref="headerRef">
                            <slot name="header" />
                        </div>
                        <slot />
                    </v-container>
                </v-main>
            </v-app>
        </v-responsive>
    </div>
</template>

<script>
	export default {
		name: 'Global',
    inject: ['iframeRef', 'snackbarRef', 'confirmRef'],

    props: {
        navigation: { type: Boolean, default: null },
        isTest: { type: Boolean, default: true },
        userInfo: { type: Object, default: null },
        avatarUrl: { type: String, default: '' },
        schoolName: { type: String, default: '' },
        version: { type: String, default: '' },
        uploadManager: { type: Boolean, default: false },
        // Override menu nếu cần (thường không cần truyền — tự lấy RAW_MENU)
        menuLeft: { type: Array, default: null },
    },

    emits: ['navigate'],

    data() {
        return {
            vueData: vueData,
            activeModuleUrl: window.location.pathname + window.location.search,
            rail: false,
            mobileDrawer: false,
            isInIframe: window !== window.top,
            isNienKhoaReady: false,
            ROLE_LABEL_MAP: { 1: 'GVCN', 2: 'GV Bộ môn', 3: 'BGH', 5: 'Tổ trưởng', 9: 'Admin' },
            RAW_MENU: [
                {
                    name: 'Học liệu số',
                    icon: 'mdi-folder-multiple',
                    right: { SystemRight: [1, 2, 3, 5, 9] },
                    submenu: [
                        { name: 'Kho học liệu', url: '/hoc-lieu-so' },
                        { name: 'Soạn học liệu', url: '/soan-hoc-lieu-v2' },
                        { name: 'Quản lý học liệu số', url: '/quan-ly-hoc-lieu', right: { SystemRight: [3, 5, 9] } },
                        { name: 'Báo cáo HLS & LMS', url: '/lms-teacher-summary', right: { SystemRight: [3, 5, 9] } },
                        { name: 'HDSD - Học liệu số', url: 'https://nd-luan.github.io/docs-lms-hls/' },
                    ],
                },
                {
                    name: 'Giao bài',
                    icon: 'mdi-notebook-outline',
                    right: { SystemRight: [1, 2, 3, 5, 9] },
                    submenu: [
                        { name: 'Giao bài', url: '/lms-teacher-dashboard' },
                        { name: 'Phản hồi từ phụ huynh', url: '/gv-xem-y-kien-phu-huynh-giao-bai' },
                        { name: 'Báo cáo giao bài', url: '/lms-teacher-assign-resource', right: { SystemRight: [5, 3, 9] } },
                        { name: 'Báo cáo HLS & LMS', url: '/lms-teacher-summary', right: { SystemRight: [3, 5, 9] } },
                    ],
                },
                {
                    name: 'Cấp 1 - Giáo viên',
                    icon: 'mdi-human-male-board',
                    right: { FunctionRight: ['10'], SystemRight: [1, 2, 5, 9] },
                    submenu: [
                        { name: 'Danh sách học sinh', url: '/fui-gv-ds-hoc-sinh-lop?capid=1', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Nhập nhận xét tháng', url: '/gv-nhan-xet-thang?capid=1', right: { SystemRight: [1, 5, 9] } },
                        { name: 'Nhập điểm / Đánh giá', url: '/nhap-diem?capid=1', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'GV Bộ Môn gửi điểm', url: '/gv-bm-gui-diem?capid=1', right: { SystemRight: [2, 9] } },
                        { name: 'Duyệt điểm', url: '/gv-duyet-diem-c1', right: { SystemRight: [1, 5, 9] } },
                        { name: 'Điểm tổng theo môn', url: '/fui-tong-qua-trinh-bang-diem?capid=1', right: { SystemRight: [1, 3, 2, 5, 9] } },
                        { name: 'Xem ý kiến phụ huynh', url: '/gv-xem-y-kien-phu-huynh?capid=1', right: { SystemRight: [1, 2, 3, 5, 9] } },
                        { name: 'Khen thưởng', url: '/gv-khen-thuong?capid=1', right: { SystemRight: [1, 5, 9] } },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=1',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                        { name: 'Chữ kí của tôi', url: '/fui-cap-nhat-chu-ky', right: { SystemRight: [1, 2, 9] } },
                    ],
                },
                {
                    name: 'Cấp 1 - Tổ trưởng',
                    icon: 'mdi-account-tie',
                    right: { FunctionRight: ['10'], SystemRight: [5, 9] },
                    submenu: [
                        { name: 'Duyệt điểm', url: '/fui-tt-duyet-diem?capid=1' },
                        { name: 'Duyệt nhận xét tháng', url: '/tt-duyet-nhan-xet-thang?capid=1' },
                        { name: 'TA - Duyệt điểm - Theme', url: '/tt-duyet-diem-theme' },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=1' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki-c1?capid=1' },
                        { name: 'DS Khen thưởng', url: '/gv-xem-tong-ket-ds-khen-thuong?capid=1' },
                        { name: 'SL Khen thưởng', url: '/gv-xem-tong-ket-ty-le-khen-thuong?capid=1' },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=1',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                        { name: 'Báo cáo', url: '/bao-cao-cap-1' },
                    ],
                },
                {
                    name: 'Cấp 1 - BGH',
                    icon: 'mdi-account-tie',
                    right: { FunctionRight: ['10'], SystemRight: [3, 9] },
                    submenu: [
                        { name: 'Duyệt điểm', url: '/bgh-duyet-diem?capid=1' },
                        { name: 'Duyệt nhận xét tháng', url: '/tt-duyet-nhan-xet-thang?capid=1' },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=1' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki-c1?capid=1' },
                        { name: 'DS Khen thưởng', url: '/gv-xem-tong-ket-ds-khen-thuong?capid=1' },
                        { name: 'SL Khen thưởng', url: '/gv-xem-tong-ket-ty-le-khen-thuong?capid=1' },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=1',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                        { name: 'Mở/Khóa cột điểm', url: '/gv-khoa-cot-diem?capid=1' },
                        { name: 'Báo cáo', url: '/bao-cao-cap-1' },
                    ],
                },
                {
                    name: 'Cấp 2 - Giáo viên',
                    icon: 'mdi-human-male-board',
                    right: { FunctionRight: ['20'], SystemRight: [1, 2, 3, 5, 9] },
                    submenu: [
                        { name: 'Danh sách học sinh', url: '/fui-gv-ds-hoc-sinh-lop?capid=2', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Nhập nhận xét tháng', url: '/gv-nhan-xet-thang?capid=2', right: { SystemRight: [1, 3, 5, 9] } },
                        { name: 'Nhập điểm / Đánh giá', url: '/nhap-diem?capid=2', right: { SystemRight: [1, 2, 3, 5, 9] } },
                        { name: 'Xem điểm', url: '/gv-xem-diem?capid=2', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=2' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki?capid=2', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Điểm tổng theo môn', url: '/fui-tong-qua-trinh-bang-diem?capid=2', right: { SystemRight: [1, 3, 2, 5, 9] } },
                        { name: 'Xem ý kiến phụ huynh', url: '/gv-xem-y-kien-phu-huynh?capid=2', right: { SystemRight: [1, 2, 3, 5, 9] } },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=2',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                        { name: 'Chữ kí của tôi', url: '/fui-cap-nhat-chu-ky', right: { SystemRight: [1, 2, 3, 9] } },
                    ],
                },
                {
                    name: 'Cấp 2-BGH/Tổ trưởng',
                    icon: 'mdi-account-tie',
                    right: { FunctionRight: ['20'], SystemRight: [3, 5, 9] },
                    submenu: [
                        { name: 'Duyệt điểm', url: '/bgh-duyet-diem-c2' },
                        { name: 'Duyệt nhận xét tháng', url: '/tt-duyet-nhan-xet-thang?capid=2' },
                        { name: 'Xem duyệt điểm', url: '/tt-xem-duyet-diem?capid=2' },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=2' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki?capid=2' },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=2',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                    ],
                },
                {
                    name: 'Cấp 3 - Giáo viên',
                    icon: 'mdi-human-male-board',
                    right: { FunctionRight: ['30'], SystemRight: [1, 2, 3, 5, 9] },
                    submenu: [
                        { name: 'Danh sách học sinh', url: '/fui-gv-ds-hoc-sinh-lop?capid=3', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Danh sách học sinh (AV)', url: '/gv-ds-hoc-sinh-lop-av?capid=3', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Nhập Nhận xét Tháng', url: '/gv-nhan-xet-thang?capid=3', right: { SystemRight: [1, 3, 5, 9] } },
                        { name: 'Nhập điểm / Đánh giá', url: '/nhap-diem?capid=3', right: { SystemRight: [1, 2, 3, 5, 9] } },
                        { name: 'Xem điểm', url: '/gv-xem-diem?capid=3', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=3' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki?capid=3', right: { SystemRight: [1, 2, 5, 9] } },
                        { name: 'Điểm tổng theo môn', url: '/fui-tong-qua-trinh-bang-diem?capid=3', right: { SystemRight: [1, 3, 2, 5, 9] } },
                        { name: 'Xem ý kiến phụ huynh', url: '/gv-xem-y-kien-phu-huynh?capid=3', right: { SystemRight: [1, 2, 3, 5, 9] } },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=3',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                        { name: 'Chữ kí của tôi', url: '/fui-cap-nhat-chu-ky', right: { SystemRight: [1, 2, 3, 5, 9] } },
                    ],
                },
                {
                    name: 'Cấp 3-BGH/Tổ trưởng',
                    icon: 'mdi-account-tie',
                    right: { FunctionRight: ['30'], SystemRight: [3, 5, 9] },
                    submenu: [
                        { name: 'Duyệt điểm', url: '/bgh-duyet-diem-c3' },
                        { name: 'Duyệt nhận xét tháng', url: '/tt-duyet-nhan-xet-thang?capid=3' },
                        { name: 'Xem duyệt điểm', url: '/tt-xem-duyet-diem?capid=3' },
                        { name: 'Bảng điểm Theo Khối', url: '/bang-diem-chi-tiet-mon-hoc?capid=3' },
                        { name: 'Tổng kết Học Kì', url: '/gv-xem-tong-ket-hoc-ki?capid=3' },
                        {
                            name: 'Tổng hợp dữ liệu cuộc thi',
                            url: '/dashboard-tong-hop-du-lieu-cuoc-thi?capid=3',
                            right: {
                                SystemRight: [1, 5, 9],
                            },
                        },
                    ],
                },
                {
                    name: 'Báo cáo chung',
                    icon: 'mdi-clipboard-text-outline',
                    right: { FunctionRight: ['10', '20', '30'], SystemRight: [3, 5, 9] },
                    submenu: [
                        { name: 'C1-Tổng quan chung', url: '/bgh-thong-ke-danh-hieu?CapID=1' },
                        { name: 'C2-Tổng quan chung', url: '/bgh-thong-ke-danh-hieu?CapID=2' },
                        { name: 'C3-Tổng quan chung', url: '/bgh-thong-ke-danh-hieu?CapID=3' },
                        { name: 'C1-Phân phối điểm', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-cap-1' },
                        { name: 'C1-Điểm MH theo Khối', url: '/thongke-monhoc-theokhoi?capid=1' },
                        { name: 'C2-Phân phối điểm', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-cap-2' },
                        { name: 'C2-Điểm MH theo Khối', url: '/thongke-monhoc-theokhoi?capid=2' },
                        { name: 'C3-Phân phối điểm', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-cap-3' },
                        { name: 'C3-Điểm MH theo Khối', url: '/thongke-monhoc-theokhoi?capid=3' },
                    ],
                },
                {
                    name: 'Báo cáo học kì',
                    icon: 'mdi-clipboard-text-outline',
                    right: { FunctionRight: ['20', '30'], SystemRight: [5, 9] },
                    submenu: [
                        { name: 'C2-Báo cáo tổng kết HK', url: '/bao-cao-diem-tong-ket-hoc-ki?capid=2' },
                        { name: 'C3-Báo cáo tổng kết HK', url: '/bao-cao-diem-tong-ket-hoc-ki?capid=3' },
                    ],
                },
                {
                    name: 'Báo cáo Tiếng Anh',
                    icon: 'mdi-clipboard-text-outline',
                    right: { FunctionRight: ['10', '20', '30'], SystemRight: [1, 2, 3, 5, 9] },
                    submenu: [
                        { name: 'Chỉ tiêu tiếng anh 1', url: '/cau-hinh-chi-tieu-mon-hoc' },
                        { name: 'Chỉ tiêu tiếng anh 2', url: '/cau-hinh-chi-tieu-tieng-anh-2' },
                        { name: 'C1-Tổng quan', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-ta-cap-1', right: { SystemRight: [9] } },
                        { name: 'C2 - Phân tích kĩ năng', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-ta-cap-2' },
                        { name: 'C2 - Thống kê Cambridge', url: '/thong-ke-cambridge-cap-2' },
                        { name: 'C3 - Phân tích kĩ năng', url: '/dashboard-tong-quan-tinh-hinh-hoc-tap-ta-cap-3' },
                        { name: 'C3 - IELTS', url: '/dashboard-tinh-hinh-hoc-tap-ta-cap-3-ielts' },
                        { name: 'C3 - Thống kê TA2', url: '/thong-ke-bang-diem-AV2' },
                        { name: 'C3-Điểm chi tiết', url: '/fui-tong-qua-trinh-bang-diem?capid=3' },
                        { name: 'Báo cáo chỉ tiêu TA', url: '/bao-cao-chi-tieu-tieng-anh' },
                    ],
                },
                {
                    name: 'Tổng hợp báo cáo',
                    url: '/bc-tong-hop-bao-cao',
                    icon: 'mdi-clipboard-text-outline',
                    right: { FunctionRight: ['10', '20', '30'], SystemRight: [1, 5, 9] },
                },
                {
                    name: 'Khen thưởng cuối năm',
                    icon: 'mdi-clipboard-text-outline',
                    right: { FunctionRight: ['10', '20', '30'], SystemRight: [5, 9] },
                    submenu: [
                        { name: 'TH-Tổng kết HK', url: '/gv-xem-tong-ket-hoc-ki-c1?capid=1', right: { FunctionRight: ['10'] } },
                        { name: 'TH-Danh sách KT', url: '/gv-xem-tong-ket-ds-khen-thuong?capid=1', right: { FunctionRight: ['10'] } },
                        { name: 'TH-Số lượng KT', url: '/gv-xem-tong-ket-ty-le-khen-thuong?capid=1', right: { FunctionRight: ['10'] } },
                        { name: 'THCS-Tổng kết HK', url: '/gv-xem-tong-ket-hoc-ki?capid=2' },
                        { name: 'THPT-Tổng kết HK', url: '/gv-xem-tong-ket-hoc-ki?capid=3' },
                        { name: 'Cập nhật Danh Hiệu', url: '/sys-danh-hieu' },
                        { name: 'Cập nhật Số/Ngày QĐ', url: '/cap-nhat-so-ngay-qd' },
                    ],
                },
                {
                    name: 'Thiết lập chỉ tiêu',
                    icon: 'mdi-format-list-numbered',
                    right: { SystemRight: [5, 9] },
                    submenu: [
                        { name: 'Chỉ tiêu Tiểu học', url: '/cau-hinh-chi-tieu-c1' },
                        { name: 'Chỉ tiêu Trung học', url: '/cau-hinh-chi-tieu-c2' },
                    ],
                },
                { name: 'Học bổng', icon: 'mdi-school-outline', url: '/hoc-bong', right: { SystemRight: [5, 9] } },
                {
                    name: 'Thống kê chất lượng bộ môn',
                    icon: 'mdi-clipboard-text-outline',
                    url: '/thong-ke-chat-luong-bo-mon',
                    right: {
                        SystemRight: [5, 9],
                    },
                },
                {
                    name: 'Hệ thống',
                    icon: 'mdi-security',
                    right: { FunctionRight: ['10', '20', '30'], SystemRight: [5, 9] },
                    submenu: [
                        { name: 'Phân công giáo viên', url: '/bgh-phan-cong-giao-vien' },
                        { name: 'Danh sách chữ kí giáo viên', url: '/fui-chu-ky' },
                        { name: 'Danh sách giáo viên', url: '/ds-giao-vien' },
                        { name: 'Môn học lớp', url: '/fui-mon-hoc-lop' },
                        { name: 'Sắp xếp HS nhóm', url: '/xep-hoc-sinh-nhom-av' },
                        { name: 'Đồng bộ điểm - Tiểu học', url: '/gv-xem-diem-c1' },
                        { name: 'Đồng bộ điểm - THCS', url: '/gv-xem-diem?capid=2' },
                        { name: 'Đồng bộ điểm - THPT', url: '/gv-xem-diem?capid=3' },
                        { name: 'Cấu trúc điểm - Tiểu học', url: '/cau-hinh-mau-bang-diem?capid=1' },
                        { name: 'Cấu trúc điểm - THCS', url: '/cau-hinh-mau-bang-diem?capid=2' },
                        { name: 'Cấu trúc điểm - THPT', url: '/cau-hinh-mau-bang-diem?capid=3' },
                        { name: 'Cấu hình thông báo giao bài', url: '/lms-cau-hinh-thong-bao-giao-bai' },
                        { name: 'Cấu hình nhận xét Tiếng Anh C1', url: '/cau-hinh-nhan-xet' },
                        { name: 'Cấu hình kĩ năng câu hỏi', url: '/cau-hinh-ki-nang-cau-hoi' },
                        { name: 'Tiến độ nhập điểm', url: '/admin-check-nhap-diem' },
                    ],
                },
                { name: 'Hướng dẫn sử dụng', icon: 'mdi-book', url: '' },
                { name: 'Hỗ trợ sự cố', icon: 'mdi-help-circle-outline', url: '/support' },
                {
                    name: 'Tiến độ giao bài',
                    icon: 'mdi-help-circle-outline',
                    url: '/admin-check-giao-bai',
                    right: { SystemRight: [9] },
                },
                {
                    name: 'Tiến độ nhập điểm',
                    icon: 'mdi-help-circle-outline',
                    url: '/admin-check-nhap-diem',
                    right: {
                        SystemRight: [5, 9],
                    },
                },
                {
                    name: 'Cập nhật tình trạng NXT',
                    icon: 'mdi-help-circle-outline',
                    url: '/admin-tinh-trang-nxt',
                    right: {
                        SystemRight: [9],
                    },
                },
                {
                    name: 'LOG',
                    icon: 'mdi-monitor-eye',
                    right: { SystemRight: [5, 9] },
                    submenu: [
                        { name: 'Thời khóa biểu', icon: 'mdi-monitor-eye', url: '/lms-teacher-log-shedule' },
                        { name: 'Báo lỗi hệ thống', url: '/admin-ticket', right: { SystemRight: [9] } },
                    ],
                },
            ],
        }
    },

    computed: {
        isMobile() {
            return this.$vuetify?.display?.mobile || false
        },

        resolvedUserInfo() {
            return this.userInfo || vueData?.user || {}
        },

        resolvedAvatarUrl() {
            return this.avatarUrl || this.resolvedUserInfo?.avatarUrl || this.resolvedUserInfo?.AvatarUrl || ''
        },

        // SystemRight: chuẩn hóa thành mảng số — user trả về số đơn hoặc mảng
        resolvedUserSystemRights() {
            const sr = this.resolvedUserInfo?.SystemRight
            if (Array.isArray(sr)) return sr.map(Number)
            if (sr != null) return [Number(sr)]
            return []
        },

        // FunctionRight: chuẩn hóa thành mảng string
        resolvedUserFunctionRights() {
            const fr = this.resolvedUserInfo?.FunctionRight || []
            return Array.isArray(fr) ? fr.map(String) : [String(fr)]
        },

        resolvedRoleLabel() {
            return this.getRoleLabel(this.resolvedUserInfo)
        },

        resolvedMenuLeft() {
            const raw = this.menuLeft || vueData?.menuLeft || this.RAW_MENU
            return this.filterMenu(raw, this.resolvedUserSystemRights, this.resolvedUserFunctionRights)
        },

        hasNavigation() {
            if (this.isInIframe) return false // Không hiện Drawer nếu đang ở trong Iframe
            if (this.navigation !== null) return this.navigation // tường minh nhất
            if (this.isTest) return true // test mode
            return true // mặc định (trong App Shell mới là true)
        },

        activeTitle() {
            if (!this.resolvedMenuLeft) return null
            const flat = this.resolvedMenuLeft.flatMap((item) => (item.submenu?.length ? item.submenu : [item]))
            const currentPath = (this.activeModuleUrl || '').split('?')[0].replace(/\/$/, '')
            return (
                flat.find((item) => {
                    if (!item.url) return false
                    const targetPath = item.url.split('?')[0].replace(/\/$/, '')
                    return targetPath === currentPath
                })?.name || null
            )
        },

        resolvedModuleSrc() {
            if (this.isNienKhoaReady && this.activeModuleUrl) {
                // Return activeModuleUrl trực tiếp.
                // Nó đã được buildUrlWithYear xử lý trong handleDrawerNavigate và onNienKhoaLoaded.
                // Việc tách biệt này giúp khi đổi niên khóa (chỉ đổi URL top-level), iframe không bị reload.
                return this.activeModuleUrl
            }
            return null
        },
    },

    mounted() {
        this.observer = new ResizeObserver((entries) => {
            // headerHeight nếu cần dùng sau
        })
        if (this.$refs.headerRef) {
            this.observer.observe(this.$refs.headerRef)
        }
        this.iframeRef.value = this.$refs.iframeWin
        this.snackbarRef.value = this.$refs.snackbarRef
        this.confirmRef.value = this.$refs.confirmRef

        if (this.isInIframe) {
            // Bên trong iframe: đọc nienkhoa từ URL params (do App Shell nhúng vào)
            const params = new URLSearchParams(window.location.search)
            const nk = parseInt(params.get('NienKhoa'))
            const hk = params.get('HocKi')
            if (nk && window.vueData) {
                window.vueData.NienKhoa = nk
                if (!window.vueData.NienKhoaItem) {
                    window.vueData.NienKhoaItem = { NienKhoa: nk, HocKi: hk ?? null }
                }
            }
            // Sẵn sàng ngay — không cần chờ postMessage INIT
            // SCHOOL_YEAR_CHANGED vẫn hoạt động khi user đổi niên khóa
            this.isNienKhoaReady = true
        } else if (!this.hasNavigation) {
            // Truy cập trực tiếp URL (không qua App Shell, không có navigation)
            this.isNienKhoaReady = true
        }
        // hasNavigation=true (App Shell): isNienKhoaReady được set bởi onNienKhoaLoaded() từ GlobalNavigationDrawer

        // Lắng nghe sự kiện Back/Forward của trình duyệt để đồng bộ Iframe
        window.addEventListener('popstate', (event) => {
            const currentUrl = window.location.pathname + window.location.search
            if (this.activeModuleUrl !== currentUrl) {
                this.activeModuleUrl = currentUrl
            }
        })

        // Sync NienKhoa via postMessage — chỉ gửi SCHOOL_YEAR_CHANGED sau lần load đầu
        // (lần đầu init: iframe chưa có, INIT sẽ được gửi qua onIframeLoad)
        this.$watch(
            () => window.vueData?.NienKhoaItem,
            (newVal) => {
                if (!this.isNienKhoaReady) return

                // Cập nhật URL trình duyệt (top-level) khi đổi niên khóa
                // nhưng KHÔNG gán lại this.activeModuleUrl để tránh làm iframe reload
                if (this.hasNavigation && newVal) {
                    const current = window.location.pathname + window.location.search
                    const withYear = this.buildUrlWithYear(current)
                    if (current !== withYear) {
                        window.history.replaceState(null, '', withYear)
                    }
                }

                this.sendMessageToIframe('SCHOOL_YEAR_CHANGED', {
                    NienKhoa: newVal?.NienKhoa,
                    NienKhoaItem: newVal,
                })
            },
            { deep: true },
        )
    },
    methods: {
        handleDrawerNavigate(url) {
            if (!url) return
            const finalUrl = this.buildUrlWithYear(url)
            if (this.activeModuleUrl === finalUrl) return

            this.activeModuleUrl = finalUrl

            // Clean URL: Cập nhật URL trực tiếp lên trình duyệt thay vì dùng query ?module=
            window.history.pushState({ url: finalUrl }, '', finalUrl)

            this.$emit('navigate', finalUrl)
        },

        onNienKhoaLoaded() {
            this.isNienKhoaReady = true

            // Đảm bảo URL top-level có params để khi iframe render nó nhặt được ngay qua URL
            if (this.hasNavigation && this.vueData?.NienKhoa) {
                const current = window.location.pathname + window.location.search
                const withYear = this.buildUrlWithYear(current)
                if (current !== withYear) {
                    window.history.replaceState(null, '', withYear)
                    this.activeModuleUrl = withYear
                }
            }
        },

        onIframeLoad() {
            this.sendMessageToIframe('INIT', {
                NienKhoa: this.vueData?.NienKhoa,
                NienKhoaItem: this.vueData?.NienKhoaItem,
            })
        },

        buildUrlWithYear(targetUrl) {
            if (!targetUrl || !this.vueData?.NienKhoa) return targetUrl
            try {
                const url = new URL(targetUrl, window.location.origin)
                url.searchParams.set('NienKhoa', this.vueData.NienKhoa)
                if (this.vueData.NienKhoaItem?.HocKi) {
                    url.searchParams.set('HocKi', this.vueData.NienKhoaItem.HocKi)
                }
                return url.pathname + url.search
            } catch {
                return targetUrl
            }
        },

        sendMessageToIframe(type, payload) {
            const iframe = this.$refs.moduleIframe
            if (iframe && iframe.contentWindow) {
                // Deep clone payload để tránh lỗi DataCloneError khi clone Proxy/Reactive objects của Vue
                let cleanPayload = payload
                try {
                    cleanPayload = JSON.parse(JSON.stringify(payload))
                } catch (e) {
                    console.error('[Global] Failed to serialize payload for postMessage', e)
                }

                const message = { type, payload: cleanPayload }
                // Kiểm tra origin để bảo mật
                iframe.contentWindow.postMessage(message, window.location.origin)
            }
        },

        hasAccess(right, sysRights, funcRights) {
            if (!right) return true
            const sr = right.SystemRight
            const fr = right.FunctionRight

            // Cả hai → AND
            if (sr?.length && fr?.length) {
                return sr.some((r) => sysRights.includes(r)) && fr.some((f) => funcRights.includes(String(f)))
            }
            if (sr?.length) return sr.some((r) => sysRights.includes(r))
            if (fr?.length) return fr.some((f) => funcRights.includes(String(f)))
            return true
        },

        filterMenu(items, sysRights, funcRights) {
            return (
                items
                    .filter((item) => this.hasAccess(item.right, sysRights, funcRights))
                    .map((item) => ({
                        ...item,
                        submenu: (item.submenu || []).filter((child) => this.hasAccess(child.right, sysRights, funcRights)),
                    }))
                    // Bỏ group có submenu nhưng bị lọc sạch
                    .filter((item) => !item.submenu?.length || item.submenu.length > 0 || item.url)
            )
        },
        getRoleLabel(userInfo) {
            const sr = userInfo?.SystemRight
            const rights = Array.isArray(sr) ? sr : sr != null ? [sr] : []
            return (
                rights
                    .map((r) => this.ROLE_LABEL_MAP[r])
                    .filter(Boolean)
                    .join(', ') || 'Nhà trường'
            )
        },

        changeLang(lang) {
            if (lang === 'EN') {
                this.snackbarRef.value?.showSnackbar({
                    message: 'Tính năng đang được phát triển',
                    color: 'warning',
                })
            }
        },
    },
    beforeUnmount() {
        this.observer?.disconnect()
    },
	}
</script>