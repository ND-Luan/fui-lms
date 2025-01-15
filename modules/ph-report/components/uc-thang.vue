<template>
	<div>
		<v-divider></v-divider>
		<v-list lines="two">
			<v-list-subheader>Danh sách tháng</v-list-subheader>
			<div v-for="(thang, index) in vueData.DSHocTapThang">
				<v-list-item :title="thang.title"
					@click="()=> redirect('/report-ket-qua-hoc-tap-thang-hoc-sinh?id=' + vueData.HocSinhSelected.StudentID )">
					<template v-slot:prepend>
						<v-avatar >
							<v-img :src="thang.icon" :cover="false" bg/>
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
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			redirect,
		},
	}
</script>