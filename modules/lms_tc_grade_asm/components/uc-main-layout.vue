<template>
    <Global>
        <uc-assignment-grader v-if="dataReady" ref="assignmentGrader" :submission-data="submissionData"
            :on-save-grading-draft="saveGradingDraft" :on-publish-grades="publishGrades"
            :on-open-publish-dialog="openPublishDialog" :on-init-page="initPage"
/>

        <uc-dialog v-model="confirmPublishDialog" title="Xác nhận Trả bài" done-text="Xác nhận & Trả bài"
            @onSubmit="publishGradesFinal">
            Bạn có chắc chắn muốn hoàn tất chấm và trả bài cho học sinh không? Học sinh sẽ thấy điểm và nhận xét của
            bạn.
        </uc-dialog>
    </Global>
</template>

<script>
export default {
    inject: ['snackbarRef', 'iframeRef'],
    data() {
        return {
            dataReady: false,
            submissionData: [],
            confirmPublishDialog: false,
            AssignType: 'CLASS',
        }
    },
    mounted() {
        this.getNienKhoa()
    },
    methods: {
        async getNienKhoa() {
            const res = await fetchPromise('lms/NienKhoa_Get', {})
            const DSNienKhoa = res ?? []
            vueData.NienKhoaItem = DSNienKhoa.find(x => x.IsActive) ?? null
            vueData.NienKhoa = vueData.NienKhoaItem?.NienKhoa ?? 0
            if (vueData.NienKhoa) this.initPage()
        },
        async initPage() {
            const urlParams = new URLSearchParams(window.location.search)
            const submissionId = urlParams.get('SubmissionID')
            this.AssignType = urlParams.get('AssignType') ?? 'CLASS'
            if (!submissionId) {
                this.snackbarRef.value.showSnackbar({ message: 'Không tìm thấy ID bài nộp trên URL.', color: 'error' })
                this.dataReady = true
                return
            }
            const url = this.AssignType === 'CLASS'
                ? 'lms/EL_Teacher_GetSubmissionDetail'
                : 'lms/EL_Teacher_GetSubmissionDetail_AssignToStudent'
            const res = await fetchPromise(url, { SubmissionID: submissionId, HocKi: vueData.NienKhoaItem.HocKi }, { cache: false })
            if (res?.length >= 2 && res[0].length > 0) {
                this.submissionData = res
                this.dataReady = true
            } else {
                this.snackbarRef.value.showSnackbar({ message: 'Không thể tải dữ liệu bài nộp.', color: 'error' })
            }
        },
        async saveGradingDraft(payload) {
            const res = await fetchPromise('lms/EL_Teacher_SaveGradeDraft', payload, { cache: false })
            this.snackbarRef.value.showSnackbar({ message: 'Đã lưu nháp kết quả chấm!', color: 'success' })
            this.initPage()
            if (res?.[0]) {
                this.submissionData[1][0] = { ...res[0] }
                this.submissionData = [...this.submissionData]
            }
        },
        async publishGrades(payload) {
            const url = this.AssignType === 'CLASS'
                ? 'lms/EL_Teacher_PublishGrade'
                : 'lms/EL_Teacher_PublishGrade_AssignToStudent'
            await fetchPromise(url, payload, { cache: false })
            this.snackbarRef.value.showSnackbar({ message: 'Hoàn tất chấm bài và trả bài thành công!', color: 'success' })
            this.initPage()
        },
        openPublishDialog() {
            this.confirmPublishDialog = true
        },
        publishGradesFinal() {
            this.confirmPublishDialog = false
            const grader = this.$refs.assignmentGrader
            if (!grader) return
            grader.calculateTotalScore()
            const payload = {
                SubmissionID: grader.submission.SubmissionID,
                Score: grader.gradingSummary.totalScore,
                TeacherComment: grader.gradingSummary.teacherComment,
                SubmissionContent: JSON.stringify({ answers: grader.gradingData }),
            }
            this.publishGrades(payload)
        },
    },
}
</script>
