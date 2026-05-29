<template>
	<div v-if="[5,46,76].includes(vueData.MonHocItem?.MonHocID)" class="d-flex ga-2">
		<v-select :model-value="vueData.MaNhomCotDiemSelected"
			@update:model-value="(val) => {vueData.MaNhomCotDiemSelected = val}" :items="MaNhomCotDiem"
			label="Chọn mã nhóm cột điểm" multiple style="min-width:350px;max-width:500px">
			<template v-slot:selection="{ item, index }">
				<v-chip v-if="index <3" color="primary">{{item.title}}</v-chip>
				<span v-if="index ===3" class="text-grey text-caption align-self-center">
					(+{{ vueData.MaNhomCotDiemSelected.length -3 }} khác)
				</span>
			</template>
		</v-select>
		<!-- <v-select :model-value="vueData.ColumnsSelected"
			@update:model-value="(val) => {vueData.ColumnsSelected = val}" :items="vueData.ColumnsFiltered"
			label="Chọn cột điểm" multiple style="min-width:350px;max-width:500px" :disabled="vueData.MaNhomCotDiemSelected?.length == 0"
			>
			<template v-slot:selection="{ item, index }">
				<v-chip v-if="index <3" color="primary">{{item.title}}</v-chip>
				<span v-if="index ===3" class="text-grey text-caption align-self-center">
					(+{{ vueData.ColumnsSelected.length - 3 }} khác)
				</span>
			</template>
		</v-select> -->
	</div>
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
		computed: {
			MaNhomCotDiem: function () {
				return vueData.MaNhomCotDiem
			}
		},
		watch: {},
		methods: {},
	}
</script>