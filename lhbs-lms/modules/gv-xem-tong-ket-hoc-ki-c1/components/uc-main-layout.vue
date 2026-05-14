<template>
	<v-card>
		<v-card-title class="text-primary">
			<div>Xem tổng kết học kì - Cấp 1</div>
			<v-chip color="primary" class="font-weight-medium ml-2" variant="text">
				Tổng số học sinh: {{ DSHocSinh.length }}
			</v-chip>
		</v-card-title>
		<v-card-text class="pb-0">
			<v-row>
				<v-col>
					<v-select v-model="Semester" label="Chọn học kì" :items="DSSemester" hide-details="auto"
						item-title="title" item-value="value" :return-object="true" />
				</v-col>
				<v-col>
					<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
						item-value="KhoiID" :return-object="true" hide-details="auto" />
				</v-col>
				<v-col>
					<v-select v-model="LopItem" label="Chọn lớp"
						:items="DSLop.filter(item => !item.LopID.includes('N'))" item-title="TenLop" item-value="LopID"
						:return-object="true" hide-details="auto" />
				</v-col>
				<v-col>
					<v-btn prepend-icon="mdi-refresh" color="primary" variant="outlined"
						@click="TongKet_GetDTBMonHocByKhoiLop">
						Làm mới
					</v-btn>
				</v-col>
				<v-btn class="float-right" color="primary" :disabled="DSHocSinh.length === 0" variant="outlined"
					prepend-icon="mdi-file-excel" @click="exportExcel">
					Xuất file excel
				</v-btn>
			</v-row>
		</v-card-text>
	</v-card>
	<v-card>
		<uc-jexcel v-if="DSHocSinh?.length > 0" class="height-excel-tong-ket-hoc-ki" v-model="instance"
			:freeze-columns="freezeColumns" :freeze-rows="1" v-model:dataSource="DSHocSinh" :columns="columnHeader"
			:nested-headers="nestedHeaders" :key="keyComp" :filters="true" :exportExcel="true">
		</uc-jexcel>
		<uc-card-empty v-else />
	</v-card>
</template>

<script>
	export default {
		data() {
			return {
				Is_InCaKhoi: false,
				instance: null,
				DSKhoi: [],
				DSLop: [],
				DSMonHoc: [],
				DSNhomDiem: [],
				LopItem: null,
				KhoiItem: null,
				MonHocItem: null,
				MaNhomCotDiemItem: null,
				keyComp: 0,
				columnHeader: [],
				DSHocSinh: [],
				DSCotDiem: [],
				DSCotDiem_ByMaNhomCotDiem: [],
				DSCotDiem_TatCa: [],
				dataBeforeInsertToDB: [],
				TinhTrang: null,
				styleSheet: null,
				comments: {},
				StatusButton: null,
				freezeColumns: 4,
				Semester: { title: 'Giữa kì 1', value: 1 },
				DSSemester: [
					{ title: 'Giữa kì 1', value: 1 },
					{ title: 'Cuối kì 1', value: 2 },
					{ title: 'Giữa kì 2', value: 3 },
					{ title: 'Cuối kì 2', value: 4 },
				],
				DSHocSinh_API_QLD: [],
				MonHoc_QLD: [],
				DSHocSinhQLD: [],
				DSHocSinh_API_TongKet: [],
				dataDiem: [],
				dataDiem_ChuyenCap: [],
				DSHocSinhChange: [],
				nestedHeaders: [],
				IsShowDialogConfirm: false,
			}
		},

		computed: {
			CapID() {
				return vueData.CapID
			},
			NienKhoa() {
				return vueData.NienKhoa
			},
		},

		watch: {
			NienKhoa() {
				this.KhoiItem = null
				this.LopItem = null
				this.DSHocSinh = []
			},
			Semester() {
				this.KhoiItem = null
				this.LopItem = null
				this.DSLop = []
				this.DSHocSinh = []
			},
			KhoiItem(val) {
				this.LopItem = null
				this.DSLop = []
				this.DSHocSinh = []
				if (val?.KhoiID > 0) {
					this.getLop()
					this.getMonHoc_QLD_ByKhoi()
				}
			},
			LopItem(val) {
				this.DSHocSinh = []
				if (val?.LopID > 0) {
					this.TongKet_GetDTBMonHocByKhoiLop()
				} else if (val?.LopID == '-1') {
					this.getDSLop()
				}
			},
			Is_InCaKhoi(val) {
				if (val) this.getDSLop()
			},
		},

		mounted() {
			this.initColumn()
			this.getKhoi()
		},

		methods: {
			// ─── API calls ───────────────────────────────────────────────
			getKhoi() {
				ajaxCALL('lms/KhoiHocByCapHoc_Get', { CapID: this.CapID }, res => {
					this.DSKhoi = res.data
				})
			},

			getLop() {
				ajaxCALL('lms/Lop_Get_ByKhoiID', {
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.KhoiItem?.KhoiID,
				}, res => {
					this.DSLop = res.data
					this.initAllClass()
				})
			},

			getMonHoc_QLD_ByKhoi() {
				ajaxCALL('lms/MonHoc_QLD_GetByKhoi', {
					NienKhoa: vueData.NienKhoa,
					KhoiID: this.KhoiItem?.KhoiID,
				}, res => {
					this.MonHoc_QLD = res.data
				})
			},

			// ─── Core logic ──────────────────────────────────────────────
			initAllClass() {
				const obj = this.DSLop.find(x => x.LopID == '-1')
				if (!obj) {
					this.DSLop.unshift({
						TenLop: 'Tất cả các lớp',
						LopID: '-1',
					})
				}
			},

			initColumn() {
				for (var column of this.columnHeader) {
					column.render = function (cell, value, x, y, instance, options) {
						if (cell.innerHTML !== '') {
							var tempDiv = document.createElement('div')
							tempDiv.innerHTML = value
							cell.innerHTML = ''
							cell.appendChild(tempDiv.firstChild)
						}
					}
				}
			},

			initSpread() {
				this.handleHeaders()
				this.handleData()
			},

			handleHeaders() {
				console.log('this.dataDiem', this.dataDiem)
				if (!Array.isArray(this.dataDiem) || this.dataDiem.length === 0) {
					console.warn('Không có dữ liệu để tạo header')
					return
				}
				this.nestedHeaders = [
					[
						{ title: 'Thông tin học sinh', colspan: 6 },
						{ title: 'Tiếng Việt', colspan: 2 },
						{ title: 'Toán', colspan: 2 },
						{ title: 'Ngoại ngữ', colspan: 2 },
						{ title: 'Lịch sử và Địa lí', colspan: 2 },
						{ title: 'Khoa học / TNXH', colspan: 2 },
						{ title: 'Tin học và Công nghệ (Tin học)', colspan: 2 },
						{ title: 'Tin học và Công nghệ (Công nghệ)', colspan: 2 },
						{ title: 'Đạo đức', colspan: 1 },
						{ title: 'Thể dục', colspan: 1 },
						{ title: 'Âm nhạc', colspan: 1 },
						{ title: 'Mĩ thuật', colspan: 1 },
						{ title: 'Hoạt động trải nghiệm', colspan: 1 },
						{ title: 'Tiếng dân tộc', colspan: 1 },
						{ title: 'Năng lực chung', colspan: 3 },
						{ title: 'Năng lực đặc thù', colspan: 7 },
						{ title: 'Phẩm chất chủ yếu', colspan: 5 },
						{ title: 'Đánh giá kết quả giáo dục', colspan: 4 },
						{ title: 'Khen thưởng', colspan: 2 },
					],
				]
				const headerDefault = [
					'STT', 'TenLop', 'HocSinhID', 'SoDanhBo', 'HoTen', 'NgaySinh', 'Phai',
					'TVM', 'TVD', 'TOM', 'TOD', 'NNM', 'NND',
					'SDM', 'SDD', 'KHM', 'KHD', 'THM', 'THD',
					'CNM', 'CND', 'DDM', 'TDM', 'ANM', 'MTM',
					'KTM', 'DTM',
					'NL1', 'NL2', 'NL3', 'NL4', 'NL5', 'NL6', 'NL7', 'NL8', 'NL9', 'NL10',
					'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
					'HoanThanhXuatSac', 'HoanThanhTot', 'HoanThanh', 'ChuaHoanThanh',
					'KTCN', 'KTDX', 'ChuaLenLop',
					'DanhGia', 'DanhHieu', 'KhenThuong',
					'PhanLoai_TuyenThang', 'Flyers', 'DiemTA',
					'DKHocTiep', 'PhoiHopCMHS',
					'NhanXetGVCN_VePhuHuynh_HTML',
					'NhanXetGVCN_VeHocSinh_HTML',
					'DeXuat_NDCamKet',
				]
				const columnMapping = {
					STT: { width: 1, type: 'hidden' },
					HSLopID: { width: 1, type: 'hidden' },
					Khoi: { width: 1, type: 'hidden' },
					SoDanhBo: { width: 60, title: 'SoDB' },
					HocSinhID: { width: 80, title: 'Mã học sinh' },
					HoTen: { width: 180, align: 'left' },
					TenLop: { width: 50, title: 'Lop' },
					UuDiem: { width: 600, title: 'Ưu điểm', align: 'left' },
					NhuocDiem: { width: 450, title: 'Nhược điểm', align: 'left' },
					DeXuat: { width: 700, title: 'Đề xuất', align: 'left' },
					NgaySinh: { width: 100 },
					DanhHieu: { width: 120, title: 'Danh hiệu' },
					DanhGia: { width: 130, title: 'Đánh giá' },
					DTB: { title: 'ĐTB' },
					Phep: { title: 'vP' },
					KhongPhep: { title: 'vKP' },
					TongBuoiNghi: { title: 'vTong' },
					HocLuc: { title: 'KQHT' },
					KQRenLuyen: {
						title: 'KQRL',
						type: 'dropdown',
						source: ['Chưa đạt', 'Khá', 'Tốt', 'Đạt'],
						readOnly: false,
						width: 100,
						typeValue: 'KQRenLuyen',
					},
				}
				const titleMapping = {
					TVM: 'Mức đạt được', TOM: 'Mức đạt được', KHM: 'Mức đạt được',
					SDM: 'Mức đạt được', NNM: 'Mức đạt được', THM: 'Mức đạt được',
					CNM: 'Mức đạt được', DDM: 'Mức đạt được', ANM: 'Mức đạt được',
					MTM: 'Mức đạt được', KTM: 'Mức đạt được', TDM: 'Mức đạt được',
					DTM: 'Mức đạt được',
					TVD: 'Điểm KTĐK', TOD: 'Điểm KTĐK', KHD: 'Điểm KTĐK',
					SDD: 'Điểm KTĐK', NND: 'Điểm KTĐK', THD: 'Điểm KTĐK',
					CND: 'Điểm KTĐK', DTD: 'Điểm KTĐK',
				}
				const NLMapping = {
					NL1: { width: 60, title: 'Tự học và tự chủ' },
					NL2: { width: 60, title: 'Giao tiếp và hợp tác' },
					NL3: { width: 60, title: 'Giải quyết vấn đề và sáng tạo' },
					NL4: { width: 60, title: 'Ngôn ngữ' },
					NL5: { width: 60, title: 'Tính toán' },
					NL6: { width: 60, title: 'Khoa học' },
					NL7: { width: 60, title: 'Công nghệ' },
					NL8: { width: 60, title: 'Tin học' },
					NL9: { width: 60, title: 'Thẩm mỹ' },
					NL10: { width: 60, title: 'Thể chất' },
				}
				const PCMapping = {
					PC1: { width: 60, title: 'Yêu nước' },
					PC2: { width: 60, title: 'Nhân ái' },
					PC3: { width: 60, title: 'Chăm chỉ' },
					PC4: { width: 60, title: 'Trung thực' },
					PC5: { width: 60, title: 'Trách nhiệm' },
				}
				const DGKQ_GGMapping = {
					HoanThanhXuatSac: { width: 60, title: 'Hoàn thành xuất sắc' },
					HoanThanhTot: { width: 60, title: 'Hoàn thành tốt' },
					HoanThanh: { width: 60, title: 'Hoàn Thành' },
					ChuaHoanThanh: { width: 60, title: 'Chưa hoàn thành' },
				}
				const KhenThuong_Mapping = {
					KTCN: { width: 60, title: 'Cuối năm' },
					KTDX: { width: 60, title: 'Đột xuất' },
				}
				const LenLop_Mapping = {
					ChuaLenLop: { width: 60, title: 'Chưa được lên lớp' },
				}
				const KhenThuong_ND_Mapping = {
					KhenThuong: { width: 120, title: 'Khen thưởng' },
				}
				const TTChuyenCapMapping = {
					PhoiHopCMHS: { width: 60, title: 'Phối hợp CMHS' },
					PhanLoai_TuyenThang: { width: 120, title: 'Phân loại tuyển thẳng' },
					Flyers: { width: 60, title: 'Flyers' },
					DiemTA: { width: 60, title: 'Điểm Tiếng Anh' },
					DKHocTiep: { width: 60, title: 'Đăng ký học tiếp', type: 'checkbox' },
					DeXuat_NDCamKet: { width: 400, title: 'Đề xuất/Nội dung cam kết', align: 'left' },
					NhanXetGVCN_VePhuHuynh_HTML: { width: 400, title: 'Nhận xét về Phụ Huynh', type: 'html', align: 'left' },
					NhanXetGVCN_VeHocSinh_HTML: { width: 400, title: 'Nhận xét về Học Sinh', type: 'html', align: 'left' },
				}
				let columnThongTinHocSinh = []
				for (const key of headerDefault) {
					let column = {
						type: 'text',
						title: key,
						name: key,
						backGroundColor: null,
						wrap: true,
						align: 'center',
						readOnly: true,
						style: 'font-size:8px',
						...columnMapping[key],
						...NLMapping[key],
						...PCMapping[key],
						...DGKQ_GGMapping[key],
						...KhenThuong_Mapping[key],
						...LenLop_Mapping[key],
						...KhenThuong_ND_Mapping[key],
						...TTChuyenCapMapping[key],
					}
					if (titleMapping[key]) {
						column.title = titleMapping[key]
						column.width = 50
					}
					if (NLMapping[key]) column.title = NLMapping[key].title
					if (PCMapping[key]) column.title = PCMapping[key].title
					if (DGKQ_GGMapping[key]) column.title = DGKQ_GGMapping[key].title
					if (KhenThuong_Mapping[key]) column.title = KhenThuong_Mapping[key].title
					if (LenLop_Mapping[key]) column.title = LenLop_Mapping[key].title
					if (KhenThuong_ND_Mapping[key]) column.title = KhenThuong_ND_Mapping[key].title
					if (TTChuyenCapMapping[key]) column.title = TTChuyenCapMapping[key].title
					columnThongTinHocSinh.push(column)
				}
				this.columnHeader = [...columnThongTinHocSinh]
				console.log('this.columnHeader', this.columnHeader)
				this.initColumn()
				this.keyComp++
			},

			handleData() {
				for (var item of this.dataDiem) {
					const objHocSinh = this.dataDiem_ChuyenCap.find(x => x.SoDanhBo === item.SoDanhBo)
					let obj = {}
					if (objHocSinh) {
						obj.PhoiHopCMHS = objHocSinh.PhoiHopCMHS
						obj.NhanXetGVCN_VePhuHuynh_HTML = objHocSinh.NhanXetGVCN_VePhuHuynh_HTML
						obj.NhanXetGVCN_VeHocSinh_HTML = objHocSinh.NhanXetGVCN_VeHocSinh_HTML
						obj.PhanLoai_TuyenThang = objHocSinh.PhanLoai_TuyenThang
						obj.Flyers = objHocSinh.Flyers
						obj.DiemTA = objHocSinh.DiemTA
						obj.DKHocTiep = objHocSinh.DKHocTiep
						obj.DeXuat_NDCamKet = objHocSinh.DeXuat_NDCamKet
					}
					this.DSHocSinh.push({ ...item, ...obj })
				}
				this.DSHocSinh = this.DSHocSinh.sort((a, b) => a.TenLop.localeCompare(b.TenLop))
			},

			async TongKet_GetDTBMonHocByKhoiLop() {
				this.DSHocSinh = []
				if (this.Is_InCaKhoi) {
					this.getDSLop()
				} else {
					await ajaxCALL(`https://tapi.lhbs.vn/psmark1/LMS_GetBangTongHopKetQua`,
						{
							LopID: this.LopItem.LopID,
							KyDanhGia: this.Semester.value,
						}, res => {
							this.DSHocSinh_API_TongKet = res.data
							this.dataDiem = res.data
							ajaxCALL('lms/NhanXetThang_CuoiNam_Get', {
								LopID: this.LopItem.LopID,
							}, res => {
								this.dataDiem_ChuyenCap = res.data
								this.initSpread()
							})
						})
				}
			},

			LMS_GetBangTongHopKetQua(lopid) {
				return new Promise(resolve => {
					ajaxCALL(`/psmark1/LMS_GetBangTongHopKetQua`,
						{
							LopID: lopid,
							KyDanhGia: this.Semester.value,
						},
						res => {
							this.dataDiem = res.data
							resolve()
						}
					)
				})
			},

			NhanXetThang_CuoiNam_Get(lopid) {
				return new Promise(resolve => {
					ajaxCALL('lms/NhanXetThang_CuoiNam_Get', {
						LopID: lopid,
					}, res_nxt => {
						this.dataDiem_ChuyenCap = res_nxt.data
						resolve()
					})
				})
			},

			async TongKet_GetDTBMonHocByKhoiLopHangLoat(lopid) {
				return new Promise(async resolve => {
					await this.LMS_GetBangTongHopKetQua(lopid)
					await this.NhanXetThang_CuoiNam_Get(lopid)
					this.initSpread()
					resolve()
				})
			},

			async getDSLop() {
				this.DSHocSinh = []
				this.DSHocSinhChange = []
				this.dataDiem_ChuyenCap = []
				let dslopFilter = this.DSLop.filter(item => !item.LopID.includes('N'))
				for (var item of dslopFilter) {
					await this.TongKet_GetDTBMonHocByKhoiLopHangLoat(item.LopID)
				}
			},

			onSave() {
				let parseJSON = this.DSHocSinh.map(item => {
					return {
						HocSinhID: item.HocSinhID,
						LopID: item.LopID,
						KQRL_Sau: item.KQRenLuyen,
					}
				})
				ajaxCALL('lms/XetKetQuaRenLuyen_Upsert_JSON',
					{ json: JSON.stringify(parseJSON) },
					res => { console.log('res', res) }
				)
			},

			renderDSKhoi() {
				const DSKhoi = Array.from({ length: 12 }).map((_, i) => {
					const value = i + 1
					let CapID
					if (value >= 1 && value <= 5) CapID = 1
					else if (value >= 6 && value <= 9) CapID = 2
					else if (value >= 10 && value <= 12) CapID = 3
					return { title: `Khối ${value}`, value, CapID }
				})
				this.DSKhoi = DSKhoi.filter(x => x.CapID === this.CapID)
				return DSKhoi
			},

			renderDSHocSinh_QLD() {
				const _dsHocSinh = []
				const dsHocSinhID = [...new Set(this.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
				for (var HocSinhID of dsHocSinhID) {
					const objHocSinh = this.DSHocSinh_API_QLD.find(x => x.HocSinhID === HocSinhID)
					if (objHocSinh) _dsHocSinh.push({
						...objHocSinh,
						DSCotDiem: this.DSHocSinh_API_QLD.filter(x => x.HocSinhID === HocSinhID),
					})
				}
				this.DSHocSinhQLD = _dsHocSinh
			},

			renderDSHocSinhChange() {
				const arr = []
				for (var HocSinhID of this.DSHocSinhChange) {
					const obj = this.dataDiem_ChuyenCap.find(x => x.HocSinhID === HocSinhID)
					if (obj) arr.push({
						HoTen: obj.HoTen,
						NgaySinh: obj.NgaySinh,
						Nu: obj.Nu,
						SoDanhBo: obj.SoDanhBo,
						HocSinhID: obj.HocSinhID,
					})
				}
				return arr
			},

			exportExcel() {
				const rawData = this.DSHocSinh
				const headerRow1 = [
					'Thông tin học sinh', null, null, null, null, null,
					'Tiếng Việt', null,
					'Toán', null,
					'Ngoại ngữ', null,
					'Lịch sử và Địa lí', null,
					'Khoa học / TNXH', null,
					'Tin học và Công nghệ (Tin học)', null,
					'Tin học và Công nghệ (Công nghệ)', null,
					'Đạo đức',
					'Thể dục',
					'Âm nhạc',
					'Mĩ thuật',
					'Hoạt động trải nghiệm',
					'Tiếng dân tộc',
					'Năng lực chung', null, null,
					'Năng lực đặc thù', null, null, null, null, null, null,
					'Phẩm chất chủ yếu', null, null, null, null,
					'Đánh giá kết quả giáo dục', null, null, null,
					'Khen thưởng', null,
				]
				const headerRow2 = this.columnHeader
					.filter(item => item.title != 'STT' && item.title != 'HSLopID')
					.map(item => item.title)
				const keys = this.columnHeader
					.filter(item => item.title != 'STT' && item.title != 'HSLopID')
					.map(item => item.name)
				const dataRows = rawData.map(item =>
					keys.map(k => item[k] != null ? item[k] : '')
				)
				const aoa = [headerRow1, headerRow2, ...dataRows]
				const worksheet = XLSX.utils.aoa_to_sheet(aoa)
				worksheet['!merges'] = [
					{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
					{ s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
					{ s: { r: 0, c: 8 }, e: { r: 0, c: 9 } },
					{ s: { r: 0, c: 10 }, e: { r: 0, c: 11 } },
					{ s: { r: 0, c: 12 }, e: { r: 0, c: 13 } },
					{ s: { r: 0, c: 14 }, e: { r: 0, c: 15 } },
					{ s: { r: 0, c: 16 }, e: { r: 0, c: 17 } },
					{ s: { r: 0, c: 18 }, e: { r: 0, c: 19 } },
					{ s: { r: 0, c: 20 }, e: { r: 0, c: 20 } },
					{ s: { r: 0, c: 21 }, e: { r: 0, c: 21 } },
					{ s: { r: 0, c: 22 }, e: { r: 0, c: 22 } },
					{ s: { r: 0, c: 23 }, e: { r: 0, c: 23 } },
					{ s: { r: 0, c: 24 }, e: { r: 0, c: 24 } },
					{ s: { r: 0, c: 25 }, e: { r: 0, c: 25 } },
					{ s: { r: 0, c: 26 }, e: { r: 0, c: 28 } },
					{ s: { r: 0, c: 29 }, e: { r: 0, c: 35 } },
					{ s: { r: 0, c: 36 }, e: { r: 0, c: 40 } },
					{ s: { r: 0, c: 41 }, e: { r: 0, c: 44 } },
					{ s: { r: 0, c: 45 }, e: { r: 0, c: 46 } },
					{ s: { r: 0, c: 47 }, e: { r: 0, c: 58 } },
				]
				const workbook = XLSX.utils.book_new()
				XLSX.utils.book_append_sheet(workbook, worksheet, 'TongKetHocKiCap1')
				XLSX.writeFile(workbook, 'TongKetHocKiCap1.xlsx')
			},
		},
	}
</script>