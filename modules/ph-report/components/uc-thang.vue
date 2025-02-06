<template>
	<div>
		<v-divider></v-divider>
		<v-list lines="two">
			<v-list-subheader> {{ $t('message.monthList')}}</v-list-subheader>
			<div v-for="(thang, index) in vueData.DSHocTapThang">
				<v-list-item :title="IsLanguage ? thang.titleEnglish : thang.title" @click="onRedirect(thang)">
					<template v-slot:prepend>
						<v-avatar>
							<v-img :src="thang.icon" :cover="false" />
						</v-avatar>
					</template>
				</v-list-item>
				<v-divider inset v-if="index !== vueData.DSHocTapThang.length - 1"></v-divider>
			</div>
		</v-list>
	</div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				IsLanguage: localStorage.getItem('IsLanguage') ?? false
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onRedirect(thangObj) {
				openWindow({
					title: "Kết quả học tập",
					url: `report-ket-qua-hoc-tap-thang-hoc-sinh?id=${vueData.HocSinhSelected.StudentID}&thang=${thangObj.month}&nam=${thangObj.year}`
				})
			},
			redirect,
		},
	}
</script>