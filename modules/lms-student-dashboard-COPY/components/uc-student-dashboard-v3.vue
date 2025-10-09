<template>
	<uc-navigation-drawer v-model:activeKey="activeKey" v-model:activeMonHocID="activeMonHocID"
		:studentInfoDetail="studentInfoDetail" :avatarStudent="avatarStudent" :subjectProgress="subjectProgress">
		<!--  Hoạt động gần đây -->
		<div v-if="activeKey === 0">
			<div class="">
				<div class="widget-header widget-header-green mb-2">
					<v-icon class="widget-icon">mdi-calendar-week</v-icon>
					<h2 class="widget-title">Nhiệm vụ trong tuần</h2>
				</div>
				<uc-week-calendar :tasks="weekSchedule" />
			</div>
			<div class="mt-4">
				<div class="widget-header widget-header-blue mb-2">
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
		</div>
		<!--  Tiến độ môn học -->
		<div v-if="activeKey === 1">
			<v-alert class="mb-4" v-if="1 === 2" border="top" type="warning" variant="outlined" prominent
				title="Quá hạn">
				Vui lòng làm bài tập và bài học. Bạn đang bị quá hạn ở các tuần xxx
			</v-alert>
			<div>
				<div class="widget-header widget-header-blue">
					<v-icon class="widget-icon">mdi-chart-donut</v-icon>
					<div>
						<h2 class="widget-title">Tiến độ môn học - {{monHoc?.MonHocName}}</h2>
						<p>{{TuanHoc?.Tuan_HienThi}}</p>
					</div>
					<v-spacer />
					<v-menu v-model="menuVisible" location="bottom">
						<template v-slot:activator="{ props }">
							<v-icon class="widget-icon" v-bind="props" color="white"
								class="elevation-4 rounded">mdi-calendar-week</v-icon>
						</template>

						<v-list>
							<v-list-subheader>Danh sách tuần học</v-list-subheader>
							<div ref="listWrapper" style="height: 200px; overflow: auto">
								<v-list-item :ref="'item-'+item.TuanHocID" v-for="(item, index) in DSTuanHoc"
									:id="'item-'+item.TuanHocID" :title="item.Tuan_HienThi"
									:class="TuanHoc?.TuanHocID === item.TuanHocID ? 'bg-primary text-white' : '' "
									@click="TuanHoc = item" />
							</div>
						</v-list>
					</v-menu>
				</div>
				<v-card flat class="mt-4">
					<v-row>
						<v-col v-if="monHoc?.CompletedTasks">
							<v-card flat title="Hoàn thành" prepend-icon="mdi-check-circle-outline"
								:subtitle="monHoc?.CompletedTasks" color="success" variant="tonal" />
						</v-col>
						<v-col v-if="monHoc?.TotalTasks - monHoc?.CompletedTasks > 0">
							<v-card flat title="Đang làm" prepend-icon="mdi-progress-clock"
								:subtitle="monHoc?.TotalTasks - monHoc?.CompletedTasks" color="warning"
								variant="tonal" />
						</v-col>
						<v-col v-if="monHoc?.OverdueTasks > 0">
							<v-card flat title="Quá hạn" prepend-icon="mdi-alert-circle"
								:subtitle="monHoc?.OverdueTasks" color="error" variant="tonal" />
						</v-col>
					</v-row>
					<p class="text-subtitle-1 text-primary font-weight-medium mt-4 mb-2">Bài tập & Bài học</p>
					<v-row>
						<v-col :cols="12"
							v-for="task in DSTienDoMonHocTheoTuan.filter(task => task.MonHocID === activeMonHocID)">
							<uc-focus-task-card :task="task" />
						</v-col>
						<v-col cols="12"
							v-if="DSTienDoMonHocTheoTuan.filter(task => task.MonHocID === activeMonHocID).length === 0">
							<uc-empty />
						</v-col>
					</v-row>
					<!-- <v-row>
						<v-col cols="12" md="4" v-for="subject in subjectProgress" :key="subject.MonHocID">
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
						</v-col>
						<v-col cols="12">
						</v-col>
					</v-row> -->
				</v-card>
			</div>
		</div>
		<div v-if="activeKey === 2">Hoạt động gần đây 2</div>
	</uc-navigation-drawer>
</template>

<script>
	export default {
		props: {
			//focusTasks: { type: Array, default: () => [] },
			weekSchedule: { type: Array, default: () => [] },
			//subjectProgress: { type: Array, default: () => [] },
			recentFeed: { type: Array, default: () => [] },
			achievements: { type: Array, default: () => [] },
			gradeSummary: { type: Object, default: () => ({ visible: false, loading: false, data: null }) },
			onViewSummary: { type: Function, default: () => { } },
			onViewDetails: { type: Function, default: () => { } }
		},
		emits: ['update:grade-summary', 'view-summary', 'view-details'],
		data() {
			return {
				activeKey: 0,
				activeMonHocID: null,
				studentInfoDetail: {},
				filterFocusTask: [],
				tabMonHoc: null,
				isMobile: false,
				DSTuanHoc: [],
				TuanHoc: null,
				menuVisible: false,
				subjectProgress: [],
				focusTasks: []
			}
		},
		mounted() {
			this.isMobile = this.$vuetify.display.mobile
			// this.activeMonHocID = this.subjectProgress[0]?.MonHocID
			this.initStudentInfoDetail()
		},
		computed: {
			DSTienDoMonHocTheoTuan() {
				console.log('focusTasks', this.focusTasks)
				const arr = this.focusTasks.filter(x => x.TuanHocID === this.TuanHoc?.TuanHocID)
				return arr
			},
			userAccount: function () {
				return vueData.user
			},
			avatarStudent: function () {
				const avatar = vueData.v_Set.urlAvatarHocSinh + this.studentInfoDetail?.HocSinhID
				return avatar
			},
			monHoc: function () {
				if (this.subjectProgress.length === 0) return
				console.log('subjectProgress', this.subjectProgress)
				const _monHoc = this.subjectProgress.find(x => x.MonHocID === this.activeMonHocID)
				return _monHoc
			},
		},
		watch: {
			'$vuetify.display.mobile': function (isMobile) {
				this.isMobile = isMobile
			},
			menuVisible: function (menu) {
				if (menu) this.scrollToSelectedItem();
			},
		},
		methods: {
			async initStudentInfoDetail() {
				await this.getNienKhoaIsActive()
				await this.getTuanHocTap_Get()
				await this.getInfoHocSinhByUserName()
				await this.getTienDoMonHoc()
			},
			scrollToSelectedItem() {
				if (!this.TuanHoc) return
				const index = this.DSTuanHoc.findIndex(item => item.TuanHocID === this.TuanHoc.TuanHocID);
				if (index !== -1) {
					this.$nextTick(() => {
						const stringID = `item-${this.TuanHoc.TuanHocID}`
						const el = document.getElementById(stringID);
						if (el) {
							el.scrollIntoView({
								behavior: 'smooth',
								block: 'center',
							});
						}
					})
				}
			},
			async getTienDoMonHoc() {
				const data = await this.ajaxCALLPromise('lms/EL_Student_GetDashboardData_TienDoMonHoc', {
					// MonHocID: monHocID,
					TuanHocID: this.TuanHoc?.TuanHocID,
					HocSinhID: this.studentInfoDetail.HocSinhID
				})
				this.subjectProgress = data[0]
				if (this.activeMonHocID === undefined || this.activeMonHocID === null) {
					this.activeMonHocID = data[0][0]?.MonHocID
				}
				this.focusTasks = data[1]
			},
			async getNienKhoaIsActive() {
				const DSNienKhoa = await this.ajaxCALLPromise('/lms/NienKhoa_Get')
				this.NienKhoa = DSNienKhoa.filter(item => item.IsActive)[0].NienKhoa
			},
			async getInfoHocSinhByUserName() {
				this.studentInfoDetail = await this.ajaxCALLPromise('/lms/HocSinh_Detail_GetBy_HocSinhID', {
					HocSinhID: parseInt(this.userAccount.UserName),
					NienKhoa: this.NienKhoa
				})
			},
			async getTuanHocTap_Get() {
				this.DSTuanHoc = await this.ajaxCALLPromise('lms/TuanHocTap_Get', { NienKhoa: this.NienKhoa })
				this.TuanHoc = this.DSTuanHoc.find(x => x.Is_Active)
			},
			ajaxCALLPromise(url, params = null) {
				return new Promise(resolve => {
					ajaxCALL(url, params, res => {
						if (res?.data) {
							resolve(res.data)
							return
						}
						resolve(res)
					})
				})
			}
		},
	}
</script>