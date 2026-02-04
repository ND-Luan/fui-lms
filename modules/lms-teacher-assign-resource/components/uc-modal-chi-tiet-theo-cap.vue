<template>

	<v-dialog v-model="isOpen" max-width="1600px">
		<v-card>
			<v-card-title class="d-flex" style="background-color: #217d46;">
				<span class="text-white">{{ Type === "Assignment" ? 'Bài tập' : 'Bài học' }} - Cấp {{ CapID }}</span>
				<v-spacer></v-spacer>
				<v-btn class="text-white" variant="text" icon @click="onclose()">
					<v-icon>mdi-close</v-icon>
				</v-btn>
			</v-card-title>
			<v-card-text class="d-flex flex-column">

				<div class="d-flex flex-wrap ga-2 align-center border-b pb-3">
					<!-- <v-select label="Loại giao bài" :model-value="LoaiGiaoBai"
						@update:model-value="(loai) => getLoaiGiaoBai(loai)" return-object :items="DSLoaiGiaoBai"
						item-value="LoaiID" item-title="LoaiTitle" dense style="max-width: 200px;">
					</v-select> -->
					<v-select label="Môn học" :model-value="MonHocID" @update:model-value="(mh) => getMonHoc(mh)"
						return-object :items="DSMonHocTheoCap" item-value="MonHocID" item-title="TenMonHoc_HienThi"
						dense style="max-width: 300px;">
					</v-select>
				</div>
				<div v-if="DSKhoi.length > 0">
					<v-tabs v-model="tab" color="deep-purple-accent-4" style="margin: 12px 0px;">
						<v-tab v-for="khoi in DSKhoi" :value="khoi" class="font-weight-medium text-primary">Khối
							{{ khoi }} ({{ recordBaiTapInKhoi.get(khoi) ?? 0 }})
						</v-tab>
					</v-tabs>

					<v-tabs-window v-model="tab">
						<v-tabs-window-item v-for="khoi in DSKhoi" :key="khoi" :value="khoi">
							<v-table fixed-header class="my-table" v-if="Type === 'Assignment'">
								<thead>
									<tr>
										<th class="text-center fs-14" rowspan="2">
											Lớp học
										</th>
										<th class="text-center fs-14" rowspan="2">
											Sỉ số
										</th>
										<th class="text-center fs-14" colspan="5">
											Bài tập
										</th>
									</tr>
									<tr>
										<th class="text-left fs-14">
											Tên bài tập/ Giáo viên/ Ngày giao
										</th>
										<th class="text-center fs-14">
											Chưa làm
										</th>
										<th class="text-center fs-14">
											Đã nộp
										</th>
										<th class="text-center fs-14">
											Đã chấm
										</th>
										<th class="text-center fs-14" style="width: 200px !important;">
											Xem chi tiết
										</th>
									</tr>
								</thead>
								<tbody v-for="(lop, index) in DataTableFilter">
									<tr v-for="(bt, i) in lop.BaiTap" :key="i">
										<!-- Chỉ hiện TenLop ở dòng đầu tiên -->
										<td v-if="i === 0" class="text-center" :rowspan="lop.BaiTap.length">
											{{ lop.TenLop }}
										</td>
										<td v-if="i === 0" class="text-center" :rowspan="lop.BaiTap.length">
											{{ lop.SoLuongHocSinh }}
										</td>

										<td class="">
											<div class="d-flex flex-column ga-1">
												<div class="d-flex align-center">
													<span class="text-subtitle-2"
														style="font-size: 0.975rem !important">{{
															bt.Title }}</span>
													<v-spacer></v-spacer>
													<v-chip color="primary" size="small"
														v-tooltip="'Ngày giao bài tập'">{{
															dayjs(bt.ThoiGianTao).format('DD/MM/YYYY') }}</v-chip>
												</div>

												<span class="subtitle-cell">{{ bt.NguoiGiao }} | {{ bt.HoTenNguoiGiao
												}}</span>
												<v-chip color="primary" size="small"
													style="width: fit-content !important">{{ bt.Tuan_HienThi }}</v-chip>
											</div>
										</td>
										<td class="text-end" style="width: 150px !important;">{{ bt.SoLuongHocSinh -
											bt.SoLuongHocSinh_DaNop - bt.SoLuongHocSinh_DaCham }}</td>
										<td class="text-end" style="width: 150px !important;">{{ bt.SoLuongHocSinh_DaNop
										}}</td>
										<td class="text-end" style="width: 150px !important;">{{
											bt.SoLuongHocSinh_DaCham }}</td>
										<td class="text-center" style="width: 200px !important;">
											<v-btn color="primary" size="small" variant="outlined"
												@click="onOpenStatusClass(bt)">
												Xem tình trạng
											</v-btn>
										</td>
									</tr>
								</tbody>
							</v-table>

							<v-table fixed-header class="my-table mt-3" v-if="Type === 'Lesson'">
								<thead>
									<tr>
										<th class="text-center fs-14" rowspan="2">
											Lớp học
										</th>
										<th class="text-center fs-14" rowspan="2">
											Sỉ số
										</th>
										<th class="text-center fs-14" colspan="6r">
											Bài học
										</th>
									</tr>
									<tr>
										<th class="text-left fs-14">
											Tên bài tập/ Giáo viên/ Ngày giao
										</th>

										<th class="text-center fs-14">
											Chưa học
										</th>
										<th class="text-center fs-14">
											Chưa hoàn thành
										</th>
										<th class="text-center fs-14">
											Hoàn thành
										</th>
										<!-- <th class="text-center" style="width: 200px !important;">
											Xem chi tiết
										</th> -->
									</tr>
								</thead>
								<tbody v-for="(lop, index) in DataTableFilter">
									<tr v-for="(bt, i) in lop.BaiTap" :key="i">
										<!-- Chỉ hiện TenLop ở dòng đầu tiên -->
										<td v-if="i === 0" class="text-center" :rowspan="lop.BaiTap.length">
											{{ lop.TenLop }}
										</td v-if="i === 0" class="text-center" :rowspan="lop.BaiTap.length">
										<td class="text-center">{{ bt.SoLuongHocSinh }}</td>
										<td class="">
											<div class="d-flex flex-column ga-1">
												<div class="d-flex align-center">
													<span class="text-subtitle-2"
														style="font-size: 0.975rem !important">{{
															bt.Title }}</span>
													<v-spacer></v-spacer>
													<v-chip color="primary" size="small"
														v-tooltip="'Ngày giao bài học'">{{
															dayjs(bt.NgayGiao).format('DD/MM/YYYY') }}</v-chip>
												</div>
												<span class="subtitle-cell">
													{{ bt.NguoiGiao }} | {{ bt.HoTenNguoiGiao }}
												</span>
												<v-chip color="primary" size="small"
													style="width: fit-content !important">{{ bt.Tuan_HienThi }}</v-chip>
											</div>
										</td>

										<td class="text-end" style="width: 150px !important;">{{ bt.SoHocSinh_ChuaHoc }}
										</td>
										<td class="text-end" style="width: 150px !important;">{{
											bt.SoHocSinh_ChuaHoanThanh }}</td>
										<td class="text-end" style="width: 150px !important;">{{ bt.SoHocSinh_HoanThanh
										}}</td>
									</tr>
								</tbody>
							</v-table>
						</v-tabs-window-item>
					</v-tabs-window>
				</div>
				<uc-empty v-else text="Không tìm thấy dữ liệu"></uc-empty>

			</v-card-text>
		</v-card>
		<uc-modal-chi-tiet-class v-if="isShowChiTietClass" :AssignToClassInfo v-model:isOpen="isShowChiTietClass"
			:AssignToClassID :Title></uc-modal-chi-tiet-class>
	</v-dialog>
</template>
<script>
export default {
	props: {
		isOpen: {
			type: Boolean,
			default: false
		},
		DSMonHocTheoCap: {
			type: Array,
			default: []
		},
		CapID: {
			type: Number,
			default: 2
		},

	},
	emits: ['update:isOpen'],
	data() {
		return {
			search: '',
			tab: null,
			DataTable: [],
			isShowChiTietClass: false,
			AssignToClassID: null,
			headers: [
				{
					title: 'Lớp học',
					key: 'TenLop',
					sortable: false
				},
				{
					title: 'Sỉ số',
					key: 'SoLuongHocSinh',
					align: 'end',
					sortable: false
				},
				{
					title: 'Số lượng bài tập',
					key: 'SoLuongBaiTap',
					align: 'end',
					sortable: false
				},
				{ width: 1, key: 'data-table-expand', align: 'end' },
			],
			MonHocID: this.DSMonHocTheoCap[0]?.MonHocID ?? null,
			DSKhoi: [],
			Title: '',
			expanded: [],
			AssignToClassInfo: {},
			recordBaiTapInKhoi: new Map(),
			LoaiGiaoBai: { LoaiTitle: 'Lớp', LoaiID: 'lop' },
			DSLoaiGiaoBai: [
				{ LoaiTitle: 'Lớp', LoaiID: 'lop' },
				{ LoaiTitle: 'Học sinh', LoaiID: 'hocsinh' },
			],
		}
	},
	async mounted() {
		const Type = this.DSMonHocTheoCap[0]?.Type ?? null
		if (!Type) return
		if (Type === "Assignment") {
			this.get_BaoCaoLMS_Dashboard_Lop_By_MonHocID()
			this.get_BaoCaoLMS_Dashboard_HocSinh_By_MonHocID()
		}
		else this.get_BaoCaoLMS_Dashboard_Lop_BaiHoc_By_MonHocID()
		if (!this.tab) this.tab = this.DSKhoi[0]
	},
	computed: {
		DataTableFilter() {
			if (!Array.isArray(this.DataTable)) return []

			const dataOrigin = this.DataTable.find(item => item.KhoiID == this.tab)
			if (!dataOrigin || !Array.isArray(dataOrigin.DanhSach)) return []

			const DSLop = new Set(dataOrigin.DanhSach.map(bt => bt.TenLop))

			const dataReturn = Array.from(DSLop).map(lop => ({
				TenLop: lop,
				BaiTap: dataOrigin.DanhSach.filter(bt => bt.TenLop == lop),
				SoLuongHocSinh: dataOrigin.DanhSach.filter(bt => bt.TenLop == lop)[0].SoLuongHocSinh ?? 0,
				SoLuongBaiTap: dataOrigin.DanhSach.filter(bt => bt.TenLop == lop).length,
			}))

			this.expanded = dataReturn.map(item => item.TenLop)
			return dataReturn
		},
		Type() {
			return this.DSMonHocTheoCap[0]?.Type ?? null
		}
	},
	methods: {
		onclose() {
			this.$emit('update:isOpen', false)
		},
		async get_BaoCaoLMS_Dashboard_Lop_By_MonHocID() {
			const response = await ajaxCALLPromise('/lms/BaoCaoLMS_Dashboard_Lop_By_MonHocID',
				{ MonHocID: this.MonHocID, NienKhoa: vueData.NienKhoa }
			)
			const { DSKhoi, DataTable } = this.handleData(response[1])
			this.DSKhoi = DSKhoi
			this.DataTable = DataTable
			this.tab = this.DSKhoi[0] ?? null

		},
		async get_BaoCaoLMS_Dashboard_HocSinh_By_MonHocID() {
			const response = await ajaxCALLPromise('/lms/BaoCaoLMS_Dashboard_HocSinh_By_MonHocID',
				{ MonHocID: this.MonHocID, NienKhoa: vueData.NienKhoa }
			)
			// const { DSKhoi, DataTable } = this.handleData(response[1])
			// this.DSKhoi = DSKhoi
			// this.DataTable = DataTable
			// this.tab = this.DSKhoi[0] ?? null

		},
		async get_BaoCaoLMS_Dashboard_Lop_BaiHoc_By_MonHocID() {
			const response = await ajaxCALLPromise('/lms/BaoCaoLMS_Dashboard_Lop_BaiHoc_By_MonHocID',
				{ MonHocID: this.MonHocID, NienKhoa: vueData.NienKhoa }
			)
			const { DSKhoi, DataTable } = this.handleData(response[1])
			this.DSKhoi = DSKhoi
			this.DataTable = DataTable
			this.tab = this.DSKhoi[0] ?? null
		},
		async getMonHoc(mh) {
			console.log('mh', mh)
			if (this.MonHocID == mh.MonHocID) return
			this.MonHocID = mh.MonHocID
			if (this.Type === 'Assignment') this.get_BaoCaoLMS_Dashboard_Lop_By_MonHocID()
			else this.get_BaoCaoLMS_Dashboard_Lop_BaiHoc_By_MonHocID()

		},
		handleData(data) {
			let khoi = new Set([...data.map(item => item.KhoiID)])
			let MapKhoi = new Map()
			khoi.forEach(KhoiID => {
				MapKhoi.set(KhoiID, data.filter(bt => bt.KhoiID == KhoiID))
				this.recordBaiTapInKhoi.set(KhoiID, data.filter(bt => bt.KhoiID == KhoiID).length)
			})
			let DataReturn = Array.from(MapKhoi, ([KhoiID, list]) => ({
				KhoiID,
				SoLuong: list.length,
				DanhSach: list,
			}))
			return { DSKhoi: [...MapKhoi.keys()], DataTable: DataReturn }
		},
		onOpenStatusClass(bt) {
			this.isShowChiTietClass = true
			this.AssignToClassInfo = { ...bt }
			this.AssignToClassID = bt.AssignToClassID
			this.Title = bt.Title
		},
		getLoaiGiaoBai(loai) {
			this.LoaiGiaoBai = loai
		},
		dayjs
	}
}
</script>