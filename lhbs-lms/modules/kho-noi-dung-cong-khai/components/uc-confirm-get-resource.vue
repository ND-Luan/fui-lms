<template>
    <uc-dialog v-model="isShow" title="Chọn tuần học lưu trữ nội dung" done-text="Xác nhận" @onSubmit="saveResource">
        <v-form ref="formRef">
            <v-select
                v-model="TuanHocItem"
                label="Tuần học"
                :items="TuanHocList"
                item-title="Tuan_HienThi"
                item-value="TuanHocID"
                return-object
                hide-details="auto"
            />
        </v-form>
    </uc-dialog>
</template>

<script>
export default {
    inject: ['snackbarRef', 'confirmRef'],
    props: {
        modelValue: Boolean,
        resource: Object,
    },
    emits: ['update:modelValue', 'finish-save'],
    data() {
        return {
            TuanHocList: [],
            TuanHocItem: null,
        }
    },
    computed: {
        isShow: {
            get() { return this.modelValue },
            set(value) { this.$emit('update:modelValue', value) },
        },
    },
    watch: {
        modelValue(v) {
            if (v && !this.TuanHocList.length) this.getTuanHoc()
        },
    },
    mounted() {
        this.getTuanHoc()
    },
    methods: {
        async getTuanHoc() {
            const res = await fetchPromise('lms/TuanHocTap_Get', { NienKhoa: vueData.NienKhoa })
            this.TuanHocList = res ?? []
            this.TuanHocItem = this.TuanHocList.find(tuanHoc => tuanHoc.Is_Active) || this.TuanHocList[0] || null
        },
        getCopyEndpoint() {
            return this.resource?.ResourceType === 'ASSIGNMENT'
                ? 'lms/EL_Teacher_Copy_ContentByAssignmentID'
                : 'lms/EL_Teacher_Copy_ContentByLessonID'
        },
        getCopyPayload() {
            const resourceID = this.resource?.ResourceID
            const tuanHocID = this.TuanHocItem?.TuanHocID
            if (this.resource?.ResourceType === 'ASSIGNMENT') {
                return { AssignmentID: resourceID, TuanHocID: tuanHocID }
            }
            return { LessonID: resourceID, TuanHocID: tuanHocID }
        },
        async saveResource() {
            if (!this.TuanHocItem?.TuanHocID) {
                this.snackbarRef.value.showSnackbar({ message: 'Không tìm thấy tuần học', color: 'warning' })
                return
            }
            if (!this.resource?.ResourceID) {
                this.snackbarRef.value.showSnackbar({ message: 'Không tìm thấy nội dung cần lấy', color: 'warning' })
                return
            }

            const ok = await this.confirmRef.value.show({
                title: `Xác nhận lấy nội dung "${this.resource.Title || 'đã chọn'}" về ${this.TuanHocItem.Tuan_HienThi}?`,
                type: 'confirm',
            })
            if (!ok) return

            await fetchPromise(this.getCopyEndpoint(), this.getCopyPayload(), { cache: false })
            this.$emit('finish-save')
            this.snackbarRef.value.showSnackbar({ message: 'Lấy nội dung thành công', color: 'success' })
            this.isShow = false
        },
    },
}
</script>
