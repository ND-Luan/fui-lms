<template>
<v-data-table 
  :headers="headers" 
  :items="DSGiaoVien111"
>
  <template v-slot:item.PhanCong="{ item }">
    <v-chip 
      color="primary" 
      size="small" 
      variant="outlined"
    >
      {{ item && item.PhanCong ? formatPhanCong(item.PhanCong) : 'Không có phân công' }}
    </v-chip>
  </template>
</v-data-table>

</template>

<script>
	export default {
		props: [],
		data() {
			return {}
		},
		mounted() {},
		computed: {},
		watch: {},
		methods: {},
	}
</script>