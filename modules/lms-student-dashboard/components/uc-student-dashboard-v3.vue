<template>
	<Global>
		<uc-navigation-drawer v-model:activeKey="activeKey" v-model:activeMonHocID="activeMonHocID"
			:studentInfoDetail="studentInfoDetail" :avatarStudent="avatarStudent" :subjectProgress="subjectProgress"
			:version :isMobile>

			<!-- ── TOPBAR (desktop only) ── -->
			<template #topbar>
				<div class="topbar">
					<div class="topbar-icon">
						<v-icon size="18" color="white">{{ activePageIcon }}</v-icon>
					</div>
					<div class="topbar-text">
						<div class="topbar-title">{{ activePageTitle }}</div>
						<div v-if="topbarCtx.subtitle" class="topbar-subtitle">{{ topbarCtx.subtitle }}</div>
					</div>
					<div class="topbar-date">
						{{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) }}
					</div>
					<v-btn v-if="topbarCtx.onRefresh" size="small" variant="text" icon="mdi-refresh" @click="topbarCtx.onRefresh()" />
				</div>
			</template>

			<!-- ── TOPBAR MOBILE ── -->
			<template #topbar-mobile>
			</template>
			<!-- Ticket status banner -->
			<uc-ticket-status v-if="!isFromLinkParent" class="ma-2" />

			<!-- Nội dung chính -->
			<div v-if="activeKey === 0 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-nhiem-vu :NienKhoa :HocSinh="studentInfoDetail" :isMobile />
			</div>
			<div v-if="activeKey === 1 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-hoat-dong :NienKhoa :HocSinh="studentInfoDetail" :isMobile />
			</div>
			<div v-if="activeKey === 2 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-tien-do :NienKhoa :HocSinh="studentInfoDetail" :isMobile />
			</div>
			<div v-if="activeKey === 3 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-ca-nhan :NienKhoa :HocSinh="studentInfoDetail" :version :isMobile />
			</div>
			<div v-if="activeKey === 4 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-lich :HocSinh="studentInfoDetail" :NienKhoa :inline="true" :isMobile />
			</div>
			<div v-if="activeKey === 5 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-hoc-lieu-so :HocSinh="studentInfoDetail" :isMobile />
			</div>
			<uc-achievement-card v-if="activeKey === 6 && NienKhoa && studentInfoDetail?.HocSinhID"
				:HocSinh="studentInfoDetail" :inline="true" :isMobile />
			<div v-if="activeKey === 8 && NienKhoa && studentInfoDetail?.HocSinhID">
				<uc-store-question :HocSinh="studentInfoDetail" :NienKhoa="NienKhoa" :isMobile :hide-header="true" />
			</div>
		</uc-navigation-drawer>
	</Global>
</template>
<script>
export default {
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	emits: ['update:grade-summary', 'view-summary', 'view-details'],
	provide() {
		return { topbarCtx: this.topbarCtx }
	},
	data() {
		return {
			vueData,
			topbarCtx: { subtitle: '', onRefresh: null },
			activeKey: 0,
			activeMonHocID: null,
			studentInfoDetail: {},
			filterFocusTask: [],
			tabMonHoc: null,
			DSTuanHoc: [],
			TuanHoc: null,
			menuVisible: false,
			subjectProgress: [],
			focusTasks: [],
			NienKhoa: null,
			isFromLinkParent: false,
			hocSinhIDFromUrl: null,
			version: "2.7"
		}
	},
	async mounted() {
		const urlParams = new URLSearchParams(window.location.search)
		const isFromLinkParent = urlParams.get('IsFromLinkParent') === 'true'
		const hocSinhID = parseInt(urlParams.get('HocSinhID'))

		// GroupID=2: Phụ huynh — phải vào qua link phụ huynh, kiểm tra quyền sở hữu
		// GroupID=1: Nhân viên có con — nếu vào qua link phụ huynh thì xử lý như phụ huynh, ngược lại dùng userAccount.UserID
		// GroupID=3: Học sinh — dùng thẳng userAccount.UserID
		const groupID = vueData.user.GroupID
		if (groupID === 2 || (groupID === 1 && isFromLinkParent && hocSinhID)) {
			if (!isFromLinkParent || !hocSinhID) {
				// groupID=2 không có param → chặn
				await this.confirmRef.value.show({ title: 'Bạn không có quyền truy cập trang này', hideCancel: true })
				redirect('/ph-report')
				return
			}
			// Verify HocSinhID từ URL có trong danh sách con của người dùng (chặn IDOR)
			// StudentID từ API trả về là string → so sánh bằng == (loose) để tránh type mismatch
			const dsHocSinh = await ajaxCALLPromise('student/Calen_GetInfoStudentByPhuHuynhID')
			const isOwned = dsHocSinh?.some(x => Number(x.StudentID ?? x.HocSinhID) === hocSinhID)
			if (!isOwned) {
				await this.confirmRef.value.show({ title: 'Bạn không có quyền xem thông tin học sinh này', hideCancel: true })
				redirect('/ph-report')
				return
			}
			this.isFromLinkParent = true
			this.hocSinhIDFromUrl = hocSinhID
		}

		this.initStudentInfoDetail()
	},
	computed: {
		isMobile() {
			return this.$vuetify.display.mobile
		},
		activePageTitle() {
			const map = { 0: 'Nhiệm vụ', 1: 'Hoạt động', 2: 'Tiến độ', 3: 'Cá nhân', 4: 'Thời khóa biểu', 5: 'Học liệu số', 6: 'Thành tích', 8: 'Câu hỏi đã đánh dấu' }
			return map[this.activeKey] ?? 'Tổng quan'
		},
		activePageIcon() {
			const map = { 0: 'mdi-format-list-checkbox', 1: 'mdi-history', 2: 'mdi-chart-line', 3: 'mdi-account-circle', 4: 'mdi-calendar-month', 5: 'mdi-book-education-outline', 6: 'mdi-trophy-outline', 8: 'mdi-flag-variant' }
			return map[this.activeKey] ?? 'mdi-home-outline'
		},
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
		'$vuetify.display.mobile'() {
			this.activeKey = 0
		},
		menuVisible: function (menu) {
			if (menu) this.scrollToSelectedItem();
		},
	},
	methods: {
		async initStudentInfoDetail() {
			await this.getNienKhoaIsActive()
			await this.getInfoHocSinhByUserName()
			await this.getTuanHocTap_Get()
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
			const data = await ajaxCALLPromise('lms/EL_Student_GetDashboardData_TienDoMonHoc', {
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
			const DSNienKhoa = await ajaxCALLPromise('/lms/NienKhoa_Get')
			this.NienKhoa = DSNienKhoa.filter(item => item.IsActive)[0].NienKhoa
		},
		async getInfoHocSinhByUserName() {
			// GroupID=2 (phụ huynh) hoặc GroupID=1 vào qua link phụ huynh: lấy HocSinhID từ URL đã được verify
			// GroupID=1 (nhân viên bình thường) & GroupID=3 (học sinh): lấy thẳng từ userAccount
			const hocSinhID = this.isFromLinkParent
				? this.hocSinhIDFromUrl
				: this.userAccount.UserID

			console.log('[DEBUG] isFromLinkParent:', this.isFromLinkParent)
			console.log('[DEBUG] userAccount:', this.userAccount)
			console.log('[DEBUG] hocSinhID gửi lên:', hocSinhID)
			console.log('[DEBUG] NienKhoa:', this.NienKhoa)

			const result = await ajaxCALLPromise('/lms/HocSinh_Detail_GetBy_HocSinhID', {
				HocSinhID: hocSinhID,
				NienKhoa: this.NienKhoa
			})

			console.log('[DEBUG] studentInfoDetail trả về:', result)
			if (result?.DSNhomDangHoc && typeof result.DSNhomDangHoc === 'string') {
				result.DSNhomDangHoc = JSON.parse(result.DSNhomDangHoc)
			}
			if (result?.NienKhoaHoc && typeof result.NienKhoaHoc === 'string') {
				result.NienKhoaHoc = JSON.parse(result.NienKhoaHoc)
			}
			this.studentInfoDetail = result
		},
		async getTuanHocTap_Get() {
			this.DSTuanHoc = await ajaxCALLPromise('lms/TuanHocTap_Get', { NienKhoa: this.NienKhoa })
			this.TuanHoc = this.DSTuanHoc.find(x => x.Is_Active)
		},

	},
}
</script>