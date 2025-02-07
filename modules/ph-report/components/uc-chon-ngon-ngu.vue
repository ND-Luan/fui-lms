<template>
	<v-card style="height: 100%;">
		<v-card-text class="d-flex flex-column ga-4 pb-2">
			<v-img src="/_cdn/lhbs-lms/lhbs_logo.jpg" height="64" position="left">
				<template v-slot:placeholder>
					<div class="d-flex align-center justify-center fill-height">
						<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
					</div>
				</template>
			</v-img>

			<v-img class="align-self-center" src="/_cdn/lhbs-lms/img_page_ph/img_chon_hs.png" width="400">
				<template v-slot:placeholder>
					<div class="d-flex align-center justify-center fill-height">
						<v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
					</div>
				</template>
			</v-img>

			<p class="text-h6 text-primary">{{ $t('message.selectLanguage') }}</p>
			<div class="d-flex ga-4 justify-center">
				<v-sheet class=" pa-4 d-flex flex-column justify-center align-center border-thin rounded cursor-pointer"
					style="min-width: 100px" @click="onActive(false)" :class="IsLanguage ? '' : 'bg-primary'">
					<v-img src="/_cdn/lhbs-lms/img_page_ph/icon_vietnam.png" width="30" />
					<p class=" mt-2">{{ $t('message.vietNam') }}</p>
				</v-sheet>
				<v-sheet class=" pa-4 d-flex flex-column justify-center align-center border-thin rounded cursor-pointer"
					style="min-width: 100px" @click="onActive(true)" :class="IsLanguage ? 'bg-primary' : ''">
					<v-img src="/_cdn/lhbs-lms/img_page_ph/icon_english.png" width="30" />
					<p class=" mt-2">{{ $t('message.english') }}</p>
				</v-sheet>
			</div>

			<v-btn v-if="!isonbroading" block variant="tonal" color="primary"
				@click="vueData.drawerLanguage = false">Đóng</v-btn>
		</v-card-text>
	</v-card>
</template>

<script>
export default {
	props: {
		onchangelanguage: {
			type: Function,
		},
		isonbroading: { type: Boolean, default: true }
	},
	data() {
		const IsLanguage = JSON.parse(localStorage.getItem('IsLanguage')) ?? false
		this.$i18n.locale = IsLanguage ? "en" : "vi"

		this.$emit('onchangelanguage', IsLanguage)
		return { IsLanguage, vueData }
	},
	watch: {
		IsLanguage: function (IsLanguage) {
			if (IsLanguage) this.$i18n.locale = 'en';
			else this.$i18n.locale = 'vi';
			localStorage.setItem('IsLanguage', IsLanguage)
			this.$emit('onchangelanguage', IsLanguage)
		}
	},
	methods: {
		onActive(isLanguage) {
			this.IsLanguage = isLanguage
		}
	},
}
</script>