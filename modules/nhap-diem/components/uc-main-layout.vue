<template>
	<div>
		<v-card>
			<!-- Header -->
			<v-card-title class="d-flex align-center flex-wrap ga-2">
				<span>{{ pageTitle }}</span>
				<span v-if="vueData.CapID">• Cấp {{ vueData.CapID }}</span>
				<v-chip v-if="hasStudents" color="primary" variant="text" class="font-weight-medium" size="small">
					{{ DSHocSinh.length }} học sinh
				</v-chip>
				<!-- Danh sách cột điểm -->
				<div v-if="hasStudents && displayColumns.length > 0">
					<!-- Đã khóa hết: hiển thị gọn -->
					<v-menu v-if="isAllColumnsLocked" v-model="action.showAllLockedColumns" offset-y>
						<template v-slot:activator="{ props }">
							<v-chip v-bind="props" color="primary" variant="flat" size="small" label
								style="cursor:pointer">
								<v-icon start size="small" color="white">mdi-lock</v-icon>
								{{ displayColumns.length }}/{{ displayColumns.length }} cột đã khóa
							</v-chip>
						</template>
						<v-list density="compact" max-height="300" class="overflow-y-auto">
							<v-list-item v-for="cotDiem in displayColumns" :key="cotDiem.value">
								<template v-slot:prepend>
									<v-icon size="small" start>mdi-lock</v-icon>
								</template>
								<v-list-item-title>{{ cotDiem.title }}</v-list-item-title>
							</v-list-item>
						</v-list>
					</v-menu>

					<!-- Chưa khóa hết: hiển thị như cũ -->
					<div v-else class="d-flex flex-wrap ga-2 align-center">
						<v-tooltip v-for="cotDiem in displayColumns.slice(0, 5)" :key="cotDiem.value"
							:text="isColumnReadyToLock(cotDiem.value) ? 'Đã nhập đủ điểm — sẵn sàng khóa!' : ''"
							:disabled="!isColumnReadyToLock(cotDiem.value)" location="bottom">
							<template v-slot:activator="{ props: tooltipProps }">
								<v-chip v-bind="tooltipProps"
									:color="cotDiem.isLocked ? 'primary' : (isColumnReadyToLock(cotDiem.value) ? 'warning' : 'grey')"
									:variant="cotDiem.isLocked ? 'flat' : (isColumnReadyToLock(cotDiem.value) ? 'tonal' : 'outlined')"
									size="small" label>
									<v-icon start v-if="cotDiem.isLocked" size="small" color="white">mdi-lock</v-icon>
									<v-icon start v-else-if="isColumnReadyToLock(cotDiem.value)" size="small"
										color="warning">mdi-lock-clock</v-icon>
									<v-icon start v-else size="small" color="grey">mdi-lock-open-variant-outline
									</v-icon>
									{{ cotDiem.title }}
								</v-chip>
							</template>
						</v-tooltip>

						<v-menu v-if="displayColumns.length > 5" offset-y>
							<template v-slot:activator="{ props }">
								<v-chip v-bind="props"
									:color="displayColumns.slice(5).some(c => isColumnReadyToLock(c.value)) ? 'warning' : 'grey-lighten-1'"
									:variant="displayColumns.slice(5).some(c => isColumnReadyToLock(c.value)) ? 'tonal' : 'outlined'"
									size="small" label>
									+{{ displayColumns.length - 5 }} cột khác
									<v-icon v-if="displayColumns.slice(5).some(c => isColumnReadyToLock(c.value))" end
										size="x-small">mdi-lock-clock</v-icon>
								</v-chip>
							</template>
							<v-list density="compact" max-height="300" class="overflow-y-auto">
								<v-list-item v-for="cotDiem in displayColumns.slice(5)" :key="cotDiem.value">
									<template v-slot:prepend>
										<v-icon v-if="cotDiem.isLocked" size="small" start>mdi-lock</v-icon>
										<v-icon v-else-if="isColumnReadyToLock(cotDiem.value)" size="small"
											color="warning" start>mdi-lock-clock</v-icon>
										<v-icon v-else size="small" color="grey" start>mdi-lock-open-variant-outline
										</v-icon>
									</template>
									<v-list-item-title>
										{{ cotDiem.title }}
										<span v-if="isColumnReadyToLock(cotDiem.value)"
											class="text-caption text-warning ml-1">· sẵn sàng khóa</span>
									</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</div>
			</v-card-title>

			<!-- Filter -->
			<v-card-text>
				<uc-filter v-model="filter" @onRefresh="onRefresh" />
			</v-card-text>
			<v-divider />

			<!-- Toolbar: Buttons hành động -->
			<v-card-text class="py-2 d-flex align-center ga-2 flex-wrap">
				<v-btn v-if="!isAllColumnsLocked" @click="onLuuTam" color="grey" variant="outlined"
					:disabled="isDisabled" size="small">
					<v-icon start>mdi-content-save</v-icon>
					Lưu tạm
					<v-badge v-if="changedCellCount > 0" :content="changedCellCount" color="primary" inline
						class="ml-1" />
				</v-btn>
				<v-btn v-if="!isAllColumnsLocked" @click="onOpenDialogKhoaCotDiem"
					:color="dismissedSuggest && suggestLockColumns.length > 0 ? 'warning' : 'teal'"
					:variant="dismissedSuggest && suggestLockColumns.length > 0 ? 'flat' : 'outlined'"
					:disabled="isDisabled" size="small">
					<v-icon start>{{ dismissedSuggest && suggestLockColumns.length > 0 ? 'mdi-lock-clock' : 'mdi-lock'
						}}</v-icon>
					Khóa cột điểm
					<v-badge v-if="dismissedSuggest && suggestLockColumns.length > 0"
						:content="suggestLockColumns.length" color="error" inline class="ml-1" />
				</v-btn>
				<v-btn v-if="filter.MonHocItem?.MonHocID === 5" @click="onOpenMauNhanXet" color="primary"
					variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-comment-text-outline</v-icon>
					Mẫu nhận xét
				</v-btn>
				<v-btn v-if="showGetThemeTestButton" @click="onGetDiemTest" color="primary" variant="outlined"
					size="small" :disabled="!hasStudents">
					<v-icon start>mdi-download-outline</v-icon>
					Lấy điểm Test
				</v-btn>
				<v-btn @click="onExportExcel" color="primary" variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-microsoft-excel</v-icon>
					Xuất Excel
				</v-btn>
			</v-card-text>

			<v-divider v-if="hasStudents" />

			<!-- Khu vực thông báo — tách riêng khỏi toolbar -->
			<v-card-text v-if="hasStudents" class="py-2 d-flex flex-column ga-2">
				<!-- Gợi ý khóa cột điểm khi đã nhập đủ — ưu tiên hiển thị đầu -->
				<v-alert v-if="showSuggestLockAlert" type="success" variant="tonal" density="compact" closable
					@click:close="onDismissSuggestLock">
					<div class="d-flex align-center justify-space-between flex-wrap ga-3">
						<div>
							<div class="text-body-2 font-weight-bold">
								Đã nhập đủ điểm —
								{{ suggestLockColumns.length === 1
								? '"' + suggestLockColumns[0].title + '"'
								: suggestLockColumns.length + ' cột' }}
								sẵn sàng chốt!
							</div>
							<div class="text-caption text-medium-emphasis mt-1">
								Khóa cột điểm để chốt dữ liệu, giáo viên sẽ không thể chỉnh sửa thêm.
								<template v-if="suggestLockColumns.length > 1">
									<br />Các cột: <span class="font-weight-medium">{{ suggestLockColumns.map(c =>
										c.title).join(' · ') }}</span>
								</template>
							</div>
						</div>
						<div class="d-flex ga-2">
							<v-btn size="small" color="success" variant="flat" @click.stop="onLockSuggestedColumns">
								<v-icon start size="small">mdi-lock-check</v-icon>
								Chốt &amp; khóa ngay
							</v-btn>
							<v-btn size="small" color="success" variant="text" @click.stop="onOpenDialogKhoaCotDiem">
								Tự chọn cột
							</v-btn>
						</div>
					</div>
				</v-alert>

				<!-- Thông báo từ chối -->
				<v-alert v-if="reasonReject.disabled" type="error" variant="tonal" density="compact">
					<div class="text-body-2 font-weight-medium">{{ reasonReject.textPerson }}</div>
					<div class="text-body-2 text-medium-emphasis">
						Lý do: <span class="font-weight-medium">{{ reasonReject.NoiDungNhanXet }}</span>
					</div>
				</v-alert>

				<!-- Hàng thông báo phụ: comment + đổi sao -->
				<div class="d-flex ga-2 flex-wrap">
					<v-alert type="warning" variant="tonal" density="compact" style="width: fit-content">
						<div class="text-caption text-medium-emphasis">
							Comment <b>(màu đỏ)</b> là ô điểm do <b>Giáo viên khác</b> nhập
						</div>
					</v-alert>
					<v-alert v-if="showStarConversionRule" type="info" variant="tonal" density="compact"
						style="width: fit-content">
						<div class="text-caption">
							<b>Đổi sao:</b> ≥9 = 5⭐ · ≥7 = 4⭐ · ≥5 = 3⭐ · còn lại = 2⭐
						</div>
					</v-alert>
				</div>
			</v-card-text>

			<!-- Jexcel Table -->
			<v-card-text class="pa-0 fontSizeCustom" ref="tableWrapper">
				<uc-jexcel v-if="hasStudents" :key="keyComp" v-model="instance" v-model:dataSource="DSHocSinh"
					class="hExcel" :freeze-columns="freezeColumns" :columns="headers" :comments="comments"
					:styleSheet="styleSheet" :nestedHeaders="shouldShowNestedHeaders ? nestedHeaders : []"
					:rootDataSource="DSHocSinh_API" @onChange="onChangeSheet" :filters="true"
					:style="{ '--excel-max-height': excelMaxHeight }" />
				<uc-card-empty v-else />
			</v-card-text>
		</v-card>

		<!-- Dialog Khóa Cột Điểm -->
		<uc-dialog-khoa-cot-diem v-model="action.isShowDialogKhoaCotDiem" :filter="filter"
			:DSKhoaCotDiem_API="DSKhoaCotDiem_API" :DSCotDiem="DSCotDiem_ByMaNhomCotDiem"
			@onKhoaCotDiem="(cd) => onKhoaCotDiem(cd, true)" />

		<!-- Dialog Mẫu Nhận Xét -->
		<uc-dialog-mau-nhan-xet v-model="action.isShowDialogMauNhanXet" :filter="filter" :DSHocSinh="DSHocSinh"
			@onSubmit="onXacNhanMauNhanXet" />

		<!-- ✅ Dialog Confirm tái sử dụng -->
		<v-dialog v-model="action.confirm.show" max-width="460" persistent>
			<v-card rounded="lg">
				<!-- Title -->
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon :color="action.confirm.confirmColor || 'success'" size="22">
						{{ action.confirm.titleIcon || 'mdi-lock-check' }}
					</v-icon>
					<span class="text-body-1 font-weight-bold">{{ action.confirm.title }}</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pt-4 px-4 pb-2">
					<!-- Mô tả chính -->
					<div v-if="action.confirm.description" class="text-body-2 text-medium-emphasis mb-3">
						{{ action.confirm.description }}
					</div>

					<!-- Danh sách cột điểm -->
					<div v-if="action.confirm.columns?.length">
						<div class="text-caption font-weight-medium text-uppercase text-medium-emphasis mb-1">
							{{ action.confirm.columns.length === 1 ? 'Cột điểm sẽ khóa' : action.confirm.columns.length
							+ ' cột điểm sẽ khóa' }}
						</div>
						<v-list density="compact" class="rounded border pa-0 mb-3"
							style="max-height: 220px; overflow-y: auto;">
							<v-list-item v-for="(col, i) in action.confirm.columns" :key="col.value"
								:class="i < action.confirm.columns.length - 1 ? 'border-b' : ''" min-height="36">
								<template v-slot:prepend>
									<v-icon size="16" color="success" class="mr-2">mdi-lock-outline</v-icon>
								</template>
								<v-list-item-title class="text-body-2">{{ col.title }}</v-list-item-title>
								<template v-slot:append>
									<v-chip size="x-small" color="success" variant="tonal">Khóa</v-chip>
								</template>
							</v-list-item>
						</v-list>
					</div>

					<!-- NLPC kèm theo -->
					<!-- <v-alert v-if="action.confirm.nlpcCount > 0" type="warning" variant="tonal" density="compact"
						class="mb-3" icon="mdi-school-outline">
						<div class="text-body-2">
							Kèm theo khóa
							<span class="font-weight-bold">{{ action.confirm.nlpcCount }} môn Năng lực – Phẩm
								chất</span>
							liên quan.
						</div>
					</v-alert> -->

					<!-- Cảnh báo cuối -->
					<div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
						<v-icon size="14">mdi-information-outline</v-icon>
						Giáo viên sẽ không thể chỉnh sửa điểm sau khi khóa.
					</div>
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end ga-2 pa-3">
					<v-btn variant="text" color="grey" @click="onConfirmCancel">Hủy</v-btn>
					<v-btn :color="action.confirm.confirmColor || 'success'" variant="flat" @click="onConfirmOk">
						<v-icon start size="18">{{ action.confirm.confirmIcon || 'mdi-check' }}</v-icon>
						{{ action.confirm.confirmText || 'Xác nhận' }}
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
	export default {
		name: 'BangDiem',
	
		props: {},
	
		data() {
			return {
				vueData,
	
				// Actions
				action: {
					isShowDialogKhoaCotDiem: false,
					isShowDialogMauNhanXet: false,
					showAllLockedColumns: false,
					// ✅ Confirm dialog tái sử dụng
					confirm: {
						show: false,
						title: '',
						description: '',
						titleIcon: 'mdi-lock-check',
						confirmText: 'Xác nhận',
						confirmColor: 'success',
						confirmIcon: 'mdi-check',
						columns: [],      // Danh sách { title, value } cột sẽ khóa
						nlpcCount: 0,     // Số môn NLPC kèm theo
						resolve: null
					}
				},
	
				// Filter
				filter: {
					KhoiItem: null,
					LopItem: null,
					MonHocItem: null,
					MaNhomCotDiemItem: null,
					NienKhoa: vueData.NienKhoa
				},
	
				// Data
				editedCells: [],
				DSKhoaCotDiem_API: [],
				DSCotDiem_ByMaNhomCotDiem: [],
				DSHocSinh_API: [],
				DSHocSinh: [],
				displayColumns: [],
	
				// Tình trạng
				tinhTrangStatus: {
					isDisabled: false,
					TinhTrang: null,
					statusDetail: null
				},
	
				// Gợi ý khóa cột điểm
				suggestLockColumns: [],       // Danh sách cột gợi ý khóa
				dismissedSuggest: false,      // User đã tắt gợi ý này chưa
	
				// Excel height
				excelMaxHeight: '400px',
				_resizeObserver: null,
	
				// Jexcel Config
				headers: [],
				nestedHeaders: [],
				freezeColumns: 3,
				comments: {},
				styleSheet: {},
				instance: null,
				keyComp: 0
			};
		},
	
		computed: {
			/**
			 * Tiêu đề trang
			 */
			pageTitle() {
				return this.vueData.TitlePage || 'Nhập điểm';
			},
	
			/**
			 * Kiểm tra có học sinh không
			 */
			hasStudents() {
				return this.DSHocSinh?.length > 0;
			},
	
			/**
			 * ID môn học hiện tại
			 */
			currentSubjectId() {
				return this.filter.MonHocItem?.MonHocID;
			},
	
			/**
			 * Kiểm tra môn Tiếng Anh
			 */
			isEnglishSubject() {
				return BangDiemService.filter.isEnglishSubject(this.currentSubjectId);
			},
	
			/**
			 * Kiểm tra môn nhóm
			 */
			isGroupSubject() {
				return BangDiemService.filter.isGroupSubject(this.currentSubjectId);
			},
	
			/**
			 * Kiểm tra bị disable
			 */
			isDisabled() {
				if (!this.hasStudents) return true;
				if (this.isAllColumnsLocked) return true;
				return this.tinhTrangStatus?.isDisabled ?? false;
			},
			/**
			* Kiểm tra tất cả cột điểm đã khóa chưa
			*/
			isAllColumnsLocked() {
				if (!this.displayColumns.length) return false;
				return this.displayColumns.every(col => col.isLocked);
			},
			/**
			 * Hiển thị nested headers
			 */
			shouldShowNestedHeaders() {
				return this.filter.MaNhomCotDiemItem?.MaNhomCotDiem === 'TatCa';
			},
	
			/**
			 * Thông tin từ chối
			 */
			reasonReject() {
				const info = BangDiemService.utility.getReasonReject(
					this.DSHocSinh_API,
					this.vueData
				);
	
				return {
					...info,
					textPerson: BangDiemService.utility.renderTextPersonReject(
						info.TinhTrang,
						this.vueData
					)
				};
			},
	
			/**
			 * Hiển thị gợi ý khóa cột điểm khi đã nhập đủ
			 */
			showSuggestLockAlert() {
				return this.hasStudents &&
					!this.isDisabled &&
					!this.dismissedSuggest &&
					this.suggestLockColumns.length > 0;
			},
	
			/**
			 * Hiển thị quy tắc đổi sao
			 */
			showStarConversionRule() {
				return BangDiemService.filter.isMonHocConvertWithStar(this.currentSubjectId) &&
					this.filter.MaNhomCotDiemItem !== null;
			},
	
			/**
			 * Hiển thị nút lấy điểm Test
			 */
			showGetThemeTestButton() {
				if (!this.filter.MaNhomCotDiemItem || this.currentSubjectId !== 76) {
					return false;
				}
				const maNhom = this.filter.MaNhomCotDiemItem.MaNhomCotDiem;
				return ['Theme_2', 'Theme_4', 'Theme_6', 'Theme_8'].includes(maNhom);
			},
			changedCellCount() {
				console.log("editedCells", this.editedCells);
				return this.editedCells.length;
			},
	
			/**
			 * Set các MaCotDiem đang sẵn sàng khóa để chip tra cứu nhanh
			 */
			suggestLockColumnSet() {
				return new Set(this.suggestLockColumns.map(c => c.value));
			}
		},
	
		watch: {
			/**
			 * Watch filter thay đổi
			 */
			filter: {
				handler(newFilter) {
					if (!BangDiemService.filter.isValidFilter(newFilter)) {
						this.resetData();
					}
				},
				deep: true
			}
		},
	
		mounted() {
			this._updateExcelHeight();
			// Theo dõi thay đổi kích thước của toàn bộ card (title, toolbar, alert co giãn)
			this._resizeObserver = new ResizeObserver(() => {
				this._updateExcelHeight();
			});
			this._resizeObserver.observe(this.$el);
		},
	
		beforeUnmount() {
			if (this._resizeObserver) {
				this._resizeObserver.disconnect();
				this._resizeObserver = null;
			}
		},
	
		methods: {
			/**
			 * Kiểm tra cột có sẵn sàng khóa không (dùng cho chip trong header)
			 */
			isColumnReadyToLock(maCotDiem) {
				return this.suggestLockColumnSet.has(maCotDiem);
			},
	
			/**
			 * Đo vị trí top của tableWrapper so với viewport, lấy phần còn lại
			 */
			_updateExcelHeight() {
				this.$nextTick(() => {
					const wrapper = this.$refs.tableWrapper?.$el ?? this.$refs.tableWrapper;
					if (!wrapper) return;
					const top = wrapper.getBoundingClientRect().top;
					const padding = 16; // khoảng thở dưới cùng
					const height = window.innerHeight - top - padding;
					this.excelMaxHeight = Math.max(height, 200) + 'px';
				});
			},
	
			/**
			 * Kiểm tra và cập nhật danh sách cột gợi ý khóa
			 * Không reset dismissedSuggest khi refresh — alert chỉ xuất hiện 1 lần,
			 * sau đó dùng chip + badge để nhắc nhở.
			 */
			checkSuggestLock() {
				const newSuggest = BangDiemService.data.getColumnsReadyToLock(
					this.DSHocSinh,
					this.DSCotDiem_ByMaNhomCotDiem,
					this.displayColumns,
					this.DSHocSinh_API
				);
				// Nếu danh sách cột gợi ý thay đổi (ví dụ: thêm cột mới đủ điều kiện)
				// thì reset dismissedSuggest để alert hiển thị lại
				const oldKeys = this.suggestLockColumns.map(c => c.value).sort().join(',');
				const newKeys = newSuggest.map(c => c.value).sort().join(',');
				if (newKeys !== oldKeys) {
					this.dismissedSuggest = false;
				}
				this.suggestLockColumns = newSuggest;
			},
	
			/**
			 * Tắt gợi ý khóa (user chủ động bỏ qua)
			 */
			onDismissSuggestLock() {
				this.dismissedSuggest = true;
			},
	
			// ============================================================
			// ✅ CONFIRM DIALOG — tái sử dụng cho mọi action cần xác nhận
			// ============================================================

			/**
			 * Mở confirm dialog, trả về Promise<boolean>
			 * @param {string} title
			 * @param {object} options - { description, columns, nlpcCount, confirmText, confirmColor, confirmIcon, titleIcon }
			 */
			openConfirm(title, options = {}) {
				return new Promise(resolve => {
					this.action.confirm = {
						show: true,
						title,
						description: options.description || '',
						titleIcon: options.titleIcon || 'mdi-lock-check',
						confirmText: options.confirmText || 'Xác nhận',
						confirmColor: options.confirmColor || 'success',
						confirmIcon: options.confirmIcon || 'mdi-check',
						columns: options.columns || [],
						nlpcCount: options.nlpcCount || 0,
						resolve
					};
				});
			},

			onConfirmOk() {
				this.action.confirm.resolve?.(true);
				this.action.confirm.show = false;
			},

			onConfirmCancel() {
				this.action.confirm.resolve?.(false);
				this.action.confirm.show = false;
			},

			// ============================================================
			// COLUMN LOCK
			// ============================================================

			/**
			 * Khóa ngay các cột được gợi ý — có confirm trước, kèm khóa môn NLPC nếu có
			 */
			async onLockSuggestedColumns() {
				const nlpcIDList = this.filter.MonHocItem?.List_MonHoc_NLPC_ID
					? this.filter.MonHocItem.List_MonHoc_NLPC_ID.split(',').map(id => id.trim()).filter(Boolean)
					: [];
				const hasNLPC = nlpcIDList.length > 0;

				const confirmed = await this.openConfirm(
					'Xác nhận khóa cột điểm',
					{
						description: 'Sau khi khóa, giáo viên sẽ không thể chỉnh sửa điểm ở các cột bên dưới.',
						columns: this.suggestLockColumns,
						nlpcCount: hasNLPC ? nlpcIDList.length : 0,
						confirmText: 'Chốt & khóa ngay',
						confirmColor: 'success',
						confirmIcon: 'mdi-lock-check',
						titleIcon: 'mdi-lock-check'
					}
				);
				if (!confirmed) return;

				try {
					// 1️⃣ Khóa các cột môn chính
					for (const cotDiem of this.suggestLockColumns) {
						await BangDiemService.api.toggleKhoaCotDiem({
							LopID: this.filter.LopItem.LopID,
							MonHocLopID: this.filter.MonHocItem.MonHocLopID,
							MaCotDiem: cotDiem.value,
							IsKhoaCotDiem: true
						});
					}

					// 2️⃣ Khóa các môn NLPC đi kèm (nếu có)
					if (hasNLPC) {
						for (const monHocID of nlpcIDList) {
							try {
								const monHocIDNum = parseInt(monHocID);
								const monHocLopList = await BangDiemService.api.getMonHocLopByMonHocID({
									MonHocID: monHocIDNum,
									LopID: this.filter.LopItem.LopID,
									NienKhoa: this.vueData.NienKhoa
								});
								const MonHocLopID = monHocLopList?.[0]?.MonHocLopID;
								if (!MonHocLopID) {
									console.warn(`⚠️ Không tìm thấy MonHocLopID cho MonHocID: ${monHocIDNum}`);
									continue;
								}
								const maCotDiemList = [
									...new Set(
										this.DSHocSinh_API
											.filter(x => x.MonHocID === monHocIDNum)
											.map(x => x.MaCotDiem)
									)
								];
								for (const maCotDiem of maCotDiemList) {
									await BangDiemService.api.toggleKhoaCotDiem({
										LopID: this.filter.LopItem.LopID,
										MonHocLopID,
										MaCotDiem: maCotDiem,
										IsKhoaCotDiem: true
									});
								}
								console.log(`✅ Đã khóa ${maCotDiemList.length} cột môn NLPC MonHocID: ${monHocIDNum}`);
							} catch (nlpcError) {
								console.error(`❌ Lỗi khi khóa môn NLPC MonHocID ${monHocID}:`, nlpcError);
							}
						}
					}

					Vue.$toast.success(
						hasNLPC ? 'Đã khóa cột điểm và các môn Năng lực – Phẩm chất đi kèm!' : 'Đã khóa các cột điểm đã nhập đủ!',
						{ position: 'top' }
					);
					await this.onRefresh();
				} catch (error) {
					console.error('onLockSuggestedColumns error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi khóa cột điểm!', { position: 'top' });
				}
			},
	
			/**
			 * Reset dữ liệu
			 */
			resetData() {
				this.DSHocSinh_API = [];
				this.DSHocSinh = [];
				this.headers = [];
				this.nestedHeaders = [];
				this.displayColumns = [];
				this.keyComp++;
			},
	
			/**
			 * Refresh dữ liệu
			 */
			async onRefresh() {
				try {
					const result = await BangDiemService.initialize(this.filter, this.vueData);
	
					// Cập nhật data
					this.DSHocSinh = result.students;
					this.DSHocSinh_API = result.apiData;
					this.headers = result.headers;
					this.nestedHeaders = result.nestedHeaders;
					this.freezeColumns = result.freezeColumns;
					this.styleSheet = result.styleSheet;
					this.comments = result.comments;
					this.DSKhoaCotDiem_API = result.lockedColumns;
					this.DSCotDiem_ByMaNhomCotDiem = result.DSCotDiem_ByMaNhomCotDiem;
					this.displayColumns = result.displayColumns;
	
	
					// ✅ Auto-mark các ô có default value vào editedCells
					const defaultCells = [];
					result.students.forEach((student, rowIndex) => {
						result.DSCotDiem_ByMaNhomCotDiem.forEach((cotDiem, colIndex) => {
							const apiRow = result.apiData.find(
								x => x.HocSinhID === student.HocSinhID
									&& x.MaCotDiem === cotDiem.value
							);
							// Chỉ mark nếu KQHTID = 0 (chưa lưu) nhưng có default value
							if (apiRow?.KQHTID === 0 && student[cotDiem.value] != null && student[cotDiem.value] !== '') {
								defaultCells.push({
									x: colIndex + result.freezeColumns,
									y: rowIndex,
									value: student[cotDiem.value]
								});
							}
						});
					});
	
					// Cập nhật Tình Trạng Status
					this.tinhTrangStatus = result.tinhTrangStatus;
	
					this.editedCells = defaultCells; // ✅ reactive trong Vue 3
	
					// ✅ Kiểm tra gợi ý khóa cột điểm
					this.checkSuggestLock();
	
					// Re-render
					this.keyComp++;
				} catch (error) {
					console.error('onRefresh error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi tải dữ liệu!', { position: 'top' });
				}
			},
	
			/**
			 * Xử lý thay đổi sheet
			 */
			onChangeSheet(options) {
				setTimeout(() => {
					this.processChange(options);
				}, 0);
			},
	
			/**
			 * Process change
			 */
			processChange({ instance, cell, x, y, value }) {
				const existingIndex = this.editedCells.findIndex(c => c.x == x && c.y == y);
	
				if (existingIndex === -1) {
					// ✅ Tạo array mới để Vue track được
					this.editedCells = [...this.editedCells, {
						x,
						y,
						cellName: instance.getValueFromCoords(x, y),
						value
					}];
				} else {
					// ✅ Tạo array mới với item được update
					const updated = [...this.editedCells];
					updated[existingIndex] = { ...updated[existingIndex], value };
					this.editedCells = updated;
				}
			},
	
			/**
			* Lưu tạm
			*/
			async onLuuTam() {
				try {
					// 1. Lưu dữ liệu điểm
					const success = await BangDiemService.saveData(
						this.editedCells,
						this.DSHocSinh,
						this.DSHocSinh_API,
						this.freezeColumns,
						{ ...this.filter, NienKhoa: this.vueData.NienKhoa },
						this.instance,
						this.vueData
					);
	
					if (!success) return;
	
					// 2. Cập nhật tình trạng (bao gồm cả NLPC nếu là Cấp 1)
					await BangDiemService.saveDraft(this.filter, this.vueData);
	
					Vue.$toast.success('Lưu dữ liệu thành công!', { position: 'top' });
					await this.onRefresh();
				} catch (error) {
					console.error('onLuuTam error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi lưu dữ liệu!', { position: 'top' });
				}
			},
	
			/**
			 * Gửi BGH
			 */
			async onGuiBGH() {
				try {
					// Lưu dữ liệu trước
					const success = await BangDiemService.saveData(
						this.editedCells,
						this.DSHocSinh,
						this.DSHocSinh_API,
						this.freezeColumns,
						{ ...this.filter, NienKhoa: this.vueData.NienKhoa },
						this.instance,
						this.vueData
					);
	
					if (!success) return;
	
					// Gửi BGH
					await BangDiemService.sendToBGH(this.filter, this.vueData);
	
					Vue.$toast.success('Gửi BGH thành công!', { position: 'top' });
					await this.onRefresh();
				} catch (error) {
					console.error('onGuiBGH error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi gửi BGH!', { position: 'top' });
				}
			},
	
			/**
			 * Mở dialog khóa cột điểm
			 */
			onOpenDialogKhoaCotDiem() {
				const isSaved = this.DSHocSinh_API.some(hs => hs.KQHTID);
				if (!isSaved) {
					Vue.$toast.warning('Chưa có dữ liệu được lưu. Vui lòng lưu tạm trước khi khóa cột điểm!', { position: 'top' });
					return;
				}
	
				this.action.isShowDialogKhoaCotDiem = true;
			},
			/**
			 * Khóa cột điểm
			 */
			async onKhoaCotDiem(cd, isLock) {
				try {
					await BangDiemService.api.toggleKhoaCotDiem({
						LopID: this.filter.LopItem.LopID,
						MonHocLopID: this.filter.MonHocItem.MonHocLopID,
						MaCotDiem: cd,
						IsKhoaCotDiem: isLock
					});
	
					Vue.$toast.success(
						`${isLock ? 'Khóa' : 'Mở khóa'} cột điểm thành công!`,
						{ position: 'top' }
					);
	
					await this.onRefresh();
				} catch (error) {
					console.error('onKhoaCotDiem error:', error);
					Vue.$toast.error('Có lỗi xảy ra!', { position: 'top' });
				}
			},
	
			/**
			 * Mở dialog mẫu nhận xét
			 */
			onOpenMauNhanXet() {
				this.action.isShowDialogMauNhanXet = true;
			},
	
			/**
			 * Xác nhận mẫu nhận xét
			 */
			onXacNhanMauNhanXet(dshs) {
				this.DSHocSinh = dshs;
				this.keyComp++;
			},
	
			/**
			 * Lấy điểm Test (Theme)
			 */
			async onGetDiemTest() {
				try {
					const updatedStudents = await BangDiemService.utility.getThemeTestScore(
						this.filter,
						this.DSHocSinh
					);
	
					// ✅ Lấy tên cột Theme (e.g., Theme2_TST, Theme4_TST...)
					const mappingConfig = CONSTANTS.THEME_MAPPING[
						this.filter.MaNhomCotDiemItem.MaNhomCotDiem
					];
	
					if (mappingConfig) {
						const targetColumn = mappingConfig.target;
						const colIndex = this.headers.findIndex(h => h.name === targetColumn);
	
						// ✅ Scan từng student, nếu có giá trị mới → add vào editedCells
						updatedStudents.forEach((student, rowIndex) => {
							if (student[targetColumn] != null && student[targetColumn] !== '') {
								this.editedCells = [...this.editedCells, {
									x: colIndex,
									y: rowIndex,
									cellName: targetColumn,
									value: student[targetColumn]
								}];
							}
						});
					}
	
					this.DSHocSinh = updatedStudents;
					this.keyComp++;
	
					Vue.$toast.success('Lấy điểm Test thành công!', { position: 'top' });
				} catch (error) {
					console.error('onGetDiemTest error:', error);
					Vue.$toast.error('Có lỗi xảy ra!', { position: 'top' });
				}
			},
	
			/**
			 * Export Excel
			 */
			onExportExcel() {
				try {
					const exportData = BangDiemService.export.prepareExportData(
						this.DSHocSinh,
						this.DSCotDiem_ByMaNhomCotDiem,
						this.instance,
						this.freezeColumns,
						this.filter
					);
	
					const fileName = `Bang_Diem_Lop_${this.filter.LopItem.TenLop}_${this.filter.MonHocItem.MonHocName}.xlsx`;
	
					BangDiemService.export.exportExcel(
						this.headers,
						exportData,
						fileName
					);
	
					Vue.$toast.success('Xuất Excel thành công!', { position: 'top' });
				} catch (error) {
					console.error('onExportExcel error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi xuất Excel!', { position: 'top' });
				}
		}
	}
}
</script>