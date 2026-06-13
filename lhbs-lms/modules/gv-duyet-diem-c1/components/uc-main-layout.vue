<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>{{ TitlePage }} • {{ TitleCap }}</v-card-title>
				<v-card-text>
					<v-row align="center">
						<v-col cols="12" sm="3">
							<v-select v-model="KhoiItem" label="Chọn khối" :items="DSKhoi" item-title="TenKhoiHoc"
								item-value="KhoiID" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" :disabled="!KhoiItem" return-object />
						</v-col>
						<v-col cols="12" sm="3">
							<v-select v-model="Semester" label="Chọn học kì" :items="DSSemester" item-title="title"
								item-value="value" :disabled="!LopItem" return-object />
						</v-col>
						<v-col cols="12" sm="3" class="d-flex align-center ga-2 flex-wrap">
							<v-btn variant="outlined" color="primary" prepend-icon="mdi-refresh"
								:disabled="!LopItem || !Semester" @click="getData(true)">
								Làm mới
							</v-btn>
						</v-col>
					</v-row>

					<v-row v-if="DSHocSinh.length > 0" align="center" class="mt-2">
						<v-col class="d-flex align-center ga-2 flex-wrap">
							<span class="text-subtitle-1 font-weight-medium text-primary">Giáo viên duyệt điểm</span>
							<v-chip v-if="reasonRejectInfo.disabled" size="small" color="error" variant="tonal">
								Lý do từ chối: <span class="text-red ml-1">{{ reasonRejectInfo.NoiDungNhanXet }}</span>
							</v-chip>
							<v-spacer />
							<v-btn color="error" variant="outlined" prepend-icon="mdi-cancel"
								:disabled="DSHocSinh.length === 0" @click="openDialogReject">
								Từ chối bộ môn
							</v-btn>
							<v-btn color="primary" variant="outlined" prepend-icon="mdi-send"
								:disabled="DSHocSinh.length === 0" @click="onGuiToTruong">
								Gửi Tổ trưởng
							</v-btn>
							<v-btn color="teal" variant="outlined" prepend-icon="mdi-file-pdf-box"
								:disabled="DSHocSinh.length === 0" @click="onExportPDF">
								Xuất file PDF
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />

		<uc-table v-model="DSHocSinh" />

		<!-- Dialog Từ chối bộ môn -->
		<uc-dialog v-model="IsShowDialogReject" title="Lý do từ chối" doneText="Xác nhận" @onSubmit="onConfirmReject">
			<v-card-text class="pt-2">
				<v-select v-model="MonHocItemList" multiple label="Chọn môn học" :items="DSMonHoc"
					item-title="TenMonHoc_HienThi" item-value="MonHocLopID" class="mb-4">
					<template v-slot:selection="{ item, index }">
						<v-chip v-if="index < 3" :text="item.raw?.TenMonHoc_HienThi || item.title" color="primary"
							size="small" class="mr-1"></v-chip>
						<span v-if="index === 3" class="text-grey text-caption align-self-center">
							(+{{ MonHocItemList.length - 3 }} môn học khác)
						</span>
					</template>
				</v-select>
				<v-textarea v-model="ReasonReject" placeholder="Nhập lý do từ chối..." rows="4" />
			</v-card-text>
		</uc-dialog>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	data() {
		return {
			vueData,
			KhoiItem: null,
			LopItem: null,
			Semester: null,
			DSKhoi: [],
			DSLop: [],
			DSMonHoc: [],
			DSHocSinh: [],
			DSHocSinh_API: [],
			DSSemester: [
				{ title: "Giữa kì 1", value: "GK_HK1" },
				{ title: "Cuối kì 1", value: "CK_HK1" },
				{ title: "Giữa kì 2", value: "GK_HK2" },
				{ title: "Cuối kì 2", value: "CK_HK2" }
			],
			IsShowDialogReject: false,
			MonHocItemList: [],
			ReasonReject: ''
		}
	},
	computed: {
		TitleCap() {
			return renderText(parseInt(vueData.CapID))
		},
		TitlePage() {
			return getTitlePageByURL(window.location.pathname + window.location.search)
		},
		reasonRejectInfo() {
			let defaultObj = {
				disabled: false,
				NoiDungNhanXet: null
			}
			if (!this.Semester?.value || !this.DSHocSinh_API.length) return defaultObj
			const DSHocSinh_Semester = this.DSHocSinh_API.filter(x => x.MaCotDiem.includes(this.Semester.value))
			if (DSHocSinh_Semester.length > 0) {
				const obj = DSHocSinh_Semester.find(x => x.TinhTrang === 3)
				defaultObj.disabled = obj ? true : false
				defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
			}
			return defaultObj
		}
	},
	watch: {
		'vueData.NienKhoa'() {
			this.resetFilters()
			this.getKhoi(true)
		},
		KhoiItem(val) {
			this.LopItem = null
			this.Semester = null
			this.DSLop = []
			this.DSMonHoc = []
			this.DSHocSinh = []
			this.DSHocSinh_API = []
			this.MonHocItemList = []
			this.ReasonReject = ''
			if (val) {
				this.getLop(true)
			}
		},
		LopItem(val) {
			this.Semester = null
			this.DSMonHoc = []
			this.DSHocSinh = []
			this.DSHocSinh_API = []
			this.MonHocItemList = []
			this.ReasonReject = ''
		},
		Semester(val) {
			this.DSHocSinh = []
			this.DSHocSinh_API = []
			this.MonHocItemList = []
			this.ReasonReject = ''
			if (this.LopItem && val) {
				this.getData()
			}
		}
	},
	mounted() {
		this.getKhoi()
		if (window.pdfMake) {
			window.pdfMake.fonts = {
				Roboto: {
					normal: 'Roboto-Regular.ttf',
					bold: 'Roboto-Medium.ttf',
					italics: 'Roboto-Italic.ttf',
					bolditalics: 'Roboto-MediumItalic.ttf'
				},
				times: {
					normal: 'times.ttf',
					bold: 'timesbd.ttf',
					italics: 'timesbi.ttf',
					bolditalics: 'timesi.ttf',
				}
			}
		}
	},
	methods: {
		resetFilters() {
			this.KhoiItem = null
			this.LopItem = null
			this.Semester = null
			this.DSKhoi = []
			this.DSLop = []
			this.DSMonHoc = []
			this.DSHocSinh = []
			this.DSHocSinh_API = []
			this.MonHocItemList = []
			this.ReasonReject = ''
		},
		async getKhoi(forceRefresh = false) {
			this.DSKhoi = await fetchPromise('lms/KhoiHocByCapHoc_Get', {
				CapID: vueData.CapID,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem?.HocKi
			}, { forceRefresh })
		},
		async getLop(forceRefresh = false) {
			if (!this.KhoiItem?.KhoiID) return
			this.DSLop = await fetchPromise('lms/Lop_Get_ByKhoiID', {
				KhoiID: this.KhoiItem.KhoiID,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem?.HocKi
			}, { forceRefresh })
		},
		async getData(forceRefresh = false) {
			if (!this.LopItem?.LopID || !this.Semester?.value) return
			const res = await fetchPromise('lms/HocSinhBangDiem_TT_BGH_Get', {
				NienKhoa: vueData.NienKhoa,
				LopID: this.LopItem.LopID,
				Semester: this.Semester.value
			}, { forceRefresh, cache: !forceRefresh })

			this.DSHocSinh_API = res ?? []
			this.renderDSHocSinh()
			this.renderDSMonHoc()
		},
		renderDSHocSinh() {
			const _dsHocSinh = []
			const dsHocSinhID = [...new Set(this.DSHocSinh_API.map(x => x.HocSinhID))]
			for (const HocSinhID of dsHocSinhID) {
				const objHocSinh = this.DSHocSinh_API.find(x => x.HocSinhID === HocSinhID)
				if (objHocSinh) {
					const DSCotDiem = this.DSHocSinh_API.filter(x => x.HocSinhID === HocSinhID)
					_dsHocSinh.push({
						...objHocSinh,
						DSCotDiem,
						headers: this.computeHeaders(DSCotDiem),
						items: this.computeItems(DSCotDiem)
					})
				}
			}
			this.DSHocSinh = _dsHocSinh
		},
		computeHeaders(DSCotDiem) {
			const headers = []
			const ignoreColumns = [
				"DiemGK_Doc_HK1",
				"DiemGK_Viet_HK1",
				"DiemCK_Doc_HK1",
				"DiemCK_Viet_HK1"
			];
			const noiDungDanhGia = [
				{
					title: "Nội dung đánh giá",
					key: "TenMonHoc_HienThi",
					minWidth: 400,
					left: true,
					fixed: true
				}
			]

			const Semester = this.Semester
			if (!Semester?.value) return noiDungDanhGia

			const getKi = Semester.value.split('_')[0]
			const uniqueMaCotDiemHeaders = [...new Set(DSCotDiem.map(x => x.MaCotDiem))]
			const listMaCotDiem = ['MucDoDanhGia', 'Diem', 'Sao', 'NhanXet'];

			let filteredMaCotDiemHeaders = uniqueMaCotDiemHeaders.filter(MaCotDiem =>
				listMaCotDiem.some(prefix =>
					MaCotDiem.startsWith(prefix) &&
					MaCotDiem.includes(getKi) &&
					!ignoreColumns.includes(MaCotDiem)
				)
			);
			filteredMaCotDiemHeaders = filteredMaCotDiemHeaders.sort((a, b) => {
				const getKey = (s) => listMaCotDiem.findIndex(k => s.startsWith(k));
				return getKey(a) - getKey(b);
			});
			for (const MaCotDiem of filteredMaCotDiemHeaders) {
				const objHeader = DSCotDiem.find(x => x.MaCotDiem === MaCotDiem);
				if (objHeader) {
					headers.push({
						title: objHeader.TenCotDiem_VI,
						key: objHeader.MaCotDiem,
						minWidth: objHeader.WidthCSS,
						align: (objHeader.GiaTriCotDiem === 'number' || objHeader.MaCotDiem.includes('MucDoDanhGia')) ? 'center' : "left"
					});
				}
			}
			return [...noiDungDanhGia, ...headers, { title: "Lịch sử chỉnh sửa", key: "log", align: 'center' }]
		},
		computeItems(DSCotDiem) {
			const items = []
			const uniqueMonHocID = [...new Set(DSCotDiem.map(x => x.MonHocID))]
			if (!this.Semester?.value) return items

			for (const MonHocID of uniqueMonHocID) {
				const obj = {}
				const objMonHoc = DSCotDiem.find(x => x.MonHocID === MonHocID)
				if (objMonHoc) {
					const arrCotDiemFilter = DSCotDiem.filter(x => x.MonHocID === MonHocID && x.MaCotDiem.includes(this.Semester.value))
					for (const CotDiem of arrCotDiemFilter) {
						obj[CotDiem.MaCotDiem] = CotDiem.KetQuaDanhGia_VI || CotDiem.KetQuaDanhGia_EN
					}
					if (arrCotDiemFilter.length > 0) {
						obj.TinhTrang = arrCotDiemFilter[0].TinhTrang
						obj.TenTinhTrang = arrCotDiemFilter[0].TenTinhTrang
						obj.MauTinhTrang = arrCotDiemFilter[0].MauTinhTrang
					}
					items.push({
						...obj,
						TenMonHoc_HienThi: objMonHoc.TenMonHoc_HienThi,
						NhapDiemUser: objMonHoc.NhapDiemUser,
						NhapDiemTime: objMonHoc.NhapDiemTime,
						LopID: this.LopItem?.LopID,
						MaNhomCotDiem: this.Semester.value,
						HocSinhID: objMonHoc.HocSinhID,
						MonHocID: MonHocID,
						Count_Log_Diem: objMonHoc.Count_Log_Diem
					})
				}
			}
			return items
		},
		renderDSMonHoc() {
			const uniqueMonHocID = [...new Set(this.DSHocSinh_API.map(x => x.MonHocID))]
			const DSMonHoc = []
			for (const MonHocID of uniqueMonHocID) {
				const obj = this.DSHocSinh_API.find(x => x.MonHocID === MonHocID)
				if (obj) {
					DSMonHoc.push({
						TenMonHoc_HienThi: obj.TenMonHoc_HienThi,
						MonHocLopID: obj.MonHocLopID
					})
				}
			}
			this.DSMonHoc = DSMonHoc
		},
		openDialogReject() {
			this.MonHocItemList = []
			this.ReasonReject = ''
			this.IsShowDialogReject = true
		},
		async onConfirmReject() {
			if (!this.MonHocItemList || this.MonHocItemList.length === 0) {
				this.snackbarRef.value.showSnackbar({
					message: 'Vui lòng chọn ít nhất một môn học',
					color: 'warning'
				})
				return
			}
			if (!this.ReasonReject || !this.ReasonReject.trim()) {
				this.snackbarRef.value.showSnackbar({
					message: 'Vui lòng nhập lý do từ chối',
					color: 'warning'
				})
				return
			}

			const ok = await this.confirmRef.value.show({
				title: 'Xác nhận lý do từ chối bộ môn?'
			})
			if (!ok) return

			const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp', {
				NienKhoa: vueData.NienKhoa,
				LopID: this.LopItem.LopID,
				TinhTrang: 3,
				Suffix_Semester: this.Semester.value,
				List_MonHocLopID: this.MonHocItemList.join(','),
				ReasonReject: this.ReasonReject
			}, { cache: false })

			if (res || res?.status === 'success') {
				this.snackbarRef.value.showSnackbar({
					message: 'Từ chối thành công',
					color: 'success'
				})
				this.IsShowDialogReject = false
				this.getData(true)
			}
		},
		async onGuiToTruong() {
			const ok = await this.confirmRef.value.show({
				title: 'Xác nhận gửi điểm Ban Giám Hiệu?'
			})
			if (!ok) return

			const res = await fetchPromise('lms/KQHT_MonHocLop_TinhTrang_Udp', {
				NienKhoa: vueData.NienKhoa,
				LopID: this.LopItem.LopID,
				TinhTrang: 4,
				Suffix_Semester: this.Semester.value
			}, { cache: false })

			if (res || res?.status === 'success') {
				this.snackbarRef.value.showSnackbar({
					message: 'Gửi Tổ trưởng thành công',
					color: 'success'
				})
				this.getData(true)
			}
		},
		async onExportPDF() {
			const logoUrl = window.location.origin + '/_cdn/lhbs-lms/logo_lhbs_2.jpg';
			let logoBase64 = ''
			try {
				logoBase64 = await this.getBase64FromUrl(logoUrl)
			} catch (e) {
				console.error("Không thể tải logo", e)
			}
			
			const content = []
			const lopItem = this.LopItem
			for (const hocSinh of this.DSHocSinh) {
				const IMG = {
					image: 'logo',
					width: 64,
					height: 64,
				}
				const PROFILE = {
					text: [
						'Học sinh: ',
						{
							text: hocSinh.HoTen + '\t\t\t',
							bold: true,
							margin: [0, 0, 20, 0]
						},
						'Lớp: ',
						{
							text: lopItem?.TenLop,
							bold: true
						}
					],
					alignment: "center",
					fontSize: 14,
					margin: [0, 20, 0, 0]
				}
				
				const columns = []
				if (logoBase64) {
					columns.push(IMG)
				}
				columns.push(PROFILE)
				
				const HEADER = {
					alignment: "center",
					columns: columns
				}
				const TITLE = {
					text: [
						"BẢNG ĐIỂM ",
						{
							text: this.Semester?.title?.toUpperCase()
						}
					],
					bold: true,
					fontSize: 20,
					alignment: "center",
					margin: [0, 10, 0, 10]
				}
				const pageBreak = { text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] }
				const margins = { text: '', fontSize: 14, bold: true, margin: [0, 0, 0, 12] }
				
				content.push(HEADER)
				content.push(TITLE)
				content.push(margins)
				
				const HEADER_TABLE = [
					{ text: "Nội dung đánh giá", border: [true, true, true, true], alignment: "center", bold: true },
					{ text: "Mức đạt được", border: [true, true, true, true], alignment: "center", bold: true },
					{ text: "Điểm", border: [true, true, true, true], alignment: "center", bold: true },
					{ text: "Sao", border: [true, true, true, true], alignment: "center", bold: true },
					{ text: "Nhận xét", border: [true, true, true, true], alignment: "left", bold: true },
				]
				const CONTENT_TABLE = []
				const dsMonHocID = [...new Set(hocSinh.DSCotDiem.map(x => x.MonHocID))]
				for (const MonHocID of dsMonHocID) {
					let dsCotDiem = hocSinh.DSCotDiem.filter(x => x.MonHocID === MonHocID)
					const TenMonHoc = hocSinh.DSCotDiem.find(x => x.MonHocID === MonHocID)
					
					const columnNoiDung = {
						text: TenMonHoc?.TenMonHoc_HienThi ?? '',
						border: [true, true, true, true]
					}
					const MucDoDanhGiaObj = dsCotDiem.find(x => x.MaCotDiem.includes('MucDoDanhGia'))
					const columnMucDoDatDuoc = {
						text: MucDoDanhGiaObj?.KetQuaDanhGia_VI ?? '',
						border: [true, true, true, true],
						alignment: 'center'
					}
					const DiemObj = dsCotDiem.find(x => x.MaCotDiem.includes('Diem'))
					const columnDiem = {
						text: DiemObj?.KetQuaDanhGia_VI ?? '',
						border: [true, true, true, true],
						alignment: 'center'
					}
					const SaoObj = dsCotDiem.find(x => x.MaCotDiem.includes('Sao'))
					const columnQuyDoiSao = {
						text: SaoObj?.KetQuaDanhGia_VI ?? '',
						border: [true, true, true, true],
						alignment: 'center'
					}
					const NhanXetObj = dsCotDiem.find(x => x.MaCotDiem.includes('NhanXet'))
					const columnNhanXet = {
						text: NhanXetObj?.KetQuaDanhGia_VI ?? '',
						border: [true, true, true, true],
						alignment: 'left'
					}
					CONTENT_TABLE.push([columnNoiDung, columnMucDoDatDuoc, columnDiem, columnQuyDoiSao, columnNhanXet])
				}
				
				const TABLE = {
					table: {
						widths: [100, 80, 50, 50, '*'],
						body: [
							HEADER_TABLE,
							...CONTENT_TABLE
						]
					}
				}
				content.push(TABLE)
				content.push(pageBreak)
			}
			
			let val = {
				content: content.slice(0, -1)
			}
			var dd = {
				pageSize: "A4",
				content: val.content,
				images: logoBase64 ? { logo: logoBase64 } : {},
				styles: {},
				defaultStyle: {
					fontSize: 12,
					font: 'times'
				}
			};
			if (window.pdfMake) {
				const pdf = window.pdfMake.createPdf(dd);
				pdf.print()
			}
		},
		async getBase64FromUrl(url) {
			const data = await fetch(url);
			const blob = await data.blob();
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onloadend = () => {
					resolve(reader.result);
				};
				reader.onerror = reject;
			});
		}
	}
	}
</script>