<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					{{ TitlePage }} • {{ TitleCap }}
					<v-chip variant="text" color="primary" class="font-weight-medium">
						Tổng số học sinh: {{ DSHocSinhQLD.length }}
					</v-chip>
				</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="Semester" label="Chọn học kì" :items="DSSemester" item-title="title"
								item-value="value" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" :disabled="!KhoiItem"
								@click="KhoiItem?.isAll ? getTongKetAllKhoi() : getTongKetByKhoi()">
								<v-icon start>mdi-refresh</v-icon>Làm mới
							</v-btn>
							<v-btn icon variant="outlined" color="primary">
								<v-icon>mdi-dots-vertical</v-icon>
								<v-menu activator="parent">
									<v-list>
										<v-list-item title="Export excel" :disabled="DSHocSinhQLD.length === 0"
											@click="exportExcel" />
										<v-divider />
										<v-list-item title="Export Thư khen" :disabled="DSHocSinhQLD.length === 0"
											@click="exportThuKhen" />
										<v-divider />
										<v-list-item title="Export Giấy khen" :disabled="DSHocSinhQLD.length === 0"
											:loading="isLoadingExportGiayKhen" @click="exportGiayKhen" />
									</v-list>
								</v-menu>
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<uc-xem-tong-ket-dskt />
		<uc-empty v-if="DSHocSinhQLD.length === 0" />

		<v-dialog v-model="loadingDialog.show" persistent width="400">
			<v-card>
				<v-card-title class="text-subtitle-1">Đang tải dữ liệu tất cả các khối...</v-card-title>
				<v-card-text>
					<div class="mb-3 text-body-2">
						Khối: <strong>{{ loadingDialog.currentName }}</strong>
						<!-- ({{ loadingDialog.current }}/{{ loadingDialog.total }}) -->
					</div>
					<v-progress-linear
						:model-value="loadingDialog.total ? (loadingDialog.current / loadingDialog.total) * 100 : 0"
						color="primary" rounded height="10" />
				</v-card-text>
			</v-card>
		</v-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	
		data() {
			return {
				vueData,
				DSKhoi: [],
				KhoiItem: null,
				DSKhenThuong: [],
				DSHocSinh_API_QLD: [],
				DSHocSinhQLD: [],
				isLoadingExportGiayKhen: false,
				loadingDialog: { show: false, total: 0, current: 0, currentName: '' },
				_loadGeneration: 0,
				DSSemester: [
					{ title: 'Cuối kì 2', value: 2 },
					{ title: 'Cả năm', value: 0 },
				],
				Semester: { title: 'Cuối kì 2', value: 2 },
			}
		},
	
		computed: {
			TitleCap() { return renderText(parseInt(vueData.CapID)) },
			TitlePage() { return getTitlePageByURL(window.location.pathname + window.location.search) },
		},
	
		watch: {
			'vueData.NienKhoa'() {
				this.KhoiItem = null
				this.DSHocSinhQLD = []
				vueData.DSHocSinhQLD = []
				this.getKhoi()
			},
			Semester() {
				this.DSHocSinhQLD = []
				vueData.DSHocSinhQLD = []
				if (this.KhoiItem?.isAll) this.getTongKetAllKhoi()
				else if (this.KhoiItem?.KhoiID) this.getTongKetByKhoi()
			},
			KhoiItem(v) {
				this.DSHocSinhQLD = []
				vueData.DSHocSinhQLD = []
				if (v?.isAll) this.getTongKetAllKhoi()
				else if (v?.KhoiID) this.getTongKetByKhoi()
			},
		},
	
		mounted() {
			this.ensureJExcelRuntimeState()
			this.getKhoi()
		},
	
		methods: {
			ensureJExcelRuntimeState() {
				if (!Array.isArray(vueData.DSHocSinhQLD)) vueData.DSHocSinhQLD = []
				if (!Array.isArray(vueData.columnHeader)) vueData.columnHeader = []
				if (!Array.isArray(vueData.DSHocSinhChange)) vueData.DSHocSinhChange = []
				if (!vueData.styleSheet) vueData.styleSheet = {}
				if (typeof vueData.keyComp !== 'number') vueData.keyComp = 0
				if (typeof vueData.freezeColumns !== 'number') vueData.freezeColumns = 4
			},
	
			setJExcelHeaders() {
				const headerDefault = [
					'STT',
					'TenLop',
					'HocSinhID',
					'HoTen',
					'NgaySinh',
					'Phai',
					'KT_Truong_XuatSac',
					'KT_Truong_TieuBieu',
					'ThuKhen',
					'NoiDungThuKhen',
					'ThanhTichKhac',
					'DanhHieu',
					'VaoSoKT',
					'SoQuyetDinhKT',
					'NgayKhenThuong_VI',
					'NgayKhenThuong_EN',
					'NgayKhenThuong_ThuKhen_VI',
					'NgayKhenThuong_ThuKhen_EN',
					'Is_DaIn',
				]
	
				const columnMapping = {
					STT: { width: 1, type: 'hidden' },
					TenLop: { width: 60, title: 'Tên lớp' },
					HocSinhID: { width: 80, title: 'Mã học sinh' },
					HoTen: { width: 220, align: 'left', title: 'Họ tên' },
					NgaySinh: { width: 100, title: 'Ngày sinh' },
					Phai: { width: 50 },
					KT_Truong_XuatSac: { width: 60, title: 'Xuất sắc' },
					KT_Truong_TieuBieu: { width: 80, title: 'Tiêu biểu' },
					ThuKhen: { width: 80, title: 'Thư Khen' },
					NoiDungThuKhen: { width: 400, title: 'Nội dung thư khen' },
					ThanhTichKhac: { width: 200, title: 'Thành tích khác' },
					DanhHieu: { width: 150, title: 'Danh hiệu' },
					VaoSoKT: { width: 100, title: 'Số vào sổ KT' },
					SoQuyetDinhKT: { width: 100, title: 'Số QĐ KT' },
					NgayKhenThuong_VI: { width: 150, title: 'Ngày KT - Giấy khen (VI)' },
					NgayKhenThuong_EN: { width: 150, title: 'Ngày KT - Giấy khen (EN)' },
					NgayKhenThuong_ThuKhen_VI: { width: 150, title: 'Ngày KT - Thư khen (VI)' },
					NgayKhenThuong_ThuKhen_EN: { width: 150, title: 'Ngày KT - Thư khen (EN)' },
					Is_DaIn: { width: 1, type: 'hidden' },
				}
	
				vueData.columnHeader = headerDefault.map(key => ({
					type: 'text',
					title: key,
					name: key,
					width: 40,
					backGroundColor: null,
					wrap: true,
					align: 'center',
					readOnly: true,
					style: 'font-size:8px',
					...columnMapping[key],
				}))
	
				vueData.keyComp += 1
			},
	
			extractList(res) {
				if (Array.isArray(res)) return res
				return res?.data ?? []
			},

			hasValue(value) {
				return value !== null && value !== undefined && String(value).trim() !== ''
			},

			sortByVaoSoKTIfNeeded(list) {
				if (!Array.isArray(list) || list.length === 0) return list
				const hasVaoSoKT = list.some(item => this.hasValue(item?.VaoSoKT))
				if (!hasVaoSoKT) return list

				return list
					.map((item, index) => ({ item, index }))
					.sort((a, b) => {
						const aRaw = a.item?.VaoSoKT
						const bRaw = b.item?.VaoSoKT
						const aHas = this.hasValue(aRaw)
						const bHas = this.hasValue(bRaw)

						if (!aHas && !bHas) return a.index - b.index
						if (!aHas) return 1
						if (!bHas) return -1

						const aValue = String(aRaw).trim()
						const bValue = String(bRaw).trim()
						const compare = aValue.localeCompare(bValue, 'vi', { numeric: true, sensitivity: 'base' })
						if (compare !== 0) return compare
						return a.index - b.index
					})
					.map(x => x.item)
			},
	
			async getKhoi() {
				const res = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
					CapID: vueData.CapID,
					NienKhoa: vueData.NienKhoa,
					HocKi: this.Semester.value,
				})
				this.DSKhoi = [
					{ TenKhoiHoc: 'Tất cả các khối', KhoiID: '__all__', isAll: true },
					...this.extractList(res),
				]
			},
	
			async getKhenThuong(khoiID) {
				if (!khoiID) {
					this.DSKhenThuong = []
					return
				}
				const res = await fetchPromise('lms/KhenThuong_Get_By_KhoiID', {
					KhoiID: khoiID,
					NienKhoa: vueData.NienKhoa,
				})
				this.DSKhenThuong = this.extractList(res)
			},
	
			async getTongKetAllKhoi() {
				const generation = ++this._loadGeneration
				const realKhoi = this.DSKhoi.filter(k => !k.isAll && k.KhoiID)
				if (realKhoi.length === 0) return
				this.loadingDialog = { show: true, total: realKhoi.length, current: 0, currentName: '' }
				const results = []
				for (const khoi of realKhoi) {
					if (generation !== this._loadGeneration) { this.loadingDialog.show = false; return }
					this.loadingDialog.currentName = khoi.TenKhoiHoc
					const [khenThuongRes, tongKetRes] = await Promise.all([
						fetchPromise('lms/KhenThuong_Get_By_KhoiID', {
							KhoiID: khoi.KhoiID,
							NienKhoa: vueData.NienKhoa,
						}, { silent: true }),
						fetchPromise(`/psmark1/LMS_GetBangTongHopKetQua_TheoKhoi?KhoiID=${khoi.KhoiID}&=&KyDanhGia=4&NamHoc=${vueData.NienKhoa}`, {}, { silent: true }),
					])
					if (generation !== this._loadGeneration) { this.loadingDialog.show = false; return }
					results.push({
						dsKhenThuong: this.extractList(khenThuongRes),
						dsTongKet: this.extractList(tongKetRes).sort((a, b) => (a.Sort ?? 0) - (b.Sort ?? 0)),
					})
					this.loadingDialog.current += 1
				}
				if (generation !== this._loadGeneration) { this.loadingDialog.show = false; return }
				this.loadingDialog.show = false
				this.DSKhenThuong = results.flatMap(r => r.dsKhenThuong)
				this.DSHocSinh_API_QLD = results.flatMap(r => r.dsTongKet)
				this.renderDSHocSinhQLD()
			},

			async getTongKetByKhoi() {
				const generation = ++this._loadGeneration
				const khoiID = this.KhoiItem?.KhoiID
				if (!khoiID || khoiID === '__all__') return
				await this.getKhenThuong(khoiID)
				if (generation !== this._loadGeneration) return
				const url = `/psmark1/LMS_GetBangTongHopKetQua_TheoKhoi?KhoiID=${khoiID}&=&KyDanhGia=4&NamHoc=${vueData.NienKhoa}`
				const res = await fetchPromise(url)
				if (generation !== this._loadGeneration) return
				const list = this.extractList(res).sort((a, b) => (a.Sort ?? 0) - (b.Sort ?? 0))
				this.DSHocSinh_API_QLD = list
				this.renderDSHocSinhQLD()
			},
	
			renderDSHocSinhQLD() {
				const dsHocSinhID = [...new Set(this.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
				const data = []
				for (const hocSinhID of dsHocSinhID) {
					const hocSinhApi = this.DSHocSinh_API_QLD.find(x => x.HocSinhID === hocSinhID)
					const hocSinhKhenThuong = this.DSKhenThuong.find(x => x.HocSinhID === hocSinhID)
					if (!hocSinhApi) continue
					let thuKhen = 'x'
					if (hocSinhApi.KT_Truong_XuatSac === 'x' || hocSinhKhenThuong?.HocSinhTieuBieu) {
						thuKhen = ''
					}
					data.push({
						STT: hocSinhApi.STT,
						TenLop: hocSinhApi.TenLop ?? '',
						HocSinhID: hocSinhApi.HocSinhID,
						HoTen: hocSinhApi.HoTen,
						NgaySinh: hocSinhApi.NgaySinh,
						Phai: hocSinhApi.Phai,
						KT_Truong_XuatSac: hocSinhApi.KT_Truong_XuatSac,
						KT_Truong_TieuBieu: hocSinhKhenThuong?.HocSinhTieuBieu ? 'x' : '',
						ThuKhen: thuKhen,
						DanhHieu: hocSinhApi.DanhHieu,
						NoiDungThuKhen: hocSinhKhenThuong?.NoiDungThuKhen,
						ThanhTichKhac: hocSinhKhenThuong?.ThanhTichKhac,
						VaoSoKT: hocSinhKhenThuong?.VaoSoKT,
						SoQuyetDinhKT: hocSinhKhenThuong?.SoQuyetDinhKT,
						NgayKhenThuong_VI: hocSinhKhenThuong?.NgayKhenThuong_VI,
						NgayKhenThuong_EN: hocSinhKhenThuong?.NgayKhenThuong_EN,
						NgayKhenThuong_ThuKhen_VI: hocSinhKhenThuong?.NgayKhenThuong_ThuKhen_VI,
						NgayKhenThuong_ThuKhen_EN: hocSinhKhenThuong?.NgayKhenThuong_ThuKhen_EN,
						Is_DaIn: hocSinhKhenThuong?.Is_DaIn,
					})
				}
				const sortedData = this.sortByVaoSoKTIfNeeded(data)
				this.DSHocSinhQLD = sortedData
				vueData.DSHocSinhQLD = sortedData
				this.setJExcelHeaders()
			},
	
			exportExcel() {
				const headers = [
					'TenLop',
					'HocSinhID',
					'HoTen',
					'NgaySinh',
					'Phai',
					'KT_Truong_XuatSac',
					'KT_Truong_TieuBieu',
					'ThuKhen',
					'NoiDungThuKhen',
					'ThanhTichKhac',
					'DanhHieu',
					'VaoSoKT',
					'SoQuyetDinhKT',
					'NgayKhenThuong_VI',
					'NgayKhenThuong_EN',
					'NgayKhenThuong_ThuKhen_VI',
					'NgayKhenThuong_ThuKhen_EN',
				]
				const sheetData = this.DSHocSinhQLD.map(item => headers.map(h => item[h] ?? ''))
				const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sheetData])
				const workbook = XLSX.utils.book_new()
				XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
				XLSX.writeFile(workbook, 'DanhSachKhenThuong.xlsx')
			},
	
			async getFontBase64(url) {
				const res = await fetch(url)
				const blob = await res.blob()
				return new Promise((resolve, reject) => {
					const reader = new FileReader()
					reader.onloadend = () => {
						resolve((reader.result || '').split(',')[1])
					}
					reader.onerror = reject
					reader.readAsDataURL(blob)
				})
			},
	
			async exportThuKhen() {
				const dsThuKhen = this.DSHocSinhQLD.filter(x => (x.NoiDungThuKhen || '').trim())
				if (dsThuKhen.length === 0) {
					this.snackbarRef.value.showSnackbar({
						message: 'Không có nội dung thư khen để export',
						color: 'warning',
					})
					return
				}
	
				// const base64 = await this.getFontBase64('/_cdn/lhbs-lms/00085-UTM-EdwardianKT.ttf')
				// pdfMake.vfs = pdfMake.vfs || {}
				// pdfMake.vfs['UTM-EdwardianKT.ttf'] = base64
				// pdfMake.fonts = {
				// 	UTM_Edwardian: {
				// 		normal: 'UTM-EdwardianKT.ttf',
				// 		bold: 'UTM-EdwardianKT.ttf',
				// 		italics: 'UTM-EdwardianKT.ttf',
				// 		bolditalics: 'UTM-EdwardianKT.ttf',
				// 	},
				// }
	
				const base64 = await this.getFontBase64('/_cdn/lhbs-lms/00085-UTM-EdwardianKT.ttf')
				const base64Times = await this.getFontBase64('/_cdn/lhbs-lms/times.ttf')
	
				pdfMake.vfs = pdfMake.vfs || {}
	
				pdfMake.vfs['UTM-EdwardianKT.ttf'] = base64
				pdfMake.vfs['times.ttf'] = base64Times
	
				pdfMake.fonts = {
					...pdfMake.fonts,
	
					UTM_Edwardian: {
						normal: 'UTM-EdwardianKT.ttf',
						bold: 'UTM-EdwardianKT.ttf',
						italics: 'UTM-EdwardianKT.ttf',
						bolditalics: 'UTM-EdwardianKT.ttf',
					},
	
					TimesNewRoman: {
						normal: 'times.ttf',
						bold: 'times.ttf',
						italics: 'times.ttf',
						bolditalics: 'times.ttf',
					},
				}
	
	
				const content = []
				for (const data of dsThuKhen) {
					let splitNoiDung = data.NoiDungThuKhen?.split('\n') ?? []
					splitNoiDung = splitNoiDung.filter(x => x !== '')
					if (splitNoiDung.length === 0) continue
					let marginTop = 220
					const soTu = splitNoiDung[0]?.split(' ').length ?? 0
					const soDong = soTu / 11
					if (soDong > 6) marginTop = 180
					else if (soDong > 5) marginTop = 200
	
					const noiDungThuKhen = splitNoiDung.map(noidung => ({
						text: `\t\t\t${String(noidung || '')
							.replace(/–/g, '-')
							.replace(/—/g, '-')}`,
						font: 'UTM_Edwardian',
						alignment: 'justify',
						margin: [55, 0, 55, 0],
						style: 'title',
						preserveLeadingSpaces: true,
					}))
	
					content.push({
						text: `Học sinh: ${data.HoTen} lớp ${String(data.TenLop || '').substring(1, 4)}`,
						font: 'UTM_Edwardian',
						style: 'title',
						margin: [0, marginTop, 0, 0],
					})
					content.push({ text: '', margin: [0, 10, 0, 0] })
					content.push(noiDungThuKhen)
					const ngayKT = data.NgayKhenThuong_ThuKhen_VI ? data.NgayKhenThuong_ThuKhen_VI.charAt(0).toLowerCase() + data.NgayKhenThuong_ThuKhen_VI.slice(1) : ''
					if (data.NgayKhenThuong_ThuKhen_VI) {
						content.push({
							text: `Trấn Biên, ${ngayKT}`,
							font: 'TimesNewRoman',
							style: 'title',
							absolutePosition: {
								x: 280,
								y: 640
							},
							fontSize: 15
						})
					}
					content.push({ text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] })
				}
	
				if (content.length === 0) {
					this.snackbarRef.value.showSnackbar({
						message: 'Không có nội dung thư khen hợp lệ để export',
						color: 'warning',
					})
					return
				}
	
				const dd = {
					pageSize: 'A4',
					content: content.slice(0, -1),
					styles: {
						title: {
							fontSize: 24,
							alignment: 'center',
						},
					},
					defaultStyle: {
						font: 'UTM_Edwardian',
					},
				}
				pdfMake.createPdf(dd).open()
			},
	
			async exportGiayKhen() {
				this.isLoadingExportGiayKhen = true
				const dsDanhHieu = [
					{
						DanhHieu_VI: 'Học sinh Xuất sắc',
						DanhHieu_EN: 'In recognition of outstanding academic achievement',
					},
					{
						DanhHieu_VI: 'Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện',
						DanhHieu_EN: 'In recognition of excellent academic and personal achievement',
					},
					{
						DanhHieu_VI: 'Học sinh Giỏi',
						DanhHieu_EN: 'In recognition of excellent academic achievement',
					},
				]
	
				const certs = []
				for (const data of this.DSHocSinhQLD.filter(x => (x.DanhHieu || '').length > 0)) {
					const objDanhHieu = dsDanhHieu.find(x => x.DanhHieu_VI === data.DanhHieu)
					certs.push({
						KhenTang_Vi: 'Khen tặng học sinh',
						KhenTang_En: 'This certificate is proudly presented to',
						HoTen: String(data.HoTen || '').toUpperCase(),
						Lop: `Lớp/ Class ${(data.TenLop || '').replace(/^0+/, '')}`,
						DanhHieu_Vi: `Đạt danh hiệu ${data.DanhHieu || ''}`,
						DanhHieu_En: objDanhHieu?.DanhHieu_EN ?? '',
						NamHoc_Vi: `Năm học/ School Year ${vueData.NienKhoa} - ${vueData.NienKhoa + 1}`,
						NamHoc_En: ``,
						NgayThangNam_Vi: data.NgayKhenThuong_VI ?? '',
						NgayThangNam_En: data.NgayKhenThuong_EN ?? '',
						SoQuyetDinh: `${data.SoQuyetDinhKT ?? ''}/QĐ-SNLH. NO: ${String(data.VaoSoKT ?? '').padStart(2, '0')}`,
						TenHieuTruong: 'Hoàng Thị Diễm Trang',
					})
				}
	
				try {
					const response = await fetch('https://gencert.iotsoftvn.com/api/cert-generators/multi-pdf', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ Certs: certs }),
					})
					const blob = await response.blob()
					const url = window.URL.createObjectURL(blob)
					const link = document.createElement('a')
					link.href = url
					link.download = 'DanhSachGiayKhen.pdf'
					document.body.appendChild(link)
					link.click()
					link.remove()
				} catch (error) {
					this.snackbarRef.value.showSnackbar({ message: 'Export Giấy khen thất bại', color: 'error' })
				} finally {
					this.isLoadingExportGiayKhen = false
				}
			},
		},
	}
</script>