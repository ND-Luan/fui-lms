<template>
	<v-card>
		<v-card-title class="d-flex justify-center">THỐNG KÊ HỌC SINH THEO ĐÁNH GIÁ</v-card-title>
		<v-card-text>
			<v-row>
				<v-col cols="3">
					<v-select label="Chọn học kì" v-model="HocKi" :items="DSHocKi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col cols="3">
					<v-select label="Chọn khối" v-model="KhoiID" :items="DSKhoi" item-title="title"
						item-value="value" />
				</v-col>
				<v-col><v-btn @click="onSearch" text="Tìm kiếm" color="primary" /></v-col>
			</v-row>
		</v-card-text>
	</v-card>
	<v-divider />
	<v-data-table class="table-bordered" :headers :items style="height: calc(100dvh - 101px)"></v-data-table>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				DSHocKi: [
					{ title: "Học kì 1", value: "HK1" },
					{ title: "Học kì 2", value: "HK2" },
				],
				HocKi: null,
				DSKhoi: [
					{ title: "Khối 6", value: 6 },
					{ title: "Khối 7", value: 7 },
					{ title: "Khối 8", value: 8 },
					{ title: "Khối 9", value: 9 },
					{ title: "Khối 10", value: 10 },
					{ title: "Khối 11", value: 11 },
					{ title: "Khối 12", value: 12 },
				],
				KhoiID: null,
				headers: [
					{ title: "STT", value: "STT" },
					{ title: "Họ và tên", value: "HoTen" },
					{ title: "Lớp", value: "TenLop" },
					{ title: "Số lượng đánh giá", value: "SoLuongDanhGia" },
					{ title: "Chi tiết", value: "ChiTiet" },
				],
				items: []
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			onSearch() {
	
			}
		},
	}
</script>