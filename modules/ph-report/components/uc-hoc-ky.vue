<template>
	<div>
		<v-divider></v-divider>
		<v-list style="overflow: auto; height: calc(100dvh - 257px);">
			<v-card>
				<v-card-title class="d-flex ">
					<img src="/_cdn/lhbs-lms/icon_hk.png" height="30" />
					<p class="ml-4"> {{$t('message.semester')}} {{HocKy}}</p>
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
								<v-card :color="monHoc.Color"
									v-for="monHoc in DSMonHoc_NhomDiem.filter(x=> x.MonHocGroup === monHocGroup.MonHocGroup)">
									<v-card-text>
										<p class="font-weight-medium">{{ monHoc.MonHocName }}</p>
									</v-card-text>
									<v-list>
										<div v-for="nhomDiem of monHoc.DSNhomDiem" :key="nhomDiem">
											<v-list-subheader class="text-primary font-weight-medium">
												<v-icon size="small" class="mb-1 me-1">mdi-star-four-points</v-icon>
												{{IsLanguage ? nhomDiem.TenNhomCotDiem_EN :
												nhomDiem.TenNhomCotDiem_VI }}
											</v-list-subheader>
											<v-list-item v-for="diem in nhomDiem.DSDiem">
												<v-list-item-title class="text-body-2">
													<v-icon size="x-large">mdi-star-four-points-small</v-icon>
													{{IsLanguage ? diem.TenCotDiem_EN : diem.TenCotDiem_VI }}
												</v-list-item-title>
												<v-list-item-subtitle
													v-if="['NhanXet'].some(keyword => diem.MaCotDiem.includes(keyword))"
													style="-webkit-line-clamp: unset">
													{{diem.KetQuaDanhGia_VI}}
												</v-list-item-subtitle>
												<template v-slot:append v-if="!diem.MaCotDiem.includes('MucDoDanhGia')">
													<v-chip
														v-if="diem.GiaTriCotDiem === 'number' && diem.KetQuaDanhGia_VI !== null"
														:color="getColorChipDiem(parseFloat(diem.KetQuaDanhGia_VI))">
														{{parseFloat(diem.KetQuaDanhGia_VI)}}
													</v-chip>
												</template>
												<template v-slot:append v-if="diem.MaCotDiem.includes('MucDoDanhGia')">
													<v-chip color="success"
														v-if="['MucDoDanhGia'].some(keyword => diem.MaCotDiem.includes(keyword))">
														{{diem.KetQuaDanhGia_VI}}
													</v-chip>
												</template>
											</v-list-item>
										</div>
										<uc-empty v-if="monHoc.DSNhomDiem.length === 0" />
										<!-- <v-divider class="mx-auto w-50 mt-2"></v-divider>
											<v-list-item>
												<v-list-item-title class="text-body-2 font-weight-medium text-primary">
													<v-icon size="small" class="mb-1">mdi-lead-pencil</v-icon>
													{{ $t('message.comment') }}
												</v-list-item-title>
												<v-list-item-subtitle class="noLineClamp">
													{{ $t('message.commentNotFound') }}
												</v-list-item-subtitle>
											</v-list-item> -->
									</v-list>
								</v-card>
							</div>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-card>
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
				DSMonHoc_NhomDiem: [],
				DSNhomDiem: [],
				MonHocSelected: null,
				IsLoadingPage: false,
				IsLoadingDSHocSinh: false,
				lodash: _,
				vueData,
				HocKy: localStorage.getItem('Semester') ?? 'HK1',
				IsLanguage: localStorage.getItem('IsLanguage') ? JSON.parse(localStorage.getItem('IsLanguage')) : fasle
			}
		},
		async mounted() {
			this.DSMonHoc_NhomDiem = await this.loadHocSinhKQHT('HK' + this.HocKy)
		},
		computed: {},
		watch: {
			'$i18n.locale': function (language) {
				if (language === 'en') this.IsLanguage = true
				else this.IsLanguage = false
				this.updateDSMonHocGroup();
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
							const DSMonHoc = data[0];
							const DSDiem = data[1];
	
							const DSMonHoc_NhomDiem = DSMonHoc.map(monHoc => {
								const arrDSDiemFilter = DSDiem
									.filter(x => x.MonHocID === monHoc.MonHocID)
									.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom || a.ThuTuCotDiem - b.ThuTuCotDiem); // Đảm bảo thứ tự đúng
	
								const DSNhomDiem = []
								const uniqueNhomDiem = [...new Set(arrDSDiemFilter.map(x => x.MaNhomCotDiem))]
								for (const MaNhomCotDiem of uniqueNhomDiem) {
									const objNhomDiem = arrDSDiemFilter.find(x => x.MaNhomCotDiem === MaNhomCotDiem)
									const DSDiem = arrDSDiemFilter.filter(x => x.MaNhomCotDiem === MaNhomCotDiem)
									let obj = {
										...objNhomDiem,
										DSDiem: DSDiem
									}
									DSNhomDiem.push(obj)
								}
	
								return {
									...monHoc,
									DSNhomDiem
								};
							});
							resolve(DSMonHoc_NhomDiem)
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