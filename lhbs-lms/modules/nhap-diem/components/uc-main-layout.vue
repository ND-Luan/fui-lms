<template>
	<Global>
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
				<uc-filter ref="filterRef" v-model="filter" @onRefresh="onRefresh" />
			</v-card-text>
			<v-divider />

			<!-- Toolbar -->
			<v-card-text class="py-2 d-flex align-center ga-2 flex-wrap">
				<v-btn v-if="!isAllColumnsLocked" @click="onLuuTam" color="grey" variant="outlined"
					:disabled="isDisabled" size="small">
					<v-icon start>mdi-content-save</v-icon>
					Lưu tạm
					<v-badge v-if="changedCellCount > 0" :content="changedCellCount" color="primary" inline
						class="ml-1" />
				</v-btn>

				<v-btn v-if="!isAllColumnsLocked && vueData.user.UserID === 'NA0000022'" @click="onLuuTamTatCa"
					color="deep-orange" variant="outlined" :disabled="isDisabled || !hasStudents" size="small">
					<v-icon start>mdi-content-save-all</v-icon>
					Lưu tạm tất cả
				</v-btn>

				<!-- Nút Khóa cột điểm — mở dialog chọn cột, default check hết -->
				<v-btn v-if="hasStudents && !isAllColumnsLocked" @click="onOpenLockDialog" color="teal"
					variant="outlined" :disabled="isDisabled" size="small">
					<v-icon start>mdi-lock</v-icon>
					Khóa cột điểm
					<v-badge v-if="!dismissedSuggest && suggestLockColumns.length > 0"
						:content="suggestLockColumns.length" color="warning" inline class="ml-1" />
				</v-btn>

				<v-btn v-if="canManageUnlockColumns && hasStudents && lockedColumns.length > 0"
					@click="onOpenUnlockDialog" color="warning" variant="outlined" size="small">
					<v-icon start>mdi-lock-open-variant</v-icon>
					Mở khóa cột điểm
				</v-btn>

				<v-btn v-if="filter.MonHocItem?.MonHocID === 5" @click="onOpenMauNhanXet" color="primary"
					variant="outlined" size="small" :disabled="!hasStudents">
					<v-icon start>mdi-comment-text-outline</v-icon>
					Mẫu nhận xét
				</v-btn>

				<v-btn v-if="hasTextColumn" @click="onCheckCommentAI" color="purple" variant="outlined" size="small"
					:disabled="isDisabled || !hasStudents || isCheckingLength" :loading="isCheckingAI">
					<v-icon start>mdi-robot-outline</v-icon>
					Kiểm tra nhận xét bằng AI
				</v-btn>

				<v-btn v-if="isCap1NangLucPhamChat && hasTextColumn" @click="onCheckCommentLength" color="info"
					variant="outlined" size="small" :disabled="isDisabled || !hasStudents || isCheckingAI"
					:loading="isCheckingLength">
					<v-icon start>mdi-text-box-search-outline</v-icon>
					Kiểm tra độ dài nhận xét
				</v-btn>

				<v-btn v-if="showGetThemeTestButton" @click="onGetDiemTest" color="primary" variant="outlined"
					size="small" :disabled="!hasStudents">
					<v-icon start>mdi-download-outline</v-icon>
					Lấy điểm Test
				</v-btn>

				<v-menu>
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" color="primary" variant="outlined" size="small" :disabled="!hasStudents"
							:loading="action.exportDialog.loading">
							<v-icon start>mdi-microsoft-excel</v-icon>
							Xuất Excel
							<v-icon end>mdi-menu-down</v-icon>
						</v-btn>
					</template>
					<v-list density="compact">
						<v-list-item @click="onExportExcel">
							<template v-slot:prepend>
								<v-icon size="small">mdi-file-excel-outline</v-icon>
							</template>
							<v-list-item-title>Xuất lớp hiện tại</v-list-item-title>
						</v-list-item>
						<v-list-item @click="onOpenExportManyClassesDialog">
							<template v-slot:prepend>
								<v-icon size="small">mdi-table-multiple</v-icon>
							</template>
							<v-list-item-title>Xuất nhiều lớp</v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-card-text>

			<v-divider v-if="hasStudents" />

			<!-- Khu vực thông báo -->
			<v-card-text v-if="hasStudents" class="py-2 d-flex flex-column ga-2">
				<!-- Gợi ý khóa cột điểm khi đã nhập đủ -->
				<v-alert v-if="showSuggestLockAlert" type="success" variant="tonal" density="compact" closable
					@click:close="onDismissSuggestLock">
					<div class="d-flex align-center justify-space-between flex-wrap ga-3">
						<div>
							<div class="text-body-2 font-weight-bold">
								Đã nhập đủ điểm —
								{{ suggestLockColumns.length === 1 ? '"' + suggestLockColumns[0].title + '"' :
								suggestLockColumns.length + ' cột' }}
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
							@update:model-value="onToggleSelectAllLockColumns" density="compact" hide-details
							color="teal">
							<template v-slot:label>
								<span class="text-body-2 font-weight-medium">Chọn tất cả</span>
								<span class="text-caption text-medium-emphasis ml-2">({{
									action.lockDialog.selectedColumns.length }}/{{ selectableColumns.length }})</span>
							</template>
						</v-checkbox>
					</div>

					<v-divider class="mb-1" />

					<v-list density="compact" class="rounded border pa-0" style="max-height: 260px; overflow-y: auto;">
						<v-list-item v-for="(col, i) in lockableColumns" :key="col.value"
							:class="i < lockableColumns.length - 1 ? 'border-b' : ''" min-height="40"
							:disabled="col.isLocked" @click="!col.isLocked && onToggleLockColumn(col.value)">
							<template v-slot:prepend>
								<v-checkbox-btn
									:model-value="col.isLocked || action.lockDialog.selectedColumns.includes(col.value)"
									:disabled="col.isLocked" @update:model-value="onToggleLockColumn(col.value)"
									color="teal" density="compact" />
							</template>
							<v-list-item-title class="text-body-2">{{ col.title }}</v-list-item-title>
							<template v-slot:append>
								<v-chip v-if="col.isLocked" size="x-small" color="primary" variant="flat">Đã khóa
								</v-chip>
								<v-chip v-else-if="isColumnReadyToLock(col.value)" size="x-small" color="warning"
									variant="tonal">Đủ điểm</v-chip>
							</template>
						</v-list-item>
					</v-list>
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end ga-2 pa-3">
					<v-btn variant="text" color="grey" @click="action.lockDialog.show = false">Hủy</v-btn>
					<v-btn color="teal" variant="flat" :disabled="action.lockDialog.selectedColumns.length === 0"
						@click="onConfirmLockColumns">
						<v-icon start size="18">mdi-lock-check</v-icon>
						Khóa {{ action.lockDialog.selectedColumns.length }} cột
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Chọn Cột Kiểm Tra Bằng AI -->
		<v-dialog v-model="action.aiColumnDialog.show" max-width="400" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon color="purple" size="22">mdi-robot-outline</v-icon>
					<span class="text-body-1 font-weight-bold">Chọn cột kiểm tra bằng AI</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pt-3 px-4 pb-2">
					<div class="text-body-2 text-medium-emphasis mb-3">
						Chọn các cột nhận xét bạn muốn AI kiểm tra lỗi chính tả và cú pháp.
					</div>

					<v-list density="compact" class="rounded border pa-0" style="max-height: 200px; overflow-y: auto;">
						<v-list-item v-for="(col, i) in textColumns" :key="col.value"
							:class="i < textColumns.length - 1 ? 'border-b' : ''" min-height="40"
							:disabled="col.isLocked" @click="!col.isLocked && onToggleAiColumn(col.value)">
							<template v-slot:prepend>
								<v-checkbox-btn :model-value="action.aiColumnDialog.selectedColumns.includes(col.value)"
									:disabled="col.isLocked" @update:model-value="onToggleAiColumn(col.value)"
									color="purple" density="compact" />
							</template>
							<v-list-item-title class="text-body-2">
								{{ col.title }}
								<span v-if="aiRunCounts[col.value]"
									class="text-caption text-purple ml-2 font-weight-medium">
									(Đã chạy {{ aiRunCounts[col.value] }} lần)
								</span>
							</v-list-item-title>
							<template v-slot:append>
								<v-chip v-if="col.isLocked" size="x-small" color="primary" variant="flat">Đã khóa
								</v-chip>
							</template>
						</v-list-item>
					</v-list>
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end ga-2 pa-3 flex-wrap">
					<v-btn variant="text" color="grey" @click="action.aiColumnDialog.show = false" size="small">Hủy
					</v-btn>

					<template v-if="hasSelectedRunBefore">
						<v-btn color="purple" variant="outlined" size="small"
							:disabled="action.aiColumnDialog.selectedColumns.length === 0"
							@click="onShowPreviousAiResult()">
							<v-icon start size="16">mdi-eye-outline</v-icon>
							Xem kết quả trước
						</v-btn>
						<v-btn color="purple" variant="flat" size="small"
							:disabled="action.aiColumnDialog.selectedColumns.length === 0"
							@click="onConfirmCheckCommentAI(true)">
							<v-icon start size="16">mdi-refresh</v-icon>
							Chạy lại AI
						</v-btn>
					</template>
					<template v-else>
						<v-btn color="purple" variant="flat" size="small"
							:disabled="action.aiColumnDialog.selectedColumns.length === 0"
							@click="onConfirmCheckCommentAI(false)">
							Xác nhận
						</v-btn>
					</template>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Mở Khóa Cột Điểm -->
		<v-dialog v-if="canManageUnlockColumns" v-model="action.unlockDialog.show" max-width="520" persistent>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon color="warning" size="22">mdi-lock-open-variant</v-icon>
					<span class="text-body-1 font-weight-bold">Mở khóa cột điểm</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pt-3 px-4 pb-2">
					<div class="text-body-2 text-medium-emphasis mb-3">
						Chọn các cột điểm cần mở khóa và nhập lý do.
					</div>

					<div class="d-flex align-center mb-1">
						<v-checkbox
							:model-value="action.unlockDialog.selectedColumns.length === lockedColumns.length && lockedColumns.length > 0"
							:indeterminate="action.unlockDialog.selectedColumns.length > 0 && action.unlockDialog.selectedColumns.length < lockedColumns.length"
							@update:model-value="onToggleSelectAllUnlockColumns" density="compact" hide-details
							color="warning">
							<template v-slot:label>
								<span class="text-body-2 font-weight-medium">Chọn tất cả cột đã khóa</span>
								<span class="text-caption text-medium-emphasis ml-2">({{
									action.unlockDialog.selectedColumns.length }}/{{ lockedColumns.length }})</span>
							</template>
						</v-checkbox>
					</div>

					<v-divider class="mb-1" />

					<v-list density="compact" class="rounded border pa-0 mb-3"
						style="max-height: 220px; overflow-y: auto;">
						<v-list-item v-for="(col, i) in lockedColumns" :key="col.value"
							:class="i < lockedColumns.length - 1 ? 'border-b' : ''" min-height="40"
							@click="onToggleUnlockColumn(col.value)">
							<template v-slot:prepend>
								<v-checkbox-btn :model-value="action.unlockDialog.selectedColumns.includes(col.value)"
									@update:model-value="onToggleUnlockColumn(col.value)" color="warning"
									density="compact" />
							</template>
							<v-list-item-title class="text-body-2">{{ col.title }}</v-list-item-title>
							<template v-slot:append>
								<v-chip size="x-small" color="primary" variant="flat">Đang khóa</v-chip>
							</template>
						</v-list-item>
					</v-list>

					<v-textarea v-model="action.unlockDialog.reason" label="Lý do mở khóa" rows="3" auto-grow
						placeholder="Nhập lý do mở khóa cột điểm..." hide-details="auto" />
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end ga-2 pa-3">
					<v-btn variant="text" color="grey" @click="action.unlockDialog.show = false">Hủy</v-btn>
					<v-btn color="warning" variant="flat" :disabled="action.unlockDialog.selectedColumns.length === 0"
						@click="onConfirmUnlockColumns">
						<v-icon start size="18">mdi-lock-open-variant</v-icon>
						Mở khóa {{ action.unlockDialog.selectedColumns.length }} cột
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Mẫu Nhận Xét -->
		<uc-dialog-mau-nhan-xet v-model="action.isShowDialogMauNhanXet" :filter="filter" :DSHocSinh="DSHocSinh"
			@onSubmit="onXacNhanMauNhanXet" />

		<!-- Dialog Kết quả Kiểm tra AI / Độ dài -->
		<v-dialog v-model="action.aiResultDialog.show" max-width="600" scrollable>
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon :color="action.aiResultDialog.title?.includes('AI') ? 'purple' : 'info'" size="22">
						{{ action.aiResultDialog.title?.includes('AI') ? 'mdi-robot-outline' :
						'mdi-text-box-search-outline' }}
					</v-icon>
					<span class="text-body-1 font-weight-bold">{{ action.aiResultDialog.title || 'Kết quả kiểm tra'
						}}</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pa-4" style="max-height: 450px;">
					<!-- Bộ lọc chỉ hiển thị vượt ký tự nếu là dialog độ dài -->
					<div v-if="action.aiResultDialog.title?.includes('giới hạn ký tự') && aiWarnings.some(w => w.type === 'limit' || w.type === 'limit_ok')"
						class="mb-2">
						<v-switch v-model="showOnlyLimitExceeded" label="Chỉ hiển thị học sinh vượt quá 400 ký tự"
							color="error" density="compact" hide-details />
					</div>

					<div v-if="filteredAiWarnings.length === 0"
						class="d-flex flex-column align-center justify-center py-6 text-medium-emphasis">
						<v-icon size="48" color="success" class="mb-2">mdi-check-decagram</v-icon>
						<p class="text-body-2 font-weight-bold text-success">Không phát hiện lỗi nào!</p>
						<p class="text-caption">
							{{ action.aiResultDialog.title?.includes('AI')
							? 'Tất cả nhận xét đều đúng chính tả và nằm trong giới hạn ký tự.'
							: (showOnlyLimitExceeded ? 'Không có học sinh nào vượt quá giới hạn 400 ký tự.' : 'Tất cả
							nhận xét đều hợp lệ và nằm trong giới hạn ký tự.') }}
						</p>
					</div>

					<v-list v-else density="compact" class="pa-0">
						<div v-for="(warning, index) in filteredAiWarnings" :key="index" class="mb-3 pb-3"
							:class="index < filteredAiWarnings.length - 1 ? 'border-b' : ''">
							<div class="d-flex align-center justify-space-between mb-1">
								<span class="text-body-2 font-weight-bold text-primary">
									Dòng {{ warning.rowNum }} — {{ warning.studentName }}
								</span>
								<v-chip size="x-small"
									:color="warning.type === 'limit' ? 'error' : (warning.type === 'limit_ok' ? 'success' : 'warning')"
									variant="tonal">
									{{ warning.type === 'limit' ? 'Vượt ký tự' : (warning.type === 'limit_ok' ? 'Còn
									lại: ' + warning.remainingCount + ' ký tự' : 'Lỗi chính tả/cú pháp') }}
								</v-chip>
							</div>

							<div class="text-caption text-medium-emphasis mb-1">
								<strong>Môn:</strong> {{ warning.subjectName }}
							</div>

							<!-- Nội dung nhận xét hiện tại -->
							<div class="text-caption bg-grey-lighten-4 pa-2 rounded mb-2 text-italic"
								style="white-space: pre-wrap;">
								"<span v-html="warning.currentHtml || warning.currentText"></span>"
							</div>

							<!-- Chi tiết lỗi / Gợi ý -->
							<div v-if="warning.type === 'limit'" class="text-caption text-error font-weight-medium">
								<v-icon size="14" class="mr-1" color="error">mdi-alert-circle-outline</v-icon>
								{{ warning.message }}
							</div>
							<div v-else-if="warning.type === 'limit_ok'"
								class="text-caption text-success font-weight-medium">
								<v-icon size="14" class="mr-1" color="success">mdi-check-circle-outline</v-icon>
								{{ warning.message }}
							</div>
							<div v-else class="text-caption">
								<div class="font-weight-medium text-warning mb-1">
									<v-icon size="14" class="mr-1" color="warning">mdi-alert-outline</v-icon>
									Phát hiện lỗi chính tả hoặc khoảng trắng:
								</div>
								<ul class="pl-4">
									<li v-for="(sug, sIdx) in warning.suggestions" :key="sIdx"
										class="text-caption text-medium-emphasis" style="white-space: pre-wrap;">
										{{ sug }}
									</li>
								</ul>
								<div
									class="mt-2 d-flex align-center justify-space-between flex-wrap ga-2 border-t pt-2">
									<div class="text-success font-weight-medium" style="white-space: pre-wrap;">
										Gợi ý sửa đổi: "<span
											v-html="warning.correctedHtml || warning.correctedText"></span>"
									</div>
									<v-btn v-if="!warning.applied" size="x-small" color="success" variant="tonal"
										@click="onApplyAiSuggestion(warning)">
										<v-icon start size="14">mdi-check-bold</v-icon>
										Áp dụng
									</v-btn>
									<span v-else
										class="text-caption text-success font-weight-bold d-flex align-center ga-1">
										<v-icon size="16">mdi-check-decagram</v-icon>
										Đã áp dụng
									</span>
								</div>
							</div>
						</div>
					</v-list>
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end pa-3 ga-2">

					<v-btn :color="action.aiResultDialog.title?.includes('AI') ? 'purple' : 'info'" variant="flat"
						size="small" @click="action.aiResultDialog.show = false">Đóng</v-btn>
					<v-btn v-if="hasSpellingWarningsToApply" color="success" variant="flat" size="small"
						@click="onApplyAllAiSuggestions">
						<v-icon start>mdi-check-all</v-icon>
						Áp dụng tất cả
					</v-btn>
					<v-btn v-if="aiWarnings.length > 0" color="success" variant="outlined" size="small"
						@click="onExportAiWarnings">
						<v-icon start>mdi-microsoft-excel</v-icon>
						Xuất Excel lỗi
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<!-- Dialog Xuất Excel nhiều lớp -->
		<v-dialog v-model="action.exportDialog.show" max-width="520">
			<v-card rounded="lg">
				<v-card-title class="d-flex align-center ga-2 pt-4 pb-2 px-4">
					<v-icon color="primary" size="22">mdi-table-multiple</v-icon>
					<span class="text-body-1 font-weight-bold">Xuất Excel nhiều lớp</span>
				</v-card-title>
				<v-divider />

				<v-card-text class="pt-3 px-4 pb-2">
					<div class="text-body-2 text-medium-emphasis mb-3">
						Xuất các lớp cùng môn {{ filter.MonHocItem?.TenMonHoc_HienThi || filter.MonHocItem?.MonHocName }}
						và cùng mã nhóm {{ filter.MaNhomCotDiemItem?.TenNhomCotDiem_VI }}.
					</div>
					<v-select v-model="action.exportDialog.selectedLopIDs" :items="exportableClasses"
						item-title="TenLop" item-value="LopID" label="Chọn lớp" multiple chips closable-chips
						variant="outlined" density="compact" hide-details="auto" />
				</v-card-text>

				<v-divider />
				<v-card-actions class="justify-end pa-3 ga-2">
					<v-btn variant="text" size="small" @click="action.exportDialog.show = false"
						:disabled="action.exportDialog.loading">Đóng</v-btn>
					<v-btn color="primary" variant="flat" size="small" @click="onExportManyClasses"
						:loading="action.exportDialog.loading">
						<v-icon start>mdi-microsoft-excel</v-icon>
						Xuất Excel
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

	</Global>
</template>

<script>
	export default {
		name: 'BangDiem',
		inject: ['snackbarRef', 'iframeRef', 'confirmRef'],

	props: {},

	data() {
		return {
			vueData,
			isCheckingAI: false,
			isCheckingLength: false,
			showOnlyLimitExceeded: false,

			action: {
				isShowDialogMauNhanXet: false,
				showAllLockedColumns: false,
				aiResultDialog: {
					show: false,
					title: 'Kết quả kiểm tra nhận xét bằng AI'
				},
				aiColumnDialog: {
					show: false,
					selectedColumns: []
				},
				lockDialog: {
					show: false,
					selectedColumns: []
				},
				unlockDialog: {
					show: false,
					selectedColumns: [],
					reason: ''
				},
				exportDialog: {
					show: false,
					selectedLopIDs: [],
					loading: false
				}
			},

			aiWarnings: [],
			aiCache: {},
			aiRunCounts: {},

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

		hasTextColumn() {
			return this.DSCotDiem_ByMaNhomCotDiem?.some(col => col.GiaTriCotDiem === 'text');
		},

		isCap1NangLucPhamChat() {
			const isCap1 = parseInt(this.vueData.CapID) === 1;
			const monHocID = this.filter.MonHocItem?.MonHocID;
			const mapMonHocToNhom = {
				20: 'Năng lực chung', 21: 'Năng lực chung', 22: 'Năng lực chung',
				28: 'Năng lực đặc thù', 29: 'Năng lực đặc thù', 30: 'Năng lực đặc thù',
				31: 'Năng lực đặc thù', 32: 'Năng lực đặc thù', 33: 'Năng lực đặc thù',
				34: 'Năng lực đặc thù',
				23: 'Phẩm chất', 24: 'Phẩm chất', 25: 'Phẩm chất', 26: 'Phẩm chất', 27: 'Phẩm chất'
			};
			return isCap1 && !!mapMonHocToNhom[monHocID];
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

		lockedColumns() {
			return this.displayColumns.filter(col => col.isLocked);
		},

		canManageUnlockColumns() {
			return this.vueData?.user?.UserID === 'NA0000022' || this.vueData?.user?.UserID === 'NV0000134';
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

		textColumns() {
			return this.DSCotDiem_ByMaNhomCotDiem?.filter(col => col.GiaTriCotDiem === 'text').map(col => {
				const matchedCol = this.displayColumns.find(d => d.value === col.value);
				return {
					title: matchedCol?.title || col.title,
					value: col.value,
					isLocked: matchedCol?.isLocked ?? false
				};
			}) || [];
		},

		suggestLockColumnSet() {
			return new Set(this.suggestLockColumns.map(c => c.value));
		},

		/** Danh sách cột chưa khóa (không phải công thức) — dùng cho onLockAllColumns */
		unlockedColumns() {
			return this.lockableColumns.filter(col => !col.isLocked);
		},

		hasSelectedRunBefore() {
			return this.action.aiColumnDialog.selectedColumns.some(colVal => 
				this.aiRunCounts && this.aiRunCounts[colVal] > 0
			);
		},

		exportableClasses() {
			return this.$refs.filterRef?.DSLop || [];
		},

		hasSpellingWarningsToApply() {
			return this.action.aiResultDialog.title?.includes('AI') && 
				this.aiWarnings?.some(w => w.type === 'spelling' && !w.applied);
		},
		filteredAiWarnings() {
			if (!this.aiWarnings) return [];
			if (this.action.aiResultDialog.title?.includes('giới hạn ký tự') && this.showOnlyLimitExceeded) {
				return this.aiWarnings.filter(w => w.type === 'limit');
			}
			return this.aiWarnings;
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
		showSnackbar(message, color = 'info') {
			if (this.snackbarRef?.value?.showSnackbar) {
				this.snackbarRef.value.showSnackbar({ message, color });
				return;
			}
			Vue.$toast[color]?.(message, { position: 'top' });
		},


		ensureUnlockPermission() {
			if (this.canManageUnlockColumns) return true;
			this.showSnackbar('Tính năng mở khóa cột điểm chỉ dành cho tài khoản NA.', 'warning');
			return false;
		},

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
				this.showSnackbar('Chưa có dữ liệu được lưu. Vui lòng lưu tạm trước khi khóa cột điểm!', 'warning');
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

		async ensureSavedBeforeLock() {
			if (!this.editedCells.length) return true;

			const shouldSave = await this.confirmRef.value.show({
				title: 'Bạn có muốn lưu dữ liệu trước khi khóa cột điểm không?'
			});

			if (!shouldSave) return false;

			try {
				const success = await BangDiemService.saveData(
					this.editedCells, this.DSHocSinh, this.DSHocSinh_API,
					this.freezeColumns, { ...this.filter, NienKhoa: this.vueData.NienKhoa },
					this.instance, this.vueData
				);
				if (!success) return false;

				await BangDiemService.saveDraft(this.filter, this.vueData);
				this.showSnackbar('Đã lưu dữ liệu trước khi khóa cột điểm!', 'success');
				await this.onRefresh();
				return true;
			} catch (error) {
				console.error('ensureSavedBeforeLock error:', error);
				this.showSnackbar('Có lỗi xảy ra khi lưu dữ liệu trước khi khóa cột điểm!', 'error');
				return false;
			}
		},

		async onConfirmLockColumns() {
			const selectedCols = this.lockableColumns.filter(col =>
				this.action.lockDialog.selectedColumns.includes(col.value)
			);
			if (!selectedCols.length) return;

			const canContinue = await this.ensureSavedBeforeLock();
			if (!canContinue) return;

			const nlpcIDList = this.filter.MonHocItem?.List_MonHoc_NLPC_ID
				? this.filter.MonHocItem.List_MonHoc_NLPC_ID.split(',').map(id => id.trim()).filter(Boolean)
				: [];

			this.action.lockDialog.show = false;

			try {
				await BangDiemService.lock.lockColumns(selectedCols, this.filter);
				if (nlpcIDList.length > 0) {
					await BangDiemService.lock.lockNLPCColumns(this.filter, this.vueData, this.DSHocSinh_API);
				}
				this.showSnackbar(
					nlpcIDList.length > 0
						? 'Đã khóa cột điểm và các môn Năng lực – Phẩm chất đi kèm!'
						: `Đã khóa ${selectedCols.length} cột điểm!`,
					'success'
				);
				await this.onRefresh();
			} catch (error) {
				console.error('onConfirmLockColumns error:', error);
				this.showSnackbar('Có lỗi xảy ra khi khóa cột điểm!', 'error');
			}
		},

		onOpenUnlockDialog() {
			if (!this.ensureUnlockPermission()) return;
			this.action.unlockDialog.selectedColumns = this.lockedColumns.map(col => col.value);
			this.action.unlockDialog.reason = '';
			this.action.unlockDialog.show = true;
		},

		onToggleSelectAllUnlockColumns(val) {
			if (val) {
				this.action.unlockDialog.selectedColumns = this.lockedColumns.map(col => col.value);
			} else {
				this.action.unlockDialog.selectedColumns = [];
			}
		},

		onToggleUnlockColumn(value) {
			const idx = this.action.unlockDialog.selectedColumns.indexOf(value);
			if (idx === -1) {
				this.action.unlockDialog.selectedColumns = [...this.action.unlockDialog.selectedColumns, value];
			} else {
				this.action.unlockDialog.selectedColumns = this.action.unlockDialog.selectedColumns.filter(v => v !== value);
			}
		},

		async onConfirmUnlockColumns() {
			if (!this.ensureUnlockPermission()) return;
			const selectedCols = this.lockedColumns.filter(col =>
				this.action.unlockDialog.selectedColumns.includes(col.value)
			);
			if (!selectedCols.length) return;

			const reason = (this.action.unlockDialog.reason || '').trim();
			if (!reason) {
				this.showSnackbar('Vui lòng nhập lý do mở khóa cột điểm!', 'warning');
				return;
			}

			this.action.unlockDialog.show = false;

			try {
				await BangDiemService.lock.unlockColumns(selectedCols, this.filter, reason);
				this.showSnackbar(`Đã mở khóa ${selectedCols.length} cột điểm!`, 'success');
				await this.onRefresh();
			} catch (error) {
				console.error('onConfirmUnlockColumns error:', error);
				this.showSnackbar('Có lỗi xảy ra khi mở khóa cột điểm!', 'error');
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
			this.aiWarnings = [];
			this.aiRunCounts = {};
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

				// Reset kết quả kiểm tra AI khi làm mới bảng điểm
				this.aiWarnings = [];
				this.aiRunCounts = {};

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
				this.showSnackbar('Có lỗi xảy ra khi tải dữ liệu!', 'error');
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
				this.showSnackbar('Lưu dữ liệu thành công!', 'success');
				await this.onRefresh();
			} catch (error) {
				console.error('onLuuTam error:', error);
				this.showSnackbar('Có lỗi xảy ra khi lưu dữ liệu!', 'error');
			}
		},

		async onLuuTamTatCa() {
			try {
				const allCells = [];
				this.DSHocSinh.forEach((student, rowIndex) => {
					this.DSCotDiem_ByMaNhomCotDiem.forEach((cotDiem, colIndex) => {
						if (student[cotDiem.value] != null && student[cotDiem.value] !== '') {
							allCells.push({ x: colIndex + this.freezeColumns, y: rowIndex, value: student[cotDiem.value] });
						}
					});
				});
				const success = await BangDiemService.saveData(
					allCells, this.DSHocSinh, this.DSHocSinh_API,
					this.freezeColumns, { ...this.filter, NienKhoa: this.vueData.NienKhoa },
					this.instance, this.vueData
				);
				if (!success) return;
				await BangDiemService.saveDraft(this.filter, this.vueData);
				this.showSnackbar('Lưu tất cả thành công!', 'success');
				await this.onRefresh();
			} catch (error) {
				console.error('onLuuTamTatCa error:', error);
				this.showSnackbar('Có lỗi xảy ra khi lưu dữ liệu!', 'error');
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
				this.showSnackbar('Gửi BGH thành công!', 'success');
				await this.onRefresh();
			} catch (error) {
				console.error('onGuiBGH error:', error);
				this.showSnackbar('Có lỗi xảy ra khi gửi BGH!', 'error');
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
				this.showSnackbar('Lấy điểm Test thành công!', 'success');
			} catch (error) {
				console.error('onGetDiemTest error:', error);
				this.showSnackbar('Có lỗi xảy ra!', 'error');
			}
		},

		onExportExcel() {
			try {
				const exportData = BangDiemService.export.prepareExportData(
					this.DSHocSinh, this.DSCotDiem_ByMaNhomCotDiem, this.instance, this.freezeColumns, this.filter, this.DSHocSinh_API
				);
				const fileName = `Bang_Diem_Lop_${this.filter.LopItem.TenLop}_${this.filter.MonHocItem.MonHocName}.xlsx`;
				BangDiemService.export.exportExcel(this.headers, exportData, fileName);
				this.showSnackbar('Xuất Excel thành công!', 'success');
			} catch (error) {
				console.error('onExportExcel error:', error);
				this.showSnackbar('Có lỗi xảy ra khi xuất Excel!', 'error');
			}
		},

		onOpenExportManyClassesDialog() {
			if (!this.filter.KhoiItem || !this.filter.LopItem || !this.filter.MonHocItem || !this.filter.MaNhomCotDiemItem) {
				this.showSnackbar('Vui lòng chọn đủ khối, lớp, môn học và mã nhóm trước khi xuất Excel!', 'warning');
				return;
			}
			const currentLopID = this.filter.LopItem?.LopID;
			this.action.exportDialog.selectedLopIDs = currentLopID ? [currentLopID] : [];
			this.action.exportDialog.show = true;
		},

		async onExportManyClasses() {
			const selectedLopIDs = this.action.exportDialog.selectedLopIDs || [];
			if (!selectedLopIDs.length) {
				this.showSnackbar('Vui lòng chọn ít nhất một lớp!', 'warning');
				return;
			}

			this.action.exportDialog.loading = true;
			try {
				const sheets = [];
				for (const lopID of selectedLopIDs) {
					const lopItem = this.exportableClasses.find(x => String(x.LopID) === String(lopID));
					if (!lopItem) continue;

					// Lấy thông tin MonHocItem cho lớp này để có MonHocLopID và TemplateBangDiemID chính xác
					const listMonHoc = await ajaxCALLPromise("lms/MonHoc_Get_ByLopID", {
						NienKhoa: this.vueData.NienKhoa,
						HocKi: this.vueData.NienKhoaItem.HocKi,
						LopID: lopID
					});
					const targetMonHocID = this.filter.MonHocItem?.MonHocID;
					const lopMonHocItem = listMonHoc?.find(x => x.MonHocID === targetMonHocID);
					if (!lopMonHocItem) continue;

					const exportFilter = {
						...this.filter,
						LopItem: lopItem,
						MonHocItem: lopMonHocItem
					};
					const result = await BangDiemService.initialize(exportFilter, this.vueData);
					if (!result.students?.length) continue;

					const exportData = BangDiemService.export.prepareExportData(
						result.students,
						result.DSCotDiem_ByMaNhomCotDiem,
						null,
						result.freezeColumns,
						exportFilter,
						result.apiData
					);
					sheets.push({
						name: lopItem.TenLop,
						headers: result.headers,
						data: exportData
					});
				}

				if (!sheets.length) {
					this.showSnackbar('Không có dữ liệu để xuất ở các lớp đã chọn!', 'warning');
					return;
				}

				const monName = this.filter.MonHocItem?.TenMonHoc_HienThi || this.filter.MonHocItem?.MonHocName || 'MonHoc';
				const maNhom = this.filter.MaNhomCotDiemItem?.MaNhomCotDiem || 'Nhom';
				const fileName = `Bang_Diem_${monName}_${maNhom}_${sheets.length}_Lop.xlsx`;
				BangDiemService.export.exportWorkbook(sheets, fileName);
				this.action.exportDialog.show = false;
				this.showSnackbar(`Xuất Excel ${sheets.length} lớp thành công!`, 'success');
			} catch (error) {
				console.error('onExportManyClasses error:', error);
				this.showSnackbar('Có lỗi xảy ra khi xuất Excel nhiều lớp!', 'error');
			} finally {
				this.action.exportDialog.loading = false;
			}
		},

		onExportAiWarnings() {
			try {
				if (!this.aiWarnings?.length) return;
				
				const headers = [
					'Dòng',
					'Mã học sinh',
					'Học sinh',
					'Môn/Cột điểm',
					'Loại lỗi',
					'Nhận xét hiện tại',
					'Chi tiết lỗi / Cảnh báo',
					'Nhận xét đề xuất sửa'
				];
				
				const dataRows = this.aiWarnings.map(w => {
					const errorType = w.type === 'limit' ? 'Vượt ký tự' : 'Lỗi chính tả/cú pháp';
					const details = w.type === 'limit' 
						? w.message 
						: (w.suggestions || []).join('; ');
					
					return [
						w.rowNum,
						w.studentId || '',
						w.studentName,
						w.subjectName,
						errorType,
						w.currentText,
						details,
						w.correctedText || ''
					];
				});
				
				const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
				
				worksheet['!cols'] = [
					{ wch: 8 },   // Dòng
					{ wch: 15 },  // Mã học sinh
					{ wch: 25 },  // Học sinh
					{ wch: 20 },  // Môn
					{ wch: 15 },  // Loại lỗi
					{ wch: 45 },  // Nhận xét hiện tại
					{ wch: 50 },  // Chi tiết lỗi
					{ wch: 45 }   // Nhận xét đề xuất
				];
				
				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo lỗi nhận xét');
				
				const lopName = this.filter.LopItem?.TenLop || 'Lop';
				const monName = this.filter.MonHocItem?.MonHocName || 'MonHoc';
				const checkType = this.action.aiResultDialog.title?.includes('AI') ? 'AI' : 'DoDai';
				const fileName = `Bao_Cao_Loi_Nhan_Xet_${checkType}_${lopName}_${monName}.xlsx`;
				
				XLSX.writeFile(workbook, fileName);
				this.showSnackbar('Xuất file Excel báo cáo lỗi thành công!', 'success');
			} catch (error) {
				console.error('onExportAiWarnings error:', error);
				this.showSnackbar('Có lỗi xảy ra khi xuất file Excel!', 'error');
			}
		},

		parseHtmlTags(htmlString) {
			if (!htmlString) return '';
			try {
				const parser = new DOMParser();
				const doc = parser.parseFromString(`<body>${htmlString}</body>`, 'text/html');
				const root = doc.body;

				const transform = (node) => {
					if (node.nodeType === 3) { // TEXT_NODE
						const span = document.createElement('span');
						span.textContent = node.textContent;
						return span;
					}

					if (node.nodeType === 1) { // ELEMENT_NODE
						const tagName = node.tagName.toLowerCase();
						const wrapper = document.createElement('span');
						const text = node.textContent || '';
						const isSpaceOnly = text.trim() === '' && text.length > 0;

						if (tagName === 'del') {
							if (isSpaceOnly) {
								wrapper.className = 'bg-red-lighten-3 text-red-darken-4 font-weight-bold';
								wrapper.style.backgroundColor = '#ff8a80';
								wrapper.style.color = '#b71c1c';
								wrapper.style.textDecoration = 'underline';
								wrapper.style.textUnderlineOffset = '4px';
								wrapper.style.padding = '0 4px';
								wrapper.style.borderRadius = '2px';
								wrapper.innerHTML = '&nbsp;'.repeat(text.length);
							} else {
								wrapper.className = 'bg-red-lighten-4 text-red-darken-4 font-weight-bold';
								wrapper.style.backgroundColor = '#ffcdd2';
								wrapper.style.color = '#b71c1c';
								wrapper.style.textDecoration = 'line-through';
								wrapper.style.padding = '0 2px';
								wrapper.style.borderRadius = '2px';
								Array.from(node.childNodes).forEach(child => {
									wrapper.appendChild(transform(child));
								});
							}
						} else if (tagName === 'ins') {
							if (isSpaceOnly) {
								wrapper.className = 'bg-green-lighten-3 text-green-darken-4 font-weight-bold';
								wrapper.style.backgroundColor = '#b9f6ca';
								wrapper.style.color = '#1b5e20';
								wrapper.style.padding = '0 4px';
								wrapper.style.borderRadius = '2px';
								wrapper.innerHTML = '&nbsp;'.repeat(text.length);
							} else {
								wrapper.className = 'bg-green-lighten-4 text-green-darken-4 font-weight-bold';
								wrapper.style.backgroundColor = '#c8e6c9';
								wrapper.style.color = '#1b5e20';
								wrapper.style.padding = '0 2px';
								wrapper.style.borderRadius = '2px';
								Array.from(node.childNodes).forEach(child => {
									wrapper.appendChild(transform(child));
								});
							}
						} else {
							Array.from(node.childNodes).forEach(child => {
								wrapper.appendChild(transform(child));
							});
						}
						return wrapper;
					}

					return document.createTextNode('');
				};

				const container = document.createElement('div');
				Array.from(root.childNodes).forEach(child => {
					container.appendChild(transform(child));
				});
				return container.innerHTML;
			} catch (e) {
				console.error('Lỗi khi phân tích HTML bằng DOMParser:', e);
				return htmlString;
			}
		},

		getDiffMarkup(oldStr, newStr) {
			if (!oldStr) return { oldHtml: '', newHtml: '' };
			if (!newStr) return { oldHtml: oldStr, newHtml: '' };

			const dp = Array(oldStr.length + 1).fill(null).map(() => Array(newStr.length + 1).fill(0));
			for (let i = 1; i <= oldStr.length; i++) {
				for (let j = 1; j <= newStr.length; j++) {
					if (oldStr[i - 1] === newStr[j - 1]) {
						dp[i][j] = dp[i - 1][j - 1] + 1;
					} else {
						dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
					}
				}
			}

			let i = oldStr.length;
			let j = newStr.length;
			const diff = [];

			while (i > 0 || j > 0) {
				if (i > 0 && j > 0 && oldStr[i - 1] === newStr[j - 1]) {
					diff.push({ type: 'common', value: oldStr[i - 1] });
					i--;
					j--;
				} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
					diff.push({ type: 'added', value: newStr[j - 1] });
					j--;
				} else {
					diff.push({ type: 'removed', value: oldStr[i - 1] });
					i--;
				}
			}
			diff.reverse();

			const escapeHtml = (str) => {
				return str
					.split('&').join('&amp;')
					.split('<').join('&lt;')
					.split('>').join('&gt;')
					.split('"').join('&quot;')
					.split("'").join('&#039;');
			};

			let oldHtml = '';
			let newHtml = '';

			diff.forEach(part => {
				const escapedValue = escapeHtml(part.value);
				if (part.type === 'common') {
					oldHtml += escapedValue;
					newHtml += escapedValue;
				} else if (part.type === 'removed') {
					if (part.value === ' ') {
						oldHtml += `<span class="bg-red-lighten-3 text-red-darken-4 font-weight-bold" style="background-color: #ff8a80; color: #b71c1c; text-decoration: underline; text-underline-offset: 4px; padding: 0 4px; border-radius: 2px;">&nbsp;</span>`;
					} else {
						oldHtml += `<span class="bg-red-lighten-4 text-red-darken-4 font-weight-bold" style="background-color: #ffcdd2; color: #b71c1c; text-decoration: line-through; padding: 0 2px; border-radius: 2px;">${escapedValue}</span>`;
					}
				} else if (part.type === 'added') {
					if (part.value === ' ') {
						newHtml += `<span class="bg-green-lighten-3 text-green-darken-4 font-weight-bold" style="background-color: #b9f6ca; color: #1b5e20; padding: 0 4px; border-radius: 2px;">&nbsp;</span>`;
					} else {
						newHtml += `<span class="bg-green-lighten-4 text-green-darken-4 font-weight-bold" style="background-color: #c8e6c9; color: #1b5e20; padding: 0 2px; border-radius: 2px;">${escapedValue}</span>`;
					}
				}
			});

			return { oldHtml, newHtml };
		},

		onCheckCommentAI() {
			if (this.isDisabled || !this.hasStudents) return;
			this.action.aiColumnDialog.selectedColumns = this.textColumns
				.filter(col => !col.isLocked)
				.map(col => col.value);
			this.action.aiColumnDialog.show = true;
		},

		onToggleAiColumn(value) {
			const col = this.textColumns.find(c => c.value === value);
			if (col?.isLocked) return;
			const idx = this.action.aiColumnDialog.selectedColumns.indexOf(value);
			if (idx === -1) {
				this.action.aiColumnDialog.selectedColumns = [...this.action.aiColumnDialog.selectedColumns, value];
			} else {
				this.action.aiColumnDialog.selectedColumns = this.action.aiColumnDialog.selectedColumns.filter(v => v !== value);
			}
		},

		onApplyAiSuggestion(warning) {
			try {
				const rowIndex = warning.rowNum - 1;
				const colIndex = this.headers.findIndex(h => h.name === warning.colValue);
				if (colIndex !== -1 && this.instance) {
					const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance;
					if (sheet && typeof sheet.setValueFromCoords === 'function') {
						sheet.setValueFromCoords(colIndex, rowIndex, warning.correctedText);
						warning.applied = true;
						this.showSnackbar('Đã áp dụng nhận xét sửa đổi!', 'success');
					} else {
						this.showSnackbar('Không thể áp dụng nhận xét (bảng điểm chưa sẵn sàng)!', 'warning');
					}
				} else {
					this.showSnackbar('Không tìm thấy ô điểm tương ứng trên bảng!', 'warning');
				}
			} catch (err) {
				console.error('onApplyAiSuggestion error:', err);
				this.showSnackbar('Có lỗi xảy ra khi áp dụng nhận xét.', 'error');
			}
		},

		onApplyAllAiSuggestions() {
			try {
				if (!this.aiWarnings || this.aiWarnings.length === 0) {
					this.showSnackbar('Không có gợi ý nào để áp dụng!', 'warning');
					return;
				}
				if (!this.instance) {
					this.showSnackbar('Bảng điểm chưa sẵn sàng!', 'warning');
					return;
				}
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance;
				if (!sheet || typeof sheet.setValueFromCoords !== 'function') {
					this.showSnackbar('Không thể áp dụng nhận xét (bảng điểm chưa sẵn sàng)!', 'warning');
					return;
				}
				let count = 0;
				this.aiWarnings.forEach(warning => {
					if (warning.type === 'spelling' && !warning.applied) {
						const rowIndex = warning.rowNum - 1;
						const colIndex = this.headers.findIndex(h => h.name === warning.colValue);
						if (colIndex !== -1) {
							sheet.setValueFromCoords(colIndex, rowIndex, warning.correctedText);
							warning.applied = true;
							count++;
						}
					}
				});
				if (count > 0) {
					this.showSnackbar(`Đã áp dụng thành công ${count} nhận xét sửa đổi!`, 'success');
				} else {
					this.showSnackbar('Không có nhận xét mới nào cần áp dụng!', 'info');
				}
			} catch (err) {
				console.error('onApplyAllAiSuggestions error:', err);
				this.showSnackbar('Có lỗi xảy ra khi áp dụng tất cả nhận xét.', 'error');
			}
		},

		onShowPreviousAiResult() {
			this.action.aiColumnDialog.show = false;
			if (this.aiWarnings && this.aiWarnings.length > 0 && this.instance) {
				const sheet = Array.isArray(this.instance) ? this.instance[0] : this.instance;
				if (sheet) {
					this.aiWarnings.forEach(warning => {
						if (warning.type === 'spelling') {
							const rowIndex = warning.rowNum - 1;
							const colIndex = this.headers.findIndex(h => h.name === warning.colValue);
							if (colIndex !== -1) {
								const currentValue = sheet.getValueFromCoords(colIndex, rowIndex) || '';
								const trimmedCurrent = currentValue.trim();
								if (trimmedCurrent === warning.correctedText.trim()) {
									warning.applied = true;
								}
							}
						}
					});
				}
			}
			this.action.aiResultDialog.title = 'Kết quả kiểm tra nhận xét bằng AI';
			this.action.aiResultDialog.show = true;
		},


		async onConfirmCheckCommentAI(forceRefresh = false) {
			this.action.aiColumnDialog.show = false;
			this.aiWarnings = [];
			this.isCheckingAI = true;

			// 1. Tải nhận xét cấp 1 liên quan nếu cần
			let allComments = [];
			const isCap1 = parseInt(this.vueData.CapID) === 1;
			const lopID = this.filter.LopItem?.LopID;
			const nienKhoa = this.vueData.NienKhoa;
			const maNhom = this.filter.MaNhomCotDiemItem?.MaNhomCotDiem || '';

			let hocKi = '';
			if (maNhom.includes('GK_HK1')) hocKi = 'GK_HK1';
			else if (maNhom.includes('CK_HK1')) hocKi = 'CK_HK1';
			else if (maNhom.includes('GK_HK2')) hocKi = 'GK_HK2';
			else if (maNhom.includes('CK_HK2')) hocKi = 'CK_HK2';

			const mapMonHocToNhom = {
				20: 'Năng lực chung', 21: 'Năng lực chung', 22: 'Năng lực chung',
				28: 'Năng lực đặc thù', 29: 'Năng lực đặc thù', 30: 'Năng lực đặc thù',
				31: 'Năng lực đặc thù', 32: 'Năng lực đặc thù', 33: 'Năng lực đặc thù',
				34: 'Năng lực đặc thù',
				23: 'Phẩm chất', 24: 'Phẩm chất', 25: 'Phẩm chất', 26: 'Phẩm chất', 27: 'Phẩm chất'
			};
			const mapMonHocToTenMon = {
				20: 'Tự chủ và tự học', 21: 'Giao tiếp và hợp tác', 22: 'Giải quyết vấn đề và sáng tạo',
				28: 'Ngôn ngữ', 29: 'Tính toán', 30: 'Khoa học', 31: 'Công nghệ', 32: 'Tin học',
				33: 'Thẩm mĩ', 34: 'Thể chất',
				23: 'Yêu nước', 24: 'Nhân ái', 25: 'Chăm chỉ', 26: 'Trung thực', 27: 'Trách nhiệm'
			};

			const monHocID = this.filter.MonHocItem?.MonHocID;
			const nhomNhanXet = mapMonHocToNhom[monHocID];
			const currentTenMon = mapMonHocToTenMon[monHocID];

			try {
				if (isCap1 && lopID && nienKhoa && hocKi && nhomNhanXet) {
					try {
						const resComments = await ajaxCALLPromise('lms/BaoCao_ThongKe_NhanXet_Cap1', {
							LopID: String(lopID),
							NienKhoa: nienKhoa,
							HocKi: hocKi
						});
						allComments = Array.isArray(resComments) ? resComments : [];
					} catch (err) {
						console.error('Lỗi khi tải nhận xét cấp 1 liên quan:', err);
					}
				}

				// 2. Thu thập và kiểm tra độ dài cục bộ / tổng nhóm
				const commentsToCheck = [];
				const localWarnings = [];

				this.DSHocSinh.forEach((student, rowIndex) => {
					this.DSCotDiem_ByMaNhomCotDiem.forEach((col) => {
						if (col.GiaTriCotDiem === 'text' && this.action.aiColumnDialog.selectedColumns.includes(col.value)) {
							const textValue = student[col.value] || '';
							const trimmedValue = textValue.trim();

							if (isCap1 && nhomNhanXet) {
								const otherComments = allComments
									.filter(x => x.HocSinhID === student.HocSinhID && x.NhomNhanXet === nhomNhanXet && x.TenMon !== currentTenMon)
									.map(x => x.NhanXet || '')
									.filter(Boolean);
								
								const otherLength = otherComments.reduce((sum, c) => sum + c.trim().length, 0);
								const totalLength = trimmedValue.length + otherLength;

								if (totalLength > 400) {
									localWarnings.push({
										rowNum: rowIndex + 1,
										studentId: student.HocSinhID,
										studentName: student.HoVaTenHocSinh,
										subjectName: col.title,
										type: 'limit',
										currentText: trimmedValue || '(Trống)',
										message: `Tổng nhận xét nhóm [${nhomNhanXet}] là ${totalLength} ký tự, vượt quá giới hạn 400 ký tự (Độ dài các môn khác cùng nhóm là ${otherLength} ký tự).`
									});
								}
							}

							if (trimmedValue) {
								const normKey = trimmedValue.normalize('NFC');
								if (!forceRefresh && this.aiCache && this.aiCache[normKey] !== undefined) {
									const cachedResult = this.aiCache[normKey];
									if (cachedResult.hasError) {
										if (!cachedResult.currentHtml || !cachedResult.correctedHtml) {
											const diff = this.getDiffMarkup(trimmedValue, cachedResult.correctedText || '');
											cachedResult.currentHtml = diff.oldHtml;
											cachedResult.correctedHtml = diff.newHtml;
										}
										localWarnings.push({
											rowNum: rowIndex + 1,
											colValue: col.value,
											studentId: student.HocSinhID,
											studentName: student.HoVaTenHocSinh,
											subjectName: col.title,
											type: 'spelling',
											currentText: trimmedValue,
											currentHtml: cachedResult.currentHtml,
											correctedHtml: cachedResult.correctedHtml,
											suggestions: cachedResult.suggestions || [],
											correctedText: cachedResult.correctedText || ''
										});
									}
								} else {
									commentsToCheck.push({
										id: `${rowIndex}_${col.value}`,
										text: trimmedValue,
										studentName: student.HoVaTenHocSinh,
										subjectTitle: col.title,
										colValue: col.value
									});
								}
							}
						}
					});
				});

				this.aiWarnings = [...localWarnings];

				// 3. Gửi AI kiểm tra chính tả/khoảng trắng
				if (commentsToCheck.length > 0) {
					const response = await ajaxCALLPromise('lms/CallGeminiAPI', {
						Prompt: `
						Bạn là một trợ lý AI chuyên phát hiện lỗi chính tả, khoảng trắng thừa, dấu câu và lỗi cú pháp tiếng Việt trong nhận xét của học sinh. Bạn sẽ nhận được đầu vào là một mảng JSON gồm các đối tượng có dạng { "id": "tọa độ", "text": "nhận xét" }.

Nhiệm vụ của bạn:
1. Phân tích chuỗi nhận xét trong trường "text" để phát hiện các lỗi chính tả, khoảng trắng không đều, thiếu dấu câu hoặc viết hoa tùy tiện.

2. Quy tắc bắt buộc về Tổ hợp Vần (Chuẩn đặt dấu thanh cũ - Hoà / Quý):
  - Hệ thống quy định bắt buộc dùng kiểu đặt dấu cũ (dấu trên 'o' và 'u'). Gặp kiểu dấu mới (dấu trên 'a' và 'y') phải coi là LỖI CHÍNH TẢ và bắt buộc phải sửa đổi.
  - Danh sách sửa đổi bắt buộc cho nhóm vần OA/UY/OE/UÊ/UYA:
    + "òa, óa, ỏa, õa, họa" phải sửa thành "oà, oá, oả, oã, hoạ" (dấu đặt trên o).
    + "uỳ, uý, uỷ, uỹ, uỵ" phải sửa thành "ùy, úy, ủy, ũy, ụy" (dấu đặt trên u).
    + "òe, óe, ỏe, õe, ọe" phải sửa thành "oè, oé, oẻ, oẽ, oẹ" (dấu đặt trên o).
    + "uề, uế, uể, uễ, uệ" phải sửa thành "ùe, úe, ủe, ũe, ụe" (dấu đặt trên u).
  - Đồng thời, phát hiện các lỗi đặt dấu sai cấu trúc vần nghiêm trọng khác như: "hoạitử" -> "hoại tử", "húong" -> "hướng", "tìen" -> "tiền".
  - Không báo lỗi nếu sự khác biệt chỉ ở mức encoding Unicode nội bộ (NFD/NFC) mà không ảnh hưởng đến hiển thị hay nghĩa của văn bản. Chỉ báo lỗi khi sự sai khác có thể nhìn thấy bằng mắt thường.

3. Trả về kết quả dưới dạng một mảng JSON chứa các đối tượng có cấu trúc chính xác như sau:
  - "id": giữ nguyên id nhận vào.
  - "hasError": true nếu phát hiện lỗi (bao gồm lỗi đặt dấu kiểu mới như òa, úy), false nếu nhận xét hoàn toàn chính xác.
  - "suggestions": danh sách các chuỗi mô tả lỗi phát hiện được (ví dụ: ["Sai chính tả: hòa -> hoà", "Sai chính tả: quý -> qúy", "Khoảng trắng thừa: học  tốt -> học tốt"]). Nếu không có lỗi, đặt là mảng rỗng.
  - "correctedText": chuỗi nhận xét đầy đủ sau khi đã sửa toàn bộ các lỗi trên theo đúng chuẩn bắt buộc (hoà, qúy). Nếu không có lỗi, giữ nguyên nguyên văn chuỗi "text" đầu vào.
  - "currentHtml": chuỗi nhận xét gốc "text" ban đầu nhưng những ký tự/khoảng trắng bị sai hoặc thừa được bọc trong cặp thẻ <del>...</del> (ví dụ: nếu sai chữ "hòa" thì bọc <del>hòa</del>). Nếu không có lỗi, giữ nguyên nguyên văn chuỗi "text" đầu vào.
  - "correctedHtml": chuỗi nhận xét đã sửa "correctedText" nhưng những ký tự/khoảng trắng được thêm mới hoặc sửa đổi được bọc trong cặp thẻ <ins>...</ins> (ví dụ: sửa thành "hoà" thì bọc <ins>hoà</ins>). Nếu không có lỗi, giữ nguyên nguyên văn chuỗi "text" đầu vào.

Tuyệt đối không thêm bớt trường, không giải thích hay trả về bất kỳ văn bản nào khác ngoài mảng JSON đó. Không viết hoa/xuống dòng dư thừa làm hỏng định dạng JSON.

						`,
						Content: JSON.stringify(commentsToCheck.map(c => ({ id: c.id, text: c.text })))
					});

					const resultData = Array.isArray(response) ? response[0] : response;
					if (resultData && resultData.Status === 'OK') {
						let cleanText = resultData.CleanResponse;
						if (!cleanText && resultData.RawResponse) {
							try {
								const rawObj = JSON.parse(resultData.RawResponse);
								const parts = rawObj.candidates?.[0]?.content?.parts;
								if (Array.isArray(parts)) {
									for (let i = parts.length - 1; i >= 0; i--) {
										const txt = parts[i]?.text;
										if (txt && txt.trim()) {
											cleanText = txt;
											break;
										}
									}
								}
							} catch (e) {
								console.error('Lỗi khi phân tách RawResponse:', e);
							}
						}

						if (cleanText) {
							cleanText = cleanText.split('```json').join('').split('```').join('').trim();
							const correctedComments = JSON.parse(cleanText);

							if (Array.isArray(correctedComments)) {
								correctedComments.forEach(item => {
									const colInfo = commentsToCheck.find(c => c.id === item.id);
									
									// Chuẩn hóa Unicode NFC để bỏ qua các sai khác vô hình về mặt mã hóa (ví dụ: cần vs cần)
									const rawText = colInfo ? colInfo.text : '';
									const corrText = item.correctedText || '';
									if (rawText.normalize('NFC') === corrText.normalize('NFC')) {
										item.hasError = false;
									}

									let currentHtmlParsed = '';
									let correctedHtmlParsed = '';

									if (item.currentHtml && item.correctedHtml) {
										currentHtmlParsed = this.parseHtmlTags(item.currentHtml);
										correctedHtmlParsed = this.parseHtmlTags(item.correctedHtml);
									} else {
										// Fallback: nếu AI không trả về tag (hoặc do cache server cũ), client tự chạy thuật toán so sánh làm nổi bật
										const diff = this.getDiffMarkup(colInfo ? colInfo.text : '', item.correctedText || '');
										currentHtmlParsed = diff.oldHtml;
										correctedHtmlParsed = diff.newHtml;
									}

									if (colInfo) {
										if (!this.aiCache) {
											this.aiCache = {};
										}
										const normKey = colInfo.text.normalize('NFC');
										this.aiCache[normKey] = {
											hasError: !!item.hasError,
											suggestions: item.suggestions || [],
											correctedText: item.correctedText || '',
											currentHtml: currentHtmlParsed,
											correctedHtml: correctedHtmlParsed
										};
									}

									if (item.hasError) {
										const parts = item.id.split('_');
										const rowIndex = parseInt(parts[0]);
										const colName = parts[1];
										const student = this.DSHocSinh[rowIndex];

										this.aiWarnings.push({
											rowNum: rowIndex + 1,
											colValue: colInfo ? colInfo.colValue : '',
											studentId: student ? student.HocSinhID : '',
											studentName: student ? student.HoVaTenHocSinh : 'Học sinh',
											subjectName: colInfo ? colInfo.subjectTitle : 'Môn',
											type: 'spelling',
											currentText: colInfo ? colInfo.text : '',
											currentHtml: currentHtmlParsed,
											correctedHtml: correctedHtmlParsed,
											suggestions: item.suggestions || [],
											correctedText: item.correctedText || ''
										});
									}
								});
							}
						}
					} else {
						const errMsg = resultData?.ErrorMessage || 'Lỗi gọi hệ thống AI';
						this.showSnackbar(errMsg, 'error');
						return;
					}

					// Tăng số lần chạy cho các cột được chọn có gọi API
					const newCounts = { ...this.aiRunCounts };
					this.action.aiColumnDialog.selectedColumns.forEach(colVal => {
						newCounts[colVal] = (newCounts[colVal] || 0) + 1;
					});
					this.aiRunCounts = newCounts;
				}

				// Sắp xếp cảnh báo theo số dòng tăng dần
				this.aiWarnings.sort((a, b) => a.rowNum - b.rowNum);
				
				// Hiển thị dialog kết quả
				this.action.aiResultDialog.title = 'Kết quả kiểm tra nhận xét bằng AI';
				this.action.aiResultDialog.show = true;
			} catch (error) {
				console.error('onCheckCommentAI error:', error);
				this.showSnackbar('Có lỗi xảy ra khi gọi AI kiểm tra nhận xét.', 'error');
			} finally {
				this.isCheckingAI = false;
			}
		},

		async onCheckCommentLength() {
			if (this.isDisabled || !this.hasStudents) return;

			this.aiWarnings = [];
			this.showOnlyLimitExceeded = false;

			const isCap1 = parseInt(this.vueData.CapID) === 1;
			const lopID = this.filter.LopItem?.LopID;
			const nienKhoa = this.vueData.NienKhoa;
			const maNhom = this.filter.MaNhomCotDiemItem?.MaNhomCotDiem || '';

			if (!isCap1 || !lopID) {
				this.showSnackbar('Tính năng này chỉ hỗ trợ kiểm tra nhận xét cho học sinh Tiểu học (Cấp 1).', 'warning');
				return;
			}

			let hocKi = '';
			if (maNhom.includes('GK_HK1')) hocKi = 'GK_HK1';
			else if (maNhom.includes('CK_HK1')) hocKi = 'CK_HK1';
			else if (maNhom.includes('GK_HK2')) hocKi = 'GK_HK2';
			else if (maNhom.includes('CK_HK2')) hocKi = 'CK_HK2';

			const mapMonHocToNhom = {
				20: 'Năng lực chung', 21: 'Năng lực chung', 22: 'Năng lực chung',
				28: 'Năng lực đặc thù', 29: 'Năng lực đặc thù', 30: 'Năng lực đặc thù',
				31: 'Năng lực đặc thù', 32: 'Năng lực đặc thù', 33: 'Năng lực đặc thù',
				34: 'Năng lực đặc thù',
				23: 'Phẩm chất', 24: 'Phẩm chất', 25: 'Phẩm chất', 26: 'Phẩm chất', 27: 'Phẩm chất'
			};
			const mapMonHocToTenMon = {
				20: 'Tự chủ và tự học', 21: 'Giao tiếp và hợp tác', 22: 'Giải quyết vấn đề và sáng tạo',
				28: 'Ngôn ngữ', 29: 'Tính toán', 30: 'Khoa học', 31: 'Công nghệ', 32: 'Tin học',
				33: 'Thẩm mĩ', 34: 'Thể chất',
				23: 'Yêu nước', 24: 'Nhân ái', 25: 'Chăm chỉ', 26: 'Trung thực', 27: 'Trách nhiệm'
			};

			const monHocID = this.filter.MonHocItem?.MonHocID;
			const nhomNhanXet = mapMonHocToNhom[monHocID];
			const currentTenMon = mapMonHocToTenMon[monHocID];

			if (!nhomNhanXet) {
				this.showSnackbar('Tính năng này chỉ áp dụng cho các môn Năng lực hoặc Phẩm chất.', 'warning');
				return;
			}

			this.isCheckingLength = true;
			try {
				let allComments = [];
				if (lopID && nienKhoa && hocKi) {
					try {
						const resComments = await ajaxCALLPromise('lms/BaoCao_ThongKe_NhanXet_Cap1', {
							LopID: String(lopID),
							NienKhoa: nienKhoa,
							HocKi: hocKi
						});
						allComments = Array.isArray(resComments) ? resComments : [];
					} catch (err) {
						console.error('Lỗi khi tải nhận xét cấp 1 liên quan:', err);
					}
				}

				const localWarnings = [];

				this.DSHocSinh.forEach((student, rowIndex) => {
					this.DSCotDiem_ByMaNhomCotDiem.forEach((col) => {
						if (col.GiaTriCotDiem === 'text') {
							const textValue = student[col.value] || '';
							const trimmedValue = textValue.trim();

							const otherComments = allComments
								.filter(x => x.HocSinhID === student.HocSinhID && x.NhomNhanXet === nhomNhanXet && x.TenMon !== currentTenMon)
								.map(x => x.NhanXet || '')
								.filter(Boolean);
							
							const otherLength = otherComments.reduce((sum, c) => sum + c.trim().length, 0);
							const totalLength = trimmedValue.length + otherLength;

							if (totalLength > 400) {
								localWarnings.push({
									rowNum: rowIndex + 1,
									studentId: student.HocSinhID,
									studentName: student.HoVaTenHocSinh,
									subjectName: col.title,
									type: 'limit',
									currentText: trimmedValue || '(Trống)',
									message: `Tổng nhận xét nhóm [${nhomNhanXet}] là ${totalLength} ký tự, vượt quá giới hạn 400 ký tự (Độ dài các môn khác cùng nhóm là ${otherLength} ký tự).`
								});
							} else if (totalLength > 0) {
								localWarnings.push({
									rowNum: rowIndex + 1,
									studentId: student.HocSinhID,
									studentName: student.HoVaTenHocSinh,
									subjectName: col.title,
									type: 'limit_ok',
									remainingCount: 400 - totalLength,
									currentText: trimmedValue || '(Trống)',
									message: `Tổng nhận xét nhóm [${nhomNhanXet}] hiện tại là ${totalLength}/400 ký tự. Còn lại ${400 - totalLength} ký tự (Các môn khác cùng nhóm đã chiếm ${otherLength} ký tự).`
								});
							}
						}
					});
				});

				this.aiWarnings = localWarnings;
				this.action.aiResultDialog.title = 'Kết quả kiểm tra giới hạn ký tự';
				this.action.aiResultDialog.show = true;
			} catch (error) {
				console.error('onCheckCommentLength error:', error);
				this.showSnackbar('Có lỗi xảy ra khi kiểm tra độ dài nhận xét.', 'error');
			} finally {
				this.isCheckingLength = false;
			}
		}
	}
	}
</script>
