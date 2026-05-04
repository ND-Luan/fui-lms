<template>
	<div class="acd">
		<!-- Sidebar -->
		<div class="acd__sidebar">
			<!-- Nav filter -->
			<div class="acd__nav">
				<div class="acd__nav-label">Lọc theo loại</div>
				<div v-for="item in navItems" :key="item.value" class="acd__nav-item"
					:class="{ 'acd__nav-item--active': activeFilter === item.value }"
					@click="activeFilter = item.value">
					<v-icon size="17">{{ item.icon }}</v-icon>
					<span>{{ item.label }}</span>
					<span class="acd__nav-count">{{ item.count }}</span>
				</div>
			</div>
		</div>

		<!-- Main -->
		<div class="acd__main">
			<!-- Topbar -->
			<div class="acd__topbar">
				<div class="acd__topbar-title">
					<v-icon size="20" color="primary" class="mr-2">mdi-medal</v-icon>
					Thành Tích Của Tôi
				</div>
				<span class="acd__topbar-count">{{ filteredAchievements.length }} thành tích</span>
			</div>

			<!-- Progress -->
			<div class="acd__progress-wrap">
				<div class="acd__progress-label">
					<span>Tiến độ tổng thể</span>
					<span class="acd__progress-pct">{{ Math.min(totalPoints, 1000) }}/1000 điểm</span>
				</div>
				<div class="acd__progress-bar">
					<div class="acd__progress-fill" :style="{ width: Math.min(totalPoints / 10, 100) + '%' }"></div>
				</div>
			</div>

			<!-- Empty -->
			<div v-if="filteredAchievements.length === 0" class="acd__empty">
				<v-icon size="56" color="grey-lighten-2">mdi-trophy-broken</v-icon>
				<div class="acd__empty-title">Chưa có thành tích</div>
				<div class="acd__empty-sub">Hãy hoàn thành bài tập để nhận thành tích!</div>
			</div>

			<!-- Grid -->
			<div class="acd__grid">
				<div v-for="achievement in filteredAchievements" :key="achievement.AchievementID" class="acd__card">
					<div class="acd__card-accent" :style="{ background: achievement.Color }"></div>
					<div class="acd__card-header">
						<div class="acd__card-icon" :style="{ backgroundColor: achievement.Color }">
							<v-icon size="22" color="white">{{ achievement.Icon }}</v-icon>
						</div>
						<div class="acd__card-vip" v-if="achievement.PointsEarned >= 50">
							<v-icon size="11" color="amber">mdi-star-circle</v-icon> VIP
						</div>
					</div>
					<div class="acd__card-body">
						<div class="acd__card-title">{{ achievement.Title }}</div>
						<div class="acd__card-desc">{{ achievement.Description }}</div>
					</div>
					<div class="acd__card-footer">
						<v-icon size="13" color="#F57C00">mdi-star</v-icon>
						<span class="acd__card-points" :style="{ color: achievement.Color }">+{{
							achievement.PointsEarned }} điểm</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-achievement-card-desktop',
		props: {
			HocSinh: { type: Object }
		},
		data() {
			return {
				activeFilter: 'all',
				achievements: [],
			};
		},
		computed: {
			studentName() { return this.HocSinh?.HoTen ?? ''; },
			totalAchievements() { return this.achievements.length; },
			totalPoints() { return this.achievements.reduce((s, a) => s + a.PointsEarned, 0); },
			uniqueTypes() {
				const t = new Set();
				this.achievements.forEach(a => {
					if (a.AchievementCode.includes('ASSIGNMENT')) t.add('assignment');
					if (a.AchievementCode.includes('SCORE')) t.add('score');
					if (a.AchievementCode.includes('WEEKLY')) t.add('weekly');
				});
				return t.size;
			},
			navItems() {
				return [
					{ value: 'all', icon: 'mdi-view-grid', label: 'Tất cả', count: this.achievements.length },
					{ value: 'assignment', icon: 'mdi-pencil-check', label: 'Bài tập', count: this.countByType('assignment') },
					{ value: 'score', icon: 'mdi-star', label: 'Điểm số', count: this.countByType('score') },
					{ value: 'weekly', icon: 'mdi-calendar-week', label: 'Hàng tuần', count: this.countByType('weekly') },
				];
			},
			filteredAchievements() {
				if (this.activeFilter === 'all') return this.achievements;
				return this.achievements.filter(a => {
					if (this.activeFilter === 'assignment') return a.AchievementCode.includes('ASSIGNMENT') && !a.AchievementCode.includes('WEEKLY');
					if (this.activeFilter === 'score') return a.AchievementCode.includes('SCORE');
					if (this.activeFilter === 'weekly') return a.AchievementCode.includes('WEEKLY');
					return false;
				});
			},
		},
		mounted() { if (this.HocSinh) this.fetchData(); },
		watch: {
			HocSinh(val) { if (val) this.fetchData(); }
		},
		methods: {
			countByType(type) {
				return this.achievements.filter(a => {
					if (type === 'assignment') return a.AchievementCode.includes('ASSIGNMENT') && !a.AchievementCode.includes('WEEKLY');
					if (type === 'score') return a.AchievementCode.includes('SCORE');
					if (type === 'weekly') return a.AchievementCode.includes('WEEKLY');
				}).length;
			},
			fetchData() {
				ajaxCALL('lms/EL_Student_Achievement_Get', { HocSinhID: this.HocSinh?.HocSinhID ?? 0 }, res => {
					this.achievements = res.data;
				});
			}
		}
	}
</script> 