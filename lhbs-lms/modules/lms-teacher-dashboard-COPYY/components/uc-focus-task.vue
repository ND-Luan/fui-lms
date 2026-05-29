<template>

	<div class="td-focus-task">
		<v-row :no-gutters="true" class="td-focus-task__layout">
			<!-- Left: Class Picker (4 columns) -->
			<v-col cols="12" md="4" class="td-focus-task__picker-col">
				<div class="td-focus-task__class-picker">
					<div class="td-focus-task__class-picker-head">
						<v-select class="td-focus-task__grade-select" v-model="KhoiIDSelected" label="Khối" :items="DSKhoi"
							item-title="TenKhoi" item-value="KhoiID"></v-select>
					</div>
					<div v-if="DSLop.length > 0" class="td-focus-task__class-scroll">
						<div
							v-for="item in DSLop"
							:key="item.LopNhomID"
							class="td-focus-task__class-pill"
							:class="{ 'td-focus-task__class-pill--active': LopNhomIDSelected == item.LopNhomID }"
							@click="LopNhomIDSelected = item.LopNhomID"
						>
							<div class="td-focus-task__class-pill-name">{{ item.TenLop }}</div>
							<div class="td-focus-task__class-pill-meta">
								<span class="text-primary text-caption">{{ item.TongBT }} bài tập</span>
								<span class="text-medium-emphasis">|</span>
								<span class="text-warning text-caption">{{ item.BaiTapSapToi_Upcoming + item.BaiTapCanCham_PendingGrading }} cần chấm</span>
							</div>
						</div>
					</div>
					<div v-else class="text-center pa-4 text-grey rounded border td-focus-task__empty-class">
						<p class="mb-0">Không tìm thấy lớp!</p>
					</div>
				</div>
			</v-col>

			<!-- Right: Assignment Content (8 columns) -->
			<v-col cols="12" md="8" class="td-focus-task__content-col">
				<div class="td-focus-task__content">
					<div class="td-focus-task__toolbar">
						<div class="td-focus-task__toolbar-title text-subtitle-1 font-weight-medium">Bài tập</div>
						<div class="td-focus-task__toolbar-controls">
							<v-select class="td-focus-task__status-select" label="Trạng thái" v-model="StatusSelected" :items="StatusLists" :hide-details="true" density="compact"></v-select>
							<v-text-field class="td-focus-task__search" label="Tìm kiếm" v-model="search"
								prepend-inner-icon="mdi-magnify" />
							<v-btn v-tooltip="IsShowHidedTask ? 'Xem bài tập' : 'Xem bài tập đã ẩn'" size="x-small" :icon="IsShowHidedTask ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" @click="IsShowHidedTask = !IsShowHidedTask"></v-btn>
						</div>
					</div>
					<div class="td-focus-task__grid-wrap">
						<v-row dense>
						<v-col cols="12" v-for="asm in FocusTaskListFilter" :key="asm.AssignToClassID || asm.AssignmentID || asm.Title">
								<uc-teacher-focus-card :task="asm" />
							</v-col>
						</v-row>
						<div v-if="!FocusTaskListFilter || FocusTaskListFilter.length === 0"
						class="text-center pa-5 text-grey rounded border mt-2 td-focus-task__empty-result">
						<p class="mb-0">{{ $t('message.NoAssignmentToGrade') }}</p>
					</div>
				</div>
			</div>
			</v-col>
		</v-row>
	</div>
</template>

<script>
export default {
	props: ['isOpen'],
	emits: ['update:isOpen'],
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
		this.GET_EL_Teacher_GetMyClasses()
	},
	watch: {
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
			let params = {
				HocKi: vueData.NienKhoaItem.HocKi
			}
			let response = await this.API_Promise('EL_Teacher_GetMyClasses', params)
			this.DSKhoi = response.reduce((result, item) => {
				let obj = result.find(i => i.KhoiID == item.KhoiID)
				if (!obj) {
					result.push({ TenKhoi: 'Khối ' + item.KhoiID, KhoiID: item.KhoiID, CapID: item.CapID })
				}
				return result
			}, [])
			this.KhoiIDSelected = this.DSKhoi[0]?.KhoiID ?? null
		},
		async GET_EL_Teacher_Dashboard_Lop_Get_ByKhoiID() {
			let params = {
				KhoiID: this.KhoiIDSelected,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem.HocKi
			}
			let response = await this.API_Promise('EL_Teacher_Dashboard_Lop_Get_ByKhoiID', params)
			this.DSLop = response
			this.LopNhomIDSelected = this.DSLop[0]?.LopNhomID ?? null
		},
		async GET_EL_Teacher_Dashboard_Assignment_Get_ByLopID() {
			let params = {
				LopID: this.LopNhomIDSelected,
				NienKhoa: vueData.NienKhoa,
				HocKi: vueData.NienKhoaItem.HocKi
			}
			let response = await this.API_Promise('EL_Teacher_Dashboard_Assignment_Get_ByLopID', params)
			console.log('r', response)
			this.FocusTaskList = response


		},
		API_Promise(url, params) {
			return new Promise((resolve, reject) => {
				ajaxCALL('lms/' + url, params, res => {
					resolve(res.data)
				})
			})
		}
	}
}
</script>