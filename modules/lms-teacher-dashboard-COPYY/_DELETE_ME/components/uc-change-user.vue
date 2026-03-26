<template>
	<v-dialog v-model="isOpen" width="600px">
		<v-card>
			<v-card-title>Đổi User</v-card-title>
			<v-card-text>
				<v-autocomplete label="Giáo viên" v-model="GiaoVienID" :items="usersList" item-title="HoTenGV"
					item-value="SYS_USERID" hide-details="auto" density="compact" :clearable="false"></v-autocomplete>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn variant="text" size="small" @click="$emit('update:isOpen', false)">Đóng</v-btn>
				<v-btn variant="text" size="small" @click="Update_EL_GiaoVien_Test_In_Web_Upd_Active">Xác nhận</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	props: ["isOpen", 'giaovienid'],
	emits: ['update:isOpen'],
	data() {
		return {
			usersList: [],
			GiaoVienID: this.giaovienid
		}
	},
	mounted() {
		this.GET_EL_GiaoVien_Test_In_Web_Get()
	},
	computed: {},
	watch: {},
	methods: {
		GET_EL_GiaoVien_Test_In_Web_Get() {
			let params = {}
			ajaxCALL('lms/EL_GiaoVien_Test_In_Web_Get', params, res => {
				this.usersList = res.data
			})
		},
		Update_EL_GiaoVien_Test_In_Web_Upd_Active() {
			if (!this.GiaoVienID) return
			let params = {
				GiaoVienID: this.GiaoVienID
			}
			ajaxCALL('lms/EL_GiaoVien_Test_In_Web_Upd_Active', params, res => {
				vueData.initPage()
			})
		}
	},
}
</script>