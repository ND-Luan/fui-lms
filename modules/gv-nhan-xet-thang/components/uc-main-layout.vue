<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title>
					{{ TitlePage }} • {{ TitleCap }}
					<div v-if="ThangObj">
						<v-chip :color="ThangObj?.MauTinhTrang">{{ ThangObj?.TenTinhTrang }}</v-chip>
					</div>
				</v-card-title>
				<v-card-text>
					<v-row>
						<v-col cols="3">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" return-object />
						</v-col>
						<v-col cols="3">
							<v-select v-model="ThangObj" label="Chọn tháng" :items="DSThang"
								item-title="Thang_HienThi_VI" item-value="Lop_NhanXetThangID" return-object>
								<template v-slot:item="{ props, item }">
									<v-list-item v-bind="props" :title="item.raw.Thang_HienThi_VI">
										<template #append>
											<v-chip :color="item.raw.MauTinhTrang">{{ item.raw.TenTinhTrang }}</v-chip>
										</template>
									</v-list-item>
								</template>
							</v-select>
						</v-col>
						<v-col class="d-flex ga-2">
							<v-menu>
								<template v-slot:activator="{ props }">
									<v-btn color="primary" v-bind="props" variant="outlined">Thao tác</v-btn>
								</template>
								<v-list>
									<v-list-item title="Làm mới" @click="onRefresh" />
									<v-list-item v-if="ThangObj?.TinhTrang === 0 || ThangObj?.TinhTrang === 1"
										title="Lưu tạm tất cả" @click="onSave" />
									<v-list-item v-if="ThangObj?.TinhTrang === 1" title="Gửi tổ trưởng"
										@click="onSendToTruong" />
									<v-list-item v-if="ThangObj?.TinhTrang === 0 || ThangObj?.TinhTrang === 1"
										title="Import Excel" @click="onImport" />
								</v-list>
							</v-menu>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />
		<v-data-table :headers="headers" :items="items" items-per-page="-1" hide-default-footer
			style="max-height: calc(100dvh - 200px); overflow-y: auto;">

			<!-- ─── Học sinh ─── -->
			<template #item.HocSinh="{ item }">
				<uc-info-student :item="item" />
			</template>

			<!-- ─── GVCN view: Phối hợp + các trường phụ ─── -->
			<template #item.gvcn_extra="{ item }">
				<div class="d-flex ga-2 flex-column pa-2">
					<v-select v-model="item.PhoiHopCMHS" label="Phối hợp CMHS"
						:items="['Tốt', 'Đạt', 'Không đạt']" placeholder="Chọn"
						:disabled="isReadOnly" />
					<template v-if="!isKhoiCanLoai">
						<v-select v-model="item.PhanLoai_TuyenThang"
							:items="['Tuyển thẳng', 'Tuyển thẳng có cam kết']"
							label="Phân loại tuyển thẳng" :disabled="isReadOnly" />
						<v-text-field v-model="item.Flyers" label="Flyers" :disabled="isReadOnly" />
						<v-text-field v-model="item.DiemTA" label="Điểm Tiếng Anh" :disabled="isReadOnly" />
						<v-checkbox v-model="item.DKHocTiep" label="Đăng ký học tiếp" :disabled="isReadOnly" />
						<v-textarea v-model="item.DeXuat_NDCamKet" label="Đề xuất / ND cam kết"
							:hide-details="false" :disabled="isReadOnly" />
					</template>
				</div>
			</template>

			<template #item.NhanXetGVCN_VePhuHuynh_HTML="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'NhanXetGVCN_VePhuHuynh_HTML' + item.HocSinhID"
						v-model="item.NhanXetGVCN_VePhuHuynh_HTML" :spellcheck="false"
						:readOnly="isReadOnly" />
				</div>
			</template>

			<template #item.NhanXetGVCN_VeHocSinh_HTML="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'NhanXetGVCN_VeHocSinh_HTML' + item.HocSinhID"
						v-model="item.NhanXetGVCN_VeHocSinh_HTML" :spellcheck="false"
						:readOnly="isReadOnly" />
				</div>
			</template>

			<!-- ─── Cấp 1: Các cột nhận xét môn ─── -->
			<template #item.NhanXetToan_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'NhanXetToan_HTML' + item.HocSinhID"
						v-model="item.NhanXetToan_HTML" :spellcheck="false" style="height: 150px;"
						:readOnly="isReadOnly" />
					<v-text-field class="mt-2" v-model="item.DiemToan" placeholder="Nhập điểm..."
						messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false"
						suffix="Điểm" :readOnly="isReadOnly" solo reverse />
				</div>
			</template>

			<template #item.NhanXetTiengViet_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'NhanXetTiengViet_HTML' + item.HocSinhID"
						v-model="item.NhanXetTiengViet_HTML" :spellcheck="false" style="height: 150px;"
						:readOnly="isReadOnly" />
					<v-text-field class="mt-2" v-model="item.DiemTiengViet" placeholder="Nhập điểm..."
						messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false"
						suffix="Điểm" :readOnly="isReadOnly" solo reverse />
				</div>
			</template>

			<template #item.NhanXetMonHocKhac_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'NhanXetMonHocKhac_HTML' + item.HocSinhID"
						v-model="item.NhanXetMonHocKhac_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<template #item.HoatDongGiaoDucKhac_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'HoatDongGiaoDucKhac_HTML' + item.HocSinhID"
						v-model="item.HoatDongGiaoDucKhac_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<template #item.PhamChatNangLuc_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'PhamChatNangLuc_HTML' + item.HocSinhID"
						v-model="item.PhamChatNangLuc_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<!-- ─── Cấp 2 & 3: NgayNghi ─── -->
			<template #item.NgayNghi="{ item }">
				<div class="d-flex ga-2 flex-column" style="padding: 8px; min-width: 200px;">
					<div v-if="item.NgayNghi?.TongSoTiet > 0" class="d-flex justify-space-between align-center">
						<span class="font-weight-medium text-body-2">
							Tổng số tiết: {{ item.NgayNghi?.TongSoTiet }}
						</span>
						<v-btn icon="mdi-eye" size="small" variant="text" color="primary"
							:title="'Xem báo nghỉ chi tiết - ' + item.HoTen"
							:href="'/gv-xem-vang-tre-nghi-phep?hocsinhid=' + item.HocSinhID + '&lopid=' + item.LopID + '&ngaybatdau=' + item.firstDay + '&ngayketthuc=' + item.lastDay"
							target="_blank" />
					</div>
					<v-chip v-for="mon in item.NgayNghi?.MonVang" :key="mon.TenMonHoc"
						color="orange" size="small" style="width: fit-content;">
						{{ mon.TenMonHoc }}
					</v-chip>

					<template v-if="item.LoaiViPham_Group?.length > 0">
						<v-divider class="mt-2" />
						<span class="font-weight-medium text-body-2">Loại vi phạm</span>
						<div v-for="lvp in item.LoaiViPham_Group" :key="lvp.LoaiViPham">
							<div class="text-body-2 text-left">• {{ lvp.TenViPham }}</div>
							<div v-for="ngayVP in lvp.Ngay" :key="ngayVP.Ngay" class="text-body-2 text-left ml-2">
								<p>Ngày: {{ ngayVP.Ngay }}</p>
								<div v-for="ngay in ngayVP.DSNgay" :key="ngay.Buoi" class="ml-2">
									<p>{{ ngay.Buoi }}</p>
									<v-chip v-for="buoi in ngay.DS" :key="buoi.Tiet + buoi.TenMonHoc"
										class="mt-1" size="small" color="orange">
										Tiết: {{ buoi.Tiet }} - {{ buoi.TenMonHoc }}
									</v-chip>
								</div>
							</div>
						</div>
					</template>
				</div>
			</template>

			<!-- ─── Cấp 2 & 3: Cuối kỳ (T12, T5) ─── -->
			<template #item.UuDiem="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'UuDiem' + item.HocSinhID" v-model="item.UuDiem"
						:spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NhuocDiem="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'NhuocDiem' + item.HocSinhID" v-model="item.NhuocDiem"
						:spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.DeXuat="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'DeXuat' + item.HocSinhID" v-model="item.DeXuat"
						:spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<!-- ─── Cấp 2 & 3: Các tháng thường ─── -->
			<template #item.NoiDungKienThuc_HTML="{ item }">
				<div style="padding: 10px; min-width: 200px;">
					<uc-quill-editor :key="'NoiDungKienThuc_HTML' + item.HocSinhID"
						v-model="item.NoiDungKienThuc_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NoiDungNangLuc_HTML="{ item }">
				<div style="padding: 10px; min-width: 200px;">
					<uc-quill-editor :key="'NoiDungNangLuc_HTML' + item.HocSinhID"
						v-model="item.NoiDungNangLuc_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NoiDungHoatDongKhac_HTML="{ item }">
				<div style="padding: 10px; min-width: 200px;">
					<uc-quill-editor :key="'NoiDungHoatDongKhac_HTML' + item.HocSinhID"
						v-model="item.NoiDungHoatDongKhac_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<!-- ─── Action ─── -->
			<template #item.actions="{ item }">
				<v-btn @click="onSaveDraft(item)" text="Lưu tạm" color="primary" variant="outlined" />
			</template>
		</v-data-table>
	</Global>
</template>

<script>
export default {
	name: 'NhanXetThang',

	// Inject snackbarRef được provide từ app root (qua Global.vue)
	inject: ['snackbarRef'],

	data() {
		return {
			DSLop: [],
			DSThang: [],
			LopItem: null,
			ThangObj: null,
			headers: [],
			items: [],
			isLowScreen: window.innerWidth < 1366,
		}
	},

	mounted() {
		this.getLop()
		this._resizeHandler = () => {
			this.isLowScreen = window.innerWidth < 1366
		}
		window.addEventListener('resize', this._resizeHandler)
	},

	beforeUnmount() {
		window.removeEventListener('resize', this._resizeHandler)
	},

	computed: {
		TitleCap() {
			return renderText(parseInt(vueData.capid))
		},
		TitlePage() {
			return getTitlePageByURL(window.location.pathname + window.location.search)
		},
		/** Readonly khi tình trạng là Đã duyệt (2) hoặc Từ chối (4) */
		isReadOnly() {
			return this.ThangObj?.TinhTrang === 2 || this.ThangObj?.TinhTrang === 4
		},
		/** Các khối KHÔNG cần cột tuyển thẳng / Flyers / DiemTA */
		isKhoiCanLoai() {
			const DSKhoi_CanLoai = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]
			const lop = this.DSLop.find(x => x.LopID === this.LopItem?.LopID)
			return DSKhoi_CanLoai.includes(lop?.KhoiID)
		},
		isCuoiKi() {
			return [12, 5].includes(this.ThangObj?.Thang)
		},
	},

	watch: {
		LopItem(LopItem) {
			if (!LopItem) return
			this.ThangObj = null
			this.items = []
			this.getThang()
		},
		ThangObj(ThangObj) {
			if (!ThangObj) return
			this.items = []
			this.getNhanXetThang()
		},
		isLowScreen() {
			// Re-render header khi đổi breakpoint
			if (this.ThangObj) this.headers = this.renderHeader()
		},
	},

	methods: {
		// ─────────────────────────────────────────
		// Snackbar helpers (thay thế Vue.$toast)
		// ─────────────────────────────────────────
		$toast(type, message) {
			this.snackbarRef?.value?.showSnackbar({ type, message })
		},
		$toastPromise(promise, { loadingText, successText, errorPrefix } = {}) {
			this.snackbarRef?.value?.showPromise(promise, {
				loadingText: loadingText ?? 'Đang xử lý...',
				onSuccess: () => ({
					text: successText ?? 'Thành công!',
					color: 'success',
					prependIcon: 'mdi-check-circle-outline',
					timeout: 2000,
					timer: 'white',
				}),
				onError: (err) => ({
					text: `${errorPrefix ?? 'Lỗi'}: ${err?.message ?? 'Không xác định'}`,
					color: 'error',
					prependIcon: 'mdi-alert-circle-outline',
					timeout: 5000,
					timer: 'white',
					reverseTimer: true,
				}),
			})
		},

		// ─────────────────────────────────────────
		// Fetch data
		// ─────────────────────────────────────────
		async getLop() {
			this.DSLop = await fetchPromise('lms/Lop_Get_By_CapID', {
				CapID: vueData.CapID,
				NienKhoa: vueData.NienKhoa,
			})
		},

		async getThang(forceRefresh = false) {
			this.DSThang = await fetchPromise('lms/NhanXetThang_Lop_Get_GV', {
				NienKhoa: vueData.NienKhoa,
				LopID: this.LopItem.LopID,
			}, { forceRefresh })

			const existThang = this.DSThang.find(
				x => x.Lop_NhanXetThangID === this.ThangObj?.Lop_NhanXetThangID
			)
			if (existThang) this.ThangObj = { ...existThang }
		},

		async getNhanXetThang(forceRefresh = false) {
			this.items = await fetchPromise('lms/NhanXetThang_Get', {
				Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
				LopID: this.LopItem.LopID,
			}, { forceRefresh })

			await this.convertItems()
			this.headers = this.renderHeader()
		},

		// ─────────────────────────────────────────
		// convertItems — gắn NgayNghi + LoaiViPham_Group vào từng học sinh
		// ─────────────────────────────────────────
		async convertItems() {
			const { firstDay, lastDay } = this.getFirstAndLastDay(
				vueData.NienKhoa?.split('-')[0],
				this.ThangObj?.Thang
			)

			// Gắn NgayNghi từ DSChuyenCan_TreVang (được fetch cùng NhanXetThang_Get hoặc riêng)
			this.items = this.items.map(x => {
				const existDSTreVang = (vueData.DSChuyenCan_TreVang ?? [])
					.find(n => n.HocSinhID === x.HocSinhID)
				return {
					...x,
					firstDay,
					lastDay,
					LopID: this.LopItem.LopID,
					NgayNghi: {
						MonVang: existDSTreVang ? JSON.parse(existDSTreVang.MonVang) : [],
						TongSoTiet: existDSTreVang?.TongSoTiet || null,
					},
				}
			})

			// Fetch chi tiết vi phạm cho từng loại (chỉ khi cấp 2/3 + phuHuynh view)
			const dsTongHop = (vueData.DSTongHop_LoaiViPham ?? []).filter(x => x.SoLuong > 0)
			if (!dsTongHop.length) return

			const fetchViPham = (LoaiViPham) =>
				new Promise(resolve => {
					ajaxCALL(
						'quansinh/GVCN_SoDauBai_TongHopTheoLoaiViPham_ChiTiet',
						{ TuNgay: firstDay, DenNgay: lastDay, LopHocID: this.LopItem.LopID, LoaiViPham },
						res => resolve(res.data)
					)
				})

			const DSHocSinh_ViPham = await Promise.all(
				dsTongHop.map(async item => {
					const data = await fetchViPham(item.LoaiViPham)
					return { ...item, data }
				})
			)

			// Flatten
			const flatList = DSHocSinh_ViPham.flatMap(viPham =>
				viPham.data.map(hs => ({ ...hs, ...viPham }))
			)

			// Gắn vào từng học sinh
			this.items = this.items.map(x => ({
				...x,
				LoaiViPham: flatList.filter(n => n.HocSinhID === x.HocSinhID),
				LoaiViPham_Group: this.transformData(
					flatList.filter(n => n.HocSinhID === x.HocSinhID)
				),
			}))
		},

		// ─────────────────────────────────────────
		// transformData — nhóm vi phạm theo LoaiViPham > Ngay > Buoi
		// ─────────────────────────────────────────
		transformData(data) {
			const grouped = {}
			data.forEach(({ LoaiViPham, Ngay, TenViPham, HocSinhID, Ho, Ten,
				Thu, Buoi, Tiet, TenMonHoc, GiaoVien, GhiChu, SoLuong }) => {

				if (!grouped[LoaiViPham]) {
					grouped[LoaiViPham] = { TenViPham, LoaiViPham, Ngay: [] }
				}

				let dateGroup = grouped[LoaiViPham].Ngay.find(d => d.Ngay === Ngay)
				if (!dateGroup) {
					dateGroup = { Ngay, DSNgay: [] }
					grouped[LoaiViPham].Ngay.push(dateGroup)
				}

				let sessionGroup = dateGroup.DSNgay.find(s => s.Buoi === Buoi)
				if (!sessionGroup) {
					sessionGroup = { Buoi, DS: [] }
					dateGroup.DSNgay.push(sessionGroup)
				}

				sessionGroup.DS.push({
					HocSinhID, Ho, Ten, Thu, Ngay, Buoi, Tiet,
					TenMonHoc, GiaoVien, GhiChu, LoaiViPham, TenViPham, SoLuong,
				})
			})
			return Object.values(grouped)
		},

		// ─────────────────────────────────────────
		// Helpers
		// ─────────────────────────────────────────
		getFirstAndLastDay(year, month) {
			const firstDay = dayjs(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD')
			const lastDay = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
			return { firstDay, lastDay }
		},

		buildSavePayload() {
			return this.items.map(item => ({
				...item,
				LopID: this.LopItem.LopID,
				Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
				Is_Reject: false,
				DKHocTiep: item.DKHocTiep ?? false,
			}))
		},

		// ─────────────────────────────────────────
		// Actions
		// ─────────────────────────────────────────
		onRefresh() {
			this.getNhanXetThang(true)
		},

		onImport() {
			// TODO
		},

		async onSave() {
			const JSON_NhanXetThang = this.buildSavePayload()

			const [isSave1, isSave2] = await fetchBatchPromise([
				{ url: 'lms/NhanXetThang_Ins', params: { JSON_NhanXetThang } },
				{
					url: 'lms/NhanXetThang_Upd_TinhTrang',
					params: {
						TinhTrang: 1,
						Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
						ReasonReject: '',
					},
				},
			])

			if (isSave1 && isSave2) {
				this.$toast('success', 'Cập nhật nhận xét tháng thành công')
				this.getThang(true)
				this.getNhanXetThang(true)
			}
		},

		onSaveDraft(item) {
			item.DKHocTiep = item.DKHocTiep ?? false
			const promise = fetchPromise('lms/NhanXetThang_Ins_By_NhanXetThangID', {
				...item,
				LopID: this.LopItem.LopID,
				Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
			})
			this.$toastPromise(promise, {
				loadingText: `Đang lưu ${item.HoTen}...`,
				successText: `Lưu tạm ${item.HoTen} thành công`,
				errorPrefix: 'Lưu thất bại',
			})
			promise.then(() => this.getNhanXetThang(true))
		},

		onSendToTruong() {
			const promise = fetchPromise('lms/NhanXetThang_Upd_TinhTrang', {
				TinhTrang: 2,
				Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
				ReasonReject: '',
			})
			this.$toastPromise(promise, {
				successText: 'Gửi tổ trưởng thành công',
			})
			promise.then(() => {
				this.getThang(true)
				this.getNhanXetThang(true)
			})
		},

		// ─────────────────────────────────────────
		// renderHeader — đầy đủ logic GVCN / PhuHuynh view
		// ─────────────────────────────────────────
		renderHeader() {
			const H_HocSinh = {
				title: 'Học sinh', value: 'HocSinh',
				align: 'center', minWidth: 180, width: 180, fixed: true,
			}
			const H_Action = {
				title: '', value: 'actions',
				align: 'center', minWidth: 100, width: 100, lastFixed: true,
			}

			let headers = [H_HocSinh]

			// ── Chế độ GVCN nhập liệu (Is_HienThiPhuHuynh = false) ──
			if (!this.ThangObj?.Is_HienThiPhuHuynh) {
				headers.push({
					title: 'Phối hợp & Thông tin',
					value: 'gvcn_extra',
					align: 'center',
					width: 250,
				})
				headers.push({
					title: 'Nhận xét về Phụ huynh',
					value: 'NhanXetGVCN_VePhuHuynh_HTML',
					align: 'center',
					width: 280,
				})
				headers.push({
					title: 'Nhận xét về Học sinh',
					value: 'NhanXetGVCN_VeHocSinh_HTML',
					align: 'center',
					width: 280,
				})

			// ── Chế độ hiển thị cho Phụ huynh ──
			} else {

				// Cấp 1
				if (vueData.CapID === 1) {
					headers = [
						...headers,
						{ title: 'Nhận xét môn Toán', value: 'NhanXetToan_HTML', align: 'center', minWidth: 280, width: 280 },
						{ title: 'Nhận xét môn Tiếng Việt', value: 'NhanXetTiengViet_HTML', align: 'center', minWidth: 280, width: 280 },
						{ title: 'Nhận xét môn học khác', value: 'NhanXetMonHocKhac_HTML', align: 'center', minWidth: 280, width: 280 },
						{ title: 'Hoạt động giáo dục khác', value: 'HoatDongGiaoDucKhac_HTML', align: 'center', minWidth: 280, width: 280 },
						{ title: 'Phẩm chất - Năng lực', value: 'PhamChatNangLuc_HTML', align: 'center', minWidth: 280, width: 280 },
					]

				// Cấp 2 & 3
				} else if (vueData.CapID === 2 || vueData.CapID === 3) {
					headers.push({
						title: 'Ngày nghỉ / Vi phạm',
						value: 'NgayNghi',
						align: 'center',
						width: 220,
					})

					if (this.isCuoiKi) {
						headers = [
							...headers,
							{ title: 'Ưu điểm', value: 'UuDiem', align: 'center', minWidth: 250 },
							{ title: 'Nhược điểm', value: 'NhuocDiem', align: 'center', minWidth: 250 },
							{ title: 'Đề xuất', value: 'DeXuat', align: 'center', minWidth: 250 },
						]
					} else {
						headers = [
							...headers,
							{ title: 'Về học tập', value: 'NoiDungKienThuc_HTML', align: 'center', minWidth: 220 },
							{ title: 'Về nền nếp', value: 'NoiDungNangLuc_HTML', align: 'center', minWidth: 220 },
							{ title: 'Mong muốn phối hợp', value: 'NoiDungHoatDongKhac_HTML', align: 'center', minWidth: 220 },
						]
					}
				}
			}

			// Nút Lưu tạm chỉ hiện khi chưa khoá
			if ([0, 1].includes(this.ThangObj?.TinhTrang)) {
				headers.push(H_Action)
			}

			return headers
		},
	},
}
</script>
