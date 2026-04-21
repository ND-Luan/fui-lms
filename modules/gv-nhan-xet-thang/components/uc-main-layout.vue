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
				<v-card-text class="pb-0 px-0">
					<v-row dense>
						<v-col cols="2">
							<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
								item-value="LopID" return-object :hide-details="true" class="ms-1" />
						</v-col>
						<v-col cols="2">
							<v-select v-model="ThangObj" label="Chọn tháng" :items="DSThang"
								item-title="Thang_HienThi" item-value="Lop_NhanXetThangID" return-object :hide-details="true">
								<template v-slot:item="{ props, item }">
									<v-list-item v-bind="props" :title="item.raw.Thang_HienThi">
										<template #append>
											<v-chip :color="item.raw.MauTinhTrang">{{ item.raw.TenTinhTrang }}</v-chip>
										</template>
									</v-list-item>
								</template>
							</v-select>
						</v-col>
						<v-col>
							<v-btn color="primary" variant="outlined" prepend-icon="mdi-refresh" @click="onRefresh">
								Làm mới
							</v-btn>
						</v-col>
						<v-col cols="12" class="pb-4">
							<div class="d-flex justify-space-between align-center">
								<div class="d-flex align-center justify-center">
									<span class="text-title">
										<span>Các học sinh đã lưu:
											<v-chip size="small" color="primary" class="font-weight-medium">
												({{ renderTextDSHocSinhDaLuu() }} / {{ items.length }})
											</v-chip>
										</span>
									</span>
									<div v-if="ThangObj?.ReasonReject && ThangObj.TinhTrang === 3">
										&nbsp;Lý do từ chối: <span class="text-red">{{ ThangObj?.ReasonReject }}</span>
									</div>
								</div>
								<div class="d-flex ga-2">
									<v-btn prepend-icon="mdi-file-excel" color="success" variant="outlined"
										:disabled="items.length === 0 || isReadOnly"
										@click="onImport">
										Import dữ liệu từ Excel
									</v-btn>
									<v-btn prepend-icon="mdi-content-save" color="info" variant="outlined"
										:disabled="items.length === 0 || isReadOnly"
										@click="onSave">
										Lưu tạm tất cả
									</v-btn>
									<v-btn v-if="CapID === 1" prepend-icon="mdi-send" color="primary" variant="outlined"
										class="me-1" :disabled="items.length === 0 || isReadOnly"
										@click="onSendToTruong">
										Gửi tổ trưởng
									</v-btn>
									<v-btn v-if="CapID === 2 || CapID === 3" prepend-icon="mdi-send" color="primary" variant="outlined"
										class="me-1" :disabled="items.length === 0 || isReadOnly"
										@click="onSendToBGH">
										Gửi BGH
									</v-btn>
								</div>
							</div>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-divider />
		<v-data-table :headers="headers" :items="items" items-per-page="-1" hide-default-footer
			style="height: calc(100dvh - 119px); overflow-y: auto;">

			<!-- ─── Học sinh ─── -->
			<template #item.HocSinh="{ item }">
				<uc-info-student :item="item" />
			</template>

			<!-- ─── GVCN view: Phối hợp + các trường phụ ─── -->
			<template #item.gvcn_extra="{ item }">
				<div class="d-flex ga-2 flex-column pa-2">
					<v-select v-model="item.PhoiHopCMHS" label="Phối hợp CMHS" :items="['Tốt', 'Đạt', 'Không đạt']"
						placeholder="Chọn" :disabled="isReadOnly" />
					<template v-if="!isKhoiCanLoai">
						<v-select v-model="item.PhanLoai_TuyenThang" :items="['Tuyển thẳng', 'Tuyển thẳng có cam kết']"
							label="Phân loại tuyển thẳng" :disabled="isReadOnly" />
						<v-text-field v-model="item.Flyers" label="Flyers" :disabled="isReadOnly" />
						<v-text-field v-model="item.DiemTA" label="Điểm Tiếng Anh" :disabled="isReadOnly" />
						<v-checkbox v-model="item.DKHocTiep" label="Đăng ký học tiếp" :disabled="isReadOnly" />
						<v-textarea v-model="item.DeXuat_NDCamKet" label="Đề xuất / ND cam kết" :hide-details="false"
							:disabled="isReadOnly" />
					</template>
				</div>
			</template>

			<template #item.NhanXetGVCN_VePhuHuynh_HTML="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'NhanXetGVCN_VePhuHuynh_HTML' + item.HocSinhID"
						v-model="item.NhanXetGVCN_VePhuHuynh_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<template #item.NhanXetGVCN_VeHocSinh_HTML="{ item }">
				<div style="padding: 10px; max-width: 250px;">
					<uc-quill-editor :key="'NhanXetGVCN_VeHocSinh_HTML' + item.HocSinhID"
						v-model="item.NhanXetGVCN_VeHocSinh_HTML" :spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>

			<!-- ─── Cấp 1: Các cột nhận xét môn ─── -->
			<template #item.NhanXetToan_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'NhanXetToan_HTML' + item.HocSinhID" v-model="item.NhanXetToan_HTML"
						:spellcheck="false" style="height: 150px;" :readOnly="isReadOnly" />
					<v-text-field class="mt-2" v-model="item.DiemToan" placeholder="Nhập điểm..."
						messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm"
						:readOnly="isReadOnly" solo reverse />
				</div>
			</template>

			<template #item.NhanXetTiengViet_HTML="{ item }">
				<div style="padding: 10px; max-width: 280px;">
					<uc-quill-editor :key="'NhanXetTiengViet_HTML' + item.HocSinhID"
						v-model="item.NhanXetTiengViet_HTML" :spellcheck="false" style="height: 150px;"
						:readOnly="isReadOnly" />
					<v-text-field class="mt-2" v-model="item.DiemTiengViet" placeholder="Nhập điểm..."
						messages="*Lưu ý: Thang điểm 10" variant="filled" :clearable="false" suffix="Điểm"
						:readOnly="isReadOnly" solo reverse />
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
					<uc-quill-editor :key="'PhamChatNangLuc_HTML' + item.HocSinhID" v-model="item.PhamChatNangLuc_HTML"
						:spellcheck="false" :readOnly="isReadOnly" />
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
					<v-chip v-for="mon in item.NgayNghi?.MonVang" :key="mon.TenMonHoc" color="orange" size="small"
						style="width: fit-content;">
						{{ mon.TenMonHoc }}
					</v-chip>

					<template v-if="getViPhamCuaHocSinh(item.HocSinhID).length > 0">
						<v-divider class="mt-1" />
						<div v-for="lvp in getViPhamCuaHocSinh(item.HocSinhID)" :key="lvp.LoaiViPham"
							class="mt-1">
							<v-chip size="x-small" color="error" variant="tonal"
								style="cursor: pointer; height: auto; white-space: normal;"
								@click="toggleViPhamExpand(item.HocSinhID, lvp.LoaiViPham)">
								<v-progress-circular v-if="viPhamLoadingMap[lvp.LoaiViPham]"
									indeterminate size="10" width="2" class="me-1" />
								{{ tenViPhamVI(lvp.TenViPham) }} ({{ lvp.SoLuong_HS }} {{ lvp.LoaiViPham === 2 ? 'ngày' : 'tiết' }})
							</v-chip>
							<div v-if="viPhamExpandedMap[item.HocSinhID + '_' + lvp.LoaiViPham]"
								class="mt-1 ms-2">
								<!-- LoaiViPham 2: hiển thị theo ngày (unique) -->
								<template v-if="lvp.LoaiViPham === 2">
									<div v-for="ngay in [...new Set(getViPhamChiTiet(item.HocSinhID, lvp.LoaiViPham).map(r => r.Ngay))]"
										:key="ngay" class="text-caption text-medium-emphasis">
										{{ formatNgayViPham(ngay) }}
									</div>
								</template>
								<!-- Các vi phạm khác: hiển thị theo tiết -->
								<template v-else>
									<div v-for="(row, idx) in getViPhamChiTiet(item.HocSinhID, lvp.LoaiViPham)"
										:key="idx" class="text-caption text-medium-emphasis">
										{{ formatNgayViPham(row.Ngay) }} · Tiết {{ row.Tiet }} · {{ row.TenMonHoc }}
									</div>
								</template>
							</div>
						</div>
					</template>
				</div>
			</template>

			<!-- ─── Cấp 2 & 3: Cuối kỳ (T12, T5) ─── -->
			<template #item.UuDiem="{ item }">
				<div style="padding: 10px;">
					<uc-quill-editor :key="'UuDiem' + item.HocSinhID" v-model="item.UuDiem" :spellcheck="false"
						:readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NhuocDiem="{ item }">
				<div style="padding: 10px;">
					<uc-quill-editor :key="'NhuocDiem' + item.HocSinhID" v-model="item.NhuocDiem" :spellcheck="false"
						:readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.DeXuat="{ item }">
				<div style="padding: 10px;">
					<uc-quill-editor :key="'DeXuat' + item.HocSinhID" v-model="item.DeXuat" :spellcheck="false"
						:readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NhanXetGVCN="{ item }">
				<div style="padding: 10px;">
					<uc-quill-editor :key="'NhanXetGVCN' + item.HocSinhID" v-model="item.NhanXetGVCN"
						:spellcheck="false" :readOnly="isReadOnly" :maxLength="500" />
				</div>
			</template>

			<!-- ─── Cấp 2 & 3: Các tháng thường ─── -->
			<template #item.NoiDungKienThuc_HTML="{ item }">
				<div style="padding: 10px; min-width: 200px;">
					<uc-quill-editor :key="'NoiDungKienThuc_HTML' + item.HocSinhID" v-model="item.NoiDungKienThuc_HTML"
						:spellcheck="false" :readOnly="isReadOnly" />
				</div>
			</template>
			<template #item.NoiDungNangLuc_HTML="{ item }">
				<div style="padding: 10px; min-width: 200px;">
					<uc-quill-editor :key="'NoiDungNangLuc_HTML' + item.HocSinhID" v-model="item.NoiDungNangLuc_HTML"
						:spellcheck="false" :readOnly="isReadOnly" />
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

		<!-- Copy dialog -->
		<v-dialog v-model="IsShowDialogCopy" width="500">
			<v-card title="Sao chép nhận xét tháng">
				<v-card-text>
					<v-select v-model="ThangObj_Copy" label="Chọn tháng sao chép"
						:items="DSThang.filter(x => x.Lop_NhanXetThangID !== ThangObj?.Lop_NhanXetThangID)"
						item-title="Thang_HienThi" return-object />
					<v-select v-model="ThangObj" label="Tháng đang chọn" :items="DSThang"
						item-title="Thang_HienThi" return-object :readonly="true" />
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn @click="IsShowDialogCopy = false">Đóng</v-btn>
					<v-btn color="primary" @click="onConfirmCopy">Xác nhận</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</Global>
</template>

<script>
	export default {
	    name: 'NhanXetThang',
	
	    // Inject snackbarRef, iframeRef được provide từ app root (qua Global.vue)
	    inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	
	    data() {
	        return {
	            DSLop: [],
	            DSThang: [],
	            LopItem: null,
	            ThangObj: null,
	            headers: [],
	            items: [],
	            isLowScreen: window.innerWidth < 1366,
	            IsShowDialogCopy: false,
	            ThangObj_Copy: null,
	            DSTongHop_ViPham: [],
	            viPhamDetailMap: {},
	            viPhamLoadingMap: {},
	            viPhamExpandedMap: {},
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
	        CapID() {
	            return vueData.CapID
	        },
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
        // convertItems — gắn NgayNghi + gọi API 1 tổng hợp vi phạm
        // ─────────────────────────────────────────
        async convertItems() {
	            this.viPhamDetailMap = {}
	            this.viPhamLoadingMap = {}
	            this.viPhamExpandedMap = {}
	
	            const { firstDay, lastDay } = this.getFirstAndLastDay(
	                vueData.NienKhoa,
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
	
	            // API 1: lấy tổng hợp loại vi phạm theo lớp + tháng
	            this.DSTongHop_ViPham = await fetchPromise(
	                'quansinh/GVCN_SoDauBai_TongHopTheoLoaiViPham',
	                { TuNgay: firstDay, DenNgay: lastDay, LopHocID: this.LopItem.LopID },
	                { cache: false }
	            ) ?? []

	            // API 2: eager-load chi tiết song song cho các loại có vi phạm
	            // để hiển thị đúng per-student trong từng row của bảng
	            const dsCoViPham = this.DSTongHop_ViPham.filter(x => x.SoLuong > 0)
	            if (dsCoViPham.length > 0) {
	                await Promise.all(dsCoViPham.map(lvp => this.loadViPhamDetail(lvp.LoaiViPham)))
	            }
	        },

	        // ─────────────────────────────────────────
	        // Vi phạm — accordion per student
	        // ─────────────────────────────────────────
	        toggleViPhamExpand(hocSinhID, loaiViPham) {
	            const key = hocSinhID + '_' + loaiViPham
	            this.viPhamExpandedMap = { ...this.viPhamExpandedMap, [key]: !this.viPhamExpandedMap[key] }
	        },

	        // Trả về danh sách loại vi phạm + số lần vi phạm riêng của từng học sinh
	        getViPhamCuaHocSinh(hocSinhID) {
	            return this.DSTongHop_ViPham
	                .filter(x => x.SoLuong > 0)
	                .map(lvp => {
	                    const rows = (this.viPhamDetailMap[lvp.LoaiViPham] ?? [])
	                        .filter(x => x.HocSinhID === hocSinhID)
	                    const soLuong = lvp.LoaiViPham === 2
	                        ? new Set(rows.map(r => r.Ngay)).size
	                        : rows.length
	                    return { ...lvp, SoLuong_HS: soLuong }
	                })
	                .filter(x => x.SoLuong_HS > 0)
	        },

	        async loadViPhamDetail(loaiViPham) {
	            this.viPhamLoadingMap = { ...this.viPhamLoadingMap, [loaiViPham]: true }
	            const { firstDay, lastDay } = this.getFirstAndLastDay(vueData.NienKhoa, this.ThangObj?.Thang)
	            const data = await fetchPromise(
	                'quansinh/GVCN_SoDauBai_TongHopTheoLoaiViPham_ChiTiet',
	                { TuNgay: firstDay, DenNgay: lastDay, LopHocID: this.LopItem.LopID, LoaiViPham: loaiViPham },
	                { cache: false }
	            )
	            this.viPhamDetailMap = { ...this.viPhamDetailMap, [loaiViPham]: data ?? [] }
	            this.viPhamLoadingMap = { ...this.viPhamLoadingMap, [loaiViPham]: false }
	        },

	        getViPhamChiTiet(hocSinhID, loaiViPham) {
	            return (this.viPhamDetailMap[loaiViPham] ?? []).filter(x => x.HocSinhID === hocSinhID)
	        },

	        tenViPhamVI(ten) {
	            return (ten ?? '').split('/')[0].trim()
	        },

	        formatNgayViPham(ngay) {
	            return ngay ? String(ngay).slice(0, 5) : ''
	        },

	        // ─────────────────────────────────────────
	        // Helpers
	        // ─────────────────────────────────────────
	        getFirstAndLastDay(year, month) {
	            const firstDay = dayjs(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD')
	            const lastDay = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')
	            return { firstDay, lastDay }
	        },
	
	        validateNhanXetGVCN(itemsToCheck) {
	            const MAX = 500
	            const overLimit = itemsToCheck.filter(item => item.NhanXetGVCN && item.NhanXetGVCN.length > MAX)
	            if (overLimit.length > 0) {
	                const names = overLimit.map(item => `<b>${item.HoTen}</b> (${item.NhanXetGVCN.length} ký tự)`).join(', ')
	                this.$toast('warning', `Nhận xét ghi học bạ vượt quá 500 ký tự: ${names}. Vui lòng chỉnh lại trước khi lưu.`)
	                return false
	            }
	            return true
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
	            if (!this.LopItem) {
	                this.$toast('error', 'Vui lòng chọn lớp')
	                return
	            }
	            if (!this.ThangObj) {
	                this.$toast('error', 'Vui lòng chọn tháng')
	                return
	            }
	            this.iframeRef.value.openWindow({
	                title: 'Import Excel nhận xét tháng',
	                icon: 'mdi-file-excel',
	                url: `/gv-nhan-xet-thang-import?lopid=${this.LopItem.LopID}&lop_nxtid=${this.ThangObj.Lop_NhanXetThangID}&nienkhoa=${vueData.NienKhoa}`,
	                onclose: () => {
	                    if (JSON.parse(localStorage.getItem('IsImportNXT'))) {
	                        localStorage.removeItem('IsImportNXT')
	                        this.getThang(true)
	                        this.getNhanXetThang(true)
	                    }
	                },
	            })
	        },
	
	        async onSave() {
	            if (!this.validateNhanXetGVCN(this.items)) return
	            const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu tạm tất cả nhận xét tháng?' })
	            if (!ok) return
	            const JSON_NhanXetThang = this.buildSavePayload()
	            const promise = fetchPromise('lms/NhanXetThang_Ins', { JSON_NhanXetThang })
	                .then(() => fetchPromise('lms/NhanXetThang_Upd_TinhTrang', {
	                    TinhTrang: 1,
	                    Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
	                    ReasonReject: '',
	                }))
	                .then(() => {
	                    this.getThang(true)
	                    this.getNhanXetThang(true)
	                })
	            this.$toastPromise(promise, {
	                loadingText: 'Đang lưu tạm tất cả...',
	                successText: 'Lưu tạm tất cả nhận xét tháng thành công',
	                errorPrefix: 'Lưu thất bại',
	            })
	        },
	
	        onSaveDraft(item) {
	            if (!this.validateNhanXetGVCN([item])) return
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
	
	        renderTextDSHocSinhDaLuu() {
	            let count = 0
	            for (const item of this.items) {
	                if (item.NhanXetThangID > 0) count++
	            }
	            return count
	        },
	
	        onSendToTruong() {
	            if (this.renderTextDSHocSinhDaLuu() !== this.items.length) {
	                this.$toast('warning', 'Vui lòng lưu hết tất cả học sinh trước khi gửi tổ trưởng')
	                return
	            }
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
	
	        onSendToBGH() {
	            if (this.renderTextDSHocSinhDaLuu() !== this.items.length) {
	                this.$toast('warning', 'Vui lòng lưu hết tất cả học sinh trước khi gửi')
	                return
	            }
	            const promise = fetchPromise('lms/NhanXetThang_Upd_TinhTrang', {
	                TinhTrang: 2,
	                Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
	                ReasonReject: '',
	            })
	            this.$toastPromise(promise, {
	                successText: 'Gửi BGH thành công',
	            })
	            promise.then(() => {
	                this.getThang(true)
	                this.getNhanXetThang(true)
	            })
	        },
	
	        onConfirmCopy() {
	            if (!this.ThangObj_Copy) {
	                this.$toast('warning', 'Vui lòng chọn tháng sao chép')
	                return
	            }
	            const promise = fetchPromise('lms/NhanXetThang_Copy', {
	                Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
	                Lop_NhanXetThangID_Copy: this.ThangObj_Copy.Lop_NhanXetThangID,
	            })
	            this.$toastPromise(promise, {
	                successText: 'Sao chép thành công',
	            })
	            promise.then(() => {
	                this.IsShowDialogCopy = false
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
	                            { title: 'Ưu điểm', value: 'UuDiem', align: 'center', minWidth: 200 },
	                            { title: 'Nhược điểm', value: 'NhuocDiem', align: 'center', minWidth: 200 },
	                            { title: 'Đề xuất', value: 'DeXuat', align: 'center', minWidth: 200 },
	                            ...(this.ThangObj?.Thang === 5
	                                ? [{ title: 'Nhận xét ghi học bạ', value: 'NhanXetGVCN', align: 'center', minWidth: 200 }]
	                                : []),
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