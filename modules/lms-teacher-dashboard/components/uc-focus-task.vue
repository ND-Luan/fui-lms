<template>
	<div class="ft-root">

		<!-- HEADER: khoi select + filter pills -->
		<div class="ft-hd">
			<div class="d-flex align-center ga-2 mb-2">
				<v-select v-model="KhoiIDSelected" :items="DSKhoi" item-title="TenKhoi" item-value="KhoiID"
					density="compact" variant="outlined" hide-details style="flex:1" />
				<v-btn size="x-small" variant="text"				v-show="LopNhomIDSelected"					:icon="IsShowHidedTask ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
					v-tooltip="IsShowHidedTask ? 'Xem bài thường' : 'Xem bài đã ẩn'"
					@click="IsShowHidedTask = !IsShowHidedTask" />
			</div>
			<div class="ft-filter-row" v-show="LopNhomIDSelected">
				<button class="ft-fbtn" :class="{ active: StatusSelected === -1 }" @click="StatusSelected = -1">Tất cả</button>
				<button class="ft-fbtn" :class="{ active: StatusSelected === 0 }" @click="StatusSelected = 0">Cần chấm</button>
				<button class="ft-fbtn" :class="{ active: StatusSelected === 1 }" @click="StatusSelected = 1">Quá hạn</button>
			</div>
		</div>

		<!-- BODY -->
		<div class="ft-body">

			<!-- No khoi yet -->
			<div v-if="!KhoiIDSelected" class="ft-empty">
				<v-icon size="32" class="mb-1 opacity-40">mdi-google-classroom</v-icon>
				<span>Chọn khối để xem bài tập</span>
			</div>

			<!-- CLASS LIST -->
			<template v-else-if="!LopNhomIDSelected">
				<div v-if="DSLop.length === 0" class="ft-empty">
					<v-icon size="28" class="mb-1 opacity-40">mdi-google-classroom</v-icon>
					<span>Không tìm thấy lớp</span>
				</div>
				<div v-for="lop in DSLop" :key="lop.LopNhomID"
					class="ft-bt-item" @click="LopNhomIDSelected = lop.LopNhomID">
					<div class="ft-bt-icon" style="background:#E1F5EE">
						<v-icon size="14" color="#1D9E75">mdi-google-classroom</v-icon>
					</div>
					<div class="ft-bt-body">
						<div class="ft-bt-name">{{ lop.TenLop }}</div>
						<div class="ft-bt-meta">{{ lop.TongBT }} bài tập</div>
						<div class="ft-bt-footer" v-if="lop.BaiTapCanCham_PendingGrading + lop.BaiTapSapToi_Upcoming > 0">
							<span class="ft-pill ft-pill-blue">
								{{ lop.BaiTapCanCham_PendingGrading + lop.BaiTapSapToi_Upcoming }} cần chấm
							</span>
						</div>
					</div>
					<v-icon size="13" color="#A8A89F">mdi-chevron-right</v-icon>
				</div>
			</template>

			<!-- ASSIGNMENT LIST -->
			<template v-else>
				<div class="ft-back" @click="LopNhomIDSelected = null">
					<v-icon size="14">mdi-arrow-left</v-icon>
					<span>{{ DSLop.find(l => l.LopNhomID === LopNhomIDSelected)?.TenLop || 'Quay lại' }}</span>
				</div>
				<div class="ft-search">
					<v-text-field v-model="search" density="compact" variant="outlined" hide-details
						placeholder="Tìm kiếm..." prepend-inner-icon="mdi-magnify" />
				</div>
				<div v-if="FocusTaskListFilter.length === 0" class="ft-empty">
					<v-icon size="28" class="mb-1 opacity-40">mdi-file-search-outline</v-icon>
					<span>{{ $t('message.NoAssignmentToGrade') }}</span>
				</div>
				<div v-for="task in FocusTaskListFilter" :key="task.AssignToClassID || task.AssignToStudentID"
					class="ft-bt-item" @click="chamBai(task)">
					<div class="ft-bt-icon" :style="{ background: getMonDot(task.MonHocName) + '22' }">
						<v-icon size="14" :color="getMonDot(task.MonHocName)">mdi-file-document-outline</v-icon>
					</div>
					<div class="ft-bt-body">
						<div class="ft-bt-name">{{ task.Title }}</div>
						<div class="ft-bt-meta">{{ task.TenLopHoacNhom }} · {{ task.MonHocName }}</div>
						<div class="ft-bt-footer">
							<span class="ft-pill" :class="getStatusPillClass(task.Status)">{{ getStatusText(task.Status) }}</span>
							<span v-if="task.DueDate" class="ft-due">HH: {{ formatDate(task.DueDate) }}</span>						<v-btn icon size="x-small" variant="text" class="ml-auto"
							:color="task.IsHided ? 'primary' : undefined"
							v-tooltip="task.IsHided ? 'Hiện bài tập' : 'Ẩn bài tập'"
							@click.stop="toggleHide(task)">
							<v-icon size="12">{{ task.IsHided ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}</v-icon>
						</v-btn>						</div>
						<div class="ft-progress">
							<div class="ft-progress-bar-out">
								<div class="ft-progress-bar-in" :style="{ width: getProgressPct(task) + '%' }"></div>
							</div>
							<span class="ft-progress-txt">{{ task.SubmittedCount }}/{{ task.TotalStudents }}</span>
						</div>
					</div>
					<v-icon size="13" color="#A8A89F">mdi-chevron-right</v-icon>
				</div>
			</template>

		</div><!-- /ft-body -->
	</div>
</template>

<script>
export default {
	props: ['isOpen', 'khoiID'],
	emits: ['update:isOpen'],
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	data() {
		const items = [
			{ id: 1, action: '15 min', headline: 'Brunch this weekend?', subtitle: `I'll be in your neighborhood doing errands this weekend. Do you want to hang out?`, title: 'Ali Connors' },
			{ id: 2, action: '2 hr', headline: 'Summer BBQ', subtitle: `Wish I could come, but I'm out of town this weekend.`, title: 'me, Scrott, Jennifer' },
			{ id: 3, action: '6 hr', headline: 'Oui oui', subtitle: 'Do you have Paris recommendations? Have you ever been?', title: 'Sandra Adams' },
			{ id: 4, action: '12 hr', headline: 'Birthday gift', subtitle: 'Have any ideas about what we should get Heidi for her birthday?', title: 'Trevor Hansen' },
			{ id: 5, action: '18hr', headline: 'Recipe to try', subtitle: 'We should eat this: Grate, Squash, Corn, and tomatillo Tacos.', title: 'Britta Holt' },
		]
		return { items, DSKhoi: [], KhoiIDSelected: null, 
			vueData, DSLop: [], LopNhomIDSelected: null, 
			FocusTaskList: [], search: '', BaiTap_CanCham_All_Class: {},
			StatusSelected:-1,
			StatusLists:[
				{
					title: 'Tất cả',
					value: -1
				},
				{
					title: 'Cần chấm',
					value: 0
				},
				{
					title: 'Quá hạn',
					value: 1
				}
			],
			IsShowHidedTask:false,
		}
	},
	mounted() {
		vueData.refreshFocusTask = () => this.GET_EL_Teacher_GetMyClasses()
		this.GET_EL_Teacher_GetMyClasses()
	},
	watch: {
		khoiID: {
			immediate: true,
			handler(val) {
				if (val && val !== this.KhoiIDSelected) {
					this.KhoiIDSelected = val
				}
			}
		},
		KhoiIDSelected: function (val) {
			if (val) {
				this.GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID()
			}
		},
		LopNhomIDSelected: function (val) {
			if (val) {
				this.GET_EL_Teacher_Dashboard_Assignment_Get_ByLopID()
			} else {
				this.FocusTaskList = []
				this.IsShowHidedTask = false
				this.StatusSelected = -1
			}
		}
	},
	computed: {
		FocusTaskListFilter: function () {
			return this.FocusTaskList.filter(item =>
				item.Title.toLowerCase()
					.includes(this.search.toLowerCase())
			).filter(item => {
				if(this.IsShowHidedTask){
					return item.IsHided
				}else{
					return !item.IsHided
				}
			}).filter(item => {
				if(this.StatusSelected == -1){
					return true
				}else if(this.StatusSelected == 0){
					return ['UPCOMING','PENDING_GRADING'].includes(item.Status)
				}else{
					return ['OVERDUE'].includes(item.Status)
				}
			})
		}
	},
	methods: {
		async GET_EL_Teacher_GetMyClasses() {
			const response = await fetchPromise('lms/EL_Teacher_GetMyClasses', { HocKi: vueData.NienKhoaItem.HocKi }, { cache: false })
			this.DSKhoi = (response ?? []).reduce((result, item) => {
				let obj = result.find(i => i.KhoiID == item.KhoiID)
				if (!obj) {
					result.push({ TenKhoi: 'Khối ' + item.KhoiID, KhoiID: item.KhoiID, CapID: item.CapID })
				}
				return result
			}, [])
			this.KhoiIDSelected = this.DSKhoi[0]?.KhoiID ?? null
		},
		async GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID() {
			const response = await fetchPromise('lms/EL_Teacher_Dashboard_Lop_Get_ByKhoiID', {
				KhoiID: this.KhoiIDSelected,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem.HocKi
			}, { cache: false })
			this.DSLop = response ?? []
			this.LopNhomIDSelected = null
		},
		async GET_EL_Teacher_Dashboard_Assignment_Get_ByLopID() {
			const response = await fetchPromise('lms/EL_Teacher_Dashboard_Assignment_Get_ByLopID', {
				LopID: this.LopNhomIDSelected,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem.HocKi
			}, { cache: false })
			this.FocusTaskList = response ?? []
		},
		chamBai(task) {
			const url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${task?.AssignToClassID}&LopID=${task?.LopID}&MonHocID=${task?.MonHocID}&AssignType=${task?.AssignType}&KhoiID=${task?.KhoiID}`
			this.iframeRef.value.openWindow({
				title: task?.Title || 'Chấm bài',
				url,
				onclose: () => vueData.apiCall1 && vueData.apiCall1()
			})
		},
		formatDate(dateString) {
			if (!dateString) return ''
			return new Date(dateString).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit' })
		},
		getMonDot(monHocName) {
			const map = {
				'Toán': '#378ADD', 'Tiếng Việt': '#1D9E75', 'Ngoại ngữ': '#7F77DD',
				'Khoa học': '#D85A30', 'Lịch sử': '#BA7517', 'Địa lý': '#D4537E',
				'Mỹ thuật': '#888780', 'Thể dục': '#888780', 'Tin học': '#378ADD',
				'GDCD': '#D4537E', 'Vật lý': '#BA7517', 'Hóa học': '#1D9E75', 'Sinh học': '#3B6D11',
			}
			return map[monHocName] || '#888780'
		},
		getStatusText(status) {
			const map = { 'PENDING_GRADING': 'Cần chấm', 'OVERDUE': 'Quá hạn', 'UPCOMING': 'Sắp tới' }
			return map[status] || status
		},
		getStatusPillClass(status) {
			const map = { 'PENDING_GRADING': 'ft-pill-warn', 'OVERDUE': 'ft-pill-danger', 'UPCOMING': 'ft-pill-blue' }
			return map[status] || ''
		},
		getProgressPct(task) {
			if (!task.TotalStudents) return 0
			return Math.round((task.SubmittedCount / task.TotalStudents) * 100)
		},
		toggleHide(task) {
			task.IsHided = !task.IsHided
			Update_IsHided(task.AssignToClassID)
		},
	}
}
</script>