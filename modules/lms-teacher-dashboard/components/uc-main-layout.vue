<template>
    <Global>
        <uc-lms-tc-dashboard-v2
            :loading-groups="vueData.loadingGroups"
            :focus-tasks="vueData.focusTasks || []"
            :teaching-groups="vueData.teachingGroups || []"
            :schedule="vueData.schedule || []"
            :activities="vueData.activities || []"
            v-model:content-library="vueData.contentLibrary"
        />
    </Global>
</template>

<script>
export default {
    inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
    data() {
        return { vueData }
    },
    mounted() {
        // Đăng ký methods lên vueData để raw.json watch + component con có thể gọi
        vueData.initPage = this.initPage
        vueData.apiCall1 = this.apiCall1
        vueData.apiCall2 = this.apiCall2
        vueData.apiCall3 = this.apiCall3
        vueData.apiCall4 = this.apiCall4
        // Khởi tạo defaults để component render ngay lập tức
        vueData.teachingGroups = vueData.teachingGroups || []
        vueData.focusTasks = vueData.focusTasks || []
        vueData.focusTasks_student = vueData.focusTasks_student || []
        vueData.activities = vueData.activities || []
        vueData.contentLibrary = vueData.contentLibrary || []
        vueData.loadingGroups = true
        this.initPage()
    },
    methods: {
        async apiCall1() {
            vueData.loadingGroups = true
            try {
                // fetchPromise trả về data?.data (unwrapped), nhưng processGroupedDashboardData
                // expect response.data[] nên phải wrap lại thành { data: res }
                const res = await fetchPromise('lms/EL_Teacher_GetGroupedDashboard', { HocKi: vueData.NienKhoaItem.HocKi }, { cache: false })
                processGroupedDashboardData({ data: res })
            } finally {
                vueData.loadingGroups = false
            }
        },
        async apiCall2() {
            const res = await fetchPromise('lms/EL_Teacher_GetRecentActivities', { PageSize: 10, HocKi: vueData.NienKhoaItem?.HocKi })
            vueData.activities = res.data
        },
        async apiCall3() {
            const res = await fetchPromise('lms/EL_Teacher_GetMyContentLibrary', { NienKhoa: vueData.NienKhoa })
            vueData.contentLibrary = processLibraryData(res)
        },
        async apiCall4() {
            const res = await fetchPromise('lms/EL_Teacher_GetFocusTasks', { HocKi: vueData.NienKhoaItem?.HocKi })
            vueData.focusTasks = res.data
        },
        async getFocusTasksStudent() {
            const res = await fetchPromise('lms/EL_Teacher_GetFocusTasks_Student', {})
            vueData.focusTasks_student = res.data
        },
        async initPage() {
            try {
                await Promise.all([
                    this.apiCall1(),
                    this.apiCall2(),
                    this.apiCall3(),
                    this.getFocusTasksStudent(),
                ])
            } catch (error) {
                console.error('Một trong các API đã thất bại:', error)
                this.snackbarRef.value.showSnackbar({ message: 'Tải dữ liệu dashboard thất bại.', color: 'error' })
                vueData.loadingGroups = false
            }
        },
    },
}
</script>
