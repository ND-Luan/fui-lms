<template>
	<v-menu>
		<template v-slot:activator="{ props }">
			<v-btn icon="mdi-dots-horizontal" variant="text" v-bind="props"></v-btn>
		</template>
		<v-list>
			<v-list-item @click="onOpenModalEditMauBangDiem(item)">
				<v-list-item-title>
					<v-icon color="green darken-2" small class="mr-2"> mdi-square-edit-outline </v-icon>
					Cập nhật
				</v-list-item-title>
			</v-list-item>
			<v-list-item @click="onOpenModalCHCotDiem(item)">
				<v-list-item-title>
					<v-icon small class="mr-2"> mdi-table-settings </v-icon>
					Cấu hình cột điểm
				</v-list-item-title>
			</v-list-item>
			<v-list-item @click="onOpenModalCopyCotDiem(item)">
				<v-list-item-title>
					<v-icon small class="mr-2"> mdi-table-settings </v-icon>
					Sao chép cấu trúc điểm
				</v-list-item-title>
			</v-list-item>
			<v-list-item @click="onHandleDeleteMauBangDiem(item)">
				<v-list-item-title>
					<v-icon color="red darken-3" small class="mr-2"> mdi-trash-can-outline </v-icon>
					Xóa
				</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-menu>
</template>

<script>
	export default {
	    props: {
	        item: {
	            type: Object
	        }
	    },
	    data() {
	        return {
	            vueData,
	        }
	    },
	    mounted() { },
	    computed: {},
	    watch: {},
	    methods: {
	        onOpenModalAddMauBangDiem() {
	            vueData.isShowModalAddMauBangDiem = true
	        },
	        onOpenModalEditMauBangDiem(record) {
	            vueData.recordMauBangDiem = _.cloneDeep(record)
	            vueData.isShowModalEditMauBangDiem = true
	        },
	        onOpenModalCHCotDiem(record) {
	            vueData.recordMauBangDiem = _.cloneDeep(record)
	            vueData.isShowModalCHCotDiem = true
	        },
	        onOpenModalCopyCotDiem(record) {
	            vueData.recordMauBangDiem = _.cloneDeep(record)
	            vueData.isShowModalCopyCotDiem = true
	        },
	        onHandleDeleteMauBangDiem(record) {
	            confirm({
	                title: `Bạn có chắc muốn xóa mẫu bảng điểm ${record.TemplateBangDiemName}?`,
	                async action() {
	                    const res = await TemplateBangDiem_Service.Del({
	                        TemplateBangDiemID: record.TemplateBangDiemID,
	                    })
	                    if (res) {
	                        Vue.$toast.success('Xóa mẫu bảng điểm thành công!', { position: 'top' })
                            CALL('TemplateBangDiem_Get')
	                    }
	                }
	            })
	        }
	    },
	}
</script>