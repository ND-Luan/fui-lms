<template>
	<v-dialog v-model="modelValue" max-width="400">
		<v-card>
			<v-card-title>
				Chuyển nhóm
				<v-spacer />
				<v-icon @click="$emit('update:modelValue', false)">mdi-close</v-icon>
			</v-card-title>
			<v-card-text>
				<v-list>
					<v-list-subheader>Chuyển từ nhóm {{NhomDetail?.TenNhom}} sang nhóm</v-list-subheader>
					<v-list-item :title="HocSinhDetail.HoTen"
						:subtitle="HocSinhDetail.HocSinhID  + ' - ' + HocSinhDetail.NhomID">
						<template #append>
							<v-autocomplete v-model="NhomSelected" label="Chuyển sang nhóm" :items="DSNhom"
								item-title="TenNhom" item-value="NhomID" return-object style="min-width: 100px" />
						</template>
					</v-list-item>
				</v-list>
			</v-card-text>
			<v-card-actions>
				<v-spacer />
				<v-btn text="Đóng" @click="$emit('update:modelValue', false)" />
				<v-btn text="Chuyển" @click="onSubmit" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		props: {
			modelValue: Boolean,
			HocSinhDetail: Object,
			NhomDetail: Object,
			DSNhom: Array,
			onSubmitFinish: Function
		},
		data() {
			return {
				NhomSelected: null,
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onSubmit() {
				this.$emit('onSubmitFinish')
				$emit('update:modelValue', false)
			},
			async apiXepBangdiem(item) {
				return await fetchPromise("lms/XepBangDiem_ChuyenLop_ByHocSinhID", {
					HocSinhID: item.HocSinhID,
					NhomID_Chuyen: this.NhomSelected.NhomID,
					MonHocID: this.NhomDetail.MonHocID,
					NienKhoa: vueData.NienKhoa
				})
			},
			async apiUpdateNhom(item) {
				return await fetchPromise('lms/HocSinhNhom_Upd_NhomID', {
					NhomID: this.NhomSelected.NhomID,
					HSNhomID: item.HSNhomID,
				})
			}
	
		},
	}
</script>