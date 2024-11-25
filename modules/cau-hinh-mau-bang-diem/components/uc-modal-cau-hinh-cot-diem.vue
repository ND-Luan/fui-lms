<template>
	<v-dialog v-model="isOpen" max-width="2000">
		<v-card flat border>
			<v-card-title class="d-flex align-center style-height-row-cot-diem pe-2">
				Cấu hình cột điểm: {{ recordMauBangDiem.TemplateBangDiemName }}
				<v-spacer></v-spacer>
				<div class="d-flex justify-space-between">
					<v-icon @click="onHandleCloseModal()">mdi-close</v-icon>
				</div>
			</v-card-title>

			<v-card flat>
				<v-card-title>
					<v-btn color="success" class="ms-2 float-end" @click="onOpenModalAddCauHinhCotDiem()">
						<v-icon>mdi-plus</v-icon> Thêm
					</v-btn>
				</v-card-title>
				<v-data-table-virtual height="700" :items="TBCauHinhCotDiem" :headers="headers" fixed-header
					style="max-width: calc(100vw + 1000px)" density="compact" hide-default-footer :loading="isLoadingTB"
					class="mt-2 custom-border">

					<!-- <template v-slot:item.TenNhom="{ item }">
                        <v-list>
                            <v-list-item v-for="index in 4">
                                {{ index }}
                            </v-list-item>
                        </v-list>
                    </template> -->
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
							class="d-flex align-center style-height-row-cot-diem"
							:class="index !== 0 ? 'style-row-cot-diem' : ''">
							<v-chip label :color="getColorChipLoaiCotDiem(i.LoaiCotDiem)">{{ i.LoaiCotDiem }}</v-chip>
						</div>
					</template>
					<template v-slot:item.GiaTriCotDiem="{ item }">
						<div v-for="(i, index) in item.GiaTriCotDiem"
							class="d-flex align-center style-height-row-cot-diem justify-center"
							:class="index !== 0 ? 'style-row-cot-diem' : ''">
							<v-chip :color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)"
								v-if="i.GiaTriCotDiem === 'text'">Nhận xét</v-chip>
							<v-chip :color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)"
								v-else-if="i.GiaTriCotDiem === 'ICO_Star'"><v-icon>mdi-star</v-icon></v-chip>
							<v-chip :color="getColorChipGiaTriCotDiem(i.GiaTriCotDiem)"
								v-else-if="i.GiaTriCotDiem === 'number'">Số</v-chip>
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
							<v-dialog v-model='i.isEdit' max-width="500px">
								<v-card flat>
									<v-card-title>
										<span>Công thức {{ i.TenCotDiem_VI }}</span>
									</v-card-title>
									<v-card-text>
										<v-row>
											<v-col>
												<v-textarea v-model="formData.Formula"></v-textarea>
											</v-col>
										</v-row>
									</v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn @click="CloseEditFormula(i)">Đóng</v-btn>
										<v-btn @click="SaveEditFormula(i)" color="success">Cập nhật</v-btn>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</div>
					</template>
					<template v-slot:item.IsVisibleToParents="{ item }">
						<v-icon v-if="item.IsVisibleToParents === 0" color="red">mdi-eye-off-outline</v-icon>
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
										Cập nhật</v-list-item-title>
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
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn text="Đóng" @click="onHandleCloseModal()" />
			</v-card-actions>
		</v-card>
		<uc-modal-add-cau-hinh-cot-diem v-model:isOpen="isShowModalAddCauHinhCotDiem" @onFinish="loadDSCotDiem"
			:recordMauBangDiem />
		<uc-modal-edit-cau-hinh-cot-diem v-model:isOpen="isShowModalEditCauHinhCotDiem" :recordNhomCotDiem
			@onFinish="loadDSCotDiem" :recordMauBangDiem />
	</v-dialog>
</template>

<script>
export default {
	emits: ['update:isOpen'],
	props: ['isOpen', 'recordMauBangDiem'],
	data() {
		return {
			search: '',
			isEditFormula: false,
			isShowModalAddCauHinhCotDiem: false,
			isShowModalEditCauHinhCotDiem: false,
			isLoadingTB: false,
			groupBy: [
				{
					key: 'TenNhomCotDiem_VI',
				},
			],
			headers: [
				{
					title: 'Thứ tự nhóm CĐ',
					key: 'ThuTuNhom',
					align: 'center',
					sortable: false,
					minWidth: 100
				},
				{
					title: 'Mã nhóm CĐ ',
					key: 'MaNhomCotDiem',
					sortable: false,
					minWidth: 200
				},
				{
					title: 'Tên nhóm CĐ',
					key: 'TenNhom',
					sortable: false,
					minWidth: 300
				},
				{
					title: 'Hiển thị',
					key: 'IsVisibleToParents',
					align: 'center',
					sortable: false,
					minWidth: 100
				},
				{
					title: 'Thứ tự CĐ',
					key: 'ThuTuCotDiem',
					align: 'center',
					sortable: false,
					minWidth: 100
				},
				{
					title: 'Mã CĐ',
					key: 'MaCotDiem',
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
			recordNhomCotDiem: {},
			formData: {
				Formula: ''
			},
		}
	},
	mounted() { },
	computed: {},
	watch: {
		isOpen: function (val) {
			if (val) {
				this.TBCauHinhCotDiem = Object.assign([], [])
				this.loadDSCotDiem()
			}
		}
	},
	methods: {
		async loadDSCotDiem() {
			const $this = this
			$this.isLoadingTB = true
			const res = await TemplateBangDiemChiTiet_Service.Get_ById({
				TemplateBangDiemID: $this.recordMauBangDiem.TemplateBangDiemID
			}).finally(() => $this.isLoadingTB = false)
			if (res) {
				//Lấy các nhóm cột điểm
				let groupNhom = res.reduce((rs, item, index) => {
					if (!rs[item.TenNhomCotDiem_VI]) {
						rs[item.TenNhomCotDiem_VI] = item.TenNhomCotDiem_VI
					}
					return rs
				}, [])
				let group = []
				//Vòng lặp xử lý group các cột điểm có cùng nhóm cột điểm
				for (let i in groupNhom) {
					//Tạo obj để render lên table
					let obj = {}
					let items = res.filter(item => item.TenNhomCotDiem_VI === i) // filter lấy các cột điểm có cùng mã nhóm
					obj.ThuTuCotDiem = items
					obj.MaCotDiem = items
					obj.TenCotDiem = items
					obj.LoaiCotDiem = items
					obj.GiaTriCotDiem = items
					obj.IDHeThong = items
					obj.Formula = items.map(i => { return { ...i, isEdit: false } })
					obj.TenNhomCotDiem_VI = i
					obj.TenNhomCotDiem_EN = items[0].TenNhomCotDiem_EN
					obj.ThuTuNhom = items[0].ThuTuNhom
					obj.MaNhomCotDiem = items[0].MaNhomCotDiem
					group.push(obj)
				}
				$this.TBCauHinhCotDiem = group
			}
		},
		onHandleCloseModal() {
			this.$emit('update:isOpen', false)


		},
		onOpenModalAddCauHinhCotDiem() {
			this.isShowModalAddCauHinhCotDiem = true
		},
		onOpenModalEditCauHinhCotDiem(record) {
			this.recordNhomCotDiem = _.cloneDeep(record)
			console.log('this.recordNhomCotDiem', this.recordNhomCotDiem)
			this.isShowModalEditCauHinhCotDiem = true
		},
		onHandleDeleteCauHinhCotDiem(record) {
			Alert.confirm({
				text: `Bạn có chắc muốn xóa cột điểm ${record.TenCotDiem_VI}?`
			}).then(async (rs) => {
				if (rs) {
					const res = await TemplateBangDiemChiTiet_Service.Del({
						CotDiemID: record.CotDiemID,
						TemplateBangDiemID: this.recordMauBangDiem.TemplateBangDiemID
					})
					if (res) {
						Vue.$toast.success('Xóa cột điểm thành công!', { position: 'top' })
						this.loadDSCotDiem()
					}
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
			const res = await TemplateBangDiemChiTiet_Service.Upd({
				...this.formData,
				Formula: this.formData.Formula,
			}).finally(() => item.isEdit = false)
			if (res) {
				console.log(res, item.TenCotDiem_VI)
				Vue.$toast.success(`Cập nhật công thức cho cột điểm ${item.TenCotDiem_VI} thành công`, { position: 'top' })
				this.loadDSCotDiem()
			}
		},
		getColorChipLoaiCotDiem: getColorChipLoaiCotDiem,
		getColorChipGiaTriCotDiem: getColorChipGiaTriCotDiem
	},
}
</script>