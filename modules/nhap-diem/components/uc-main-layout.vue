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
							<v-chip v-bind="props" color="primary" variant="flat" size="small" label style="cursor:pointer">
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

					<!-- Chưa khóa hết -->
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
									<v-icon start v-else-if="isColumnReadyToLock(cotDiem.value)" size="small" color="warning">mdi-lock-clock</v-icon>
									<v-icon start v-else size="small" color="grey">mdi-lock-open-variant-outline</v-icon>
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
									<v-icon v-if="displayColumns.slice(5).some(c => isColumnReadyToLock(c.value))" end size="x-small">mdi-lock-clock</v-icon>
								</v-chip>
							</template>
							<v-list density="compact" max-height="300" class="overflow-y-auto">
								<v-list-item v-for="cotDiem in displayColumns.slice(5)" :key="cotDiem.value">
									<template v-slot:prepend>
										<v-icon v-if="cotDiem.isLocked" size="small" start>mdi-lock</v-icon>
										<v-icon v-else-if="isColumnReadyToLock(cotDiem.value)" size="small" color="warning" start>mdi-lock-clock</v-icon>
										<v-icon v-else size="small" color="grey" start>mdi-lock-open-variant-outline</v-icon>
									</template>
									<v-list-item-title>
										{{ cotDiem.title }}
										<span v-if="isColumnReadyToLock(cotDiem.value)" class="text-caption text-warning ml-1">· sẵn sàng khóa</span>
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

			<!-- Toolbar -->
			<v-card-text class="py-2 d-flex align-center ga-2 flex-wrap">
				<v-btn v-if="!isAllColumnsLocked" @click="onLuuTam" color="grey" variant="outlined" :disabled="isDisabled" size="small">
					<v-icon start>mdi-content-save</v-icon>
					Lưu tạm
					<v-badge v-if="changedCellCount > 0" :content="changedCellCount" color="primary" inline class="ml-1" />
				</v-btn>

				<!-- Nút Khóa cột điểm — mở dialog chọn cột, default check hết -->
				<v-btn v-if="hasStudents && !isAllColumnsLocked" @click="onOpenLockDialog" color="teal" variant="outlined" :disabled="isDisabled" size="small">
					<v-icon start>mdi-lock</v-icon>
					Khóa cột điểm
					<v-badge v-if="!dismissedSuggest && suggestLockColumns.length > 0" :content="suggestLockColumns.length" color="warning" inline class="ml-1" />
				</v-btn>

				<v-btn v-if="filter.MonHocItem?.MonHocID === 5" @click="onOpenMauNhanXet" color="primary" variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-comment-text-outline</v-icon>
					Mẫu nhận xét
				</v-btn>

				<v-btn v-if="showGetThemeTestButton" @click="onGetDiemTest" color="primary" variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-download-outline</v-icon>
					Lấy điểm Test
				</v-btn>

				<v-btn @click="onExportExcel" color="primary" variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-microsoft-excel</v-icon>
					Xuất Excel
				</v-btn>
			</v-card-text>

			<v-divider v-if="hasStudents" />

			<!-- Khu vực thông báo -->
			<v-card-text v-if="hasStudents" class="py-2 d-flex flex-column ga-2">
				<!-- Gợi ý khóa cột điểm khi đã nhập đủ -->
				<v-alert v-if="showSuggestLockAlert" type="success" variant="tonal" density="compact" closable @click:close="onDismissSuggestLock">
					<div class="d-flex align-center justify-space-between flex-wrap ga-3">
						<div>
							<div class="text-body-2 font-weight-bold">
								Đã nhập đủ điểm —
								{{ suggestLockColumns.length === 1 ? '"' + suggestLockColumns[0].title + '"' : suggestLockColumns.length + ' cột' }}
								sẵn sàng chốt!
							</div>
							<div class="text-caption text-medium-emphasis mt-1">
								Khóa cột điểm để chốt dữ liệu, giáo viên sẽ không thể chỉnh sửa thêm.
								<template v-if="suggestLockColumns.length > 1">
									<br />Các cột: <span class="font-weight-medium">{{ suggestLockColumns.map(c => c.title).join(' · ') }}</span>
								</template>
							</div>
						</div>
						<div class="d-flex ga-2">
							<v-btn size="small" color="success" variant="flat" @click.stop="onLockSuggestedColumns">
								<v-icon start size="small">mdi-lock-check</v-icon>
								Chốt &amp; khóa ngay
							</v-btn>
							<v-btn size="small" color="success" variant="text" @click.stop="onOpenLockDialog">
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

				<!-- Hàng thông báo phụ -->
				<div class="d-flex ga-2 flex-wrap">
					<v-alert type="warning" variant="tonal" density="compact" style="width: fit-content">
						<div class="text-caption text-medium-emphasis">
							Comment <b>(màu đỏ)</b> là ô điểm do <b>Giáo viên khác</b> nhập
						</div>
					</v-alert>
					<v-alert v-if="showStarConversionRule" type="info" variant="tonal" density="compact" style="width: fit-content">
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
		<v-dialog v-model="action.lockDialog.show" max-width="480" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon color="teal" size="22">mdi-lock</v-icon>
					<span class="text-body-1 font-weight-bold">Khóa cột điểm</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pt-3 px-4 pb-2">
					<div class="text-body-2 text-medium-emphasis mb-3">
						Chọn các cột điểm muốn khóa. Giáo viên sẽ không thể chỉnh sửa sau khi khóa.
					</div>

					<!-- Check all — chỉ tính cột nhập tay chưa khóa -->
					<div class="d-flex align-center mb-1">
						<v-checkbox
							:model-value="action.lockDialog.selectedColumns.length === selectableColumns.length && selectableColumns.length > 0"
							:indeterminate="action.lockDialog.selectedColumns.length > 0 && action.lockDialog.selectedColumns.length < selectableColumns.length"
							@update:model-value="onToggleSelectAllLockColumns"
							density="compact" hide-details color="teal">
							<template v-slot:label>
								<span class="text-body-2 font-weight-medium">Chọn tất cả</span>
								<span class="text-caption text-medium-emphasis ml-2">({{ action.lockDialog.selectedColumns.length }}/{{ selectableColumns.length }})</span>
							</template>
						</v-checkbox>
					</div>

					<v-divider class="mb-1" />

					<v-list density="compact" class="rounded border pa-0" style="max-height: 260px; overflow-y: auto;">
						<v-list-item v-for="(col, i) in lockableColumns" :key="col.value"
							:class="i < lockableColumns.length - 1 ? 'border-b' : ''" min-height="40"
							:disabled="col.isLocked"
							@click="!col.isLocked && onToggleLockColumn(col.value)">
							<template v-slot:prepend>
								<v-checkbox-btn
									:model-value="col.isLocked || action.lockDialog.selectedColumns.includes(col.value)"
									:disabled="col.isLocked"
									@update:model-value="onToggleLockColumn(col.value)"
									color="teal" density="compact" />
							</template>
							<v-list-item-title class="text-body-2">{{ col.title }}</v-list-item-title>
							<template v-slot:append>
								<v-chip v-if="col.isLocked" size="x-small" color="primary" variant="flat">Đã khóa</v-chip>
								<v-chip v-else-if="isColumnReadyToLock(col.value)" size="x-small" color="warning" variant="tonal">Đủ điểm</v-chip>
							</template>
						</v-list-item>
					</v-list>
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end ga-2 pa-3">
					<v-btn variant="text" color="grey" @click="action.lockDialog.show = false">Hủy</v-btn>
					<v-btn color="teal" variant="flat" :disabled="action.lockDialog.selectedColumns.length === 0" @click="onConfirmLockColumns">
						<v-icon start size="18">mdi-lock-check</v-icon>
						Khóa {{ action.lockDialog.selectedColumns.length }} cột
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Mẫu Nhận Xét -->
		<uc-dialog-mau-nhan-xet v-model="action.isShowDialogMauNhanXet" :filter="filter" :DSHocSinh="DSHocSinh"
			@onSubmit="onXacNhanMauNhanXet" />

	</div>
</template>

<script>
export default {
	name: 'BangDiem',

	props: {},

	data() {
		return {
			vueData,

			action: {
				isShowDialogMauNhanXet: false,
				showAllLockedColumns: false,
				lockDialog: {
					show: false,
					selectedColumns: []
				}
			},

			filter: {
				KhoiItem: null,
				LopItem: null,
				MonHocItem: null,
				MaNhomCotDiemItem: null,
				NienKhoa: vueData.NienKhoa
			},

			editedCells: [],
			DSKhoaCotDiem_API: [],
			DSCotDiem_ByMaNhomCotDiem: [],
			DSHocSinh_API: [],
			DSHocSinh: [],
			displayColumns: [],

			tinhTrangStatus: {
				isDisabled: false,
				TinhTrang: null,
				statusDetail: null
			},

			suggestLockColumns: [],
			dismissedSuggest: false,

			excelMaxHeight: '400px',
			_resizeObserver: null,

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
		pageTitle() {
			return this.vueData.TitlePage || 'Nhập điểm';
		},

		hasStudents() {
			return this.DSHocSinh?.length > 0;
		},

		currentSubjectId() {
			return this.filter.MonHocItem?.MonHocID;
		},

		isEnglishSubject() {
			return BangDiemService.filter.isEnglishSubject(this.currentSubjectId);
		},

		isGroupSubject() {
			return BangDiemService.filter.isGroupSubject(this.currentSubjectId);
		},

		isDisabled() {
			if (!this.hasStudents) return true;
			if (this.isAllColumnsLocked) return true;
			return this.tinhTrangStatus?.isDisabled ?? false;
		},

		isAllColumnsLocked() {
			if (!this.displayColumns.length) return false;
			return this.displayColumns.every(col => col.isLocked);
		},

		/** Tất cả cột trong dialog khóa */
		lockableColumns() {
			return this.displayColumns;
		},

		/** Cột có thể tick checkbox (chưa khóa) */
		selectableColumns() {
			return this.displayColumns.filter(col => !col.isLocked);
		},

		shouldShowNestedHeaders() {
			return this.filter.MaNhomCotDiemItem?.MaNhomCotDiem === 'TatCa';
		},

		reasonReject() {
			const info = BangDiemService.utility.getReasonReject(this.DSHocSinh_API, this.vueData);
			return {
				...info,
				textPerson: BangDiemService.utility.renderTextPersonReject(info.TinhTrang, this.vueData)
			};
		},

		showSuggestLockAlert() {
			return this.hasStudents && !this.isDisabled && !this.dismissedSuggest && this.suggestLockColumns.length > 0;
		},

		showStarConversionRule() {
			return BangDiemService.filter.isMonHocConvertWithStar(this.currentSubjectId) && this.filter.MaNhomCotDiemItem !== null;
		},

		showGetThemeTestButton() {
			if (!this.filter.MaNhomCotDiemItem || this.currentSubjectId !== 76) return false;
			return ['Theme_2', 'Theme_4', 'Theme_6', 'Theme_8'].includes(this.filter.MaNhomCotDiemItem.MaNhomCotDiem);
		},

		changedCellCount() {
			console.log("editedCells", this.editedCells);
			return this.editedCells.length;
		},

		suggestLockColumnSet() {
			return new Set(this.suggestLockColumns.map(c => c.value));
		},

		/** Danh sách cột chưa khóa (không phải công thức) — dùng cho onLockAllColumns */
		unlockedColumns() {
			return this.lockableColumns.filter(col => !col.isLocked);
		}
	},

	watch: {
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
		this._resizeObserver = new ResizeObserver(() => { this._updateExcelHeight(); });
		this._resizeObserver.observe(this.$el);
	},

	beforeUnmount() {
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
			this._resizeObserver = null;
		}
	},

	methods: {
		isColumnReadyToLock(maCotDiem) {
			return this.suggestLockColumnSet.has(maCotDiem);
		},

		_updateExcelHeight() {
			this.$nextTick(() => {
				const wrapper = this.$refs.tableWrapper?.$el ?? this.$refs.tableWrapper;
				if (!wrapper) return;
				const top = wrapper.getBoundingClientRect().top;
				const height = window.innerHeight - top - 16;
				this.excelMaxHeight = Math.max(height, 200) + 'px';
			});
		},

		checkSuggestLock() {
			const newSuggest = BangDiemService.data.getColumnsReadyToLock(
				this.DSHocSinh, this.DSCotDiem_ByMaNhomCotDiem, this.displayColumns, this.DSHocSinh_API
			);
			const oldKeys = this.suggestLockColumns.map(c => c.value).sort().join(',');
			const newKeys = newSuggest.map(c => c.value).sort().join(',');
			if (newKeys !== oldKeys) this.dismissedSuggest = false;
			this.suggestLockColumns = newSuggest;
		},

		onDismissSuggestLock() {
			this.dismissedSuggest = true;
		},

		// ============================================================
		// COLUMN LOCK DIALOG
		// ============================================================

		/** Khóa ngay các cột gợi ý từ alert (đã nhập đủ) */
		async onLockSuggestedColumns() {
			this.action.lockDialog.selectedColumns = this.suggestLockColumns.map(c => c.value);
			this.action.lockDialog.show = true;
		},

		// ============================================================
		// COLUMN LOCK DIALOG
		// ============================================================

		onOpenLockDialog() {
			const isSaved = this.DSHocSinh_API.some(hs => hs.KQHTID);
			if (!isSaved) {
				Vue.$toast.warning('Chưa có dữ liệu được lưu. Vui lòng lưu tạm trước khi khóa cột điểm!', { position: 'top' });
				return;
			}
			// Default check hết các cột nhập tay chưa khóa
			this.action.lockDialog.selectedColumns = this.selectableColumns.map(col => col.value);
			this.action.lockDialog.show = true;
		},

		onToggleSelectAllLockColumns(val) {
			if (val) {
				this.action.lockDialog.selectedColumns = this.selectableColumns.map(col => col.value);
			} else {
				this.action.lockDialog.selectedColumns = [];
			}
		},

		onToggleLockColumn(value) {
			const idx = this.action.lockDialog.selectedColumns.indexOf(value);
			if (idx === -1) {
				this.action.lockDialog.selectedColumns = [...this.action.lockDialog.selectedColumns, value];
			} else {
				this.action.lockDialog.selectedColumns = this.action.lockDialog.selectedColumns.filter(v => v !== value);
			}
		},

		async onConfirmLockColumns() {
			const selectedCols = this.lockableColumns.filter(col =>
				this.action.lockDialog.selectedColumns.includes(col.value)
			);
			if (!selectedCols.length) return;

			const nlpcIDList = this.filter.MonHocItem?.List_MonHoc_NLPC_ID
				? this.filter.MonHocItem.List_MonHoc_NLPC_ID.split(',').map(id => id.trim()).filter(Boolean)
				: [];

			this.action.lockDialog.show = false;

			try {
				await BangDiemService.lock.lockColumns(selectedCols, this.filter);
				if (nlpcIDList.length > 0) {
					await BangDiemService.lock.lockNLPCColumns(this.filter, this.vueData, this.DSHocSinh_API);
				}
				Vue.$toast.success(
					nlpcIDList.length > 0
						? 'Đã khóa cột điểm và các môn Năng lực – Phẩm chất đi kèm!'
						: `Đã khóa ${selectedCols.length} cột điểm!`,
					{ position: 'top' }
				);
				await this.onRefresh();
			} catch (error) {
				console.error('onConfirmLockColumns error:', error);
				Vue.$toast.error('Có lỗi xảy ra khi khóa cột điểm!', { position: 'top' });
			}
		},

		// ============================================================
		// DATA
		// ============================================================

		resetData() {
			this.DSHocSinh_API = [];
			this.DSHocSinh = [];
			this.headers = [];
			this.nestedHeaders = [];
			this.displayColumns = [];
			this.keyComp++;
		},

		async onRefresh() {
			try {
				const result = await BangDiemService.initialize(this.filter, this.vueData);

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

				// Auto-mark các ô có default value vào editedCells
				const defaultCells = [];
				result.students.forEach((student, rowIndex) => {
					result.DSCotDiem_ByMaNhomCotDiem.forEach((cotDiem, colIndex) => {
						const apiRow = result.apiData.find(
							x => x.HocSinhID === student.HocSinhID && x.MaCotDiem === cotDiem.value
						);
						if (apiRow?.KQHTID === 0 && student[cotDiem.value] != null && student[cotDiem.value] !== '') {
							defaultCells.push({ x: colIndex + result.freezeColumns, y: rowIndex, value: student[cotDiem.value] });
						}
					});
				});

				this.tinhTrangStatus = result.tinhTrangStatus;
				this.editedCells = defaultCells;
				this.checkSuggestLock();
				this.keyComp++;
			} catch (error) {
				console.error('onRefresh error:', error);
				Vue.$toast.error('Có lỗi xảy ra khi tải dữ liệu!', { position: 'top' });
			}
		},

		onChangeSheet(options) {
			setTimeout(() => { this.processChange(options); }, 0);
		},

		processChange({ instance, cell, x, y, value }) {
			const existingIndex = this.editedCells.findIndex(c => c.x == x && c.y == y);
			if (existingIndex === -1) {
				this.editedCells = [...this.editedCells, { x, y, cellName: instance.getValueFromCoords(x, y), value }];
			} else {
				const updated = [...this.editedCells];
				updated[existingIndex] = { ...updated[existingIndex], value };
				this.editedCells = updated;
			}
		},

		// ============================================================
		// SAVE / SEND
		// ============================================================

		async onLuuTam() {
			try {
				const success = await BangDiemService.saveData(
					this.editedCells, this.DSHocSinh, this.DSHocSinh_API,
					this.freezeColumns, { ...this.filter, NienKhoa: this.vueData.NienKhoa },
					this.instance, this.vueData
				);
				if (!success) return;
				await BangDiemService.saveDraft(this.filter, this.vueData);
				Vue.$toast.success('Lưu dữ liệu thành công!', { position: 'top' });
				await this.onRefresh();
			} catch (error) {
				console.error('onLuuTam error:', error);
				Vue.$toast.error('Có lỗi xảy ra khi lưu dữ liệu!', { position: 'top' });
			}
		},

		async onGuiBGH() {
			try {
				const success = await BangDiemService.saveData(
					this.editedCells, this.DSHocSinh, this.DSHocSinh_API,
					this.freezeColumns, { ...this.filter, NienKhoa: this.vueData.NienKhoa },
					this.instance, this.vueData
				);
				if (!success) return;
				await BangDiemService.sendToBGH(this.filter, this.vueData);
				Vue.$toast.success('Gửi BGH thành công!', { position: 'top' });
				await this.onRefresh();
			} catch (error) {
				console.error('onGuiBGH error:', error);
				Vue.$toast.error('Có lỗi xảy ra khi gửi BGH!', { position: 'top' });
			}
		},

		// ============================================================
		// DIALOG & ACTIONS
		// ============================================================

		onOpenMauNhanXet() {
			this.action.isShowDialogMauNhanXet = true;
		},

		onXacNhanMauNhanXet(dshs) {
			this.DSHocSinh = dshs;
			this.keyComp++;
		},

		async onGetDiemTest() {
			try {
				const updatedStudents = await BangDiemService.utility.getThemeTestScore(this.filter, this.DSHocSinh);
				const mappingConfig = CONSTANTS.THEME_MAPPING[this.filter.MaNhomCotDiemItem.MaNhomCotDiem];

				if (mappingConfig) {
					const targetColumn = mappingConfig.target;
					const colIndex = this.headers.findIndex(h => h.name === targetColumn);
					updatedStudents.forEach((student, rowIndex) => {
						if (student[targetColumn] != null && student[targetColumn] !== '') {
							this.editedCells = [...this.editedCells, { x: colIndex, y: rowIndex, cellName: targetColumn, value: student[targetColumn] }];
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

		onExportExcel() {
			try {
				const exportData = BangDiemService.export.prepareExportData(
					this.DSHocSinh, this.DSCotDiem_ByMaNhomCotDiem, this.instance, this.freezeColumns, this.filter
				);
				const fileName = `Bang_Diem_Lop_${this.filter.LopItem.TenLop}_${this.filter.MonHocItem.MonHocName}.xlsx`;
				BangDiemService.export.exportExcel(this.headers, exportData, fileName);
				Vue.$toast.success('Xuất Excel thành công!', { position: 'top' });
			} catch (error) {
				console.error('onExportExcel error:', error);
				Vue.$toast.error('Có lỗi xảy ra khi xuất Excel!', { position: 'top' });
			}
		}
	}
}
</script>
