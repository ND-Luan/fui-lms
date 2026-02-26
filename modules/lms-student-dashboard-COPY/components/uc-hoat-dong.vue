<template>
	<div class="hd">

		<!-- ── HEADER ── -->
		<div class="hd__header">
			<div class="hd__header-left">
				<div class="hd__header-icon">
					<v-icon size="18" color="white">mdi-timeline-clock</v-icon>
				</div>
				<div>
					<div class="hd__header-title">Hoạt Động</div>
					<div class="hd__header-count">{{ DSHoatDong.length }} hoạt động</div>
				</div>
			</div>
			<div class="hd__header-actions">
				<v-btn size="small" variant="text" icon="mdi-refresh" @click="loadData" />
				<v-btn class="d-sm-none" size="small" variant="tonal" color="primary"
					:icon="ChipSelected === 'ALL' ? 'mdi-filter-variant' : 'mdi-filter-check'"
					@click="filterSheet = true" />
			</div>
		</div>

		<!-- ── CHIPS (desktop) ── -->
		<div class="hd__chips d-none d-sm-flex">
			<div v-for="chip in DSChipFilter" :key="chip.id" class="hd__chip"
				:class="{ 'hd__chip--active': ChipSelected === chip.id }"
				:style="ChipSelected === chip.id ? { background: chip.color, borderColor: chip.color } : {}"
				@click="onClickChipFilter(chip.id)">
				<v-icon size="12" :color="ChipSelected === chip.id ? 'white' : chip.color">{{ chip.icon }}</v-icon>
				{{ chip.title }}
			</div>
		</div>

		<!-- ── BOTTOM SHEET (mobile) ── -->
		<v-bottom-sheet v-model="filterSheet" class="d-sm-none">
			<div class="hd__bts">
				<div class="hd__bts-handle-wrap">
					<div class="hd__bts-handle"></div>
				</div>
				<div class="hd__bts-title">Lọc hoạt động</div>
				<div class="hd__bts-list">
					<div v-for="chip in DSChipFilter" :key="chip.id" class="hd__bts-item"
						:class="{ 'hd__bts-item--active': ChipSelected === chip.id }"
						:style="ChipSelected === chip.id ? { borderColor: chip.color, background: chip.color + '12' } : {}"
						@click="onClickChipFilter(chip.id); filterSheet = false">
						<div class="hd__bts-item-icon" :style="{ background: chip.color + '18' }">
							<v-icon size="18" :color="chip.color">{{ chip.icon }}</v-icon>
						</div>
						<span class="hd__bts-item-label"
							:style="ChipSelected === chip.id ? { color: chip.color, fontWeight: 700 } : {}">
							{{ chip.title }}
						</span>
						<v-icon v-if="ChipSelected === chip.id" size="16" :color="chip.color" class="ml-auto">
							mdi-check-circle</v-icon>
					</div>
				</div>
			</div>
		</v-bottom-sheet>

		<!-- ── CONTENT ── -->
		<uc-list-loading :loading="IsLoading" :count="5">

			<!-- Empty -->
			<div v-if="DSHoatDong.length === 0" class="hd__empty">
				<v-icon size="52" color="grey-lighten-2">mdi-timeline-outline</v-icon>
				<div class="hd__empty-title">Chưa có hoạt động</div>
				<div class="hd__empty-sub">Các hoạt động học tập sẽ hiện ở đây</div>
			</div>

			<div v-else class="hd__list">
				<div v-for="(hd, idx) in DSHoatDong_Paged" :key="idx" class="hd__item">

					<!-- Timeline -->
					<div class="hd__item-timeline">
						<div class="hd__item-dot" :style="{ background: getFeedColor(hd.FeedType) }"></div>
						<div class="hd__item-line" v-if="idx < DSHoatDong_Paged.length - 1"></div>
					</div>

					<!-- Card -->
					<div class="hd__item-card">
						<div class="hd__item-icon" :style="{ background: getFeedColor(hd.FeedType) + '15' }">
							<v-icon size="18" :color="getFeedColor(hd.FeedType)">{{ getFeedIcon(hd.FeedType) }}</v-icon>
						</div>
						<div class="hd__item-content">
							<div class="hd__item-title">{{ hd.Title }}</div>
							<div class="hd__item-detail" v-if="hd.Details">{{ hd.Details }}</div>
							<div class="hd__item-meta">
								<span class="hd__item-badge"
									:style="{ background: getFeedColor(hd.FeedType) + '15', color: getFeedColor(hd.FeedType) }">
									{{ getFeedLabel(hd.FeedType) }}
								</span>
								<span class="hd__item-time" v-if="hd.EventTime">
									<v-icon size="11">mdi-clock-outline</v-icon>
									{{ formatTime(hd.EventTime) }}
								</span>
							</div>

							<!-- Actions — chỉ ASSIGNMENT -->
							<div v-if="hd.ResourceType === 'ASSIGNMENT'" class="hd__item-actions">
								<!-- Xem điểm — gọi summary modal -->
								<button class="hd__action-btn hd__action-btn--score" @click.stop="onXemDiem(hd)">
									<v-icon size="12">mdi-star-outline</v-icon>
									Xem điểm
								</button>
								<button class="hd__action-btn" @click.stop="onXemChiTiet(hd)">
									<v-icon size="12">mdi-eye-outline</v-icon>
									Chi tiết
								</button>
								<button class="hd__action-btn hd__action-btn--rank" @click.stop="onXepHang(hd)">
									<v-icon size="12">mdi-podium</v-icon>
									Xếp hạng
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Pagination -->
				<div class="hd__pagination">
					<v-pagination v-model="page" :length="totalPages" :total-visible="5" density="compact" />
				</div>
			</div>
		</uc-list-loading>

		<!-- ── SUMMARY MODAL ── -->
		<uc-summary-modal v-model:visible="summaryModal.visible" :loading="summaryModal.loading"
			:summary-data="summaryModal.data" @navigate-to-details="onNavigateToDetails" />

		<!-- ── LEADERBOARD MODAL ── -->
		<uc-leaderboard v-model:isOpen="leaderboardModal.visible" :data="leaderboardModal.data" />

	</div>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number,
		},
		data() {
			return {
				DSHoatDong_Data: [],
				DSHoatDong: [],
				ChipSelected: 'ALL',
				DSChipFilter: [
					{ id: 'ALL', title: 'Tất cả', color: '#4CAF50', icon: 'mdi-apps' },
					{ id: 'GRADED', title: 'Đã chấm điểm', color: '#673AB7', icon: 'mdi-check-decagram' },
					{ id: 'SUBMITTED', title: 'Đã nộp bài', color: '#558B2F', icon: 'mdi-upload' },
					{ id: 'SAVE_DRAFT', title: 'Lưu bản nháp', color: '#607D8B', icon: 'mdi-file-document-edit' },
					{ id: 'LESSON_COMPLETED', title: 'Hoàn thành bài học', color: '#2196F3', icon: 'mdi-book-check' },
					{ id: 'ACHIEVEMENT', title: 'Thành tích', color: '#FF9800', icon: 'mdi-trophy-award' },
				],
				IsLoading: false,
				filterSheet: false,
				page: 1,
				pageSize: 10,
				vueData,
	
				// ─── Summary modal state ───
				summaryModal: {
					visible: false,
					loading: false,
					data: null,
				},
	
				// ─── Leaderboard modal state ───
				leaderboardModal: {
					visible: false,
					loading: false,
					data: null,
				},
			};
		},
		computed: {
			totalPages() {
				return Math.ceil(this.DSHoatDong.length / this.pageSize);
			},
			DSHoatDong_Paged() {
				const start = (this.page - 1) * this.pageSize;
				return this.DSHoatDong.slice(start, start + this.pageSize);
			},
		},
		async mounted() {
			this.loadData();
		},
		methods: {
			async loadData() {
				this.IsLoading = true;
				try {
					const res = await ajaxCALLPromise('lms/EL_Student_Get_HoatDong_ByHocSinhID', {
						HocSinhID: vueData.user.UserID,
						NienKhoa: this.NienKhoa,
					});
					this.DSHoatDong_Data = res;
					this.DSHoatDong = res.filter(item => this.ChipSelected === 'ALL' || item.FeedType === this.ChipSelected) || [];
					this.page = 1;
				} finally {
					this.IsLoading = false;
				}
			},
	
			onClickChipFilter(id) {
				this.ChipSelected = id;
				this.DSHoatDong = this.DSHoatDong_Data.filter(item => id === 'ALL' || item.FeedType === id) || [];
				this.page = 1;
			},
	
			// ─── Xem điểm → mở summary modal ───
			async onXemDiem(hd) {
				this.summaryModal.visible = true;
				this.summaryModal.loading = true;
				this.summaryModal.data = null;
	
				try {
					const res = await ajaxCALLPromise('lms/EL_Student_Get_SummaryBaiLam', {
						LanNop: hd.LanNop,
						Is_SendToClass: hd.Is_SendToClass,
						AssignID: hd.AssignID,
						AssignToClassID: hd.AssignToClassID,
					});
					// API trả về: [ [overviewItem], [detail1, detail2, ...] ]
					this.summaryModal.data = {
						overview: res[0]?.[0] ?? null,
						details: res[1] ?? [],
					};
				} catch (e) {
					this.summaryModal.visible = false;
					Vue.$toast?.error('Không thể tải kết quả bài làm. Vui lòng thử lại.');
				} finally {
					this.summaryModal.loading = false;
				}
			},
	
			// ─── Navigate to chi tiết từ summary modal ───
			onNavigateToDetails(assignToClassID) {
				this.summaryModal.visible = false;
				openWindow({
					title: 'Chi tiết bài làm',
					url: `/lms-student-assignment?AssignToClassID=${assignToClassID}&tab=detail`,
					id: 'ChiTiet' + assignToClassID,
				});
			},
	
			onXemChiTiet(hd) {
				let url = `/lms-student-assignment?LanNop=${hd.LanNop}&Is_SendToClass=${hd.Is_SendToClass}`;
				url += hd.Is_SendToClass
					? `&AssignToClassID=${hd.AssignID}`
					: `&AssignToStudentID=${hd.AssignID}`;
				openWindow({
					title: 'Chi tiết - ' + hd.Title,
					url,
					id: 'ChiTiet' + hd.AssignToClassID,
				});
			},
	
			async onXepHang(hd) {
				this.leaderboardModal.visible = true;
				this.leaderboardModal.loading = true;
				this.leaderboardModal.data = null;
				this.leaderboardModal.AssignToClassID = hd.AssignToClassID;
				try {
					const res = await ajaxCALLPromise('lms/EL_Student_GetScoreClasss_ByAssignToClassID', {
						AssignToClassID: hd.AssignID,
					});
					this.leaderboardModal.visible = true;
	
					this.leaderboardModal.data = {
						overview: res[0]?.[0], // { AssignToClassID, TenMonHoc_HienThi, Title, DueDate }
						students: res[1] ?? [], // [{ HocSinhID, HoTen, Score, SubmissionTime_HienThi, HoTenGV }]
					}
				} catch (e) {
					this.leaderboardModal.visible = false;
					Vue.$toast?.error('Không thể tải kết quả bài làm. Vui lòng thử lại.');
				} finally {
					this.leaderboardModal.loading = false;
				}
			},
	
			getFeedColor(type) {
				return {
					GRADED: '#673AB7',
					SUBMITTED: '#558B2F',
					SAVE_DRAFT: '#607D8B',
					LESSON_COMPLETED: '#2196F3',
					ACHIEVEMENT: '#FF9800',
				}[type] || '#4CAF50';
			},
	
			getFeedIcon(type) {
				return {
					GRADED: 'mdi-check-decagram',
					SUBMITTED: 'mdi-upload',
					SAVE_DRAFT: 'mdi-file-document-edit',
					LESSON_COMPLETED: 'mdi-book-check',
					ACHIEVEMENT: 'mdi-trophy-award',
				}[type] || 'mdi-circle-small';
			},
	
			getFeedLabel(type) {
				return {
					GRADED: 'Đã chấm điểm',
					SUBMITTED: 'Đã nộp bài',
					SAVE_DRAFT: 'Lưu bản nháp',
					LESSON_COMPLETED: 'Hoàn thành bài học',
					ACHIEVEMENT: 'Thành tích',
				}[type] || type;
			},
	
			formatTime(dateStr) {
				if (!dateStr) return '';
				const d = new Date(dateStr);
				const diff = Math.floor((Date.now() - d) / 1000);
				if (diff < 60) return 'vừa xong';
				if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
				if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
				const days = Math.floor(diff / 86400);
				if (days < 7) return `${days} ngày trước`;
				return d.toLocaleDateString('vi-VN');
			},
		},
	}
</script>