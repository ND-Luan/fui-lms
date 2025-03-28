<template>
	<uc-dialog v-model="vueData.isShowModalCHCotDiem" fullscreen width="100%" :isShowDoneBtn="false">
		<template v-slot:title>
			Cấu hình cột điểm: {{ recordMauBangDiem.TemplateBangDiemName }}
		</template>
		<div class="d-flex my-2">
			<v-btn color="primary" variant="tonal" @click="loadDSNhomCotDiem">
				Làm mới
			</v-btn>
			<v-spacer></v-spacer>
			<v-btn color="success" @click="onOpenModalAddCauHinhCotDiem">
				<v-icon>mdi-plus</v-icon> Thêm
			</v-btn>
			<v-btn class="ml-2" color="error" @click="onDeleteCotDiemSelected" :disabled="CotDiemSelected.length === 0">
				Xóa {{CotDiemSelected.length}} nhóm điểm đã chọn
			</v-btn>
		</div>
		<v-card flat border>
			<v-card-title>
				<v-spacer></v-spacer>
				<v-text-field v-model="search" variant="filled" placeholder="Tìm kiếm..."
					style="max-width: 300px"></v-text-field>
			</v-card-title>
			<v-data-table-virtual v-model="CotDiemSelected" :item-value="(value) => value" show-select height="700"
				:items="TBCauHinhCotDiem" :headers="headers" :search="search" fixed-header
				style="max-width: calc(100vw + 1000px)" hide-default-footer :loading="isLoadingTB"
				class=" custom-border">
				<template v-slot:item.TongCotDiem="{ item }">
					<v-chip variant="outlined" color="green">
						{{ item.TongCotDiem }}
					</v-chip>
				</template>
				<template v-slot:item.TenNhom="{ item }">
					<b>{{ item.TenNhomCotDiem_VI }}</b> <br>
					<i>{{ item.TenNhomCotDiem_EN }}</i>
				</template>
				<template v-slot:item.TenCotDiem="{ item }">
					<div v-for="(i, index) in item.TenCotDiem" class="d-flex align-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<b :class="i.CssClass ? `text-` + i.CssClass : ''">{{ i.TenCotDiem_VI }} - <i>{{
								i.TenCotDiem_EN }}</i></b>
					</div>
				</template>
				<template v-slot:item.ThuTuCotDiem="{ item }">
					<div v-for="(i, index) in item.ThuTuCotDiem"
						class="d-flex align-center style-height-row-cot-diem justify-center"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<span :class="i.CssClass ? `text-` + i.CssClass : ''">{{ i.ThuTuCotDiem }}</span>
					</div>
				</template>
				<template v-slot:item.MaCotDiem="{ item }">
					<div v-for="(i, index) in item.MaCotDiem" class="d-flex align-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<span :class="i.CssClass ? `text-` + i.CssClass : ''">{{ i.MaCotDiem }}</span>
					</div>
				</template>
				<template v-slot:item.LoaiCotDiem="{ item }">
					<div v-for="(i, index) in item.LoaiCotDiem"
						class="d-flex align-center justify-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<v-chip label :color="getColorChipLoaiCotDiem(i.LoaiCotDiem)">{{ i.LoaiCotDiem }}</v-chip>
					</div>
				</template>
				<template v-slot:item.GiaTriCotDiem="{ item }">
					<div v-for="(i, index) in item.GiaTriCotDiem"
						class="d-flex align-center style-height-row-cot-diem justify-center"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<v-chip :color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)" v-if="i.GiaTriCotDiem === 'text'">
							Nhận xét
						</v-chip>
						<v-chip v-else-if="i.GiaTriCotDiem === 'ICO_Star'"
							:color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)">
							<v-icon>mdi-star</v-icon>
						</v-chip>
						<v-chip v-else-if="i.GiaTriCotDiem === 'number'"
							:color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)">Số
						</v-chip>
					</div>
				</template>
				<template v-slot:item.IDHeThong="{ item }">
					<div v-for="(i, index) in item.IDHeThong" class="d-flex align-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						{{ i.IDHeThong }}
					</div>
				</template>
				<template v-slot:item.Formula="{ item }">
					<div v-for="(i, index) in item.Formula" class="d-flex align-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<v-row>
							<v-col cols="11">
								<span>{{ i.Formula }}</span>
							</v-col>
							<v-col cols="1" class="d-flex align-center style-height-row-cot-diem">
								<v-icon v-if="item.LoaiCotDiem[index].LoaiCotDiem === 'Công thức'"
									@click="EditFormula(i)" color="success">mdi-square-edit-outline</v-icon>
							</v-col>
						</v-row>
						<uc-dialog v-model='i.isEdit' title="Công thức" max-width="500px" @onSubmit="SaveEditFormula(i)" doneText='Cập nhật'>
							<v-row>
								<v-col>
									<v-textarea v-model="formData.Formula"></v-textarea>
								</v-col>
							</v-row>
						</uc-dialog>
					</div>
				</template>
				<template v-slot:item.HienThi="{ item }">
					<div v-for="(i, index) in item.HienThi" class="d-flex ga-2 align-center style-height-row-cot-diem"
						:class="index !== 0 ? 'style-row-cot-diem' : ''">
						<v-tooltip text="Người dùng nhập">
							<template v-slot:activator="{ props }">
								<v-chip :style="{visibility: i.IsUserInput ? 'unset' : 'hidden'}" color="green"
									v-bind="props">
									<v-icon> mdi-account-edit</v-icon>
								</v-chip>
							</template>
						</v-tooltip>
						<v-tooltip text="Hiển thị cho phụ huynh">
							<template v-slot:activator="{ props }">
								<v-chip :style="{visibility: i.IsVisibleToParents ? 'unset' : 'hidden'}" color="orange"
									v-bind="props">
									<v-icon> mdi-account-supervisor-circle</v-icon>
								</v-chip>
							</template>
						</v-tooltip>
						<v-tooltip text="Gửi cho manager">
							<template v-slot:activator="{ props }">
								<v-chip :style="{visibility: i.IsSendToManager ? 'unset' : 'hidden'}" color="primary"
									v-bind="props">
									<v-icon> mdi-account-tie</v-icon>
								</v-chip>
							</template>
						</v-tooltip>
						<v-tooltip text="Cho phép số âm">
							<template v-slot:activator="{ props }">
								<v-chip :style="{visibility: i.IsNegativeNumber ? 'unset' : 'hidden'}" color="black"
									v-bind="props">
									<v-icon>mdi-numeric-negative-1</v-icon>
								</v-chip>
							</template>
						</v-tooltip>
					</div>
				</template>
				<template v-slot:item.Action="{ item }">
					<v-menu>
						<template v-slot:activator="{ props }">
							<v-btn icon="mdi-dots-horizontal" variant="text" v-bind="props"></v-btn>
						</template>
						<v-list>
							<v-list-item @click="onOpenModalEditCauHinhCotDiem(item)">
								<v-list-item-title>
									<v-icon color="green darken-2" small class="mr-2">
										mdi-square-edit-outline
									</v-icon>
									Cập nhật
								</v-list-item-title>
							</v-list-item>
							<v-list-item @click="onHandleDeleteCauHinhCotDiem(item)">
								<v-list-item-title>
									<v-icon color="red darken-3" small class="mr-2">
										mdi-trash-can-outline
									</v-icon>
									Xóa
								</v-list-item-title>
							</v-list-item>
						</v-list>
					</v-menu>
				</template>
			</v-data-table-virtual>
		</v-card>
	</uc-dialog>
	<uc-modal-add-cau-hinh-cot-diem v-model="action" :recordMauBangDiem="recordMauBangDiem"
		@onFinish="loadDSNhomCotDiem" />
	<uc-modal-edit-cau-hinh-cot-diem v-model="action" :recordNhomCotDiem="recordNhomCotDiem"
		:recordMauBangDiem="recordMauBangDiem" @onFinish="onHandleReloadDSCotDiem" />
</template>

<script>
	export default {
		props: {
			recordMauBangDiem: {
				type: Object
			}
		},
		data() {
			return {
				vueData,
				search: '',
				action: {
					isShowModalAddCauHinhCotDiem: false,
					isShowModalEditCauHinhCotDiem: false,
				},
				isLoadingTB: false,
				groupBy: [
					{
						key: 'TenNhomCotDiem_VI',
					},
				],
				headers: [
					{
						title: "Học kỳ",
						value: "Semester",
						minWidth: 100,
						align: 'center'
					},
					{
						title: 'Thứ tự nhóm CĐ',
						key: 'ThuTuNhom',
						align: 'center',
						sortable: false,
						minWidth: 150
					},
					{
						title: 'Mã nhóm CĐ ',
						key: 'MaNhomCotDiem',
						sortable: false,
						minWidth: 250
					},
					{
						title: 'Tên nhóm CĐ',
						key: 'TenNhom',
						sortable: false,
						minWidth: 300
					},
					{
						title: 'Hiển thị',
						key: 'HienThi',
						align: 'center',
						sortable: false,
						minWidth: 100
					},
					{
						title: 'Thứ tự CĐ',
						key: 'ThuTuCotDiem',
						align: 'center',
						sortable: false,
						minWidth: 80
					},
					{
						title: 'Mã CĐ',
						key: 'MaCotDiem',
						minWidth: 120,
						sortable: false
					},
					{
						title: 'Tên CĐ',
						key: 'TenCotDiem',
						sortable: false,
						minWidth: 500
					},
					{
						title: 'Loại CĐ',
						key: 'LoaiCotDiem',
						align: 'center',
						sortable: false
					},
					{
						title: 'Giá trị CĐ',
						key: 'GiaTriCotDiem',
						align: 'center',
						sortable: false,
						minWidth: 100
					},
					{
						title: 'ID hệ thống',
						key: 'IDHeThong',
						sortable: false,
						minWidth: 150
	
					},
					{
						title: 'Công thức',
						key: 'Formula',
						sortable: false,
						minWidth: 800
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
				TBCauHinhCotDiem: [],
				CotDiemSelected: [],
				recordNhomCotDiem: {},
				formData: {
					Formula: ''
				},
			}
		},
		mounted() { },
		computed: {},
		watch: {
			'vueData.isShowModalCHCotDiem': function (isShow) {
				if (isShow) {
					this.TBCauHinhCotDiem = Object.assign([], [])
					this.loadDSNhomCotDiem()
				}
			},
			'action.isShowModalEditCauHinhCotDiem': function (isShow) {
				if (!isShow) this.loadDSNhomCotDiem()
			},
		},
		methods: {
			async loadDSNhomCotDiem() {
				this.isLoadingTB = true
				ajaxCALL('lms/TemplateBangDiemChiTiet_Get_ByID', {
					TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID
				}, res => {
					let groupNhom = [...new Set(res.data.map(x => x.MaNhomCotDiem))]
					let group = []
					//Vòng lặp xử lý group các cột điểm có cùng nhóm cột điểm
					for (let i of groupNhom) {
						//Tạo obj để render lên table
						let obj = {}
						let items = res.data.filter(item => item.MaNhomCotDiem === i) // filter lấy các cột điểm có cùng mã nhóm
						obj.ThuTuCotDiem = items
						obj.HienThi = items
						obj.MaCotDiem = items
						obj.TenCotDiem = items
						obj.LoaiCotDiem = items
						obj.GiaTriCotDiem = items
						obj.IDHeThong = items
						obj.Formula = items.map(x => { return { ...x, isEdit: false } })
						obj.TenNhomCotDiem_VI = items[0]?.TenNhomCotDiem_VI ?? ''
						obj.TenNhomCotDiem_EN = items[0]?.TenNhomCotDiem_EN ?? ''
						obj.ThuTuNhom = items[0]?.ThuTuNhom ?? ''
						obj.MaNhomCotDiem = items[0]?.MaNhomCotDiem ?? ''
						obj.TemplateBangDiemID = items[0]?.TemplateBangDiemID ?? 0
						obj.Semester = items[0]?.Semester ?? ''
						group.push(obj)
					}
					this.TBCauHinhCotDiem = group
					this.isLoadingTB = false
					console.log('TBCauHinhCotDiem', this.TBCauHinhCotDiem)
				})
			},
			onOpenModalAddCauHinhCotDiem() {
				this.action.isShowModalAddCauHinhCotDiem = true
			},
			onOpenModalEditCauHinhCotDiem(record) {
				this.recordNhomCotDiem = _.cloneDeep(record)
				this.action.isShowModalEditCauHinhCotDiem = true
			},
			onHandleDeleteCauHinhCotDiem(record) {
				const $this = this
				confirm({
					title: `Bạn có chắc muốn xóa nhóm cột điểm ${record.TenNhomCotDiem_VI}?`,
					action: async function () {
						ajaxCALL('lms/TemplateBangDiemChiTiet_Del_By_MaNhomCotDiem', {
							TemplateBangDiemID: $this.recordMauBangDiem.TemplateBangDiemID,
							MaNhomCotDiem: record.MaNhomCotDiem
						}, res => {
							Vue.$toast.success('Xóa cột điểm thành công!', { position: 'top' })
							$this.loadDSNhomCotDiem()
						})
					}
				})
			},
			EditFormula(item) {
				this.formData = _.cloneDeep(item)
				item.isEdit = true
			},
			CloseEditFormula(item) {
				item.isEdit = false
			},
			async SaveEditFormula(item) {
				ajaxCALL('lms/TemplateBangDiemChiTiet_Upd', {
					...this.formData,
					Formula: this.formData.Formula,
				}, res => {
					Vue.$toast.success(`Cập nhật công thức cho cột điểm ${item.TenCotDiem_VI} thành công`, { position: 'top' })
					this.loadDSNhomCotDiem()
					item.isEdit = false
				})
			},
			async onHandleReloadDSCotDiem(value) {
				await this.loadDSNhomCotDiem()
				this.recordNhomCotDiem = this.TBCauHinhCotDiem.find(item => item.MaNhomCotDiem === value)
			},
			onDeleteCotDiemSelected() {
				const $this = this
				const JSON_MaNhomCotDiem = this.CotDiemSelected.map(x => {
					return {
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID,
						MaNhomCotDiem: x.MaNhomCotDiem
					}
				})
				confirm({
					title: "Xóa các mã nhóm điểm đã chọn",
					action: async function () {
						ajaxCALL('lms/TemplateBangDiemChiTiet_DSNhomDiem_Del_By_MaNhomDiem', {
							JSON_MaNhomCotDiem: JSON_MaNhomCotDiem
						}, res => {
							Vue.$toast.success('Xóa tất cả các mã nhóm điểm đã chọn thành công', { position: 'top' })
							$this.loadDSNhomCotDiem()
						})
					}
				})
			},
			getColorChipLoaiCotDiem,
			getColorChipGiaTriCotDiem
		},
	}
</script>