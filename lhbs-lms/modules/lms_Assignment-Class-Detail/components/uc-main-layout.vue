<template>
	<Global>
		<uc-assignment-grading-list
			v-if="vueData.AssignType === 'CLASS' && vueData.NienKhoa"
			:khoiid="vueData.KhoiID_FromURL"
			:lopid="vueData.LopID_FromURL"
			:assigntoclassid="vueData.AssignToClassID_FromURL"
			:monhocid="vueData.MonHocID_FromURL"
		/>
		<uc-assignment-grading-list-student
			v-if="vueData.AssignType === 'STUDENT' && vueData.NienKhoa"
			:khoiid="vueData.KhoiID_FromURL"
			:lopid="vueData.LopID_FromURL"
			:assigntoclassid="vueData.AssignToStudentID_FromURL"
			:monhocid="vueData.MonHocID_FromURL"
		/>
	</Global>
</template>

<script>
export default {
	data() {
		return { vueData }
	},
}
</script>
