<template>
	<v-card-text class="d-flex flex-column ga-4 pb-2">
		<v-img src="/_cdn/lhbs-lms/lhbs_logo.jpg" height="64" position="left">
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
				</div>
			</template>
		</v-img>
		<p class="text-h6 text-primary">{{ $t('message.selectedStudent') }}</p>

	</v-card-text>

	<v-list lines="two">
		<!-- <v-list-subheader>{{ $t('message.selectSemester') }}</v-list-subheader>
		<div class="d-flex ga-4 justify-center">
			<v-sheet :color="SelectedSemester == 1 ? 'primary': 'gray'"
				class="font-weight-medium text-center d-flex justify-center align-center rounded"
				style="min-width: 100px; height: 100px" @click="onChangeSemester(1)">
				{{$t('message.semester')}} 1
			</v-sheet>
			<v-sheet :color="SelectedSemester == 2 ? 'primary': 'gray'"
				class="font-weight-medium text-center d-flex justify-center align-center rounded"
				style="min-width: 100px; height: 100px" @click="onChangeSemester(2)">
				{{$t('message.semester')}} 2
			</v-sheet>
		</div> -->
		<v-list-subheader>{{ $t('message.parent') }}</v-list-subheader>
		<v-list-item :key="user.UserID" :title="user.LastName + ' ' + user.FirstName"
			:subtitle="user.Phone + ' ' + user.Email">
			<template v-slot:prepend>
				<v-avatar>
					<v-img :src="urlAvatarPhuHuynh + user.UserID" contain></v-img>
				</v-avatar>
			</template>
		</v-list-item>

		<v-list-subheader>{{ $t('message.studentList') }}</v-list-subheader>

		<div v-for="(hocSinh, index) in DSHocSinh" :key="hocSinh.StudentID">
			<v-list-item :class="vueData.HocSinhSelected?.StudentID === hocSinh.StudentID ? 'bg-primary' : ''"
				:title="hocSinh.HoTen" :subtitle="'Lớp ' + hocSinh.TenLop + ' - ' + hocSinh.StudentID"
				:disabled="!hocSinh.IsShow">
				<template v-slot:prepend>
					<v-avatar>
						<v-img :src="urlAvatarHocSinh + hocSinh.StudentID" contain></v-img>
					</v-avatar>
				</template>
				<template v-slot:append>
					<v-btn icon="mdi-arrow-right"
						:color="vueData.HocSinhSelected?.StudentID === hocSinh.StudentID ? 'white' : 'primary'"
						variant="tonal" size="small" @click="onSelectedHocSinh(hocSinh)"></v-btn>
				</template>
			</v-list-item>

			<v-divider inset v-if="index !== DSHocSinh.length - 1"></v-divider>
		</div>
	</v-list>
</template>

<script>
export default {
	props: {
		dshocsinh: { type: Array }
	},
	data() {
		const Semester = localStorage.getItem('Semester')
		return {
			user: vueData.user,
			urlAvatarPhuHuynh: vueData.v_Set.urlAvatarPhuHuynh,
			urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh,
			onSelectedHocSinh,
			SelectedSemester: Semester,
			vueData
		}
	},
	computed: {
		DSHocSinh: function () { return this.dshocsinh }
	},
	methods: {
		// onChangeSemester(semester) {
		// 	this.SelectedSemester = semester
		// 	localStorage.setItem('Semester', semester)
		// }
	},
}
</script>