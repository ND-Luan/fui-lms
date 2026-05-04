<template>
	<v-card-text class="d-flex flex-column ga-4 pb-2">
		<v-img src="/_cdn/lhbs-lms/lhbs_logo.jpg" height="64" position="left">
			<template v-slot:placeholder>
				<div class="d-flex align-center justify-center fill-height">
					<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
				</div>
			</template>
		</v-img>
		<div class="d-flex w-100">
			<p class="text-h6 text-primary">{{ $t('message.selectedStudent') }}</p>
			<v-spacer></v-spacer>
			<!-- <uc-nien-khoa :is-Show-Title='false' :class-Custom='true'></uc-nien-khoa> -->
		</div>


	</v-card-text>

	<v-list lines="two" style="height: calc(-174px + 100dvh); overflow: auto">
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
			:subtitle="user.Phone + ' •  ' + user.Email">
			<template v-slot:prepend>
				<uc-avatar :user="user" />
			</template>
			<template v-slot:append>
				<div v-if="IsShow_Both_Parent_Teacher" class="d-flex flex-column justify-center align-center">
					<v-btn @click="redirect('/')" size="small" color='primary'
						icon=''><v-icon>mdi-arrow-right</v-icon></v-btn>
					<p class='text-caption'>Chuyển vai trò Giáo Viên</p>
				</div>
			</template>
		</v-list-item>

		<v-list-subheader>{{ $t('message.studentList') }}</v-list-subheader>
		<div v-for="(hocSinh, index) in DSHocSinh" :key="hocSinh.HocSinhID">
			<v-list-item :class="vueData.HocSinhSelected?.HocSinhID == hocSinh.StudentID ? 'bg-primary' : ''"
				:title="hocSinh.HoTen" :disabled="!hocSinh.IsShow">
				<v-list-item-subtitle style="line-height: 1.25rem !important">
					Lớp (Hiện tại): <b>{{hocSinh?.TenLop ?? 'Unknown'}}</b> <br />
					Mã học sinh: <b>{{hocSinh.HocSinhID}}</b>
				</v-list-item-subtitle>
				<template v-slot:prepend>
					<uc-avatar :user="hocSinh" />
				</template>
				<template v-slot:append>
					<v-btn v-if="vueData.HocSinhSelected?.HocSinhID != hocSinh.StudentID" icon="mdi-arrow-right"
						:color="vueData.HocSinhSelected?.HocSinhID == hocSinh.StudentID ? 'white' : 'primary'"
						variant="tonal" size="small" @click="onSelectedHocSinh(hocSinh, { IsSelect: true })" />
					<div v-else>
						<v-chip color="white" size="small">Đang chọn</v-chip>
					</div>
				</template>
			</v-list-item>

			<v-divider inset v-if="index !== DSHocSinh.length - 1"></v-divider>
		</div>
		<uc-empty v-if="DSHocSinh.length === 0" />
	</v-list>
	<v-btn @click="vueData.drawerSelectStudent = false" variant="tonal" color="primary" block>Đóng</v-btn>
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
				vueData,
				IsShow_Both_Parent_Teacher: false
			}
		},
		created() {
			ajaxCALL('/student/Calen_GetInfoStudentByPhuHuynhID', null, res => {
				if (res.data.length > 0) {
					const user = vueData.user
					if (user.GroupID === 1) {
						this.IsShow_Both_Parent_Teacher = true
					}
				}
			})
		},
		computed: {
			DSHocSinh: function () { return this.dshocsinh }
		},
		methods: {
			redirect
			// onChangeSemester(semester) {
			// 	this.SelectedSemester = semester
			// 	localStorage.setItem('Semester', semester)
			// }
		},
	}
</script>