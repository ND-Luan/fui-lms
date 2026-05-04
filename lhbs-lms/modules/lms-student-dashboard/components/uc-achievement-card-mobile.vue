<template>
	<!-- Activator -->
	<slot name="activator" :activator-props="{ onClick: () => isSheet = true }">
		<v-btn variant="flat" size="small" color="primary" @click="isSheet = true">
			<v-icon start>mdi-trophy</v-icon>
			Thành tích
		</v-btn>
	</slot>

	<v-bottom-sheet v-model="isSheet" :inset="false">
		<div class="acm">
			<!-- Drag handle -->
			<div class="acm__handle-wrap">
				<div class="acm__handle"></div>
			</div>

			<!-- Header: avatar + tên + close -->
			<div class="acm__header">
				<div class="acm__header-left">
					<div class="acm__header-avatar">
						<v-icon size="22" color="white">mdi-trophy</v-icon>
					</div>
					<div>
						<div class="acm__header-title">Thành Tích</div>
						<div class="acm__header-subtitle">{{ studentName }}</div>
					</div>
				</div>
				<v-btn icon="mdi-close" variant="text" size="small" density="comfortable" @click="isSheet = false" />
			</div>

			<!-- Stats row -->
			<div class="acm__stats">
				<div class="acm__stat">
					<div class="acm__stat-number">{{ totalAchievements }}</div>
					<div class="acm__stat-label">Thành tích</div>
				</div>
				<div class="acm__stat-divider"></div>
				<div class="acm__stat">
					<div class="acm__stat-number">{{ totalPoints }}</div>
					<div class="acm__stat-label">Điểm thưởng</div>
				</div>
				<div class="acm__stat-divider"></div>
				<div class="acm__stat">
					<div class="acm__stat-number">{{ uniqueTypes }}</div>
					<div class="acm__stat-label">Loại hình</div>
				</div>
			</div>

			<!-- Chip filter -->
			<div class="acm__chips">
				<v-chip v-for="item in filterItems" :key="item.value"
					:color="activeFilter === item.value ? 'primary' : undefined"
					:variant="activeFilter === item.value ? 'flat' : 'tonal'" size="default" rounded="lg"
					class="acm__chip" @click="activeFilter = item.value">
					<v-icon start size="15">{{ item.icon }}</v-icon>
					{{ item.label }}
					<span class="acm__chip-count" :class="{ 'acm__chip-count--active': activeFilter === item.value }">
						{{ item.count }}
					</span>
				</v-chip>
			</div>

			<!-- Section label -->
			<div class="acm__section">
				<v-icon size="14" color="primary">mdi-medal</v-icon>
				{{ filteredAchievements.length }} thành tích
			</div>

			<!-- Scrollable list -->
			<div class="acm__list">
				<!-- Empty -->
				<div v-if="filteredAchievements.length === 0" class="acm__empty">
					<v-icon size="52" color="grey-lighten-2">mdi-trophy-broken</v-icon>
					<div class="acm__empty-title">Chưa có thành tích</div>
					<div class="acm__empty-sub">Hãy hoàn thành bài tập để nhận thành tích!</div>
				</div>

				<!-- Cards -->
				<div v-for="achievement in filteredAchievements" :key="achievement.AchievementID" class="acm__card">
					<!-- Color accent -->
					<div class="acm__card-accent" :style="{ backgroundColor: achievement.Color }"></div>

					<div class="acm__card-icon"
						:style="{ backgroundColor: achievement.Color + '20', color: achievement.Color }">
						<v-icon size="22" :color="achievement.Color">{{ achievement.Icon }}</v-icon>
					</div>

					<div class="acm__card-body">
						<div class="acm__card-title">{{ achievement.Title }}</div>
						<div class="acm__card-desc">{{ achievement.Description }}</div>
						<div class="acm__card-meta">
							<span class="acm__card-points">
								<v-icon size="12" color="#F57C00">mdi-star</v-icon>
								+{{ achievement.PointsEarned }} điểm
							</span>
							<span v-if="achievement.PointsEarned >= 50" class="acm__card-vip">
								<v-icon size="11" color="amber-darken-2">mdi-star-circle</v-icon>
								VIP
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</v-bottom-sheet>
</template>

<script>
	export default {
	name: 'uc-achievement-card-mobile',
	props: {
		HocSinh: { type: Object }
	},
	data() {
		return {
			isSheet: false,
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
		filterItems() {
			return [
				{ value: 'all',        icon: 'mdi-view-grid',     label: 'Tất cả',    count: this.achievements.length },
				{ value: 'assignment', icon: 'mdi-pencil-check',  label: 'Bài tập',   count: this.countByType('assignment') },
				{ value: 'score',      icon: 'mdi-star',          label: 'Điểm số',   count: this.countByType('score') },
				{ value: 'weekly',     icon: 'mdi-calendar-week', label: 'Hàng tuần', count: this.countByType('weekly') },
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