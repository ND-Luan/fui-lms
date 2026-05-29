<template>
	<v-container fluid class="dashboard-bg pa-3 pb-0 h-100">
		<!-- Header Card -->
		<v-card class="mb-3 overflow-visible" elevation="1">
			<v-card-text class="pa-3">
				<div class="d-flex align-center ga-2">
					<div class="flex-grow-1">
						<div class="d-flex align-center flex-wrap ga-2 mb-2">
							<h3 class="dashboard-title" @click="test()">Tổng quan học tập</h3>
							<!-- <v-chip color="primary" size="small"
								@click="openWindow({title : 'Học liệu số', url: '/kham-pha?capid=' + vueData.HocSinhChiTiet?.CapID + '&khoiid=' + vueData.HocSinhChiTiet?.KhoiID})">
								<v-icon start size="small">mdi-book-open-page-variant</v-icon>
								Học liệu số
							</v-chip> -->
						</div>
						<p class="dashboard-subtitle mb-0">
							Chào mừng trở lại! Hãy tiếp tục hành trình học tập nhé!
						</p>
					</div>

					<!-- Desktop: User Card -->
					<v-card v-if="!isMobile" class="user-info-card user-card-custom d-flex align-center pa-2 px-3 ms-3"
						elevation="0">
						<!-- Achievement Button -->
						<v-btn v-tooltip="'Thành tích'" color="warning" @click="onOpenAchievement()" variant="text"
							size="small" class="me-2" icon>
							<v-icon>mdi-trophy</v-icon>
						</v-btn>
						<v-divider vertical class="me-3" style="height: 40px;"></v-divider>
						<!-- User Avatar & Info -->
						<div class="d-flex align-center" style="max-width: 280px;">
							<v-avatar :image="avatarStudent" class="me-3 flex-shrink-0 elevation-2" size="42"
								style="border: 2px solid rgba(255,255,255,0.8);">
							</v-avatar>
							<div class="d-flex flex-column justify-center overflow-hidden">
								<div class="d-flex align-center">
									<span class="text-truncate font-weight-medium" style="font-size: 0.95rem;">
										{{ studentInfoDetail.HoTen }}
									</span>
									<v-icon class="ms-1 flex-shrink-0" v-if="!studentInfoDetail.Nu" color="primary"
										size="16">
										mdi-gender-male
									</v-icon>
									<v-icon class="ms-1 flex-shrink-0" v-else color="pink" size="16">
										mdi-gender-female
									</v-icon>
								</div>
								<small class="text-medium-emphasis text-truncate"
									style="display: block; font-size: 0.8rem; line-height: 1.2;">
									{{ studentInfoDetail.TenLop }}
									<span v-if="studentInfoDetail?.TenLopAV" class="text-primary">
										• {{ studentInfoDetail.TenLopAV }}
									</span>
								</small>
							</div>
						</div>
						<v-divider vertical class="mx-3" style="height: 40px;"></v-divider>
						<!-- Logout Button -->
						<v-btn v-tooltip="'Đăng xuất'" variant="tonal" color="error" @click="SignOut()"
							class="flex-shrink-0" size="small">
							<v-icon size="18" class="me-1">mdi-logout-variant</v-icon>
						</v-btn>
					</v-card>

					<!-- Mobile: Menu Button -->
					<v-menu v-model="menu" :close-on-content-click="false" location="bottom end" v-if="isMobile">
						<template v-slot:activator="{ props }">
							<v-btn icon v-bind="props" class="ms-2">
								<v-avatar color="brown" size="48" :image="avatarStudent">
								</v-avatar>
							</v-btn>
						</template>

						<v-card min-width="280" class="mt-2">
							<!-- User Info Section -->
							<v-list-item class="py-3">
								<template v-slot:prepend>
									<v-avatar color="grey-darken-3" :image="avatarStudent" size="48">
									</v-avatar>
								</template>
								<v-list-item-title class="d-flex align-center">
									<span>{{ studentInfoDetail.HoTen }}</span>
									<v-icon class="ms-1" v-if="!studentInfoDetail.Nu" color="primary" size="small">
										mdi-gender-male
									</v-icon>
									<v-icon class="ms-1" size="small" v-else color="pink">mdi-gender-female</v-icon>
								</v-list-item-title>
								<v-list-item-subtitle>
									Lớp: {{ studentInfoDetail.TenLop }}
									<span v-if="studentInfoDetail?.TenLopAV">
										- Lớp AV: {{ studentInfoDetail.TenLopAV }}
									</span>
								</v-list-item-subtitle>
							</v-list-item>

							<v-divider></v-divider>

							<!-- Achievement Button -->
							<v-list-item class="py-2">
								<v-btn color="warning" @click="onOpenAchievement(); menu = false" block variant="tonal">
									<v-icon class="me-2">mdi-trophy</v-icon>
									<span>Thành tích</span>
								</v-btn>
							</v-list-item>

							<!-- Logout Button -->
							<v-list-item class="py-2">
								<v-btn color="error" @click="SignOut()" block variant="outlined">
									<v-icon class="me-2">mdi-logout</v-icon>
									<span>Đăng xuất</span>
								</v-btn>
							</v-list-item>
						</v-card>
					</v-menu>
				</div>
			</v-card-text>
		</v-card>

		<v-row>
			<!-- --- CỘT NHIỆM VỤ CẦN LÀM (8/12) --- -->
			<v-col class="pb-0" cols="12" lg="8">
				<div class="bg-white container-widget">
					<div class="widget-header widget-header-dark-green mb-2">
						<v-icon class="widget-icon">mdi-target</v-icon>
						<h2 class="widget-title">Nhiệm vụ cần làm ngay</h2>
					</div>
					<div v-if="!focusTasks || focusTasks.length === 0" class="text-center pa-5 grey--text rounded"
						style="min-height: 100px">
						<p class="mb-0">Không có nhiệm vụ nào cần làm ngay. Làm tốt lắm!</p>
					</div>
					<div v-else
						class="v-card v-card--flat v-theme--light v-card--density-default v-card--variant-elevated modern-card border-none">
						<v-row class="pa-3" dense>
							<v-col v-for="task in focusTasks" :key="'focus-' + task.ResourceType + task.ResourceID"
								cols="12" md="6">
								<uc-focus-task-card :task="task" />
							</v-col>
						</v-row>
					</div>
				</div>
			</v-col>

			<v-col class="pb-0" cols="12" lg="4">
				<!-- WIDGET 2: Lịch trong tuần -->
				<div class="container-widget">
					<div class="widget-header widget-header-green mb-2">
						<v-icon class="widget-icon">mdi-calendar-week</v-icon>
						<h2 class="widget-title">Nhiệm vụ trong tuần</h2>
					</div>
					<uc-week-calendar :tasks="weekSchedule" />
				</div>
			</v-col>
		</v-row>

		<v-row>
			<v-col cols="12" lg="12">
				<!-- WIDGET 3: Tiến độ học kỳ -->
				<div class="mb-3 container-widget">
					<div class="widget-header widget-header-blue">
						<v-icon class="widget-icon">mdi-chart-donut</v-icon>
						<h2 class="widget-title">Tiến độ các môn học</h2>
					</div>
					<v-card class="modern-card">
						<v-card-text class="subjects-container">
							<uc-subject-progress-bar v-for="subject in subjectProgress" :key="subject.MonHocID"
								:subject="subject" @click="selectedSubjectId = subject.MonHocID" />
						</v-card-text>
					</v-card>
				</div>
			</v-col>
		</v-row>

		<!-- WIDGET 4: Bảng tin -->
		<div class="mb-3 container-widget">
			<div class="widget-header widget-header-blue">
				<v-icon class="widget-icon">mdi-bulletin-board</v-icon>
				<h2 class="widget-title">Hoạt động gần đây</h2>
			</div>
			<v-card class="modern-card" flat>
				<v-list lines="two" class="feed-list">
					<div v-if="!recentFeed || recentFeed.length === 0" class="empty-feed-state">
						<v-icon size="48" color="grey-lighten-1">mdi-newspaper-variant-outline</v-icon>
						<p class="empty-feed-text">Chưa có thông báo mới</p>
					</div>
					<uc-feed-item v-for="item in recentFeed" :key="item.FeedType + item.ObjectID" :feed="item"
						@view-summary="onViewSummary" @view-details="onViewDetails" />
				</v-list>
			</v-card>
		</div>

		<uc-summary-modal v-model:visible="gradeSummary.visible" :loading="gradeSummary.loading"
			:summaryData="gradeSummary.data" @update:visible="handleCloseModal" @navigate-to-details="onViewDetails" />

		<uc-achievement-card v-model:isOpen="isShowModalAchievement" :HocSinhID="userAccount.UserID">
		</uc-achievement-card>
	</v-container>
</template>

<script>
export default {
	name: 'uc-student-dashboard-v2',
	emits: ['update:grade-summary', 'view-summary', 'view-details'],
	props: {
		focusTasks: { type: Array, default: () => [] },
		weekSchedule: { type: Array, default: () => [] },
		subjectProgress: { type: Array, default: () => [] },
		recentFeed: { type: Array, default: () => [] },
		achievements: { type: Array, default: () => [] },
		gradeSummary: { type: Object, default: () => ({ visible: false, loading: false, data: null }) },
		onViewSummary: { type: Function, default: () => { } },
		onViewDetails: { type: Function, default: () => { } }
	},
	data() {
		return {
			selectedSubjectId: 0,
			vueData,
			NienKhoa: null,
			studentInfoDetail: {},
			isMobile: window.innerWidth <= 620,
			menu: false,
			isShowModalAchievement: false
		}
	},
	computed: {
		userAccount: function () {
			return vueData.user
		},
		avatarStudent: function () {
			return vueData.v_Set.urlAvatarHocSinh + this.studentInfoDetail.HocSinhID
		},
	},
	mounted() {
		window.addEventListener('resize', this.checkMobile);
		this.initStudentInfoDetail()
	},
	watch: {
		isMobile(val) {
		}
	},
	methods: {
		checkMobile() {
			this.isMobile = window.innerWidth <= 620;
		},
		handleCloseModal() {
			const updatedSummary = { ...this.gradeSummary, visible: false };
			this.$emit('update:grade-summary', updatedSummary);
		},
		getInfoHocSinhByUserName() {
			ajaxCALL('/lms/HocSinh_Detail_GetBy_HocSinhID', {
				HocSinhID: parseInt(this.userAccount.UserID),
				NienKhoa: this.NienKhoa
			}, res => {
				this.studentInfoDetail = res
			}
			)
		},
		getNienKhoaIsActive() {
			return new Promise((resolve, reject) => {
				ajaxCALL('/lms/NienKhoa_Get', null, res => {
					if (res.data.length > 0) {
						this.NienKhoa = res.data.filter(item => item.IsActive)[0].NienKhoa
						resolve()
					} else {
						Vue.$toast.error('Không tìm thấy niên khóa hiện hành', { position: "top" })
					}
				})
			})
		},
		async initStudentInfoDetail() {
			let $this = this
			await $this.getNienKhoaIsActive()
			await $this.getInfoHocSinhByUserName()
		},

		SignOut() {
			redirect('https://login.lhbs.vn/')
		},
		onOpenAchievement() {
			this.isShowModalAchievement = true
		},
		openWindow
	}
}
</script>