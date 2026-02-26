<template>
	<v-dialog :model-value="isOpen" @update:model-value="$emit('update:isOpen', $event)" :width="mobile ? '95%' : 480"
		:max-height="mobile ? '95dvh' : '88vh'" scrollable>
		<div class="lb-shell">

			<!-- ══ HEADER ══ -->
			<div class="lb-header">
				<div class="lb-header-bg">
					<div class="lb-orb lb-orb--1"></div>
					<div class="lb-orb lb-orb--2"></div>
					<div class="lb-grid"></div>
				</div>

				<button class="lb-close" @click="$emit('update:isOpen', false)">
					<v-icon size="16" color="white">mdi-close</v-icon>
				</button>

				<div class="lb-header-content">
					<div class="lb-eyebrow">
						<v-icon size="12">mdi-podium</v-icon>
						Bảng xếp hạng
					</div>
					<h2 class="lb-title">{{ overview.Title || '…' }}</h2>
					<div class="lb-meta">
						<span v-if="overview.TenMonHoc_HienThi">
							<v-icon size="11">mdi-book-outline</v-icon>
							{{ overview.TenMonHoc_HienThi }}
						</span>
						<span v-if="students[0]?.HoTenGV">
							<v-icon size="11">mdi-account-tie-outline</v-icon>
							{{ students[0].HoTenGV }}
						</span>
						<span v-if="students.length">
							<v-icon size="11">mdi-account-group-outline</v-icon>
							{{ students.length }} học sinh
						</span>
					</div>
				</div>

				<!-- ── PODIUM ── -->
				<div class="lb-podium" v-if="!loading && students.length >= 3">

					<!-- Rank 2 -->
					<div class="lb-pod lb-pod--2">
						<div class="lb-pod-badge lb-pod-badge--2">2</div>
						<div class="lb-pod-av-wrap lb-pod-av-wrap--2">
							<img :src="avatarUrl(students[1].HocSinhID)" class="lb-pod-av" :alt="students[1].HoTen" />
						</div>
						<div class="lb-pod-name">{{ shortName(students[1].HoTen) }}</div>
						<div class="lb-pod-score lb-pod-score--2">{{ students[1].Score }}</div>
						<div class="lb-pod-bar lb-pod-bar--2"></div>
					</div>

					<!-- Rank 1 -->
					<div class="lb-pod lb-pod--1">
						<div class="lb-pod-badge lb-pod-badge--1">
							<v-icon size="13" color="#78350f">mdi-crown</v-icon>
						</div>
						<div class="lb-pod-av-wrap lb-pod-av-wrap--1">
							<img :src="avatarUrl(students[0].HocSinhID)" class="lb-pod-av" :alt="students[0].HoTen" />
							<div class="lb-pod-ring"></div>
						</div>
						<div class="lb-pod-name lb-pod-name--1">{{ shortName(students[0].HoTen) }}</div>
						<div class="lb-pod-score lb-pod-score--1">{{ students[0].Score }}</div>
						<div class="lb-pod-bar lb-pod-bar--1"></div>
					</div>

					<!-- Rank 3 -->
					<div class="lb-pod lb-pod--3">
						<div class="lb-pod-badge lb-pod-badge--3">3</div>
						<div class="lb-pod-av-wrap lb-pod-av-wrap--3">
							<img :src="avatarUrl(students[2].HocSinhID)" class="lb-pod-av" :alt="students[2].HoTen" />
						</div>
						<div class="lb-pod-name">{{ shortName(students[2].HoTen) }}</div>
						<div class="lb-pod-score lb-pod-score--3">{{ students[2].Score }}</div>
						<div class="lb-pod-bar lb-pod-bar--3"></div>
					</div>
				</div>

				<!-- Loading skeleton podium -->
				<div class="lb-podium lb-podium--skel" v-else-if="loading">
					<div class="lb-skel-pod lb-skel-pod--2"></div>
					<div class="lb-skel-pod lb-skel-pod--1"></div>
					<div class="lb-skel-pod lb-skel-pod--3"></div>
				</div>
			</div>

			<!-- ══ LIST rank 4+ ══ -->
			<div class="lb-list">

				<!-- Loading rows skeleton -->
				<template v-if="loading">
					<div v-for="n in 4" :key="n" class="lb-row-skel">
						<div class="lb-skel lb-skel--rank"></div>
						<div class="lb-skel lb-skel--av"></div>
						<div class="lb-skel lb-skel--name"></div>
						<div class="lb-skel lb-skel--score"></div>
					</div>
				</template>

				<!-- Empty -->
				<div v-else-if="!loading && remainingStudents.length === 0 && students.length >= 3" class="lb-empty">
					<v-icon size="20" color="grey-lighten-2">mdi-check-decagram</v-icon>
					Chỉ có {{ students.length }} học sinh tham gia
				</div>

				<!-- Rows -->
				<div v-else v-for="(student, idx) in remainingStudents" :key="student.HocSinhID" class="lb-row"
					:class="{ 'lb-row--me': isMe(student) }" :style="{ animationDelay: (idx * 0.035 + 0.1) + 's' }">
					<div class="lb-row-rank">{{ idx + 4 }}</div>

					<img :src="avatarUrl(student.HocSinhID)" class="lb-row-av" :alt="student.HoTen" />

					<div class="lb-row-info">
						<div class="lb-row-name">{{ student.HoTen }}</div>
						<div class="lb-row-time" v-if="student.SubmissionTime_HienThi">
							{{ student.SubmissionTime_HienThi }}
						</div>
					</div>

					<div class="lb-row-right">
						<div class="lb-bar-wrap">
							<div class="lb-bar" :style="{ width: scorePct(student.Score) + '%' }"></div>
						</div>
						<div class="lb-row-score">{{ student.Score }}</div>
					</div>
				</div>
			</div>

		</div>
	</v-dialog>
</template>

<script>
	export default {
		name: 'uc-leaderboard',
		props: {
			isOpen: Boolean,
			loading: Boolean,
			data: Object,   // { overview: {...}, students: [...] }
		},
		emits: ['update:isOpen'],
		data() {
			const { mobile } = Vuetify.useDisplay();
			return { mobile, vueData };
		},
		computed: {
			overview() {
				return this.data?.overview ?? {};
			},
			students() {
				return this.data?.students ?? [];
			},
			remainingStudents() {
				return this.students.slice(3);
			},
			maxScore() {
				if (!this.students.length) return 1;
				return Math.max(...this.students.map(s => Number(s.Score) || 0)) || 1;
			},
		},
		methods: {
			avatarUrl(id) {
				return vueData.v_Set.urlAvatarHocSinh + id;
			},
			shortName(fullName) {
				if (!fullName) return '';
				const parts = fullName.trim().split(' ');
				if (parts.length <= 2) return fullName;
				return parts[parts.length - 1] + ' ' + parts[0][0] + '.';
			},
			scorePct(score) {
				return Math.round((Number(score) / this.maxScore) * 100);
			},
			isMe(student) {
				return student.HocSinhID === vueData?.user?.UserID;
			},
		},
	}
</script>