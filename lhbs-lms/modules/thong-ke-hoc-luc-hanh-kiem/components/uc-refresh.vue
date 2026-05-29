<template>
	<v-btn color="primary">
		Tìm kiếm <v-icon end>mdi-chevron-down</v-icon>
		<v-menu activator="parent">
			<v-list>
				<v-list-item title="In tất cả các khối"
					@click="vueData.Is_InCaKhoi = false; vueData.TongKet_GetDTBMonHocByKhoiLop()">
				</v-list-item>
				<v-list-item>
					<template v-slot:append>
						<v-icon icon="mdi-menu-right" size="x-small"></v-icon>
					</template>
					In báo cáo sở
					<v-menu :open-on-focus="false" activator="parent" open-on-hover submenu>
						<v-list>
							<v-list-item title="2 mặt GD"
								@click="vueData.MatBaoCaoItem = { text: '2 mặt GD', value: '1' }; vueData.Is_InCaKhoi = true; vueData.TongKet_GetDTBMonHocByKhoiLop()">
							</v-list-item>
							<v-list-item title="Dân tộc"
								@click="vueData.MatBaoCaoItem = { text: 'Dân tộc', value: '2' }; vueData.Is_InCaKhoi = true; vueData.TongKet_GetDTBMonHocByKhoiLop()">
							</v-list-item>
						</v-list>
					</v-menu>
				</v-list-item>
			</v-list>
		</v-menu>
	</v-btn>
</template>

<script>
	export default {
	    props: [],
	    data() {
	        return {
	            vueData,
	            // DSMatBaoCao: [{ text: '2 mặt GD', value: '1' }, { text: 'Dân tộc', value: '2' }]
	        }
	    },
	    mounted() { },
	    computed: {},
	    watch: {},
	    methods: {
	
	    },
	}
</script>