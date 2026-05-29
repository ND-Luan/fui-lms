<template>
	<v-dialog max-width="500">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" class="floating-nav-btn" color="primary" size="small" elevation="12">
				<v-icon size="18">mdi-apps</v-icon>
			</v-btn>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card class="rounded-lg" elevation="8">
				<v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
					<v-icon class="mr-2" color="primary">mdi-switch</v-icon>
					Chọn nền tảng
				</v-card-title>

				<v-card-subtitle class="px-6 py-2 text-body-2">
					Lựa chọn nền tảng bạn muốn truy cập
				</v-card-subtitle>

				<v-card-text class="pa-6">
					<v-row dense>
						<!-- <v-col cols="12">
							<v-sheet class="system-card bg-green text-white rounded-lg pa-4 cursor-pointer"
								elevation="2" @click="handleNavigate('hls', isActive)">
								<div class="d-flex flex-column align-center ga-3">
									<v-icon size="48" color="white">mdi-book-open-page-variant</v-icon>
									<div class="text-center">
										<div class="text-subtitle-1 font-weight-bold">Học liệu số</div>
										<div class="text-caption mt-1">Tài liệu học tập</div>
									</div>
								</div>
							</v-sheet>
						</v-col> -->
						<v-col cols="12">
							<v-sheet
								:class="['system-card bg-primary text-white rounded-lg pa-4 cursor-pointer', { 'active-sheet': !vueData.IsUsedLMS }]"
								elevation="2" @click="handleNavigate('diem', isActive)">
								<div class="d-flex flex-column align-center ga-3">
									<v-icon size="48" color="white">mdi-chart-box-outline</v-icon>
									<div class="text-center">
										<div class="text-subtitle-1 font-weight-bold">Kết quả học tập</div>
										<div class="text-caption mt-1">Điểm & nhận xét</div>
									</div>
								</div>
							</v-sheet>
						</v-col>
						<v-col cols="12" >
							<v-sheet
								:class="['system-card bg-secondary text-white rounded-lg pa-4 cursor-pointer', { 'active-sheet': vueData.IsUsedLMS }]"
								elevation="2" @click="handleNavigate('lms', isActive)">
								<div class="d-flex flex-column align-center ga-3">
									<v-icon size="48" color="white">mdi-school</v-icon>
									<div class="text-center">
										<div class="text-subtitle-1 font-weight-bold">LMS</div>
										<div class="text-caption mt-1">Quản lý học tập</div>
									</div>
								</div>
							</v-sheet>
						</v-col>
					</v-row>
				</v-card-text>

				<v-divider />

				<v-card-actions class="pa-4">
					<v-spacer />
					<v-btn variant="text" color="grey-darken-1" @click="isActive.value = false">
						<v-icon class="mr-1">mdi-close</v-icon>
						Đóng
					</v-btn>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script>
	export default {
		name: "uc-btn-center-nvg-bottom",
		props: [],
		data() {
			return {
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			handleNavigate(type, isActive) {
				if (type === 'hls') {
					openWindow({
						title: "Học liệu số",
						url: "/hoc-lieu-so"
					})
				}
				else if (type === 'diem') {
					vueData.IsUsedLMS = false
				}
				else if (type === 'lms') {
					vueData.IsUsedLMS = true
				}
				isActive.value = false
			}
		},
	}
</script>