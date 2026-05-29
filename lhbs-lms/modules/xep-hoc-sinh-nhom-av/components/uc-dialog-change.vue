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
				<v-btn text="Đóng" :disabled="IsLoading" @click="$emit('update:modelValue', false)" />
				<v-btn text="Chuyển" color="primary" variant="outlined" :loading="IsLoading" @click="onSubmit" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
		inject: ['snackbarRef'],
		props: {
			modelValue: Boolean,
			HocSinhDetail: Object,
			NhomDetail: Object,
			DSNhom: Array,
		},
		data() {
			return {
				NhomSelected: null,
				IsLoading: false,
			}
		},
		watch: {
			modelValue(v) {
				if (v) this.NhomSelected = null
			}
		},
		methods: {
			async apiXepBangdiem(item) {
				return await fetchPromise('lms/XepBangDiem_ChuyenLop_ByHocSinhID', {
					HocSinhID: item.HocSinhID,
					NhomID_Chuyen: this.NhomSelected.NhomID,
					MonHocID: this.NhomDetail.MonHocID,
					NienKhoa: vueData.NienKhoa
				}, { cache: false })
			},
			async apiUpdateNhom(item) {
				return await fetchPromise('lms/HocSinhNhom_Upd_NhomID', {
					NhomID: this.NhomSelected.NhomID,
					HSNhomID: item.HSNhomID,
				}, { cache: false })
			},
			async apiUpdateNhomChild(item, nhomID) {
				// Áp dụng cho các nhóm con (ListNhomID_Child) khi môn AV (MonHocID=76)
				return await fetchPromise('lms/HocSinhNhom_Upd_NhomID', {
					NhomID: nhomID,
					HSNhomID: item.HSNhomID,
				}, { cache: false })
			},
			onSubmit() {
				if (!this.NhomSelected) {
					this.snackbarRef.value.show({ message: 'Vui lòng chọn nhóm chuyển đến', color: 'warning' })
					return
				}
				const $this = this
				confirm({
					title: `Xác nhận chuyển ${$this.HocSinhDetail.HoTen} sang nhóm ${$this.NhomSelected.TenNhom}?`,
					action: async () => {
						$this.IsLoading = true
						try {
							const item = $this.HocSinhDetail
							// Bước 1: Xếp bảng điểm sang nhóm mới
							await $this.apiXepBangdiem(item)
							// Bước 2: Cập nhật NhomID của học sinh
							await $this.apiUpdateNhom(item)
							// Bước 3: Nếu là môn AV (MonHocID=76), cập nhật thêm các nhóm con
							if ($this.NhomDetail.MonHocID === 76 && $this.NhomSelected.ListNhomID_Child) {
								const childIDs = $this.NhomSelected.ListNhomID_Child.split(',')
								for (const nhomID of childIDs) {
									await $this.apiUpdateNhomChild(item, nhomID)
								}
							}
							$this.snackbarRef.value.show({ message: `Đã chuyển ${item.HoTen} sang nhóm ${$this.NhomSelected.TenNhom}`, color: 'success' })
							$this.$emit('onSubmitFinish')
							$this.$emit('update:modelValue', false)
						} catch (e) {
							$this.snackbarRef.value.show({ message: 'Chuyển nhóm thất bại', color: 'error' })
						} finally {
							$this.IsLoading = false
						}
					},
				})
			},
		},
	}
</script>