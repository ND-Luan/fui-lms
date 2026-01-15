<template>
	<div>
		<v-card>
			<v-card-title>
				{{ pageTitle }} <span v-if="vueData.CapID">• Cấp {{ vueData.CapID }}</span>
				<v-chip v-if="hasStudents" color="primary">
					Tổng số học sinh: {{ DSHocSinh.length }}
				</v-chip>
				<v-chip v-if="hasStudents" color="tinhTrangStatus?.statusDetail?.color">
					{{tinhTrangStatus?.statusDetail?.text}}
				</v-chip>
			</v-card-title>

			<v-card-text>
				<uc-filter v-model="filter" @onRefresh="onRefresh" />
			</v-card-text>

			<v-divider />

			<v-card-text class="d-flex mt-2">
				<div>
					<!-- Lưu ý Comment -->
					<div>
						<span class="text-caption">
							*Lưu ý: Comment (Màu đỏ) trong ô nhập điểm là các ô điểm <b>Giáo viên khác</b> đã nhập
						</span>
					</div>

					<!-- Thông báo từ chối -->
					<div v-show="hasStudents && reasonReject.disabled" class="text-black text-body-2">
						<p class="text-body-2 font-weight-medium">
							{{ reasonReject.textPerson }}
						</p>
						<p>
							Lý do từ chối:
							<span class="text-red">{{ reasonReject.NoiDungNhanXet }}</span>
						</p>
					</div>

					<!-- Quy tắc đổi sao -->
					<div v-if="showStarConversionRule" class="text-caption">
						<span>
							<b class="text-primary">Quy tắc đổi sao:</b>
							Điểm <v-icon start size="x-small" class="mb-1">mdi-greater-than-or-equal</v-icon>
							9 là <b class="text-red">5</b>
							<v-icon color="primary" start size="small" class="mb-1">mdi-star</v-icon>
						</span>
						<span>
							; Điểm <v-icon start size="x-small" class="mb-1">mdi-greater-than-or-equal</v-icon>
							7 là <b class="text-red">4</b>
							<v-icon color="primary" start size="small" class="mb-1">mdi-star</v-icon>
						</span>
						<span>
							; Điểm <v-icon start size="x-small" class="mb-1">mdi-greater-than-or-equal</v-icon>
							5 là <b class="text-red">3</b>
							<v-icon color="primary" start size="small" class="mb-1">mdi-star</v-icon>
						</span>
						<span>
							; Còn lại là <b class="text-red">2</b>
							<v-icon color="primary" start size="small" class="mb-1">mdi-star</v-icon>
						</span>
					</div>
				</div>

				<v-spacer />

				<!-- Menu Actions -->
				<v-menu>
					<template v-slot:activator="{ props }">
						<v-btn color="primary" v-bind="props" icon="mdi-dots-vertical" size="small"
							variant="outlined" />
					</template>
					<v-list>
						<v-list-subheader>Thao tác</v-list-subheader>
						<v-list-item title="Lưu tạm" @click="onLuuTam" prepend-icon="mdi-content-save-outline" />
						<v-list-item title="Khóa cột điểm" @click="onOpenDialogKhoaCotDiem"
							prepend-icon="mdi-lock-outline" />
						<v-list-item title="Gửi BGH" @click="onGuiBGH" prepend-icon="mdi-send-outline" />
						<v-divider />
						<v-list-subheader>Khác</v-list-subheader>
						<v-list-item title="Mẫu nhận xét" @click="onOpenMauNhanXet" />
						<v-list-item v-if="showGetThemeTestButton" title="Lấy điểm Test (Theme)"
							@click="onGetDiemTest" />
						<v-divider />
						<v-list-item title="Xuất Excel" @click="onExportExcel" />
					</v-list>
				</v-menu>
			</v-card-text>
			<!-- Jexcel Table -->
			<v-card-text class="pa-0">
				<uc-jexcel v-if="hasStudents" :key="keyComp" v-model="instance" v-model:dataSource="DSHocSinh"
					class="hExcel" :freeze-columns="freezeColumns" :columns="headers" :comments="comments"
					:styleSheet="styleSheet" :nestedHeaders="shouldShowNestedHeaders ? nestedHeaders : []"
					:rootDataSource="DSHocSinh_API" @onChange="onChangeSheet" :filters="true" :search="true" />
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
				const existingIndex = this.editedCells.findIndex(c => c.x === x && c.y === y);
	
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
	
					// Cập nhật tình trạng nếu cần
					if ([2, 3].includes(this.vueData.CapID)) {
						await BangDiemService.api.updateTinhTrangC2C3({
							NienKhoa: this.vueData.NienKhoa,
							LopID: this.filter.LopItem.LopID,
							MonHocLopID: this.filter.MonHocItem.MonHocLopID,
							MaNhomCotDiem: this.filter.MaNhomCotDiemItem.MaNhomCotDiem,
							TinhTrang: 1
						});
					} else {
						await BangDiemService.api.updateTinhTrang({
							NienKhoa: this.vueData.NienKhoa,
							MonHocLopID: this.filter.MonHocItem.MonHocLopID,
							LopID: this.filter.LopItem.LopID,
							TinhTrang: 1,
							MaNhomCotDiem: this.filter.MaNhomCotDiemItem.MaNhomCotDiem
						});
					}
	
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