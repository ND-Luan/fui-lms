<template>
	<v-divider></v-divider>
	<div style="min-height: 300px; 	height: calc(100dvh - 248px); display: flex; flex-direction: column;">
		<template v-if="IsLoading">
			<v-skeleton-loader type="heading"></v-skeleton-loader>
			<v-skeleton-loader type="list-item-two-line" v-for="i in 6" :key="i"></v-skeleton-loader>
		</template>
		<v-fade-transition>
			<v-list lines="two" v-if="!IsLoading">
				<v-list-subheader>{{$t('message.listTheme')}}</v-list-subheader>
				<div v-for="(nhomDiem, index) in DSNhomDiem">
					<v-list-item :title="renderTextTitle(nhomDiem)" @click="onRedirect(nhomDiem)">
						<template v-slot:prepend>
							<v-avatar>
								<v-img src="/_cdn/lhbs-lms/icon_tieng_anh/icon_tieng_anh.png" :cover="false" />
							</v-avatar>
						</template>
					</v-list-item>
					<v-divider v-if="index !== DSNhomDiem.length - 1" inset></v-divider>
				</div>
				<uc-empty v-if="DSNhomDiem.length === 0" />
			</v-list>
		</v-fade-transition>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			const { useI18n } = VueI18n
			const { t } = useI18n()
			return {
				t,
				vueData,
				DSNhomDiem: [],
				IsLoading: false,
				IsLanguage: JSON.parse(localStorage.getItem('IsLanguage')),
				Semester: localStorage.getItem('Semester')
			}
		},
		mounted() {
			this.IsLoading = true
			ajaxCALL('lms/PH_TA_MaNhomDiem_Get_By_HocSinhID',
				{
					HocSinhID: vueData.HocSinhSelected.StudentID,
					Semester: 'HK' + this.Semester
				},
				res => {
					this.DSNhomDiem = res.data
					this.IsLoading = false
				}
			)
		},
		computed: {
	
		},
		watch: {
			'$i18n.locale': function (locale) {
				if (locale === 'en') this.IsLanguage = true;
				else this.IsLanguage = false;
			},
		},
		methods: {
			onRedirect(nhomDiem) {
				const language = this.t('message.english')
				openWindow({
					title: language,
					url: `/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?hsid=${nhomDiem.HocSinhID}&mnd=${nhomDiem.MaNhomCotDiem}`
				})
			},
			renderTextTitle(obj) {
				return this.IsLanguage ? obj.TenNhomCotDiem_EN : obj.TenNhomCotDiem_VI
			},
			openWindow,
			redirect
		},
	}
</script>