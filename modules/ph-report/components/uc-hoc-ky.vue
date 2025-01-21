<template>
	<div>
		<v-divider></v-divider>
		<v-list>
			<v-list-subheader>Học kỳ</v-list-subheader>
			<div class="d-flex flex-column ga-4 mb-16">
				<v-card v-for="hk in DSHocKy" :key="hk.id">
					<v-card-title class="d-flex ">
						<img src="/_cdn/lhbs-lms/icon_hk.png" height="30" />
						<p class="ml-4"> {{ hk.name }}</p>
					</v-card-title>
					<v-divider></v-divider>
					<v-expansion-panels flat multiple>
						<v-expansion-panel v-for="(monHocGroup, index) in DSMonHocGroup" :key="index"
							@click="(e) => onExpandMonHocGroup(e, hk, monHocGroup)">
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
											<p class="text-caption">Xếp loại: {{ monHoc.XepLoai ?? '-' }}</p>
											<p class="text-caption">
												Điểm trung bình:
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
													<v-icon size="small" class="mb-1">mdi-lead-pencil</v-icon> Nhận xét
												</v-list-item-title>
												<v-list-item-subtitle class="noLineClamp"> Chưa có nhận xét
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
						name: 'Học kỳ 1'
					},
					{
						id: 2,
						code: 'HK2',
						name: 'Học kỳ 2'
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
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onExpandMonHocGroup(){
				
			}
		},
	}
</script>