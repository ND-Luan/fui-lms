<template>
	<v-container>
		<v-tabs v-model="activeTab">
			<v-tab value="classes">Chi tiết lớp</v-tab>
			<v-tab value="students" >Chi tiết học sinh</v-tab>
		</v-tabs>

		<v-card>
		
			<!-- Tab 2 -->
			<uc-quanlybaitap v-if="activeTab === 'classes'" :assignment="selectedAssignment" @view-students="goToStudents"
				@back="goToAssignments" />

			<!-- Tab 3 -->
			<uc-baitapdanop v-if="activeTab === 'students'" :class-data="selectedClass" @back="goToClasses" />
		</v-card>
	</v-container>
</template>

<script>


export default {
  data() {
    return {
      activeTab: 'assignments',
      selectedAssignment: null,
      selectedClass: null
    }
  },
  methods: {
    goToClasses(assignment) {
      this.selectedAssignment = assignment
      this.activeTab = 'classes'
    },
    goToStudents(classData) {
      this.selectedClass = classData
      this.activeTab = 'students'
    },
    goToAssignments() {
      this.activeTab = 'assignments'
    }
  }
}
</script>