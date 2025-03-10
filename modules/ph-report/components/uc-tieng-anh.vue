<template>
	<div>
		<v-divider></v-divider>
		<v-skeleton-loader v-if="IsLoading" type="heading"></v-skeleton-loader>
		<v-skeleton-loader v-if="IsLoading" type="list-item-two-line" v-for="i in 6">
		</v-skeleton-loader>
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
			return {
				vueData,
				DSNhomDiem: [],
				IsLoading: false,
				IsLanguage: JSON.parse(localStorage.getItem('IsLanguage'))
			}
		},
		mounted() {
			this.IsLoading = true
			ajaxCALL('lms/PH_TA_MaNhomDiem_Get_By_HocSinhID',
				{
					HocSinhID: vueData.HocSinhSelected.StudentID
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
				console.log(locale,)
				if (locale === 'en') this.IsLanguage = true;
				else this.IsLanguage = false;
			},
		},
		methods: {
			onRedirect(nhomDiem) {
				openWindow({
					title: "Tiếng anh",
					url: '/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?hsid=' + nhomDiem.HocSinhID + '&mnd=' + nhomDiem.MaNhomCotDiem
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