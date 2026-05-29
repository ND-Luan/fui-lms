<template>
	<v-dialog v-model="isOpen">
		<div class="app-container">
			<!-- Header -->
			<div class="header-section rounded pb-0">
				<div class="d-flex px-2">

					<div class="w-100 d-flex flex-column">
						<h4 style=" font-size: 18px; font-weight: 500; margin: 8px 0 0;">{{
							assignmentInfo.Title }}
						</h4>
						<span class="subtitle-dialog-text">Môn học: {{ assignmentInfo.TenMonHoc_HienThi }}</span>
						<span class="subtitle-dialog-text">Giáo viên: {{ students[0].HoTenGV ?? '-' }}</span>
					</div>

					<v-spacer></v-spacer>
					<v-btn icon="mdi-close" variant="text" color="white" size="small"
						@click="$emit('update:isOpen', false)"></v-btn>
				</div>

				<!-- Top 3 Students -->
				<div class="top-three-container">
					<!-- Rank 2 -->
					<div class="top-student rank-2 d-flex flex-column align-center justify-center">
						<div class="rank-badge">2</div>
						<div class="student-avatar">
							<img :src="vueData.v_Set.urlAvatarHocSinh + students[1].HocSinhID" class="avatar-img"
								:alt="students[1].HoTen">
						</div>
						<div class="student-name">{{ students[1].HoTen }}</div>
						<!-- <div class="student-school">{{ students[1].school }}</div> -->
						<div class="student-score">{{ students[1].Score }}</div>
					</div>

					<!-- Rank 1 -->
					<div class="top-student rank-1 d-flex flex-column align-center justify-center">
						<div class="rank-badge">
							<v-icon color="white" size="20">mdi-crown</v-icon>
						</div>
						<div class="student-avatar">
							<img :src="vueData.v_Set.urlAvatarHocSinh + students[0].HocSinhID" class="avatar-img"
								:alt="students[0].HoTen">
						</div>
						<div class="student-name">{{ students[0].HoTen }}</div>
						<!-- <div class="student-school">{{ students[0].school }}</div> -->
						<div class="student-score">{{ students[0].Score }}</div>
					</div>

					<!-- Rank 3 -->
					<div class="top-student rank-3 d-flex flex-column align-center justify-center">
						<div class="rank-badge">3</div>
						<div class="student-avatar">
							<img :src="vueData.v_Set.urlAvatarHocSinh + students[2].HocSinhID" class="avatar-img"
								:alt="students[2].HoTen">
						</div>
						<div class="student-name">{{ students[2].HoTen }}</div>
						<!-- <div class="student-school">{{ students[2].school }}</div> -->
						<div class="student-score">{{ students[2].Score }}</div>
					</div>
				</div>
			</div>

			<!-- List của học sinh từ rank 4 trở đi -->
			<div class="leaderboard-list">
				<div v-for="(student, index) in remainingStudents" :key="student.id" class="list-item">
					<div class="rank-number">{{ index + 4 }}</div>
					<div class="list-avatar">
						<img :src="vueData.v_Set.urlAvatarHocSinh + student.HocSinhID" class="avatar-img"
							:alt="student.HoTen">
					</div>
					<div class="student-info">
						<div class="list-student-name">{{ student.HoTen }}</div>
						<!-- <div class="list-student-school">{{ student.school }}</div> -->
					</div>
					<div class="list-score">{{ student.Score }}</div>
				</div>
			</div>
		</div>
	</v-dialog>
</template>

<script>
export default {
	props: ['isOpen', 'AssignToClassID'],
	data() {
		return {
			filterTab: 'all',
			activeTab: 'week',
			students: [
				{
					id: 1,
					name: 'Kiara',
					school: 'Davidson Academy',
					score: 98,
					image: 'https://i.pravatar.cc/150?img=5'
				},
				{
					id: 2,
					name: 'Courtney',
					school: 'Walter Payton College',
					score: 95,
					image: 'https://i.pravatar.cc/150?img=1'
				},
				{
					id: 3,
					name: 'Esther',
					school: 'Davidson Academy',
					score: 93,
					image: 'https://i.pravatar.cc/150?img=9'
				},
				{
					id: 4,
					name: 'Wade Warren',
					school: 'Stuyvesant High School',
					score: 92,
					image: 'https://i.pravatar.cc/150?img=12'
				},
				{
					id: 5,
					name: 'Kathryn Murphy',
					school: 'Davidson Academy',
					score: 84,
					image: 'https://i.pravatar.cc/150?img=20'
				},
				{
					id: 6,
					name: 'Arlene McCoy',
					school: 'Walter Payton College',
					score: 82,
					image: 'https://i.pravatar.cc/150?img=25'
				},
				{
					id: 7,
					name: 'Darlene Robertson',
					school: 'Davidson Academy',
					score: 80,
					image: 'https://i.pravatar.cc/150?img=32'
				},
				{
					id: 8,
					name: 'Alfred Murdok',
					school: 'Davidson Academy',
					score: 78,
					image: 'https://i.pravatar.cc/150?img=15'
				},
			],
			assignmentInfo: {},
			vueData
		}
	},
	mounted() {
		if (this.AssignToClassID) {
			this.GET_EL_Student_GetScoreClasss_ByAssignToClassID()
		}
	},
	computed: {
		remainingStudents() {
			return this.students.slice(3);
		},
	},
	watch: {},
	methods: {
		getRankClass(rank) {
			if (rank === 1) return 'rank-1 text-white';
			if (rank === 2) return 'rank-2 text-white';
			if (rank === 3) return 'rank-3 text-white';
			return 'bg-blue-lighten-4 text-primary';
		},
		getRankIcon(rank) {
			if (rank === 1) return 'mdi-trophy';
			if (rank === 2) return 'mdi-medal';
			if (rank === 3) return 'mdi-medal';
			return 'mdi-numeric-' + rank;
		},
		getAvatarColor(index) {
			const colors = ['amber', 'blue', 'green', 'purple', 'pink', 'teal', 'orange', 'indigo', 'cyan', 'lime'];
			return colors[index % colors.length];
		},
		getProgress(score) {
			return Math.round((score / 1000) * 100);
		},
		getProgressColor(score) {
			if (score >= 900) return 'success';
			if (score >= 800) return 'primary';
			if (score >= 700) return 'warning';
			return 'error';
		},
		GET_EL_Student_GetScoreClasss_ByAssignToClassID() {
			const params = {
				AssignToClassID: this.AssignToClassID
			}
			ajaxCALL('lms/EL_Student_GetScoreClasss_ByAssignToClassID', params, res => {
				this.assignmentInfo = res.data[0][0]
				this.students = res.data[1]
			})
		}
	},
}
</script>