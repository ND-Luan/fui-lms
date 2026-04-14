<template>
    <Global>
        <uc-lms-tc-dashboard-v2
            v-if="vueData.dataReady"
            :focus-tasks="vueData.focusTasks"
            :teaching-groups="vueData.teachingGroups"
            :schedule="vueData.schedule"
            :activities="vueData.activities"
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
        this.initPage()
    },
    methods: {
        apiCall1() {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/EL_Teacher_GetGroupedDashboard', { HocKi: vueData.NienKhoaItem.HocKi }, response => {
                    processGroupedDashboardData(response)
                    resolve()
                }, reject)
            })
        },
        apiCall2() {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/EL_Teacher_GetRecentActivities', { PageSize: 10, HocKi: vueData.NienKhoaItem?.HocKi }, response => {
                    vueData.activities = response.data
                    resolve()
                }, reject)
            })
        },
        apiCall3() {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/EL_Teacher_GetMyContentLibrary', { NienKhoa: vueData.NienKhoa }, response => {
                    vueData.contentLibrary = processLibraryData(response.data)
                    resolve()
                }, reject)
            })
        },
        apiCall4() {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/EL_Teacher_GetFocusTasks', { HocKi: vueData.NienKhoaItem?.HocKi }, response => {
                    vueData.focusTasks = response.data
                    resolve()
                }, reject)
            })
        },
        getFocusTasksStudent() {
            return new Promise((resolve, reject) => {
                ajaxCALL('lms/EL_Teacher_GetFocusTasks_Student', {}, res => {
                    vueData.focusTasks_student = res.data
                    resolve()
                }, reject)
            })
        },
        async initPage() {
            vueData.dataReady = false
            try {
                await this.apiCall1()
                await this.apiCall2()
                await this.apiCall3()
                await this.getFocusTasksStudent()
                vueData.dataReady = true
            } catch (error) {
                console.error('Một trong các API đã thất bại:', error)
                this.snackbarRef.value.showSnackbar({ message: 'Tải dữ liệu dashboard thất bại.', color: 'error' })
                vueData.dataReady = true
            }
        },
    },
}
</script>
