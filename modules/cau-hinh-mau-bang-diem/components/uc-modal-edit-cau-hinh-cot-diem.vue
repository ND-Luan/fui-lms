<template>
	<div>
		<uc-dialog v-model="modelValue.isShowModalEditCauHinhCotDiem" min-width="1400" @onSubmit="onSubmitNhomCotDiem"
			doneText="Cập nhật nhóm điểm">
			<template #title>
				<span>Cập nhật nhóm cột điểm <span class="text-red">-
						{{recordNhomCotDiem.TenNhomCotDiem_VI}}</span></span>
			</template>
			<v-row>
				<v-col cols="12" class="pb-0">
					<p class="text-title text-primary mb-2 font-weight-medium">Nhóm cột điểm</p>
				</v-col>
				<v-col cols="2">
					<v-select v-model="recordNhomCotDiem_Obj.Semester" label="Học kỳ"
						:items="['HK1', 'HK2']"></v-select>
				</v-col>
				<v-col cols="2">
					<v-text-field v-model="recordNhomCotDiem_Obj.ThuTuNhom" label="Thứ tự nhóm"
						:clearable="false"></v-text-field>
				</v-col>
				<v-col cols="2">
					<v-text-field v-model="recordNhomCotDiem_Obj.MaNhomCotDiem" label="Mã nhóm cột điểm"
						:clearable="false"></v-text-field>
				</v-col>
				<v-col cols="2">
					<v-text-field v-model="recordNhomCotDiem_Obj.TenNhomCotDiem_VI" label="Tên nhóm cột điểm (VI)"
						:clearable="false"></v-text-field>
				</v-col>
				<v-col cols="2">
					<v-text-field v-model="recordNhomCotDiem_Obj.TenNhomCotDiem_EN" label="Tên nhóm cột điểm (EN)"
						:clearable="false"></v-text-field>
				</v-col>

				<v-col cols="12">
					<v-card flat border class="mt-3">
						<template #title>
							<div class="d-flex align-center w-100 text-primary">
								<span>Các cột điểm</span>
								<v-spacer></v-spacer>
								<v-btn color="success" @click="onHandleAddCotDiem">
									<v-icon> mdi-plus</v-icon>
									Thêm cột điểm
								</v-btn>
								<v-btn class="ml-2" color="primary" @click="onSubmitAllCotDiem">
									Lưu {{CotDiemSelected.length}} cột điểm
								</v-btn>
								<v-btn class="ml-2" color="error" @click="onDeleteAllCotDiem">
									Xóa tất cả cột điểm
								</v-btn>
							</div>
						</template>
						<v-data-table-virtual v-model="CotDiemSelected" show-select :item-value="(value) => value"
							max-height="500" :headers="headers" :items="DSCotDiem" fixed-header density="comfortable"
							hide-default-footer class="mt-2">
							<template #item.ThuTuCotDiem="{item}">
								<v-text-field v-model="item.ThuTuCotDiem" solo :clearable="false"></v-text-field>
							</template>
							<template #item.MaCotDiem="{item}">
								<v-text-field v-model="item.MaCotDiem" solo :clearable="false"></v-text-field>
							</template>
							<template #item.TenCotDiem_VI="{ item }">
								<v-text-field v-model="item.TenCotDiem_VI" solo :clearable="false"></v-text-field>
							</template>
							<template #item.TenCotDiem_EN="{ item }">
								<v-text-field v-model="item.TenCotDiem_EN" solo :clearable="false"></v-text-field>
							</template>
							<template #item.LoaiCotDiem="{ item }">
								<v-select v-model="item.LoaiCotDiem" :items="DSLoaiCotDiem" item-title="TenLoaiCotDiem"
									item-value="value" solo :clearable="false" />
							</template>
							<template #item.GiaTriCotDiem="{ item }">
								<v-select v-model="item.GiaTriCotDiem" :items="DSLoaiDuLieu" item-title="TenLoaiDuLieu"
									item-value="value" solo :clearable="false" />
							</template>
							<template #item.Formula="{ item }">
								<v-textarea v-model="item.Formula" :rows="1" solo :clearable="false"
									hide-details="auto"></v-textarea>
							</template>
							<template #item.IDHeThong="{ item }">
								<v-text-field v-model="item.IDHeThong" solo :clearable="false"></v-text-field>
							</template>
							<template #item.WidthCSS="{ item }">
								<v-text-field v-model="item.WidthCSS" solo :clearable="false"
									placeholder="Vui lòng nhập số..."></v-text-field>
							</template>
							<template #item.IsUserInput="{ item }">
								<v-select v-model="item.IsUserInput" :items="DSHienThi" item-title="TenHienThi"
									item-value="Id"></v-select>
							</template>
							<template #item.IsVisibleToParents="{ item }">
								<v-select v-model="item.IsVisibleToParents" :items="DSHienThi" item-title="TenHienThi"
									item-value="Id">
								</v-select>
							</template>
							<template #item.IsSendToManager="{ item }">
								<v-select v-model="item.IsSendToManager" :items="DSHienThi" item-title="TenHienThi"
									item-value="Id">
								</v-select>
							</template>
							<template #item.IsNegativeNumber="{ item }">
								<v-select v-model="item.IsNegativeNumber" :items="DSHienThi" item-title="TenHienThi"
									item-value="Id">
								</v-select>
							</template>
							<template v-slot:item.Action="{ item }">
								<v-icon @click="onHandleDeleteCotDiem(item)" color="red darken-3" small class="mr-2">
									mdi-trash-can-outline
								</v-icon>
							</template>
						</v-data-table-virtual>
					</v-card>
				</v-col>
			</v-row>
		</uc-dialog>
	</div>
</template>

<script>
	export default {
		props: {
			modelValue: {
				type: Object
			},
			recordNhomCotDiem: {
				type: Object
			},
			recordMauBangDiem: {
				type: Object
			},
		},
		emits: ["onFinish"],
		data() {
			return {
				isShowModalAddCotDiem: false,
				isShowModalEditCotDiem: false,
				recordCotDiem: {},
				CotDiemSelected: [],
				DSLoaiDuLieu: [
					{
						value: 'number',
						TenLoaiDuLieu: 'Số'
					},
					{
						value: 'text',
						TenLoaiDuLieu: 'Nhận xét'
					},
					{
						value: 'ECO_Star',
						TenLoaiDuLieu: 'Ngôi sao'
					}
				],
				DSLoaiCotDiem: [
					{
						value: 'Công thức',
						TenLoaiCotDiem: 'Công thức'
					},
					{
						value: 'Nhập',
						TenLoaiCotDiem: 'Nhập liệu'
					}, {
						value: 'Hằng số',
						TenLoaiCotDiem: 'Hằng số'
					},
					{
						value: 'Tự động',
						TenLoaiCotDiem: 'Tự động'
					}
				],
				DSHienThi: [
					{
						Id: false,
						TenHienThi: 'Không'
					},
					{
						Id: true,
						TenHienThi: 'Có'
					},
				],
				headers: [
					{
						title: "Thứ tự CĐ",
						key: "ThuTuCotDiem",
						minWidth: 150,
						align: 'center',
						sortable: false
					},
					{
						title: "Mã CĐ",
						key: "MaCotDiem",
						minWidth: 250,
						sortable: false
					},
					{
						title: 'Tên CĐ VI',
						key: 'TenCotDiem_VI',
						sortable: false,
						minWidth: 200
					},
					{
						title: 'Tên CĐ EN',
						key: 'TenCotDiem_EN',
						sortable: false,
						minWidth: 200
					},
					{
						title: "Loại CĐ",
						key: "LoaiCotDiem",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Giá trị CĐ",
						key: "GiaTriCotDiem",
						minWidth: 200,
						sortable: false
					},
					{
						title: "ID hệ thống",
						key: "IDHeThong",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Độ dài CĐ",
						key: "WidthCSS",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Người dùng nhập",
						key: "IsUserInput",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Hiển thị cho phụ huynh",
						key: "IsVisibleToParents",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Gửi cho Manager",
						key: "IsSendToManager",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Số âm",
						key: "IsNegativeNumber",
						minWidth: 200,
						sortable: false
					},
					{
						title: "Công thức",
						key: "Formula",
						sortable: false,
						minWidth: 550,
					},
					{
						title: '',
						key: 'Action',
						align: 'center',
						sortable: false,
						minWidth: 50,
						right: 0,
						lastFixed: true,
	
					},
				],
				recordNhomCotDiem_Obj: {},
				soCotDiem: null,
				DSCotDiem: [],
				titleEditCotDiem: '',
				rules: {
					ThuTuCotDiem: [
						v => !!v || 'Vui lòng nhập thứ tự cột điểm',
					],
				},
				valid: false
			}
		},
		watch: {
			isShowModalEditCotDiem: function (val) {
				if (val) {
					this.titleEditCotDiem = this.recordCotDiem?.TenCotDiem_VI
				}
			},
			recordNhomCotDiem: function (val) {
				if (val) {
					this.recordNhomCotDiem_Obj = _.cloneDeep(this.recordNhomCotDiem)
					this.loadDSCotDiem()
				}
			},
		},
		methods: {
			onHandleCloseModal() {
				this.$emit('update:isOpen', false)
			},
			onHandleAddCotDiem() {
				let ThuTuCotDiemLonNhat = 1
				if (this.DSCotDiem.length > 0) {
					const arrThuTuCotDiem = this.DSCotDiem.map(x => x.ThuTuCotDiem)
					ThuTuCotDiemLonNhat = Math.max(...arrThuTuCotDiem)
					ThuTuCotDiemLonNhat += 1
				}
	
				ajaxCALL('lms/TemplateBangDiemChiTiet_By_One_Ins',
					{
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID,
						IDHeThong: '',
						MaCotDiem: null,
						TenCotDiem_VI: null,
						TenCotDiem_EN: null,
						TenHienThi_VI: null,
						TenHienThi_EN: null,
						MotaCotDiem_VI: null,
						MotaCotDiem_EN: null,
						LoaiCotDiem: 'Nhập',
						KieuDanhGiaID: 1,
						GiaTriCotDiem: 'number',
						LamTronBaoNhieuSo: 2,
						Formula: null,
						ThuTuCotDiem: ThuTuCotDiemLonNhat,
						MaNhomCotDiem: this.recordNhomCotDiem.MaNhomCotDiem,
						TenNhomCotDiem_VI: this.recordNhomCotDiem.TenNhomCotDiem_VI,
						TenNhomCotDiem_EN: this.recordNhomCotDiem.TenNhomCotDiem_EN,
						ThuTuNhom: this.recordNhomCotDiem.ThuTuNhom,
						IsUserInput: false,
						IsVisibleToParents: false,
						IsSendToManager: false,
						IsNegativeNumber: false,
						Semester: this.recordNhomCotDiem.Semester
					},
					res => {
						Vue.$toast.success('Thêm cột điểm thành công!', { position: 'top' })
						this.loadDSCotDiem()
					}
				)
			},
			loadDSCotDiem(MaNhomCotDiem) {
				ajaxCALL('lms/TemplateBangDiemChiTiet_DSCotDiem_Get_By_MaNhomCotDiem',
					{
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID,
						MaNhomCotDiem: this.recordNhomCotDiem.MaNhomCotDiem,
					}, res => {
						this.DSCotDiem = res.data
						this.CotDiemSelected = res.data
					}
				)
			},
			async onSubmitAllCotDiem() {
				const JSON_CotDiem = this.CotDiemSelected.map(x => {
					return {
						...x,
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID,
						MaNhomCotDiem: this.recordNhomCotDiem.MaNhomCotDiem,
					}
				})
				ajaxCALL('lms/TemplateBangDiemChiTiet_Multiple_Upd',
					{
						JSON_CotDiem: JSON_CotDiem
					},
					res => {
						Vue.$toast.success('Lưu danh sách cột điểm thành công!', { position: 'top' })
						this.loadDSCotDiem()
					}
				)
			},
			onHandleDeleteCotDiem(record) {
				const $this = this
				confirm({
					title: `Bạn có muốn xóa cột điểm ${record.MaCotDiem}`,
					action: function () {
						ajaxCALL('lms/TemplateBangDiemChiTiet_Del', {
							CotDiemID: record.CotDiemID,
							TemplateBangDiemID: $this.recordMauBangDiem.TemplateBangDiemID,
						}, res => {
							Vue.$toast.success('Xóa cột điểm thành công', { position: 'top' })
							$this.loadDSCotDiem()
						})
					}
				})
			},
			onDeleteAllCotDiem(record) {
				const $this = this
				confirm({
					title: `Bạn có muốn xóa tất cả cột điểm ?`,
					action: function () {
						ajaxCALL('lms/TemplateBangDiemChiTiet_DSCotDiem_Del_By_MaNhomCotDiem', {
							TemplateBangDiemID: $this.recordMauBangDiem.TemplateBangDiemID,
							MaNhomCotDiem: $this.recordNhomCotDiem.MaNhomCotDiem,
						}, res => {
							Vue.$toast.success('Xóa tất cả cột điểm thành công', { position: 'top' })
							$this.loadDSCotDiem()
						})
					}
				})
			},
			onSubmitNhomCotDiem() {
				const $this = this
				confirm({
					title: `Bạn có chắc cập nhật nhóm cột điểm?`,
					action: function () {
						ajaxCALL('lms/TemplateBangDiemChiTiet_MaNhomCotDiem_Udp', {
							TemplateBangDiemID: $this.recordMauBangDiem.TemplateBangDiemID,
							MaNhomCotDiem: $this.recordNhomCotDiem.MaNhomCotDiem,
							MaNhomCotDiem_Udp: $this.recordNhomCotDiem_Obj.MaNhomCotDiem,
							TenNhomCotDiem_VI_Udp: $this.recordNhomCotDiem_Obj.TenNhomCotDiem_VI,
							TenNhomCotDiem_EN_Udp: $this.recordNhomCotDiem_Obj.TenNhomCotDiem_EN,
							ThuTuNhom_Udp: $this.recordNhomCotDiem_Obj.ThuTuNhom,
							Semester_Udp: $this.recordNhomCotDiem_Obj.Semester,
						}, res => {
							$this.modelValue.isShowModalEditCauHinhCotDiem = false
							Vue.$toast.success('Cập nhật nhóm cột điểm thành công', { position: 'top' })
							$this.loadDSCotDiem()
						})
					}
				})
			}
		},
	}
</script>
</script>