<template>
	<div class="ft-root">
		<!-- HEADER: khoi select + filter pills -->
		<div class="ft-hd">
			<div class="d-flex align-center ga-2 mb-2">
				<div style="flex:1;font-size:13px;font-weight:600;color:#085041;padding:5px 10px;background:#E1F5EE;border-radius:8px;display:flex;align-items:center;gap:6px">
					<v-icon size="14" color="#085041">mdi-school-outline</v-icon>
					{{ KhoiIDSelected ? ($t('message.Grade') + ' ' + KhoiIDSelected) : $t('message.ChooseGradeToView')
					}}
				</div>
				<v-btn size="x-small" variant="text" v-show="activeTab === 'class' ? LopNhomIDSelected : KhoiIDSelected" :icon="IsShowHidedTask ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" v-tooltip="IsShowHidedTask ? $t('message.ShowAssignment') : $t('message.HideAssignment')" @click="IsShowHidedTask = !IsShowHidedTask">
				</v-btn>
			</div>
			<div class="ft-filter-row" v-show="KhoiIDSelected">
				<button class="ft-fbtn" :class="{ active: activeTab === 'class' }" @click="activeTab = 'class'">{{ $t('message.AssignByClass') }}</button>
				<button class="ft-fbtn" :class="{ active: activeTab === 'student' }" @click="activeTab = 'student'">{{ $t('message.AssignByStudent') }}</button>
			</div>
			<div class="ft-filter-row mt-2" v-show="activeTab === 'class' ? LopNhomIDSelected : KhoiIDSelected">
				<button class="ft-fbtn" :class="{ active: StatusSelected === -1 }" @click="StatusSelected = -1">{{
					$t('message.All') }}</button>
				<button class="ft-fbtn" :class="{ active: StatusSelected === 0 }" @click="StatusSelected = 0">{{
					$t('message.NeedGrade') }}</button>
				<button class="ft-fbtn" :class="{ active: StatusSelected === 1 }" @click="StatusSelected = 1">{{
					$t('message.OverDue') }}</button>
			</div>
		</div>

		<!-- BODY -->
		<div class="ft-body">

			<!-- No khoi yet -->
			<div v-if="!KhoiIDSelected" class="ft-empty">
				<v-icon size="32" class="mb-1 opacity-40">mdi-google-classroom</v-icon>
				<span>{{ $t('message.ChooseGradeToView') }}</span>
			</div>

			<!-- TAB: THEO LỚP -->
			<template v-else-if="activeTab === 'class'">
				<!-- CLASS LIST -->
				<template v-if="!LopNhomIDSelected">
					<div v-if="DSLop.length === 0" class="ft-empty">
						<v-icon size="28" class="mb-1 opacity-40">mdi-google-classroom</v-icon>
						<span>{{ $t('message.ClassNotFound') }}</span>
					</div>
					<div v-for="lop in DSLop" :key="lop.LopNhomID" class="ft-bt-item" @click="LopNhomIDSelected = lop.LopNhomID">
						<div class="ft-bt-icon" style="background:#E1F5EE">
							<v-icon size="14" color="#1D9E75">mdi-google-classroom</v-icon>
						</div>
						<div class="ft-bt-body">
							<div class="ft-bt-name">{{ lop.TenLop }}</div>
							<div class="ft-bt-meta">{{ lop.TongBT }} {{ $t('message.Assignment').toLowerCase() }}</div>
							<div class="ft-bt-footer" v-if="lop.BaiTapCanCham_PendingGrading + lop.BaiTapSapToi_Upcoming > 0">
								<span class="ft-pill ft-pill-blue">
									{{ lop.BaiTapCanCham_PendingGrading + lop.BaiTapSapToi_Upcoming }} {{
										$t('message.NeedGrade').toLowerCase() }}
								</span>
							</div>
						</div>
						<v-icon size="13" color="#A8A89F">mdi-chevron-right</v-icon>
					</div>
				</template>

				<!-- ASSIGNMENT LIST -->
				<template v-else="">
					<div class="ft-back" @click="LopNhomIDSelected = null">
						<v-icon size="14">mdi-arrow-left</v-icon>
						<span>{{DSLop.find(l => l.LopNhomID === LopNhomIDSelected)?.TenLop || $t('message.back')
						}}</span>
					</div>
					<div class="ft-search">
						<v-text-field v-model="search" density="compact" variant="outlined" hide-details="" :placeholder="$t('message.Search')" prepend-inner-icon="mdi-magnify">
						</v-text-field>
					</div>
					<div v-if="FocusTaskListFilter.length === 0" class="ft-empty">
						<v-icon size="28" class="mb-1 opacity-40">mdi-file-search-outline</v-icon>
						<span>{{ $t('message.NoAssignmentToGrade') }}</span>
					</div>
					<div v-for="task in FocusTaskListFilter" :key="task.AssignToClassID" class="ft-bt-item" @click="chamBai(task)">
						<div class="ft-bt-icon" :style="{ background: getMonDot(task.MonHocName) + '22' }">
							<v-icon size="14" :color="getMonDot(task.MonHocName)">mdi-file-document-outline</v-icon>
						</div>
						<div class="ft-bt-body">
							<div class="ft-bt-name">{{ task.Title }}</div>
							<div class="ft-bt-meta">{{ task.TenLopHoacNhom }} · {{ task.MonHocName }}</div>
							<div class="ft-bt-footer">
								<span class="ft-pill" :class="getStatusPillClass(task.Status)">{{
									getStatusText(task.Status) }}</span>
								<span v-if="task.DueDate" class="ft-due">{{ $t('message.DueDatePrefix') }}: {{
									formatDate(task.DueDate) }}</span>
								<v-btn icon="" size="x-small" variant="text" class="ml-auto" :color="task.IsHided ? 'primary' : undefined" v-tooltip="task.IsHided ? $t('message.ShowAssignment') : $t('message.HideAssignment')" @click.stop="toggleHide(task)">
									<v-icon size="12">{{ task.IsHided ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
									}}</v-icon>
								</v-btn>
							</div>
							<div class="ft-progress">
								<div class="ft-progress-bar-out">
									<div class="ft-progress-bar-in" :style="{ width: getProgressPct(task) + '%' }">
									</div>
								</div>
								<span class="ft-progress-txt">{{ task.SubmittedCount }}/{{ task.TotalStudents }}</span>
							</div>
						</div>
						<v-icon size="13" color="#A8A89F">mdi-chevron-right</v-icon>
					</div>
				</template>
			</template>

			<!-- TAB: THEO HỌC SINH -->
			<template v-else="">
				<div class="ft-search">
					<v-text-field v-model="search" density="compact" variant="outlined" hide-details="" :placeholder="$t('message.Search')" prepend-inner-icon="mdi-magnify">
					</v-text-field>
				</div>
				<div v-if="StudentTaskListFilter.length === 0" class="ft-empty">
					<v-icon size="28" class="mb-1 opacity-40">mdi-account-search</v-icon>
					<span>{{ $t('message.NoAssignmentToGrade') }}</span>
				</div>
				<div v-for="task in StudentTaskListFilter" :key="task.AssignmentID || task.AssignToStudentID" class="ft-bt-item" @click="chamBaiStudent(task)">
					<div class="ft-bt-icon" style="background:#7E57C222">
						<v-icon size="14" color="#7E57C2">mdi-account-outline</v-icon>
					</div>
					<div class="ft-bt-body">
						<div class="ft-bt-name">{{ task.Title }}</div>
						<div class="ft-bt-meta">{{ task.TenLopHoacNhom || 'Theo học sinh' }} · {{ task.MonHocName }}
						</div>
						<div class="ft-bt-footer">
							<span class="ft-pill" :class="getStatusPillClass(task.Status)">{{ getStatusText(task.Status)
							}}</span>
							<span v-if="task.DueDate" class="ft-due">{{ $t('message.DueDatePrefix') }}: {{
								formatDate(task.DueDate) }}</span>
							<v-btn icon="" size="x-small" variant="text" class="ml-auto" :color="task.IsHided ? 'primary' : undefined" v-tooltip="task.IsHided ? $t('message.ShowAssignment') : $t('message.HideAssignment')" @click.stop="toggleHide(task)">
								<v-icon size="12">{{ task.IsHided ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}</v-icon>
							</v-btn>
						</div>
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
	emits: ['update:isOpen', 'update:khoiID'],
	inject: ['snackbarRef', 'iframeRef', 'confirmRef'],
	data() {
		return {
			DSKhoi: [], KhoiIDSelected: null,
			vueData, DSLop: [], LopNhomIDSelected: null,
			FocusTaskList: [], StudentTaskListByKhoi: [],
			search: '', activeTab: 'class',
			StatusSelected: -1,
			IsShowHidedTask: false,
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
				if (!val) return
				// Ensure grade is always in DSKhoi list for v-select display
				if (this.DSKhoi.length && !this.DSKhoi.some(k => k.KhoiID === val)) {
					this.DSKhoi.push({ TenKhoi: this.$t('message.Grade') + ' ' + val, KhoiID: val })
				}
				this.KhoiIDSelected = val
			}
		},
		KhoiIDSelected: function (val) {
			this.activeTab = 'class'
			this.StudentTaskListByKhoi = []
			if (val) {
				this.GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID()
			}
		},
		activeTab: function (val) {
			this.search = ''
			this.StatusSelected = -1
			this.IsShowHidedTask = false
			this.LopNhomIDSelected = null
			if (val === 'student' && this.KhoiIDSelected) {
				this.GET_EL_Teacher_Dashboard_Assignment_Get_ByKhoiID_Student()
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
			return this.FocusTaskList
				.filter(item => item.Title.toLowerCase().includes(this.search.toLowerCase()))
				.filter(item => {
					if (this.IsShowHidedTask) return item.IsHided
					return !item.IsHided
				})
				.filter(item => {
					if (this.StatusSelected == -1) return true
					if (this.StatusSelected == 0) return ['UPCOMING', 'PENDING_GRADING'].includes(item.Status)
					return ['OVERDUE'].includes(item.Status)
				})
		},
		StudentTaskListFilter: function () {
			return this.StudentTaskListByKhoi
				.filter(item => item.Title.toLowerCase().includes(this.search.toLowerCase()))
				.filter(item => {
					if (this.IsShowHidedTask) return item.IsHided ?? false
					return !(item.IsHided ?? false)
				})
				.filter(item => {
					if (this.StatusSelected == -1) return true
					if (this.StatusSelected == 0) return ['UPCOMING', 'PENDING_GRADING'].includes(item.Status)
					return ['OVERDUE'].includes(item.Status)
				})
		},
		StatusLists() {
			return [
				{ title: this.$t('message.All'), value: -1 },
				{ title: this.$t('message.NeedGrade'), value: 0 },
				{ title: this.$t('message.OverDue'), value: 1 },
			]
		},
	},
	methods: {
		async GET_EL_Teacher_GetMyClasses() {
			const response = await fetchPromise('lms/EL_Teacher_GetMyClasses', { HocKi: vueData.NienKhoaItem.HocKi }, { cache: false })
			this.DSKhoi = (response ?? []).reduce((result, item) => {
				let obj = result.find(i => i.KhoiID == item.KhoiID)
				if (!obj) {
					result.push({ TenKhoi: this.$t('message.Grade') + ' ' + item.KhoiID, KhoiID: item.KhoiID, CapID: item.CapID })
				}
				return result
			}, [])
			// Nếu khoiID prop có giá trị nhưng chưa có trong list thì thêm vào
			if (this.khoiID && !this.DSKhoi.some(k => k.KhoiID === this.khoiID)) {
				this.DSKhoi.push({ TenKhoi: this.$t('message.Grade') + ' ' + this.khoiID, KhoiID: this.khoiID })
			}
			// Ưu tiên theo cascade (khoiID prop), fallback về khối đầu tiên
			this.KhoiIDSelected = this.khoiID ?? this.DSKhoi[0]?.KhoiID ?? null
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
		async GET_EL_Teacher_Dashboard_Assignment_Get_ByKhoiID_Student() {
			const response = await fetchPromise('lms/EL_Teacher_Dashboard_Assignment_Get_ByKhoiID_Student', {
				KhoiID: this.KhoiIDSelected,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem.HocKi
			}, { cache: false })
			this.StudentTaskListByKhoi = response ?? []
		},
		chamBai(task) {
			const url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToClassID=${task?.AssignToClassID}&LopID=${task?.LopID}&MonHocID=${task?.MonHocID}&AssignType=${task?.AssignType}&KhoiID=${task?.KhoiID}`
			this.iframeRef.value.openWindow({
				title: task?.Title || 'Chấm bài',
				url,
				onclose: () => vueData.apiCall1 && vueData.apiCall1()
			})
		},
		chamBaiStudent(task) {
			const url = `https://lms.lhbs.vn/lms_Assignment-Class-Detail?AssignToStudentID=${task?.AssignToStudentID ?? task?.AssignmentID}&LopID=${task?.LopID}&MonHocID=${task?.MonHocID}&AssignType=${task?.AssignType}&KhoiID=${task?.KhoiID}`
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
			const map = { 'PENDING_GRADING': this.$t('message.NeedGrade'), 'OVERDUE': this.$t('message.OverDue'), 'UPCOMING': this.$t('message.Coming') }
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
			Update_IsHided(task.AssignToClassID || 0, task.AssignToStudentID || 0)
		},
	}
	}
</script>