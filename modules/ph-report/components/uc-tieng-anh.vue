<template>
	<v-divider></v-divider>
	<div class="d-flex flex-column" style="max-height: calc(100dvh - 213px); overflow: auto; padding-bottom: 42px;">
		<template v-if="IsLoading">
			<v-skeleton-loader type="heading"></v-skeleton-loader>
			<v-skeleton-loader type="list-item-two-line" v-for="i in 6" :key="i"></v-skeleton-loader>
		</template>
		<v-fade-transition>
			<v-responsive>
				<v-list>
					<v-list-subheader> {{ $t('message.english') }}</v-list-subheader>
					<div v-for="(nhomDiem, index) in DSNhomDiem" :key="index" class="cursor-pointer">
						<v-list-item @click="onRedirect(nhomDiem)">
							<template v-slot:prepend>
								<v-avatar :rounded="10">
									<v-img src="/_cdn/lhbs-lms/icon_tieng_anh/education.png" :cover="false" />
								</v-avatar>
							</template>
							<v-list-item-title>{{ renderTextTitle(nhomDiem) }}</v-list-item-title>
						</v-list-item>
						<v-divider v-if="index !== DSNhomDiem.length - 1" inset></v-divider>
					</div>
					<uc-empty v-if="DSNhomDiem.length === 0" class="text-center" />
				</v-list>
			</v-responsive>
		</v-fade-transition>
		<uc-chartTA2-HocSinh v-if="vueData.HocSinhSelected?.CapID == 3" />
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
				selectedGroup: null,
				IsLoading: false,
				IsLanguage: JSON.parse(localStorage.getItem('IsLanguage')),
				Semester: localStorage.getItem('Semester'),
			}
		},
		async mounted() {
			console.log('vueData.HocSinhSelected uc-TiengAnh', vueData.HocSinhSelected)
			if (!vueData.HocSinhSelected) return
	
			const IsPassRoleParentString = localStorage.getItem("IsPassRoleParent")
			const IsPassRoleParent = Boolean(IsPassRoleParentString) ?? false
			let url = ''
			//Nếu từ bên Giáo viên qua
			if (IsPassRoleParent)
				url = 'lms/gv_TA_MaNhomDiem_Get_By_HocSinhID'
			else
				url = 'lms/PH_TA_MaNhomDiem_Get_By_HocSinhID'
	
			this.IsLoading = true
			ajaxCALL(url,
				{
					HocSinhID: vueData.HocSinhSelected.HocSinhID,
					NienKhoa: vueData.NienKhoa
				},
				res => {
					console.log('res', res.data)
					if (vueData.HocSinhSelected.CapID === 1) {
						this.DSNhomDiem = res.data
					} else {
						const ListMaNhomCotDiem = ['S1_Mid', 'S1_Final', 'S2_Mid', 'S2_Final']
						this.DSNhomDiem = res.data
							.filter(x => ListMaNhomCotDiem.includes(x.MaNhomCotDiem))
							.map(item => {
								item.TenNhomCotDiem_VI = item.TenNhomCotDiem_VI.replace('Điểm', 'Đánh giá')
								return item
							})
						console.log('this.DSNhomDiem', this.DSNhomDiem)
					}
					this.IsLoading = false
					this.XepNhomTiengAnh()
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
					url: `/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?hsid=${nhomDiem.HocSinhID}&mnd=${nhomDiem.MaNhomCotDiem}&tnd=${nhomDiem.TenNhomCotDiem_VI}`
				})
			},
			renderTextTitle(obj) {
				return this.IsLanguage ? obj.TenNhomCotDiem_EN : obj.TenNhomCotDiem_VI
			},
			XepNhomTiengAnh() {
				ajaxCALL('/lms/XepNhomTiengAnh_GetByHocSinhID', {
					HocSinhID: vueData.HocSinhSelected.HocSinhID
				},
					res => {
						if (res.data.length > 0) {
							this.DSNhomDiem.unshift({
								TenNhomCotDiem_VI: "Xếp nhóm Tiếng Anh",
								TenNhomCotDiem_EN: "Survey results",
								MaNhomCotDiem: "NhomTiengAnh",
								HocSinhID: vueData.HocSinhSelected.HocSinhID
							})
						}
					})
			},
			openWindow,
			redirect
		},
	}
</script>