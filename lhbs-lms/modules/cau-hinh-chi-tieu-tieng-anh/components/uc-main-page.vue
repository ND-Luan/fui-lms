<template>
	<v-card>
		<v-toolbar extended>
			<v-toolbar-title text="Cấu hình chỉ tiêu tiếng anh">
			</v-toolbar-title>
			<template v-slot:extension>
				<v-tabs v-model="tab" bg-color="primary" class="w-100">
					<v-tab value="5">Cấp 1</v-tab>
					<v-tab value="46">Cấp 2</v-tab>
					<v-tab value="76">Cấp 3</v-tab>
				</v-tabs>

			</template>
		</v-toolbar>
		<v-card-text>
			<v-tabs-window v-model="tab">
				<v-tabs-window-item value="5">
					<div class="w-100 d-flex align-center ga-4">
						<v-spacer></v-spacer>
						<v-btn class="px-2" variant="outlined" color="primary" @click="onOpenModalCauHinh()"
							:disabled="DSLopSelected.length == 0"><v-icon>mdi-cog-outline</v-icon>Cấu hình</v-btn>
						<v-text-field v-model="searchInput" variant="underlined" prepend-inner-icon="mdi-magnify"
							density="compact" hide-details placeholder="Tìm kiếm" max-width="350px"></v-text-field>
						<!-- <v-btn variant="outlined" color="primary" icon size="small"> <v-icon>mdi-plus</v-icon></v-btn> -->
					</div>
					<v-data-table v-model="DSLopSelected" :headers :items="DSLopHoc" return-object show-select
						:search="searchInput">
						<template #item.actions="{ item }">
							<div class="d-flex ga-3 align-center justify-center">
								<!-- <v-icon color="green" @click="EditItem()" size="small" icon="mdi-square-edit-outline" />
								<v-icon color="red" size="small" @click="DeleteItem()" icon="mdi-trash-can-outline" /> -->
							</div>
						</template>
						<template #item.TenMucDo="{ item }">
							<v-chip :color="item.Mau">{{ item.TenMucDo }}</v-chip>
						</template>
					</v-data-table>
				</v-tabs-window-item>

				<v-tabs-window-item value="46">
					Two
				</v-tabs-window-item>

				<v-tabs-window-item value="76">
					Three
				</v-tabs-window-item>
			</v-tabs-window>
		</v-card-text>

	</v-card>
	<v-dialog v-model="isShowModalConfig" max-width="600px">
		<v-card>
			<v-card-title class="text-primary">Cấu hình chỉ tiêu</v-card-title>
			<v-card-text>
				<v-row v-for="mucdo in DSMucDoSelected" class="mb-2">
					<v-col cols="12" class="border">
						<v-chip v-for="lop in DSLopSelected.filter(lop => lop.TenMucDo == mucdo)" color="primary">{{
							lop.TenLop }}</v-chip>
					</v-col>
					<v-col cols="12">
						<div class="d-flex align-center ga-4">
							Mức độ: {{mucdo}}
							
						</div>
						<div class="d-flex align-center ga-4">
							Mức điểm:
							<div class="d-flex align-center"><v-text-field v-model="formData.DiemMin" placeholder="0"
									variant="underlined" density="compact" hide-details
									:clearable="false"></v-text-field>
							</div>
							<div class="d-flex align-center">
								<v-select class="select-style" :items="['<', '<=']" density="compact"
									variant="underlined" v-model="formData.Prefix" menu-icon="" min-width="50px"
									:center-affix="true" />
								Điểm
								<v-select class="select-style" v-model="formData.Suffix" density="compact"
									:items="['<', '<=']" variant="underlined" menu-icon="" min-width="50px"
									:center-affix="true" />
							</div>
							<div class="d-flex align-center"><v-text-field v-model="formData.DiemMax" placeholder="10"
									variant="underlined" density="compact" hide-details
									:clearable="false"></v-text-field>
							</div>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" text @click="onCloseModalCauHinh">Đóng</v-btn>
				<v-btn color="primary" text @click="onSaveCauHinh()">Thêm</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
<script>
export default {
	props: [],
	data() {
		return {
			isShowModalConfig: false,
			tab: '5',
			searchInput: '',
			DSLopHoc: [],
			headers: [
				{
					title: "Lớp học",
					value: "TenLop"
				},
				{
					title: "Mức độ",
					value: "TenMucDo"
				},
				{
					title: "Mô tả",
					value: "MoTa"
				},
				{
					title: "Mức điểm",
					key: "actions",
					align: "center",
					width: "120px",
					sortable: false
				}
			],
			DSLopSelected: [],
			DSMucDo: [],
			vueData,
			Prefix: '<=',
			Suffix: '<=',
			formData: {

			}
		}
	},
	mounted() {
		// this.getDSLop();
	},
	computed: {
		DSMucDoSelected() {
			let DSMucDoDistinct = [... new Set(this.DSLopSelected.map(item => item.TenMucDo))];
			return DSMucDoDistinct
		},
		DSMucDoSelect(){
			let arr = ['Chưa hoàn thành', 'Hoàn thành', 'Tốt']
			if(this.tab != 5){
				arr = ['Không đạt', 'Đạt', 'Khá', 'Tốt']
			}
			return arr
		}
	},
	watch: {
		'vueData.NienKhoa': function (val) {
			if (val) {
				this.getDSLop();
			}
		},
		tab: function (val) {
			if (val) this.getDSLop()
		}
	},
	methods: {
		getDSLop() {
			let MonHocID = 5
			if (this.tab == '46') {
				MonHocID = 46
			} else if (this.tab == '76') {
				MonHocID = 76
			}
			ajaxCALL('/lms/MucDo_Get_By_MonHocID', {
				MonHocID: MonHocID,
				NienKhoa: vueData.NienKhoa,
			}, res => {
				if (res.data.length > 0) {
					this.DSLopHoc = res.data;
					this.formData = {
						Prefix: '<=',
						Suffix: '<=',
						DiemMin: null,
						DiemMax: null,
						TenMucDo: ''
					}
					console.log(this.DSLopHoc)
				} else {
					this.DSLopHoc = [];
				}
			})

		},
		onOpenModalCauHinh() {
			this.isShowModalConfig = true;
		},
		onCloseModalCauHinh() {
			this.isShowModalConfig = false;
			this.DSLopSelected = []
		},
		getColorLevel(mucdo) {
			return "success"
		},
		EditItem() {

		},
		DeleteItem() {

		},
		onSaveCauHinh() {
			let arrayInsert = [...this.DSLopSelected];
			arrayInsert = arrayInsert.map(item => {
				return {
					...item,
					DiemMin: this.formData.DiemMin,
					DiemMax: this.formData.DiemMax,
					Prefix: this.formData.Prefix,
					Suffix: this.formData.Suffix,
					TenMucDo: this.formData.TenMucDo,
				}
			})
			console.log('this.formData', this.formData)
			console.log(arrayInsert)
			ajaxCALL('/lms/MucDo_Ins_And_Udp', {
				JsonMucDo: JSON.stringify(arrayInsert),
			}, res => {
				this.getDSLop()
			})

		}

	},
}
</script>