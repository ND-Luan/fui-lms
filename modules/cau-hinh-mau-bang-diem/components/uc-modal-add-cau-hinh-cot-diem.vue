<template>
	<uc-dialog v-model="modelValue.isShowModalAddCauHinhCotDiem" title="Thêm cột điểm" doneText="Lưu" min-width="1400"
		@onSubmit="onHandleAdd">
		<v-form ref="form">
			<v-row>
				<v-col cols="6">
					<p class="text-title text-primary mb-2 font-weight-medium">Nhóm cột điểm</p>
					<v-row>
						<v-col cols="6">
							<v-select v-model="formData.Semester" label="Học kỳ"
								:items="['HK1', 'HK2']"></v-select>
						</v-col>
						<v-col cols="6"><v-text-field v-model="formData.ThuTuNhom"
								label="Thứ tự nhóm CĐ"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.MaNhomCotDiem"
								label="Mã nhóm CĐ"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.TenNhomCotDiem_VI"
								label="Tên nhóm CĐ (VI)"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.TenNhomCotDiem_EN"
								label="Tên nhóm CĐ (EN)"></v-text-field></v-col>
					</v-row>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="6">
					<p class="text-title text-primary mb-2 font-weight-medium">Cột điểm</p>
					<v-row>
						<v-col cols="6"><v-text-field v-model="formData.ThuTuCotDiem"
								label="Thứ tự CĐ"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.MaCotDiem" label="Mã CĐ"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.TenCotDiem_VI"
								label="Tên CĐ (VI)"></v-text-field></v-col>
						<v-col cols="6"><v-text-field v-model="formData.TenCotDiem_EN"
								label="Tên CĐ (EN)"></v-text-field></v-col>
					</v-row>
				</v-col>
				<v-divider></v-divider>

				<v-col cols="6">
					<p class="text-title text-primary mb-2 font-weight-medium">Hệ thống</p>
					<v-row>
						<v-col cols="6"><v-text-field v-model="formData.IDHeThong"
								label="ID hệ thống"></v-text-field></v-col>
						<v-col cols="6"><v-select v-model="formData.LoaiCotDiem" label="Loại CĐ" :items="DSLoaiCotDiem"
								item-title="TenLoaiBien" item-value="value" variant="outlined"
								density="compact" /></v-col>
						<v-col cols="6"><v-select v-model="formData.GiaTriCotDiem" label="Giá trị CĐ"
								:items="DSLoaiDuLieu" item-title="TenLoaiDuLieu" item-value="value" variant="outlined"
								density="compact" /></v-col>
						<v-col cols="6"><v-text-field v-model="formData.LamTronBaoNhieuSo"
								label="Làm tròn"></v-text-field></v-col>
					</v-row>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="6">
					<p class="text-title text-primary mb-2 font-weight-medium">Hiển thị</p>
					<v-row>
						<v-col cols="6"><v-select v-model="formData.IsVisibleToParents" label="Hiển thị cho phụ huynh"
								:items="DSHienThi" item-title="TenHienThi" item-value="value" variant="outlined"
								density="compact" /></v-col>
						<!-- <v-col cols="6"><v-select v-model="formData.KieuDanhGiaID" label="Kiểu đánh giá"
								:items="DSKieuDanhGia" item-title="TenHienThi" item-value="value" variant="outlined"
								density="compact" /></v-col> -->
						<v-col cols="6"><v-select v-model="formData.IsUserInput" label="Phụ huynh nhập"
								:items="DSUserInput" item-title="TenHienThi" item-value="value" variant="outlined"
								density="compact" /></v-col>
						<v-col cols="6"><v-select v-model="formData.IsSendToManager" label="Gửi cho người quản lý"
								:items="DSSendToManager" item-title="TenHienThi" item-value="value" variant="outlined"
								density="compact" /></v-col>
					</v-row>
				</v-col>
				<v-col cols="12">
					<v-textarea v-model="formData.MotaCotDiem_VI" label="Mô tả" rows="2"></v-textarea>
				</v-col>
				<v-col cols="12">
					<v-textarea v-model="formData.Formula" label="Công thức" rows="5"></v-textarea>
				</v-col>

			</v-row>
		</v-form>
	</uc-dialog>
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Object
			},
			recordMauBangDiem: {
				type: Object
			},
			onFinish: {
				type: Function
			}
		},
		data() {
			return {
				DSLoaiDuLieu: [
					{
						value: 'number',
						TenLoaiDuLieu: 'Số'
					},
					{
						value: 'text',
						TenLoaiDuLieu: 'Văn bản'
					}
				],
				DSLoaiCotDiem: [
					{
						value: 'Công thức',
						TenLoaiBien: 'Công thức'
					},
					{
						value: 'Nhập',
						TenLoaiBien: 'Nhập liệu'
					}, {
						value: 'Hằng số',
						TenLoaiBien: 'Hằng số'
					},
					{
						value: 'Tự động',
						TenLoaiBien: 'Tự động'
					}
				],
				DSHienThi: [
					{
						value: false,
						TenHienThi: 'Không'
					},
					{
						value: true,
						TenHienThi: 'Có'
					},
				],
				DSKieuDanhGia: [
					{
						value: 1,
						TenHienThi: 'Kiểu đánh giá 1'
					},
					{
						value: 2,
						TenHienThi: 'Kiểu đánh giá 2'
					},
				],
				DSUserInput: [
					{
						value: false,
						TenHienThi: 'Không'
					},
					{
						value: true,
						TenHienThi: 'Có'
					},
				],
				DSSendToManager: [
					{
						value: false,
						TenHienThi: 'Không'
					},
					{
						value: true,
						TenHienThi: 'Có'
					},
				],
				formData: {
					IDHeThong: '',
					MaCotDiem: '',
					TenCotDiem_VI: '',
					TenCotDiem_EN: '',
					TenHienThi_VI: '',
					TenHienThi_EN: '',
					MotaCotDiem_VI: '',
					MotaCotDiem_EN: '',
					LoaiCotDiem: 'Công thức',
					KieuDanhGiaID: null,
					GiaTriCotDiem: 'number',
					LamTronBaoNhieuSo: null,
					Formula: '',
					ThuTuCotDiem: null,
					MaNhomCotDiem: '',
					TenNhomCotDiem_VI: '',
					TenNhomCotDiem_EN: '',
					ThuTuNhom: null,
					IsUserInput: false,
					IsVisibleToParents: false,
					IsSendToManager: false,
				}
			}
		},
		methods: {
			async onHandleAdd() {
				const form = this.$refs.form
				const { valid } = await form.validate()
				if (valid) {
					let params = {
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID,
						JsonData: this.formData
					}
					ajaxCALL(
						'lms/TemplateBangDiemChiTiet_Ins',
						params,
						res => {
							Vue.$toast.success('Thêm cột điểm thành công!', { position: 'top' })
							this.$emit('onFinish')
							this.modelValue.isShowModalAddCauHinhCotDiem = false
						}
					)
				}
			}
		},
	}
</script>
</script>