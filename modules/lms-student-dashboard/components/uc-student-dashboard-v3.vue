<template>
	<Global>
		<uc-navigation-drawer v-model:activeKey="activeKey" v-model:activeMonHocID="activeMonHocID"
			:studentInfoDetail="studentInfoDetail" :avatarStudent="avatarStudent" :subjectProgress="subjectProgress"
			:version :isMobile>
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
		</uc-navigation-drawer>
	</Global>
</template>
<script>
export default {
	inject: ['snackbarRef', 'iframeRef'],
	emits: ['update:grade-summary', 'view-summary', 'view-details'],
	data() {
		return {
			vueData,
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
			focusTasks: [],
			NienKhoa: null,
			isFromLinkParent: false,
			hocSinhIDFromUrl: null,
			version: "2.3"
		}
	},
	mounted() {
		this.isMobile = this.$vuetify.display.mobile
		this.checkUrlParams()
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
			this.activeKey = 0
			this.isMobile = isMobile
		},
		menuVisible: function (menu) {
			if (menu) this.scrollToSelectedItem();
		},
	},
	methods: {
		checkUrlParams() {
			const urlParams = new URLSearchParams(window.location.search)
			const isFromLinkParent = urlParams.get('IsFromLinkParent')
			if (isFromLinkParent === 'true') {
				this.isFromLinkParent = true
				this.hocSinhIDFromUrl = parseInt(urlParams.get('HocSinhID'))
			}
		},
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
			this.studentInfoDetail = result
		},
		async getTuanHocTap_Get() {
			this.DSTuanHoc = await ajaxCALLPromise('lms/TuanHocTap_Get', { NienKhoa: this.NienKhoa })
			this.TuanHoc = this.DSTuanHoc.find(x => x.Is_Active)
		},

	},
}
</script>