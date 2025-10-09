<template>
	<v-container fluid class="dashboard-bg pa-3 pb-0 h-100">
		<div class="d-flex justify-space-between align-center mb-6">
			<div class="w-100">
				<div class="d-flex  align-center">
					<h1 class="dashboard-title " @click="test()">Tổng quan học tập</h1>
					<v-spacer></v-spacer>
					<v-menu v-model="menu" :close-on-content-click="false" location="end" v-if="isMobile">
						<template v-slot:activator="{ props }">
							<v-btn icon v-bind="props">
								<v-avatar color="brown" size="large" :image="avatarStudent">
								</v-avatar>
							</v-btn>
						</template>

						<v-list-item class="bg-white rounded py-3">
							<template v-slot:prepend>
								<v-avatar color="grey-darken-3" :image="avatarStudent">
								</v-avatar>
							</template>
							<v-list-item-title class="d-flex align-center"><span>{{ studentInfoDetail.HoTen }}</span>
								<v-icon class="ms-1" v-if="!studentInfoDetail.Nu" color="primary"
									size="small">mdi-gender-male</v-icon>
								<v-icon class="ms-1" size="small" v-else color="pink">mdi-gender-female</v-icon>
							</v-list-item-title>
							<v-list-item-subtitle>Lớp: {{ studentInfoDetail.TenLop }}
								<span v-if="studentInfoDetail?.TenLopAV">
									- Lớp AV: {{ studentInfoDetail.TenLopAV }}
								</span>
							</v-list-item-subtitle>
						</v-list-item>
						<v-list-item class="bg-white rounded py-3">

							<v-list-item-title class="d-flex align-center">
								<v-spacer></v-spacer><v-btn color="orange" @click="SignOut()" variant="outlined"
									size="small"><v-icon>mdi-logout</v-icon><span>Đăng
										xuất</span></v-btn>
							</v-list-item-title>

						</v-list-item>
					</v-menu>
				</div>

				<p class="dashboard-subtitle">Chào mừng
					trở lại!
					Hãy tiếp tục hành trình học tập nhé!
				</p>
			</div>
			<v-list-item v-if="!isMobile">
				<template v-slot:append>
					<v-avatar color="grey-darken-3" :image="avatarStudent">
					</v-avatar>
				</template>

				<v-list-item-title class="d-flex align-center"><span>{{ studentInfoDetail.HoTen }}</span> <v-icon
						class="ms-1" v-if="!studentInfoDetail.Nu" color="primary" size="small">mdi-gender-male</v-icon>
					<v-icon class="ms-1" size="small" v-else color="pink">mdi-gender-female</v-icon>
				</v-list-item-title>

				<v-list-item-subtitle>Lớp: {{ studentInfoDetail.TenLop }}
					<span v-if="studentInfoDetail?.TenLopAV">
						- Lớp AV: {{ studentInfoDetail.TenLopAV }}
					</span>
				</v-list-item-subtitle>
			</v-list-item>
		</div>

		<v-row>
			<!-- --- CỘT NHIỆM VỤ CẦN LÀM (8/12) --- -->
			<v-col cols="12" lg="8">
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

			<v-col cols="12" lg="4">
				<!-- WIDGET 2: Lịch trong tuần -->
				<div class="container-widget">
					<div class="widget-header widget-header-green  mb-2">
						<v-icon class="widget-icon">mdi-calendar-week</v-icon>
						<h2 class="widget-title">Nhiệm vụ trong tuần</h2>
					</div>
					<uc-week-calendar :tasks="weekSchedule" />
				</div>
			</v-col>

			<!-- --- CỘT THÀNH TÍCH (4/12) --- -->

			<!-- <v-col cols="12" lg="4">
				<div class="mb-8">
					<h2 class="text-h6 mb-3">
						<v-icon class="mr-2" color="amber">mdi-trophy-variant</v-icon>Thành tích gần đây
					</h2>


					<div v-if="!achievements || achievements.length === 0"
						class="text-center pa-5 grey--text rounded border" style="height: calc(100% - 40px);">
						<p class="mb-0">Bạn chưa có thành tích nào. Hãy cố gắng học tập nhé!</p>
					</div>

					<div v-else class="achievement-grid-container">
						<uc-achievement-card v-for="(item, index) in achievements" :key="index" :achievement="item" />
					</div>
				</div>
			</v-col> -->
		</v-row>

		<v-row>
			<v-col cols="12" lg="12">
				<!-- WIDGET 3: Tiến độ học kỳ -->
				<div class="mb-6 container-widget">
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
		<div class="mb-6 container-widget">
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
			menu: false
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
				HocSinhID: parseInt(this.userAccount.UserName),
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
						console.log('this.NienKhoa', this.NienKhoa)
						resolve()
					} else {
						Vue.$toast.error('Không tìm thấy niên khóa hiện hành', { position: "top" })
					}
				})
			})
		},
		async initStudentInfoDetail() {
			let $this = this
			// let promise = await new Promise((resolve,reject)=> {


			// 	resolve()
			// })
			await $this.getNienKhoaIsActive()
			await $this.getInfoHocSinhByUserName()
		},
		SignOut() {
			redirect('https://login.lhbs.vn/')
		}
	}
}
</script>