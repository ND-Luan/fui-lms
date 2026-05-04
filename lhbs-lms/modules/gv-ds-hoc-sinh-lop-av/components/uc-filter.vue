<template>
	<v-card>
		<v-card-title class="text-primary px-0 pt-0">
			{{vueData.TitlePage}}

			<v-chip class="ml-2" color='primary' v-if="vueData.DSHocSinhLop.length > 0">Tổng học sinh: <b
					class='ml-1'>{{vueData.DSHocSinhLop.length}}</b></v-chip>
		</v-card-title>
		<v-row dense>
			<v-col>
				<v-select label="Chọn khối" v-model="vueData.KhoiItem" :items="vueData.DSKhoi" item-title="TenKhoiHoc"
					item-value="KhoiID" :return-object="true" :hide-details="true"></v-select>
			</v-col>
			<v-col>
				<v-select label="Chọn lớp" v-model="vueData.LopItem" :items="vueData.DSLop.filter(item => item.TenLop.includes('AV'))" :item-title="renderTextLop"
					item-value="LopID" :return-object="true" :hide-details="true"></v-select>
			</v-col>
			<v-col>
				<f-button label="Làm mới" color="primary" :action="vueData.onRefresh" variant="outlined"></f-button>
			</v-col>
		</v-row>
	</v-card>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			renderTextLop(item) {
				let string = item.TenLop
				if (item.GVCN === vueData.user.UserID) string += ' (Bạn đang giáo viên chủ nhiệm của lớp)'
				return string
			}
		},
	}
</script>