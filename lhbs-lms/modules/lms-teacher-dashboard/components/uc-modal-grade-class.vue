<template>
	<span>
	</span>
</template>

<script>
	export default {
		inject: ['iframeRef'],
	props: ["isOpen", "assignment"],
	emits: ["update:isOpen"],
	watch: {
		isOpen(val) {
			if (!val) return

			let url = ''
			const a = this.assignment
			console.log('[lms-teacher-dashboard][cascade] open grade iframe from modal', {
				assignment: a,
				vueData: { khoi: vueData.cascadeKhoiID, mon: vueData.cascadeMonHocName, tuan: vueData.cascadeTuanID },
			})
			if (a.ResourceType == 'ASSIGNMENT') {
				if (a.AssignType == 'CLASS') {
					url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${a.AssignToClassID}&LopID=${a.LopID}&KhoiID=${a.KhoiID}&MonHocID=${a.MonHocID}&AssignType=${a.AssignType}`
				} else {
					url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToStudentID=${a.AssignToStudentID}&LopID=${a.LopID}&KhoiID=${a.KhoiID}&MonHocID=${a.MonHocID}&AssignType=${a.AssignType}`
				}
			} else {
				url = `https://lms.lhbs.vn/lms-Lesson-Class-Detail?AssignToClassID=${a.AssignToClassID}`
			}
			const title = a.ResourceType == 'ASSIGNMENT' ? 'Xem tiến độ bài tập' : 'Xem tiến độ bài học'
			this.iframeRef.value.openWindow({
				title,
				url,
				onclose: () => {
					console.log('[lms-teacher-dashboard][cascade] grade iframe closed from modal', {
						beforeInit: { khoi: vueData.cascadeKhoiID, mon: vueData.cascadeMonHocName, tuan: vueData.cascadeTuanID },
					})
					return vueData.apiCall1()
				},
			})
			this.$emit('update:isOpen', false)
		}
	},
	}
</script>