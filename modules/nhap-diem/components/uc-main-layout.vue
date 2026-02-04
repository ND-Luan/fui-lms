<template>
	<div>
		<v-card>
			<!-- Header -->
			<v-card-title class="d-flex align-center flex-wrap ga-2">
				<span>{{ pageTitle }}</span>
				<span v-if="vueData.CapID">• Cấp {{ vueData.CapID }}</span>
				<v-chip v-if="hasStudents" color="primary" size="small">
					{{ DSHocSinh.length }} học sinh
				</v-chip>
				<!-- Danh sách cột điểm -->
				<div v-if="hasStudents && displayColumns.length > 0" >
					<div class="d-flex flex-wrap ga-2 align-center">
						<!-- Hiển thị 5 cột đầu tiên -->
						<v-chip v-for="cotDiem in displayColumns.slice(0, 5)" :key="cotDiem.value"
							:color="cotDiem.isLocked ? 'primary' : 'grey'"
							:variant="cotDiem.isLocked ? 'flat' : 'outlined'" size="small" label>
							<v-icon start v-if="cotDiem.isLocked" size="small" color="white">mdi-lock</v-icon>
							<v-icon start v-else size="small" color="grey">mdi-lock-open-variant-outline</v-icon>
							{{ cotDiem.title }}
						</v-chip>

						<!-- Menu cho các cột còn lại nếu > 5 -->
						<v-menu v-if="displayColumns.length > 5" offset-y>
							<template v-slot:activator="{ props }">
								<v-chip v-bind="props" color="grey-lighten-1" variant="outlined" size="small" label>
									+{{ displayColumns.length - 5 }} cột khác
								</v-chip>
							</template>
							<v-list density="compact" max-height="300" class="overflow-y-auto">
								<v-list-item v-for="cotDiem in displayColumns.slice(5)" :key="cotDiem.value">
									<template v-slot:prepend>
										<v-icon v-if="cotDiem.isLocked" size="small" start>mdi-lock</v-icon>
										<v-icon v-else size="small" color="grey"
											start>mdi-lock-open-variant-outline</v-icon>
									</template>
									<v-list-item-title>{{ cotDiem.title }}</v-list-item-title>
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
			<v-card-text class="d-flex align-center ga-2">
				<div class="d-flex ga-2 flex-wrap mt-2">
					<!-- Lưu ý Comment -->
					<v-alert v-if="hasStudents" type="warning" variant="tonal" style="width: fit-content">
						<div class="text-caption text-medium-emphasis">
							Comment (Màu đỏ) trong ô nhập điểm là các ô điểm <b>Giáo viên khác</b> đã nhập
						</div>
					</v-alert>
					<!-- Quy tắc đổi sao -->
					<v-alert v-if="showStarConversionRule" type="info" variant="tonal" density="compact">
						<div class="text-caption">
							<b>Quy tắc đổi sao:</b>
							Điểm ≥9 = 5⭐, ≥7 = 4⭐, ≥5 = 3⭐, còn lại = 2⭐
						</div>
					</v-alert>
					<!-- Thông báo từ chối -->
					<v-alert v-if="hasStudents && reasonReject.disabled" type="warning" variant="tonal"
						density="compact" class="mb-2">
						<div class="text-body-2 font-weight-medium">{{ reasonReject.textPerson }}</div>
						<div class="text-body-2">
							Lý do: <span class="font-weight-medium">{{ reasonReject.NoiDungNhanXet }}</span>
						</div>
					</v-alert>
				</div>
				<v-spacer />
				<!-- Menu Actions -->
				<v-menu location="bottom end">
					<template v-slot:activator="{ props }">
						<v-btn color="primary" v-bind="props" icon="mdi-dots-vertical" size="small"
							variant="outlined" />
					</template>
					<v-list density="compact">
						<v-list-subheader>Thao tác</v-list-subheader>
						<v-list-item title="Lưu tạm" @click="onLuuTam" prepend-icon="mdi-content-save-outline" />
						<v-list-item title="Khóa cột điểm" @click="onOpenDialogKhoaCotDiem"
							prepend-icon="mdi-lock-outline" />
						<!-- <v-list-item title="Gửi BGH" @click="onGuiBGH" prepend-icon="mdi-send-outline" /> -->
						<v-divider class="my-1" />

						<v-list-subheader>Khác</v-list-subheader>
						<v-list-item v-if="filter.MonHocItem?.MonHocID === 5" title="Mẫu nhận xét"
							@click="onOpenMauNhanXet" prepend-icon="mdi-comment-text-outline" />
						<v-list-item v-if="showGetThemeTestButton" title="Lấy điểm Test (Theme)" @click="onGetDiemTest"
							prepend-icon="mdi-download-outline" />
						<v-list-item title="Xuất Excel" @click="onExportExcel" prepend-icon="mdi-file-excel-outline" />
					</v-list>
				</v-menu>
			</v-card-text>

			<!-- Jexcel Table -->
			<v-card-text class="pa-0">
				<uc-jexcel v-if="hasStudents" :key="keyComp" v-model="instance" v-model:dataSource="DSHocSinh"
					class="hExcel" :freeze-columns="freezeColumns" :columns="headers" :comments="comments"
					:styleSheet="styleSheet" :nestedHeaders="shouldShowNestedHeaders ? nestedHeaders : []"
					:rootDataSource="DSHocSinh_API" @onChange="onChangeSheet" :filters="true" />
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
					isShowDialogMauNhanXet: false
				},
	
				// Filter
				filter: {
					KhoiItem: null,
					LopItem: null,
					MonHocItem: null,
					MaNhomCotDiemItem: null
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
				return this.tinhTrangStatus?.isDisabled ?? false;
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
	
		methods: {
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
	
					// Cập nhật Tình Trạng Status
					this.tinhTrangStatus = result.tinhTrangStatus;
	
					// Reset edited cells
					this.editedCells = [];
	
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
				console.log("cell, x, y, value", cell, x, y, value)
				if (existingIndex === -1) {
					// Thêm mới
					this.editedCells.push({
						x,
						y,
						cellName: instance.getValueFromCoords(x, y),
						value
					});
				} else {
					// Cập nhật
					this.editedCells[existingIndex].value = value;
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
	
					this.DSHocSinh = updatedStudents;
					this.keyComp++;
	
					Vue.$toast.success('Lấy điểm Test thành công!', { position: 'top' });
				} catch (error) {
					console.error('onGetDiemTest error:', error);
					Vue.$toast.error('Có lỗi xảy ra khi lấy điểm Test!', { position: 'top' });
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