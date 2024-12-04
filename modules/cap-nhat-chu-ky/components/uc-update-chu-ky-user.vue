<template>
	<v-row>
		<v-col cols="12">
			<v-list-item>
				<template v-slot:prepend>
					<v-avatar size="100">
						<v-img :src="urlAvatarPhuHuynh + vueData.ChuKyObj?.GiaoVienID" />
					</v-avatar>
				</template>
				<v-list-item-title>{{vueData.ChuKyObj?.HoTenGV}}</v-list-item-title>
				<v-list-item-subtitle>{{vueData.ChuKyObj?.GiaoVienID}}</v-list-item-subtitle>
			</v-list-item>
		</v-col>
		<v-divider class="mx-auto w-50 mt-2 mb-2"></v-divider>
		<v-col cols="12">
			<p class="text-primary text-title font-weight-medium">Cập nhật hình ảnh</p>
			<f-file-upload class="mt-2" :url="vueData.v_Set.apiFile" @input="handleUploadFile" color="primary"
				variant="tonal"></f-file-upload>
			<v-img class="mt-2" :src="vueData.v_Set.urlReturnFile+ '/FileData/' +  vueData.ChuKyObj?.HinhAnhChuKy"
				:width="200" />
		</v-col>
	</v-row>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				vueData,
				urlAvatarPhuHuynh: vueData.v_Set.urlAvatarPhuHuynh
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {
			handleUploadFile(file) {
				const _file = file.Files[0]
				vueData.ChuKyObj.HinhAnhChuKy = _file.FILE_ID
			}
		},
	}
</script>