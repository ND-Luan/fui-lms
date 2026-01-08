<template>
	<div class="d-flex ga-4 justify-center align-center">
		<v-empty-state text-width="250">
			<template v-slot:media>
				<v-icon size="20">mdi-magnify</v-icon>
			</template>

			<template v-slot:title>
				<div class="text-caption text-high-emphasis">{{ textEmpty }}</div>
			</template>
		</v-empty-state>
	</div>
</template>
<script>
	export default {
		props: {
			text: {
				type: String,
			},
		},
		data() {
			return {
				IsLanguage: localStorage.getItem('IsLanguage') ? JSON.parse(localStorage.getItem('IsLanguage')) : false
			}
		},
		watch: {
			'$i18n.locale': function (locale) {
				if (locale === 'en') this.IsLanguage = true;
				else this.IsLanguage = false;
			},
		},
		computed: {
			textEmpty: function () {
				let text = ''
				if (this.text) {
					text = this.text
				} else {
					if (this.IsLanguage) text = 'No data found'
					else text = 'Không tìm thấy dữ liệu'
				}
				return text
			}
		}
	}
</script>