<template>
	<v-container fluid class="dashboard-bg pa-3 pb-0 h-100">
		<div class="d-flex justify-space-between align-center mb-6">
			<div class="w-100">
				<div class="d-flex  align-center">
					<h1 class="dashboard-title ">Tổng quan học tập</h1>
					<v-spacer></v-spacer>
					<v-menu v-model="menu" :close-on-content-click="false" location="end" v-if="isMobile">
						<template v-slot:activator="{ props }">
							<v-btn icon v-bind="props">
								<v-avatar color="brown" size="large" :image="avatarStudent" />
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
							<v-list-item-subtitle>Lớp: {{ studentInfoDetail.TenLop }} - Lớp AV:
								{{ studentInfoDetail.TenLopAV }}</v-list-item-subtitle>
						</v-list-item>
					</v-menu>
				</div>

				<p class="dashboard-subtitle">Chào mừng
					<span class="text-success font-weight-bold">{{ studentInfoDetail.HoTen }}</span> trở lại!
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

				<v-list-item-subtitle>Lớp: {{ studentInfoDetail.TenLop }} - Lớp AV:
					{{ studentInfoDetail.TenLopAV }}</v-list-item-subtitle>
			</v-list-item>
		</div>

		<v-row>
			<!-- --- CỘT NHIỆM VỤ CẦN LÀM (8/12) --- -->
			<v-col cols="12" lg="8">
				<div class="mb-6">
					<div class="widget-header widget-header-blue  mb-2">
						<v-icon class="widget-icon">mdi-chart-donut</v-icon>
						<h2 class="widget-title">Tiến độ các môn học</h2>
					</div>
					<v-card class="modern-card">
						<!-- <v-card-text class="subjects-container">
							<uc-subject-progress-bar v-for="subject in subjectProgress" :key="subject.MonHocID"
								:subject="subject" @click="selectedSubjectId = subject.MonHocID" />
						</v-card-text>
						<v-tabs v-model="activeTab">
							<v-tab v-for="subject in subjectProgress" :key="subject.MonHocID"
								:value="subject.MonHocID">{{ subject.MonHocName
								}}</v-tab>
						</v-tabs>
						<v-window v-model="activeTab">
							<v-window-item v-for="subject in subjectProgress" :key="subject.MonHocID"
								:value="subject.MonHocID">
								<uc-subject-progress-bar :subject="subject"
									@click="selectedSubjectId = subject.MonHocID" class="ma-3" />
								<v-col v-for="task in focusTasks" :key="'focus-' + task.ResourceType + task.ResourceID"
									cols="12" md="6">
									<uc-focus-task-card :task="task" />
								</v-col>
							</v-window-item>
						</v-window> -->
						<v-row>
							<!-- <v-col cols="12" md="4" v-for="subject in subjectProgress" :key="subject.MonHocID">
								<v-expansion-panels v-model="panel">
									<v-expansion-panel :value="subject.MonHocName">
										<v-expansion-panel-title class=" ma-2 bg-blue-lighten-5">
											<v-row>
												<v-col cols="11">
													<uc-subject-progress-bar :subject="subject"
														@click="selectedSubjectId = subject.MonHocID" />
												</v-col>
											</v-row>
										</v-expansion-panel-title>
										<v-expansion-panel-text class="ma-4">
											<v-row>
												<v-col v-for="task in filterFocusTask"
													:key="'focus-' + task.ResourceType + task.ResourceID" cols="6">
													<uc-focus-task-card :task="task" />
												</v-col>
											</v-row>
										</v-expansion-panel-text>
									</v-expansion-panel>
								</v-expansion-panels>
							</v-col> -->
							<v-col cols="12">
								<!-- <f-table class=" mb-5" label="Danh sách nhóm sản phẩm" :headers="headers"
									:items="vueData.DSCauHinhLaTra" :excel="true" dense :update-form="updateForm"
									:update-api="updateApi" :items-per-page='-1' hide-default-footer="true" /> -->
							</v-col>
						</v-row>
					</v-card>
				</div>
			</v-col>

			<v-col cols="12" lg="4">
				<!-- WIDGET 2: Lịch trong tuần -->
				<div class="">
					<div class="widget-header widget-header-green  mb-2">
						<v-icon class="widget-icon">mdi-calendar-week</v-icon>
						<h2 class="widget-title">Nhiệm vụ trong tuần</h2>
					</div>
					<uc-week-calendar :tasks="weekSchedule" />
				</div>
			</v-col>

		</v-row>

		<!-- WIDGET 4: Bảng tin -->
		<div class="mb-6">
			<div class="widget-header widget-header-blue  mb-2">
				<v-icon class="widget-icon">mdi-bulletin-board</v-icon>
				<h2 class="widget-title">Hoạt động gần đây</h2>
			</div>
			<v-card class="modern-card">
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
			:summary-data="gradeSummary.data" @update:visible="handleCloseModal" @navigate-to-details="onViewDetails" />
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
				panel: null,
				filterFocusTask: []
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
			},
			panel(val) {
				this.filterFocusTask = this.focusTasks.filter(task => task.MonHocName === val)
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
			}
		}
	}
</script>