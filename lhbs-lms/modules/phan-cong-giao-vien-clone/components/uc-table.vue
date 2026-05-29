<template>
	<v-data-table :headers="headerPC" :items="vueData.DSPhanCong" hide-default-footer show-expand>
		<template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
			<v-btn :append-icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
				:text="isExpanded(internalItem) ? 'Collapse' : 'More info'" class="text-none" color="medium-emphasis"
				size="small" variant="text" border slim @click="toggleExpand(internalItem)"></v-btn>
		</template>

		<template v-slot:expanded-row="{ columns, item }">
			<tr>
				<td :colspan="columns.length" class="py-2">
					<v-sheet rounded="lg" border>
						<v-table density="compact">
							<tbody class="bg-surface-light">
								<tr>
									<th>Tên môn học</th>
									<th>Lớp</th>
									<th>Thao tác</th>
								</tr>
							</tbody>

							<tbody>
								<tr v-for="lop in item.List_Lop">
									<td> {{lop.TenKhoiHoc}} - {{lop.MonHocName}} </td>
									<td> {{lop.TenLop}}</td>
									<td class="pa-1">
										<v-btn icon="mdi-delete" color="red" variant="outlined" size="small"></v-btn>
									</td>
								</tr>
							</tbody>
						</v-table>
					</v-sheet>
				</td>
			</tr>
		</template>
	</v-data-table>
</template>

<script>
	export default {
		props: {},
		data() {
			return {
				vueData,
				headerPC: [{
					"title": "Mã nhân viên",
					"value": "GiaoVienID"
				},
				{
					"title": "Họ tên",
					"value": "HoTen"
				}
				]
			}
		},
		mounted() { },
		computed: {},
		watch: {},
		methods: {},
	}
</script>