<template>
	<div class="pa-4">
            <v-card>
                <v-card-title class="primary--text">Tìm kiếm</v-card-title>
                <v-card-text>
                    <v-row>
                        <v-col cols="2">
                            <v-select v-model="MonHocID" label="Chọn môn học" :items="DSMonHoc" item-text="MonHocName" item-value="MonHocID" dense hide-details="auto" outlined></v-select>
                        </v-col>
                        <v-col>
                            <v-btn @click="onSearch" color="primary">Làm mới</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <v-card class="mt-4">
                <v-card-title class="primary--text">Môn học lớp
                    <v-spacer></v-spacer>
                    <v-btn @click="IsShowDialogAdd = true" outlined fab small color="primary"><v-icon>mdi-plus</v-icon></v-btn>
                </v-card-title>
                <a-table :data-source="DSMonHocLop" size="small">
                    <a-table-column title="Tên lớp" data-index="TenLop">
                    </a-table-column>
                     <a-table-column title="Tên khối" data-index="TenKhoi">
                    </a-table-column>
                      <a-table-column title="Tên đơn vị" data-index="TenDonVi">
                    </a-table-column>
                </a-table>
            </v-card>
            <v-dialog v-model="IsShowDialogAdd" width="500">
                <v-card>
                    <v-card-title>
                        Thêm mới
                        <v-spacer></v-spacer>
                        <v-icon @click="IsShowDialogAdd = false" >mdi-close</v-icon>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="formAdd">
                            <v-row>
                                <v-col >
                                    <v-autocomplete
                                        class="select-chip"
                                        v-model="formAdd.List_LopID"
                                        label="Chọn lớp"
                                        :items="DSLop" item-text="TenLopHienThi" item-value="LopID" multiple outlined dense hide-details="auto"
                                        :rules="[v => !!v || 'Bạn chưa chọn lớp']"
                                        :loading="IsLoadingDSLop"
                                        chips
                                        deletable-chips = "true"
                                    >
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn @click="IsShowDialogAdd = false" text>Đóng</v-btn>
                        <v-btn @click="insMonHocLop_Ins" color="primary">Lưu</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
	</div>
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