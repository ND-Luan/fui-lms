<template>
	<Global>
		<template #header>
			<v-card>
				<v-card-title class="d-flex align-center flex-wrap ga-2">
					<span>Sổ GVCN</span>
					<v-chip color="primary" variant="text" size="small" class="font-weight-medium">
						{{ currentNienKhoa }}
					</v-chip>
					<v-chip v-if="selectedClass" color="primary" variant="text" size="small" class="font-weight-medium">
						{{ selectedClass.TenLop }} (Sĩ số: {{ getSelectedClassStudents().length }})
					</v-chip>
					<v-chip v-if="workflowPeriod" :color="workflowPeriod.MauTinhTrang || 'default'" size="small" variant="tonal">
						{{ workflowPeriod.TenTinhTrang || 'Chưa lưu' }}
					</v-chip>
					<v-spacer /> 
				</v-card-title>
				<v-card-text class="py-1">
					<v-row dense align="center">
						<v-col cols="12" sm="6" md="3">
							<v-select v-model="filter.CapID" :items="capOptions" item-title="text" item-value="value"
								label="Cấp học" density="compact" variant="outlined" hide-details />
						</v-col>
						<v-col cols="12" sm="6" md="3">
							<v-select v-model="selectedLopID" :items="classOptions" item-title="TenLop"
								item-value="LopID" :label="classOptions.length ? 'Lớp' : 'Lớp (chưa được phân công)'"
								density="compact" variant="outlined" hide-details :disabled="!classOptions.length"
								no-data-text="Chưa được phân công lớp chủ nhiệm" :loading="loading.list"
								@update:model-value="onClassChange" />
						</v-col>
						<v-col v-if="!isCap1 && tab === 'so-lien-lac'" cols="12" sm="6" md="3">
							<v-select v-model="selectedSoLienLacPeriodId" :items="soLienLacPeriods"
								item-title="Thang_HienThi" item-value="Lop_NhanXetThangID"
								label="Chọn tháng" density="compact" variant="outlined" hide-details
								:loading="loading.month">
								<template #item="{ props, item }">
									<v-list-item v-bind="props" :title="item.raw.Thang_HienThi">
										<template #append>
											<v-chip size="small" :color="item.raw.MauTinhTrang || 'default'">
												{{ item.raw.TenTinhTrang || 'Chưa lưu' }}
											</v-chip>
										</template>
									</v-list-item>
								</template>
							</v-select>
						</v-col>
						<v-col v-if="isCap1 && tab === 'ren-luyen'" cols="12" sm="6" md="3">
							<v-select v-model="selectedNhanXetThangLmsPeriodId" :items="nhanXetThangLmsPeriods"
								item-title="Thang_HienThi" item-value="Lop_NhanXetThangID"
								label="Chọn tháng" density="compact" variant="outlined" hide-details
								:loading="loading.month">
								<template #item="{ props, item }">
									<v-list-item v-bind="props" :title="item.raw.Thang_HienThi">
										<template #append>
											<v-chip size="small" :color="item.raw.MauTinhTrang || 'default'">
												{{ item.raw.TenTinhTrang || 'Chưa lưu' }}
											</v-chip>
										</template>
									</v-list-item>
								</template>
							</v-select>
						</v-col>
						<v-col cols="12" sm="12" md="6" class="so-gvcn-actions d-flex align-center justify-start ga-2 flex-wrap">
							<v-btn v-if="isCap1 && tab === 'ren-luyen'" color="primary" variant="flat" size="small"
								:disabled="saveButtonDisabled" :loading="loading.save" @click="onWorkflowSave">
								<v-icon start>mdi-content-save</v-icon>
								Lưu tạm tất cả
							</v-btn>
			<v-btn v-else color="primary" variant="outlined" size="small" :loading="loading.list"
								@click="onRefreshCurrentTab">
								<v-icon start>mdi-refresh</v-icon>
								Làm mới
							</v-btn>
							<v-btn v-if="!isCap1 && tab === 'ren-luyen' && attendanceWarningCount" color="warning"
								variant="tonal" size="small" @click="showAttendanceAlert = true">
								<v-icon start>mdi-alert-outline</v-icon>
								Cảnh báo chuyên cần ({{ attendanceWarningCount }})
							</v-btn>
							<v-btn color="success" variant="outlined" size="small" :disabled="!studentSheetRows.length"
								:loading="loading.export" @click="onExportExcel">
								<v-icon start>mdi-file-excel</v-icon>
								Xuất Excel
							</v-btn>
							<v-btn v-if="canExportAnnualTargets && tab === 'chi-tieu'" color="success" variant="outlined"
								size="small" :loading="loading.exportAnnualTargets" @click="onExportAnnualTargets">
								<v-icon start>mdi-file-excel-outline</v-icon>
								Xuất chỉ tiêu các lớp
							</v-btn>
							<v-menu v-if="workflowActionMenuVisible && isCap1 && tab === 'ren-luyen'" location="bottom end">
								<template #activator="{ props }">
									<v-btn v-bind="props" color="primary" variant="flat" size="small"
										:loading="loading.save || loading.submit">
										<v-icon start>mdi-content-save-cog</v-icon>
										Thao tác
										<v-icon end>mdi-chevron-down</v-icon>
									</v-btn>
								</template>
								<v-list density="compact">
									<v-list-item :disabled="loading.list" @click="onRefreshCurrentTab">
										<template #prepend><v-icon>mdi-refresh</v-icon></template>
										<v-list-item-title>Làm mới</v-list-item-title>
									</v-list-item>
									<v-list-item :disabled="workflowSendDisabled" @click="onWorkflowSend">
										<template #prepend><v-icon>mdi-send</v-icon></template>
										<v-list-item-title>{{ workflowSendLabel }}</v-list-item-title>
									</v-list-item>
								</v-list>
							</v-menu>
			<v-menu v-if="workflowActionMenuVisible && !(isCap1 && tab === 'ren-luyen')" location="bottom end">
				<template #activator="{ props }">
					<v-btn v-bind="props" color="primary" variant="flat" size="small"
						:loading="loading.save || loading.submit">
						<v-icon start>mdi-content-save-cog</v-icon>
						Thao tác
						<v-icon end>mdi-chevron-down</v-icon>
					</v-btn>
				</template>
				<v-list density="compact">
					<v-list-item :disabled="saveButtonDisabled" @click="onWorkflowSave">
						<template #prepend><v-icon>mdi-content-save</v-icon></template>
						<v-list-item-title>Lưu tạm tất cả</v-list-item-title>
					</v-list-item>
					<v-list-item :disabled="workflowSendDisabled" @click="onWorkflowSend">
						<template #prepend><v-icon>mdi-send</v-icon></template>
						<v-list-item-title>{{ workflowSendLabel }}</v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
			<v-btn v-else-if="showSaveButton && canSave && !isWorkflowActionTab" color="primary" variant="flat" size="small"
				:disabled="saveButtonDisabled" :loading="saveButtonLoading" @click="onSaveButtonClick">
								<v-icon start>mdi-content-save</v-icon>
								{{ saveButtonText }}
							</v-btn>
			<v-btn v-if="showSendSoLienLacBgh && !isWorkflowActionTab" color="primary" variant="outlined" size="small"
								:disabled="sendSoLienLacBghDisabled" :loading="loading.submit"
								@click="sendSoLienLacToBgh">
								<v-icon start>mdi-send</v-icon>
								Gửi BGH
							</v-btn>
			<v-btn v-if="showSendNhanXetThangLms && !isWorkflowActionTab" color="primary" variant="outlined" size="small"
								:disabled="sendNhanXetThangLmsDisabled" :loading="loading.submit"
								@click="sendNhanXetThangLmsToTruong">
								<v-icon start>mdi-send</v-icon>
								Gửi tổ trưởng
							</v-btn>
						</v-col>
					</v-row>
				</v-card-text>
			</v-card>
		</template>

		<v-card>
			<v-card-text class="pa-0"
				:style="{ height: isCap1 && tab === 'ren-luyen' ? 'calc(100vh - 114px)' : 'calc(100vh - 78px)' }">
				<v-row no-gutters style="height:100%">
					<v-col cols="12">
						<v-tabs v-model="tab" density="compact">
							<v-tab value="du-lieu-hs">{{ isCap1 ? 'THÔNG TIN HS LỚP' : 'Dữ liệu HS lớp' }}</v-tab>
							<v-tab v-if="isCap1" value="to-chuc-lop">Tổ chức lớp</v-tab>
							<v-tab value="chi-tieu">{{ isCap1 ? 'KH chủ nhiệm năm học' : 'XD chỉ tiêu_giải pháp' }}
							</v-tab>
							<v-tab v-if="isCap1" value="cong-tac-cn">Công tác chủ nhiệm tháng</v-tab>
							<v-tab value="ke-hoach">{{ isCap1 ? 'HS cần quan tâm' : 'KH GD tháng_tuần' }}</v-tab>
							<v-tab value="ren-luyen">{{ isCap1 ? 'Nhận xét tháng (LMS)' : 'Hồ sơ theo dõi QTRL' }}
							</v-tab>
							<v-tab v-if="isCap1" value="so-ket-hk1">Sơ kết HKI</v-tab>
							<v-tab v-if="isCap1" value="tong-ket-nam">Tổng kết năm học</v-tab>
							<v-tab v-if="isCap1" value="theo-doi-si-so">Theo dõi sĩ số HS theo tháng</v-tab>
							<v-tab v-if="isCap1" value="thong-ke-do-tuoi">Thống kê độ tuổi HS</v-tab>
							<v-tab v-if="isCap1" value="theo-doi-thanh-tich">Theo dõi thành tích HS</v-tab>
							<v-tab value="so-lien-lac">{{ isCap1 ? 'Theo dõi PH đi họp' : 'Sổ liên lạc điện tử' }}
							</v-tab>
							<v-tab v-if="isCap1" value="noi-dung-hop-ph">Nội dung họp PHHS</v-tab>
							<!-- Tab Theo dõi BHYT & BHTN được giữ lại trong dữ liệu cũ nhưng ẩn khỏi giao diện. -->
							<v-tab v-if="!isCap1" value="huong-nghiep">Hướng nghiệp</v-tab>
						</v-tabs>
						<v-divider />

						<v-window v-model="tab">
							<!-- Tab 1 -->
							<v-window-item value="du-lieu-hs">
								<so-gvcn-c1-tab-thong-tin-to-chuc v-if="isCap1" :rows="studentSheetRows"
									view="thong-tin" :sheet-height="sheetHeight" :sheet-key="sheetKey"
									:selected-lop-i-d="selectedLopID" ref="tabDuLieuHsRef" />
								<so-gvcn-tab-du-lieu-hs v-else :rows="studentSheetRows" :sheet-height="sheetHeight"
									:sheet-key="sheetKey" :nested-headers="studentNestedHeaders"
									:has-nhom-av="hasNhomAV" ref="tabDuLieuHsRef" />
							</v-window-item>

							<!-- Tab Tổ chức lớp (C1 only) -->
							<v-window-item v-if="isCap1" value="to-chuc-lop">
								<so-gvcn-c1-tab-to-chuc-lop :sheet-height="sheetHeight"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:can-bo-rows="getChiTieuCard('can-bo-lop').rows"
									:parent-rows="getChiTieuCard('ban-dai-dien-cmhs').rows"
									:group-rows="toNhomHocSinhSavedRows" ref="tabToChucLopRef" />
							</v-window-item>

							<!-- Tab 3: KH chủ nhiệm năm học (C1) / Chỉ tiêu (C2, C3) -->
			<v-window-item value="chi-tieu" :eager="!isCap1">
								<so-gvcn-c1-tab-ke-hoach-nam-hoc v-if="isCap1" ref="tabKeHoachNamHocRef"
									:selected-lop-i-d="selectedLopID" :selected-class="selectedClass"
									:class-size="getSelectedClassStudents().length"
									:school-year-text="getCurrentSchoolYearText()" :sheet-height="sheetHeight"
									:annual-plan="keHoachNamHocData" />
								<so-gvcn-tab-chi-tieu v-else ref="tabChiTieuRef" :selected-lop-i-d="selectedLopID"
									:chi-tieu-cards="chiTieuCards" :chi-tieu-giao-duc-title="chiTieuGiaoDucTitle"
									:sheet-height="sheetHeight" :sheet-key="sheetKey"
									@update-card-rows="updateChiTieuCardRows"
									@handle-card-change="handleChiTieuCardChange" />
							</v-window-item>

							<!-- Công tác chủ nhiệm tháng (C1 only) -->
			<v-window-item v-if="isCap1" value="cong-tac-cn">
								<so-gvcn-c1-tab-cong-tac-chu-nhiem ref="tabCongTacChuNhiemRef"
									:selected-lop-i-d="selectedLopID" :sheet-height="sheetHeight"
									:month-sheet-height="keHoachSheetHeight" :month-list="monthList"
									:week-list="weeklyPlanList" :nien-khoa="currentNienKhoa"
									:get-ke-hoach-export-months="getKeHoachExportMonths"
									@changed="markTabDirty('cong-tac-cn')" />
							</v-window-item>

							<!-- Hồ sơ HS cần quan tâm (C1) / Kế hoạch tháng tuần (C2, C3) -->
							<v-window-item value="ke-hoach" :eager="!isCap1">
								<so-gvcn-c1-tab-hs-can-quan-tam v-if="isCap1" ref="tabHsCanQuanTamRef"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:saved-rows="hsCanQuanTamSavedRows" :sheet-height="sheetHeight"
									:sheet-key="sheetKey" @changed="markTabDirty('ke-hoach')" />
								<so-gvcn-tab-ke-hoach v-else ref="tabKeHoachRef" :selected-lop-i-d="selectedLopID"
									:selected-class="selectedClass" :school-year-text="getCurrentSchoolYearText()"
									:sheet-height="sheetHeight" :ke-hoach-sheet-height="keHoachSheetHeight"
									:columns="keHoachSheetColumns" :nested-headers="keHoachSheetNestedHeaders"
									:data-ao-a="keHoachSheetRows" :sheet-style="keHoachSheetStyle"
									:get-ke-hoach-export-months="getKeHoachExportMonths"
									:get-ke-hoach-month-row-count="getKeHoachMonthRowCount"
									@changed="markTabDirty('ke-hoach')" />
							</v-window-item>

							<!-- Tab 4 -->
			<v-window-item value="ren-luyen" :eager="!isCap1">
				<so-gvcn-c1-tab-nhan-xet-thang-lms v-if="isCap1" ref="tabNhanXetThangLmsRef"
					:selected-lop-i-d="selectedLopID" :rows="nhanXetThangLmsRows" :columns="nhanXetThangLmsColumns"
					:nested-headers="nhanXetThangLmsNestedHeaders" :sheet-height="sheetHeight" :sheet-key="sheetKey"
					:read-only="nhanXetThangLmsReadOnly" :reason-reject="Number(selectedNhanXetThangLmsPeriod?.TinhTrang) === 3 ? selectedNhanXetThangLmsPeriod?.ReasonReject : ''"
					:loading="loading.month" />
								<so-gvcn-tab-ren-luyen v-else ref="tabRenLuyenRef" v-model:rows="renLuyenRows"
									:selected-lop-i-d="selectedLopID" :selected-class="selectedClass"
									:school-year-text="getCurrentSchoolYearText()" :columns="renLuyenColumns"
									:nested-headers="renLuyenNestedHeaders" :sheet-height="sheetHeight"
									:ren-luyen-sheet-height="renLuyenSheetHeight" :sheet-key="sheetKey"
									:attendance-summaries="attendanceSummaries" :attendance-loading="attendanceLoading"
									:show-attendance-alert="showAttendanceAlert" @update:rows="markTabDirty('ren-luyen')"
									@close-attendance-alert="showAttendanceAlert = false" />
							</v-window-item>

							<!-- Tab Sơ kết HKI (C1 only) -->
			<v-window-item v-if="isCap1" value="so-ket-hk1">
								<so-gvcn-c1-tab-so-ket-tong-ket ref="tabSoKetHk1Ref" :selected-lop-i-d="selectedLopID"
									:students="getSelectedClassStudents()"
									:class-size="getSelectedClassStudents().length" :saved-rows="soKetHk1SavedRows"
									:sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab Tổng kết năm học (C1 only) -->
			<v-window-item v-if="isCap1" value="tong-ket-nam">
								<so-gvcn-c1-tab-tong-ket-nam-hoc ref="tabTongKetNamRef"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:class-size="getSelectedClassStudents().length" :saved-data="tongKetNamC1SavedData"
									:sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab Theo dõi sĩ số tháng (C1 only) -->
			<v-window-item v-if="isCap1" value="theo-doi-si-so">
								<so-gvcn-c1-tab-theo-doi-si-so ref="tabTheoDoiSiSoRef" :selected-lop-i-d="selectedLopID"
									:students="getSelectedClassStudents()" :saved-rows="siSoSavedRows"
									:sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab Thống kê độ tuổi HS (C1 only) -->
			<v-window-item v-if="isCap1" value="thong-ke-do-tuoi">
								<so-gvcn-c1-tab-thong-ke-do-tuoi ref="tabThongKeDoTuoiRef"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:saved-rows="thongKeDoTuoiSavedRows" :sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab Theo dõi thành tích HS (C1 only) -->
			<v-window-item v-if="isCap1" value="theo-doi-thanh-tich">
								<so-gvcn-c1-tab-theo-doi-thanh-tich ref="tabTheoDoiThanhTichRef"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:saved-rows="thanhTichSavedRows" :sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab 6 -->
							<v-window-item value="so-lien-lac">
								<so-gvcn-c1-tab-theo-doi-ph-hop v-if="isCap1" ref="tabTheoDoiPhHopRef"
									:selected-lop-i-d="selectedLopID" :students="getSelectedClassStudents()"
									:saved-rows="theoDoiPhHopSavedRows" :sheet-height="sheetHeight" />
								<div v-else-if="loading.month" class="d-flex align-center justify-center pa-6">
									<v-progress-circular indeterminate color="primary" />
								</div>
								<so-gvcn-tab-so-lien-lac v-else ref="tabSoLienLacRef" v-model:rows="soLienLacRows"
									:selected-lop-i-d="selectedLopID" :columns="soLienLacColumns"
									:nested-headers="soLienLacNestedHeaders" :sheet-height="sheetHeight"
									:so-lien-lac-sheet-height="soLienLacSheetHeight" :sheet-key="sheetKey"
									:read-only="soLienLacReadOnly"
									:reason-reject="Number(selectedSoLienLacPeriod?.TinhTrang) === 3 ? selectedSoLienLacPeriod?.ReasonReject : ''"
									@update:rows="markTabDirty('so-lien-lac')" />
							</v-window-item>

							<!-- Tab Nội dung họp PHHS (C1 only) -->
			<v-window-item v-if="isCap1" value="noi-dung-hop-ph">
								<so-gvcn-c1-tab-noi-dung-hop-ph ref="tabNoiDungHopPhRef"
									:selected-lop-i-d="selectedLopID" :saved-rows="noiDungHopPhSavedRows"
									:sheet-height="sheetHeight" />
							</v-window-item>

							<!-- Tab Hướng nghiệp (C2, C3 only) -->
							<v-window-item v-if="!isCap1" value="huong-nghiep">
								<so-gvcn-tab-huong-nghiep ref="tabHuongNghiepRef" :rows="huongNghiepRows"
									:selected-lop-i-d="selectedLopID" :columns="huongNghiepColumns"
									:nested-headers="huongNghiepNestedHeaders" :sheet-height="sheetHeight"
									:huong-nghiep-sheet-height="huongNghiepSheetHeight" :sheet-key="sheetKey"
									@update-rows="updateHuongNghiepRows" />
							</v-window-item>
						</v-window>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</Global>
</template>

<script>
	export default {
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
		data() {
		return {
			vueData,
			tab: 'du-lieu-hs',
			filter: this.getDefaultFilter(),
			loading: { list: false, detail: false, students: false, save: false, submit: false, month: false, tongKet: false, family: false, export: false, exportAnnualTargets: false },
			classList: [],
			soGVCNContexts: [],
			allTeachers: [],
			allStudentRows: [],
			selectedLopID: null,
			savingClassContext: null,
			serializationStudents: null,
			savingGroupedClasses: false,
			tabChangeSaving: false,
			hasUnsavedChanges: false,
			dirtyTabs: {},
			classSelectionInitialized: false,
			studentSheetRows: [],
			sheetInstance: null,
			renLuyenRows: [],
			renLuyenSavedRows: [],
			attendanceSummaries: {},
			attendanceCache: {},
			attendanceLoading: false,
			showAttendanceAlert: false,
			hsCanQuanTamSavedRows: [],
			nhanXetThangLmsSavedRows: [],
			nhanXetThangLmsPeriods: [],
			selectedNhanXetThangLmsPeriodId: null,
			soKetHk1SavedRows: [],
			tongKetNamSavedRows: [],
			tongKetNamC1SavedData: {},
			thanhTichSavedRows: [],
			thongKeDoTuoiSavedRows: [],
			theoDoiPhHopSavedRows: [],
			noiDungHopPhSavedRows: [],
			theoDoiBhytSavedRows: [],
			renLuyenSheetInstance: null,
			soLienLacRows: [],
			soLienLacSavedRows: [],
			soLienLacPeriods: [],
			selectedSoLienLacPeriodId: null,
			soLienLacSheetInstance: null,
			keHoachSheetRows: [],
			keHoachSheetInstance: null,
			huongNghiepRows: [],
			huongNghiepSheetInstance: null,
			sheetKey: 0,
			sheetHeight: 			'calc(100vh )',
			keHoachSheetHeight: 	'calc(100vh )',
			renLuyenSheetHeight: 	'calc(100vh )',
			soLienLacSheetHeight: 	'calc(100vh )',
			huongNghiepSheetHeight: 'calc(100vh )',
			keHoachSheetColumns: [
				{ title: 'Tháng', width: 70, readOnly: true },
				{ title: 'Chủ đề', width: 220 },
				{ title: 'Mục tiêu', width: 220 },
				{ title: 'Tuần 1', width: 800, type: 'note' },
				{ title: 'Tuần 2', width: 800, type: 'note' },
				{ title: 'Tuần 3', width: 800, type: 'note' },
				{ title: 'Tuần 4', width: 800, type: 'note' },
				{ title: 'Tuần 5', width: 800, type: 'note' },
				{ title: 'Ưu điểm - Hạn chế + giải pháp khắc phục', width: 300, type: 'note' }
			],
			keHoachSheetStyle: {},
			huongNghiepColumns: [
				{ title: 'STT', name: 'STT', width: 55, readOnly: true },
				{ title: 'Mã học sinh', name: 'MaHocSinh', width: 110, readOnly: true },
				{ title: 'Số danh bộ', name: 'SoDanhBo', width: 110, readOnly: true },
				{ title: 'Họ và tên học sinh', name: 'HoTen', width: 245, readOnly: true },
				{
					title: 'Dự kiến chọn môn thi TN (1)', name: 'MonThiTN', width: 260,
					type: 'dropdown', autocomplete: true,
					source: ['Toán', 'Ngữ văn', 'Ngoại ngữ', 'Vật lí', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lí', 'Giáo dục kinh tế và pháp luật', 'Tin học', 'Công nghệ']
				},
				{ title: 'KQ trắc nghiệm nghề nghiệp (Sở thích - Năng lực) - (2)', name: 'KQTracNghiem', width: 440 }
			],
			chiTieuCards: [
						{
							key: 'chi-tieu-giao-duc',
							title: 'I. XÂY DỰNG CHỈ TIÊU HAI MẶT GIÁO DỤC LỚP .... NĂM HỌC 2026-2027',
							md: 12,
							height: '110px',
							freezeColumns: 1,
							nestedHeaders: [
								[
									{ title: '', colspan: 2 },
									{ title: 'Chỉ tiêu', colspan: 4 },
									{ title: '', colspan: 1 }
								]
							],
							columns: [
								{ title: 'Các mặt giáo dục', name: 'MatGiaoDuc', width: 130, readOnly: true },
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'Tốt', name: 'Tot', width: 110, type: 'numeric' },
								{ title: 'Khá', name: 'Kha', width: 110, type: 'numeric' },
								{ title: 'Đạt', name: 'Dat', width: 110, type: 'numeric' },
								{ title: 'Chưa đạt', name: 'ChuaDat', width: 120, type: 'numeric' },
								{ title: 'Biện pháp', name: 'BienPhap', width: 600 }
							],
							rows: [
								['Kết quả rèn luyện', '', '', '', '', '', ''],
								['Kết quả học tập', '', '', '', '', '', '']
							]
						},
						{
							key: 'danh-hieu',
							title: 'DANH HIỆU',
							md: 12,
							height: '110px',
							columns: [
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'HSXS', name: 'HSXS', width: 180, align: 'center' },
								{ title: 'HSG', name: 'HSG', width: 180, align: 'center' },
								{ title: 'Ghi chú / biện pháp', name: 'GhiChu', width: 360 }
							],
							rows: [
								['', '', '', '']
							]
						},
						{
							key: 'hoat-dong-phong-trao',
							title: 'THAM GIA CÁC HOẠT ĐỘNG PHONG TRÀO KHÁC',
							md: 12,
							height: '280px',
							columns: [
								{ title: 'Yêu cầu cần đạt', name: 'YeuCau', width: 260 },
								{ title: 'Nội dung', name: 'NoiDung', width: 420 },
								{ title: 'Ghi chú', name: 'GhiChu', width: 300 }
							],
							rows: Array.from({ length: 10 }, function () { return ['', '', ''] })
						},
						{
							key: 'theo-doi-si-so',
							title: 'II. THEO DÕI SĨ SỐ',
							md: 12,
						height: '115px',
						columns: [
							{ title: ' ', name: 'Moc', width: 90, readOnly: true },
							{ title: 'Sĩ số', name: 'SiSo', width: 80, align: 'center' },
							{ title: 'Nam', name: 'Nam', width: 170, align: 'center' },
							{ title: 'Chuyển đi', name: 'ChuyenDi', width: 170, align: 'center' },
							{ title: 'Chuyển đến', name: 'ChuyenDen', width: 170, align: 'center' }
						],
						rows: [
							['Đầu năm', '', '', '', ''],
							['Cuối kì 1', '', '', '', ''],
							['Cuối kì 2', '', '', '', '']
						]
					},
						{
							key: 'giao-vien-bo-mon',
							title: 'III. DANH SÁCH GIÁO VIÊN BỘ MÔN',
							md: 12,
							height: '450px',
							columns: [
								{ title: 'Bộ môn', name: 'BoMon', width: 100 },
								{ title: 'Học kì', name: 'HocKy', width: 100, type: 'dropdown', source: ['Học kì 1', 'Học kì 2'] },
								{ title: 'Họ tên - Số điện thoại', name: 'GiaoVien', width: 330, type: 'dropdown', source: [], autocomplete: true, align: 'left' },
								{ title: 'Những thay đổi', name: 'ThayDoi', width: 220 }
							],
							rows: Array.from({ length: 20 }, function () { return ['', '', '', ''] })
						},
						{
							key: 'ban-dai-dien-cmhs',
							title: 'IV. DANH SÁCH BAN ĐẠI DIỆN CHA MẸ HỌC SINH',
							md: 12,
							height: '200px',
							columns: [
								{ title: 'STT', name: 'STT', width: 60, align: 'center' },
								{ title: 'Mã học sinh', name: 'HocSinhID', width: 95, readOnly: true },
								{ title: 'Họ và tên học sinh', name: 'HocSinh', width: 230, type: 'dropdown', source: [], autocomplete: true, align: 'left' },
								{ title: 'Họ và tên cha mẹ', name: 'ChaMe', width: 230, align: 'left' },
								{ title: 'Nghề nghiệp', name: 'NgheNghiep', width: 170 },
								{ title: 'Điện thoại', name: 'DienThoai', width: 190, align: 'center' },
								{
									title: 'Nhiệm vụ', name: 'NhiemVu', width: 140,
									type: 'dropdown', source: ['Trưởng ban', 'Phó ban', 'Thành viên']
								}
							],
							rows: Array.from({ length: 5 }, function (_, index) { return [index + 1, '', '', '', '', '', ''] })
						},
						{
							key: 'can-bo-lop',
							title: 'V. DANH SÁCH CÁN BỘ LỚP',
							md: 12,
							height: '620px',
							columns: [
								{ title: 'STT', name: 'STT', width: 70, align: 'center' },
								{ title: 'Mã học sinh', name: 'HocSinhID', width: 95, readOnly: true },
								{ title: 'Họ và tên học sinh', name: 'HocSinh', width: 230, type: 'dropdown', source: [], autocomplete: true, align: 'left' },
								{
									title: 'Chức vụ', name: 'ChucVu', width: 180,
									type: 'dropdown', source: ['Lớp trưởng', 'Lớp phó học tập', 'Lớp phó lao động', 'Lớp phó văn thể mỹ', 'Lớp phó kỉ luật', 'Bí thư', 'Phó bí thư', 'Tổ trưởng', 'Tổ phó', 'Thủ quỹ']
								},
								{ title: 'Ghi chú', name: 'GhiChu', width: 180 }
							],
							rows: Array.from({ length: 20 }, function (_, index) { return [index + 1, '', '', '', ''] })
						}
			],
			monthList: [],
			weeklyPlanList: [],
			chiTieuSavedRows: [],
			siSoSavedRows: [],
			giaoVienBoMonSavedRows: [],
			banDaiDienCMHSSavedRows: [],
			canBoLopSavedRows: [],
			toNhomHocSinhSavedRows: [],
			huongNghiepSavedRows: [],
			keHoachNamHocData: null,
			selectedClass: null,
			detail: {},
			form: {
				SoGVCNID: 0,
				ThongTinLop: '',
				ChiTieu: '',
				SiSo: '',
				GiaoVienBoMon: '',
				BanDaiDienCMHS: '',
				CanBoLop: '',
				HuongNghiep: ''
			},
			capOptions: [
				{ text: 'Tiểu học', value: 1 },
				{ text: 'Trung học', value: '2,3' }
			],
			studentSheetColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'Mã học sinh', width: 110, readOnly: true },
				{ title: 'Số danh bộ', width: 110, readOnly: true },
				{ title: 'Họ và tên học sinh', width: 220, readOnly: true, align: 'left' },
				{ title: 'Lớp mới', width: 90, readOnly: true },
				{ title: 'Nhóm AV', width: 100, readOnly: true },
				{ title: 'Lớp cũ', width: 90, readOnly: true },
				{ title: 'Toán', width: 80, readOnly: true },
				{ title: 'Tiếng Việt/Văn', width: 120, readOnly: true },
				{ title: 'Anh', width: 80, readOnly: true },
				{ title: 'KHTN', width: 80, readOnly: true },
				{ title: 'LS-ĐL', width: 80, readOnly: true },
				{ title: 'GDCD/GDKTPL', width: 120, readOnly: true },
				{ title: 'Tin', width: 80, readOnly: true },
				{ title: 'CN', width: 80, readOnly: true },
				{ title: 'Địa lí', width: 80, readOnly: true },
				{ title: 'Vật lí', width: 80, readOnly: true },
				{ title: 'Hóa', width: 80, readOnly: true },
				{ title: 'Sinh', width: 80, readOnly: true },
				{ title: 'KQRL', width: 90, readOnly: true },
				{ title: 'KQHT', width: 90, readOnly: true },
				{ title: 'Danh hiệu', width: 180, readOnly: true },
				{ title: 'Nhận xét GVCN', width: 600, align: 'left', readOnly: true },
				{ title: 'Cha', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp cha', width: 160, readOnly: true },
				{ title: 'SDT cha', width: 120, readOnly: true },
				{ title: 'Mẹ', width: 160, readOnly: true },
				{ title: 'Nghề nghiệp mẹ', width: 160, readOnly: true },
				{ title: 'SDT mẹ', width: 120, readOnly: true },
				{ title: 'Người đỡ đầu', width: 160, readOnly: true },
				{ title: 'SDT người đỡ đầu', width: 140, readOnly: true },
				{ title: 'Ăn sáng', width: 80, readOnly: true },
				{ title: 'Xe', width: 80, readOnly: true },
				{ title: 'Địa chỉ', width: 380, align: 'left', readOnly: true },
				{ title: 'Ghi chú', width: 220, readOnly: true }
			],
			renLuyenColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'SỐ DANH BỘ', width: 110, readOnly: true },
				{ title: 'HỌ TÊN HỌC SINH', width: 220, readOnly: true },
				{ title: 'HS cần hỗ trợ đặc biệt\n(ghi rõ vấn đề nếu có)', width: 240 },
				{ title: 'BAN CÁN SỰ (ghi rõ nhiệm vụ)', width: 280 },
				{ title: 'THÁNG 8', width: 180 },
				{ title: 'THÁNG 9', width: 180 },
				{ title: 'THÁNG 10', width: 180 },
				{ title: 'THÁNG 11', width: 180 },
				{ title: 'THÁNG 12', width: 180 },
				{ title: 'NHẬN XÉT HKI', width: 220 },
				{ title: 'KQRL HKI', width: 100 },
				{ title: 'KQHT HKI', width: 100 },
				{ title: 'THÁNG 01 VÀ 02', width: 180 },
				{ title: 'THÁNG 3', width: 180 },
				{ title: 'THÁNG 4', width: 180 },
				{ title: 'THÁNG 5', width: 180 },
				{ title: 'NHẬN XÉT HKII', width: 220 },
				{ title: 'KQRL HKII', width: 100 },
				{ title: 'KQHT HKII', width: 100 },
				{ title: 'DANH HIỆU', width: 150 },
				{ title: 'THÀNH TÍCH KHÁC', width: 200 }
			],
			soLienLacColumns: [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'SỐ DANH BỘ', width: 110, readOnly: true },
				{ title: 'HỌ TÊN HỌC SINH', width: 220, readOnly: true },
				{ title: 'THÁNG 8', width: 230 },
				{ title: 'THÁNG 9', width: 230 },
				{ title: 'THÁNG 10', width: 230 },
				{ title: 'THÁNG 11', width: 230 },
				{ title: 'THÁNG 12', width: 230 },
				{ title: 'NHẬN XÉT HKI', width: 230 },
				{ title: 'THÁNG 01 VÀ 02', width: 230 },
				{ title: 'THÁNG 3', width: 230 },
				{ title: 'THÁNG 4', width: 230 },
				{ title: 'THÁNG 5', width: 230 },
				{ title: 'NHẬN XÉT HKII', width: 230 }
			],
			monthHeaders: [
				{ title: 'Tháng', key: 'Thang', width: 80 },
				{ title: 'Chủ đề', key: 'ChuDe' },
				{ title: 'Đánh giá', key: 'DanhGia' }
			],
		}
	},
		computed: {
			attendanceWarningCount() {
				return Object.values(this.attendanceSummaries || {}).filter(item => item.warningLevel).length
			},
			isCap1() {
				return Number(this.filter.CapID || vueData.CapID || 0) === 1
			},
			currentNienKhoa() {
				return vueData.NienKhoa || new Date().getFullYear()
			},
			classOptions() {
				const visibleClasses = this.isCap1GradeManager
					? this.classList.filter(item => this.cap1ManagedKhoiIDs.includes(Number(item.KhoiID)))
					: this.classList
				return this.isBghOrAdmin
					? [
						{ LopID: '__ALL__', TenLop: 'Tất cả lớp' },
						...visibleClasses
					]
					: visibleClasses
			},
			userSystemRight() {
				return Number(vueData?.user?.SystemRight || vueData?.SystemRight || vueData?.sys_SystemRight || 0)
			},
			userFunctionRights() {
				const value = vueData?.user?.FunctionRight ?? vueData?.user?.functionRight ?? ''
				return (Array.isArray(value) ? value : String(value).split(/[;,|\s]+/))
					.map(item => String(item).trim())
					.filter(Boolean)
			},
			cap1ManagedKhoiIDs() {
				return this.userFunctionRights
					.map(right => Number(right) - 10)
					.filter(khoiID => khoiID >= 1 && khoiID <= 5)
					.filter((khoiID, index, values) => values.indexOf(khoiID) === index)
			},
			isCap1GradeManager() {
				return this.isCap1 && this.cap1ManagedKhoiIDs.length > 0
			},
			isTeacherOrLead() {
				return [1, 2, 5].includes(this.userSystemRight)
			},
			isTeacher() {
				return this.isTeacherOrLead
			},
			isBghOrAdmin() {
				return [3, 9].includes(this.userSystemRight)
			},
			canExportAnnualTargets() {
				return this.isCap1 && (this.isBghOrAdmin || this.userFunctionRights.some(right => [11, 12, 13, 14, 15].includes(Number(right))))
			},
			canSave() {
				// Tạm mở nút Lưu cho demo/test.
				return true
			},
			showSendSoLienLacBgh() {
				return !this.isCap1 && this.tab === 'so-lien-lac' && !!this.selectedSoLienLacPeriodId
			},
			sendSoLienLacBghDisabled() {
				return this.loading.save || this.loading.submit || !this.soLienLacRows.length ||
					[2, 4].includes(Number(this.selectedSoLienLacPeriod?.TinhTrang))
			},
			soLienLacReadOnly() {
				return [2, 4].includes(Number(this.selectedSoLienLacPeriod?.TinhTrang))
			},
			selectedSoLienLacPeriod() {
				const period = this.soLienLacPeriods.find(x => Number(x.Lop_NhanXetThangID) === Number(this.selectedSoLienLacPeriodId)) || null
				if (!period || !this.savingClassContext || !period.__periods) return period
				const contextPeriod = period.__periods.find(item => String(item.LopID) === String(this.savingClassContext.LopID))
				return contextPeriod ? { ...period, ...contextPeriod } : period
			},
			isWorkflowActionTab() {
				return (this.isCap1 && this.tab === 'ren-luyen') || (!this.isCap1 && this.tab === 'so-lien-lac')
			},
			workflowPeriod() {
				if (this.isCap1) return this.tab === 'ren-luyen' ? this.selectedNhanXetThangLmsPeriod : null
				return this.tab === 'so-lien-lac' ? this.selectedSoLienLacPeriod : null
			},
			workflowActionMenuVisible() {
				return this.isWorkflowActionTab && !!this.workflowPeriod && [0, 1, 3].includes(Number(this.workflowPeriod.TinhTrang))
			},
			workflowSendLabel() {
				return this.isCap1 ? 'Gửi tổ trưởng' : 'Gửi BGH'
			},
			workflowSendDisabled() {
				return this.isCap1 ? this.sendNhanXetThangLmsDisabled : this.sendSoLienLacBghDisabled
			},
			showSendNhanXetThangLms() {
				return this.isCap1 && this.tab === 'ren-luyen' && !!this.selectedNhanXetThangLmsPeriodId
			},
			sendNhanXetThangLmsDisabled() {
				return this.loading.save || this.loading.submit || !this.nhanXetThangLmsRows.length || this.nhanXetThangLmsReadOnly
			},
			selectedNhanXetThangLmsPeriod() {
				return this.nhanXetThangLmsPeriods.find(x => Number(x.Lop_NhanXetThangID) === Number(this.selectedNhanXetThangLmsPeriodId)) || null
			},
			nhanXetThangLmsReadOnly() {
				return [2, 4].includes(Number(this.selectedNhanXetThangLmsPeriod?.TinhTrang))
			},
			nhanXetThangLmsRows() {
				const period = this.selectedNhanXetThangLmsPeriod
				const students = this.getSelectedClassStudents()
				return students.map(student => {
					const item = (period?.items || []).find(row => Number(row.HSLopID) === Number(student.HSLopID)) || {}
					return [student.MaHocSinh || student.HocSinhID || '', student.HoTen || student.HoTenHocSinh || '',
						item.NhanXetToan_HTML || '', item.DiemToan || '', item.NhanXetTiengViet_HTML || '', item.DiemTiengViet || '',
						item.NhanXetMonHocKhac_HTML || '', item.HoatDongGiaoDucKhac_HTML || '', item.PhamChatNangLuc_HTML || '']
				})
			},
			nhanXetThangLmsColumns() {
				return [
					{ title: 'MÃ HỌC SINH', width: 120, readOnly: true },
					{ title: 'HỌ TÊN HỌC SINH', width: 200, readOnly: true },
					{ title: 'NHẬN XÉT MÔN TOÁN', width: 420, align: 'justify' }, { title: 'ĐIỂM TOÁN', width: 110, type: 'numeric', align: 'center' },
					{ title: 'NHẬN XÉT MÔN TIẾNG VIỆT', width: 420, align: 'justify' }, { title: 'ĐIỂM TIẾNG VIỆT', width: 130, type: 'numeric', align: 'center' },
					{ title: 'NHẬN XÉT MÔN HỌC KHÁC', width: 420, align: 'justify' }, { title: 'HOẠT ĐỘNG GIÁO DỤC KHÁC', width: 420, align: 'justify' },
					{ title: 'PHẨM CHẤT - NĂNG LỰC', width: 420, align: 'justify' }
				]
			},
			nhanXetThangLmsNestedHeaders() {
				return [[{ title: '', colspan: 2 }, { title: this.selectedNhanXetThangLmsPeriod?.Thang_HienThi || 'NHẬN XÉT THÁNG LMS', colspan: 7 }]]
			},
			chiTieuGiaoDucTitle() {
				const tenLop = this.selectedClass?.TenLop || ''
				return 'I. XÂY DỰNG CHỈ TIÊU HAI MẶT GIÁO DỤC LỚP ' + tenLop + ' NĂM HỌC ' + this.getCurrentSchoolYearText()
			},
			showSaveButton() {
				const isC1OrganizationTab = this.isCap1 && this.tab === 'to-chuc-lop'
				return this.selectedLopID !== '__ALL__' && (isC1OrganizationTab
					|| ['chi-tieu', 'cong-tac-cn', 'ke-hoach', 'ren-luyen', 'nhan-xet-lms', 'so-ket-hk1', 'tong-ket-nam', 'theo-doi-si-so', 'thong-ke-do-tuoi', 'theo-doi-thanh-tich', 'noi-dung-hop-ph', 'so-lien-lac', 'huong-nghiep'].includes(this.tab))
			},
			saveButtonText() {
				switch (this.tab) {
					case 'to-chuc-lop': return 'Lưu tổ chức lớp'
					case 'chi-tieu': return this.isCap1 ? 'Lưu KH năm học' : 'Lưu chỉ tiêu'
					case 'cong-tac-cn': return 'Lưu công tác tháng'
					case 'ke-hoach': return 'Lưu kế hoạch tháng'
					case 'ren-luyen': return this.isCap1 ? 'Lưu tạm tất cả' : 'Lưu rèn luyện'
					case 'nhan-xet-lms': return 'Lưu nhận xét LMS'
					case 'so-ket-hk1': return 'Lưu sơ kết HKI'
					case 'tong-ket-nam': return 'Lưu tổng kết năm học'
					case 'theo-doi-si-so': return 'Lưu theo dõi sĩ số'
					case 'thong-ke-do-tuoi': return 'Lưu thống kê độ tuổi'
					case 'theo-doi-thanh-tich': return 'Lưu thành tích'
					case 'noi-dung-hop-ph': return 'Lưu nội dung họp PH'
					case 'so-lien-lac': return this.isCap1 ? 'Lưu theo dõi PH đi họp' : 'Lưu tạm tất cả'
					case 'huong-nghiep': return 'Lưu hướng nghiệp'
					default: return 'Lưu'
				}
			},
			saveButtonDisabled() {
				if (this.tab === 'ke-hoach' || this.tab === 'cong-tac-cn') return !this.form.SoGVCNID
				const periodLocked = this.tab === 'so-lien-lac' && !this.isCap1 &&
					[2, 4].includes(Number(this.selectedSoLienLacPeriod?.TinhTrang))
				const nhanXetLmsLocked = this.tab === 'ren-luyen' && this.isCap1 && this.nhanXetThangLmsReadOnly
				const nhanXetLmsNotReady = this.tab === 'ren-luyen' && this.isCap1 &&
					(this.loading.month || !this.selectedNhanXetThangLmsPeriod)
				return !this.form.SoGVCNID || this.loading.save || periodLocked || nhanXetLmsLocked || nhanXetLmsNotReady
			},
			saveButtonLoading() {
				if (this.tab === 'ke-hoach' || this.tab === 'cong-tac-cn') return this.loading.month
				return this.loading.save
			},
			hasNhomAV() {
				return (this.studentSheetRows || []).some(row => !!row[5])
			},
			studentNestedHeaders() {
			var nienKhoaDiem = Number(this.currentNienKhoa || 0) - 1
			var namHocDiem = nienKhoaDiem + '-' + this.currentNienKhoa
			return [
				[
					{ title: '', colspan: this.hasNhomAV ? 7 : 6 },
					{ title: 'ĐTB môn cả năm ' + namHocDiem, colspan: 12 },
					{ title: 'KQ ' + namHocDiem, colspan: 3 },
					{ title: 'NHẬN XÉT CỦA GVCN ' + namHocDiem, colspan: 1 },
					{ title: 'THÔNG TIN GIA ĐÌNH', colspan: 8 },
					{ title: 'ĐĂNG KÍ', colspan: 2 },
					{ title: '', colspan: 1 },
					{ title: '', colspan: 1 }
				]
			]
		},
		keHoachSheetNestedHeaders() {
			return [
				[
					{ title: '', colspan: 1 },
					{ title: 'Mục tiêu giáo dục tháng', colspan: 2 },
					{ title: '', colspan: 5 },
					{ title: '', colspan: 1 }
				]
			]
		},
		huongNghiepNestedHeaders() {
			return [
				[
					{ title: '', colspan: 4 },
					{ title: 'ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)', colspan: 2 }
				]
			]
		},
		renLuyenNestedHeaders() {
			return [
				[
					{ title: '', colspan: 4 },
					{ title: 'THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP ' + (this.selectedClass?.TenLop || '.......') + ' NĂM HỌC ' + this.getCurrentSchoolYearText(), colspan: 20 }
				]
			]
		},
		soLienLacNestedHeaders() {
			const period = this.selectedSoLienLacPeriod
			const colspan = Math.max(0, (this.soLienLacColumns || []).length - 4)
			return [
				[
					{ title: '', colspan: 4 },
					{ title: period?.Thang_HienThi || 'NHẬN XÉT SỔ LIÊN LẠC HẰNG THÁNG', colspan }
				]
			]
		}
	},
	mounted() {
		const defaultCapID = this.getDefaultCapID()
		this.capOptions = this.getCapOptions()
		if (!this.capOptions.some(item => String(item.value) === String(this.filter.CapID))) {
			this.filter.CapID = defaultCapID
		}
		this.getList()
		this.getTeachersList()
		window.addEventListener('resize', this.onResize)
		window.addEventListener('beforeunload', this.onBeforeUnload)
		document.addEventListener('input', this.onEditableInput, true)
		document.addEventListener('change', this.onEditableInput, true)
		document.addEventListener('keydown', this.onSheetKeydown, true)
		document.addEventListener('paste', this.onSheetPasteOrMenu, true)
		document.addEventListener('mousedown', this.onSheetPasteOrMenu, true)
		
		this._scrollMap = new Map();
		this._scrollObserver = new MutationObserver((mutations) => {
			mutations.forEach(m => {
				if (m.type === 'childList') {
					m.addedNodes.forEach(node => {
						if (node.nodeType === 1) {
							const targetClass = node.classList.contains('jexcel_content') ? node : 
								(node.classList.contains('jspreadsheet_content') ? node : 
								node.querySelector('.jexcel_content, .jspreadsheet_content'));
							if (targetClass) {
								const saved = this._scrollMap.get(this.tab);
								if (saved && saved.length) {
									const pos = saved[0];
									setTimeout(() => {
										targetClass.scrollTop = pos.top;
										targetClass.scrollLeft = pos.left;
									}, 50);
								}
							}
						}
					});
				}
			});
		});
		this._scrollObserver.observe(this.$el, { childList: true, subtree: true });
		
		this.onResize()
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.onResize)
		window.removeEventListener('beforeunload', this.onBeforeUnload)
		document.removeEventListener('input', this.onEditableInput, true)
		document.removeEventListener('change', this.onEditableInput, true)
		document.removeEventListener('keydown', this.onSheetKeydown, true)
		document.removeEventListener('paste', this.onSheetPasteOrMenu, true)
		document.removeEventListener('mousedown', this.onSheetPasteOrMenu, true)
		if (this._scrollObserver) {
			this._scrollObserver.disconnect();
			this._scrollObserver = null;
		}
	},
	beforeRouteLeave(to, from, next) {
		if (!Object.keys(this.dirtyTabs).length) return next()
		const confirmation = this.confirmRef?.value?.show?.({
			title: 'Bạn có dữ liệu chưa lưu. Bạn có chắc muốn rời trang không?'
		})
		if (confirmation && typeof confirmation.then === 'function') {
			confirmation.then(confirmed => confirmed ? next() : next(false))
		} else {
			next(confirmation ? undefined : false)
		}
	},
	watch: {
		tab(newVal, oldVal) {
			if (oldVal) {
				const contents = this.$el.querySelectorAll('.jexcel_content, .jspreadsheet_content');
				if (contents.length) {
					const positions = Array.from(contents).map(c => ({ top: c.scrollTop, left: c.scrollLeft }));
					if (!this._scrollMap) this._scrollMap = new Map();
					this._scrollMap.set(oldVal, positions);
				}
			}
		},
		'filter.CapID'() {
			this.selectedLopID = this.isBghOrAdmin ? '__ALL__' : null
			this.classSelectionInitialized = false
			this.getList()
		},
		selectedSoLienLacPeriodId() {
			if (!this.isCap1) {
				this.applySoLienLacColumns()
				this.soLienLacRows = this.toSoLienLacRows(this.getSelectedClassStudents())
				this.sheetKey++
			}
		},
		selectedNhanXetThangLmsPeriodId() {
			if (this.isCap1) this.sheetKey++
		},
		currentNienKhoa() {
			this.filter.NienKhoa = this.currentNienKhoa
			this.selectedLopID = this.isBghOrAdmin ? '__ALL__' : null
			this.classSelectionInitialized = false
			this.getList()
		},
		async tab(newTab, oldTab) {
			if (this.tabChangeSaving) return
			if (oldTab && newTab !== oldTab && this.isTabDirty(oldTab) && this.isTabSaveSupported(oldTab)) {
				this.tabChangeSaving = true
				this.tab = oldTab
				try {
					await this.$nextTick()
					await this.saveTabBeforeSwitch(oldTab)
					this.tab = newTab
					await this.$nextTick()
					this.activateTab(newTab)
				} catch (error) {
					console.error('[Sổ GVCN] Không thể tự lưu trước khi chuyển tab:', error)
					this.notify(error?.message || 'Không thể lưu dữ liệu. Vui lòng thử lại.', 'error')
				} finally {
					this.tabChangeSaving = false
				}
				return
			}
			this.activateTab(newTab)
		},
	},
	methods: {
		isTabDirty(tabName) {
			return !!this.dirtyTabs?.[tabName]
		},
		markTabDirty(tabName = this.tab) {
			if (!tabName) return
			this.dirtyTabs = { ...this.dirtyTabs, [tabName]: true }
			this.hasUnsavedChanges = true
			window.__soGvcnHasUnsavedChanges = true
		},
		isTabSaveSupported(tabName) {
			return this.selectedLopID !== '__ALL__' && [
				'to-chuc-lop', 'chi-tieu', 'cong-tac-cn', 'ke-hoach', 'ren-luyen',
				'so-ket-hk1', 'tong-ket-nam', 'theo-doi-si-so', 'thong-ke-do-tuoi',
				'theo-doi-thanh-tich', 'so-lien-lac', 'noi-dung-hop-ph', 'huong-nghiep'
			].includes(tabName)
		},
		async saveTabBeforeSwitch(tabName) {
			if (!this.isTabSaveSupported(tabName)) return
			if (this.tab !== tabName) this.tab = tabName
			await this.onSaveButtonClick()
		},
		activateTab(newTab) {
			this.ensureSpecificClassForClassTabs()
			if (newTab === 'to-chuc-lop') {
				setTimeout(() => this.$refs.tabToChucLopRef?.initAllSheets(), 50)
			} else if (newTab === 'chi-tieu') {
				if (this.isCap1) {
					this.getKeHoachNamHoc()
					setTimeout(() => this.$refs.tabKeHoachNamHocRef?.initAllSheets(), 50)
				} else {
					setTimeout(() => this.$refs.tabChiTieuRef?.initAllSheets(), 50)
				}
			} else if (newTab === 'cong-tac-cn' && this.isCap1) {
				this.getCongTacChuNhiemData().then(() => {
					setTimeout(() => this.$refs.tabCongTacChuNhiemRef?.initSheet(), 50)
				})
			} else if (newTab === 'ke-hoach') {
				if (this.isCap1) {
					this.getHsCanQuanTam()
				} else {
					this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
					this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
					setTimeout(() => this.$refs.tabKeHoachRef?.initSheet(), 50)
				}
			} else if (newTab === 'ren-luyen') {
				if (this.isCap1) {
					this.getNhanXetThangLmsPeriods()
				} else {
					this.loadChuyenCanViPham().then(() => {
						this.renLuyenRows = this.toRenLuyenRows(this.getSelectedClassStudents())
						this.sheetKey++
						setTimeout(() => this.$refs.tabRenLuyenRef?.scheduleInit(), 50)
					})
				}
			} else if (newTab === 'so-ket-hk1' && this.isCap1) {
				this.getSoKetHk1()
			} else if (newTab === 'noi-dung-hop-ph' && this.isCap1) {
				this.getNoiDungHopPh()
			} else if (newTab === 'so-lien-lac') {
				if (this.isCap1) this.getTheoDoiPhHop()
				else this.getSoLienLacPeriods()
			} else if (newTab === 'theo-doi-thanh-tich' && this.isCap1) {
				this.getTheoDoiThanhTich()
			} else if (newTab === 'thong-ke-do-tuoi' && this.isCap1) {
				this.getThongKeDoTuoi()
			} else if (newTab === 'theo-doi-si-so' && this.isCap1) {
				this.getTheoDoiSiSoThang()
			} else if (newTab === 'tong-ket-nam' && this.isCap1) {
				this.getTongKetNamC1()
			}
		},
		onSheetPasteOrMenu(event) {
			const target = event.target
			const isSheetTarget = target?.closest?.('.so-gvcn-sheet-wrap, .so-gvcn-sheet, .so-gvcn-cong-tac-thang-sheet, td.editor, .jexcel_textarea')
			const isContextMenu = target?.closest?.('.jexcel_contextmenu, .jexcel_contextmenu_item')
			if (isSheetTarget || isContextMenu) {
				this.markTabDirty(this.tab)
			}
		},
		onEditableInput(event) {
			if (event && event.isTrusted === false) return
			const target = event.target
			const isSheetTarget = target?.closest?.('.so-gvcn-sheet-wrap, .so-gvcn-sheet, .so-gvcn-cong-tac-thang-sheet, td.editor, .jexcel_textarea')
			if (isSheetTarget || target?.matches?.('textarea, [contenteditable="true"]')) {
				this.markTabDirty(this.tab)
			}
		},
		onSheetKeydown(event) {
			const target = event.target
			const isSheetTarget = target?.closest?.('.so-gvcn-sheet, .so-gvcn-sheet-wrap, td.editor')
			if (isSheetTarget && !event.altKey && !event.ctrlKey && !event.metaKey
				&& ['Backspace', 'Delete'].includes(event.key)) {
				this.markTabDirty(this.tab)
				return
			}
			if (event.key !== 'Enter' || event.altKey || event.ctrlKey || event.metaKey) return
			if (target?.tagName !== 'TEXTAREA' || !target.closest?.('.so-gvcn-sheet, .so-gvcn-cong-tac-thang-sheet, td.editor')) return
			event.preventDefault()
			event.stopPropagation()
			const start = target.selectionStart ?? target.value.length
			const end = target.selectionEnd ?? start
			target.value = target.value.slice(0, start) + '\n' + target.value.slice(end)
			target.selectionStart = target.selectionEnd = start + 1
			target.dispatchEvent(new Event('input', { bubbles: true }))
			this.markTabDirty(this.tab)
		},
		onBeforeUnload(event) {
			if (!this.hasUnsavedChanges && !window.__soGvcnHasUnsavedChanges) return
			event.preventDefault()
			event.returnValue = 'Bạn có dữ liệu chưa lưu.'
		},
		clearUnsavedChanges(tabName = this.tab) {
			const nextDirtyTabs = { ...this.dirtyTabs }
			delete nextDirtyTabs[tabName]
			this.dirtyTabs = nextDirtyTabs
			this.hasUnsavedChanges = Object.keys(nextDirtyTabs).length > 0
			window.__soGvcnHasUnsavedChanges = this.hasUnsavedChanges
		},
		getFunctionRightCapIDs() {
			const value = vueData?.user?.FunctionRight ?? vueData?.user?.functionRight ?? ''
			const rights = (Array.isArray(value) ? value : String(value).split(/[;,|\s]+/))
				.map(item => Number(String(item).trim()))
				.filter(item => [10, 20, 30].includes(item))
			return [...new Set(rights.map(right => right / 10))]
		},
		getCapOptions() {
			const options = [
				{ text: 'Tiểu học', value: 1, right: 10 },
				{ text: 'Trung học cơ sở', value: 2, right: 20 },
				{ text: 'Trung học phổ thông', value: 3, right: 30 }
			]
			const allowed = this.getFunctionRightCapIDs()
			return allowed.length ? options.filter(item => allowed.includes(item.value)) : options
		},
		getDefaultCapID() {
			const options = this.getCapOptions()
			const urlCapID = Number(vueData?.CapID || vueData?.capid)
			return options.some(item => item.value === urlCapID) ? urlCapID : options[0]?.value || 1
		},
		getDefaultFilter() {
			return {
				NienKhoa: vueData.NienKhoa || new Date().getFullYear(),
				CapID: this.getDefaultCapID(),
				KhoiID: 0,
				LopID: '',
				Keyword: ''
			}
		},
		onResize() {
			const vh = window.innerHeight
			this.sheetHeight = Math.max(320, vh - 126) + 'px'
			this.keHoachSheetHeight = Math.max(280, vh - 290) + 'px'
			this.renLuyenSheetHeight = Math.max(280, vh - 260) + 'px'
			this.soLienLacSheetHeight = Math.max(280, vh - 260) + 'px'
			this.huongNghiepSheetHeight = Math.max(280, vh - 260) + 'px'
		},
		async onRefreshCurrentTab() {
			this.loading.list = true
			try {
				if (this.selectedLopID === '__ALL__') {
					await this.getList()
					return
				}
				// Nếu ở tab dữ liệu HS thì làm mới danh sách HS và điểm tổng kết
				if (this.tab === 'du-lieu-hs') {
					await this.getList()
				} else {
					// Với các tab chi-tieu, ke-hoach, ren-luyen, so-lien-lac, huong-nghiep: chỉ fetch lại detail của Sổ hiện tại
					await this.getDetail()
					if (this.tab === 'chi-tieu') {
						this.$refs.tabChiTieuRef?.initAllSheets()
					} else if (this.tab === 'ren-luyen') {
						this.$refs.tabRenLuyenRef?.scheduleInit()
					}
				}
				this.notify('Đã làm mới dữ liệu tab hiện tại')
			} finally {
				this.loading.list = false
			}
		},
		statusText(status) {
			return ({ NEW: 'Chưa tạo', DRAFT: 'Đã lưu', SUBMITTED: 'Đã lưu' })[status] || status || 'Chưa tạo'
		},
		statusColor(status) {
			return ({ NEW: 'grey', DRAFT: 'warning', SUBMITTED: 'success' })[status] || 'grey'
		},
		notify(message, color = 'success') {
			if (this.savingGroupedClasses) return
			if (this.snackbarRef?.value?.showSnackbar) {
				return this.snackbarRef.value.showSnackbar({ message, color })
			}
			if (window.showMessage) return showMessage({ title: message })
		},
			async getList() {
				this.loading.list = true
				try {
					this.allStudentRows = await ajaxCALLPromise('lms/SoGVCNDanhSachHocSinhLop', {
						NienKhoa: this.filter.NienKhoa,
						CapID: this.filter.CapID,
						LopID: ''
					})
					if (this.isCap1GradeManager) {
						this.allStudentRows = (this.allStudentRows || []).filter(row =>
							this.cap1ManagedKhoiIDs.includes(Number(row.KhoiID)))
					}
					// Giáo viên và tổ trưởng chỉ thấy lớp đang chủ nhiệm trong niên khóa hiện tại.
					// Khối trưởng/khối phó cấp 1 (FunctionRight 11-15) được xem toàn bộ lớp.
					if (!this.isBghOrAdmin && !this.isCap1GradeManager) {
						const teacherClassIds = await this.getTeacherHomeroomClassIds()
						const teacherRows = (this.allStudentRows || []).filter(row => teacherClassIds.has(String(row.LopID)))
						// Không được giữ lại toàn bộ danh sách khi không tìm thấy lớp GVCN.
						// Giáo viên bộ môn (SR 2) không có lớp chủ nhiệm phải thấy danh sách rỗng.
						this.allStudentRows = teacherRows
					}
					this.allStudentRows = await this.enrichClassMetadata(this.allStudentRows)
					this.classList = this.buildClassList(this.allStudentRows)
					if (!this.classSelectionInitialized) {
						this.selectedLopID = this.classList[0]?.LopID || (this.isBghOrAdmin ? '__ALL__' : null)
						this.classSelectionInitialized = true
					}
					// Chỉ tải dữ liệu bổ sung của tab Dữ liệu HS khi tab này đang được mở.
					// Các tab nghiệp vụ khác không cần gọi thêm API điểm tổng kết/thông tin gia đình.
					if (this.tab === 'du-lieu-hs') await this.mergeThongTinGiaDinh()
					if (!this.classOptions.some(x => String(x.LopID) === String(this.selectedLopID))) {
						this.selectedLopID = this.classList[0]?.LopID || (this.isBghOrAdmin ? '__ALL__' : null)
					}
					await this.onClassChange(this.selectedLopID)
					await this.ensureSpecificClassForClassTabs()
				} finally {
					this.loading.list = false
				}
			},
			async getTeacherHomeroomClassIds() {
				const userID = String(vueData?.user?.UserID || vueData?.sys_UserID || '').trim()
				const khoiIds = [...new Set((this.allStudentRows || []).map(row => Number(row.KhoiID)).filter(Boolean))]
				const classRows = (await Promise.all(khoiIds.map(khoiID => ajaxCALLPromise('lms/Lop_Get_ByKhoiID', {
					NienKhoa: this.filter.NienKhoa,
					KhoiID: khoiID
				}).catch(() => [])))).flat()
				const matchedIds = classRows.concat(this.allStudentRows || [])
					.filter(row => row && row.IsNhom !== true && this.isHomeroomClassOfCurrentUser(row, userID))
					.map(row => String(row.LopID))
				return new Set(matchedIds)
			},
			async enrichClassMetadata(rows) {
				const khoiIds = [...new Set((rows || []).map(row => Number(row.KhoiID)).filter(Boolean))]
				const classRows = (await Promise.all(khoiIds.map(khoiID => ajaxCALLPromise('lms/Lop_Get_ByKhoiID', {
					NienKhoa: this.filter.NienKhoa,
					KhoiID: khoiID
				}).catch(() => [])))).flat()
				const metadata = new Map(classRows.map(row => [String(row.LopID), row]))
				return (rows || []).map(row => ({
					...row,
					...(metadata.get(String(row.LopID)) || {})
				}))
			},
			isHomeroomClassOfCurrentUser(row, userID) {
				if (!row || !userID) return false
				const candidateKeys = [
					'GVCN',
					'GVCNID',
					'GVCN_ID',
					'GVCNUserID',
					'UserID_GVCN'
				]
				return candidateKeys.some(key => this.valueMatchesUserID(row[key], userID))
			},
			valueMatchesUserID(value, userID) {
				if (value === undefined || value === null || !userID) return false
				return String(value)
					.split(/[;,|]/)
					.map(item => item.trim())
					.some(item => item === userID)
			},
			async ensureSpecificClassForClassTabs() {
				if (this.isCap1GradeManager) return
				if (this.selectedLopID !== '__ALL__') return
				if (this.tab === 'du-lieu-hs' && !this.isTeacherOrLead) return
				const firstClass = this.classList[0]
				if (firstClass) await this.onClassChange(firstClass.LopID)
			},
		getRenLuyenMonthNote() {
			return 'Ghi tóm tắt vi phạm - tái phạm - số ngày nghỉ - thời gian/xử lí/có mời PH/có cam kết lần...\nGhi nhận tiến bộ về mặt nào đó, thành tích, đóng góp'
		},
		getSoLienLacGuideline() {
			return 'Hướng dẫn: Căn cứ sheet HỒ SƠ THEO DÕI QTRL, GVCN soạn nhận xét để cập nhật MLS cho PHHS. Nhận xét học sinh cần phù hợp với các minh chứng trong sheet HỒ SƠ THEO DÕI QTRL. Cấu trúc nhận xét từng tháng như sau:\n- Tinh thần, thái độ học tập và mức độ tiến bộ của học sinh (Chú trọng ghi nhận sự tiến bộ)\n- Việc tuân thủ nội quy, nền nếp, chuyên cần trong tháng:\n- Đề xuất PHHS phối hợp giáo dục:'
		},
		buildClassList(rows) {
			const map = new Map()
			;(rows || []).forEach(row => {
				if (!row.LopID) return
				const tenLop = String(row.LopMoi || row.TenLop || row.LopID).trim()
				const isLopToHop = Number(row.CapID || this.filter.CapID) === 3 &&
					(row.IsLopToHop === true || Number(row.IsLopToHop) === 1)
				const tenLopGoc = isLopToHop ? (tenLop.replace(/[0-9]+$/, '') || tenLop) : tenLop
				const key = isLopToHop
					? String(row.KhoiID || '') + '|' + tenLopGoc
					: String(row.LopID)
				const item = map.get(key) || {
					NienKhoa: this.filter.NienKhoa,
					LopID: row.LopID,
					LopIDs: [],
					TenLop: tenLopGoc,
					TenLopThanhVien: [],
					KhoiID: row.KhoiID,
					TrangThai: 'NEW'
				}
				const lopID = String(row.LopID)
				if (!item.LopIDs.some(id => String(id) === lopID)) item.LopIDs.push(row.LopID)
				if (!item.TenLopThanhVien.some(name => name === tenLop)) item.TenLopThanhVien.push(tenLop)
				map.set(key, item)
			})
			return [...map.values()].map(item => ({
				...item,
				TenLopThanhVien: [...item.TenLopThanhVien].sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true })),
				TenLop: item.TenLopThanhVien.length > 1
					? item.TenLop + ' (' + [...item.TenLopThanhVien].sort((a, b) => String(a).localeCompare(String(b), 'vi', { numeric: true })).join(', ') + ')'
					: item.TenLop
			})).sort((a, b) => {
				if ((a.KhoiID || 0) !== (b.KhoiID || 0)) return (a.KhoiID || 0) - (b.KhoiID || 0)
				return `${a.TenLop}`.localeCompare(`${b.TenLop}`)
			})
		},
		getSelectedClassIDs() {
			if (this.selectedLopID === '__ALL__') return []
			const item = this.selectedClass || this.classList.find(x => String(x.LopID) === String(this.selectedLopID))
			return (item?.LopIDs || [item?.LopID || this.selectedLopID]).filter(Boolean).map(id => String(id))
		},
		async mergeTongKetDiem(classes) {
			this.loading.tongKet = true
			try {
				const selectedRows = this.selectedLopID && this.selectedLopID !== '__ALL__'
					? this.getSelectedClassStudents()
					: []
				const targets = this.buildTongKetTargets(selectedRows).filter(item => item.KhoiID >= 6)
				const chunks = await Promise.all(targets.map(item => ajaxCALLPromise(`${this.getDiemSub(item.KhoiID)}/LMS_GetTongKetDTBMonHocByLop`, {
					KhoiID: item.KhoiID,
					LopID: item.LopID,
					HocKy: 0,
					NienKhoa: this.filter.NienKhoa - 1
				}).catch(() => [])))
				const cap1Rows = this.isCap1
					? await this.getTongKetCap1Rows(selectedRows)
					: []
				const map = new Map()
				chunks.flat().concat(cap1Rows).forEach(row => {
					const hocSinhLopID = row.HocSinhLopID || row.HSLopID
					if (hocSinhLopID) map.set(`hsl:${hocSinhLopID}`, row)
					if (row.HocSinhID) map.set(`hs:${row.HocSinhID}`, row)
				})
				this.allStudentRows = this.allStudentRows.map(row => {
					const tongKet = map.get(`hs:${row.HocSinhID}`) || map.get(`hsl:${row.HSLopID}`)
					return tongKet ? this.applyTongKet(row, tongKet) : row
				})
			} finally {
				this.loading.tongKet = false
			}
		},
		buildTongKetTargets(rows) {
			const map = new Map()
			;(rows || []).forEach(row => {
				const lopID = row.LopCuID
				if (!lopID || map.has(lopID)) return
				const khoiCu = Number(row.KhoiID || 0) - 1
				if (khoiCu < 1) return
				map.set(lopID, {
					LopID: lopID,
					KhoiID: khoiCu
				})
			})
			return [...map.values()]
		},
		getDiemSub(khoiID) {
			const khoi = Number(khoiID)
			if (khoi >= 10) return 'diemc3'
			return 'diemc2'
		},
		async getTongKetCap1Rows(rows) {
			const cap1Targets = this.buildTongKetTargets(rows)
				.filter(item => item.KhoiID >= 1 && item.KhoiID <= 5)
			if (!cap1Targets.length) return []
			const chunks = await Promise.all(cap1Targets.map(target => ajaxCALLPromise('psmark1/LMS_GetBangTongHopKetQua', {
				LopID: target.LopID,
				KyDanhGia: 4
			}).catch(() => [])))
			return chunks.flat()
		},
		applyTongKet(row, tongKet) {
			let xepLoaiKQGD = tongKet.HocLuc || row.KQHT || ''
			if (this.isTongKetChecked(tongKet.HoanThanhXuatSac)) xepLoaiKQGD = 'Hoàn thành xuất sắc'
			else if (this.isTongKetChecked(tongKet.HoanThanhTot)) xepLoaiKQGD = 'Hoàn thành tốt'
			else if (this.isTongKetChecked(tongKet.HoanThanh)) xepLoaiKQGD = 'Hoàn thành'
			else if (this.isTongKetChecked(tongKet.ChuaHoanThanh)) xepLoaiKQGD = 'Chưa hoàn thành'
			else if (tongKet.DanhGia) xepLoaiKQGD = tongKet.DanhGia

			return {
				...row,
				Toan: this.pickTongKetValue(tongKet, ['toan', 'Toan', 'DiemToan', 'Diem_Toan', 'Toán'], row.Toan || row['Toán'] || ''),
				Van: this.pickTongKetValue(tongKet, ['van', 'Van', 'DiemVan', 'Diem_Van', 'DiemTV', 'Diem_TV', 'DiemTiengViet', 'Diem_TiengViet', 'TiengViet', 'Tiếng Việt', 'Văn'], row.Van || row['Văn'] || ''),
				Anh: this.pickTongKetValue(tongKet, ['anh', 'Anh', 'DiemAnh', 'Diem_Anh', 'DiemTA', 'Diem_TA', 'TiengAnh', 'Tiếng Anh'], row.Anh || ''),
				KHTN: tongKet.KHTN || tongKet.HKTN || row.KHTN || '',
				'LS-ĐL': tongKet['LS-ĐL'] || tongKet['LS-DL'] || tongKet.su || row['LS-ĐL'] || '',
				'GDCD/GDKTPL': tongKet.gdcd || tongKet.GDCD || tongKet.gdktpl || tongKet.GDKTPL || tongKet['GDCD/GDKTPL'] || row['GDCD/GDKTPL'] || '',
				Tin: tongKet.tin || row.Tin || '',
				CN: tongKet.CN || row.CN || '',
				'Địa lí': tongKet.dia || row['Địa lí'] || '',
				'Vật lí': tongKet.ly || row['Vật lí'] || '',
				Hoa: tongKet.hoa || row.Hoa || row['Hóa'] || '',
				Sinh: tongKet.sinh || row.Sinh || '',
				DTB: tongKet.DTB || row.DTB || '',
				KQHT: xepLoaiKQGD,
				KhenThuong: tongKet.KhenThuong || tongKet.DanhHieu || row.KhenThuong || row.DanhHieu || '',
				KQRL: tongKet.KQRenLuyen || row.KQRL || '',
				DanhHieu: tongKet.DanhHieu || row.DanhHieu || '',
				Phep: tongKet.Phep ?? row.Phep,
				KhongPhep: tongKet.KhongPhep ?? row.KhongPhep,
				TongBuoiNghi: tongKet.TongBuoiNghi ?? row.TongBuoiNghi
			}
		},
		isTongKetChecked(value) {
			return value === true || value === 1 || String(value || '').trim().toLowerCase() === 'x'
		},
		pickTongKetValue(source, keys, fallback) {
			for (const key of keys) {
				const value = source?.[key]
				if (value !== undefined && value !== null && value !== '') return value
			}
			return fallback
		},
		async mergeThongTinGiaDinh() {
			this.loading.family = true
			try {
				const targets = this.buildCapHocGiaDinhTargets(this.allStudentRows)
				const chunks = await Promise.all(targets.map(capHoc => ajaxCALLPromise('student/LMS_GetThongTinPhuHuynh', {
					CapHoc: capHoc
				}).catch(() => [])))
				const map = new Map()
				chunks.flat().forEach(row => {
					if (!row.HocSinhID || map.has(`${row.HocSinhID}`)) return
					map.set(`${row.HocSinhID}`, row)
				})
				this.allStudentRows = this.allStudentRows.map(row => {
					const info = map.get(`${row.HocSinhID}`)
					return info ? this.applyThongTinGiaDinh(row, info) : row
				})
			} finally {
				this.loading.family = false
			}
		},
		buildCapHocGiaDinhTargets(rows) {
			const set = new Set()
			;(rows || []).forEach(row => {
				const khoi = Number(row.KhoiID || 0)
				const khoiCu = khoi - 1
				this.addCapHocByKhoi(set, khoiCu)
				this.addCapHocByKhoi(set, khoi)
			})
			return [...set.values()].sort((a, b) => a - b)
		},
		addCapHocByKhoi(set, khoi) {
			if (khoi >= 1 && khoi <= 5) set.add(1)
			else if (khoi >= 6 && khoi <= 9) set.add(2)
			else if (khoi >= 10 && khoi <= 12) set.add(3)
		},
		applyThongTinGiaDinh(row, info) {
			const danToc = info.TenDanToc || info.DanToc || info['Dân tộc']
				|| row.TenDanToc || row.DanToc || ''
			return {
				...row,
				TenDanToc: danToc,
				DanToc: danToc,
				Cha: info.Cha || row.Cha || '',
				NgheNghiepCha: info.NgheNghiepCha || row.NgheNghiepCha || '',
				SDTCha: info.DienThoaiCha || row.SDTCha || '',
				Me: info.Me || row.Me || '',
				NgheNghiepMe: info.NgheNghiepMe || row.NgheNghiepMe || '',
				SDTMe: info.DienThoaiMe || row.SDTMe || '',
				NguoiDoDau: info.NguoiDoDau || row.NguoiDoDau || '',
				SDTNguoiDoDau: info.DienThoaiDoDau || row.SDTNguoiDoDau || '',
				AnSang: info.AnSang ?? row.AnSang ?? '',
				Xe: info.Xe ?? row.Xe ?? '',
				DiaChi: info.DiaChi || row.DiaChi || ''
			}
		},
		async onClassChange(lopID) {
			this.selectedLopID = lopID
			this.resetSo()
			if (!lopID || lopID === '__ALL__') {
				this.setStudentSheets(this.allStudentRows)
				return
			}
			if (this.tab === 'du-lieu-hs') await this.mergeTongKetDiem()
			const item = this.classList.find(x => String(x.LopID) === String(lopID))
			if (item) await this.openSo(item)
		},
		resetSo() {
			this.selectedClass = null
			this.showAttendanceAlert = false
			this.detail = {}
			this.monthList = []
			this.weeklyPlanList = []
			this.attendanceSummaries = {}
			this.chiTieuSavedRows = []
			this.siSoSavedRows = []
			this.hsCanQuanTamSavedRows = []
			this.soKetHk1SavedRows = []
			this.tongKetNamC1SavedData = {}
			this.giaoVienBoMonSavedRows = []
			this.banDaiDienCMHSSavedRows = []
			this.canBoLopSavedRows = []
			this.toNhomHocSinhSavedRows = []
			this.huongNghiepSavedRows = []
			this.keHoachNamHocData = null
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			this.initKeHoachSheet()
			this.form = {
				SoGVCNID: 0,
				ThongTinLop: '',
				ChiTieu: '',
				SiSo: '',
				GiaoVienBoMon: '',
				BanDaiDienCMHS: '',
				CanBoLop: '',
				HuongNghiep: ''
			}
			this.applySiSoRows()
			this.applyChiTieuRows()
			this.applyBanDaiDienCMHSRows()
			this.applyCanBoLopRows()
			this.huongNghiepRows = this.buildHuongNghiepRows()
		},
		async openSo(item) {
			this.selectedClass = item
			this.filter.LopID = item.LopID
			this.loading.detail = true
			try {
				const classIDs = item.LopIDs || [item.LopID]
				const contexts = await Promise.all(classIDs.map(lopID => ajaxCALLPromise('lms/SoGVCNEnsure', {
					NienKhoa: item.NienKhoa,
					LopID: lopID
				})))
				this.soGVCNContexts = contexts.map((context, index) => ({
					...context,
					LopID: classIDs[index]
				}))
				this.form.SoGVCNID = this.soGVCNContexts[0]?.SoGVCNID || 0
				await this.getStudents()
				if (!this.isCap1) await this.loadChuyenCanViPham(this.getSelectedClassStudents())
				await this.getDetail()
			} finally {
				this.loading.detail = false
			}
		},
		async getHsCanQuanTam() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const hsResponse = await ajaxCALLPromise('lms/SoGVCNHsCanQuanTamGet', {
				SoGVCNID: this.form.SoGVCNID
			})
			const responseData = Array.isArray(hsResponse?.data) ? hsResponse.data : hsResponse
			this.hsCanQuanTamSavedRows = Array.isArray(responseData?.[0])
				? responseData[0]
				: (Array.isArray(responseData) ? responseData : [])
		},
		async getHsNhanXetThangLms() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNHsNhanXetThangLmsGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.nhanXetThangLmsSavedRows = Array.isArray(res) ? res : (Array.isArray(res?.[0]) ? res[0] : [])
		},
		async getNhanXetThangLmsPeriods(students = this.getSelectedClassStudents()) {
			if (!this.isCap1 || !this.selectedLopID || this.selectedLopID === '__ALL__') return
			this.loading.month = true
			this.nhanXetThangLmsPeriods = []
			this.selectedNhanXetThangLmsPeriodId = null
			try {
				const response = await ajaxCALLPromise('lms/NhanXetThang_Lop_Get_GV', {
					NienKhoa: this.currentNienKhoa,
					LopID: this.selectedLopID
				}).catch(() => [])
				const periods = (Array.isArray(response) ? response : []).sort((a, b) => {
					const finalValue = item => item.Text_Thang_VI === 'Cuối năm' ? 1 : 0
					return (Number(a.Nam) * 10000 + Number(a.Thang) * 10 + finalValue(a)) -
						(Number(b.Nam) * 10000 + Number(b.Thang) * 10 + finalValue(b))
				})
				this.nhanXetThangLmsPeriods = await Promise.all(periods.map(async period => ({
					...period,
					items: await ajaxCALLPromise('lms/NhanXetThang_Get', {
						Lop_NhanXetThangID: period.Lop_NhanXetThangID,
						LopID: this.selectedLopID
					}).catch(() => [])
				})))
				if (this.nhanXetThangLmsPeriods.length) {
					this.selectedNhanXetThangLmsPeriodId = this.nhanXetThangLmsPeriods[0].Lop_NhanXetThangID
				}
				this.sheetKey++
			} finally {
				this.loading.month = false
			}
		},
		async getCongTacChuNhiemData() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const response = await ajaxCALLPromise('lms/SoGVCNKeHoachTuanGet', {
				SoGVCNID: this.form.SoGVCNID
			}).catch(() => [])
			this.weeklyPlanList = Array.isArray(response?.[0])
				? response[0]
				: (Array.isArray(response) ? response : [])
		},
		async getSoKetHk1() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNSoKetHKIGet', { SoGVCNID: this.form.SoGVCNID })
			this.soKetHk1SavedRows = Array.isArray(res?.[0]) ? res[0] : (Array.isArray(res) ? res : [])
		},
		async getNoiDungHopPh() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNNoiDungHopPHGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.noiDungHopPhSavedRows = Array.isArray(res) ? res : (Array.isArray(res?.[0]) ? res[0] : [])
		},
		async getTheoDoiPhHop() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNTheoDoiPhuHuynhHopGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.theoDoiPhHopSavedRows = Array.isArray(res?.[0])
				? res[0]
				: (Array.isArray(res) ? res : [])
		},
		async getTheoDoiThanhTich() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNTheoDoiThanhTichGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.thanhTichSavedRows = Array.isArray(res) ? res : (Array.isArray(res?.[0]) ? res[0] : [])
		},
		async getThongKeDoTuoi() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNThongKeDoTuoiGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.thongKeDoTuoiSavedRows = Array.isArray(res) ? res : (Array.isArray(res?.[0]) ? res[0] : [])
		},
		async getTheoDoiSiSoThang() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			const res = await ajaxCALLPromise('lms/SoGVCNTheoDoiSiSoThangGet', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			this.siSoSavedRows = Array.isArray(res?.[0])
				? res[0]
				: (Array.isArray(res) ? res : [])
		},
		async getTongKetNamC1() {
			if (!this.form.SoGVCNID || !this.isCap1) return
			this.tongKetNamC1SavedData = {}
			const res = await ajaxCALLPromise('lms/SoGVCNTongKetNamC1Get', { SoGVCNID: this.form.SoGVCNID }).catch(() => [])
			const row = Array.isArray(res) ? (res[0]?.[0] || res[0]) : res
			if (row) {
				const parseJson = (str) => {
					return typeof str === 'string' ? (this.safeParseJson(str, []) || []) : (str || [])
				}
				this.tongKetNamC1SavedData = {
					DuyTriSoLuong: row.DuyTriSoLuong || '',
					NangLucPhamChat: row.NangLucPhamChat || '',
					KienThucKyNang: row.KienThucKyNang || '',
					HoanThanhCT: row.HoanThanhCT || '',
					PhongTraoKhac: row.PhongTraoKhac || '',
					Sheet1: parseJson(row.JsonSheet1),
					Sheet2: parseJson(row.JsonSheet2),
					Sheet3: parseJson(row.JsonSheet3),
					Sheet4: parseJson(row.JsonSheet4)
				}
			}
		},
		async getSoLienLacPeriods(students = this.getSelectedClassStudents()) {
			if (this.isCap1 || !this.selectedLopID || this.selectedLopID === '__ALL__') return
			this.loading.month = true
			this.soLienLacPeriods = []
			this.selectedSoLienLacPeriodId = null
			this.soLienLacRows = []
			try {
				const classIDs = this.getSelectedClassIDs()
				const responses = await Promise.all(classIDs.map(lopID => ajaxCALLPromise('lms/NhanXetThang_Lop_Get_GV', {
					NienKhoa: this.currentNienKhoa,
					LopID: lopID
				}).catch(() => [])))
				const periodMap = new Map()
				responses.forEach((response, classIndex) => {
					const periods = Array.isArray(response?.[0]) ? response[0] : (Array.isArray(response) ? response : [])
					periods.forEach(period => {
						const key = String(period.Nam || '') + '|' + String(period.Thang || '') + '|' + String(period.Text_Thang_VI || '')
						const current = periodMap.get(key) || { ...period, items: [], __periods: [] }
						if (!current.__periods.some(item => String(item.LopID) === String(classIDs[classIndex]))) {
							current.__periods.push({ ...period, LopID: classIDs[classIndex] })
						}
						periodMap.set(key, current)
					})
				})
				const periods = [...periodMap.values()].sort((a, b) => {
					const finalValue = item => item.Text_Thang_VI === 'Cuối năm' ? 1 : 0
					return (Number(a.Nam) * 10000 + Number(a.Thang) * 10 + finalValue(a)) -
						(Number(b.Nam) * 10000 + Number(b.Thang) * 10 + finalValue(b))
				})
				const loaded = await Promise.all(periods.map(async period => ({
					...period,
					items: (await Promise.all((period.__periods || []).map(async item => {
						const response = await ajaxCALLPromise('lms/NhanXetThang_Get', {
							Lop_NhanXetThangID: item.Lop_NhanXetThangID,
							LopID: item.LopID
						}).catch(() => [])
						const rows = Array.isArray(response?.[0]) ? response[0] : (Array.isArray(response) ? response : [])
						return rows.map(row => ({ ...row, __LopID: item.LopID, __Lop_NhanXetThangID: item.Lop_NhanXetThangID }))
					}))).flat()
				})))
				loaded.forEach(period => {
					period.fields = [12, 5].includes(Number(period.Thang))
						? [
							{ key: 'UuDiem', title: 'Ưu điểm' },
							{ key: 'NhuocDiem', title: 'Nhược điểm' },
							{ key: 'DeXuat', title: 'Đề xuất' },
							...(Number(period.Thang) === 5 ? [{ key: 'NhanXetGVCN', title: 'Nhận xét ghi học bạ' }] : [])
						]
						: [
							{ key: 'NoiDungKienThuc_HTML', title: 'Về học tập' },
							{ key: 'NoiDungNangLuc_HTML', title: 'Về nền nếp' },
							{ key: 'NoiDungHoatDongKhac_HTML', title: 'Mong muốn phối hợp' }
						]
				})
				this.soLienLacPeriods = loaded
				if (!loaded.some(x => Number(x.Lop_NhanXetThangID) === Number(this.selectedSoLienLacPeriodId))) {
					this.selectedSoLienLacPeriodId = loaded[0]?.Lop_NhanXetThangID || null
				}
				this.applySoLienLacColumns()
				this.soLienLacRows = this.toSoLienLacRows(students)
				this.sheetKey++
			} finally {
				this.loading.month = false
			}
		},
		async getDetail() {
			if (!this.form.SoGVCNID) return
			const contexts = this.soGVCNContexts.length
				? this.soGVCNContexts
				: [{ LopID: this.selectedLopID, SoGVCNID: this.form.SoGVCNID }]
			const datasets = await Promise.all(contexts.map(context =>
				ajaxCALLPromise('lms/SoGVCNGet/' + context.SoGVCNID).catch(() => [])
			))
			const data = datasets[0] || []
			this.detail = Array.isArray(data) ? (data[0]?.[0] || {}) : data
			this.monthList = Array.isArray(data?.[1]) ? data[1] : []
			const shouldLoadWeeklyPlan = !this.isCap1 || this.tab === 'cong-tac-cn'
			const weeklyResponses = shouldLoadWeeklyPlan
				? await Promise.all(contexts.map(context => ajaxCALLPromise('lms/SoGVCNKeHoachTuanGet', {
					SoGVCNID: context.SoGVCNID
				}).catch(() => [])))
				: []
			this.weeklyPlanList = this.mergeSoGVCNRows(weeklyResponses.map(response =>
				Array.isArray(response?.[0]) ? response[0] : (Array.isArray(response) ? response : [])
			))
			this.chiTieuSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[2]))
			this.renLuyenSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[3]))
			this.soLienLacSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[4]))
			this.siSoSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[5]))
			this.giaoVienBoMonSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[6]))
			this.banDaiDienCMHSSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[7]))
			this.canBoLopSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[8]))
			this.huongNghiepSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[9]))
			this.toNhomHocSinhSavedRows = this.mergeSoGVCNRows(datasets.map(item => item?.[10]))
			if (this.isCap1) {
				if (this.tab === 'chi-tieu') await this.getKeHoachNamHoc()
				if (this.tab === 'ke-hoach') await this.getHsCanQuanTam()
				if (this.tab === 'ren-luyen') await this.getNhanXetThangLmsPeriods()
				if (this.tab === 'so-ket-hk1') await this.getSoKetHk1()
				if (this.tab === 'noi-dung-hop-ph') await this.getNoiDungHopPh()
				if (this.tab === 'so-lien-lac') await this.getTheoDoiPhHop()
				if (this.tab === 'theo-doi-thanh-tich') await this.getTheoDoiThanhTich()
				if (this.tab === 'thong-ke-do-tuoi') await this.getThongKeDoTuoi()
				if (this.tab === 'theo-doi-si-so') await this.getTheoDoiSiSoThang()
				if (this.tab === 'tong-ket-nam') await this.getTongKetNamC1()
			}
			if (!this.isCap1 || this.tab === 'cong-tac-cn') {
				this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
				this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
				this.initKeHoachSheet()
			}
			Object.keys(this.form).forEach(key => {
				if (key !== 'SoGVCNID') this.form[key] = this.detail[key] || ''
			})
			this.applySiSoRows()
			this.applyChiTieuRows()
			this.applyGiaoVienBoMonRows()
			this.applyBanDaiDienCMHSRows()
			this.applyCanBoLopRows()
			this.huongNghiepRows = this.buildHuongNghiepRows()
			if (!this.isCap1) await this.getGiaoVienBoMon()

			const students = this.getSheetStudents()
			if (students.length > 0) {
				this.renLuyenRows = this.toRenLuyenRows(students)
				if (!this.isCap1 && this.tab === 'ren-luyen') {
					await this.loadChuyenCanViPham(students)
					this.renLuyenRows = this.toRenLuyenRows(students)
				}
				if (!this.isCap1 && this.tab === 'so-lien-lac') await this.getSoLienLacPeriods(students)
				else this.soLienLacRows = this.toSoLienLacRows(students)
				this.setStudentSheets(students)
			}
			this.sheetKey++
		},
		mergeSoGVCNRows(chunks) {
			const rows = (chunks || []).flatMap(chunk => Array.isArray(chunk) ? chunk : [])
			const seen = new Set()
			return rows.filter(row => {
				const key = JSON.stringify(row)
				if (seen.has(key)) return false
				seen.add(key)
				return true
			})
		},
		async getStudents() {
			this.loading.students = true
			try {
				const rows = this.getSelectedClassStudents()
				this.setStudentSheets(rows)
			} finally {
				this.loading.students = false
			}
		},
		async getKeHoachNamHoc() {
			if (!this.form.SoGVCNID) {
				this.keHoachNamHocData = null
				return
			}
			const response = await ajaxCALLPromise('lms/SoGVCNKeHoachNamHocGet', { SoGVCNID: this.form.SoGVCNID })
				.catch(() => [])
			const firstResult = Array.isArray(response) ? response[0] : response
			const row = Array.isArray(firstResult) ? (firstResult[0] || {}) : (firstResult || {})
			const json = row.JsonData || row.KeHoachNamHoc || ''
			if (!json) {
				this.keHoachNamHocData = null
				return
			}
			try {
				this.keHoachNamHocData = typeof json === 'string' ? this.safeParseJson(json) : json
			} catch (error) {
				console.error('Dữ liệu kế hoạch năm học không hợp lệ:', error)
				this.keHoachNamHocData = null
			}
		},
		setStudentSheets(rows) {
			this.studentSheetRows = this.isCap1 ? this.toCap1SheetRows(rows) : this.toSheetRows(rows)
			this.applyStudentDropdownOptions()
			this.sheetKey++
		},
		toCap1SheetRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.HoTen || x.HoTenHocSinh || '',
				x.MaHocSinh || x.HocSinhID || '',
				x.NgaySinh || '',
				(x.GioiTinh === 'Nữ' || x.Phai === 'x' || x.IsNu) ? 'x' : '',
				x.TenDanToc || x.DanToc || '',
				x.KQHT || x.DanhGia || '',
				x.KhenThuong || '',
				this.buildNhanXetGVCN(x),
				x.SoThich || x.DacDiem || '',
				x.Cha || x.HoTenCha || '',
				x.NgheNghiepCha || '',
				x.SDTCha || x.DienThoaiCha || '',
				x.Me || x.HoTenMe || '',
				x.NgheNghiepMe || '',
				x.SDTMe || x.DienThoaiMe || '',
				x.NguoiDoDau || '',
				x.SDTNguoiDoDau || x.DienThoaiDoDau || '',
				x.DiaChi || '',
				x.GhiChu || ''
			])
		},
		toSheetRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
				x.LopMoi || x.TenLop || '',
				x.NhomAV || '',
				x.LopCu || '',
				x.Toan || x['Toán'] || '',
				x.Van || x['Văn'] || '',
				x.Anh || x['Anh'] || '',
				x.KHTN || '',
				x['LS-ĐL'] || '',
				x['GDCD/GDKTPL'] || '',
				x.Tin || '',
				x.CN || '',
				x['Địa lí'] || '',
				x['Vật lí'] || '',
				x.Hoa || x['Hóa'] || '',
				x.Sinh || '',
				x.KQRL || '',
				x.KQHT || '',
				x.DanhHieu || '',
				this.buildNhanXetGVCN(x),
				x.Cha || '',
				x.NgheNghiepCha || '',
				x.SDTCha || '',
				x.Me || '',
				x.NgheNghiepMe || '',
				x.SDTMe || '',
				x.NguoiDoDau || '',
				x.SDTNguoiDoDau || '',
				this.renderCheckedValue(x.AnSang),
				this.renderCheckedValue(x.Xe),
				x.DiaChi || '',
				x.GhiChu || ''
			])
		},
		toRenLuyenRows(rows) {
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 0, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 99, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 8, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 9, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 10, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 11, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 12, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 91, 'NoiDung'), // NHẬN XÉT HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 81, 'NoiDung'), // KQRL HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 82, 'NoiDung'), // KQHT HKI
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 1, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 3, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 4, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 5, 'NoiDung'),
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 92, 'NoiDung'), // NHẬN XÉT HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 93, 'NoiDung'), // KQRL HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 94, 'NoiDung'), // KQHT HKII
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 95, 'NoiDung'), // DANH HIỆU
				this.getSavedMonthlyValue(this.renLuyenSavedRows, x.HSLopID, 96, 'NoiDung') // THÀNH TÍCH KHÁC
			])
		},
		async loadChuyenCanViPham(students = this.getSelectedClassStudents()) {
			if (this.isCap1 || !students.length || !this.selectedClass) return
			const cacheKey = `${this.currentNienKhoa}:${this.selectedLopID}`
			if (this.attendanceCache[cacheKey]) {
				this.attendanceSummaries = this.attendanceCache[cacheKey]
				return
			}
			this.attendanceLoading = true
			this.attendanceSummaries = {}
			try {
				const lopHocIDs = await this.getSelectedLopHocIDs()
				if (!lopHocIDs.length) {
					console.warn('[so-gvcn] Không tìm thấy LopHocID quansinh cho lớp', {
						LopID: this.selectedLopID,
						TenLop: this.selectedClass?.TenLop,
						KhoiID: this.selectedClass?.KhoiID,
						NienKhoa: this.currentNienKhoa,
					})
					return
				}
				const summaries = {}
				for (const month of this.getMonthlyAttendanceRanges()) {
					const details = (await Promise.all(lopHocIDs.map(async lopHocID => {
						const types = await ajaxCALLPromise('quansinh/LMS_SoDauBai_TongHopTheoLoaiViPham', {
							TuNgay: month.firstDay, DenNgay: month.lastDay, LopHocID: lopHocID
						}, { cache: false }).catch(() => [])
						return Promise.all((types || []).filter(type => Number(type.SoLuong) > 0).map(type => ajaxCALLPromise(
							'quansinh/LMS_SoDauBai_TongHopTheoLoaiViPham_ChiTiet', {
								TuNgay: month.firstDay, DenNgay: month.lastDay, LopHocID: lopHocID,
								LoaiViPham: type.LoaiViPham
							}, { cache: false }).catch(() => []).then(rows => ({ type, rows: rows || [] }))))
					}))).flat()
					students.forEach(student => {
						const key = this.getAttendanceStudentKey(student)
						const current = summaries[key] || { key, hoTen: student.HoTen || '', months: [], violations: [] }
						const absentRows = (details.find(item => Number(item.type.LoaiViPham) === 2)?.rows || [])
							.filter(row => this.sameStudent(row.HocSinhID, student.HocSinhID))
						const absentDates = [...new Set(absentRows.map(row => String(row.Ngay || '').slice(0, 10)).filter(Boolean))]
						const violations = details.filter(item => Number(item.type.LoaiViPham) !== 2).map(item => ({
							name: this.getViolationName(item.type.TenViPham),
							count: item.rows.filter(row => this.sameStudent(row.HocSinhID, student.HocSinhID)).length
						})).filter(item => item.count > 0)
						current.months.push({ label: month.label, absentDays: absentDates.length, absentDates, violations })
						violations.forEach(item => {
							const old = current.violations.find(x => x.name === item.name)
							if (old) old.count += item.count
							else current.violations.push({ ...item })
						})
						summaries[key] = current
					})
				}
				Object.values(summaries).forEach(item => {
					const hk1Months = item.months.filter(month => ['Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].includes(month.label))
					const hk2Months = item.months.filter(month => ['Tháng 1-2', 'Tháng 3', 'Tháng 4', 'Tháng 5'].includes(month.label))
					item.semesterTotals = {
						hk1: hk1Months.reduce((total, month) => total + month.absentDays, 0),
						hk2: hk2Months.reduce((total, month) => total + month.absentDays, 0)
					}
					const warningSemesters = Object.entries(item.semesterTotals).filter(([, total]) => total >= 3)
					item.warningLevel = warningSemesters.length ? 'warning' : ''
					item.warningText = warningSemesters.length
						? `${warningSemesters.map(([semester, total]) => `${semester === 'hk1' ? 'HKI' : 'HKII'} nghỉ ${total} ngày`).join('; ')}; cần GVCN nắm bắt.`
						: ''
				})
				this.attendanceSummaries = summaries
				this.attendanceCache = { ...this.attendanceCache, [cacheKey]: summaries }
			} finally {
				this.attendanceLoading = false
			}
		},
		async getSelectedLopHocID() {
			const khoiID = Number(this.selectedClass?.KhoiID)
			if (!khoiID) return null
			const khois = await ajaxCALLPromise('quansinh/Basic_KhoiSelectByNamHocID', { NamHocID: this.currentNienKhoa, DonViID: 1 }).catch(() => [])
			const khoi = (khois || []).find(item => String(item.TenKhoi).trim() === 'Khối ' + khoiID)
			if (!khoi) return null
			const classes = await ajaxCALLPromise('quansinh/Basic_LopHocSelectByKhoiNamHocID', { NamHocID: this.currentNienKhoa, KhoiID: khoi.KhoiID }).catch(() => [])
			const selectedName = String((this.selectedClass?.TenLopThanhVien || [this.selectedClass?.TenLop])[0] || '').trim()
			return (classes || []).find(item => String(item.TenLop || '').trim() === selectedName)?.LopHocID || null
		},
		async getSelectedLopHocIDs() {
			const khoiID = Number(this.selectedClass?.KhoiID)
			if (!khoiID) return []
			const khois = await ajaxCALLPromise('quansinh/Basic_KhoiSelectByNamHocID', { NamHocID: this.currentNienKhoa, DonViID: 1 }).catch(() => [])
			const khoi = (khois || []).find(item => String(item.TenKhoi).trim() === 'Khối ' + khoiID)
			if (!khoi) return []
			const classes = await ajaxCALLPromise('quansinh/Basic_LopHocSelectByKhoiNamHocID', { NamHocID: this.currentNienKhoa, KhoiID: khoi.KhoiID }).catch(() => [])
			const selectedNames = this.selectedClass?.TenLopThanhVien || [this.selectedClass?.TenLop]
			return selectedNames.map(name => (classes || []).find(item =>
				String(item.TenLop || '').trim() === String(name || '').trim()
			)?.LopHocID).filter(Boolean)
		},
		getMonthlyAttendanceRanges() {
			const year = Number(this.currentNienKhoa)
			return [[8, 'Tháng 8', year + 1], [9, 'Tháng 9', year], [10, 'Tháng 10', year], [11, 'Tháng 11', year], [12, 'Tháng 12', year], [1, 'Tháng 1-2', year + 1], [3, 'Tháng 3', year + 1], [4, 'Tháng 4', year + 1], [5, 'Tháng 5', year + 1]].map(([month, label, calendarYear]) => ({
				label, firstDay: this.formatDate(calendarYear, month, 1),
				lastDay: this.formatDate(calendarYear, month === 1 ? 3 : month, month === 1 ? 0 : this.daysInMonth(calendarYear, month))
			}))
		},
		formatDate(year, month, day) {
			const date = new Date(year, month - 1, day || 0)
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
		},
		daysInMonth(year, month) { return new Date(year, month, 0).getDate() },
		getAttendanceStudentKey(student) { return String(student.HSLopID || `hs:${student.HocSinhID}`) },
		sameStudent(left, right) { return String(left) === String(right) },
		getViolationName(name) { return String(name || '').split('/')[0].trim() },
		getAttendanceDisplay(student) {
			const item = this.attendanceSummaries[this.getAttendanceStudentKey(student)]
			if (!item) return ''
			const semesterTotals = item.semesterTotals || { hk1: 0, hk2: 0 }
			const lines = [`HKI: ${semesterTotals.hk1} ngày nghỉ`, `HKII: ${semesterTotals.hk2} ngày nghỉ`]
			lines.push(...item.months.filter(month => month.absentDays || month.violations.length).map(month => `${month.label}: ${month.absentDays ? `${month.absentDays} ngày nghỉ` : 'không nghỉ'}${month.violations.length ? `; ${month.violations.map(x => `${x.name} ${x.count}`).join(', ')}` : ''}`))
			return lines.join('\n')
		},
		applySoLienLacColumns() {
			this.soLienLacColumns = [
				{ title: 'STT', width: 60, readOnly: true },
				{ title: 'MÃ HỌC SINH', width: 110, readOnly: true },
				{ title: 'SỐ DANH BỘ', width: 110, readOnly: true },
				{ title: 'HỌ VÀ TÊN HỌC SINH', width: 220, readOnly: true },
				...(this.selectedSoLienLacPeriod?.fields || []).map(field => ({ title: field.title, width: 260 }))
			]
		},
		toSoLienLacRows(rows) {
			const period = this.selectedSoLienLacPeriod
			const uniqueRows = []
			const seenKeys = new Set()
			;(rows || []).forEach(x => {
				const key = x.HSLopID ? ('hsl:' + x.HSLopID) : ('hs:' + (x.HocSinhID || '') + '_' + (x.LopID || ''))
				if (!seenKeys.has(key)) {
					seenKeys.add(key)
					uniqueRows.push(x)
				}
			})
			return uniqueRows.map((x, index) => [
				index + 1,
				x.MaHocSinh || x.HocSinhID || '',
				x.SoDanhBo || '',
				x.HoTen || '',
					...(period?.fields || []).map(field => {
						const item = (period.items || []).find(row => Number(row.HSLopID) === Number(x.HSLopID) &&
							(!row.__LopID || !x.LopID || String(row.__LopID) === String(x.LopID)))
						return item?.[field.key] || ''
					})
				])
		},
		getSavedMonthlyValue(rows, hsLopID, thang, key) {
			const item = (rows || []).find(row => Number(row.HSLopID) === Number(hsLopID) && Number(row.Thang) === Number(thang))
			return item ? (item[key] || '') : ''
		},
		getMonthlySheetMonths() {
			return [
				{ thang: 8, index: 6 },
				{ thang: 9, index: 7 },
				{ thang: 10, index: 8 },
				{ thang: 11, index: 9 },
				{ thang: 12, index: 10 },
				{ thang: 1, index: 14 },
				{ thang: 3, index: 15 },
				{ thang: 4, index: 16 },
				{ thang: 5, index: 17 }
			]
		},
		getSoLienLacMonths() {
			return [
				{ thang: 8, index: 4 },
				{ thang: 9, index: 5 },
				{ thang: 10, index: 6 },
				{ thang: 11, index: 7 },
				{ thang: 12, index: 8 },
				{ thang: 1, index: 10 },
				{ thang: 3, index: 11 },
				{ thang: 4, index: 12 },
				{ thang: 5, index: 13 }
			]
		},
		updateChiTieuCardRows(card, rows) {
			const columns = (card.columns || []).map(x => x.name)
			card.rows = (rows || []).map(row => {
				if (Array.isArray(row)) return row
				return columns.map(key => row && key ? (row[key] ?? '') : '')
			})
			if (card.key === 'ban-dai-dien-cmhs') this.enrichBanDaiDienCMHSRows()
			if (card.key === 'can-bo-lop') this.enrichCanBoLopRows()
			if (['chi-tieu-giao-duc', 'danh-hieu', 'hoat-dong-phong-trao'].includes(card.key)) this.form.ChiTieu = this.serializeChiTieuRows()
			if (card.key === 'theo-doi-si-so') this.form.SiSo = JSON.stringify({ version: 1, rows: this.serializeSiSoRows() })
			if (card.key === 'giao-vien-bo-mon') this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: this.serializeGiaoVienBoMonRows() })
			if (card.key === 'ban-dai-dien-cmhs') this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: this.serializeBanDaiDienCMHSRows() })
			if (card.key === 'can-bo-lop') this.form.CanBoLop = JSON.stringify({ version: 1, rows: this.serializeCanBoLopRows() })
		},
		handleChiTieuCardChange(card, event) {
			this.markTabDirty('chi-tieu')
			console.log('[Tab2 handleChiTieuCardChange]', card.key, event)
			if (!card || !event) return
			const colIndex = Number(event.x)
			console.log('[Tab2 colIndex]', colIndex, 'event.value:', event.value)
			if (colIndex !== 2) return

			const student = this.findSelectedStudent(event.value)
			console.log('[Tab2 found student]', student)
			if (!student) return
			if (card.key === 'ban-dai-dien-cmhs') this.fillBanDaiDienFamilyInfo(event, student)
			if (card.key === 'can-bo-lop') this.fillCanBoLopStudentID(event, student)
		},
		setSheetValue(event, x, y, value) {
			console.log('[Tab2 setSheetValue]', { x, y, value })
			try {
				if (!event) return
				const ws = event.worksheet || event.instance
				if (ws) {
					if (typeof ws.setValueFromCoords === 'function') {
						ws.setValueFromCoords(x, y, value, true)
					} else if (typeof ws.setValue === 'function') {
						ws.setValue(jspreadsheet.getColumnNameFromId([x, y]), value)
					}
				}
			} catch (error) {
				console.error('[Tab2 setSheetValue Error]', error)
			}
		},
		getStudentCode(student) {
			if (!student) return ''
			return student.MaHocSinh || student.HocSinhID || ''
		},
		fillCanBoLopStudentID(event, selectedStudent) {
			const student = selectedStudent || this.findSelectedStudent(event.value)
			if (!student) return
			const rowIndex = Number(event.y)
			const studentCode = this.getStudentCode(student)
			console.log('[Tab2 fillCanBoLopStudentID]', rowIndex, studentCode)
			this.setSheetValue(event, 1, rowIndex, studentCode)
			const card = this.getChiTieuCard('can-bo-lop')
			if (card && card.rows && card.rows[rowIndex]) {
				card.rows[rowIndex][1] = studentCode
				card.rows[rowIndex][2] = student.HoTen || card.rows[rowIndex][2]
			}
			this.form.CanBoLop = JSON.stringify({ version: 1, rows: this.serializeCanBoLopRows() })
		},
		getChiTieuCard(key) {
			return (this.chiTieuCards || []).find(card => card.key === key) || {}
		},
		applyStudentDropdownOptions() {
			const source = this.getSelectedClassStudents().map(student => student.HoTen).filter(Boolean)
			;['ban-dai-dien-cmhs', 'can-bo-lop'].forEach(key => {
				const card = this.getChiTieuCard(key)
				const column = (card.columns || []).find(col => col.name === 'HocSinh')
				if (column) column.source = source
			})
		},
		applyTeacherDropdownOptions() {
			const source = (this.allTeachers || []).map(t => t.text).filter(Boolean)
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			const column = (card.columns || []).find(col => col.name === 'GiaoVien')
			if (column) column.source = source
		},
		async getTeachersList() {
			try {
				const res = await ajaxCALLPromise('lms/GiaoVien_Get')
				if (Array.isArray(res)) {
					this.allTeachers = res.map(t => {
						const name = t.HoTenGV || ((t.HoGV || '') + ' ' + (t.TenGV || '')).trim()
						const phone = t.DienThoai || t.SoDienThoai || t.SDT || ''
						return {
							id: t.GiaoVienID,
							name: name,
							phone: phone,
							text: phone ? `${name} - ${phone}` : name
						}
					})
					this.applyTeacherDropdownOptions()
				}
			} catch (error) {
				console.error('getTeachersList error', error)
			}
		},
		getSelectedClassStudents() {
			if (this.selectedLopID === '__ALL__') return []
			const ids = new Set(this.getSelectedClassIDs())
			return (this.allStudentRows || []).filter(x => ids.has(String(x.LopID)))
		},
		getSheetStudents() {
			return this.serializationStudents || this.getSelectedClassStudents()
		},
		filterRowsForSaving(rows) {
			if (!this.savingClassContext) return rows
			const studentIDs = new Set((this.allStudentRows || [])
				.filter(row => String(row.LopID) === String(this.savingClassContext.LopID))
				.map(row => String(row.HSLopID || ''))
				.filter(Boolean))
			return (rows || []).filter(row => !row.HSLopID || studentIDs.has(String(row.HSLopID)))
		},
		findSelectedStudent(value) {
			const text = this.cleanSheetValue(value)
			if (!text) return null
			const students = this.getSheetStudents()
			console.log('[Tab2 findSelectedStudent]', text, 'Students count:', students.length)

			// Tìm theo Họ và tên, HocSinhID hoặc MaHocSinh
			const found = students.find(student =>
				this.cleanSheetValue(student.HoTen) === text
				|| `${student.HocSinhID || ''}` === text
				|| `${student.MaHocSinh || ''}` === text
			)
			if (found) return found

			return null
		},
		fillBanDaiDienFamilyInfo(event, selectedStudent) {
			const student = selectedStudent || this.findSelectedStudent(event.value)
			if (!student) return
			const rowIndex = Number(event.y)
			const family = this.getStudentFamilyCells(student)
			const studentCode = this.getStudentCode(student)
			console.log('[Tab2 fillBanDaiDienFamilyInfo]', rowIndex, studentCode, family)
			const updates = [
				{ x: 1, value: studentCode },
				{ x: 3, value: family.ChaMe },
				{ x: 4, value: family.NgheNghiep },
				{ x: 5, value: family.DienThoai }
			]
			updates.forEach(item => {
				this.setSheetValue(event, item.x, rowIndex, item.value)
			})
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (card && card.rows && card.rows[rowIndex]) {
				card.rows[rowIndex][1] = studentCode
				card.rows[rowIndex][2] = student.HoTen || card.rows[rowIndex][2]
				card.rows[rowIndex][3] = family.ChaMe
				card.rows[rowIndex][4] = family.NgheNghiep
				card.rows[rowIndex][5] = family.DienThoai
			}
			this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: this.serializeBanDaiDienCMHSRows() })
		},
		getStudentFamilyCells(student) {
			const parents = [
				student.Cha ? 'Cha: ' + student.Cha : '',
				student.Me ? 'Mẹ: ' + student.Me : ''
			].filter(Boolean).join('\n')
			const jobs = [
				student.NgheNghiepCha ? 'Cha: ' + student.NgheNghiepCha : '',
				student.NgheNghiepMe ? 'Mẹ: ' + student.NgheNghiepMe : ''
			].filter(Boolean).join('\n')
			const phones = [
				student.SDTCha ? 'Cha: ' + student.SDTCha : '',
				student.SDTMe ? 'Mẹ: ' + student.SDTMe : ''
			].filter(Boolean).join('\n')
			return { ChaMe: parents, NgheNghiep: jobs, DienThoai: phones }
		},
		enrichBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (!card.rows) return
			card.rows = card.rows.map(row => {
				const student = this.findSelectedStudent(row[2])
				if (!student) return row
				const family = this.getStudentFamilyCells(student)
				const code = this.getStudentCode(student)
				return [
					row[0],
					code || row[1],
					row[2],
					row[3] || family.ChaMe,
					row[4] || family.NgheNghiep,
					row[5] || family.DienThoai,
					row[6]
				]
			})
		},
		enrichCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			if (!card.rows) return
			card.rows = card.rows.map(row => {
				const student = this.findSelectedStudent(row[2])
				if (!student) return row
				const code = this.getStudentCode(student)
				return [
					row[0],
					code || row[1],
					row[2],
					row[3],
					row[4]
				]
			})
		},
		applySiSoRows() {
			const card = this.getChiTieuCard('theo-doi-si-so')
			if (!card.rows) return
			const savedRows = this.siSoSavedRows && this.siSoSavedRows.length
				? this.siSoSavedRows
				: this.parseSiSoSavedRows(this.form.SiSo)
			const defaultRows = [
				['Đầu năm', '', '', '', ''],
				['Cuối kì 1', '', '', '', ''],
				['Cuối kì 2', '', '', '', '']
			]
			card.rows = defaultRows.map(row => {
				const saved = savedRows.find(x => this.cleanSheetValue(x.Moc) === row[0]) || {}
				return [
					row[0],
					saved.SiSo || '',
					saved.Nam || '',
					saved.ChuyenDi || '',
					saved.ChuyenDen || ''
				]
			})
		},
		parseSiSoSavedRows(value) {
			if (!value) return []
			try {
				const parsed = this.safeParseJson(value)
				if (Array.isArray(parsed)) return parsed
				if (parsed && Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		serializeChiTieuRows() {
			const rows = this.serializeChiTieuStructuredRows()
			return JSON.stringify({
				giaoDuc: rows.filter(row => row.LoaiChiTieu === 'GIAO_DUC'),
				danhHieu: rows.filter(row => row.LoaiChiTieu === 'DANH_HIEU'),
				phongTrao: rows.filter(row => row.LoaiChiTieu === 'PHONG_TRAO')
			})
		},
		serializeChiTieuStructuredRows() {
			const giaoDucCard = this.getChiTieuCard('chi-tieu-giao-duc')
			const danhHieuCard = this.getChiTieuCard('danh-hieu')
			const phongTraoCard = this.getChiTieuCard('hoat-dong-phong-trao')
			
			const giaoDucRows = (giaoDucCard.rows || []).map((row, index) => ({
				LoaiChiTieu: 'GIAO_DUC',
				MatGiaoDuc: this.cleanSheetCell(row, 0, 'MatGiaoDuc'),
				YeuCau: this.cleanSheetCell(row, 1, 'YeuCau'),
				Tot: this.cleanSheetNumber(this.cleanSheetCell(row, 2, 'Tot')),
				Kha: this.cleanSheetNumber(this.cleanSheetCell(row, 3, 'Kha')),
				Dat: this.cleanSheetNumber(this.cleanSheetCell(row, 4, 'Dat')),
				ChuaDat: this.cleanSheetNumber(this.cleanSheetCell(row, 5, 'ChuaDat')),
				BienPhap: this.cleanSheetCell(row, 6, 'BienPhap'),
				RowIndex: index + 1
			})).filter(row => row.MatGiaoDuc || row.YeuCau || row.Tot !== 0 || row.Kha !== 0 || row.Dat !== 0 || row.ChuaDat !== 0 || row.BienPhap)

			const danhHieuSourceRows = (danhHieuCard.rows && danhHieuCard.rows.length)
				? danhHieuCard.rows
				: [['', '', '', '']]
			const danhHieuRows = danhHieuSourceRows.map((row, index) => ({
				LoaiChiTieu: 'DANH_HIEU',
				YeuCau: this.cleanSheetCell(row, 0, 'YeuCau'),
				HSXS: this.cleanSheetNumber(this.cleanSheetCell(row, 1, 'HSXS')),
				HSG: this.cleanSheetNumber(this.cleanSheetCell(row, 2, 'HSG')),
				GhiChu: this.cleanSheetCell(row, 3, 'GhiChu'),
				RowIndex: index + 1
			}))

			const phongTraoRows = (phongTraoCard.rows || []).map((row, index) => {
				const yeuCau = this.cleanSheetCell(row, 0, 'YeuCau')
				const noiDung = this.cleanSheetCell(row, 1, 'NoiDung')
				const ghiChu = this.cleanSheetCell(row, 2, 'GhiChu')
				return {
					LoaiChiTieu: 'PHONG_TRAO',
					YeuCau: yeuCau,
					NoiDung: yeuCau || noiDung || ghiChu ? noiDung : ' ',
					GhiChu: ghiChu,
					RowIndex: index + 1
				}
			})

			return giaoDucRows.concat(danhHieuRows, phongTraoRows)
		},
		applyChiTieuRows() {
			const giaoDucCard = this.getChiTieuCard('chi-tieu-giao-duc')
			const danhHieuCard = this.getChiTieuCard('danh-hieu')
			const phongTraoCard = this.getChiTieuCard('hoat-dong-phong-trao')

			let parsed = {}
			if (this.chiTieuSavedRows && this.chiTieuSavedRows.length) {
				parsed = {
					giaoDuc: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'GIAO_DUC'),
					danhHieu: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'DANH_HIEU'),
					phongTrao: this.chiTieuSavedRows.filter(row => row.LoaiChiTieu === 'PHONG_TRAO')
				}
			} else if (this.form.ChiTieu) {
				try {
					parsed = this.safeParseJson(this.form.ChiTieu, {})
				} catch (e) {
					parsed = { text: this.form.ChiTieu }
				}
			}

			const defaultGiaoDuc = [
				['Kết quả rèn luyện', '', 0, 0, 0, 0, ''],
				['Kết quả học tập', '', 0, 0, 0, 0, '']
			]
			if (Array.isArray(parsed.giaoDuc)) {
				giaoDucCard.rows = defaultGiaoDuc.map(row => {
					const saved = parsed.giaoDuc.find(x => this.cleanSheetValue(x.MatGiaoDuc) === row[0]) || {}
					return [
						row[0],
						saved.YeuCau || '',
						this.cleanSheetNumber(saved.Tot),
						this.cleanSheetNumber(saved.Kha),
						this.cleanSheetNumber(saved.Dat),
						this.cleanSheetNumber(saved.ChuaDat),
						saved.BienPhap || ''
					]
				})
			} else {
				giaoDucCard.rows = defaultGiaoDuc
			}

			if (Array.isArray(parsed.danhHieu) && parsed.danhHieu.length) {
				danhHieuCard.rows = parsed.danhHieu.map(row => [
					row.YeuCau || '',
					row.HSXS || '',
					row.HSG || '',
					row.GhiChu || ''
				])
			} else {
				danhHieuCard.rows = [['', '', '', '']]
			}

			if (Array.isArray(parsed.phongTrao) && parsed.phongTrao.length) {
				let rows = parsed.phongTrao.map(row => [
					row.YeuCau || '',
					row.NoiDung || '',
					row.GhiChu || ''
				])
				while (rows.length < 10) {
					rows.push(['', '', ''])
				}
				phongTraoCard.rows = rows
			} else {
				phongTraoCard.rows = Array.from({ length: 10 }, () => ['', '', ''])
			}
		},
		parseChiTieuSavedRows(value) {
			if (!value) return []
			try {
				const parsed = this.safeParseJson(value)
				if (Array.isArray(parsed)) return parsed
				if (parsed && Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		serializeSiSoRows() {
			const card = this.getChiTieuCard('theo-doi-si-so')
			return (card.rows || []).map(row => ({
				Moc: this.cleanSheetCell(row, 0, 'Moc'),
				SiSo: this.cleanSheetCell(row, 1, 'SiSo'),
				Nam: this.cleanSheetCell(row, 2, 'Nam'),
				ChuyenDi: this.cleanSheetCell(row, 3, 'ChuyenDi'),
				ChuyenDen: this.cleanSheetCell(row, 4, 'ChuyenDen')
			})).filter(row => row.Moc || row.SiSo || row.Nam || row.ChuyenDi || row.ChuyenDen)
		},
		cleanSheetCell(row, index, key) {
			if (Array.isArray(row)) return this.cleanSheetValue(row[index])
			if (!row || typeof row !== 'object') return ''
			return this.cleanSheetValue(row[key] ?? row[index])
		},
		applyGiaoVienBoMonRows() {
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			if (!card.rows) return
			const savedRows = this.giaoVienBoMonSavedRows && this.giaoVienBoMonSavedRows.length
				? this.giaoVienBoMonSavedRows
				: this.parseGiaoVienBoMonSavedRows(this.form.GiaoVienBoMon)
			let rows = savedRows.length
				? savedRows.map(row => [
					row.BoMon || '',
					this.formatGiaoVienBoMonHocKy(row.HocKy),
					row.GiaoVien || '',
					row.ThayDoi || ''
				])
				: []
			while (rows.length < 50) {
				rows.push(['', '', '', ''])
			}
			card.rows = rows
			this.applyTeacherDropdownOptions()
		},
		async getGiaoVienBoMon() {
			if (!this.selectedClass?.LopID) return
			const savedRows = this.giaoVienBoMonSavedRows && this.giaoVienBoMonSavedRows.length
				? this.giaoVienBoMonSavedRows
				: this.parseGiaoVienBoMonSavedRows(this.form.GiaoVienBoMon)
			const apiRows = await this.fetchGiaoVienBoMonRows()
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			if (!card.rows) return
			if (!apiRows.length) {
				this.applyGiaoVienBoMonRows()
				return
			}
			let rows = apiRows.map(row => {
				const saved = savedRows.find(item =>
					this.cleanSheetValue(item.BoMon) === row.BoMon
					&& this.cleanSheetValue(item.HocKy) === row.HocKy
					&& this.cleanSheetValue(item.GiaoVien) === row.GiaoVien
				) || {}
				return [row.BoMon, this.formatGiaoVienBoMonHocKy(row.HocKy), row.GiaoVien, saved.ThayDoi || '']
			})
			while (rows.length < 50) {
				rows.push(['', '', '', ''])
			}
			card.rows = rows
			this.applyTeacherDropdownOptions()
			this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: this.serializeGiaoVienBoMonRows() })
		},
		formatGiaoVienBoMonHocKy(value) {
			if (value === '' || value === null || value === undefined) return ''
			const hocKy = Number(String(value).replace(/[^0-9]/g, ''))
			return hocKy === 2 ? 'Học kì 2' : 'Học kì 1'
		},
		async fetchGiaoVienBoMonRows() {
			const classIDs = this.getSelectedClassIDs()
			const chunks = await Promise.all(classIDs.flatMap(lopID => [1, 2].map(hocKy => ajaxCALLPromise('lms/GiaoVienLop_Get_ByLopID', {
				LopID: lopID,
				NienKhoa: Number(this.currentNienKhoa || this.filter.NienKhoa || new Date().getFullYear()),
				HocKi: hocKy
			}).then(rows => (rows || []).map(row => ({ ...row, HocKy: hocKy }))).catch(() => []))))
			const map = new Map()
			chunks.flat().forEach(row => {
				if (Number(row.VaiTro || 0) === 1) return
				const item = {
					BoMon: row.MonHocName || '',
					HocKy: row.HocKy || row.HocKi || '',
					GiaoVien: row.HoTenGV || '',
					ThayDoi: ''
				}
				const key = [item.BoMon, item.HocKy, item.GiaoVien].join('|')
				if (item.BoMon || item.GiaoVien) map.set(key, item)
			})
			return [...map.values()].sort((a, b) => {
				if (`${a.HocKy}` !== `${b.HocKy}`) return `${a.HocKy}`.localeCompare(`${b.HocKy}`)
				return `${a.BoMon}`.localeCompare(`${b.BoMon}`)
			})
		},
		parseGiaoVienBoMonSavedRows(value) {
			if (!value) return []
			try {
				const parsed = this.safeParseJson(value)
				if (Array.isArray(parsed)) return parsed
				if (parsed && Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return String(value).split(/\r?\n/).filter(Boolean).map(line => ({
					BoMon: '',
					HocKy: '',
					GiaoVien: line.trim(),
					ThayDoi: ''
				}))
			}
			return []
		},
		serializeGiaoVienBoMonRows() {
			const card = this.getChiTieuCard('giao-vien-bo-mon')
			let validRowCounter = 0
			return (card.rows || []).map((row, index) => {
				const giaoVien = this.cleanSheetCell(row, 2, 'GiaoVien')
				const teacher = (this.allTeachers || []).find(item => item.text === giaoVien || item.name === giaoVien) || {}
				const hocKyValue = this.cleanSheetCell(row, 1, 'HocKy')
				const boMon = this.cleanSheetCell(row, 0, 'BoMon')
				const thayDoi = this.cleanSheetCell(row, 3, 'ThayDoi')
				const isValid = !!(boMon || hocKyValue || giaoVien || thayDoi)
				if (isValid) {
					validRowCounter++
				}
				return {
					BoMon: boMon,
					HocKy: String(hocKyValue).includes('2') ? 2 : (hocKyValue ? 1 : null),
					GiaoVienID: teacher.id || '',
					GiaoVien: giaoVien,
					ThayDoi: thayDoi,
					RowIndex: isValid ? validRowCounter : index + 1,
					_isValid: isValid
				}
			}).filter(row => {
				const isValid = row._isValid
				delete row._isValid
				return isValid
			})
		},
		applyBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			if (!card.rows) return
			const savedRows = this.banDaiDienCMHSSavedRows && this.banDaiDienCMHSSavedRows.length
				? this.banDaiDienCMHSSavedRows
				: this.parseSheetSavedRows(this.form.BanDaiDienCMHS)
			const len = Math.max(5, savedRows.length)
			card.rows = Array.from({ length: len }, (_, index) => {
				const saved = savedRows[index] || {}
				const student = this.findSelectedStudent(saved.HocSinh) || {}
				const studentCode = saved.HocSinhID || saved.MaHocSinh || this.getStudentCode(student) || ''
				return [
					saved.STT || index + 1,
					studentCode,
					saved.HocSinh || '',
					saved.ChaMe || '',
					saved.NgheNghiep || '',
					saved.DienThoai || '',
					saved.NhiemVu || '',
					...(this.isCap1 ? [saved.GhiChu || ''] : [])
				]
			})
		},
		serializeBanDaiDienCMHSRows() {
			const card = this.getChiTieuCard('ban-dai-dien-cmhs')
			let validCounter = 0
			return this.filterRowsForSaving((card.rows || []).map((row, index) => {
				const student = this.findSelectedStudent(this.cleanSheetCell(row, 2, 'HocSinh')) || {}
				const hocSinh = this.cleanSheetCell(row, 2, 'HocSinh')
				const chaMe = this.cleanSheetCell(row, 3, 'ChaMe')
				const ngheNghiep = this.cleanSheetCell(row, 4, 'NgheNghiep')
				const dienThoai = this.cleanSheetCell(row, 5, 'DienThoai')
				const nhiemVu = this.cleanSheetCell(row, 6, 'NhiemVu')
				const ghiChu = this.cleanSheetCell(row, 7, 'GhiChu')
				const isValid = !!(hocSinh || chaMe || ngheNghiep || dienThoai || nhiemVu || ghiChu)
				if (isValid) validCounter++
				return {
					STT: this.cleanSheetCell(row, 0, 'STT') || index + 1,
					HSLopID: student.HSLopID || null,
					HocSinhID: student.HocSinhID || null,
					MaHocSinh: this.cleanSheetCell(row, 1, 'HocSinhID') || student.MaHocSinh || student.HocSinhID || '',
					HocSinh: hocSinh,
					ChaMe: chaMe,
					NgheNghiep: ngheNghiep,
					DienThoai: dienThoai,
					NhiemVu: nhiemVu,
					GhiChu: ghiChu,
					RowIndex: isValid ? validCounter : index + 1,
					_isValid: isValid
				}
			}).filter(row => {
				const valid = row._isValid
				delete row._isValid
				return valid
			}))
		},
		applyCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			if (!card.rows) return
			const savedRows = this.canBoLopSavedRows && this.canBoLopSavedRows.length
				? this.canBoLopSavedRows
				: this.parseSheetSavedRows(this.form.CanBoLop)
			const len = Math.max(20, savedRows.length)
			card.rows = Array.from({ length: len }, (_, index) => {
				const saved = savedRows[index] || {}
				const student = this.findSelectedStudent(saved.HocSinh) || {}
				const studentCode = saved.HocSinhID || saved.MaHocSinh || this.getStudentCode(student) || ''
				return [
					saved.STT || index + 1,
					studentCode,
					saved.HocSinh || '',
					saved.ChucVu || '',
					saved.GhiChu || ''
				]
			})
		},
		serializeCanBoLopRows() {
			const card = this.getChiTieuCard('can-bo-lop')
			let validCounter = 0
			return this.filterRowsForSaving((card.rows || []).map((row, index) => {
				const student = this.findSelectedStudent(this.cleanSheetCell(row, 2, 'HocSinh')) || {}
				const hocSinh = this.cleanSheetCell(row, 2, 'HocSinh')
				const chucVu = this.cleanSheetCell(row, 3, 'ChucVu')
				const ghiChu = this.cleanSheetCell(row, 4, 'GhiChu')
				const isValid = !!(hocSinh || chucVu || ghiChu)
				if (isValid) validCounter++
				return {
					STT: this.cleanSheetCell(row, 0, 'STT') || index + 1,
					HSLopID: student.HSLopID || null,
					HocSinhID: student.HocSinhID || null,
					MaHocSinh: this.cleanSheetCell(row, 1, 'HocSinhID') || student.MaHocSinh || '',
					HocSinh: hocSinh,
					ChucVu: chucVu,
					GhiChu: ghiChu,
					RowIndex: isValid ? validCounter : index + 1,
					_isValid: isValid
				}
			}).filter(row => {
				const valid = row._isValid
				delete row._isValid
				return valid
			}))
		},
		parseSheetSavedRows(value) {
			if (!value) return []
			try {
				const parsed = this.safeParseJson(value)
				if (Array.isArray(parsed)) return parsed
				if (parsed && Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				return []
			}
			return []
		},
		async onExportAnnualTargets() {
			if (!this.canExportAnnualTargets) return
			this.loading.exportAnnualTargets = true
			try {
				const classItems = (this.classList || []).filter(item => item?.LopID && Number(item.KhoiID) >= 1 && Number(item.KhoiID) <= 5)
				const sheets = await Promise.all(classItems.map(async item => {
					const classIDs = item.LopIDs || [item.LopID]
					const contexts = await Promise.all(classIDs.map(lopID => ajaxCALLPromise('lms/SoGVCNEnsure', {
						NienKhoa: item.NienKhoa || this.filter.NienKhoa,
						LopID: lopID
					}).catch(() => null)))
					const plans = await Promise.all(contexts.filter(context => context?.SoGVCNID).map(context =>
						ajaxCALLPromise('lms/SoGVCNKeHoachNamHocGet', { SoGVCNID: context.SoGVCNID }).catch(() => [])
					))
					const response = plans.find(plan => plan && (Array.isArray(plan) ? plan.length : true))
					const firstResult = Array.isArray(response) ? response[0] : response
					const row = Array.isArray(firstResult) ? (firstResult[0] || {}) : (firstResult || {})
					const json = row.JsonData || row.KeHoachNamHoc || ''
					const plan = json ? (typeof json === 'string' ? this.safeParseJson(json, {}) : json) : {}
					return {
						name: item.TenLop || item.LopID,
						aoa: this.buildAnnualTargetsExportAoA(plan, item.TenLop || item.LopID)
					}
				}))
				if (!sheets.length) {
					this.notify('Không có lớp cấp 1 để xuất dữ liệu.', 'warning')
					return
				}
				this.exportXlsx(sheets, 'ChiTieuPhanDau_TieuHoc_' + this.currentNienKhoa + '.xlsx')
			} finally {
				this.loading.exportAnnualTargets = false
			}
		},
		buildAnnualTargetsExportAoA(plan, className) {
			const planTab = this.$refs.tabKeHoachNamHocRef
			const qualitySubjects = planTab?.qualityCompetencySubjects?.map(subject => planTab.getQualityCompetencyName(subject)) || [
				'Yêu nước', 'Nhân ái', 'Chăm chỉ', 'Trung thực', 'Trách nhiệm',
				'Tự chủ và tự học', 'Giao tiếp và hợp tác', 'Giải quyết vấn đề và sáng tạo',
				'Ngôn ngữ', 'Tính toán', 'Khoa học', 'Công nghệ', 'Tin học', 'Thẩm mĩ', 'Thể chất'
			]
			const academicSubjects = planTab?.academicSubjects?.map(subject => subject.TenMonHoc_HienThi || subject.MonHocName || subject.TenMonHoc || '') || [
				'Tiếng Việt', 'Toán', 'Ngoại ngữ', 'Lịch sử và Địa lí', 'Khoa học',
				'Tin học và Công nghệ (Tin học)', 'Tin học và Công nghệ (Công nghệ)', 'Đạo đức',
				'Giáo dục thể chất', 'Nghệ thuật (Âm nhạc)', 'Nghệ thuật (Mĩ thuật)', 'Hoạt động trải nghiệm'
			]
			const getRows = (key, legacyKey, labels) => {
				const source = plan?.[key] || plan?.[legacyKey] || []
				return (Array.isArray(source) ? source : []).filter(row => labels.includes(row?.[0]) || labels.includes({ 'Tốt (T)': 'Tốt (T) >=', 'Tốt (T) >= 75': 'Tốt (T) >=', 'Hoàn thành tốt (T)': 'Hoàn thành tốt (T) >=', 'Hoàn thành tốt (T) >= 75': 'Hoàn thành tốt (T) >=' }[row?.[0]]))
			}
			const toRows = (rows, subjects) => rows.map(row => [
				({ 'Tốt (T)': 'Tốt (T) >=', 'Tốt (T) >= 75': 'Tốt (T) >=', 'Hoàn thành tốt (T)': 'Hoàn thành tốt (T) >=', 'Hoàn thành tốt (T) >= 75': 'Hoàn thành tốt (T) >=' }[row[0]] || row[0]),
				...subjects.map((subject, index) => row[2 + index * 2] ?? '')
			])
			const qualityRows = getRows('qualityCompetencyTargets', 'pham-chat-nang-luc', ['Tốt (T) >=', 'Cần cố gắng (C)'])
			const academicRows = getRows('academicTargets', 'mon-hoc-hoat-dong', ['Hoàn thành tốt (T) >=', 'Chưa hoàn thành (C)'])
			return [
				['LỚP ' + className + ' - CHỈ TIÊU PHẤN ĐẤU NĂM HỌC ' + this.getCurrentSchoolYearText()],
				[],
				['2.1. PHẨM CHẤT – NĂNG LỰC'],
				['a. CHỈ TIÊU PHẤN ĐẤU'],
				['Xếp loại', ...qualitySubjects.map(subject => subject + ' - Tỉ lệ')],
				...toRows(qualityRows, qualitySubjects),
				[],
				['2.2. MÔN HỌC VÀ HOẠT ĐỘNG GIÁO DỤC'],
				['a. CHỈ TIÊU PHẤN ĐẤU'],
				['Xếp loại', ...academicSubjects.map(subject => subject + ' - Tỉ lệ')],
				...toRows(academicRows, academicSubjects)
			]
		},
		async onExportExcel() {
			this.loading.export = true
			try {
				if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
					if (this.isCap1) {
						this.exportXlsx([
							{
								name: 'THÔNG TIN HS LỚP...',
								aoa: this.buildStudentSheetExportAoA(),
								merges: this.buildStudentSheetExportMerges()
							},
							{
								name: 'TỔ CHỨC LỚP',
								aoa: this.buildToChucLopExportAoA()
							},
							{
								name: 'KH CHỦ NHIỆM NĂM HỌC',
								aoa: this.buildChiTieuExportAoA(),
								merges: this.buildChiTieuExportMerges()
							},
							{
								name: 'CÔNG TÁC CN T8-T5',
								aoa: this.buildCongTacThangExportAoA()
							},
							{
								name: 'HỒ SƠ THEO DÕI HS CẦN QUAN TÂM',
								aoa: this.buildHsCanQuanTamExportAoA()
							},
							{
								name: 'NHẬN XÉT THÁNG HỌC SINH (LMS)',
								aoa: this.buildNhanXetLmsExportAoA()
							},
							{
								name: 'SƠ KẾT HKI',
								aoa: this.buildSoKetHk1ExportAoA()
							},
							{
								name: 'TỔNG KẾT NĂM HỌC',
								aoa: this.buildTongKetNamExportAoA()
							},
							{
								name: 'THEO DÕI SĨ SỐ HS THEO THÁNG',
								aoa: this.buildTheoDoiSiSoExportAoA()
							},
							{
								name: 'THỐNG KÊ ĐỘ TUỔI HS',
								aoa: this.buildThongKeDoTuoiExportAoA()
							},
							{
								name: 'THEO DÕI THÀNH TÍCH HS',
								aoa: this.buildTheoDoiThanhTichExportAoA()
							},
							{
								name: 'THEO DÕI PH ĐI HỌP',
								aoa: this.buildTheoDoiPhHopExportAoA()
							},
							{
								name: 'NỘI DUNG HỌP PHHS',
								aoa: this.buildNoiDungHopPhExportAoA()
							},
							{
								name: 'THEO DÕI BHYT, BHTN CỦA HS',
								aoa: this.buildTheoDoiBhytExportAoA()
							}
						], 'SoGVCN_TieuHoc_' + (this.selectedClass?.TenLop || this.selectedLopID) + '.xlsx')
						return
					}

					this.exportXlsx([
						{
							name: 'Dữ liệu HS lớp',
							aoa: this.buildStudentSheetExportAoA(),
							merges: this.buildStudentSheetExportMerges()
						},
						{
							name: 'XD chỉ tiêu_giải pháp',
							aoa: this.buildChiTieuExportAoA(),
							merges: this.buildChiTieuExportMerges()
						},
						{
							name: 'KH GD tháng_tuần',
							aoa: this.buildKeHoachThangTuanExportAoA(true),
							merges: this.buildKeHoachThangTuanExportMerges(true),
							cols: this.buildKeHoachThangTuanExportCols()
						},
						{
							name: 'Hồ sơ theo dõi QTRL của HS',
							aoa: this.buildRenLuyenExportAoA(),
							merges: this.buildRenLuyenExportMerges(),
							cols: this.buildRenLuyenExportCols()
						},
						{
							name: 'Sổ liên lạc điện tử',
							aoa: this.buildSoLienLacExportAoA(),
							merges: this.buildSoLienLacExportMerges(),
							cols: this.buildSoLienLacExportCols()
						},
						{
							name: 'Hướng nghiệp',
							aoa: this.buildHuongNghiepExportAoA(),
							merges: this.buildHuongNghiepExportMerges(),
							cols: this.buildHuongNghiepExportCols()
						}
					], 'SoGVCN_' + (this.selectedClass?.TenLop || this.selectedLopID) + '.xlsx')
					return
				}
				this.exportXlsx([
					{
						name: 'Dữ liệu HS lớp',
						aoa: this.buildStudentSheetExportAoA(),
						merges: this.buildStudentSheetExportMerges()
					}
				], 'SoGVCN_' + this.currentNienKhoa + '.xlsx')
			} finally {
				this.loading.export = false
			}
		},
		exportXlsx(sheets, fileName) {
			if (!window.XLSX) {
				this.notify('Chưa tải được thư viện xuất Excel')
				return
			}
			const workbook = XLSX.utils.book_new()
			;(sheets || []).forEach(sheet => {
				const worksheet = sheet.aoa
					? XLSX.utils.aoa_to_sheet(sheet.aoa)
					: XLSX.utils.json_to_sheet(sheet.rows || [])
				if (sheet.merges) worksheet['!merges'] = sheet.merges
				if (sheet.cols) worksheet['!cols'] = sheet.cols
				XLSX.utils.book_append_sheet(workbook, worksheet, this.safeSheetName(sheet.name))
			})
			XLSX.writeFile(workbook, this.normalizeFileName(fileName))
		},
		getKeHoachMonthRowCount() {
			return this.getKeHoachTaskLabels().length + 1
		},
		buildKeHoachThangTuanExportAoA(includeGuidelines = false, excludeHeaderRow = false) {
			const rows = []
			if (includeGuidelines) {
				rows.push(
					['', '', 'KHUNG KẾ HOẠCH GIÁO DỤC HỌC SINH THEO THÁNG LỚP ' + (this.selectedClass?.TenLop || '.....') + ' NĂM HỌC ' + this.getCurrentSchoolYearText(), '', '', '', '', '', ''],
					['', '', 'Gợi ý', '', '', '', '', '', ''],
					['', '', '- Căn cứ Khung chủ đề giáo dục của nhà trường để cập nhật tên Chủ đề hàng tháng và Mục tiêu giáo dục chính thông qua chủ đề của tháng đó.', '', '', '', '', '', ''],
					['', '', '- Căn cứ chủ đề - mục tiêu giáo dục đã xác định và các gợi ý nhiệm vụ để lên kế hoạch cho các nội dung giáo dục sẽ triển khai trong 15 phút đầu ngày, sinh hoạt cuối tuần, các sinh hoạt tập trung khác... cho từng tuần trong tháng.', '', '', '', '', '', ''],
					['', '', '+ Video tư liệu liên quan đến giáo dục hành vi trái phép (nếu cần).', '', '', '', '', '', ''],
					['', '', '+ Video tư liệu về các ngày lễ, kỉ niệm', '', '', '', '', '', ''],
					['', '', '+ Phim ngắn liên quan đến chủ đề giáo dục tháng', '', '', '', '', '', ''],
					['', '', '- Cuối tháng, GVCN cập nhật đánh giá ngắn gọn tình hình cả lớp trong tháng đó.', '', '', '', '', '', '']
				)
			}
			if (!excludeHeaderRow) {
				rows.push(['Tháng', 'Mục tiêu giáo dục tháng', 'Gợi ý nhiệm vụ', 'Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Ưu điểm - Hạn chế + giải pháp khắc phục'])
			}

			this.getKeHoachExportMonths().forEach(month => {
				const item = this.findMonthPlan(month.value)
				const chuDeLines = this.parseKeHoachListField(item.ChuDe)
				const mucTieuLines = this.parseKeHoachListField(item.MucTieu)

				rows.push([
					month.label,
					chuDeLines[0] || '',
					mucTieuLines[0] || '',
					this.getKeHoachWeekValue(item, 1, 0),
					this.getKeHoachWeekValue(item, 2, 0),
					this.getKeHoachWeekValue(item, 3, 0),
					this.getKeHoachWeekValue(item, 4, 0),
					this.getKeHoachWeekValue(item, 5, 0),
					item.DanhGia || ''
				])
				this.getKeHoachTaskLabels().forEach((label, idx) => {
					const rIdx = idx + 1
					rows.push([
						'',
						chuDeLines[rIdx] || '',
						mucTieuLines[rIdx] !== undefined ? mucTieuLines[rIdx] : label,
						this.getKeHoachWeekValue(item, 1, rIdx, label),
						this.getKeHoachWeekValue(item, 2, rIdx, label),
						this.getKeHoachWeekValue(item, 3, rIdx, label),
						this.getKeHoachWeekValue(item, 4, rIdx, label),
						this.getKeHoachWeekValue(item, 5, rIdx, label),
						''
					])
				})
			})

			return rows
		},
		buildKeHoachThangTuanExportMerges(includeGuidelines = false) {
			const merges = []
			const offset = includeGuidelines ? 8 : 0
			if (includeGuidelines) {
				merges.push(
					{ s: { r: 0, c: 2 }, e: { r: 0, c: 7 } },
					{ s: { r: 1, c: 2 }, e: { r: 1, c: 7 } },
					{ s: { r: 2, c: 2 }, e: { r: 2, c: 7 } },
					{ s: { r: 3, c: 2 }, e: { r: 3, c: 7 } },
					{ s: { r: 4, c: 2 }, e: { r: 4, c: 7 } },
					{ s: { r: 5, c: 2 }, e: { r: 5, c: 7 } },
					{ s: { r: 6, c: 2 }, e: { r: 6, c: 7 } },
					{ s: { r: 7, c: 2 }, e: { r: 7, c: 7 } }
				)
			}
			const rowCount = this.getKeHoachMonthRowCount()
			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + offset + (index * rowCount)
				merges.push({ s: { r: start, c: 0 }, e: { r: start + rowCount - 1, c: 0 } })
				merges.push({ s: { r: start, c: 8 }, e: { r: start + rowCount - 1, c: 8 } })
			})
			return merges
		},

		buildKeHoachThangTuanExportCols() {
			return [
				{ wch: 8 },
				{ wch: 28 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 26 },
				{ wch: 34 }
			]
		},
		buildKeHoachSheetStyle(includeGuidelines = false) {
			const style = {}
			const black = 'color:#000000;'
			const center = 'text-align:center;vertical-align:middle;'
			const bold = 'font-weight:700;'
			const wrap = 'white-space:normal;'
			const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
			const offset = includeGuidelines ? 8 : 0
			const rowCount = this.getKeHoachMonthRowCount()

			for (let r = 1; r <= (rowCount * this.getKeHoachExportMonths().length) + offset; r++) {
				cols.forEach(col => {
					style[col + r] = wrap
				})
			}
			if (includeGuidelines) {
				for (let r = 1; r <= 8; r++) {
					style['C' + r] = black + wrap
				}
				style.C1 = black + bold + 'text-align:center;'
				style.C2 = bold + black
			}

			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + offset + (index * rowCount)
				for (let r = start; r < start + rowCount; r++) {
					cols.forEach(col => {
						style[col + r] = wrap
					})
					style['B' + r] = black + wrap
					style['C' + r] = black + wrap
				}
				style['A' + start] = center
				style['I' + start] = wrap
			})
			return style
		},
		initKeHoachSheet() {
			this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
			this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
			this.$nextTick(() => {
				setTimeout(() => {
					this.$refs.tabKeHoachRef?.initSheet?.()
				}, 50)
			})
		},
		onKeHoachSheetLoad() {
			this.$nextTick(() => {
				setTimeout(this.applyKeHoachSheetLayout, 100)
			})
		},
		applyKeHoachSheetLayout() {
			const sheet = Array.isArray(this.keHoachSheetInstance) ? this.keHoachSheetInstance[0] : this.keHoachSheetInstance
			if (!sheet) return
			const includeGuidelines = false
			if (includeGuidelines) {
				this.applySheetMerge(sheet, 'C1', 6, 1)
				for (let row = 2; row <= 8; row++) this.applySheetMerge(sheet, 'C' + row, 6, 1)
			}
			const rowCount = this.getKeHoachMonthRowCount()
			this.getKeHoachExportMonths().forEach((month, index) => {
				const start = 1 + (index * rowCount)
				this.applySheetMerge(sheet, 'A' + start, 1, rowCount)
				this.applySheetMerge(sheet, 'I' + start, 1, rowCount)
			})
		},

		applySheetMerge(sheet, cell, colspan, rowspan) {
			const originalAlert = window.alert
			try {
				window.alert = function (msg) {
					if (msg && String(msg).toLowerCase().indexOf('merged') !== -1) {
						console.warn('JExcel merge bypassed:', msg)
						return
					}
					if (typeof originalAlert === 'function') {
						originalAlert(msg)
					}
				}
				if (sheet.setMerge) sheet.setMerge(cell, colspan, rowspan)
				else if (sheet.setMergeCells) sheet.setMergeCells(cell, colspan, rowspan)
			} catch (e) {
				// Merge is cosmetic; keep the sheet usable if the runtime lacks this API.
			} finally {
				window.alert = originalAlert
			}
		},
		buildChiTieuExportAoA() {
			return [
				['XÂY DỰNG CHỈ TIÊU - GIẢI PHÁP GIÁO DỤC LỚP ' + (this.selectedClass?.TenLop || '') + ' NĂM HỌC ' + this.getCurrentSchoolYearText()],
				[''],
				[this.form.ChiTieu || '']
			]
		},
		buildChiTieuExportMerges() {
			return [
				{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }
			]
		},
		buildHuongNghiepExportAoA() {
			return [
				['', 'ĐỊNH HƯỚNG NGHỀ NGHIỆP (Dành cho cấp THPT)', '', 'Hướng dẫn:'],
				['', '', '', '(1): Cập nhật môn HS dự kiến sẽ chọn thi TN cùng 2 môn bắt buộc'],
				['', '', '', '(2): Cập nhật dữ liệu từ phòng tham vấn (nếu có) hoặc qua tìm hiểu của GVCN'],
				this.huongNghiepColumns.map(x => x.title),
				...(this.huongNghiepRows || [])
			]
		},
		buildHuongNghiepExportMerges() {
			return [
				{ s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
				{ s: { r: 0, c: 3 }, e: { r: 0, c: 3 } },
				{ s: { r: 1, c: 3 }, e: { r: 1, c: 3 } },
				{ s: { r: 2, c: 3 }, e: { r: 2, c: 3 } }
			]
		},
		buildHuongNghiepExportCols() {
			return [
				{ wch: 6 },
				{ wch: 28 },
				{ wch: 34 },
				{ wch: 58 }
			]
		},
		buildRenLuyenExportAoA() {
			return [
				['', '', 'THEO DÕI QUÁ TRÌNH RÈN LUYỆN CỦA HỌC SINH LỚP ' + (this.selectedClass?.TenLop || '.......') + ' NĂM HỌC ' + this.getCurrentSchoolYearText()],
				['', '', this.getRenLuyenMonthNote()],
				this.renLuyenColumns.map(x => x.title),
				...(this.renLuyenRows || [])
			]
		},
		buildRenLuyenExportMerges() {
			return [
				{ s: { r: 0, c: 2 }, e: { r: 0, c: 20 } },
				{ s: { r: 1, c: 2 }, e: { r: 1, c: 20 } }
			]
		},
		buildRenLuyenExportCols() {
			return this.renLuyenColumns.map(col => ({ wch: Math.max(8, Math.round((col.width || 100) / 8)) }))
		},
		buildSoLienLacExportAoA() {
			return [
				['', '', 'NHẬN XÉT SỔ LIÊN LẠC HẰNG THÁNG'],
				['', '', this.getSoLienLacGuideline()],
				this.soLienLacColumns.map(x => x.title),
				...(this.soLienLacRows || [])
			]
		},
		buildSoLienLacExportMerges() {
			return [
				{ s: { r: 0, c: 2 }, e: { r: 0, c: 12 } },
				{ s: { r: 1, c: 2 }, e: { r: 1, c: 12 } }
			]
		},
		buildSoLienLacExportCols() {
			return this.soLienLacColumns.map(col => ({ wch: Math.max(8, Math.round((col.width || 100) / 8)) }))
		},
		getSchoolYearText() {
			const endYear = Number(this.currentNienKhoa || new Date().getFullYear())
			return (endYear - 1) + '-' + endYear
		},
		getCurrentSchoolYearText() {
			const startYear = Number(this.currentNienKhoa || new Date().getFullYear())
			return startYear + '-' + (startYear + 1)
		},
		getKeHoachExportMonths() {
			return [
				{ label: '8', value: 8 },
				{ label: '9', value: 9 },
				{ label: '10', value: 10 },
				{ label: '11', value: 11 },
				{ label: '12', value: 12 },
				{ label: '1,2', value: 1 },
				{ label: '3', value: 3 },
				{ label: '4', value: 4 },
				{ label: '5', value: 5 }
			]
		},
		getKeHoachTaskLabels() {
			return ['', '', '', '', '']
		},
		getDefaultKeHoachChuDe(thang) {
			return Number(thang) === 8 ? 'Ổn định lớp, học tập nội quy' : ''
		},
		
		safeParseJson(val, fallback = null) {
			if (!val) return fallback;
			if (typeof val !== 'string') return val;
			let currentVal = val;
			while (typeof currentVal === 'string' && (currentVal.trim().startsWith('[') || currentVal.trim().startsWith('{'))) {
				try {
					const parsed = JSON.parse(currentVal);
					if (typeof parsed === 'string') {
						currentVal = parsed;
					} else {
						return parsed;
					}
				} catch (e) { break; }
			}
			return fallback !== null ? fallback : currentVal;
		},
		parseKeHoachListField(val) {
			if (!val) return []
			if (Array.isArray(val)) return val;
			let currentVal = val
			while (typeof currentVal === 'string' && currentVal.trim().startsWith('[')) {
				try {
					const parsed = JSON.parse(currentVal)
					if (Array.isArray(parsed)) return parsed
					if (typeof parsed === 'string') currentVal = parsed
					else break
				} catch (e) {
					// Invalid JSON, try to clean it manually before splitting
					let cleaned = currentVal;
					cleaned = cleaned.replace(/\\*"+,\\*"+/g, '|~|');
					while (cleaned.match(/^\[+/) || cleaned.match(/^"+/) || cleaned.match(/^\\+"/)) {
						cleaned = cleaned.replace(/^\[+/, '');
						cleaned = cleaned.replace(/^"+/, '');
						cleaned = cleaned.replace(/^\\+"/, '');
					}
					while (cleaned.match(/\]+$/) || cleaned.match(/"+$/) || cleaned.match(/\\+"+$/)) {
						cleaned = cleaned.replace(/\]+$/, '');
						cleaned = cleaned.replace(/"+$/, '');
						cleaned = cleaned.replace(/\\+"+$/, '');
					}
					cleaned = cleaned.replace(/\\+n/g, '\n');
					return cleaned.split('|~|');
				}
			}
			return String(currentVal).split(/\r?\n/)
		},
		parseKeHoachWeekData(keHoachTuan) {
			if (!keHoachTuan) return []
			const normalizeRow = row => {
				if (Array.isArray(row)) {
					return Array.from({ length: 5 }, (_, index) => row[index] == null ? '' : String(row[index]))
				}
				if (row && typeof row === 'object') {
					return [row.Tuan1, row.Tuan2, row.Tuan3, row.Tuan4, row.Tuan5]
						.map(value => value == null ? '' : String(value))
				}
				const text = String(row == null ? '' : row)
				if (text.trim().startsWith('[') || text.trim().startsWith('"')) {
					try {
						const parsed = JSON.parse(text)
						if (parsed !== text) return normalizeRow(parsed)
					} catch (e) {}
				}
				if (text.includes('\t')) {
					return text.split('\t').slice(0, 5).map(value => value || '')
				}
				return null
			}
			let currentVal = keHoachTuan
			for (let depth = 0; depth < 4 && typeof currentVal === 'string'; depth++) {
				const trimmed = currentVal.trim()
				if (!trimmed.startsWith('[') && !trimmed.startsWith('{') && !trimmed.startsWith('"')) break
				try {
					const parsed = JSON.parse(currentVal)
					if (parsed === currentVal) break
					currentVal = parsed
					if (Array.isArray(currentVal)) return currentVal.map(normalizeRow).filter(Boolean)
					if (typeof currentVal !== 'string') break
				} catch (e) {
					let cleaned = currentVal;
					cleaned = cleaned.replace(/\\*"+,\\*"+/g, '|~|');
					while (cleaned.match(/^\[+/) || cleaned.match(/^"+/) || cleaned.match(/^\\+"/)) {
						cleaned = cleaned.replace(/^\[+/, '');
						cleaned = cleaned.replace(/^"+/, '');
						cleaned = cleaned.replace(/^\\+"/, '');
					}
					while (cleaned.match(/\]+$/) || cleaned.match(/"+$/) || cleaned.match(/\\+"+$/)) {
						cleaned = cleaned.replace(/\]+$/, '');
						cleaned = cleaned.replace(/"+$/, '');
						cleaned = cleaned.replace(/\\+"+$/, '');
					}
					cleaned = cleaned.replace(/\\+n/g, '\n');
					currentVal = cleaned.split('|~|');
					break;
				}
			}
			const lines = Array.isArray(currentVal) ? currentVal : String(currentVal).split(/\r?\n/)
			return lines.map(normalizeRow).filter(Boolean)
		},
		getKeHoachWeekValue(item, week, rowIdx = 0, label = '') {
			if (!item) return ''
			const weekData = this.parseKeHoachWeekData(item.KeHoachTuan)
			if (weekData[rowIdx] && weekData[rowIdx][week - 1] !== undefined) {
				return weekData[rowIdx][week - 1] || ''
			}
			const text = item.KeHoachTuan || ''
			const lines = String(text).split(/\r?\n/)
			const prefix = 'Tuần ' + week + ':'
			const line = lines.find(l => l.trim().startsWith(prefix))
			return line ? line.trim().slice(prefix.length).trim() : ''
		},
		findMonthPlan(thang) {
			return (this.monthList || []).find(x => Number(x.Thang) === Number(thang)) || {}
		},
		updateKeHoachSheetRows(rows) {
			this.keHoachSheetRows = rows || []
		},
		buildHuongNghiepRows() {
			const savedRows = this.huongNghiepSavedRows && this.huongNghiepSavedRows.length
				? this.huongNghiepSavedRows
				: this.parseHuongNghiepSavedRows(this.form.HuongNghiep)
			const studentRows = this.selectedLopID === '__ALL__'
				? []
				: this.getSelectedClassStudents()
			const rows = studentRows.map((student, index) => {
				const saved = savedRows.find(row => `${row.HSLopID || ''}` === `${student.HSLopID || ''}`)
					|| savedRows.find(row => `${row.HocSinhID || ''}` === `${student.HocSinhID || ''}`)
					|| savedRows.find(row => this.cleanSheetValue(row.HoTen) === this.cleanSheetValue(student.HoTen))
					|| {}
				return [
					index + 1,
					student.MaHocSinh || student.HocSinhID || saved.MaHocSinh || '',
					student.SoDanhBo || saved.SoDanhBo || '',
					student.HoTen || saved.HoTen || '',
					saved.MonThiTN || '',
					saved.KQTracNghiem || ''
				]
			})
			if (rows.length) return rows
			return Array.from({ length: 30 }, function (_, index) {
				const saved = savedRows[index] || {}
				return [
					index + 1,
					saved.MaHocSinh || '',
					saved.SoDanhBo || '',
					saved.HoTen || '',
					saved.MonThiTN || '',
					saved.KQTracNghiem || ''
				]
			})
		},
		updateHuongNghiepRows(rows) {
			this.markTabDirty('huong-nghiep')
			this.huongNghiepRows = rows || []
			this.form.HuongNghiep = JSON.stringify({ version: 1, rows: this.serializeHuongNghiepRows() })
		},
		parseHuongNghiepSavedRows(value) {
			if (!value) return []
			try {
				const parsed = this.safeParseJson(value)
				if (Array.isArray(parsed)) return parsed
				if (parsed && Array.isArray(parsed.rows)) return parsed.rows
			} catch (error) {
				const lines = String(value).split(/\r?\n/).filter(Boolean)
				return lines.map(line => {
					const parts = line.split(':')
					return {
						HoTen: parts.length > 1 ? parts.shift().trim() : '',
						MonThiTN: '',
						KQTracNghiem: parts.join(':').trim()
					}
				})
			}
			return []
		},
		serializeHuongNghiepRows() {
			const sheetInstance = this.$refs.tabHuongNghiepRef?.getInstance?.()
			const sheet = Array.isArray(sheetInstance) ? sheetInstance[0] : sheetInstance
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.huongNghiepRows || [])
			const sourceStudents = this.getSheetStudents()
			return this.filterRowsForSaving(sourceRows.map((row, index) => {
				const student = sourceStudents[index] || {}
				return {
					STT: this.cleanSheetValue(this.getHuongNghiepCell(row, 0, 'STT')) || index + 1,
					HSLopID: student.HSLopID || '',
					HocSinhID: student.HocSinhID || '',
					MaHocSinh: this.cleanSheetValue(this.getHuongNghiepCell(row, 1, 'MaHocSinh')) || student.MaHocSinh || student.HocSinhID || '',
					SoDanhBo: this.cleanSheetValue(this.getHuongNghiepCell(row, 2, 'SoDanhBo')) || student.SoDanhBo || '',
					HoTen: this.cleanSheetValue(this.getHuongNghiepCell(row, 3, 'HoTen')),
					MonThiTN: this.cleanSheetValue(this.getHuongNghiepCell(row, 4, 'MonThiTN')),
					KQTracNghiem: this.cleanSheetValue(this.getHuongNghiepCell(row, 5, 'KQTracNghiem')),
					RowIndex: index + 1
				}
			}).filter(row => row.HoTen || row.MonThiTN || row.KQTracNghiem))
		},
		getHuongNghiepCell(row, index, key) {
			if (Array.isArray(row)) return row[index]
			if (!row || typeof row !== 'object') return ''
			return row[key] ?? row[index] ?? ''
		},
		parseKeHoachSheetRows() {
			const activeRef = this.tab === 'cong-tac-cn'
				? this.$refs.tabCongTacChuNhiemRef
				: this.$refs.tabKeHoachRef
			if (this.tab === 'cong-tac-cn' && activeRef?.getSaveRows) {
				return activeRef.getSaveRows(this.form.SoGVCNID)
			}
			const tabRefInstance = activeRef?.getInstance ? activeRef.getInstance() : null
			const inst = tabRefInstance || this.keHoachSheetInstance
			const sheet = Array.isArray(inst) ? inst[0] : inst
			const source = sheet && typeof sheet.getData === 'function'
				? sheet.getData()
				: (this.keHoachSheetRows && this.keHoachSheetRows.length
					? this.keHoachSheetRows
					: this.buildKeHoachThangTuanExportAoA(false, true))
			const rowCount = this.getKeHoachMonthRowCount()
			return this.getKeHoachExportMonths().map((month, index) => {
				const start = index * rowCount
				const weekRows = source.slice(start, start + rowCount)
				
				// Gom dữ liệu kế hoạch các tuần 1..5 dạng ma trận lưu JSON
				const weekData = weekRows.map(wRow => [
					this.cleanSheetValue(wRow[3]),
					this.cleanSheetValue(wRow[4]),
					this.cleanSheetValue(wRow[5]),
					this.cleanSheetValue(wRow[6]),
					this.cleanSheetValue(wRow[7])
				])

				const chuDeList = weekRows.map(wRow => this.cleanSheetValue(wRow[1]))
				const mucTieuList = weekRows.map(wRow => this.cleanSheetValue(wRow[2]))
				const danhGiaVal = weekRows.map(wRow => this.cleanSheetValue(wRow[8])).find(v => v) || ''

				return {
					SoGVCNID: this.form.SoGVCNID,
					Thang: month.value,
					ChuDe: JSON.stringify(chuDeList),
					MucTieu: JSON.stringify(mucTieuList),
					NhiemVu: chuDeList.find(x => x) || '',
					KeHoachTuan: JSON.stringify(weekData),
					DanhGia: danhGiaVal
				}
			})
		},
		cleanSheetValue(value) {
			if (value == null) return ''
			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				return String(value).trim()
			}
			if (typeof value === 'object') {
				const keys = ['value', 'v', 'text', 'textContent', 'innerText', 'innerHTML', 'displayValue']
				for (const key of keys) {
					const nested = value[key]
					if (nested !== null && nested !== undefined && typeof nested !== 'object') {
						return String(nested).trim()
					}
				}
				return ''
			}
			return String(value).trim()
		},
		buildNhanXetGVCN(student) {
			const nhanXetChuanBiNienKhoa = this.htmlToPlainText(student?.NhanXetGVCN)
			const nhanXetVeHocSinh = this.htmlToPlainText(student?.NhanXetGVCN_VeHocSinh_HTML)
			const parts = []
			if (nhanXetChuanBiNienKhoa) parts.push('Nhận xét chuẩn bị niên khóa: ' + nhanXetChuanBiNienKhoa)
			if (nhanXetVeHocSinh) parts.push('Nhận xét về học sinh: ' + nhanXetVeHocSinh)
			return parts.join('\n\n')
		},
		htmlToPlainText(value) {
			if (value == null || value === '') return ''
			const container = document.createElement('div')
			container.innerHTML = String(value)
			return (container.innerText || container.textContent || '')
				.replace(/\u00a0/g, ' ')
				.replace(/[\u200B-\u200D\uFEFF]/g, '')
				.replace(/\n{3,}/g, '\n\n')
				.trim()
		},
		renderCheckedValue(value) {
			return value === true || value === 'true' || value === 1 || value === '1' || value === 'X' ? 'X' : ''
		},
		cleanSheetNumber(value) {
			if (value == null || value === '') return 0
			const num = Number(value)
			return isNaN(num) ? 0 : num
		},
		buildStudentSheetExportAoA() {
			const namHocDiem = (Number(this.currentNienKhoa || 0) - 1) + '-' + this.currentNienKhoa
			const headerRow = Array(this.studentSheetColumns.length).fill('')
			headerRow[6] = 'ĐTB môn cả năm ' + namHocDiem
			headerRow[18] = 'KQ ' + namHocDiem
			headerRow[21] = 'NHẬN XÉT CỦA GVCN ' + namHocDiem
			headerRow[22] = 'THÔNG TIN GIA ĐÌNH'
			headerRow[30] = 'ĐĂNG KÍ'
			return [
				headerRow,
				this.studentSheetColumns.map(x => x.title),
				...(this.studentSheetRows || [])
			]
		},
		buildStudentSheetExportMerges() {
			return [
				{ s: { r: 0, c: 6 }, e: { r: 0, c: 17 } },
				{ s: { r: 0, c: 18 }, e: { r: 0, c: 20 } },
				{ s: { r: 0, c: 22 }, e: { r: 0, c: 29 } },
				{ s: { r: 0, c: 30 }, e: { r: 0, c: 31 } }
			]
		},
		safeSheetName(name) {
			return this.replaceInvalidExcelChars(String(name || 'Sheet1'), ' ').substring(0, 31)
		},
		buildToChucLopExportAoA() {
			const rows = [['TỔ CHỨC LỚP NĂM HỌC ' + this.getCurrentSchoolYearText()], []]
			rows.push(['I. BAN CÁN BỘ LỚP & ĐỘI'])
			rows.push(['STT', 'Chức vụ', 'Mã học sinh', 'Họ và tên học sinh', 'Ghi chú'])
			const toChucRows = this.$refs.tabToChucLopRef?.getSerializableRows?.() || []
			toChucRows.forEach((r, idx) => {
				rows.push([idx + 1, r.ChucVu || '', r.MaHocSinh || r.HocSinhID || '', r.HoTen || '', r.GhiChu || ''])
			})
			return rows
		},
		buildCongTacThangExportAoA() {
			const rows = [['CÔNG TÁC CHỦ NHIỆM THÁNG'], ['Tháng', 'Nội dung kế hoạch / công tác chủ nhiệm']]
			const data = this.$refs.tabCongTacChuNhiemRef?.getSaveRows?.(this.form.SoGVCNID) || []
			data.forEach(r => {
				rows.push(['Tháng ' + r.ThangIndex, r.NoiDung || ''])
			})
			return rows
		},
		buildHsCanQuanTamExportAoA() {
			const rows = [['HỒ SƠ THEO DÕI HỌC SINH CẦN QUAN TÂM'], ['STT', 'Mã học sinh', 'Số danh bộ', 'Họ và tên', 'Đối tượng', 'Khả năng, nhu cầu', 'Biện pháp giáo dục', 'Kết quả']]
			const data = this.$refs.tabKeHoachRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[1] || '', r[2] || '', r[3] || '', r[4] || '', r[5] || '', r[6] || '', r[7] || ''])
			})
			return rows
		},
		buildNhanXetLmsExportAoA() {
			const rows = [['NHẬN XÉT THÁNG HỌC SINH (LMS)'], ['STT', 'Mã học sinh', 'Số danh bộ', 'Họ và tên', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1-2', 'Tháng 3', 'Tháng 4', 'Tháng 5']]
			const data = this.$refs.tabRenLuyenRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[1] || '', r[2] || '', r[3] || '', r[4] || '', r[5] || '', r[6] || '', r[7] || '', r[8] || '', r[9] || '', r[10] || '', r[11] || '', r[12] || ''])
			})
			return rows
		},
		buildSoKetHk1ExportAoA() {
			const data = this.$refs.tabSoKetHk1Ref?.getData?.() || {}
			const rows = [['SƠ KẾT HỌC KÌ I'], ['1. Duy trì số lượng:', data.notes?.['duy-tri-si-so'] || ''], ['2. Về năng lực, phẩm chất:', data.notes?.['danh-gia-nl-pc'] || ''], ['3. Về kiến thức, kĩ năng:', data.notes?.['danh-gia-kien-thuc'] || ''], ['4. Phương hướng HKI:', data.notes?.['phuong-huong-hk2'] || '']]
			return rows
		},
		buildTongKetNamExportAoA() {
			const data = this.$refs.tabTongKetNamRef?.getData?.() || {}
			const form = data.Form || {}
			return [
				['TỔNG KẾT NĂM HỌC'],
				['1. Duy trì số lượng:', form.DuyTriSoLuong || ''],
				['2. Năng lực, phẩm chất:', form.NangLucPhamChat || ''],
				['3. Kiến thức, kĩ năng:', form.KienThucKyNang || ''],
				['5. Hoàn thành CT:', form.HoanThanhCT || ''],
				['6. Phong trào khác:', form.PhongTraoKhac || '']
			]
		},
		buildTheoDoiSiSoExportAoA() {
			const rows = [['THEO DÕI SĨ SỐ HỌC SINH THEO THÁNG'], ['STT', 'Thời điểm', 'Sĩ số đầu tháng', 'Học sinh sinh khác', 'Học sinh trường khác', 'Lý do chuyển']]
			const data = this.$refs.tabTheoDoiSiSoRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[0] || '', r[1] || '', r[2] || '', r[3] || '', r[4] || ''])
			})
			return rows
		},
		buildThongKeDoTuoiExportAoA() {
			const rows = [['THỐNG KÊ ĐỘ TUỔI HỌC SINH'], ['Năm sinh', 'Nam', 'Nữ', 'Khuyết tật']]
			const data = this.$refs.tabThongKeDoTuoiRef?.getSerializableRows?.() || []
			data.forEach(r => {
				rows.push([r.AgeLabel || '', r.Nam || '', r.Nu || '', r.KhuyetTat || ''])
			})
			return rows
		},
		buildTheoDoiThanhTichExportAoA() {
			const rows = [['THEO DÕI THÀNH TÍCH HỌC SINH'], ['STT', 'Mã học sinh', 'Số danh bộ', 'Họ và tên', 'HKI', 'Cuối năm']]
			const data = this.$refs.tabTheoDoiThanhTichRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[1] || '', r[2] || '', r[3] || '', r[4] || '', r[5] || ''])
			})
			return rows
		},
		buildTheoDoiPhHopExportAoA() {
			const rows = [['THEO DÕI PHỤ HUYNH ĐI HỌP'], ['STT', 'Mã học sinh', 'Số danh bộ', 'Họ và tên', 'Lần 1', 'Lần 2', 'Lần 3', 'Ghi chú']]
			const data = this.$refs.tabTheoDoiPhHopRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[1] || '', r[2] || '', r[3] || '', r[4] ? 'X' : '', r[5] ? 'X' : '', r[6] ? 'X' : '', r[7] || ''])
			})
			return rows
		},
		buildNoiDungHopPhExportAoA() {
			const rows = [['NỘI DUNG HỌP PHỤ HUYNH HỌC SINH'], ['Đợt họp', 'Nội dung họp']]
			const data = this.$refs.tabNoiDungHopPhRef?.getRows?.() || []
			data.forEach(r => {
				rows.push([r.DotHop || '', r.NoiDungChinh || ''])
			})
			return rows
		},
		buildTheoDoiBhytExportAoA() {
			const rows = [['THEO DÕI BHYT VÀ BHTN'], ['STT', 'Mã học sinh', 'Số danh bộ', 'Họ và tên', 'BHYT', 'BHTN', 'Ghi chú']]
			const data = this.$refs.tabTheoDoiBhytRef?.getRows?.() || []
			data.forEach((r, idx) => {
				rows.push([idx + 1, r[1] || '', r[2] || '', r[3] || '', r[4] ? 'X' : '', r[5] ? 'X' : '', r[6] || ''])
			})
			return rows
		},
		normalizeFileName(fileName) {
			return this.replaceInvalidExcelChars(String(fileName || 'SoGVCN.xlsx'), '_').split(' ').join('_')
		},
		replaceInvalidExcelChars(value, replacement) {
			const invalidChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '[', ']']
			let text = value
			invalidChars.forEach(ch => {
				text = text.split(ch).join(replacement)
			})
			return text
		},
		onSaveButtonClick() {
			if (this.tab === 'cong-tac-cn' || (this.tab === 'ke-hoach' && !this.isCap1)) {
				return this.saveKeHoachSheet()
			} else {
				return this.onSaveDraft()
			}
		},
		onWorkflowSave() {
			this.onSaveButtonClick()
		},
		onWorkflowSend() {
			return this.isCap1 ? this.sendNhanXetThangLmsToTruong() : this.sendSoLienLacToBgh()
		},
		async onSaveDraft() {
			if (!this.savingGroupedClasses && (this.selectedClass?.LopIDs || []).length > 1) {
				return this.onSaveDraftForGroupedClasses()
			}
			if (this.tab === 'to-chuc-lop' && this.isCap1) {
				const ok = await this.confirmRef.value.show({ title: 'Xác nhận lưu thông tin tổ chức lớp?' })
				if (!ok) return
			}
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur()
			}
			const instances = [this.sheetInstance]
			if (this.$refs) {
				Object.values(this.$refs).forEach(ref => {
					if (ref && typeof ref.getInstance === 'function') {
						instances.push(ref.getInstance())
					}
				})
			}
			instances.forEach(inst => {
				const sheet = Array.isArray(inst) ? inst[0] : inst
				if (sheet && typeof sheet.closeEditor === 'function') {
					try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (e) {}
				}
			})
			this.loading.save = true
			try {
				if (this.tab === 'to-chuc-lop' && this.isCap1) {
					const organization = this.$refs.tabToChucLopRef?.getOrganizationRows() || {}
					const canBoCard = this.getChiTieuCard('can-bo-lop')
					const parentCard = this.getChiTieuCard('ban-dai-dien-cmhs')
					canBoCard.rows = (organization.canBoRows || []).map((row, index) => [
						index + 1,
						row.MaHocSinh || row.HocSinhID || '',
						row.HocSinh || '',
						row.ChucVu || '',
						row.GhiChu || ''
					])
					parentCard.rows = (organization.parentRows || []).map((row, index) => [
						index + 1,
						row.MaHocSinh || row.HocSinhID || '',
						row.HocSinh || '',
						row.ChaMe || '',
						row.NgheNghiep || '',
						row.DienThoai || '',
						row.NhiemVu || '',
						row.GhiChu || ''
					])
					const banDaiDienCMHSRows = this.serializeBanDaiDienCMHSRows()
					const canBoLopRows = this.serializeCanBoLopRows()
					const toNhomHocSinhRows = (organization.groupRows || []).filter(row =>
						row.ToNhom || row.NhiemVu || row.Ban)
					await ajaxCALLPromise('lms/SoGVCNPhuLucTab2Save', {
						SoGVCNID: this.form.SoGVCNID,
						JsonSiSo: JSON.stringify(this.serializeSiSoRows()),
						JsonGiaoVienBoMon: JSON.stringify(this.serializeGiaoVienBoMonRows()),
						JsonBanDaiDienCMHS: JSON.stringify(banDaiDienCMHSRows),
						JsonCanBoLop: JSON.stringify(canBoLopRows),
						JsonToNhomHocSinh: JSON.stringify(toNhomHocSinhRows)
					})
					this.banDaiDienCMHSSavedRows = banDaiDienCMHSRows
					this.canBoLopSavedRows = canBoLopRows
					this.toNhomHocSinhSavedRows = toNhomHocSinhRows
					await this.getDetail()
					if (this.toNhomHocSinhSavedRows.length !== toNhomHocSinhRows.length) {
						throw new Error('Dữ liệu tổ/nhóm chưa được lưu đầy đủ. Vui lòng thử lại.')
					}
				} else if (this.tab === 'chi-tieu' && this.isCap1) {
					const planData = this.$refs.tabKeHoachNamHocRef?.getPlanData?.()
					if (!planData) throw new Error('Không đọc được dữ liệu kế hoạch chủ nhiệm năm học.')
					await ajaxCALLPromise('lms/SoGVCNKeHoachNamHocSave', {
						SoGVCNID: this.form.SoGVCNID,
						JsonData: JSON.stringify(planData)
					})
					this.keHoachNamHocData = planData
				} else if (this.tab === 'chi-tieu') {
					const chiTieuRows = this.serializeChiTieuStructuredRows()
					this.form.ChiTieu = this.serializeChiTieuRows()
					const siSoRows = this.serializeSiSoRows()
					const giaoVienBoMonRows = this.serializeGiaoVienBoMonRows()
					const banDaiDienCMHSRows = this.serializeBanDaiDienCMHSRows()
					const canBoLopRows = this.serializeCanBoLopRows()
					this.form.SiSo = JSON.stringify({ version: 1, rows: siSoRows })
					this.form.GiaoVienBoMon = JSON.stringify({ version: 1, rows: giaoVienBoMonRows })
					this.form.BanDaiDienCMHS = JSON.stringify({ version: 1, rows: banDaiDienCMHSRows })
					this.form.CanBoLop = JSON.stringify({ version: 1, rows: canBoLopRows })
					await ajaxCALLPromise('lms/SoGVCNChiTieuSave', {
						SoGVCNID: this.form.SoGVCNID,
						JsonRows: JSON.stringify(chiTieuRows)
					})
					await ajaxCALLPromise('lms/SoGVCNPhuLucTab2Save', {
						SoGVCNID: this.form.SoGVCNID,
						JsonSiSo: JSON.stringify(siSoRows),
						JsonGiaoVienBoMon: JSON.stringify(giaoVienBoMonRows),
						JsonBanDaiDienCMHS: JSON.stringify(banDaiDienCMHSRows),
						JsonCanBoLop: JSON.stringify(canBoLopRows)
					})
					this.chiTieuSavedRows = chiTieuRows
					this.siSoSavedRows = siSoRows
					this.giaoVienBoMonSavedRows = giaoVienBoMonRows
					this.banDaiDienCMHSSavedRows = banDaiDienCMHSRows
					this.canBoLopSavedRows = canBoLopRows
				} else if (this.tab === 'huong-nghiep') {
					const huongNghiepRows = this.serializeHuongNghiepRows()
					this.form.HuongNghiep = JSON.stringify({ version: 1, rows: huongNghiepRows })
					await ajaxCALLPromise('lms/SoGVCNHuongNghiepSave', {
						SoGVCNID: this.form.SoGVCNID,
						JsonHuongNghiep: JSON.stringify(huongNghiepRows)
					})
					this.huongNghiepSavedRows = huongNghiepRows
				} else if (this.tab === 'ren-luyen') {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						if (this.isCap1) {
							await this.saveSelectedNhanXetThangLmsPeriod()
						} else {
							await ajaxCALLPromise('lms/SoGVCNTheoDoiRenLuyenSave', {
								SoGVCNID: this.form.SoGVCNID,
								JsonRows: JSON.stringify(this.serializeRenLuyenMonthlyRows())
							})
						}
					}
				} else if (this.tab === 'ke-hoach' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const rowsToSave = this.serializeHsCanQuanTamRows()
						await ajaxCALLPromise('lms/SoGVCNHsCanQuanTamSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(rowsToSave)
						})
						await this.getHsCanQuanTam()
					}
				} else if (this.tab === 'so-lien-lac') {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						if (this.isCap1) {
							const rowsToSave = this.serializeTheoDoiPhHopRows()
							await ajaxCALLPromise('lms/SoGVCNTheoDoiPhuHuynhHopSave', {
								SoGVCNID: this.form.SoGVCNID,
								JsonRows: JSON.stringify(rowsToSave)
							})
							this.theoDoiPhHopSavedRows = rowsToSave
						} else {
							await this.saveSelectedSoLienLacPeriod()
						}
					}
				} else if (this.tab === 'so-ket-hk1' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const payload = this.$refs.tabSoKetHk1Ref?.getData?.() || {}
						const structuredRatings = this.$refs.tabSoKetHk1Ref?.getStructuredRatings?.(this.monHocList) || []
						await ajaxCALLPromise('lms/SoGVCNSoKetHKISave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonData: JSON.stringify(payload),
							JsonDanhGia: JSON.stringify(structuredRatings)
						})
						await this.getSoKetHk1()
					}
				} else if (this.tab === 'noi-dung-hop-ph' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const rowsToSave = this.serializeNoiDungHopPhRows()
						await ajaxCALLPromise('lms/SoGVCNNoiDungHopPHSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(rowsToSave)
						})
						await this.getNoiDungHopPh()
					}
				} else if (this.tab === 'theo-doi-thanh-tich' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const rowsToSave = this.serializeTheoDoiThanhTichRows()
						await ajaxCALLPromise('lms/SoGVCNTheoDoiThanhTichSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(rowsToSave)
						})
						await this.getTheoDoiThanhTich()
					}
				} else if (this.tab === 'thong-ke-do-tuoi' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const rowsToSave = this.serializeThongKeDoTuoiRows()
						await ajaxCALLPromise('lms/SoGVCNThongKeDoTuoiSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(rowsToSave)
						})
						this.thongKeDoTuoiSavedRows = rowsToSave
					}
				} else if (this.tab === 'theo-doi-si-so' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const rowsToSave = this.serializeTheoDoiSiSoThangRows()
						await ajaxCALLPromise('lms/SoGVCNTheoDoiSiSoThangSave', {
							SoGVCNID: this.form.SoGVCNID,
							JsonRows: JSON.stringify(rowsToSave)
						})
						this.siSoSavedRows = rowsToSave
					}
				} else if (this.tab === 'tong-ket-nam' && this.isCap1) {
					if (this.form.SoGVCNID && this.selectedLopID !== '__ALL__') {
						const payload = this.$refs.tabTongKetNamRef?.getData() || {}
						const structuredRatings = this.$refs.tabTongKetNamRef?.getStructuredRatings?.(this.monHocList) || []
						await ajaxCALLPromise('lms/SoGVCNTongKetNamC1Save', {
							SoGVCNID: this.form.SoGVCNID,
							DuyTriSoLuong: payload.Form?.DuyTriSoLuong || '',
							NangLucPhamChat: payload.Form?.NangLucPhamChat || '',
							KienThucKyNang: payload.Form?.KienThucKyNang || '',
							HoanThanhCT: payload.Form?.HoanThanhCT || '',
							PhongTraoKhac: payload.Form?.PhongTraoKhac || '',
							JsonSheet1: JSON.stringify(payload.Sheet1 || []),
							JsonSheet2: JSON.stringify(payload.Sheet2 || []),
							JsonSheet3: JSON.stringify(payload.Sheet3 || []),
							JsonSheet4: JSON.stringify(payload.Sheet4 || []),
							JsonDanhGia: JSON.stringify(structuredRatings)
						})
						await this.getTongKetNamC1()
					}
				}
				this.clearUnsavedChanges()
				if (this.detail) this.detail.TrangThai = this.detail.TrangThai === 'NEW' ? 'DRAFT' : this.detail.TrangThai
				if (this.selectedClass) this.selectedClass.TrangThai = this.selectedClass.TrangThai === 'NEW' ? 'DRAFT' : this.selectedClass.TrangThai
				const tabNames = {
					'chi-tieu': this.isCap1 ? 'kế hoạch chủ nhiệm năm học' : 'chỉ tiêu',
					'ke-hoach': this.isCap1 ? 'hồ sơ HS cần quan tâm' : 'kế hoạch chủ nhiệm',
					'huong-nghiep': 'hướng nghiệp',
					'du-lieu-hs': this.isCap1 ? 'thông tin HS lớp' : 'dữ liệu HS lớp',
					'to-chuc-lop': 'tổ chức lớp',
					'ren-luyen': 'hồ sơ theo dõi rèn luyện',
					'so-ket-hk1': 'sơ kết HKI',
					'so-lien-lac': 'sổ liên lạc',
					'noi-dung-hop-ph': 'nội dung họp PHHS'
				}
				const tabLabel = tabNames[this.tab] || ''
				this.notify(tabLabel ? `Đã lưu ${tabLabel}` : 'Đã lưu')
			} finally {
				this.loading.save = false
			}
		},
		async onSaveDraftForGroupedClasses() {
			const group = this.selectedClass
			const groupStudents = this.getSelectedClassStudents()
			let completed = false
			const original = {
				selectedLopID: this.selectedLopID,
				selectedClass: group,
				filterLopID: this.filter.LopID,
				formSoGVCNID: this.form.SoGVCNID
			}
			this.savingGroupedClasses = true
			try {
				for (const context of this.soGVCNContexts) {
					const member = (this.allStudentRows || []).find(row => String(row.LopID) === String(context.LopID))?.TenLop || group.TenLop
					this.selectedLopID = context.LopID
					this.selectedClass = {
						...group,
						LopID: context.LopID,
						LopIDs: [context.LopID],
						TenLop: member
					}
					this.filter.LopID = context.LopID
					this.form.SoGVCNID = context.SoGVCNID
					this.savingClassContext = context
					this.serializationStudents = groupStudents
					await this.onSaveDraft()
				}
				completed = true
			} finally {
				this.savingClassContext = null
				this.serializationStudents = null
				this.selectedLopID = original.selectedLopID
				this.selectedClass = original.selectedClass
				this.filter.LopID = original.filterLopID
				this.form.SoGVCNID = original.formSoGVCNID
				this.savingGroupedClasses = false
			}
			if (completed) {
				const labels = {
					'chi-tieu': this.isCap1 ? 'kế hoạch chủ nhiệm năm học' : 'chỉ tiêu',
					'ke-hoach': this.isCap1 ? 'hồ sơ HS cần quan tâm' : 'kế hoạch chủ nhiệm',
					'huong-nghiep': 'hướng nghiệp',
					'ren-luyen': 'hồ sơ theo dõi rèn luyện',
					'so-lien-lac': 'sổ liên lạc'
				}
				this.notify(labels[this.tab] ? 'Đã lưu ' + labels[this.tab] : 'Đã lưu')
			}
		},

		serializeNhanXetThangLmsRows() {
			const sheet = this.$refs.tabNhanXetThangLmsRef?.getInstance()
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			const students = this.getSheetStudents()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				rows.push({
					HSLopID: student.HSLopID,
					HocSinhID: student.HocSinhID || null,
					Thang8: this.cleanSheetValue(row[3]),
					Thang9: this.cleanSheetValue(row[4]),
					Thang10: this.cleanSheetValue(row[5]),
					Thang11: this.cleanSheetValue(row[6]),
					Thang12: this.cleanSheetValue(row[7]),
					NhanXetHKI: this.cleanSheetValue(row[8]),
					Thang1_2: this.cleanSheetValue(row[9]),
					Thang3: this.cleanSheetValue(row[10]),
					Thang4: this.cleanSheetValue(row[11]),
					Thang5: this.cleanSheetValue(row[12]),
					NhanXetHKII: this.cleanSheetValue(row[13])
				})
			})
			return rows
		},
		serializeSelectedNhanXetThangLmsPayload() {
			const period = this.selectedNhanXetThangLmsPeriod
			if (!period) return []
			const sheet = this.$refs.tabNhanXetThangLmsRef?.getInstance?.()
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : this.nhanXetThangLmsRows
			const students = this.getSheetStudents()
			const fields = ['NhanXetToan_HTML', 'DiemToan', 'NhanXetTiengViet_HTML', 'DiemTiengViet', 'NhanXetMonHocKhac_HTML', 'HoatDongGiaoDucKhac_HTML', 'PhamChatNangLuc_HTML']
			return this.filterRowsForSaving(sourceRows.map((row, rowIndex) => {
				const student = students[rowIndex] || {}
				const existing = (period.items || []).find(item => Number(item.HSLopID) === Number(student.HSLopID) &&
					(!item.__LopID || !student.LopID || String(item.__LopID) === String(student.LopID))) || {}
				const payload = { ...existing, LopID: this.selectedLopID, Lop_NhanXetThangID: period.Lop_NhanXetThangID, HocSinhID: student.HocSinhID, HSLopID: student.HSLopID }
				fields.forEach((field, index) => { payload[field] = this.cleanSheetValue(row[index + 2]) })
				return payload
			}).filter(row => row.HSLopID))
		},
		async saveSelectedNhanXetThangLmsPeriod() {
			const period = this.selectedNhanXetThangLmsPeriod
			if (!period) throw new Error('Vui lòng chọn tháng nhận xét.')
			const payload = this.serializeSelectedNhanXetThangLmsPayload()
			if (!payload.length) throw new Error('Không có học sinh để lưu nhận xét.')
			await ajaxCALLPromise('lms/NhanXetThang_Ins', { JSON_NhanXetThang: payload })
			await ajaxCALLPromise('lms/NhanXetThang_Upd_TinhTrang', { TinhTrang: 1, Lop_NhanXetThangID: period.Lop_NhanXetThangID, ReasonReject: '' })
			await this.getNhanXetThangLmsPeriods()
		},
		async sendNhanXetThangLmsToTruong() {
			const period = this.selectedNhanXetThangLmsPeriod
			if (!period || this.nhanXetThangLmsReadOnly) return
			const confirmed = await this.confirmRef?.value?.show?.({ title: 'Xác nhận gửi nhận xét tháng tới tổ trưởng?' })
			if (!confirmed) return
			this.loading.submit = true
			try {
				const payload = this.serializeSelectedNhanXetThangLmsPayload()
				if (payload.some(row => Number(row.NhanXetThangID) <= 0)) {
					this.notify('Vui lòng lưu đủ nhận xét cho tất cả học sinh trước khi gửi tổ trưởng')
					return
				}
				await ajaxCALLPromise('lms/NhanXetThang_Ins', { JSON_NhanXetThang: payload })
				await ajaxCALLPromise('lms/NhanXetThang_Upd_TinhTrang', { TinhTrang: 2, Lop_NhanXetThangID: period.Lop_NhanXetThangID, ReasonReject: '' })
				await this.getNhanXetThangLmsPeriods()
				this.notify('Đã gửi nhận xét tháng tới tổ trưởng')
			} finally {
				this.loading.submit = false
			}
		},

		serializeHsCanQuanTamRows() {
			const instance = this.$refs.tabHsCanQuanTamRef?.getInstance()
			const sheet = Array.isArray(instance) ? instance[0] : instance
			if (sheet && typeof sheet.closeEditor === 'function') {
				try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (error) {}
			}
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : []
			const students = this.getSheetStudents()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				rows.push({
					HSLopID: student.HSLopID,
					HocSinhID: student.HocSinhID || null,
					CanHoTroDacBiet: this.cleanSheetValue(row[2]),
					Thang8: this.cleanSheetValue(row[3]),
					Thang9: this.cleanSheetValue(row[4]),
					Thang10: this.cleanSheetValue(row[5]),
					Thang11: this.cleanSheetValue(row[6]),
					Thang12: this.cleanSheetValue(row[7]),
					NhanXetHKI: this.cleanSheetValue(row[8]),
					KetQuaHKI: this.cleanSheetValue(row[9]),
					Thang1_2: this.cleanSheetValue(row[10]),
					Thang3: this.cleanSheetValue(row[11]),
					Thang4: this.cleanSheetValue(row[12]),
					Thang5: this.cleanSheetValue(row[13]),
					NhanXetCuoiNam: this.cleanSheetValue(row[14]),
					KetQuaCuoiNam: this.cleanSheetValue(row[15])
				})
			})
			return rows
		},

		serializeNoiDungHopPhRows() {
			return this.$refs.tabNoiDungHopPhRef?.getRows?.() || []
		},

		serializeTheoDoiPhHopRows() {
			const sourceRows = this.$refs.tabTheoDoiPhHopRef?.getRows?.() || []
			const students = this.getSheetStudents()
			const isChecked = value => value === true || value === 1 || value === '1' || value === 'true'
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				rows.push({
					HSLopID: student.HSLopID,
					HocSinhID: student.HocSinhID || null,
					Lan1: isChecked(row[4]),
					Lan2: isChecked(row[5]),
					Lan3: isChecked(row[6]),
					GhiChu: this.cleanSheetValue(row[7])
				})
			})
			return this.filterRowsForSaving(rows)
		},

		serializeTheoDoiThanhTichRows() {
			const sourceRows = this.$refs.tabTheoDoiThanhTichRef?.getRows?.() || []
			const students = this.getSheetStudents()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				rows.push({
					HSLopID: student.HSLopID,
					HocSinhID: student.HocSinhID || null,
					HKI: this.cleanSheetValue(row[4]),
					CuoiNam: this.cleanSheetValue(row[5])
				})
			})
			return this.filterRowsForSaving(rows)
		},

		serializeThongKeDoTuoiRows() {
			return this.$refs.tabThongKeDoTuoiRef?.getSerializableRows?.() || []
		},

		serializeTheoDoiSiSoThangRows() {
			const sourceRows = this.$refs.tabTheoDoiSiSoRef?.getRows?.() || []
			const ethnicList = this.$refs.tabTheoDoiSiSoRef?.getEthnicList?.() || []
			const rows = []
			sourceRows.forEach((row) => {
				const thoiDiem = this.cleanSheetValue(row[0])
				if (!thoiDiem) return
				// Các cột đọc từ cuối mảng lên:
				// (len - 1): TangGiamLiDo
				// (len - 2): HoNgheo
				// (len - 3): KhuyetTatKhongDanhGia
				// (len - 4): KhuyetTatCoDanhGia
				// (len - 5): ConThuongBinh
				// (len - 6): ConLietSi
				// (len - 7): NhiDong
				// (len - 8): DoiVien
				const len = row.length
				const cleanValue = (val) => {
					const value = this.cleanSheetValue(val)
					return value === '' ? null : value
				}
				const ethnicCounts = {}
				ethnicList.forEach((ethnicName, index) => {
					ethnicCounts[ethnicName] = cleanValue(row[3 + index])
				})
				rows.push({
					ThoiDiem: thoiDiem,
					TongSo: cleanValue(row[1]),
					Nu: cleanValue(row[2]),
					DanTocJson: JSON.stringify(ethnicCounts),
					DoiVien: cleanValue(row[len - 8]),
					NhiDong: cleanValue(row[len - 7]),
					ConLietSi: cleanValue(row[len - 6]),
					ConThuongBinh: cleanValue(row[len - 5]),
					KhuyetTatCoDanhGia: cleanValue(row[len - 4]),
					KhuyetTatKhongDanhGia: cleanValue(row[len - 3]),
					HoNgheo: cleanValue(row[len - 2]),
					TangGiamLiDo: this.cleanSheetValue(row[len - 1])
				})
			})
			return rows
		},

		serializeRenLuyenMonthlyRows() {
			const sheetInstance = this.$refs.tabRenLuyenRef?.getInstance?.()
			const sheet = Array.isArray(sheetInstance) ? sheetInstance[0] : sheetInstance
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.renLuyenRows || [])
			const students = this.getSheetStudents()
			const months = this.getMonthlySheetMonths()
			const rows = []
			sourceRows.forEach((row, rowIndex) => {
				const student = students[rowIndex] || {}
				if (!student.HSLopID) return
				// Cột 4: HS cần hỗ trợ đặc biệt (Thang = 0)
				rows.push({ HSLopID: student.HSLopID, Thang: 0, NoiDung: this.cleanSheetValue(row[4]) })
				// Cột 5: Ban cán sự (Thang = 99)
				rows.push({ HSLopID: student.HSLopID, Thang: 99, NoiDung: this.cleanSheetValue(row[5]) })
				// Các tháng 8, 9, 10, 11, 12, 1, 3, 4, 5
				months.forEach(month => {
					rows.push({ HSLopID: student.HSLopID, Thang: month.thang, NoiDung: this.cleanSheetValue(row[month.index]) })
				})
				// Cột 11: NHẬN XÉT HKI (Thang = 91)
				rows.push({ HSLopID: student.HSLopID, Thang: 91, NoiDung: this.cleanSheetValue(row[11]) })
				// Cột 12: KQRL HKI (Thang = 81)
				rows.push({ HSLopID: student.HSLopID, Thang: 81, NoiDung: this.cleanSheetValue(row[12]) })
				// Cột 13: KQHT HKI (Thang = 82)
				rows.push({ HSLopID: student.HSLopID, Thang: 82, NoiDung: this.cleanSheetValue(row[13]) })
				// Cột 18: NHẬN XÉT HKII (Thang = 92)
				rows.push({ HSLopID: student.HSLopID, Thang: 92, NoiDung: this.cleanSheetValue(row[18]) })
				// Cột 19: KQRL HKII (Thang = 93)
				rows.push({ HSLopID: student.HSLopID, Thang: 93, NoiDung: this.cleanSheetValue(row[19]) })
				// Cột 20: KQHT HKII (Thang = 94)
				rows.push({ HSLopID: student.HSLopID, Thang: 94, NoiDung: this.cleanSheetValue(row[20]) })
				// Cột 21: DANH HIỆU (Thang = 95)
				rows.push({ HSLopID: student.HSLopID, Thang: 95, NoiDung: this.cleanSheetValue(row[21]) })
				// Cột 22: THÀNH TÍCH KHÁC (Thang = 96)
				rows.push({ HSLopID: student.HSLopID, Thang: 96, NoiDung: this.cleanSheetValue(row[22]) })
			})
			return this.filterRowsForSaving(rows)
		},
		serializeSelectedSoLienLacPayload() {
			const period = this.selectedSoLienLacPeriod
			if (!period) return []
			const sheet = this.$refs.tabSoLienLacRef?.getInstance?.()
			const sourceRows = sheet && typeof sheet.getData === 'function' ? sheet.getData() : (this.soLienLacRows || [])
			const students = this.getSheetStudents()
			return this.filterRowsForSaving(sourceRows.map((row, rowIndex) => {
				const student = students[rowIndex] || {}
				const existing = (period.items || []).find(item => Number(item.HSLopID) === Number(student.HSLopID)) || {}
				const payload = {
					...existing,
					LopID: this.selectedLopID,
					Lop_NhanXetThangID: period.Lop_NhanXetThangID,
					HocSinhID: student.HocSinhID,
					HSLopID: student.HSLopID
				}
				;(period.fields || []).forEach((field, index) => {
					payload[field.key] = this.cleanSheetValue(row[index + 4])
				})
				return payload
			}).filter(row => row.HSLopID))
		},
		async saveSelectedSoLienLacPeriod() {
			const period = this.selectedSoLienLacPeriod
			if (!period) throw new Error('Vui lòng chọn kỳ nhận xét.')
			const payload = this.serializeSelectedSoLienLacPayload()
			if (!payload.length) throw new Error('Không có học sinh để lưu nhận xét.')
			await ajaxCALLPromise('lms/NhanXetThang_Ins', { JSON_NhanXetThang: payload })
			await ajaxCALLPromise('lms/NhanXetThang_Upd_TinhTrang', {
				TinhTrang: 1,
				Lop_NhanXetThangID: period.Lop_NhanXetThangID,
				ReasonReject: ''
			})
			if (!this.savingGroupedClasses) await this.getSoLienLacPeriods(this.getSelectedClassStudents())
		},
		async sendSoLienLacToBgh() {
			if (!this.savingGroupedClasses && (this.selectedClass?.LopIDs || []).length > 1) {
				return this.sendSoLienLacToBghForGroupedClasses()
			}
			const period = this.selectedSoLienLacPeriod
			if (!period || !this.soLienLacRows.length) return
			if ([2, 4].includes(Number(period.TinhTrang))) return
			const confirmed = await this.confirmRef?.value?.show?.({ title: 'Xác nhận gửi nhận xét tháng lên BGH?' })
			if (!confirmed) return
			this.loading.submit = true
			try {
				await this.sendSoLienLacToBghForCurrentClass()
				await this.getSoLienLacPeriods(this.getSelectedClassStudents())
				this.notify('Đã gửi nhận xét lên BGH')
			} finally {
				this.loading.submit = false
			}
		},
		async sendSoLienLacToBghForCurrentClass() {
			const period = this.selectedSoLienLacPeriod
			if (!period || [2, 4].includes(Number(period.TinhTrang))) return
			const payload = this.serializeSelectedSoLienLacPayload()
			if (payload.some(row => Number(row.NhanXetThangID) <= 0)) {
				throw new Error('Vui lòng nhập đủ nhận xét cho tất cả học sinh trước khi gửi BGH')
			}
			if (!payload.length) return
			await ajaxCALLPromise('lms/NhanXetThang_Ins', { JSON_NhanXetThang: payload })
			await ajaxCALLPromise('lms/NhanXetThang_Upd_TinhTrang', {
				TinhTrang: 2,
				Lop_NhanXetThangID: period.Lop_NhanXetThangID,
				ReasonReject: ''
			})
		},
		async sendSoLienLacToBghForGroupedClasses() {
			const group = this.selectedClass
			const original = {
				selectedLopID: this.selectedLopID,
				selectedClass: group,
				filterLopID: this.filter.LopID,
				formSoGVCNID: this.form.SoGVCNID
			}
			const confirmed = await this.confirmRef?.value?.show?.({ title: 'Xác nhận gửi nhận xét tháng lên BGH?' })
			if (!confirmed) return
			this.loading.submit = true
			this.savingGroupedClasses = true
			let completed = false
			let errorMessage = ''
			try {
				for (const context of this.soGVCNContexts) {
					const member = (this.allStudentRows || []).find(row => String(row.LopID) === String(context.LopID))?.TenLop || group.TenLop
					this.selectedLopID = context.LopID
					this.selectedClass = { ...group, LopID: context.LopID, LopIDs: [context.LopID], TenLop: member }
					this.filter.LopID = context.LopID
					this.form.SoGVCNID = context.SoGVCNID
					this.savingClassContext = context
					await this.sendSoLienLacToBghForCurrentClass()
				}
				completed = true
			} catch (error) {
				errorMessage = error?.message || 'Không thể gửi nhận xét lên BGH'
			} finally {
				this.savingClassContext = null
				this.selectedLopID = original.selectedLopID
				this.selectedClass = original.selectedClass
				this.filter.LopID = original.filterLopID
				this.form.SoGVCNID = original.formSoGVCNID
				this.savingGroupedClasses = false
				this.loading.submit = false
				await this.getSoLienLacPeriods(this.getSelectedClassStudents())
			}
			if (errorMessage) this.notify(errorMessage)
			else if (completed) this.notify('Đã gửi nhận xét lên BGH')
		},

		async saveKeHoachSheet() {
			if (!this.savingGroupedClasses && (this.selectedClass?.LopIDs || []).length > 1) {
				return this.saveKeHoachSheetForGroupedClasses()
			}
			if (!this.form.SoGVCNID) return
			if (document.activeElement && typeof document.activeElement.blur === 'function') {
				document.activeElement.blur()
			}
			const activeRef = this.tab === 'cong-tac-cn'
				? this.$refs.tabCongTacChuNhiemRef
				: this.$refs.tabKeHoachRef
			const tabRefInstance = activeRef?.getInstance ? activeRef.getInstance() : null
			const inst = tabRefInstance || this.$refs.tabKeHoachRef?.getInstance?.() || this.keHoachSheetInstance
			const sheet = Array.isArray(inst) ? inst[0] : inst
			if (sheet && typeof sheet.closeEditor === 'function') {
				try { sheet.closeEditor(sheet.edition ? sheet.edition[0] : null, true) } catch (e) {}
			}
			// Đợi DOM flush sau closeEditor trước khi đọc getData()
			await this.$nextTick()
			this.loading.month = true
			try {
				const rows = this.parseKeHoachSheetRows()
				await Promise.all(rows.map(row => ajaxCALLPromise('lms/SoGVCNKeHoachThangSave', row)))
				if (this.tab === 'cong-tac-cn') {
					await Promise.all(rows.map(row => ajaxCALLPromise('lms/SoGVCNKeHoachTuanClear', {
						SoGVCNID: this.form.SoGVCNID,
						Thang: row.Thang
					})))
					const weekRows = this.$refs.tabCongTacChuNhiemRef?.getSaveWeekRows?.(this.form.SoGVCNID) || []
					await Promise.all(weekRows.map(row => ajaxCALLPromise('lms/SoGVCNKeHoachTuanSave', row)))
				}
				await this.getDetail()
				if (this.tab === 'cong-tac-cn') {
					this.$refs.tabCongTacChuNhiemRef?.initSheet?.()
				} else {
					this.keHoachSheetRows = this.buildKeHoachThangTuanExportAoA(false, true)
					this.keHoachSheetStyle = this.buildKeHoachSheetStyle(false)
					this.$refs.tabKeHoachRef?.initSheet?.()
				}
				this.clearUnsavedChanges()
				this.notify('Đã lưu kế hoạch tháng')
			} finally {
				this.loading.month = false
			}
		},
		async saveKeHoachSheetForGroupedClasses() {
			const group = this.selectedClass
			let completed = false
			const original = {
				selectedLopID: this.selectedLopID,
				selectedClass: group,
				filterLopID: this.filter.LopID,
				formSoGVCNID: this.form.SoGVCNID
			}
			this.savingGroupedClasses = true
			try {
				for (const context of this.soGVCNContexts) {
					this.selectedLopID = context.LopID
					this.selectedClass = {
						...group,
						LopID: context.LopID,
						LopIDs: [context.LopID],
						TenLop: (this.allStudentRows || []).find(row => String(row.LopID) === String(context.LopID))?.TenLop || group.TenLop
					}
					this.filter.LopID = context.LopID
					this.form.SoGVCNID = context.SoGVCNID
					await this.saveKeHoachSheet()
				}
				completed = true
			} finally {
				this.selectedLopID = original.selectedLopID
				this.selectedClass = original.selectedClass
				this.filter.LopID = original.filterLopID
				this.form.SoGVCNID = original.formSoGVCNID
				this.savingGroupedClasses = false
			}
			if (completed) this.notify('Đã lưu kế hoạch tháng')
		}
	}
	}
</script>
