<template>
	<div>
		<v-divider></v-divider>
		<v-list>
			<v-list-subheader> {{ $t('message.semester') }}</v-list-subheader>
			<div class="d-flex flex-column ga-4 mb-16">
				<v-card v-for="hk in DSHocKy" :key="hk.id">
					<v-card-title class="d-flex ">
						<img src="/_cdn/lhbs-lms/icon_hk.png" height="30" />
						<p class="ml-4"> {{ hk.name }}</p>
					</v-card-title>
					<v-divider></v-divider>
					<v-expansion-panels flat multiple>
						<v-expansion-panel v-for="(monHocGroup, index) in DSMonHocGroup" :key="index">
							<v-expansion-panel-title expand-icon="mdi-menu-down">
								<div class="d-flex align-center ga-4">
									<v-img :src="monHocGroup.icon" height="30" width="30"></v-img>
									<p>{{ monHocGroup.Name_VI }}</p>
								</div>
								<div></div>
							</v-expansion-panel-title>
							<v-expansion-panel-text>
								<div class="pa-4 d-flex flex-column ga-4">
									<v-card :color="randomColor()" v-for="monHoc in hk.DSMonHoc">
										<v-card-text>
											<p class="font-weight-medium">{{ monHoc.MonHocName }}</p>
											<p class="text-caption">
												{{ $t('message.rating') }}:
												{{ monHoc.XepLoai ?? '-' }}
											</p>
											<p class="text-caption">
												{{ $t('message.averageScore') }}:
												<v-chip :color="getColorChipDiem(monHoc.Diem)" size="small">
													{{ monHoc.Diem ?? '-' }}
												</v-chip>
											</p>
										</v-card-text>
										<v-list>
											<div v-for="(diem, index) in hk.DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)"
												:key="index">
												<v-list-subheader class="text-primary font-weight-medium"
													v-if="DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index].TenNhomCotDiem_VI !== DSDiem.filter((e) => e.MonHocID === MonHocSelected?.MonHocID)[index - 1]?.TenNhomCotDiem_VI">
													<v-icon size="small" class="mb-1 me-1">mdi-star-four-points</v-icon>
													{{ diem.TenNhomCotDiem_VI }}
												</v-list-subheader>
												<v-list-item>
													<v-list-item-title class="text-body-2">
														<v-icon size="x-large">mdi-star-four-points-small</v-icon>
														{{ diem.TenCotDiem_VI }}
													</v-list-item-title>
													<template v-slot:append>
														<v-chip
															:color="getColorChipDiem(parseFloat(diem.KetQuaDanhGia_VI))">{{
																parseFloat(diem.KetQuaDanhGia_VI) }}</v-chip>
													</template>
												</v-list-item>
											</div>
											<v-divider class="mx-auto w-50 mt-2"></v-divider>
											<v-list-item>
												<v-list-item-title class="text-body-2 font-weight-medium text-primary">
													<v-icon size="small" class="mb-1">mdi-lead-pencil</v-icon>
													{{ $t('message.comment') }}
												</v-list-item-title>
												<v-list-item-subtitle class="noLineClamp">
													{{ $t('message.commentNotFound') }}
												</v-list-item-subtitle>
											</v-list-item>
										</v-list>
									</v-card>
								</div>
							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-card>
			</div>
		</v-list>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		const { useI18n } = VueI18n
		const { t } = useI18n()
		return {
			DSHocKy: [
				{
					id: 1,
					code: 'HK1',
					name: `${t('message.semester')} 1`
				},
				{
					id: 2,
					code: 'HK2',
					name: `${t('message.semester')} 2`
				},
			],
			DSMonHocGroup: [
				{
					MonHocGroup: 1,
					Name_VI: t('message.Skill_Knowledge'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png',
				},
				{
					MonHocGroup: 2,
					Name_VI: t('message.Common_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_chung_icon.png',
				},
				{
					MonHocGroup: 3,
					Name_VI: t('message.Quality'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/pham_chat_icon.png',
				},
				{
					MonHocGroup: 4,
					Name_VI: t('message.Personal_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_rieng.png',
				},
			],
			DSMonHoc: [],
			DSMonHoc_ByGroup: [],
			MonHocGroup_Obj: {},
			DSNhomDiem: [],
			MonHocSelected: null,
			IsLoadingPage: false,
			IsLoadingDSHocSinh: false,
			vueData
		}
	},
	async mounted() {
		for (var hk of this.DSHocKy) {
			const { DSMonHoc, DSDiem, DSNhomDiem } = await this.loadHocSinhKQHT(hk.code)
			hk.DSMonHoc = DSMonHoc
			hk.DSDiem = DSDiem
			hk.DSNhomDiem = DSNhomDiem
		}

		console.log('DSHocKy', this.DSHocKy)
	},
	computed: {},
	watch: {
		'$i18n.locale': function (language) {
			console.log(language)
			this.updateDSMonHocGroup();
			this.updateDSHocKy();
		},
	},
	methods: {
		loadHocSinhKQHT(code) {
			return new Promise(async resolve => {
				ajaxCALL('lms/HocSinh_KQHT',
					{
						HocSinhID: vueData.HocSinhSelected.StudentID,
						LopNhom: vueData.HocSinhSelected.LopID,
						Semester: code
					},
					res => {
						const data = res.data
						const DSMonHoc = data[0]
						const DSDiem = data[1]

						const DSNhomDiem = DSDiem.reduce((result, element) => {
							if (!result[element.TenNhomCotDiem_VI]) {
								result[element.TenNhomCotDiem_VI] = []
							}
							result[element.TenNhomCotDiem_VI].push(element)
							return result
						}, [])
						resolve({ DSMonHoc, DSDiem, DSNhomDiem })
					}
				)
			})
		},
		updateDSMonHocGroup() {
			this.DSMonHocGroup = [
				{
					MonHocGroup: 1,
					Name_VI: this.$t('message.Skill_Knowledge'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png',
				},
				{
					MonHocGroup: 2,
					Name_VI: this.$t('message.Common_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_chung_icon.png',
				},
				{
					MonHocGroup: 3,
					Name_VI: this.$t('message.Quality'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/pham_chat_icon.png',
				},
				{
					MonHocGroup: 4,
					Name_VI: this.$t('message.Personal_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_rieng.png',
				},
			];
		},
		updateDSHocKy() {
			this.DSHocKy = [
				{
					...this.DSHocKy[0],
					name: `${this.$t('message.semester')} 1`

				},
				{
					...this.DSHocKy[1],
					name: `${this.$t('message.semester')} 2`
				}
			]
		},
		randomColor() {
			const colorList = [
				'red-lighten-1',
				'pink-lighten-1',
				'purple-lighten-2',
				'purple-lighten-3',
				'deep-purple-lighten-2',
				'indigo-lighten-2',
				'blue-lighten-1',
				'cyan-darken-1',
				'teal-lighten-2',
				'green-lighten-1',
				'light-green-darken-1',
				'lime-lighten-2',
				'amber-lighten-4',
				'orange-darken-1',
				'deep-orange-lighten-1',
				'brown-lighten-2',
				'blue-grey-lighten-2',
				'grey-darken-1',
			]
			const randomIndex = Math.floor(Math.random() * colorList.length);
			return colorList[randomIndex];
		},
		getColorChipDiem
	},
}
</script>