<!-- File: uc-my-resources.vue -->
<template>
	<v-container fluid>
		<!-- Hàng Tiêu đề và Bộ lọc -->
		<v-row>
			<v-col cols="12">
				<v-card class="mb-4">
					<v-card-text>
						<v-row align="center">
							<v-col cols="12" md="4">
								<h3>Bài học & Bài tập của tôi</h3>
							</v-col>
							<v-col cols="12" md="4">
								<v-select v-model="vueData.MonHocID" @change="$emit('update:monHocID', $event)" :items="vueData.DSMonHoc"
									item-title="MonHocName" item-value="MonHocID" label="Lọc theo môn" clearable
									hide-details></v-select>
							</v-col>
							<v-col cols="12" md="4">
								<v-select v-model="vueData.StatusFilter"
									:items="vueData.statusOptions" item-title="text" item-value="value"
									label="Lọc theo trạng thái" hide-details></v-select>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<!-- Hàng Hiển thị danh sách -->
		<v-row>
			<v-col cols="12" v-if="vueData.isLoading">
				<v-progress-linear indeterminate></v-progress-linear>
			</v-col>
			<v-col cols="12" v-if="!vueData.isLoading && vueData.resources.length === 0">
				<p>Không tìm thấy tài nguyên nào phù hợp.</p>
			</v-col>
			<v-col cols="12" v-for="resource in vueData.resources" :key="resource.ResourceType + resource.ResourceID">
				<uc-resource-card :resource="resource" />
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
	export default {
		name: 'uc-my-resources',
		// props: {
		// 	isLoading: Boolean,
		// 	resources: Array,
		// 	dsMonHoc: Array,
		// 	monHocID: Number, // Dùng để nhận giá trị từ v-model
		// 	status: String,    // Dùng để nhận giá trị từ v-model
		// 	statusOptions: Array
		// },
		props:["statusOptions","resources","isLoading"],
		data(){return{
			vueData
		}},
		mounted(){
			console.log("data", vueData.StatusFilter)
		}
	}
</script>