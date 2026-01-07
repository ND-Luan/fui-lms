<template>
	<v-list :density="vueData.density" style="max-height: 100%">
		<v-list-subheader>Hoạt động gần đây</v-list-subheader>
		<div class="pl-4 pr-4 pb-2">
			<div class="d-flex ga-4">
				<v-chip v-for="chip in DSChipFilter" :key="chip.id" :color="chip.color" :prepend-icon="chip.icon"
					@click="onClickChipFilter(chip.id)">{{chip.title}}</v-chip>
			</div>
		</div>
		<uc-list-loading :loading="IsLoading" :count="5">

			<div class="px-2">
				<!-- Danh sách hoạt động -->
				<template v-for="(hd, idx) in DSHoatDong_Paged" :key="idx">
					<uc-feed-item :feed="hd" />
				</template>

				<!-- Pagination -->
				<v-pagination v-model="page" :length="totalPages" :total-visible="7" :density="vueData.density" />
			</div>


			<!-- <div class="d-flex flex-wrap ga-4 pa-2">
				<div class="rounded flex-fill" v-for="index in 4"
					style="background-color: grey; width: 200px; height: 200px;">
				</div>
			</div>
			<v-table>
				<thead>
					<tr>
						<th class="text-center" v-for="day in weeksHeader" :key="day.name">
							{{ day.name }}
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="hour in TimeLine">
						<td class="text-center">{{ hour }}:00</td>
						<td v-for="day in weeksData" :key="day.name">
							<div v-if="day.activites.length === 0 || day.activites.filter(t => t.id == hour).length === 0"
								class="text-caption text-center pa-4">
								Không có hoạt động
							</div>
							<template v-else>
								<div v-for="(activity, index) in day.activites.filter(t => t.id == hour)" :key="index">
									<v-chip color="blue" size="small" label>{{ activity.content }}</v-chip>
								</div>
							</template>
						</td>
					</tr>
				</tbody>
			</v-table> -->
		</uc-list-loading>
	</v-list>
</template>

<script>
	export default {
		props: {
			NienKhoa: Number
		},
		data() {
			return {
				DSHoatDong_Data: [],
				DSHoatDong: [],
				ChipSelected: 'ALL',
				DSChipFilter: [
					{
						id: 'ALL',
						title: 'Tất cả',
						color: '#4CAF50',
						icon: 'mdi-apps'
	
					},
					{
						id: 'GRADED',
						title: 'Đã chấm điểm',
						color: '#673AB7',
						icon: 'mdi-check-decagram'
					},
					{
						id: 'SUBMITTED',
						title: 'Đã nộp bài',
						color: '#558B2F',
						icon: 'mdi-upload'
					},
					{
						id: 'SAVE_DRAFT',
						title: 'Lưu bản nháp',
						color: '#607D8B',
						icon: 'mdi-file-document-edit'
					},
					{
						id: 'LESSON_COMPLETED',
						title: 'Hoàn thành bài học',
						color: '#2196F3',
						icon: 'mdi-book-check'
					},
					{
						id: 'ACHIEVEMENT',
						title: 'Thành tích',
						color: '#FF9800',
						icon: 'mdi-trophy-award'
					}
				],
				IsLoading: false,
				page: 1,
				pageSize: 10,
				vueData,
				weeksHeader: [
					{
						name: "Giờ",
					},
					{
						name: 'Thứ 2',
					},
					{ name: 'Thứ 3' },
					{ name: 'Thứ 4' },
					{ name: 'Thứ 5' },
					{ name: 'Thứ 6' },
					{ name: 'Thứ 7' },
					{ name: 'Chủ nhật' },
				],
				weeksData: [
					{
						name: 'Thứ 2', activites: [
							{ time: '08:00', id: 8, content: 'Làm bài tập Toán' },
							{ time: '10:00', id: 10, content: 'Tham gia thảo luận Lịch sử' },
						]
					},
					{ name: 'Thứ 3', activites: [] },
					{ name: 'Thứ 4', activites: [] },
					{ name: 'Thứ 5', activites: [] },
					{ name: 'Thứ 6', activites: [] },
					{ name: 'Thứ 7', activites: [] },
					{ name: 'Chủ nhật', activites: [] },
				],
				TimeLine: Array.from({ length: 12 }, (_, i) => i * 2)
			}
		},
		computed: {
			// Tổng số trang
			totalPages() {
				return Math.ceil(this.DSHoatDong.length / this.pageSize)
			},
	
			// Dữ liệu phân trang
			DSHoatDong_Paged() {
				const start = (this.page - 1) * this.pageSize
				return this.DSHoatDong.slice(start, start + this.pageSize)
			}
		},
		async mounted() {
			this.loadData()
		},
		methods: {
			async loadData() {
				this.IsLoading = true
				try {
					const res = await ajaxCALLPromise("lms/EL_Student_Get_HoatDong_ByHocSinhID", {
						HocSinhID: vueData.user.UserID,
						NienKhoa: this.NienKhoa
					})
					this.DSHoatDong_Data = res
					const resFilter = res.filter(item => this.ChipSelected === 'ALL' || item.FeedType === this.ChipSelected)
					this.DSHoatDong = resFilter || []
					this.page = 1 // reset về trang 1
				} finally {
					this.IsLoading = false
				}
			},
			onClickChipFilter(id) {
				this.ChipSelected = id
				const resFilter = this.DSHoatDong_Data.filter(item => this.ChipSelected === 'ALL' || item.FeedType === this.ChipSelected)
				this.DSHoatDong = resFilter || []
				this.page = 1 // reset về trang 1
			}
		}
	}
</script>