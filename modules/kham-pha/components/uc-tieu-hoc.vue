<template>
	<div>
		<div class="px-2 text-h6 text-primary">
			<v-icon class="mr-2" color="white" size="large">mdi-school</v-icon>
			Danh sách học liệu - {{TenCap}}
		</div>
		<v-expansion-panels v-model="panel" selected-class="bg-primary text-primary">
			<v-expansion-panel v-for="(khoi, index) in DSKhoi" :key="khoi.id">
				<v-expansion-panel-title>
					<div class="d-flex align-center">
						<v-icon :color="getIconColor(index)" class="mr-3" size="large">
							{{ getIcon(khoi.name, index) }}
						</v-icon>
						{{ khoi.name }}
					</div>
				</v-expansion-panel-title>
				<v-expansion-panel-text style="min-height: calc(100dvh - 190px); overflow:auto !important">
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
		</v-expansion-panels>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				panel: undefined,
				isLoading: false,
				DSHocLieu: []
			}
		},
		mounted() {
			//mở expand để gọi vô watch
			this.panel = [0]
		},
		computed: {
			DSKhoi() {
				// Nếu KhoiID null / undefined / 0 ⇒ lấy tất cả khối theo cấp
				if (!vueData.KhoiID) {
					return vueData.DSKhoi_Init.filter(x => x.CapID === vueData.CapID)
				}
	
				// Ngược lại ⇒ lọc theo CapID + KhoiID
				return vueData.DSKhoi_Init.filter(
					x => x.CapID === vueData.CapID && x.id === vueData.KhoiID
				)
			},
			TenCap: function () {
				let text = ''
				if (vueData.CapID === 1) text = 'Tiểu học'
				if (vueData.CapID === 2) text = 'Trung học cơ sở'
				if (vueData.CapID === 3) text = 'Trung học phổ thông'
				return text
			}
		},
		watch: {
			panel: function (panel) {
				if (panel === undefined) return
				this.isLoading = true
				const khoi = this.DSKhoi[panel]
				ajaxCALL('lms/FP_HocLieu_GetAll', {
					PageNumber: 1,
					PageSize: 100,
					KhoiID: khoi.id,
					MonHocID: 0,
					BoSachID: 0,
				}, res => {
					this.DSHocLieu = res.data
					this.isLoading = false
				})
	
			}
		},
		methods: {
			getIcon(name, index) {
				// Icons dựa trên tên khối/môn
				const iconMap = {
					'Khối 1': 'mdi-numeric-1-circle',
					'Khối 2': 'mdi-numeric-2-circle',
					'Khối 3': 'mdi-numeric-3-circle',
					'Khối 4': 'mdi-numeric-4-circle',
					'Khối 5': 'mdi-numeric-5-circle',
					'Khối 6': 'mdi-numeric-6-circle',
					'Khối 7': 'mdi-numeric-7-circle',
					'Khối 8': 'mdi-numeric-8-circle',
					'Khối 9': 'mdi-numeric-9-circle',
					'Khối 10': 'mdi-alpha-x-circle',
					'Khối 11': 'mdi-alpha-x-circle',
					'Khối 12': 'mdi-alpha-x-circle',
					'AI': 'mdi-robot',
					'Âm nhạc': 'mdi-music',
					'Ngoại ngữ': 'mdi-translate',
					'Công nghệ': 'mdi-cog',
					'Công nghiệp': 'mdi-factory',
					'Địa': 'mdi-earth',
					'English Central': 'mdi-flag-variant',
					'EC1': 'mdi-school-outline',
					'GDCD': 'mdi-account-heart',
					'Nội dung giáo dục của địa phương': 'mdi-map-marker',
					'GDQP': 'mdi-shield-star',
					'Hoạt động trải nghiệm, hướng nghiệp': 'mdi-compass'
				}
	
				// Nếu có icon cụ thể thì dùng, không thì dùng icon dự phòng
				if (iconMap[name]) {
					return iconMap[name]
				}
	
				// Icons dự phòng
				const fallbacks = [
					'mdi-bookmark', 'mdi-star', 'mdi-heart', 'mdi-diamond', 'mdi-crown',
					'mdi-trophy', 'mdi-medal', 'mdi-award', 'mdi-flag', 'mdi-target'
				]
				return fallbacks[index % fallbacks.length]
			},
	
			getIconColor(index) {
				// Màu tương ứng với từng panel
				const colors = [
					'#10B981', '#0EA5E9', '#F59E0B', '#8B4513', '#A855F7',
					'#EC4899', '#6366F1', '#14B8A6', '#EF4444', '#22C55E'
				]
				return colors[index % colors.length]
			}
		}
	}
</script>