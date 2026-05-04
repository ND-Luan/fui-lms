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
		inject: ['snackbarRef'],
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
		async GET_EL_GiaoVien_Test_In_Web_Get() {
			const data = await fetchPromise('lms/EL_GiaoVien_Test_In_Web_Get', {})
			this.usersList = data ?? []
		},
		async Update_EL_GiaoVien_Test_In_Web_Upd_Active() {
			if (!this.GiaoVienID) return
			const res = await fetchPromise('lms/EL_GiaoVien_Test_In_Web_Upd_Active', { GiaoVienID: this.GiaoVienID }, { cache: false })
			this.$emit('update:isOpen', false)
			this.snackbarRef.value.showSnackbar({ message: 'Đổi giáo viên thành công', color: 'success' })
			vueData.initPage()
		}
	},
	}
</script>