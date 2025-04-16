<template>
	<div v-if="IsShow_Both_Parent_Teacher">
		<v-divider height="2"></v-divider>
		<v-list-item>
			<v-list-item-title>Chuyển vai trò PH</v-list-item-title>
			<v-list-item-subtitle>Bạn đang là Giáo Viên</v-list-item-subtitle>
			<template v-slot:append>
				<v-btn @click="redirect('/ph-report')" icon="" size="small"><v-icon>mdi-arrow-right</v-icon></v-btn>
			</template>
		</v-list-item>
		<v-divider height="2"></v-divider>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				vueData,
				IsShow_Both_Parent_Teacher: false
			}
		},
		created() {
			ajaxCALL('/student/Calen_GetInfoStudentByPhuHuynhID', null, res => {
				if (res.data.length > 0) {
					const user = vueData.user
					if (user.GroupID === 1) {
						this.IsShow_Both_Parent_Teacher = true
					}
				}
			})
		},
		methods: {
			redirect
		}
	}
</script>