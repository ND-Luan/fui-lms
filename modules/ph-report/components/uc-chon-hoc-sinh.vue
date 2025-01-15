<template>
	<v-menu transition="fab-transition" pos>
		<template v-slot:activator="{ props }">
			<v-btn v-bind="props" class="position-fixed elevation-8" style=" z-index: 10;  bottom: 70px;right: 16px; "
				icon="" size="large" variant="elevated" :flat="false" :loading="IsLoadingDSHocSinh">
				<v-img src="/_cdn/lhbs-lms/hoc_sinh.png" width="40" height="40" />
			</v-btn>
		</template>
		<v-list>
			<v-list-subheader>{{ $t('message.studentList') }}</v-list-subheader>
			<v-list-item v-for="item in DSHocSinh" :key="item.StudentID" :disabled="item.Khoi <= 0"
				@click="() => onSelectHocSinh(item)">
				<template v-slot:prepend>
					<v-avatar>
						<v-img :src="urlAvatarHocSinh + item.StudentID" />
					</v-avatar>
				</template>
				<v-list-item-title>{{ item.HoTen }}</v-list-item-title>
				<v-list-item-title>{{ item.TenLop ?? '-' }} • {{ item.StudentID }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
	export default {
		props: [],
		data() {
			const { useI18n } = VueI18n
			const { t } = useI18n()
			return {
				IsLoadingDSHocSinh: false,
				DSHocSinh: [],
				urlAvatarHocSinh: vueData.v_Set.urlAvatarHocSinh
			}
		},
		mounted() {
			this.loadInfoHocSinh()
		},
		computed: {},
		watch: {},
		methods: {
			loadInfoHocSinh() {
				this.IsLoadingDSHocSinh = true
				ajaxCALL('student/Calen_GetInfoStudentByPhuHuynhID', null, res => {
					if (res.data) {
						const DSHocSinhWithoutMamNon = res.data.filter(x => x.Khoi > 0)
						this.DSHocSinh = res.data
						const hocSinhLocalStorage = localStorage.getItem('HocSinhSelected')
						if (hocSinhLocalStorage) {
							vueData.HocSinhSelected = JSON.parse(hocSinhLocalStorage)
						} else {
							localStorage.setItem('HocSinhSelected', JSON.stringify(DSHocSinhWithoutMamNon[0]))
						}
						this.IsLoadingDSHocSinh = false
					}
				})
			},
			onSelectHocSinh(item) {
				localStorage.setItem('HocSinhSelected', JSON.stringify(item))
				vueData.HocSinhSelected = item
				console.log(item)
			}
		},
	}
</script>