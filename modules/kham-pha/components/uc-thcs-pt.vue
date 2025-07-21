<template>
	<div>
		<div class="px-2 text-h6 text-primary">
			<v-icon class="mr-2" color="white" size="large">mdi-school</v-icon>
			Danh sách học liệu - {{TenCap}}
		</div>
		<!-- <v-expansion-panels v-model="panel" selected-class="bg-primary text-primary">
			<v-expansion-panel v-for="(monHoc, index) in DSMonHoc_Filter" :key="monHoc.MonHocID">
				<v-expansion-panel-title>
					<div class="d-flex align-center">
						<v-icon :color="getSubjectIconColor(index)" class="mr-3" size="large">
							{{ getSubjectIcon(monHoc.MonHocName, index) }}
						</v-icon>
						{{ monHoc.MonHocName }}
					</div>
				</v-expansion-panel-title>
				<v-expansion-panel-text style="height: 600px; overflow:auto">
					<v-card class="pa-2">
						<v-row>
							<v-col v-for="sach in DSHocLieu" :key="sach.HocLieuID" cols="12" sm="4" md="2" lg="2">
								<uc-sach-card :item="sach"></uc-sach-card>
							</v-col>
						</v-row>
					</v-card>
				</v-expansion-panel-text>
				<v-divider></v-divider>
			</v-expansion-panel>
		</v-expansion-panels> -->
		<v-expansion-panels v-model="panel" selected-class="bg-primary text-primary">
			<v-expansion-panel v-for="(toHop, index) in DSToHop" :key="toHop.id">
				<v-expansion-panel-title>
					{{toHop.name}}
				</v-expansion-panel-title>
				<v-expansion-panel-text style="height: 600px; overflow:auto">
					<div v-for="monHoc in renderDSMonHocBy_ToHop(toHop.id)">
						<v-card class="pa-2">
							<v-card-title>{{monHoc.MonHocName}}</v-card-title>
							<v-row>
								<v-col v-for="sach in DSHocLieu.filter(x => x.MonHocID === monHoc.MonHocID)"
									:key="sach.HocLieuID" cols="12" sm="4" md="2" lg="2">
									<uc-sach-card :item="sach"></uc-sach-card>
								</v-col>
							</v-row>
						</v-card>
					</div>
				</v-expansion-panel-text>
			</v-expansion-panel>
		</v-expansion-panels>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			let nhom_to_hop_bat_buoc = []
			let nhom_to_hop_xh = []
			let nhom_to_hop_tn = []
			let nhom_to_hop_ta = []
			let nhom_to_hop_con_lai = null
			if (vueData.CapID === 2) {
				nhom_to_hop_bat_buoc = [73, 74]
				nhom_to_hop_xh = [60, 53, 52]
				nhom_to_hop_tn = [61, 57, 67]
				nhom_to_hop_ta = [46]
			} else if (vueData.CapID === 3) {
				nhom_to_hop_bat_buoc = [103, 104]
				nhom_to_hop_xh = [100, 79, 82]
				nhom_to_hop_tn = [91, 88, 97]
				nhom_to_hop_ta = [76]
			}
	
			return {
				DSHocLieu: [],
				DSMonHoc: [],
				MonHocID: null,
				KhoiID: null,
				vueData,
				panel: undefined,
				selectedToHop: null,
				DSToHop: [
					{
						id: 1,
						name: "Môn học bắt buộc",
						List_MonHocID: nhom_to_hop_bat_buoc
					},
					{
						id: 2,
						name: "Khoa học xã hội",
						List_MonHocID: nhom_to_hop_xh
					},
					{
						id: 3,
						name: "Khoa học tự nhiên",
						List_MonHocID: nhom_to_hop_tn
					},
					{
						id: 4,
						name: "Tiếng Anh",
						List_MonHocID: nhom_to_hop_ta
					},
					{
						id: 5,
						name: "Các môn còn lại",
						List_MonHocID: nhom_to_hop_con_lai
					}
				]
			}
		},
		mounted() {
			this.getDSMonHoc()
			this.getDSHocLieu()
		},
		computed: {
			DSKhoi: function () {
				return vueData.DSKhoi_Init.filter(x => x.CapID === vueData.CapID)
			},
			TenCap: function () {
				let text = ''
				if (vueData.CapID === 1) text = 'Tiểu học'
				if (vueData.CapID === 2) text = 'Trung học cơ sở'
				if (vueData.CapID === 3) text = 'Trung học phổ thông'
				return text
			}
		},
		// watch: {
		// 	panel: function (panel) {
		// 		if (panel !== undefined) {
		// 			this.isLoading = true
		// 			const mon = this.DSMonHoc[panel]
	
		// 		}
		// 	}
		// },
		methods: {
			renderDSMonHocBy_ToHop(id) {
				let DSMonHoc = []
				DSMonHoc = this.DSMonHoc.filter(x => {
					const ToHop = this.DSToHop.find(n => n.id === id)
					if (ToHop) {
						if (ToHop.id === 5) {
							const a = this.DSToHop.filter(x => x.List_MonHocID !== null)
							const List_MonHocID = a.map(n => n.List_MonHocID)
							const flatMapp = List_MonHocID.flat()
							console.log('flatMapp', flatMapp)
							return !flatMapp.includes(x.MonHocID)
						} else {
							return ToHop.List_MonHocID.includes(x.MonHocID)
						}
					} else {
						return x
					}
				})
				return DSMonHoc
			},
			getDSHocLieu() {
				ajaxCALL('lms/FP_HocLieu_GetAll', {
					PageNumber: 1,
					PageSize: 1000,
					KhoiID: 0,
					MonHocID: 0,
					BoSachID: 0,
				}, res => {
					this.DSHocLieu = res.data
					this.panel = 0
					// this.isLoading = false
				})
			},
			getDSMonHoc() {
				ajaxCALL('lms/MonHoc_Get_ByCapID', {
					CapID: vueData.CapID
				}, res => {
					this.DSMonHoc = res.data
				})
			},
			getSubjectIcon(subjectName, index) {
				// Icons cho các môn học
				const subjectIcons = {
					// Môn chính
					'Toán': 'mdi-calculator',
					'Toán học': 'mdi-calculator',
					'Ngữ văn': 'mdi-book-open-variant',
					'Tiếng Việt': 'mdi-book-open-variant',
					'Văn học': 'mdi-book-open-variant',
					'Tiếng Anh': 'mdi-translate',
					'Ngoại ngữ': 'mdi-translate',
					'English': 'mdi-flag-variant',
	
					// Khoa học tự nhiên
					'Vật lý': 'mdi-atom',
					'Hóa học': 'mdi-flask',
					'Sinh học': 'mdi-leaf',
					'Khoa học tự nhiên': 'mdi-telescope',
	
					// Khoa học xã hội
					'Lịch sử': 'mdi-book-clock',
					'Địa lý': 'mdi-earth',
					'Địa': 'mdi-earth',
					'GDCD': 'mdi-account-heart',
					'Giáo dục công dân': 'mdi-account-heart',
					'Khoa học xã hội': 'mdi-account-group',
	
					// Nghệ thuật & kỹ năng
					'Âm nhạc': 'mdi-music',
					'Mỹ thuật': 'mdi-palette',
					'Thể dục': 'mdi-run',
					'Công nghệ': 'mdi-cog',
					'Tin học': 'mdi-computer',
					'Công nghệ thông tin': 'mdi-computer',
	
					// Định hướng nghề nghiệp
					'Hướng nghiệp': 'mdi-compass',
					'Giáo dục quốc phòng': 'mdi-shield-star',
					'GDQP': 'mdi-shield-star',
					'An ninh quốc phòng': 'mdi-shield-star',
	
					// Ngoại khóa
					'Hoạt động trải nghiệm': 'mdi-hiking',
					'Sinh hoạt lớp': 'mdi-account-group',
					'Câu lạc bộ': 'mdi-account-multiple',
	
					// Môn mới/đặc biệt
					'AI': 'mdi-robot',
					'Trí tuệ nhân tạo': 'mdi-robot',
					'Robotics': 'mdi-robot-industrial',
					'STEM': 'mdi-flask-outline',
					'Khoa học máy tính': 'mdi-monitor',
	
					// Nội dung địa phương
					'Nội dung giáo dục của địa phương': 'mdi-map-marker',
					'Giáo dục địa phương': 'mdi-map-marker',
					'Văn hóa địa phương': 'mdi-home-city',
	
					// Tiếng nước ngoài khác
					'Tiếng Trung': 'mdi-translate-variant',
					'Tiếng Nhật': 'mdi-translate-variant',
					'Tiếng Hàn': 'mdi-translate-variant',
					'Tiếng Pháp': 'mdi-translate-variant',
					'Tiếng Đức': 'mdi-translate-variant',
	
					// Môn nghề/chuyên ngành
					'Kinh tế': 'mdi-chart-line',
					'Du lịch': 'mdi-airplane',
					'Nông nghiệp': 'mdi-grass',
					'Y tế': 'mdi-medical-bag',
					'Điện tử': 'mdi-chip',
					'Cơ khí': 'mdi-wrench',
					'Xây dựng': 'mdi-home-variant',
					'Thương mại': 'mdi-store'
				}
	
				// Tìm icon phù hợp với tên môn học
				for (let key in subjectIcons) {
					if (subjectName.toLowerCase().includes(key.toLowerCase())) {
						return subjectIcons[key]
					}
				}
	
				// Icons dự phòng cho các môn không xác định
				const fallbackIcons = [
					'mdi-book', 'mdi-school-outline', 'mdi-pencil', 'mdi-lightbulb',
					'mdi-star', 'mdi-heart', 'mdi-diamond', 'mdi-crown',
					'mdi-trophy', 'mdi-medal', 'mdi-award', 'mdi-flag',
					'mdi-target', 'mdi-rocket', 'mdi-puzzle', 'mdi-cube'
				]
	
				return fallbackIcons[index % fallbackIcons.length]
			},
	
			getSubjectIconColor(index) {
				// Màu sắc phong phú cho các môn học
				const colors = [
					'#10B981', // emerald - Toán
					'#0EA5E9', // sky blue - Ngữ văn  
					'#F59E0B', // amber - Tiếng Anh
					'#EF4444', // red - Vật lý
					'#8B5CF6', // violet - Hóa học
					'#22C55E', // green - Sinh học
					'#F97316', // orange - Lịch sử
					'#06B6D4', // cyan - Địa lý
					'#EC4899', // pink - GDCD
					'#6366F1', // indigo - Âm nhạc
					'#14B8A6', // teal - Mỹ thuật
					'#84CC16', // lime - Thể dục
					'#A855F7', // purple - Công nghệ
					'#F43F5E', // rose - Tin học
					'#3B82F6', // blue - Hướng nghiệp
					'#8B4513'  // brown - GDQP
				]
	
				return colors[index % colors.length]
			}
		}
	}
</script>