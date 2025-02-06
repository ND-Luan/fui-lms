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
			<v-list-item :title="hocSinh.HoTen" :subtitle="'Lớp ' + hocSinh.TenLop + ' - ' + hocSinh.StudentID"
				:disabled="!hocSinh.IsShow">
				<template v-slot:prepend>
					<v-avatar>
						<v-img :src="urlAvatarHocSinh + hocSinh.StudentID" contain></v-img>
					</v-avatar>
				</template>
				<template v-slot:append>
					<v-btn icon="mdi-arrow-right" color="primary" variant="tonal" size="small"
						@click="() => onSelectedHocSinh(hocSinh)"></v-btn>
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
			return {
				user: vueData.user,
				urlAvatarPhuHuynh: vueData.v_Set.urlAvatarPhuHuynh,
				urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh,
				onSelectedHocSinh,
			}
		},
		mounted() { },
		computed: {
			DSHocSinh: function () { return this.dshocsinh }
		},
		watch: {},
		methods: {},
	}
</script>