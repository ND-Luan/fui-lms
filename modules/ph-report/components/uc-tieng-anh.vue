<template>
	<div>
		<v-divider></v-divider>
		<v-list lines="two">
			<v-list-subheader>Danh sách chủ đề</v-list-subheader>
			<div v-for="(thang,index) in vueData.DSHocTapThangTiengAnh">
				<v-list-item :title="thang.title"
					@click="()=> redirect('/report-ket-qua-hoc-tap-tieng-anh-hoc-sinh?id=' +vueData.HocSinhSelected.StudentID)">
					<template v-slot:prepend>
						<v-avatar >
							<v-img :src="thang.icon" :cover="false" />
						</v-avatar>
					</template>
				</v-list-item>
				<v-divider v-if="index !== vueData.DSHocTapThangTiengAnh.length - 1" inset></v-divider>
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
			redirect
		},
	}
</script>