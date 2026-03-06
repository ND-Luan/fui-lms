<template>
	<!-- <v-tooltip location="top" content-class="achievement-tooltip">

		<template v-slot:activator="{ props }">
			<div v-bind="props" class="achievement-icon-wrapper">
				<v-img :src="achievement.ImageUrl" height="80" width="80" class="achievement-icon" contain
					:alt="achievement.Title"></v-img>
			</div>
		</template>

<div>
	<div class="font-weight-bold mb-1">{{ achievement.Title }}</div>
	<div class="text-caption mb-2">{{ achievement.Description }}</div>
	<v-divider></v-divider>
	<div class="text-caption text-grey mt-2">
		<em>Đạt được {{ formatTimeAgo(achievement.CreateTime) }}</em>
	</div>
</div>
</v-tooltip> -->
	<v-dialog v-model="isOpen">
		<div class="app-container-achievement">
			<!-- Header -->
			<div class="header-section-achievement">
				<div class="d-flex px-2">
					<v-spacer></v-spacer>
					<v-btn icon="mdi-close" variant="text" color="white" size="small"
						@click="$emit('update:isOpen', false)"></v-btn>
				</div>
				<div class="header-content">
					<div class="header-title">🏆 Thành Tích Của Tôi</div>
					<div class="header-subtitle">{{ studentName }}</div>
				</div>
			</div>

			<!-- Statistics -->
			<div class="stats-container">
				<div class="stat-item">
					<div class="stat-number">{{ totalAchievements }}</div>
					<div class="stat-label">Thành tích</div>
				</div>
				<div class="stat-item">
					<div class="stat-number">{{ totalPoints }}</div>
					<div class="stat-label">Điểm thưởng</div>
				</div>
				<div class="stat-item">
					<div class="stat-number">{{ uniqueTypes }}</div>
					<div class="stat-label">Loại hình</div>
				</div>
			</div>

			<!-- Filter Tabs -->
			<div class="filter-tabs">
				<div class="filter-chip" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
					Tất cả
				</div>
				<div class="filter-chip" :class="{ active: activeFilter === 'assignment' }"
					@click="activeFilter = 'assignment'">
					Bài tập
				</div>
				<div class="filter-chip" :class="{ active: activeFilter === 'score' }" @click="activeFilter = 'score'">
					Điểm số
				</div>
				<div class="filter-chip" :class="{ active: activeFilter === 'weekly' }"
					@click="activeFilter = 'weekly'">
					Hàng tuần
				</div>
			</div>

			<!-- Achievements List -->
			<div class="achievements-container">
				<div class="section-title">
					<v-icon color="deep-purple">mdi-medal</v-icon>
					{{ filteredAchievements.length }} thành tích
				</div>

				<div v-if="filteredAchievements.length === 0" class="empty-state">
					<div class="empty-icon">🏅</div>
					<div style="font-size: 16px; font-weight: 500;">Chưa có thành tích</div>
					<div style="font-size: 14px; margin-top: 8px;">Hãy hoàn thành bài tập để nhận thành tích!</div>
				</div>

				<div v-for="achievement in filteredAchievements" :key="achievement.AchievementID"
					class="achievement-card" :style="{ borderColor: achievement.Color }">

					<div class="achievement-icon-container" :style="{ backgroundColor: achievement.Color }">
						<v-icon class="achievement-icon">{{ achievement.Icon }}</v-icon>
					</div>

					<div class="achievement-content">
						<div class="achievement-title">{{ achievement.Title }}</div>
						<div class="achievement-description">{{ achievement.Description }}</div>
						<div class="achievement-points">
							<v-icon size="14" color="#F57C00">mdi-star</v-icon>
							+{{ achievement.PointsEarned }} điểm
						</div>
					</div>

					<div class="achievement-badge" v-if="achievement.PointsEarned >= 50">
						🌟 VIP
					</div>
				</div>
			</div>
		</div>
	</v-dialog>

</template>

<script>
	export default {
	name: 'uc-achievement-card',

	props: {
		achievement: {
			type: Object,
			required: false
		},
		isOpen: {
			type: Boolean,
			required: false
		},
		HocSinhID: {
			type: String
		}
	},
	data() {
		return {
			activeFilter: 'all',
			achievements: [
				{
					"AchievementID": 22,
					"AchievementCode": "ASSIGNMENT_DONE_25",
					"Title": "Hoàn thành 25 bài tập",
					"Description": "Hoàn thành 25 bài tập",
					"Color": "#2E7D32",
					"Icon": "mdi-trophy-outline",
					"PointsEarned": 100,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 23,
					"AchievementCode": "SCORE_90",
					"Title": "Chiến binh 90%",
					"Description": "Đạt từ 90% trở lên",
					"Color": "#FFC000",
					"Icon": "mdi-star-half-full",
					"PointsEarned": 40,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 24,
					"AchievementCode": "ASSIGNMENT_DONE_5",
					"Title": "Hoàn thành 5 bài tập",
					"Description": "Hoàn thành 5 bài tập",
					"Color": "#43A047",
					"Icon": "mdi-pencil",
					"PointsEarned": 30,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 25,
					"AchievementCode": "SCORE_80",
					"Title": "Người chơi 80%",
					"Description": "Đạt từ 80% trở lên",
					"Color": "#FF9800",
					"Icon": "mdi-star-half",
					"PointsEarned": 25,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 26,
					"AchievementCode": "SCORE_70",
					"Title": "Người nỗ lực 70%",
					"Description": "Đạt từ 70% trở lên",
					"Color": "#FF5722",
					"Icon": "mdi-star-outline",
					"PointsEarned": 20,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 27,
					"AchievementCode": "SCORE_70",
					"Title": "Người nỗ lực 70%",
					"Description": "Đạt từ 70% trở lên",
					"Color": "#FF5722",
					"Icon": "mdi-star-outline",
					"PointsEarned": 20,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 28,
					"AchievementCode": "ASSIGNMENT_WEEKLY_1",
					"Title": "Hoàn thành 1 bài tập trong tuần",
					"Description": "Hoàn thành ít nhất 1 bài tập trong tuần",
					"Color": "#81C784",
					"Icon": "mdi-pencil-check",
					"PointsEarned": 10,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				},
				{
					"AchievementID": 29,
					"AchievementCode": "ASSIGNMENT_DONE_1",
					"Title": "Hoàn thành 1 bài tập",
					"Description": "Hoàn thành bài tập đầu tiên",
					"Color": "#4CAF50",
					"Icon": "mdi-pencil-check",
					"PointsEarned": 10,
					"HocSinhID": 24200003,
					"HoTen": "Hồ Sĩ Huy"
				}
			],
		};
	},
	computed: {
		studentName() {
			return this.achievements[0]?.HoTen || 'Học sinh';
		},
		totalAchievements() {
			return this.achievements.length;
		},
		totalPoints() {
			return this.achievements.reduce((sum, a) => sum + a.PointsEarned, 0);
		},
		uniqueTypes() {
			const types = new Set();
			this.achievements.forEach(a => {
				if (a.AchievementCode.includes('ASSIGNMENT')) types.add('assignment');
				if (a.AchievementCode.includes('SCORE')) types.add('score');
				if (a.AchievementCode.includes('WEEKLY')) types.add('weekly');
			});
			return types.size;
		},
		filteredAchievements() {
			if (this.activeFilter === 'all') {
				return this.achievements;
			}
			return this.achievements.filter(a => {
				if (this.activeFilter === 'assignment') {
					return a.AchievementCode.includes('ASSIGNMENT') && !a.AchievementCode.includes('WEEKLY');
				}
				if (this.activeFilter === 'score') {
					return a.AchievementCode.includes('SCORE');
				}
				if (this.activeFilter === 'weekly') {
					return a.AchievementCode.includes('WEEKLY');
				}
				return false;
			});
		},
	},
	mounted() {
		this.GET_EL_Student_Achievement_Get()
	},
	methods: {
		formatTimeAgo(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const now = new Date();
			const seconds = Math.floor((now - date) / 1000);

			if (seconds < 60) return "vài giây trước";
			const minutes = Math.floor(seconds / 60);
			if (minutes < 60) return `${minutes} phút trước`;
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return `${hours} giờ trước`;
			const days = Math.floor(hours / 24);
			return `${days} ngày trước`;
		},
		GET_EL_Student_Achievement_Get() {
			ajaxCALL('lms/EL_Student_Achievement_Get', {
				HocSinhID: parseInt(this.HocSinhID)
			}, res => {
				this.achievements = res.data
			})
		},
	}
}
</script>