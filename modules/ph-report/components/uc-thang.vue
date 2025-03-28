<template>
	<div style="height: calc(100dvh - 248px)">
		<v-divider></v-divider>
		<v-list lines="two" style="height: 100%">
			<v-list-subheader> {{ $t('message.monthList') }}</v-list-subheader>
			<div v-for="(thang, index) in vueData.DSHocTapThang">
				<v-list-item :title="renderTextTitle(thang)" @click="onRedirect(thang)">
					<template v-slot:prepend>
						<v-avatar>
							<v-img :src="thang.IconUrl" :cover="false" />
						</v-avatar>
					</template>
					<template v-slot:append>
						<v-chip v-if="thang.Is_Viewed" :color="thang.MauTinhTrang">
							{{ $t('message.announced') }}</v-chip>
						<v-chip v-else>{{ $t('message.notYetAnnounced') }}</v-chip>
					</template>
				</v-list-item>
				<v-divider inset v-if="index !== vueData.DSHocTapThang.length - 1"></v-divider>
			</div>
			<uc-empty v-if="vueData.DSHocTapThang.length === 0" class="text-center" />
		</v-list>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				IsLanguage: JSON.parse(localStorage.getItem('IsLanguage'))
			}
		},
		mounted() { },
		computed: {},
		watch: {
			'$i18n.locale': function (locale) {
				console.log(locale,)
				if (locale === 'en') this.IsLanguage = true;
				else this.IsLanguage = false;
			},
		},
		methods: {
			onRedirect(thangObj) {
				openWindow({
					title: "Kết quả học tập",
					url: `report-ket-qua-hoc-tap-thang-hoc-sinh?id=${vueData.HocSinhSelected.StudentID}&lop_nxtid=${thangObj.Lop_NhanXetThangID}`,
					onclose: {
						"CALL": "getDSThang"
					}
				})
			},
			renderTextTitle(thang) {
				return this.IsLanguage ? thang.Thang_HienThi_EN : thang.Thang_HienThi_VI
			},
			redirect,
		},
	}
</script>