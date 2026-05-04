<template>
    <v-dialog v-model="isOpen" max-width="500px" transition="dialog-transition">
        <v-card>
            <v-card-title class="d-flex py-0">
                <span>Chọn tuần học lưu trữ nội dung</span>
                <v-spacer></v-spacer>
                <v-btn variant="text" icon="mdi-close" @click="$emit('update:isOpen', false)"></v-btn>
            </v-card-title>
            <v-card-text class="pa-2">
                <v-form ref="formRef">
                    <v-select label="Tuần học" v-model="TuanHocID_Selected" return-object :items="this.TuanHocList" item-title="Tuan_HienThi" item-value="TuanHocID" density="compact" hide-details></v-select>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                    <v-btn variant="text">Hủy</v-btn>
                     <v-btn variant="text" @click="SaveResource">Xác nhận</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    props: ['isOpen', 'resource'],
    emits: ['update:isOpen','finish-save'],
    data() {
        return {
            TuanHocList: [],
            TuanHocID_Selected:null
        }
    },
    async mounted() {
        this.TuanHocList = await GET_TuanHoc()
        this.TuanHocID_Selected = this.TuanHocList.find(th => th.Is_Active)
        console.log(' this.TuanHocList', this.TuanHocList)
    },
    methods: {
        SaveResource(){
            if(!this.TuanHocID_Selected && !this.TuanHocID_Selected.TuanHocID){
                Vue.$toast.warning('Không tìm thấy tuần học', { position: 'top' })
                return 
            }
            if (this.resource.ResourceType == 'ASSIGNMENT') {
				let payload = {
					AssignmentID: this.resource.ResourceID,
                    TuanHocID: this.TuanHocID_Selected.TuanHocID
				}
				ajaxCALL('/lms/EL_Teacher_Copy_ContentByAssignmentID', payload, res => {
					this.$emit('finish-save')
					Vue.$toast.success(this.$t('message.RetrievedSuccess'), { position: 'top' })
                    this.$emit('update:isOpen', false)
				})
			} else {
				let payload = {
					LessonID: this.resource.ResourceID,
                    TuanHocID: this.TuanHocID_Selected.TuanHocID
				}
				ajaxCALL('/lms/EL_Teacher_Copy_ContentByLessonID', payload, res => {
					this.$emit('finish-save')
					Vue.$toast.success(this.$t('message.RetrievedSuccess'), { position: 'top' })
                      this.$emit('update:isOpen', false)
				})
			}
        },

        GET_TuanHoc
    }
}
</script>